// Money path: an order is priced from its country's own list, in its own currency, and its status
// only ever moves along an allowed edge. Run: npm run db:push && npm run smoke  (rolls back)
import assert from 'node:assert/strict';
import postgres from 'postgres';
import { NEXT, STATUSES } from '../src/lib/orders.ts';

// the lifecycle map itself: no shortcut from unpaid to delivered, and refunds are the end
assert.deepEqual(Object.keys(NEXT), [...STATUSES]);
for (const [from, tos] of Object.entries(NEXT))
	for (const to of tos) assert.ok(STATUSES.includes(to), `${from} -> ${to} is not a real status`);
assert.ok(!NEXT.awaiting_payment.includes('delivered'), 'unpaid orders cannot be delivered');
assert.deepEqual(NEXT.refunded, []);
assert.deepEqual(NEXT.cancelled, []);

const sql = postgres(process.env.DATABASE_URL);

await sql
	.begin(async (sql) => {
		const [app] = await sql`
			insert into apps (slug, name, active) values ('smoke-app', 'Smoke', true)
			returning id`;
		const [other] = await sql`
			insert into apps (slug, name) values ('smoke-other', 'Other') returning id`;
		const [country] = await sql`
			insert into countries (code, name, currency) values ('QA', 'قطر', 'QAR')
			on conflict (code) do update set name = 'قطر' returning id, currency`;
		const [egypt] = await sql`
			insert into countries (code, name, currency) values ('EG', 'مصر', 'EGP')
			on conflict (code) do update set name = 'مصر' returning id, currency`;
		const [quota] = await sql`insert into quotas (coins, app_id) values (999999, ${app.id})
		                          returning id`;
		const [foreign] = await sql`insert into quotas (coins, app_id) values (999999, ${other.id})
		                            returning id`;

		// same package, two countries, unrelated prices
		await sql`
			insert into country_quotas (country_id, quota_id, price, old_price) values
				(${country.id}, ${quota.id}, 35.39, 44.63),
				(${egypt.id}, ${quota.id}, 471.42, null),
				(${egypt.id}, ${foreign.id}, 12.00, null)`;

		// exactly the buy action's insert: price and currency come from the database, the quota has
		// to belong to the app being bought
		const priced = (countryId, appId, quotaId) => sql`
			insert into orders
				(app_id, country_id, quota_id, player_id, phone, amount, currency)
			select ${appId}, cq.country_id, cq.quota_id, 'p1', '+2010', cq.price, c.currency
			from country_quotas cq
			join countries c on c.id = cq.country_id
			join quotas q on q.id = cq.quota_id
			where cq.country_id = ${countryId} and cq.quota_id = ${quotaId}
			  and q.app_id = ${appId} and cq.active
			returning id, ref, status, amount, currency`;

		const [order] = await priced(country.id, app.id, quota.id);
		assert.equal(order.amount, '35.39');
		assert.equal(order.currency, 'QAR');
		assert.equal(order.status, 'awaiting_payment');
		assert.match(order.ref, /^ELH-[0-9A-F]{8}$/, 'every order gets a quotable reference');

		const [egyptian] = await priced(egypt.id, app.id, quota.id);
		assert.equal(egyptian.amount, '471.42', 'each country prices the package on its own');
		assert.equal(egyptian.currency, 'EGP');
		assert.notEqual(egyptian.ref, order.ref, 'references are unique');

		assert.equal(
			(await priced(egypt.id, app.id, foreign.id)).length,
			0,
			"a package from another app cannot be bought under this app's URL"
		);

		// a failed statement poisons the transaction, so each expected failure gets a savepoint
		const rejects = (q, why) => assert.rejects(sql.savepoint(q), why);

		await rejects((sql) => sql`insert into quotas (coins, app_id) values (0, ${app.id})`, 'coins > 0');
		await rejects(
			(sql) => sql`insert into country_quotas (country_id, quota_id, price)
			             values (${country.id}, ${quota.id}, 0)`,
			'price > 0'
		);
		await rejects(
			(sql) => sql`update orders set status = 'shipped' where id = ${order.id}`,
			'unknown statuses are rejected by the database'
		);

		// dropping the price is how a package leaves a country — no order can be built from it
		await sql
			.savepoint(async (sql) => {
				await sql`delete from country_quotas where country_id = ${egypt.id}`;
				assert.equal(
					(await priced(egypt.id, app.id, quota.id)).length,
					0,
					'unpriced package cannot be ordered'
				);
				throw new Error('undo');
			})
			.catch((e) => {
				if (e.message !== 'undo') throw e;
			});

		// the admin console's transition: guarded by the current status, so a double submit is a no-op
		const advance = (from, to) => sql`
			update orders set status = ${to},
				paid_at = case when ${to} = 'paid' then now() else paid_at end,
				delivered_at = case when ${to} = 'delivered' then now() else delivered_at end
			where ref = ${order.ref} and status = ${from}
			returning status, paid_at, delivered_at`;

		const [paid] = await advance('awaiting_payment', 'paid');
		assert.ok(paid.paid_at, 'confirming payment stamps the time');
		assert.equal((await advance('awaiting_payment', 'paid')).length, 0, 'a second submit does nothing');

		const [delivered] = await advance('paid', 'delivered');
		assert.ok(delivered.delivered_at);
		assert.ok(delivered.paid_at, 'delivery keeps the payment timestamp');

		// the customer's own cancel button: only their order, only before payment
		assert.equal(
			(await sql`update orders set status = 'cancelled'
			           where ref = ${order.ref} and status = 'awaiting_payment' returning id`).length,
			0,
			'a delivered order cannot be cancelled by the customer'
		);

		// Reviews: tied to a real delivered order, one per order, 1..5 only.
		const [buyer] = await sql`
			insert into users (name, email, password_hash)
			values ('Smoke Buyer', 'smoke-review@example.com', 'x') returning id`;
		const reviewable = (rating) => sql`
			insert into reviews (user_id, order_id, rating)
			select o.user_id, o.id, ${rating} from orders o
			where o.ref = ${order.ref} and o.user_id = ${buyer.id} and o.status = 'delivered'
			on conflict (order_id) do nothing
			returning id`;

		assert.equal((await reviewable(5)).length, 0, 'a review needs an order of your own');

		await sql`update orders set user_id = ${buyer.id} where ref = ${order.ref}`;
		assert.equal((await reviewable(5)).length, 1);
		assert.equal((await reviewable(1)).length, 0, 'an order can only be reviewed once');

		await rejects(
			(sql) => sql`insert into reviews (user_id, order_id, rating)
			             values (${buyer.id}, ${order.id}, 6)`,
			'rating stays inside 1..5'
		);

		// Notifications: one row per browser endpoint, and they die with the account.
		const [subscriber] = await sql`
			insert into users (email, password_hash) values ('smoke-push@example.com', 'x') returning id`;
		const save = () => sql`
			insert into push_subscriptions (user_id, endpoint, p256dh, auth)
			values (${subscriber.id}, 'https://push.example/abc', 'k', 'a')
			on conflict (endpoint) do update set p256dh = excluded.p256dh`;
		await save();
		await save();
		const [{ count }] = await sql`
			select count(*)::int from push_subscriptions where user_id = ${subscriber.id}`;
		assert.equal(count, 1, 're-subscribing the same browser must not duplicate');

		await sql`delete from users where id = ${subscriber.id}`;
		assert.equal(
			(await sql`select 1 from push_subscriptions where user_id = ${subscriber.id}`).length,
			0,
			'subscriptions die with the account'
		);

		throw new Error('rollback');
	})
	.catch((e) => {
		if (e.message !== 'rollback') throw e;
	});

await sql.end();
console.log('smoke ok');

import { fail, redirect } from '@sveltejs/kit';
import { randomBytes } from 'node:crypto';
import { sql } from '$lib/server/db';
import { guard } from '../guard';
import { notify } from '$lib/server/push';
import { t } from '$lib/i18n';
import { hashPassword } from '$lib/password';
import { NEXT, isPaymentMethod, isStatus, type Status } from '$lib/orders';

export async function load({ locals, url }) {
	guard(locals);
	const filter = url.searchParams.get('status');
	const only = filter && isStatus(filter) ? sql`where o.status = ${filter}` : sql``;

	const [orders, counts, countries, apps] = await Promise.all([
		sql`select o.ref, o.player_id, o.phone, o.amount, o.currency, o.status, o.created_at,
		           o.payment_method, o.payment_ref, o.note,
		           q.coins, c.code, a.name as app, u.email
		    from orders o
		    join quotas q on q.id = o.quota_id
		    join countries c on c.id = o.country_id
		    join apps a on a.id = o.app_id
		    left join users u on u.id = o.user_id
		    ${only}
		    order by o.id desc limit 200`,
		sql`select status, count(*)::int from orders group by status`,
		// inactive ones too: a pre-website sale can come from a country we no longer sell in
		sql`select id, code, currency from countries order by code`,
		sql`select id, slug, name from apps order by sort, name`
	]);

	return {
		orders,
		countries,
		apps,
		filter: filter && isStatus(filter) ? filter : null,
		counts: Object.fromEntries(counts.map((r) => [r.status, r.count])) as Record<string, number>
	};
}

export const actions = {
	// One guarded edge of the lifecycle. A gateway webhook would drive the 'paid' edge instead.
	advance: async ({ request, locals }) => {
		guard(locals);
		const m = t(locals.lang);
		const f = await request.formData();
		const ref = String(f.get('ref'));
		const to = String(f.get('to'));
		const method = String(f.get('payment_method') ?? '').trim();
		const payRef = String(f.get('payment_ref') ?? '').trim();
		const note = String(f.get('note') ?? '').trim();

		if (!isStatus(to)) return fail(400, { message: m.errors.unknownStatus });

		const [order] = await sql`select status, user_id from orders where ref = ${ref}`;
		if (!order) return fail(404, { message: m.errors.orderMissing });
		if (!NEXT[order.status as Status].includes(to))
			return fail(400, {
				message: m.errors.badTransition(m.status[order.status as Status], m.status[to])
			});

		if (to === 'paid' && !isPaymentMethod(method))
			return fail(400, { message: m.errors.needMethod });
		if ((to === 'refunded' || to === 'cancelled') && !note)
			return fail(400, { message: m.errors.needReason });

		// `and status = current` makes a double submit a no-op instead of a second transition
		const [done] = await sql`
			update orders set
				status = ${to},
				paid_at = case when ${to} = 'paid' then now() else paid_at end,
				delivered_at = case when ${to} = 'delivered' then now() else delivered_at end,
				payment_method = coalesce(${to === 'paid' ? method : null}::text, payment_method),
				payment_ref = coalesce(${(to === 'paid' && payRef) || null}::text, payment_ref),
				note = coalesce(${note || null}::text, note)
			where ref = ${ref} and status = ${order.status}
			returning id`;
		if (!done) return fail(409, { message: m.errors.statusChanged });

		// ponytail: notifications go out in the default language — we don't store a per-user choice
		const en = t('en');
		if (order.user_id)
			await notify([order.user_id], {
				title: to === 'delivered' ? en.push.delivered(ref) : `Order ${ref}`,
				body: to === 'delivered' ? en.push.ratePrompt : en.status[to],
				// the fragment lands on the rating form instead of the top of the order
				url: to === 'delivered' ? `/orders/${ref}#review` : `/orders/${ref}`,
				tag: ref
			});
	},

	// Historical sales, entered by hand: the customer, the money and the dates all come from the
	// admin instead of from a checkout. Everything else (ref, invoice) behaves like a real order.
	create: async ({ request, locals }) => {
		guard(locals);
		const e = t(locals.lang).errors;
		const f = await request.formData();
		const get = (k: string) => String(f.get(k) ?? '').trim();
		const name = get('name');
		const email = get('email').toLowerCase();
		const playerId = get('player_id');
		const phone = get('phone');
		const coins = Number(f.get('coins'));
		const amount = Number(f.get('amount'));
		const status = get('status');
		const method = get('payment_method');
		const requested = get('created_at');
		const charged = get('paid_at');
		const isDate = (d: string) =>
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(d) && !isNaN(Date.parse(d));

		if (name.length < 2) return fail(400, { message: e.badName });
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail(400, { message: e.badEmail });
		if (playerId.length < 3 || playerId.length > 40) return fail(400, { message: e.badPlayerId });
		if (!Number.isInteger(coins) || coins <= 0) return fail(400, { message: e.badCoins });
		if (!(amount > 0)) return fail(400, { message: e.badPrice });
		if (!isStatus(status)) return fail(400, { message: e.unknownStatus });
		if (method && !isPaymentMethod(method)) return fail(400, { message: e.needMethod });
		if (!isDate(requested) || (charged && !isDate(charged)))
			return fail(400, { message: e.badDate });

		const [country] = await sql`select id, currency from countries where id = ${Number(f.get('country_id'))}`;
		if (!country) return fail(400, { message: e.countryMissing });
		const [app] = await sql`select id from apps where id = ${Number(f.get('app_id'))}`;
		if (!app) return fail(400, { message: e.appMissing });

		// the admin types a wall clock, read in the company's timezone — the same one the invoice
		// prints in, so what was entered is what the document shows
		// (::text first: an untyped bind parameter cast straight to timestamp is resolved as
		// timestamptz by the server and silently shifts by the session timezone)
		const at = (d: string) => sql`(${d}::text)::timestamp at time zone 'Africa/Cairo'`;

		// the account is the customer's; an unusable random password keeps it login-proof until
		// they reset it themselves
		const [user] = await sql`
			insert into users (name, email, password_hash)
			values (${name}, ${email}, ${await hashPassword(randomBytes(24).toString('hex'))})
			on conflict (email) do update set name = excluded.name
			returning id`;

		// packages sold before the price list existed still need a row to point at
		const [quota] = await sql`
			insert into quotas (coins, app_id) values (${coins}, ${app.id})
			on conflict (app_id, coins) do update set coins = excluded.coins
			returning id`;

		const [order] = await sql`
			insert into orders (user_id, app_id, country_id, quota_id, player_id, phone, amount,
			                    currency, status, created_at, paid_at, delivered_at,
			                    payment_method, payment_ref, note)
			values (${user.id}, ${app.id}, ${country.id}, ${quota.id}, ${playerId}, ${phone},
			        ${amount}, ${country.currency}, ${status}, ${at(requested)},
			        ${charged ? at(charged) : null},
			        ${status === 'delivered' ? at(charged || requested) : null},
			        ${method || null}, ${get('payment_ref') || null}, ${get('note') || null})
			returning ref`;

		redirect(303, `/orders/${order.ref}`);
	}
};

import { fail } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { guard } from '../guard';
import { notify } from '$lib/server/push';
import { t } from '$lib/i18n';
import { NEXT, isPaymentMethod, isStatus, type Status } from '$lib/orders';

export async function load({ locals, url }) {
	guard(locals);
	const filter = url.searchParams.get('status');
	const only = filter && isStatus(filter) ? sql`where o.status = ${filter}` : sql``;

	const [orders, counts] = await Promise.all([
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
		sql`select status, count(*)::int from orders group by status`
	]);

	return {
		orders,
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
	}
};

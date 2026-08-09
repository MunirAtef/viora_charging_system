import { error, redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { t } from '$lib/i18n';

// An invoice exists once the sale is complete — before that there is only an order.
export async function load({ params, locals }) {
	if (!locals.user) redirect(303, `/login?next=/orders/${params.ref}/invoice`);
	const mine = locals.user.role === 'admin' ? sql`` : sql`and o.user_id = ${locals.user.id}`;
	const [order] = await sql`
		select o.ref, o.player_id, o.phone, o.amount, o.currency, o.created_at, o.paid_at,
		       -- orders delivered before the timestamps existed still need an issue date
		       coalesce(o.delivered_at, o.paid_at, o.created_at) as delivered_at,
		       o.payment_method, o.payment_ref,
		       q.coins, c.code as country_code, a.name as app, u.email, u.name
		from orders o
		join quotas q on q.id = o.quota_id
		join countries c on c.id = o.country_id
		join apps a on a.id = o.app_id
		left join users u on u.id = o.user_id
		where o.ref = ${params.ref} and o.status = 'delivered' ${mine}`;
	if (!order) error(404, t(locals.lang).errors.noInvoice);
	return { order };
}

import { redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

export async function load({ locals }) {
	if (!locals.user) redirect(303, '/login?next=/account');
	const orders = await sql`
		select o.ref, o.player_id, o.amount, o.currency, o.status, o.created_at,
		       q.coins, c.code as country_code, a.name as app
		from orders o
		join quotas q on q.id = o.quota_id
		join countries c on c.id = o.country_id
		join apps a on a.id = o.app_id
		where o.user_id = ${locals.user.id}
		order by o.id desc`;
	return { orders };
}

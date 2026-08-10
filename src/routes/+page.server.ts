import { env } from '$env/dynamic/private';
import { sql } from '$lib/server/db';

// Recharges completed before this site existed. Counted into the public total, so it must be
// a real figure from the business's own records — it defaults to zero and claims nothing.
const before = Math.max(0, Math.trunc(Number(env.OPERATIONS_BEFORE_SITE)) || 0);

export async function load() {
	const [countries, apps] = await Promise.all([
		sql`select code, name, currency from countries where active order by name`,
		sql`select id, slug, name, active from apps order by sort, name`
	]);

	// one app is the shop's default entry point; the buy page lets you switch between the active ones
	const primary = apps.find((a) => a.active) ?? null;
	const quotas = primary
		? await sql`select distinct q.coins from quotas q
		            join country_quotas cq on cq.quota_id = q.id and cq.active
		            where q.active and q.app_id = ${primary.id} order by q.coins`
		: [];

	const [reviews, [summary], [buyers]] = await Promise.all([
		sql`select r.rating, r.body, r.created_at, u.name, c.code as country_code, a.name as app
		    from reviews r
		    join users u on u.id = r.user_id
		    join orders o on o.id = r.order_id
		    join countries c on c.id = o.country_id
		    join apps a on a.id = o.app_id
		    where r.approved
		    order by r.id desc limit 6`,
		sql`select count(*)::int, round(avg(rating), 1) as average from reviews where approved`,
		sql`select count(*)::int from orders where status = 'delivered'`
	]);

	return { countries, apps, primary, quotas, reviews, summary, completed: buyers.count + before };
}

import { fail, redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { lookup } from '$lib/countries';
import { t } from '$lib/i18n';
import { guard } from './guard';

export async function load({ locals }) {
	guard(locals);
	const [countries, apps, users, reviews] = await Promise.all([
		sql`select c.id, c.code, c.name, c.currency, c.active,
		           (select count(*) from country_quotas cq where cq.country_id = c.id) as quotas,
		           (select count(*) from orders o where o.country_id = c.id
		            and o.status in ('awaiting_payment', 'paid')) as open
		    from countries c order by c.name`,
		sql`select a.id, a.slug, a.name, a.active,
		           (select count(*) from quotas q where q.app_id = a.id) as packages
		    from apps a order by a.sort, a.name`,
		sql`select id, name, email, role from users order by id`,
		sql`select r.id, r.rating, r.body, r.approved, u.name, o.ref
		    from reviews r join users u on u.id = r.user_id join orders o on o.id = r.order_id
		    order by r.id desc limit 50`
	]);
	return { countries, apps, users, reviews };
}

export const actions = {
	addCountry: async ({ request, locals }) => {
		guard(locals);
		const code = String((await request.formData()).get('code') ?? '').toUpperCase();
		const picked = lookup(code);
		if (!picked) return fail(400, { message: t(locals.lang).errors.pickFromList });
		await sql`
			insert into countries (code, name, currency)
			values (${picked.code}, ${picked.name}, ${picked.currency})
			on conflict (code) do update set active = true`;
		redirect(303, `/admin/countries/${picked.code}`);
	},

	toggleCountry: async ({ request, locals }) => {
		guard(locals);
		const id = Number((await request.formData()).get('id'));
		await sql`update countries set active = not active where id = ${id}`;
	},

	addApp: async ({ request, locals }) => {
		guard(locals);
		const f = await request.formData();
		const name = String(f.get('name') ?? '').trim();
		const slug = String(f.get('slug') ?? '')
			.trim()
			.toLowerCase();
		if (!name || !/^[a-z0-9-]{2,20}$/.test(slug))
			return fail(400, { message: t(locals.lang).errors.badApp });
		await sql`insert into apps (slug, name) values (${slug}, ${name})
		          on conflict (slug) do update set name = excluded.name`;
	},

	// an app with no packages priced anywhere would be an empty shop, so it stays "coming soon"
	toggleApp: async ({ request, locals }) => {
		guard(locals);
		const id = Number((await request.formData()).get('id'));
		const [row] = await sql`
			update apps set active = not active
			where id = ${id} and (active or exists (
				select 1 from quotas q join country_quotas cq on cq.quota_id = q.id
				where q.app_id = ${id} and cq.active))
			returning active`;
		if (!row) return fail(400, { message: t(locals.lang).errors.appNeedsPrices });
	},

	// hiding a review is for abuse, not for opinions we dislike — the toggle works both ways
	toggleReview: async ({ request, locals }) => {
		guard(locals);
		const id = Number((await request.formData()).get('id'));
		await sql`update reviews set approved = not approved where id = ${id}`;
	},

	setRole: async ({ request, locals }) => {
		const me = guard(locals);
		const e = t(locals.lang).errors;
		const f = await request.formData();
		const id = Number(f.get('id'));
		const role = String(f.get('role'));
		if (!['user', 'admin'].includes(role)) return fail(400, { message: e.badRole });
		if (id === me.id) return fail(400, { message: e.notYourself });
		await sql`update users set role = ${role} where id = ${id}`;
	}
};

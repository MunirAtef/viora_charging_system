import { error, fail, redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { notifyAdmins } from '$lib/server/push';
import { t, type Lang } from '$lib/i18n';

const context = async (appSlug: string, code: string, lang: Lang) => {
	const [[app], [country]] = await Promise.all([
		sql`select id, slug, name from apps where slug = ${appSlug} and active`,
		sql`select id, code, name, currency from countries where code = ${code} and active`
	]);
	if (!app) error(404, t(lang).errors.appUnavailable);
	if (!country) error(404, t(lang).errors.countryUnavailable);
	return { app, country };
};

export async function load({ params, locals }) {
	const { app, country } = await context(params.app, params.code, locals.lang);
	const [quotas, apps] = await Promise.all([
		sql`select q.id, q.coins, cq.price, cq.old_price
		    from country_quotas cq
		    join quotas q on q.id = cq.quota_id
		    where cq.country_id = ${country.id} and q.app_id = ${app.id} and cq.active and q.active
		    order by q.coins`,
		sql`select slug, name from apps where active order by sort, name`
	]);
	return { app, apps, country, quotas };
}

export const actions = {
	default: async ({ request, params, locals }) => {
		const e = t(locals.lang).errors;
		if (!locals.user) return fail(401, { message: e.loginToOrder });

		const { app, country } = await context(params.app, params.code, locals.lang);
		const form = await request.formData();
		const playerId = String(form.get('player_id') ?? '').trim();
		const phone = String(form.get('phone') ?? '').trim();
		const quotaId = Number(form.get('quota_id'));

		if (playerId.length < 3 || playerId.length > 40) return fail(400, { message: e.badPlayerId });
		if (phone.length < 6 || phone.length > 20) return fail(400, { message: e.badPhone });
		if (!quotaId) return fail(400, { message: e.pickPackage });
		if (!form.get('terms')) return fail(400, { message: e.mustAgree });

		// the price comes from this country's own list, never from the client, and the quota has to
		// belong to the app in the URL
		const [order] = await sql`
			insert into orders
				(user_id, app_id, country_id, quota_id, player_id, phone, amount, currency)
			select ${locals.user.id}, ${app.id}, ${country.id}, cq.quota_id, ${playerId}, ${phone},
			       cq.price, ${country.currency}
			from country_quotas cq
			join quotas q on q.id = cq.quota_id
			where cq.country_id = ${country.id} and cq.quota_id = ${quotaId}
			  and q.app_id = ${app.id} and cq.active and q.active
			returning ref, amount`;
		if (!order) return fail(400, { message: e.packageGone });

		await notifyAdmins({
			title: 'New order awaiting payment',
			body: `${order.ref} · ${order.amount} ${country.currency} · ${app.name}`,
			url: '/admin/orders',
			tag: order.ref
		});

		redirect(303, `/orders/${order.ref}`);
	}
};

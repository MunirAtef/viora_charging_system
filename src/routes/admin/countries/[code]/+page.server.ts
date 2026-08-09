import { error, fail } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { guard } from '../../guard';
import { t, type Lang } from '$lib/i18n';

const getCountry = async (code: string, lang: Lang) => {
	const [country] = await sql`select * from countries where code = ${code.toUpperCase()}`;
	if (!country) error(404, t(lang).errors.countryMissing);
	return country;
};

// the app being priced: ?app=slug, otherwise the first one
const getApp = async (slug: string | null, lang: Lang) => {
	const apps = await sql`select id, slug, name from apps order by sort, name`;
	const app = apps.find((a) => a.slug === slug) ?? apps[0];
	if (!app) error(400, t(lang).errors.appMissing);
	return { apps, app };
};

export async function load({ params, url, locals }) {
	guard(locals);
	const country = await getCountry(params.code, locals.lang);
	const { apps, app } = await getApp(url.searchParams.get('app'), locals.lang);
	const [quotas, orders] = await Promise.all([
		// every package of this app, with this country's price where it has one
		sql`select q.id, q.coins, cq.price, cq.old_price
		    from quotas q
		    left join country_quotas cq on cq.quota_id = q.id and cq.country_id = ${country.id}
		    where q.app_id = ${app.id}
		    order by q.coins`,
		sql`select o.ref, o.player_id, o.amount, o.currency, o.status, u.email, a.name as app
		    from orders o
		    join apps a on a.id = o.app_id
		    left join users u on u.id = o.user_id
		    where o.country_id = ${country.id}
		    order by o.id desc limit 50`
	]);
	return { country, apps, app, quotas, orders };
}

// prices are per country and in its own currency — no conversion anywhere
const readPrice = (f: FormData, lang: Lang) => {
	const price = Number(f.get('price'));
	const oldRaw = String(f.get('old_price') ?? '').trim();
	const oldPrice = oldRaw ? Number(oldRaw) : null;
	if (!(price > 0)) return { message: t(lang).errors.badPrice };
	if (oldPrice !== null && !(oldPrice > price))
		return { message: t(lang).errors.oldPriceTooLow };
	return { price, oldPrice };
};

export const actions = {
	// creates the package for this app if it's new, then prices it here
	addQuota: async ({ request, params, url, locals }) => {
		guard(locals);
		const country = await getCountry(params.code, locals.lang);
		const { app } = await getApp(url.searchParams.get('app'), locals.lang);
		const f = await request.formData();
		const coins = Number(f.get('coins'));
		if (!Number.isInteger(coins) || coins <= 0)
			return fail(400, { message: t(locals.lang).errors.badCoins });
		const priced = readPrice(f, locals.lang);
		if ('message' in priced) return fail(400, priced);

		await sql.begin(async (tx) => {
			const [quota] = await tx`
				insert into quotas (coins, app_id) values (${coins}, ${app.id})
				on conflict (app_id, coins) do update set active = true returning id`;
			await tx`
				insert into country_quotas (country_id, quota_id, price, old_price)
				values (${country.id}, ${quota.id}, ${priced.price}, ${priced.oldPrice})
				on conflict (country_id, quota_id) do update
					set price = excluded.price, old_price = excluded.old_price, active = true`;
		});
	},

	setPrice: async ({ request, params, locals }) => {
		guard(locals);
		const country = await getCountry(params.code, locals.lang);
		const f = await request.formData();
		const priced = readPrice(f, locals.lang);
		if ('message' in priced) return fail(400, priced);
		await sql`
			insert into country_quotas (country_id, quota_id, price, old_price)
			values (${country.id}, ${Number(f.get('quota_id'))}, ${priced.price}, ${priced.oldPrice})
			on conflict (country_id, quota_id) do update
				set price = excluded.price, old_price = excluded.old_price`;
	},

	// no row = not sold here, so dropping the price is how you remove a package
	removeQuota: async ({ request, params, locals }) => {
		guard(locals);
		const country = await getCountry(params.code, locals.lang);
		const quotaId = Number((await request.formData()).get('quota_id'));
		await sql`
			delete from country_quotas
			where country_id = ${country.id} and quota_id = ${quotaId}`;
	}
};

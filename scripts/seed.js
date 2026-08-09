// Idempotent seed: apps, countries, IMO's coin packages, and each country's own price list.
// The USD figures below are only a starting point — every price is editable per country after.
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

// [slug, name, active] — inactive apps show on the site as "قريباً"
const apps = [
	['imo', 'IMO', true],
	['bigo', 'Bigo Live', false],
	['likee', 'Likee', false],
	['starmaker', 'StarMaker', false]
];

// [code, arabic name, currency, 1 USD -> currency at seed time]
const countries = [
	['SA', 'ريال سعودي', 'SAR', 3.75],
	['AE', 'درهم اماراتي', 'AED', 3.6725],
	['QA', 'ريال قطري', 'QAR', 3.6405],
	['KW', 'دينار كويتي', 'KWD', 0.3065],
	['BH', 'دينار بحريني', 'BHD', 0.376],
	['JO', 'دينار أردني', 'JOD', 0.709],
	['MA', 'درهم مغربي', 'MAD', 9.9],
	['EG', 'جنيه مصري', 'EGP', 48.5],
	['US', 'USD', 'USD', 1]
];

// [coins, price USD, price before discount USD]
const quotas = [
	[100, 1.95, 2.45],
	[210, 4.08, 5.15],
	[300, 5.84, 7.36],
	[500, 9.72, 12.26],
	[1000, 19.46, 24.53],
	[2100, 40.85, 51.5],
	[3000, 58.37, 73.58],
	[4200, 81.72, 103.01],
	[5000, 97.28, 122.63],
	[8500, 163.43, 206.02],
	[10000, 194.56, 245.26],
	[20000, 389.13, 490.51]
];

await sql`
	insert into apps ${sql(apps.map(([slug, name, active], sort) => ({ slug, name, active, sort })))}
	on conflict (slug) do update set name = excluded.name, sort = excluded.sort`;
const [imo] = await sql`select id from apps where slug = 'imo'`;

const rows = await sql`
	insert into countries ${sql(
		countries.map(([code, name, currency]) => ({ code, name, currency }))
	)}
	on conflict (code) do update set name = excluded.name, currency = excluded.currency
	returning id, code`;

await sql`
	insert into quotas ${sql(quotas.map(([coins]) => ({ coins, app_id: imo.id })))}
	on conflict (app_id, coins) do update set active = true`;

const rate = Object.fromEntries(countries.map(([code, , , r]) => [code, r]));
const ids = Object.fromEntries(
	(await sql`select id, coins from quotas where app_id = ${imo.id}`).map((q) => [q.coins, q.id])
);

const prices = rows.flatMap((c) =>
	quotas.map(([coins, usd, oldUsd]) => ({
		country_id: c.id,
		quota_id: ids[coins],
		price: (usd * rate[c.code]).toFixed(2),
		old_price: (oldUsd * rate[c.code]).toFixed(2)
	}))
);

await sql`
	insert into country_quotas ${sql(prices)}
	on conflict (country_id, quota_id) do nothing`;

await sql.end();
console.log(
	`seeded ${apps.length} apps, ${countries.length} countries, ${quotas.length} quotas, ${prices.length} prices`
);

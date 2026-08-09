import type { Lang } from '$lib/i18n';

// The only thing we can't derive is which currency a country charges in.
// Names come from Intl in whichever language is showing, flags from the ISO code itself.
const CURRENCY: Record<string, string> = {
	AE: 'AED', BH: 'BHD', DZ: 'DZD', EG: 'EGP', IQ: 'IQD', JO: 'JOD', KW: 'KWD', LB: 'LBP',
	LY: 'LYD', MA: 'MAD', MR: 'MRU', OM: 'OMR', PS: 'ILS', QA: 'QAR', SA: 'SAR', SD: 'SDG',
	SO: 'SOS', SY: 'SYP', TN: 'TND', YE: 'YER',
	TR: 'TRY', IR: 'IRR', PK: 'PKR', IN: 'INR', BD: 'BDT', ID: 'IDR', MY: 'MYR', PH: 'PHP',
	NG: 'NGN', KE: 'KES', ZA: 'ZAR', ET: 'ETB', GH: 'GHS', TZ: 'TZS', UG: 'UGX',
	US: 'USD', GB: 'GBP', DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR',
	SE: 'SEK', RU: 'RUB', UA: 'UAH', BR: 'BRL', MX: 'MXN', AR: 'ARS', CA: 'CAD', AU: 'AUD'
};

const display: Partial<Record<string, Intl.DisplayNames>> = {};
const names = (lang: string) =>
	(display[lang] ??= new Intl.DisplayNames([lang], { type: 'region' }));

// A→🇦: regional indicators sit 0x1F1A5 above the ASCII letters
export const flag = (code: string) =>
	String.fromCodePoint(...[...code.toUpperCase()].map((c) => c.charCodeAt(0) + 0x1f1a5));

/** The country's name in the language on screen — never the label stored in the database. */
export const countryName = (code: string, lang: Lang) => names(lang).of(code) ?? code;

export const catalog = (lang: Lang) =>
	Object.entries(CURRENCY)
		.map(([code, currency]) => ({ code, currency, name: countryName(code, lang) }))
		.sort((a, b) => a.name.localeCompare(b.name, lang));

export const lookup = (code: string) =>
	CURRENCY[code] ? { code, currency: CURRENCY[code], name: countryName(code, 'en') } : undefined;

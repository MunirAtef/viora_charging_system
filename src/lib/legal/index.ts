import en from './en';
import ar from './ar';
import type { Lang } from '$lib/i18n';

export const UPDATED = '2026-08-10';
export const legal = { en, ar };
export type Slug = keyof typeof en;

export const doc = (lang: Lang, slug: string) => legal[lang][slug as Slug];
export const legalNav = (lang: Lang) =>
	Object.entries(legal[lang]).map(([slug, d]) => ({ slug, title: d.title }));

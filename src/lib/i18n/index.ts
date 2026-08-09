import en from './en';
import ar from './ar';

export const LANGS = ['en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

export const messages = { en, ar };
export const DEFAULT_LANG: Lang = 'en';
export const LANG_COOKIE = 'lang';

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);
export const t = (lang: Lang) => messages[lang];
export const dirOf = (lang: Lang) => messages[lang].dir;

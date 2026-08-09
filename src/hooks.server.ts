import { sessionUser } from '$lib/server/auth';
import { DEFAULT_LANG, LANG_COOKIE, dirOf, isLang } from '$lib/i18n';

export async function handle({ event, resolve }) {
	event.locals.user = await sessionUser(event.cookies.get('session'));

	const cookie = event.cookies.get(LANG_COOKIE);
	event.locals.lang = isLang(cookie) ? cookie : DEFAULT_LANG;

	// the document element has to carry the language and direction before any CSS runs
	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('%lang%', event.locals.lang).replace('%dir%', dirOf(event.locals.lang))
	});

	// the page body depends on the cookie, so no shared cache may reuse it across languages
	if (response.headers.get('content-type')?.startsWith('text/html'))
		response.headers.append('vary', 'cookie');
	return response;
}

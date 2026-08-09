import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { LANG_COOKIE, isLang } from '$lib/i18n';

// A preference, not an account setting: one cookie, one year, no JS required.
export async function POST({ request, cookies }) {
	const form = await request.formData();
	const to = String(form.get('to') ?? '');
	const next = String(form.get('next') ?? '/');

	if (isLang(to))
		cookies.set(LANG_COOKIE, to, {
			path: '/',
			maxAge: 31536000,
			sameSite: 'lax',
			httpOnly: false,
			// SvelteKit defaults this to true off localhost, which a phone on http://<lan-ip>
			// silently drops — same rule the session cookie already uses
			secure: !dev
		});

	// only ever bounce back inside this site
	redirect(303, next.startsWith('/') ? next : '/');
}

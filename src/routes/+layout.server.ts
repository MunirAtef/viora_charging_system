import { env } from '$env/dynamic/private';

export function load({ locals }) {
	// the VAPID public key is meant to be public — the browser needs it to subscribe
	return { user: locals.user, lang: locals.lang, vapidKey: env.VAPID_PUBLIC_KEY ?? null };
}

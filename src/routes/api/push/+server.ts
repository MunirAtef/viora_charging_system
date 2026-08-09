import { error, json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';

// The browser hands us an endpoint URL plus two keys; that triple is the whole address.
export async function POST({ request, locals }) {
	if (!locals.user) error(401, 'unauthorized');
	const sub = await request.json().catch(() => null);
	const endpoint = String(sub?.endpoint ?? '');
	const p256dh = String(sub?.keys?.p256dh ?? '');
	const auth = String(sub?.keys?.auth ?? '');

	// the crypto sizes are fixed by the spec — checking them here keeps unsendable rows out
	const bytes = (s: string) => Buffer.from(s, 'base64url').length;
	if (
		!endpoint.startsWith('https://') ||
		endpoint.length > 1000 ||
		bytes(p256dh) !== 65 ||
		bytes(auth) !== 16
	)
		error(400, 'bad subscription');

	// the same browser re-subscribing must move the row, not duplicate it
	await sql`
		insert into push_subscriptions (user_id, endpoint, p256dh, auth)
		values (${locals.user.id}, ${endpoint}, ${p256dh}, ${auth})
		on conflict (endpoint) do update
			set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth`;
	return json({ ok: true });
}

export async function DELETE({ request, locals }) {
	if (!locals.user) error(401, 'unauthorized');
	const { endpoint } = (await request.json().catch(() => ({}))) as { endpoint?: string };
	if (endpoint)
		await sql`delete from push_subscriptions
		          where endpoint = ${endpoint} and user_id = ${locals.user.id}`;
	return json({ ok: true });
}

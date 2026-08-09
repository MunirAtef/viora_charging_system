import webpush from 'web-push';
import { env } from '$env/dynamic/private';
import { sql } from './db';

// Web push needs no vendor account: the VAPID pair signs requests to whatever push service the
// browser gave us. Without keys the app runs exactly as before, just silently.
export const pushEnabled = Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
if (pushEnabled)
	webpush.setVapidDetails(
		env.VAPID_SUBJECT || 'mailto:hamada@elhawarey.com',
		env.VAPID_PUBLIC_KEY!,
		env.VAPID_PRIVATE_KEY!
	);

type Payload = { title: string; body: string; url: string; tag?: string };

/** Best-effort: a push that fails must never fail the order that triggered it. */
export async function notify(userIds: number[], payload: Payload) {
	if (!pushEnabled || !userIds.length) return;
	try {
		const subs = await sql`
			select id, endpoint, p256dh, auth from push_subscriptions where user_id in ${sql(userIds)}`;

		const gone: number[] = [];
		await Promise.all(
			// async wrapper on purpose: sendNotification throws synchronously on a malformed row,
			// and one bad subscription must not cancel everyone else's notification
			subs.map(async (s) => {
				try {
					await webpush.sendNotification(
						{ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
						JSON.stringify(payload),
						// hold it for a day so a phone that is off still gets it; never hang the request
						{ TTL: 86400, timeout: 5000 }
					);
				} catch (e: any) {
					// 404/410 = the browser dropped this subscription for good
					if (e?.statusCode === 404 || e?.statusCode === 410) gone.push(s.id);
					else console.error('push failed', e?.statusCode ?? e?.message);
				}
			})
		);

		if (gone.length) await sql`delete from push_subscriptions where id in ${sql(gone)}`;
	} catch (e) {
		console.error('push', e);
	}
}

export async function notifyAdmins(payload: Payload) {
	if (!pushEnabled) return;
	const admins = await sql`select id from users where role = 'admin'`;
	await notify(
		admins.map((a) => a.id),
		payload
	);
}

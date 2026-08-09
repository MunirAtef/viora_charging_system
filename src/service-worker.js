/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

// SvelteKit registers this file automatically in production builds. It only handles
// notifications — no caching, so the app keeps behaving like a normal server-rendered site.
const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));

sw.addEventListener('push', (event) => {
	const data = event.data?.json() ?? {};
	event.waitUntil(
		sw.registration.showNotification(data.title ?? 'Elhawarey Digital', {
			body: data.body ?? '',
			icon: '/logo-mark.png',
			badge: '/logo-mark.png',
			dir: 'rtl',
			lang: 'ar',
			// same tag replaces an earlier notification about the same order instead of stacking
			tag: data.tag,
			data: { url: data.url ?? '/' }
		})
	);
});

sw.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const url = event.notification.data?.url ?? '/';
	event.waitUntil(
		sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
			const target = new URL(url, sw.location.origin);
			for (const client of clients)
				if (new URL(client.url).pathname === target.pathname)
					// focus first, then move it to the exact spot (#review, for instance)
					return client.focus().then((c) => c?.navigate?.(target.href));
			return sw.clients.openWindow(target.href);
		})
	);
});

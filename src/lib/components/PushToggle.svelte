<script lang="ts">
	import { onMount } from 'svelte';
	import { t, type Lang } from '$lib/i18n';
	let {
		vapidKey,
		lang,
		label
	}: { vapidKey: string | null; lang: Lang; label: string } = $props();

	const m = $derived(t(lang).push);

	let mode = $state<'loading' | 'off' | 'on' | 'denied' | 'unsupported'>('loading');
	let busy = $state(false);

	// VAPID keys travel as base64url; subscribe() wants raw bytes
	const toBytes = (base64url: string) => {
		const b64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4))
			.replace(/-/g, '+')
			.replace(/_/g, '/');
		return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	};

	const registration = () => navigator.serviceWorker.ready;

	onMount(async () => {
		if (!vapidKey || !('serviceWorker' in navigator) || !('PushManager' in window)) {
			mode = 'unsupported';
			return;
		}
		if (Notification.permission === 'denied') {
			mode = 'denied';
			return;
		}
		const sub = await (await registration()).pushManager.getSubscription();
		mode = sub ? 'on' : 'off';
	});

	async function enable() {
		busy = true;
		try {
			// must follow a click: browsers reject permission prompts that nobody asked for
			if ((await Notification.requestPermission()) !== 'granted') {
				mode = 'denied';
				return;
			}
			const sub = await (
				await registration()
			).pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: toBytes(vapidKey!)
			});
			const res = await fetch('/api/push', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(sub)
			});
			if (!res.ok) throw new Error(await res.text());
			mode = 'on';
		} catch (e) {
			console.error(e);
			mode = 'off';
		} finally {
			busy = false;
		}
	}

	async function disable() {
		busy = true;
		try {
			const sub = await (await registration()).pushManager.getSubscription();
			if (sub) {
				await fetch('/api/push', {
					method: 'DELETE',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ endpoint: sub.endpoint })
				});
				await sub.unsubscribe();
			}
			mode = 'off';
		} finally {
			busy = false;
		}
	}
</script>

{#if mode !== 'unsupported'}
	<div class="facet flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
		<div>
			<p>{label}</p>
			<p class="mt-1 text-xs text-muted">
				{#if mode === 'on'}
					{m.on}
				{:else if mode === 'denied'}
					{m.denied}
				{:else}
					{m.off}
				{/if}
			</p>
		</div>
		{#if mode === 'on'}
			<button onclick={disable} disabled={busy} class="border border-edge px-4 py-2 hover:border-gem">
				{m.disable}
			</button>
		{:else if mode === 'off'}
			<button
				onclick={enable}
				disabled={busy}
				class="bg-gold px-5 py-2 font-semibold text-ink hover:bg-white"
			>
				{m.enable}
			</button>
		{/if}
	</div>
{/if}

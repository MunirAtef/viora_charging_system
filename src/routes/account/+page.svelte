<script lang="ts">
	import PushToggle from '$lib/components/PushToggle.svelte';
	import { countryName } from '$lib/countries';
	import { t } from '$lib/i18n';
	import type { Status } from '$lib/orders';
	let { data } = $props();

	const m = $derived(t(data.lang));
</script>

<svelte:head><title>{m.account.title} | Elhawarey Digital</title></svelte:head>

<div class="mx-auto max-w-4xl px-5 py-12">
	<h1 class="font-display text-3xl">{m.account.title}</h1>
	<p class="mt-1 text-sm text-muted" dir="ltr">{data.user?.email}</p>

	<div class="mt-6">
		<PushToggle vapidKey={data.vapidKey} lang={data.lang} label={m.account.pushLabel} />
	</div>

	<h2 class="mt-10 mb-4 font-display text-xl">{m.account.myOrders}</h2>
	<div class="space-y-3">
		{#each data.orders as o (o.ref)}
			<a href="/orders/{o.ref}" class="facet flex flex-wrap items-center justify-between gap-4 p-4">
				<span>
					<span class="tabular block text-sm text-muted">
						{o.ref} · {o.app} · {countryName(o.country_code, data.lang)}
					</span>
					<span class="mt-1 block">
						<span class="tabular font-semibold">{o.coins.toLocaleString('en')}</span>
						{m.common.coins} ·
						<span class="tabular text-gold">{o.amount} {o.currency}</span>
					</span>
					<span class="tabular mt-1 block text-xs text-muted">ID {o.player_id}</span>
				</span>
				<span class="border border-edge px-3 py-1 text-sm">{m.status[o.status as Status]}</span>
			</a>
		{:else}
			<p class="text-muted">
				{m.account.empty} <a href="/" class="text-gem">{m.account.start}</a>
			</p>
		{/each}
	</div>
</div>

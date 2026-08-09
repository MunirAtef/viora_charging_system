<script lang="ts">
	import { countryName, flag } from '$lib/countries';
	import { t } from '$lib/i18n';
	import type { Status } from '$lib/orders';
	let { data, form } = $props();

	const m = $derived(t(data.lang));
	const c = $derived(m.admin.country);
	// keep ?app= on the action so the page comes back showing the same app
	const act = $derived((name: string) => `?/${name}&app=${data.app.slug}`);
</script>

<svelte:head>
	<title>{countryName(data.country.code, data.lang)} | {m.admin.title}</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-12 px-5 py-12">
	<div>
		<a href="/admin" class="text-sm text-muted hover:text-white">{m.common.arrow} {c.back}</a>
		<h1 class="mt-3 flex flex-wrap items-center gap-3 font-display text-2xl sm:text-3xl">
			<span>{flag(data.country.code)}</span>
			<span>{countryName(data.country.code, data.lang)}</span>
			<span class="tabular text-gem">{data.country.currency}</span>
		</h1>
	</div>

	{#if form?.message}
		<p class="border-s-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-300">
			{form.message}
		</p>
	{/if}

	<section>
		<h2 class="font-display text-xl">{c.pricesTitle}</h2>
		<p class="mt-1 text-sm text-muted">{c.pricesNote(data.country.currency)}</p>

		<div class="mt-3 flex flex-wrap gap-2">
			{#each data.apps as a (a.slug)}
				<a
					href="?app={a.slug}"
					class="border px-4 py-1 text-sm {a.slug === data.app.slug
						? 'border-gem text-gem'
						: 'border-edge text-muted'}"
				>
					{a.name}
				</a>
			{/each}
		</div>

		<form
			method="POST"
			action={act('addQuota')}
			class="facet mt-3 flex flex-wrap items-end gap-3 p-5"
		>
			<label class="w-28 sm:w-32">
				<span class="text-xs text-muted">{c.coins}</span>
				<input name="coins" type="number" min="1" required dir="ltr" class="field mt-1" />
			</label>
			<label class="w-28 sm:w-32">
				<span class="text-xs text-muted">{c.price(data.country.currency)}</span>
				<input
					name="price"
					type="number"
					step="0.01"
					min="0.01"
					required
					dir="ltr"
					class="field mt-1"
				/>
			</label>
			<label class="w-36">
				<span class="text-xs text-muted">{c.oldPrice}</span>
				<input name="old_price" type="number" step="0.01" dir="ltr" class="field mt-1" />
			</label>
			<button class="bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-white">
				{c.addTo(data.app.name)}
			</button>
		</form>

		<div class="mt-4 divide-y divide-edge/60 border border-edge/60">
			{#each data.quotas as q (q.id)}
				<form
					method="POST"
					action={act('setPrice')}
					class="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
					class:opacity-50={q.price === null}
				>
					<input type="hidden" name="quota_id" value={q.id} />
					<span class="tabular flex-1">{q.coins.toLocaleString('en')} {m.common.coins}</span>
					<input
						name="price"
						type="number"
						step="0.01"
						min="0.01"
						required
						value={q.price ?? ''}
						placeholder={c.notSold}
						dir="ltr"
						class="field w-24 py-1 sm:w-28"
					/>
					<input
						name="old_price"
						type="number"
						step="0.01"
						value={q.old_price ?? ''}
						placeholder={c.oldPrice}
						dir="ltr"
						class="field w-24 py-1 sm:w-28"
					/>
					<button class="border border-edge px-3 py-1 hover:border-gem">{m.common.save}</button>
					{#if q.price !== null}
						<button
							formaction={act('removeQuota')}
							class="border border-edge px-3 py-1 text-muted hover:border-red-400 hover:text-red-300"
						>
							{m.common.remove}
						</button>
					{/if}
				</form>
			{:else}
				<p class="px-4 py-6 text-muted">{c.noPackages}</p>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="font-display text-xl">{c.ordersTitle}</h2>
		<div class="mt-3 divide-y divide-edge/60 border border-edge/60">
			{#each data.orders as o (o.ref)}
				<a href="/orders/{o.ref}" class="flex flex-wrap items-center gap-4 px-4 py-3 text-sm">
					<span class="tabular w-28 text-muted">{o.ref}</span>
					<span class="min-w-0 flex-1 basis-full sm:basis-auto">
						<span class="block">{o.app} · <span class="tabular">ID {o.player_id}</span></span>
						<span class="block text-xs text-muted" dir="ltr">{o.email ?? '—'}</span>
					</span>
					<span class="tabular w-28 text-gold">{o.amount} {o.currency}</span>
					<span class="text-xs text-muted sm:w-40">{m.status[o.status as Status]}</span>
				</a>
			{:else}
				<p class="px-4 py-6 text-muted">{c.noOrders}</p>
			{/each}
		</div>
	</section>
</div>

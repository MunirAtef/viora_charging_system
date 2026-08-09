<script lang="ts">
	import { page } from '$app/state';
	import Gem from '$lib/components/Gem.svelte';
	import { countryName } from '$lib/countries';
	import { t } from '$lib/i18n';
	let { data, form } = $props();
	let selected = $state<number | null>(null);

	const m = $derived(t(data.lang));
	const country = $derived(countryName(data.country.code, data.lang));
	const chosen = $derived(data.quotas.find((q) => q.id === selected));
</script>

<svelte:head><title>{m.buy.title(data.app.name, country)} | Elhawarey Digital</title></svelte:head>

<div class="mx-auto max-w-4xl px-5 py-12">
	<a href="/" class="text-sm text-muted hover:text-white">{m.common.arrow} {m.buy.changeCountry}</a>

	<div class="mt-3 flex items-center gap-3">
		<img
			src="https://flagcdn.com/w80/{data.country.code.toLowerCase()}.png"
			alt=""
			width="48"
			height="32"
			class="h-8 w-12 object-cover"
		/>
		<h1 class="font-display text-2xl sm:text-3xl">
			{data.app.name} · {country} ·
			<span class="tabular text-gem">{data.country.currency}</span>
		</h1>
	</div>

	<div class="mt-4 flex flex-wrap gap-2">
		{#each data.apps as a (a.slug)}
			<a
				href="/buy/{a.slug}/{data.country.code}"
				class="border px-4 py-1 text-sm {a.slug === data.app.slug
					? 'border-gem text-gem'
					: 'border-edge text-muted'}"
			>
				{a.name}
			</a>
		{/each}
	</div>

	{#if !data.user}
		<p class="facet mt-6 p-4 text-sm">
			<span>
				{m.buy.mustLogIn}
				<a href="/login?next={page.url.pathname}" class="text-gem hover:text-white">{m.buy.login}</a>
				{m.buy.or}
				<a href="/register?next={page.url.pathname}" class="text-gem hover:text-white">
					{m.buy.register}
				</a>
			</span>
		</p>
	{/if}

	<form method="POST" class="mt-8 space-y-8">
		<!-- Ordering is a real sequence, so the steps are numbered. -->
		<section>
			<h2 class="font-display text-xl">
				<span class="tabular text-gem">1</span>
				{m.buy.step1(data.app.name)}
			</h2>
			<div class="facet mt-3 p-6">
				<div class="grid gap-4 md:grid-cols-2">
					<label class="block">
						<span class="text-sm text-muted">{m.buy.playerId}</span>
						<input name="player_id" required dir="ltr" placeholder="123456789" class="field mt-1" />
					</label>
					<label class="block">
						<span class="text-sm text-muted">{m.buy.phone}</span>
						<input name="phone" type="tel" required dir="ltr" placeholder="+20…" class="field mt-1" />
					</label>
				</div>
				<p class="mt-3 text-xs text-muted">{m.buy.idWarning}</p>
			</div>
		</section>

		<section>
			<h2 class="font-display text-xl">
				<span class="tabular text-gem">2</span>
				{m.buy.step2}
			</h2>
			<div class="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
				{#each data.quotas as q (q.id)}
					<label class="facet block cursor-pointer p-4 text-center" data-on={selected === q.id}>
						<span class="block">
							<input
								type="radio"
								name="quota_id"
								value={q.id}
								bind:group={selected}
								class="sr-only"
							/>
							<Gem size={18} class="mx-auto text-gem" />
							<span class="tabular mt-2 block font-semibold">{q.coins.toLocaleString('en')}</span>
							<span class="tabular mt-2 block text-gold">
								{q.price}
								<span class="text-xs text-muted">{data.country.currency}</span>
							</span>
							{#if q.old_price}
								<span class="tabular block text-xs text-muted line-through">{q.old_price}</span>
							{/if}
						</span>
					</label>
				{:else}
					<p class="col-span-full text-muted">{m.buy.noPackages}</p>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="font-display text-xl">
				<span class="tabular text-gem">3</span>
				{m.buy.step3}
			</h2>
			<div class="facet mt-3 p-6">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<p class="text-sm text-muted">
						{#if chosen}
							<span class="tabular text-lg text-white">{chosen.coins.toLocaleString('en')}</span>
							{m.common.coins} · {m.buy.totalIs}
							<span class="tabular text-lg text-gold">
								{chosen.price}
								{data.country.currency}
							</span>
						{:else}
							{m.buy.chooseFirst}
						{/if}
					</p>
					<button class="bg-gold px-10 py-3 font-semibold text-ink hover:bg-white">{m.buy.pay}</button>
				</div>

				<label class="mt-5 flex items-start gap-2 text-sm text-muted">
					<input type="checkbox" name="terms" value="1" required class="mt-1" />
					<span>
						{m.buy.agree}
						<a href="/legal/terms" class="text-gem hover:text-white">{m.buy.terms}</a>
						{m.buy.and}
						<a href="/legal/refund" class="text-gem hover:text-white">{m.buy.refund}</a
						>{m.buy.agreeTail}
					</span>
				</label>
				<p class="mt-3 text-xs text-muted">
					{m.buy.finalPrice(data.country.currency)}<a
						href="/legal/delivery"
						class="text-gem hover:text-white">{m.buy.deliveryPolicy}</a
					>{m.buy.payLater}
				</p>
			</div>
		</section>

		{#if form?.message}
			<p class="border-s-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-300">
				{form.message}
			</p>
		{/if}
	</form>
</div>

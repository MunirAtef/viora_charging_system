<script lang="ts">
	import PushToggle from '$lib/components/PushToggle.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import { catalog, countryName, flag } from '$lib/countries';
	import { t } from '$lib/i18n';
	let { data, form } = $props();

	const m = $derived(t(data.lang));
	const countries = $derived(catalog(data.lang));
</script>

<svelte:head><title>{m.admin.title} | Elhawarey Digital</title></svelte:head>

<div class="mx-auto max-w-5xl space-y-12 px-5 py-12">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="font-display text-2xl sm:text-3xl">{m.admin.title}</h1>
		<a href="/admin/orders" class="border border-edge px-4 py-2 text-sm hover:border-gem">
			{m.admin.ordersLink}
		</a>
	</div>

	{#if form?.message}
		<p class="border-s-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-300">
			{form.message}
		</p>
	{/if}

	<PushToggle vapidKey={data.vapidKey} lang={data.lang} label={m.admin.pushLabel} />

	<section>
		<h2 class="font-display text-xl">{m.admin.appsTitle}</h2>
		<p class="mt-1 text-sm text-muted">{m.admin.appsNote}</p>

		<form method="POST" action="?/addApp" class="facet mt-3 flex flex-wrap items-end gap-3 p-5">
			<label class="min-w-40 flex-1">
				<span class="text-xs text-muted">{m.admin.appName}</span>
				<input name="name" required placeholder="Bigo Live" dir="ltr" class="field mt-1" />
			</label>
			<label class="min-w-40 flex-1">
				<span class="text-xs text-muted">{m.admin.appSlug}</span>
				<input name="slug" required placeholder="bigo" dir="ltr" class="field mt-1" />
			</label>
			<button class="bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-white">
				{m.common.add}
			</button>
		</form>

		<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.apps as a (a.id)}
				<div class="facet flex items-center gap-3 p-4" class:opacity-50={!a.active}>
					<span class="min-w-0 flex-1">
						<span class="block truncate" dir="ltr">{a.name}</span>
						<span class="block text-xs text-muted">
							<span class="tabular">{a.slug}</span> · {m.admin.packages(Number(a.packages))}
						</span>
					</span>
					<form method="POST" action="?/toggleApp">
						<input type="hidden" name="id" value={a.id} />
						<button class="border border-edge px-3 py-1 text-xs hover:border-gem">
							{a.active ? m.common.enabled : m.home.soon}
						</button>
					</form>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="font-display text-xl">{m.admin.countriesTitle}</h2>
		<p class="mt-1 text-sm text-muted">{m.admin.countriesNote}</p>

		<form method="POST" action="?/addCountry" class="facet mt-3 flex flex-wrap items-end gap-3 p-5">
			<label class="min-w-56 flex-1">
				<span class="text-xs text-muted">{m.admin.addCountry}</span>
				<select name="code" required class="field mt-1">
					<option value="">{m.admin.pickCountry}</option>
					{#each countries as c (c.code)}
						<option value={c.code}>{flag(c.code)} {c.name} · {c.currency}</option>
					{/each}
				</select>
			</label>
			<button class="bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-white">
				{m.common.add}
			</button>
		</form>

		<div class="mt-4 grid gap-3 sm:grid-cols-2">
			{#each data.countries as c (c.id)}
				<div class="facet flex items-center gap-4 p-4" class:opacity-50={!c.active}>
					<span class="text-2xl">{flag(c.code)}</span>
					<a href="/admin/countries/{c.code}" class="min-w-0 flex-1">
						<span class="block truncate">{countryName(c.code, data.lang)}</span>
						<span class="block text-xs text-muted">
							<span class="tabular">{c.currency}</span>
							· {m.admin.prices(Number(c.quotas))}
							{#if Number(c.open)}
								· <span class="text-gold">{m.admin.openOrders(Number(c.open))}</span>
							{/if}
						</span>
					</a>
					<form method="POST" action="?/toggleCountry">
						<input type="hidden" name="id" value={c.id} />
						<button class="border border-edge px-3 py-1 text-xs hover:border-gem">
							{c.active ? m.common.enabled : m.common.disabled}
						</button>
					</form>
				</div>
			{:else}
				<p class="text-muted">{m.admin.noCountries}</p>
			{/each}
		</div>
	</section>

	{#if data.reviews.length}
		<section>
			<h2 class="font-display text-xl">{m.reviews.title}</h2>
			<div class="mt-3 divide-y divide-edge/60 border border-edge/60">
				{#each data.reviews as r (r.id)}
					<div class="flex flex-wrap items-center gap-4 px-4 py-3 text-sm">
						<Stars rating={r.rating} />
						<span class="min-w-0 flex-1 basis-full sm:basis-auto">
							<span class="block">{r.body ?? '—'}</span>
							<span class="tabular block text-xs text-muted">{r.name ?? '—'} · {r.ref}</span>
						</span>
						<form method="POST" action="?/toggleReview">
							<input type="hidden" name="id" value={r.id} />
							<button class="border border-edge px-3 py-1 text-xs hover:border-gem">
								{r.approved ? m.common.enabled : m.common.disabled}
							</button>
						</form>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<section>
		<h2 class="font-display text-xl">{m.admin.accountsTitle}</h2>
		<p class="mt-1 text-sm text-muted">{m.admin.accountsNote}</p>
		<div class="mt-3 divide-y divide-edge/60 border border-edge/60">
			{#each data.users as u (u.id)}
				<div class="flex flex-wrap items-center gap-4 px-4 py-3 text-sm">
					<span class="tabular w-12 text-muted">#{u.id}</span>
					<span class="min-w-0 flex-1 truncate">
						{u.name ?? '—'}
						<span class="block text-xs text-muted" dir="ltr">{u.email}</span>
					</span>
					<form method="POST" action="?/setRole" class="flex gap-2">
						<input type="hidden" name="id" value={u.id} />
						<select name="role" value={u.role} class="field w-28 py-1">
							{#each Object.entries(m.admin.roles) as [value, label] (value)}
								<option {value}>{label}</option>
							{/each}
						</select>
						<button class="border border-edge px-3 hover:border-gem">{m.common.save}</button>
					</form>
				</div>
			{/each}
		</div>
	</section>
</div>

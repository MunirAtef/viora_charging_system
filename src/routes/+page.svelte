<script lang="ts">
	import Gem from '$lib/components/Gem.svelte';
	import AppIcon from '$lib/components/AppIcon.svelte';
	import Stars from '$lib/components/Stars.svelte';
	import Typewriter from '$lib/components/Typewriter.svelte';
	import { countryName } from '$lib/countries';
	import { contact } from '$lib/contact';
	import { t } from '$lib/i18n';
	let { data } = $props();

	const m = $derived(t(data.lang));
</script>

<svelte:head><title>{m.home.title}</title></svelte:head>

<!-- Hero: the first real decision is the currency, so the picker is the hero. -->
<section class="mx-auto max-w-6xl px-5 pt-10 pb-8 sm:pt-16">
	<p class="text-sm tracking-[0.25em] text-gem">ELHAWAREY DIGITAL</p>
	<h1 class="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
		{m.home.heading}<br />
		<span class="text-muted"><Typewriter phrases={m.home.promises} /></span>
	</h1>
	<p class="mt-4 max-w-lg text-muted">{m.home.blurb}</p>
</section>

<!-- Apps: what we top up today, and what is on the way. -->
<section id="apps" class="mx-auto max-w-6xl scroll-mt-20 px-5 pb-16">
	<h2 class="mb-1 font-display text-2xl">{m.home.appsTitle}</h2>
	<p class="mb-5 text-sm text-muted">{m.home.appsNote}</p>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
		{#each data.apps as a (a.slug)}
			{#if a.active}
				<a href="#countries" class="facet block p-4 text-center">
					<span class="flex flex-col items-center">
						<span class="text-2xl text-gem"><AppIcon slug={a.slug} name={a.name} size={40} /></span>
						<span class="mt-2 block text-sm" dir="ltr">{a.name}</span>
						<span class="mt-1 block text-xs text-gold">{m.home.available}</span>
					</span>
				</a>
			{:else}
				<div class="facet p-4 text-center opacity-50">
					<div class="flex flex-col items-center">
						<span class="text-2xl text-muted"><AppIcon slug={a.slug} name={a.name} size={40} /></span>
						<span class="mt-2 block text-sm" dir="ltr">{a.name}</span>
						<span class="mt-1 block text-xs text-muted">{m.home.soon}</span>
					</div>
				</div>
			{/if}
		{:else}
			<p class="col-span-full text-muted">{m.home.noApps}</p>
		{/each}
	</div>
</section>

<section id="countries" class="mx-auto max-w-6xl scroll-mt-20 px-5 pb-16">
	<h2 class="mb-1 font-display text-2xl">{m.home.countriesTitle}</h2>
	<p class="mb-5 text-sm text-muted">{m.home.countriesNote}</p>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
		{#each data.countries as c (c.code)}
			<a href="/buy/{data.primary?.slug}/{c.code}" class="facet block p-4">
				<div class="flex items-center gap-3">
					<img
						src="https://flagcdn.com/w80/{c.code.toLowerCase()}.png"
						alt=""
						width="40"
						height="27"
						class="h-7 w-10 object-cover"
					/>
					<div class="min-w-0">
						<p class="tabular text-sm text-gem">{c.currency}</p>
						<p class="truncate text-sm">{countryName(c.code, data.lang)}</p>
					</div>
				</div>
			</a>
		{:else}
			<p class="col-span-full text-muted">{m.home.noCountries}</p>
		{/each}
	</div>
</section>

<!-- Packages preview: every country prices its own, so only the sizes are shown here. -->
<section id="packages" class="mx-auto max-w-6xl scroll-mt-20 px-5 pb-16">
	<h2 class="mb-1 font-display text-2xl">{m.home.packagesTitle}</h2>
	<p class="mb-5 text-sm text-muted">{m.home.packagesNote}</p>
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
		{#each data.quotas as q (q.coins)}
			<div class="facet p-4 text-center">
				<div>
					<Gem size={20} class="mx-auto text-gem" />
					<p class="tabular mt-2 text-lg font-semibold">{q.coins.toLocaleString('en')}</p>
					<p class="mt-1 text-xs text-muted">{m.common.coins}</p>
				</div>
			</div>
		{/each}
	</div>
</section>

<!-- Reviews come from delivered orders only, so the section simply isn't there until one exists. -->
{#if data.reviews.length || data.completed}
	<section class="mx-auto max-w-6xl px-5 pb-16">
		<h2 class="mb-1 font-display text-2xl">{m.reviews.title}</h2>
		<p class="mb-5 text-sm text-muted">
			{#if data.completed}
				{m.reviews.completed(data.completed.toLocaleString('en'))}
			{/if}
			{#if data.reviews.length}
				· {m.reviews.note(data.summary.count, data.summary.average)}
			{/if}
		</p>
		<div class="grid gap-4 md:grid-cols-3">
			{#each data.reviews as r (r.created_at)}
				<!-- the caption is a direct child on purpose: .facet styles its own children -->
				<figure class="facet p-5">
					<Stars rating={r.rating} />
					{#if r.body}<blockquote class="mt-2 text-sm leading-relaxed">{r.body}</blockquote>{/if}
					<figcaption class="mt-3 text-xs text-muted">
						{r.name?.split(' ')[0] ?? '—'} · {countryName(r.country_code, data.lang)} · {r.app}
						<span class="block text-gem">{m.reviews.verified}</span>
					</figcaption>
				</figure>
			{/each}
		</div>
	</section>
{/if}

<!-- How it works: the three steps a payment provider expects to see spelled out. -->
<section class="mx-auto max-w-6xl px-5 pb-16">
	<h2 class="mb-5 font-display text-2xl">{m.home.howTitle}</h2>
	<div class="grid gap-4 md:grid-cols-3">
		{#each m.home.steps as step, i (step.h)}
			<div class="facet p-6">
				<div>
					<p class="tabular text-3xl text-gem">{i + 1}</p>
					<h3 class="mt-2 font-display text-lg">{step.h}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted">{step.p}</p>
				</div>
			</div>
		{/each}
	</div>
	<p class="mt-4 text-xs text-muted">
		{m.home.howNote}
		<a href="/legal/refund" class="text-gem hover:text-white">{m.home.howNoteLink}</a>.
	</p>
</section>

<section id="contact" class="mx-auto max-w-6xl scroll-mt-20 px-5 pb-8">
	<h2 class="mb-5 font-display text-2xl">{m.home.contactTitle}</h2>
	<div class="grid gap-4 md:grid-cols-2">
		<div class="facet p-6">
			<dl class="space-y-4 text-sm">
				<div>
					<dt class="text-muted">{m.home.phone}</dt>
					<dd class="tabular mt-1 text-lg">{contact.phone}</dd>
				</div>
				<div>
					<dt class="text-muted">{m.home.email}</dt>
					<dd class="mt-1" dir="ltr">{contact.email}</dd>
				</div>
				<div>
					<dt class="text-muted">{m.home.offices}</dt>
					{#each contact.offices as office (office.address)}
						<dd class="mt-1" dir="ltr">
							📍 {office.flag}
							{office.name} — {office.address}
						</dd>
					{/each}
				</div>
				<div>
					<dt class="text-muted">{m.home.hours}</dt>
					<dd class="mt-1">{contact.hours[data.lang]}</dd>
				</div>
			</dl>
		</div>

		{#if contact.mapUrl}
			<div class="facet min-h-56 p-1">
				<iframe src={contact.mapUrl} title="map" class="h-full min-h-56 w-full" loading="lazy"
				></iframe>
			</div>
		{:else}
			<div class="facet p-6 text-sm">
				<div>
					<h3 class="font-display text-lg">{m.home.faqTitle}</h3>
					<ul class="mt-3 space-y-2 text-muted">
						{#each m.home.faq as item (item.href)}
							<li><a href={item.href} class="hover:text-white">{item.text}</a></li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
</section>

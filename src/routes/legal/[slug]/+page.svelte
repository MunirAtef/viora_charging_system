<script lang="ts">
	import { page } from '$app/state';
	import { contact } from '$lib/contact';
	import { legalNav } from '$lib/legal';
	import { t } from '$lib/i18n';
	let { data } = $props();

	const m = $derived(t(data.lang));
	const nav = $derived(legalNav(data.lang));
</script>

<svelte:head><title>{data.doc.title} | Elhawarey Digital</title></svelte:head>

<div class="mx-auto grid max-w-5xl gap-8 px-5 py-12 md:grid-cols-[14rem_1fr]">
	<nav class="facet h-fit p-4">
		<ul class="space-y-1 text-sm">
			{#each nav as item (item.slug)}
				<li>
					<a
						href="/legal/{item.slug}"
						class="block px-2 py-1 hover:text-white"
						class:text-gem={page.params.slug === item.slug}
						class:text-muted={page.params.slug !== item.slug}
					>
						{item.title}
					</a>
				</li>
			{/each}
			<li><a href="/#contact" class="block px-2 py-1 text-muted hover:text-white">{m.nav.contact}</a></li>
		</ul>
	</nav>

	<article>
		<h1 class="font-display text-3xl">{data.doc.title}</h1>
		<p class="tabular mt-1 text-xs text-muted">{data.updated}</p>
		<p class="mt-4 leading-relaxed text-muted">{data.doc.intro}</p>

		{#each data.doc.sections as section (section.h)}
			<section class="mt-8">
				<h2 class="font-display text-xl text-gem">{section.h}</h2>
				{#each section.p as text (text)}
					<p class="mt-3 leading-relaxed">{text}</p>
				{/each}
			</section>
		{/each}

		<div class="facet mt-10 p-5 text-sm">
			<div>
				<p>{m.home.contactTitle}</p>
				<p class="tabular mt-2">{contact.phone}</p>
				<p class="mt-1" dir="ltr">{contact.email}</p>
			</div>
		</div>
	</article>
</div>

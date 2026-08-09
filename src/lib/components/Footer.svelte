<script lang="ts">
	import { contact } from '$lib/contact';
	import { legalNav } from '$lib/legal';
	import { t, type Lang } from '$lib/i18n';
	let { user, lang }: { user: App.Locals['user']; lang: Lang } = $props();

	const m = $derived(t(lang));
	const nav = $derived(legalNav(lang));
</script>

<footer class="no-print mt-24 border-t border-edge/60 bg-plum/60">
	<div class="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-9 px-5 py-10 md:grid-cols-4 md:gap-10 md:py-12">
		<div class="col-span-2 md:col-span-1">
			<div class="flex items-center gap-2 text-gem">
				<img src="/logo-mark.png" alt="" width="32" height="32" class="h-8 w-8 rounded-full" />
				<span class="font-display text-lg tracking-[0.12em] text-white">ELHAWAREY DIGITAL</span>
			</div>
			<p class="mt-3 max-w-xs text-sm leading-relaxed text-muted">{m.footer.blurb}</p>
		</div>

		<div>
			<h3 class="font-display text-lg">{m.footer.links}</h3>
			<ul class="mt-3 space-y-2 text-sm text-muted">
				<li><a href="/#apps" class="hover:text-white">{m.nav.apps}</a></li>
				<li><a href="/#packages" class="hover:text-white">{m.nav.packages}</a></li>
				{#if user?.role === 'admin'}
					<li><a href="/admin/orders" class="hover:text-white">{m.footer.orders}</a></li>
				{:else}
					<li><a href="/account" class="hover:text-white">{m.footer.myOrders}</a></li>
				{/if}
				<li><a href="/#contact" class="hover:text-white">{m.nav.contact}</a></li>
			</ul>
		</div>

		<div>
			<h3 class="font-display text-lg">{m.footer.policies}</h3>
			<ul class="mt-3 space-y-2 text-sm text-muted">
				{#each nav as item (item.slug)}
					<li><a href="/legal/{item.slug}" class="hover:text-white">{item.title}</a></li>
				{/each}
			</ul>
		</div>

		<div class="col-span-2 md:col-span-1">
			<h3 class="font-display text-lg">{m.footer.contact}</h3>
			<ul class="mt-3 space-y-2 text-sm text-muted">
				<li><a href="tel:{contact.phone}" class="tabular hover:text-white">{contact.phone}</a></li>
				<li><a href="mailto:{contact.email}" class="hover:text-white">{contact.email}</a></li>
				<li>{m.home.hours}: {contact.hours[lang]}</li>
			</ul>
		</div>
	</div>

	<!-- The registered entities behind the invoices; a payment provider looks for these. -->
	<div class="mx-auto max-w-6xl border-t border-edge/60 px-5 py-6">
		<ul class="grid gap-3 text-xs leading-relaxed text-muted sm:grid-cols-2 md:grid-cols-3">
			{#each contact.offices as office (office.address)}
				<li dir="ltr">📍 <strong>{office.flag} {office.name}</strong><br />{office.address}</li>
			{/each}
		</ul>
	</div>

	<div class="border-t border-edge/60 px-5 py-5 text-center text-xs text-muted">
		<p>© {new Date().getFullYear()} Elhawarey Digital — {m.footer.rights}</p>
		<p class="mx-auto mt-2 max-w-3xl leading-relaxed">{m.footer.disclaimer}</p>
	</div>
</footer>

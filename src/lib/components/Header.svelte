<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { t, type Lang } from '$lib/i18n';
	let { user, lang }: { user: App.Locals['user']; lang: Lang } = $props();

	const m = $derived(t(lang));
	// a section counts as current when you are anywhere inside it, e.g. /admin/orders under /admin
	const on = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(href + '/');

	// the more specific section wins, so /admin/orders doesn't light up the dashboard too
	const atOrders = $derived(on('/admin/orders'));
	const atAdmin = $derived(on('/admin') && !atOrders);

	// one list, rendered twice: inline on desktop, stacked in the mobile sheet
	const items = $derived([
		{ href: '/#apps', label: m.nav.apps, active: false },
		{ href: '/#packages', label: m.nav.packages, active: false },
		{ href: '/#contact', label: m.nav.contact, active: false },
		...(user
			? user.role === 'admin'
				? [
						{ href: '/admin', label: m.nav.dashboard, active: atAdmin },
						{ href: '/admin/orders', label: m.nav.orders, active: atOrders }
					]
				: [{ href: '/account', label: m.nav.account, active: on('/account') }]
			: [{ href: '/login', label: m.nav.login, active: on('/login') }])
	]);

	let menu = $state(false);
	afterNavigate(() => (menu = false));
</script>

<header class="no-print sticky top-0 z-20 border-b border-edge/60 bg-ink/80 backdrop-blur">
	<nav class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-5 sm:py-4">
		<a href="/" class="flex min-w-0 items-center gap-2 text-gem">
			<!-- the mark is the ring only, so a circular crop never touches the wordmark -->
			<img
				src="/logo-mark.png"
				alt=""
				width="36"
				height="36"
				class="h-8 w-8 shrink-0 rounded-full sm:h-9 sm:w-9"
			/>
			<span class="truncate font-display text-base tracking-[0.12em] text-white sm:text-xl">
				ELHAWAREY DIGITAL
			</span>
		</a>

		<div class="flex-1"></div>

		<div class="hidden items-center gap-5 lg:flex">
			{#each items as item (item.href)}
				<a
					href={item.href}
					class="text-sm {item.active ? 'text-gem' : 'text-muted hover:text-white'}"
					aria-current={item.active ? 'page' : undefined}
				>
					{item.label}
				</a>
			{/each}
			{#if user}
				<form method="POST" action="/logout">
					<button class="text-sm text-muted hover:text-white">{m.nav.logout}</button>
				</form>
			{:else}
				<a href="/register" class="facet px-4 py-2 text-sm font-semibold">
					<span>{m.nav.register}</span>
				</a>
			{/if}
		</div>

		<!-- switches to the other language and comes back to the same page, no JS involved -->
		<form method="POST" action="/lang" class="shrink-0">
			<input type="hidden" name="to" value={lang === 'ar' ? 'en' : 'ar'} />
			<input type="hidden" name="next" value={page.url.pathname + page.url.search} />
			<button class="border border-edge px-3 py-2 text-xs text-muted hover:border-gem">
				{m.langName}
			</button>
		</form>

		<!-- native disclosure: a menu that works before any JavaScript loads -->
		<details bind:open={menu} class="relative shrink-0 lg:hidden">
			<summary
				aria-label={m.nav.menu}
				class="flex h-9 w-9 cursor-pointer list-none items-center justify-center border border-edge text-muted hover:border-gem [&::-webkit-details-marker]:hidden"
			>
				<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
					<path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" stroke-width="1.6" />
				</svg>
			</summary>

			<div
				class="absolute end-0 top-full z-30 mt-3 w-56 border border-edge bg-plum p-2 shadow-2xl"
			>
				{#each items as item (item.href)}
					<a
						href={item.href}
						class="block px-3 py-2.5 text-sm {item.active
							? 'text-gem'
							: 'text-muted hover:text-white'}"
						aria-current={item.active ? 'page' : undefined}
					>
						{item.label}
					</a>
				{/each}
				<div class="my-1 border-t border-edge/60"></div>
				{#if user}
					<form method="POST" action="/logout">
						<button class="block w-full px-3 py-2.5 text-start text-sm text-muted hover:text-white">
							{m.nav.logout}
						</button>
					</form>
				{:else}
					<a href="/register" class="block px-3 py-2.5 text-sm font-semibold text-gold">
						{m.nav.register}
					</a>
				{/if}
			</div>
		</details>
	</nav>
</header>

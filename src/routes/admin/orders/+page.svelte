<script lang="ts">
	import { countryName, flag } from '$lib/countries';
	import { t } from '$lib/i18n';
	import { NEXT, PAYMENT_METHODS, STATUSES, type Status } from '$lib/orders';
	let { data, form } = $props();

	const m = $derived(t(data.lang));
</script>

<svelte:head><title>{m.admin.orders.title} | Elhawarey Digital</title></svelte:head>

<div class="mx-auto max-w-5xl space-y-6 px-5 py-12">
	<div>
		<a href="/admin" class="text-sm text-muted hover:text-white">{m.common.arrow} {m.admin.title}</a>
		<h1 class="mt-3 font-display text-2xl sm:text-3xl">{m.admin.orders.title}</h1>
	</div>

	<div class="flex flex-wrap gap-2 text-sm">
		<a
			href="/admin/orders"
			class="border px-3 py-1 {data.filter ? 'border-edge text-muted' : 'border-gem text-gem'}"
		>
			{m.admin.orders.all}
		</a>
		{#each Object.entries(m.status) as [key, label] (key)}
			<a
				href="/admin/orders?status={key}"
				class="border px-3 py-1 {data.filter === key
					? 'border-gem text-gem'
					: 'border-edge text-muted'}"
			>
				{label} <span class="tabular">{data.counts[key] ?? 0}</span>
			</a>
		{/each}
	</div>

	{#if form?.message}
		<p class="border-s-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-300">
			{form.message}
		</p>
	{/if}

	<details class="facet p-5">
		<summary class="cursor-pointer text-sm text-gem">{m.admin.orders.create}</summary>
		<p class="mt-2 text-xs text-muted">{m.admin.orders.createNote}</p>
		<form method="POST" action="?/create" class="mt-4 grid gap-3 sm:grid-cols-3">
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.name}</span>
				<input name="name" required class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.email}</span>
				<input name="email" type="email" required dir="ltr" class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.phone}</span>
				<input name="phone" dir="ltr" class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.app}</span>
				<select name="app_id" required class="field mt-1">
					{#each data.apps as a (a.id)}
						<option value={a.id}>{a.name}</option>
					{/each}
				</select>
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.playerId}</span>
				<input name="player_id" required dir="ltr" class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.coins}</span>
				<input name="coins" type="number" min="1" required class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.country}</span>
				<select name="country_id" required class="field mt-1">
					{#each data.countries as c (c.id)}
						<option value={c.id}>{flag(c.code)} {countryName(c.code, data.lang)} · {c.currency}</option>
					{/each}
				</select>
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.amount}</span>
				<input name="amount" type="number" step="0.01" min="0.01" required class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.method}</span>
				<select name="payment_method" class="field mt-1">
					<option value="">{m.common.none}</option>
					{#each PAYMENT_METHODS as key (key)}
						<option value={key} selected={key === 'bank'}>{m.payment[key]}</option>
					{/each}
				</select>
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.requestedAt}</span>
				<input name="created_at" type="date" required class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.chargedAt}</span>
				<input name="paid_at" type="date" class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.status}</span>
				<select name="status" class="field mt-1">
					{#each STATUSES as key (key)}
						<option value={key} selected={key === 'delivered'}>{m.status[key]}</option>
					{/each}
				</select>
			</label>
			<label class="block sm:col-span-2">
				<span class="text-xs text-muted">{m.admin.orders.reference}</span>
				<input name="payment_ref" dir="ltr" class="field mt-1" />
			</label>
			<label class="block">
				<span class="text-xs text-muted">{m.admin.orders.note}</span>
				<input name="note" class="field mt-1" />
			</label>
			<div class="sm:col-span-3">
				<button class="bg-gold px-5 py-2.5 font-semibold text-ink hover:bg-white">
					{m.common.add}
				</button>
			</div>
		</form>
	</details>

	<div class="divide-y divide-edge/60 border border-edge/60">
		{#each data.orders as o (o.ref)}
			<div class="px-4 py-3 text-sm">
				<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
					<a href="/orders/{o.ref}" class="tabular w-28 text-muted hover:text-gem">{o.ref}</a>
					<span class="min-w-0 flex-1 basis-full sm:basis-auto">
						<span class="block">{o.app} · <span class="tabular">ID {o.player_id}</span></span>
						<span class="block text-xs text-muted" dir="ltr">{o.email ?? o.phone}</span>
					</span>
					<a href="/admin/countries/{o.code}" class="w-24 truncate hover:text-gem">
						{flag(o.code)}
						{countryName(o.code, data.lang)}
					</a>
					<span class="tabular w-28 text-gold">{o.amount} {o.currency}</span>
					<span class="text-xs sm:w-40">{m.status[o.status as Status]}</span>
				</div>

				{#if NEXT[o.status as Status]?.length}
					<details class="mt-2">
						<summary class="cursor-pointer text-xs text-gem">{m.admin.orders.update}</summary>
						<form method="POST" action="?/advance" class="mt-2 grid gap-2 sm:flex sm:flex-wrap sm:items-end">
							<input type="hidden" name="ref" value={o.ref} />
							<label class="block">
								<span class="text-xs text-muted">{m.admin.orders.status}</span>
								<select name="to" class="field py-1 sm:w-44">
									{#each NEXT[o.status as Status] as next (next)}
										<option value={next}>{m.status[next]}</option>
									{/each}
								</select>
							</label>
							<label class="block">
								<span class="text-xs text-muted">{m.admin.orders.method}</span>
								<select name="payment_method" class="field py-1 sm:w-36">
									<option value="">—</option>
									{#each PAYMENT_METHODS as key (key)}
										<option value={key} selected={o.payment_method === key}>{m.payment[key]}</option>
									{/each}
								</select>
							</label>
							<label class="block">
								<span class="text-xs text-muted">{m.admin.orders.reference}</span>
								<input name="payment_ref" value={o.payment_ref ?? ''} class="field py-1 sm:w-36" />
							</label>
							<label class="block sm:flex-1">
								<span class="text-xs text-muted">{m.admin.orders.note}</span>
								<input name="note" value={o.note ?? ''} class="field py-1" />
							</label>
							<button class="border border-edge px-4 py-1.5 hover:border-gem">{m.common.save}</button>
						</form>
					</details>
				{/if}
			</div>
		{:else}
			<p class="px-4 py-6 text-muted">{m.admin.orders.empty}</p>
		{/each}
	</div>
</div>

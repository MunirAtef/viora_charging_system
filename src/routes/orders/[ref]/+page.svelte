<script lang="ts">
	import { contact } from '$lib/contact';
	import Stars from '$lib/components/Stars.svelte';
	import { countryName } from '$lib/countries';
	import { t } from '$lib/i18n';
	import type { PaymentMethod, Status } from '$lib/orders';
	let { data, form } = $props();

	const m = $derived(t(data.lang));
	const o = $derived(data.order);
	const when = (d: string | null) => (d ? new Date(d).toLocaleString('en-GB') : '—');
	const wa = $derived(
		`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=` +
			encodeURIComponent(`${o.ref} — ${o.amount} ${o.currency}`)
	);
</script>

<svelte:head><title>{m.order.title(data.order.ref)} | Elhawarey Digital</title></svelte:head>

<div class="mx-auto max-w-3xl px-5 py-12">
	<a href="/account" class="text-sm text-muted hover:text-white">{m.common.arrow} {m.order.backToOrders}</a>

	<div class="mt-3 flex flex-wrap items-center justify-between gap-3">
		<h1 class="tabular font-display text-2xl sm:text-3xl">{o.ref}</h1>
		<span class="border border-edge px-3 py-1 text-sm">{m.status[o.status as Status]}</span>
	</div>

	<!-- The receipt: everything a customer or a payment provider needs to identify the sale. -->
	<div class="facet mt-6 p-6">
		<dl class="grid gap-4 text-sm sm:grid-cols-2">
			<div><dt class="text-muted">{m.order.app}</dt><dd class="mt-1">{o.app}</dd></div>
			<div>
				<dt class="text-muted">{m.order.package}</dt>
				<dd class="tabular mt-1">{o.coins.toLocaleString('en')} {m.common.coins}</dd>
			</div>
			<div>
				<dt class="text-muted">{m.order.playerId}</dt>
				<dd class="tabular mt-1">{o.player_id}</dd>
			</div>
			<div>
				<dt class="text-muted">{m.order.country}</dt>
				<dd class="mt-1">{countryName(o.country_code, data.lang)}</dd>
			</div>
			<div>
				<dt class="text-muted">{m.order.total}</dt>
				<dd class="tabular mt-1 text-lg text-gold">{o.amount} {o.currency}</dd>
			</div>
			<div>
				<dt class="text-muted">{m.order.seller}</dt>
				<dd class="mt-1" dir="ltr">{contact.entity}</dd>
			</div>
		</dl>

		<dl class="tabular mt-6 space-y-1 border-t border-edge/60 pt-4 text-xs text-muted">
			<div>{m.order.placed}: {when(o.created_at)}</div>
			{#if o.paid_at}
				<div>
					{m.order.paid}: {when(o.paid_at)} · {m.payment[o.payment_method as PaymentMethod] ??
						o.payment_method}
				</div>
			{/if}
			{#if o.payment_ref}<div>{m.order.paymentRef}: {o.payment_ref}</div>{/if}
			{#if o.delivered_at}<div>{m.order.delivered}: {when(o.delivered_at)}</div>{/if}
		</dl>

		{#if o.note}
			<p class="mt-4 border-s-2 border-edge px-3 text-sm text-muted">{o.note}</p>
		{/if}
	</div>

	{#if o.status === 'awaiting_payment'}
		<div class="facet mt-6 p-6">
			<div>
				<h2 class="font-display text-xl">{m.order.payTitle}</h2>
				<p class="mt-2 text-sm text-muted">{m.order.payBody(`${o.amount} ${o.currency}`, o.ref)}</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<a href={wa} class="bg-gold px-6 py-2 font-semibold text-ink hover:bg-white">
						{m.order.whatsapp}
					</a>
					<a href="tel:{contact.phone}" class="border border-edge px-6 py-2 hover:border-gem">
						{contact.phone}
					</a>
				</div>

				<!-- the same accounts printed on the invoice, so a customer can pay without asking -->
				<div class="mt-6 border-t border-edge/60 pt-4">
					<h3 class="text-sm">{m.order.bankTitle}</h3>
					<p class="mt-1 text-xs text-muted">{m.order.bankNote(o.ref)}</p>
					<div class="mt-3 grid gap-5 sm:grid-cols-3" dir="ltr">
						{#each contact.banks as bank (bank.region)}
							<dl class="text-xs leading-snug">
								<p class="mb-1 font-semibold text-gem">{bank.region}</p>
								{#each bank.rows as [key, value] (key)}
									<div class="mt-1">
										<dt class="text-muted">{key}</dt>
										<dd class:tabular={!key.includes('address')}>{value}</dd>
									</div>
								{/each}
							</dl>
						{/each}
					</div>
				</div>

				<!-- ponytail: the gateway edge. When Stripe keys exist, this button becomes a checkout
				     session redirect and the webhook flips the order to 'paid' instead of the admin. -->
				<p class="mt-6 text-xs text-muted">{m.order.cardSoon}</p>
			</div>
		</div>

		<form method="POST" action="?/cancel" class="mt-4">
			<button class="border border-edge px-6 py-2 text-sm text-muted hover:border-red-400">
				{m.order.cancel}
			</button>
		</form>
	{:else if o.status === 'paid'}
		<p class="facet mt-6 p-6 text-sm"><span>{m.order.paidBanner}</span></p>
	{:else if o.status === 'delivered'}
		<div class="facet mt-6 p-6 text-sm">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<p>{m.order.deliveredBanner(o.player_id)}</p>
				<a
					href="/orders/{o.ref}/invoice"
					class="bg-gold px-6 py-2 font-semibold text-ink hover:bg-white"
				>
					{m.order.invoice}
				</a>
			</div>
		</div>

		<!-- the only place a review can start: a delivered order belonging to the person asking -->
		<div id="review" class="facet mt-4 scroll-mt-24 p-6">
			<div>
				{#if o.review}
					<h2 class="font-display text-xl">{m.reviews.yours}</h2>
					<p class="mt-2"><Stars rating={o.review.rating} /></p>
					{#if o.review.body}<p class="mt-2 text-sm text-muted">{o.review.body}</p>{/if}
				{:else}
					<h2 class="font-display text-xl">{m.reviews.formTitle}</h2>
					<form method="POST" action="?/review" class="mt-3 space-y-3">
						<label class="block max-w-xs">
							<span class="text-sm text-muted">{m.reviews.rating}</span>
							<select name="rating" required class="field mt-1">
								{#each [5, 4, 3, 2, 1] as n (n)}
									<option value={n}>{'★'.repeat(n)} {n}/5</option>
								{/each}
							</select>
						</label>
						<label class="block">
							<span class="text-sm text-muted">{m.reviews.body}</span>
							<textarea name="body" rows="3" maxlength="600" class="field mt-1"></textarea>
						</label>
						<p class="text-xs text-muted">{m.reviews.formNote}</p>
						<button class="bg-gold px-6 py-2 font-semibold text-ink hover:bg-white">
							{m.reviews.submit}
						</button>
					</form>
				{/if}
			</div>
		</div>
	{/if}

	{#if form?.reviewed}
		<p class="mt-4 border-s-2 border-gem bg-gem/10 px-4 py-3 text-sm">{m.reviews.thanks}</p>
	{/if}

	{#if form?.message}
		<p class="mt-4 border-s-2 border-red-400 bg-red-400/10 px-4 py-3 text-sm text-red-300">
			{form.message}
		</p>
	{/if}

	<p class="mt-8 text-xs text-muted">
		<a href="/legal/refund" class="hover:text-white">{m.order.refundPolicy}</a>
		·
		<a href="/legal/delivery" class="hover:text-white">{m.order.deliveryPolicy}</a>
		·
		<a href="/legal/terms" class="hover:text-white">{m.order.terms}</a>
	</p>
</div>

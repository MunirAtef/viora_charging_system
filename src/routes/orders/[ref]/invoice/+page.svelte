<script lang="ts">
	import { contact } from '$lib/contact';
	import { messages } from '$lib/i18n';
	import type { PaymentMethod } from '$lib/orders';
	let { data } = $props();

	const o = $derived(data.order);
	// ISO-ish dates read the same in every locale, which is what an invoice wants
	const day = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-CA') : '—');
	const stamp = (d: string | null) => (d ? new Date(d).toLocaleString('en-GB') : '—');
	const money = $derived((n: string) => `${Number(n).toFixed(2)} ${o.currency}`);
	// the rest of the site names countries in Arabic; an English invoice names them in English
	const regions = new Intl.DisplayNames(['en'], { type: 'region' });
</script>

<svelte:head><title>Invoice {data.order.ref} | Elhawarey Digital</title></svelte:head>

<div class="mx-auto max-w-3xl px-5 py-12 print:max-w-full print:p-0">
	<div class="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
		<a href="/orders/{o.ref}" class="text-sm text-muted hover:text-white">← Order</a>
		<button
			onclick={() => window.print()}
			class="bg-gold px-6 py-2 text-sm font-semibold text-ink hover:bg-white"
		>
			Print invoice
		</button>
	</div>

	<!-- Plain paper, English and LTR: printed as-is, never inheriting the site's dark theme. -->
	<article class="paper bg-white p-6 text-black sm:p-10" dir="ltr">
		<header class="flex flex-wrap items-start justify-between gap-6">
			<div class="flex items-center gap-3">
				<img src="/logo-mark.png" alt="" width="56" height="56" class="h-14 w-14 rounded-full" />
				<div>
					<p class="font-display text-xl tracking-[0.12em]">ELHAWAREY DIGITAL</p>
					<p class="mt-1 text-xs text-neutral-500">Digital services</p>
				</div>
			</div>
			<div class="text-right text-xs leading-relaxed text-neutral-600">
				<p class="font-semibold text-neutral-800">{contact.entity}</p>
				{#each contact.entityAddress as line (line)}
					<p>{line}</p>
				{/each}
				<p>{contact.email}</p>
				<p class="tabular">{contact.phone}</p>
				{#if contact.taxId}
					<p class="tabular">VAT / Company No. {contact.taxId}</p>
				{/if}
			</div>
		</header>

		<section class="mt-8 grid grid-cols-2 gap-6 sm:mt-10 sm:grid-cols-4">
			<div>
				<h2 class="text-sm text-[#0d7a72]">Bill To</h2>
				{#if o.name}<p class="mt-1 text-sm">{o.name}</p>{/if}
				<p class="text-sm break-all text-neutral-600">{o.email ?? '—'}</p>
				<p class="tabular text-sm text-neutral-600">{o.phone}</p>
				<p class="text-sm text-neutral-600">
					{regions.of(o.country_code) ?? o.country_code}
				</p>
			</div>
			<div>
				<h2 class="text-sm text-[#0d7a72]">Date of Issue</h2>
				<p class="tabular mt-1 text-sm">{day(o.delivered_at)}</p>
				<h2 class="mt-3 text-sm text-[#0d7a72]">Order Date</h2>
				<p class="tabular mt-1 text-sm">{day(o.created_at)}</p>
			</div>
			<div>
				<h2 class="text-sm text-[#0d7a72]">Invoice Number</h2>
				<p class="tabular mt-1 text-sm">{o.ref}</p>
			</div>
			<div class="text-right">
				<h2 class="text-sm text-[#0d7a72]">Amount Paid ({o.currency})</h2>
				<p class="tabular mt-1 text-3xl">{Number(o.amount).toFixed(2)}</p>
			</div>
		</section>

		<div class="mt-10 overflow-x-auto">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="border-y border-neutral-300 text-xs text-neutral-500">
					<th class="py-2 text-left font-normal">Description</th>
					<th class="py-2 text-right font-normal">Rate</th>
					<th class="py-2 text-right font-normal">Qty</th>
					<th class="py-2 text-right font-normal">Line Total</th>
				</tr>
			</thead>
			<tbody>
				<tr class="border-b border-neutral-200">
					<td class="py-4">Digital Service</td>
					<td class="tabular py-4 text-right">{money(o.amount)}</td>
					<td class="tabular py-4 text-right">1</td>
					<td class="tabular py-4 text-right">{money(o.amount)}</td>
				</tr>
			</tbody>
		</table>
		</div>

		<div class="mt-4 flex justify-end">
			<dl class="w-64 text-sm">
				<div class="flex justify-between py-1">
					<dt class="text-neutral-600">Subtotal</dt>
					<dd class="tabular">{money(o.amount)}</dd>
				</div>
				<div class="flex justify-between py-1">
					<dt class="text-neutral-600">VAT (0%)</dt>
					<dd class="tabular">{money('0')}</dd>
				</div>
				<div class="mt-1 flex justify-between border-t border-neutral-300 py-2 font-semibold">
					<dt>Total</dt>
					<dd class="tabular">{money(o.amount)}</dd>
				</div>
			</dl>
		</div>

		<section class="mt-10 text-xs leading-relaxed text-neutral-600">
			<h2 class="text-neutral-800">Notes</h2>
			<p class="tabular mt-2">
				Paid by {messages.en.payment[o.payment_method as PaymentMethod] ?? o.payment_method ?? '—'}{#if o.payment_ref}, reference
					{o.payment_ref}{/if} on
				{stamp(o.paid_at)}
			</p>
			<p class="tabular">
				Delivered on {stamp(o.delivered_at)} · account reference {o.player_id}
			</p>
			<p class="mt-2">
				This is a digital service delivered electronically; no physical shipment is involved. The
				price is final in {o.currency} and inclusive of our fees. Refunds are governed by our
				published policy at elhawarey.com/legal/refund. Questions: {contact.email}.
			</p>
			<p class="mt-2">This invoice is issued electronically and is valid without a signature.</p>
		</section>

		<!-- Remittance details; kept on one page so a transfer is never read off a split table. -->
		<section class="bank mt-8 border-t border-neutral-300 pt-4">
			<h2 class="text-xs text-neutral-800">Bank transfer details</h2>
			<div class="mt-3 grid gap-5 sm:grid-cols-3">
				{#each contact.banks as bank (bank.region)}
					<dl class="text-[11px] leading-snug text-neutral-600">
						<p class="mb-1 font-semibold text-[#0d7a72]">{bank.region}</p>
						{#each bank.rows as [key, value] (key)}
							<div class="mt-1">
								<dt class="text-neutral-500">{key}</dt>
								<!-- mono for anything meant to be copied digit by digit -->
								<dd class="text-neutral-800" class:tabular={!key.includes('address')}>
									{value}
								</dd>
							</div>
						{/each}
					</dl>
				{/each}
			</div>
		</section>

		<p class="mt-8 text-center text-xs text-neutral-400">Page 1/1</p>
	</article>
</div>

<style>
	/* The page chrome is stripped globally in app.css. The sheet itself prints exactly as it looks
	   on screen, so it keeps its padding and asks the browser not to drop its colours. */
	.paper {
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}

	.bank {
		break-inside: avoid;
	}
</style>

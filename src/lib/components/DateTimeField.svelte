<script lang="ts">
	import type { Lang } from '$lib/i18n';
	import { parseDateTime } from '$lib/orders';
	let {
		name,
		label,
		lang,
		required = false
	}: { name: string; label: string; lang: Lang; required?: boolean } = $props();

	let value = $state('');

	// digits only, regrouped as the admin types: 140720260930 -> 14/07/2026 09:30
	// ponytail: the caret lands at the end after every keystroke — fine for typing a date in,
	// annoying for editing the middle. A real masked-input library if that ever matters.
	const mask = (raw: string) => {
		const d = raw.replace(/\D/g, '').slice(0, 12);
		const day = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('/');
		const time = [d.slice(8, 10), d.slice(10, 12)].filter(Boolean).join(':');
		return time ? `${day} ${time}` : day;
	};

	// Echo back what was understood, spelled out — the one thing that catches a 07/14 typed the
	// American way, since 14/07 and 07/14 both look plausible in a box.
	const reading = $derived.by(() => {
		const iso = parseDateTime(value);
		return iso
			? new Intl.DateTimeFormat(lang, {
					dateStyle: 'full',
					timeStyle: 'short',
					timeZone: 'UTC'
				}).format(new Date(`${iso}:00Z`))
			: null;
	});
</script>

<label class="block">
	<span class="text-xs text-muted">{label}</span>
	<input
		{name}
		{required}
		bind:value
		oninput={(e) => (value = mask(e.currentTarget.value))}
		dir="ltr"
		inputmode="numeric"
		autocomplete="off"
		placeholder="DD/MM/YYYY HH:mm"
		pattern={String.raw`\d{2}/\d{2}/\d{4} \d{2}:\d{2}`}
		class="field tabular mt-1"
	/>
	<span class="mt-1 block text-xs {reading ? 'text-gem' : 'text-muted'}">
		{reading ?? (value ? '—' : '')}
	</span>
</label>

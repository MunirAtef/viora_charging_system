<script lang="ts">
	import { t, type Lang } from '$lib/i18n';
	import { parseDateTime } from '$lib/orders';
	let {
		name,
		label,
		lang,
		required = false
	}: { name: string; label: string; lang: Lang; required?: boolean } = $props();

	const m = $derived(t(lang).datetime);

	let value = $state('');
	let open = $state(false);
	let box = $state<HTMLElement>();

	const pad = (n: number) => String(n).padStart(2, '0');
	const now = new Date();
	const today = { y: now.getFullYear(), mo: now.getMonth(), d: now.getDate() };

	// what is in the box right now, as numbers — null while it is still half-typed
	const picked = $derived.by(() => {
		const iso = parseDateTime(value);
		if (!iso) return null;
		const [y, mo, d, h, mi] = iso.split(/[-T:]/).map(Number);
		return { y, mo: mo - 1, d, h, mi };
	});

	// the month on screen; it follows the picked date but can be browsed away from it
	let view = $state({ y: today.y, mo: today.mo });

	const base = () => picked ?? { ...today, h: 12, mi: 0 };
	const set = (y: number, mo: number, d: number, h: number, mi: number) =>
		(value = `${pad(d)}/${pad(mo + 1)}/${y} ${pad(h)}:${pad(mi)}`);
	const setDay = (d: number) => set(view.y, view.mo, d, base().h, base().mi);
	const setTime = (h: number, mi: number) => {
		const b = base();
		set(b.y, b.mo, b.d, h, mi);
	};

	// typing still works, and formats itself: 140720260930 -> 14/07/2026 09:30
	// ponytail: the caret lands at the end after each keystroke — fine for typing a date in,
	// awkward for editing the middle. The calendar is there for everyone else.
	const mask = (raw: string) => {
		const d = raw.replace(/\D/g, '').slice(0, 12);
		const day = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean).join('/');
		const time = [d.slice(8, 10), d.slice(10, 12)].filter(Boolean).join(':');
		return time ? `${day} ${time}` : day;
	};

	const toggle = () => {
		open = !open;
		if (open && picked) view = { y: picked.y, mo: picked.mo };
	};

	const shift = (by: number) => {
		const mo = view.mo + by;
		view = { y: view.y + Math.floor(mo / 12), mo: ((mo % 12) + 12) % 12 };
	};

	// Arabic weeks start on Saturday, English ones on Sunday; 7 Jan 2024 was a Sunday
	const weekStart = $derived(lang === 'ar' ? 6 : 0);
	const weekdays = $derived(
		Array.from({ length: 7 }, (_, i) =>
			new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(
				new Date(Date.UTC(2024, 0, 7 + ((weekStart + i) % 7)))
			)
		)
	);
	const months = $derived(
		Array.from({ length: 12 }, (_, i) =>
			new Intl.DateTimeFormat(lang, { month: 'long' }).format(new Date(Date.UTC(2024, i, 1)))
		)
	);
	const years = Array.from({ length: 12 }, (_, i) => today.y - 10 + i);

	const grid = $derived({
		blank: (new Date(view.y, view.mo, 1).getDay() - weekStart + 7) % 7,
		days: new Date(view.y, view.mo + 1, 0).getDate()
	});

	// spelled out, to catch a 07/14 typed the American way — both orderings look plausible as digits
	const reading = $derived(
		picked
			? new Intl.DateTimeFormat(lang, {
					dateStyle: 'full',
					timeStyle: 'short',
					timeZone: 'UTC'
				}).format(new Date(Date.UTC(picked.y, picked.mo, picked.d, picked.h, picked.mi)))
			: null
	);
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (open = false)} />
<svelte:document
	onclick={(e) => {
		if (open && box && !box.contains(e.target as Node)) open = false;
	}}
/>

<div class="block" bind:this={box}>
	<span class="text-xs text-muted">{label}</span>
	<div class="relative mt-1 flex">
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
			class="field tabular"
		/>
		<button
			type="button"
			onclick={toggle}
			aria-label={m.calendar}
			aria-expanded={open}
			class="border border-s-0 border-edge px-3 text-muted hover:border-gem hover:text-gem"
		>
			<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" fill="none">
				<rect x="2" y="3.5" width="14" height="12" stroke="currentColor" stroke-width="1.4" />
				<path d="M2 7h14M6 2v3M12 2v3" stroke="currentColor" stroke-width="1.4" />
			</svg>
		</button>

		{#if open}
			<div
				class="absolute end-0 top-full z-30 mt-1 w-[20rem] border border-edge bg-plum p-3 shadow-2xl"
			>
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={() => shift(-1)}
						aria-label={m.prevMonth}
						class="border border-edge px-2 py-1 text-muted hover:border-gem hover:text-gem">‹</button
					>
					<select bind:value={view.mo} class="field flex-1 px-2 py-1 text-sm">
						{#each months as month, i (month)}
							<option value={i}>{month}</option>
						{/each}
					</select>
					<select bind:value={view.y} class="field tabular w-24 px-2 py-1 text-sm">
						{#each years as year (year)}
							<option value={year}>{year}</option>
						{/each}
					</select>
					<button
						type="button"
						onclick={() => shift(1)}
						aria-label={m.nextMonth}
						class="border border-edge px-2 py-1 text-muted hover:border-gem hover:text-gem">›</button
					>
				</div>

				<div class="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
					{#each weekdays as day (day)}<span>{day}</span>{/each}
				</div>
				<div class="mt-1 grid grid-cols-7 gap-1">
					{#each Array(grid.blank) as _, i (i)}<span></span>{/each}
					{#each Array(grid.days) as _, i (i)}
						{@const day = i + 1}
						{@const on = picked?.d === day && picked.mo === view.mo && picked.y === view.y}
						{@const isToday = today.d === day && today.mo === view.mo && today.y === view.y}
						<button
							type="button"
							onclick={() => setDay(day)}
							class="tabular py-1.5 text-sm hover:bg-edge {on
								? 'bg-gem font-semibold text-ink'
								: isToday
									? 'text-gold'
									: ''}"
						>
							{day}
						</button>
					{/each}
				</div>

				<div class="mt-3 flex items-center gap-2 border-t border-edge/60 pt-3">
					<select
						value={base().h}
						onchange={(e) => setTime(Number(e.currentTarget.value), base().mi)}
						aria-label={m.hour}
						class="field tabular w-20 px-2 py-1 text-sm"
					>
						{#each Array(24) as _, h (h)}<option value={h}>{pad(h)}</option>{/each}
					</select>
					<span class="text-muted">:</span>
					<select
						value={base().mi}
						onchange={(e) => setTime(base().h, Number(e.currentTarget.value))}
						aria-label={m.minute}
						class="field tabular w-20 px-2 py-1 text-sm"
					>
						{#each Array(60) as _, mi (mi)}<option value={mi}>{pad(mi)}</option>{/each}
					</select>
					<button
						type="button"
						onclick={() => set(today.y, today.mo, today.d, now.getHours(), now.getMinutes())}
						class="border border-edge px-3 py-1 text-xs text-muted hover:border-gem hover:text-gem"
						>{m.now}</button
					>
					<button
						type="button"
						onclick={() => (open = false)}
						class="ms-auto bg-gold px-3 py-1 text-xs font-semibold text-ink hover:bg-white"
						>{m.done}</button
					>
				</div>
			</div>
		{/if}
	</div>
	<span class="mt-1 block text-xs {reading ? 'text-gem' : 'text-muted'}">
		{reading ?? (value ? '—' : '')}
	</span>
</div>

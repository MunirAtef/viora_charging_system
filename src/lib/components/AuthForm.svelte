<script lang="ts">
	import { t, type Lang } from '$lib/i18n';
	let {
		lang,
		title,
		cta,
		hint,
		withName = false,
		altText,
		altHref,
		form
	}: {
		lang: Lang;
		title: string;
		cta: string;
		hint?: string;
		withName?: boolean;
		altText: string;
		altHref: string;
		form: { email?: string; name?: string; message?: string } | null;
	} = $props();

	const m = $derived(t(lang));
</script>

<div class="mx-auto max-w-md px-5 py-16">
	<h1 class="font-display text-3xl">{title}</h1>

	<form method="POST" class="facet mt-6 p-6">
		<div class="space-y-4">
			{#if withName}
				<label class="block">
					<span class="text-sm text-muted">{m.auth.name}</span>
					<input
						name="name"
						required
						minlength="2"
						maxlength="60"
						placeholder={m.auth.namePlaceholder}
						value={form?.name ?? ''}
						class="field mt-1"
					/>
				</label>
			{/if}
			<label class="block">
				<span class="text-sm text-muted">{m.auth.email}</span>
				<input
					name="email"
					type="email"
					required
					dir="ltr"
					value={form?.email ?? ''}
					class="field mt-1"
				/>
			</label>
			<label class="block">
				<span class="text-sm text-muted">{m.auth.password}</span>
				<input name="password" type="password" required dir="ltr" class="field mt-1" />
				{#if hint}<span class="mt-1 block text-xs text-muted">{hint}</span>{/if}
			</label>

			{#if form?.message}
				<p class="border-s-2 border-red-400 bg-red-400/10 px-3 py-2 text-sm text-red-300">
					{form.message}
				</p>
			{/if}

			<button class="w-full bg-gold py-3 font-semibold text-ink hover:bg-white">{cta}</button>
			<p class="text-center text-sm text-muted">
				<a href={altHref} class="text-gem hover:text-white">{altText}</a>
			</p>
		</div>
	</form>
</div>

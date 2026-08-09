<script lang="ts">
	import AuthForm from '$lib/components/AuthForm.svelte';
	import { t } from '$lib/i18n';
	let { data, form } = $props();
	const m = $derived(t(data.lang));
</script>

<svelte:head><title>{m.auth.register} | Elhawarey Digital</title></svelte:head>

<AuthForm
	lang={data.lang}
	title={m.auth.register}
	cta={m.auth.registerCta}
	hint={m.auth.hint}
	withName
	altText={m.auth.haveAccount}
	altHref="/login"
	{form}
/>

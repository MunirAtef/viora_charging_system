<script lang="ts">
	import AuthForm from '$lib/components/AuthForm.svelte';
	import { t } from '$lib/i18n';
	let { data, form } = $props();
	const m = $derived(t(data.lang));
</script>

<svelte:head><title>{m.auth.login} | Elhawarey Digital</title></svelte:head>

<AuthForm
	lang={data.lang}
	title={m.auth.login}
	cta={m.auth.login}
	altText={m.auth.noAccount}
	altHref="/register"
	{form}
/>

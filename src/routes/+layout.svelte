<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { data, children } = $props();
</script>

<div class="flex min-h-screen flex-col print:block print:min-h-0">
	<Header user={data.user} lang={data.lang} />
	<main class="flex-1">{@render children()}</main>
	<Footer user={data.user} lang={data.lang} />
</div>

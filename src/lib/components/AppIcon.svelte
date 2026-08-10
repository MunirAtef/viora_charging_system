<script lang="ts">
	import imo from '$lib/assets/imo.png';

	// apps the admin adds later have no artwork, so they keep the initial as a placeholder
	const icons: Record<string, string> = { imo };

	let { slug, name, size = 32 }: { slug: string; name: string; size?: number } = $props();
</script>

{#if icons[slug]}
	<img src={icons[slug]} alt="" width={size} height={size} style="width:{size}px;height:{size}px" />
{:else}
	<span class="tabular grid place-items-center" style="width:{size}px;height:{size}px">
		{name.slice(0, 1)}
	</span>
{/if}

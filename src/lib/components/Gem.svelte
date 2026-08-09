<script lang="ts">
	let { size = 28, class: cls = '' }: { size?: number; class?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	aria-hidden="true"
	class={cls}
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linejoin="round"
>
	<path d="M8 4h16l6 8-14 17L2 12z" />
	<path d="M2 12h28M14 4l-6 8 8 17 8-17-6-8" opacity=".5" />
</svg>

<script lang="ts">
	let { rating, label }: { rating: number; label?: string } = $props();
</script>

<span class="text-gold" dir="ltr" aria-label={label ?? `${rating}/5`}>
	<span aria-hidden="true">{'★'.repeat(rating)}<span class="text-edge">{'★'.repeat(5 - rating)}</span
		></span>
</span>

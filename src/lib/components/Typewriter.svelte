<script lang="ts">
	let {
		phrases,
		speed = 70,
		pause = 1800
	}: { phrases: string[]; speed?: number; pause?: number } = $props();

	// null = the loop has not started, so the server-rendered heading is the full first phrase
	let typed = $state<string | null>(null);
	const shown = $derived(typed ?? phrases[0] ?? '');

	$effect(() => {
		// motion is decoration: if the reader asked for less of it, the first phrase just sits there
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let phrase = 0;
		let length = phrases[0].length;
		let typing = false;
		let timer: ReturnType<typeof setTimeout>;

		const tick = () => {
			length += typing ? 1 : -1;
			typed = phrases[phrase].slice(0, length);

			let next = typing ? speed : speed / 2;
			if (!typing && length === 0) {
				phrase = (phrase + 1) % phrases.length;
				typing = true;
				next = 320;
			} else if (typing && length === phrases[phrase].length) {
				typing = false;
				next = pause;
			}
			timer = setTimeout(tick, next);
		};

		timer = setTimeout(tick, pause);
		return () => clearTimeout(timer);
	});
</script>

<!-- the loop would make a screen reader re-read the heading on every keystroke, so it reads the
     full first phrase once instead -->
<span aria-hidden="true">{shown}<span class="caret">‌</span></span>
<span class="sr-only">{phrases[0]}</span>

<style>
	.caret {
		border-inline-start: 2px solid currentColor;
		margin-inline-start: 2px;
		animation: blink 1s steps(1) infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.caret {
			display: none;
		}
	}
</style>

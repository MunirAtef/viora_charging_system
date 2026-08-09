<script lang="ts">
	import { t } from '$lib/i18n';
	let { data } = $props();
</script>

<!-- POST-only route; the default action always redirects. -->
<p class="p-10 text-center text-muted">{t(data.lang).auth.loggingOut}</p>

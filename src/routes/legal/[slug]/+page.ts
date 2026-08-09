import { error } from '@sveltejs/kit';
import { UPDATED, doc } from '$lib/legal';
import { t } from '$lib/i18n';

export async function load({ params, parent }) {
	const { lang } = await parent();
	const page = doc(lang, params.slug);
	if (!page) error(404, t(lang).errors.notFound);
	return { doc: page, updated: UPDATED };
}

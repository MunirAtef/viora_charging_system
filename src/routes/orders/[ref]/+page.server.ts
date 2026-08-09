import { error, fail, redirect } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import { t } from '$lib/i18n';

const find = async (ref: string, user: App.Locals['user'], notFound: string) => {
	const mine = user!.role === 'admin' ? sql`` : sql`and o.user_id = ${user!.id}`;
	const [order] = await sql`
		select o.id, o.ref, o.player_id, o.phone, o.amount, o.currency, o.status, o.created_at,
		       o.paid_at, o.delivered_at, o.payment_method, o.payment_ref, o.note,
		       q.coins, c.code as country_code, a.name as app,
		       (select json_build_object('rating', v.rating, 'body', v.body)
		        from reviews v where v.order_id = o.id) as review
		from orders o
		join quotas q on q.id = o.quota_id
		join countries c on c.id = o.country_id
		join apps a on a.id = o.app_id
		where o.ref = ${ref} ${mine}`;
	if (!order) error(404, notFound);
	return order;
};

export async function load({ params, locals }) {
	if (!locals.user) redirect(303, `/login?next=/orders/${params.ref}`);
	return { order: await find(params.ref, locals.user, t(locals.lang).errors.orderMissing) };
}

export const actions = {
	// a rating can only come from a delivered order, and only once — that link is what makes the
	// numbers on the home page mean anything
	review: async ({ request, params, locals }) => {
		const e = t(locals.lang).errors;
		if (!locals.user) return fail(401, { message: e.loginToOrder });
		const f = await request.formData();
		const rating = Number(f.get('rating'));
		const body = String(f.get('body') ?? '').trim().slice(0, 600);
		if (!Number.isInteger(rating) || rating < 1 || rating > 5)
			return fail(400, { message: e.badRating });

		const [saved] = await sql`
			insert into reviews (user_id, order_id, rating, body)
			select o.user_id, o.id, ${rating}, ${body || null}
			from orders o
			where o.ref = ${params.ref} and o.user_id = ${locals.user.id} and o.status = 'delivered'
			on conflict (order_id) do nothing
			returning id`;
		if (!saved) return fail(400, { message: e.reviewNotAllowed });
		return { reviewed: true };
	},

	// self-service cancel while nothing has been paid or delivered
	cancel: async ({ params, locals }) => {
		const e = t(locals.lang).errors;
		if (!locals.user) return fail(401, { message: e.loginToOrder });
		const [done] = await sql`
			update orders set status = 'cancelled'
			where ref = ${params.ref} and user_id = ${locals.user.id} and status = 'awaiting_payment'
			returning id`;
		if (!done) return fail(400, { message: e.cannotCancel });
	}
};

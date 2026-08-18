// The order lifecycle. Labels live in $lib/i18n so they can be shown in either language.
export const STATUSES = [
	'awaiting_payment',
	'paid',
	'delivered',
	'refunded',
	'cancelled'
] as const;

export type Status = (typeof STATUSES)[number];

// Allowed moves. A payment gateway would drive awaiting_payment -> paid from its webhook;
// today the admin confirms the transfer by hand, so the same edge is a button.
export const NEXT: Record<Status, Status[]> = {
	awaiting_payment: ['paid', 'cancelled'],
	paid: ['delivered', 'refunded'],
	delivered: ['refunded'],
	refunded: [],
	cancelled: []
};

// stored as codes so the same order reads correctly in both languages
export const PAYMENT_METHODS = ['bank', 'wallet', 'card', 'cash'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const isStatus = (s: string): s is Status => STATUSES.includes(s as Status);
export const isPaymentMethod = (s: string): s is PaymentMethod =>
	PAYMENT_METHODS.includes(s as PaymentMethod);

// Dates are typed into the admin console as DD/MM/YYYY HH:mm, the way they are written here.
// Returns the ISO the database reads, or null — 31/02 and 25:00 come back null because a real
// date is one that survives the round trip unchanged.
export const parseDateTime = (v: string) => {
	const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(v.trim());
	if (!m) return null;
	const iso = `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}`;
	const at = new Date(`${iso}:00Z`);
	return !isNaN(at.valueOf()) && at.toISOString().slice(0, 16) === iso ? iso : null;
};

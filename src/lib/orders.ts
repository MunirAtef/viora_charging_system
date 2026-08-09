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

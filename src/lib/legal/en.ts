// The policy pages a payment gateway looks for before it approves a merchant.
// Reviewed by a lawyer before launch — this wording is a starting draft, not legal advice.
export default {
	about: {
		title: 'About us',
		intro:
			'Elhawarey Digital is an in-app top-up service. We sell coin packages to users of social and live-streaming apps, priced directly in the buyer’s local currency.',
		sections: [
			{
				h: 'What exactly we sell',
				p: [
					'We sell coin packages that are credited straight to the customer’s account inside a supported app, such as IMO. The product is entirely digital; nothing is shipped.',
					'The customer picks the app, then their country so prices appear in their own currency, then the package, and gives us the ID of their account inside the app. We credit that ID once payment is confirmed.'
				]
			},
			{
				h: 'How we work',
				p: [
					'We operate as an authorised top-up agent: we buy balance wholesale and resell it retail to our customers. The business started on social platforms, and this site is the official channel for managing orders, with a reference number and an invoice for every transaction.',
					'Every order is recorded against the account that placed it, and the customer can follow its status at any moment from the “My account” page.'
				]
			},
			{
				h: 'Operating entities',
				p: [
					'The service is operated through the registered entities listed in the site footer. The contracting entity for each order is named on that order’s invoice, and depends on the customer’s country and payment method.'
				]
			},
			{
				h: 'Our relationship with the apps',
				p: [
					'Elhawarey Digital is independent and is neither owned by nor affiliated with any of the apps mentioned. All names and trademarks belong to their owners and are used only to identify the app being topped up.'
				]
			}
		]
	},

	delivery: {
		title: 'Delivery policy',
		intro:
			'Everything we sell is digital and delivered inside the app, straight to the ID the customer provides. There is no postal shipping and no delivery fee.',
		sections: [
			{
				h: 'How long it takes',
				p: [
					'Delivery begins as soon as payment is confirmed. Coins normally arrive within one or two minutes, and within 24 hours at the very most if an order needs additional verification.',
					'Our support runs 24 hours a day, every day, so there is no waiting for opening hours.'
				]
			},
			{
				h: 'Getting the ID right',
				p: [
					'Entering the correct ID is the customer’s responsibility. Check the number before confirming the order — once coins are credited to an ID they cannot be withdrawn or moved.',
					'If the ID does not exist or is rejected by the app, we contact the customer to correct it. If it cannot be corrected within 7 days, the amount is refunded in full.'
				]
			},
			{
				h: 'Confirming delivery',
				p: [
					'When the top-up completes, the order status changes to “Delivered” with the time it happened, and the invoice stays available in the customer’s account as permanent proof.',
					'If the balance has not appeared in the app within an hour of that status change, contact us with the order reference straight away.'
				]
			},
			{
				h: 'Delays',
				p: [
					'Delivery can be delayed by things outside our control, such as an app outage or maintenance. We notify the customer, who may cancel and be refunded in full as long as the coins have not yet been credited.'
				]
			}
		]
	},

	refund: {
		title: 'Refund and cancellation policy',
		intro:
			'Any order can be cancelled and refunded in full while the coins have not yet been credited. Once they are credited, the digital product has been consumed and cannot be returned except in the cases below.',
		sections: [
			{
				h: 'Before delivery — full refund',
				p: [
					'While the order status is “Awaiting payment” or “Paid — in progress”, the customer can cancel it from the order page or by contacting us, and the full amount is refunded with no fees.'
				]
			},
			{
				h: 'After delivery',
				p: [
					'Coins cannot be recovered once they are actually credited to an ID, because they are consumed inside the app and cannot be withdrawn.',
					'The exception: if the customer shows the balance never arrived despite the status reading “Delivered”, we review the record with our supplier and either deliver again or refund in full.',
					'An ID entered incorrectly by the customer is not grounds for a refund once the coins have reached that ID, because the transaction technically completed successfully.'
				]
			},
			{
				h: 'Time limit',
				p: [
					'Refund requests should be made within 14 days of the order date, quoting the order reference (ELH-…) and the payment details.'
				]
			},
			{
				h: 'How the money comes back',
				p: [
					'Refunds go back to the original payment method in the original currency. We start the process within two working days of accepting the request; it can take 5 to 10 working days to arrive depending on the bank or payment provider.',
					'We do not charge any administrative fee on refunds.'
				]
			},
			{
				h: 'Before opening a bank dispute',
				p: [
					'Please contact us first — most cases are resolved within hours, and support is available around the clock. Opening a chargeback before contacting us may suspend the account until the bank’s process ends, and we reserve the right to submit the order record and proof of delivery to the payment provider.'
				]
			}
		]
	},

	terms: {
		title: 'Terms and conditions',
		intro:
			'By using the Elhawarey Digital site or placing any order on it, you agree to these terms. If you do not agree, please do not use the service.',
		sections: [
			{
				h: 'Eligibility and account',
				p: [
					'You must be 18 or older, or use the service with the consent and under the responsibility of a guardian.',
					'You are responsible for the accuracy of the details you enter (email, phone, in-app ID), for keeping your login details confidential, and for everything done through your account.'
				]
			},
			{
				h: 'Prices and payment',
				p: [
					'Prices are shown in the local currency of the country the customer selects and include all of our fees. Any tax or fee imposed by a bank or payment provider is the customer’s responsibility.',
					'Each order is an offer to buy from you; the contract is formed only when we confirm payment and begin delivery. We may refuse an order or correct a mistakenly published price before delivery, refunding any amount paid in full.',
					'Prices may change at any time; a change never applies to an order already confirmed.'
				]
			},
			{
				h: 'Prohibited use',
				p: [
					'Using a payment method that is not yours or is stolen, supplying false information, or using the service for money laundering, fraud or any unlawful purpose is prohibited.',
					'Commercial resale of our packages without a written agreement with us is prohibited.',
					'Breaching the above means orders are cancelled, the account is suspended, and legal action may follow.'
				]
			},
			{
				h: 'Limitation of liability',
				p: [
					'We undertake to deliver what was purchased as described in the delivery policy. We are not responsible for the app’s own policies — such as suspending a customer’s account, changing the value of its in-app currency, or removing a balance for reasons of its own.',
					'Our liability is in all cases limited to the value of the order in dispute.'
				]
			},
			{
				h: 'Trademarks',
				p: [
					'Elhawarey Digital is not affiliated with or endorsed by any of the supported apps beyond the scope of supply agreements, and all trademarks belong to their owners.'
				]
			},
			{
				h: 'Changes and governing law',
				p: [
					'We may amend these terms; an amendment takes effect from the date it is published on this page and does not affect an earlier order.',
					'These terms are governed by the law of the country in which the contracting entity named on the invoice is established, without prejudice to the mandatory consumer rights of the customer’s country of residence.'
				]
			}
		]
	},

	privacy: {
		title: 'Privacy policy',
		intro:
			'We collect as little data as possible and use it only to fulfil orders and protect customers from fraud. We do not sell your data to anyone.',
		sections: [
			{
				h: 'What we collect',
				p: [
					'Account data: your email address and a hashed password (we store only its fingerprint and cannot read it).',
					'Order data: phone number, in-app ID, country, package, amount and currency, and the order’s status history.',
					'Limited technical data for the login session. We never store card numbers — card details are entered directly with the payment provider and never pass through our servers.'
				]
			},
			{
				h: 'Why we use it',
				p: [
					'To fulfil and evidence the order, to contact you about it, to meet anti-fraud and anti-money-laundering requirements, and to keep the financial records the law requires.'
				]
			},
			{
				h: 'Who we share it with',
				p: [
					'The payment provider, as far as needed to complete the transaction or answer a bank dispute.',
					'The supplier or app, which receives only the in-app ID and the package value.',
					'Official authorities where there is a legal obligation. Beyond that we share your data with no one.'
				]
			},
			{
				h: 'Retention and your rights',
				p: [
					'We keep order records and invoices for the period financial law requires (up to 7 years) and delete everything else when an account is closed.',
					'You may request a copy of your data, ask us to correct it, or delete your account by emailing support; we respond within 30 days.'
				]
			},
			{
				h: 'Cookies and security',
				p: [
					'We use one cookie that is necessary to keep you logged in, one that remembers your language choice, and no advertising trackers.',
					'The connection to the site is encrypted, and access to order data is limited to support staff on a need-to-know basis. The service is not directed at anyone under 18.'
				]
			}
		]
	},

	kyc: {
		title: 'Know your customer & anti-money-laundering',
		intro:
			'We are committed to preventing the service being used for money laundering, financing unlawful activity, or passing stolen payments, and we verify in proportion to the size and pattern of an order.',
		sections: [
			{
				h: 'When we ask for identity verification',
				p: [
					'When an order, or a customer’s orders over 30 days, exceeds a set threshold, or when the pattern is unusual: rapid repetition, frequently changing the ID or payment method, or declined payment attempts.',
					'What we normally ask for: a valid government ID, and proof of ownership of the payment method (with digits masked except the last four).'
				]
			},
			{
				h: 'Third-party payments',
				p: [
					'We do not accept payment from an account or card that does not belong to the person placing the order. Any such order is cancelled and the money returned to its source.'
				]
			},
			{
				h: 'Our right to refuse',
				p: [
					'We may suspend or refuse any order or account, without detailed explanation, where verification is not possible or fraud indicators appear, refunding any amount for which no top-up was delivered.',
					'We screen against international sanctions lists where required and do not deal with sanctioned countries or persons.'
				]
			},
			{
				h: 'Records and reporting',
				p: [
					'We keep a record of every transaction and of verification documents for the legally required period, and report to the competent authorities where a suspicion obliges us to, in line with the rules applying to the contracting entity.'
				]
			}
		]
	}
};

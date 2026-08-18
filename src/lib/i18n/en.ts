// English is the default and the source of truth for the message shape; ar.ts must mirror it.
export default {
	dir: 'ltr',
	langName: 'العربية', // label of the *other* language, shown on the switcher
	nav: {
		apps: 'Apps',
		packages: 'Packages',
		contact: 'Contact',
		account: 'My account',
		dashboard: 'Dashboard',
		orders: 'Orders',
		login: 'Log in',
		register: 'Create account',
		logout: 'Log out',
		menu: 'Menu'
	},
	common: {
		coins: 'coins',
		save: 'Save',
		remove: 'Remove',
		add: 'Add',
		enabled: 'Enabled',
		disabled: 'Disabled',
		back: 'Back',
		arrow: '←',
		none: '—'
	},
	home: {
		title: 'Elhawarey Digital — top up your apps in your own currency',
		heading: 'Top up your app balance in your currency.',
		promises: [
			'Delivered in one or two minutes.',
			'Prices in your local currency.',
			'A proper invoice with every order.',
			'Support around the clock, every day.'
		],
		blurb:
			'Official coin packages for social and live-streaming apps, priced directly in your country’s currency — no conversion, no surprises at checkout.',
		appsTitle: 'Supported apps',
		appsNote: 'More apps are added regularly.',
		available: 'Available now',
		soon: 'Coming soon',
		noApps: 'No apps have been added yet.',
		countriesTitle: 'Choose your country',
		countriesNote: 'So prices show in your local currency.',
		noCountries: 'No countries are available right now.',
		packagesTitle: 'Packages',
		packagesNote: 'Pick your country above to see prices in your currency.',
		howTitle: 'How it works',
		steps: [
			{
				h: 'Pick a package',
				p: 'Choose the app and your country, then enter the ID of your account inside the app.'
			},
			{
				h: 'Pay securely',
				p: 'You get an order reference and an invoice for the final amount in your currency, then pay with the method available in your country.'
			},
			{
				h: 'Get your coins',
				p: 'We credit your account within one or two minutes, and you can follow the status on the order page.'
			}
		],
		howNote: 'Nothing is charged before you confirm, and an order can be cancelled free of charge before it is delivered —',
		howNoteLink: 'refund policy',
		contactTitle: 'Contact us',
		phone: 'Phone / WhatsApp',
		email: 'Email',
		offices: 'Our offices',
		hours: 'Support hours',
		faqTitle: 'Before you ask',
		faq: [
			{ href: '/legal/delivery', text: 'How long do the coins take to arrive?' },
			{ href: '/legal/refund', text: 'Can I cancel and get a refund?' },
			{ href: '/legal/kyc', text: 'When do you ask for identity verification?' },
			{ href: '/legal/about', text: 'Who is behind Elhawarey Digital?' }
		]
	},
	buy: {
		title: (app: string, country: string) => `Top up ${app} — ${country}`,
		changeCountry: 'Change country',
		mustLogIn: 'You need to be logged in to order.',
		login: 'Log in',
		or: 'or',
		register: 'create an account',
		step1: (app: string) => `Your ${app} account`,
		playerId: 'Your ID inside the app',
		phone: 'Phone number for contact',
		idWarning:
			'Double-check the ID — the coins go to the account carrying that number and cannot be pulled back.',
		step2: 'Choose a package',
		noPackages: 'No packages are available for this country yet.',
		step3: 'Confirm your order',
		totalIs: 'Total',
		chooseFirst: 'Pick a package to see the total.',
		pay: 'Continue to payment',
		agree: 'I agree to the',
		terms: 'Terms & Conditions',
		and: 'and the',
		refund: 'Refund Policy',
		agreeTail: ', and confirm the ID I entered is correct.',
		finalPrice: (currency: string) =>
			`Final price in ${currency}, all our fees included · delivered in the app within one or two minutes (`,
		deliveryPolicy: 'delivery policy',
		payLater: ') · you pay on the next step.'
	},
	order: {
		title: (ref: string) => `Order ${ref}`,
		backToOrders: 'My orders',
		app: 'App',
		package: 'Package',
		playerId: 'Player ID',
		country: 'Country',
		total: 'Total',
		seller: 'Seller',
		placed: 'Ordered',
		paid: 'Payment confirmed',
		paymentRef: 'Payment reference',
		delivered: 'Delivered',
		payTitle: 'Complete your payment',
		payBody: (amount: string, ref: string) =>
			`Amount due ${amount}. Send it with the method available in your country, quoting order ${ref}; we confirm within minutes and delivery starts.`,
		whatsapp: 'Send payment details on WhatsApp',
		bankTitle: 'Bank transfer',
		bankNote: (ref: string) =>
			`Pick the account closest to your country and put order ${ref} in the reference field so we can match your payment immediately.`,
		cardSoon: 'Card payment — coming soon',
		noCharge:
			'No coins are delivered before payment is confirmed, and you can cancel free of charge until then.',
		cancel: 'Cancel order',
		paidBanner:
			'We received your payment and your coins are being delivered now — usually one or two minutes.',
		deliveredBanner: (id: string) =>
			`The coins were delivered to ID ${id}. If they do not show up within an hour, contact us with the order reference.`,
		invoice: 'Invoice',
		refundPolicy: 'Refund policy',
		deliveryPolicy: 'Delivery policy',
		terms: 'Terms & Conditions'
	},
	account: {
		title: 'My account',
		pushLabel: 'Order status notifications',
		myOrders: 'My orders',
		empty: 'You have no orders yet.',
		start: 'Start here'
	},
	auth: {
		name: 'Full name',
		namePlaceholder: 'As it appears on your payment method',
		email: 'Email',
		password: 'Password',
		login: 'Log in',
		register: 'Create account',
		registerCta: 'Create my account',
		hint: 'At least 8 characters',
		noAccount: 'No account yet? Create one',
		haveAccount: 'Already have an account? Log in',
		loggingOut: 'Logging out…'
	},
	push: {
		on: 'Enabled on this device — you get a notification when orders change.',
		denied:
			'Notifications are blocked for this site in your browser settings. Allow them there, then try again.',
		off: 'Turn them on to get an instant notification even after you close the page.',
		delivered: (ref: string) => `Order ${ref} delivered`,
		ratePrompt: 'Your coins are in. Tap to rate the order — it takes a second.',
		enable: 'Enable notifications',
		disable: 'Turn off'
	},
	footer: {
		blurb:
			'Instant top-ups for in-app currencies, priced in your own currency. Pick a package and we credit your account within minutes.',
		links: 'Links',
		policies: 'Policies',
		contact: 'Contact',
		myOrders: 'My orders',
		orders: 'Orders',
		rights: 'All rights reserved',
		disclaimer:
			'Prices are shown in the local currency of the selected country · Elhawarey Digital is not affiliated with any of the apps mentioned; all trademarks belong to their owners.'
	},
	reviews: {
		title: 'What our customers say',
		completed: (n: string) => `${n} top-ups delivered`,
		note: (n: number, avg: string) => `${avg} out of 5 from verified purchases`,
		empty: 'No reviews yet — every order can leave one once it is delivered.',
		verified: 'Verified purchase',
		formTitle: 'Rate your order',
		formNote: 'Only your first name and country are shown next to your review.',
		rating: 'Rating',
		body: 'Your review (optional)',
		submit: 'Publish review',
		thanks: 'Thanks — your review is live.',
		yours: 'Your review'
	},
	status: {
		awaiting_payment: 'Awaiting payment',
		paid: 'Paid — in progress',
		delivered: 'Delivered',
		refunded: 'Refunded',
		cancelled: 'Cancelled'
	},
	payment: {
		bank: 'Bank transfer',
		wallet: 'E-wallet',
		card: 'Card',
		cash: 'Cash'
	},
	admin: {
		title: 'Dashboard',
		ordersLink: 'Orders & payments',
		pushLabel: 'New order notifications',
		appsTitle: 'Apps',
		appsNote:
			'An enabled app is visible and orderable; a disabled one shows on the home page as “coming soon”.',
		appName: 'App name',
		appSlug: 'URL slug',
		packages: (n: number) => `${n} packages`,
		countriesTitle: 'Countries',
		countriesNote: 'Each country has its own page: every app’s packages priced in its currency.',
		addCountry: 'Add a country',
		pickCountry: '— pick a country —',
		prices: (n: number) => `${n} prices`,
		openOrders: (n: number) => `${n} open orders`,
		noCountries: 'No countries added yet.',
		accountsTitle: 'Accounts',
		accountsNote: 'The admin confirms payment and delivers from the orders page.',
		roles: { user: 'Customer', admin: 'Admin' },
		country: {
			back: 'All countries',
			pricesTitle: 'Packages and prices',
			pricesNote: (currency: string) =>
				`Prices are in ${currency} — completely independent of every other country. A package with no price is not sold here.`,
			coins: 'Coins',
			price: (currency: string) => `Price ${currency}`,
			oldPrice: 'Before discount',
			addTo: (app: string) => `Add a package to ${app}`,
			noPackages: 'No packages for this app yet — add one above.',
			notSold: 'not sold',
			ordersTitle: 'Orders from this country',
			noOrders: 'No orders yet.'
		},
		orders: {
			title: 'Orders & payments',
			all: 'All',
			update: 'Update status',
			status: 'Status',
			method: 'Payment method',
			reference: 'Payment reference',
			note: 'Note / reason',
			empty: 'No orders here.',
			create: 'Add a past order',
			createNote:
				'For sales made before the site existed. The customer account is created from the email if it is not registered yet, and the order gets a ref and an invoice like any other.',
			name: 'Customer name',
			email: 'Email',
			playerId: 'In-app ID',
			phone: 'Phone (optional)',
			country: 'Country',
			app: 'App',
			coins: 'Coins',
			amount: 'Amount',
			requestedAt: 'Requested on',
			chargedAt: 'Charged on'
		}
	},
	errors: {
		loginToOrder: 'Log in to place your order',
		badPlayerId: 'Enter a valid in-app ID',
		badPhone: 'Enter a valid phone number',
		pickPackage: 'Choose a package',
		mustAgree: 'Accept the terms and refund policy before continuing',
		packageGone: 'That package is not available',
		badCredentials: 'Email or password is incorrect',
		badName: 'Enter your name (2 characters or more)',
		badEmail: 'Enter a valid email address',
		shortPassword: 'Password must be at least 8 characters',
		emailTaken: 'That email is already registered',
		cannotCancel: 'This order can no longer be cancelled',
		unknownStatus: 'Unknown status',
		orderMissing: 'Order not found',
		badTransition: (from: string, to: string) => `Cannot move from ${from} to ${to}`,
		needMethod: 'Pick the payment method before confirming receipt',
		needReason: 'Write the reason for the cancellation or refund',
		statusChanged: 'The order changed in the meantime — refresh the page',
		pickFromList: 'Pick a country from the list',
		badRole: 'Unknown role',
		notYourself: 'You cannot change your own role',
		appNeedsPrices: 'Add packages and prices to the app before enabling it',
		badApp: 'A name is required, and the slug must be lowercase letters, digits or dashes',
		badCoins: 'That coin amount is not valid',
		badPrice: 'That price is not valid',
		oldPriceTooLow: 'The pre-discount price must be higher',
		countryMissing: 'Country not found',
		appMissing: 'Add an app from the dashboard first',
		appUnavailable: 'This app is not available for top-up right now',
		countryUnavailable: 'This country is not available',
		noInvoice: 'There is no invoice for this order — invoices are issued once delivery completes',
		notFound: 'Page not found',
		badDate: 'Enter a valid date',
		badRating: 'Pick a rating from 1 to 5',
		reviewNotAllowed: 'Only a delivered order can be reviewed, and only once'
	}
};

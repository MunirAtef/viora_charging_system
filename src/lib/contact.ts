export const contact = {
	// the seller on invoices and card statements
	entity: 'ELHAWAREY DIGITAL LTD',
	entityAddress: ['20 Wenlock Road', 'London, N1 7GU', 'United Kingdom'],
	taxId: '', // company / VAT number — printed on the invoice once you have one
	phone: '+1 234 279 6813',
	whatsapp: '+1 234 279 6813',
	email: 'hamada@elhawarey.com',
	// order matters: the first entry is the main company and leads every list on the site
	offices: [
		{
			flag: '🇬🇧',
			name: 'ELHAWAREY DIGITAL LTD',
			address: '20 Wenlock Road, London, N1 7GU, United Kingdom'
		},
		{
			flag: '🇦🇪',
			name: 'BINGO TECHNOLOGY LLC',
			address: 'Shams Business Center, Al Messaned, Sharjah Media City Free Zone, Sharjah, UAE'
		},
		{
			flag: '🇺🇸',
			name: 'BINGO TECHNOLOGY LLC',
			address: '7901 4th St N, St. Petersburg, FL 33702, United States'
		}
	],
	hours: {
		en: 'Support is available 24 hours a day, every day',
		ar: 'الدعم متاح على مدار 24 ساعة طوال أيام الأسبوع'
	},
	mapUrl: '', // e.g. a Google Maps embed URL

	// remittance details printed on the invoice — one account per region
	banks: [
		{
			region: 'United Kingdom',
			rows: [
				['Account name', 'Elhawarey Digital Ltd'],
				['Account number', '92571385'],
				['Sort code', '60-84-64'],
				['IBAN', 'GB78 TRWI 6084 6492 5713 85'],
				['SWIFT/BIC', 'TRWIGB2LXXX'],
				['Bank address', 'Worship Square, 65 Clifton Street, London, EC2A 4JE, United Kingdom']
			]
		},
		{
			region: 'Hong Kong',
			rows: [
				['Account name', 'Elhawarey Digital Ltd'],
				['Account number', '79680243896'],
				['Bank', 'DBS Bank (Hong Kong) Limited (016)'],
				['Branch code', '478'],
				['SWIFT/BIC', 'DHBKHKHH'],
				['Bank address', "G/F, The Center, 99 Queen's Road Central, Central, 000, Hong Kong"]
			]
		},
		{
			region: 'United States',
			rows: [
				['Account name', 'Elhawarey Digital Ltd'],
				['Account number', '615505448676929'],
				['Routing (wire & ACH)', '084009519'],
				['SWIFT/BIC', 'TRWIUS35XXX'],
				['Bank address', 'Wise US Inc, 108 W 13th St, Wilmington, DE, 19801, United States']
			]
		}
	]
};

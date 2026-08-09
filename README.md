# Elhawarey Digital

In-app coin top-up store. Pick the app → pick your country/currency → enter the player ID →
pick a package → pay → the admin confirms payment and credits the account.

```bash
cp .env.example .env    # DATABASE_URL + ADMIN_PASSWORD
npm install
npm run db:push         # applies schema.sql
npm run db:seed         # apps, countries, IMO packages, starting prices
npm run smoke           # money-path check (rolls back)
npm run dev
```

## Routes

- `/` apps (active / قريباً), country grid, packages, how it works, contact
- `/buy/[app]/[code]` order form → creates the order → `/orders/[ref]`
- `/orders/[ref]` receipt, payment instructions, status, self-service cancel before payment
- `/account` the customer's orders
- `/legal/[slug]` about · delivery · refund · terms · privacy · kyc
- `/admin` apps, countries, accounts · `/admin/countries/[code]` prices per app ·
  `/admin/orders` payment + fulfilment console

## Languages

English by default, Arabic on request. `src/lib/i18n/en.ts` is the source of truth for the
message shape and `ar.ts` is typed `typeof en`, so a missing or renamed key fails the build
instead of the page. Policy documents live the same way in `src/lib/legal/{en,ar}.ts`.

The choice is a `lang` cookie, resolved in `hooks.server.ts` into `locals.lang` and stamped onto
`<html lang dir>` before any CSS runs. The switcher in the header is a plain form POST to
`/lang`, so it works without JavaScript. Country names come from `Intl.DisplayNames` in whatever
language is showing, never from the `countries.name` column.

The invoice is always English — it is a legal document sent to banks and gateways.

## Notifications

Web push, standards-only — no Firebase, no vendor account. `npx web-push generate-vapid-keys`
once, put the pair in `.env` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`), and the
"تفعيل التنبيهات" button on `/account` and `/admin` subscribes that browser. Without the keys the
whole feature switches itself off and nothing else changes.

Admins get a push when an order is created; the customer gets one on every status change.
`notify()` in `src/lib/server/push.ts` swallows every failure — a push must never fail an order —
and deletes subscriptions the browser reports as gone (404/410).

Regenerating the VAPID keys invalidates existing subscriptions: everyone has to press the button
again. iOS only delivers web push to a site added to the Home Screen, which is why the app ships
a `manifest.webmanifest`.

## Model

A package (`quotas`) belongs to one app. Its price lives in `country_quotas`, in that
country's own currency, set by hand per country — there is no exchange-rate maths anywhere.

Order lifecycle (`src/lib/orders.ts`) is `awaiting_payment → paid → delivered`, with
`cancelled` and `refunded` as exits. Only the edges in `NEXT` are allowed, every transition
is guarded by the current status in SQL, and the DB rejects any status outside the list.
Wiring a gateway means driving the `awaiting_payment → paid` edge from its webhook instead
of the admin console.

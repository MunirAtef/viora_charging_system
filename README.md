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

## Deploying (Podman, behind nginx)

nginx on the host owns the domain and the TLS certificate; this stack only serves plain HTTP on
port 3000.

```bash
git clone https://github.com/MunirAtef/viora_charging_system.git && cd viora_charging_system
cp .env.example .env      # fill in every blank, see below
podman compose up -d --build
podman compose exec app node scripts/seed.js   # once: apps, countries, starting prices
```

Later deploys are one command — `./update.sh` pulls, rebuilds, restarts, waits for the app to
answer, and prunes the images the old build left behind.

`.env` must carry: `POSTGRES_PASSWORD` (long and random — the database is on a public port),
`ORIGIN` (the public https URL nginx serves), `ADMIN_EMAIL` / `ADMIN_PASSWORD`, and the VAPID
pair from `npx web-push generate-vapid-keys`. `DATABASE_URL` is assembled by compose; the app
reaches Postgres as `db:5432` inside the pod, never over the public address.

Every boot the app applies `schema.sql` and ensures the admin account exists — both idempotent,
so restarts and redeploys are safe. Catalogue seeding stays manual so it can never re-enable a
package you disabled.

### The nginx side

`ORIGIN` must equal the public URL exactly — that single value is what the app treats as its
own address, and a form POST whose `Origin` differs is rejected as cross-site (403).

```nginx
location / {
    proxy_pass         http://127.0.0.1:3000;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
}
```

Redirects come back relative (`Location: /account`), so they follow whatever domain nginx
serves. Session cookies are `Secure` and web push needs https — both are satisfied as long as
browsers reach nginx over TLS, which is already your setup's job.

**The database is published on `0.0.0.0:5432` by request.** Public Postgres is found by
scanners within hours, so the password is the only thing between them and the data: make it
long, and never reuse it. Authentication is forced to scram-sha-256. To close it later set
`DB_BIND=127.0.0.1` in `.env` and `podman compose up -d` — nothing else changes. The same
applies to the app: `APP_BIND=127.0.0.1` makes nginx the only way in.

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

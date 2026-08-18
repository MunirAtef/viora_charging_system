-- Two historical EUR invoices.
--
-- ► NAME CONFLICT — read before running. IMO ID 385891305 is listed in import_customers.sql as
--   'محمد عطيه المتولي'; this invoice says 'Clara Maria Coates Requena'. Same situation as
--   507435405 (تيا → Abdelaziz), and it is resolved the same way: the invoice wins and the
--   account is renamed. If that is wrong, stop and tell me — a renamed account carries its
--   old orders with it.
--
-- ► COINS are a placeholder. The amounts do not correspond to any package on your price list
--   and you did not state a package size. The figure never appears on the invoice (the line
--   item reads "Digital Service") but it does show in the admin order list, so set it if you
--   know it.
--
-- ► TIME OF DAY is a placeholder: 12:00 (+03), with delivery 1m23s later to match the other
--   imported invoice. Only the dates came from you.
--
-- All of these were settled by bank transfer, so payment_method is 'bank' and the invoice
-- prints "Paid by Bank transfer".
begin;

create temp table eur_invoices (
  player_id text, full_name text, coins int, amount numeric(10,2), paid_at timestamptz
) on commit drop;

insert into eur_invoices values
  ('576687948', 'AYYOUB MEKKI MOKHTARI',       60000, 308.97, timestamptz '2026-07-14 12:00:00+03'),
  ('385891305', 'Clara Maria Coates Requena',  60000, 542.50, timestamptz '2026-07-21 12:00:00+03');

-- a EUR country to carry the records, hidden from the storefront
insert into countries (code, name, currency, active)
values ('FR', 'France', 'EUR', false)
on conflict (code) do nothing;

-- packages referenced above, created without a price so they stay off the storefront
insert into quotas (coins, app_id)
select distinct e.coins, (select id from apps where slug = 'imo') from eur_invoices e
on conflict (app_id, coins) do nothing;

-- customers: created if new, renamed if an earlier import already made them
insert into users (name, email, password_hash)
select e.full_name, 'imo-' || e.player_id || '@imported.elhawarey.com', '850ab98b41fce8c017d8d2929c94e810:c8d8df1d3411a858447b9a5efbff467fbcd527221a3a935c56a51cf75cf12a9b7a04d02b29b5b0f6639590fed0141a3384a734991612effac701854c1f8ed3a5'
from eur_invoices e
on conflict (email) do update set name = excluded.name;

-- the sales, priced exactly as invoiced
insert into orders (user_id, app_id, country_id, quota_id, player_id, phone, amount, currency,
                    status, created_at, paid_at, delivered_at, payment_method, note)
select u.id, a.id, c.id, q.id, e.player_id, '', e.amount, 'EUR', 'delivered',
       e.paid_at, e.paid_at, e.paid_at + interval '1 minute 23 seconds',
       'bank', 'imported from pre-website records'
from eur_invoices e
join users u on u.email = 'imo-' || e.player_id || '@imported.elhawarey.com'
join apps a on a.slug = 'imo'
join countries c on c.code = 'FR'
join quotas q on q.coins = e.coins and q.app_id = a.id
where not exists (
  select 1 from orders o
  where o.player_id = e.player_id and o.amount = e.amount and o.currency = 'EUR');

commit;

-- invoice numbers:
--   select o.ref, u.name, o.player_id, o.amount, o.currency, o.delivered_at::date
--   from orders o join users u on u.id = o.user_id
--   where o.currency = 'EUR' order by o.delivered_at;
--
-- UNDO (these two only):
--   delete from orders where currency='EUR' and amount in (308.97, 542.50);

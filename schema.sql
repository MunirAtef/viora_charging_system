create table if not exists users (
  id serial primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- role: user buys, admin runs the shop and fulfils. 'distributor' is kept only so old rows
-- validate; nothing in the app reads it any more.
alter table users add column if not exists role text not null default 'user'
  check (role in ('user', 'distributor', 'admin'));
alter table users add column if not exists coins integer not null default 0 check (coins >= 0);
alter table users add column if not exists name text; -- null for accounts made before signup asked

-- one-time migration off the old boolean
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_name = 'users' and column_name = 'is_admin') then
    update users set role = 'admin' where is_admin;
    alter table users drop column is_admin;
  end if;
end $$;

create table if not exists sessions (
  id text primary key,
  user_id integer not null references users (id) on delete cascade,
  expires_at timestamptz not null
);

-- one row per browser that agreed to receive notifications; the endpoint is the address
create table if not exists push_subscriptions (
  id serial primary key,
  user_id integer not null references users (id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table if not exists countries (
  id serial primary key,
  code text unique not null, -- ISO-2, drives the flag image
  name text not null,        -- عربي
  currency text not null,    -- QAR
  active boolean not null default true
);

alter table countries add column if not exists distributor_id integer references users (id);

-- the apps we top up; active = orderable, inactive = shown as "قريباً"
create table if not exists apps (
  id serial primary key,
  slug text unique not null, -- imo
  name text not null,        -- IMO
  unit text not null default 'كوين',
  active boolean not null default false,
  sort integer not null default 0
);

-- a coin package belongs to one app; what it costs is a per-country decision
create table if not exists quotas (
  id serial primary key,
  coins integer not null check (coins > 0),
  active boolean not null default true
);

alter table quotas add column if not exists app_id integer references apps (id);

-- one-time migration: everything sold before apps existed was IMO
do $$ begin
  if exists (select 1 from quotas where app_id is null) then
    insert into apps (slug, name, active, sort) values ('imo', 'IMO', true, 0)
      on conflict (slug) do nothing;
    update quotas set app_id = (select id from apps where slug = 'imo') where app_id is null;
  end if;
end $$;

alter table quotas alter column app_id set not null;
drop index if exists quotas_coins_key;
create unique index if not exists quotas_app_coins_key on quotas (app_id, coins);

create table if not exists country_quotas (
  country_id integer not null references countries (id) on delete cascade,
  quota_id integer not null references quotas (id) on delete cascade,
  price numeric(12, 2) not null check (price > 0),      -- in the country's own currency
  old_price numeric(12, 2) check (old_price > price),
  active boolean not null default true,
  primary key (country_id, quota_id)
);

-- one-time migration off USD × rate: freeze what each country was charging, then retire the maths
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_name = 'quotas' and column_name = 'price_usd') then
    insert into country_quotas (country_id, quota_id, price, old_price, active)
    select c.id, q.id, round(q.price_usd * c.rate, 2), round(q.old_price_usd * c.rate, 2), q.active
    from countries c, quotas q
    on conflict do nothing;
    alter table quotas drop column price_usd, drop column old_price_usd;
    alter table countries drop column rate;
  end if;
end $$;

create table if not exists orders (
  id serial primary key,
  country_id integer not null references countries (id),
  quota_id integer not null references quotas (id),
  player_id text not null,
  phone text not null,
  amount numeric(10, 2) not null, -- priced server-side at order time
  currency text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table orders add column if not exists user_id integer references users (id);
alter table orders add column if not exists distributor_id integer references users (id);
alter table orders add column if not exists app_id integer references apps (id);

-- the money trail: what the customer quotes at support, and when each step happened
alter table orders add column if not exists ref text;
alter table orders add column if not exists paid_at timestamptz;
alter table orders add column if not exists delivered_at timestamptz;
alter table orders add column if not exists payment_method text;
alter table orders add column if not exists payment_ref text; -- gateway/transfer reference
alter table orders add column if not exists note text;        -- admin note, refund reason

update orders set app_id = (select id from apps where slug = 'imo') where app_id is null;
update orders set ref = 'ELH-' || upper(substr(md5(random()::text), 1, 8)) where ref is null;
alter table orders alter column ref set default 'ELH-' || upper(substr(md5(random()::text), 1, 8));
alter table orders alter column ref set not null;
create unique index if not exists orders_ref_key on orders (ref);

-- payment methods used to be stored as Arabic labels; codes render in either language
update orders set payment_method = case payment_method
    when 'تحويل بنكي' then 'bank'
    when 'محفظة إلكترونية' then 'wallet'
    when 'بطاقة' then 'card'
    when 'نقدي' then 'cash'
    else payment_method end
  where payment_method is not null;

-- status migration off the old names, then lock the vocabulary down
update orders set status = case status
    when 'pending' then 'awaiting_payment'
    when 'done' then 'delivered'
    else status end
  where status in ('pending', 'done');
alter table orders alter column status set default 'awaiting_payment';

do $$ begin
  alter table orders add constraint orders_status_ck check (status in
    ('awaiting_payment', 'paid', 'delivered', 'refunded', 'cancelled'));
exception when duplicate_object then null;
end $$;

-- Reviews are written by customers, never by us: one per delivered order, and the order it came
-- from is part of the row, so every rating on the site traces back to a real purchase.
create table if not exists reviews (
  id serial primary key,
  user_id integer not null references users (id) on delete cascade,
  order_id integer not null references orders (id) on delete cascade unique,
  rating integer not null check (rating between 1 and 5),
  body text,
  approved boolean not null default true, -- the admin can hide abuse, not inconvenient opinions
  created_at timestamptz not null default now()
);

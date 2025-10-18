-- Core entities for E wall MVP
create table if not exists brand (
  id serial primary key,
  name text unique not null
);

create table if not exists product (
  id text primary key,
  brand text not null references brand(name) on delete restrict,
  category text not null,
  title text not null,
  image_url text not null,
  price integer not null,
  original_price integer,
  discount_rate integer not null default 0,
  currency text not null default 'KRW',
  seller text not null,
  deeplink text not null,
  in_stock boolean not null default true,
  down_type text,
  down_ratio text,
  fill_power integer,
  hood boolean,
  fit text,
  shell text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_brand_cat on product(brand, category);
create index if not exists idx_product_discount on product(discount_rate desc);
create index if not exists idx_product_updated on product(updated_at desc);
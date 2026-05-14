create table if not exists pay_metrics (
  id                uuid primary key default gen_random_uuid(),
  period            text not null,
  weekly_goal       int not null default 0,
  conversations     int not null default 0,
  users_converted   int not null default 0,  
  lcy_transfers     int not null default 0,
  lcy_goal          int not null default 2,
  fcy_transfers     int not null default 0,
  fcy_goal          int not null default 2,
  recorded_at       timestamptz not null default now()
);

insert into pay_metrics (period, weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal) 
select 'week', 10, 28, 9, 1, 2, 5, 2
where not exists (select 1 from pay_metrics);

insert into pay_metrics (period, weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal) 
select 'month', 40, 110, 35, 4, 8, 20, 8
where not exists (select 1 from pay_metrics where period = 'month');

alter table finance_metrics add column if not exists historical_rate_to_usd float;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Недельный планер — миграция таблицы состояния
-- ============================================================
-- Всё состояние приложения хранится одним JSON-объектом
-- в единственной строке с id = 1.

create table if not exists public.planner_state (
  id         integer primary key,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Засеваем строку с id = 1, если её ещё нет.
insert into public.planner_state (id, data, updated_at)
values (1, '{}'::jsonb, now())
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Realtime: публикуем изменения таблицы.
-- ------------------------------------------------------------
alter table public.planner_state replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'planner_state'
  ) then
    alter publication supabase_realtime add table public.planner_state;
  end if;
end
$$;

-- ------------------------------------------------------------
-- Row Level Security.
-- Планер однопользовательский (одна строка), доступ по anon key.
-- Разрешаем чтение/запись всем — данные не чувствительные.
-- При необходимости ужесточите политики под свою авторизацию.
-- ------------------------------------------------------------
alter table public.planner_state enable row level security;

drop policy if exists "planner_state public read"  on public.planner_state;
drop policy if exists "planner_state public write" on public.planner_state;

create policy "planner_state public read"
  on public.planner_state
  for select
  using (true);

create policy "planner_state public write"
  on public.planner_state
  for all
  using (true)
  with check (true);

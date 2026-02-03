-- Somatic Daily Worksheet App MVP schema

create extension if not exists pgcrypto;

do $$
begin
  create type public.progression_event_type as enum ('COMPLETE', 'RESET');
exception
  when duplicate_object then
    null;
end
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone text not null default 'UTC',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worksheets (
  id uuid primary key default gen_random_uuid(),
  seq_index integer not null unique check (seq_index > 0),
  title text not null,
  body_json jsonb not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.progression_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_seq_index integer not null default 1 check (current_seq_index > 0),
  last_completed_local_date date,
  last_penalty_processed_local_date date,
  next_available_at_utc timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.worksheet_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seq_index integer not null check (seq_index > 0),
  local_date date not null,
  completed_at_utc timestamptz not null default now(),
  response_json jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, local_date)
);

create table if not exists public.entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default false,
  product_id text,
  expires_at_utc timestamptz,
  source text not null default 'revenuecat',
  updated_at timestamptz not null default now()
);

create table if not exists public.progression_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type public.progression_event_type not null,
  delta integer not null,
  from_seq integer not null check (from_seq > 0),
  to_seq integer not null check (to_seq > 0),
  event_local_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_worksheet_completions_user_date
  on public.worksheet_completions (user_id, local_date desc);

create index if not exists idx_worksheet_completions_user_seq
  on public.worksheet_completions (user_id, seq_index);

create index if not exists idx_progression_events_user_created
  on public.progression_events (user_id, created_at desc);

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.tg_set_updated_at();

drop trigger if exists set_progression_state_updated_at on public.progression_state;
create trigger set_progression_state_updated_at
before update on public.progression_state
for each row
execute function public.tg_set_updated_at();

drop trigger if exists set_entitlements_updated_at on public.entitlements;
create trigger set_entitlements_updated_at
before update on public.entitlements
for each row
execute function public.tg_set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, timezone)
  values (new.id, 'UTC')
  on conflict (user_id) do nothing;

  insert into public.progression_state (user_id, current_seq_index)
  values (new.id, 1)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.worksheets enable row level security;
alter table public.progression_state enable row level security;
alter table public.worksheet_completions enable row level security;
alter table public.entitlements enable row level security;
alter table public.progression_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "worksheets_read_active" on public.worksheets;
create policy "worksheets_read_active"
on public.worksheets for select
to authenticated
using (is_active = true);

drop policy if exists "progression_state_select_own" on public.progression_state;
create policy "progression_state_select_own"
on public.progression_state for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "progression_state_insert_own" on public.progression_state;
create policy "progression_state_insert_own"
on public.progression_state for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "progression_state_update_own" on public.progression_state;
create policy "progression_state_update_own"
on public.progression_state for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "worksheet_completions_select_own" on public.worksheet_completions;
create policy "worksheet_completions_select_own"
on public.worksheet_completions for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "worksheet_completions_insert_own" on public.worksheet_completions;
create policy "worksheet_completions_insert_own"
on public.worksheet_completions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "entitlements_select_own" on public.entitlements;
create policy "entitlements_select_own"
on public.entitlements for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "progression_events_select_own" on public.progression_events;
create policy "progression_events_select_own"
on public.progression_events for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "progression_events_insert_own" on public.progression_events;
create policy "progression_events_insert_own"
on public.progression_events for insert
to authenticated
with check (auth.uid() = user_id);

create or replace function public.get_daily_state(p_timezone text default null)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_timezone text;
  v_state public.progression_state%rowtype;
  v_worksheet public.worksheets%rowtype;
  v_today_local date;
  v_yesterday_local date;
  v_baseline date;
  v_missed_days integer := 0;
  v_new_seq integer;
  v_completed_today boolean := false;
  v_time_gate_open boolean := true;
  v_entitlement_active boolean := false;
  v_subscription_required boolean := false;
  v_can_complete boolean := false;
  v_lock_reason text := 'OK';
  v_missed_since_last integer := 0;
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  insert into public.profiles (user_id, timezone)
  values (v_user_id, coalesce(p_timezone, 'UTC'))
  on conflict (user_id) do nothing;

  insert into public.progression_state (user_id, current_seq_index)
  values (v_user_id, 1)
  on conflict (user_id) do nothing;

  select timezone into v_timezone
  from public.profiles
  where user_id = v_user_id;

  v_timezone := coalesce(p_timezone, v_timezone, 'UTC');

  begin
    perform now() at time zone v_timezone;
  exception
    when others then
      v_timezone := 'UTC';
  end;

  update public.profiles
  set timezone = v_timezone
  where user_id = v_user_id;

  select * into v_state
  from public.progression_state
  where user_id = v_user_id
  for update;

  v_today_local := (now() at time zone v_timezone)::date;
  v_yesterday_local := v_today_local - 1;

  if v_state.last_completed_local_date is not null then
    v_baseline := greatest(
      v_state.last_completed_local_date,
      coalesce(v_state.last_penalty_processed_local_date, v_state.last_completed_local_date)
    );

    v_missed_days := greatest((v_yesterday_local - v_baseline), 0);

    if v_missed_days > 0 then
      v_new_seq := greatest(1, v_state.current_seq_index - v_missed_days);

      if v_new_seq <> v_state.current_seq_index then
        insert into public.progression_events (
          user_id,
          event_type,
          delta,
          from_seq,
          to_seq,
          event_local_date
        ) values (
          v_user_id,
          'RESET',
          -(v_state.current_seq_index - v_new_seq),
          v_state.current_seq_index,
          v_new_seq,
          v_today_local
        );
      end if;

      update public.progression_state
      set
        current_seq_index = v_new_seq,
        last_penalty_processed_local_date = v_yesterday_local,
        updated_at = now()
      where user_id = v_user_id;

      select * into v_state
      from public.progression_state
      where user_id = v_user_id;
    end if;
  end if;

  select * into v_worksheet
  from public.worksheets
  where seq_index = v_state.current_seq_index
    and is_active = true
  order by seq_index asc
  limit 1;

  select exists(
    select 1
    from public.worksheet_completions
    where user_id = v_user_id
      and local_date = v_today_local
  ) into v_completed_today;

  v_time_gate_open := v_state.next_available_at_utc is null or now() >= v_state.next_available_at_utc;

  select exists(
    select 1
    from public.entitlements e
    where e.user_id = v_user_id
      and e.is_active = true
      and (e.expires_at_utc is null or e.expires_at_utc > now())
  ) into v_entitlement_active;

  v_subscription_required := v_state.current_seq_index > 3 and not v_entitlement_active;
  v_can_complete :=
    v_worksheet.id is not null
    and not v_completed_today
    and v_time_gate_open
    and not v_subscription_required;

  if v_worksheet.id is null then
    v_lock_reason := 'INVALID_WORKSHEET';
  elsif v_completed_today then
    v_lock_reason := 'ALREADY_COMPLETED_TODAY';
  elsif not v_time_gate_open then
    v_lock_reason := 'WAITING_FOR_TOMORROW';
  elsif v_subscription_required then
    v_lock_reason := 'SUBSCRIPTION_REQUIRED';
  else
    v_lock_reason := 'OK';
  end if;

  if v_state.last_completed_local_date is not null then
    v_missed_since_last := greatest((v_today_local - v_state.last_completed_local_date) - 1, 0);
  end if;

  return jsonb_build_object(
    'currentSeqIndex', v_state.current_seq_index,
    'currentWorksheet', case
      when v_worksheet.id is null then null
      else jsonb_build_object(
        'id', v_worksheet.id,
        'seqIndex', v_worksheet.seq_index,
        'title', v_worksheet.title,
        'bodyJson', v_worksheet.body_json,
        'estimatedMinutes', v_worksheet.estimated_minutes,
        'isActive', v_worksheet.is_active
      )
    end,
    'canCompleteToday', v_can_complete,
    'lockReason', v_lock_reason,
    'subscriptionRequired', v_subscription_required,
    'nextAvailableAtUtc', v_state.next_available_at_utc,
    'completedToday', v_completed_today,
    'streakMeta', jsonb_build_object(
      'lastCompletedLocalDate', v_state.last_completed_local_date,
      'missedDaysSinceLastCompletion', v_missed_since_last
    )
  );
end;
$$;

create or replace function public.complete_daily_worksheet(
  p_seq_index integer,
  p_response jsonb
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_timezone text;
  v_state public.progression_state%rowtype;
  v_worksheet public.worksheets%rowtype;
  v_today_local date;
  v_yesterday_local date;
  v_baseline date;
  v_missed_days integer := 0;
  v_penalty_applied integer := 0;
  v_new_seq integer;
  v_completed_today boolean := false;
  v_time_gate_open boolean := true;
  v_entitlement_active boolean := false;
  v_next_available timestamptz;
  v_new_state jsonb;
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if p_seq_index is null or p_seq_index < 1 then
    raise exception 'INVALID_SEQ_INDEX';
  end if;

  if p_response is null then
    raise exception 'MISSING_RESPONSE';
  end if;

  insert into public.profiles (user_id, timezone)
  values (v_user_id, 'UTC')
  on conflict (user_id) do nothing;

  insert into public.progression_state (user_id, current_seq_index)
  values (v_user_id, 1)
  on conflict (user_id) do nothing;

  select timezone into v_timezone
  from public.profiles
  where user_id = v_user_id;

  v_timezone := coalesce(v_timezone, 'UTC');

  begin
    perform now() at time zone v_timezone;
  exception
    when others then
      v_timezone := 'UTC';
  end;

  select * into v_state
  from public.progression_state
  where user_id = v_user_id
  for update;

  v_today_local := (now() at time zone v_timezone)::date;
  v_yesterday_local := v_today_local - 1;

  if v_state.last_completed_local_date is not null then
    v_baseline := greatest(
      v_state.last_completed_local_date,
      coalesce(v_state.last_penalty_processed_local_date, v_state.last_completed_local_date)
    );

    v_missed_days := greatest((v_yesterday_local - v_baseline), 0);

    if v_missed_days > 0 then
      v_new_seq := greatest(1, v_state.current_seq_index - v_missed_days);
      v_penalty_applied := v_state.current_seq_index - v_new_seq;

      if v_penalty_applied > 0 then
        insert into public.progression_events (
          user_id,
          event_type,
          delta,
          from_seq,
          to_seq,
          event_local_date
        ) values (
          v_user_id,
          'RESET',
          -v_penalty_applied,
          v_state.current_seq_index,
          v_new_seq,
          v_today_local
        );
      end if;

      update public.progression_state
      set
        current_seq_index = v_new_seq,
        last_penalty_processed_local_date = v_yesterday_local,
        updated_at = now()
      where user_id = v_user_id;

      select * into v_state
      from public.progression_state
      where user_id = v_user_id;
    end if;
  end if;

  if v_state.current_seq_index <> p_seq_index then
    raise exception 'OUT_OF_SEQUENCE';
  end if;

  select * into v_worksheet
  from public.worksheets
  where seq_index = p_seq_index
    and is_active = true
  limit 1;

  if v_worksheet.id is null then
    raise exception 'INVALID_WORKSHEET';
  end if;

  select exists(
    select 1
    from public.worksheet_completions
    where user_id = v_user_id
      and local_date = v_today_local
  ) into v_completed_today;

  if v_completed_today then
    raise exception 'ALREADY_COMPLETED_TODAY';
  end if;

  v_time_gate_open := v_state.next_available_at_utc is null or now() >= v_state.next_available_at_utc;
  if not v_time_gate_open then
    raise exception 'WAITING_FOR_TOMORROW';
  end if;

  select exists(
    select 1
    from public.entitlements e
    where e.user_id = v_user_id
      and e.is_active = true
      and (e.expires_at_utc is null or e.expires_at_utc > now())
  ) into v_entitlement_active;

  if p_seq_index > 3 and not v_entitlement_active then
    raise exception 'SUBSCRIPTION_REQUIRED';
  end if;

  insert into public.worksheet_completions (
    user_id,
    seq_index,
    local_date,
    completed_at_utc,
    response_json
  ) values (
    v_user_id,
    p_seq_index,
    v_today_local,
    now(),
    p_response
  );

  v_next_available := (
    date_trunc('day', now() at time zone v_timezone) + interval '1 day'
  ) at time zone v_timezone;

  update public.progression_state
  set
    current_seq_index = p_seq_index + 1,
    last_completed_local_date = v_today_local,
    next_available_at_utc = v_next_available,
    updated_at = now()
  where user_id = v_user_id;

  insert into public.progression_events (
    user_id,
    event_type,
    delta,
    from_seq,
    to_seq,
    event_local_date
  ) values (
    v_user_id,
    'COMPLETE',
    1,
    p_seq_index,
    p_seq_index + 1,
    v_today_local
  );

  v_new_state := public.get_daily_state(v_timezone);

  return jsonb_build_object(
    'newState', v_new_state,
    'penaltyApplied', v_penalty_applied,
    'nextAvailableAtUtc', v_next_available
  );
end;
$$;

grant execute on function public.get_daily_state(text) to authenticated;
grant execute on function public.complete_daily_worksheet(integer, jsonb) to authenticated;

insert into public.worksheets (seq_index, title, body_json, estimated_minutes)
values
  (1, 'Body Scan Basics', '{"prompts":[{"id":"scan","text":"Scan from head to toe and note sensations."}]}'::jsonb, 8),
  (2, 'Grounding Through Breath', '{"prompts":[{"id":"breath","text":"Track five deep breaths and body response."}]}'::jsonb, 10),
  (3, 'Name the Sensation', '{"prompts":[{"id":"name","text":"Describe one sensation with neutral language."}]}'::jsonb, 9),
  (4, 'Pendulation Practice', '{"prompts":[{"id":"pendulation","text":"Move attention between comfort and discomfort zones."}]}'::jsonb, 12),
  (5, 'Orienting Exercise', '{"prompts":[{"id":"orient","text":"Use sight and sound to orient in the room."}]}'::jsonb, 10),
  (6, 'Containment and Release', '{"prompts":[{"id":"contain","text":"Notice tension, contain it gently, then release."}]}'::jsonb, 12),
  (7, 'Resource Anchoring', '{"prompts":[{"id":"resource","text":"Recall a resourceful moment and locate it in body."}]}'::jsonb, 11),
  (8, 'Micro-Movement Reset', '{"prompts":[{"id":"micro","text":"Use subtle movement to shift activation."}]}'::jsonb, 9),
  (9, 'Window of Tolerance Check-In', '{"prompts":[{"id":"window","text":"Map your arousal state and what supports regulation."}]}'::jsonb, 13),
  (10, 'Completion Ritual', '{"prompts":[{"id":"close","text":"Reflect on body changes and close with gratitude."}]}'::jsonb, 8)
on conflict (seq_index) do update
set
  title = excluded.title,
  body_json = excluded.body_json,
  estimated_minutes = excluded.estimated_minutes,
  is_active = true;

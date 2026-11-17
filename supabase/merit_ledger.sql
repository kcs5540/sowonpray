-- =====================================================================
-- 제주 소원사 공덕 거래 장부(merit_ledger) 설치 및 SaaS 통합 SQL
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 [Run] 한 번만 실행하세요.
-- 여러 번 실행해도 안전합니다(이미 있으면 건너뜀).
-- =====================================================================

-- 1) 거래 장부 표: 한 번 적은 줄은 고치거나 지우지 않고 덧붙이기만 합니다.
create table if not exists public.merit_ledger (
  id          bigserial primary key,
  temple_id   text        not null default 'sowonsa',
  member_code text        not null,
  activity    text        not null,   -- opening | lantern | sanctuary | sutra | inyeon_giver | inyeon_receiver
  points      integer     not null,
  ledger_date date        not null default ((now() at time zone 'Asia/Seoul')::date),
  ref         text        not null default '',   -- 추천인 공덕일 때 가입한 신도 코드 등
  note        text        not null default '',
  created_at  timestamptz not null default now()
);

-- temple_id 컬럼이 기존 테이블에 혹시 없을 경우 안전 추가
alter table public.merit_ledger add column if not exists temple_id text not null default 'sowonsa';

create index if not exists merit_ledger_temple_member_idx on public.merit_ledger (temple_id, member_code, ledger_date);

-- 2) 중복 적립을 DB가 직접 막는 규칙 (사찰별 격리 적용)
drop index if exists public.merit_ledger_daily_uq;
create unique index if not exists merit_ledger_daily_uq
  on public.merit_ledger (temple_id, member_code, activity, ledger_date)
  where activity in ('lantern', 'sanctuary', 'sutra');

drop index if exists public.merit_ledger_receiver_uq;
create unique index if not exists merit_ledger_receiver_uq
  on public.merit_ledger (temple_id, member_code) where activity = 'inyeon_receiver';

drop index if exists public.merit_ledger_giver_uq;
create unique index if not exists merit_ledger_giver_uq
  on public.merit_ledger (temple_id, member_code, ref) where activity = 'inyeon_giver';

drop index if exists public.merit_ledger_opening_uq;
create unique index if not exists merit_ledger_opening_uq
  on public.merit_ledger (temple_id, member_code) where activity = 'opening';

-- 3) 기존 회원의 현재 누적 공덕을 '기존 이월' 한 줄로 옮깁니다. (트리거 만들기 전에 실행해야 이중 가산이 없습니다)
insert into public.merit_ledger (temple_id, member_code, activity, points, ref, note)
select coalesce(temple_id, 'sowonsa'), code, 'opening', coalesce(merit_count, 0), '', '기존 누적 이월'
from public.members
where coalesce(merit_count, 0) <> 0
on conflict do nothing;

-- 4) 장부에 줄이 들어오면 members.merit_count(표시용 합계)를 자동으로 함께 올립니다.
create or replace function public.merit_ledger_apply()
returns trigger language plpgsql as $$
begin
  if new.activity <> 'opening' then
    update public.members
       set merit_count = coalesce(merit_count, 0) + new.points
     where code = new.member_code
       and (temple_id = new.temple_id or temple_id is null);
  end if;
  return new;
end;
$$;

drop trigger if exists merit_ledger_after_insert on public.merit_ledger;
create trigger merit_ledger_after_insert
after insert on public.merit_ledger
for each row execute function public.merit_ledger_apply();

-- 5) 공덕 적립 단일 통로: 점수 규정은 이 함수 안에만 있습니다. (p_temple_id 지원)
create or replace function public.grant_merit(
  p_code      text,
  p_activity  text,
  p_ref       text default '',
  p_temple_id text default 'sowonsa'
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_points      integer;
  v_id          bigint;
  v_today       date := (now() at time zone 'Asia/Seoul')::date;
  v_giver_today integer;
  v_balance     integer;
  v_temple      text := coalesce(nullif(p_temple_id, ''), 'sowonsa');
begin
  if not exists (select 1 from public.members where code = p_code and (temple_id = v_temple or temple_id is null)) then
    return jsonb_build_object('earned', 0, 'reason', 'no_member');
  end if;

  v_points := case p_activity
    when 'lantern'         then 1000
    when 'sanctuary'       then 1000
    when 'sutra'           then 1000
    when 'inyeon_giver'    then 5000
    when 'inyeon_receiver' then 5000
    else null end;

  if v_points is null then
    return jsonb_build_object('earned', 0, 'reason', 'unknown_activity');
  end if;

  -- 🌟 소원등(lantern)은 매일 오전 11시 사시마지 회향 주기 적용!
  -- 오전 11시 이전 점등: 당일(v_today) 오전 11시 회향분
  -- 오전 11시 이후 점등: 익일(v_today + 1) 오전 11시 회향분
  if p_activity = 'lantern' then
    if extract(hour from (now() at time zone 'Asia/Seoul')) >= 11 then
      v_today := v_today + 1;
    end if;
  end if;

  -- 인연 전달은 하루 50,000 한도
  if p_activity = 'inyeon_giver' then
    select coalesce(sum(points), 0) into v_giver_today
      from public.merit_ledger
     where temple_id = v_temple and member_code = p_code and activity = 'inyeon_giver' and ledger_date = v_today;
    if v_giver_today + v_points > 50000 then
      return jsonb_build_object('earned', 0, 'reason', 'daily_cap');
    end if;
  end if;

  insert into public.merit_ledger (temple_id, member_code, activity, points, ledger_date, ref)
  values (v_temple, p_code, p_activity, v_points, v_today, coalesce(p_ref, ''))
  on conflict do nothing
  returning id into v_id;

  if v_id is null then
    select merit_count into v_balance from public.members where code = p_code and (temple_id = v_temple or temple_id is null);
    return jsonb_build_object('earned', 0, 'reason', 'duplicate', 'balance', coalesce(v_balance, 0));
  end if;

  select merit_count into v_balance from public.members where code = p_code and (temple_id = v_temple or temple_id is null);
  return jsonb_build_object(
    'earned', v_points,
    'reason', 'success',
    'id', v_id,
    'balance', coalesce(v_balance, 0)
  );
end;
$$;

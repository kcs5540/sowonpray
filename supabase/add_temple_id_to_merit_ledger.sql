-- =====================================================================
-- 공덕 거래 장부(merit_ledger) SaaS 멀티테넌트(temple_id) 업그레이드 SQL
-- Supabase 대시보드 > SQL Editor 에서 [Run] 한 번만 실행하세요.
-- 기존 소원사 데이터에는 자동으로 'sowonsa'가 안전하게 부여됩니다.
-- =====================================================================

-- 1) temple_id 컬럼 추가 (기본값 'sowonsa', 기존 행 자동 채움)
alter table public.merit_ledger 
  add column if not exists temple_id text not null default 'sowonsa';

-- 2) 사찰별 인덱스 최적화
create index if not exists merit_ledger_temple_member_idx 
  on public.merit_ledger (temple_id, member_code, ledger_date);

-- 3) 사찰별 중복 적립 방지 유니크 인덱스 고도화 (사찰 격리 적용)
drop index if exists public.merit_ledger_daily_uq;
create unique index if not exists merit_ledger_daily_uq
  on public.merit_ledger (temple_id, member_code, activity, ledger_date)
  where activity in ('lantern', 'sanctuary', 'sutra');

drop index if exists public.merit_ledger_receiver_uq;
create unique index if not exists merit_ledger_receiver_uq
  on public.merit_ledger (temple_id, member_code) 
  where activity = 'inyeon_receiver';

drop index if exists public.merit_ledger_giver_uq;
create unique index if not exists merit_ledger_giver_uq
  on public.merit_ledger (temple_id, member_code, ref) 
  where activity = 'inyeon_giver';

drop index if exists public.merit_ledger_opening_uq;
create unique index if not exists merit_ledger_opening_uq
  on public.merit_ledger (temple_id, member_code) 
  where activity = 'opening';

-- 4) 트리거 함수 업그레이드 (사찰별 members 테이블 격리 반영)
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

-- 5) 공덕 적립 단일 통로 RPC 함수: p_temple_id 매개변수 추가 (기본값 'sowonsa')
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
  -- 해당 사찰의 회원 여부 확인
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

  -- 사찰별 인연 전달 하루 50,000 한도
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

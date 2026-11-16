-- =====================================================================
-- 제주 소원사 공덕 거래 장부(merit_ledger) 설치 SQL
-- Supabase 대시보드 > SQL Editor 에 전체를 붙여넣고 [Run] 한 번만 실행하세요.
-- 여러 번 실행해도 안전합니다(이미 있으면 건너뜀).
-- =====================================================================

-- 1) 거래 장부 표: 한 번 적은 줄은 고치거나 지우지 않고 덧붙이기만 합니다.
create table if not exists public.merit_ledger (
  id          bigserial primary key,
  member_code text        not null,
  activity    text        not null,   -- opening | lantern | sanctuary | sutra | inyeon_giver | inyeon_receiver
  points      integer     not null,
  ledger_date date        not null default ((now() at time zone 'Asia/Seoul')::date),
  ref         text        not null default '',   -- 추천인 공덕일 때 가입한 신도 코드 등
  note        text        not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists merit_ledger_member_idx on public.merit_ledger (member_code, ledger_date);

-- 2) 중복 적립을 DB가 직접 막는 규칙 (버튼을 두 번 눌러도, 두 기기에서 눌러도 한 줄만 들어갑니다)
create unique index if not exists merit_ledger_daily_uq
  on public.merit_ledger (member_code, activity, ledger_date)
  where activity in ('lantern', 'sanctuary', 'sutra');

create unique index if not exists merit_ledger_receiver_uq
  on public.merit_ledger (member_code) where activity = 'inyeon_receiver';

create unique index if not exists merit_ledger_giver_uq
  on public.merit_ledger (member_code, ref) where activity = 'inyeon_giver';

create unique index if not exists merit_ledger_opening_uq
  on public.merit_ledger (member_code) where activity = 'opening';

-- 3) 기존 회원의 현재 누적 공덕을 '기존 이월' 한 줄로 옮깁니다. (트리거 만들기 전에 실행해야 이중 가산이 없습니다)
insert into public.merit_ledger (member_code, activity, points, ref, note)
select code, 'opening', coalesce(merit_count, 0), '', '기존 누적 이월'
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
     where code = new.member_code;
  end if;
  return new;
end;
$$;

drop trigger if exists merit_ledger_after_insert on public.merit_ledger;
create trigger merit_ledger_after_insert
after insert on public.merit_ledger
for each row execute function public.merit_ledger_apply();

-- 5) 공덕 적립 단일 통로: 점수 규정은 이 함수 안에만 있습니다.
create or replace function public.grant_merit(
  p_code     text,
  p_activity text,
  p_ref      text default ''
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_points  integer;
  v_id      bigint;
  v_today   date := (now() at time zone 'Asia/Seoul')::date;
  v_giver_today integer;
  v_balance integer;
begin
  if not exists (select 1 from public.members where code = p_code) then
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

  -- 인연 전달은 하루 50,000 한도
  if p_activity = 'inyeon_giver' then
    select coalesce(sum(points), 0) into v_giver_today
      from public.merit_ledger
     where member_code = p_code and activity = 'inyeon_giver' and ledger_date = v_today;
    if v_giver_today + v_points > 50000 then
      return jsonb_build_object('earned', 0, 'reason', 'daily_cap');
    end if;
  end if;

  insert into public.merit_ledger (member_code, activity, points, ledger_date, ref)
  values (p_code, p_activity, v_points, v_today, coalesce(p_ref, ''))
  on conflict do nothing
  returning id into v_id;

  select coalesce(merit_count, 0) into v_balance from public.members where code = p_code;

  return jsonb_build_object(
    'earned', case when v_id is null then 0 else v_points end,
    'balance', v_balance,
    'reason', case when v_id is null then 'already_done' else 'ok' end
  );
end;
$$;

-- 6) 권한: 앱은 '읽기'와 grant_merit 호출만 가능, 장부에 직접 쓰기는 불가
alter table public.merit_ledger enable row level security;

drop policy if exists merit_ledger_read on public.merit_ledger;
create policy merit_ledger_read on public.merit_ledger for select using (true);

revoke insert, update, delete on public.merit_ledger from anon, authenticated;
grant select on public.merit_ledger to anon, authenticated;
grant execute on function public.grant_merit(text, text, text) to anon, authenticated;

-- 7) 점검용: 누적(members.merit_count)과 장부 합계가 다른 회원 조회 (결과가 0줄이면 정상)
-- select m.code, m.name, m.merit_count, coalesce(sum(l.points),0) as ledger_sum
--   from public.members m left join public.merit_ledger l on l.member_code = m.code
--  group by m.code, m.name, m.merit_count
-- having coalesce(m.merit_count,0) <> coalesce(sum(l.points),0);

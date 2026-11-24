-- =====================================================================
-- 🏦 인연 전달(추천인) & 신규회원공덕(추천받은 분) 5,000 -> 1,000 변경 SQL
-- 기존 누적 공덕(members.merit_count)은 일절 변경하지 않으며,
-- 이 SQL 실행 직후 발생하는 신규 추천·가입 건부터 1,000 공덕(1일 10회 한도)이 적용됩니다.
-- =====================================================================

create or replace function public.grant_merit(
  p_code      text,
  p_activity  text,
  p_ref       text default '',
  p_temple_id text default 'sowonsa'
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_points            integer;
  v_id                bigint;
  v_today             date := (now() at time zone 'Asia/Seoul')::date;
  v_giver_today_count integer;
  v_balance           integer;
  v_temple            text := coalesce(nullif(p_temple_id, ''), 'sowonsa');
begin
  -- 해당 사찰의 회원 여부 확인
  if not exists (select 1 from public.members where code = p_code and (temple_id = v_temple or temple_id is null)) then
    return jsonb_build_object('earned', 0, 'reason', 'no_member');
  end if;

  v_points := case p_activity
    when 'lantern'         then 1000
    when 'sanctuary'       then 1000
    when 'sutra'           then 1000
    when 'inyeon_giver'    then 1000
    when 'inyeon_receiver' then 1000
    else null end;

  if v_points is null then
    return jsonb_build_object('earned', 0, 'reason', 'unknown_activity');
  end if;

  -- 사찰별 인연 전달 하루 10회 한도 (1회 1,000 공덕 = 1일 최대 10,000 공덕)
  if p_activity = 'inyeon_giver' then
    select count(*) into v_giver_today_count
      from public.merit_ledger
     where temple_id = v_temple and member_code = p_code and activity = 'inyeon_giver' and ledger_date = v_today;
    if v_giver_today_count >= 10 then
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

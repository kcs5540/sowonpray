-- =====================================================================
-- 📊 제주 소원사 모바일 법당 익명 방문자 & 유입 경로 실시간 집계 테이블/RPC
-- - 로그인·전화번호 입력 없이 방문한 모든 익명 방문자를 1일 1고유방문자 기준으로 중복 제거 집계
-- - 유입 경로(네이버 블로그/클립/검색, 스레드, 인스타, 유튜브, 당근, 카톡, 직접 접속) 자동 기록
-- =====================================================================

create table if not exists public.site_visits (
  id           bigserial   primary key,
  temple_id    text        not null default 'sowonsa',
  visit_date   date        not null default (now() at time zone 'Asia/Seoul')::date,
  visitor_id   text        not null,
  source       text        not null default 'direct',
  referrer     text        not null default '',
  landing_path text        not null default '/',
  created_at   timestamptz not null default now()
);

create unique index if not exists site_visits_unique_daily
  on public.site_visits (temple_id, visit_date, visitor_id);

create index if not exists site_visits_temple_date_idx
  on public.site_visits (temple_id, visit_date desc);

alter table public.site_visits enable row level security;

-- 1) 익명 방문 기록 RPC (중복 방문 시 무시, KST 날짜 자동 적용)
create or replace function public.record_site_visit(
  p_visitor_id   text,
  p_source       text default 'direct',
  p_referrer     text default '',
  p_landing_path text default '/',
  p_temple_id    text default 'sowonsa'
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_today  date := (now() at time zone 'Asia/Seoul')::date;
  v_temple text := coalesce(nullif(p_temple_id, ''), 'sowonsa');
  v_id     bigint;
begin
  if p_visitor_id is null or length(trim(p_visitor_id)) < 4 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_visitor');
  end if;

  insert into public.site_visits (temple_id, visit_date, visitor_id, source, referrer, landing_path)
  values (
    v_temple,
    v_today,
    trim(p_visitor_id),
    coalesce(nullif(trim(p_source), ''), 'direct'),
    left(coalesce(p_referrer, ''), 300),
    left(coalesce(p_landing_path, '/'), 200)
  )
  on conflict (temple_id, visit_date, visitor_id) do nothing
  returning id into v_id;

  return jsonb_build_object('ok', true, 'inserted', v_id is not null, 'visit_date', v_today);
end;
$$;

-- 2) 관리자용 실시간 방문자 통계 조회 RPC
create or replace function public.get_site_visit_stats(
  p_temple_id text default 'sowonsa'
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_today      date := (now() at time zone 'Asia/Seoul')::date;
  v_temple     text := coalesce(nullif(p_temple_id, ''), 'sowonsa');
  v_today_cnt  integer;
  v_week_cnt   integer;
  v_total_cnt  integer;
  v_sources    jsonb;
begin
  select count(*) into v_today_cnt
    from public.site_visits
   where temple_id = v_temple and visit_date = v_today;

  select count(*) into v_week_cnt
    from public.site_visits
   where temple_id = v_temple and visit_date >= (v_today - interval '6 days')::date;

  select count(*) into v_total_cnt
    from public.site_visits
   where temple_id = v_temple;

  select coalesce(
    jsonb_agg(jsonb_build_object('source', s.source, 'count', s.cnt) order by s.cnt desc),
    '[]'::jsonb
  ) into v_sources
  from (
    select source, count(*)::integer as cnt
      from public.site_visits
     where temple_id = v_temple and visit_date >= (v_today - interval '29 days')::date
     group by source
     order by cnt desc
     limit 8
  ) s;

  return jsonb_build_object(
    'today_count', coalesce(v_today_cnt, 0),
    'week_count', coalesce(v_week_cnt, 0),
    'total_count', coalesce(v_total_cnt, 0),
    'top_sources', v_sources
  );
end;
$$;

grant execute on function public.record_site_visit(text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_site_visit_stats(text) to anon, authenticated;

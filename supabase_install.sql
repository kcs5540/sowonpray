-- ============================================================================
-- [제주 소원사 · 소원기도 (SowonPray)] Supabase 통합 클라우드 DB 원클릭 설치 스크립트
-- ============================================================================

-- 1. 사찰 마스터 테이블
CREATE TABLE IF NOT EXISTS public.temples (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    denomination VARCHAR(100) DEFAULT '대한불교 본원종',
    address TEXT,
    office_phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    bank_account TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 소원사 기본 정보 등록
INSERT INTO public.temples (id, name, denomination, address, office_phone, mobile_phone, bank_account)
VALUES (
    'sowonsa',
    '제주 소원사',
    '대한불교 본원종',
    '제주특별자치도 제주시 죽성서길 75',
    '064-805-2007',
    '010-4912-1083',
    '농협 301-0024-41 (예금주: 소원사)'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    mobile_phone = EXCLUDED.mobile_phone;

-- 2. 통합 회원 테이블 (신도 + 포교사 + 사찰본부 + 총괄대표)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temple_id VARCHAR(50) DEFAULT 'sowonsa',
    phone VARCHAR(30) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    password_pin VARCHAR(100) NOT NULL DEFAULT '0000',
    name VARCHAR(100) NOT NULL,
    dharma_name VARCHAR(100) DEFAULT '',
    birth_date VARCHAR(30) DEFAULT '',
    lunar_solar VARCHAR(20) DEFAULT '음력',
    address TEXT DEFAULT '',
    family_memo TEXT DEFAULT '',
    role VARCHAR(30) DEFAULT 'believer',
    parent_code VARCHAR(20),
    bank_name VARCHAR(50) DEFAULT '',
    bank_account VARCHAR(80) DEFAULT '',
    account_holder VARCHAR(50) DEFAULT '',
    merit_count INTEGER DEFAULT 0,
    believers_count INTEGER DEFAULT 0,
    wipae_count INTEGER DEFAULT 0,
    extra_data JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 초기 핵심 회원 등록 (김철수 총괄대표님 & 양영문 회장님 & 초기 포교사단)
INSERT INTO public.members (code, phone, password_pin, name, dharma_name, role, parent_code, bank_name, bank_account, account_holder, merit_count, believers_count)
VALUES 
    ('33065540', '010-3306-5540', '5540', '김철수', '보현행', 'master', NULL, '농협', '301-0000-0000-01', '김철수', 108, 142),
    ('49121083', '010-4912-1083', '1083', '양영문', '신도회장', 'temple_admin', NULL, '농협', '301-0024-41', '소원사', 1080, 520),
    ('52148821', '010-5214-8821', '8821', '김연화', '연화심', 'agent', '49121083', '국민', '400401-01-234567', '김연화', 49, 18),
    ('88329910', '010-8832-9910', '9910', '박보현', '보현덕', 'agent', '49121083', '신한', '110-234-567890', '박보현', 36, 12),
    ('77114420', '010-7711-4420', '4420', '이정심', '정각심', 'agent', '49121083', '농협', '352-0123-4567-89', '이정심', 21, 8)
ON CONFLICT (code) DO NOTHING;

-- 3. 대웅전 소원등 축원 및 위패 상담 신청 테이블
CREATE TABLE IF NOT EXISTS public.prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temple_id VARCHAR(50) DEFAULT 'sowonsa',
    member_code VARCHAR(20),
    agent_code VARCHAR(20),
    believer_name VARCHAR(100) NOT NULL,
    believer_phone VARCHAR(50) NOT NULL,
    wish_category VARCHAR(50) NOT NULL,
    wish_text TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'prayed',
    prayed_at VARCHAR(100) DEFAULT '제주 소원사 대웅전 축원 접수완료',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 도량 방문 & 차담·사찰 공양(식사) 사전 예약 테이블
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temple_id VARCHAR(50) DEFAULT 'sowonsa',
    member_code VARCHAR(20),
    agent_code VARCHAR(20),
    visitor_name VARCHAR(100) NOT NULL,
    visitor_phone VARCHAR(50) NOT NULL,
    visit_date VARCHAR(30) NOT NULL,
    visit_time VARCHAR(50) NOT NULL,
    headcount INTEGER DEFAULT 2,
    visit_purpose VARCHAR(100) DEFAULT '차담 및 사찰 공양(식사)',
    memo TEXT DEFAULT '',
    status VARCHAR(30) DEFAULT 'reserved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 위패 봉안 결제 및 다이나믹 수당 정산 원장 테이블
CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prayer_id UUID,
    temple_id VARCHAR(50) DEFAULT 'sowonsa',
    believer_name VARCHAR(100) NOT NULL,
    item_name VARCHAR(100) DEFAULT '생전예수재 황금위패 (1기)',
    total_amount NUMERIC DEFAULT 2000000,
    agent_1st_code VARCHAR(20),
    agent_1st_name VARCHAR(100),
    agent_2nd_code VARCHAR(20),
    agent_2nd_name VARCHAR(100),
    agent_3rd_code VARCHAR(20),
    agent_3rd_name VARCHAR(100),
    payment_status VARCHAR(30) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 보안 권한 (RLS 정책 오픈: 모바일 웹 클라이언트 실시간 읽기/쓰기 허용)
ALTER TABLE public.temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access temples" ON public.temples;
CREATE POLICY "Public access temples" ON public.temples FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access members" ON public.members;
CREATE POLICY "Public access members" ON public.members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access prayers" ON public.prayers;
CREATE POLICY "Public access prayers" ON public.prayers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access visits" ON public.visits;
CREATE POLICY "Public access visits" ON public.visits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access settlements" ON public.settlements;
CREATE POLICY "Public access settlements" ON public.settlements FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- [제주 소원사 · 소원기도 (SowonPray)] 수파베이스(Supabase) 통합 DB 스키마 (v2.0)
-- 1. 사찰 마스터 (temples)
-- 2. 통합 회원 및 포교사 계보 (members) - 기본 가입정보 + 사찰 축원 확장정보 + 정산계좌 + JSONB 자유확장
-- 3. 대웅전 소원등 축원 및 위패 상담 (prayers)
-- 4. 위패 봉안 결제 및 다이나믹 수당 정산 원장 (settlements)
-- ============================================================================

-- 1. 사찰 마스터 테이블
CREATE TABLE IF NOT EXISTS temples (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    denomination VARCHAR(100) DEFAULT '대한불교 본원종',
    address TEXT,
    office_phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    bank_account TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO temples (id, name, denomination, address, office_phone, mobile_phone, bank_account)
VALUES (
    'sowonsa',
    '제주 소원사',
    '대한불교 본원종',
    '제주특별자치도 제주시 죽성서길 75',
    '064-805-2007',
    '010-4912-1083',
    '농협 301-0024-41 (예금주: 소원사)'
)
ON CONFLICT (id) DO NOTHING;

-- 2. 통합 회원 테이블 (신도 + 포교사 + 사찰본부 + 총괄관리자 통합)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temple_id VARCHAR(50) REFERENCES temples(id) DEFAULT 'sowonsa',

    -- [A] 필수 기본 가입 정보 (전화번호 아이디 + 비밀번호 + 성함)
    phone VARCHAR(30) UNIQUE NOT NULL,       -- 휴대폰 번호 (로그인 ID, 예: '010-5214-8821')
    code VARCHAR(20) UNIQUE NOT NULL,        -- 휴대폰 뒤 8자리 고유코드 (예: '52148821')
    password_pin VARCHAR(100) NOT NULL,      -- 간편 비밀번호 (기본 4~6자리)
    name VARCHAR(100) NOT NULL,              -- 성함 (속명)

    -- [B] 사찰 축원 & 위패 봉안용 확장 정보 (선택 입력 / 추후 보완 가능)
    dharma_name VARCHAR(100) DEFAULT '',     -- 법명 (예: '무량화', '청산')
    birth_date VARCHAR(30) DEFAULT '',       -- 생년월일 (예: '1962-05-14')
    lunar_solar VARCHAR(20) DEFAULT '음력',  -- '음력' | '양력' | '음력(윤달)'
    address TEXT DEFAULT '',                 -- 거주지 주소 (대웅전 축원문 낭독용)
    family_memo TEXT DEFAULT '',             -- 가족 축원 명단 / 조상님 본관·영가 존함 메모

    -- [C] 회원 등급 및 포교 계보 정보
    role VARCHAR(30) DEFAULT 'believer',     -- 'believer'(일반신도), 'agent'(포교사), 'temple_admin'(사찰본부), 'master'(총괄대표)
    parent_code VARCHAR(20),                 -- 나를 인도/추천한 포교사 코드 (휴대폰 뒤 8자리)

    -- [D] 포교사 수당 정산용 계좌 정보
    bank_name VARCHAR(50) DEFAULT '',        -- 은행명
    bank_account VARCHAR(80) DEFAULT '',     -- 계좌번호
    account_holder VARCHAR(50) DEFAULT '',   -- 예금주

    -- [E] 신행 공덕 및 포교 활동 집계
    merit_count INTEGER DEFAULT 0,           -- 온라인 사경/기도 누적 공덕 횟수
    believers_count INTEGER DEFAULT 0,       -- 인도한 인연 신도수
    wipae_count INTEGER DEFAULT 0,           -- 위패 봉안 누적 기수

    -- [F] 만능 자유 확장 필드 (향후 기일, 차량번호 등 스키마 변경 없이 무제한 저장)
    extra_data JSONB DEFAULT '{}'::jsonb,

    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 대웅전 소원등 축원 및 위패 상담 신청 테이블
CREATE TABLE IF NOT EXISTS prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temple_id VARCHAR(50) REFERENCES temples(id) DEFAULT 'sowonsa',
    member_code VARCHAR(20) REFERENCES members(code), -- 작성 회원 코드 (뒤 8자리)
    agent_code VARCHAR(20) REFERENCES members(code),  -- 담당 인연 포교사 코드 (뒤 8자리)
    believer_name VARCHAR(100) NOT NULL,              -- 신도 성함 (법명 포함 표기)
    believer_phone VARCHAR(50) NOT NULL,              -- 신도 연락처
    wish_category VARCHAR(50) NOT NULL,               -- 가족건강, 사업번창, 생전예수재(황금위패), 조상영구위패(흑색) 등
    wish_text TEXT NOT NULL,                          -- 한 줄 발원문
    status VARCHAR(30) DEFAULT 'prayed',              -- 'prayed'(축원진행중), 'consulting'(위패상담중), 'completed'(봉안완료)
    prayed_at VARCHAR(100) DEFAULT '제주 소원사 대웅전 축원 접수완료',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 위패 봉안 결제 및 1·2·3차 + 플랫폼 총괄(5%) 수당 정산 원장 테이블
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prayer_id UUID REFERENCES prayers(id),
    temple_id VARCHAR(50) REFERENCES temples(id) DEFAULT 'sowonsa',
    believer_name VARCHAR(100) NOT NULL,
    item_name VARCHAR(100) DEFAULT '생전예수재 황금위패 (1기)',
    total_amount NUMERIC DEFAULT 2000000,

    agent_1st_code VARCHAR(20),
    agent_1st_name VARCHAR(100),
    agent_2nd_code VARCHAR(20),
    agent_2nd_name VARCHAR(100),
    agent_3rd_code VARCHAR(20),
    agent_3rd_name VARCHAR(100),

    payment_status VARCHAR(30) DEFAULT 'confirmed', -- 'confirmed'(수당확정), 'settled'(정산지급완료)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 도량 방문 & 차담·사찰 공양(식사) 사전 예약 테이블 (visits)
CREATE TABLE IF NOT EXISTS visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temple_id VARCHAR(50) REFERENCES temples(id) DEFAULT 'sowonsa',
    member_code VARCHAR(20) REFERENCES members(code), -- 예약 회원 코드 (뒤 8자리)
    agent_code VARCHAR(20) REFERENCES members(code),  -- 담당 인연 포교사 코드 (뒤 8자리)
    visitor_name VARCHAR(100) NOT NULL,               -- 방문자 성함 (법명)
    visitor_phone VARCHAR(50) NOT NULL,               -- 방문자 연락처
    visit_date VARCHAR(30) NOT NULL,                  -- 방문 예정일 (예: '2026-10-22')
    visit_time VARCHAR(50) NOT NULL,                  -- 방문 시간대 (예: '11:30 (점심 공양 및 차담)')
    headcount INTEGER DEFAULT 2,                      -- 방문 인원수
    visit_purpose VARCHAR(100) DEFAULT '차담 및 사찰 공양(식사)', -- 방문 목적
    memo TEXT DEFAULT '',                             -- 요청사항 메모
    status VARCHAR(30) DEFAULT 'reserved',            -- 'reserved'(예약접수), 'confirmed'(공양준비확정), 'visited'(방문완료)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


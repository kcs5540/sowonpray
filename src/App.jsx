import React, { useState, useEffect, useMemo } from 'react'
import {
  Flame,
  Sparkles,
  BookOpen,
  Users,
  Settings,
  Phone,
  Copy,
  CheckCircle2,
  Award,
  Heart,
  Volume2,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Coffee,
  ExternalLink,
  UserCheck,
  TrendingUp,
  PlusCircle,
  User,
  LogOut,
  KeyRound,
  Save,
  UserPlus,
  Calendar,
  Globe,
  Play,
  Pause,
  Clock,
  Headphones,
  Moon,
  VolumeX,
  Maximize2,
  Printer,
  HelpCircle,
  QrCode,
  Network,
  Calculator,
  Share2,
  X,
  ListMusic,
} from 'lucide-react'
import QRCode from 'qrcode'
import {
  INITIAL_MEMBERS,
  INITIAL_PRAYERS,
  INITIAL_SETTLEMENTS,
  INITIAL_VISITS,
  extractPhone8Code,
  formatPhone11,
  supabase,
} from './lib/supabase'

// 신행홈 상단 히어로 3종 경량 캐러셀 슬라이드 (외부 라이브러리 없이 CSS 페이드 전환으로 0KB 초경량 구동)
const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: '/images/sowonsa_real_cover_path.png',
    badge: '대웅전 부처님 전 소원 축원 진행중',
    titlePrefix: '간절한 기도가 응답받는 곳,',
    titleHighlight: '제주 소원사',
    description:
      '거리가 멀어 직접 오시지 못하는 날에도, 모바일 법당에 올리신 한 줄 소원을 제주 소원사 대웅전 부처님 전에 정성껏 축원 올립니다.',
    targetTab: 'lantern',
    ctaLabel: '무료 소원등 켜기 ▶',
  },
  {
    id: 'slide-2',
    image: '/images/sowonsa_daewoongjeon_altar.jpg',
    badge: '매일 아침 사시예불 스님 축원 도량',
    titlePrefix: '내 손안의 법당, 꺼지지 않는',
    titleHighlight: '광명 소원등',
    description:
      '불자님께서 정성껏 밝히신 소원등과 한 줄 사경의 공덕이 매일 아침 대웅전 예불 독경 소리와 함께 하늘에 닿습니다.',
    targetTab: 'sutra',
    ctaLabel: '한 줄 사경 · 경전공부 ▶',
  },
  {
    id: 'slide-3',
    image: '/images/sowonsa_real_wipae_hall.jpg',
    badge: '생전예수재 · 영구위패 · 삼성각 건립불사',
    titlePrefix: '자손만대 복밭을 일구는',
    titleHighlight: '명당 불사 도량',
    description:
      '살아생전 복을 짓는 황금위패와 조상님 극락왕생 영구위패, 칠성·산신·독성님을 모시는 삼성각 건립 불사에 동참하세요.',
    targetTab: 'bulsa',
    ctaLabel: '위패 · 삼성각 불사 안내 ▶',
  },
]

// 각 기원 분야별 대웅전 정통 예시 발원문 (직접 작성하지 않고도 그대로 올릴 수 있도록 지원)
const PRAYER_CATEGORY_TEMPLATES = {
  // 1. 소원등 6대 기원 분야
  가족건강:
    '지극한 정성으로 발원하오니, 우리 가족 모두 병고 없이 무병장수하고 화목과 평안이 늘 함께하기를 지심귀명례합니다.',
  사업번창:
    '부처님의 자비 광명 속에 경영하는 사업이 날로 번창하고, 귀인과 좋은 인연이 모여 재물과 복덕이 가득하기를 발원합니다.',
  '학업/시험합격':
    '지혜의 빛으로 마음을 밝혀 주시어, 원하는 시험에 원만히 합격하고 뜻한 학업의 길을 지혜롭게 펼쳐나가기를 발원합니다.',
  '마음평안/소원성취':
    '마음속 온갖 번뇌와 근심이 눈 녹듯 사라지고, 가슴 깊이 품은 간절한 소원이 부처님 가피로 원만 성취되기를 발원합니다.',
  '자녀축복/취업성취':
    '사랑하는 자녀의 앞길을 자비로 인도하시어, 원하는 곳에 취업 성공하고 뜻한 포부를 당당히 펼치기를 지심으로 발원합니다.',
  '액운소멸/무병장수':
    '올 한 해 모든 삼재와 액난이 맑게 소멸되고, 건강과 장수의 큰 복을 누리며 만사형통하기를 간절히 발원합니다.',

  // 2. 불사 및 특별기도 분야 (가벼운 일상 공덕 순서로 정렬)
  '대웅전 공양미/불전시주':
    '대웅전 삼존불 전에 청정한 공양미와 시주를 올리오니, 지은 공덕이 온 가족의 복락으로 널리 회향되기를 발원합니다.',
  '대웅전 1년 인등(가족등)':
    '대웅전 부처님 전에 1년 가족 인등을 정성껏 밝히오니, 365일 지혜와 건강의 밝은 빛이 늘 함께하기를 발원합니다.',
  '100일 소원성취 특별기도':
    '대웅전 부처님 전에 100일 동안 정성을 다해 올리는 지극한 기도로써, 온 가족의 건강과 뜻한 소원이 원만 성취되기를 발원합니다.',
  '49재/천도재/기일제사':
    '인연 있는 조상 영가님들의 극락왕생을 지극한 마음으로 발원하오며, 정성껏 천도재 및 기일 축원을 올립니다.',
  '삼성각 소원기와불사':
    '제주 소원사 삼성각 지붕 기와에 가족의 소원을 얹어 올리오니, 온 집안이 평안하고 가업이 번영하기를 발원합니다.',
  '삼성각 기둥·단청불사':
    '삼성각 기둥 및 단청 불사에 정성껏 동참하오니, 삼재팔난을 소멸하고 자손 대대로 무량복덕을 누리기를 발원합니다.',
  '삼성각 영구축원명패':
    '제주 소원사 삼성각 영구축원명패 봉안을 발원하며, 가문 대대로 조상 은덕과 부처님 가피가 충만하기를 축원합니다.',
  '생전예수재(황금위패)':
    '생전에 미리 공덕을 닦아 사후의 안락을 구하오며, 부모님과 가족의 무량복덕을 위해 황금위패 봉안을 지극한 마음으로 발원합니다.',
  '조상영구위패(흑색)':
    '대대로 은혜로운 조상 선망 영가님들의 극락왕생을 발원하오며, 가문의 번영과 자손들의 평안을 위해 영구위패 봉안을 축원합니다.',
  '기타 특별기도 상담':
    '간절한 소원 성취와 가정의 평안을 위하여, 제주 소원사 종무소와 정성껏 특별기도 상담을 희망합니다.',
}

// 사찰 방문 및 차담·공양 예약 시간대 & 목적 슬롯 (한눈에 선택하는 원터치 버튼)
const VISIT_TIME_SLOTS = [
  {
    time: '오전 10:30',
    fullTime: '오전 10:30 (참배·차담)',
    title: '참배 · 차담',
    purpose: '도량 참배 및 따뜻한 차담 예약',
  },
  {
    time: '오전 11:30',
    fullTime: '오전 11:30 (점심공양)',
    title: '점심공양 (식사)',
    purpose: '따뜻한 차 & 사찰 공양(식사) 대접 예약',
    badge: '인기',
  },
  {
    time: '오후 02:00',
    fullTime: '오후 02:00 (오후차담)',
    title: '스님 차담 · 상담',
    purpose: '스님 신행 상담 및 차담 예약',
  },
  {
    time: '오후 04:00',
    fullTime: '오후 04:00 (오후참배)',
    title: '오후 기도 · 참배',
    purpose: '가족 기도 및 도량 참배 예약',
  },
]


// ============================================================================
// 포교자 회원유치 조직도 트리 뷰 (MetaFastest 스타일 모바일 계층 트리)
// ============================================================================
function OrganizationTreeView({
  members,
  rootCode = null,
  activeAgentCode = null,
  title = '포교자 회원유치 조직도 (Tree View)',
  onSelectMember,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCodes, setExpandedCodes] = useState(() => {
    // 기본적으로 상위 계보 노드(김철수, 양영문, 유광수, 오수미 등)를 모두 펼쳐둠
    const topCodes = members
      .filter(
        (m) =>
          !m.parent_code ||
          m.role === 'master' ||
          m.role === 'temple_admin' ||
          m.role === 'agent' ||
          m.code === '33065540' ||
          m.code === '55570267' ||
          m.code === '49121083' ||
          m.code === '53872248'
      )
      .map((m) => m.code)
    return new Set(topCodes)
  })

  // 멤버 데이터가 클라우드에서 동기화될 때 상위 계보 노드 자동 펼침 유지
  useEffect(() => {
    if (members && members.length > 0) {
      setExpandedCodes((prev) => {
        const next = new Set(prev)
        members.forEach((m) => {
          if (
            !m.parent_code ||
            m.role === 'master' ||
            m.role === 'temple_admin' ||
            m.role === 'agent' ||
            m.code === '33065540' ||
            m.code === '55570267' ||
            m.code === '49121083' ||
            m.code === '53872248'
          ) {
            next.add(m.code)
          }
        })
        return next
      })
    }
  }, [members])

  // 검색어가 있을 때 매칭되는 멤버 및 상위 부모 노드 자동 펼침
  useEffect(() => {
    if (!searchQuery.trim()) return
    const q = searchQuery.trim().toLowerCase()
    const matched = members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.dharma_name && m.dharma_name.toLowerCase().includes(q)) ||
        m.code.includes(q) ||
        (m.phone && m.phone.includes(q))
    )
    const toExpand = new Set(expandedCodes)
    matched.forEach((m) => {
      let curr = m
      while (curr && curr.parent_code) {
        toExpand.add(curr.parent_code)
        curr = members.find((p) => p.code === curr.parent_code)
      }
      toExpand.add(m.code)
    })
    setExpandedCodes(toExpand)
  }, [searchQuery])

  const toggleExpand = (code) => {
    setExpandedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedCodes(new Set(members.map((m) => m.code)))
  }

  const collapseAll = () => {
    setExpandedCodes(new Set())
  }

  // 자식 노드 맵 (parent_code -> children[])
  const childrenMap = useMemo(() => {
    const map = {}
    members.forEach((m) => {
      const parent = m.parent_code || '__ROOT__'
      if (!map[parent]) map[parent] = []
      map[parent].push(m)
    })
    return map
  }, [members])

  // 렌더링 시작할 루트 노드들
  const rootNodes = useMemo(() => {
    if (rootCode) {
      const found = members.find((m) => m.code === rootCode)
      return found ? [found] : []
    }
    const roots = members.filter((m) => !m.parent_code || m.role === 'master')
    return roots.length ? roots : [members[0]]
  }, [members, rootCode])

  // 개별 노드 렌더러
  const renderNode = (node, depth = 0) => {
    const children = childrenMap[node.code] || []
    const hasChildren = children.length > 0
    const isExpanded = expandedCodes.has(node.code)
    const isMatched =
      searchQuery.trim() &&
      (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.dharma_name && node.dharma_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        node.code.includes(searchQuery))

    // 역할별 배지 라벨 및 스타일 (대외적으로 김철수 총괄도 '포교위원장'으로 동등하게 표기)
    const getRoleBadge = (role) => {
      switch (role) {
        case 'master':
          return { label: '포교위원장', bg: 'bg-[#C59B27] text-[#120F0D]' }
        case 'temple_admin':
          return { label: '창건주 · 신도회장', bg: 'bg-[#8A6510] text-white' }
        case 'agent':
        case 'committee_head':
          return { label: '포교위원장', bg: 'bg-emerald-700 text-white' }
        case 'committee_member':
          return { label: '포교위원', bg: 'bg-teal-700 text-white' }
        case 'believer':
        default:
          return { label: '신도', bg: 'bg-[#2E2822] text-[#D8CFBF]' }
      }
    }
    const roleBadge = getRoleBadge(node.role)

    return (
      <div key={node.code} className="select-none text-left">
        <div
          onClick={() => {
            if (hasChildren) toggleExpand(node.code)
            if (onSelectMember) onSelectMember(node)
          }}
          style={{ paddingLeft: `${depth * 15 + 6}px` }}
          className={`py-1.5 pr-2 rounded-lg flex items-center justify-between gap-1.5 transition cursor-pointer ${
            isMatched
              ? 'bg-[#C59B27]/30 border border-[#F5D061]'
              : node.code === activeAgentCode
              ? 'bg-white/10 border border-[#C59B27]/40'
              : 'hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <span className="w-4 h-4 flex items-center justify-center text-[#F5D061] shrink-0 font-bold text-[10px]">
                {isExpanded ? '▼' : '▶'}
              </span>
            ) : (
              <span className="w-4 h-4 flex items-center justify-center text-[#6E6356] shrink-0 text-[10px]">
                •
              </span>
            )}

            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-[11px] font-bold text-white truncate">
                {node.name}
                {node.dharma_name ? ` (${node.dharma_name})` : ''}
              </span>
              <span className="text-[10px] text-[#A69B8D] shrink-0 font-mono">
                {node.code}
              </span>
              <span
                className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${roleBadge.bg}`}
              >
                {roleBadge.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9.5px] text-[#C59B27] shrink-0 font-semibold">
            {hasChildren && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-[9px] text-[#F5D061]">
                인연 {children.length}분
              </span>
            )}
          </div>
        </div>

        {/* 하위 자식 노드 재귀 렌더링 */}
        {hasChildren && isExpanded && (
          <div className="border-l border-white/10 ml-4">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[#12100E] rounded-2xl p-4 border border-[#C59B27]/40 shadow-xl space-y-3 text-white">
      {/* 헤더 및 전체 접기/펼치기 컨트롤 */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F5D061] shrink-0 animate-pulse" />
          <h4 className="font-serif-kr text-xs sm:text-sm font-bold text-[#F5D061] truncate">
            {title}
          </h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[10px] text-[#E8DFD1] transition whitespace-nowrap"
          >
            모두 펼치기
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-[10px] text-[#E8DFD1] transition whitespace-nowrap"
          >
            모두 접기
          </button>
        </div>
      </div>

      {/* 검색창 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="도반 성함 또는 인연코드로 찾기"
            className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-[#201B17] border border-[#C59B27]/40 text-[11px] text-white placeholder-[#786E63] focus:outline-none focus:border-[#F5D061]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9E9283] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => {}}
          className="px-3.5 py-1.5 rounded-xl bg-[#342D26] hover:bg-[#433A31] border border-[#C59B27]/40 text-[11px] font-bold text-[#F5D061] transition shrink-0"
        >
          검색
        </button>
      </div>

      {/* 트리 노드 목록 영역 */}
      <div className="max-h-[380px] overflow-y-auto pr-1 space-y-0.5 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/20">
        {rootNodes.map((root) => renderNode(root, 0))}
      </div>
    </div>
  )
}

// 오늘의 부처님 말씀 데이터 (7선)
const DAILY_QUOTES = [
  {
    verse: '마음은 모든 법의 근본이니, 마음이 으뜸이 되어 모든 것을 이룬다.',
    source: '법구경 (法句經) 제1장 쌍품',
    commentary: '오늘 하루 맑고 자비로운 마음으로 건네는 따뜻한 말 한마디가 나와 가족의 무량한 복덕이 됩니다.',
  },
  {
    verse: '비록 천 마디의 말이라도 쓸모없는 말보다는, 듣고서 마음이 평화로워지는 한 마디의 법문이 더 낫다.',
    source: '법구경 (法句經) 제8장 천품',
    commentary: '잠시 호흡을 가다듬고 내 안의 부처님을 마주하는 고요한 시간을 가져보세요.',
  },
  {
    verse: '향기로운 꽃이라도 빛깔만 곱고 향기가 없으면 열매가 없듯, 좋은 말도 실천하지 않으면 공덕이 없다.',
    source: '법구경 (法句經) 제4장 화품',
    commentary: '오늘 소원등 하나를 밝히는 작은 정성이 내일의 큰 광명으로 돌아옵니다.',
  },
  {
    verse: '방울물이 끊임없이 떨어져 마침내 물독을 채우듯, 지혜로운 이는 작은 선행을 꾸준히 쌓아 큰 복덕을 이룬다.',
    source: '법구경 (法句經) 제9장 악품',
    commentary: '매일 모바일 법당을 찾아 올리시는 짧은 기도와 사경이 모여 가정의 큰 평안을 이룹니다.',
  },
  {
    verse: '연꽃이 더러운 진흙 속에서 피어나되 진흙에 물들지 않듯, 지혜로운 이는 세상의 근심 속에서도 마음이 흔들리지 않는다.',
    source: '숫타니파타 (경집)',
    commentary: '주변 일이 어수선할수록 내 마음의 중심을 부처님께 두고 평온함을 지켜보세요.',
  },
  {
    verse: '성내는 마음을 자비로 이기고, 악한 것을 선한 것으로 이기며, 인색함을 베풂으로 이기고, 거짓을 진실로 이겨라.',
    source: '법구경 (法句經) 제17장 분노품',
    commentary: '내가 먼저 베푼 따뜻한 미소와 너그러움이 모든 액난을 물리치는 가장 큰 호신불입니다.',
  },
  {
    verse: '지극한 마음으로 부처님을 생각하고 이름을 부르면, 그 사람은 현세에 마땅히 무량한 복과 안락을 얻으리라.',
    source: '불설무량수경 (佛說無量壽經)',
    commentary: '제주 소원사 대웅전 부처님께서 불자님의 간절한 발원을 늘 굽어살피고 계십니다.',
  },
]

// 사경 구절 목록 (8대 핵심 경전·진언)
const SUTRA_LIST = [
  {
    id: 'sutra-1',
    shortName: '반야심경',
    title: '반야심경 핵심구절',
    hanja: '色卽是空 空卽是色',
    text: '색즉시공 공즉시색 수상행식 역부여시',
    meaning: '형상 있는 것이 곧 비어있음이요, 비어있음이 곧 형상 있는 것이니라.',
  },
  {
    id: 'sutra-2',
    shortName: '육자진언',
    title: '관세음보살 육자진언',
    hanja: '唵 嘛 呢 叭 咪 吽',
    text: '옴 마니 반메 훔 옴 마니 반메 훔',
    meaning: '관세음보살님의 한없는 자비와 지혜로 모든 액난이 소멸하고 소원이 성취되기를 발원합니다.',
  },
  {
    id: 'sutra-3',
    shortName: '천수경',
    title: '천수경 정구업진언',
    hanja: '修利修利 摩訶修利',
    text: '수리수리 마하수리 수수리 사바하',
    meaning: '입으로 지은 모든 그릇된 업을 맑게 씻어내고 청정한 기도가 하늘에 닿기를 발원합니다.',
  },
  {
    id: 'sutra-4',
    shortName: '금강경',
    title: '금강경 사구게',
    hanja: '凡所有相 皆是虛妄',
    text: '범소유상 개시허망 약견제상비상 즉견여래',
    meaning: '무릇 형상이 있는 것은 모두 허망하니, 상이 상 아님을 보면 곧 부처님을 친견하리라.',
  },
  {
    id: 'sutra-5',
    shortName: '약사여래',
    title: '약사여래 무병장수 기원',
    hanja: '南無 藥師琉璃光如來',
    text: '나무 약사여래불 몸과 마음의 병이 소멸하소서',
    meaning: '대인의 명의이신 약사여래 부처님의 가피로 온 가족이 아픔 없이 건강하기를 발원합니다.',
  },
  {
    id: 'sutra-6',
    shortName: '법구경',
    title: '법구경 칠불통계게',
    hanja: '諸惡莫作 衆善奉行',
    text: '모든 악을 짓지 말고 온갖 선을 받들어 행하라',
    meaning: '스스로 그 마음을 맑게 하는 것, 이것이 과거·현재·미래 모든 부처님의 가르침이니라.',
  },
  {
    id: 'sutra-7',
    shortName: '화엄경',
    title: '화엄경 일체유심조',
    hanja: '一切唯心造',
    text: '모든 것은 오직 내 한마음이 짓는 것이니라',
    meaning: '맑은 마음을 품으면 복덕의 길이 열리고, 감사의 마음을 품으면 극락이 눈앞에 열립니다.',
  },
  {
    id: 'sutra-8',
    shortName: '지장보살',
    title: '지장보살 극락왕생 발원',
    hanja: '南無 大願本尊 地藏菩薩',
    text: '나무 지장보살 마하살 조상님의 극락왕생을 발원합니다',
    meaning: '지옥이 텅 빌 때까지 성불을 미루신 지장보살님의 원력으로 조상 영가의 안식을 기원합니다.',
  },
]

// 오늘 나의 연꽃 말씀 뽑기 (제비뽑기 화두 6선)
const LOTUS_FORTUNES = [
  {
    badge: '제1연꽃 · 만사형통의 지혜',
    quote: '“급히 먹는 밥이 체하듯, 복도 익을 시간이 필요합니다.”',
    source: '법구경 · 인연의 가르침',
    advice:
      '지금 마음속에 품고 계신 간절한 소원이 이미 씨앗을 틔웠습니다. 조급한 마음을 잠시 내려놓고 오늘 하루 따뜻한 말 한마디의 보시를 실천해 보세요. 생각지 못한 귀인의 도움으로 막혔던 길이 순조롭게 열립니다.',
  },
  {
    badge: '제2연꽃 · 가내평안의 가피',
    quote: '“연꽃은 진흙 속에서 피어나되 진흙에 물들지 않는다.”',
    source: '숫타니파타',
    advice:
      '주변 상황이 다소 어수선하더라도 불자님의 중심만 흔들리지 않으면 아무런 해를 입지 않습니다. 가족이나 자녀를 향한 걱정을 부처님께 맡기시고 편안한 호흡을 세 번 길게 내쉬어 보세요.',
  },
  {
    badge: '제3연꽃 · 무병장수의 축복',
    quote: '“마음이 평안하면 몸의 기운이 절로 맑아지고 백병이 물러간다.”',
    source: '약사여래본원경',
    advice:
      '오늘은 나를 먼저 아끼고 돌보아야 하는 날입니다. 따뜻한 차 한 잔으로 몸을 데우고, 내 몸 구석구석에 고맙다는 인사를 건네보세요. 건강의 기운이 한층 회복됩니다.',
  },
  {
    badge: '제4연꽃 · 재물·공덕의 열매',
    quote: '“한 개의 등불로 천 년의 어둠을 밝히고, 한 줌의 베풂으로 만석의 복을 짓는다.”',
    source: '현우경 · 빈자일등',
    advice:
      '내가 먼저 베푼 작은 친절과 기도가 부메랑처럼 큰 복덕이 되어 돌아오는 시기입니다. 눈앞의 작은 손해에 연연하지 마시고 넓은 마음을 쓰시면 더 큰 재물과 인연이 찾아옵니다.',
  },
  {
    badge: '제5연꽃 · 인연화합의 등불',
    quote: '“옷깃만 스쳐도 오백 겁의 인연이니, 눈앞의 사람을 부처님처럼 대하라.”',
    source: '화엄경 · 보현행원품',
    advice:
      '가까운 가족이나 지인에게 먼저 따뜻한 안부를 건네보세요. 서운했던 감정이 눈 녹듯 풀리고, 오랜만에 반가운 소식이 들려올 징조입니다.',
  },
  {
    badge: '제6연꽃 · 소원성취의 서광',
    quote: '“지극한 정성으로 부르면 관세음보살님은 즉시 그 소리를 살피신다.”',
    source: '묘법연화경 관세음보살보문품',
    advice:
      '혼자서 끙끙 앓던 고민이 해결의 실마리를 찾게 됩니다. 대웅전 부처님 전에 밝힌 불자님의 소원등이 어두운 밤길을 비추는 등대가 되어 줄 것입니다.',
  },
]

// 상황별 불교 명언 & 마음 처방전
const WISDOM_BY_MOOD = [
  {
    id: 'anxious',
    label: '🌿 불안·걱정될 때',
    title: '불안하고 앞일이 걱정될 때의 처방',
    items: [
      {
        quote: '지나간 과거를 쫓지 말고, 아직 오지 않은 미래를 앞당겨 근심하지 말라. 오직 지금 이 순간에 깨어 있으라.',
        author: '부처님 (중아함경)',
        comment: '우리가 하는 걱정의 90%는 일어나지 않을 일입니다. 지금 숨 쉬고 있는 이 순간의 평안에 마음을 머물러 보세요.',
      },
      {
        quote: '산은 산이요 물은 물이로다. 구름이 끼어도 태양은 그 자리에 늘 빛나고 있다.',
        author: '성철 대종사',
        comment: '근심이라는 먹구름이 잠시 마음을 가렸을 뿐, 불자님 안의 지혜와 복덕은 조금도 사라지지 않았습니다.',
      },
      {
        quote: '두려움은 마음이 만들어낸 그림자일 뿐입니다. 등불을 켜면 그림자는 스스로 사라집니다.',
        author: '원효 대사',
        comment: '관세음보살 명호를 열 번만 나직이 불러보세요. 마음의 등불이 켜지면 불안은 저절로 물러갑니다.',
      },
    ],
  },
  {
    id: 'family',
    label: '👨‍👩‍👧 가족·자녀 기도',
    title: '자녀와 가족 일로 애가 탈 때의 처방',
    items: [
      {
        quote: '부모가 자식을 사랑하듯 모든 생명을 자비로 감싸면, 그 자비의 기운이 다시 내 자식을 지켜주는 가장 튼튼한 갑옷이 된다.',
        author: '숫타니파타 (자비경)',
        comment: '자녀를 향한 조바심 대신 축복의 기도를 보내주세요. 부모의 불안보다 부모의 평안한 기도가 자녀에게 훨씬 큰 힘이 됩니다.',
      },
      {
        quote: '꽃마다 피어나는 계절이 다르듯, 사람마다 복이 만개하는 시절인연이 따로 있다.',
        author: '법정 스님',
        comment: '자녀의 시험·취업·혼사가 남보다 조금 늦더라도 걱정하지 마세요. 더 깊고 단단한 뿌리를 내리는 중입니다.',
      },
      {
        quote: '가정이 화목하면 가난해도 극락이요, 마음이 맞지 않으면 만석꾼이라도 고해(苦海)니라.',
        author: '불설부모은중경',
        comment: '오늘 가족에게 조언 대신 “늘 고맙고 믿는다”는 한마디를 건네보세요. 집안의 기운이 즉시 밝아집니다.',
      },
    ],
  },
  {
    id: 'angry',
    label: '🔥 화나고 답답할 때',
    title: '억울하고 화가 가라앉지 않을 때의 처방',
    items: [
      {
        quote: '성내는 마음은 타오르는 숯불을 손에 쥐고 남에게 던지려는 것과 같아서, 남을 맞추기 전에 내 손부터 먼저 태운다.',
        author: '법구경 (분노품)',
        comment: '미운 사람 때문에 내 소중한 마음밭을 태우지 마세요. 숯불을 내려놓는 것은 상대를 위한 것이 아니라 나를 지키는 일입니다.',
      },
      {
        quote: '누군가 나에게 욕이라는 선물을 주었을 때, 내가 받지 않으면 그 선물은 누구의 것이 되겠느냐.',
        author: '부처님 (잡아함경)',
        comment: '남의 무례한 말이나 행동을 내 마음 방 안에 들여놓지 마세요. “그럴 수도 있겠구나” 하고 흘려보내면 내 마음은 고요해집니다.',
      },
      {
        quote: '물이 깊으면 소리가 나지 않고, 마음이 넓으면 작은 돌멩이 하나에 출렁이지 않는다.',
        author: '경허 선사',
        comment: '잠시 눈을 감고 싱잉볼(법종) 소리를 들으며 세 번만 깊게 숨을 내쉬어 보세요.',
      },
    ],
  },
  {
    id: 'wish',
    label: '🌅 새출발·소원성취',
    title: '간절한 소원과 새로운 시작을 앞둘 때',
    items: [
      {
        quote: '방울물이 끊임없이 떨어져 마침내 큰 바위를 뚫듯, 매일 쌓은 작은 기도와 정성은 반드시 큰 소원을 이룬다.',
        author: '법구경',
        comment: '오늘 밝힌 소원등 하나, 오늘 읽은 경전 한 줄이 모여 불자님의 소원을 이루는 결정적인 인연이 됩니다.',
      },
      {
        quote: '간절히 원하고 바른 씨앗을 심으면, 하늘과 땅과 부처님이 함께 그 길을 돕는다.',
        author: '화엄경',
        comment: '흔들리지 않는 믿음(信)이 모든 공덕의 어머니입니다. 제주 소원사 대웅전 부처님께서 늘 함께하십니다.',
      },
      {
        quote: '오늘 내딛는 한 걸음이 곧 천 리 길의 시작이니, 두려워 말고 기쁜 마음으로 나아가라.',
        author: '보조국사 지눌',
        comment: '시작할 수 있다는 것 자체가 이미 큰 복입니다. 밝은 얼굴로 새 날을 맞이해 보세요.',
      },
    ],
  },
]

// 어르신 눈높이 쉬운 3분 경전 & 불교 상식 공부 (총 15강 · 매일 5강씩 자동 추천 순환)
const SUTRA_STUDY_LESSONS = [
  {
    id: 'lesson-1',
    category: '경전 핵심 풀이 1강',
    title: '《반야심경》 260자, 왜 모든 예불마다 외울까요?',
    summary: '불교 경전 8만 4천 법문 중 가장 핵심만 응축한 지혜의 결정체입니다.',
    keyPhrase: '색즉시공 공즉시색 (色卽是空 空卽是色)',
    content: [
      '절에 가면 가장 많이 듣고 외우는 경전이 바로 《마하반야바라밀다심경》, 줄여서 《반야심경》입니다. 팔만대장경 중에서도 부처님의 지혜(반야)의 심장(心)만 추려 놓아 단 260자로 이루어져 있습니다.',
      '가장 유명한 “색즉시공 공즉시색”에서 ‘색(色)’은 내 몸, 재물, 환경처럼 눈에 보이는 모든 것이고, ‘공(空)’은 영원히 고정된 것은 없으며 인연 따라 변한다는 뜻입니다.',
      '즉 “지금 겪는 괴로움이나 병고도 영원히 묶여 있는 것이 아니니 집착하거나 낙심하지 말라”는 부처님의 가장 큰 위로이자 희망의 선언입니다.',
      '마지막 구절 “아제아제 바라아제 바라승아제 모지 사바하”는 “가자, 가자, 괴로움 없는 지혜의 언덕으로 함께 건너가자!”라는 축원의 주문입니다.',
    ],
  },
  {
    id: 'lesson-2',
    category: '경전 핵심 풀이 2강',
    title: '《천수경》의 “수리수리 마하수리”는 무슨 뜻인가요?',
    summary: '천 개의 손과 천 개의 눈으로 중생을 구원하시는 관세음보살님의 경전입니다.',
    keyPhrase: '수리수리 마하수리 수수리 사바하',
    content: [
      '우리나라 불자님들이 가장 사랑하는 경전이 바로 《천수경(千手經)》입니다. 고통받는 중생을 한 사람도 빠짐없이 건지시려고 천 개의 손과 천 개의 눈을 나투신 관세음보살님의 자비를 담고 있습니다.',
      '첫머리에 외우는 “수리수리 마하수리 수수리 사바하”는 ‘정구업진언(淨口業眞言)’, 즉 “우리가 살아오며 입으로 지은 미운 말, 거짓말, 원망의 업을 깨끗이 씻어내고 맑은 입으로 기도하겠습니다”라는 뜻입니다.',
      '천수경을 한 편 읽거나 듣기만 해도 집안의 우환이 물러가고 관세음보살님의 따스한 보살핌이 머문다고 전해집니다.',
    ],
  },
  {
    id: 'lesson-3',
    category: '경전 핵심 풀이 3강',
    title: '《금강경》이 말하는 “복을 가장 크게 받는 비결”',
    summary: '다이아몬드(금강석)처럼 단단하여 어떤 시련에도 깨지지 않는 마음 공부입니다.',
    keyPhrase: '응무소주 이생기심 (應無所住 而生其心)',
    content: [
      '조계종을 비롯한 한국 불교의 소의경전(가장 중심이 되는 경전)이 바로 《금강반야바라밀경》입니다.',
      '금강경의 핵심 구절인 “응무소주 이생기심”은 “마음을 어느 한 곳에 집착해 묶어두지 말고, 자유롭고 맑은 마음을 내라”는 뜻입니다.',
      '특히 남에게 베풀거나 기도를 올릴 때 ‘무주상보시(바라는 집착 없이 순수하게 베푸는 마음)’로 행하면, 그 복덕이 하늘과 땅처럼 헤아릴 수 없이 커진다고 부처님께서 약속하셨습니다.',
    ],
  },
  {
    id: 'lesson-4',
    category: '사찰 불사 상식 4강',
    title: '‘생전 예수재(황금위패)’와 ‘조상 영구위패’는 어떻게 다른가요?',
    summary: '살아계신 분의 수명장수 복덕을 짓는 예수재와, 조상님 극락왕생을 모시는 영구위패의 의미입니다.',
    keyPhrase: '생전 수복증장 · 사후 극락왕생',
    content: [
      '① 생전 예수재(生前預修齋) 황금위패: ‘미리 예(預), 닦을 수(修)’ 자를 씁니다. 즉 돌아가신 뒤에 치르는 재가 아니라, 살아생전에 내 몫의 공덕과 선업을 미리 닦아 두어 삼재팔난과 액운을 소멸하고 부모님·본인의 무병장수와 현세 복덕을 넓히는 가장 수승한 불사입니다.',
      '② 조상 영가 흑색 영구위패: 돌아가신 부모·조상님이나 수자령(태아령)의 위패를 대웅전 법당에 영구히 모셔, 바쁜 후손들을 대신해 사찰에서 매일 아침 예불과 명절 합동 차례·천도 축원을 끊임없이 올려드리는 효(孝)의 불사입니다.',
      '조상님이 편안하셔야 후손의 가정이 화목하고 자손이 번창한다는 것이 불교 인연법의 핵심입니다.',
    ],
  },
  {
    id: 'lesson-5',
    category: '사찰 대작불사 5강',
    title: '‘삼성각(三聖閣) 건립 불사’ — 칠성·산신·독성님의 가피와 자손만대 복덕',
    summary: '수명장수·재물성취·소원성취의 세 분 성인을 모시는 삼성각 건립 불사의 무량한 공덕입니다.',
    keyPhrase: '기와 한 장, 기둥 하나에 새긴 정성이 자손만대의 복전이 됩니다',
    content: [
      '사찰에서 가장 영험한 기도처로 꼽히는 전각이 바로 세 분의 성인을 모신 ‘삼성각(三聖閣)’입니다. ① 자손 번창과 무병장수를 관장하시는 ‘칠성(치성광여래)님’, ② 도량 수호와 재물·사업 번창을 돕는 ‘산신님’, ③ 홀로 깨달아 말세 중생의 간절한 소원을 가장 빠르게 들어주시는 ‘독성(나반존자)님’을 함께 모십니다.',
      '예로부터 불교에서는 “법당과 성전을 짓는 건립 불사(기와·주춧돌·단청 시주)에 한 번 동참하는 공덕은 수천 번의 일반 보시보다 크며, 그 전각이 도량에 서 있는 한 후손 대대로 액운을 피하고 귀인의 도움을 받는다”고 전해집니다.',
      '제주 소원사 삼성각 건립 불사에 가족의 이름과 발원을 올리시면, 칠성·산신·독성 세 분 성인의 가피 속에 가정이 평안하고 자손의 앞길이 활짝 열리는 천년의 복밭(福田)을 일구게 됩니다.',
    ],
  },
  {
    id: 'lesson-6',
    category: '불교 예화 & 예절 6강',
    title: '가난한 여인의 꺼지지 않는 등불 — ‘빈자일등(貧者一燈)’ 이야기',
    summary: '부처님 전에 소원등 하나를 밝히는 공덕이 왜 그렇게 큰지 알려주는 감동 실화입니다.',
    keyPhrase: '지극한 정성으로 밝힌 등불 하나는 결코 꺼지지 않는다',
    content: [
      '부처님 당시 왕과 부자들이 수만 개의 화려한 기름등을 밝혔고, 가난한 여인 ‘난타’는 끼니를 아껴 마련한 동전 두 닢으로 작은 등불 하나를 정성껏 밝혔습니다.',
      '밤이 깊어 거센 바람이 불자 왕과 부자들의 화려한 등불은 모두 꺼졌지만, 가난한 여인이 간절한 서원으로 밝힌 작은 등불 하나만은 밤새도록 꺼지지 않고 빛났습니다.',
      '부처님께서는 “재물의 많고 적음이 아니라, 간절하고 청정한 마음으로 밝힌 등불 하나가 온 우주를 밝히는 무량한 공덕이 된다”고 말씀하셨습니다. 모바일 법당에서 매일 정성껏 켜시는 소원등도 이와 똑같은 광명의 공덕이 됩니다.',
    ],
  },
  {
    id: 'lesson-7',
    category: '경전 핵심 풀이 7강',
    title: '《지장경》과 지장보살님 — 부모·조상님을 극락으로 모시는 효(孝)의 경전',
    summary: '지옥의 모든 중생이 다 구원받기 전에는 성불하지 않겠다는 대원력의 보살님입니다.',
    keyPhrase: '지옥미공 서불성불 (地獄未空 誓不成佛)',
    content: [
      '《지장보살본원경(지장경)》은 부처님께서 도리천에 올라가 어머니 마야부인을 위해 설하신 ‘불교 최고의 효도 경전’입니다.',
      '지장보살님은 “지옥이 텅 비기 전에는 결코 부처가 되지 않겠다”는 눈물겨운 서원을 세우시고, 돌아가신 부모님과 조상님, 그리고 미처 빛을 보지 못한 수자령(태아령)의 손을 잡아 극락으로 인도해 주십니다.',
      '후손이 지장보살님 전에 조상님의 영구위패를 모시고 정성껏 기도하면, 조상님은 고통을 여의고 후손에게는 가내 평안과 자손 창성의 큰 복이 돌아옵니다.',
    ],
  },
  {
    id: 'lesson-8',
    category: '경전 핵심 풀이 8강',
    title: '《약사경》 약사여래불 — 몸과 마음의 병고를 씻어주시는 치유의 부처님',
    summary: '왼손에 약합(약병)을 들고 중생의 질병과 우환을 고쳐주시는 부처님입니다.',
    keyPhrase: '나무 약사유리광여래불 (南無 藥師琉璃光如來佛)',
    content: [
      '법당에서 왼손에 동그란 약합(약병)을 들고 계신 부처님을 뵈면 바로 ‘약사여래부처님(약사유리광여래)’이십니다.',
      '《약사여래본원경》에서는 약사여래부처님의 명호를 지극한 마음으로 부르고 기도하면, 육신의 크고 작은 질병뿐만 아니라 마음의 불안과 액운까지 맑은 유리빛 광명으로 치유해 주신다고 설합니다.',
      '가족 중에 몸이 편찮으신 분이나 건강 회복, 수술 무사 쾌유를 발원하실 때 약사여래불을 생각하며 소원등을 밝히시면 큰 가피가 함께합니다.',
    ],
  },
  {
    id: 'lesson-9',
    category: '경전 핵심 풀이 9강',
    title: '《법화경》의 핵심 — “누구나 부처가 될 귀한 씨앗을 품고 있습니다”',
    summary: '진흙 속에서 가장 맑고 향기로운 연꽃이 피어나듯, 우리 모두는 존귀한 존재입니다.',
    keyPhrase: '일체중생 실유불성 (一切衆生 悉有佛性)',
    content: [
      '《묘법연화경》, 줄여서 《법화경》은 경전 중의 왕이라 불리며, ‘진흙탕 속에서도 더러움에 물들지 않고 피어나는 연꽃(蓮華)’에 부처님의 가르침을 비유한 경전입니다.',
      '법화경의 가장 큰 가르침은 “세상 어떤 사람이라도 가슴속에 부처가 될 씨앗(불성)을 이미 가지고 있다”는 것입니다.',
      '지금 비록 삶이 고단하고 진흙탕처럼 힘들지라도, 그 아픔이 거름이 되어 머지않아 가장 크고 향기로운 연꽃 같은 행복이 피어날 것임을 믿으라는 희망의 경전입니다.',
    ],
  },
  {
    id: 'lesson-10',
    category: '경전 핵심 풀이 10강',
    title: '《화엄경》 일체유심조 — “세상의 모든 일은 마음먹기에 달려 있습니다”',
    summary: '원효대사님이 해골바가지 물을 마시고 깨달으신 화엄경의 핵심 지혜입니다.',
    keyPhrase: '심생즉종종법생 심멸즉종종법멸 (일체유심조)',
    content: [
      '신라 시대 원효대사님이 어두운 밤에 달콤하게 마셨던 물이 다음 날 아침 해골에 고인 물임을 알고 구역질을 하다가 큰 깨달음을 얻으신 일화는 매우 유명합니다.',
      '물 자체는 어제나 오늘이나 똑같았지만, 내 마음이 ‘깨끗한 약수’라고 생각할 때와 ‘해골물’이라고 생각할 때 천지 차이가 났던 것입니다.',
      '《화엄경》의 ‘일체유심조(一切唯心造)’는 “내 마음을 밝고 감사하게 먹으면 내 주변의 인연과 운명도 밝은 극락으로 바뀐다”는 위대한 진리입니다.',
    ],
  },
  {
    id: 'lesson-11',
    category: '경전 핵심 풀이 11강',
    title: '《부모은중경》 — 부처님께서 길가의 마른 뼈에 절을 올리신 까닭은?',
    summary: '열 달 동안 품어주시고 평생을 희생하신 부모님의 열 가지 크나큰 은혜를 설한 경전입니다.',
    keyPhrase: '가없는 부모님의 은혜, 하늘보다 높고 바다보다 깊습니다',
    content: [
      '어느 날 부처님께서 제자들과 길을 가시다가 길가에 흩어진 마른 뼈를 보시고는 지극히 공경하며 큰절을 올리셨습니다.',
      '놀란 제자들이 여쭙자 부처님께서는 “이 뼈는 전생에 나를 낳아 기르며 피와 살을 다 내어주신 부모님의 뼈일지 모른다” 하시며 어머니가 자식을 키우며 겪는 열 가지 은혜(회탐수호은, 임산수고은 등)를 설하셨습니다.',
      '살아계신 부모님께는 ‘생전예수재 황금위패’로 무병장수를 빌어드리고, 돌아가신 부모님께는 ‘영구위패’로 극락왕생을 발원하는 것이 불자가 행할 수 있는 가장 큰 보은입니다.',
    ],
  },
  {
    id: 'lesson-12',
    category: '불교 예화 & 예절 12강',
    title: '사찰 참배 예절 — 왜 절에 가면 합장(合掌)하고 삼배(三拜)를 올릴까요?',
    summary: '두 손을 모으는 합장과 세 번 절하는 삼배에 담긴 깊은 수행의 의미를 알아봅니다.',
    keyPhrase: '나를 낮추고 상대를 부처님처럼 공경하는 하심(下心)',
    content: [
      '절에 들어가면 가장 먼저 열 손가락을 가지런히 모아 가슴 앞에 붙이는 ‘합장(合掌)’을 합니다. 흩어진 열 가지 마음을 하나로 모아 오직 정성스럽고 진실한 마음으로 부처님을 뵙겠다는 뜻입니다.',
      '법당에서 올리는 ‘삼배(세 번 절하기)’는 첫째 불보(부처님), 둘째 법보(가르침), 셋째 승보(스님과 도반)의 삼보(三寶)께 귀의한다는 의미입니다.',
      '이마와 두 팔꿈치, 두 무릎을 바닥에 대고 가장 낮은 자세로 절을 올릴 때 내 안의 교만함과 욕심이 내려놓아지고, 그 빈자리에 부처님의 지혜와 복덕이 채워집니다.',
    ],
  },
  {
    id: 'lesson-13',
    category: '불교 예화 & 예절 13강',
    title: '부처님께서 알려주신 ‘무재칠시(無財七施)’ — 돈 없이도 짓는 7가지 큰 보시',
    summary: '재물이 없어도 누구나 지금 당장 실천하여 큰 복을 지을 수 있는 일곱 가지 베풂입니다.',
    keyPhrase: '따뜻한 눈빛과 미소, 부드러운 말 한마디가 최고의 보시입니다',
    content: [
      '어느 가난한 청년이 “저는 가진 재물이 없어 남에게 베풀지 못하니 복을 지을 수 없습니까?”라고 여쭙자, 부처님께서는 누구나 가진 일곱 가지 보물을 알려주셨습니다.',
      '① 화안시(온화한 미소) ② 언사시(따뜻하고 칭찬하는 말) ③ 심시(진심으로 위하는 마음) ④ 안시(자비로운 눈빛) ⑤ 신시(몸으로 돕는 친절) ⑥ 좌시(자리를 양보하는 배려) ⑦ 찰시(상대의 마음을 헤아림)입니다.',
      '오늘 가족과 이웃에게 건네는 밝은 미소와 따뜻한 덕담 한마디가 부처님 전에 천금을 올리는 것만큼 귀한 복덕의 씨앗이 됩니다.',
    ],
  },
  {
    id: 'lesson-14',
    category: '경전 핵심 풀이 14강',
    title: '《무량수경》과 나무아미타불 — 여섯 글자 염불에 담긴 한없는 빛과 생명',
    summary: '서방정토 극락세계를 주재하시는 아미타부처님의 끝없는 자비와 광명을 찬탄하는 염불입니다.',
    keyPhrase: '나무아미타불 (南無阿彌陀佛) — 한없는 빛과 무량한 수명',
    content: [
      '불자님들이 가장 친숙하게 외우는 “나무아미타불”에서 ‘나무(南無)’는 귀의한다는 뜻이고, ‘아미타(阿彌陀)’는 산스크리트어로 ‘한량없는 빛(무량광·無量光)’과 ‘한량없는 생명(무량수·無量壽)’이라는 뜻입니다.',
      '아미타부처님께서는 48가지 큰 서원을 세우시고, 누구든지 지극한 마음으로 내 이름을 부르는 이는 괴로움 없는 평화로운 극락정토로 맞이해 주겠다고 약속하셨습니다.',
      '마음이 답답하거나 불안할 때 조용히 눈을 감고 “나무아미타불” 여섯 글자를 천천히 염송해 보세요. 한없는 빛이 내 마음을 환하게 밝혀줍니다.',
    ],
  },
  {
    id: 'lesson-15',
    category: '사찰 불사 상식 15강',
    title: '초하루·보름 기도와 백중·동지 불사 — 절기마다 사찰 기도를 올리는 의미',
    summary: '음력 초하루와 보름, 그리고 불교 4대 명절·절기에 올리는 축원의 뜻깊은 전통입니다.',
    keyPhrase: '매달 초하루는 새 마음으로 복을 여는 날입니다',
    content: [
      '예로부터 불자님들은 음력 1일(초하루)과 15일(보름)이 되면 사찰을 찾아 한 달의 무사안녕과 가족의 건강을 발원하는 기도를 올려왔습니다.',
      '또한 봄의 부처님오신날(음 4월 8일), 여름의 백중 우란분절(음 7월 15일 · 조상 천도와 효도 불사), 겨울의 동지(작은설 · 새해 액운 소멸 기도), 정초 삼재풀이 기도는 한 해의 액을 막고 복을 부르는 소중한 절기입니다.',
      '직접 도량에 오시기 어려운 날에도 소원사 모바일 법당을 통해 언제든 소원등과 축원을 올리시면, 대웅전 스님께서 매일 사시예불마다 빠짐없이 명호를 부르며 축원해 드립니다.',
    ],
  },
]

// 재미로 푸는 불교 지혜 퀴즈 (7선)
const BUDDHIST_QUIZZES = [
  {
    id: 'q1',
    question: 'Q1. 살아생전에 미리 공덕을 닦아 액운을 소멸하고 무병장수와 현세의 복을 짓는 불교 의식의 이름은 무엇일까요?',
    options: ['① 생전 예수재 (황금위패)', '② 출가 수계식', '③ 동안거 해제'],
    answerIdx: 0,
    explanation: '정답은 ① 생전 예수재(生前預修齋)입니다! ‘미리(預) 공덕을 닦는다(修)’는 뜻으로, 살아생전 나와 부모님의 수명장수와 복덕을 짓는 전통 불사입니다.',
  },
  {
    id: 'q2',
    question: 'Q2. 《반야심경》에서 “형상 있는 것이 곧 비어 있음이요, 집착할 실체가 없다”는 뜻의 가장 유명한 네 글자는?',
    options: ['① 동문서답', '② 색즉시공 (色卽是空)', '③ 대기만성'],
    answerIdx: 1,
    explanation: '정답은 ② 색즉시공(色卽是空)입니다! 모든 것은 인연 따라 변하므로 지금의 괴로움에 얽매이지 말라는 부처님의 지혜입니다.',
  },
  {
    id: 'q3',
    question: 'Q3. 세상의 모든 괴로운 소리를 다 살펴 들으시고 천 개의 손과 눈으로 구원해 주시는 보살님은 누구실까요?',
    options: ['① 관세음보살님', '② 사천왕님', '③ 달마대사님'],
    answerIdx: 0,
    explanation: '정답은 ① 관세음보살(觀世音菩薩)님입니다! 자비의 화신으로 우리가 “관세음보살” 하고 부르면 즉시 응답해 주십니다.',
  },
  {
    id: 'q4',
    question: 'Q4. 사찰 대웅전에 들어가 부처님께 기본으로 올리는 큰절은 보통 몇 배를 올릴까요?',
    options: ['① 1배', '② 3배 (삼배)', '③ 5배'],
    answerIdx: 1,
    explanation: '정답은 ② 3배(삼배)입니다! 불법승(佛法僧) 삼보(부처님·가르침·스님)께 귀의하고 공경한다는 뜻으로 세 번 절을 올립니다.',
  },
  {
    id: 'q5',
    question: 'Q5. 몸과 마음의 질병을 고쳐주시고 가족의 건강과 무병장수를 관장하시는 부처님의 명호는?',
    options: ['① 미륵보살님', '② 약사여래 부처님', '③ 나한님'],
    answerIdx: 1,
    explanation: '정답은 ② 약사여래(藥師如來) 부처님입니다! 손에 약합(약그릇)을 들고 중생의 모든 아픔을 치유해 주시는 부처님이십니다.',
  },
  {
    id: 'q6',
    question: 'Q6. 《화엄경》의 핵심 가르침으로, “세상의 모든 일은 오직 내 한마음 먹기에 달려 있다”는 뜻의 사자성어는?',
    options: ['① 일체유심조 (一切唯心造)', '② 오비이락', '③ 금상첨화'],
    answerIdx: 0,
    explanation: '정답은 ① 일체유심조입니다! 신라 원효대사께서 해골바가지 물을 마시고 깨달으신 구절로도 매우 유명합니다.',
  },
  {
    id: 'q7',
    question: 'Q7. 부처님 전에 등불(소원등·연등)을 밝히는 공덕이 상징하는 가장 큰 의미는 무엇일까요?',
    options: ['① 어리석음(무명)을 밝히는 지혜와 자비의 빛', '② 방을 따뜻하게 하는 난방', '③ 시간을 재는 시계'],
    answerIdx: 0,
    explanation: '정답은 ① 지혜와 자비의 빛입니다! 등불 하나를 밝히면 마음의 어둠이 물러가고 앞길에 밝은 지혜와 복덕이 열립니다.',
  },
  {
    id: 'q8',
    question: 'Q8. 사찰에서 수명장수의 ‘칠성님’, 재물·수호의 ‘산신님’, 빠른 소원성취의 ‘독성(나반존자)님’ 세 분 성인을 함께 모시는 전각은?',
    options: ['① 삼성각 (三聖閣)', '② 일주문 (一柱門)', '③ 범종각 (梵鐘閣)'],
    answerIdx: 0,
    explanation: '정답은 ① 삼성각(三聖閣)입니다! 칠성·산신·독성 세 분 성인을 모신 영험한 기도처로, 삼성각 건립·기와 불사에 동참하는 공덕은 자손만대의 복전이 됩니다.',
  },
]

// Web Audio API 싱잉볼(발우/법종) 명상 사운드 합성기
function playSingingBowlSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const freqs = [432, 864, 1298]
    const gains = [0.28, 0.12, 0.05]

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(gains[i], now + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 4.3)
    })
  } catch (e) {
    // 오디오 컨텍스트 제한 시 무시
  }
}

// 실제 사찰 목탁 타격음 (고음질 실제 사찰 목탁 오디오 엔진)
function playMoktakSound() {
  try {
    const audio = new Audio('/audio/moktak.mp3')
    audio.volume = 1.0
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        playMoktakAcousticSynth()
      })
    }
  } catch (e) {
    playMoktakAcousticSynth()
  }
}

// 오프라인/파일 지연 시 실제 전통 사찰 목탁 주파수를 정밀 재현하는 물리 음향 합성기
function playMoktakAcousticSynth() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // 1. 목탁 타격 순간의 나무 채 어택 (3200Hz 대역 대나무 채 클릭)
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1
    }
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(3200, now)
    noiseFilter.Q.setValueAtTime(3, now)
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.4, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015)
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noise.start(now)

    // 2. 목탁 본체 고유 공명음 (한국 전통 박달나무 목탁의 540Hz 맑고 깊은 통울림)
    const bodyOsc = ctx.createOscillator()
    const bodyGain = ctx.createGain()
    bodyOsc.type = 'sine'
    // 타격 순간 미세한 피치 드롭 (620Hz -> 535Hz)
    bodyOsc.frequency.setValueAtTime(620, now)
    bodyOsc.frequency.exponentialRampToValueAtTime(535, now + 0.035)
    bodyGain.gain.setValueAtTime(0.001, now)
    bodyGain.gain.linearRampToValueAtTime(0.7, now + 0.003)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)
    bodyOsc.connect(bodyGain)
    bodyGain.connect(ctx.destination)
    bodyOsc.start(now)
    bodyOsc.stop(now + 0.3)

    // 3. 목탁 내부 공동 배음 (1120Hz 맑은 윗소리)
    const overtoneOsc = ctx.createOscillator()
    const overtoneGain = ctx.createGain()
    overtoneOsc.type = 'sine'
    overtoneOsc.frequency.setValueAtTime(1180, now)
    overtoneOsc.frequency.exponentialRampToValueAtTime(1110, now + 0.025)
    overtoneGain.gain.setValueAtTime(0.001, now)
    overtoneGain.gain.linearRampToValueAtTime(0.25, now + 0.004)
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    overtoneOsc.connect(overtoneGain)
    overtoneGain.connect(ctx.destination)
    overtoneOsc.start(now)
    overtoneOsc.stop(now + 0.15)

    // 4. 목탁 바닥 통울림 (360Hz 묵직한 베이스 바디감)
    const lowOsc = ctx.createOscillator()
    const lowGain = ctx.createGain()
    lowOsc.type = 'sine'
    lowOsc.frequency.setValueAtTime(360, now)
    lowGain.gain.setValueAtTime(0.001, now)
    lowGain.gain.linearRampToValueAtTime(0.35, now + 0.004)
    lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
    lowOsc.connect(lowGain)
    lowGain.connect(ctx.destination)
    lowOsc.start(now)
    lowOsc.stop(now + 0.18)
  } catch (e) {
    // 오디오 컨텍스트 제한 시 무시
  }
}

// 24시간 힐링 법음 & 수면 명상 5대 테마 트랙 (국보급 방송용 스튜디오 마스터 음원 전면 개편)
const HEALING_AUDIO_TRACKS = [
  {
    id: 'prajna_chanting',
    category: '경전독경',
    icon: '📿',
    title: '반야심경(般若心經) 영인스님 정통 독경',
    subtitle: '영인스님 청아한 육성 원음 & 법당 목탁 (2분 51초 완독 회향)',
    description: '대한민국 불자들이 가장 사랑하는 영인스님의 맑고 청아한 반야심경 독경 전편과 법당 목탁 원음입니다. (BBS 불교방송 마스터링본)',
    type: 'chant',
    audioUrl: '/audio/prajna_chanting.mp3',
    voiceText: null,
    attribution: '음원 출처: BBS 불교방송 / 영인스님 독경 정진 (사찰 포교 및 법공양)',
  },
  {
    id: 'dhammapada_wisdom',
    category: '소원성취',
    icon: '📜',
    title: '천수경(千手經) 영인스님 정통 독경',
    subtitle: '액난을 소멸하고 소원을 성취하는 영인스님 천수경 원음 (3분 20초 완독 회향)',
    description: '부처님의 무량한 자비와 공덕으로 모든 재앙을 물리치고 소원을 이루어주는 영인스님의 정통 천수경 원음 독경입니다. (BBS 불교방송 마스터링본)',
    type: 'wisdom',
    audioUrl: '/audio/dhammapada_wisdom.mp3',
    voiceText: null,
    attribution: '음원 출처: BBS 불교방송 / 영인스님 독경 정진 (사찰 포교 및 법공양)',
  },
  {
    id: 'sleep_meditation',
    category: '수면치유',
    icon: '🌙',
    title: '광명진언(光明眞言) 영인스님 치유 독경',
    subtitle: '영인스님 나즈막한 자비 원음 & 치유 종송 (2분 46초 완독 회향)',
    description: '불면증과 악몽, 마음의 불안을 잠재우고 깊고 평안한 숙면을 이끌어주는 영인스님의 명품 광명진언 독경 원음입니다. (BBS 불교방송 마스터링본)',
    type: 'sleep',
    audioUrl: '/audio/sleep_meditation.mp3',
    voiceText: null,
    attribution: '음원 출처: BBS 불교방송 / 영인스님 독경 정진 (사찰 포교 및 법공양)',
  },
  {
    id: 'rhythmic_moktak',
    category: '마음정진',
    icon: '🪷',
    title: '천년고찰 박달나무 실물 목탁 원음',
    subtitle: '사찰 대웅전 실물 목탁 타격 원음 & 법당 자연 잔향 (108배·사경용 2분 루프)',
    description: '천년고찰 대웅전 법당의 맑고 묵직한 박달나무 목탁 실물 소리와 공간 울림이 잡념을 씻어내고 호흡을 고요하게 합니다.',
    type: 'moktak',
    audioUrl: '/audio/muyeok_moktak.mp3',
    voiceText: null,
    attribution: '음원 출처: 천년고찰 대웅전 실물 박달나무 목탁 원음 (마음 정진)',
  },
  {
    id: 'temple_chime_nature',
    category: '집중·휴식',
    icon: '🍃',
    title: '사찰 은방울 풍경소리 & 산새소리 ASMR',
    subtitle: '처마 밑 은방울 풍경소리 & 청아한 자연 앰비언스 (독서·업무 집중용 2분 루프)',
    description: '사찰 처마 밑 청아한 풍경소리와 자연 산새소리가 머리를 맑게 식혀주고 일과 독서, 공부 시 집중력을 극대화해 줍니다.',
    type: 'nature',
    audioUrl: '/audio/sowonsa_wind.mp3',
    voiceText: null,
    attribution: '음원 출처: 사찰 처마 은방울 풍경 및 자연 앰비언스 ASMR (마음 휴식)',
  },
]

// 24시간 백그라운드 힐링 오디오 정식 음원 재생 엔진
class HealingAudioEngine {
  constructor() {
    this.currentTrack = null
    this.isPlaying = false
    this.htmlAudio = null
    this.voiceTimeout = null
    this.voiceEnabled = true
  }

  setupMediaSession(track) {
    if ('mediaSession' in navigator && track) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: '제주 소원사 (공공저작물 정식음원)',
          album: '제주 소원사 24시간 법음관',
          artwork: [
            { src: '/images/moktak_icon.png', sizes: '512x512', type: 'image/png' },
          ],
        })
        navigator.mediaSession.playbackState = 'playing'
      } catch (e) {}
    }
  }

  speakTrackVoice(text) {
    if (!this.voiceEnabled || !text) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const clean = String(text)
        .replace(/[《》“”"']/g, ' ')
        .replace(/\.\s*/g, '. ... ')
        .trim()
      const u = new SpeechSynthesisUtterance(clean)
      u.lang = 'ko-KR'
      u.pitch = 0.62 // 깊고 장엄한 스님 저음
      u.rate = 0.78 // 여유롭고 차분한 독송 속도

      const voices = window.speechSynthesis.getVoices()
      const koVoices = voices.filter(
        (v) => v.lang && (v.lang.toLowerCase().includes('ko') || v.lang.toLowerCase().includes('kr'))
      )
      const male =
        koVoices.find((v) =>
          /male|injoon|minsoo|kpb|kod|cjm|nam|man|남성/i.test(`${v.name} ${v.voiceURI}`)
        ) || koVoices[0]
      if (male) u.voice = male

      u.onend = () => {
        // 낭독이 끝나고도 아직 재생 중이고 음성이 켜져 있으면, 4초 여운 뒤 경건하게 반복 낭독
        if (this.isPlaying && this.voiceEnabled && this.currentTrack) {
          this.voiceTimeout = setTimeout(() => {
            const current = HEALING_AUDIO_TRACKS.find((t) => t.id === this.currentTrack)
            if (current?.voiceText && this.isPlaying && this.voiceEnabled) {
              this.speakTrackVoice(current.voiceText)
            }
          }, 4000)
        }
      }
      u.onerror = () => {}

      window.speechSynthesis.speak(u)
    } catch (e) {}
  }

  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled
    if (!enabled) {
      if (this.voiceTimeout) {
        clearTimeout(this.voiceTimeout)
        this.voiceTimeout = null
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel()
        } catch (e) {}
      }
    } else if (this.isPlaying && this.currentTrack) {
      const current = HEALING_AUDIO_TRACKS.find((t) => t.id === this.currentTrack)
      if (current?.voiceText) {
        this.speakTrackVoice(current.voiceText)
      }
    }
  }

  stopAll() {
    if (this.voiceTimeout) {
      clearTimeout(this.voiceTimeout)
      this.voiceTimeout = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch (e) {}
    }
    if (this.htmlAudio) {
      try {
        this.htmlAudio.pause()
        this.htmlAudio.currentTime = 0
      } catch (e) {}
      this.htmlAudio = null
    }
    this.isPlaying = false
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'paused'
      } catch (e) {}
    }
  }

  playTrack(trackId, voiceEnabled = true) {
    this.stopAll()
    this.isPlaying = true
    this.currentTrack = trackId
    this.voiceEnabled = voiceEnabled

    const trackInfo = HEALING_AUDIO_TRACKS.find((t) => t.id === trackId)
    if (!trackInfo) return

    this.setupMediaSession(trackInfo)

    if (trackInfo.audioUrl) {
      try {
        const audio = new Audio(trackInfo.audioUrl)
        audio.loop = true
        audio.volume = 0.95
        const p = audio.play()
        if (p !== undefined) {
          p.catch((err) => {
            console.warn('Audio playback error:', err)
          })
        }
        this.htmlAudio = audio
      } catch (e) {
        console.error('Audio init error:', e)
      }
    }

    if (voiceEnabled && trackInfo.voiceText) {
      this.speakTrackVoice(trackInfo.voiceText)
    }
  }
}

const healingAudioEngine = new HealingAudioEngine()

export default function App() {
  // 탭 상태: 'home' | 'lantern' | 'sutra' | 'agent' | 'admin' | 'profile'
  const [activeTab, setActiveTab] = useState('home')
  const [heroSlideIdx, setHeroSlideIdx] = useState(0)

  // 소원사 통합 전산 모달 상태 ('common': 1.포교사 공통, 'head': 2.포교위원장, 'temple': 3.사찰본부, 'master': 4.최고관제)
  const [showUnifiedAdminModal, setShowUnifiedAdminModal] = useState(false)
  const [adminModalTab, setAdminModalTab] = useState('common')

  // 24시간 힐링 법음 & 수면 명상 오디오 플레이어 상태 (기본: 반야심경 스님 음성 독경)
  const [healingAudioTrack, setHealingAudioTrack] = useState('prajna_chanting')
  const [isHealingPlaying, setIsHealingPlaying] = useState(false)
  const [isHealingVoiceOn, setIsHealingVoiceOn] = useState(true) // 스님 음성 낭독 기본 켜짐
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false) // 홈 화면 대안1: 기본 슬림 바, 터치 시 펼침
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null) // null | 15 | 30 | 60
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState(0)
  const [showFullAudioModal, setShowFullAudioModal] = useState(false)

  // 수면 타이머 카운트다운 및 자동 종료
  useEffect(() => {
    if (!isHealingPlaying || !sleepTimerMinutes) {
      setSleepTimerSecondsLeft(0)
      return
    }
    const interval = setInterval(() => {
      setSleepTimerSecondsLeft((prev) => {
        if (prev <= 1) {
          healingAudioEngine.stopAll()
          setIsHealingPlaying(false)
          setSleepTimerMinutes(null)
          showToast('🌙 수면 타이머가 완료되어 법음이 편안하게 종료되었습니다. 편안한 밤 되세요.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isHealingPlaying, sleepTimerMinutes])

  const handleToggleHealingPlay = (trackId = null) => {
    const targetTrack = trackId || healingAudioTrack
    if (isHealingPlaying && targetTrack === healingAudioTrack) {
      healingAudioEngine.stopAll()
      setIsHealingPlaying(false)
    } else {
      setHealingAudioTrack(targetTrack)
      healingAudioEngine.playTrack(targetTrack, isHealingVoiceOn)
      setIsHealingPlaying(true)
      playSingingBowlSound()
    }
  }

  const handleToggleHealingVoice = () => {
    const next = !isHealingVoiceOn
    setIsHealingVoiceOn(next)
    healingAudioEngine.setVoiceEnabled(next)
    showToast(
      next
        ? '🔊 스님 음성 낭독이 켜졌습니다.'
        : '🔇 스님 음성이 꺼지고 배경 정진음만 재생됩니다.'
    )
  }

  const handleSetSleepTimer = (minutes) => {
    if (sleepTimerMinutes === minutes) {
      setSleepTimerMinutes(null)
      setSleepTimerSecondsLeft(0)
      showToast('⏰ 수면 타이머가 해제되었습니다. 연속 재생됩니다.')
    } else {
      setSleepTimerMinutes(minutes)
      setSleepTimerSecondsLeft(minutes * 60)
      if (!isHealingPlaying) {
        handleToggleHealingPlay(healingAudioTrack)
      }
      showToast(`🌙 ${minutes}분 후 자동 종료 수면 타이머가 설정되었습니다.`)
    }
  }

  // 모바일 잠금화면 & 알림센터 미디어 세션 컨트롤 바인딩
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          if (!isHealingPlaying) handleToggleHealingPlay(healingAudioTrack)
        })
        navigator.mediaSession.setActionHandler('pause', () => {
          if (isHealingPlaying) handleToggleHealingPlay(healingAudioTrack)
        })
        navigator.mediaSession.setActionHandler('stop', () => {
          healingAudioEngine.stopAll()
          setIsHealingPlaying(false)
        })
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          const idx = HEALING_AUDIO_TRACKS.findIndex((t) => t.id === healingAudioTrack)
          const prevIdx = (idx - 1 + HEALING_AUDIO_TRACKS.length) % HEALING_AUDIO_TRACKS.length
          handleToggleHealingPlay(HEALING_AUDIO_TRACKS[prevIdx].id)
        })
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          const idx = HEALING_AUDIO_TRACKS.findIndex((t) => t.id === healingAudioTrack)
          const nextIdx = (idx + 1) % HEALING_AUDIO_TRACKS.length
          handleToggleHealingPlay(HEALING_AUDIO_TRACKS[nextIdx].id)
        })
      } catch (e) {}
    }
  }, [healingAudioTrack, isHealingPlaying])

  // 전체 통합 회원 DB 상태 (신도 + 포교사 + 본부 + 관리자)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('sowonpray_members_v5')
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS
  })

  const [prayers, setPrayers] = useState(() => {
    const saved = localStorage.getItem('sowonpray_prayers_v4')
    return saved ? JSON.parse(saved) : INITIAL_PRAYERS
  })

  const [settlements, setSettlements] = useState(() => {
    const saved = localStorage.getItem('sowonpray_settlements_v3')
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS
  })

  const [visits, setVisits] = useState(() => {
    const saved = localStorage.getItem('sowonpray_visits_v3')
    return saved ? JSON.parse(saved) : INITIAL_VISITS
  })

  // 총괄 다이나믹 수당 요율 상태 (김철수 대표님 5% 포함 100% 배분)
  const [commissionRules, setCommissionRules] = useState(() => {
    const saved = localStorage.getItem('sowonpray_rules')
    return saved
      ? JSON.parse(saved)
      : {
          rate1st: 30,
          rate2nd: 10,
          rate3rd: 5,
          ratePlatform: 5,
          rateTemple: 50,
        }
  })

  // 접속 시 URL ?ref=뒤8자리 포교사 코드 감지 및 저장
  const [referralCode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const refParam = params.get('ref')
    const savedRef = localStorage.getItem('sowonpray_locked_ref_v3')
    if (refParam) {
      const normalized = extractPhone8Code(refParam)
      localStorage.setItem('sowonpray_locked_ref_v3', normalized)
      return normalized
    }
    return savedRef || '52148821'
  })

  // 현재 로그인된 본인 계정 코드 (자동 로그인 유지, 초기 기본값: 일반신도 이정숙 '82341088')
  const [currentUserCode, setCurrentUserCode] = useState(() => {
    const savedUser = localStorage.getItem('sowonpray_current_user_v3')
    return savedUser !== null ? savedUser : '82341088'
  })

  // 현재 로그인된 회원 객체
  const currentUser = useMemo(() => {
    if (!currentUserCode) return null
    return members.find((m) => m.code === currentUserCode) || null
  }, [members, currentUserCode])

  // 포교위원장/포교위원/본부/관리자 목록 필터링
  const agents = useMemo(() => {
    return members.filter(
      (m) =>
        m.role === 'agent' ||
        m.role === 'committee_head' ||
        m.role === 'committee_member' ||
        m.role === 'temple_admin' ||
        m.role === 'master'
    )
  }, [members])

  // 현재 회원의 담당(인도) 포교사 객체
  const currentLockedAgent = useMemo(() => {
    const targetCode = currentUser?.parent_code || referralCode || '52148821'
    return (
      members.find((m) => m.code === targetCode) ||
      members.find((m) => m.code === '52148821') ||
      members[0]
    )
  }, [members, currentUser, referralCode])

  // 알림 토스트 메시지
  const [toast, setToast] = useState(null)
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  // 발원문 접수일시 친화적 포맷팅 함수
  const formatPrayerDate = (dateStr) => {
    if (!dateStr) return '최근'
    if (dateStr === '방금 전') return '방금 전'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      const diffMs = Date.now() - d.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 2) return '방금 전'
      if (diffMin < 60) return `${diffMin}분 전`
      const diffHours = Math.floor(diffMin / 60)
      if (diffHours < 24) return `${diffHours}시간 전`
      return `${d.getMonth() + 1}월 ${d.getDate()}일`
    } catch (e) {
      return dateStr
    }
  }

  // 상태 변경 시 로컬스토리지 자동 동기화
  useEffect(() => {
    localStorage.setItem('sowonpray_members_v5', JSON.stringify(members))
  }, [members])

  useEffect(() => {
    localStorage.setItem('sowonpray_prayers_v4', JSON.stringify(prayers))
  }, [prayers])

  useEffect(() => {
    localStorage.setItem('sowonpray_settlements_v3', JSON.stringify(settlements))
  }, [settlements])

  useEffect(() => {
    localStorage.setItem('sowonpray_visits_v3', JSON.stringify(visits))
  }, [visits])

  useEffect(() => {
    localStorage.setItem('sowonpray_rules', JSON.stringify(commissionRules))
  }, [commissionRules])

  useEffect(() => {
    localStorage.setItem('sowonpray_current_user_v3', currentUserCode || '')
  }, [currentUserCode])

  // Supabase 클라우드 실시간 동기화 (전국 스마트폰 & PC 실시간 연동)
  useEffect(() => {
    if (!supabase) return

    async function loadCloudData() {
      try {
        const { data: cloudMembers } = await supabase.from('members').select('*')
        if (cloudMembers && cloudMembers.length > 0) {
          const cloudCodes = new Set(cloudMembers.map((m) => m.code))
          const merged = [
            ...cloudMembers,
            ...INITIAL_MEMBERS.filter((m) => !cloudCodes.has(m.code)),
          ]
          setMembers(merged)
        }
        const { data: cloudPrayers } = await supabase
          .from('prayers')
          .select('*')
          .order('created_at', { ascending: false })
        if (cloudPrayers && cloudPrayers.length > 0) {
          setPrayers(cloudPrayers)
        }
        const { data: cloudVisits } = await supabase
          .from('visits')
          .select('*')
          .order('created_at', { ascending: false })
        if (cloudVisits && cloudVisits.length > 0) {
          setVisits(cloudVisits)
        }
      } catch (err) {
        console.log('Supabase initial fetch note:', err)
      }
    }

    loadCloudData()

    // 실시간 DB 변경 감지 (신규 소원등 및 방문예약 자동 갱신)
    const channel = supabase
      .channel('realtime-sowonpray-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayers' }, (payload) => {
        setPrayers((prev) => [payload.new, ...prev.filter((p) => p.id !== payload.new.id)])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'visits' }, (payload) => {
        setVisits((prev) => [payload.new, ...prev.filter((v) => v.id !== payload.new.id)])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'members' }, (payload) => {
        setMembers((prev) => [payload.new, ...prev.filter((m) => m.code !== payload.new.code)])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // 오늘의 법문 선택
  const [quoteIdx, setQuoteIdx] = useState(0)
  const currentQuote = DAILY_QUOTES[quoteIdx]

  // 7일 소원등 축원 상태 (발원문 접수 시 7일간 대웅전에 광명 점등 유지되는 7일 정진 시스템)
  const [lanternData, setLanternData] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonsa_7day_lantern')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.expire_at && parsed.expire_at > Date.now()) {
          return parsed
        }
      }
    } catch (e) {
      // ignore
    }
    return null
  })

  // 소원등 유효 점등 여부 (보안 및 개인정보 보호: 로그아웃 상태이거나 다른 회원 접속 시 이전 회원의 등 비노출)
  const isLanternLit = Boolean(
    lanternData &&
    lanternData.expire_at > Date.now() &&
    (!lanternData.member_code || (currentUser && currentUser.code === lanternData.member_code)) &&
    (currentUser || !members.some((m) => lanternData.believer_name && lanternData.believer_name.includes(m.name)))
  )
  const lanternDaysRemaining = isLanternLit
    ? Math.max(1, Math.ceil((lanternData.expire_at - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0
  const isLanternExpired = Boolean(
    !isLanternLit && (() => {
      try {
        const saved = localStorage.getItem('sowonsa_7day_lantern')
        if (saved) {
          const parsed = JSON.parse(saved)
          return Boolean(parsed.expire_at && parsed.expire_at <= Date.now())
        }
      } catch (e) {}
      return false
    })()
  )

  const [wishName, setWishName] = useState('')
  const [wishTarget, setWishTarget] = useState('')
  const [wishPhone, setWishPhone] = useState('')
  const [wishCategory, setWishCategory] = useState('가족건강')
  const [wishText, setWishText] = useState(
    () => PRAYER_CATEGORY_TEMPLATES['가족건강'] || ''
  )
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // [사시예불 축원 명부] 7일 이내 유효 신도 전용 인쇄 모달 상태
  const [showSasiPrintModal, setShowSasiPrintModal] = useState(false)

  // 7일 정진 기간 내(D-7 ~ D-1) 유효 신도만 자동 필터링 (7일 지난 만료 신도는 자동 제외)
  const activeSasiPrayers = useMemo(() => {
    const now = Date.now()
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

    return (prayers || [])
      .map((p) => {
        let pTime = now
        if (p.created_at) {
          const parsed = new Date(p.created_at).getTime()
          if (!isNaN(parsed)) pTime = parsed
        }
        const diffMs = now - pTime
        const isWithin7Days = diffMs >= 0 && diffMs <= SEVEN_DAYS_MS
        const daysLeft = Math.max(1, Math.ceil((SEVEN_DAYS_MS - diffMs) / (1000 * 60 * 60 * 24)))
        return {
          ...p,
          pTime,
          isWithin7Days,
          daysLeft,
        }
      })
      .filter((p) => p.isWithin7Days)
      .sort((a, b) => b.pTime - a.pTime)
  }, [prayers])

  // 탭 이동 시 해당 탭에 맞는 기본 종목 자동 세팅 및 정통 예시문 연동
  useEffect(() => {
    const bulsaCats = [
      '대웅전 공양미/불전시주',
      '대웅전 1년 인등(가족등)',
      '100일 소원성취 특별기도',
      '49재/천도재/기일제사',
      '생전예수재(황금위패)',
      '조상영구위패(흑색)',
      '삼성각 소원기와불사',
      '삼성각 기둥·단청불사',
      '삼성각 영구축원명패',
      '기타 특별기도 상담',
    ]
    const lanternCats = [
      '가족건강',
      '사업번창',
      '학업/시험합격',
      '마음평안/소원성취',
      '자녀축복/취업성취',
      '액운소멸/무병장수',
    ]
    const allTemplates = Object.values(PRAYER_CATEGORY_TEMPLATES)
    if (activeTab === 'bulsa' && !bulsaCats.includes(wishCategory)) {
      const defaultBulsa = '대웅전 1년 인등(가족등)'
      setWishCategory(defaultBulsa)
      if (!wishText.trim() || allTemplates.includes(wishText.trim())) {
        setWishText(PRAYER_CATEGORY_TEMPLATES[defaultBulsa] || '')
      }
    } else if (activeTab === 'lantern' && !lanternCats.includes(wishCategory)) {
      const defaultLantern = '가족건강'
      setWishCategory(defaultLantern)
      if (!wishText.trim() || allTemplates.includes(wishText.trim())) {
        setWishText(PRAYER_CATEGORY_TEMPLATES[defaultLantern] || '')
      }
    }
  }, [activeTab])

  // 신행홈 상단 히어로 배너 5.5초 자동 슬라이드 (홈 탭일 때만 가볍게 동작)
  useEffect(() => {
    if (activeTab !== 'home') return
    const timer = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [activeTab])

  // 도량 방문 & 차담·사찰 공양(식사) 사전 예약 폼 상태 (첫 화면 부담을 줄이기 위해 기본 접힘)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitDate, setVisitDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000)
    return tomorrow.toISOString().split('T')[0]
  })
  const [visitTime, setVisitTime] = useState('오전 11:30 (점심공양)')
  const [visitHeadcount, setVisitHeadcount] = useState(2)
  const [visitPurpose, setVisitPurpose] = useState('따뜻한 차 & 사찰 공양(식사) 대접 예약')
  const [visitMemo, setVisitMemo] = useState('')

  // 로그인 계정이 바뀔 때마다 소원등 신청자 이름·연락처 및 내 정보 수정 폼 자동 세팅
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    password_pin: '',
    dharma_name: '',
    birth_date: '',
    lunar_solar: '음력',
    address: '',
    family_memo: '',
    bank_name: '',
    bank_account: '',
    account_holder: '',
  })

  // 포교사 전산 및 관리자 뷰 모드 ('tree': MetaFastest 스타일 조직도 트리 / 'list': 목록형)
  const [agentViewMode, setAgentViewMode] = useState('tree')
  const [adminMemberViewMode, setAdminMemberViewMode] = useState('tree')

  useEffect(() => {
    if (currentUser) {
      const displayName = currentUser.dharma_name
        ? `${currentUser.name} (${currentUser.dharma_name})`
        : currentUser.name
      setWishName(displayName)
      setWishPhone(currentUser.phone)
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        password_pin: currentUser.password_pin || '0000',
        dharma_name: currentUser.dharma_name || '',
        birth_date: currentUser.birth_date || '',
        lunar_solar: currentUser.lunar_solar || '음력',
        address: currentUser.address || '',
        family_memo: currentUser.family_memo || '',
        bank_name: currentUser.bank_name || '',
        bank_account: currentUser.bank_account || '',
        account_holder: currentUser.account_holder || '',
      })
    } else {
      setWishName('')
      setWishPhone('')
    }
  }, [currentUser])

  // 클라우드 및 계정 연동 7일 소원등 자동 동기화 (기기 간 실시간 동기화: PC에서 켜면 폰에서도 자동 점등)
  useEffect(() => {
    if (!prayers || prayers.length === 0) return

    // 현재 로그인된 회원 또는 폼 입력 정보 기준 매칭
    const cleanUserPhone = (currentUser?.phone || wishPhone || '').replace(/[^0-9]/g, '')
    const userCode = currentUser?.code || ''
    const userName = currentUser?.name || wishName || ''

    if (!cleanUserPhone && !userCode && !userName) return

    const myLatestPrayer = prayers.find((p) => {
      const pPhone = (p.believer_phone || '').replace(/[^0-9]/g, '')
      const pCode = p.member_code || ''
      const pName = p.believer_name || ''

      const matchPhone = cleanUserPhone && pPhone && cleanUserPhone === pPhone
      const matchCode = userCode && pCode && userCode === pCode
      const matchName = userName && pName && (pName.includes(userName) || userName.includes(pName))

      return matchPhone || matchCode || matchName
    })

    if (myLatestPrayer) {
      let prayerTime = Date.now()
      if (myLatestPrayer.created_at) {
        const parsed = new Date(myLatestPrayer.created_at).getTime()
        if (!isNaN(parsed)) prayerTime = parsed
      }
      const expireAt = prayerTime + 7 * 24 * 60 * 60 * 1000

      if (expireAt > Date.now()) {
        const syncedLantern = {
          member_code: myLatestPrayer.member_code || currentUser?.code || '',
          believer_name: myLatestPrayer.believer_name,
          believer_phone: myLatestPrayer.believer_phone || currentUser?.phone || '',
          wish_category: myLatestPrayer.wish_category || '가족건강',
          wish_text: myLatestPrayer.wish_text || '',
          lit_at: prayerTime,
          expire_at: expireAt,
        }
        setLanternData(syncedLantern)
        try {
          localStorage.setItem('sowonsa_7day_lantern', JSON.stringify(syncedLantern))
        } catch (e) {}
      }
    }
  }, [currentUser, prayers, wishPhone, wishName])

  // 사경/법문/경전공부/지혜퀴즈 탭 상태
  const [sutraSubTab, setSutraSubTab] = useState('copy') // 'copy' | 'wisdom' | 'study' | 'quiz'
  const [selectedSutraIdx, setSelectedSutraIdx] = useState(0)
  const [sutraInput, setSutraInput] = useState('')
  const [sutraCompleted, setSutraCompleted] = useState(false)
  const [showMeritCertModal, setShowMeritCertModal] = useState(false)
  const [moktakCount, setMoktakCount] = useState(0)
  const [guestMeritBonus, setGuestMeritBonus] = useState(0)

  // 불교명언 & 연꽃 말씀 뽑기 상태
  const [selectedLotusIdx, setSelectedLotusIdx] = useState(null)
  const [selectedMoodId, setSelectedMoodId] = useState('anxious')

  // 쉬운 3분 경전공부 상태 (날짜에 따라 오늘의 추천 5강이 자동 순환되며 전체 펼치기도 지원)
  const totalLessonBatches = Math.ceil(SUTRA_STUDY_LESSONS.length / 5)
  const initialDailyBatch = (Math.floor(Date.now() / 86400000) + 1) % totalLessonBatches
  const [lessonBatchIdx, setLessonBatchIdx] = useState(initialDailyBatch)
  const [showAllLessons, setShowAllLessons] = useState(false)
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(initialDailyBatch * 5)
  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonpray_completed_lessons_v1')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('sowonpray_completed_lessons_v1', JSON.stringify(completedLessons))
    } catch {
      // ignore storage errors
    }
  }, [completedLessons])

  // 재미로 푸는 불교 지혜 퀴즈 상태
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizSelectedOption, setQuizSelectedOption] = useState(null)
  const [solvedQuizIds, setSolvedQuizIds] = useState([])

  // 한국어 음성 낭독(TTS) 상태 및 헬퍼 — 중후한 스님 톤 기본 적용 (autoVoiceEnabled가 켜져 있으면 '다음' 이동 시에도 자동 낭독)
  const [speakingId, setSpeakingId] = useState(null)
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(false)

  // 모바일 브라우저 음성 목록 사전 로드
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.getVoices()
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices()
        }
      }
    } catch (e) {
      // 무시
    }
  }, [])

  const stopSpeech = (disableAuto = false) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    } catch (e) {
      // 무시
    }
    setSpeakingId(null)
    if (disableAuto) {
      setAutoVoiceEnabled(false)
    }
  }

  const startSpeech = (id, rawText) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        playSingingBowlSound()
        showToast('💡 카카오톡 등 인앱 브라우저는 음성 낭독이 제한됩니다. 우측 상단(⋮) [다른 브라우저로 열기]를 이용해 주세요.')
        return
      }
      window.speechSynthesis.cancel()

      // 괄호 안 한자 제거 및 스님 법문처럼 차분한 호흡(쉼표·여백) 정제
      const cleanText = String(rawText)
        .replace(/\([一-龥\s·,]+\)/g, '')
        .replace(/[《》“”"']/g, ' ')
        .replace(/[①②③④⑤]/g, '')
        .replace(/·/g, ', ')
        .replace(/\.\s*/g, '. ... ')
        .replace(/\s+/g, ' ')
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'ko-KR'
      // 중후한 스님 톤: 낮고 묵직한 음높이(0.62)와 차분하고 여유로운 독송 속도(0.82)
      utterance.pitch = 0.62
      utterance.rate = 0.82

      const voices = window.speechSynthesis.getVoices()
      const koVoices = voices.filter(
        (v) => v.lang && (v.lang.toLowerCase().includes('ko') || v.lang.toLowerCase().includes('kr'))
      )
      // 기기에 남성 한국어 음성이 있으면 우선 선택, 없으면 기본 한국어 음성에 저음 피치 적용
      const maleKoVoice =
        koVoices.find((v) =>
          /male|injoon|minsoo|kpb|kod|cjm|nam|man|남성/i.test(`${v.name} ${v.voiceURI}`)
        ) || koVoices[0]

      if (maleKoVoice) {
        utterance.voice = maleKoVoice
      }

      utterance.onend = () => setSpeakingId(null)
      utterance.onerror = () => setSpeakingId(null)

      setSpeakingId(id)
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      setSpeakingId(null)
    }
  }

  const toggleSpeech = (id, rawText) => {
    if (speakingId === id || (id === 'home-quote' && autoVoiceEnabled)) {
      stopSpeech(true)
      return
    }
    setAutoVoiceEnabled(true)
    startSpeech(id, rawText)
  }

  // 탭 전환 시 낭독 자동 정지
  useEffect(() => {
    stopSpeech(false)
  }, [activeTab, sutraSubTab])

  // 로그인/회원가입 전환 상태 ('login' | 'signup')
  const [authMode, setAuthMode] = useState('login')
  const [showTestAccountSwitch, setShowTestAccountSwitch] = useState(false)
  const [loginIdInput, setLoginIdInput] = useState('')
  const [loginPwInput, setLoginPwInput] = useState('')

  // 신규 회원가입 입력 상태
  const [signupName, setSignupName] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPw, setSignupPw] = useState('')
  const [signupDharmaName, setSignupDharmaName] = useState('')
  const [signupBirthDate, setSignupBirthDate] = useState('')
  const [signupLunarSolar, setSignupLunarSolar] = useState('음력')
  const [signupAddress, setSignupAddress] = useState('')
  const [signupFamilyMemo, setSignupFamilyMemo] = useState('')

  // 포교위원 전산 탭: 총괄대표(master)일 때는 위원 선택 조회 가능, 일반 포교위원장/위원일 때는 본인 고정
  const [selectedAgentCode, setSelectedAgentCode] = useState('52148821')
  useEffect(() => {
    if (
      currentUser &&
      (currentUser.role === 'agent' ||
        currentUser.role === 'committee_head' ||
        currentUser.role === 'committee_member' ||
        currentUser.role === 'temple_admin' ||
        currentUser.role === 'master')
    ) {
      setSelectedAgentCode(currentUser.code)
    }
  }, [currentUser])

  const activeAgent = useMemo(() => {
    if (
      currentUser?.role === 'agent' ||
      currentUser?.role === 'committee_head' ||
      currentUser?.role === 'committee_member'
    ) {
      return currentUser
    }
    return (
      members.find((m) => m.code === selectedAgentCode) ||
      currentUser ||
      members[2]
    )
  }, [members, selectedAgentCode, currentUser])

  // 총괄 정산 탭 신규 위패 시뮬레이션 입력 상태
  const [simBelieverName, setSimBelieverName] = useState('')
  const [simItemType, setSimItemType] = useState('생전예수재 황금위패 (1기)')
  const [simAmount, setSimAmount] = useState(2000000)
  const [simAgentCode, setSimAgentCode] = useState('39110944')

  // 총괄 관리자용 신규 포교사/회원 등록 입력 상태
  const [adminNewName, setAdminNewName] = useState('')
  const [adminNewDharma, setAdminNewDharma] = useState('')
  const [adminNewPhone, setAdminNewPhone] = useState('')
  const [adminNewRole, setAdminNewRole] = useState('agent')
  const [adminNewParent, setAdminNewParent] = useState('55570267')

  // 로그인 핸들러
  const handleLogin = (e) => {
    e.preventDefault()
    const code8 = extractPhone8Code(loginIdInput)
    const found = members.find((m) => m.code === code8)
    if (!found) {
      showToast('등록되지 않은 전화번호(아이디)입니다. 회원가입을 먼저 진행해 주세요.')
      return
    }
    const inputPw = loginPwInput.trim()
    const phoneLast4 = found.phone ? found.phone.replace(/[^0-9]/g, '').slice(-4) : ''
    // 비밀번호 우선순위:
    // 1) 본인이 설정/등록한 password_pin
    // 2) 아직 설정한 적 없는 기존 회원의 경우: 휴대전화 뒷 4자리 또는 '0000'
    const expectedPw = (found.password_pin && found.password_pin.trim()) || phoneLast4 || '0000'
    const isPwValid = Boolean(inputPw && inputPw === expectedPw)

    if (!isPwValid) {
      showToast('비밀번호가 일치하지 않습니다. (초기 비밀번호: 휴대전화 뒷 4자리 또는 0000)')
      return
    }
    setCurrentUserCode(found.code)
    setLoginIdInput('')
    setLoginPwInput('')
    playSingingBowlSound()
    showToast(
      `🙏 반갑습니다, ${found.name}${found.dharma_name ? `(${found.dharma_name})` : ''}님! 본인 계정으로 접속되었습니다.`
    )
    setActiveTab('home')
  }

  // 로그아웃 핸들러: 세션 종료 및 개인정보 보호 (로그아웃 시 소원등 로컬 상태도 안전하게 비워 타인 노출 방지)
  const handleLogout = () => {
    setCurrentUserCode('')
    setWishName('')
    setWishPhone('')
    setWishTarget('')
    setLanternData(null)
    try {
      localStorage.removeItem('sowonsa_7day_lantern')
      localStorage.setItem('sowonpray_current_user_v3', '')
    } catch (e) {}
    showToast('로그아웃되었습니다. 로그인/가입 화면으로 전환됩니다.')
  }

  // 신규 회원가입 핸들러 (필수: 성함 + 전화번호 + 비밀번호 / 선택: 법명·생년월일·주소·가족메모)
  const handleSignup = (e) => {
    e.preventDefault()
    const code8 = extractPhone8Code(signupPhone)
    if (!signupName.trim() || code8.length !== 8 || !signupPw.trim()) {
      showToast('성함, 휴대폰 번호, 비밀번호(4자리 이상)를 정확히 입력해 주세요.')
      return
    }
    if (members.some((m) => m.code === code8)) {
      showToast('이미 가입된 전화번호입니다. 로그인 탭에서 로그인해 주세요.')
      setAuthMode('login')
      setLoginIdInput(signupPhone)
      return
    }

    const newMember = {
      code: code8,
      phone: formatPhone11(signupPhone),
      password_pin: signupPw.trim(),
      name: signupName.trim(),
      dharma_name: signupDharmaName.trim(),
      birth_date: signupBirthDate.trim(),
      lunar_solar: signupLunarSolar,
      address: signupAddress.trim(),
      family_memo: signupFamilyMemo.trim(),
      role: 'believer',
      parent_code: referralCode || '52148821',
      bank_name: '',
      bank_account: '',
      account_holder: '',
      merit_count: 1,
      believers_count: 0,
      wipae_count: 0,
      extra_data: {},
    }

    setMembers((prev) => [newMember, ...prev])
    setCurrentUserCode(newMember.code)
    if (supabase) {
      supabase.from('members').upsert([newMember], { onConflict: 'code' }).then()
    }
    playSingingBowlSound()
    showToast(`🎉 환영합니다, ${newMember.name} 불자님! 본인 계정이 생성되어 자동 로그인되었습니다.`)
    setActiveTab('home')
  }

  // 내 정보(기본정보 + 사찰 축원 확장정보 + 정산계좌) 저장 핸들러
  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!currentUser) return
    const updatedMember = {
      ...currentUser,
      name: profileForm.name.trim() || currentUser.name,
      password_pin: profileForm.password_pin.trim() || currentUser.password_pin,
      dharma_name: profileForm.dharma_name.trim(),
      birth_date: profileForm.birth_date.trim(),
      lunar_solar: profileForm.lunar_solar,
      address: profileForm.address.trim(),
      family_memo: profileForm.family_memo.trim(),
      bank_name: profileForm.bank_name.trim(),
      bank_account: profileForm.bank_account.trim(),
      account_holder: profileForm.account_holder.trim(),
    }
    setMembers((prev) =>
      prev.map((m) => (m.code === currentUser.code ? updatedMember : m))
    )
    if (supabase) {
      supabase.from('members').upsert([updatedMember], { onConflict: 'code' }).then()
    }
    playSingingBowlSound()
    showToast('✅ 내 계정 및 사찰 축원 상세정보가 안전하게 저장되었습니다.')
  }

  // 7일 소원등 터치 상호작용 (점등 중이면 축원 안내, 미점등이면 발원문 폼으로 부드러운 스크롤 이동)
  const handleLanternClick = () => {
    playSingingBowlSound()
    if (isLanternLit) {
      showToast(
        `✨ ${lanternData?.believer_name || '불자'}님의 소원등이 제주 소원사 대웅전에서 축원 중입니다 (D-${lanternDaysRemaining}일 남음)`
      )
    } else {
      showToast('🙏 아래 발원문을 접수하시면 대웅전 소원등이 7일간 환하게 밝혀집니다.')
      const formEl = document.getElementById('lantern-prayer-form')
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // 기원 분야 변경 시 정통 예시 발원문 연동 핸들러
  const handleSelectWishCategory = (cat) => {
    const prevTemplate = PRAYER_CATEGORY_TEMPLATES[wishCategory]
    setWishCategory(cat)
    // 사용자가 직접 작성한 고유 내용이 아니거나(비어있거나 기존 예시문 템플릿 중 하나였던 경우), 새 카테고리 예시문으로 자동 전환하여 바로 수정해서 쓸 수 있게 함!
    const allTemplates = Object.values(PRAYER_CATEGORY_TEMPLATES)
    if (
      !wishText.trim() ||
      wishText.trim() === prevTemplate ||
      allTemplates.includes(wishText.trim())
    ) {
      setWishText(PRAYER_CATEGORY_TEMPLATES[cat] || '')
    }
  }

  // 소원등 점등 및 대웅전 축원 접수 핸들러 (7일간 대웅전 점등 유지)
  const handlePrayerSubmit = (e) => {
    e.preventDefault()
    if (!wishName.trim() || !wishPhone.trim()) {
      showToast('성함과 연락처를 입력해 주세요.')
      return
    }

    const finalTarget = wishTarget.trim()
    const formattedBelieverName =
      finalTarget && finalTarget !== '본인'
        ? `${wishName.trim()} (대상: ${finalTarget})`
        : wishName.trim()

    // 소원 발원문을 직접 쓰지 않고 비워둔 경우, 선택된 기원 분야의 정통 예시 발원문으로 자동 접수!
    const finalWishText =
      wishText.trim() ||
      PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
      '우리 가족 올 한 해 무병장수하고 하는 일마다 순조롭게 풀리기를 발원합니다.'

    playSingingBowlSound()
    const now = Date.now()
    const expireAt = now + 7 * 24 * 60 * 60 * 1000 // 7일 정진 축원 기간
    const newLanternInfo = {
      member_code: currentUser?.code || '',
      believer_name: formattedBelieverName,
      wish_target: finalTarget || '본인',
      believer_phone: wishPhone.trim(),
      wish_category: wishCategory,
      wish_text: finalWishText,
      lit_at: now,
      expire_at: expireAt,
    }
    try {
      localStorage.setItem('sowonsa_7day_lantern', JSON.stringify(newLanternInfo))
    } catch (err) {}
    setLanternData(newLanternInfo)

    const writerCode = currentUser?.code || extractPhone8Code(wishPhone)
    const matchedMember = members.find((m) => m.code === writerCode)
    const assignedAgentCode = currentUser?.parent_code || matchedMember?.parent_code || referralCode || '52148821'

    const newPrayer = {
      id: 'p-' + Date.now(),
      member_code: writerCode,
      believer_name: formattedBelieverName,
      wish_target: finalTarget || '본인',
      believer_phone: wishPhone.trim(),
      agent_code: assignedAgentCode,
      wish_category: wishCategory,
      wish_text: finalWishText,
      status:
        wishCategory.includes('위패') || wishCategory.includes('삼성각')
          ? 'consulting'
          : 'prayed',
      prayed_at:
        wishCategory.includes('위패') || wishCategory.includes('삼성각')
          ? '종무소 위패·삼성각 불사 우선 상담 배정됨'
          : '오늘 제주 소원사 대웅전 축원 접수완료',
      created_at: new Date().toISOString(),
    }

    setPrayers((prev) => [newPrayer, ...prev])

    // Supabase 클라우드 실시간 저장
    if (supabase) {
      supabase
        .from('prayers')
        .insert([
          {
            temple_id: 'sowonsa',
            member_code: writerCode,
            agent_code: assignedAgentCode,
            believer_name: formattedBelieverName,
            believer_phone: wishPhone.trim(),
            wish_category: wishCategory,
            wish_text: finalWishText,
            status: newPrayer.status,
            prayed_at: newPrayer.prayed_at,
          },
        ])
        .then()
    }

    // 신규 신청자 전산 자동 등록 처리 (신규 불자 DB 등재)
    const cleanPrayerPhone = wishPhone.replace(/[^0-9]/g, '')
    const prayerCode8 = extractPhone8Code(cleanPrayerPhone)
    const existingPrayerMember = members.find((m) => m.code === prayerCode8)
    if (!existingPrayerMember) {
      const newBeliever = {
        code: prayerCode8,
        phone: formatPhone11(wishPhone),
        password_pin: prayerCode8.slice(-4) || '1234',
        name: wishName.trim(),
        dharma_name: '',
        birth_date: '',
        lunar_solar: '음력',
        address: '',
        family_memo: `대웅전 소원등(${wishCategory}) 신청으로 전산 자동 등록됨`,
        role: 'believer',
        parent_code: assignedAgentCode,
        bank_name: '',
        bank_account: '',
        account_holder: '',
        merit_count: 1,
        believers_count: 0,
        wipae_count: 0,
        extra_data: { registered_via: 'wish_lantern' },
      }
      setMembers((prev) => [newBeliever, ...prev])
      if (supabase) {
        supabase.from('members').upsert([newBeliever], { onConflict: 'code' }).then()
      }
    }

    // 담당 포교사 인연 신도수 업데이트
    setMembers((prev) =>
      prev.map((m) =>
        m.code === assignedAgentCode
          ? { ...m, believers_count: (m.believers_count || 0) + 1 }
          : m
      )
    )

    setWishText(PRAYER_CATEGORY_TEMPLATES[wishCategory] || '')
    setWishTarget('')
    setShowSuccessModal(true)
    showToast('🙏 대웅전 소원등이 밝게 점등되었습니다. 사시예불마다 정성껏 축원 올립니다.')
  }

  // 전날 도량 방문 & 차담·사찰 공양(식사) 사전 예약 접수 핸들러
  const handleVisitSubmit = (e) => {
    e.preventDefault()
    const exactHeadcount = Math.max(1, Number(visitHeadcount) || 1)
    if (!wishName.trim() || !wishPhone.trim() || !visitDate) {
      showToast('방문자 성함과 연락처, 방문 예정일을 확인해 주세요.')
      return
    }
    const writerCode = currentUser?.code || extractPhone8Code(wishPhone)
    const matchedMember = members.find((m) => m.code === writerCode)
    const assignedAgentCode = currentUser?.parent_code || matchedMember?.parent_code || referralCode || '52148821'

    const newVisit = {
      id: 'v-' + Date.now(),
      member_code: writerCode,
      visitor_name: wishName.trim(),
      visitor_phone: wishPhone.trim(),
      agent_code: assignedAgentCode,
      visit_date: visitDate,
      visit_time: visitTime,
      headcount: exactHeadcount,
      visit_purpose: visitPurpose,
      memo:
        visitMemo.trim() ||
        `방문 인원 총 ${exactHeadcount}명 따뜻한 차와 사찰 공양(${exactHeadcount}인분) 부탁드립니다.`,
      status: 'reserved',
      created_at: '방금 전',
    }

    setVisits((prev) => [newVisit, ...prev])

    // Supabase 클라우드 실시간 저장
    if (supabase) {
      supabase
        .from('visits')
        .insert([
          {
            temple_id: 'sowonsa',
            member_code: writerCode,
            agent_code: assignedAgentCode,
            visitor_name: wishName.trim(),
            visitor_phone: wishPhone.trim(),
            visit_date: visitDate,
            visit_time: visitTime,
            headcount: exactHeadcount,
            visit_purpose: visitPurpose,
            memo: newVisit.memo,
            status: 'reserved',
          },
        ])
        .then()
    }

    // 신규 방문자 전산 자동 등록 처리 (신규 불자 DB 등재)
    const cleanVisitPhone = wishPhone.replace(/[^0-9]/g, '')
    const visitCode8 = extractPhone8Code(cleanVisitPhone)
    const existingVisitMember = members.find((m) => m.code === visitCode8)
    if (!existingVisitMember) {
      const newBeliever = {
        code: visitCode8,
        phone: formatPhone11(wishPhone),
        password_pin: visitCode8.slice(-4) || '1234',
        name: wishName.trim(),
        dharma_name: '',
        birth_date: '',
        lunar_solar: '음력',
        address: '',
        family_memo: `도량 방문 및 사찰 공양(${exactHeadcount}인분) 예약으로 전산 등록됨 (${visitDate})`,
        role: 'believer',
        parent_code: assignedAgentCode,
        bank_name: '',
        bank_account: '',
        account_holder: '',
        merit_count: 1,
        believers_count: 0,
        wipae_count: 0,
        extra_data: { registered_via: 'visit_reservation' },
      }
      setMembers((prev) => [newBeliever, ...prev])
      if (supabase) {
        supabase.from('members').upsert([newBeliever], { onConflict: 'code' }).then()
      }
    }

    setVisitHeadcount(exactHeadcount)
    setVisitMemo('')
    playSingingBowlSound()
    showToast(
      `🍵 [${visitDate} ${visitTime.split(' ')[0]}] 총 ${exactHeadcount}명 방문 및 사찰 공양(${exactHeadcount}인분) 예약이 접수되었습니다!`
    )
  }

  // 사경 입력 체크 및 공덕 적립 헬퍼 (본인 계정 공덕 횟수에 누적)
  const currentSutra = SUTRA_LIST[selectedSutraIdx]
  const currentMeritCount = currentUser
    ? currentUser.merit_count || 0
    : 108 + guestMeritBonus

  const addMerit = (amount = 1) => {
    if (currentUser) {
      setMembers((prev) =>
        prev.map((m) =>
          m.code === currentUser.code
            ? { ...m, merit_count: (m.merit_count || 0) + amount }
            : m
        )
      )
    } else {
      setGuestMeritBonus((prev) => prev + amount)
    }
  }

  const handleSutraChange = (val) => {
    setSutraInput(val)
    if (val.trim() === currentSutra.text.trim() && !sutraCompleted) {
      playSingingBowlSound()
      setSutraCompleted(true)
      addMerit(1)
      setShowMeritCertModal(true)
      showToast('✨ 한 줄 사경 공덕이 내 계정에 원만히 회향되었습니다. (공덕 +1)')
    }
  }

  // 글자 터치식 사경: 한 번 터치할 때마다 다음 한 어절(또는 글자)씩 목탁 소리와 함께 점등
  const handleTouchStepSutra = () => {
    if (sutraCompleted) return
    playMoktakSound()
    const target = currentSutra.text
    const currentLen = sutraInput.length
    // 공백 포함 다음 2~3글자(또는 한 단어)씩 시원하게 채워지도록 처리
    let nextLen = Math.min(target.length, currentLen + 2)
    while (nextLen < target.length && target[nextLen] === ' ') {
      nextLen++
    }
    const nextVal = target.slice(0, nextLen)
    handleSutraChange(nextVal)
  }

  // 온라인 목탁 & 108 염주 타격 핸들러
  const handleMoktakTap = () => {
    playMoktakSound()
    const next = moktakCount + 1
    setMoktakCount(next)
    if (next % 9 === 0) {
      playSingingBowlSound()
      addMerit(1)
      showToast(`📿 목탁 ${next}타 정진 회향! 청정 공덕이 +1회 적립되었습니다.`)
    }
  }

  // 총괄 관리자: 신규 회원/포교사 직접 등록
  const handleAdminAddMember = (e) => {
    e.preventDefault()
    const code8 = extractPhone8Code(adminNewPhone)
    if (!adminNewName.trim() || code8.length !== 8) {
      showToast('성함과 휴대폰 번호(뒤 8자리 포함)를 정확히 입력해 주세요.')
      return
    }
    if (members.some((m) => m.code === code8)) {
      showToast('이미 등록된 휴대폰 번호(고유코드)입니다.')
      return
    }
    const created = {
      code: code8,
      phone: formatPhone11(adminNewPhone),
      password_pin: '0000',
      name: adminNewName.trim(),
      dharma_name: adminNewDharma.trim(),
      birth_date: '',
      lunar_solar: '음력',
      address: '제주특별자치도',
      family_memo: '',
      role: adminNewRole,
      parent_code: adminNewParent || '55570267',
      bank_name: '',
      bank_account: '',
      account_holder: adminNewName.trim(),
      merit_count: 1,
      believers_count: 0,
      wipae_count: 0,
      extra_data: {},
    }
    setMembers((prev) => [created, ...prev])
    if (supabase) {
      supabase.from('members').upsert([created], { onConflict: 'code' }).then()
    }
    setAdminNewName('')
    setAdminNewDharma('')
    setAdminNewPhone('')
    playSingingBowlSound()
    showToast(`✅ [${created.name}] 회원님이 등록되었습니다. (아이디/코드: ${created.code}, 초기비번: 0000)`)
  }

  // 총괄 관리자: 신규 위패 봉안 정산 시뮬레이션 추가
  const handleAddSettlement = (e) => {
    e.preventDefault()
    if (!simBelieverName.trim()) {
      showToast('봉안 신도님 성함을 입력해 주세요.')
      return
    }
    const agent1 = members.find((a) => a.code === simAgentCode)
    const agent2 = agent1?.parent_code
      ? members.find((a) => a.code === agent1.parent_code)
      : null
    const agent3 = agent2?.parent_code
      ? members.find((a) => a.code === agent2.parent_code)
      : null

    const newRecord = {
      id: 's-' + Date.now(),
      believer_name: simBelieverName.trim(),
      item_name: simItemType,
      total_amount: Number(simAmount),
      agent_1st_code: agent1 ? agent1.code : null,
      agent_1st_name: agent1
        ? `${agent1.name}${agent1.dharma_name ? `(${agent1.dharma_name})` : ''}`
        : '-',
      agent_2nd_code: agent2 ? agent2.code : null,
      agent_2nd_name: agent2
        ? `${agent2.name}${agent2.dharma_name ? `(${agent2.dharma_name})` : ''}`
        : '-',
      agent_3rd_code: agent3 ? agent3.code : null,
      agent_3rd_name: agent3
        ? `${agent3.name}${agent3.dharma_name ? `(${agent3.dharma_name})` : ''}`
        : '-',
      payment_status: 'confirmed',
      created_at: '2026-10-21 (금일)',
    }

    setSettlements((prev) => [newRecord, ...prev])
    setSimBelieverName('')
    playSingingBowlSound()
    showToast('💰 신규 위패 봉안 및 1·2·3차 + 플랫폼 총괄(5%) 자동 정산 내역이 생성되었습니다.')
  }

  // 요율 조정 핸들러
  const updateRule = (key, val) => {
    const num = Math.max(0, Math.min(60, Number(val)))
    const next = { ...commissionRules, [key]: num }
    const sumOthers = next.rate1st + next.rate2nd + next.rate3rd + next.ratePlatform
    next.rateTemple = Math.max(0, 100 - sumOthers)
    setCommissionRules(next)
  }

  // 포교위원 추천 링크 복사
  const handleCopyRefLink = (code) => {
    const url = `${window.location.origin}/?ref=${code}`
    navigator.clipboard?.writeText(url)
    showToast(`📋 포교위원 전용 추천 링크가 복사되었습니다: ${url}`)
  }

  // QR코드 모달/펼침 상태
  const [showQrCode, setShowQrCode] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')

  const handleToggleQr = async (code) => {
    if (showQrCode === code) {
      setShowQrCode(null)
      return
    }
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
    const refUrl = `${origin}/?ref=${code}`
    try {
      const url = await QRCode.toDataURL(refUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#1B1815',
          light: '#FFFFFF',
        },
      })
      setQrDataUrl(url)
      setShowQrCode(code)
    } catch (err) {
      showToast('QR코드를 생성할 수 없습니다.')
    }
  }

  const handleDownloadQr = (name, code) => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `제주소원사_인연QR_${name || code}.png`
    a.click()
    showToast('💾 QR코드 이미지가 저장되었습니다. 카카오톡이나 인쇄물에 활용해 보세요.')
  }

  // 권한 체크 헬퍼
  const isAgentOrAbove =
    currentUser?.role === 'agent' ||
    currentUser?.role === 'committee_head' ||
    currentUser?.role === 'committee_member' ||
    currentUser?.role === 'temple_admin' ||
    currentUser?.role === 'master'

  // 김철수 총괄대표(master) 및 양영문 창건주·신도회장 사찰 최고대표(temple_admin) 총괄전산 및 관제 권한
  const isMaster = currentUser?.role === 'master'
  const isTempleAdmin = currentUser?.role === 'temple_admin'
  const isMasterOrTempleAdmin = isMaster || isTempleAdmin
  const isAdmin = isMasterOrTempleAdmin

  return (
    <div className="min-h-screen bg-[#12100E] flex justify-center selection:bg-[#C59B27] selection:text-white w-full max-w-full overflow-x-clip">
      {/* 모바일 앱 컨테이너 (최대 480px 중앙 정렬) */}
      <div className="w-full max-w-[480px] min-h-screen bg-[#FAF8F5] text-[#231F1C] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#E8DFD1]/30 pb-24 overflow-x-clip">
        
        {/* 상단 고정 헤더: 제주 소원사 공식 모바일 법당 */}
        <header className="sticky top-0 z-40 bg-[#1B1815]/95 backdrop-blur-md text-[#FAF8F5] px-3.5 py-3 border-b-2 border-[#C59B27]/50 flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D241C] via-[#221C16] to-[#17130F] flex items-center justify-center shadow-[0_0_15px_rgba(245,208,97,0.35)] border border-[#C59B27]/60 p-1 shrink-0" title="제주 소원사 공식 심볼 (황금 연꽃)">
              <svg className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 5C20 5 15 14.5 15 21C15 23.8 17.2 26 20 26C22.8 26 25 23.8 25 21C25 14.5 20 5 20 5Z" fill="url(#headerGoldLotusGrad)" opacity="0.95" />
                <path d="M14 12C14 12 7.5 18.5 7.5 23C7.5 26.2 10.2 28 13.2 28C16.2 28 17.8 25.5 17.8 24C17.8 18.5 14 12 14 12Z" fill="url(#headerGoldLotusGrad)" opacity="0.82" />
                <path d="M26 12C26 12 32.5 18.5 32.5 23C32.5 26.2 29.8 28 26.8 28C23.8 28 22.2 25.5 22.2 24C22.2 18.5 26 12 26 12Z" fill="url(#headerGoldLotusGrad)" opacity="0.82" />
                <path d="M6.5 22.5C6.5 22.5 2.5 26 2.5 29C2.5 31.2 4.5 33 7.8 33C11.8 33 14.8 29.8 14.8 28C14.8 25.2 6.5 22.5 6.5 22.5Z" fill="url(#headerGoldLotusGrad)" opacity="0.65" />
                <path d="M33.5 22.5C33.5 22.5 37.5 26 37.5 29C37.5 31.2 35.5 33 32.2 33C28.2 33 25.2 29.8 25.2 28C25.2 25.2 33.5 22.5 33.5 22.5Z" fill="url(#headerGoldLotusGrad)" opacity="0.65" />
                <path d="M11.5 32C15.2 34.8 24.8 34.8 28.5 32C26.5 34.8 23.5 35.8 20 35.8C16.5 35.8 13.5 34.8 11.5 32Z" fill="url(#headerGoldLotusGrad)" />
                <defs>
                  <linearGradient id="headerGoldLotusGrad" x1="5" y1="5" x2="35" y2="35" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE68A" />
                    <stop offset="0.5" stopColor="#F5D061" />
                    <stop offset="1" stopColor="#B6861C" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif-kr font-extrabold text-base sm:text-lg tracking-tight text-[#F5D061] whitespace-nowrap">
                  제주 소원사
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C59B27]/25 text-[#FAF8F5] border border-[#C59B27]/50 font-semibold whitespace-nowrap">
                  모바일 법당
                </span>
              </div>
              <p className="text-[10.5px] text-[#D6CEC2] truncate">
                간절한 소원이 이루어지는 기도·불공의 성지
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playSingingBowlSound()
              showToast('🔔 맑은 법종(싱잉볼) 소리와 함께 마음을 정화합니다.')
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#2A2520] hover:bg-[#38312A] border border-[#C59B27]/40 text-[#F5D061] text-[11px] font-semibold whitespace-nowrap shrink-0 transition"
            title="법종 소리 듣기"
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span>법종</span>
          </button>
        </header>

        {/* 상단 본인 계정 접속 상태 바 (언제든 내 정보 확인 및 계정 전환 가능) */}
        <div className="bg-gradient-to-r from-[#26211C] via-[#302922] to-[#26211C] px-3.5 py-2 text-xs text-[#E8DFD1] flex items-center justify-between gap-2 border-b border-[#C59B27]/25">
          {currentUser ? (
            <>
              <div className="flex items-center gap-1.5 min-w-0">
                <UserCheck className="w-3.5 h-3.5 text-[#F5D061] shrink-0" />
                <span className="truncate text-[11.5px]">
                  <strong className="text-[#F5D061]">
                    {currentUser.name}
                    {currentUser.dharma_name ? ` (${currentUser.dharma_name})` : ''}
                  </strong>
                  {currentUser.role === 'master' || currentUser.role === 'agent' || currentUser.role === 'committee_head'
                    ? ' 포교위원장님'
                    : currentUser.role === 'committee_member'
                    ? ' 포교위원님'
                    : currentUser.role === 'temple_admin'
                    ? ' 회장님'
                    : ' 불자님'}{' '}
                  접속중
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-[10.5px] bg-[#C59B27]/25 hover:bg-[#C59B27]/40 text-[#F5D061] border border-[#F5D061]/30 px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0 transition"
              >
                내정보 · 전환
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-[#F5D061] shrink-0" />
                <span className="truncate text-[11.5px]">
                  로그인하시면 소원등·사경 공덕이 내 계정에 기록됩니다
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-[10.5px] bg-[#F5D061] text-[#1B1815] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap shrink-0"
              >
                로그인 / 가입
              </button>
            </>
          )}
        </div>

        {/* 토스트 알림 */}
        {toast && (
          <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="w-full max-w-[440px] bg-[#1E1A16]/95 text-[#FAF8F5] border border-[#F5D061] px-4 py-3 rounded-xl shadow-2xl text-xs leading-relaxed flex items-center gap-2.5 animate-bounce pointer-events-auto break-keep">
              <Sparkles className="w-4 h-4 text-[#F5D061] shrink-0" />
              <span>{toast}</span>
            </div>
          </div>
        )}

        {/* ==================== 1. 신행홈 탭 ==================== */}
        {activeTab === 'home' && (
          <main className="flex-1 flex flex-col gap-3.5 px-2 py-3.5">
            {/* 히어로 3종 경량 캐러셀 카드: 제주 소원사 도량·대웅전·위패/삼성각 불사 */}
            {(() => {
              const slide = HERO_SLIDES[heroSlideIdx] || HERO_SLIDES[0]
              return (
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#D8CBB8] min-h-[224px] flex flex-col justify-between p-4 bg-[#161310]">
                  {HERO_SLIDES.map((s, idx) => (
                    <img
                      key={s.id}
                      src={s.image}
                      alt={s.titleHighlight}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      className={`absolute inset-0 w-full h-full object-cover brightness-105 transition-opacity duration-700 ${
                        idx === heroSlideIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161310]/95 via-[#161310]/50 to-black/25" />

                  {/* 상단 배지 + 우측 슬라이드 인디케이터 점 (1/3) */}
                  <div className="relative z-10 flex justify-between items-center gap-2 mb-5">
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[#F5D061] text-[11px] font-semibold border border-[#F5D061]/35 flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                      {slide.badge}
                    </span>

                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full border border-white/15 shrink-0">
                      {HERO_SLIDES.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setHeroSlideIdx(idx)}
                          aria-label={`${idx + 1}번 배너 보기`}
                          className={`h-2 rounded-full transition-all ${
                            idx === heroSlideIdx
                              ? 'w-5 bg-[#F5D061]'
                              : 'w-2 bg-white/45 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 하단 타이틀 & 설명 & 바로가기 버튼 */}
                  <div className="relative z-10 text-white pt-1 pb-0.5">
                    <h1 className="font-serif-kr text-xl sm:text-2xl font-bold leading-tight mb-1.5 break-keep">
                      {slide.titlePrefix}{' '}
                      <span className="text-[#F5D061] underline decoration-[#F5D061]/50 underline-offset-4 whitespace-nowrap">
                        {slide.titleHighlight}
                      </span>
                    </h1>
                    <p className="text-xs text-[#E8DFD1] leading-relaxed break-keep">
                      {slide.description}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          playMoktakSound()
                          setActiveTab(slide.targetTab)
                        }}
                        className="px-3 py-1 rounded-lg bg-[#F5D061]/20 hover:bg-[#F5D061]/30 text-[#F5D061] border border-[#F5D061]/40 text-[11px] font-bold transition whitespace-nowrap"
                      >
                        {slide.ctaLabel}
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setHeroSlideIdx(
                              (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
                            )
                          }
                          className="w-6 h-6 rounded-full bg-black/55 text-[#F5D061] border border-[#F5D061]/30 text-xs font-bold flex items-center justify-center hover:bg-black/80 transition"
                          aria-label="이전 배너"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setHeroSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
                          }
                          className="w-6 h-6 rounded-full bg-black/55 text-[#F5D061] border border-[#F5D061]/30 text-xs font-bold flex items-center justify-center hover:bg-black/80 transition"
                          aria-label="다음 배너"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* 오늘의 부처님 말씀 */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] relative overflow-hidden">
              <div className="flex items-center justify-between gap-1.5 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-[#9A7418] bg-[#FAF3DF] px-2.5 py-1 rounded-full border border-[#E5D399] whitespace-nowrap">
                    오늘의 부처님 말씀
                  </span>
                  {/* 소리 아이콘 버튼 */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleSpeech(
                        'home-quote',
                        `오늘의 부처님 말씀입니다. ${currentQuote.verse}. ${currentQuote.source}. ${currentQuote.commentary}`
                      )
                    }
                    title="말씀 듣기"
                    aria-label="말씀 듣기"
                    className={`p-1.5 rounded-full border transition flex items-center justify-center shrink-0 ${
                      speakingId === 'home-quote'
                        ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] animate-pulse shadow-sm'
                        : 'bg-[#FAF3DF] text-[#9A7418] border-[#E5D399] hover:bg-[#F3E7C4] hover:text-[#7A5B0B]'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  {/* 말씀 카톡/지인 법공양 공유 버튼 */}
                  <button
                    type="button"
                    onClick={() => {
                      const shareText = `📿 [제주 소원사 오늘의 부처님 말씀]\n\n"${currentQuote.verse}"\n- ${currentQuote.source}\n\n뜻풀이: ${currentQuote.commentary}\n\n🙏 매일 아침 함께하는 모바일 법당:\nhttps://sowonpray.vercel.app`
                      if (navigator.share) {
                        navigator.share({
                          title: '제주 소원사 오늘의 부처님 말씀',
                          text: shareText,
                          url: 'https://sowonpray.vercel.app',
                        }).catch(() => {})
                      } else if (navigator.clipboard) {
                        navigator.clipboard.writeText(shareText)
                        showToast('📋 부처님 말씀이 복사되었습니다. 카카오톡으로 지인에게 전해보세요!')
                      }
                    }}
                    title="오늘의 부처님 말씀 지인에게 전하기 (법공양)"
                    aria-label="말씀 공유하기"
                    className="p-1.5 rounded-full border border-[#E5D399] bg-[#FAF3DF] text-[#9A7418] hover:bg-[#F3E7C4] hover:text-[#7A5B0B] transition flex items-center justify-center shrink-0 active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const nextIdx = (quoteIdx + 1) % DAILY_QUOTES.length
                      setQuoteIdx(nextIdx)
                      const nextQuote = DAILY_QUOTES[nextIdx]
                      if (autoVoiceEnabled || speakingId === 'home-quote') {
                        startSpeech(
                          'home-quote',
                          `${nextQuote.verse}. ${nextQuote.source}. ${nextQuote.commentary}`
                        )
                      } else {
                        playSingingBowlSound()
                      }
                    }}
                    className="text-xs text-[#786E63] hover:text-[#231F1C] flex items-center gap-1 whitespace-nowrap shrink-0 px-2 py-1 rounded-lg hover:bg-black/5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span>다른 말씀</span>
                  </button>
                </div>
              </div>

              <blockquote className="font-serif-kr text-[16px] sm:text-[17px] font-bold text-[#231F1C] leading-relaxed mb-2.5 break-keep">
                “{currentQuote.verse}”
              </blockquote>
              <p className="text-xs font-semibold text-[#8C7A5B] mb-2">— {currentQuote.source}</p>
              <p className="text-xs text-[#575049] bg-[#FAF8F5] p-3 rounded-xl border border-[#EFE9DD] leading-relaxed break-keep">
                💡 {currentQuote.commentary}
              </p>
            </section>

            {/* 퀵 액션 배너 2종: 7일 소원등 켜기 · 온라인 한줄 사경 (모바일 글자 잘림 없는 정갈한 규격) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playSingingBowlSound()
                  setActiveTab('lantern')
                }}
                className={`p-2.5 sm:p-3 rounded-2xl text-left border transition-all duration-300 flex items-center gap-2 overflow-hidden shadow-md hover:brightness-105 active:scale-95 relative ${
                  isLanternLit
                    ? 'bg-gradient-to-br from-[#FFF8E7] via-[#FDF0D0] to-[#FCE6B3] border-[#E8C568] shadow-[0_4px_16px_rgba(212,175,55,0.22)]'
                    : 'bg-gradient-to-br from-[#FFF9EE] via-[#FDF1D6] to-[#F8E3B6] border-[#E5CA85] shadow-sm'
                }`}
              >
                {/* 은은한 등불 광명 후광 */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#F5D061]/35 rounded-full blur-xl pointer-events-none" />

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 relative z-10 ${
                    isLanternLit
                      ? 'bg-gradient-to-br from-[#E25C2B] via-[#E98227] to-[#F4B41A] text-white border-[#FFEAA7] shadow-[0_0_14px_rgba(233,130,39,0.55)] scale-105'
                      : 'bg-gradient-to-br from-[#C98B22] to-[#996510] text-[#FFF4D0] border-[#FFD978]/60 shadow-sm'
                  }`}
                >
                  <Flame className={`w-4 h-4 ${isLanternLit ? 'fill-current flame-flicker text-[#FFF7CE]' : 'text-white'}`} />
                </div>
                <div className="min-w-0 flex-1 relative z-10">
                  <span className="block text-[10px] font-extrabold tracking-tight whitespace-nowrap leading-none text-[#A86E0B]">
                    {isLanternLit
                      ? `✨ 축원점등 (D-${lanternDaysRemaining})`
                      : '대웅전 7일 무료'}
                  </span>
                  <h3 className="font-serif-kr font-extrabold text-[13.5px] sm:text-[14.5px] mt-1 tracking-tight whitespace-nowrap leading-tight text-[#2B1F11]">
                    {isLanternLit ? '나의 소원등' : '소원등 켜기'}
                  </h3>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSingingBowlSound()
                  setActiveTab('sutra')
                }}
                className="bg-gradient-to-br from-[#F6F1E4] to-[#EAE0C8] text-[#231F1C] p-2.5 sm:p-3 rounded-2xl text-left border border-[#D5C59B] shadow-md hover:brightness-105 active:scale-95 transition flex items-center gap-2 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-xl bg-[#9A7418]/15 border border-[#9A7418]/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-[#8A6510]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] text-[#8A6510] font-semibold tracking-tight whitespace-nowrap leading-none">
                    나의 공덕 {currentMeritCount}회
                  </span>
                  <h3 className="font-serif-kr font-bold text-[13px] sm:text-sm mt-1 tracking-tight whitespace-nowrap leading-tight text-[#231F1C]">
                    한 줄 사경
                  </h3>
                </div>
              </button>
            </div>

            {/* ==================== 24시간 마음 쉼터: 일할 때 & 잘 때 듣는 법음(法音) 플레이어 (대안 1: 슬림 콤팩트 바 + 터치 시 펼침) ==================== */}
            <section className="rounded-2xl bg-gradient-to-br from-[#1E1914] via-[#2A221A] to-[#16120E] text-white border-2 border-[#C59B27]/60 shadow-xl overflow-hidden transition-all duration-300">
              {/* 은은한 배경 후광 */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F5D061]/10 rounded-full blur-2xl pointer-events-none" />

              {/* [기본 플레이어 바] 접힘/펼침과 무관하게 상시 그대로 유지 */}
              <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5">
                <div
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => setIsPlayerExpanded((prev) => !prev)}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isHealingPlaying
                        ? 'bg-[#F5D061] text-[#1B1815] border-[#FFF3B8] shadow-[0_0_15px_rgba(245,208,97,0.5)] scale-105'
                        : 'bg-white/10 text-[#F5D061] border-white/10'
                    }`}
                  >
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-[#F5D061] bg-[#F5D061]/15 px-1.5 py-0.2 rounded border border-[#F5D061]/30 whitespace-nowrap">
                        24시간 법음 쉼터
                      </span>
                      {isHealingPlaying && (
                        <span className="flex items-center gap-1 text-[9.5px] text-[#4ADE80] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-ping" />
                          치유중
                        </span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white truncate mt-0.5 flex items-center gap-1">
                      <span>{HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.icon}</span>
                      <span className="truncate">
                        {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 우측 퀵 컨트롤: 재생/정지 + 트랙목록 열기/닫기 아이콘 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleHealingPlay()}
                    className="w-9 h-9 rounded-full bg-[#F5D061] text-[#1B1815] flex items-center justify-center shadow hover:scale-105 active:scale-95 transition"
                    title="재생 / 일시정지"
                  >
                    {isHealingPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlayerExpanded((prev) => !prev)}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${
                      isPlayerExpanded
                        ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                        : 'bg-white/10 hover:bg-white/15 text-[#F5D061] border-[#F5D061]/30'
                    }`}
                    title={isPlayerExpanded ? '트랙 목록 닫기' : '5대 불경 트랙 목록 열기'}
                    aria-label="트랙 목록 열기/닫기"
                  >
                    {isPlayerExpanded ? <ChevronUp className="w-4 h-4" /> : <ListMusic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* [펼침 상태] 플레이어 바 바로 아래에 트랙 목록만 깔끔하게 드롭다운 */}
              {isPlayerExpanded && (
                <div className="px-3 pb-3.5 pt-1 space-y-2.5 border-t border-white/10 animate-in fade-in duration-200">
                  {/* 상단 간편 안내 */}
                  <div className="pt-1.5 pb-0.5">
                    <span className="text-[11.5px] font-bold text-[#F5D061] flex items-center gap-1.5">
                      <span>📜</span>
                      <span>원하시는 독경 · 쉼터 트랙을 선택해 주세요</span>
                    </span>
                  </div>

                  {/* 5대 힐링 트랙 선택 리스트 (한 줄씩 풀 너비로 글자 잘림 없이 시원하게 노출) */}
                  <div className="flex flex-col gap-2 relative z-10">
                    {HEALING_AUDIO_TRACKS.map((t) => {
                      const isSelected = healingAudioTrack === t.id
                      const isThisPlaying = isSelected && isHealingPlaying
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleHealingPlay(t.id)}
                          className={`w-full p-3 sm:p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#3D3020] via-[#2A2015] to-[#1C150E] border-[#F5D061] shadow-lg'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-2xl border ${
                                isSelected
                                  ? 'bg-[#F5D061]/20 border-[#F5D061]/40 shadow-sm'
                                  : 'bg-white/5 border-white/10'
                              }`}
                            >
                              {t.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] text-[#F5D061] font-bold">
                                  {t.category}
                                </span>
                                {t.id === 'prajna_chanting' || t.id === 'sleep_meditation' || t.id === 'dhammapada_wisdom' ? (
                                  <span className="bg-[#F5D061]/25 text-[#FFE58A] px-1.5 py-0.2 rounded text-[8.5px] font-bold border border-[#F5D061]/40">
                                    🎙️ 영인스님 실물 독경 원음
                                  </span>
                                ) : t.id === 'rhythmic_moktak' ? (
                                  <span className="bg-[#F5D061]/20 text-[#FFE58A] px-1.5 py-0.2 rounded text-[8.5px] font-bold border border-[#F5D061]/30">
                                    🪷 천년고찰 실물 목탁
                                  </span>
                                ) : (
                                  <span className="bg-white/10 text-[#C2B8AB] px-1.5 py-0.2 rounded text-[8.5px] font-medium border border-white/10">
                                    🍃 사찰 자연 ASMR
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm font-bold text-white break-keep">
                                {t.title}
                              </div>
                              <div className="text-[11px] text-[#C2B8AB] break-keep mt-0.5 leading-snug">
                                {t.subtitle}
                              </div>
                            </div>
                          </div>

                          {/* 우측 재생 상태 인디케이터 또는 버튼 */}
                          <div className="shrink-0 flex items-center">
                            {isThisPlaying ? (
                              <div className="flex items-center gap-1 bg-[#F5D061] text-[#1B1815] px-2.5 py-1 rounded-full text-[10.5px] font-bold shadow-md">
                                <span className="flex gap-0.5 items-end h-3">
                                  <span className="w-0.5 h-3 bg-[#1B1815] animate-pulse" />
                                  <span className="w-0.5 h-1.5 bg-[#1B1815] animate-pulse delay-75" />
                                  <span className="w-0.5 h-2.5 bg-[#1B1815] animate-pulse delay-150" />
                                </span>
                                <span>재생중</span>
                              </div>
                            ) : isSelected ? (
                              <div className="w-8 h-8 rounded-full bg-[#F5D061]/20 border border-[#F5D061]/40 text-[#F5D061] flex items-center justify-center shadow-sm">
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 text-[#8C8275] flex items-center justify-center">
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* 스튜디오 마스터 음원 출처 및 안심 보증 배지 */}
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[#A89880] bg-white/5 px-3 py-2 rounded-xl border border-white/10 relative z-10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                      <span className="truncate">영인스님 독경 &amp; 대웅전 실물 목탁 · BBS 불교방송 마스터링본</span>
                    </div>
                    <span className="text-[#F5D061] font-bold text-[9.5px] shrink-0 ml-1">사찰 포교 및 법공양</span>
                  </div>

                  {/* 플레이어 조작 바 & 수면 타이머 */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleHealingPlay()}
                        className="w-10 h-10 rounded-full bg-[#F5D061] text-[#1B1815] flex items-center justify-center shrink-0 shadow-lg hover:scale-105 active:scale-95 transition"
                      >
                        {isHealingPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#F5D061] truncate flex items-center gap-1">
                          <span>{HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.title}</span>
                          {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.voiceText &&
                            isHealingVoiceOn && (
                              <span className="text-[9px] text-[#4ADE80] font-normal shrink-0">
                                (낭독중)
                              </span>
                            )}
                        </div>
                        <div className="text-[10.5px] text-[#C2B8AB] truncate">
                          {isHealingPlaying
                            ? sleepTimerSecondsLeft > 0
                              ? `🌙 ${Math.floor(sleepTimerSecondsLeft / 60)}분 ${sleepTimerSecondsLeft % 60}초 후 자동종료`
                              : '화면 꺼짐 지원 · 연속 스트리밍 중'
                            : '재생 버튼을 눌러 스님 음성으로 청취하세요'}
                        </div>
                      </div>
                    </div>

                    {/* 수면 타이머 퀵 버튼들 */}
                    <div className="flex items-center gap-1 shrink-0">
                      {[15, 30, 60].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleSetSleepTimer(m)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                            sleepTimerMinutes === m
                              ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                              : 'bg-white/5 text-[#D6CEC2] border-white/10 hover:bg-white/15'
                          }`}
                        >
                          {m}분
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 하단 전체화면 모달 열기 & 접기 바 */}
                  <div className="flex items-center justify-between pt-1 text-xs text-[#8C8275] border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowFullAudioModal(true)}
                      className="hover:text-[#F5D061] flex items-center gap-1 text-[11px] font-medium transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>전체화면 감성 LP 모드</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPlayerExpanded(false)}
                      className="hover:text-white flex items-center gap-1 text-[11px] font-bold transition"
                    >
                      <span>위로 접기</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* 따뜻한 차와 사찰 공양(식사) 대접 온라인 사전예약 카드 (평소에는 깔끔하게 접혀 있고 버튼 터치 시 열림) */}
            <section className="rounded-2xl bg-gradient-to-br from-[#29231E] to-[#1C1814] text-white p-4 sm:p-5 border border-[#C59B27]/50 shadow-lg space-y-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#C59B27]/20 border border-[#F5D061]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Coffee className="w-5 h-5 text-[#F5D061]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[11px] text-[#F5D061] font-semibold break-keep">
                    전날 예약 시 차(茶) · 사찰 공양(식사) 무료 대접
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold mt-0.5 break-keep">
                    “도량에서 따뜻한 차 한 잔 나누세요”
                  </h3>
                  <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed break-keep">
                    제주 소원사는 모든 불자님께 언제나 열려 있습니다.{' '}
                    <span className="text-[#F5D061] font-semibold">
                      오시기 전날 미리 방문 예약을 남겨주시면 따뜻한 차와 정성스러운 사찰 공양(식사)을 무료로 준비해 드립니다.
                    </span>
                  </p>
                </div>
              </div>

              {/* 예약창 열기/닫기 버튼 */}
              <button
                type="button"
                onClick={() => setShowVisitForm((prev) => !prev)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#C59B27] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 transition flex items-center justify-between gap-1.5"
              >
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>전날 방문 · 사찰 공양(식사) 예약</span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-[#1B1815] text-[#F5D061] text-[10.5px] font-bold whitespace-nowrap shrink-0">
                  {showVisitForm ? '창 닫기 ▲' : '창 열기 ▼'}
                </span>
              </button>

              {/* 버튼 클릭 시에만 펼쳐지는 온라인 전날 방문 & 식사(공양) 예약 폼 */}
              {showVisitForm && (
                <form
                  onSubmit={handleVisitSubmit}
                  className="bg-[#181411] rounded-xl p-3.5 sm:p-4 border border-[#C59B27]/40 space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5D061] whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>방문 · 공양 예약 신청서</span>
                    </div>
                    {currentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/30 whitespace-nowrap shrink-0">
                        내 계정 연동됨
                      </span>
                    )}
                  </div>

                  {/* 1열 가로줄 배치: 모든 입력/선택창 좌우 끝선 100% 칼정렬 (grid-cols-[80px_minmax(0,1fr)]) */}
                  <div className="space-y-2 w-full">
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap">
                        방문 예정일
                      </label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#26211C] border border-[#C59B27]/50 text-white text-xs font-bold focus:outline-none focus:border-[#F5D061]"
                      />
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap">
                        방문 인원수
                      </label>
                      <div className="flex items-center justify-between w-full max-w-full min-w-0 box-border px-1.5 py-1 rounded-lg bg-[#26211C] border border-[#C59B27]/50 focus-within:border-[#F5D061]">
                        <button
                          type="button"
                          onClick={() =>
                            setVisitHeadcount((prev) => Math.max(1, Number(prev || 1) - 1))
                          }
                          className="w-8 h-8 rounded-md bg-[#181411] border border-[#C59B27]/40 text-[#F5D061] font-extrabold text-base flex items-center justify-center shrink-0 active:scale-95 transition"
                          aria-label="방문 인원 1명 감소"
                        >
                          -
                        </button>
                        <div className="flex items-center justify-center gap-1 min-w-0 flex-1 px-1">
                          <input
                            type="number"
                            min={1}
                            max={200}
                            value={visitHeadcount}
                            onChange={(e) => {
                              const val = e.target.value
                              if (val === '') {
                                setVisitHeadcount('')
                              } else {
                                setVisitHeadcount(
                                  Math.max(1, Math.min(200, parseInt(val, 10) || 1))
                                )
                              }
                            }}
                            onBlur={() => {
                              if (!visitHeadcount || Number(visitHeadcount) < 1) {
                                setVisitHeadcount(1)
                              }
                            }}
                            className="w-10 text-right bg-transparent text-[#F5D061] text-sm font-extrabold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs text-white font-extrabold whitespace-nowrap pr-1">
                            명
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setVisitHeadcount((prev) => Math.min(200, Number(prev || 1) + 1))
                          }
                          className="w-8 h-8 rounded-md bg-[#181411] border border-[#C59B27]/40 text-[#F5D061] font-extrabold text-base flex items-center justify-center shrink-0 active:scale-95 transition"
                          aria-label="방문 인원 1명 증가"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 방문 시간 및 목적 2x2 직관형 원터치 버튼 */}
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-2 w-full pt-0.5">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap pt-2">
                        시간 · 목적
                      </label>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {VISIT_TIME_SLOTS.map((slot) => {
                          const isSelected =
                            visitTime === slot.fullTime ||
                            visitTime === slot.time ||
                            visitTime.includes(slot.time)
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => {
                                setVisitTime(slot.fullTime)
                                setVisitPurpose(slot.purpose)
                              }}
                              className={`relative p-2.5 rounded-xl border text-left transition flex flex-col justify-center active:scale-95 ${
                                isSelected
                                  ? 'bg-[#C59B27]/25 border-[#F5D061] text-[#F5D061] shadow-[0_0_12px_rgba(245,208,97,0.25)] ring-1 ring-[#F5D061]'
                                  : 'bg-[#26211C] border-[#C59B27]/40 text-[#D6CEC2] hover:border-[#C59B27]'
                              }`}
                            >
                              {slot.badge && (
                                <span className="absolute -top-1.5 right-1.5 px-1.5 py-0.2 rounded-full bg-[#E53935] text-white text-[9px] font-extrabold shadow">
                                  {slot.badge}
                                </span>
                              )}
                              <span className="text-xs font-black tracking-wide flex items-center gap-1 text-white">
                                <Clock className="w-3.5 h-3.5 text-[#F5D061] shrink-0" />
                                {slot.time}
                              </span>
                              <span
                                className={`text-[11px] font-bold mt-1 leading-tight ${
                                  isSelected ? 'text-[#F5D061]' : 'text-[#A89E90]'
                                }`}
                              >
                                {slot.title}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 신청자 정보 입력 영역 구분 (동일한 좌우 끝선 칼정렬) */}
                  <div className="pt-2.5 border-t border-white/10 space-y-2 w-full">
                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#F5D061] font-bold whitespace-nowrap">
                        방문자 성함
                      </label>
                      <input
                        type="text"
                        value={wishName}
                        onChange={(e) => setWishName(e.target.value)}
                        placeholder="예: 홍길동 (무량심)"
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border-2 border-[#C59B27] text-[#1B1815] font-bold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#F5D061] font-bold whitespace-nowrap">
                        연락처 번호
                      </label>
                      <input
                        type="tel"
                        value={wishPhone}
                        onChange={(e) => setWishPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border-2 border-[#C59B27] text-[#1B1815] font-bold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#D6CEC2] font-semibold whitespace-nowrap">
                        요청 메모
                      </label>
                      <input
                        type="text"
                        value={visitMemo}
                        onChange={(e) => setVisitMemo(e.target.value)}
                        placeholder={`예: 총 ${visitHeadcount || 1}명 점심 공양 부탁드립니다`}
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border border-[#C59B27]/60 text-[#1B1815] text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#F5D061] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>총 {visitHeadcount || 1}명 방문 · 사찰 공양(식사) 예약 접수하기</span>
                  </button>
                </form>
              )}

              {/* 전화 예약 바로가기 버튼 2종 */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:010-5557-0267"
                  className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-white/15 text-[#F5D061] font-bold text-[11px] border border-[#F5D061]/40 hover:bg-white/20 transition whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>예약 010-5557-0267</span>
                </a>
                <a
                  href="tel:064-805-2007"
                  className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-white/10 text-white font-semibold text-[11px] border border-white/20 hover:bg-white/15 transition whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>종무소 064-805-2007</span>
                </a>
              </div>
            </section>

            {/* 실시간 대웅전 소원등 축원 현황 (첫 화면에는 순수 소원 기도만 노출하여 부담 제거) */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#C59B27] shrink-0" />
                  <h2 className="font-serif-kr font-bold text-sm sm:text-base text-[#231F1C] truncate">
                    실시간 소원사 축원 등불
                  </h2>
                </div>
                <span className="text-[10.5px] font-semibold text-[#8C7A5B] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#EDE6D8] whitespace-nowrap shrink-0">
                  대웅전 상시 축원
                </span>
              </div>

              <div className="space-y-2.5">
                {prayers
                  .filter(
                    (item) =>
                      !item.wish_category.includes('위패') &&
                      !item.wish_category.includes('인등') &&
                      !item.wish_category.includes('천도재') &&
                      !item.wish_category.includes('시주')
                  )
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EDE6D8] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#231F1C] truncate">
                          🕯️ {item.believer_name} ({item.wish_category})
                        </span>
                        <span className="text-[10.5px] text-[#9A7418] font-semibold whitespace-nowrap shrink-0">
                          {item.prayed_at}
                        </span>
                      </div>
                      <p className="text-xs text-[#575049] line-clamp-1">“{item.wish_text}”</p>
                    </div>
                  ))}
              </div>
            </section>

            {/* 제주 소원사 공식 사이트 & SNS 채널 통합 바로가기 (A안: 가로 원형 아이콘 바) */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#9A7418]">
                    OFFICIAL CHANNELS
                  </span>
                  <h2 className="font-serif-kr font-bold text-base text-[#231F1C] mt-0.5 whitespace-nowrap">
                    제주 소원사 공식 사이트 · 채널
                  </h2>
                </div>
                <span className="text-[11px] text-[#A69B8D] font-medium hidden sm:inline-block">
                  터치하여 바로가기
                </span>
              </div>

              {/* 가로 아이콘 그리드 / 바 */}
              <div className="grid grid-cols-6 gap-2 pt-1">
                {[
                  {
                    name: '홈페이지',
                    url: 'https://sowonsa.vercel.app/',
                    icon: (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#231F1C] to-[#151210] border border-[#C59B27] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                        <Globe className="w-5 h-5 text-[#F5D061]" />
                      </div>
                    ),
                  },
                  {
                    name: '네이버',
                    url: 'https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC%20%EC%86%8C%EC%9B%90%EC%82%AC',
                    icon: (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#03C75A] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '유튜브',
                    url: 'https://www.youtube.com/@jejusowonsa',
                    icon: (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF0000] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '인스타그램',
                    url: 'https://www.instagram.com/jejusowonsa/',
                    icon: (
                      <div
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all"
                        style={{
                          background:
                            'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '스레드',
                    url: 'https://www.threads.net/@jejusowonsa',
                    icon: (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                        <svg viewBox="0 0 192 192" className="w-5 h-5 fill-white" aria-hidden="true">
                          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.552zm-43.096 40.519c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    name: '안내카드',
                    url: 'https://sowonsa.vercel.app/introcard',
                    icon: (
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FEE500] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#3C1E1E]" aria-hidden="true">
                          <path d="M12 3C6.477 3 2 6.477 2 10.765c0 2.772 1.868 5.204 4.685 6.57-.204.763-.74 2.768-.847 3.197-.133.527.194.52.408.378.168-.111 2.668-1.81 3.746-2.546.652.094 1.323.144 2.008.144 5.523 0 10-3.477 10-7.743C22 6.477 17.523 3 12 3z" />
                        </svg>
                      </div>
                    ),
                  },
                ].map((ch) => (
                  <a
                    key={ch.url}
                    href={ch.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center gap-1.5 py-1 text-center"
                    title={ch.name}
                  >
                    {ch.icon}
                    <span className="text-[11px] font-medium text-[#544B41] group-hover:text-[#9A7418] transition-colors whitespace-nowrap">
                      {ch.name}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* ==================== 1-B. 불사안내 (생전예수재·위패·삼성각·기도 통합 신청) 탭 ==================== */}
        {activeTab === 'bulsa' && (
          <main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 상단 불사안내 헤더 */}
            <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/50 shadow-md">
              <span className="block text-[11px] text-[#F5D061] font-bold whitespace-nowrap">
                제주 소원사 상시 기도 · 공덕 불사 · 삼성각 건립 · 위패 봉안
              </span>
              <h2 className="font-serif-kr text-lg sm:text-xl font-bold mt-1 break-keep">
                현세의 복덕과 자손만대 번창을 발원합니다
              </h2>
              <p className="text-xs text-[#D6CEC2] mt-1.5 leading-relaxed break-keep">
                원하시는 불사 항목을 터치하여 선택하시고 아래 신청란에 남겨주시면 제주 소원사 종무소에서 정성껏 안내 및 축원을 도와드립니다.
              </p>
            </section>

            {/* 3대 불사 바로가기 퀵 탭 (원터치 앵커 이동) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  document.getElementById('bulsa-section-1')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="py-2.5 px-1.5 rounded-xl bg-white border border-[#E6DEC8] text-center shadow-sm hover:border-[#C59B27] transition active:scale-95"
              >
                <span className="block text-[10px] text-[#8A6510] font-bold">1. 상시 기도</span>
                <span className="block text-xs font-black text-[#231F1C] mt-0.5 truncate">공양미 · 인등</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('bulsa-section-2')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="py-2.5 px-1.5 rounded-xl bg-white border border-[#E6DEC8] text-center shadow-sm hover:border-[#C59B27] transition active:scale-95"
              >
                <span className="block text-[10px] text-[#8A6510] font-bold">2. 영구 위패</span>
                <span className="block text-xs font-black text-[#231F1C] mt-0.5 truncate">황금 · 흑색</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('bulsa-section-3')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="py-2.5 px-1.5 rounded-xl bg-white border border-[#E6DEC8] text-center shadow-sm hover:border-[#C59B27] transition active:scale-95"
              >
                <span className="block text-[10px] text-[#8A6510] font-bold">3. 성전 건립</span>
                <span className="block text-xs font-black text-[#231F1C] mt-0.5 truncate">삼성각 불사</span>
              </button>
            </div>

            {/* [큰 항목 1] 상시 기도 및 공덕 불사 종목 (4종) - 가벼운 일상 공덕 우선 배치 */}
            <section
              id="bulsa-section-1"
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3.5 scroll-mt-20"
            >
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399] text-[11.5px] font-extrabold whitespace-nowrap shadow-sm mb-1.5">
                  1. 상시 기도 및 공덕 불사 (4종)
                </span>
                <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                  공양미 시주 · 1년 가족 인등 · 100일 특별기도 · 천도재
                </h3>
                <p className="text-xs text-[#575049] mt-1 leading-relaxed break-keep">
                  부처님 전에 정성 어린 공양을 올리고 온 가족의 건강·평안과 조상 영가님의 극락왕생을 발원하는 상시 기도입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    key: '대웅전 공양미/불전시주',
                    badge: '무량 공덕 보시',
                    title: '① 대웅전 공양미 · 초 · 향 시주 불사',
                    desc: '부처님 전에 올리는 맑은 공양미와 황초·향 시주 및 제주 소원사 도량 수호 불사에 누구나 가볍게 동참하실 수 있습니다.',
                  },
                  {
                    key: '대웅전 1년 인등(가족등)',
                    badge: '365일 상시 점등',
                    title: '② 대웅전 1년 가족 인등(연등) 불사',
                    desc: '대웅전 부처님 전에 1년 365일 꺼지지 않는 등불을 밝혀 온 가족의 건강, 자녀 학업·취업, 사업 번창을 매일 사시예불(오전 10시)에 축원합니다.',
                  },
                  {
                    key: '100일 소원성취 특별기도',
                    badge: '백일 정진 가피',
                    title: '③ 대웅전 100일 소원성취 특별기도',
                    desc: '수능·학업·취업·시험합격, 사업번창 및 건강 쾌유를 위해 100일 동안 스님께서 매일 정성껏 축원 올리는 특별 정진 기도입니다.',
                  },
                  {
                    key: '49재/천도재/기일제사',
                    badge: '극락왕생 천도',
                    title: '④ 49재 · 천도재 · 기일제사 봉행',
                    desc: '돌아가신 부모·조상님, 수자령(태아령)의 극락왕생을 발원하는 천도재 및 가정에서 모시기 어려운 기일 제사를 사찰에서 정성껏 봉행합니다.',
                  },
                ].map((item) => {
                  const isSelected = wishCategory === item.key
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        playMoktakSound()
                        setWishCategory(item.key)
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF3DF] border-[#C59B27] ring-1 ring-[#C59B27]'
                          : 'bg-[#FAF8F5] border-[#EAE2D3] hover:border-[#C59B27]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                        <span className="text-xs font-bold text-[#231F1C] break-keep">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#8A6510] border border-[#E5D399] font-bold shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#575049] leading-relaxed break-keep">{item.desc}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* [큰 항목 2] 명당 위패 봉안 불사 (2종) */}
            <section
              id="bulsa-section-2"
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4 scroll-mt-20"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399] text-[11.5px] font-extrabold whitespace-nowrap shadow-sm mb-1.5">
                    2. 명당 위패 봉안 불사 (2종)
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                    생전 예수재 황금위패 · 조상 영구위패
                  </h3>
                </div>
                <Award className="w-6 h-6 text-[#C59B27] shrink-0" />
              </div>

              <div className="rounded-xl overflow-hidden border border-[#D8CBB8]">
                <img
                  src="/images/wipae_product.jpg"
                  alt="생전 예수재 황금위패와 조상 흑색 위패 실물"
                  className="w-full h-44 object-cover"
                />
                <div className="bg-[#1B1815] text-white px-3 py-2 flex flex-col sm:flex-row sm:justify-between items-center gap-1 text-[10.5px] font-bold text-center">
                  <span className="text-[#F5D061]">◀ 좌측: 생전 예수재 황금위패</span>
                  <span className="text-[#E2DAD0]">우측: 조상 영가 흑색위패 ▶</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* ① 생전 예수재 황금위패 */}
                <div
                  onClick={() => {
                    playMoktakSound()
                    setWishCategory('생전예수재(황금위패)')
                  }}
                  className={`rounded-xl border-2 p-4 space-y-2 cursor-pointer transition ${
                    wishCategory === '생전예수재(황금위패)'
                      ? 'border-[#B8860B] ring-2 ring-[#D4AF37]/40 bg-gradient-to-br from-[#FFFDF7] to-[#F6E8BE]'
                      : 'border-[#D4AF37] bg-gradient-to-br from-[#FFFDF7] to-[#F9F1D8]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#D4AF37] text-[#1B1815] break-keep">
                      살아계신 분 · 현세 복덕과 무병장수
                    </span>
                    <span className="text-xs font-extrabold text-[#8A6510] shrink-0">
                      영구 봉안
                    </span>
                  </div>
                  <h4 className="font-serif-kr font-bold text-base text-[#231F1C] break-keep">
                    ① 생전 예수재 황금빛 위패
                  </h4>
                  <p className="text-xs text-[#575049] leading-relaxed break-keep">
                    살아생전에 미리 선업과 공덕을 닦아 삼재팔난과 액난을 소멸하고, 부모님과 가족의 무병장수·수복증장을 기원하는 찬란한 황금 위패입니다.
                  </p>
                </div>

                {/* ② 조상 영가 흑색 위패 */}
                <div
                  onClick={() => {
                    playMoktakSound()
                    setWishCategory('조상영구위패(흑색)')
                  }}
                  className={`rounded-xl border p-4 space-y-2 cursor-pointer transition bg-gradient-to-br from-[#3D3731] to-[#2B2621] text-[#FAF8F5] shadow-sm ${
                    wishCategory === '조상영구위패(흑색)'
                      ? 'border-[#F5D061] ring-2 ring-[#F5D061]/40'
                      : 'border-[#5A5146]/60 hover:border-[#8C7B68]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#C59B27]/30 text-[#FCE18B] border border-[#F5D061]/50 break-keep">
                      돌아가신 조상님 · 극락왕생 천도
                    </span>
                    <span className="text-xs font-extrabold text-[#FCE18B] shrink-0">
                      영구 봉안
                    </span>
                  </div>
                  <h4 className="font-serif-kr font-bold text-base text-white break-keep">
                    ② 조상 영가 품격 흑색 영구위패
                  </h4>
                  <p className="text-xs text-[#D8D0C5] leading-relaxed break-keep">
                    중후한 흑색 바탕에 순금빛 존함을 새겨 후손들의 제사 부담을 덜어드리고, 사찰에서 영구히 독경과 합동 차례·천도 축원을 올립니다.
                  </p>
                </div>
              </div>
            </section>

            {/* [큰 항목 3] 삼성각(三聖閣) 성전 건립 대작불사 (3종) - 가벼운 소원기와부터 배치 */}
            <section
              id="bulsa-section-3"
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3.5 scroll-mt-20"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399] text-[11.5px] font-extrabold whitespace-nowrap shadow-sm mb-1.5">
                    3. 천년 도량 성전 건립 대작불사 (3종)
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                    제주 소원사 ‘삼성각(三聖閣)’ 건립 불사
                  </h3>
                  <p className="text-xs text-[#575049] mt-1 leading-relaxed break-keep">
                    성전을 짓는 불사에 한 번 이름을 올리는 공덕은 전각이 도량에 서 있는 한{' '}
                    <strong className="text-[#8A6510]">자손만대 복밭(福田)</strong>으로 이어집니다.
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
              </div>

              {/* 삼성각에 모시는 세 분 성인(三聖) 가피 요약 (정갈한 베이지 골드 톤) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                  <div className="text-[11px] font-extrabold text-[#8A6510] whitespace-nowrap">
                    칠성님
                  </div>
                  <div className="text-[10px] text-[#575049] mt-0.5 break-keep">
                    무병장수·자손번창
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                  <div className="text-[11px] font-extrabold text-[#8A6510] whitespace-nowrap">
                    산신님
                  </div>
                  <div className="text-[10px] text-[#575049] mt-0.5 break-keep">
                    재물성취·사업번창
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                  <div className="text-[11px] font-extrabold text-[#8A6510] whitespace-nowrap">
                    독성(나반존자)
                  </div>
                  <div className="text-[10px] text-[#575049] mt-0.5 break-keep">
                    빠른소원·시험합격
                  </div>
                </div>
              </div>

              {/* 삼성각 건립 3단계 동참 항목 (가벼운 소원기와부터 정갈한 카드 스타일) */}
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    key: '삼성각 소원기와불사',
                    badge: '가족 소원 기재',
                    title: '① 삼성각 건립 소원 기와 불사 (1장)',
                    desc: '한식 기와 뒷면에 온 가족의 성함과 간절한 소원을 직접 적어 삼성각 지붕 위에 영구히 올리는 정성 어린 대중 불사입니다.',
                  },
                  {
                    key: '삼성각 기둥·단청불사',
                    badge: '가문 공덕 각인',
                    title: '② 삼성각 대들보 · 기둥 · 오색단청 불사',
                    desc: '성전을 떠받치는 기둥·서까래와 장엄한 오색 단청에 시주자 가문의 이름을 영구히 각인하여 가내 평안과 자손 번창의 기틀을 세웁니다.',
                  },
                  {
                    key: '삼성각 영구축원명패',
                    badge: '가족 영구 봉안',
                    title: '③ 삼성각 가족 영구축원 명패 · 주춧돌 불사',
                    desc: '삼성각 내부에 온 가족의 이름과 발원을 담은 영구 축원 명패를 모셔 대대로 칠성·산신·독성 세 분 성인의 크신 가피를 받습니다.',
                  },
                ].map((item) => {
                  const isSelected = wishCategory === item.key
                  return (
                    <div
                      key={item.key}
                      onClick={() => {
                        playMoktakSound()
                        setWishCategory(item.key)
                      }}
                      className={`p-3.5 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FAF3DF] border-[#C59B27] ring-1 ring-[#C59B27]'
                          : 'bg-[#FAF8F5] border-[#EAE2D3] hover:border-[#C59B27]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-[#231F1C] break-keep">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#8A6510] border border-[#E5D399] font-bold whitespace-nowrap shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#575049] leading-relaxed break-keep">
                        {item.desc}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 불사·위패·기도 통합 신청란 */}
            <form
              onSubmit={handlePrayerSubmit}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#C59B27] space-y-4"
            >
              <div className="border-b border-[#EFE9DD] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[10.5px] font-bold text-[#9A7418]">
                    ONLINE APPLICATION
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                    불사 · 위패 · 기도 동참 신청란
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-[10.5px] px-2 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] font-bold border border-[#E5D399] shrink-0">
                    내 계정 연동됨
                  </span>
                )}
              </div>

              {/* STEP 1. 종목 선택 영역 */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF5E6] border border-[#E5D399]">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C]">
                    <span className="px-2 py-0.5 rounded-md bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold shrink-0">
                      1단계
                    </span>
                    <span>불사 / 기도 종목 선택</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#9A7418] shrink-0">
                    1개 선택
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '대웅전 공양미/불전시주',
                    '대웅전 1년 인등(가족등)',
                    '100일 소원성취 특별기도',
                    '49재/천도재/기일제사',
                    '생전예수재(황금위패)',
                    '조상영구위패(흑색)',
                    '삼성각 소원기와불사',
                    '삼성각 기둥·단청불사',
                    '삼성각 영구축원명패',
                    '기타 특별기도 상담',
                  ].map((cat) => {
                    const isSelected = wishCategory === cat
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleSelectWishCategory(cat)}
                        className={`py-2.5 px-2.5 rounded-xl text-[11.5px] font-bold border text-left transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow-md ring-2 ring-[#C59B27]/40'
                            : 'bg-white/80 text-[#575049] border-[#DFD3B8] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 border ${
                            isSelected
                              ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061] font-extrabold'
                              : 'bg-[#FAF8F5] text-transparent border-[#C8BFA8]'
                          }`}
                        >
                          ✓
                        </span>
                        <span className="truncate whitespace-nowrap">{cat}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-dashed border-[#DFD6C7]" />

              {/* STEP 2. 신청자 정보 및 발원 내용 입력 영역 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F4F1EA] border border-[#DDD4C4] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C]">
                    <span className="px-2 py-0.5 rounded-md bg-[#8A6510] text-white text-[10px] font-extrabold shrink-0">
                      2단계
                    </span>
                    <span>신청자 성함 · 발원문 접수</span>
                  </div>
                  <span className="text-[10.5px] text-[#7A7065] font-medium shrink-0">
                    ✎ 직접 입력
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      신청자 성함 (법명) <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      placeholder="예: 홍길동 (무량심) 또는 김영희 (부모: 이상원)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      연락처 (상담 안내용) <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={wishPhone}
                      onChange={(e) => setWishPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                    />
                  </div>
                </div>

                {/* 축원 대상란 (소원발원 대상) */}
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1.5">
                    <span>소원발원 대상 (축원 대상자)</span>
                    <span className="text-[10px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택
                    </span>
                  </label>
                  <input
                    type="text"
                    value={wishTarget}
                    onChange={(e) => setWishTarget(e.target.value)}
                    placeholder="예: 자녀 김철수, 부모님, 가족 전체"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-[#7A7065] mt-1.5 px-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                    <span>
                      비워두시면 <strong>[신청자 본인]</strong>으로 축원됩니다
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1.5">
                    <span>봉안 대상자 정보 및 발원 내용</span>
                    <span className="text-[10px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder={
                      PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
                      '예: 부모님 생전예수재 황금위패 2기 봉안 상담 희망합니다 / 가족 1년 인등 신청합니다.'
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm text-[#231F1C] shadow-inner leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#7A7065] mt-1.5 px-0.5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                      <span>
                        예시문을 자유롭게 수정하시거나 그대로 두셔도 <strong>[{wishCategory}]</strong> 기본 발원 내용으로 자동 상담 접수됩니다.
                      </span>
                    </span>
                    {wishText && (
                      <button
                        type="button"
                        onClick={() => setWishText('')}
                        className="text-[#998877] hover:text-[#554433] underline text-[10.5px] ml-2 shrink-0"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-extrabold text-xs sm:text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>[{wishCategory}] 온라인 신청 접수하기</span>
              </button>
            </form>

            {/* 제주 소원사 공식 시주 · 불사 동참 계좌 안내 및 원터치 복사 */}
            <section className="bg-gradient-to-br from-[#1E1A16] to-[#151210] rounded-2xl p-4 sm:p-5 border border-[#C59B27]/50 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F5D061] animate-pulse shrink-0" />
                  <span className="text-xs font-black text-[#F5D061] tracking-wide">
                    제주 소원사 공식 시주 · 불사 동참 계좌
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C59B27]/25 text-[#FCE18B] border border-[#F5D061]/30 font-bold whitespace-nowrap shrink-0">
                  종무소 공식
                </span>
              </div>
              <p className="text-[11.5px] text-[#D6CEC2] leading-relaxed break-keep">
                불사 및 상시기도 신청 후 아래 사찰 공식 계좌로 시주금을 입금해 주시면, 입금 확인 즉시 종무소 대웅전 축원 대장에 등재되어 매일 오전 10시 사시예불 축원이 정성껏 봉행됩니다.
              </p>
              <div className="p-3 rounded-xl bg-[#28221C] border border-[#C59B27]/40 flex flex-wrap items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="text-[11px] text-[#A89E90] font-semibold">
                    농협은행 (예금주: 소원사)
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-[#F5D061] tracking-wider mt-0.5 select-all">
                    301-0324-0024-41
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('301-0324-0024-41')
                    showToast('📋 소원사 농협 계좌번호(301-0324-0024-41)가 복사되었습니다!')
                  }}
                  className="px-3 py-2 rounded-lg bg-[#C59B27] hover:bg-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>계좌번호 복사</span>
                </button>
              </div>
              <div className="text-[10.5px] text-[#A89E90] flex items-center gap-1.5 pt-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                <span>입금 시 신청자 성함(또는 법명)으로 입금해 주시면 종무소 확인이 가장 빠릅니다.</span>
              </div>
            </section>
          </main>
        )}

        {/* ==================== 2. 디지털 소원등 탭 (7일 정진 축원 시스템) ==================== */}
        {activeTab === 'lantern' && (
          <main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 인터랙티브 3D 광명 연등 */}
            <div className="rounded-2xl bg-gradient-to-b from-[#16120E] via-[#221C15] to-[#16120E] text-white p-6 text-center relative overflow-hidden border border-[#C59B27]/40 shadow-xl">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#F5D061] font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>제주 소원사 대웅전 실시간 연동</span>
              </div>
              {isLanternLit ? (
                <>
                  <h2 className="font-serif-kr text-xl sm:text-2xl font-bold mb-2 leading-snug">
                    <span className="text-[#F5D061] block sm:inline">대웅전 부처님 전에 </span>
                    <span className="block sm:inline">소원등이 켜져 있습니다</span>
                  </h2>
                  <p className="text-xs text-[#E8DFD1] max-w-xs mx-auto leading-relaxed mb-3 break-keep">
                    스님께서 매일 오전 10시 사시예불마다{' '}
                    <strong className="text-[#F5D061]">{lanternData?.believer_name}</strong> 불자님의 소원을 정성껏 축원 올리고 있습니다.
                  </p>
                  <div className="flex justify-center mb-1">
                    <button
                      type="button"
                      onClick={() => {
                        const shareMsg = `🪔 [제주 소원사 대웅전]\n${lanternData?.believer_name || '불자'}님의 소원등이 부처님 전에 밝혀져 매일 오전 10시 사시예불 축원을 올리고 있습니다.\n\n"부처님 가피로 간절한 소원이 원만 성취되기를 발원합니다."\n\n함께 소원등 켜기:\nhttps://sowonpray.vercel.app`
                        if (navigator.share) {
                          navigator.share({
                            title: '제주 소원사 대웅전 소원등',
                            text: shareMsg,
                            url: 'https://sowonpray.vercel.app',
                          }).catch(() => {})
                        } else if (navigator.clipboard) {
                          navigator.clipboard.writeText(shareMsg)
                          showToast('📋 소원등 축원 메시지가 복사되었습니다! 카카오톡 가족방에 전해보세요.')
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#F5D061]/15 border border-[#F5D061]/50 text-[#F5D061] text-xs font-bold flex items-center gap-1.5 hover:bg-[#F5D061]/25 transition active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#F5D061]" />
                      <span>가족·지인에게 내 소원등 알리기</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-serif-kr text-xl sm:text-2xl font-bold mb-2 leading-snug">
                    <span className="block sm:inline">소원등 켜고, </span>
                    <span className="block sm:inline">간절한 소원을 올려보세요</span>
                  </h2>
                  <p className="text-xs text-[#D6CEC2] max-w-xs mx-auto leading-relaxed mb-4 break-keep">
                    정성으로 발원문을 올리시면 대웅전에 소원등이 밝혀지고 7일간 매일 오전 10시 사시예불에서 축원해 드립니다.
                  </p>
                </>
              )}

              {/* 연등 그래픽 + 하단 제주 소원사 축원 명패 (생동감 넘치는 둥실둥실 부유 모션) */}
              <div
                className={`my-4 flex flex-col items-center transition-transform duration-700 ${
                  isLanternLit ? 'lantern-floating-unit' : 'opacity-90'
                }`}
              >
                <button
                  type="button"
                  onClick={handleLanternClick}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-700 border-2 cursor-pointer ${
                    isLanternLit
                      ? 'bg-gradient-to-b from-[#FFE27A] via-[#F2A922] to-[#B86B09] border-[#FFF3B8] lantern-active shadow-[0_0_35px_rgba(245,208,97,0.6)]'
                      : isLanternExpired
                      ? 'bg-[#241E18] border-[#9E7A32] opacity-80 hover:border-[#D4AF37]'
                      : 'bg-[#1F1914] border-[#4A3D2F] opacity-85 hover:border-[#C59B27]/60'
                  }`}
                  title={isLanternLit ? '7일 정진 축원 진행중' : '발원문 접수하고 7일 소원등 밝히기'}
                >
                  {isLanternLit ? (
                    <div className="relative flex items-center justify-center flame-flicker py-1">
                      {/* 외곽 앰버 골드 따뜻한 광배 후광 */}
                      <div className="absolute w-24 h-24 bg-gradient-to-t from-[#FF7A00]/40 via-[#FFB703]/35 to-transparent rounded-full blur-xl pointer-events-none -translate-y-2" />
                      
                      {/* 진짜 사찰 촛불처럼 생동감 넘치는 입체 불꽃 SVG (외곽 주황 불꽃 + 내부 백금 고열 심지 불꽃) */}
                      <svg
                        viewBox="0 0 24 24"
                        className="w-20 h-20 relative z-10 transition-transform duration-500"
                        style={{ filter: 'drop-shadow(0 0 18px rgba(255, 200, 60, 0.95)) drop-shadow(0 -6px 20px rgba(255, 90, 10, 0.8))' }}
                      >
                        <defs>
                          <radialGradient id="outerFlameGrad" cx="50%" cy="75%" r="65%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="25%" stopColor="#FFF275" />
                            <stop offset="60%" stopColor="#FF8500" />
                            <stop offset="100%" stopColor="#D9381E" />
                          </radialGradient>
                          <radialGradient id="innerCoreGrad" cx="50%" cy="80%" r="50%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="45%" stopColor="#FFFBE6" />
                            <stop offset="85%" stopColor="#FFDE59" />
                            <stop offset="100%" stopColor="#FFAA00" />
                          </radialGradient>
                        </defs>
                        {/* 1. 외곽 주황-황금 불꽃 */}
                        <path
                          d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-2-1.5-3.5-2-4.5-.5 1-1.5 1.5-2 1.5s-1.5-1-1.5-2.5c0-.8.4-1.6 1-2.2C9.5 8 8.5 10 8.5 11.5c0 .3 0 .7.1 1-.7.4-1.1 1.2-1.1 2z"
                          fill="url(#outerFlameGrad)"
                          stroke="#FFC043"
                          strokeWidth="0.3"
                          transform="scale(1.2) translate(-2, -2)"
                        />
                        {/* 2. 내부 촛불 백색 고열 심지 코어 */}
                        <path
                          d="M10.2 14.8c.2 1.5 1 2.2 1.8 2.2s1.6-.7 1.8-2.2c0-1.1-.9-2.1-1.3-2.7-.4.6-1.1 1.6-1.3 2.7z"
                          fill="url(#innerCoreGrad)"
                          transform="scale(1.2) translate(-2, -2)"
                        />
                      </svg>
                    </div>
                  ) : (
                    <>
                      <Flame
                        className={`w-14 h-14 transition-transform duration-500 ${
                          isLanternExpired
                            ? 'text-[#A8883B] opacity-70'
                            : 'text-[#7A6B59]'
                        }`}
                      />
                      <span
                        className={`mt-1.5 font-serif-kr font-bold text-xs ${
                          isLanternExpired
                            ? 'text-[#D4AF37]'
                            : 'text-[#C2B8AB]'
                        }`}
                      >
                        {isLanternExpired
                          ? '7일 회향 · 다시 밝히기'
                          : '터치하여 7일 점등하기'}
                      </span>
                    </>
                  )}
                </button>

                {/* 연등 아래 매달린 제주 소원사 황금 축원 명패 */}
                <div className="w-0.5 h-4 bg-[#D4AF37]" />
                <div
                  className={`px-5 py-2.5 rounded-xl bg-gradient-to-b text-center min-w-[230px] max-w-[300px] transition-all shadow-lg border-2 ${
                    isLanternLit
                      ? 'from-[#3A2D18] to-[#1F170C] border-[#F5D061] shadow-[0_0_20px_rgba(245,208,97,0.25)]'
                      : 'from-[#241E18] to-[#16120E] border-[#6E5D46]'
                  }`}
                >
                  <div className="text-[10px] text-[#F5D061] font-bold tracking-widest border-b border-[#D4AF37]/30 pb-1 mb-1 whitespace-nowrap">
                    卍 제주 소원사 대웅전 축원 명패
                  </div>
                  <div className="font-serif-kr text-sm sm:text-base font-bold text-white">
                    {isLanternLit
                      ? `${lanternData?.believer_name} 불자님`
                      : wishName.trim()
                      ? `${wishName.trim()} 불자님`
                      : currentUser?.name
                      ? `${currentUser.name} 불자님`
                      : '소원성취 발원 대기'}
                  </div>
                  {currentUser?.address && (
                    <div className="text-[10px] text-[#C8C0B7] mt-0.5 truncate max-w-[200px] mx-auto">
                      {currentUser.address}
                    </div>
                  )}
                  <div className="text-[11px] mt-0.5 font-semibold flex items-center justify-center gap-1.5">
                    <span className={isLanternLit ? 'text-[#F5D061]' : 'text-[#A89C8A]'}>
                      [{isLanternLit ? lanternData?.wish_category : wishCategory}]
                    </span>
                    {isLanternLit ? (
                      <span className="px-1.5 py-0.2 rounded bg-[#F5D061]/25 text-[#FFE58A] text-[10px] font-bold border border-[#F5D061]/50">
                        7일 정진 D-{lanternDaysRemaining}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-white/10 text-[#C2B8AB] text-[9.5px]">
                        7일 무료 사시예불 축원
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 하단 상태별 맞춤 안내 및 빠른 동작 버튼 */}
              <div className="mt-3">
                {isLanternLit ? (
                  <div className="bg-[#FAF3DF]/10 border border-[#F5D061]/35 rounded-xl p-3 text-xs text-[#FAF8F5] leading-relaxed break-keep">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-[#F5D061] mb-1">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>{lanternData?.believer_name} 불자님의 7일 정진 축원이 진행 중입니다</span>
                    </div>
                    <p className="text-[11px] text-[#D6CEC2]">
                      매일 오전 10시 사시예불에서 제주 소원사 스님께서 정성껏 축원해 드리고 있습니다. (D-{lanternDaysRemaining}일 남음)
                    </p>
                  </div>
                ) : isLanternExpired ? (
                  <button
                    type="button"
                    onClick={() => {
                      const formEl = document.getElementById('lantern-prayer-form')
                      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA8010] text-[#1B1815] font-bold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>지난 7일 기도가 회향되었습니다 · 새 발원으로 다시 밝히기</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const formEl = document.getElementById('lantern-prayer-form')
                      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 text-xs font-bold hover:bg-[#F5D061]/30 transition"
                  >
                    <span>아래에서 발원문 접수하고 7일 소원등 켜기</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

                        {/* [1번] 3단계 소원등 축원 프로세스 인포그래픽 카드 */}
            <div className="bg-[#FAF5E6] rounded-2xl p-4 sm:p-5 border border-[#E5D399] shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-4 rounded-full bg-[#B8860B]" />
                  <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#231F1C]">
                    소원등은 어떻게 진행되나요?
                  </h3>
                </div>
                <span className="text-[10.5px] font-bold text-[#8A6510] bg-white px-2 py-0.5 rounded-full border border-[#E5D399]">
                  3단계 축원 여정
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {/* 1단계 */}
                <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-[#EAE2D3] flex flex-col items-center text-center shadow-xs">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FAF3DF] text-[#8A6510] text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center mb-1 border border-[#E5D399]">
                    1
                  </span>
                  <span className="text-lg sm:text-xl mb-1">✍️</span>
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#231F1C] break-keep mb-0.5 text-center">
                    발원문 접수
                  </h4>
                  <p className="text-[10px] sm:text-[10.5px] text-[#6E655C] leading-snug break-keep">
                    기원분야 선택 후 정통 발원문 접수
                  </p>
                </div>

                {/* 2단계 */}
                <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-[#EAE2D3] flex flex-col items-center text-center shadow-xs">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FAF3DF] text-[#8A6510] text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center mb-1 border border-[#E5D399]">
                    2
                  </span>
                  <span className="text-lg sm:text-xl mb-1">🕯️</span>
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#231F1C] break-keep mb-0.5 text-center">
                    실시간 점등
                  </h4>
                  <p className="text-[10px] sm:text-[10.5px] text-[#6E655C] leading-snug break-keep">
                    대웅전 전산 연동 & 황금등불 유지
                  </p>
                </div>

                {/* 3단계 */}
                <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-[#EAE2D3] flex flex-col items-center text-center shadow-xs">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FAF3DF] text-[#8A6510] text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center mb-1 border border-[#E5D399]">
                    3
                  </span>
                  <span className="text-lg sm:text-xl mb-1">🙏</span>
                  <h4 className="text-[11px] sm:text-xs font-bold text-[#231F1C] break-keep mb-0.5 text-center">
                    스님 매일 축원
                  </h4>
                  <p className="text-[10px] sm:text-[10.5px] text-[#6E655C] leading-snug break-keep">
                    매일 오전 10시 사시예불 직접 축원
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#EAE2D3] flex flex-wrap items-center justify-between gap-1.5 text-[10.5px] sm:text-[11px] text-[#7A7065]">
                <span className="flex items-center gap-1 font-medium break-keep">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                  <span>온라인으로 누구나 무료로 정성을 올릴 수 있습니다</span>
                </span>
                <span className="text-[#8A6510] font-bold shrink-0">
                  대웅전 실시간 봉안
                </span>
              </div>
            </div>

            {/* 무료 소원 축원 신청 폼 (고유 id 부여로 원터치 스크롤 이동 연동) */}
            <form
              id="lantern-prayer-form"
              onSubmit={handlePrayerSubmit}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-4"
            >
              <div className="border-b border-[#EFE9DD] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[10.5px] font-bold text-[#9A7418]">
                    100% 무료 매일 사시예불 축원
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5 break-keep">
                    대웅전 소원등 발원문 접수
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-[10.5px] px-2 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] font-bold border border-[#E5D399] shrink-0">
                    내 계정 연동됨
                  </span>
                )}
              </div>

              {/* STEP 1. 기원 분야 선택 영역 */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF5E6] border border-[#E5D399]">
                <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C]">
                    <span className="px-2 py-0.5 rounded-md bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold shrink-0">
                      1단계
                    </span>
                    <span>기원 분야 선택 (터치)</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#9A7418] shrink-0">
                    1개 선택
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '가족건강',
                    '사업번창',
                    '학업/시험합격',
                    '마음평안/소원성취',
                    '자녀축복/취업성취',
                    '액운소멸/무병장수',
                  ].map((cat) => {
                    const isSelected = wishCategory === cat
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => handleSelectWishCategory(cat)}
                        className={`py-2.5 px-2.5 rounded-xl text-[11.5px] font-bold border text-left transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow-md ring-2 ring-[#C59B27]/40'
                            : 'bg-white/80 text-[#575049] border-[#DFD3B8] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 border ${
                            isSelected
                              ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061] font-extrabold'
                              : 'bg-[#FAF8F5] text-transparent border-[#C8BFA8]'
                          }`}
                        >
                          ✓
                        </span>
                        <span className="truncate whitespace-nowrap">{cat}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 구분선 */}
              <div className="border-t border-dashed border-[#DFD6C7]" />

              {/* STEP 2. 신청자 정보 및 발원문 입력 영역 */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F4F1EA] border border-[#DDD4C4] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C]">
                    <span className="px-2 py-0.5 rounded-md bg-[#8A6510] text-white text-[10px] font-extrabold shrink-0">
                      2단계
                    </span>
                    <span>신청자 성함 · 발원문 접수</span>
                  </div>
                  <span className="text-[10.5px] text-[#7A7065] font-medium shrink-0">
                    ✎ 직접 입력
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      성함 (또는 법명) <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="text"
                      value={wishName}
                      onChange={(e) => setWishName(e.target.value)}
                      placeholder="예: 홍길동 (무량심) 또는 김영희 (자녀: 김철수)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      휴대폰 번호 (아이디) <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={wishPhone}
                      onChange={(e) => setWishPhone(e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                    />
                  </div>
                </div>

                {/* 축원 대상란 (소원발원 대상) */}
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1.5">
                    <span>소원발원 대상 (축원 대상자)</span>
                    <span className="text-[10px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택
                    </span>
                  </label>
                  <input
                    type="text"
                    value={wishTarget}
                    onChange={(e) => setWishTarget(e.target.value)}
                    placeholder="예: 자녀 김철수, 부모님, 가족 전체"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm font-bold text-[#231F1C] shadow-inner"
                  />
                  <div className="flex items-center gap-1 text-[11px] text-[#7A7065] mt-1.5 px-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                    <span>
                      비워두시면 <strong>[신청자 본인]</strong>으로 축원됩니다
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1 flex items-center gap-1.5">
                    <span>부처님께 올리는 한 줄 소원 (발원문)</span>
                    <span className="text-[10px] font-semibold text-[#8A6510] bg-[#FAF3DF] px-1.5 py-0.5 rounded border border-[#E5D399]">
                      선택
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder={
                      PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
                      '예: 우리 가족 올 한 해 무병장수하고 하는 일마다 순조롭게 풀리기를 발원합니다.'
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm text-[#231F1C] shadow-inner leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#7A7065] mt-1.5 px-0.5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0" />
                      <span>
                        예시문을 자유롭게 수정하시거나 그대로 두셔도 <strong>[{wishCategory}]</strong> 정통 발원문으로 자동 축원됩니다.
                      </span>
                    </span>
                    {wishText && (
                      <button
                        type="button"
                        onClick={() => setWishText('')}
                        className="text-[#998877] hover:text-[#554433] underline text-[10.5px] ml-2 shrink-0"
                      >
                        지우기
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF3DF] border border-[#E5D399] text-[11px] text-[#6E5617] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#9A7418] shrink-0 mt-0.5" />
                <div className="break-keep">
                  <strong>제주 소원사 대웅전 매일 축원:</strong> 소원등을 밝히고 남겨주신 발원문은 매일 오전 10시 사시예불마다 부처님 전에 정성껏 축원 올립니다.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-bold text-xs sm:text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Flame className="w-4 h-4 fill-current shrink-0" />
                <span>
                  {isLanternLit
                    ? '대웅전에 7일 소원등 새로 켜고 축원 올리기'
                    : '대웅전 7일 소원등 켜고 사시예불 축원 올리기'}
                </span>
              </button>
            </form>

            {/* 접수된 전체 축원 리스트 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8]">
              <h3 className="font-serif-kr font-bold text-base mb-3">
                최근 접수된 대웅전 소원등 ({prayers.length}건)
              </h3>
              <div className="space-y-3">
                {prayers.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#231F1C] truncate">
                        🕯️ {p.believer_name} ({p.wish_category})
                      </span>
                      <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#EFE7D6] text-[#7D6320] font-medium whitespace-nowrap shrink-0">
                        {p.member_code === currentUser?.code ? '★ 내 소원등' : '대웅전 점등중'}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A433C] leading-relaxed break-keep">“{p.wish_text}”</p>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#8C7A5B] pt-1">
                      <span className="whitespace-nowrap">✓ {p.prayed_at}</span>
                      <span className="whitespace-nowrap shrink-0">{formatPrayerDate(p.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* [4번] 소원등 자주 묻는 질문 (FAQ) 아코디언 */}
            <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-3">
              <div className="border-b border-[#EFE9DD] pb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#C59B27] shrink-0" />
                  <h3 className="font-serif-kr text-base font-bold text-[#231F1C]">
                    소원등 자주 묻는 질문 (FAQ)
                  </h3>
                </div>
                <span className="text-[10.5px] text-[#8A6510] font-bold bg-[#FAF5E6] px-2 py-0.5 rounded-full border border-[#E5D399]">
                  궁금증 안내
                </span>
              </div>

              <div className="space-y-2">
                {/* Q1 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition" open>
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>소원등은 며칠 동안 켜지며 어떻게 유지되나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep">
                    발원문을 접수하시면 화면에서 즉시 황금빛 소원등이 밝혀지며, <strong>7일 동안 꺼지지 않고 유지</strong>됩니다. 
                    화면 상단에서 남은 정진 일수(D-Day)를 실시간으로 확인하실 수 있으며, 7일이 지나 회향된 후에는 새로운 발원으로 언제든 다시 점등하실 수 있습니다.
                  </div>
                </details>

                {/* Q2 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition">
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>스님께서 정말 매일 아침 사시예불에 축원해 주시나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep">
                    네, 그렇습니다. 접수해주신 성함과 발원문은 <strong>제주 소원사 대웅전 사시예불 축원 전산 명부</strong>에 정식으로 등재됩니다. 
                    주지 스님께서 <strong>매일 아침 10시 사시예불(巳時禮佛)</strong>마다 부처님 전에 불자님의 발원 내용을 올리며 7일간 지극한 정성으로 직접 축원 올립니다.
                  </div>
                </details>

                {/* Q3 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition">
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>소원등 켜기에 별도의 비용이 드나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep">
                    <strong>비용은 일체 들지 않습니다.</strong> 소원등 켜기는 거리에 상관없이 전국 어디서나 부처님께 정성을 올리고 마음의 평안을 얻으실 수 있도록 마련된 <strong>100% 무료 비대면 정진 공덕</strong>입니다. 
                    (평생 위패 봉안이나 영구축원명패 등 사찰 불사 동참을 원하시는 경우에만 '불사안내' 탭에서 별도 상담 신청하실 수 있습니다.)
                  </div>
                </details>

                {/* Q4 */}
                <details className="group rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] transition">
                  <summary className="p-3.5 flex items-center justify-between cursor-pointer list-none select-none">
                    <span className="text-xs sm:text-sm font-bold text-[#231F1C] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        Q
                      </span>
                      <span>가족이나 지인의 소원등도 대신 켜줄 수 있나요?</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#8C7A5B] transition-transform duration-200 group-open:rotate-180 shrink-0 ml-2" />
                  </summary>
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#575049] leading-relaxed border-t border-[#EFE9DD] break-keep space-y-1.5">
                    <p>
                      <strong>네, 물론 가능합니다.</strong> 아래 2가지 편한 방법 중 하나로 신청해 주시면 주지 스님께서 부처님 전에 정확히 축원 올립니다:
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border border-[#E5D399] space-y-1 text-[11.5px]">
                      <p>
                        <strong className="text-[#8A6510]">방법 1 (가장 추천):</strong> 성함란에 <strong className="text-[#231F1C]">김영희 (자녀: 김철수)</strong> 처럼 가족 성함을 괄호 안에 함께 적기 (연락처는 본인 휴대폰 번호 입력 가능)
                      </p>
                      <p>
                        <strong className="text-[#8A6510]">방법 2:</strong> 발원문 내용에 <strong className="text-[#231F1C]">“사랑하는 아들 김철수(28세) 시험 합격과 취업 성취 발원”</strong> 처럼 가족의 이름과 소원을 적기
                      </p>
                    </div>
                    <p className="text-[11px] text-[#7A7065]">
                      ※ 접수 즉시 대웅전 전산 명부에 등록되어 사시예불마다 스님께서 해당 가족의 이름을 부처님 전에 정성껏 올려드립니다.
                    </p>
                  </div>
                </details>
              </div>
            </section>
          </main>
        )}

        {/* ==================== 3. 사경 · 불교명언 · 경전공부 · 지혜퀴즈 탭 ==================== */}
        {activeTab === 'sutra' && (
          <main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 상단 나의 공덕장 & 싱잉볼/목탁 버튼 */}
            <div className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-4 sm:p-5 border border-[#C59B27]/40 shadow-md flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="block text-[11px] text-[#F5D061] font-semibold truncate">
                  {currentUser
                    ? `${currentUser.name}${currentUser.dharma_name ? `(${currentUser.dharma_name})` : ''}님의 신행 공덕장`
                    : '나의 온라인 신행 공덕장'}
                </span>
                <h2 className="font-serif-kr text-xl sm:text-2xl font-bold mt-0.5 break-keep">
                  누적 수행 공덕 <span className="text-[#F5D061]">{currentMeritCount}</span>회
                </h2>
                <p className="text-[11px] text-[#BFB6AA] mt-0.5 break-keep">
                  사경·명언·경전공부·지혜퀴즈로 매일 맑은 복덕을 쌓아보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSingingBowlSound()
                  showToast('🔔 맑은 법종(싱잉볼) 소리로 마음을 정화합니다.')
                }}
                className="w-15 h-15 px-3 py-2.5 rounded-2xl bg-[#C59B27]/20 border border-[#F5D061]/50 flex flex-col items-center justify-center gap-1 hover:bg-[#C59B27]/30 transition shrink-0"
              >
                <Volume2 className="w-5 h-5 text-[#F5D061]" />
                <span className="text-[10px] text-[#F5D061] font-semibold whitespace-nowrap">싱잉볼 타종</span>
              </button>
            </div>

            {/* 4대 코너 선택 미니 탭 (① 사경·목탁 / ② 불교명언 / ③ 경전공부 / ④ 지혜퀴즈) */}
            <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[#231F1C] border border-[#C59B27]/40 shadow-sm">
              {[
                { id: 'copy', label: '✍️ 한줄사경' },
                { id: 'wisdom', label: '🪷 불교명언' },
                { id: 'study', label: '📖 경전공부' },
                { id: 'quiz', label: '🎯 지혜퀴즈' },
              ].map((sub) => {
                const isSelected = sutraSubTab === sub.id
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSutraSubTab(sub.id)}
                    className={`py-2.5 px-1 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap text-center ${
                      isSelected
                        ? 'bg-[#F5D061] text-[#1B1815] shadow-md'
                        : 'text-[#D6CEC2] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {sub.label}
                  </button>
                )
              })}
            </div>

            {/* ==================== [코너 1] 터치식 황금 사경 & 목탁 수행 ==================== */}
            {sutraSubTab === 'copy' && (
              <>
                {/* 8대 경전 4개씩 2줄 바둑판 그리드 (한눈에 전체 8개 확인) */}
                <div className="grid grid-cols-4 gap-1.5 pb-0.5">
                  {SUTRA_LIST.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedSutraIdx(idx)
                        setSutraInput('')
                        setSutraCompleted(false)
                        if (autoVoiceEnabled || speakingId === 'sutra-copy') {
                          const nextItem = SUTRA_LIST[idx]
                          startSpeech(
                            'sutra-copy',
                            `${nextItem.title}. ${nextItem.text}. 뜻풀이, ${nextItem.meaning}`
                          )
                        }
                      }}
                      className={`py-2 px-1 rounded-xl text-[11.5px] font-bold text-center border transition shadow-sm whitespace-nowrap overflow-hidden text-ellipsis ${
                        selectedSutraIdx === idx
                          ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow-sm font-extrabold'
                          : 'bg-white text-[#5C5349] border-[#E4DDD0] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {item.shortName || item.title}
                    </button>
                  ))}
                </div>

                {/* 터치식 + 타자식 겸용 황금 사경장 */}
                <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-4">
                  <div className="relative text-center border-b border-[#EFE9DD] pb-3 space-y-1.5">
                    {/* 오른쪽 상단 미니 음성 활성/비활성 토글 버튼 */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleSpeech(
                          'sutra-copy',
                          `${currentSutra.title}. ${currentSutra.text}. 뜻풀이, ${currentSutra.meaning}`
                        )
                      }
                      className={`absolute -top-1 right-0 px-2.5 py-1 rounded-full text-xs font-extrabold border inline-flex items-center gap-1 transition active:scale-95 ${
                        speakingId === 'sutra-copy'
                          ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow ring-1 ring-[#F5D061]/50'
                          : 'bg-[#FAF5E6] text-[#8A6510] border-[#E5D399] hover:bg-[#F2E8CD]'
                      }`}
                      aria-label={speakingId === 'sutra-copy' ? '음성 낭독 멈추기' : '경전 음성 듣기'}
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          speakingId === 'sutra-copy'
                            ? 'animate-pulse text-[#F5D061]'
                            : 'text-[#8A6510]'
                        }`}
                      />
                      <span className="text-[11px] font-bold">
                        {speakingId === 'sutra-copy' ? '음성 ON' : '음성'}
                      </span>
                    </button>

                    <span className="block text-xs text-[#9A7418] font-bold tracking-widest">
                      {currentSutra.hanja}
                    </span>
                    <h3 className="font-serif-kr text-lg font-bold text-[#231F1C]">
                      {currentSutra.title}
                    </h3>
                    <p className="text-xs text-[#6E655C] break-keep px-2">{currentSutra.meaning}</p>
                  </div>

                  {/* 터치 사경 판: 글자 박스를 손가락으로 톡톡 터치해도 목탁 소리와 함께 황금빛으로 채워짐 */}
                  <div
                    onClick={handleTouchStepSutra}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#26211B] to-[#1A1612] border-2 border-[#C59B27]/60 text-center cursor-pointer select-none shadow-inner active:scale-[0.99] transition"
                  >
                    <div className="flex items-center justify-between text-[10.5px] text-[#F5D061] font-semibold mb-2.5 px-1">
                      <span>👆 글자판을 터치하면 목탁 소리와 함께 사경됩니다</span>
                      <span className="shrink-0">
                        {Math.min(100, Math.round((sutraInput.length / currentSutra.text.length) * 100))}%
                      </span>
                    </div>
                    <div className="font-serif-kr text-lg font-bold tracking-wide leading-relaxed flex flex-wrap justify-center gap-0.5 py-1">
                      {currentSutra.text.split('').map((char, i) => {
                        const typedChar = sutraInput[i]
                        const isMatched = typedChar === char
                        const isWrong = typedChar !== undefined && typedChar !== char
                        return (
                          <span
                            key={i}
                            className={`px-1 py-0.5 rounded transition-all duration-200 ${
                              isMatched
                                ? 'text-[#1B1815] bg-[#F5D061] font-extrabold shadow-[0_0_10px_rgba(245,208,97,0.6)] scale-105'
                                : isWrong
                                ? 'text-red-300 bg-red-900/60'
                                : 'text-[#8E8377]'
                            }`}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* 직접 타자 입력창 */}
                  <div>
                    <input
                      type="text"
                      value={sutraInput}
                      onChange={(e) => handleSutraChange(e.target.value)}
                      placeholder="직접 입력하거나 위 글자판을 터치해 보세요"
                      className="w-full px-3.5 py-3 rounded-xl bg-[#FAF8F5] border-2 border-[#D5C59B] font-serif-kr text-sm text-center focus:outline-none focus:border-[#9A7418]"
                    />
                  </div>

                  {/* 터치 사경 / 원클릭 완독 / 다시 쓰기 버튼 (모바일 글자 넘침 방지 칼정렬) */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={handleTouchStepSutra}
                      className="py-2.5 px-1.5 sm:px-3 rounded-xl bg-[#231F1C] text-[#F5D061] border border-[#C59B27] text-[11.5px] sm:text-xs font-extrabold hover:bg-[#302A24] transition flex items-center justify-center gap-1 text-center truncate active:scale-95"
                    >
                      <span>🪷</span>
                      <span className="truncate">한마디씩 사경</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSutraChange(currentSutra.text)}
                      className="py-2.5 px-1.5 sm:px-3 rounded-xl bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399] text-[11.5px] sm:text-xs font-extrabold hover:bg-[#F3E7C6] transition flex items-center justify-center gap-1 text-center truncate active:scale-95"
                    >
                      <span>✨</span>
                      <span className="truncate">한 번에 완독</span>
                    </button>
                  </div>

                  {sutraCompleted && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#231F1C] to-[#2E2822] text-white flex flex-col gap-2.5 border border-[#F5D061] shadow-lg animate-fadeIn">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles className="w-5 h-5 text-[#F5D061] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#F5D061]">
                            사경 1독 회향 완료! (+1 공덕 적립)
                          </div>
                          <div className="text-[11px] text-[#D6CEC2] break-keep">
                            이 공덕이 불자님과 온 가족의 평안으로 원만히 회향되기를 발원합니다.
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowMeritCertModal(true)}
                          className="flex-1 py-2 px-2.5 rounded-lg bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] text-xs font-black flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
                        >
                          <Award className="w-4 h-4 text-[#1B1815] shrink-0" />
                          <span>📜 사경 회향 공덕장 보기</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextIdx = (selectedSutraIdx + 1) % SUTRA_LIST.length
                            setSelectedSutraIdx(nextIdx)
                            setSutraInput('')
                            setSutraCompleted(false)
                            if (autoVoiceEnabled || speakingId === 'sutra-copy') {
                              const nextItem = SUTRA_LIST[nextIdx]
                              startSpeech(
                                'sutra-copy',
                                `${nextItem.title}. ${nextItem.text}. 뜻풀이, ${nextItem.meaning}`
                              )
                            }
                          }}
                          className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-[#F5D061] text-xs font-bold whitespace-nowrap border border-[#F5D061]/30 transition active:scale-95 shrink-0"
                        >
                          다음 구절 ▶
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* 온라인 목탁 · 9배 염주 정진 코너 */}
                <section className="rounded-2xl bg-gradient-to-br from-[#29231E] to-[#1A1612] text-white p-3.5 sm:p-4 border border-[#C59B27]/50 shadow-md flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded-full bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/30 font-bold mb-1 whitespace-nowrap">
                      <span>📿 온라인 목탁 정진</span>
                      <span className="text-[#FFE898] font-normal">(9타당 +1공덕)</span>
                    </span>
                    <h4 className="font-serif-kr text-[14.5px] sm:text-base font-bold text-white truncate">
                      “관세음보살” 부르며 목탁 치기
                    </h4>
                    <p className="text-[11px] text-[#D6CEC2] mt-0.5 truncate">
                      오늘 친 목탁: <strong className="text-[#F5D061]">{moktakCount}타</strong> (다음 공덕까지{' '}
                      <strong className="text-[#F5D061]">{9 - (moktakCount % 9)}타</strong>)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMoktakTap}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#F5D061] to-[#B88619] text-[#1B1815] font-extrabold shadow-[0_0_15px_rgba(245,208,97,0.3)] border-2 border-[#FFF3B8] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition shrink-0"
                    title="터치하여 청아한 목탁 소리와 함께 마음을 가다듬으세요"
                  >
                    <img
                      src="/images/moktak_icon.png"
                      alt="목탁"
                      className="w-7 h-7 object-contain drop-shadow-sm active:rotate-12 transition-transform"
                    />
                    <span className="text-[10px] font-black whitespace-nowrap leading-none mt-0.5">목탁 탁!</span>
                  </button>
                </section>
              </>
            )}

            {/* ==================== [코너 2] 불교명언 & 오늘 나의 연꽃 말씀 뽑기 ==================== */}
            {sutraSubTab === 'wisdom' && (
              <>
                {/* A. 오늘 나의 연꽃 제비뽑기 (화두 카드 뽑기) */}
                <section className="rounded-2xl bg-gradient-to-br from-[#26201A] to-[#171310] text-white p-4 sm:p-5 border-2 border-[#C59B27]/60 shadow-md space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10.5px] text-[#F5D061] font-bold">
                        🪷 매일 한 번 마음으로 뽑는 부처님 화두
                      </span>
                      <h3 className="font-serif-kr text-base sm:text-lg font-bold mt-0.5">
                        오늘 나에게 주시는 연꽃 말씀 뽑기
                      </h3>
                    </div>
                    {selectedLotusIdx !== null && (
                      <button
                        type="button"
                        onClick={() => setSelectedLotusIdx(null)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 text-[#F5D061] text-[11px] font-bold whitespace-nowrap shrink-0"
                      >
                        다시 뽑기 ↻
                      </button>
                    )}
                  </div>

                  {selectedLotusIdx === null ? (
                    <>
                      <p className="text-xs text-[#D6CEC2] break-keep">
                        마음속으로 소원을 떠올리신 뒤, 아래 6송이 황금 연꽃 중 가장 마음이 가는 연꽃 하나를 터치해 보세요.
                      </p>
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        {LOTUS_FORTUNES.map((lotus, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              playSingingBowlSound()
                              setSelectedLotusIdx(idx)
                              addMerit(1)
                              showToast('🪷 오늘의 연꽃 법문이 열렸습니다! (+1 공덕)')
                            }}
                            className="p-3 rounded-2xl bg-gradient-to-b from-[#332B22] to-[#1E1914] border border-[#F5D061]/50 hover:border-[#F5D061] flex flex-col items-center justify-center gap-1.5 shadow active:scale-95 transition"
                          >
                            <span className="text-2xl">🪷</span>
                            <span className="text-[11px] font-bold text-[#F5D061] whitespace-nowrap">
                              제{idx + 1}연꽃
                            </span>
                            <span className="text-[10px] text-[#BFB6AA] whitespace-nowrap">
                              터치하여 열기
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FFFDF8] text-[#231F1C] border-2 border-[#F5D061] space-y-2.5 shadow-lg">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3DF] text-[#9A7418] border border-[#E5D399] text-[10.5px] font-extrabold">
                          {LOTUS_FORTUNES[selectedLotusIdx].badge}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            toggleSpeech(
                              'lotus-fortune',
                              `${LOTUS_FORTUNES[selectedLotusIdx].badge}. ${LOTUS_FORTUNES[selectedLotusIdx].quote}. 스님의 풀이, ${LOTUS_FORTUNES[selectedLotusIdx].advice}`
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border inline-flex items-center gap-1 whitespace-nowrap ${
                            speakingId === 'lotus-fortune'
                              ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                              : 'bg-[#FAF5E6] text-[#8A6510] border-[#E5D399]'
                          }`}
                        >
                          <Volume2 className="w-3 h-3 shrink-0" />
                          <span>{speakingId === 'lotus-fortune' ? '낭독 중지' : '음성 듣기'}</span>
                        </button>
                      </div>
                      <p className="font-serif-kr text-base font-bold text-[#1B1815] leading-snug break-keep pt-1">
                        {LOTUS_FORTUNES[selectedLotusIdx].quote}
                      </p>
                      <div className="p-3 rounded-xl bg-[#FAF6EC] border border-[#EAE0C8] text-xs text-[#4A433C] leading-relaxed break-keep">
                        🙏 <strong>스님의 풀이:</strong> {LOTUS_FORTUNES[selectedLotusIdx].advice}
                      </div>
                    </div>
                  )}
                </section>

                {/* B. 지금 내 마음 상태별 불교 명언 처방전 */}
                <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-3.5">
                  <div>
                    <span className="text-[10.5px] font-bold text-[#9A7418]">
                      MIND PRESCRIPTION · 마음 처방전
                    </span>
                    <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5">
                      지금 불자님의 마음은 어떠신가요?
                    </h3>
                  </div>

                  {/* 4가지 마음 상태 버튼 (2x2 그리드) */}
                  <div className="grid grid-cols-2 gap-2">
                    {WISDOM_BY_MOOD.map((m) => {
                      const isSel = selectedMoodId === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            playMoktakSound()
                            setSelectedMoodId(m.id)
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border text-left transition whitespace-nowrap ${
                            isSel
                              ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow'
                              : 'bg-[#FAF8F5] text-[#575049] border-[#E4DDD0]'
                          }`}
                        >
                          {m.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* 선택된 마음 상태의 명언 3선 */}
                  {(() => {
                    const activeMood =
                      WISDOM_BY_MOOD.find((m) => m.id === selectedMoodId) || WISDOM_BY_MOOD[0]
                    return (
                      <div className="space-y-3 pt-1">
                        {activeMood.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DEC8] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#FAF3DF] text-[#9A7418] border border-[#E5D399]">
                                처방 법문 {idx + 1} · {item.author}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleSpeech(
                                    `mood-${idx}`,
                                    `${item.author}의 말씀입니다. ${item.quote}. ${item.comment}`
                                  )
                                }
                                className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                                  speakingId === `mood-${idx}`
                                    ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                                    : 'bg-white text-[#8A6510] border-[#E5D399]'
                                }`}
                              >
                                <Volume2 className="w-3 h-3 shrink-0" />
                                <span>{speakingId === `mood-${idx}` ? '낭독 중지' : '음성 듣기'}</span>
                              </button>
                            </div>
                            <p className="font-serif-kr text-sm font-bold text-[#231F1C] leading-relaxed break-keep">
                              “{item.quote}”
                            </p>
                            <p className="text-xs text-[#575049] bg-white p-2.5 rounded-lg border border-[#EFE9DD] leading-relaxed break-keep">
                              💡 {item.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </section>
              </>
            )}

            {/* ==================== [코너 3] 어르신 눈높이 쉬운 3분 경전공부 ==================== */}
            {sutraSubTab === 'study' && (
              <>
                {/* 오늘의 추천 5강 자동 교체 안내 및 다른 5강/전체 15강 전환 바 */}
                <div className="bg-[#231F1C] text-white rounded-2xl p-3.5 border border-[#C59B27]/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#F5D061] text-[#1B1815] text-[10px] font-extrabold whitespace-nowrap">
                        {showAllLessons
                          ? `전체 ${SUTRA_STUDY_LESSONS.length}강 목록`
                          : `오늘의 추천 5강 (${lessonBatchIdx + 1}/${totalLessonBatches}편)`}
                      </span>
                      <span className="text-[11px] text-[#E5D399] font-semibold whitespace-nowrap">
                        독송완료 {completedLessons.length}/{SUTRA_STUDY_LESSONS.length}강
                      </span>
                    </div>
                    <p className="text-[11px] text-[#D6CEC2] mt-1 break-keep">
                      매일 새로운 추천 5강이 자동으로 바뀌며, 언제든 다른 강의를 펼쳐 보실 수 있습니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!showAllLessons && (
                      <button
                        type="button"
                        onClick={() => {
                          playMoktakSound()
                          const nextBatch = (lessonBatchIdx + 1) % totalLessonBatches
                          setLessonBatchIdx(nextBatch)
                          setSelectedLessonIdx(nextBatch * 5)
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#342E29] text-[#F5D061] border border-[#C59B27]/50 text-[11px] font-bold hover:bg-[#423A33] transition whitespace-nowrap"
                      >
                        🔄 다른 5강 추천
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        playMoktakSound()
                        setShowAllLessons((prev) => !prev)
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F5D061] text-[#1B1815] text-[11px] font-extrabold hover:brightness-105 transition whitespace-nowrap"
                    >
                      {showAllLessons ? '오늘의 5강만 보기 ▲' : `전체 ${SUTRA_STUDY_LESSONS.length}강 펼치기 ▼`}
                    </button>
                  </div>
                </div>

                {/* 추천 5강 (또는 전체 15강) 선택 버튼 리스트 */}
                <div className="grid grid-cols-1 gap-2">
                  {(showAllLessons
                    ? SUTRA_STUDY_LESSONS.map((lesson, idx) => ({ lesson, idx }))
                    : SUTRA_STUDY_LESSONS.slice(
                        lessonBatchIdx * 5,
                        lessonBatchIdx * 5 + 5
                      ).map((lesson, i) => ({ lesson, idx: lessonBatchIdx * 5 + i }))
                  ).map(({ lesson, idx }) => {
                    const isSelected = selectedLessonIdx === idx
                    const isDone = completedLessons.includes(lesson.id)
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          setSelectedLessonIdx(idx)
                          if (autoVoiceEnabled || (speakingId && speakingId.startsWith('lesson-'))) {
                            startSpeech(
                              `lesson-${lesson.id}`,
                              `${lesson.title}. 핵심 구절, ${lesson.keyPhrase}. ${lesson.content.join(' ')}`
                            )
                          } else {
                            playMoktakSound()
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#231F1C] text-white border-[#C59B27] shadow-md'
                            : 'bg-white text-[#231F1C] border-[#E6DEC8]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-[#F5D061] text-[#1B1815]'
                                  : 'bg-[#FAF3DF] text-[#9A7418]'
                              }`}
                            >
                              {lesson.category}
                            </span>
                            {isDone && (
                              <span className="text-[10px] text-emerald-400 font-bold">
                                ✓ 독송완료
                              </span>
                            )}
                          </div>
                          <div
                            className={`font-serif-kr text-xs font-bold mt-1 break-keep ${
                              isSelected ? 'text-[#F5D061]' : 'text-[#231F1C]'
                            }`}
                          >
                            {lesson.title}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-[#F5D061]' : 'text-[#9A7418]'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* 선택된 경전 공부 상세 본문 카드 */}
                {(() => {
                  const lesson = SUTRA_STUDY_LESSONS[selectedLessonIdx] || SUTRA_STUDY_LESSONS[0]
                  const isDone = completedLessons.includes(lesson.id)
                  return (
                    <section className="bg-white rounded-2xl p-5 shadow-sm border-2 border-[#C59B27]/50 space-y-4">
                      <div className="border-b border-[#EFE9DD] pb-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-[#9A7418]">
                            {lesson.category}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleSpeech(
                                `lesson-${lesson.id}`,
                                `${lesson.title}. 핵심 구절, ${lesson.keyPhrase}. ${lesson.content.join(' ')}`
                              )
                            }
                            className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold border inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition ${
                              speakingId === `lesson-${lesson.id}`
                                ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow'
                                : 'bg-[#FAF5E6] text-[#8A6510] border-[#E5D399]'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {speakingId === `lesson-${lesson.id}`
                                ? '⏹ 강의 낭독 멈추기'
                                : '🔊 강의 전체 음성으로 듣기'}
                            </span>
                          </button>
                        </div>
                        <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-[#6E655C] break-keep">{lesson.summary}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                        <span className="block text-[10px] text-[#9A7418] font-bold mb-0.5">
                          핵심 구절 · 명호
                        </span>
                        <strong className="font-serif-kr text-sm text-[#231F1C] break-keep">
                          “{lesson.keyPhrase}”
                        </strong>
                      </div>

                      <div className="space-y-3 text-xs text-[#3D3630] leading-relaxed break-keep">
                        {lesson.content.map((para, i) => (
                          <p
                            key={i}
                            className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD]"
                          >
                            {para}
                          </p>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playSingingBowlSound()
                          if (!isDone) {
                            setCompletedLessons((prev) => [...prev, lesson.id])
                            addMerit(1)
                            showToast('📖 경전 공부 1강을 완독하여 지혜 공덕이 +1회 적립되었습니다!')
                          } else {
                            showToast('🙏 이미 공덕을 적립한 강의입니다. 다음 강의로 이동합니다!')
                          }
                          const nextIdx = (selectedLessonIdx + 1) % SUTRA_STUDY_LESSONS.length
                          setSelectedLessonIdx(nextIdx)
                          setLessonBatchIdx(Math.floor(nextIdx / 5))
                          if (autoVoiceEnabled || (speakingId && speakingId.startsWith('lesson-'))) {
                            const nextLesson = SUTRA_STUDY_LESSONS[nextIdx]
                            startSpeech(
                              `lesson-${nextLesson.id}`,
                              `${nextLesson.title}. 핵심 구절, ${nextLesson.keyPhrase}. ${nextLesson.content.join(' ')}`
                            )
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-[#231F1C] text-[#F5D061] font-extrabold text-xs border border-[#C59B27] hover:bg-[#302A24] transition"
                      >
                        {isDone
                          ? '✓ 공부 완료됨 · 다음 강의로 이동 ▶'
                          : '📖 오늘 경전 공부 완료 (+1 공덕 적립 후 다음 강의 ▶)'}
                      </button>
                    </section>
                  )
                })()}
              </>
            )}

            {/* ==================== [코너 4] 재미로 푸는 불교 지혜 퀴즈 ==================== */}
            {sutraSubTab === 'quiz' && (
              <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-4">
                {(() => {
                  const currentQuiz = BUDDHIST_QUIZZES[quizIndex]
                  const isCorrect = quizSelectedOption === currentQuiz.answerIdx
                  return (
                    <>
                      <div className="flex items-center justify-between gap-2 border-b border-[#EFE9DD] pb-3">
                        <div>
                          <span className="text-[10.5px] font-bold text-[#9A7418]">
                            재미로 배우는 불교 상식 · 정답 시 +1 공덕
                          </span>
                          <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5">
                            불교 지혜 퀴즈 ({quizIndex + 1} / {BUDDHIST_QUIZZES.length})
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF3DF] text-[#9A7418] border border-[#E5D399] text-[11px] font-extrabold shrink-0">
                          맞힌 문제 {solvedQuizIds.length}개
                        </span>
                      </div>

                      {/* 문제 번호 바로가기 버튼 */}
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {BUDDHIST_QUIZZES.map((q, idx) => {
                          const solved = solvedQuizIds.includes(q.id)
                          const active = quizIndex === idx
                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => {
                                setQuizIndex(idx)
                                setQuizSelectedOption(null)
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition whitespace-nowrap ${
                                active
                                  ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                                  : solved
                                  ? 'bg-[#FAF3DF] text-[#8A6510] border-[#E5D399]'
                                  : 'bg-[#FAF8F5] text-[#786E63] border-[#E4DDD0]'
                              }`}
                            >
                              {idx + 1}번 {solved ? '✓' : ''}
                            </button>
                          )
                        })}
                      </div>

                      {/* 질문 박스 */}
                      <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-[#E6D9B8]">
                        <p className="font-serif-kr text-sm font-bold text-[#231F1C] leading-relaxed break-keep">
                          {currentQuiz.question}
                        </p>
                      </div>

                      {/* 객관식 보기 3개 */}
                      <div className="space-y-2">
                        {currentQuiz.options.map((opt, idx) => {
                          const isChosen = quizSelectedOption === idx
                          const isAnswer = idx === currentQuiz.answerIdx
                          let btnStyle =
                            'bg-[#FAF8F5] text-[#231F1C] border-[#DFD3B8] hover:border-[#C59B27]'
                          if (quizSelectedOption !== null) {
                            if (isAnswer) {
                              btnStyle =
                                'bg-[#231F1C] text-[#F5D061] border-[#C59B27] ring-2 ring-[#C59B27]/40'
                            } else if (isChosen) {
                              btnStyle = 'bg-red-50 text-red-700 border-red-300'
                            }
                          }
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setQuizSelectedOption(idx)
                                if (idx === currentQuiz.answerIdx) {
                                  playSingingBowlSound()
                                  if (!solvedQuizIds.includes(currentQuiz.id)) {
                                    setSolvedQuizIds((prev) => [...prev, currentQuiz.id])
                                    addMerit(1)
                                    showToast('⭕ 정답입니다! 지혜 공덕이 +1회 적립되었습니다.')
                                  }
                                } else {
                                  playMoktakSound()
                                }
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs font-extrabold transition flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span className="break-keep">{opt}</span>
                              {quizSelectedOption !== null && isAnswer && (
                                <span className="text-[10.5px] px-2 py-0.5 rounded bg-[#F5D061] text-[#1B1815] font-black shrink-0">
                                  정답 ⭕
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* 정답 확인 및 해설 박스 */}
                      {quizSelectedOption !== null && (
                        <div
                          className={`p-4 rounded-xl border space-y-2 ${
                            isCorrect
                              ? 'bg-[#FAF5E6] border-[#C59B27]'
                              : 'bg-[#FFF5F5] border-red-200'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-[#231F1C]">
                            {isCorrect
                              ? '🎉 정답입니다! 훌륭한 불교 지혜를 갖추셨습니다.'
                              : '💡 아쉽지만 오답입니다! 아래 해설을 읽어보세요.'}
                          </div>
                          <p className="text-xs text-[#4A433C] leading-relaxed break-keep">
                            {currentQuiz.explanation}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setQuizIndex((prev) => (prev + 1) % BUDDHIST_QUIZZES.length)
                              setQuizSelectedOption(null)
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#231F1C] text-[#F5D061] text-xs font-extrabold mt-1"
                          >
                            다음 퀴즈 풀기 ▶
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </section>
            )}
          </main>
        )}

        {/* ==================== 4. 내정보 (로그인 · 회원가입 · 축원정보 관리) 탭 ==================== */}
        {activeTab === 'profile' && (
          <main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 대표님(마스터) 계정일 때만 노출되는 역할별 원클릭 계정 전환 스위치 바 */}
            {isMaster && (
              <section className="rounded-2xl bg-[#26211C] text-white p-3.5 border border-[#C59B27]/40 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTestAccountSwitch(!showTestAccountSwitch)}
                    className="flex items-center gap-1.5 text-left group"
                  >
                    <span className="text-[11px] text-[#F5D061] font-bold whitespace-nowrap">
                      ⚡ 마스터 전용 계정 빠른 전환
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-[#D6CEC2] group-hover:text-white transition">
                      {showTestAccountSwitch ? '접기 ▲' : '펼치기 ▼'}
                    </span>
                  </button>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-[11px] text-[#D6CEC2] hover:text-white flex items-center gap-1 underline whitespace-nowrap shrink-0"
                    >
                      <LogOut className="w-3 h-3 shrink-0" />
                      <span>로그아웃(가입화면)</span>
                    </button>
                  )}
                </div>

                {showTestAccountSwitch && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-white/10 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUserCode('33065540')
                        showToast('👑 [김철수 포교위원장] 계정으로 전환되었습니다. (총괄 마스터 50% 총판)')
                      }}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap ${
                        currentUser?.code === '33065540'
                          ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                          : 'bg-white/5 text-[#E8DFD1] border-white/10'
                      }`}
                    >
                      포교위원장(김철수)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUserCode('53872248')
                        showToast('🪷 포교위원장 [유광수] 계정으로 전환되었습니다. (40% 요율)')
                      }}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap ${
                        currentUser?.code === '53872248'
                          ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                          : 'bg-white/5 text-[#E8DFD1] border-white/10'
                      }`}
                    >
                      포교위원장(유광수)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUserCode('91010002')
                        showToast('🌿 포교위원 [이진우(진각심)] 계정으로 전환되었습니다. (30% 요율)')
                      }}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap ${
                        currentUser?.code === '91010002'
                          ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                          : 'bg-white/5 text-[#E8DFD1] border-white/10'
                      }`}
                    >
                      포교위원(이진우)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentUserCode('82341088')
                        showToast('🙏 일반신도 [이정숙(무량화)] 계정으로 전환되었습니다.')
                      }}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap ${
                        currentUser?.code === '82341088'
                          ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                          : 'bg-white/5 text-[#E8DFD1] border-white/10'
                      }`}
                    >
                      신도(이정숙)
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* [A] 로그아웃 상태일 때: 로그인 / 신규 회원가입 폼 */}
            {!currentUser ? (
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF8F5] border border-[#E4DDD0]">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition ${
                      authMode === 'login'
                        ? 'bg-[#231F1C] text-[#F5D061] shadow'
                        : 'text-[#6E655C]'
                    }`}
                  >
                    기존 회원 로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition ${
                      authMode === 'signup'
                        ? 'bg-[#231F1C] text-[#F5D061] shadow'
                        : 'text-[#6E655C]'
                    }`}
                  >
                    신규 회원가입 (10초)
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#3D3630] mb-1">
                        전화번호 (아이디)
                      </label>
                      <input
                        type="tel"
                        value={loginIdInput}
                        onChange={(e) => setLoginIdInput(e.target.value)}
                        placeholder="010-0000-0000 또는 뒤 8자리"
                        className="w-full px-3.5 py-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3D3630] mb-1">
                        비밀번호 (초기 기본값: 0000 또는 휴대전화 뒷 4자리)
                      </label>
                      <input
                        type="password"
                        value={loginPwInput}
                        onChange={(e) => setLoginPwInput(e.target.value)}
                        placeholder="비밀번호 4자리"
                        className="w-full px-3.5 py-3 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#231F1C] text-[#F5D061] font-bold text-sm border border-[#C59B27]"
                    >
                      내 법당 계정으로 로그인
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-3.5">
                    <div className="p-3 rounded-xl bg-[#FAF3DF] border border-[#E5D399] text-[11px] text-[#6E5617]">
                      <strong>필수 기본정보(성함·전화번호·비밀번호)</strong>만 입력하시면 즉시 가입되며, 법명·생년월일·주소는 지금 또는 나중에 언제든 추가하실 수 있습니다.
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          성함 (필수 *)
                        </label>
                        <input
                          type="text"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="예: 홍길동"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#C59B27] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          법명 (선택)
                        </label>
                        <input
                          type="text"
                          value={signupDharmaName}
                          onChange={(e) => setSignupDharmaName(e.target.value)}
                          placeholder="예: 무량화"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          휴대폰 번호 (아이디 *)
                        </label>
                        <input
                          type="tel"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#C59B27] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#3D3630] mb-1">
                          비밀번호 (필수 *)
                        </label>
                        <input
                          type="password"
                          value={signupPw}
                          onChange={(e) => setSignupPw(e.target.value)}
                          placeholder="숫자 4자리 (예: 1080)"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#C59B27] text-sm"
                        />
                      </div>
                    </div>

                    {/* 선택 추가 정보 (사찰 축원용) */}
                    <div className="pt-2 border-t border-[#EFE9DD] space-y-3">
                      <span className="block text-[11px] font-bold text-[#9A7418]">
                        [선택] 대웅전 축원 및 위패 봉안용 추가 정보
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-[#575049] mb-1">
                            생년월일
                          </label>
                          <input
                            type="text"
                            value={signupBirthDate}
                            onChange={(e) => setSignupBirthDate(e.target.value)}
                            placeholder="예: 1962-05-14"
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#575049] mb-1">
                            음력 / 양력
                          </label>
                          <select
                            value={signupLunarSolar}
                            onChange={(e) => setSignupLunarSolar(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                          >
                            <option value="음력">음력</option>
                            <option value="양력">양력</option>
                            <option value="음력(윤달)">음력(윤달)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#575049] mb-1">
                          거주지 주소 (대웅전 축원문 낭독용)
                        </label>
                        <input
                          type="text"
                          value={signupAddress}
                          onChange={(e) => setSignupAddress(e.target.value)}
                          placeholder="예: 제주시 애월읍..."
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#575049] mb-1">
                          가족 축원 명단 / 조상 영가 메모
                        </label>
                        <input
                          type="text"
                          value={signupFamilyMemo}
                          onChange={(e) => setSignupFamilyMemo(e.target.value)}
                          placeholder="예: 배우자, 자녀 이름 및 생년월일"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-bold text-sm shadow-md"
                    >
                      제주 소원사 신도 회원가입 완료
                    </button>
                  </form>
                )}
              </section>
            ) : (
              /* [B] 로그인 상태일 때: 내 계정 정보 확인 & 확장 정보 수정 */
              <>
                <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/40 shadow-md space-y-3">
                  {/* 상단 1행: 직책 배지(좌) + '전산' 소형 버튼 + 로그아웃 버튼(우측 상단 배치) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/40 font-bold whitespace-nowrap shrink-0">
                        {currentUser.role === 'master' || currentUser.role === 'agent' || currentUser.role === 'committee_head'
                          ? '포교위원장'
                          : currentUser.role === 'committee_member'
                          ? '포교위원'
                          : currentUser.role === 'temple_admin'
                          ? '창건주 · 신도회장'
                          : '소원사 신도'}
                      </span>

                      {/* 직책 배지 바로 옆에 아담하고 고급스럽게 배치된 '전산' 모달 버튼 */}
                      {(isMaster || currentUser.role === 'temple_admin' || currentUser.role === 'agent' || currentUser.role === 'committee_head' || currentUser.role === 'committee_member') && (
                        <button
                          type="button"
                          onClick={() => {
                            if (isMaster) setAdminModalTab('master')
                            else if (isTempleAdmin) setAdminModalTab('temple')
                            else if (currentUser?.role === 'agent' || currentUser?.role === 'committee_head') setAdminModalTab('head')
                            else setAdminModalTab('common')
                            setShowUnifiedAdminModal(true)
                          }}
                          className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-[11px] flex items-center gap-1 shadow hover:brightness-105 active:scale-95 transition whitespace-nowrap shrink-0 border border-[#F5D061]"
                          title="소원사 통합 전산 모달 열기"
                        >
                          <span>🏛️ 전산</span>
                          <ChevronRight className="w-3 h-3 -ml-0.5" />
                        </button>
                      )}
                    </div>

                    {/* 오른쪽 상단으로 올린 로그아웃 버튼 */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8DFD1] hover:text-white border border-white/15 text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>로그아웃</span>
                    </button>
                  </div>

                  {/* 2행: 성함 및 직함/법명 (양영문 회장님은 창건주 회장님으로 최고 예우 표시) */}
                  <div>
                    <h2 className="font-serif-kr text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap">
                      {currentUser.name}{' '}
                      {currentUser.role === 'temple_admin'
                        ? '(창건주) 회장님'
                        : `${currentUser.dharma_name ? `(${currentUser.dharma_name})` : ''}님`}
                    </h2>
                  </div>

                  {(isMaster || currentUser.role === 'temple_admin' || currentUser.role === 'agent' || currentUser.role === 'committee_head' || currentUser.role === 'committee_member') && (
                    <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-xs text-[#F5D061] font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                        <span>오늘 사시예불 축원 대상: <strong>{activeSasiPrayers.length}위</strong> (7일 정진)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSasiPrintModal(true)}
                        className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] border border-white/20 font-bold text-[11px] flex items-center gap-1 shadow transition shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5 shrink-0" />
                        <span>축원 명부 인쇄</span>
                      </button>
                    </div>
                  )}
                </section>

                {/* 가족·도반과 함께하는 복(福) 전하는 인연 나눔 주소 카드 */}
                <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3">
                  <div>
                    <span className="block text-[11px] font-bold text-[#9A7418]">
                      卍 부처님과의 소중한 불연(佛緣)
                    </span>
                    <h3 className="font-serif-kr text-base font-bold text-[#231F1C] mt-0.5 whitespace-nowrap">
                      가족 · 도반에게 복(福)을 전하는 주소
                    </h3>
                  </div>
                  <p className="text-xs text-[#575049] leading-relaxed break-keep">
                    가족, 친지, 도반에게 따뜻한 소원등과 축원의 공덕을 선물해 보세요. 이 주소로 모바일 법당을 찾아오신 분들은 부처님 전에 함께 복을 짓는{' '}
                    <strong className="text-[#8A6510]">‘나의 인연 신도’</strong>로 이어집니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://sowonpray.vercel.app/?ref=${currentUser.code}`}
                      className="flex-1 bg-[#FAF8F5] text-[#231F1C] text-xs px-3 py-2.5 rounded-xl border border-[#DDD4C4] font-medium min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyRefLink(currentUser.code)}
                      className="p-2.5 rounded-xl bg-[#F5D061] text-[#1B1815] font-extrabold text-xs flex items-center justify-center shrink-0 hover:brightness-105 active:scale-95 transition shadow-sm w-10 h-10"
                      title="전용 링크 복사"
                    >
                      <Copy className="w-4 h-4 shrink-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleQr(currentUser.code)}
                      className={`p-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center shrink-0 transition shadow-sm border w-10 h-10 ${
                        showQrCode === currentUser.code
                          ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                          : 'bg-[#FAF3DF] text-[#8A6510] border-[#E5D399] hover:bg-[#F5E6BF]'
                      }`}
                      title="전용 QR코드 보기"
                    >
                      <QrCode className="w-4 h-4 shrink-0" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8C8071] pt-0.5">
                    <span>※ 링크 접속 시 자동 연동</span>
                    <span className="font-bold text-[#8A6510]">내 인연코드: {currentUser.code}</span>
                  </div>

                  {showQrCode === currentUser.code && (
                    <div className="mt-3 p-4 rounded-xl bg-[#FAF5E6] border border-[#E5D399] flex flex-col items-center text-center space-y-2.5">
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-[#8A6510]">
                          卍 제주 소원사 모바일 법당 전용 QR
                        </span>
                        <h4 className="font-serif-kr text-sm font-bold text-[#231F1C] mt-0.5">
                          {currentUser.name} {currentUser.dharma_name ? `(${currentUser.dharma_name})` : ''} 님의 복덕 인연 QR
                        </h4>
                      </div>

                      {qrDataUrl ? (
                        <div className="p-3 bg-white rounded-2xl border-2 border-[#C59B27] shadow-md inline-block">
                          <img
                            src={qrDataUrl}
                            alt="인연 연결 QR코드"
                            className="w-44 h-44 sm:w-48 sm:h-48 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center bg-white rounded-2xl border">
                          <span className="text-xs text-[#8C7A5B]">QR 생성 중...</span>
                        </div>
                      )}

                      <p className="text-[11px] text-[#6E655C] leading-snug break-keep max-w-xs">
                        가족이나 지인의 스마트폰 카메라로 비추시면, 회원님의 인연 코드가 자동 연결된 모바일 법당으로 즉시 열립니다.
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDownloadQr(currentUser.name, currentUser.code)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#231F1C] text-[#F5D061] border border-[#C59B27] text-xs font-bold flex items-center gap-1 shadow hover:brightness-110 transition"
                        >
                          <span>QR 이미지 저장</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQrCode(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#DDD4C4] text-xs text-[#6E655C] hover:bg-[#FAF8F5] transition"
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* 부처님과 맺은 나의 인연 공덕 나무 (계보 트리) */}
                <OrganizationTreeView
                  members={members}
                  rootCode={currentUser.code}
                  activeAgentCode={currentUser.code}
                  title="🌿 부처님과 맺은 ‘나의 인연 공덕 나무’"
                  onSelectMember={(m) => {
                    showToast(`[${m.name}] 님의 인연 정보 (코드: ${m.code})`)
                  }}
                />

                {/* 내 정보 & 사찰 축원 상세정보 수정 폼 */}
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4"
                >
                  <div className="border-b border-[#EFE9DD] pb-3">
                    <span className="text-[11px] font-bold text-[#9A7418]">
                      MEMBER PROFILE & PRAYER DB
                    </span>
                    <h3 className="font-serif-kr text-base font-bold text-[#231F1C] mt-0.5">
                      내 기본정보 및 사찰 축원 상세정보 관리
                    </h3>
                  </div>

                  {/* 1. 기본 계정 정보 */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-[#3D3630] mb-1">
                        성함 (필수)
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3D3630] mb-1">
                        법명 (선택)
                      </label>
                      <input
                        type="text"
                        value={profileForm.dharma_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, dharma_name: e.target.value })
                        }
                        placeholder="예: 무량화"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3D3630] mb-1">
                        비밀번호 변경
                      </label>
                      <input
                        type="text"
                        value={profileForm.password_pin}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, password_pin: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                      />
                    </div>
                  </div>

                  {/* 2. 사찰 축원 & 위패 봉안용 확장 정보 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-[#3D3630] mb-1">
                        생년월일 (축원용)
                      </label>
                      <input
                        type="text"
                        value={profileForm.birth_date}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, birth_date: e.target.value })
                        }
                        placeholder="예: 1964-02-19"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#3D3630] mb-1">
                        음력 / 양력 구분
                      </label>
                      <select
                        value={profileForm.lunar_solar}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, lunar_solar: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                      >
                        <option value="음력">음력</option>
                        <option value="양력">양력</option>
                        <option value="음력(윤달)">음력(윤달)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      거주지 주소 (대웅전 축원문 낭독 시 사용)
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, address: e.target.value })
                      }
                      placeholder="예: 제주특별자치도 제주시 애월읍..."
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#3D3630] mb-1">
                      가족 축원 명단 / 조상님 영가 메모 (자유 기재)
                    </label>
                    <textarea
                      rows={2}
                      value={profileForm.family_memo}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, family_memo: e.target.value })
                      }
                      placeholder="예: 배우자 김성수(59년생), 장녀 김미영(90년생) 건강 발원 / 선망 부모님 위패 봉안 등"
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                    />
                  </div>

                  {/* 3. 포교위원 전용 수당 입금 계좌 정보 */}
                  {isAgentOrAbove && (
                    <div className="pt-3 border-t border-[#EFE9DD] space-y-2.5">
                      <span className="block text-[11px] font-bold text-[#9A7418]">
                        [포교위원 전용] 불사 포교비(수당) 정산 계좌 정보
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={profileForm.bank_name}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, bank_name: e.target.value })
                          }
                          placeholder="은행명 (예: 농협)"
                          className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                        <input
                          type="text"
                          value={profileForm.bank_account}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, bank_account: e.target.value })
                          }
                          placeholder="계좌번호"
                          className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                        <input
                          type="text"
                          value={profileForm.account_holder}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, account_holder: e.target.value })
                          }
                          placeholder="예금주"
                          className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#231F1C] text-[#F5D061] font-bold text-xs border border-[#C59B27] hover:bg-[#302A25] transition flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>내 회원정보 저장하기</span>
                  </button>
                </form>

              </>
            )}
          </main>
        )}

        {/* ==================== 5. 포교사(파트너 전산) 탭 ==================== */}
        {activeTab === 'agent' && isAgentOrAbove && (
          <main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 상단: 내정보 창으로 돌아가기 바 */}
            <div className="flex items-center justify-between pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="text-xs font-bold text-[#8A6510] hover:text-[#C59B27] flex items-center gap-1.5 transition py-1 px-2 rounded-lg bg-[#FAF8F5] border border-[#DDD4C4]"
              >
                <span>← [내정보] 창으로 돌아가기</span>
              </button>
              <span className="text-[11px] text-[#A69B8D] font-medium">포교위원회 전용</span>
            </div>

            <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/40 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#F5D061] font-semibold">
                    포교위원 모바일 파트너 센터
                  </span>
                  <h2 className="font-serif-kr text-xl font-bold mt-0.5">
                    {activeAgent.name}
                    {activeAgent.dharma_name ? `(${activeAgent.dharma_name})` : ''}
                    {activeAgent.role === 'committee_member' ? ' 포교위원' : ' 포교위원장'}님의 전법 도량
                  </h2>
                </div>
                {isMasterOrTempleAdmin && (
                  <select
                    value={selectedAgentCode}
                    onChange={(e) => setSelectedAgentCode(e.target.value)}
                    className="bg-[#2E2822] text-[#F5D061] border border-[#C59B27]/50 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                  >
                    {agents.map((ag) => (
                      <option key={ag.code} value={ag.code}>
                        {ag.name} ({ag.role === 'committee_member' ? '포교위원' : '포교위원장'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10.5px] text-[#BFB6AA] whitespace-nowrap">인연 신도수</div>
                  <div className="text-base sm:text-lg font-bold text-[#F5D061] mt-0.5 whitespace-nowrap">
                    {activeAgent.believers_count || 0}명
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10.5px] text-[#BFB6AA] whitespace-nowrap">위패 봉안 누적</div>
                  <div className="text-base sm:text-lg font-bold text-white mt-0.5 whitespace-nowrap">
                    {activeAgent.wipae_count || 0}기
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-[10.5px] text-[#BFB6AA] whitespace-nowrap">직접 포교 요율</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5 whitespace-nowrap">
                    {activeAgent.role === 'committee_member' ? '30%' : '40%'}
                  </div>
                </div>
              </div>

              {/* 판권 및 포교비 집행 안내 카드 (백분율 요율제 & 실입금 정산) */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1F1B17] to-[#2A231C] border border-[#C59B27]/35 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F5D061] flex items-center gap-1">
                    <span>📜</span>
                    <span>
                      {activeAgent.role === 'committee_member'
                        ? '포교위원 (30% 요율) 불사 포교비 규정'
                        : '포교위원장 (40% 요율) 불사 포교비 규정'}
                    </span>
                  </span>
                  <span className="text-[10.5px] text-[#A69B8D]">실입금액 기준 실시간 자동 정산</span>
                </div>
                <div className="space-y-1.5 text-[11.5px] text-[#E8DFD1]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/25">
                    <span className="text-[#C59B27] font-semibold">① 본인 직접 유치 성사 포교비</span>
                    <strong className="text-emerald-400 font-bold">
                      실입금액의 {activeAgent.role === 'committee_member' ? '30%' : '40%'}
                    </strong>
                  </div>
                  {activeAgent.role !== 'committee_member' && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/25">
                      <span className="text-[#C59B27] font-semibold">② 산하 포교위원 성사 시 관리 수당</span>
                      <strong className="text-[#F5D061] font-bold">실입금액의 10%</strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/25">
                    <span className="text-[#A69B8D]">③ 제주 소원사 사찰 봉안 불사금</span>
                    <span className="text-white font-medium">실입금액의 50%</span>
                  </div>
                </div>
                <div className="text-[10px] text-[#8C8071] pt-1 border-t border-white/10 flex justify-between">
                  <span>※ 분납(할부) 입금 시에도 입금되는 즉시 해당 요율대로 분할 정산됩니다.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181512] border border-[#C59B27]/30 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#D6CEC2] font-medium whitespace-nowrap">
                    전용 포교 링크 (뒤 8자리)
                  </span>
                  <span className="text-[11px] text-[#F5D061] font-bold whitespace-nowrap shrink-0">
                    코드: {activeAgent.code}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://sowonpray.vercel.app/?ref=${activeAgent.code}`}
                    className="flex-1 bg-[#26211C] text-[#E8DFD1] text-xs px-3 py-2 rounded-lg border border-white/10 focus:outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyRefLink(activeAgent.code)}
                    className="px-3.5 py-2 rounded-lg bg-[#F5D061] text-[#1B1815] font-bold text-xs flex items-center gap-1 whitespace-nowrap shrink-0 hover:brightness-105 transition"
                  >
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>복사</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleQr(activeAgent.code)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0 transition border ${
                      showQrCode === activeAgent.code
                        ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                        : 'bg-white/10 text-[#FAF8F5] border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 shrink-0" />
                    <span>QR</span>
                  </button>
                </div>

                {showQrCode === activeAgent.code && (
                  <div className="mt-3 p-4 rounded-xl bg-[#26211C] border border-[#C59B27]/40 flex flex-col items-center text-center space-y-2.5">
                    <span className="text-[11px] font-bold text-[#F5D061]">
                      {activeAgent.name} 포교위원 전용 QR코드
                    </span>
                    {qrDataUrl && (
                      <div className="p-3 bg-white rounded-2xl border-2 border-[#C59B27] shadow-md inline-block">
                        <img
                          src={qrDataUrl}
                          alt="포교위원 QR코드"
                          className="w-40 h-40 rounded-lg"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadQr(activeAgent.name, activeAgent.code)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#F5D061] text-[#1B1815] text-xs font-bold shadow hover:brightness-105 transition"
                    >
                      QR 이미지 저장
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 나의 인연 신도 도량 방문 & 사찰 공양(식사) 예약 현황 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Coffee className="w-4 h-4 text-[#9A7418] shrink-0" />
                  <h3 className="font-serif-kr font-bold text-sm sm:text-base break-keep">
                    인연 신도 방문 · 공양(식사) 예약 현황
                  </h3>
                </div>
                <span className="text-xs text-[#9A7418] font-bold shrink-0">
                  총 {visits.filter((v) => isAdmin || v.agent_code === activeAgent.code).length}건 ·{' '}
                  총{' '}
                  {visits
                    .filter((v) => isAdmin || v.agent_code === activeAgent.code)
                    .reduce((acc, cur) => acc + (Number(cur.headcount) || 1), 0)}
                  명 준비
                </span>
              </div>

              <div className="space-y-2.5">
                {visits
                  .filter((v) => isAdmin || v.agent_code === activeAgent.code)
                  .map((v) => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-[#231F1C] truncate">
                            🍵 {v.visitor_name} ({v.visitor_phone})
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#231F1C] text-[#F5D061] text-[11px] font-extrabold whitespace-nowrap shrink-0">
                            방문 {v.headcount}명 (공양 {v.headcount}인분)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVisits((prev) =>
                              prev.map((item) =>
                                item.id === v.id
                                  ? {
                                      ...item,
                                      status:
                                        item.status === 'confirmed' ? 'reserved' : 'confirmed',
                                    }
                                  : item
                              )
                            )
                            showToast('방문 및 사찰 공양 준비 상태가 변경되었습니다.')
                          }}
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                            v.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.status === 'confirmed' ? '✓ 공양준비확정' : '예약접수 (터치시 확정)'}
                        </button>
                      </div>
                      <div className="text-xs text-[#8A6510] font-semibold">
                        방문일시: {v.visit_date} · {v.visit_time} · 정확히 {v.headcount}명 방문
                      </div>
                      <div className="text-xs text-[#4A433C]">
                        목적: {v.visit_purpose} / “{v.memo}”
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* 뷰 모드 전환 버튼: 조직도 트리 vs 인연 신도 축원 리스트 */}
            <div className="flex items-center justify-between gap-2 p-1 bg-[#231F1C] rounded-xl border border-[#C59B27]/40">
              <button
                type="button"
                onClick={() => setAgentViewMode('tree')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  agentViewMode === 'tree'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <span>🌿 포교 인연 계보도 (Tree)</span>
              </button>
              <button
                type="button"
                onClick={() => setAgentViewMode('list')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  agentViewMode === 'list'
                    ? 'bg-[#F5D061] text-[#1B1815] shadow'
                    : 'text-[#D6CEC2] hover:text-white'
                }`}
              >
                <span>📋 인연 신도 축원 현황</span>
              </button>
            </div>

            {/* [모드 1] 포교 추천 조직도 트리 뷰 */}
            {agentViewMode === 'tree' && (
              <OrganizationTreeView
                members={members}
                rootCode={isAdmin ? null : activeAgent.code}
                activeAgentCode={activeAgent.code}
                onSelectMember={(m) => {
                  showToast(`[${m.name}] 포교 파트너 (코드: ${m.code}) 선택됨`)
                }}
              />
            )}

            {/* [모드 2] 나의 인연 신도 리스트 */}
            {agentViewMode === 'list' && (
              <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif-kr font-bold text-base">
                    나의 인연 신도 축원 및 상담 현황
                  </h3>
                  <span className="text-xs text-[#9A7418] font-semibold">
                    총 {prayers.filter((p) => isAdmin || p.agent_code === activeAgent.code).length}건
                  </span>
                </div>

                <div className="space-y-3">
                  {prayers
                    .filter((p) => isAdmin || p.agent_code === activeAgent.code)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-[#9A7418]" />
                            <span className="text-xs font-bold text-[#231F1C]">
                              {p.believer_name}
                            </span>
                            <span className="text-[11px] text-[#786E63]">({p.believer_phone})</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFE7D6] text-[#7D6320]">
                            {p.status === 'consulting' ? '위패상담중' : '축원진행중'}
                          </span>
                        </div>

                        <div className="text-xs text-[#4A433C]">
                          최근 발원: <strong className="text-[#8A6510]">[{p.wish_category}]</strong> “{p.wish_text}”
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#8C7A5B] pt-1 border-t border-[#EFE9DD]">
                          <span>접수일시: {formatPrayerDate(p.created_at)}</span>
                          <span>담당코드: {p.agent_code}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}
          </main>
        )}

        {/* ==================== 6. 총괄정산 & 회원관리 (사찰 최고대표 및 총괄 마스터 전산) 탭 ==================== */}
        {activeTab === 'admin' && isMasterOrTempleAdmin && (
          <main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 상단: 내정보 창으로 돌아가기 바 */}
            <div className="flex items-center justify-between pb-0.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('profile')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="text-xs font-bold text-[#8A6510] hover:text-[#C59B27] flex items-center gap-1.5 transition py-1 px-2 rounded-lg bg-[#FAF8F5] border border-[#DDD4C4]"
              >
                <span>← [내정보] 창으로 돌아가기</span>
              </button>
              <span className="text-[11px] text-[#A69B8D] font-medium">
                {isTempleAdmin ? '사찰 최고대표 관제' : '총괄 마스터 전용'}
              </span>
            </div>

            <section className="rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#2C241C] text-white p-5 border border-[#C59B27]/50 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 font-bold">
                  {isTempleAdmin
                    ? '소원사 본부 최고대표 관제 · 양영문 창건주 회장 전산'
                    : 'MASTER ADMIN · 총괄 포교본부 전산 (제주AI파트너)'}
                </span>
                <Settings className="w-4 h-4 text-[#F5D061]" />
              </div>
              <h2 className="font-serif-kr text-xl font-bold">
                {isTempleAdmin
                  ? '소원사 사찰 본부 & 전국 위원회 총괄 정산 관제 센터'
                  : '총괄 판권(100만 원) & 전국 위원회 정산 관제 센터'}
              </h2>
              <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed">
                {isTempleAdmin
                  ? '소원사 창건주 겸 신도회장(사찰 최고 대표책임자) 양영문 회장님의 사찰 본부 총괄 관제 센터입니다.'
                  : '김철수 총괄 대표님의 100만 원 판권 기준, 사찰 불사금 100만 원(50%) 및 포교위원장(80만) · 포교위원(60만) 판권 마진을 통합 관제합니다.'}
              </p>
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-[#F5D061] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#F5D061]" />
                <span>
                  <strong>[사찰 최고 보안 보장]</strong> 사찰 최고 대표책임자(창건주 회장님) 및 총괄 사업단만 열람 가능하며, 하위 포교위원에게는 일절 노출되지 않습니다.
                </span>
              </div>
            </section>

            {/* 오늘의 대웅전 사시예불 축원 명부 (7일 유효 신도 전용) 인쇄 관제 */}
            <section className="bg-gradient-to-r from-[#241E17] via-[#2F2417] to-[#1C160F] text-white rounded-2xl p-4 sm:p-5 border-2 border-[#D4AF37] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#1B1815] text-[10.5px] font-extrabold whitespace-nowrap">
                    대웅전 불단 축원용
                  </span>
                  <span className="text-xs text-[#F5D061] font-bold whitespace-nowrap">
                    매일 오전 10:00 사시예불 실시간 연동
                  </span>
                </div>
                <h3 className="font-serif-kr text-base sm:text-lg font-bold text-white break-keep">
                  오늘의 사시예불 축원 명부 ({activeSasiPrayers.length}위 진행중)
                </h3>
                <p className="text-xs text-[#D6CEC2] mt-0.5 leading-relaxed break-keep">
                  접수 후 7일 이내 정진 불자만 자동 추출됩니다. (7일 지난 만료 신도는 자동 제외)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSasiPrintModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>사시예불 명부 열기 & A4 인쇄</span>
              </button>
            </section>

            {/* 1. 신규 포교위원 / 회원 등록 및 등급 관리 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-kr font-bold text-base">
                  1. 통합 회원 & 포교위원회 DB 관리 ({members.length}명)
                </h3>
                <span className="text-xs text-[#9A7418] font-bold">
                  포교위원 {agents.length}명 · 일반신도 {members.length - agents.length}명
                </span>
              </div>

              <form
                onSubmit={handleAdminAddMember}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2.5"
              >
                <div className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#9A7418]" />
                  <span>신규 포교위원 / 신도 빠른 등록 (초기비번: 0000)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={adminNewName}
                    onChange={(e) => setAdminNewName(e.target.value)}
                    placeholder="성함 (예: 홍길동)"
                    className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                  />
                  <input
                    type="text"
                    value={adminNewDharma}
                    onChange={(e) => setAdminNewDharma(e.target.value)}
                    placeholder="법명 (예: 보현심)"
                    className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="tel"
                    value={adminNewPhone}
                    onChange={(e) => setAdminNewPhone(e.target.value)}
                    placeholder="전화번호"
                    className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                  />
                  <select
                    value={adminNewRole}
                    onChange={(e) => setAdminNewRole(e.target.value)}
                    className="px-2 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs font-semibold"
                  >
                    <option value="agent">포교위원장 등록 (80만)</option>
                    <option value="committee_member">포교위원 등록 (60만)</option>
                    <option value="believer">일반신도 등록</option>
                  </select>
                  <select
                    value={adminNewParent}
                    onChange={(e) => setAdminNewParent(e.target.value)}
                    className="px-2 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                  >
                    {agents.map((a) => (
                      <option key={a.code} value={a.code}>
                        추천: {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#231F1C] text-[#F5D061] font-bold text-xs"
                >
                  + 회원 DB에 즉시 등록하기
                </button>
              </form>

              <div className="flex items-center justify-between gap-2 p-1 bg-[#231F1C] rounded-xl border border-[#C59B27]/40">
                <button
                  type="button"
                  onClick={() => setAdminMemberViewMode('tree')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adminMemberViewMode === 'tree'
                      ? 'bg-[#F5D061] text-[#1B1815] shadow'
                      : 'text-[#D6CEC2] hover:text-white'
                  }`}
                >
                  <span>🌳 전국 포교 계보 조직도 (Tree)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminMemberViewMode('list')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adminMemberViewMode === 'list'
                      ? 'bg-[#F5D061] text-[#1B1815] shadow'
                      : 'text-[#D6CEC2] hover:text-white'
                  }`}
                >
                  <span>📋 회원 등급 목록형</span>
                </button>
              </div>

              {adminMemberViewMode === 'tree' ? (
                <OrganizationTreeView
                  members={members}
                  rootCode={null}
                  activeAgentCode={currentUser?.code}
                  onSelectMember={(m) => {
                    showToast(`[${m.name}] 회원 (코드: ${m.code} / 역할: ${m.role}) 선택됨`)
                  }}
                />
              ) : (
                /* 등록된 회원 목록 (일반신도 ⇄ 포교사 원클릭 등급 변경 지원) */
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {members.map((m) => (
                    <div
                      key={m.code}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-[#231F1C] truncate">
                          {m.name} {m.dharma_name ? `(${m.dharma_name})` : ''} ·{' '}
                          <span className="text-[#8A6510]">{m.code}</span>
                        </div>
                        <div className="text-[11px] text-[#786E63] truncate">
                          {m.phone} {m.address ? `· ${m.address}` : ''}
                        </div>
                      </div>
                      <select
                        value={m.role}
                        onChange={(e) => {
                          const nextRole = e.target.value
                          setMembers((prev) =>
                            prev.map((item) =>
                              item.code === m.code ? { ...item, role: nextRole } : item
                            )
                          )
                          showToast(`${m.name}님의 회원 등급이 변경되었습니다.`)
                        }}
                        className="px-2 py-1 rounded-lg bg-white border border-[#D5C59B] text-[11px] font-bold text-[#231F1C] shrink-0"
                      >
                        <option value="believer">일반신도</option>
                        <option value="committee_member">포교위원 (60만)</option>
                        <option value="agent">포교위원장 (80만)</option>
                        <option value="temple_admin">창건주·신도회장 본부</option>
                        <option value="master">총괄 포교위원장 (제주AI파트너)</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. 총괄 판권(50%) 및 전국 위원회 백분율 요율제 배분 체계 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-kr font-bold text-base">
                    2. 실입금액 기준 백분율(%) 배분 체계
                  </h3>
                  <span className="text-[11px] text-[#8C8071]">
                    전액 일시납 · 분납(할부) 완벽 대응 실시간 자동 정산
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                  실입금액의 100%
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* 1. 총괄 대표님 직속 성사 */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#1F1B17] to-[#2B231A] text-white border border-[#C59B27]/40 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#F5D061] flex items-center gap-1">
                      <span>👑</span>
                      <span>① 김철수 총괄 직속 성사 (산하 위원 없는 라인)</span>
                    </span>
                    <span className="text-base text-[#F5D061]">실입금액의 50% (전액)</span>
                  </div>
                  <p className="text-[11px] text-[#C5BBAE]">
                    산하에 포교위원장/포교위원이 없는 라인에서 성사 시, 50% 총판 풀 전액이 김철수 총괄 수당으로 귀속됩니다. (예: 200만 입금 시 100만 / 50만 분납 시 25만 원)
                  </p>
                </div>

                {/* 2. 포교위원장 성사 시 */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-[#231F1C]">
                    <span className="text-emerald-800 flex items-center gap-1">
                      <span>🌿</span>
                      <span>② 포교위원장(40%) 직접 성사 시</span>
                    </span>
                    <span className="text-xs text-[#7A6E5E]">총 50% 판권 풀 집행</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 rounded-lg bg-white border border-[#E4DDD0]">
                      <span className="text-[#6B6155] block">포교위원장 지급:</span>
                      <strong className="text-[#1B1815] text-xs">실입금액의 40%</strong>
                      <span className="text-[10px] text-[#8C8071] block mt-0.5">200만 시 80만 / 50만 시 20만</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FFF9E6] border border-[#E5D399]">
                      <span className="text-[#8A6510] block font-bold">총괄 오버라이딩 마진:</span>
                      <strong className="text-[#9A7418] text-xs">+실입금액의 10%</strong>
                      <span className="text-[10px] text-[#8A6510] block mt-0.5">200만 시 20만 / 50만 시 5만</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-[#8C8071]">
                    ※ 포교위원장에게는 본인 포교비 40%만 표기되며, 총괄 10% 마진은 철저히 비공개됩니다.
                  </p>
                </div>

                {/* 3. 포교위원 성사 시 */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-1.5">
                  <div className="flex justify-between items-center font-bold text-[#231F1C]">
                    <span className="text-teal-800 flex items-center gap-1">
                      <span>🌱</span>
                      <span>③ 산하 포교위원(30%) 성사 시</span>
                    </span>
                    <span className="text-xs text-[#7A6E5E]">총 50% 판권 풀 집행</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-[11px] pt-1">
                    <div className="p-2 rounded-lg bg-white border border-[#E4DDD0]">
                      <span className="text-[#6B6155] block">포교위원:</span>
                      <strong className="text-[#1B1815]">30%</strong>
                      <span className="text-[9.5px] text-[#8C8071] block">200만시 60만</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-[#E4DDD0]">
                      <span className="text-[#6B6155] block">상위위원장:</span>
                      <strong className="text-[#1B1815]">10%</strong>
                      <span className="text-[9.5px] text-[#8C8071] block">200만시 20만</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FFF9E6] border border-[#E5D399]">
                      <span className="text-[#8A6510] block font-bold">총괄마진:</span>
                      <strong className="text-[#9A7418]">+10%</strong>
                      <span className="text-[9.5px] text-[#8A6510] block">200만시 20만</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-[#8C8071]">
                    ※ 포교위원(30%)과 위원장(10% 관리비)은 40% 안에서만 인지하며, 총괄 10% 마진은 일절 노출되지 않습니다.
                  </p>
                </div>

                {/* 4. 제주 소원사 사찰 불사금 */}
                <div className="p-3 rounded-xl bg-[#231F1C] text-white flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <span>卍</span>
                    <span>제주 소원사 사찰 봉안 불사금 (소원사 공식 계좌 귀속)</span>
                  </span>
                  <span className="text-[#F5D061]">실입금액의 50% 고정</span>
                </div>
              </div>
            </section>

            {/* 3. 신규 위패 봉안 정산 시뮬레이터 */}
            <form
              onSubmit={handleAddSettlement}
              className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3.5"
            >
              <h3 className="font-serif-kr font-bold text-base">
                3. 신규 위패 봉안 전산 입력 (자동 계보 정산)
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1">
                    봉안 신도 성함
                  </label>
                  <input
                    type="text"
                    value={simBelieverName}
                    onChange={(e) => setSimBelieverName(e.target.value)}
                    placeholder="예: 정주영 (원력보살)"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1">
                    직접 성사 유치 위원 (1차)
                  </label>
                  <select
                    value={simAgentCode}
                    onChange={(e) => setSimAgentCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs font-semibold"
                  >
                    {agents.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.name} ({a.role === 'committee_member' ? '포교위원 60만' : a.role === 'master' ? '김철수 총괄' : '포교위원장 80만'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1">
                    봉안 · 불사 품목 구분
                  </label>
                  <select
                    value={simItemType}
                    onChange={(e) => {
                      const val = e.target.value
                      setSimItemType(val)
                      if (val.includes('2기')) setSimAmount(4000000)
                      else if (val.includes('기둥·단청')) setSimAmount(1000000)
                      else if (val.includes('소원기와')) setSimAmount(100000)
                      else setSimAmount(2000000)
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                  >
                    <option value="생전예수재 황금위패 (1기)">생전예수재 황금위패 (1기)</option>
                    <option value="조상 영가 흑색 영구위패 (1기)">조상 영가 흑색 영구위패 (1기)</option>
                    <option value="조상 영가 부부 영구위패 (2기)">조상 영가 부부 영구위패 (2기)</option>
                    <option value="삼성각 가족 영구축원 명패 (1구좌)">삼성각 가족 영구축원 명패 (1구좌)</option>
                    <option value="삼성각 대들보·기둥·단청 불사">삼성각 대들보·기둥·단청 불사</option>
                    <option value="삼성각 건립 소원기와 (1장)">삼성각 건립 소원기와 (1장)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1">
                    봉안 금액 (원)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#231F1C] text-[#F5D061] font-bold text-xs border border-[#C59B27] hover:bg-[#302A25] transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>위패 봉안 등록 및 1·2·3차 수당 자동 산출</span>
              </button>
            </form>

            {/* 4. 위패 봉안 정산 원장 리스트 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3">
              <h3 className="font-serif-kr font-bold text-base">
                4. 위패 봉안 정산 원장 ({settlements.length}건)
              </h3>

              <div className="space-y-3">
                {settlements.map((s) => {
                  const amt1 = (s.total_amount * commissionRules.rate1st) / 100
                  const amt2 = s.agent_2nd_code
                    ? (s.total_amount * commissionRules.rate2nd) / 100
                    : 0
                  const amt3 = s.agent_3rd_code
                    ? (s.total_amount * commissionRules.rate3rd) / 100
                    : 0
                  const amtPlatform = (s.total_amount * commissionRules.ratePlatform) / 100

                  return (
                    <div
                      key={s.id}
                      className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DEC9] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#231F1C]">
                            {s.believer_name} 신도님
                          </span>
                          <span className="text-[11px] text-[#8A6510] font-semibold ml-1.5">
                            · {s.item_name}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-[#231F1C]">
                          {s.total_amount.toLocaleString()}원
                        </span>
                      </div>

                      {(() => {
                        const is1stKim = s.agent_1st_code === '33065540'
                        const is1stMember =
                          s.agent_1st_code === '91010002' ||
                          (s.agent_1st_name &&
                            s.agent_1st_name.includes('포교위원') &&
                            !s.agent_1st_name.includes('위원장'))
                        const templeAmt = Math.round(s.total_amount * 0.5)
                        const agent1Amt = is1stKim
                          ? Math.round(s.total_amount * 0.5)
                          : is1stMember
                          ? Math.round(s.total_amount * 0.3)
                          : Math.round(s.total_amount * 0.4)
                        const agent2Amt = is1stMember ? Math.round(s.total_amount * 0.1) : 0
                        const masterAmt = is1stKim
                          ? Math.round(s.total_amount * 0.5)
                          : Math.round(s.total_amount * 0.1)

                        return (
                          <div className="grid grid-cols-3 gap-1.5 text-[11px] bg-white p-2.5 rounded-lg border border-[#EFE9DD]">
                            <div>
                              <span className="text-[#786E63] block">사찰 귀속(50%):</span>
                              <strong className="text-[#231F1C]">{templeAmt.toLocaleString()}원</strong>
                            </div>
                            <div>
                              <span className="text-[#786E63] block">포교단 집행:</span>
                              <strong className="text-[#231F1C]">
                                {is1stKim
                                  ? `직속 ${agent1Amt.toLocaleString()}원`
                                  : is1stMember
                                  ? `위원 ${agent1Amt.toLocaleString()}원 + 관리 ${agent2Amt.toLocaleString()}원`
                                  : `위원장 ${agent1Amt.toLocaleString()}원 (40%)`}
                              </strong>
                            </div>
                            <div className="bg-[#FFF9E6] p-1 rounded border border-[#E5D399]/60">
                              <span className="text-[#8A6510] block font-bold">총괄 마진(김철수):</span>
                              <strong className="text-[#9A7418]">
                                +{masterAmt.toLocaleString()}원 ({is1stKim ? '50%' : '10%'})
                              </strong>
                            </div>
                          </div>
                        )
                      })()}
                      <div className="text-[10.5px] text-[#786E63] px-1 flex justify-between">
                        <span>직접유치: {s.agent_1st_name}</span>
                        {s.agent_2nd_name && s.agent_2nd_name !== '-' && (
                          <span>상위관리: {s.agent_2nd_name}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8C7A5B]">
                        <span>봉안일: {s.created_at}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          {s.payment_status === 'settled' ? '정산지급완료' : '수당확정'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </main>
        )}

        {/* 축원 완료 모달 */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <div className="w-full max-w-[380px] bg-[#1F1B17] text-white rounded-3xl p-6 border border-[#F5D061] text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-[#F5D061]/20 border border-[#F5D061] mx-auto flex items-center justify-center">
                <Flame className="w-8 h-8 text-[#F5D061] fill-[#F5D061]" />
              </div>
              <h3 className="font-serif-kr text-xl font-bold text-[#F5D061]">
                대웅전 7일 소원등 점등 완료
              </h3>
              <p className="text-xs text-[#E2DAD0] leading-relaxed break-keep">
                <strong>{wishName.trim()} 불자님</strong>의 간절한 발원이 <strong>제주 소원사 대웅전</strong>에 봉안되었습니다. 앞으로 <strong>7일 동안 매일 오전 10시 사시예불</strong>마다 스님께서 부처님 전에 정성껏 축원 올립니다.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#F5D061]">
                🙏 도량에 오시기 전날 미리 연락 주시면 따뜻한 차와 공양(식사)을 대접해 드립니다. (010-5557-0267)
              </div>
              {/* 가족·지인에게 소원등 알리기 (카카오톡 공유) */}
              <button
                type="button"
                onClick={() => {
                  const shareTarget = wishTarget && wishTarget !== '본인' ? ` (${wishTarget})` : ''
                  const shareMsg = `🪔 [제주 소원사 대웅전]\n${wishName.trim()}${shareTarget} 불자님의 간절한 소원등이 부처님 전에 밝혀졌습니다.\n\n"앞으로 7일 동안 매일 오전 10시 사시예불마다 스님께서 정성껏 축원 올립니다."\n\n🙏 함께 소원등 켜고 축원 받기:\nhttps://sowonpray.vercel.app`
                  if (navigator.share) {
                    navigator.share({
                      title: '제주 소원사 7일 소원등 점등',
                      text: shareMsg,
                      url: 'https://sowonpray.vercel.app',
                    }).catch(() => {})
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareMsg)
                    showToast('📋 소원등 축원 메시지가 복사되었습니다! 카카오톡 가족방에 붙여넣어 보세요.')
                  }
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FEE500] to-[#FADA0A] text-[#3C1E1E] font-black text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Share2 className="w-4 h-4 text-[#3C1E1E] shrink-0" />
                <span>가족·지인에게 내 소원등 알리기 (카톡 공유)</span>
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition"
              >
                합장하며 확인 (나무아미타불)
              </button>
            </div>
          </div>
        )}

        {/* 사경 회향 공덕장 (황금 인증서) 모달 */}
        {showMeritCertModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-4 animate-fadeIn">
            <div className="w-full max-w-[390px] bg-gradient-to-b from-[#251F19] via-[#1B1713] to-[#120F0D] text-white rounded-3xl p-5 sm:p-6 border-2 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.35)] relative overflow-hidden">
              {/* 상단 장식 빛무리 */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#F5D061]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

              {/* 닫기 버튼 */}
              <button
                type="button"
                onClick={() => setShowMeritCertModal(false)}
                className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#E5DCD0] flex items-center justify-center transition active:scale-90 z-10"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 공덕장 내부 본문 카드 (전통 한지 & 황금 테두리) */}
              <div className="p-4 sm:p-4.5 rounded-2xl bg-[#FAF6EE] text-[#241F1A] border-2 border-[#C59B27] relative shadow-inner">
                {/* 모서리 전통 문양 포인트 */}
                <div className="text-[10px] text-[#A67C1E] font-serif-kr text-center tracking-widest font-bold">
                  卍 제주 소원사 모바일 법당 卍
                </div>

                <div className="w-11 h-11 rounded-full bg-[#FAF0D5] border-2 border-[#C59B27] mx-auto flex items-center justify-center mt-2.5 shadow-sm">
                  <Award className="w-6 h-6 text-[#A67C1E]" />
                </div>

                <h3 className="font-serif-kr text-xl sm:text-2xl font-black text-[#6B4E08] text-center mt-2 tracking-tight">
                  사경 회향 공덕장
                </h3>
                <div className="text-[11px] text-[#8C6D1F] font-serif-kr text-center font-bold tracking-widest -mt-0.5">
                  寫 經 回 向 功 德 狀
                </div>

                <div className="my-3 border-t border-[#D5C59B] border-dashed" />

                {/* 수여자 정보 */}
                <div className="space-y-1.5 text-xs text-[#3A3228] font-serif-kr">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C6D1F] font-bold">정진 불자</span>
                    <span className="font-black text-[#1C1814] text-[13px]">
                      {currentUser?.name || lanternData?.believer_name || '소원사 정진 불자'} 합장
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8C6D1F] font-bold">회향 경전</span>
                    <span className="font-bold text-[#6B4E08]">
                      {currentSutra?.title || '반야심경'}
                    </span>
                  </div>
                </div>

                {/* 사경 구절 본문 박스 */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#F0E8D5] border border-[#D5C59B] text-center">
                  <p className="font-serif-kr text-xs sm:text-[12.5px] font-black text-[#2A231B] leading-relaxed break-keep">
                    “{currentSutra?.text}”
                  </p>
                  {currentSutra?.meaning && (
                    <p className="text-[10.5px] text-[#6B5E4F] mt-1 leading-snug break-keep">
                      ({currentSutra.meaning})
                    </p>
                  )}
                </div>

                {/* 축원문 */}
                <p className="text-[11px] text-[#4A4035] leading-relaxed break-keep font-serif-kr text-center mt-3">
                  위 불자님께서는 부처님의 거룩한 진리의 말씀을 정성껏 마음에 새기며 사경 1독을 원만히 회향하셨기에 이 공덕장을 드리며, 온 가족의 건강과 만복·소원성취를 두 손 모아 축원합니다.
                </p>

                <div className="mt-3 pt-2 border-t border-[#D5C59B]/70 flex items-center justify-between text-[10px] text-[#786A59] font-serif-kr">
                  <span>{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="font-black text-[#5C4307]">제주 소원사 주지 합장 📿</span>
                </div>
              </div>

              {/* 하단 공유 & 닫기 버튼 */}
              <div className="mt-3.5 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const believer = currentUser?.name || lanternData?.believer_name || '소원사 불자'
                    const shareMsg = `📜 [제주 소원사 사경 회향 공덕장]\n\n${believer} 불자님께서 부처님의 거룩한 말씀 "${currentSutra?.title}" 사경 1독을 지극한 정성으로 원만히 회향하셨습니다.\n\n"${currentSutra?.text}"\n\n"이 거룩한 사경 공덕이 온 가족과 지인 모두의 건강과 소원성취로 회향되기를 발원합니다."\n\n🙏 함께 사경하고 마음의 평안 찾기:\nhttps://sowonpray.vercel.app`
                    if (navigator.share) {
                      navigator.share({
                        title: '제주 소원사 사경 회향 공덕장',
                        text: shareMsg,
                        url: 'https://sowonpray.vercel.app',
                      }).catch(() => {})
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareMsg)
                      showToast('📋 사경 회향 공덕장 메시지가 복사되었습니다! 카카오톡 가족·지인방에 전해보세요.')
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FEE500] to-[#FADA0A] text-[#3C1E1E] font-black text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Share2 className="w-4 h-4 text-[#3C1E1E] shrink-0" />
                  <span>가족·지인에게 사경 공덕 나누기 (카톡 공유)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMeritCertModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition active:scale-95"
                >
                  합장하며 닫기 (나무아미타불)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 소원사 본부 & 전국 포교 통합 전산 모달 ==================== */}
        {showUnifiedAdminModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-3 animate-fadeIn">
            <div className="w-full max-w-[480px] h-[94vh] sm:h-[90vh] bg-[#FAF8F5] text-[#231F1C] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#C59B27]/40 relative">
              {/* 모달 상단 고정 헤더 */}
              <div className="bg-[#1C1814] text-white px-4 py-3 flex items-center justify-between border-b border-[#C59B27]/30 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#C59B27]/25 border border-[#F5D061]/40 flex items-center justify-center text-[#F5D061] text-xs font-bold shrink-0">
                    🏛️
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif-kr text-sm font-bold text-[#F5D061] truncate">
                      {isMaster
                        ? '제주 소원사 총괄 최고관제 전산'
                        : isTempleAdmin
                        ? '소원사 사찰본부 통합 관제 전산'
                        : currentUser?.role === 'committee_head' || currentUser?.role === 'agent'
                        ? '소원사 포교위원장 전용 전산'
                        : '소원사 포교 파트너 전산'}
                    </h3>
                    <p className="text-[10.5px] text-[#A89880] truncate">
                      {isMaster
                        ? '제주AI파트너 총괄대표 1인 최고 관제'
                        : isTempleAdmin
                        ? '양영문 창건주 회장님 · 사찰본부 관리 관제'
                        : `${currentUser?.name} 포교위원님의 도량 관제`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowUnifiedAdminModal(false)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition shrink-0 flex items-center gap-1 text-xs border border-white/15 font-semibold"
                  title="닫기"
                >
                  <span>닫기</span>
                  <X className="w-4 h-4" />
                </button>
              </div>



              {/* 모달 내부 원페이지 스크롤 컨텐츠 (포교사 -> 포교위원장 -> 사찰본부 -> 총괄 순차 전개) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {/* ======================================================== */}
                {/* 1단계: 🌿 1. 포교사 전산 (누구나 접근 가능) */}
                {/* ======================================================== */}
                <div id="sec-common" className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#E6DEC8]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h3 className="font-serif-kr text-base font-extrabold text-[#1B1815]">
                        🌿 1. 포교사 전산
                      </h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      공통 전산
                    </span>
                  </div>

                  {/* 파트너 헤더 */}
                  <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-4 sm:p-5 border border-[#C59B27]/40 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10.5px] text-[#F5D061] font-semibold">
                          포교위원 모바일 파트너 센터
                        </span>
                        <h3 className="font-serif-kr text-base sm:text-lg font-bold mt-0.5">
                          {activeAgent.name}
                          {activeAgent.dharma_name ? `(${activeAgent.dharma_name})` : ''}
                          {activeAgent.role === 'committee_member' ? ' 포교위원' : ' 포교위원장'}님의 도량
                        </h3>
                      </div>
                      {isMasterOrTempleAdmin && (
                        <select
                          value={selectedAgentCode}
                          onChange={(e) => setSelectedAgentCode(e.target.value)}
                          className="bg-[#2E2822] text-[#F5D061] border border-[#C59B27]/50 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
                        >
                          {agents.map((ag) => (
                            <option key={ag.code} value={ag.code}>
                              {ag.name} ({ag.role === 'committee_member' ? '위원' : '위원장'})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <div className="text-[10px] text-[#BFB6AA]">인연 신도</div>
                        <div className="text-base font-bold text-[#F5D061] mt-0.5">
                          {activeAgent.believers_count || 0}명
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <div className="text-[10px] text-[#BFB6AA]">위패 봉안</div>
                        <div className="text-base font-bold text-white mt-0.5">
                          {activeAgent.wipae_count || 0}기
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <div className="text-[10px] text-[#BFB6AA]">포교 요율</div>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">
                          {activeAgent.role === 'committee_member' ? '30%' : '40%'}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 나만의 전용 포교 링크 & QR 코드 발급 섹션 */}
                  <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-[#8A6510]" />
                        <h4 className="font-serif-kr font-bold text-sm">나만의 포교 링크 & QR 발급</h4>
                      </div>
                      <span className="text-[10px] text-[#8A6510] font-bold">코드: {activeAgent.code}</span>
                    </div>
                    <p className="text-xs text-[#6B5E4C] leading-relaxed">
                      전용 링크나 QR코드를 가족과 지인에게 전달하여 소원등 또는 위패를 신청하면 위원님의 인연 신도로 평생 자동 등록됩니다.
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://sowonpray.vercel.app/?ref=${activeAgent.code}`}
                        className="flex-1 bg-[#FAF8F5] text-[#231F1C] text-xs px-3 py-2 rounded-xl border border-[#D5C59B] focus:outline-none min-w-0 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyRefLink(activeAgent.code)}
                        className="p-2.5 rounded-xl bg-[#F5D061] text-[#1B1815] font-extrabold text-xs flex items-center justify-center shrink-0 hover:brightness-105 active:scale-95 transition shadow-sm w-10 h-10"
                        title="전용 링크 복사"
                      >
                        <Copy className="w-4 h-4 shrink-0" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleQr(activeAgent.code)}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition border shadow-sm w-10 h-10 ${
                          showQrCode === activeAgent.code
                            ? 'bg-[#1B1815] text-[#F5D061] border-[#1B1815]'
                            : 'bg-white text-[#231F1C] border-[#D5C59B] hover:bg-neutral-50'
                        }`}
                        title="전용 QR코드 보기"
                      >
                        <QrCode className="w-4 h-4 shrink-0" />
                      </button>
                    </div>

                    {showQrCode === activeAgent.code && (
                      <div className="mt-2 p-4 rounded-xl bg-[#FAF8F5] border border-[#C59B27]/40 flex flex-col items-center text-center space-y-2.5">
                        <span className="text-[11px] font-bold text-[#8A6510]">
                          {activeAgent.name} 포교위원 전용 QR코드
                        </span>
                        {qrDataUrl && (
                          <div className="p-3 bg-white rounded-2xl border-2 border-[#C59B27] shadow-md inline-block">
                            <img
                              src={qrDataUrl}
                              alt="포교위원 QR코드"
                              className="w-36 h-36 rounded-lg"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadQr(activeAgent.name, activeAgent.code)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#231F1C] text-[#F5D061] text-xs font-bold shadow hover:bg-[#352F2A] transition"
                        >
                          QR 이미지 저장
                        </button>
                      </div>
                    )}
                  </section>

                  {/* 산하 인연 조직도 트리 */}
                  <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#8A6510]" />
                        <h4 className="font-serif-kr font-bold text-sm">산하 인연 조직도</h4>
                      </div>
                      <span className="text-[10.5px] text-[#8C8071]">
                        {activeAgent.name} 포교위원 관할
                      </span>
                    </div>
                    <OrganizationTreeView
                      members={members}
                      rootCode={isMasterOrTempleAdmin ? (selectedAgentCode || activeAgent.code) : activeAgent.code}
                    />
                  </section>

                  {/* 내가 유치한 신도 차담 & 공양 예약 현황 */}
                  <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Coffee className="w-4 h-4 text-[#8A6510]" />
                        <h4 className="font-serif-kr font-bold text-sm">인연 신도 도량 차담 & 공양 예약</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#8A6510] font-bold">
                        {visits.length}건 접수
                      </span>
                    </div>
                    <div className="space-y-2">
                      {visits.map((res) => (
                        <div key={res.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-[#231F1C]">
                              {res.visitor_name || res.believer_name || '불자'}님
                              <span className="text-[11px] text-[#8C8071] ml-1">({res.headcount || 1}명 방문)</span>
                            </div>
                            <div className="text-[11px] text-[#8A6510] mt-0.5">
                              📅 {res.visit_date} {res.visit_time || ''} · {res.tea_or_meal || '차담 및 사찰공양'}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                            {res.status === 'confirmed' ? '예약 확정' : '접수 완료'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-[#8A6510]">
                      🙏 신도님이 도량에 방문하시기 전날 미리 사찰에 알려주시면 따뜻한 차담과 공양을 정성껏 준비합니다.
                    </div>
                  </section>
                </div>

                {/* ======================================================== */}
                {/* 2단계: 🎖️ 2. 포교위원장 전산 (위원장 이상 접근) */}
                {/* ======================================================== */}
                {(currentUser?.role === 'committee_head' || currentUser?.role === 'agent' || isMasterOrTempleAdmin) && (
                  <div id="sec-head" className="space-y-4 pt-6 border-t-2 border-[#D5C59B]/40">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E6DEC8]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
                        <h3 className="font-serif-kr text-base font-extrabold text-[#1B1815]">
                          🎖️ 2. 포교위원장 전산
                        </h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5D061]/30 text-[#8A6510] font-bold border border-[#F5D061]/50">
                        포교위원장 전용
                      </span>
                    </div>

                    {/* 포교위원장 수수료 안내 카드 */}
                    <section className="rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#2C241C] text-white p-4 sm:p-5 border border-[#C59B27]/50 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 font-bold">
                          🎖️ 포교위원장 전용 관제
                        </span>
                        <Award className="w-4 h-4 text-[#F5D061]" />
                      </div>
                      <h2 className="font-serif-kr text-base sm:text-lg font-bold">
                        포교위원장 특별 권한 & 오버라이딩 수수료 체계
                      </h2>
                      <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed">
                        포교위원장 직추천 시 40%(80만 원)가 정산되며, 산하 포교위원이 신도를 인연 맺을 때마다 10%(20만 원)의 관리 지도비가 위원장님께 지속 정산됩니다.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#C5BBAE] block">직접 추천 포교비</span>
                          <span className="text-sm font-extrabold text-[#F5D061]">40% (80만 원)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#C5BBAE] block">산하 관리 오버라이딩</span>
                          <span className="text-sm font-extrabold text-emerald-400">10% (20만 원)</span>
                        </div>
                      </div>
                    </section>

                    {/* 산하 포교위원 명단 및 활동 통계 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#8A6510]" />
                          <h3 className="font-serif-kr font-bold text-sm">
                            산하 포교위원 명단 및 활동 현황
                          </h3>
                        </div>
                        <span className="text-[10.5px] text-[#8C8071]">
                          산하 위원 {members.filter(m => m.parent_code === activeAgent.code || (activeAgent.code === '33065540' && (m.role === 'committee_member' || m.role === 'agent'))).length}명
                        </span>
                      </div>
                      <div className="divide-y divide-[#EAE2D3] max-h-60 overflow-y-auto pr-1">
                        {members
                          .filter(m => m.parent_code === activeAgent.code || (activeAgent.code === '33065540' && (m.role === 'committee_member' || m.role === 'agent')))
                          .map((m) => (
                            <div key={m.code} className="py-2.5 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-[#231F1C]">
                                  {m.name}
                                  {m.dharma_name && <span className="text-[#8A6510]"> ({m.dharma_name})</span>}
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-[#8A6510] ml-1.5 font-bold">
                                    {m.role === 'committee_member' ? '포교위원 (30%)' : '포교위원장 (40%)'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#8C8071] mt-0.5">
                                  연락처: {m.phone} · 추천코드: {m.code}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                                  오버라이딩 10% 대상
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </section>

                    {/* 지역 포교위원회 인연 조직도 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Network className="w-4 h-4 text-[#8A6510]" />
                          <h3 className="font-serif-kr font-bold text-sm">
                            지역 포교위원회 인연 조직망
                          </h3>
                        </div>
                        <span className="text-[10px] text-[#8C8071]">위원장 관할 조직</span>
                      </div>
                      <OrganizationTreeView members={members} rootCode={activeAgent.code} />
                    </section>

                    {/* 관할 지역 방문객 & 신도 사찰 일정 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Coffee className="w-4 h-4 text-[#8A6510]" />
                          <h4 className="font-serif-kr font-bold text-sm">관할 신도 도량 참배 & 공양 현황</h4>
                        </div>
                        <span className="text-[10.5px] text-[#8A6510] font-bold">
                          {visits.length}건 접수
                        </span>
                      </div>
                      <div className="space-y-2">
                        {visits.map((res) => (
                          <div key={res.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-[#231F1C]">
                                {res.visitor_name || res.believer_name || '불자'}님
                                <span className="text-[11px] text-[#8C8071] ml-1">({res.headcount || 1}명 방문)</span>
                              </div>
                              <div className="text-[11px] text-[#8A6510] mt-0.5">
                                📅 {res.visit_date} {res.visit_time || ''} · {res.tea_or_meal || '차담 및 사찰공양'}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                              {res.status === 'confirmed' ? '예약 확정' : '접수 완료'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 3단계: 🏛️ 3. 사찰전산 (소원사 사찰본부 & 창건주 회장님) */}
                {/* ======================================================== */}
                {isMasterOrTempleAdmin && (
                  <div id="sec-temple" className="space-y-4 pt-6 border-t-2 border-[#D5C59B]/40">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E6DEC8]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                        <h3 className="font-serif-kr text-base font-extrabold text-[#1B1815]">
                          🏛️ 3. 사찰전산 (소원사 사찰본부 & 창건주 회장님)
                        </h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#8A6510] font-bold border border-amber-300">
                        사찰본부 전용
                      </span>
                    </div>

                    {/* 상단 통합 안내 카드 */}
                    <section className="rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#2C241C] text-white p-4 sm:p-5 border border-[#C59B27]/50 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 font-bold">
                          소원사 사찰본부 & 창건주 회장님 관제
                        </span>
                        <Settings className="w-4 h-4 text-[#F5D061]" />
                      </div>
                      <h2 className="font-serif-kr text-base sm:text-lg font-bold">
                        제주 소원사 본부 관제 및 대웅전 축원
                      </h2>
                      <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed">
                        양영문 창건주·신도회장님과 사찰 본부 관리자가 대웅전 사시예불 축원, 공식 50% 불사금, 통합 회원 DB 및 도량 공양을 총괄합니다.
                      </p>
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-[#F5D061] flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-[#F5D061]" />
                        <span>
                          <strong>[사찰 본부 전용 관제]</strong> 일반 포교위원 및 포교위원장에게는 노출되지 않는 사찰 본부 화면입니다.
                        </span>
                      </div>
                    </section>

                    {/* 소원사 사찰 공식 50% 불사금 현황 카드 */}
                    <section className="bg-gradient-to-br from-[#FAF8F5] to-[#F2EDE2] rounded-2xl p-4 border border-[#D5C59B] shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#8A6510] text-white font-extrabold">
                          사찰 불사금 원천 보존
                        </span>
                        <span className="text-xs font-bold text-[#8A6510]">사찰 50% 귀속</span>
                      </div>
                      <h4 className="font-serif-kr text-sm font-bold text-[#231F1C]">
                        소원사 대웅전 불사 및 유지보수 기금 (실입금액의 50%)
                      </h4>
                      <p className="text-xs text-[#6B5E4C] leading-relaxed">
                        모든 불사금 접수액 중 50%는 사찰 통장에 원천 보존되어 대웅전 불사, 기도 정진 및 도량 관리에 안전하게 적립됩니다. (예: 위패 1기 200만 원 접수 시 100만 원 즉시 사찰 불사금 배분)
                      </p>
                    </section>

                    {/* 오늘의 대웅전 사시예불 축원 명부 인쇄 바로가기 카드 */}
                    <section className="bg-gradient-to-r from-[#241E17] via-[#2F2417] to-[#1C160F] text-white rounded-2xl p-4 border-2 border-[#D4AF37] shadow-lg flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1B1815] font-extrabold">
                          대웅전 불단 축원용
                        </span>
                        <h4 className="font-serif-kr text-sm font-bold mt-1 text-[#F5D061]">
                          사시예불 축원 명부 ({activeSasiPrayers.length}위)
                        </h4>
                        <p className="text-[10.5px] text-[#D6CEC2]">매일 10:00 사시예불 실시간 연동</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSasiPrintModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Printer className="w-4 h-4" />
                        <span>A4 인쇄</span>
                      </button>
                    </section>

                    {/* 사찰 본부 축원 명부 미리보기 리스트 */}
                    <div className="bg-white rounded-2xl p-4 border border-[#E6DEC8] shadow-sm space-y-2">
                      <h4 className="font-serif-kr text-sm font-bold text-[#1B1815] mb-2">
                        당일 사시예불 축원 대상 불자 명단 (7일 유효 신도)
                      </h4>
                      <div className="divide-y divide-[#EAE2D3] max-h-56 overflow-y-auto pr-1">
                        {activeSasiPrayers.map((p, idx) => (
                          <div key={p.id || idx} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-[#231F1C]">
                                #{idx + 1} {p.believer_name}
                                {p.dharma_name && <span className="text-[#8A6510]"> ({p.dharma_name})</span>}
                              </div>
                              <div className="text-[11px] text-[#8C8071]">
                                발원: {p.wish_type} · 접수: {p.created_at}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10.5px] font-bold border border-emerald-200 shrink-0">
                              정진 진행중
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 통합 회원 & 포교위원회 DB 관리 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif-kr font-bold text-sm">
                          통합 회원 & 포교위원회 DB 관리 ({members.length}명)
                        </h3>
                        <span className="text-[11px] text-[#9A7418] font-bold">
                          포교위원 {agents.length}명 · 신도 {members.length - agents.length}명
                        </span>
                      </div>

                      <form
                        onSubmit={handleAdminAddMember}
                        className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2 text-xs"
                      >
                        <div className="font-bold text-[#231F1C] flex items-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5 text-[#9A7418]" />
                          <span>신규 포교위원 / 신도 빠른 등록 (초기비번: 0000)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={adminNewName}
                            onChange={(e) => setAdminNewName(e.target.value)}
                            placeholder="성함 (예: 홍길동)"
                            required
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs"
                          />
                          <input
                            type="tel"
                            value={adminNewPhone}
                            onChange={(e) => setAdminNewPhone(e.target.value)}
                            placeholder="휴대폰 (010-0000-0000)"
                            required
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={adminNewRole}
                            onChange={(e) => setAdminNewRole(e.target.value)}
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs font-semibold"
                          >
                            <option value="believer">일반신도</option>
                            <option value="committee_member">포교위원 (60만)</option>
                            <option value="agent">포교위원장 (80만)</option>
                          </select>
                          <input
                            type="text"
                            value={adminNewParent}
                            onChange={(e) => setAdminNewParent(e.target.value)}
                            placeholder="추천인 코드 (선택)"
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-[#231F1C] text-[#F5D061] font-bold text-xs hover:bg-[#302A25] transition"
                        >
                          회원 등록 완료
                        </button>
                      </form>

                      {/* 회원 등급 관리 목록 */}
                      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#EAE2D3]">
                        {members.slice(0, 15).map((m) => (
                          <div key={m.code} className="pt-1.5 flex items-center justify-between text-xs gap-2">
                            <div className="min-w-0">
                              <span className="font-bold text-[#1B1815]">{m.name}</span>
                              {m.dharma_name && <span className="text-[#8C8071] text-[11px]"> ({m.dharma_name})</span>}
                              <span className="text-[10px] text-[#A69B8D] block">{m.phone}</span>
                            </div>
                            <select
                              value={m.role}
                              onChange={(e) => {
                                const nextRole = e.target.value
                                setMembers((prev) =>
                                  prev.map((item) =>
                                    item.code === m.code ? { ...item, role: nextRole } : item
                                  )
                                )
                                showToast(`${m.name}님의 회원 등급이 변경되었습니다.`)
                              }}
                              className="px-2 py-1 rounded-lg bg-white border border-[#D5C59B] text-[11px] font-bold text-[#231F1C] shrink-0"
                            >
                              <option value="believer">일반신도</option>
                              <option value="committee_member">포교위원 (60만)</option>
                              <option value="agent">포교위원장 (80만)</option>
                              <option value="temple_admin">창건주·신도회장 본부</option>
                              <option value="master">총괄 포교위원장 (제주AI파트너)</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 사찰 본부 차담 & 식사 공양 총괄 준비 명부 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Coffee className="w-4 h-4 text-[#8A6510]" />
                          <h4 className="font-serif-kr font-bold text-sm">사찰 본부 차담 & 식사 공양 총괄 명부</h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#8A6510] font-bold">
                          총 {visits.length}건
                        </span>
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {visits.map((res) => (
                          <div key={res.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-[#231F1C]">
                                {res.visitor_name || res.believer_name || '불자'}님
                                <span className="text-[11px] text-[#8C8071] ml-1">({res.headcount || 1}명 방문)</span>
                              </div>
                              <div className="text-[11px] text-[#8A6510] mt-0.5">
                                📅 {res.visit_date} {res.visit_time || ''} · {res.tea_or_meal || '차담 및 사찰공양'}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                              {res.status === 'confirmed' ? '예약 확정' : '접수 완료'}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] text-[11px] text-[#6B5E4C]">
                        ※ 공양주 보살님 및 원주실에서 당일 방문 신도 공양 준비를 위해 실시간 확인하는 명부입니다.
                      </div>
                    </section>
                  </div>
                )}

                {/* ======================================================== */}
                {/* 4단계: 👑 4. 총괄(김철수) 전산 [극비 최고관제] */}
                {/* ======================================================== */}
                {isMaster && (
                  <div id="sec-master" className="space-y-4 pt-6 border-t-2 border-[#D4AF37]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#D4AF37]/50">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F5D061] shadow-[0_0_8px_#F5D061]"></span>
                        <h3 className="font-serif-kr text-base font-extrabold text-[#1B1815]">
                          👑 4. 총괄(김철수) 전산 [최고관제]
                        </h3>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1B1815] text-[#F5D061] font-black border border-[#F5D061]">
                        김철수 대표님 전용 [극비]
                      </span>
                    </div>

                    {/* 상단 극비 안내 카드 */}
                    <section className="rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#2B2015] text-white p-4 sm:p-5 border-2 border-[#D4AF37] shadow-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#D4AF37] text-[#1B1815] font-black">
                          👑 최고 마스터 단독 관제 [극비]
                        </span>
                        <ShieldCheck className="w-5 h-5 text-[#F5D061]" />
                      </div>
                      <h2 className="font-serif-kr text-base sm:text-lg font-bold text-[#F5D061]">
                        제주AI파트너 총판 50% 사업권 & 총괄 정산 제어
                      </h2>
                      <p className="text-xs text-[#D6CEC2] leading-relaxed">
                        전국 50% 총판 사업권 및 총괄 10%(20만 원) 극비 마진, 전국 위원회 전체 통제 화면입니다. 사찰 본부 및 타 임직원에게 비공개됩니다.
                      </p>
                    </section>

                    {/* 실입금액 기준 100% 완전 분배 체계 요율표 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif-kr font-bold text-sm">
                          전국 100% 수익 배분 체계 (위패 1기 200만 원 기준)
                        </h3>
                        <span className="text-[10px] text-[#8C8071]">정산 자동화</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#1F1B17] to-[#2B231A] text-white border border-[#C59B27]/40 space-y-1">
                          <span className="text-[10.5px] text-[#F5D061] font-bold">1. 사찰 본부 & 대웅전 불사금 (50% / 100만 원)</span>
                          <p className="text-[10.5px] text-[#C5BBAE]">
                            입금액의 50%는 사찰 대웅전 불사금 및 사찰 기본 기금으로 원천 적립됩니다.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5D399] space-y-1">
                          <span className="text-[10.5px] text-[#8A6510] font-bold">2. 포교위원장 직추천 (40% / 80만 원)</span>
                          <p className="text-[10.5px] text-[#6E6354]">
                            포교위원장이 직접 신도를 인연 맺을 시 40%가 포교비로 정산됩니다.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5D399] space-y-1">
                          <span className="text-[10.5px] text-[#8A6510] font-bold">3. 포교위원 직추천 (30% / 60만 원)</span>
                          <p className="text-[10.5px] text-[#6E6354]">
                            포교위원 30%(60만) + 직속 포교위원장 10%(20만) 오버라이딩 마진이 배분됩니다.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                          <span className="text-[10.5px] text-[#8A6510] font-bold">4. 김철수 총괄대표 마진 (10%~20% / 20만~40만 원)</span>
                          <p className="text-[10.5px] text-[#6E6354]">
                            포교위원 추천 시 총괄 10%(20만 원) 극비 마진이 귀속되며, 총판 관리비로 정산됩니다.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* 신규 불사 접수 & 실시간 정산 시뮬레이터 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-[#8A6510]" />
                          <h3 className="font-serif-kr font-bold text-sm">
                            신규 불사 접수 & 실시간 자동 정산 실행
                          </h3>
                        </div>
                      </div>
                      <form onSubmit={handleAddSettlement} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={simBelieverName}
                            onChange={(e) => setSimBelieverName(e.target.value)}
                            placeholder="신도 성함 (예: 최선자)"
                            required
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs"
                          />
                          <select
                            value={simItemType}
                            onChange={(e) => {
                              const val = e.target.value
                              setSimItemType(val)
                              if (val.includes('2기')) setSimAmount(4000000)
                              else if (val.includes('단청')) setSimAmount(1000000)
                              else if (val.includes('기와')) setSimAmount(100000)
                              else setSimAmount(2000000)
                            }}
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs font-semibold"
                          >
                            <option value="생전예수재 황금위패 (1기)">생전예수재 황금위패 1기 (200만)</option>
                            <option value="조상 영가 흑색 영구위패 (1기)">흑색 영구위패 1기 (200만)</option>
                            <option value="조상 영가 부부 영구위패 (2기)">부부 영구위패 2기 (400만)</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={simAmount}
                            onChange={(e) => setSimAmount(Number(e.target.value))}
                            placeholder="입금액(원)"
                            required
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs font-bold text-[#8A6510]"
                          />
                          <select
                            value={simAgentCode}
                            onChange={(e) => setSimAgentCode(e.target.value)}
                            className="p-2 rounded-lg border border-[#D5C59B] bg-white text-xs font-semibold"
                          >
                            {agents.map((a) => (
                              <option key={a.code} value={a.code}>
                                {a.name} ({a.role === 'committee_member' ? '위원 60만' : a.role === 'master' ? '김철수 총괄' : '위원장 80만'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8A6510] text-[#15120F] font-extrabold text-xs shadow hover:brightness-105 transition"
                        >
                          ⚡ 실시간 자동 정산 실행
                        </button>
                      </form>
                    </section>

                    {/* 최근 위패 봉안 정산 원장 리스트 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif-kr font-bold text-sm">
                          최근 위패 봉안 정산 원장 ({settlements.length}건)
                        </h3>
                        <span className="text-[10px] text-[#8C8071]">실시간 분배 내역</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {settlements.slice(0, 10).map((s) => (
                          <div key={s.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#231F1C]">
                                {s.believer_name} 신도님 · {s.item_name}
                              </span>
                              <span className="font-extrabold text-[#8A6510]">
                                {s.total_amount?.toLocaleString()}원
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#8C8071] pt-1 border-t border-[#EAE2D3]">
                              <span>사찰 50%: {(s.total_amount * 0.5)?.toLocaleString()}원</span>
                              <span>추천인: {s.agent_1st_name || '소원사 본부'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 전국 소원사 포교위원회 계층 인연 조직도 전체 트리 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Network className="w-4 h-4 text-[#8A6510]" />
                          <h3 className="font-serif-kr font-bold text-sm">
                            전국 소원사 포교위원회 전체 마스터 조직도
                          </h3>
                        </div>
                        <span className="text-[10px] text-[#8C8071]">전국 전체 트리</span>
                      </div>
                      <OrganizationTreeView members={members} rootCode={null} />
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 오늘의 대웅전 사시예불 축원 발원 명부 A4 인쇄 모달 ==================== */}
        {showSasiPrintModal && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white text-[#111111] rounded-2xl shadow-2xl flex flex-col my-auto border border-[#E5D399] overflow-hidden">
              {/* 모달 상단 조작 바 (인쇄 시 숨김: no-print) */}
              <div className="no-print bg-[#1B1815] text-[#FAF8F5] p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b-2 border-[#D4AF37]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1B1815] flex items-center justify-center font-bold text-sm shrink-0">
                    卍
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] truncate">
                      오늘의 대웅전 사시예불 축원 명부 (7일 유효 신도 전용)
                    </h3>
                    <p className="text-[11px] text-[#D6CEC2] truncate">
                      접수 7일 이내 정진 불자만 자동 추출됨 (총 {activeSasiPrayers.length}위)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center gap-1.5 shadow hover:brightness-105 active:scale-95 transition whitespace-nowrap"
                  >
                    <Printer className="w-4 h-4" />
                    <span>A4 인쇄하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSasiPrintModal(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition"
                    title="닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 실제 A4 인쇄 영역 (#printable-sasi-sheet) */}
              <div id="printable-sasi-sheet" className="p-6 sm:p-8 space-y-4 bg-white text-[#111111]">
                {/* 전통 사찰 헤더 */}
                <div className="text-center border-b-2 border-[#222222] pb-3.5">
                  <div className="text-xs text-[#555555] tracking-widest mb-1 font-serif-kr">
                    卍 濟州 願成寺 大雄殿 · 소원성취 기도도량 제주 소원사
                  </div>
                  <h1 className="font-serif-kr text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
                    제주 소원사 대웅전 사시예불(巳時禮佛) 축원 명부
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#444444] mt-2 flex-wrap">
                    <span>
                      축원 일시: {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일 오전 10:00 사시예불
                    </span>
                    <span>·</span>
                    <span>
                      당일 축원 대상: <strong>{activeSasiPrayers.length}위</strong> (7일 정진 진행 불자)
                    </span>
                  </div>
                </div>

                {/* 안내 문구 */}
                <div className="text-xs text-[#444444] bg-[#F9F7F2] p-2.5 rounded-lg border border-[#E8E2D2] flex justify-between items-center text-[11px]">
                  <span>
                    ※ 본 명부는 <strong>접수일로부터 7일 이내</strong> 정진 신도만을 자동 추출한 대웅전 불단 축원 전용 명부입니다. (7일 만료 신도 자동 제외)
                  </span>
                  <span className="font-bold text-[#111111] shrink-0 ml-2">대웅전 불단 봉안용</span>
                </div>

                {/* 축원 대상자 테이블 */}
                {activeSasiPrayers.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#777777] font-serif-kr border border-dashed border-[#CCCCCC] rounded-xl">
                    현재 7일 이내 진행 중인 소원등 접수 내역이 없습니다.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-[#333333] text-xs">
                      <thead>
                        <tr className="bg-[#F0EDE4] text-[#111111] font-bold text-center border-b border-[#333333]">
                          <th className="p-2 border-r border-[#333333] w-12 text-center">연번</th>
                          <th className="p-2 border-r border-[#333333] w-36">신청자 / 축원대상</th>
                          <th className="p-2 border-r border-[#333333] w-28 text-center">기원 분야</th>
                          <th className="p-2 border-r border-[#333333]">부처님 전 지극지성 발원문</th>
                          <th className="p-2 border-r border-[#333333] w-20 text-center">정진 기간</th>
                          <th className="p-2 w-24 text-center">접수일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSasiPrayers.map((p, idx) => (
                          <tr key={p.id} className="border-b border-[#DDDDDD] hover:bg-[#FAF8F4]">
                            <td className="p-2.5 text-center font-bold border-r border-[#DDDDDD] text-[#555555]">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 font-bold font-serif-kr border-r border-[#DDDDDD] text-sm text-[#111111]">
                              {p.believer_name}
                            </td>
                            <td className="p-2.5 font-semibold text-center border-r border-[#DDDDDD] text-[#8A6510]">
                              [{p.wish_category}]
                            </td>
                            <td className="p-2.5 text-[#222222] leading-snug border-r border-[#DDDDDD] break-keep">
                              “{p.wish_text}”
                            </td>
                            <td className="p-2.5 text-center font-bold border-r border-[#DDDDDD] text-[#B8860B]">
                              D-{p.daysLeft}
                            </td>
                            <td className="p-2.5 text-center text-[11px] text-[#666666] whitespace-nowrap">
                              {formatPrayerDate(p.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 대웅전 불공 회향 발원문 */}
                <div className="pt-3 border-t border-[#333333] text-center space-y-1">
                  <p className="font-serif-kr text-xs font-bold text-[#111111]">
                    “앙고시방삼보 대자대비 부처님 가피로 위 축원 불자님들의 간절한 소원이 원만 성취되기를 지심귀명례 축원하나이다.”
                  </p>
                  <p className="text-[11px] text-[#666666] font-serif-kr tracking-widest">
                    나무아미타불 · 나무아미타불 · 나무시아본사 석가모니불
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 통합 공식 푸터 (사찰 안내 & 제주AI파트너 디지털 전산 파트너십) */}
        <footer className="px-4 pt-6 pb-24 text-center text-[11px] text-[#786E63] border-t border-[#E6DEC8] space-y-3.5">
          {/* 사찰 및 종무소 정보 (통합 단일화) */}
          <div className="space-y-1 leading-relaxed break-keep">
            <div className="font-bold text-[#231F1C] text-xs">
              제주 소원사 · 모바일 법당 <span className="text-[#9A7418] font-normal">(소원성취 기도도량)</span>
            </div>
            <p>제주특별자치도 제주시 죽성서길 75 (오등동 935)</p>
            <div className="flex items-center justify-center gap-2.5 text-[10.5px] text-[#5C5349] pt-0.5">
              <span>종무소 064-805-2007</span>
              <span>·</span>
              <span>신행/차담예약 010-5557-0267</span>
            </div>
          </div>

          {/* 제주AI파트너 공식 디지털 전산 파트너십 크레딧 박스 */}
          <div className="max-w-sm mx-auto p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D8C3] text-center space-y-1 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[#231F1C]">
              <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>시스템 개발 및 디지털 전산 총괄</span>
            </div>
            <div className="font-serif-kr text-sm font-extrabold text-[#9A7418] tracking-wide">
              제주AI파트너
            </div>
            <p className="text-[10px] text-[#8C8275] leading-relaxed break-keep">
              사찰 · 공공 · 기업 맞춤형 모바일 웹 플랫폼 구축 및 AI 솔루션
            </p>
          </div>

          <p className="text-[10px] text-[#A69B8D] tracking-wider">
            © Jeju Sowonsa. Powered by Jeju AI Partner. All rights reserved.
          </p>
        </footer>

        {/* 하단 백그라운드 미니 플레이어 바 (화면 이동 시에도 끊김 없이 힐링 법음 재생 유지) */}
        {isHealingPlaying && (
          <div className="fixed bottom-[58px] left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 px-3 pb-1 animate-in slide-in-from-bottom-2 duration-300">
            <div className="p-2.5 rounded-2xl bg-[#1F1914]/95 backdrop-blur-md border border-[#F5D061]/50 shadow-2xl flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-[#F5D061] text-[#1B1815] flex items-center justify-center shrink-0 shadow">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-black text-white truncate flex items-center gap-1.5">
                    <span>{HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.icon}</span>
                    <span className="truncate">{HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.title}</span>
                  </div>
                  <div className="text-[9.5px] text-[#F5D061] font-semibold truncate">
                    {sleepTimerSecondsLeft > 0
                      ? `🌙 ${Math.floor(sleepTimerSecondsLeft / 60)}분 ${sleepTimerSecondsLeft % 60}초 뒤 꺼짐`
                      : '화면 꺼짐 모드 지원 · 24시간 스트리밍'}
                  </div>
                </div>
              </div>

              <div className="flex items-center shrink-0 ml-1">
                <button
                  type="button"
                  onClick={() => handleToggleHealingPlay()}
                  className="w-8 h-8 rounded-full bg-[#F5D061] text-[#1B1815] flex items-center justify-center shadow hover:scale-105 active:scale-95 transition"
                  title="일시 정지 / 재생"
                >
                  <Pause className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 24시간 힐링 법음관 전체 화면 모달창 */}
        {showFullAudioModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-gradient-to-b from-[#2B231B] via-[#1B1611] to-[#120F0C] text-white rounded-t-3xl sm:rounded-3xl p-5 border border-[#C59B27]/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              {/* 헤더 */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Moon className="w-5 h-5 text-[#F5D061]" />
                  <span className="font-serif-kr font-bold text-base text-[#F5D061]">
                    제주 소원사 24시간 법음(法音)관
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullAudioModal(false)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#D6CEC2] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* LP/앨범 회전 감성 아트 */}
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className={`w-36 h-36 rounded-full bg-gradient-to-tr from-[#3D2F20] via-[#F5D061] to-[#785418] p-1 shadow-2xl ${isHealingPlaying ? 'animate-spin [animation-duration:18s]' : ''}`}>
                  <div className="w-full h-full rounded-full bg-[#1A1510] flex flex-col items-center justify-center p-3 border-4 border-[#2E241A]">
                    <span className="text-4xl mb-1">
                      {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.icon}
                    </span>
                    <span className="text-[10px] text-[#F5D061] font-bold">JEJU SOWONSA</span>
                  </div>
                </div>

                <h4 className="font-serif-kr text-lg font-bold text-white mt-4">
                  {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.title}
                </h4>
                <p className="text-xs text-[#D6CEC2] mt-0.5">
                  {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.subtitle}
                </p>
                <p className="text-[11px] text-[#9E9488] max-w-xs mt-2 px-2 break-keep">
                  {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.description}
                </p>

                {/* 트랙별 감성 보증 배지 */}
                <div className="flex justify-center mt-3">
                  {healingAudioTrack === 'prajna_chanting' || healingAudioTrack === 'sleep_meditation' || healingAudioTrack === 'dhammapada_wisdom' ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F5D061]/20 text-[#FFE58A] border border-[#F5D061]/40 flex items-center gap-1.5 shadow-sm">
                      <span>📿</span>
                      <span>영인스님 실제 독경 육성 &amp; 대웅전 목탁 원음</span>
                    </span>
                  ) : healingAudioTrack === 'rhythmic_moktak' ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F5D061]/20 text-[#FFE58A] border border-[#F5D061]/40 flex items-center gap-1.5 shadow-sm">
                      <span>🪷</span>
                      <span>천년고찰 대웅전 실물 박달나무 목탁 원음 (108배·사경)</span>
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-[#E8DFD1] border border-white/20 flex items-center gap-1.5 shadow-sm">
                      <span>🍃</span>
                      <span>사찰 은방울 풍경소리 &amp; 맑은 자연 앰비언스 ASMR</span>
                    </span>
                  )}
                </div>
              </div>

              {/* 트랙 퀵 변경 가로 스크롤 */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                {HEALING_AUDIO_TRACKS.map((t) => {
                  const isCur = healingAudioTrack === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToggleHealingPlay(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition shrink-0 flex items-center gap-1.5 ${
                        isCur
                          ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                          : 'bg-white/5 text-[#C2B8AB] border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.title.split(' ')[0]}</span>
                    </button>
                  )
                })}
              </div>

              {/* 메인 컨트롤러 */}
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => {
                    const idx = HEALING_AUDIO_TRACKS.findIndex((t) => t.id === healingAudioTrack)
                    const prevIdx = (idx - 1 + HEALING_AUDIO_TRACKS.length) % HEALING_AUDIO_TRACKS.length
                    handleToggleHealingPlay(HEALING_AUDIO_TRACKS[prevIdx].id)
                  }}
                  className="p-3 text-[#D6CEC2] hover:text-white active:scale-95 transition"
                  title="이전 곡"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleHealingPlay()}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#F5D061] to-[#D4AF37] text-[#1B1815] flex items-center justify-center shadow-[0_0_25px_rgba(245,208,97,0.5)] active:scale-95 transition"
                  title="재생 / 일시정지"
                >
                  {isHealingPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current ml-1" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const idx = HEALING_AUDIO_TRACKS.findIndex((t) => t.id === healingAudioTrack)
                    const nextIdx = (idx + 1) % HEALING_AUDIO_TRACKS.length
                    handleToggleHealingPlay(HEALING_AUDIO_TRACKS[nextIdx].id)
                  }}
                  className="p-3 text-[#D6CEC2] hover:text-white active:scale-95 transition"
                  title="다음 곡"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* 수면 타이머 설정 패널 */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#E8DFD1]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#F5D061]" />
                    <span>취침 수면 타이머</span>
                  </span>
                  <span className="text-[#F5D061] text-[11px]">
                    {sleepTimerSecondsLeft > 0
                      ? `${Math.floor(sleepTimerSecondsLeft / 60)}분 ${sleepTimerSecondsLeft % 60}초 남음`
                      : '연속 재생 중'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { m: 15, label: '15분' },
                    { m: 30, label: '30분' },
                    { m: 60, label: '1시간' },
                    { m: null, label: '연속' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSetSleepTimer(item.m)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        (item.m === null && !sleepTimerMinutes) || sleepTimerMinutes === item.m
                          ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                          : 'bg-white/5 text-[#D6CEC2] border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 스튜디오 마스터 음원 출처 및 안심 보증 안내 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#4ADE80] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>영인스님 독경 &amp; 대웅전 실물 목탁 · BBS 불교방송 마스터링본</span>
                </div>
                <p className="text-[10px] text-[#A89880] leading-tight">
                  {HEALING_AUDIO_TRACKS.find((t) => t.id === healingAudioTrack)?.attribution}
                </p>
              </div>

              {/* 안내 문구 */}
              <p className="text-[11px] text-[#8C8275] text-center leading-relaxed">
                ※ 스마트폰 화면을 끄거나 다른 앱을 보셔도 끊김 없이 편안하게 재생됩니다.
              </p>
            </div>
          </div>
        )}

        {/* 하단 네비게이션 바 (신행홈·소원등켜기·한줄사경·불사안내·내정보 5대 신행 메뉴 고정) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1B1815]/95 backdrop-blur-md border-t border-[#C59B27]/35 px-2 py-2 flex items-center justify-around">
          {[
            { id: 'home', label: '신행홈', icon: Heart },
            { id: 'lantern', label: '소원등켜기', icon: Flame },
            { id: 'sutra', label: '한줄사경', icon: BookOpen },
            { id: 'bulsa', label: '불사안내', icon: Award },
            { id: 'profile', label: '내정보', icon: User },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive =
              activeTab === tab.id ||
              (tab.id === 'profile' && (activeTab === 'agent' || activeTab === 'admin'))
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition ${
                  isActive ? 'text-[#F5D061]' : 'text-[#9E9488] hover:text-[#D6CEC2]'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                <span className="text-[10.5px] sm:text-[11px] font-semibold mt-1 tracking-tight text-center truncate w-full">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

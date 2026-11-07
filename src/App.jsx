import React, { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  Download,
  Bell,
  Megaphone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Coffee,
  ExternalLink,
  UserCheck,
  TrendingUp,
  PlusCircle,
  Plus,
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
  Check,
  FileText,
  MessageSquare,
  Edit3,
  Trash2,
  Upload,
  CreditCard,
  MapPin,
  Eye,
  EyeOff,
} from 'lucide-react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import BusinessCardModal from './components/BusinessCardModal'
import MobileCardTab from './components/Tabs/MobileCardTab'
import LanternTab from './components/Tabs/LanternTab'
import BulsaTab from './components/Tabs/BulsaTab'
import SutraTab from './components/Tabs/SutraTab'
import AgentTab from './components/Tabs/AgentTab'
import HomeTab from './components/Tabs/HomeTab'
import SowonsaSanctuaryModal from './components/Meditate/SowonsaSanctuaryModal'
import ProfileTab from './components/Tabs/ProfileTab'
import { awardMerit, MERIT_RULES, getDailyMeritInfo } from './lib/meritSystem'
import {
  notifyPrayerSubmission,
  notifyPrayerCancellation,
  notifyVisitReservation,
} from './lib/smsNotifier'
import AdminERPView from './components/Admin/AdminERPView'
import MemberDetailModal from './components/Admin/MemberDetailModal'
import {
  SettlementModal,
  SettlementEditModal,
  SettlementConfirmModal,
} from './components/Admin/SettlementModals'
import {
  IndividualRecordPrintModal,
  IndeungNameplatePrintModal,
  SasiPrayerPrintModal,
  MemberDirectoryPrintModal,
} from './components/PrintModals'

import {
  DEFAULT_TEMPLE_ID,
  INITIAL_MEMBERS,
  INITIAL_PRAYERS,
  INITIAL_SETTLEMENTS,
  INITIAL_VISITS,
  extractPhone8Code,
  formatPhone11,
  parseNameAndDharmaName,
  computeZodiacAndGanji,
  supabase,
} from './lib/supabase'

// 신행홈 상단 히어로 3종 경량 캐러셀 슬라이드 (외부 라이브러리 없이 CSS 페이드 전환으로 0KB 초경량 구동)
const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: '/images/sowonsa_hallasan_sunrise_aerial.jpg',
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
    image: '/images/sowonsa_daewoongjeon_altar_v2.jpg',
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

// 도량 공식 공지사항 (초기 3선: 초하루 법회, 삼성각 소원기와불사, 도량 참배/차담 안내)
const INITIAL_NOTICES = [
  {
    id: 'notice-1',
    category: '법회',
    badge: '특별법회',
    title: '11월 초하루 맞이 대웅전 특별 축원 법회 안내',
    date: '2026.11.01',
    summary: '매월 음력 초하루 대웅전 삼존불 전에서 신도님들의 가내 평안과 소원성취를 위한 특별 축원 법회를 봉행합니다.',
    content: `나무아미타불 관세음보살.\n\n제주 소원사에서는 매월 음력 초하루를 맞이하여 대웅전 삼존불 전에 향과 등과 꽃을 올리고, 전국에서 모바일 법당을 통해 정성껏 소원등을 밝혀주신 불자님들과 가족분들의 무사안녕과 만사형통을 지극한 마음으로 축원 올립니다.\n\n■ 일시: 매월 음력 초하루 오전 10시 (사시예불)\n■ 장소: 제주 소원사 대웅전 (유튜브 실시간 방송 및 모바일 법당 동시 진행)\n■ 동참 대상: 소원사 신도 및 전국 모바일 법당 소원등 동참 불자님 전원\n\n거리가 멀어 제주 도량에 직접 걸음하지 못하시더라도, 모바일 법당에 올리신 한 줄 발원문과 소원등이 부처님 전 축원 명부에 소중히 봉안되어 스님의 육성으로 낭독됩니다.\n\n불자님들의 가정에 부처님의 자비광명과 무량복덕이 늘 가득하시기를 지심으로 축원합니다.`,
    targetTab: 'lantern',
    ctaLabel: '대웅전 소원등 켜고 축원 올리기 ▶',
    isPinned: true,
  },
  {
    id: 'notice-2',
    category: '불사',
    badge: '대작불사',
    title: '삼성각 성전 건립 소원 기와 및 단청 불사 동참 소식',
    date: '2026.10.25',
    summary: '칠성·산신·독성 세 분 성인을 모시는 삼성각 건립 불사가 순조롭게 진행되고 있습니다. 자손만대 복전이 될 기와 불사에 동참해 보세요.',
    content: `자손만대 복밭을 일구는 삼성각(三聖閣) 건립 불사 동참을 안내해 드립니다.\n\n사찰에서 가장 영험한 기도처로 꼽히는 삼성각은 ① 무병장수와 자손번창의 칠성여래님, ② 가업번창과 도량 수호의 산신님, ③ 말세 중생의 소원을 가장 빠르게 들어주시는 나반존자(독성)님을 모시는 성스러운 전각입니다.\n\n■ 동참 분야:\n  - 가족 소원 기와 불사: 기와 한 장에 온 가족 이름과 간절한 발원을 새겨 지붕에 영구히 얹어 올립니다.\n  - 기둥 및 단청 불사: 삼재팔난을 소멸하고 가문의 복덕을 지키는 대작불사입니다.\n  - 영구 축원 명패 봉안: 삼성각 내에 가문의 복덕을 영구히 기리는 명패를 봉안합니다.\n\n기와 한 장, 기둥 하나에 깃든 정성이 불자님의 가정에 큰 가피로 돌아올 것입니다.`,
    targetTab: 'bulsa',
    ctaLabel: '삼성각 불사 상세 보기 ▶',
    isPinned: true,
  },
  {
    id: 'notice-3',
    category: '안내',
    badge: '도량참배',
    title: '제주 소원사 도량 참배 및 스님 차담·점심공양 사전 예약 안내',
    date: '2026.10.20',
    summary: '제주 여행이나 도량 참배로 방문하시는 불자님들께 따뜻한 차와 정성 어린 사찰 공양을 대접해 드립니다.',
    content: `제주 소원사를 찾아주시는 불자님들을 따뜻하게 맞이하고자 차담 및 사찰공양 사전 예약제를 운영합니다.\n\n한라산의 청정한 정기가 감도는 제주 소원사 도량에 걸음하시어, 고요한 법당에서 부처님께 삼배 올리시고 지친 일상을 쉬어가시기 바랍니다.\n\n■ 사전 예약 혜택:\n  - 주지스님과의 따뜻한 1:1 신행 차담 및 인생 상담\n  - 정갈하고 건강한 제주 소원사 사찰 점심공양(식사) 대접\n  - 도량 전각 및 위패·삼성각 건립지 친절 안내\n\n공양 준비와 스님 일정 조율을 위해 방문 하루 전 모바일 법당 또는 종무소(010-4912-1083)로 편안하게 예약해 주시기 바랍니다.`,
    targetTab: 'bulsa',
    ctaLabel: '사찰 참배 · 차담 예약하기 ▶',
    isPinned: false,
  },
]

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

  const isAllExpanded = expandedCodes.size >= Math.max(1, Math.floor(members.length / 3))

  const handleToggleAll = () => {
    if (isAllExpanded) {
      collapseAll()
    } else {
      expandAll()
    }
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
    // [옵션 A] 창건주·신도회장 본부(!m.parent_code)를 최상위 단일 뿌리로 모시고, 그 직속으로 김철수 총괄위원장 단독 배치
    const roots = members.filter((m) => !m.parent_code)
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
        <button
          type="button"
          onClick={handleToggleAll}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-semibold text-[#F5D061] transition whitespace-nowrap shrink-0 flex items-center gap-1 active:scale-95"
        >
          <span>{isAllExpanded ? '모두 접기 ▲' : '모두 펼치기 ▼'}</span>
        </button>
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
    source: '숫타니파타 (經集)',
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
  {
    verse: '과거의 일에 집착하지 말고 미래를 근심하지 마라. 오직 현재의 한 생각에 깨어 정진하라.',
    source: '바디에카랏타경 (단독자경)',
    commentary: '지나간 후회와 오지 않은 불안을 내려놓고 지금 이 순간 내 마음에 감사와 축복을 채워보세요.',
  },
  {
    verse: '무릇 형상 있는 것은 모두가 허망하니, 모든 형상이 형상 아님을 바로 볼 때 곧 여래를 보리라.',
    source: '금강경 (金剛經) 사구게',
    commentary: '눈앞의 일시적인 어려움에 매이지 않고 본래 밝고 맑은 나의 불성을 믿으시기 바랍니다.',
  },
  {
    verse: '그물에 걸리지 않는 바람처럼, 소리에 놀라지 않는 사자처럼, 흙탕물에 물들지 않는 연꽃처럼 무소의 뿔처럼 혼자서 가라.',
    source: '숫타니파타 (經集)',
    commentary: '타인의 시선이나 세상의 헛된 말에 흔들리지 않고 묵묵히 내 양심과 원력의 길을 걸어가세요.',
  },
  {
    verse: '자비로운 마음으로 중생을 대하면 그 복덕은 허공과 같아서 능히 측량할 수 없느니라.',
    source: '화엄경 (華嚴經) 보현행원품',
    commentary: '가족과 도반에게 먼저 건네는 따뜻한 배려가 천 개의 보시보다 더 큰 공덕이 됩니다.',
  },
  {
    verse: '건강은 최고의 이익이요, 만족은 최고의 재산이며, 신뢰는 최고의 친척이고, 열반은 최상의 행복이다.',
    source: '법구경 (法句經) 제15장 안락품',
    commentary: '가진 것에 감사하고 몸과 마음의 건강을 소중히 가꾸는 것이 행복의 지름길입니다.',
  },
  {
    verse: '어리석은 사람은 평생 지혜로운 이와 함께 살아도 진리를 알지 못하나니, 마치 숟가락이 국맛을 모르는 것과 같다.',
    source: '법구경 (法句經) 제5장 우암품',
    commentary: '좋은 가르침을 단순히 듣는 것에 그치지 않고, 오늘 내 행동 하나로 실천해 보세요.',
  },
  {
    verse: '모든 것은 인연을 따라 생겨나고 인연을 따라 사라진다. 인연의 도리를 아는 이는 근심과 두려움이 없다.',
    source: '아함경 (阿含經)',
    commentary: '지금 겪는 고난도 지나가는 하나의 인연일 뿐입니다. 지혜로운 마음으로 새 길을 열어가세요.',
  },
  {
    verse: '마음이 청정하면 그 사람이 가는 곳마다 복덕과 지혜의 꽃이 저절로 피어나느니라.',
    source: '유마경 (維摩經) 불국품',
    commentary: '내 마음이 맑아지면 내가 머무는 가정이 곧 청정한 정토 도량이 됩니다.',
  },
  {
    verse: '등불을 켜서 어둠을 밝히듯, 지혜의 빛으로 어리석음의 어둠을 밝혀라.',
    source: '열반경 (涅槃經)',
    commentary: '오늘 소원사 대웅전에 밝힌 소원등이 내 앞길을 비추는 지혜의 광명이 되어줄 것입니다.',
  },
  {
    verse: '남의 허물을 보지 말고 내가 행한 것과 행하지 않은 것을 스스로 살펴라.',
    source: '법구경 (法句經) 제4장 화품',
    commentary: '타인을 탓하기보다 내 마음을 차분히 들여다볼 때 모든 얽힌 실타래가 술술 풀립니다.',
  },
  {
    verse: '자신을 등불로 삼고 진리를 등불로 삼으라. 다른 어떤 것에도 의지하지 말고 스스로 정진하라.',
    source: '대반열반경 (大般涅槃經) 자등명 법등명',
    commentary: '내 안의 지혜와 부처님의 법을 등대 삼아 한 걸음 한 걸음 당당하게 나아가세요.',
  },
  {
    verse: '원한은 원한으로 갚으면 영원히 쉬지 않으나, 오직 너그러움과 자비로써만 원한을 쉬게 할 수 있다.',
    source: '법구경 (法句經) 제1장 쌍품',
    commentary: '미운 마음을 자비의 샘물로 씻어낼 때 내 영혼이 가장 먼저 해방되고 편안해집니다.',
  },
  {
    verse: '한 등불에서 수천 개의 등불을 켜도 그 등불의 수명은 줄지 않듯, 행복을 나눈다고 해서 내 행복이 줄어들지 않는다.',
    source: '사십이장경 (四十二章經)',
    commentary: '주변 사람들에게 축복과 격려를 아끼지 마세요. 나눈 기쁨은 열 배로 돌아옵니다.',
  },
  {
    verse: '산은 바람에 흔들리지 않듯, 지혜로운 사람은 칭찬과 비난에도 마음이 흔들리지 않는다.',
    source: '법구경 (法句經) 제6장 현품',
    commentary: '세상의 평가와 칭찬·비난에 일희일비하지 않고 흔들림 없는 태산처럼 평온을 지키세요.',
  },
  {
    verse: '보시를 행할 때 오른손이 하는 것을 왼손이 모르게 하듯, 베풀었다는 생각조차 없이 베풀어라.',
    source: '금강경 (金剛經) 무주상보시',
    commentary: '바라는 마음 없이 지은 순수한 공덕은 우주 허공을 채우는 가장 거룩한 복전이 됩니다.',
  },
  {
    verse: '온 세상에 자비로운 마음을 넓혀라. 위로 아래로 옆으로 아무런 장애도 원한도 적의도 없이.',
    source: '자경 (慈經, 메타 숫타)',
    commentary: '모든 생명을 사랑과 연민으로 품을 때 내 주변의 모든 악연이 선연으로 바뀝니다.',
  },
  {
    verse: '오늘 해야 할 일을 내일로 미루지 말라. 죽음이 언제 닥칠지 그 누구도 알 수 없느니라.',
    source: '발뎃카랏타경',
    commentary: '지금 이 순간 곁에 있는 가족을 안아주고 사랑한다고 말하는 것이 가장 지혜로운 삶입니다.',
  },
  {
    verse: '마음이 평온한 이에게는 어떠한 싸움도 일어나지 않으며, 모든 번뇌가 아침 안개처럼 사라지리라.',
    source: '우다나 (자설경)',
    commentary: '고요한 법음 속에 머물며 번뇌를 내려놓으세요. 마음의 평안이 곧 가정의 만복입니다.',
  },
  {
    verse: '자신을 이기는 자가 천 명의 적을 이긴 자보다 훨씬 위대한 영웅이다.',
    source: '법구경 (法句經) 제8장 천품',
    commentary: '순간의 분노와 게으름을 이겨내는 자제력이 내 인생을 성공과 번영으로 이끄는 열쇠입니다.',
  },
  {
    verse: '모든 중생이 고통에서 벗어나 안락하기를 발원하는 마음이 곧 부처의 마음이다.',
    source: '보살본행경 (菩薩本行經)',
    commentary: '남을 축원해 주는 기도가 결국 나 자신과 내 자손을 보호하는 가장 강력한 갑옷이 됩니다.',
  },
  {
    verse: '과거심도 얻을 수 없고 현재심도 얻을 수 없으며 미래심도 얻을 수 없다.',
    source: '금강경 (金剛經)',
    commentary: '머물러 있는 것은 아무것도 없으니, 집착을 비우고 텅 빈 마음으로 새 지혜를 채우세요.',
  },
  {
    verse: '어리석은 벗과 함께 길을 가느니 차라리 홀로 지혜롭게 걸어가는 것이 낫다.',
    source: '법구경 (法句經) 제23장 코끼리품',
    commentary: '나를 나태하고 탁하게 만드는 인연을 멀리하고, 정법과 맑은 도반을 가까이 하세요.',
  },
  {
    verse: '한 방울의 물이 모여 대해를 이루듯, 오늘 올린 간절한 기도가 내일의 큰 가피로 돌아온다.',
    source: '잡아함경 (雜阿含經)',
    commentary: '소원사 대웅전 사시예불 축원에 등재된 불자님의 서원은 반드시 원만성취될 것입니다.',
  },
  {
    verse: '지극한 정성은 쇠와 돌도 뚫나니, 일심으로 기도하는 자에게 어찌 부처님의 감응이 없겠는가.',
    source: '원각경 (圓覺經)',
    commentary: '온 가족의 무병장수와 가내 평안을 발원하시는 불자님의 정성에 제불보살님의 가피가 늘 충만합니다.',
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
        comment: '잠시 눈을 감고 범종 소리를 들으며 세 번만 깊게 숨을 내쉬어 보세요.',
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

// 실제 사찰 범종(에밀레종/대종) 고음질 사운드 재생 엔진
function playBeomjongSound() {
  try {
    const audio = new Audio('/audio/beomjong.wav')
    audio.volume = 0.95
    const playPromise = audio.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        playBeomjongAcousticSynth()
      })
    }
  } catch (e) {
    playBeomjongAcousticSynth()
  }
}

// 오프라인/오디오 파일 지연 시 한국 전통 대범종(에밀레종/신종)의 음향학적 맥놀이를 정밀 재현하는 물리 음향 합성기
function playBeomjongAcousticSynth() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // 1. 당목(나무 방망이) 타격 충격음 (저음 펀치 + 나무 타격 트랜지언트)
    const thumpOsc = ctx.createOscillator()
    const thumpGain = ctx.createGain()
    thumpOsc.type = 'sine'
    thumpOsc.frequency.setValueAtTime(210, now)
    thumpOsc.frequency.exponentialRampToValueAtTime(75, now + 0.08)
    thumpGain.gain.setValueAtTime(0.001, now)
    thumpGain.gain.linearRampToValueAtTime(0.65, now + 0.003)
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
    thumpOsc.connect(thumpGain)
    thumpGain.connect(ctx.destination)
    thumpOsc.start(now)
    thumpOsc.stop(now + 0.3)

    // 2. 당목-청동 접촉 노이즈 어택
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseBuffer.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.01))
    }
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(850, now)
    noiseFilter.Q.setValueAtTime(2.5, now)
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.3, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
    noiseSource.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    noiseSource.start(now)

    // 3. 한국 범종의 핵심: 기음 맥놀이 (118.0Hz & 119.35Hz 간섭 현상 -> 1.35Hz 파동)
    // 범종각의 명동(울림통) 바닥 공명 (59Hz 서브 베이스)
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(59.0, now)
    subGain.gain.setValueAtTime(0.001, now)
    subGain.gain.linearRampToValueAtTime(0.25, now + 0.02)
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0)
    subOsc.connect(subGain)
    subGain.connect(ctx.destination)
    subOsc.start(now)
    subOsc.stop(now + 6.1)

    // 주파수 및 배음 스펙트럼 (한국 청동 대범종 실측 데이터 기반)
    const partials = [
      { freq: 118.0, gain: 0.42, decay: 8.5 }, // 기음 A
      { freq: 119.35, gain: 0.40, decay: 8.5 }, // 기음 B (1.35Hz 맥놀이 생성)
      { freq: 236.2, gain: 0.28, decay: 7.0 },  // 2차 배음 A
      { freq: 238.1, gain: 0.26, decay: 7.0 },  // 2차 배음 B (맥놀이)
      { freq: 354.5, gain: 0.20, decay: 5.5 },  // 3차 배음
      { freq: 357.2, gain: 0.17, decay: 5.5 },
      { freq: 512.0, gain: 0.14, decay: 4.2 },  // 맑은 청동 광채음
      { freq: 674.0, gain: 0.10, decay: 3.5 },
      { freq: 885.0, gain: 0.07, decay: 2.8 },
      { freq: 1120.0, gain: 0.05, decay: 2.2 },
      { freq: 1450.0, gain: 0.03, decay: 1.6 }
    ]

    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      g.gain.setValueAtTime(0.001, now)
      g.gain.linearRampToValueAtTime(gain, now + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay)

      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + decay + 0.1)
    })
  } catch (e) {
    // 오디오 컨텍스트 제한 시 무시
  }
}

// 기존 싱잉볼 호출과의 하위 호환성을 위한 별칭
const playSingingBowlSound = playBeomjongSound

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
    id: 'sowonsa_prajna_meditation',
    category: '도량명상',
    icon: '🧘',
    title: '제주 소원사 반야심경 (대웅전 힐링 명상)',
    subtitle: '스님의 깊은 저음 범패 & 묵직한 목탁·법고 리듬 선율',
    description: '대웅전의 신비로운 울림 속에서 스님의 묵직한 범패 음성과 웅장한 타격 리듬이 잡념을 씻어내고 깊은 이완과 평안을 선사합니다.',
    type: 'meditation',
    audioUrl: '/audio/sowonsa_prajna_meditation.mp3',
    voiceText: null,
    attribution: '음원 출처: 제주 소원사 모바일 법당 힐링 명상 (마음 치유)',
  },
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
    id: 'lotus_destiny',
    category: '은혜찬불',
    icon: '🌸',
    title: '연꽃 인연 (제주 소원사 힐링 찬불가)',
    subtitle: '청아한 여성 보컬 & 대금·해금·피아노 선율 (3분 48초 완곡 회향)',
    description: '옷깃만 스쳐도 수많은 생의 인연이듯, 부처님의 자비 광명 아래 맺어진 소중한 법연(法緣)을 노래한 제주 소원사 명품 찬불가입니다.',
    type: 'song',
    audioUrl: '/audio/lotus_destiny.mp3',
    voiceText: null,
    attribution: '음원 출처: 제주 소원사 모바일 법당 정식 찬불가 (자비 법공양)',
  },
  {
    id: 'jeju_sowonsa',
    category: '도량찬가',
    icon: '🍊',
    title: '제주 소원사 (도량 공식 테마송)',
    subtitle: '따뜻한 어쿠스틱 발라드 & 첼로 선율의 소원사 도량 찬가',
    description: '한라산의 맑은 정기와 부처님의 자비가 깃든 제주 소원사 도량의 평화로움과 안식을 노래한 공식 테마 찬가입니다.',
    type: 'song',
    audioUrl: '/audio/jeju_sowonsa.mp3',
    voiceText: null,
    attribution: '음원 출처: 제주 소원사 모바일 법당 공식 테마송 (도량 법공양)',
  },
  {
    id: 'rhythmic_moktak',
    category: '마음정진',
    icon: '🪵',
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

// 📿 [실시간 음력 및 사찰 주요 재일 D-Day 자동 계산 엔진]
function getTodayLunarAndJaeil() {
  const now = new Date();
  
  // 기준점: 2026-10-31 = 음력 2026-09-22
  const baseSolar = new Date(2026, 9, 31).getTime();
  const baseLunarMonth = 9;
  const baseLunarDay = 22;
  const diffDays = Math.round((now.getTime() - baseSolar) / 86400000);

  let currentLunarDay = baseLunarDay + diffDays;
  let currentLunarMonth = baseLunarMonth;

  while (currentLunarDay > 30) {
    currentLunarDay -= 30;
    currentLunarMonth = (currentLunarMonth % 12) + 1;
  }
  while (currentLunarDay < 1) {
    currentLunarDay += 30;
    currentLunarMonth = currentLunarMonth === 1 ? 12 : currentLunarMonth - 1;
  }

  // 60갑자 일진 산출
  const GAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  const JI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];
  // 2026-10-31 = 정축(丁丑)일 (ganIdx: 3, jiIdx: 1)
  const baseGan = 3;
  const baseJi = 1;
  const ganIdx = ((baseGan + diffDays) % 10 + 10) % 10;
  const jiIdx = ((baseJi + diffDays) % 12 + 12) % 12;
  const iljinStr = `${GAN[ganIdx]}${JI[jiIdx]}일`;

  // 주요 5대 재일 (음력 기준)
  // 초하루(1일), 약사재일(8일), 보름/미타재일(15일), 지장재일(18일), 관음재일(24일)
  const JAEIL_LIST = [
    { day: 1, name: '초하루 인등·축원법회' },
    { day: 8, name: '약사여래재일' },
    { day: 15, name: '보름 미타재일' },
    { day: 18, name: '지장재일' },
    { day: 24, name: '관음재일' },
  ];

  let nextJaeil = null;
  let minDaysLeft = 999;

  for (const j of JAEIL_LIST) {
    let diff = j.day - currentLunarDay;
    if (diff < 0) diff += 30; // 다음 달 해당 재일
    if (diff < minDaysLeft) {
      minDaysLeft = diff;
      nextJaeil = j;
    }
  }

  const jaeilBadge =
    minDaysLeft === 0
      ? `📿 오늘: ${nextJaeil.name} 봉행`
      : `📿 ${nextJaeil.name}(${nextJaeil.day}일) D-${minDaysLeft}`;

  // 다가오는 주요 사찰 재일 D-Day 순 정렬
  const upcomingJaeils = JAEIL_LIST.map((j) => {
    let diff = j.day - currentLunarDay;
    if (diff < 0) diff += 30;
    return {
      ...j,
      daysLeft: diff,
      isToday: diff === 0,
      ddayText: diff === 0 ? '오늘 봉행' : `D-${diff}`,
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    lunarText: `음력 ${currentLunarMonth}월 ${currentLunarDay}일 (${iljinStr})`,
    jaeilBadge,
    upcomingJaeils,
  };
}

export default function App() {
  // 탭 상태: 'home' | 'lantern' | 'sutra' | 'bulsa' | 'agent' | 'admin' | 'profile' (URL ?tab= 파라미터 직접 진입 지원)
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get('tab')
      if (tabParam && ['home', 'lantern', 'sutra', 'bulsa', 'agent', 'admin', 'profile', 'card'].includes(tabParam)) {
        return tabParam
      }
    }
    return 'home'
  })
  const [heroSlideIdx, setHeroSlideIdx] = useState(0)
  // 🪪 [소원사 모바일 전자명함 시스템] 전용 상태
  const [showBusinessCardModal, setShowBusinessCardModal] = useState(false)
  const [businessCardTarget, setBusinessCardTarget] = useState(null)

  // 🏛️ [독립형 종무행정 ERP 모드]: URL이 /admin 또는 ?tab=admin 일 때 모바일 틀을 벗어나 PC 100% 와이드 단독 전산 화면으로 가동
  const [isStandaloneAdmin, setIsStandaloneAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname
      const s = window.location.search
      return p === '/admin' || p.startsWith('/admin') || s.includes('tab=admin')
    }
    return false
  })
  const [erpTab, setErpTab] = useState('desk') // 'desk' | 'seatmap' | 'search' | 'register' | 'excel' | 'settlement'

  // 소원사 통합 전산 모달 상태 ('common': 1.포교사 공통, 'head': 2.포교위원장, 'temple': 3.사찰본부, 'master': 4.최고관제)
  const [showUnifiedAdminModal, setShowUnifiedAdminModal] = useState(false)
  const [adminModalTab, setAdminModalTab] = useState('common')

  // 24시간 힐링 법음 & 수면 명상 오디오 플레이어 상태 (기본: 제주 소원사 반야심경 대웅전 힐링 명상)
  const [healingAudioTrack, setHealingAudioTrack] = useState('sowonsa_prajna_meditation')
  const [isHealingPlaying, setIsHealingPlaying] = useState(false)
  const [isHealingVoiceOn, setIsHealingVoiceOn] = useState(true) // 스님 음성 낭독 기본 켜짐
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false) // 홈 화면 대안1: 기본 슬림 바, 터치 시 펼침
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null) // null | 15 | 30 | 60
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState(0)
  const [showFullAudioModal, setShowFullAudioModal] = useState(false)

  // 108 목탁 멍 & 손안의 염주 정진 모달 상태
  const [show108MoktakModal, setShow108MoktakModal] = useState(false)
  const [moktak108Count, setMoktak108Count] = useState(0)
  const [isMoktakAnimating, setIsMoktakAnimating] = useState(false)
  const [moktakRipples, setMoktakRipples] = useState([])
  const [moktakFloatingTexts, setMoktakFloatingTexts] = useState([])
  const [is108Completed, setIs108Completed] = useState(false)
  const [isAutoMoktakOn, setIsAutoMoktakOn] = useState(false)

  // ✨ 나의 신행 복덕 보시금 세부 적립 내역 접기/펼치기 상태 (기본 접힘, 터치 시 한 줄씩 펼침)
  const [isRewardDetailOpen, setIsRewardDetailOpen] = useState(false)

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

// [소원사 공인 직책 및 계보 규격]
// - 양영문: 최상위 신도회장 (temple_admin, parent_code: null)
// - 포교위원장 4명: 김철수 (master), 유광수 (agent), 오다혜 (agent), 임평종 (agent)
// - 나머지 전원: 일반신도 (believer), 4대 포교위원장 산하로 균등/랜덤 배정
const CHAIRMEN_CODES = ['33065540', '53872248', '83855838', '35651669']

function normalizeMemberHierarchy(m) {
  if (!m) return m
  // 양영문: 최상위 신도회장
  if (m.code === '55570267' || m.name === '양영문' || m.role === 'temple_admin') {
    return { ...m, role: 'temple_admin', parent_code: null }
  }
  // 김철수: 전국 포교위원장 (총괄대표)
  if (m.code === '33065540' || m.name === '김철수' || m.role === 'master') {
    return { ...m, role: 'master', parent_code: '55570267' }
  }
  // 유광수: 포교위원장
  if (m.code === '53872248' || m.name === '유광수') {
    return { ...m, role: 'agent', parent_code: '33065540' }
  }
  // 오다혜: 포교위원장
  if (m.code === '83855838' || m.name === '오다혜') {
    return { ...m, role: 'agent', parent_code: '33065540' }
  }
  // 임평종: 포교위원장
  if (m.code === '35651669' || m.name === '임평종') {
    return { ...m, role: 'agent', parent_code: '33065540' }
  }

  // 나머지는 전부 일반신도 (4대 포교위원장 산하로 랜덤/균등 배정)
  let parentCode = m.parent_code
  if (!CHAIRMEN_CODES.includes(parentCode)) {
    const codeStr = String(m.code || m.name || '0')
    const charSum = codeStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    parentCode = CHAIRMEN_CODES[charSum % CHAIRMEN_CODES.length]
  }

  return { ...m, role: 'believer', parent_code: parentCode }
}

// 상대 시간 또는 일자 포맷터 (예: '오늘 17:19', '어제 14:30', '2026.10.30')
function formatRelativeOrDate(dateStr) {
  if (!dateStr) return '최근'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = d.toDateString() === yesterday.toDateString()

    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')

    if (isToday) return `오늘 ${hours}:${mins}`
    if (isYesterday) return `어제 ${hours}:${mins}`

    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}.${m}.${day}`
  } catch {
    return dateStr
  }
}

  // 전체 통합 회원 DB 상태 (신도 + 포교사 + 본부 + 관리자)
  const [members, setMembers] = useState(() => {
    try {
      localStorage.removeItem('sowonpray_members_v5')
      localStorage.removeItem('sowonpray_members_v6')
      localStorage.removeItem('sowonpray_members_v7')
      localStorage.removeItem('sowonpray_members_v8')
      localStorage.removeItem('sowonpray_members_v9')
      const saved = localStorage.getItem('sowonpray_members_v10')

      // 레거시 108 더미 캐시 안전 제거
      try {
        const c33 = localStorage.getItem('sowonpray_merit_33065540')
        if (c33 && Number(c33) > 100) localStorage.removeItem('sowonpray_merit_33065540')
        localStorage.removeItem('sowonpray_merit_82341088')
      } catch (e) {}

      const applyLocalMerit = (list) =>
        list.map((m) => {
          try {
            const localCached = localStorage.getItem(`sowonpray_merit_${m.code}`)
            if (localCached && localCached !== '108' && localCached !== '109') {
              const parsed = parseInt(localCached, 10)
              if (!isNaN(parsed) && parsed > (m.merit_count || 0)) {
                return { ...m, merit_count: parsed }
              }
            }
          } catch (e) {}
          return m
        })

      if (saved) {
        const parsed = JSON.parse(saved)
        const cleaned = parsed
          .filter((m) => m.code !== '49121083' && m.code !== '74200267')
          .map((m) => (m.parent_code === '49121083' || m.parent_code === '74200267' ? { ...m, parent_code: '55570267' } : m))
          .map(normalizeMemberHierarchy)
        const seen = new Set()
        const unique = cleaned.filter((m) => {
          if (seen.has(m.code)) return false
          seen.add(m.code)
          return true
        })
        return applyLocalMerit(unique)
      }
      return applyLocalMerit(INITIAL_MEMBERS.map(normalizeMemberHierarchy))
    } catch {
      return INITIAL_MEMBERS.map(normalizeMemberHierarchy)
    }
  })

  const [prayers, setPrayers] = useState(() => {
    localStorage.removeItem('sowonpray_prayers_v4'); const saved = localStorage.getItem('sowonpray_prayers_v5')
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

  // 소원사 도량 공지사항 상태 (LocalStorage + 초기공지 3선 연동)
  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonpray_notices_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      return INITIAL_NOTICES
    } catch {
      return INITIAL_NOTICES
    }
  })
  const [activeNoticeIdx, setActiveNoticeIdx] = useState(0) // 롤링 공지 인덱스
  const [selectedNotice, setSelectedNotice] = useState(null) // 상세 모달용 선택된 공지
  const [showNoticeModal, setShowNoticeModal] = useState(false) // 공지사항 상세 모달 열림 여부
  const [showNoticeListModal, setShowNoticeListModal] = useState(false) // 전체 공지 목록 모달
  const [adminNoticeCategory, setAdminNoticeCategory] = useState('법회')
  const [adminNoticeTitle, setAdminNoticeTitle] = useState('')
  const [adminNoticeContent, setAdminNoticeContent] = useState('')
  const [adminNoticeTargetTab, setAdminNoticeTargetTab] = useState('lantern')
  const [adminNoticeCtaLabel, setAdminNoticeCtaLabel] = useState('소원등 켜고 축원 올리기 ▶')

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
    return savedRef || '33065540'
  })

  // 현재 로그인된 본인 계정 코드 (자동 로그인 유지 / 신규 방문자는 null 게스트 상태로 시작)
  const [currentUserCode, setCurrentUserCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const savedUser = localStorage.getItem('sowonpray_current_user_v3')

      // 1) 이전 버전에서 자동 주입되었던 테스트 더미 계정('82341088', 이정숙)은 깨끗이 초기화
      if (savedUser === '82341088') {
        localStorage.removeItem('sowonpray_current_user_v3')
        return null
      }

      // 2) 카카오톡 초대 링크(?ref=...)로 유입된 신규 방문자는 무조건 게스트(null) 상태로 시작하여 성명/전화번호 빈칸 유지
      if (params.get('ref') && (!savedUser || savedUser === 'null' || savedUser.trim() === '')) {
        return null
      }

      // 3) 저장된 회원 코드가 유효하게 존재하면 유지, 없으면 null 게스트 상태
      return (savedUser && savedUser !== 'null' && savedUser.trim() !== '') ? savedUser : null
    } catch (e) {
      return null
    }
  })

  // 현재 로그인된 회원 객체
  const currentUser = useMemo(() => {
    if (!currentUserCode) return null
    return members.find((m) => m.code === currentUserCode) || null
  }, [members, currentUserCode])

  // 관리자/위원장 목록 필터링 (양영문 신도회장, 김철수·유광수·오다혜·임평종 포교위원장)
  const agents = useMemo(() => {
    return members.filter(
      (m) =>
        m.role === 'agent' ||
        m.role === 'temple_admin' ||
        m.role === 'master'
    )
  }, [members])

  // 현재 회원의 담당(인도) 포교사 객체
  const currentLockedAgent = useMemo(() => {
    const targetCode = currentUser?.parent_code || referralCode || '33065540'
    return (
      members.find((m) => m.code === targetCode) ||
      members.find((m) => m.code === '33065540') ||
      members[0]
    )
  }, [members, currentUser, referralCode])

  // 알림 토스트 메시지
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)
  const showToast = (msg, duration = 6000) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(msg)
    toastTimerRef.current = setTimeout(() => setToast(null), duration)
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
    localStorage.setItem('sowonpray_members_v10', JSON.stringify(members))
  }, [members])

  useEffect(() => {
    localStorage.setItem('sowonpray_prayers_v5', JSON.stringify(prayers))
  }, [prayers])

  useEffect(() => {
    localStorage.setItem('sowonpray_settlements_v3', JSON.stringify(settlements))
  }, [settlements])

  useEffect(() => {
    localStorage.setItem('sowonpray_visits_v3', JSON.stringify(visits))
  }, [visits])

  useEffect(() => {
    localStorage.setItem('sowonpray_notices_v1', JSON.stringify(notices))
  }, [notices])

  // 공지사항 롤링 타이머 (5초마다 다음 공지 순환)
  useEffect(() => {
    if (!notices || notices.length <= 1) return
    const timer = setInterval(() => {
      setActiveNoticeIdx((prev) => (prev + 1) % notices.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [notices])

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
          // 회원 정보 동기화
          // 구 양영문(49121083) 및 종무소 가상계정(74200267) 정리
          const toDelete = cloudMembers.filter((m) => m.code === '49121083' || m.code === '74200267')
          if (toDelete.length > 0) {
            try {
              await supabase.from('members').update({ parent_code: '55570267' }).or('parent_code.eq.49121083,parent_code.eq.74200267')
              await supabase.from('members').delete().in('code', ['49121083', '74200267'])
            } catch (err) {
              console.log('Supabase duplicate cleanup note:', err)
            }
          }

          const sanitizedCloud = cloudMembers
            .filter((m) => m.code !== '49121083' && m.code !== '74200267')
            .map((m) => {
              const fixedParent = (m.parent_code === '49121083' || m.parent_code === '74200267' ? '55570267' : m.parent_code)
              let meritCount = m.merit_count || 0
              try {
                const localCached = localStorage.getItem(`sowonpray_merit_${m.code}`)
                if (localCached && localCached !== '108' && localCached !== '109') {
                  const parsed = parseInt(localCached, 10)
                  if (!isNaN(parsed) && parsed > meritCount) {
                    meritCount = parsed
                    // Supabase에 로컬 캐시된 최신 공덕수 역동기화
                    supabase.from('members').update({ merit_count: parsed }).eq('code', m.code).then()
                  }
                }
              } catch (e) {}
              return { ...m, parent_code: fixedParent, merit_count: meritCount }
            })

          const cloudCodes = new Set(sanitizedCloud.map((m) => m.code))
          const merged = [
            ...sanitizedCloud,
            ...INITIAL_MEMBERS.filter((m) => !cloudCodes.has(m.code) && m.code !== '49121083' && m.code !== '74200267').map((m) => {
              let meritCount = m.merit_count || 0
              try {
                const localCached = localStorage.getItem(`sowonpray_merit_${m.code}`)
                if (localCached && localCached !== '108' && localCached !== '109') {
                  const parsed = parseInt(localCached, 10)
                  if (!isNaN(parsed) && parsed > meritCount) {
                    meritCount = parsed
                  }
                }
              } catch (e) {}
              return { ...m, merit_count: meritCount }
            }),
          ]
          const seen = new Set()
          const finalMembers = merged
            .map(normalizeMemberHierarchy)
            .filter((m) => {
              if (seen.has(m.code)) return false
              seen.add(m.code)
              return true
            })
          setMembers(finalMembers)

          // Supabase 클라우드 DB 역할 동기화 (김철수, 양영문, 유광수, 오다혜, 임평종 제외한 전원 believer)
          try {
            await supabase
              .from('members')
              .update({ role: 'believer' })
              .not('code', 'in', '("33065540","55570267","53872248","83855838","35651669")')
            await supabase.from('members').update({ role: 'agent', parent_code: '33065540' }).in('code', ['53872248', '83855838', '35651669'])
            await supabase.from('members').update({ role: 'master', parent_code: '55570267' }).eq('code', '33065540')
            await supabase.from('members').update({ role: 'temple_admin', parent_code: null }).eq('code', '55570267')
          } catch (syncErr) {
            console.log('Supabase role sync note:', syncErr)
          }
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

  // 오늘의 법문 선택: 마지막 읽은 구절을 localStorage에 기억하고, 처음 방문 시에는 오늘의 날짜(1~31일)에 맞춰 자동 매칭
  const [quoteIdx, setQuoteIdx] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonpray_last_quote_idx_v1')
      if (saved !== null) {
        const parsed = parseInt(saved, 10)
        if (!isNaN(parsed) && parsed >= 0 && parsed < DAILY_QUOTES.length) {
          return parsed
        }
      }
    } catch (e) {}
    // 저장된 기록이 없을 때는 오늘 날짜(1일~31일) 구절로 매칭
    const todayDate = new Date().getDate()
    return (todayDate - 1) % DAILY_QUOTES.length
  })

  // 구절이 바뀔 때마다 브라우저에 저장하여 앱을 껐다 켜거나 다른 탭을 갔다 와도 마지막 구절 유지
  useEffect(() => {
    try {
      localStorage.setItem('sowonpray_last_quote_idx_v1', String(quoteIdx))
    } catch (e) {}
  }, [quoteIdx])

  const currentQuote = DAILY_QUOTES[quoteIdx] || DAILY_QUOTES[0]

  // 📿 [사시예불 주기 계산 헬퍼]
  // - 오전 09:00 이전 점등: 당일 오전 10시 사시예불 배정 -> 당일 오전 11:00 회향(미점등 전환)
  // - 오전 09:00 이후 점등: 익일(내일) 오전 10시 사시예불 배정 -> 익일 오전 11:00 회향(미점등 전환)
  const formatLocalDateKey = (dateObj) => {
    const y = dateObj.getFullYear()
    const m = String(dateObj.getMonth() + 1).padStart(2, '0')
    const d = String(dateObj.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const computeSasiSchedule = (litTimestamp = Date.now()) => {
    const d = new Date(litTimestamp)
    const isBefore9AM = d.getHours() < 9
    const sasiDate = isBefore9AM
      ? new Date(d.getFullYear(), d.getMonth(), d.getDate())
      : new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    const expireDate = new Date(
      sasiDate.getFullYear(),
      sasiDate.getMonth(),
      sasiDate.getDate(),
      11,
      0,
      0,
      0
    )
    const prevDate = new Date(
      sasiDate.getFullYear(),
      sasiDate.getMonth(),
      sasiDate.getDate() - 1
    )
    const sasiDateKey = formatLocalDateKey(sasiDate)
    const prevSasiDateKey = formatLocalDateKey(prevDate)
    return {
      isBefore9AM,
      sasiDateKey,
      prevSasiDateKey,
      expireAt: expireDate.getTime(),
    }
  }

  const getSasiDisplayInfo = (sasiDateKey) => {
    const todayKey = formatLocalDateKey(new Date())
    const isTodaySasi = sasiDateKey
      ? sasiDateKey === todayKey
      : new Date().getHours() < 9
    return {
      isTodaySasi,
      shortLabel: isTodaySasi ? '오늘 오전 10시 사시예불' : '내일 오전 10시 사시예불',
      detailLabel: isTodaySasi
        ? '오늘 오전 10시 대웅전 사시예불 축원'
        : '내일 오전 10시 대웅전 사시예불 축원',
    }
  }

  // 1일 1소원등 축원 상태 (사시예불 회차 기준 연속 정진 일수 카운트)
  const [lanternStreak, setLanternStreak] = useState(() => {
    try {
      const raw = localStorage.getItem('sowonsa_lantern_streak_v2')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Number(parsed.count) > 0) {
          return Number(parsed.count)
        }
      }
    } catch (e) {}
    return 1
  })

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

  // 오늘 사시예불 회향 안내 팝업 확인 완료 플래그 (메모리 Ref로 동시성 및 리렌더링 시 중복 노출 원천 차단)
  const hoehangDismissedRef = useRef(false)

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
  const [showBulsaCategorySheet, setShowBulsaCategorySheet] = useState(false)
  const [wishCategory, setWishCategory] = useState('가족건강')
  const [wishText, setWishText] = useState(
    () => PRAYER_CATEGORY_TEMPLATES['가족건강'] || ''
  )
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [latestSubmittedPrayerId, setLatestSubmittedPrayerId] = useState(null)

  // 🪔 불자님의 실제 소원등 접수 장부(prayers) 및 누적 기록 기반 연속 정진 일수(Streak) 및 누적 총 횟수 정밀 연산
  const userLanternStats = useMemo(() => {
    const cleanUserPhone = (currentUser?.phone || wishPhone || lanternData?.believer_phone || '').replace(/[^0-9]/g, '')
    const userCode = currentUser?.code || lanternData?.member_code || ''
    const userName = currentUser?.name || wishName || lanternData?.believer_name || ''

    // 1) 장부(prayers)에서 해당 불자님의 1일 소원등 목록 추출
    const my1dPrayers = (prayers || []).filter((p) => {
      if (!p || !p.created_at) return false
      const pCat = p.wish_category || ''
      if (
        pCat.includes('위패') ||
        pCat.includes('생전예수재') ||
        pCat.includes('삼성각') ||
        pCat.includes('기와') ||
        pCat.includes('단청') ||
        pCat.includes('명패') ||
        pCat.includes('인등') ||
        pCat.includes('100일') ||
        pCat.includes('49재') ||
        pCat.includes('천도재') ||
        pCat.includes('공양미')
      ) {
        return false
      }
      const pPhone = (p.believer_phone || '').replace(/[^0-9]/g, '')
      const pCode = p.member_code || ''
      const pName = p.believer_name || ''
      const matchPhone = cleanUserPhone && pPhone && cleanUserPhone === pPhone
      const matchCode = userCode && pCode && userCode === pCode
      const matchName = userName && pName && (pName.includes(userName) || userName.includes(pName))
      return matchPhone || matchCode || matchName
    })

    // 2) 고유 사시예불 회차(sasiDateKey) 목록 추출 및 최신순 정렬
    const uniqueSasiDates = [...new Set(my1dPrayers.map((p) => {
      const time = new Date(p.created_at).getTime()
      return isNaN(time) ? '' : computeSasiSchedule(time).sasiDateKey
    }).filter(Boolean))].sort().reverse()

    // 3) 연속 정진 일수 (Streak) 계산: 최신 회차부터 하루씩 연속되는지 검사
    let calculatedStreak = uniqueSasiDates.length > 0 ? 1 : 0
    for (let i = 0; i < uniqueSasiDates.length - 1; i++) {
      const cur = new Date(uniqueSasiDates[i])
      const prev = new Date(uniqueSasiDates[i + 1])
      const diffDays = Math.round((cur - prev) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        calculatedStreak++
      } else {
        break
      }
    }

    // 로컬스토리지 백업 및 이전 저장된 streak 값과 비교하여 최대값 보장
    let storedStreak = 1
    try {
      const raw = localStorage.getItem('sowonsa_lantern_streak_v2')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Number(parsed.count) > 0) storedStreak = Number(parsed.count)
      }
    } catch (e) {}

    const streak = Math.max(calculatedStreak, storedStreak, lanternData?.streak || 1, 1)

    // 4) 총 소원등 점등 횟수 계산 (장부 기록 건수, 로컬 카운트, 최소 streak 중 최대값)
    const totalCount = Math.max(my1dPrayers.length, lanternData?.total_count || 1, streak)

    return { streak, totalCount, prayersCount: my1dPrayers.length }
  }, [prayers, currentUser, wishPhone, wishName, lanternData])

  const previewNextStreakCount = (targetSasiDateKey, prevSasiDateKey) => {
    try {
      const baseStreak = userLanternStats?.streak || 1
      const raw = localStorage.getItem('sowonsa_lantern_streak_v2')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.lastSasiDateKey === targetSasiDateKey) {
          return Math.max(baseStreak, Number(parsed.count) || 1)
        }
        if (parsed && parsed.lastSasiDateKey === prevSasiDateKey) {
          return Math.max(baseStreak + 1, (Number(parsed.count) || 1) + 1)
        }
      }
      return baseStreak
    } catch (e) {}
    return 1
  }

  // [사시예불 축원 명부] 7일 이내 유효 신도 전용 인쇄 모달 상태
  const [showSasiPrintModal, setShowSasiPrintModal] = useState(false)
  // [모바일법당 회원명부] 전체 신도 및 포교위원회 A4 인쇄 모달 상태
  const [showMemberPrintModal, setShowMemberPrintModal] = useState(false)
  // [개인 신도 교적대장(신적부)] 다년간 전체 점등 및 불사 동참 원장 종합 A4 인쇄 모달 상태
  const [showIndividualRecordPrintModal, setShowIndividualRecordPrintModal] = useState(false)
  const [individualRecordTargetMember, setIndividualRecordTargetMember] = useState(null)

  // [사찰 불사 & 위패 봉안 정식 접수] 전용 모달 상태 (신도교적부 검색·선택 기반)
  const [showSettlementModal, setShowSettlementModal] = useState(false)
  const [settlementTargetMember, setSettlementTargetMember] = useState(null)
  const [settlementItemType, setSettlementItemType] = useState('생전예수재 황금빛 위패 (살아계신 분)')
  const [settlementStandardAmount, setSettlementStandardAmount] = useState(2000000)
  const [settlementPaidAmount, setSettlementPaidAmount] = useState(2000000)
  const [settlementAppliedDate, setSettlementAppliedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [settlementPaidDate, setSettlementPaidDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [settlementPaymentMethod, setSettlementPaymentMethod] = useState('계좌이체 (사찰통장)')
  const [settlementPaymentStatus, setSettlementPaymentStatus] = useState('confirmed')
  const [settlementMemo, setSettlementMemo] = useState('')

  // [대웅전 1년 가족 인등 전통 명패] A4 원터치 인쇄 모달 상태
  const [showIndeungNameplateModal, setShowIndeungNameplateModal] = useState(false)
  const [indeungTargetMember, setIndeungTargetMember] = useState(null)
  // [신도교적부 상단 공통 툴바] 현재 활성화/선택된 신도 코드 상태
  const [activeBelieverCode, setActiveBelieverCode] = useState(null)
  // [정산 원장 착오 수정 및 환불/취소 처리] 전용 모달 상태
  const [editingSettlement, setEditingSettlement] = useState(null)
  // [정식 접수 최종 확인 전용 중앙 팝업 모달 상태]
  const [pendingSettlementConfirm, setPendingSettlementConfirm] = useState(null)

  // 개인 신도 교적대장 및 1년 가족인등 인쇄 시 배경 앱(#root) 숨김 및 단 1장 완결 출력 전용 클래스 토글
  useEffect(() => {
    if (showIndividualRecordPrintModal || showIndeungNameplateModal) {
      document.body.classList.add('print-individual-open')
    } else {
      document.body.classList.remove('print-individual-open')
    }
    return () => {
      document.body.classList.remove('print-individual-open')
    }
  }, [showIndividualRecordPrintModal, showIndeungNameplateModal])

  // 📿 [대웅전 부처님 전 사시마지 축원 명부]
  // 정통 사찰 원칙: 상단(부처님단) 길상 축원 3대 종목(1일 무료소원등 · 100일 특별기도 · 1년 가족인등)만 엄격히 선별
  const activeSasiPrayers = useMemo(() => {
    const now = Date.now()

    return (prayers || [])
      .filter((p) => {
        if (!p) return false
        const c = p.wish_category || ''
        // 영단(위패/천도재/49재) 및 단순 시주(공양미/불전시주/기와/단청)는 사시예불 축원 명부에서 제외
        if (c.includes('위패') || c.includes('천도재') || c.includes('49재') || c.includes('기일') || c.includes('예수재')) {
          return false
        }
        if (c.includes('공양미') || c.includes('불전시주') || c.includes('시주') || c.includes('기와') || c.includes('단청')) {
          return false
        }
        return true
      })
      .map((p) => {
        let pTime = now
        if (p.created_at) {
          const parsed = new Date(p.created_at).getTime()
          if (!isNaN(parsed)) pTime = parsed
        }
        const diffMs = Math.max(0, now - pTime)

        let maxDays = 2 // 1일 소원등 (무료) 기본 유효 (접수 당일 및 전일 축원 보장)
        const c = p.wish_category || ''
        const t = p.prayer_type || ''
        if (t === 'indeung_1yr' || c.includes('인등') || p.duration_days === 365) {
          maxDays = 365
        } else if (t === 'prayer_100d' || c.includes('100일') || p.duration_days === 100) {
          maxDays = 100
        } else if (p.duration_days) {
          maxDays = p.duration_days
        }

        const maxMs = maxDays * 24 * 60 * 60 * 1000
        const isActive = diffMs <= maxMs
        const daysLeft = Math.max(1, Math.ceil((maxMs - diffMs) / (1000 * 60 * 60 * 24)))

        return {
          ...p,
          pTime,
          maxDays,
          isActive,
          daysLeft,
        }
      })
      .filter((p) => p.isActive)
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

  // 신행홈 상단 히어로 배너 7초 자동 슬라이드 (홈 탭일 때만 여유롭게 동작)
  useEffect(() => {
    if (activeTab !== 'home') return
    const timer = setInterval(() => {
      setHeroSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 7000)
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
  const [showVisitSuccessModal, setShowVisitSuccessModal] = useState(false)
  const [showSanctuaryModal, setShowSanctuaryModal] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('sanctuary') === 'true' || params.get('tab') === 'sanctuary'
    }
    return false
  })
  const pendingVisitDraftRef = useRef(null)

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
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false)
  const [isOrgTreeOpen, setIsOrgTreeOpen] = useState(false)
  const [isAgentPrayerListExpanded, setIsAgentPrayerListExpanded] = useState(false)
  const [isAgentVisitListExpanded, setIsAgentVisitListExpanded] = useState(false)
  const [agentPrayerSearchQuery, setAgentPrayerSearchQuery] = useState('')

  // [전산 고도화] 10만 신도 대비 초고속 검색 & 등급 필터 & 정렬 & 상세 모달
  const [adminMemberSearchQuery, setAdminMemberSearchQuery] = useState('')
  const [adminMemberRoleFilter, setAdminMemberRoleFilter] = useState('all') // 'all' | 'agent' | 'committee_member' | 'believer' | 'admin'
  const [adminMemberSort, setAdminMemberSort] = useState('latest') // 'latest' | 'name' | 'merit'
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null)
  const [lanternTargetMember, setLanternTargetMember] = useState(null)
  const [adminLanternType, setAdminLanternType] = useState('lantern_1d') // 'lantern_1d' | 'prayer_100d' | 'indeung_1yr'
  const [adminLanternCategory, setAdminLanternCategory] = useState('가족건강')
  const [adminLanternWish, setAdminLanternWish] = useState('')
  const [adminLanternPaid, setAdminLanternPaid] = useState(true)

  // [전산 고도화] 사시예불 축원 명부 기도 유형 탭 ('all': 전체 | 'lantern': 1일 소원등 | 'prayer_100d': 100일 특별기도 | 'indeung_1yr': 1년 인등 명패)
  const [sasiPrayerTypeTab, setSasiPrayerTypeTab] = useState('all')
  const [sasiCategoryFilter, setSasiCategoryFilter] = useState('all')
  const [sasiSearchQuery, setSasiSearchQuery] = useState('')
  const [sasiPrayedCheckedIds, setSasiPrayedCheckedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonpray_sasi_checked_ids')
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch {
      return new Set()
    }
  })

  // [전산 고도화] 위패 봉안 및 수당 정산망 상태 필터 & 포교사 필터
  const [settlementStatusFilter, setSettlementStatusFilter] = useState('all') // 'all' | 'confirmed' | 'settled'
  const [settlementAgentFilter, setSettlementAgentFilter] = useState('all')

  // 사시예불 축원 체크 로컬 저장
  const toggleSasiPrayedCheck = (id) => {
    setSasiPrayedCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem('sowonpray_sasi_checked_ids', JSON.stringify([...next]))
      } catch {}
      return next
    })
  }

  // 사시예불 축원 명부 필터링 (기도유형 + 분야 + 검색어)
  const filteredSasiPrayers = useMemo(() => {
    let list = activeSasiPrayers || []
    if (sasiPrayerTypeTab !== 'all') {
      if (sasiPrayerTypeTab === 'indeung_1yr') {
        list = list.filter((p) => p.prayer_type === 'indeung_1yr' || p.wish_category?.includes('인등'))
      } else if (sasiPrayerTypeTab === 'prayer_100d') {
        list = list.filter((p) => p.prayer_type === 'prayer_100d' || p.wish_category?.includes('100일'))
      } else if (sasiPrayerTypeTab === 'lantern' || sasiPrayerTypeTab === 'lantern_1d') {
        list = list.filter((p) => {
          if (p.prayer_type === 'lantern_1d' || p.prayer_type === 'lantern') return true;
          if (p.duration_days === 1 || p.duration_days === 7) return true;
          const c = p.wish_category || '';
          return !c.includes('100일') && !c.includes('인등') && !c.includes('위패') && !c.includes('재') && !c.includes('불사') && !c.includes('공양미');
        });
      }
    }
    if (sasiCategoryFilter !== 'all') {
      list = list.filter((p) => p.wish_category === sasiCategoryFilter)
    }
    if (sasiSearchQuery.trim()) {
      const q = sasiSearchQuery.trim().toLowerCase()
      list = list.filter((p) => {
        const nameMatch = p.believer_name?.toLowerCase().includes(q)
        const textMatch = p.wish_text?.toLowerCase().includes(q)
        const catMatch = p.wish_category?.toLowerCase().includes(q)
        return nameMatch || textMatch || catMatch
      })
    }
    return list
  }, [activeSasiPrayers, sasiPrayerTypeTab, sasiCategoryFilter, sasiSearchQuery])

  // 🪷 신도별 최근 기도/불사 접수 현황, 접수일자, 입금일자, 보시금 처리 상태 및 실시간 소원등 점등 상태 산출
  const getMemberPrayerAndPaymentInfo = (m) => {
    if (!m) {
      return {
        prayerTitle: '-',
        prayerTypeBadge: '-',
        prayerBadgeColor: '',
        paymentStatus: 'settled',
        paymentAmount: 0,
        appliedDate: '2026.10.22',
        paidDate: '2026.10.22',
        isLanternActive: false,
        daysLeft: 0,
        lanternStatusText: '소등 (등 미점등)',
        lanternTypeBadge: '소등',
      }
    }

    // 1. prayers 배열에서 매칭
    const memberPrayers = (prayers || []).filter(
      (p) =>
        p.member_code === m.code ||
        (m.phone && p.believer_phone && p.believer_phone.replace(/[^0-9]/g, '') === m.phone.replace(/[^0-9]/g, '')) ||
        (p.believer_name && p.believer_name.includes(m.name))
    )

    // 2. settlements(위패/불사) 배열에서 매칭
    const memberSettlements = (settlements || []).filter(
      (s) => s.believer_name && s.believer_name.includes(m.name)
    )

    const latestSettlement = memberSettlements[0]
    const latestPrayer = memberPrayers[0]

    let prayerTitle = '기도·불사 접수 대기'
    let prayerTypeBadge = '미접수'
    let prayerBadgeColor = 'bg-stone-100 text-stone-600 border-stone-200'
    let paymentAmount = 0
    let paymentStatus = m.extra_data?.payment_status || 'settled'
    let lanternDurationDays = 0 // 🪔 순수 소원등/인등 점등 유효일수 (위패·천도재 불사는 점등 아님)

    if (latestSettlement) {
      prayerTitle = latestSettlement.item_name
      prayerTypeBadge = '불사 봉안'
      prayerBadgeColor = 'bg-purple-100 text-purple-900 border-purple-300'
      paymentAmount = latestSettlement.total_amount || 2000000
      paymentStatus = latestSettlement.payment_status === 'pending' ? 'pending' : 'settled'
      // 위패/불사는 등이 아니므로, 별도 소원등(latestPrayer) 접수 이력이 있을 때만 점등 기간 부여
      if (latestPrayer) {
        const lpTitle = latestPrayer.wish_category || latestPrayer.prayer_type || ''
        if (lpTitle.includes('인등')) lanternDurationDays = latestPrayer.duration_days || 365
        else if (lpTitle.includes('100일')) lanternDurationDays = latestPrayer.duration_days || 100
        else lanternDurationDays = latestPrayer.duration_days || 7
      }
    } else if (latestPrayer) {
      prayerTitle = latestPrayer.wish_category || latestPrayer.prayer_type || '대웅전 소원기도'
      if (prayerTitle.includes('인등')) {
        prayerTypeBadge = '1년 인등'
        prayerBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300'
        paymentAmount = 100000
        lanternDurationDays = latestPrayer.duration_days || 365
      } else if (prayerTitle.includes('100일')) {
        prayerTypeBadge = '100일 특별기도'
        prayerBadgeColor = 'bg-blue-100 text-blue-900 border-blue-300'
        paymentAmount = 100000
        lanternDurationDays = latestPrayer.duration_days || 100
      } else if (prayerTitle.includes('1일') || prayerTitle.includes('소원등')) {
        prayerTypeBadge = '1일 소원등'
        prayerBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300'
        paymentAmount = 0
        paymentStatus = 'settled'
        lanternDurationDays = latestPrayer.duration_days || 7
      } else {
        prayerTypeBadge = '대웅전 기도'
        prayerBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300'
        paymentAmount = 30000
        lanternDurationDays = latestPrayer.duration_days || 30
      }
    } else {
      // 신도 공덕 기준 추정 매핑
      if ((m.merit_count || 0) >= 30) {
        prayerTitle = '대웅전 1년 인등(가족등) 정진'
        prayerTypeBadge = '1년 인등'
        prayerBadgeColor = 'bg-amber-100 text-amber-900 border-amber-300'
        paymentAmount = 100000
        lanternDurationDays = 365
      } else if ((m.merit_count || 0) >= 10) {
        prayerTitle = '100일 소원성취 특별기도 정진'
        prayerTypeBadge = '100일 특별기도'
        prayerBadgeColor = 'bg-blue-100 text-blue-900 border-blue-300'
        paymentAmount = 100000
        lanternDurationDays = 100
      } else if ((m.merit_count || 0) > 0) {
        prayerTitle = '대웅전 일일 소원등 축원 (무료)'
        prayerTypeBadge = '1일 소원등'
        prayerBadgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300'
        paymentAmount = 0
        paymentStatus = 'settled'
        lanternDurationDays = 7
      }
    }

    if (m.extra_data?.payment_status) {
      paymentStatus = m.extra_data.payment_status
    }

    // 📅 접수날짜 산출 (YYYY.MM.DD)
    const rawApplied = latestPrayer?.created_at || latestSettlement?.created_at || m.created_at || ''
    const appliedDate = rawApplied ? rawApplied.slice(0, 10).replace(/-/g, '.') : '2026.10.22'

    // 💳 입금날짜 산출 (완납 시 YYYY.MM.DD, 미납 시 '입금대기중')
    let paidDate = '미납 (입금대기)'
    if (paymentStatus === 'settled') {
      const rawPaid = m.extra_data?.payment_date || latestSettlement?.created_at || latestPrayer?.created_at || m.created_at || ''
      paidDate = rawPaid ? rawPaid.slice(0, 10).replace(/-/g, '.') : appliedDate
    }

    // 🪷 신도의 부처님 전 축원 발원문 및 기원 분야 산출
    let wishCategory = '가족건강'
    let wishText = '지극정성으로 가내 평안과 소원성취를 발원합니다.'

    if (latestPrayer?.wish_text) {
      wishText = latestPrayer.wish_text
      wishCategory = latestPrayer.wish_category || '가족건강'
    } else if (m.extra_data?.recent_wish_text) {
      wishText = m.extra_data.recent_wish_text
      wishCategory = m.extra_data.recent_wish_category || '가족건강'
    } else if (latestSettlement) {
      wishCategory = '불사공덕'
      wishText = `${latestSettlement.item_name} 불사 동참 공덕으로 온 가족 무병장수와 가내 평안을 발원합니다.`
    } else if (m.extra_data?.recent_prayer_title && PRAYER_CATEGORY_TEMPLATES[m.extra_data.recent_prayer_title]) {
      wishCategory = m.extra_data.recent_prayer_title
      wishText = PRAYER_CATEGORY_TEMPLATES[m.extra_data.recent_prayer_title]
    } else if ((m.merit_count || 0) >= 30) {
      wishCategory = '가족건강'
      wishText = '대웅전 1년 인등 불사 공덕으로 온 가족 무병장수와 만사형통을 지극정성 발원합니다.'
    } else if ((m.merit_count || 0) >= 10) {
      wishCategory = '소원성취'
      wishText = '100일 특별기도 정진으로 뜻하는 바 소원성취와 사업번창을 지극정성 발원합니다.'
    } else if ((m.merit_count || 0) > 0) {
      wishCategory = '일일발원'
      wishText = '부처님 전 일일 소원등을 밝혀 가내 두루 평안하고 액난 소멸을 발원합니다.'
    }

    // 🔥 3대 소원등(1일등, 100일등, 1년등) 각각의 실시간 점등/소등 상태 및 잔여일수 산출
    const now = Date.now()

    // 1) 1일 소원등 (기본 유효기간 7일)
    const p1d = memberPrayers.find(
      (p) => p.prayer_type === 'lantern_1d' || p.wish_category?.includes('1일') || p.wish_category?.includes('소원등')
    )
    let active1d = false
    let daysLeft1d = 0
    if (m.extra_data?.lantern_type?.includes('1일') && m.extra_data?.lantern_active_until) {
      const until = new Date(m.extra_data.lantern_active_until).getTime()
      if (until > now) {
        active1d = true
        daysLeft1d = Math.max(1, Math.ceil((until - now) / 86400000))
      }
    } else if (p1d) {
      const start = new Date(p1d.created_at || m.created_at || '2026-10-22').getTime()
      const end = start + (p1d.duration_days || 7) * 86400000
      if (end > now) {
        active1d = true
        daysLeft1d = Math.max(1, Math.ceil((end - now) / 86400000))
      }
    }

    // 2) 100일 특별기도 (100일)
    const p100d = memberPrayers.find(
      (p) => p.prayer_type === 'prayer_100d' || p.wish_category?.includes('100일')
    )
    let active100d = false
    let daysLeft100d = 0
    if (m.extra_data?.lantern_type?.includes('100일') && m.extra_data?.lantern_active_until) {
      const until = new Date(m.extra_data.lantern_active_until).getTime()
      if (until > now) {
        active100d = true
        daysLeft100d = Math.max(1, Math.ceil((until - now) / 86400000))
      }
    } else if (p100d) {
      const start = new Date(p100d.created_at || m.created_at || '2026-10-22').getTime()
      const end = start + (p100d.duration_days || 100) * 86400000
      if (end > now) {
        active100d = true
        daysLeft100d = Math.max(1, Math.ceil((end - now) / 86400000))
      }
    }

    // 3) 대웅전 1년 인등 (365일)
    const p1yr = memberPrayers.find(
      (p) => p.prayer_type === 'indeung_1yr' || p.wish_category?.includes('인등')
    )
    let active1yr = false
    let daysLeft1yr = 0
    if (m.extra_data?.lantern_type?.includes('인등') && m.extra_data?.lantern_active_until) {
      const until = new Date(m.extra_data.lantern_active_until).getTime()
      if (until > now) {
        active1yr = true
        daysLeft1yr = Math.max(1, Math.ceil((until - now) / 86400000))
      }
    } else if (p1yr) {
      const start = new Date(p1yr.created_at || m.created_at || '2026-10-22').getTime()
      const end = start + (p1yr.duration_days || 365) * 86400000
      if (end > now) {
        active1yr = true
        daysLeft1yr = Math.max(1, Math.ceil((end - now) / 86400000))
      }
    }

    const lanterns = [
      { id: 'lantern_1d', label: '1일등', fullName: '1일 소원등 (무료)', active: active1d, daysLeft: daysLeft1d },
      { id: 'prayer_100d', label: '100일등', fullName: '100일 특별기도', active: active100d, daysLeft: daysLeft100d },
      { id: 'indeung_1yr', label: '1년등', fullName: '대웅전 1년 인등', active: active1yr, daysLeft: daysLeft1yr },
    ]

    const activeLanterns = lanterns.filter((l) => l.active)
    const isLanternActive = activeLanterns.length > 0

    // 🪔 제일 긴 등 우선순위 산출: 1년등(365일) > 100일등(100일) > 1일등(1일)
    const longestActiveLantern =
      lanterns.find((l) => l.id === 'indeung_1yr' && l.active) ||
      lanterns.find((l) => l.id === 'prayer_100d' && l.active) ||
      lanterns.find((l) => l.id === 'lantern_1d' && l.active) ||
      null

    const daysLeft = longestActiveLantern?.daysLeft || 0
    const lanternStatusText = isLanternActive
      ? `점등중 (${activeLanterns.map((l) => (l.id === 'lantern_1d' ? `${l.label} (점등)` : `${l.label} D-${l.daysLeft}`)).join(', ')})`
      : '소등 (등 미점등)'

    return {
      prayerTitle,
      prayerTypeBadge,
      prayerBadgeColor,
      paymentStatus,
      paymentAmount: typeof paymentAmount === 'number' ? paymentAmount : 100000,
      appliedDate,
      paidDate,
      isLanternActive,
      daysLeft,
      lanternStatusText,
      lanternTypeBadge: prayerTypeBadge !== '미접수' ? prayerTypeBadge : '소등',
      lanterns,
      activeLanterns,
      longestActiveLantern,
      wishCategory,
      wishText,
    }
  }

  // 10만 신도 대비 통합 검색 & 필터링 & 정렬
  const filteredAdminMembers = useMemo(() => {
    let list = members || []
    if (adminMemberRoleFilter !== 'all') {
      if (adminMemberRoleFilter === 'lantern_active') {
        list = list.filter((m) => getMemberPrayerAndPaymentInfo(m).isLanternActive)
      } else if (adminMemberRoleFilter === 'lantern_off') {
        list = list.filter((m) => !getMemberPrayerAndPaymentInfo(m).isLanternActive)
      } else if (adminMemberRoleFilter === 'admin') {
        list = list.filter((m) => m.role === 'temple_admin' || m.role === 'master')
      } else {
        list = list.filter((m) => m.role === adminMemberRoleFilter)
      }
    }
    if (adminMemberSearchQuery.trim()) {
      const q = adminMemberSearchQuery.trim().toLowerCase()
      const rawNum = q.replace(/[^0-9]/g, '')
      list = list.filter((m) => {
        const nameMatch = m.name?.toLowerCase().includes(q)
        const dharmaMatch = m.dharma_name?.toLowerCase().includes(q)
        const phoneMatch = Boolean(rawNum && rawNum.length >= 2 && m.phone?.replace(/[^0-9]/g, '').includes(rawNum))
        const codeMatch = Boolean(rawNum && rawNum.length >= 4 && m.code?.includes(rawNum))
        const addrMatch = m.address?.toLowerCase().includes(q)
        // 양방향 가족 사주 검색: 남편(세주), 배우자, 자녀 이름 또는 법명으로 검색해도 대표 신도 즉시 호출
        const familyMatched = (m.family_members || []).find(
          (f) =>
            f.name?.toLowerCase().includes(q) ||
            f.dharma_name?.toLowerCase().includes(q) ||
            f.relation?.toLowerCase().includes(q)
        )
        if (familyMatched) {
          m._matchedFamily = familyMatched
        } else {
          delete m._matchedFamily
        }
        return nameMatch || dharmaMatch || phoneMatch || codeMatch || addrMatch || Boolean(familyMatched)
      })
    }
    return [...list].sort((a, b) => {
      if (adminMemberSearchQuery.trim()) {
        const q = adminMemberSearchQuery.trim().toLowerCase()
        const cleanName = (n) => (n || '').replace(/\[.*?\]\s*/g, '').trim().toLowerCase()
        const aExact = cleanName(a.name) === q
        const bExact = cleanName(b.name) === q
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        const aName = a.name?.toLowerCase().includes(q)
        const bName = b.name?.toLowerCase().includes(q)
        if (aName && !bName) return -1
        if (!aName && bName) return 1
      }
      if (adminMemberSort === 'name') return (a.name || '').localeCompare(b.name || '', 'ko')
      if (adminMemberSort === 'merit') return (b.merit_count || 0) - (a.merit_count || 0)
      return 0
    })
  }, [members, adminMemberRoleFilter, adminMemberSearchQuery, adminMemberSort])

  // [신도교적부 상단 공통 툴바] 현재 선택/조작 대상 신도 (클릭 선택 신도 -> 첫 검색 결과 -> 첫 신도 자동 지정)
  const currentActiveBeliever = useMemo(() => {
    if (activeBelieverCode) {
      const found = (members || []).find((m) => m.code === activeBelieverCode)
      if (found) return found
    }
    if (filteredAdminMembers && filteredAdminMembers.length > 0) {
      return filteredAdminMembers[0]
    }
    return (members && members[0]) || null
  }, [activeBelieverCode, members, filteredAdminMembers])

  // [모바일법당 회원명부 A4 인쇄] 필터 및 검색
  const [memberPrintRoleFilter, setMemberPrintRoleFilter] = useState('all')
  const [memberPrintSearchQuery, setMemberPrintSearchQuery] = useState('')

  // 💰 종무소 원터치 보시금 입금 상태(입금완료 <-> 입금대기) 및 입금일자 동기화 토글 처리
  const handleTogglePaymentStatus = async (memberCode) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.code === memberCode) {
          const currentStatus = m.extra_data?.payment_status || 'settled'
          const nextStatus = currentStatus === 'settled' ? 'pending' : 'settled'
          const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
          const updated = {
            ...m,
            extra_data: {
              ...(m.extra_data || {}),
              payment_status: nextStatus,
              payment_date: nextStatus === 'settled' ? todayStr : '',
              payment_updated_at: new Date().toISOString(),
            },
          }
          if (supabase) {
            supabase
              .from('members')
              .update({ extra_data: updated.extra_data })
              .eq('code', memberCode)
              .then()
          }
          showToast(
            nextStatus === 'settled'
              ? `✅ [${m.name}] 신도님의 보시금 입금이 [완납 처리 (${todayStr})]되었습니다.`
              : `⏳ [${m.name}] 신도님의 상태가 [입금 대기]로 변경되었습니다.`
          )
          return updated
        }
        return m
      })
    )
  }

  // 🪔 [종무행정 소원등 즉시 밝히기 처리 함수]
  const handleAdminLightLantern = async () => {
    if (!lanternTargetMember) return
    playMoktakSound()

    const typeConfig = {
      lantern_1d: { name: '1일 소원등', duration: 1, amount: 0, badge: '1일 소원등 (무료)' },
      prayer_100d: { name: '100일 특별기도', duration: 100, amount: 100000, badge: '100일 특별기도' },
      indeung_1yr: { name: '대웅전 1년 인등(가족등)', duration: 365, amount: 100000, badge: '1년 인등' },
    }[adminLanternType] || { name: '1일 소원등', duration: 1, amount: 0, badge: '1일 소원등 (무료)' }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
    const newPrayer = {
      id: 'p-' + Date.now(),
      temple_id: DEFAULT_TEMPLE_ID,
      member_code: lanternTargetMember.code,
      believer_name: `${lanternTargetMember.name}${lanternTargetMember.dharma_name ? ` (${lanternTargetMember.dharma_name})` : ''}`,
      believer_phone: lanternTargetMember.phone,
      agent_code: lanternTargetMember.parent_code || '55570267',
      wish_category: typeConfig.name,
      prayer_type: adminLanternType,
      duration_days: typeConfig.duration,
      family_members_count: lanternTargetMember.family_members?.length || 1,
      wish_text: adminLanternWish.trim() || PRAYER_CATEGORY_TEMPLATES[adminLanternCategory] || '지극정성으로 가내 평안과 소원성취를 발원합니다.',
      status: 'prayed',
      prayed_at: '종무소 대웅전 소원등 접수 (사시예불 축원 연동)',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }

    setPrayers((prev) => [newPrayer, ...prev])
    if (supabase) {
      supabase.from('prayers').insert([newPrayer]).then()
    }

    // 신도 공덕수, 소원등 점등 상태 및 입금상태 실시간 업데이트
    const durationDays = typeConfig.duration === 1 ? 7 : typeConfig.duration
    const untilDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()

    setMembers((prev) =>
      prev.map((m) => {
        if (m.code === lanternTargetMember.code) {
          const updated = {
            ...m,
            merit_count: (m.merit_count || 0) + 1,
            extra_data: {
              ...(m.extra_data || {}),
              payment_status: typeConfig.amount === 0 ? 'settled' : adminLanternPaid ? 'settled' : 'pending',
              payment_date: typeConfig.amount === 0 ? todayStr : adminLanternPaid ? todayStr : '',
              recent_prayer_title: typeConfig.name,
              recent_prayer_date: todayStr,
              lantern_active_until: untilDate,
              lantern_lighted_at: new Date().toISOString(),
              lantern_type: typeConfig.name,
              recent_wish_text: newPrayer.wish_text,
              recent_wish_category: adminLanternCategory,
              payment_updated_at: new Date().toISOString(),
            },
          }
          if (supabase) {
            supabase
              .from('members')
              .update({
                merit_count: updated.merit_count,
                extra_data: updated.extra_data,
              })
              .eq('code', m.code)
              .then()
          }
          return updated
        }
        return m
      })
    )

    showToast(`🪔 [${lanternTargetMember.name}] 불자님의 [${typeConfig.name}]이 대웅전에 정성껏 밝혀졌습니다!`)
    setLanternTargetMember(null)
  }

  // 🪷 [종무행정 대웅전 소원등 켜기 접수 모달]
  const renderLanternModal = () => {
    if (!lanternTargetMember) return null
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="bg-[#FAF8F5] text-[#231F1C] w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#C59B27] space-y-4 my-auto">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6DEC8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1B1815] text-[#F5D061] flex items-center justify-center font-bold text-sm shadow">
                🪔
              </div>
              <div>
                <h3 className="font-serif-kr font-bold text-base text-[#1B1815]">
                  대웅전 소원등(인등) 정식 접수
                </h3>
                <p className="text-[11px] text-[#8C8071]">
                  {lanternTargetMember.name} {lanternTargetMember.dharma_name ? `(${lanternTargetMember.dharma_name})` : ''} 불자님 (대웅전 사시예불 축원 연동)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLanternTargetMember(null)}
              className="p-1.5 rounded-xl bg-white border border-[#DDD4C4] text-[#7A6E5E] hover:text-[#1B1815] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 소원등 종류 선택 */}
            <div>
              <label className="text-[11px] font-bold text-[#554E45] block mb-1">소원등 종류 선택</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lantern_1d', label: '1일 소원등', price: '무료 (0원)' },
                  { id: 'prayer_100d', label: '100일 특별기도', price: '100,000원' },
                  { id: 'indeung_1yr', label: '1년 인등(가족등)', price: '100,000원' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAdminLanternType(t.id)}
                    className={`p-2.5 rounded-2xl text-center border transition ${
                      adminLanternType === t.id
                        ? 'bg-[#1B1815] text-[#F5D061] border-[#1B1815] font-bold shadow-md'
                        : 'bg-white text-[#555555] border-[#DDD4C4] hover:bg-[#FAF3DF]'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{t.label}</div>
                    <div className={`text-[10px] mt-0.5 ${t.id === 'lantern_1d' ? 'text-emerald-600 font-bold' : 'text-[#A69B8D]'}`}>
                      {t.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 소원 카테고리 6대 분야 */}
            <div>
              <label className="text-[11px] font-bold text-[#554E45] block mb-1">소원 기원 분야 (6대 발원)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  '가족건강',
                  '사업번창',
                  '학업/시험합격',
                  '마음평안/소원성취',
                  '자녀축복/취업성취',
                  '액운소멸/무병장수',
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setAdminLanternCategory(cat)
                      setAdminLanternWish(PRAYER_CATEGORY_TEMPLATES[cat] || '')
                    }}
                    className={`py-2 px-1.5 rounded-xl text-center text-[11px] border transition ${
                      adminLanternCategory === cat
                        ? 'bg-[#FAF3DF] text-[#7A5B0B] border-[#E8D4A2] font-bold shadow-xs'
                        : 'bg-white text-[#666666] border-[#DDD4C4] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 부처님 전 발원문 */}
            <div>
              <label className="text-[11px] font-bold text-[#554E45] block mb-1">부처님 전 축원 발원문</label>
              <textarea
                rows={3}
                value={adminLanternWish}
                onChange={(e) => setAdminLanternWish(e.target.value)}
                className="w-full p-3 rounded-2xl bg-white border border-[#DDD4C4] text-xs text-[#222222] focus:outline-none focus:border-[#C59B27] shadow-inner"
                placeholder="간절한 소원과 축원 내용을 작성하세요."
              />
            </div>

            {/* 보시금 납부 여부 */}
            {adminLanternType === 'lantern_1d' ? (
              <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-[11.5px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1일 소원등은 매일 <strong>전액 무료(0원)</strong>로 밝혀집니다.</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-black">
                  무료 발원
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-white border border-[#E6DEC8] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[11px] text-[#554E45] block">보시금 납부 상태</span>
                  <span className="text-[10px] text-[#8C8071]">100,000원 정성 봉안</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAdminLanternPaid(true)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                      adminLanternPaid
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-[#FAF8F5] text-[#888888] border border-[#DDD4C4]'
                    }`}
                  >
                    입금완료 ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminLanternPaid(false)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${
                      !adminLanternPaid
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-[#FAF8F5] text-[#888888] border border-[#DDD4C4]'
                    }`}
                  >
                    입금대기 ⏳
                  </button>
                </div>
              </div>
            )}

            {/* 점등 버튼 */}
            <button
              type="button"
              onClick={handleAdminLightLantern}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#8A6510] text-[#1B1815] font-black text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 mt-2"
            >
              <Flame className="w-4 h-4 text-amber-950" />
              <span>대웅전 부처님 전에 소원등 즉시 밝히기</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 🪷 [종무행정 10만 신도 교적부 PC 와이드 4단 열(Multi-Column Grid) 종합 카드 컴포넌트]
  const renderMemberRowCard = (m) => {
    const pInfo = getMemberPrayerAndPaymentInfo(m)
    const zInfo = computeZodiacAndGanji(m.birth_year || (m.birth_date ? m.birth_date.slice(0, 4) : ''))
    const seju = m.family_members?.find((f) => f.relation?.includes('세주'))

    return (
      <div
        key={m.code}
        onClick={() => setActiveBelieverCode(m.code)}
        className={`p-4 sm:p-5 rounded-2xl transition cursor-pointer ${
          currentActiveBeliever?.code === m.code
            ? 'bg-[#FFFDF7] border-2 border-[#C59B27] shadow-md ring-2 ring-[#C59B27]/25'
            : 'bg-white border border-[#EAE2D3] hover:border-[#C59B27] hover:shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
          {/* ==================== 1열: 신도 기본 인적 & 연락처 (lg:col-span-2) ==================== */}
          <div className="lg:col-span-2 space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-base text-[#1B1815]">
                {m.name} {m.dharma_name ? `(${m.dharma_name})` : ''}
              </span>
              {zInfo.ganji && (
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-serif-kr font-bold text-[10.5px]">
                  {m.birth_year || (m.birth_date ? m.birth_date.slice(0, 4) : '')}년 ({zInfo.ganji} {zInfo.animal}띠)
                </span>
              )}
            </div>

            {/* 전화번호 & 거주지 주소 */}
            <div className="text-xs text-[#555555] space-y-0.5 pt-0.5">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8A6510] shrink-0" />
                <span className="font-mono font-bold text-[#1B1815]">{m.phone}</span>
                {m.tel && <span className="font-mono text-[#888888]">({m.tel})</span>}
              </div>
              <div className="text-[11.5px] text-[#777777] truncate" title={m.address}>
                🏠 {m.address || '제주특별자치도 제주시'}
              </div>
            </div>
          </div>

          {/* ==================== 2열: 🪔 대웅전 점등 상태 (독립 열 - 수직 일직선 정렬!) (lg:col-span-2) ==================== */}
          <div className="lg:col-span-2 space-y-1.5 lg:border-l lg:border-[#F0EAE1] lg:pl-3.5 min-w-0">
            <span className="lg:hidden text-[10.5px] font-bold text-[#8C8071] block">대웅전 점등 상태:</span>
            {pInfo.isLanternActive ? (
              <div className="space-y-1">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-50 via-amber-100 to-amber-200/90 text-amber-950 border border-amber-300 font-black text-xs shadow-xs cursor-pointer hover:brightness-95 transition"
                  onClick={() => {
                    setLanternTargetMember(m)
                    setAdminLanternType(pInfo.longestActiveLantern?.id || 'indeung_1yr')
                    setAdminLanternCategory('가족건강')
                    setAdminLanternWish(PRAYER_CATEGORY_TEMPLATES['가족건강'] || '')
                    setAdminLanternPaid(true)
                  }}
                  title={`[대웅전 3대 점등 현황]\n1. 1일등: ${pInfo.lanterns[0].active ? '🔥 점등' : '⚪ 소등'}\n2. 100일등: ${pInfo.lanterns[1].active ? `🔥 점등 (D-${pInfo.lanterns[1].daysLeft})` : '⚪ 소등'}\n3. 1년등: ${pInfo.lanterns[2].active ? `🔥 점등 (D-${pInfo.lanterns[2].daysLeft})` : '⚪ 소등'}\n(클릭 시 등 연장/점등창 열기)`}
                >
                  {/* 등 표시 3개 자리: 켜진 등 위치에 불꽃(🔥) 점등, 꺼진 위치에 회색 점(⚪) */}
                  <span className="flex items-center gap-1.5 mr-0.5" title="대웅전 점등 슬롯: 1일등 | 100일등 | 1년등">
                    {(pInfo.lanterns || []).map((lt) =>
                      lt.active ? (
                        <span key={lt.id} className="relative flex items-center justify-center w-3 h-3" title={`${lt.fullName}: 실시간 점등중`}>
                          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse drop-shadow-xs" />
                        </span>
                      ) : (
                        <span
                          key={lt.id}
                          className="w-2 h-2 rounded-full bg-stone-300 ring-1 ring-stone-300/80 shrink-0"
                          title={`${lt.fullName}: 소등`}
                        />
                      )
                    )}
                  </span>

                  <span>
                    {pInfo.longestActiveLantern?.id === 'lantern_1d'
                      ? '1일등 (점등)'
                      : `${pInfo.longestActiveLantern?.label} (D-${pInfo.longestActiveLantern?.daysLeft})`}
                  </span>
                </span>
                <span className="text-[10px] text-amber-800 font-medium block">
                  대웅전 실시간 축원 봉안
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setLanternTargetMember(m)
                    setAdminLanternType('lantern_1d')
                    setAdminLanternCategory('가족건강')
                    setAdminLanternWish(PRAYER_CATEGORY_TEMPLATES['가족건강'] || '')
                    setAdminLanternPaid(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-50 text-stone-500 hover:text-amber-800 border border-stone-200 hover:border-amber-300 transition text-[11px] font-medium shadow-xs"
                  title="3대 점등 미점등 상태 (클릭 시 소원등 즉시 켜기)"
                >
                  <span className="flex items-center gap-1.5 mr-0.5">
                    <span className="w-2 h-2 rounded-full bg-stone-300" />
                    <span className="w-2 h-2 rounded-full bg-stone-300" />
                    <span className="w-2 h-2 rounded-full bg-stone-300" />
                  </span>
                  <span>⚪ 소등 (등 미점등)</span>
                </button>
                <span className="text-[10px] text-stone-400 block">
                  부처님 전 점등 대기
                </span>
              </div>
            )}
          </div>

          {/* ==================== 3열: 🪷 부처님 전 축원 발원문 & 기원분야 (lg:col-span-2) ==================== */}
          <div className="lg:col-span-2 space-y-1.5 lg:border-l lg:border-[#F0EAE1] lg:pl-3.5 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="lg:hidden text-[10.5px] font-bold text-[#8C8071]">부처님 전 축원 발원:</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold shrink-0">
                {pInfo.wishCategory}
              </span>
            </div>

            {/* 실제 축원 발원문 카드 (클릭 시 점등/발원문 편집 모달 연결) */}
            <div
              className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] text-xs group hover:border-[#C59B27] hover:bg-[#FFFDF9] transition cursor-pointer"
              title={`[부처님 전 축원 발원문]\n기원분야: ${pInfo.wishCategory}\n내용: ${pInfo.wishText}\n(클릭 시 발원문 편집 및 점등)`}
              onClick={() => {
                setLanternTargetMember(m)
                setAdminLanternType(pInfo.longestActiveLantern?.id || 'indeung_1yr')
                setAdminLanternCategory(pInfo.wishCategory || '가족건강')
                setAdminLanternWish(pInfo.wishText)
                setAdminLanternPaid(pInfo.paymentStatus === 'settled')
              }}
            >
              <p className="text-[11px] text-[#3A332C] font-serif-kr line-clamp-2 leading-relaxed italic break-keep">
                "{pInfo.wishText}"
              </p>
            </div>

            {/* 가족 등록 정보가 있는 경우 보조 칩 표기 (있을 때만 표시) */}
            {m.family_members && m.family_members.length > 0 && (
              <div
                className="flex items-center gap-1 text-[10px] text-[#777777] truncate pt-0.5"
                title={`가족 명단: ${m.family_members.map((f) => `${f.name}(${f.relation})`).join(', ')}${seju ? ` | 세주: ${seju.name}` : ''}`}
              >
                <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-medium shrink-0">
                  가족 {m.family_members.length}인{seju ? ` (${seju.name})` : ''}
                </span>
                <span className="truncate">
                  {m.family_members.map((f) => f.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* ==================== 4열: 2번(기도·불사 접수) 왼쪽에, 1번(접수/입금날짜) 오른쪽에 나란히! (lg:col-span-4) ==================== */}
          <div className="lg:col-span-4 lg:border-l lg:border-[#F0EAE1] lg:pl-3.5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-3">
              {/* 2번: 🪔 기도·불사 접수 현황 */}
              <div className="space-y-1 min-w-0 shrink-0">
                <span className="lg:hidden text-[10.5px] font-bold text-[#8C8071] block">기도·불사 접수 현황:</span>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${pInfo.prayerBadgeColor}`}>
                    {pInfo.prayerTypeBadge}
                  </span>
                  <span className="text-[10.5px] text-[#8C8071]">공덕 {Number(m.merit_count || 0).toLocaleString()}</span>
                </div>
                <strong className="text-xs text-[#1B1815] block truncate font-serif-kr" title={pInfo.prayerTitle}>
                  {pInfo.prayerTitle}
                </strong>
                {pInfo.prayerTypeBadge === '미접수' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLanternTargetMember(m)
                      setAdminLanternType('lantern_1d')
                      setAdminLanternCategory('가족건강')
                      setAdminLanternWish(PRAYER_CATEGORY_TEMPLATES['가족건강'] || '')
                      setAdminLanternPaid(true)
                    }}
                    className="mt-0.5 text-[10.5px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
                  >
                    <Flame className="w-3 h-3 text-amber-600" />
                    <span>+ 소원등 켜기 접수</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-[#8C8071] block mt-0.5">
                    매일 사시예불 축원 연동중
                  </span>
                )}
              </div>

              {/* 1번: 📅 접수날짜 & 💳 입금날짜 분리 표기 (2번 오른쪽에 바로 붙여서 빈공간 축소!) */}
              <div className="p-2 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-1 text-xs shrink-0 min-w-[150px]">
                <div className="flex items-center justify-between text-[11px] gap-2">
                  <span className="text-[#777777] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#8A6510]" />
                    <span>접수날짜:</span>
                  </span>
                  <strong className="font-mono text-[#1B1815]">{pInfo.appliedDate}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-[#F0EAE1] gap-2">
                  <span className="text-[#777777] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8A6510]" />
                    <span>입금날짜:</span>
                  </span>
                  <strong className={`font-mono ${pInfo.paymentStatus === 'settled' ? 'text-emerald-700' : 'text-amber-700 font-bold'}`}>
                    {pInfo.paidDate}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 5열: 💰 보시금·입금처리 & 종무소 액션 (간략 2줄 구성!) (lg:col-span-2) ==================== */}
          <div className="lg:col-span-2 space-y-1.5 lg:border-l lg:border-[#F0EAE1] lg:pl-3.5 min-w-0">
            {/* 1줄: 보시금 입금 상태 배지 & 금액 & 원터치 토글 버튼 */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                {pInfo.paymentAmount === 0 ? (
                  <span className="px-1.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 font-black text-[10.5px] flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>무료</span>
                  </span>
                ) : pInfo.paymentStatus === 'settled' ? (
                  <span className="px-1.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10.5px] flex items-center gap-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                    <span>완납</span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10.5px] flex items-center gap-0.5 shrink-0">
                    <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                    <span>대기</span>
                  </span>
                )}
                <span className="font-mono font-bold text-xs text-[#1B1815] truncate">
                  {pInfo.paymentAmount === 0 ? '0원' : `${pInfo.paymentAmount.toLocaleString()}원`}
                </span>
              </div>

              {pInfo.paymentAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handleTogglePaymentStatus(m.code)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition border shrink-0 ${
                    pInfo.paymentStatus === 'settled'
                      ? 'bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#777777] border-[#DDD4C4]'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  }`}
                  title={pInfo.paymentStatus === 'settled' ? '입금 대기 상태로 변경' : '입금 완납 확인 처리'}
                >
                  {pInfo.paymentStatus === 'settled' ? '대기로' : '완납확인✓'}
                </button>
              )}
            </div>

            <div className="pt-1 border-t border-[#F0EAE1] flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-[#A09383]">클릭 시 선택</span>
              <span className="text-[10px] font-bold text-[#8A6510] bg-[#FAF3DF] px-2 py-0.5 rounded-md border border-[#E8D4A2]">
                상단 툴바 대상
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getRecommenderName = (parentCode) => {
    if (!parentCode) return '-'
    if (parentCode === '55570267') return '양영문 신도회장'
    if (parentCode === '33065540' || parentCode === '55400267') return '김철수 총괄위원장'
    if (parentCode === '53872248') return '유광수 포교위원장'
    if (parentCode === '83855838') return '오다혜 포교위원장'
    if (parentCode === '35651669') return '임평종 포교위원장'
    const parent = (members || []).find((m) => m.code === parentCode)
    return parent ? `${parent.name} (${parent.role === 'agent' ? '포교위원장' : parent.role === 'master' ? '총괄위원장' : parent.role === 'temple_admin' ? '신도회장' : '포교위원'})` : parentCode
  }


  // 수당 정산 원장 필터링
  const filteredSettlements = useMemo(() => {
    let list = settlements || []
    if (settlementStatusFilter !== 'all') {
      list = list.filter((s) => s.payment_status === settlementStatusFilter)
    }
    if (settlementAgentFilter !== 'all') {
      list = list.filter((s) => s.agent_1st_code === settlementAgentFilter)
    }
    return list
  }, [settlements, settlementStatusFilter, settlementAgentFilter])

  // 사찰 전산 통합 KPI 집계
  const adminKPIs = useMemo(() => {
    const totalMembers = members.length
    const totalBelievers = members.filter((m) => m.role === 'believer').length
    const totalAgents = members.filter((m) => m.role === 'agent' || m.role === 'committee_member').length
    const totalAdmins = members.filter((m) => m.role === 'temple_admin' || m.role === 'master').length
    const totalPrayersCount = activeSasiPrayers.length
    const totalSettlementAmount = settlements.reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0)
    const settledCount = settlements.filter((s) => s.payment_status === 'settled').length
    const confirmedCount = settlements.filter((s) => s.payment_status === 'confirmed').length
    const templeFund = Math.round(totalSettlementAmount * 0.5)
    const missionFund = totalSettlementAmount - templeFund
    return {
      totalMembers,
      totalBelievers,
      totalAgents,
      totalAdmins,
      totalPrayersCount,
      totalSettlementAmount,
      settledCount,
      confirmedCount,
      templeFund,
      missionFund,
    }
  }, [members, activeSasiPrayers, settlements])

  // 정산 원장 수당 지급 상태 원클릭 토글
  const handleToggleSettlementStatus = (id) => {
    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = s.payment_status === 'settled' ? 'confirmed' : 'settled'
          return { ...s, payment_status: next }
        }
        return s
      })
    )
    playSingingBowlSound()
    showToast('수당 지급 상태가 실시간 반영되었습니다.')
  }

  // 정산 원장 전체 복사 (카카오톡 및 회계 보고용)
  const handleCopySettlementsReport = () => {
    const lines = [
      `卍 [제주 소원사] 위패 봉안 및 수당 정산 원장 집계표`,
      `기준일: ${new Date().toLocaleDateString('ko-KR')}`,
      `총 봉안액: ${adminKPIs.totalSettlementAmount.toLocaleString()}원`,
      `사찰 불사금(50%): ${adminKPIs.templeFund.toLocaleString()}원`,
      `지급완료: ${adminKPIs.settledCount}건 / 수당확정(미지급): ${adminKPIs.confirmedCount}건`,
      `------------------------------------------------`,
      ...filteredSettlements.map((s, idx) => {
        const st = s.payment_status === 'settled' ? '[지급완료]' : '[수당확정]'
        return `${idx + 1}. ${s.believer_name} (${s.item_name}) | ${Number(s.total_amount).toLocaleString()}원 | 유치: ${s.agent_1st_name} | 상태: ${st}`
      }),
      `------------------------------------------------`,
      `디지털 전산 총괄: 제주AI파트너 (Platform © Jeju AI Partner)`,
    ]
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n'))
      showToast('📋 정산 집계표가 복사되었습니다! 카톡이나 메모장에 붙여넣으실 수 있습니다.')
    }
  }

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

  // 🪷 [오전 11시 사시예불 축원 원만회향 알림 팝업 감지 엔진]
  // 소원등을 켰던 신도님이 11:00 예불 회향 이후 접속 시 감동의 회향 팝업 1회 노출
  useEffect(() => {
    if (hoehangDismissedRef.current) return

    const now = new Date()
    const todayKey = formatLocalDateKey(now)
    const isPast11AM = now.getHours() >= 11

    // 이미 오늘 회향 팝업을 확인했으면 재노출 안 함 (localStorage + sessionStorage 2중 체크)
    const seenKey = `sowonsa_hoehang_seen_${todayKey}`
    try {
      if (localStorage.getItem(seenKey) === 'true' || sessionStorage.getItem(seenKey) === 'true') {
        hoehangDismissedRef.current = true
        return
      }
    } catch (e) {}

    // 1) localStorage 7일 소원등 데이터 확인
    let candidate = null
    try {
      const raw = localStorage.getItem('sowonsa_7day_lantern')
      if (raw) {
        const parsed = JSON.parse(raw)
        // 오늘이 회향일(sasi_date_key === todayKey)이고 11시가 지났거나 회향 만료된 경우 (이미 회향 확인한 경우 제외)
        if (parsed.sasi_date_key === todayKey && isPast11AM && !parsed.hoehang_seen) {
          candidate = parsed
        }
      }
    } catch (e) {}

    // 2) prayers 배열에서 본인 최근 기도 확인
    if (!candidate && prayers && prayers.length > 0) {
      const cleanUserPhone = (currentUser?.phone || wishPhone || '').replace(/[^0-9]/g, '')
      const userCode = currentUser?.code || ''
      const userName = currentUser?.name || wishName || ''

      if (cleanUserPhone || userCode || userName) {
        const myPrayer = prayers.find((p) => {
          if (!p || !p.created_at) return false
          const pTime = new Date(p.created_at).getTime()
          if (isNaN(pTime)) return false
          const pPhone = (p.believer_phone || '').replace(/[^0-9]/g, '')
          const pCode = p.member_code || ''
          const pName = p.believer_name || ''
          const isMe =
            (cleanUserPhone && pPhone && cleanUserPhone === pPhone) ||
            (userCode && pCode && userCode === pCode) ||
            (userName && pName && (pName.includes(userName) || userName.includes(pName)))
          if (!isMe) return false
          const sched = computeSasiSchedule(pTime)
          return sched.sasiDateKey === todayKey && isPast11AM
        })
        if (myPrayer) {
          candidate = {
            believer_name: myPrayer.believer_name,
            believer_phone: myPrayer.believer_phone || currentUser?.phone || '',
            wish_category: myPrayer.wish_category || '대웅전 소원등',
            wish_text: myPrayer.wish_text || '',
            streak: userLanternStats.streak,
            total_count: userLanternStats.totalCount,
            sasi_date_key: todayKey,
          }
        }
      }
    }

    if (candidate) {
      setHoehangModalData(candidate)
    }
  }, [currentUser, prayers, wishPhone, wishName, lanternData])

  // 클라우드 및 계정 연동 7일 소원등 자동 동기화 (기기 간 실시간 동기화: PC에서 켜면 폰에서도 자동 점등)
  useEffect(() => {
    if (!prayers || prayers.length === 0) return

    // 현재 로그인된 회원 또는 폼 입력 정보 기준 매칭
    const cleanUserPhone = (currentUser?.phone || wishPhone || '').replace(/[^0-9]/g, '')
    const userCode = currentUser?.code || ''
    const userName = currentUser?.name || wishName || ''

    if (!cleanUserPhone && !userCode && !userName) return

    const myLatestPrayer = prayers.find((p) => {
      if (!p || !p.created_at) return false
      const parsedTime = new Date(p.created_at).getTime()
      if (isNaN(parsedTime)) return false
      const pCat = p.wish_category || ''
      if (
        pCat.includes('위패') ||
        pCat.includes('생전예수재') ||
        pCat.includes('삼성각') ||
        pCat.includes('기와') ||
        pCat.includes('단청') ||
        pCat.includes('명패') ||
        pCat.includes('인등') ||
        pCat.includes('100일') ||
        pCat.includes('49재') ||
        pCat.includes('천도재') ||
        pCat.includes('공양미')
      ) {
        return false
      }
      const pPhone = (p.believer_phone || '').replace(/[^0-9]/g, '')
      const pCode = p.member_code || ''
      const pName = p.believer_name || ''

      const matchPhone = cleanUserPhone && pPhone && cleanUserPhone === pPhone
      const matchCode = userCode && pCode && userCode === pCode
      const matchName = userName && pName && (pName.includes(userName) || userName.includes(pName))

      return matchPhone || matchCode || matchName
    })

    if (myLatestPrayer) {
      const prayerTime = new Date(myLatestPrayer.created_at).getTime()
      const schedule = computeSasiSchedule(prayerTime)

      if (schedule.expireAt > Date.now()) {
        const syncedLantern = {
          member_code: myLatestPrayer.member_code || currentUser?.code || '',
          believer_name: myLatestPrayer.believer_name,
          believer_phone: myLatestPrayer.believer_phone || currentUser?.phone || '',
          wish_category: myLatestPrayer.wish_category || '가족건강',
          wish_text: myLatestPrayer.wish_text || '',
          lit_at: prayerTime,
          expire_at: schedule.expireAt,
          sasi_date_key: schedule.sasiDateKey,
          streak: userLanternStats.streak,
          total_count: userLanternStats.totalCount,
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
  const [sutraDailyVersion, setSutraDailyVersion] = useState(0)
  const [moktakDailyVersion, setMoktakDailyVersion] = useState(0)
  const [showMeritCertModal, setShowMeritCertModal] = useState(false)
  const [meritCertType, setMeritCertType] = useState('lantern') // 'lantern' | 'sutra'
  const [isCapturingCert, setIsCapturingCert] = useState(false)
  const meritCertRef = useRef(null)
  const [moktakCount, setMoktakCount] = useState(0)
  const [guestMeritCount, setGuestMeritCount] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonpray_guest_merit')
      return saved ? parseInt(saved, 10) || 0 : 0
    } catch {
      return 0
    }
  })

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

  // 한국어 음성 낭독 상태 및 오디오 제어 (클라우드 고음질 MP3 + Web Speech 하이브리드)
  // autoVoiceEnabled: 사용자가 🔊 소리를 켜둔 상태를 기억하여 '다른 말씀'이나 다른 경전 클릭 시에도 자동으로 낭독 유지
  const [speakingId, setSpeakingId] = useState(null)
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(false)
  const speechAudioRef = useRef(null)

  // 모바일 브라우저 음성 목록 사전 로드 (Web Speech API 백업용)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.getVoices()
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices()
        }
      }
    } catch (e) {}
  }, [])

  const stopSpeech = (disableAuto = false) => {
    // 1. 진행 중인 클라우드 오디오 스트림 즉각 정지
    try {
      if (speechAudioRef.current) {
        speechAudioRef.current.pause()
        speechAudioRef.current.currentTime = 0
        speechAudioRef.current = null
      }
    } catch (e) {}

    // 2. 브라우저 내장 Web Speech API 정지
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    } catch (e) {}

    setSpeakingId(null)
    if (disableAuto) {
      setAutoVoiceEnabled(false)
    }
  }

  // 2차 백업: 기기 내장 Web Speech API 발성
  const fallbackToWebSpeech = (id, cleanText) => {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setSpeakingId(null)
        return
      }
      const u = new SpeechSynthesisUtterance(cleanText)
      u.lang = 'ko-KR'
      u.rate = 0.92
      u.pitch = 1.0
      u.onend = () => setSpeakingId(null)
      u.onerror = () => setSpeakingId(null)
      window.__activeUtterance = u
      setSpeakingId(id)
      window.speechSynthesis.speak(u)
    } catch (e) {
      setSpeakingId(null)
    }
  }

  // 강제 새 낭독 시작 (다른 말씀 / 다른 경전 클릭 시 음성 모드 유지하면서 즉시 새 말씀 낭독)
  const startSpeech = (id, rawText) => {
    try {
      // 진행 중인 이전 음성만 멈춤 (autoVoiceEnabled 유지)
      if (speechAudioRef.current) {
        try {
          speechAudioRef.current.pause()
          speechAudioRef.current = null
        } catch (e) {}
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel()
        } catch (e) {}
      }

      // 괄호 한자 등 정제
      const cleanText = String(rawText || '')
        .replace(/\([一-龥\s·,]+\)/g, '')
        .replace(/[《》“”"']/g, ' ')
        .replace(/[①②③④⑤]/g, '')
        .replace(/·/g, ', ')
        .replace(/\s+/g, ' ')
        .trim()

      if (!cleanText) {
        setSpeakingId(null)
        return
      }

      setSpeakingId(id)

      // 목탁 소리처럼 HTML5 Audio 객체로 즉시 재생
      const audioUrl = '/api/tts?text=' + encodeURIComponent(cleanText)
      const audio = new Audio(audioUrl)
      audio.preload = 'auto'
      speechAudioRef.current = audio

      audio.onended = () => {
        setSpeakingId(null)
        speechAudioRef.current = null
      }

      audio.onerror = () => {
        speechAudioRef.current = null
        fallbackToWebSpeech(id, cleanText)
      }

      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          speechAudioRef.current = null
          fallbackToWebSpeech(id, cleanText)
        })
      }
    } catch (e) {
      setSpeakingId(null)
    }
  }

  // 사용자가 🔊 스피커 버튼을 직접 눌렀을 때 토글:
  // - 켜져 있거나 자동 음성 모드일 때 누르면: 완전히 소리를 끄고 비활성화 (autoVoiceEnabled = false)
  // - 꺼져 있을 때 누르면: 소리를 켜고 자동 음성 모드 활성화 (autoVoiceEnabled = true) -> 다른 말씀 넘겨도 계속 낭독!
  const toggleSpeech = (id, rawText) => {
    if (speakingId === id || autoVoiceEnabled) {
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
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [rememberLogin, setRememberLogin] = useState(() => {
    try {
      return localStorage.getItem('sowonpray_remember_login') !== 'false'
    } catch {
      return true
    }
  })
  const [loginIdInput, setLoginIdInput] = useState(() => {
    try {
      return localStorage.getItem('sowonpray_saved_login_id') || ''
    } catch {
      return ''
    }
  })
  const [loginPwInput, setLoginPwInput] = useState(() => {
    try {
      return localStorage.getItem('sowonpray_saved_login_pw') || ''
    } catch {
      return ''
    }
  })

  // 비밀번호 관리에 저장된 계정 목록 (중복 없이 8자리 고유코드 기준 관리)
  const [savedLoginAccounts, setSavedLoginAccounts] = useState(() => {
    const defaultAccounts = [
      { code: '33065540', phone: '010-3306-5540', name: '김철수', dharma_name: '보현행', pw: '4157' },
      { code: '99085540', phone: '010-9908-5540', name: '김나현', dharma_name: '', pw: '5540' },
      { code: '55570267', phone: '010-5557-0267', name: '양영문', dharma_name: '창건주', pw: '0267' },
    ]
    try {
      const saved = localStorage.getItem('sowonpray_saved_accounts_v2')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map()
          ;[...defaultAccounts, ...parsed].forEach((item) => {
            if (item && (item.code || item.phone)) {
              const code8 = extractPhone8Code(item.code || item.phone)
              map.set(code8, {
                ...item,
                code: code8,
                phone: formatPhone11(item.phone || code8),
              })
            }
          })
          return Array.from(map.values())
        }
      }
      return defaultAccounts
    } catch {
      return defaultAccounts
    }
  })

  // 로그인 아이디(전화번호)가 변경되거나 브라우저에서 자동완성될 때 해당 계정의 비밀번호로 자동 동기화
  const lastSyncedCodeRef = useRef('')
  const getExpectedPwForId = (rawId) => {
    let code8 = extractPhone8Code(rawId)
    if (code8 === '49121083') {
      code8 = '55570267'
    }
    if (!code8 || code8.length < 8) return ''
    const foundMember = members.find((m) => m.code === code8)
    const foundSaved = (savedLoginAccounts || []).find((a) => a.code === code8)
    const phoneLast4 = (foundMember?.phone || foundSaved?.phone || code8)
      .replace(/[^0-9]/g, '')
      .slice(-4)
    return (
      (foundMember?.password_pin && foundMember.password_pin.trim()) ||
      (foundSaved?.pw && foundSaved.pw.trim()) ||
      phoneLast4 ||
      '0000'
    )
  }

  useEffect(() => {
    let code8 = extractPhone8Code(loginIdInput)
    if (code8 === '49121083') code8 = '55570267'
    if (code8 && code8.length >= 8) {
      if (code8 !== lastSyncedCodeRef.current) {
        lastSyncedCodeRef.current = code8
        const expectedPw = getExpectedPwForId(code8)
        if (expectedPw) {
          setLoginPwInput(expectedPw)
        }
      }
    } else {
      lastSyncedCodeRef.current = ''
    }
  }, [loginIdInput, members, savedLoginAccounts])

  // 신규 회원가입 입력 상태
  const [signupName, setSignupName] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPw, setSignupPw] = useState('')
  const [signupDharmaName, setSignupDharmaName] = useState('')
  const [signupBirthDate, setSignupBirthDate] = useState('')
  const [signupLunarSolar, setSignupLunarSolar] = useState('음력')
  const [signupAddress, setSignupAddress] = useState('')
  const [signupFamilyMemo, setSignupFamilyMemo] = useState('')

  // 포교위원 전산 탭: 총괄대표(master)일 때는 위원 선택 조회 가능, 일반 포교위원장일 때는 본인 고정
  const [selectedAgentCode, setSelectedAgentCode] = useState('33065540')
  useEffect(() => {
    if (
      currentUser &&
      (currentUser.role === 'agent' ||
        currentUser.role === 'temple_admin' ||
        currentUser.role === 'master')
    ) {
      setSelectedAgentCode(currentUser.code)
    }
  }, [currentUser])

  const activeAgent = useMemo(() => {
    if (currentUser?.role === 'agent') {
      return currentUser
    }
    return (
      members.find((m) => m.code === selectedAgentCode) ||
      currentUser ||
      members[0]
    )
  }, [members, selectedAgentCode, currentUser])

  // 현재 포교위원(activeAgent)의 산하 인연 신도 및 위원 목록 (직속 + 하위 모든 세대 전법 계보 무제한 심층 탐색)
  // [규칙] 오다혜, 유광수, 임평종 등 타 포교위원장(agent/master) 산하 회원을 제외한
  // 본인 산하의 모든 세대(2세대, 3세대, 4세대... n세대 무제한 심층 계보 전체)를 전부 누적 합산!
  const myAffiliatedMembers = useMemo(() => {
    if (!members || members.length === 0) return []
    if (!activeAgent || !activeAgent.code) return []

    const rootCode = activeAgent.code
    const downlineCodes = new Set()
    let queue = [rootCode]

    while (queue.length > 0) {
      const parentCode = queue.shift()
      members.forEach((m) => {
        // activeAgent의 하위로 등록된 인연 회원만 수집 (상위 추천인 및 양영문 회장님 절대 미포함)
        if (m.parent_code === parentCode && !downlineCodes.has(m.code) && m.code !== rootCode && m.role !== 'temple_admin') {
          // 타 포교위원장(agent/master/CHAIRMEN_CODES)의 산하 신도는 해당 위원장의 고유 실적이므로 제외
          if (parentCode !== rootCode) {
            const parentMember = members.find((p) => p.code === parentCode)
            if (parentMember && (parentMember.role === 'agent' || parentMember.role === 'master' || CHAIRMEN_CODES.includes(parentMember.code))) {
              return
            }
          }
          downlineCodes.add(m.code)
          // 직속 위원(agent/master/CHAIRMEN_CODES)의 하위 회원은 해당 위원장의 고유 실적이므로 더 깊이 탐색(queue.push)하지 않음!
          const isAgentOrChairman = m.role === 'agent' || m.role === 'master' || CHAIRMEN_CODES.includes(m.code)
          if (!isAgentOrChairman) {
            queue.push(m.code)
          }
        }
      })
    }

    // 만약 activeAgent가 포교위원장/마스터인 경우 본인도 명부에 표기할지 여부:
    // 산하 명부는 activeAgent의 '산하 회원들' 목록이므로 downlineCodes만 필터링!
    return members.filter((m) => downlineCodes.has(m.code))
  }, [members, activeAgent])

  // 현재 로그인 회원(currentUser)의 산하 인연 신도/위원 목록 및 통계 (실시간 동적 자동 집계)
  // [규칙] 타 포교위원장 산하 회원을 제외한, 본인 산하의 모든 세대(2세대, 3세대, 4세대... n세대 무제한 심층 계보 전체)를 전부 누적 합산!
  const currentUserAffiliatedMembers = useMemo(() => {
    if (!members || members.length === 0 || !currentUser?.code) return []
    const rootCode = currentUser.code
    const downlineCodes = new Set()
    let queue = [rootCode]

    while (queue.length > 0) {
      const parentCode = queue.shift()
      members.forEach((m) => {
        if (m.parent_code === parentCode && !downlineCodes.has(m.code) && m.code !== rootCode && m.role !== 'temple_admin') {
          // 타 포교위원장(agent/master/CHAIRMEN_CODES)의 산하 신도는 해당 위원장의 고유 실적이므로 탐색 제외
          if (parentCode !== rootCode) {
            const parentMember = members.find((p) => p.code === parentCode)
            if (parentMember && (parentMember.role === 'agent' || parentMember.role === 'master' || CHAIRMEN_CODES.includes(parentMember.code))) {
              return
            }
          }
          downlineCodes.add(m.code)
          // 직속 위원(agent/master/CHAIRMEN_CODES)의 하위 신도는 해당 위원장의 고유 실적이므로 더 이상 하위 큐에 추가하지 않음
          const isAgentOrChairman = m.role === 'agent' || m.role === 'master' || CHAIRMEN_CODES.includes(m.code)
          if (!isAgentOrChairman) {
            queue.push(m.code)
          }
        }
      })
    }
    return members.filter((m) => downlineCodes.has(m.code))
  }, [members, currentUser])

  // 현재 회원의 산하 인연 신도수 (동적 계산 우선 반영)
  const currentUserBelieversCount = useMemo(() => {
    const dynamicCount = currentUserAffiliatedMembers.filter((m) => m.role === 'believer').length
    if (dynamicCount > 0 || currentUserAffiliatedMembers.length > 0) {
      return dynamicCount
    }
    return Number(currentUser?.believers_count) || 0
  }, [currentUserAffiliatedMembers, currentUser])

  // 현재 회원의 산하 위패 봉안수 (동적 계산 및 DB값 중 최대치 보장)
  const currentUserWipaeCount = useMemo(() => {
    const dynamicWipae = currentUserAffiliatedMembers.reduce((sum, m) => sum + (Number(m.wipae_count) || 0), 0)
    return Math.max(dynamicWipae, Number(currentUser?.wipae_count) || 0)
  }, [currentUserAffiliatedMembers, currentUser])

  // 한국 기준(KST) 오늘 날짜 키 (자정 리셋 정확도 100% 보장: YYYY-MM-DD)
  const getTodayDateKey = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  // 💰 실시간 신행 복덕 보시금 연산 (법연 1,000원 + 포교위원장 산하 1,000원 + [매일 3대 신행 최대 1,000원: 등 200원 + 사경 300원 + 목탁 500원])
  const userMeritReward = useMemo(() => {
    if (!currentUser) {
      return {
        isAgent: false,
        directBelieversCount: 0,
        directBelieversReward: 0,
        indirectBelieversCount: 0,
        indirectBelieversReward: 0,
        believersCount: 0,
        believersReward: 0,
        lanternCount: 0,
        lanternReward: 0,
        sutraCount: 0,
        sutraReward: 0,
        todaySutraRewardCount: 0,
        totalReward: 0,
      }
    }

    const isAgent =
      currentUser?.role === 'agent' ||
      currentUser?.role === 'master' ||
      currentUser?.role === 'committee_head' ||
      currentUser?.role === 'committee_member' ||
      currentUser?.role === 'temple_admin'

    // 1) 법연 연결 (직접 맺은 신도: 1인당 1,000원)
    const directBelieversCount = currentUserAffiliatedMembers.filter(
      (m) => m.parent_code === currentUser.code && m.role === 'believer'
    ).length
    const directBelieversReward = directBelieversCount * 1000

    // 2) 포교위원장 전용: 산하 전체 신규 가입자 1인당 1,000원 추가 (산하 전법 육성 보시금)
    // 타 포교위원장(유광수, 오다혜, 임평종 등) 산하를 제외한 본인 산하 모든 세대(2세대, 3세대, 4세대... n세대 무제한 심층 계보 전체) 인원 전부 실시간 반영
    const rawIndirectCount = currentUserAffiliatedMembers.filter(
      (m) => m.parent_code !== currentUser.code && m.role === 'believer'
    ).length
    const indirectBelieversCount = isAgent ? rawIndirectCount : 0
    const indirectBelieversReward = indirectBelieversCount * 1000

    // 총 법연 합계
    const believersCount = isAgent ? directBelieversCount + indirectBelieversCount : directBelieversCount
    const believersReward = directBelieversReward + indirectBelieversReward

    // 3) 소원등 점등: 1회당 200원 (실제 1일 소원등 접수 장부 기록이나 점등 이력이 있는 경우에만 정확히 계산)
    const hasLanternRecord = Boolean(
      (userLanternStats?.prayersCount && userLanternStats.prayersCount > 0) ||
      isLanternLit ||
      (lanternData && lanternData.lit_at) ||
      (Number(currentUser?.lantern_count) > 0)
    )
    const lanternCount = hasLanternRecord
      ? Math.max(userLanternStats?.prayersCount || 0, lanternData?.total_count || 0, isLanternLit ? 1 : 0, Number(currentUser?.lantern_count) || 0)
      : 0
    const lanternReward = lanternCount * 200

    // 4) 한줄사경: 1회당 100원 (1일 최대 3회 = 300원 적립된 정식 횟수만 반영)
    let storedSutra = 0
    try {
      storedSutra =
        Number(localStorage.getItem(`sowonpray_sutra_reward_count_${currentUser.code}`)) ||
        Number(localStorage.getItem(`sowonpray_sutra_count_${currentUser.code}`)) ||
        0
    } catch (e) {}
    const dbSutra = Number(currentUser.sutra_reward_count || currentUser.sutra_count) || 0
    const sutraCount = Math.max(dbSutra, storedSutra)
    const sutraReward = sutraCount * 100

    // 오늘 적립한 사경 횟수 (1일 최대 3회 제한 = 300원)
    const todayKey = getTodayDateKey()
    let todaySutraCount = 0
    try {
      todaySutraCount = Number(localStorage.getItem(`sowonpray_sutra_daily_${currentUser.code}_${todayKey}`)) || 0
    } catch (e) {}
    const todaySutraRewardCount = Math.min(3, todaySutraCount)

    // 5) 108 목탁멍: 1회당 500원 (1일 최대 1회 제한, 정성이 담긴 108타 완주 회향 시 적립)
    let storedMoktak = 0
    try {
      storedMoktak =
        Number(localStorage.getItem(`sowonpray_moktak_reward_count_${currentUser.code}`)) ||
        Number(localStorage.getItem(`sowonpray_moktak_count_${currentUser.code}`)) ||
        0
    } catch (e) {}
    const dbMoktak = Number(currentUser.moktak_reward_count || currentUser.moktak_count) || 0
    const moktakCount = Math.max(dbMoktak, storedMoktak)
    const moktakReward = moktakCount * 500

    // 오늘 적립한 목탁 횟수 (1일 최대 1회 제한 = 500원)
    let todayMoktakCount = 0
    try {
      todayMoktakCount = Number(localStorage.getItem(`sowonpray_moktak_daily_${currentUser.code}_${todayKey}`)) || 0
    } catch (e) {}
    const todayMoktakRewardCount = Math.min(1, todayMoktakCount)

    // 6) 총 합계 실시간 반영 (1일 3대 신행 매일 최대 1,000원 = 소원등 200원 + 사경 3회 300원 + 목탁 500원)
    const totalReward = believersReward + lanternReward + sutraReward + moktakReward

    return {
      isAgent,
      directBelieversCount,
      directBelieversReward,
      indirectBelieversCount,
      indirectBelieversReward,
      believersCount,
      believersReward,
      lanternCount,
      lanternReward,
      sutraCount,
      sutraReward,
      todaySutraRewardCount,
      moktakCount,
      moktakReward,
      todayMoktakRewardCount,
      totalReward,
    }
  }, [currentUser, currentUserAffiliatedMembers, currentUserBelieversCount, userLanternStats, isLanternLit, lanternData, sutraDailyVersion, moktakDailyVersion])

  // 🌿 현재 로그인 회원의 산하 인연 신도 최근 가입순(최신순) 정렬 목록 & 필터 상태
  const [infoAffiliatedMode, setInfoAffiliatedMode] = useState('list') // 'list' | 'tree'
  const [recentMembersFilter, setRecentMembersFilter] = useState('all') // 'all' | 'direct'
  const [showAllRecentMembers, setShowAllRecentMembers] = useState(false)

  const recentAffiliatedMembers = useMemo(() => {
    return [...currentUserAffiliatedMembers].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime()
      const timeB = new Date(b.created_at || 0).getTime()
      if (timeB !== timeA) return timeB - timeA
      return String(b.code || '').localeCompare(String(a.code || ''))
    })
  }, [currentUserAffiliatedMembers])

  // 산하 인연 회원 실시간 검색 & 필터링
  const filteredAffiliatedMembers = useMemo(() => {
    let list = myAffiliatedMembers || []
    if (adminMemberRoleFilter !== 'all') {
      if (adminMemberRoleFilter === 'believer') {
        list = list.filter((m) => m.role === 'believer')
      } else if (adminMemberRoleFilter === 'agent') {
        list = list.filter((m) => m.role === 'agent' || m.role === 'master')
      } else if (adminMemberRoleFilter === 'committee_member') {
        list = list.filter((m) => m.role === 'committee_member')
      }
    }
    if (adminMemberSearchQuery.trim()) {
      const q = adminMemberSearchQuery.trim().toLowerCase()
      const rawNum = q.replace(/[^0-9]/g, '')
      list = list.filter((m) => {
        const nameMatch = m.name?.toLowerCase().includes(q)
        const dharmaMatch = m.dharma_name?.toLowerCase().includes(q)
        const phoneMatch = rawNum && m.phone?.replace(/[^0-9]/g, '').includes(rawNum)
        const codeMatch = m.code?.includes(q)
        const addrMatch = m.address?.toLowerCase().includes(q)
        return nameMatch || dharmaMatch || phoneMatch || codeMatch || addrMatch
      })
    }
    return list
  }, [myAffiliatedMembers, adminMemberRoleFilter, adminMemberSearchQuery])

  // 모바일법당 A4 인쇄용 필터링
  const filteredPrintMembers = useMemo(() => {
    let list = myAffiliatedMembers || members || []
    if (memberPrintRoleFilter !== 'all') {
      if (memberPrintRoleFilter === 'believer') {
        list = list.filter((m) => m.role === 'believer')
      } else if (memberPrintRoleFilter === 'agent') {
        list = list.filter((m) => m.role === 'agent' || m.role === 'master')
      } else if (memberPrintRoleFilter === 'leadership') {
        list = list.filter((m) => m.role === 'temple_admin')
      }
    }
    if (memberPrintSearchQuery.trim()) {
      const q = memberPrintSearchQuery.trim().toLowerCase()
      const rawNum = q.replace(/[^0-9]/g, '')
      list = list.filter((m) => {
        const nameMatch = m.name?.toLowerCase().includes(q)
        const dharmaMatch = m.dharma_name?.toLowerCase().includes(q)
        const phoneMatch = rawNum && m.phone?.replace(/[^0-9]/g, '').includes(rawNum)
        const codeMatch = m.code?.includes(q)
        const addrMatch = m.address?.toLowerCase().includes(q)
        return nameMatch || dharmaMatch || phoneMatch || codeMatch || addrMatch
      })
    }
    return list
  }, [myAffiliatedMembers, members, memberPrintRoleFilter, memberPrintSearchQuery])

  // 총괄 정산 탭 신규 위패 시뮬레이션 입력 상태
  const [simBelieverName, setSimBelieverName] = useState('')
  const [simItemType, setSimItemType] = useState('생전예수재 황금위패 (1기)')
  const [simAmount, setSimAmount] = useState(2000000)
  const [simAgentCode, setSimAgentCode] = useState('33065540')

  // 입력된 신도 성함에 따라 기존 신도 및 유치 포교위원장 실시간 자동 매칭
  const matchedBelieverForSettlement = useMemo(() => {
    if (!simBelieverName.trim()) return null
    const raw = simBelieverName.trim()
    const clean = raw.replace(/\s*\(.*?\).*/g, '').trim()
    let found = members.find((m) => m.code === raw || m.code === clean)
    if (found) return found
    found = members.find((m) => m.name === raw || m.name === clean)
    if (found) return found
    found = members.find(
      (m) =>
        (clean.length >= 2 && m.name.includes(clean)) ||
        (m.dharma_name && clean.length >= 2 && m.dharma_name.includes(clean))
    )
    return found || null
  }, [simBelieverName, members])

  // 신도 성함 입력 시 유치 위원장 자동 매칭 핸들러
  const handleBelieverNameInput = (val) => {
    setSimBelieverName(val)
    if (!val.trim()) return
    const raw = val.trim()
    const clean = raw.replace(/\s*\(.*?\).*/g, '').trim()
    const found =
      members.find((m) => m.code === raw || m.code === clean) ||
      members.find((m) => m.name === raw || m.name === clean) ||
      (clean.length >= 2
        ? members.find(
            (m) =>
              m.name.includes(clean) ||
              (m.dharma_name && m.dharma_name.includes(clean))
          )
        : null)

    if (found) {
      // 신도의 직속 상위 추천인(parent_code)으로 100% 자동 매칭
      // (예: 유광수·오다혜·임평종 -> 상위 추천인 김철수 총괄대표, 김철수 -> 양영문 신도회장, 일반신도 -> 담당 위원장)
      if (found.parent_code) {
        setSimAgentCode(found.parent_code)
      } else {
        setSimAgentCode(found.code)
      }
    }
  }

  // 총괄 관리자용 신규 포교사/회원 등록 입력 상태
  const [adminNewName, setAdminNewName] = useState('')
  const [adminNewDharma, setAdminNewDharma] = useState('')
  const [adminNewPhone, setAdminNewPhone] = useState('')
  const [adminNewRole, setAdminNewRole] = useState('agent')
  const [adminNewParent, setAdminNewParent] = useState('55570267')

  // [종무소 종합 전산 ERP 모드]: 'family' (신도 & 가족 사주 전문 등록) | 'quick' (포교위원 빠른 등록) | 'excel' (기존 전산 엑셀 일괄 등록)
  const [adminRegMode, setAdminRegMode] = useState('family')

  // 종무소 신도 & 가족 사주 전문 등록 폼 상태
  const [regBelieverName, setRegBelieverName] = useState('')
  const [regBelieverDharma, setRegBelieverDharma] = useState('')
  const [regBelieverPhone, setRegBelieverPhone] = useState('')
  const [regBelieverAddress, setRegBelieverAddress] = useState('제주특별자치도 제주시 ')
  const [regBelieverParent, setRegBelieverParent] = useState('55570267') // 종무소 ERP 기본: 1번 본사(양영문 창건주 회장) 귀속
  const [regPrayerType, setRegPrayerType] = useState('none') // 'none' | 'lantern_1d' | 'prayer_100d' | 'indeung_1yr' | 'jesujae'
  const [regWishText, setRegWishText] = useState('')
  const [regFamilyList, setRegFamilyList] = useState([
    { id: 'fm-init-1', relation: '세주(가장)', name: '', birth_year: '', birth_date: '', lunar_solar: '음력', dharma_name: '' },
    { id: 'fm-init-2', relation: '배우자', name: '', birth_year: '', birth_date: '', lunar_solar: '음력', dharma_name: '' },
  ])

  // 기존 전산 엑셀 일괄 등록 폼 상태
  const [excelPasteText, setExcelPasteText] = useState('')
  const [excelParsedRows, setExcelParsedRows] = useState([])
  const [isExcelUploading, setIsExcelUploading] = useState(false)

  // 신도 상세 카드 편집 모드 및 편집 폼 상태
  const [isEditingMember, setIsEditingMember] = useState(false)
  const [memberEditForm, setMemberEditForm] = useState(null)

  // 로그인 핸들러
  const handleLogin = (e) => {
    e.preventDefault()
    let code8 = extractPhone8Code(loginIdInput)
    // 구 종무소 번호(010-4912-1083)로 로그인 시도 시에도 공식 단일 계정(010-5557-0267)으로 자동 연동
    if (code8 === '49121083') {
      code8 = '55570267'
    }
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
    const isPwValid = Boolean(
      (inputPw && inputPw === expectedPw) ||
      (found.code === '55570267' && (inputPw === '0267' || inputPw === '1083' || inputPw === '0000'))
    )

    if (!isPwValid) {
      showToast('비밀번호가 일치하지 않습니다. (초기 비밀번호: 휴대전화 뒷 4자리 또는 0000)')
      return
    }
    setCurrentUserCode(found.code)
    // 비밀번호 관리 계정 목록에 중복 없이 8자리 고유코드 기준으로 저장/갱신
    const phoneFull = formatPhone11(found.phone || loginIdInput)
    const newEntry = {
      code: found.code,
      phone: phoneFull,
      name: found.name,
      dharma_name: found.dharma_name || '',
      pw: inputPw,
      lastLogin: Date.now(),
    }
    setSavedLoginAccounts((prev) => {
      const filtered = (prev || []).filter((item) => item.code !== found.code)
      const updated = [newEntry, ...filtered].slice(0, 5)
      try {
        localStorage.setItem('sowonpray_saved_accounts_v2', JSON.stringify(updated))
      } catch (e) {}
      return updated
    })
    if (rememberLogin) {
      try {
        localStorage.setItem('sowonpray_remember_login', 'true')
        localStorage.setItem('sowonpray_saved_login_id', loginIdInput.trim())
        localStorage.setItem('sowonpray_saved_login_pw', inputPw)
      } catch (e) {}
    } else {
      try {
        localStorage.setItem('sowonpray_remember_login', 'false')
        localStorage.removeItem('sowonpray_saved_login_id')
        localStorage.removeItem('sowonpray_saved_login_pw')
        setLoginIdInput('')
        setLoginPwInput('')
      } catch (e) {}
    }
    // 브라우저의 Google 비밀번호 관리자에 저장 요청 (Credential Management API)
    if (window.PasswordCredential && navigator.credentials && navigator.credentials.store) {
      try {
        const cred = new window.PasswordCredential({
          id: found.phone ? found.phone.replace(/[^0-9]/g, '') : loginIdInput.trim(),
          password: inputPw,
          name: `${found.name}${found.dharma_name ? ` (${found.dharma_name})` : ''}`,
        })
        navigator.credentials.store(cred).catch(() => {})
      } catch (e) {}
    }
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
      const isRemember = localStorage.getItem('sowonpray_remember_login') !== 'false'
      if (isRemember) {
        const savedId = localStorage.getItem('sowonpray_saved_login_id') || ''
        const savedPw = localStorage.getItem('sowonpray_saved_login_pw') || ''
        setLoginIdInput(savedId)
        setLoginPwInput(savedPw)
      } else {
        setLoginIdInput('')
        setLoginPwInput('')
      }
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
      parent_code: referralCode || '33065540',
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
    try {
      if (rememberLogin) {
        localStorage.setItem('sowonpray_remember_login', 'true')
        localStorage.setItem('sowonpray_saved_login_id', signupPhone.trim())
        localStorage.setItem('sowonpray_saved_login_pw', signupPw.trim())
        setLoginIdInput(signupPhone.trim())
        setLoginPwInput(signupPw.trim())
      }
    } catch (e) {}
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
    // 비밀번호가 변경되었을 때 로컬 저장 비밀번호도 함께 즉시 동기화
    if (profileForm.password_pin.trim()) {
      try {
        if (localStorage.getItem('sowonpray_remember_login') !== 'false') {
          localStorage.setItem('sowonpray_saved_login_pw', profileForm.password_pin.trim())
          if (currentUser.phone) {
            localStorage.setItem('sowonpray_saved_login_id', currentUser.phone)
          }
          setLoginPwInput(profileForm.password_pin.trim())
          setSavedLoginAccounts((prev) => {
            const updated = (prev || []).map((acc) =>
              acc.code === currentUser.code ? { ...acc, pw: profileForm.password_pin.trim() } : acc
            )
            try {
              localStorage.setItem('sowonpray_saved_accounts_v2', JSON.stringify(updated))
            } catch (e) {}
            return updated
          })
        }
      } catch (e) {}
    }
    playSingingBowlSound()
    setIsProfileEditOpen(false)
    showToast('✅ 내 계정 및 사찰 축원 상세정보가 안전하게 저장되었습니다.')
  }

  // 1일 1소원등 터치 상호작용 (점등 중이면 축원 안내, 미점등이면 발원문 폼으로 부드러운 스크롤 이동)
  const handleLanternClick = () => {
    playSingingBowlSound()
    if (isLanternLit) {
      setAlreadyLitModalData({
        believer_name: lanternData?.believer_name || wishName.trim() || '불자',
        believer_phone: lanternData?.believer_phone || wishPhone.trim() || '',
        wish_category: lanternData?.wish_category || wishCategory || '가족건강',
        wish_text:
          lanternData?.wish_text ||
          '우리 가족 모두 건강하고 화목과 평안이 늘 함께하기를 발원합니다.',
        sasi_date_key: lanternData?.sasi_date_key || computeSasiSchedule(lanternData?.lit_at || Date.now()).sasiDateKey,
        streak: userLanternStats.streak,
        total_count: userLanternStats.totalCount,
      })
    } else {
      showToast('🙏 아래 발원문을 접수하시면 오늘 대웅전 소원등이 환하게 밝혀집니다.')
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

  // 🪷 [모바일/PC 공용] 프리미엄 불사·위패 종목 선택 전용 바텀시트/모달
  const renderBulsaCategorySheet = () => {
    if (!showBulsaCategorySheet) return null

    const groups = [
      {
        title: '🪷 1. 대웅전 상시 기도 및 공덕 불사',
        badge: '상시 기도',
        items: [
          { value: '대웅전 공양미/불전시주', label: '① 대웅전 공양미 / 불전시주', price: '50,000원' },
          { value: '대웅전 1년 인등(가족등)', label: '② 대웅전 1년 인등 (가족등)', price: '100,000원' },
          { value: '100일 소원성취 특별기도', label: '③ 100일 소원성취 특별기도', price: '100,000원' },
          { value: '49재/천도재/기일제사', label: '④ 49재 / 천도재 / 기일제사', price: '맞춤상담' },
        ],
      },
      {
        title: '🏛️ 2. 영구 위패 봉안 불사',
        badge: '영구 봉안',
        items: [
          { value: '생전예수재(황금위패)', label: '① 생전예수재 황금빛 위패 (살아계신 분)', price: '200만원' },
          { value: '조상영구위패(흑색)', label: '② 조상 영가 품격 흑색 영구위패', price: '200만원' },
        ],
      },
      {
        title: '🏔️ 3. 삼성각 성전 건립 대작불사',
        badge: '성전 건립',
        items: [
          { value: '삼성각 소원기와불사', label: '① 삼성각 건립 소원 기와 불사 (1장)', price: '10만원' },
          { value: '삼성각 기둥·단청불사', label: '② 삼성각 대들보 · 기둥 · 오색단청 불사', price: '100만원' },
          { value: '삼성각 영구축원명패', label: '③ 삼성각 가족 영구축원 명패 · 주춧돌', price: '100만원' },
          { value: '기타 특별기도 상담', label: '④ 기타 특별기도 및 맞춤 불사 상담', price: '맞춤상담' },
        ],
      },
    ]

    return createPortal(
      <div
        className="fixed inset-0 z-[70] bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowBulsaCategorySheet(false)
        }}
      >
        <div className="w-full sm:max-w-lg bg-[#FAF8F5] text-[#1B1815] rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-2 sm:border-2 border-[#D4AF37] max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
          {/* 모바일 상단 바 핸들 */}
          <div className="w-12 h-1 bg-[#DDD4C4] rounded-full mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

          {/* 헤더 */}
          <div className="bg-[#1B1815] text-[#FAF8F5] px-4 py-3.5 sm:px-5 sm:py-4 flex items-center justify-between border-b-2 border-[#D4AF37] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C59B27] text-[#1B1815] flex items-center justify-center font-bold text-sm shadow shrink-0">
                🪷
              </div>
              <div>
                <h3 className="font-serif-kr text-base font-bold text-[#F5D061]">
                  기도 · 위패 · 불사 종목 선택
                </h3>
                <p className="text-[11px] text-[#D6CEC2]">
                  동참하실 종목을 터치하여 선택해 주세요
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowBulsaCategorySheet(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 종목 리스트 (스크롤) */}
          <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4">
            {groups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="font-serif-kr font-bold text-xs text-[#8A6510]">
                    {group.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0D5] text-[#8A6510] border border-[#E5D399]">
                    {group.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const isSelected = wishCategory === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => {
                          playMoktakSound()
                          handleSelectWishCategory(item.value)
                          setShowBulsaCategorySheet(false)
                        }}
                        className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition cursor-pointer border ${
                          isSelected
                            ? 'bg-[#FAF3DF] border-2 border-[#C59B27] text-[#8A6510] shadow-xs'
                            : 'bg-white hover:bg-[#F8F4EC] border-[#E8DEC8] text-[#231F1C]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'border-[#C59B27] bg-[#C59B27] text-white'
                              : 'border-[#DDD4C4] bg-stone-50'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className={`text-xs sm:text-[13px] truncate ${isSelected ? 'font-bold' : 'font-medium'}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`text-[11px] font-mono shrink-0 px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-[#8A6510] text-[#FAF8F5] font-bold'
                            : 'bg-[#F3EFE6] text-[#7A6B56] font-semibold'
                        }`}>
                          {item.price}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 하단 닫기 */}
          <div className="p-3 bg-white border-t border-[#EAE2D3] shrink-0">
            <button
              type="button"
              onClick={() => setShowBulsaCategorySheet(false)}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#555] font-bold text-xs transition cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // 소원등 점등 및 대웅전 축원 접수 핸들러 (7일간 대웅전 점등 유지)
  // 💳 [토스페이먼츠 공식 테스트 결제창 연동] 종목별 기본 보시금 매핑
  const CATEGORY_DEFAULT_AMOUNT = {
    '대웅전 공양미/불전시주': 30000,
    '대웅전 1년 인등(가족등)': 100000,
    '100일 소원성취 특별기도': 100000,
    '49재/천도재/기일제사': 300000,
    '생전예수재(황금위패)': 500000,
    '조상영구위패(흑색)': 500000,
    '삼성각 소원기와불사': 30000,
    '삼성각 기둥·단청불사': 300000,
    '삼성각 영구축원명패': 500000,
    '기타 특별기도 상담': 50000,
  }
  const [tossPayMethod, setTossPayMethod] = useState('카드') // '카드'(카카오페이·간편결제 포함) | '계좌이체' | '가상계좌'
  const [showTossCheckoutModal, setShowTossCheckoutModal] = useState(false)
  const [showAllRecentLanterns, setShowAllRecentLanterns] = useState(false)
  const [tossSelectedEasyPay, setTossSelectedEasyPay] = useState('카카오페이') // 간편결제 / 카드사 선택
  const [tossInstallment, setTossInstallment] = useState('일시불') // 할부 개월
  const [tossBank, setTossBank] = useState('NH농협은행')
  const [tossAgreed, setTossAgreed] = useState(true)
  const [customPayAmount, setCustomPayAmount] = useState(100000)
  useEffect(() => {
    setCustomPayAmount(CATEGORY_DEFAULT_AMOUNT[wishCategory] || 100000)
  }, [wishCategory])

  // 토스페이먼츠 결제 성공 리다이렉트(?paymentKey=...&orderId=...&amount=...) 자동 수납·축원·정산 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentKey = params.get('paymentKey')
    const orderId = params.get('orderId')
    const amount = Number(params.get('amount') || 0)
    if (!paymentKey || !orderId || !amount) return
    try {
      const pendingRaw = sessionStorage.getItem('sowonsa_toss_pending_order')
      const pending = pendingRaw ? JSON.parse(pendingRaw) : {}
      sessionStorage.removeItem('sowonsa_toss_pending_order')
      const bName = pending.believer_name || '불자님'
      const bPhone = pending.believer_phone || '010-0000-0000'
      const bCat = pending.wish_category || '대웅전 1년 인등(가족등)'
      const bText = pending.wish_text || '가정의 평안과 소원성취를 발원합니다.'
      const writerCode = pending.member_code || extractPhone8Code(bPhone) || '00000000'
      const agentCode = pending.agent_code || '33065540'
      const paidPrayer = {
        id: 'p-toss-' + Date.now(),
        member_code: writerCode,
        believer_name: bName,
        wish_target: pending.wish_target || '본인',
        believer_phone: bPhone,
        agent_code: agentCode,
        wish_category: bCat,
        wish_text: bText,
        amount,
        payment_status: 'paid',
        status: 'prayed',
        prayed_at: `💳 토스페이먼츠 결제완납 (${amount.toLocaleString()}원) · 대웅전 축원 등재`,
        created_at: new Date().toISOString(),
      }
      setPrayers((prev) => [paidPrayer, ...prev])
      const templeShare = Math.round(amount * 0.5)
      const newSettlement = {
        id: 'st-toss-' + Date.now(),
        believer_code: writerCode,
        believer_name: bName,
        item_name: `[온라인결제] ${bCat}`,
        amount,
        temple_share: templeShare,
        agent_code: agentCode,
        agent_name: '김철수 총괄본부',
        agent_share: amount - templeShare,
        head_code: null,
        head_name: null,
        head_override_share: 0,
        master_override_share: 0,
        status: 'completed',
        created_at: new Date().toISOString().slice(0, 10),
      }
      setSettlements((prev) => [newSettlement, ...prev])
      showToast(`🎉 [${bName}] ${bCat} (${amount.toLocaleString()}원) 결제가 완료되어 대웅전 축원 명부 및 정산원장에 자동 등재되었습니다!`)
    } catch (e) {}
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  const handleTossTestPayment = () => {
    const effectiveName = wishName.trim() || currentUser?.name || '홍길동 불자'
    const effectivePhone = wishPhone.trim() || currentUser?.phone || '010-1234-5678'
    if (!wishName.trim()) setWishName(effectiveName)
    if (!wishPhone.trim()) setWishPhone(effectivePhone)
    setShowTossCheckoutModal(true)
  }

  const handleConfirmTossSimulatedPayment = () => {
    const effectiveName = wishName.trim() || currentUser?.name || '홍길동 불자'
    const effectivePhone = wishPhone.trim() || currentUser?.phone || '010-1234-5678'
    const amount = Math.max(1000, Number(customPayAmount) || 100000)
    const finalTarget = wishTarget.trim()
    const formattedBelieverName =
      finalTarget && finalTarget !== '본인'
        ? `${effectiveName} (대상: ${finalTarget})`
        : effectiveName
    const bCat = wishCategory || '대웅전 1년 인등(가족등)'
    const finalWishText =
      wishText.trim() ||
      PRAYER_CATEGORY_TEMPLATES[bCat] ||
      '우리 가족 모두 건강하고 뜻하는 일마다 밝게 풀리기를 발원합니다.'
    const writerCode = currentUser?.code || extractPhone8Code(effectivePhone) || '12345678'
    const matchedMember = members.find((m) => m.code === writerCode)
    const assignedAgentCode = currentUser?.parent_code || matchedMember?.parent_code || referralCode || '33065540'
    const methodDetail =
      tossPayMethod === '카드'
        ? `${tossSelectedEasyPay} (${tossInstallment})`
        : tossPayMethod === '계좌이체'
        ? `${tossBank} 실시간 이체`
        : `${tossBank} 가상계좌 발급완료`

    playSingingBowlSound()
    const paidPrayer = {
      id: 'p-toss-' + Date.now(),
      member_code: writerCode,
      believer_name: formattedBelieverName,
      wish_target: finalTarget || '본인',
      believer_phone: effectivePhone,
      agent_code: assignedAgentCode,
      wish_category: bCat,
      wish_text: finalWishText,
      amount,
      payment_status: 'paid',
      status: 'prayed',
      prayed_at: `💳 토스결제 완납 [${methodDetail} · ${amount.toLocaleString()}원] · 대웅전 축원 등재`,
      created_at: new Date().toISOString(),
    }
    setPrayers((prev) => [paidPrayer, ...prev])

    const templeShare = Math.round(amount * 0.5)
    const newSettlement = {
      id: 'st-toss-' + Date.now(),
      believer_code: writerCode,
      believer_name: formattedBelieverName,
      item_name: `[${methodDetail}] ${bCat}`,
      amount,
      temple_share: templeShare,
      agent_code: assignedAgentCode,
      agent_name: '김철수 총괄본부',
      agent_share: amount - templeShare,
      head_code: null,
      head_name: null,
      head_override_share: 0,
      master_override_share: 0,
      status: 'completed',
      created_at: new Date().toISOString().slice(0, 10),
    }
    setSettlements((prev) => [newSettlement, ...prev])
    setShowTossCheckoutModal(false)
    showToast(`🎉 [${formattedBelieverName}] ${methodDetail} ${amount.toLocaleString()}원 결제가 완료되어 대웅전 축원 명부 및 정산원장에 즉시 등재되었습니다!`)
  }
  // 임시 접수 대기 데이터 보관 (1번 접수 버튼 클릭 시에는 팝업만 띄우고, [합장하며 확인] 클릭 시에만 DB 및 문자 발송 실행)
  const pendingPrayerDraftRef = useRef(null)
  const [alreadyLitModalData, setAlreadyLitModalData] = useState(null)
  const [hoehangModalData, setHoehangModalData] = useState(null)

  const handlePrayerSubmit = (e) => {
    e.preventDefault()
    if (!wishName.trim() || !wishPhone.trim()) {
      showToast('성함과 연락처를 입력해 주세요.')
      return
    }

    const isPaidBulsaCategory =
      (wishCategory || '').includes('위패') ||
      (wishCategory || '').includes('생전예수재') ||
      (wishCategory || '').includes('삼성각') ||
      (wishCategory || '').includes('기와') ||
      (wishCategory || '').includes('단청') ||
      (wishCategory || '').includes('명패') ||
      (wishCategory || '').includes('인등') ||
      (wishCategory || '').includes('100일') ||
      (wishCategory || '').includes('49재') ||
      (wishCategory || '').includes('천도재') ||
      (wishCategory || '').includes('공양미')

    // 🔥 [1일 소원등 중복 점등 방지] 미점등 회원은 그대로 진행하고, 현재 사시예불 회차에 이미 점등 중인 회원은 중복 등록 없이 '점등 중' 안내 메시지 표시
    if (activeTab === 'lantern' && !isPaidBulsaCategory) {
      const inputPhoneClean = wishPhone.replace(/[^0-9]/g, '')
      const inputNameClean = wishName.trim()

      // 1) 현재 기기에 유효하게 점등 중인 소원등(expire_at > Date.now())과 일치하는지 확인
      const lanternPhoneClean = (lanternData?.believer_phone || '').replace(/[^0-9]/g, '')
      const isSameAsActiveLantern =
        isLanternLit &&
        lanternData &&
        lanternData.expire_at > Date.now() &&
        ((inputPhoneClean && lanternPhoneClean && inputPhoneClean === lanternPhoneClean) ||
          (inputNameClean && (lanternData.believer_name || '').includes(inputNameClean)))

      // 2) 장부(prayers)에 아직 회향 시각(오전 11시)이 지나지 않은 1일 소원등이 있는지 확인
      const existingActiveCyclePrayer = prayers.find((p) => {
        if (!p || !p.created_at) return false
        const pTime = new Date(p.created_at).getTime()
        if (isNaN(pTime)) return false
        const pCat = p.wish_category || ''
        if (
          pCat.includes('위패') ||
          pCat.includes('생전예수재') ||
          pCat.includes('삼성각') ||
          pCat.includes('기와') ||
          pCat.includes('단청') ||
          pCat.includes('명패') ||
          pCat.includes('인등') ||
          pCat.includes('100일') ||
          pCat.includes('49재') ||
          pCat.includes('천도재') ||
          pCat.includes('공양미')
        ) {
          return false
        }
        const pSchedule = computeSasiSchedule(pTime)
        if (pSchedule.expireAt <= Date.now()) return false
        const pPhone = (p.believer_phone || '').replace(/[^0-9]/g, '')
        return (
          (inputPhoneClean && pPhone && inputPhoneClean === pPhone) ||
          (inputNameClean && (p.believer_name || '').includes(inputNameClean))
        )
      })

      if (isSameAsActiveLantern || existingActiveCyclePrayer) {
        playSingingBowlSound()
        const activeRecord = existingActiveCyclePrayer || lanternData
        const activeLitTime = activeRecord?.created_at
          ? new Date(activeRecord.created_at).getTime()
          : activeRecord?.lit_at || Date.now()
        const activeSchedule = computeSasiSchedule(activeLitTime)
        setAlreadyLitModalData({
          believer_name: activeRecord?.believer_name || inputNameClean,
          believer_phone: activeRecord?.believer_phone || wishPhone.trim(),
          wish_category: activeRecord?.wish_category || wishCategory || '가족건강',
          wish_text:
            activeRecord?.wish_text ||
            wishText.trim() ||
            PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
            '온 가족 무병장수와 소원성취를 발원합니다.',
          sasi_date_key: activeRecord?.sasi_date_key || activeSchedule.sasiDateKey,
          streak: userLanternStats.streak,
          total_count: userLanternStats.totalCount,
        })
        return
      }
    }

    const finalTarget = wishTarget.trim()
    const formattedBelieverName =
      finalTarget && finalTarget !== '본인'
        ? `${wishName.trim()} (대상: ${finalTarget})`
        : wishName.trim()

    // 소원 발원문을 직접 쓰지 않고 비워둔 경우, 선택된 기원 분야의 정통 예시 발원문으로 자동 준비
    const finalWishText =
      wishText.trim() ||
      PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
      '우리 가족 올 한 해 무병장수하고 하는 일마다 순조롭게 풀리기를 발원합니다.'

    playSingingBowlSound()

    // 1단계: 아직 DB 저장이나 문자 발송을 하지 않고 대기(Draft) 상태만 생성 후 확인 모달 오픈
    pendingPrayerDraftRef.current = {
      wishNameClean: wishName.trim(),
      wishPhoneClean: wishPhone.trim(),
      finalTarget,
      formattedBelieverName,
      wishCategory,
      finalWishText,
      isPaidPrayer: isPaidBulsaCategory,
      committed: false,
    }

    setShowSuccessModal(true)
  }

  // 2단계-A: [합장하며 확인] (또는 카톡 공유) 클릭 시 비로소 장부/DB 정식 등록 및 종무소·신도 문자 알람 발송
  const handleConfirmSubmittedPrayer = ({ closeModal = true } = {}) => {
    const draft = pendingPrayerDraftRef.current
    if (draft && !draft.committed) {
      draft.committed = true

      const {
        wishNameClean,
        wishPhoneClean,
        finalTarget,
        formattedBelieverName,
        wishCategory: cat,
        finalWishText,
        isPaidPrayer: paidFlag,
      } = draft

      const now = Date.now()
      const schedule = computeSasiSchedule(now)
      const sasiInfo = getSasiDisplayInfo(schedule.sasiDateKey)

      // 사시예불 회차(sasiDateKey) 기준 정확한 연속 정진 일수 계산 (하루에 여러 번 올라가지 않음)
      const nextStreak = previewNextStreakCount(
        schedule.sasiDateKey,
        schedule.prevSasiDateKey
      )
      const nextTotal = (userLanternStats.totalCount || 0) + 1
      setLanternStreak(nextStreak)
      try {
        localStorage.setItem(
          'sowonsa_lantern_streak_v2',
          JSON.stringify({ count: nextStreak, lastSasiDateKey: schedule.sasiDateKey, total_count: nextTotal })
        )
        localStorage.setItem('sowonsa_lantern_streak', String(nextStreak))
      } catch (e) {}

      const newLanternInfo = {
        member_code: currentUser?.code || '',
        believer_name: formattedBelieverName,
        wish_target: finalTarget || '본인',
        believer_phone: wishPhoneClean,
        wish_category: cat,
        wish_text: finalWishText,
        lit_at: now,
        expire_at: schedule.expireAt,
        sasi_date_key: schedule.sasiDateKey,
        streak: nextStreak,
        total_count: nextTotal,
      }
      try {
        localStorage.setItem('sowonsa_7day_lantern', JSON.stringify(newLanternInfo))
      } catch (err) {}
      setLanternData(newLanternInfo)

      const writerCode = currentUser?.code || extractPhone8Code(wishPhoneClean)
      const matchedMember = members.find((m) => m.code === writerCode)
      const assignedAgentCode =
        currentUser?.parent_code || matchedMember?.parent_code || referralCode || '33065540'

      const newPrayer = {
        id: 'p-' + Date.now(),
        member_code: writerCode,
        believer_name: formattedBelieverName,
        wish_target: finalTarget || '본인',
        believer_phone: wishPhoneClean,
        agent_code: assignedAgentCode,
        wish_category: cat,
        wish_text: finalWishText,
        status:
          cat.includes('위패') || cat.includes('삼성각') ? 'consulting' : 'prayed',
        prayed_at:
          cat.includes('위패') || cat.includes('삼성각')
            ? '종무소 위패·삼성각 불사 우선 상담 배정됨'
            : `${sasiInfo.shortLabel} 축원 배정완료`,
        created_at: new Date().toISOString(),
      }

      setPrayers((prev) => [newPrayer, ...prev])
      setLatestSubmittedPrayerId(newPrayer.id)

      // Supabase 클라우드 실시간 정식 저장
      if (supabase) {
        supabase
          .from('prayers')
          .insert([
            {
              temple_id: 'sowonsa',
              member_code: writerCode,
              agent_code: assignedAgentCode,
              believer_name: formattedBelieverName,
              believer_phone: wishPhoneClean,
              wish_category: cat,
              wish_text: finalWishText,
              status: newPrayer.status,
              prayed_at: newPrayer.prayed_at,
            },
          ])
          .select('id')
          .single()
          .then(({ data }) => {
            if (data?.id) {
              setPrayers((prev) =>
                prev.map((p) => (p.id === newPrayer.id ? { ...p, db_id: data.id } : p))
              )
            }
          })
          .catch(() => {})
      }

      // 신규 신청자 전산 자동 등록 처리 (신규 불자 DB 등재)
      const cleanPrayerPhone = wishPhoneClean.replace(/[^0-9]/g, '')
      const prayerCode8 = extractPhone8Code(cleanPrayerPhone)
      const existingPrayerMember = members.find((m) => m.code === prayerCode8)
      const { name: parsedName, dharmaName: parsedDharma } = parseNameAndDharmaName(wishNameClean)

      if (!existingPrayerMember) {
        const newBeliever = {
          code: prayerCode8,
          phone: formatPhone11(wishPhoneClean),
          password_pin: prayerCode8.slice(-4) || '1234',
          name: parsedName,
          dharma_name: parsedDharma,
          birth_date: '',
          lunar_solar: '음력',
          address: '',
          family_memo: `대웅전 소원등(${cat}) 신청으로 전산 자동 등록됨`,
          role: 'believer',
          parent_code: assignedAgentCode,
          bank_name: '',
          bank_account: '',
          account_holder: '',
          merit_count: 300,
          believers_count: 0,
          wipae_count: 0,
          extra_data: { registered_via: 'wish_lantern' },
        }
        awardMerit('lantern', newBeliever.code, 1)
        setMembers((prev) => [newBeliever, ...prev])
        try {
          localStorage.setItem(`sowonpray_merit_${newBeliever.code}`, '300')
        } catch (e) {}
        if (supabase) {
          supabase.from('members').upsert([newBeliever], { onConflict: 'code' }).then()
        }
      } else {
        // 기존 회원이 소원등을 올릴 때도 공덕 (1일 1회 최대 300) 적립
        const meritRes = awardMerit('lantern', existingPrayerMember.code, 1)
        const nextMerit = (existingPrayerMember.merit_count || 0) + (meritRes.earnedPoints || 0)
        const updatedMember = {
          ...existingPrayerMember,
          merit_count: nextMerit,
          dharma_name: (!existingPrayerMember.dharma_name && parsedDharma) ? parsedDharma : existingPrayerMember.dharma_name,
        }
        setMembers((prev) =>
          prev.map((m) => (m.code === existingPrayerMember.code ? updatedMember : m))
        )
        try {
          localStorage.setItem(`sowonpray_merit_${existingPrayerMember.code}`, String(nextMerit))
        } catch (e) {}
        if (supabase) {
          supabase.from('members').update({
            merit_count: nextMerit,
            dharma_name: updatedMember.dharma_name,
          }).eq('code', existingPrayerMember.code).then()
        }
      }

      // 신규 신청자가 비로그인 상태이거나 본인 계정이 아닌 경우 본인 계정으로 즉시 자동 로그인 처리
      if (!currentUserCode || currentUserCode !== prayerCode8) {
        setCurrentUserCode(prayerCode8)
        try {
          localStorage.setItem('sowonpray_current_user_v3', prayerCode8)
        } catch (e) {}
      }

      // 담당 포교사 인연 신도수 업데이트
      setMembers((prev) =>
        prev.map((m) =>
          m.code === assignedAgentCode
            ? { ...m, believers_count: (m.believers_count || 0) + 1 }
            : m
        )
      )

      // 🔔 [합장하며 확인] 시점에 종무소(010-4912-1083) 및 신청 신도님 휴대폰으로 접수 안내 문자·알림톡 자동 발송
      notifyPrayerSubmission({
        believerName: formattedBelieverName,
        believerPhone: wishPhoneClean,
        category: cat,
        wishText: finalWishText,
        isPaidPrayer: paidFlag,
      }).catch(() => {})

      setWishText(PRAYER_CATEGORY_TEMPLATES[cat] || '')
      setWishTarget('')

      const isWipaeToast = (cat || '').includes('위패') || (cat || '').includes('생전예수재')
      const isSamseongToast =
        (cat || '').includes('삼성각') ||
        (cat || '').includes('기와') ||
        (cat || '').includes('단청') ||
        (cat || '').includes('명패')
      const isIndeungToast = (cat || '').includes('인등')
      const toastMsg = isWipaeToast
        ? '🏛️ [영구 위패 봉안 불사]가 정식 접수되어 종무소로 알림이 전송되었습니다.'
        : isSamseongToast
        ? '🏔️ [삼성각 성전 건립 불사] 동참이 정식 접수되어 종무소로 알림이 전송되었습니다.'
        : isIndeungToast
        ? '🪔 [대웅전 1년 인등 불사]가 정식 접수되어 종무소로 알림이 전송되었습니다.'
        : '🙏 간절한 발원이 정식 접수되어 사시예불 축원 명부에 등재되었습니다.'
      showToast(toastMsg, 5000)
    }

    if (closeModal) {
      pendingPrayerDraftRef.current = null
      setShowSuccessModal(false)
    }
  }

  // 2단계-B: [접수 취소] 또는 X 클릭 시 아무런 DB 등록/문자 발송 없이 깔끔하게 창만 닫기
  const handleCancelSubmittedPrayer = () => {
    pendingPrayerDraftRef.current = null
    setShowSuccessModal(false)
    showToast('접수가 취소되었습니다.')
  }

  // 전날 도량 방문 & 차담·사찰 공양(식사) 사전 예약 1단계: 입력 검증 후 예약 확인 모달 오픈 (아직 DB 저장/문자 발송 안 함)
  const handleVisitSubmit = (e) => {
    e.preventDefault()
    const exactHeadcount = Math.max(1, Number(visitHeadcount) || 1)
    if (!wishName.trim() || !wishPhone.trim() || !visitDate) {
      showToast('방문자 성함과 연락처, 방문 예정일을 확인해 주세요.')
      return
    }
    const writerCode = currentUser?.code || extractPhone8Code(wishPhone)
    const matchedMember = members.find((m) => m.code === writerCode)
    const assignedAgentCode = currentUser?.parent_code || matchedMember?.parent_code || referralCode || '33065540'
    const finalMemo =
      visitMemo.trim() ||
      `방문 인원 총 ${exactHeadcount}명 따뜻한 차와 사찰 공양(${exactHeadcount}인분) 부탁드립니다.`

    playSingingBowlSound()
    setVisitHeadcount(exactHeadcount)

    pendingVisitDraftRef.current = {
      visitorName: wishName.trim(),
      visitorPhone: wishPhone.trim(),
      visitDate,
      visitTime,
      exactHeadcount,
      visitPurpose,
      memo: finalMemo,
      writerCode,
      assignedAgentCode,
      committed: false,
    }

    setShowVisitSuccessModal(true)
  }

  // 방문 예약 2단계-A: [합장하며 예약 확인] (또는 카톡 공유 / 종무소 문자 전송) 클릭 시 장부/DB 정식 등록 및 알림 발송
  const handleConfirmSubmittedVisit = ({ closeModal = true } = {}) => {
    const draft = pendingVisitDraftRef.current
    if (draft && !draft.committed) {
      draft.committed = true

      const {
        visitorName,
        visitorPhone,
        visitDate: vDate,
        visitTime: vTime,
        exactHeadcount,
        visitPurpose: vPurpose,
        memo,
        writerCode,
        assignedAgentCode,
      } = draft

      const newVisit = {
        id: 'v-' + Date.now(),
        member_code: writerCode,
        visitor_name: visitorName,
        visitor_phone: visitorPhone,
        agent_code: assignedAgentCode,
        visit_date: vDate,
        visit_time: vTime,
        headcount: exactHeadcount,
        visit_purpose: vPurpose,
        memo,
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
              visitor_name: visitorName,
              visitor_phone: visitorPhone,
              visit_date: vDate,
              visit_time: vTime,
              headcount: exactHeadcount,
              visit_purpose: vPurpose,
              memo,
              status: 'reserved',
            },
          ])
          .then()
      }

      // 신규 방문자 전산 자동 등록 처리 (신규 불자 DB 등재)
      const cleanVisitPhone = visitorPhone.replace(/[^0-9]/g, '')
      const visitCode8 = extractPhone8Code(cleanVisitPhone)
      const existingVisitMember = members.find((m) => m.code === visitCode8)
      const { name: parsedVisitorName, dharmaName: parsedVisitorDharma } = parseNameAndDharmaName(visitorName)

      if (!existingVisitMember) {
        const newBeliever = {
          code: visitCode8,
          phone: formatPhone11(visitorPhone),
          password_pin: visitCode8.slice(-4) || '1234',
          name: parsedVisitorName,
          dharma_name: parsedVisitorDharma,
          birth_date: '',
          lunar_solar: '음력',
          address: '',
          family_memo: `도량 방문 및 사찰 공양(${exactHeadcount}인분) 예약으로 전산 등록됨 (${vDate})`,
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
      } else if (!existingVisitMember.dharma_name && parsedVisitorDharma) {
        const updatedMember = { ...existingVisitMember, dharma_name: parsedVisitorDharma }
        setMembers((prev) =>
          prev.map((m) => (m.code === existingVisitMember.code ? updatedMember : m))
        )
        if (supabase) {
          supabase.from('members').upsert([updatedMember], { onConflict: 'code' }).then()
        }
      }

      // 신규 방문 예약자가 비로그인 상태이거나 본인 계정이 아닌 경우 본인 계정으로 즉시 자동 로그인 처리
      if (!currentUserCode || currentUserCode !== visitCode8) {
        setCurrentUserCode(visitCode8)
        try {
          localStorage.setItem('sowonpray_current_user_v3', visitCode8)
        } catch (e) {}
      }

      // 🔔 종무소(010-4912-1083) 및 방문 예약 신도님 휴대폰으로 예약 확인 문자 자동 발송
      notifyVisitReservation({
        visitorName,
        visitorPhone,
        visitDate: vDate,
        visitTime: vTime,
        headcount: exactHeadcount,
        purpose: vPurpose,
        memo,
      }).catch(() => {})

      setVisitMemo('')
      showToast(
        `🍵 [${vDate} ${vTime.split(' ')[0]}] 총 ${exactHeadcount}명 방문 및 사찰 공양(${exactHeadcount}인분) 예약이 정식 접수되었습니다!`
      )
    }

    if (closeModal) {
      pendingVisitDraftRef.current = null
      setShowVisitSuccessModal(false)
    }
  }

  // 방문 예약 2단계-B: [예약 취소] 또는 X 클릭 시 아무런 DB 등록/문자 발송 없이 깔끔하게 창만 닫기
  const handleCancelSubmittedVisit = () => {
    pendingVisitDraftRef.current = null
    setShowVisitSuccessModal(false)
    showToast('방문 예약 접수가 취소되었습니다.')
  }

  // 사경 입력 체크 및 공덕 적립 헬퍼 (본인 계정 공덕 횟수에 누적 및 Supabase 실시간 동기화)
  const currentSutra = SUTRA_LIST[selectedSutraIdx]
  const currentMeritCount = currentUser
    ? (Number(currentUser.merit_count) || 0)
    : (Number(guestMeritCount) || 0)

  const addMerit = (amount = 1) => {
    if (currentUser) {
      const baseCount = Number(currentUser.merit_count) || 0
      const newCount = baseCount + amount
      setMembers((prev) =>
        prev.map((m) =>
          m.code === currentUser.code
            ? { ...m, merit_count: newCount }
            : m
        )
      )
      try {
        localStorage.setItem(`sowonpray_merit_${currentUser.code}`, String(newCount))
      } catch (e) {}

      if (supabase) {
        supabase
          .from('members')
          .update({ merit_count: newCount })
          .eq('code', currentUser.code)
          .then(({ error }) => {
            if (error) console.log('Supabase merit sync note:', error)
          })
      }
    } else {
      const newGuestCount = (Number(guestMeritCount) || 0) + amount
      setGuestMeritCount(newGuestCount)
      try {
        localStorage.setItem('sowonpray_guest_merit', String(newGuestCount))
      } catch (e) {}
    }
  }

  const addSutraMerit = () => {
    // 한줄사경: 1회 100 공덕 (1일 최대 300 공덕)
    const userCode = currentUser?.code || 'guest'
    const meritRes = awardMerit('sutra', userCode, 1)

    if (meritRes.earnedPoints > 0) {
      addMerit(meritRes.earnedPoints)
    }

    if (currentUser) {
      const todayKey = getTodayDateKey()
      const dailyKey = `sowonpray_sutra_daily_${currentUser.code}_${todayKey}`
      let todayCount = 0
      try {
        todayCount = Number(localStorage.getItem(dailyKey)) || 0
      } catch (e) {}

      const isEligible = todayCount < 3
      const nextDaily = todayCount + 1
      try {
        localStorage.setItem(dailyKey, String(nextDaily))
      } catch (e) {}
      setSutraDailyVersion((v) => v + 1)

      if (isEligible) {
        let storedReward = 0
        try {
          storedReward =
            Number(localStorage.getItem(`sowonpray_sutra_reward_count_${currentUser.code}`)) ||
            Number(localStorage.getItem(`sowonpray_sutra_count_${currentUser.code}`)) ||
            0
        } catch (e) {}
        const dbVal = Number(currentUser.sutra_reward_count || currentUser.sutra_count) || 0
        const prev = Math.max(dbVal, storedReward)
        const nextReward = prev + 1

        setMembers((prevMembers) =>
          prevMembers.map((m) =>
            m.code === currentUser.code
              ? {
                  ...m,
                  sutra_reward_count: nextReward,
                  sutra_count: nextReward,
                }
              : m
          )
        )
        try {
          localStorage.setItem(`sowonpray_sutra_reward_count_${currentUser.code}`, String(nextReward))
          localStorage.setItem(`sowonpray_sutra_count_${currentUser.code}`, String(nextReward))
        } catch (e) {}

        if (supabase) {
          supabase
            .from('members')
            .update({
              sutra_count: nextReward,
            })
            .eq('code', currentUser.code)
            .then(({ error }) => {
              if (error) console.log('Supabase sutra sync note:', error)
            })
        }
      }
    }

    if (meritRes.earnedPoints > 0) {
      showToast(`✍️ 한줄사경 원만 회향! (+100 공덕 적립 | 오늘 ${meritRes.currentDailyPoints}/300 공덕) 🙏`)
    } else {
      showToast('✍️ 한줄사경 회향! (오늘 사경 공덕 최대 300 공덕 달성 완료) 🙏')
    }
  }

  // 🪵 108 목탁멍 완주 회향 시 신행 복덕 보시금 적립 (정성 반영 1회 500원 · 1일 최대 1회)
  const addMoktakMerit = () => {
    addMerit(1)
    if (currentUser) {
      const todayKey = getTodayDateKey()
      const dailyKey = `sowonpray_moktak_daily_${currentUser.code}_${todayKey}`
      let todayCount = 0
      try {
        todayCount = Number(localStorage.getItem(dailyKey)) || 0
      } catch (e) {}

      const isEligible = todayCount < 1
      const nextDaily = todayCount + 1
      try {
        localStorage.setItem(dailyKey, String(nextDaily))
      } catch (e) {}
      setMoktakDailyVersion((v) => v + 1)

      if (isEligible) {
        let storedReward = 0
        try {
          storedReward =
            Number(localStorage.getItem(`sowonpray_moktak_reward_count_${currentUser.code}`)) ||
            Number(localStorage.getItem(`sowonpray_moktak_count_${currentUser.code}`)) ||
            0
        } catch (e) {}
        const dbVal = Number(currentUser.moktak_reward_count || currentUser.moktak_count) || 0
        const prev = Math.max(dbVal, storedReward)
        const nextReward = prev + 1

        setMembers((prevMembers) =>
          prevMembers.map((m) =>
            m.code === currentUser.code
              ? {
                  ...m,
                  moktak_reward_count: nextReward,
                  moktak_count: nextReward,
                  merit_count: (m.merit_count || 0) + 1,
                }
              : m
          )
        )
        try {
          localStorage.setItem(`sowonpray_moktak_reward_count_${currentUser.code}`, String(nextReward))
          localStorage.setItem(`sowonpray_moktak_count_${currentUser.code}`, String(nextReward))
        } catch (e) {}

        if (supabase) {
          supabase
            .from('members')
            .update({
              moktak_count: nextReward,
              merit_count: (currentUser.merit_count || 0) + 1,
            })
            .eq('code', currentUser.code)
            .then(({ error }) => {
              if (error) console.log('Supabase moktak sync note:', error)
            })
        }

        showToast(`🎉 108 목탁 정진 회향! (신행 복덕 +500 공덕 적립)`)
      } else {
        showToast(`🙏 108 목탁 정진 회향! (오늘의 목탁 공덕 500 공덕 달성, 정진 공덕 +1)`)
      }
    } else {
      showToast('🎉 제주 소원사 108 목탁 정진을 원만 회향하셨습니다!')
    }
  }

  const handleSutraChange = (val) => {
    setSutraInput(val)
    if (val.trim() === currentSutra.text.trim() && !sutraCompleted) {
      playSingingBowlSound()
      setSutraCompleted(true)
      addSutraMerit()
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

  // 108 목탁 멍 자동 타격 인터벌 (2.4초 간격 ASMR 힐링)
  useEffect(() => {
    if (!isAutoMoktakOn || !show108MoktakModal || is108Completed) return
    const timer = setInterval(() => {
      handle108MoktakTap()
    }, 2500)
    return () => clearInterval(timer)
  }, [isAutoMoktakOn, show108MoktakModal, is108Completed, moktak108Count])

  // 전용 108 목탁 멍 타격 핸들러 (실물 오디오 + 햅틱 진동 + 랜덤 피치 + 공덕 적립)
  const handle108MoktakTap = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(22)
      }
      const audio = new Audio('/audio/moktak.mp3')
      audio.volume = 1.0
      audio.playbackRate = 0.96 + Math.random() * 0.08
      audio.play().catch(() => {
        playMoktakAcousticSynth()
      })
    } catch (e) {
      playMoktakAcousticSynth()
    }

    const next = moktak108Count + 1
    setMoktak108Count(next)
    const userCode = currentUser?.code || 'guest'
    const meritRes = awardMerit('moktak', userCode, 1)
    if (meritRes.earnedPoints > 0) {
      addMerit(meritRes.earnedPoints)
    }

    // 애니메이션 바운스
    setIsMoktakAnimating(true)
    setTimeout(() => setIsMoktakAnimating(false), 120)

    // 파동 리플 생성 & 800ms 후 자동 소멸
    const rippleId = Date.now() + Math.random()
    setMoktakRipples((prev) => [...prev.slice(-1), { id: rippleId }])
    setTimeout(() => {
      setMoktakRipples((prev) => prev.filter((r) => r.id !== rippleId))
    }, 800)

    // 축원 단어 부유 텍스트 & 1.5초 후 자연스러운 소멸
    const benedictions = [
      '🙏 나무아미타불',
      '✨ 백팔번뇌 소멸',
      '🪷 마음 청정',
      '💛 청정 공덕 +1',
      '🕊️ 마음 평안',
      '🪔 소원 성취',
      '🌿 지혜 정진',
      '🌸 자비 광명',
      '🔔 대웅전 가피',
    ]
    const word = benedictions[next % benedictions.length]
    setMoktakFloatingTexts((prev) => [...prev.slice(-1), { id: rippleId, text: word }])
    setTimeout(() => {
      setMoktakFloatingTexts((prev) => prev.filter((f) => f.id !== rippleId))
    }, 1500)

    // 108번째 도달 시
    if (next === 108) {
      playSingingBowlSound()
      setIs108Completed(true)
      setIsAutoMoktakOn(false)
      addMoktakMerit()
    } else if (next % 9 === 0) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([25, 40, 25])
      }
    }
  }

  const handleReset108Moktak = () => {
    playSingingBowlSound()
    setMoktak108Count(0)
    setIs108Completed(false)
    setIsAutoMoktakOn(false)
    setMoktakRipples([])
    setMoktakFloatingTexts([])
    showToast('📿 목탁 카운트가 초기화되었습니다. 새로운 마음으로 정진하세요.')
  }

  const handleShare108Merit = () => {
    playSingingBowlSound()
    const code = currentUser?.code || referralCode || '33065540'
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
    const shareUrl = `${origin}/?ref=${code}&tab=home`
    const shareText = `[제주 소원사] 오늘 108 목탁 정진을 올리고 백팔번뇌를 맑게 비웠습니다. 부처님의 자비와 평안이 함께하시길 발원합니다.\n\n나도 마음 비우기: ${shareUrl}`

    if (navigator.share) {
      navigator.share({
        title: '제주 소원사 108 목탁 정진 회향',
        text: shareText,
        url: shareUrl,
      }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}`).then(() => {
        showToast('회향 축원문과 소원사 링크가 복사되었습니다. 카카오톡에 붙여넣어 보세요!')
      })
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
      temple_id: DEFAULT_TEMPLE_ID,
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

  // =========================================================================
  // 🏛️ [종무소 종합 전산 ERP]: 가족 사주 행 추가 / 삭제 / 수정 핸들러
  // =========================================================================
  const handleAddFamilyRow = () => {
    setRegFamilyList((prev) => [
      ...prev,
      {
        id: `fm-${Date.now()}`,
        relation: prev.length === 2 ? '장남' : prev.length === 3 ? '장녀' : '자녀',
        name: '',
        birth_year: '',
        birth_date: '',
        lunar_solar: '음력',
        dharma_name: '',
      },
    ])
  }

  const handleRemoveFamilyRow = (id) => {
    setRegFamilyList((prev) => prev.filter((item) => item.id !== id))
  }

  const handleUpdateFamilyRow = (id, field, value) => {
    setRegFamilyList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'birth_year' || field === 'birth_date') {
            const y = value.slice(0, 4)
            const { ganji, animal } = computeZodiacAndGanji(y)
            updated.ganji = ganji
            updated.animal = animal
          }
          return updated
        }
        return item
      })
    )
  }

  // ============================================================================
  // 신도 교적부 기반 [사찰 불사 & 위패 봉안 정식 접수] 모달 렌더러
  // ============================================================================
  // 동참 종목별 표준 권장 보시금 산정 헬퍼
  const getItemStandardPrice = (itemType) => {
    if (!itemType) return 100000
    if (itemType.includes('2기')) return 4000000
    if (itemType.includes('황금빛') || itemType.includes('흑색') || itemType.includes('생전예수재') || itemType.includes('영구위패')) return 2000000
    if (itemType.includes('단청') || itemType.includes('명패') || itemType.includes('기둥')) return 1000000
    if (itemType.includes('1년 인등') || itemType.includes('100일') || itemType.includes('기와')) return 100000
    if (itemType.includes('공양미')) return 50000
    return 100000
  }

  // 정산관제 원장에서 미입금 건 원터치 완납 처리
  // 정산 원장 착오 수정사항 저장
  const handleSaveEditedSettlement = (e) => {
    e?.preventDefault()
    if (!editingSettlement) return
    const s = editingSettlement
    const stdAmt = Number(s.standard_amount || s.total_amount || 0)
    const paidAmt = s.payment_status === 'refunded' || s.payment_status === 'pending' ? 0 : Number(s.paid_amount || 0)
    const unpaidAmt = Math.max(0, stdAmt - paidAmt)

    setSettlements((prev) =>
      prev.map((item) => (item.id === s.id ? { ...s, standard_amount: stdAmt, total_amount: stdAmt, paid_amount: paidAmt, unpaid_amount: unpaidAmt } : item))
    )

    // 신도 상태 동기화 (환불 시 위패/점등 원복)
    setMembers((prev) =>
      prev.map((m) => {
        if (m.code === s.member_code) {
          const isRefunded = s.payment_status === 'refunded'
          const isPending = s.payment_status === 'pending' || paidAmt === 0
          const isWipae = (s.item_name || '').includes('위패')
          const isIndeung = (s.item_name || '').includes('인등') || (s.item_name || '').includes('100일')

          return {
            ...m,
            wipae_count: isRefunded || isPending
              ? Math.max(0, (m.wipae_count || 0) - (isWipae ? ((s.item_name || '').includes('2기') ? 2 : 1) : 0))
              : m.wipae_count,
            extra_data: {
              ...(m.extra_data || {}),
              payment_amount: paidAmt,
              payment_status: isRefunded ? 'refunded' : isPending ? 'pending' : 'settled',
              ...(isIndeung && (isRefunded || isPending) ? { lantern_active: false, lantern_active_until: null } : {}),
            },
          }
        }
        return m
      })
    )

    setEditingSettlement(null)
    showToast('✓ 원장 수정사항이 정상 반영되었습니다.')
  }

  // 정산 원장 환불/접수취소 원터치 처리
  const handleRefundSettlement = (settlementId) => {
    const todayStr = new Date().toISOString().slice(0, 10)
    let targetMemberCode = null
    let targetItemName = ''

    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === settlementId) {
          targetMemberCode = s.member_code
          targetItemName = s.item_name || ''
          return {
            ...s,
            payment_status: 'refunded',
            paid_amount: 0,
            unpaid_amount: 0,
            paid_date: todayStr,
            memo: (s.memo ? s.memo + ' ' : '') + `[${todayStr} 환불완료/수당회수]`,
          }
        }
        return s
      })
    )

    if (targetMemberCode) {
      const isWipae = targetItemName.includes('위패')
      const isIndeung = targetItemName.includes('인등') || targetItemName.includes('100일')
      setMembers((prev) =>
        prev.map((m) => {
          if (m.code === targetMemberCode) {
            return {
              ...m,
              wipae_count: isWipae ? Math.max(0, (m.wipae_count || 0) - (targetItemName.includes('2기') ? 2 : 1)) : m.wipae_count,
              extra_data: {
                ...(m.extra_data || {}),
                payment_amount: 0,
                payment_status: 'refunded',
                ...(isIndeung ? { lantern_active: false, lantern_active_until: null } : {}),
              },
            }
          }
          return m
        })
      )
    }

    setEditingSettlement(null)
    showToast('💸 환불 및 접수 취소 처리가 완료되었습니다. (추천인 수당 전액 회수)')
  }

  // 착오 입력 원장 기록 완전 삭제
  const handleDeleteSettlement = (settlementId) => {
    setSettlements((prev) => prev.filter((s) => s.id !== settlementId))
    setEditingSettlement(null)
    showToast('🗑️ 착오 입력 장부 기록이 완전히 삭제되었습니다.')
  }

  const handleConfirmSettlementPayment = (settlementId) => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const target = settlements.find((s) => s.id === settlementId)
    if (target) {
      const stdAmt = Number(target.standard_amount || target.total_amount || 0)
      const believerName = target.believer_name || '신도'
      const itemName = target.item_name || '불사 종목'
      if (!window.confirm(`[${believerName}] 신도님의 [${itemName}]\n약정 잔액(${stdAmt.toLocaleString()}원) 완납 입금을 확인하고 실시간 정산을 집행하시겠습니까?`)) {
        return
      }
    }
    setSettlements((prev) =>
      prev.map((s) => {
        if (s.id === settlementId) {
          const stdAmt = Number(s.standard_amount || s.total_amount || 0)
          return {
            ...s,
            payment_status: 'confirmed',
            paid_amount: stdAmt,
            unpaid_amount: 0,
            paid_date: todayStr,
          }
        }
        return s
      })
    )
    showToast('✓ 입금 완납 확인 및 소원사 조직표 정산 집행이 완료되었습니다!')
  }

  // 1. 접수 등록 버튼 클릭 시 중앙 확인 모달 팝업 오픈
  const handleRegisterSettlementForMember = (e) => {
    e?.preventDefault()
    if (!settlementTargetMember) {
      showToast('접수할 신도 정보가 없습니다.')
      return
    }

    const m = settlementTargetMember
    const agent1Code = m.parent_code || '33065540'
    const agent1 = members.find((a) => a.code === agent1Code) || members.find((a) => a.code === '33065540')
    const isKimCheolSoo = agent1?.code === '33065540' || agent1?.code === '55400267'
    const isYangYoungMoon = agent1?.code === '55570267'
    const agent2 = (!isKimCheolSoo && !isYangYoungMoon)
      ? (members.find((a) => a.code === (agent1?.parent_code || '33065540')) || members.find((a) => a.code === '33065540'))
      : null
    const agent3 = null

    const todayStr = new Date().toISOString().slice(0, 10)
    const stdAmount = Number(settlementStandardAmount) || 0
    const actualPaidAmount = settlementPaymentStatus === 'pending' ? 0 : Number(settlementPaidAmount) || 0
    const unpaidAmt = Math.max(0, stdAmount - actualPaidAmount)

    // 브라우저 최상단 window.confirm 대신 화면 정중앙 전용 모달 팝업 오픈!
    setPendingSettlementConfirm({
      m,
      agent1,
      agent2,
      agent3,
      stdAmount,
      actualPaidAmount,
      unpaidAmt,
      todayStr,
      settlementItemType,
      settlementPaymentStatus,
    })
  }

  // 2. 중앙 확인 모달에서 [최종 등록 확인] 클릭 시 실제 회계 및 불사 집행
  const executeFinalSettlementRegistration = (data) => {
    const { m, agent1, agent2, agent3, stdAmount, actualPaidAmount, unpaidAmt, todayStr } = data

    const newRecord = {
      id: 's-' + Date.now(),
      temple_id: DEFAULT_TEMPLE_ID,
      member_code: m.code,
      believer_name: `${m.name}${m.dharma_name ? ` (${m.dharma_name})` : ''}`,
      believer_phone: m.phone || '',
      item_name: settlementItemType,
      standard_amount: stdAmount,
      total_amount: stdAmount, // 표준 약정금액
      paid_amount: actualPaidAmount, // 실제 입금금액
      unpaid_amount: unpaidAmt, // 미납 잔액
      applied_date: settlementAppliedDate || todayStr, // 신청/접수일자
      paid_date: settlementPaymentStatus !== 'pending' ? (settlementPaidDate || todayStr) : null, // 실제 입금일자
      payment_method: settlementPaymentMethod,
      payment_status: settlementPaymentStatus, // confirmed, partial, pending
      agent_1st_code: agent1 ? agent1.code : null,
      agent_1st_name: agent1
        ? `${agent1.name}${agent1.dharma_name ? `(${agent1.dharma_name})` : ''} (${agent1.role === 'temple_admin' ? '신도회장' : agent1.role === 'master' ? '총괄위원장' : '포교위원장'})`
        : '-',
      agent_2nd_code: agent2 ? agent2.code : null,
      agent_2nd_name: agent2
        ? `${agent2.name}${agent2.dharma_name ? `(${agent2.dharma_name})` : ''} (${agent2.role === 'temple_admin' ? '신도회장' : '총괄위원장'})`
        : '-',
      agent_3rd_code: agent3 ? agent3.code : null,
      agent_3rd_name: agent3
        ? `${agent3.name}${agent3.dharma_name ? `(${agent3.dharma_name})` : ''} (신도회장)`
        : '-',
      memo: settlementMemo,
      created_at: settlementAppliedDate || todayStr,
    }

    const isIndeung = settlementItemType.includes('인등')
    const is100d = settlementItemType.includes('100일')
    const lanternId = isIndeung ? 'indeung_1yr' : is100d ? 'prayer_100d' : null
    const durDays = isIndeung ? 365 : is100d ? 100 : 7
    const untilIso = new Date(Date.now() + durDays * 86400000).toISOString()
    const isPaymentActive = settlementPaymentStatus !== 'pending' && actualPaidAmount > 0

    // 인등 및 100일 기도: 완납 또는 일부 납부(분납) 시 즉시 대웅전 점등 및 사시예불 축원 명부에 자동 편성!
    if ((isIndeung || is100d) && isPaymentActive) {
      const newPrayer = {
        id: 'p-' + Date.now(),
        temple_id: DEFAULT_TEMPLE_ID,
        member_code: m.code,
        believer_name: `${m.name}${m.dharma_name ? ` (${m.dharma_name})` : ''}`,
        believer_phone: m.phone || '',
        agent_code: m.parent_code || '33065540',
        wish_category: isIndeung ? '대웅전 1년 인등(가족등)' : '100일 소원성취 특별기도',
        prayer_type: lanternId,
        duration_days: durDays,
        family_members_count: m.family_members?.length || 1,
        wish_text: settlementMemo || '지극정성으로 가내 평안과 소원성취를 발원합니다.',
        status: 'prayed',
        prayed_at: '종무소 정식 접수 (사시예불 축원 연동)',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }
      setPrayers((prev) => [newPrayer, ...prev])
    setLatestSubmittedPrayerId(newPrayer.id)
    }

    setSettlements((prev) => [newRecord, ...prev])
    setMembers((prev) =>
      prev.map((item) =>
        item.code === m.code
          ? {
              ...item,
              merit_count: (item.merit_count || 0) + 1,
              // 위패 봉안 수량: 완납 또는 일부 납부(분납) 시 향후 완납을 전제로 불사·위패 공식 집행 및 카운트 반영!
              wipae_count: (item.wipae_count || 0) + (
                isPaymentActive && settlementItemType.includes('위패')
                  ? (settlementItemType.includes('2기') ? 2 : 1)
                  : 0
              ),
              extra_data: {
                ...(item.extra_data || {}),
                prayer_title: settlementItemType,
                payment_amount: actualPaidAmount,
                standard_amount: stdAmount,
                unpaid_amount: unpaidAmt,
                applied_date: settlementAppliedDate || todayStr,
                paid_date: isPaymentActive ? (settlementPaidDate || todayStr) : null,
                payment_status: settlementPaymentStatus === 'confirmed' ? 'settled' : settlementPaymentStatus === 'partial' ? 'partial' : 'pending',
                ...(lanternId ? {
                  lantern_type: lanternId,
                  lantern_active: isPaymentActive,
                  lantern_active_until: isPaymentActive ? untilIso : null,
                  lantern_started_at: todayStr,
                } : {})
              }
            }
          : item
      )
    )

    playSingingBowlSound()
    setPendingSettlementConfirm(null)
    setShowSettlementModal(false)
    setSettlementTargetMember(null)
    setSettlementMemo('')
    showToast(`🪷 [${m.name}] 신도님의 [${settlementItemType}] 접수 및 회계 처리가 완결되었습니다!`)
  }


  // 🏛️ 종무소 신도 & 가족 사주 통합 신적부 등록 핸들러 (현장/전화 접수용)
  const handleRegisterFamilyMember = (e) => {
    e.preventDefault()
    const code8 = extractPhone8Code(regBelieverPhone)
    if (!regBelieverName.trim() || code8.length !== 8) {
      showToast('대표 신도 성함과 휴대폰 번호(뒤 8자리 포함)를 정확히 입력해 주세요.')
      return
    }
    if (members.some((m) => m.code === code8)) {
      showToast('이미 등록된 휴대폰 번호(고유코드)입니다.')
      return
    }

    // 가족 목록 정제 및 간지/띠/나이 정밀 계산
    const cleanedFamily = regFamilyList
      .filter((f) => f.name && f.name.trim())
      .map((f, idx) => {
        const year = f.birth_year || (f.birth_date ? f.birth_date.slice(0, 4) : '')
        const { ganji, animal } = computeZodiacAndGanji(year)
        return {
          id: f.id || `fm-${Date.now()}-${idx}`,
          relation: f.relation || '가족',
          name: f.name.trim(),
          dharma_name: (f.dharma_name || '').trim(),
          birth_year: year,
          birth_date: f.birth_date || (year ? `${year}-01-01` : ''),
          lunar_solar: f.lunar_solar || '음력',
          ganji,
          animal,
        }
      })

    const sejuMember = cleanedFamily.find((f) => f.relation.includes('세주') || f.relation.includes('가장'))
    const mainBirthYear = sejuMember?.birth_year || cleanedFamily[0]?.birth_year || ''

    const newMember = {
      temple_id: DEFAULT_TEMPLE_ID,
      code: code8,
      phone: formatPhone11(regBelieverPhone),
      password_pin: '0000',
      name: regBelieverName.trim(),
      dharma_name: regBelieverDharma.trim(),
      birth_date: mainBirthYear ? `${mainBirthYear}-01-01` : '',
      lunar_solar: '음력',
      address: regBelieverAddress.trim() || '제주특별자치도 제주시',
      family_memo: sejuMember
        ? `세주: ${sejuMember.name} (${sejuMember.ganji || ''} ${sejuMember.animal || ''})`
        : `가족 ${cleanedFamily.length}인 등록됨`,
      family_members: cleanedFamily,
      role: 'believer',
      parent_code: regBelieverParent || '55570267', // 1번 본사(양영문 창건주 회장) 또는 선택 귀속처
      bank_name: '',
      bank_account: '',
      account_holder: regBelieverName.trim(),
      merit_count: 1,
      believers_count: 0,
      wipae_count: 0,
      extra_data: {
        registered_by: 'jongmuso_pc',
        registered_at: new Date().toISOString(),
      },
    }

    setMembers((prev) => [newMember, ...prev])
    if (supabase) {
      supabase.from('members').upsert([newMember], { onConflict: 'code' }).then()
    }

    // 동시 기도 접수 처리 (1일등, 100일기도, 1년인등 등)
    if (regPrayerType !== 'none') {
      const prayerConfig = {
        lantern_1d: { category: '1일 소원등', duration: 1, status: 'prayed' },
        prayer_100d: { category: '100일 특별기도', duration: 100, status: 'prayed' },
        indeung_1yr: { category: '대웅전 1년 인등(가족등)', duration: 365, status: 'prayed' },
        jesujae: { category: '생전예수재 황금위패', duration: null, status: 'completed' },
      }[regPrayerType] || { category: '소원기도', duration: 7, status: 'prayed' }

      const newPrayer = {
        id: 'p-' + Date.now(),
        temple_id: DEFAULT_TEMPLE_ID,
        member_code: code8,
        believer_name: `${newMember.name}${newMember.dharma_name ? ` (${newMember.dharma_name})` : ''}`,
        believer_phone: newMember.phone,
        agent_code: newMember.parent_code,
        wish_category: prayerConfig.category,
        prayer_type: regPrayerType,
        duration_days: prayerConfig.duration,
        family_members_count: cleanedFamily.length || 1,
        wish_text:
          regWishText.trim() ||
          (prayerConfig.category === '대웅전 1년 인등(가족등)'
            ? '대웅전 부처님 전에 1년 인등을 정성껏 밝히오니 온 가족 무병장수하고 사업번창을 발원합니다.'
            : '지극정성으로 가내 평안과 소원성취를 발원하옵니다.'),
        status: prayerConfig.status,
        prayed_at: '종무소 현장 접수 (사시예불 축원 연동)',
        created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
      }

      setPrayers((prev) => [newPrayer, ...prev])
      if (supabase) {
        supabase.from('prayers').insert([newPrayer]).then()
      }
    }

    // 폼 초기화
    setRegBelieverName('')
    setRegBelieverDharma('')
    setRegBelieverPhone('')
    setRegWishText('')
    setRegPrayerType('none')
    setRegFamilyList([
      { id: `fm-${Date.now()}-1`, relation: '세주(가장)', name: '', birth_year: '', birth_date: '', lunar_solar: '음력', dharma_name: '' },
      { id: `fm-${Date.now()}-2`, relation: '배우자', name: '', birth_year: '', birth_date: '', lunar_solar: '음력', dharma_name: '' },
    ])

    playSingingBowlSound()
    showToast(`✅ [${newMember.name}] 불자님 및 가족 ${cleanedFamily.length}인 신적부 등록 완료! (코드: #${newMember.code})`)
  }

  // 📂 기존 전산 엑셀/CSV 데이터 분석(파싱) 핸들러
  const handleParseExcel = () => {
    if (!excelPasteText.trim()) {
      showToast('엑셀에서 복사한 내용을 텍스트창에 붙여넣어 주세요.')
      return
    }
    const lines = excelPasteText.trim().split('\n')
    const rows = []
    lines.forEach((line) => {
      if (!line.trim()) return
      const parts = line.includes('\t') ? line.split('\t') : line.split(',')
      if (parts.length >= 2) {
        const name = parts[0]?.trim()
        const phone = parts[1]?.trim()
        const dharma = parts[2]?.trim() || ''
        const address = parts[3]?.trim() || '제주특별자치도'
        const familyMemo = parts[4]?.trim() || ''
        const code8 = extractPhone8Code(phone)
        if (name && code8 && code8.length === 8) {
          rows.push({
            name,
            phone: formatPhone11(phone),
            code: code8,
            dharma_name: dharma,
            address,
            family_memo: familyMemo,
          })
        }
      }
    })
    if (rows.length === 0) {
      showToast('유효한 신도 데이터(이름, 전화번호 8자리 이상)를 찾지 못했습니다.')
      return
    }
    setExcelParsedRows(rows)
    showToast(`총 ${rows.length}명의 기존 신도 데이터가 분석되었습니다. 아래 [일괄 등록]을 누르세요.`)
  }

  // 📂 분석된 엑셀 신도 데이터 Supabase DB로 일괄 저장
  const handleBatchImportExcel = async () => {
    if (excelParsedRows.length === 0) return
    setIsExcelUploading(true)
    const newMembers = excelParsedRows.map((r) => ({
      temple_id: DEFAULT_TEMPLE_ID,
      code: r.code,
      phone: r.phone,
      password_pin: '0000',
      name: r.name,
      dharma_name: r.dharma_name,
      birth_date: '',
      lunar_solar: '음력',
      address: r.address,
      family_memo: r.family_memo,
      role: 'believer',
      parent_code: r.parent_code || '55570267', // 구전산 이관 신도는 양영문 창건주 회장(사찰본부) 직속 산하로 100% 귀속
      bank_name: '',
      bank_account: '',
      account_holder: r.name,
      merit_count: 1,
      believers_count: 0,
      wipae_count: 0,
      extra_data: { imported_from_excel: true, imported_at: new Date().toISOString() },
    }))

    setMembers((prev) => {
      const existingCodes = new Set(prev.map((m) => m.code))
      const toAdd = newMembers.filter((m) => !existingCodes.has(m.code))
      return [...toAdd, ...prev]
    })

    if (supabase) {
      try {
        await supabase.from('members').upsert(newMembers, { onConflict: 'code' })
      } catch (err) {
        console.error('Excel batch import error:', err)
      }
    }

    setIsExcelUploading(false)
    setExcelParsedRows([])
    setExcelPasteText('')
    playSingingBowlSound()
    showToast(`🎉 기존 전산 신도 ${newMembers.length}명이 소원사 DB로 완벽히 일괄 이관되었습니다!`)
  }

  // ✏️ 신도 상세 카드에서 정보 수정 저장 핸들러
  const handleSaveMemberEdit = async () => {
    if (!memberEditForm) return
    const compBirth = computeZodiacAndGanji(memberEditForm.birth_year || memberEditForm.birth_date)
    const updatedMember = {
      ...selectedMemberDetail,
      name: memberEditForm.name.trim(),
      dharma_name: (memberEditForm.dharma_name || '').trim(),
      gender: memberEditForm.gender || '여',
      phone: formatPhone11(memberEditForm.phone),
      tel: (memberEditForm.tel || '').trim(),
      birth_year: (memberEditForm.birth_year || '').trim(),
      birth_date: memberEditForm.birth_year ? `${memberEditForm.birth_year.trim()}-01-01` : (memberEditForm.birth_date || ''),
      lunar_solar: memberEditForm.lunar_solar || '음력',
      ganji: compBirth.ganji || selectedMemberDetail.ganji || '',
      animal: compBirth.animal || selectedMemberDetail.animal || '',
      address: (memberEditForm.address || '').trim(),
      role: memberEditForm.role || selectedMemberDetail.role || 'believer',
      parent_code: memberEditForm.parent_code || selectedMemberDetail.parent_code || '55570267',
      password_pin: (memberEditForm.password_pin || selectedMemberDetail.password_pin || '0000').slice(0, 4),
      family_memo: (memberEditForm.family_memo || '').trim(),
      admin_notes: (memberEditForm.admin_notes || '').trim(),
      family_members: memberEditForm.family_members || [],
      extra_data: {
        ...(selectedMemberDetail.extra_data || {}),
        family_members: memberEditForm.family_members || [],
        gender: memberEditForm.gender || '여',
        tel: (memberEditForm.tel || '').trim(),
        birth_year: (memberEditForm.birth_year || '').trim(),
        admin_notes: (memberEditForm.admin_notes || '').trim(),
        last_edited_at: new Date().toISOString(),
      },
    }

    setMembers((prev) =>
      prev.map((m) => (m.code === updatedMember.code ? updatedMember : m))
    )
    setSelectedMemberDetail(updatedMember)
    setIsEditingMember(false)

    if (supabase) {
      try {
        await supabase
          .from('members')
          .update({
            name: updatedMember.name,
            dharma_name: updatedMember.dharma_name,
            phone: updatedMember.phone,
            birth_date: updatedMember.birth_date,
            lunar_solar: updatedMember.lunar_solar,
            address: updatedMember.address,
            role: updatedMember.role,
            parent_code: updatedMember.parent_code,
            password_pin: updatedMember.password_pin,
            family_memo: updatedMember.family_memo,
            extra_data: updatedMember.extra_data,
          })
          .eq('code', updatedMember.code)
      } catch (err) {
        console.error('Member edit update error:', err)
      }
    }

    playSingingBowlSound()
    showToast(`✅ [${updatedMember.name}] 신도님의 교적부 상세 정보가 성공적으로 저장되었습니다.`)
  }

  // 총괄 관리자: 신규 불사 접수 & 실시간 계보 정산 실행
  const handleAddSettlement = (e) => {
    e.preventDefault()
    if (!simBelieverName.trim()) {
      showToast('동참 신도님 성함을 입력해 주세요.')
      return
    }
    const agent1 = members.find((a) => a.code === simAgentCode)
    const agent2 = agent1?.parent_code
      ? members.find((a) => a.code === agent1.parent_code)
      : null
    const agent3 = agent2?.parent_code
      ? members.find((a) => a.code === agent2.parent_code)
      : null

    const targetMember = matchedBelieverForSettlement
    const todayStr = new Date().toISOString().slice(0, 10)

    const newRecord = {
      id: 's-' + Date.now(),
      temple_id: DEFAULT_TEMPLE_ID,
      member_code: targetMember ? targetMember.code : null,
      believer_name: simBelieverName.trim(),
      believer_phone: targetMember ? targetMember.phone : '',
      item_name: simItemType,
      total_amount: Number(simAmount),
      agent_1st_code: agent1 ? agent1.code : null,
      agent_1st_name: agent1
        ? `${agent1.name}${agent1.dharma_name ? `(${agent1.dharma_name})` : ''} (${agent1.role === 'temple_admin' ? '신도회장' : agent1.role === 'master' ? '총괄위원장' : '포교위원장'})`
        : '-',
      agent_2nd_code: agent2 ? agent2.code : null,
      agent_2nd_name: agent2
        ? `${agent2.name}${agent2.dharma_name ? `(${agent2.dharma_name})` : ''} (${agent2.role === 'temple_admin' ? '신도회장' : '총괄위원장'})`
        : '-',
      agent_3rd_code: agent3 ? agent3.code : null,
      agent_3rd_name: agent3
        ? `${agent3.name}${agent3.dharma_name ? `(${agent3.dharma_name})` : ''} (신도회장)`
        : '-',
      payment_status: 'confirmed',
      created_at: todayStr,
    }

    setSettlements((prev) => [newRecord, ...prev])
    if (targetMember) {
      setMembers((prev) =>
        prev.map((m) =>
          m.code === targetMember.code
            ? { ...m, merit_count: (m.merit_count || 0) + 1, wipae_count: (m.wipae_count || 0) + 1 }
            : m
        )
      )
    }
    setSimBelieverName('')
    playSingingBowlSound()
    showToast(`💰 [${newRecord.believer_name}] 신도님의 불사 접수 및 1·2·3차 실시간 정산이 완료되었습니다.`)
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
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
    const url = `${origin}/?ref=${code}`
    navigator.clipboard?.writeText(url)
    showToast(`📋 도반 연결 링크가 복사되었습니다: ${url}`)
  }

  // 도반에게 카카오톡 소원등 복(福) 선물하기 (대웅전 삼존불 피드 카드 또는 모바일 공유 fallback)
  const handleShareKakao = (code, userName) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
    const shareUrl = `${origin}/?ref=${code}&tab=lantern`
    const senderName = userName ? `${userName} 불자님` : '소원사 도반님'
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '6e9a618a3862f884e3eece4bb6550922'
    const altarImageUrl = 'https://sowonpray.vercel.app/images/sowonsa_altar_card.jpg?v=3'

    // 1) Kakao JavaScript SDK 공식 피드 카드 (정갈한 itemContent 테이블 포함)
    if (typeof window !== 'undefined' && window.Kakao) {
      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey)
        }
        if (window.Kakao.isInitialized() && window.Kakao.Share) {
          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: '🪷 제주 소원사 1일 무료 소원등 복(福) 선물',
              description: `${senderName}께서 보내신 무료 소원등 선물입니다.\n부처님 전에 마음속 간절한 소원을 밝혀보세요.`,
              imageUrl: altarImageUrl,
              imageWidth: 1024,
              imageHeight: 693,
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            itemContent: {
              profileText: '제주 소원사 모바일 법당 · 도반 축원 선물',
              titleImageText: '무료 소원등 점등권',
              titleImageCategory: '대웅전 삼존불 점등',
              items: [
                { item: '보낸도반', itemOp: senderName },
                { item: '선물내역', itemOp: '1일 무료 소원등 점등권' },
                { item: '정진도량', itemOp: '제주 소원사 대웅전' },
              ],
            },
            buttons: [
              {
                title: '🪔 무료 소원등 켜고 축원받기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          })
          return
        }
      } catch (err) {
        console.warn('Kakao SDK share fallback:', err)
      }
    }

    // 2) 브라우저 네이티브 공유 / 복사 fallback
    const shareTitle = '🪷 제주 소원사 소원등 복(福) 선물'
    const shareText = `[제주 소원사 모바일 법당]\n${senderName}께서 보낸 소원등 선물\n부처님 전에 소원을 밝혀보세요.\n아래 링크를 터치하여 대웅전에 소원등을 밝혀보세요.`

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      }).catch((err) => {
        if (err?.name !== 'AbortError') {
          navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)
          showToast('🙏 소원등 인연 링크가 복사되었습니다. 카카오톡 대화방에 붙여넣어 전해보세요!')
        }
      })
    } else {
      navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)
      showToast('🙏 소원등 인연 링크가 복사되었습니다. 카카오톡 대화방에 붙여넣어 전해보세요!')
    }
  }

  // 가족·지인에게 내 소원등 또는 사경 회향 알리기 (대웅전 삼존불 공식 카카오 피드 카드 - 맞춤형 발원문 & 연등 정보)
  const handleShareMyLantern = (believerName, customOptions = {}) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
    const code = currentUser?.code || referralCode || '33065540'
    const name = believerName ? `${believerName} 불자님` : (currentUser?.name ? `${currentUser.name} 불자님` : '도반님')
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '6e9a618a3862f884e3eece4bb6550922'
    const altarImageUrl = 'https://sowonpray.vercel.app/images/sowonsa_altar_card.jpg?v=3'

    const isSutra = customOptions?.type === 'sutra'
    const shareUrl = `${origin}/?ref=${code}&tab=${isSutra ? 'sutra' : 'lantern'}`

    const category = customOptions?.category || lanternData?.wish_category || '가족건강'
    const wishText = customOptions?.wishText || lanternData?.wish_text || '온 가족의 무병장수와 만복·소원성취를 발원합니다.'
    const streak = customOptions?.streak || userLanternStats?.streak || 1
    const totalCount = customOptions?.totalCount || userLanternStats?.totalCount || 1

    const sutraTitle = customOptions?.sutraTitle || currentSutra?.title || '반야심경'
    const sutraText = customOptions?.sutraText || currentSutra?.text || '색즉시공 공즉시색 수상행식 역부여시'

    let cardTitle = ''
    let cardDesc = ''
    let itemContent = null
    let btnTitle = '🪔 1일 무료 소원등 함께 밝히기'

    if (isSutra) {
      cardTitle = `🪷 제주 소원사 [${sutraTitle} 사경] 지혜 복(福) 나눔`
      const cleanSutra = sutraText.length > 50 ? `${sutraText.slice(0, 50)}…` : sutraText
      cardDesc = `“${cleanSutra}”\n${name}께서 사경 정진을 마치고 지혜와 복덕을 전합니다.`
      btnTitle = '✍️ 한줄 사경 함께하기'
      itemContent = {
        profileText: '제주 소원사 모바일 법당 · 사경 회향 공덕',
        titleImageText: sutraTitle,
        titleImageCategory: '부처님 말씀 일일 사경',
        items: [
          { item: '정진불자', itemOp: name },
          { item: '회향경전', itemOp: sutraTitle },
          { item: '봉안사찰', itemOp: '제주 소원사 대웅전' },
        ],
      }
    } else {
      cardTitle = `🪷 제주 소원사 [${category}] 소원등 복(福) 나눔`
      const cleanWish = wishText.length > 50 ? `${wishText.slice(0, 50)}…` : wishText
      cardDesc = `“${cleanWish}”\n${name}의 정성스런 등불이 부처님 전에 밝혀졌습니다.`
      btnTitle = '🪔 1일 무료 소원등 함께 밝히기'
      itemContent = {
        profileText: '제주 소원사 모바일 법당 · 대웅전 소원등',
        titleImageText: `[${category}] 발원등`,
        titleImageCategory: `🔥 ${streak}일 연속 정진`,
        items: [
          { item: '발원불자', itemOp: name },
          { item: '발원분야', itemOp: category },
          { item: '정진현황', itemOp: `🔥 ${streak}일 연속 (총 ${totalCount}회 점등)` },
          { item: '봉안사찰', itemOp: '제주 소원사 대웅전' },
        ],
      }
    }

    // 1) Kakao JavaScript SDK 공식 피드 카드 (동일한 1024x693 규격 삼존불 배너 + 상세 테이블)
    if (typeof window !== 'undefined' && window.Kakao) {
      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey)
        }
        if (window.Kakao.isInitialized() && window.Kakao.Share) {
          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: cardTitle,
              description: cardDesc,
              imageUrl: altarImageUrl,
              imageWidth: 1024,
              imageHeight: 693,
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            itemContent: itemContent,
            buttons: [
              {
                title: btnTitle,
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          })
          return
        }
      } catch (err) {
        console.warn('Kakao share fallback:', err)
      }
    }

    // 2) 브라우저 네이티브 공유 / 복사 fallback
    const shareTitle = cardTitle
    const shareText = `[제주 소원사 대웅전]\n${cardDesc}\n아래 카드를 터치하여 함께 정진에 동참해보세요.`

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      }).catch((err) => {
        if (err?.name !== 'AbortError') {
          navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)
          showToast('📋 축원 링크가 복사되었습니다! 카카오톡에 전해보세요.')
        }
      })
    } else {
      navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)
      showToast('📋 축원 링크가 복사되었습니다! 카카오톡에 전해보세요.')
    }
  }

  // 대웅전 참배 회향 카카오톡 공유 (클릭 시 ?sanctuary=true 로 대웅전 직통 연결)
  const handleShareSanctuary = ({ believerName, bowCount = 0, moktakCount = 0, yeomjuCount = 0 } = {}) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
    const code = currentUser?.code || referralCode || '33065540'
    const shareUrl = `${origin}/?ref=${code}&sanctuary=true`
    const name = believerName ? `${believerName} 불자님` : (currentUser?.name ? `${currentUser.name} 불자님` : '소원사 도반님')
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '6e9a618a3862f884e3eece4bb6550922'
    const altarImageUrl = 'https://sowonpray.vercel.app/images/sowonsa_altar_card.jpg?v=3'

    const acts = []
    if (bowCount > 0) acts.push(`절 ${bowCount}배`)
    if (moktakCount > 0) acts.push(`목탁 ${moktakCount}타`)
    if (yeomjuCount > 0) acts.push(`염주 ${yeomjuCount}알`)
    const hasActs = acts.length > 0
    const actSummary = hasActs ? acts.join(' · ') : '대웅전 삼존불 참배'

    const itemsList = [
      { item: '정진불자', itemOp: name },
      { item: '참배정진', itemOp: actSummary },
      { item: '회향축원', itemOp: '가족·도반에게 부처님 가피 충만' },
      { item: '소원발원', itemOp: '모든 소원 원만성취 및 평안' },
    ]

    if (typeof window !== 'undefined' && window.Kakao) {
      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey)
        }
        if (window.Kakao.isInitialized() && window.Kakao.Share) {
          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: '🪷 복(福) 나눔',
              description: '삼보에 올린 참배 공덕을 함께 나눕니다.',
              imageUrl: altarImageUrl,
              imageWidth: 1024,
              imageHeight: 693,
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            itemContent: {
              profileText: '제주 소원사 모바일 법당',
              titleImageText: '대웅전 삼존불 참배',
              titleImageCategory: '소원성취 기도도량',
              items: itemsList,
            },
            buttons: [
              {
                title: '🙇 대웅전 참배 바로가기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
            ],
          })
          return
        }
      } catch (err) {
        console.warn('Kakao share sanctuary fallback:', err)
      }
    }

    // fallback
    const shareText = `[제주 소원사 대웅전 참배 회향]\n${cardDesc}\n아래 링크를 터치하여 대웅전에 부처님을 마주해보세요.`
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      }).catch((err) => {
        if (err?.name !== 'AbortError') {
          navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)
          showToast('📋 대웅전 참배 링크가 복사되었습니다! 카카오톡에 전해보세요.')
        }
      })
    } else {
      navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`)
      showToast('📋 대웅전 참배 링크가 복사되었습니다! 카카오톡에 전해보세요.')
    }
  }

  // 오늘의 부처님 말씀 카카오톡 피드 카드 공유 (법공양 및 추천인 결속)
  const handleShareDailyQuote = (quote) => {
    playMoktakSound()
    const code = currentUser?.code || referralCode || '33065540'
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
    const shareUrl = `${origin}/?ref=${code}&tab=home`
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '6e9a618a3862f884e3eece4bb6550922'
    const altarImageUrl = 'https://sowonpray.vercel.app/images/sowonsa_altar_card.jpg?v=3'

    // 1) Kakao JavaScript SDK 정식 피드 카드 전송 (1번 접수증처럼 itemContent 지혜법문표 탑재!)
    if (typeof window !== 'undefined' && window.Kakao) {
      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey)
        }
        if (window.Kakao.isInitialized() && window.Kakao.Share) {
          const { lunarText, jaeilBadge } = getTodayLunarAndJaeil()
          const senderLabel = currentUser?.name
            ? `${currentUser.name}${currentUser.dharma_name ? ` (${currentUser.dharma_name})` : ''}`
            : '소원사 도반'

          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: `🪷 [제주 소원사] 오늘의 부처님 말씀`,
              description: `해설: "${quote.commentary}"`,
              imageUrl: altarImageUrl,
              imageWidth: 1024,
              imageHeight: 693,
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
            itemContent: {
              profileText: '제주 소원사 모바일 법당 · 일일 법공양',
              titleImageText: quote.source,
              titleImageCategory: `${lunarText} · ${jaeilBadge}`,
              items: [
                { item: '보낸도반', itemOp: senderLabel },
                { item: '경전출처', itemOp: quote.source },
                { item: '핵심법문', itemOp: quote.verse.slice(0, 24) + (quote.verse.length > 24 ? '…' : '') },
                { item: '종무소', itemOp: '010-4912-1083' },
              ],
            },
            buttons: [
              {
                title: '📖 오늘의 법문 마주하기',
                link: {
                  mobileWebUrl: shareUrl,
                  webUrl: shareUrl,
                },
              },
              {
                title: '🪔 무료 소원등 켜기',
                link: {
                  mobileWebUrl: `${origin}/?ref=${code}&tab=lantern`,
                  webUrl: `${origin}/?ref=${code}&tab=lantern`,
                },
              },
            ],
          })
          return
        }
      } catch (err) {
        console.warn('Kakao daily quote share fallback:', err)
      }
    }

    // 2) 브라우저 네이티브 공유 / 복사 fallback
    const shareText = `📿 [제주 소원사 오늘의 부처님 말씀]\n\n"${quote.verse}"\n— ${quote.source}\n\n💡 뜻풀이: ${quote.commentary}\n\n🙏 매일 아침 함께하는 모바일 법당:\n${shareUrl}`
    if (navigator.share) {
      navigator.share({
        title: '제주 소원사 오늘의 부처님 말씀',
        text: shareText,
        url: shareUrl,
      }).catch((err) => {
        if (err?.name !== 'AbortError') {
          navigator.clipboard?.writeText(shareText)
          showToast('📋 부처님 말씀이 복사되었습니다. 카카오톡으로 전해보세요!')
        }
      })
    } else {
      navigator.clipboard?.writeText(shareText)
      showToast('📋 부처님 말씀이 복사되었습니다. 카카오톡으로 전해보세요!')
    }
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

  // =========================================================================
  // 🏛️ [독립형 종무행정 ERP 풀스크린 데스크톱 모드 분기 - AdminERPView 모듈 호출]
  // =========================================================================
  if (isStandaloneAdmin) {
    return (
      <AdminERPView
        currentUser={currentUser}
        isMasterOrTempleAdmin={isMasterOrTempleAdmin}
        isMaster={isMaster}
        isTempleAdmin={isTempleAdmin}
        loginIdInput={loginIdInput}
        setLoginIdInput={setLoginIdInput}
        loginPwInput={loginPwInput}
        setLoginPwInput={setLoginPwInput}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        members={members}
        setMembers={setMembers}
        prayers={prayers}
        setPrayers={setPrayers}
        settlements={settlements}
        setSettlements={setSettlements}
        activeSasiPrayers={activeSasiPrayers}
        filteredSasiPrayers={filteredSasiPrayers}
        isStandaloneAdmin={isStandaloneAdmin}
        setIsStandaloneAdmin={setIsStandaloneAdmin}
        erpTab={erpTab}
        setErpTab={setErpTab}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showToast={showToast}
        adminMemberRoleFilter={adminMemberRoleFilter}
        setAdminMemberRoleFilter={setAdminMemberRoleFilter}
        adminMemberSearchQuery={adminMemberSearchQuery}
        setAdminMemberSearchQuery={setAdminMemberSearchQuery}
        adminMemberSort={adminMemberSort}
        setAdminMemberSort={setAdminMemberSort}
        filteredAdminMembers={filteredAdminMembers}
        businessCardTarget={businessCardTarget}
        setBusinessCardTarget={setBusinessCardTarget}
        editingSettlement={editingSettlement}
        setEditingSettlement={setEditingSettlement}
        excelParsedRows={excelParsedRows}
        setExcelParsedRows={setExcelParsedRows}
        excelPasteText={excelPasteText}
        setExcelPasteText={setExcelPasteText}
        indeungTargetMember={indeungTargetMember}
        setIndeungTargetMember={setIndeungTargetMember}
        individualRecordTargetMember={individualRecordTargetMember}
        setIndividualRecordTargetMember={setIndividualRecordTargetMember}
        isEditingMember={isEditingMember}
        setIsEditingMember={setIsEditingMember}
        isExcelUploading={isExcelUploading}
        setIsExcelUploading={setIsExcelUploading}
        lanternTargetMember={lanternTargetMember}
        setLanternTargetMember={setLanternTargetMember}
        memberEditForm={memberEditForm}
        setMemberEditForm={setMemberEditForm}
        pendingSettlementConfirm={pendingSettlementConfirm}
        setPendingSettlementConfirm={setPendingSettlementConfirm}
        regBelieverAddress={regBelieverAddress}
        setRegBelieverAddress={setRegBelieverAddress}
        regBelieverDharma={regBelieverDharma}
        setRegBelieverDharma={setRegBelieverDharma}
        regBelieverName={regBelieverName}
        setRegBelieverName={setRegBelieverName}
        regBelieverParent={regBelieverParent}
        setRegBelieverParent={setRegBelieverParent}
        regBelieverPhone={regBelieverPhone}
        setRegBelieverPhone={setRegBelieverPhone}
        regFamilyList={regFamilyList}
        setRegFamilyList={setRegFamilyList}
        regPrayerType={regPrayerType}
        setRegPrayerType={setRegPrayerType}
        regWishText={regWishText}
        setRegWishText={setRegWishText}
        sasiPrayedCheckedIds={sasiPrayedCheckedIds}
        setSasiPrayedCheckedIds={setSasiPrayedCheckedIds}
        sasiPrayerTypeTab={sasiPrayerTypeTab}
        setSasiPrayerTypeTab={setSasiPrayerTypeTab}
        selectedMemberDetail={selectedMemberDetail}
        setSelectedMemberDetail={setSelectedMemberDetail}
        settlementItemType={settlementItemType}
        setSettlementItemType={setSettlementItemType}
        settlementMemo={settlementMemo}
        setSettlementMemo={setSettlementMemo}
        settlementPaidAmount={settlementPaidAmount}
        setSettlementPaidAmount={setSettlementPaidAmount}
        settlementPaymentStatus={settlementPaymentStatus}
        setSettlementPaymentStatus={setSettlementPaymentStatus}
        settlementStandardAmount={settlementStandardAmount}
        setSettlementStandardAmount={setSettlementStandardAmount}
        settlementAppliedDate={settlementAppliedDate}
        setSettlementAppliedDate={setSettlementAppliedDate}
        settlementPaidDate={settlementPaidDate}
        setSettlementPaidDate={setSettlementPaidDate}
        settlementPaymentMethod={settlementPaymentMethod}
        setSettlementPaymentMethod={setSettlementPaymentMethod}
        settlementTargetMember={settlementTargetMember}
        setSettlementTargetMember={setSettlementTargetMember}
        showBulsaCategorySheet={showBulsaCategorySheet}
        setShowBulsaCategorySheet={setShowBulsaCategorySheet}
        showBusinessCardModal={showBusinessCardModal}
        setShowBusinessCardModal={setShowBusinessCardModal}
        showIndeungNameplateModal={showIndeungNameplateModal}
        setShowIndeungNameplateModal={setShowIndeungNameplateModal}
        showIndividualRecordPrintModal={showIndividualRecordPrintModal}
        setShowIndividualRecordPrintModal={setShowIndividualRecordPrintModal}
        showSasiPrintModal={showSasiPrintModal}
        setShowSasiPrintModal={setShowSasiPrintModal}
        showSettlementModal={showSettlementModal}
        setShowSettlementModal={setShowSettlementModal}
        executeFinalSettlementRegistration={executeFinalSettlementRegistration}
        getMemberPrayerAndPaymentInfo={getMemberPrayerAndPaymentInfo}
        handleAddFamilyRow={handleAddFamilyRow}
        handleConfirmSettlementPayment={handleConfirmSettlementPayment}
        handleDeleteSettlement={handleDeleteSettlement}
        handleParseExcel={handleParseExcel}
        handleBatchImportExcel={handleBatchImportExcel}
        handleRefundSettlement={handleRefundSettlement}
        handleRegisterFamilyMember={handleRegisterFamilyMember}
        handleRegisterSettlementForMember={handleRegisterSettlementForMember}
        handleRemoveFamilyRow={handleRemoveFamilyRow}
        handleSaveEditedSettlement={handleSaveEditedSettlement}
        handleUpdateFamilyRow={handleUpdateFamilyRow}
        renderBulsaCategorySheet={renderBulsaCategorySheet}
        renderLanternModal={renderLanternModal}
        renderMemberRowCard={renderMemberRowCard}
        toggleSasiPrayedCheck={toggleSasiPrayedCheck}
        handleSaveMemberEdit={handleSaveMemberEdit}
        adminKPIs={adminKPIs}
        currentActiveBeliever={currentActiveBeliever}
        setActiveBelieverCode={setActiveBelieverCode}
        setCurrentUserCode={setCurrentUserCode}
      />
    )
  }

  return (
    <div className={`min-h-screen bg-[#12100E] flex justify-center selection:bg-[#C59B27] selection:text-white w-full max-w-full overflow-x-clip ${activeTab === 'admin' ? 'p-0 sm:p-4' : ''}`}>
      {/* 모바일 앱 컨테이너 (일반 탭: 480px, 관리자 탭: PC에서 최대 1280px 와이드 데스크톱 뷰) */}
      <div className={`w-full min-h-screen bg-[#FAF8F5] text-[#231F1C] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#E8DFD1]/30 pb-24 overflow-x-clip transition-all duration-300 ${
        activeTab === 'admin' ? 'max-w-7xl sm:rounded-3xl sm:border border-[#C59B27]/40 sm:my-2' : 'max-w-[480px]'
      }`}>
        
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
              playBeomjongSound()
              showToast('🔔 장엄하고 깊은 제주 소원사 범종 소리로 도량을 맑히고 마음을 정화합니다.')
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#2A2520] hover:bg-[#38312A] border border-[#C59B27]/40 text-[#F5D061] text-[11px] font-semibold whitespace-nowrap shrink-0 transition shadow-sm active:scale-95"
            title="제주 소원사 범종 소리 듣기"
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0 text-[#F5D061]" />
            <span>범종</span>
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
                  {currentUser.role === 'temple_admin'
                    ? ' 신도회장님'
                    : currentUser.role === 'master'
                    ? ' 총괄위원장님'
                    : currentUser.role === 'agent'
                    ? ' 포교위원장님'
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

        {/* 알림 배너 (상단에 떴던 선명한 검정 바탕 그대로, 화면 중간에 위치) */}
        {toast && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none animate-in fade-in duration-200">
            <div
              onClick={() => {
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
                setToast(null)
              }}
              style={{ backgroundColor: '#1E1914' }}
              className="w-full max-w-[440px] text-[#FAF8F5] border-2 border-[#F5D061] p-3.5 sm:p-4 rounded-2xl shadow-[0_15px_60px_rgba(0,0,0,0.9)] leading-relaxed flex items-center justify-between gap-3 pointer-events-auto cursor-pointer transition hover:border-[#FFE27A]"
              title="터치하면 닫힙니다"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#C59B27] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,208,97,0.4)] text-[#1B1815]">
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10px] text-[#F5D061] font-extrabold tracking-wider uppercase font-serif-kr">
                    제주 소원사 도량 안내
                  </span>
                  <div className="font-bold text-xs sm:text-sm text-[#FFFDF7] leading-snug break-keep mt-0.5">
                    {toast}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
                  setToast(null)
                }}
                className="text-xs font-bold text-[#E8DFD1] hover:text-[#F5D061] py-1 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition shrink-0"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* ==================== 1. 신행홈 탭 ==================== */}
        {activeTab === 'home' && (
          <HomeTab
            heroSlideIdx={heroSlideIdx}
            setHeroSlideIdx={setHeroSlideIdx}
            HERO_SLIDES={HERO_SLIDES}
            setActiveTab={setActiveTab}
            playSingingBowlSound={playSingingBowlSound}
            getTodayLunarAndJaeil={getTodayLunarAndJaeil}
            handleShareDailyQuote={handleShareDailyQuote}
            DAILY_QUOTES={DAILY_QUOTES}
            quoteIdx={quoteIdx}
            setQuoteIdx={setQuoteIdx}
            autoVoiceEnabled={autoVoiceEnabled}
            speakingId={speakingId}
            startSpeech={startSpeech}
            toggleSpeech={toggleSpeech}
            showToast={showToast}
            healingAudioTrack={healingAudioTrack}
            setHealingAudioTrack={setHealingAudioTrack}
            HEALING_AUDIO_TRACKS={HEALING_AUDIO_TRACKS}
            isHealingPlaying={isHealingPlaying}
            handleToggleHealingPlay={handleToggleHealingPlay}
            isPlayerExpanded={isPlayerExpanded}
            setIsPlayerExpanded={setIsPlayerExpanded}
            showFullAudioModal={showFullAudioModal}
            setShowFullAudioModal={setShowFullAudioModal}
            sleepTimerMinutes={sleepTimerMinutes}
            sleepTimerSecondsLeft={sleepTimerSecondsLeft}
            handleSetSleepTimer={handleSetSleepTimer}
            playMoktakSound={playMoktakSound}
            setShow108MoktakModal={setShow108MoktakModal}
            notices={notices}
            activeNoticeIdx={activeNoticeIdx}
            setActiveNoticeIdx={setActiveNoticeIdx}
            setSelectedNotice={setSelectedNotice}
            setShowNoticeModal={setShowNoticeModal}
            setShowNoticeListModal={setShowNoticeListModal}
            currentUser={currentUser}
            wishName={wishName}
            setWishName={setWishName}
            wishPhone={wishPhone}
            setWishPhone={setWishPhone}
            showVisitForm={showVisitForm}
            setShowVisitForm={setShowVisitForm}
            visitDate={visitDate}
            setVisitDate={setVisitDate}
            visitTime={visitTime}
            setVisitTime={setVisitTime}
            VISIT_TIME_SLOTS={VISIT_TIME_SLOTS}
            visitHeadcount={visitHeadcount}
            setVisitHeadcount={setVisitHeadcount}
            visitPurpose={visitPurpose}
            setVisitPurpose={setVisitPurpose}
            visitMemo={visitMemo}
            setVisitMemo={setVisitMemo}
            handleVisitSubmit={handleVisitSubmit}
            handle108MoktakTap={handle108MoktakTap}
            isHealingVoiceOn={isHealingVoiceOn}
            setShowSanctuaryModal={setShowSanctuaryModal}
            setShowMeritCertModal={setShowMeritCertModal}
            setMeritCertType={setMeritCertType}
            handleShareMyLantern={handleShareMyLantern}
            lanternData={lanternData}
            userLanternStats={userLanternStats}
          />
        )}

        {/* ==================== 1-B. 불사안내 (생전예수재·위패·삼성각·기도 통합 신청) 탭 ==================== */}
        {activeTab === 'bulsa' && (
          <BulsaTab
            wishName={wishName}
            setWishName={setWishName}
            wishTarget={wishTarget}
            setWishTarget={setWishTarget}
            wishPhone={wishPhone}
            setWishPhone={setWishPhone}
            wishCategory={wishCategory}
            setWishCategory={setWishCategory}
            wishText={wishText}
            setWishText={setWishText}
            showBulsaCategorySheet={showBulsaCategorySheet}
            setShowBulsaCategorySheet={setShowBulsaCategorySheet}
            tossPayMethod={tossPayMethod}
            setTossPayMethod={setTossPayMethod}
            customPayAmount={customPayAmount}
            setCustomPayAmount={setCustomPayAmount}
            currentUser={currentUser}
            playMoktakSound={playMoktakSound}
            showToast={showToast}
            handleTossTestPayment={handleTossTestPayment}
            handlePrayerSubmit={handlePrayerSubmit}
            PRAYER_CATEGORY_TEMPLATES={PRAYER_CATEGORY_TEMPLATES}
          />
        )}

        {/* ==================== 2. 디지털 소원등 탭 (7일 정진 축원 시스템) ==================== */}
        {activeTab === 'lantern' && (
          <LanternTab
            isLanternLit={isLanternLit}
            lanternData={lanternData}
            wishName={wishName}
            setWishName={setWishName}
            wishPhone={wishPhone}
            setWishPhone={setWishPhone}
            wishCategory={wishCategory}
            setWishCategory={setWishCategory}
            wishTarget={wishTarget}
            setWishTarget={setWishTarget}
            wishText={wishText}
            setWishText={setWishText}
            currentUser={currentUser}
            prayers={prayers}
            handlePrayerSubmit={handlePrayerSubmit}
            handleSelectWishCategory={handleSelectWishCategory}
            playMoktakSound={playMoktakSound}
            setActiveTab={setActiveTab}
            showAllRecentLanterns={showAllRecentLanterns}
            setShowAllRecentLanterns={setShowAllRecentLanterns}
            getSasiDisplayInfo={getSasiDisplayInfo}
            formatPrayerDate={formatPrayerDate}
            handleLanternClick={handleLanternClick}
            isLanternExpired={isLanternExpired}
            userLanternStats={userLanternStats}
            PRAYER_CATEGORY_TEMPLATES={PRAYER_CATEGORY_TEMPLATES}
          />
        )}

        {/* ==================== 3. 사경 · 불교명언 · 경전공부 · 지혜퀴즈 탭 ==================== */}
        {activeTab === 'sutra' && (
          <SutraTab
            currentUser={currentUser}
            setMeritCertType={setMeritCertType}
            setShowMeritCertModal={setShowMeritCertModal}
            currentMeritCount={currentMeritCount}
            userMeritReward={userMeritReward}
            playSingingBowlSound={playSingingBowlSound}
            showToast={showToast}
            sutraSubTab={sutraSubTab}
            setSutraSubTab={setSutraSubTab}
            SUTRA_LIST={SUTRA_LIST}
            selectedSutraIdx={selectedSutraIdx}
            setSelectedSutraIdx={setSelectedSutraIdx}
            sutraInput={sutraInput}
            setSutraInput={setSutraInput}
            sutraCompleted={sutraCompleted}
            setSutraCompleted={setSutraCompleted}
            autoVoiceEnabled={autoVoiceEnabled}
            speakingId={speakingId}
            startSpeech={startSpeech}
            toggleSpeech={toggleSpeech}
            currentSutra={currentSutra}
            handleSutraChange={handleSutraChange}
            handleTouchStepSutra={handleTouchStepSutra}
            selectedLotusIdx={selectedLotusIdx}
            setSelectedLotusIdx={setSelectedLotusIdx}
            LOTUS_FORTUNES={LOTUS_FORTUNES}
            addMerit={addMerit}
            playMoktakSound={playMoktakSound}
            moktakCount={moktakCount}
            handleMoktakTap={handleMoktakTap}
            selectedMoodId={selectedMoodId}
            setSelectedMoodId={setSelectedMoodId}
            WISDOM_BY_MOOD={WISDOM_BY_MOOD}
            lessonBatchIdx={lessonBatchIdx}
            setLessonBatchIdx={setLessonBatchIdx}
            showAllLessons={showAllLessons}
            setShowAllLessons={setShowAllLessons}
            selectedLessonIdx={selectedLessonIdx}
            setSelectedLessonIdx={setSelectedLessonIdx}
            SUTRA_STUDY_LESSONS={SUTRA_STUDY_LESSONS}
            completedLessons={completedLessons}
            setCompletedLessons={setCompletedLessons}
            quizIndex={quizIndex}
            setQuizIndex={setQuizIndex}
            quizSelectedOption={quizSelectedOption}
            setQuizSelectedOption={setQuizSelectedOption}
            solvedQuizIds={solvedQuizIds}
            setSolvedQuizIds={setSolvedQuizIds}
            BUDDHIST_QUIZZES={BUDDHIST_QUIZZES}
          />
        )}

        {/* ==================== 🪪 나의 소원사 모바일 전자명함 전용 전체화면 탭 ==================== */}
        {activeTab === 'card' && (
          <MobileCardTab
            setActiveTab={setActiveTab}
            businessCardTarget={businessCardTarget}
            currentUser={currentUser}
            members={members}
            showToast={showToast}
          />
        )}

                {activeTab === 'profile' && (
          <ProfileTab
            isMaster={isMaster}
            currentUser={currentUser}
            showTestAccountSwitch={showTestAccountSwitch}
            setShowTestAccountSwitch={setShowTestAccountSwitch}
            handleLogout={handleLogout}
            setCurrentUserCode={setCurrentUserCode}
            showToast={showToast}
            authMode={authMode}
            setAuthMode={setAuthMode}
            loginIdInput={loginIdInput}
            setLoginIdInput={setLoginIdInput}
            loginPwInput={loginPwInput}
            setLoginPwInput={setLoginPwInput}
            showLoginPw={showLoginPw}
            setShowLoginPw={setShowLoginPw}
            rememberLogin={rememberLogin}
            setRememberLogin={setRememberLogin}
            handleLogin={handleLogin}
            getExpectedPwForId={getExpectedPwForId}
            signupName={signupName}
            setSignupName={setSignupName}
            signupPhone={signupPhone}
            setSignupPhone={setSignupPhone}
            signupPw={signupPw}
            setSignupPw={setSignupPw}
            signupDharmaName={signupDharmaName}
            setSignupDharmaName={setSignupDharmaName}
            signupBirthDate={signupBirthDate}
            setSignupBirthDate={setSignupBirthDate}
            signupLunarSolar={signupLunarSolar}
            setSignupLunarSolar={setSignupLunarSolar}
            signupAddress={signupAddress}
            setSignupAddress={setSignupAddress}
            signupFamilyMemo={signupFamilyMemo}
            setSignupFamilyMemo={setSignupFamilyMemo}
            handleSignup={handleSignup}
            setActiveTab={setActiveTab}
            onOpenSanctuary={() => setShowSanctuaryModal(true)}
            isAgentOrAbove={isAgentOrAbove}
            userMeritReward={userMeritReward}
            isRewardDetailOpen={isRewardDetailOpen}
            setIsRewardDetailOpen={setIsRewardDetailOpen}
            setMeritCertType={setMeritCertType}
            setShowMeritCertModal={setShowMeritCertModal}
            prayers={prayers}
            getSasiDisplayInfo={getSasiDisplayInfo}
            isProfileEditOpen={isProfileEditOpen}
            setIsProfileEditOpen={setIsProfileEditOpen}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            handleSaveProfile={handleSaveProfile}
            members={members}
            infoAffiliatedMode={infoAffiliatedMode}
            setInfoAffiliatedMode={setInfoAffiliatedMode}
            recentMembersFilter={recentMembersFilter}
            setRecentMembersFilter={setRecentMembersFilter}
            showAllRecentMembers={showAllRecentMembers}
            setShowAllRecentMembers={setShowAllRecentMembers}
            OrganizationTreeView={OrganizationTreeView}
            formatRelativeOrDate={formatRelativeOrDate}
            getMemberPrayerAndPaymentInfo={getMemberPrayerAndPaymentInfo}
            handleCopyRefLink={handleCopyRefLink}
            handleShareKakao={handleShareKakao}
            handleToggleQr={handleToggleQr}
            showQrCode={showQrCode}
            qrDataUrl={qrDataUrl}
            handleDownloadQr={handleDownloadQr}
            setShow108MoktakModal={setShow108MoktakModal}
            userLanternStats={userLanternStats}
            settlements={settlements}
            isLanternLit={isLanternLit}
            lanternData={lanternData}
            setShowQrCode={setShowQrCode}
            currentUserBelieversCount={currentUserBelieversCount}
            currentUserWipaeCount={currentUserWipaeCount}
            recentAffiliatedMembers={recentAffiliatedMembers}
          />
        )}

        {/* ==================== 5. 포교사(파트너 전산) 탭 ==================== */}
        {activeTab === 'agent' && isAgentOrAbove && (
          <AgentTab
            setActiveTab={setActiveTab}
            activeAgent={activeAgent}
            isMasterOrTempleAdmin={isMasterOrTempleAdmin}
            selectedAgentCode={selectedAgentCode}
            setSelectedAgentCode={setSelectedAgentCode}
            agents={agents}
            myAffiliatedMembers={myAffiliatedMembers}
            handleCopyRefLink={handleCopyRefLink}
            handleToggleQr={handleToggleQr}
            showQrCode={showQrCode}
            setBusinessCardTarget={setBusinessCardTarget}
            setShowBusinessCardModal={setShowBusinessCardModal}
            qrDataUrl={qrDataUrl}
            handleDownloadQr={handleDownloadQr}
            agentViewMode={agentViewMode}
            setAgentViewMode={setAgentViewMode}
            OrganizationTreeView={OrganizationTreeView}
            members={members}
            isAgentPrayerListExpanded={isAgentPrayerListExpanded}
            setIsAgentPrayerListExpanded={setIsAgentPrayerListExpanded}
            agentPrayerSearchQuery={agentPrayerSearchQuery}
            setAgentPrayerSearchQuery={setAgentPrayerSearchQuery}
            prayers={prayers}
            formatPrayerDate={formatPrayerDate}
            isAgentVisitListExpanded={isAgentVisitListExpanded}
            setIsAgentVisitListExpanded={setIsAgentVisitListExpanded}
            visits={visits}
            showToast={showToast}
            setVisits={setVisits}
          />
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

            <section className="rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#2C241C] text-white p-5 border border-[#C59B27]/50 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 font-bold">
                  {isTempleAdmin
                    ? '소원사 본부 최고대표 관제 · 양영문 창건주 회장 전산'
                    : 'MASTER ADMIN · 총괄 포교본부 전산 (제주AI파트너)'}
                </span>
                <Settings className="w-4 h-4 text-[#F5D061]" />
              </div>

              {/* 단독 사찰 격리 체계 배지 (대표님 불변 원칙 1번 준수) */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/70 via-[#1F291E] to-[#1C1814] border border-emerald-500/40 text-[11px] text-emerald-300">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="font-bold truncate">제주 소원사 본부 전산 격리 가동중</span>
                  <span className="text-[10px] text-emerald-400/80 hidden sm:inline">(사찰 독립성 100% · 타 사찰 노출 차단)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-600/40 font-mono font-bold shrink-0">
                  temple_id: sowonsa
                </span>
              </div>

              <h2 className="font-serif-kr text-xl font-bold">
                {isTempleAdmin
                  ? '소원사 사찰 본부 & 전국 위원회 총괄 정산 관제 센터'
                  : '총괄 판권(50%) & 전국 위원회 정산 관제 센터'}
              </h2>
              <p className="text-xs text-[#D6CEC2] leading-relaxed">
                {isTempleAdmin
                  ? '소원사 창건주 겸 신도회장(사찰 최고 대표책임자) 양영문 회장님의 사찰 본부 총괄 관제 센터입니다.'
                  : '김철수 총괄 대표님의 50% 판권 기준, 사찰 불사금(50%) 및 포교위원장(40%) · 포교위원(30%) 판권 마진을 통합 관제합니다.'}
              </p>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-[#F5D061] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#F5D061]" />
                <span>
                  <strong>[사찰 최고 보안 보장]</strong> 사찰 최고 대표책임자(창건주 회장님) 및 총괄 사업단만 열람 가능하며, 하위 포교위원에게는 일절 노출되지 않습니다.
                </span>
              </div>
            </section>

            {/* 실시간 통합 KPI 관제 대시보드 4종 카드 */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-white border border-[#E6DEC8] shadow-sm">
                <div className="text-[10.5px] text-[#8C8071] font-semibold flex items-center justify-between">
                  <span>총 등록 회원</span>
                  <Users className="w-3.5 h-3.5 text-[#9A7418]" />
                </div>
                <div className="text-lg font-black text-[#1B1815] mt-1">
                  {adminKPIs.totalMembers.toLocaleString()}<span className="text-xs font-normal text-[#8C8071] ml-0.5">명</span>
                </div>
                <div className="text-[10px] text-[#7A6E5E] mt-0.5 truncate">
                  신도 {adminKPIs.totalBelievers} · 위원 {adminKPIs.totalAgents} · 본부 {adminKPIs.totalAdmins}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E6DEC8] shadow-sm">
                <div className="text-[10.5px] text-[#8C8071] font-semibold flex items-center justify-between">
                  <span>사시예불 축원</span>
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-lg font-black text-amber-800 mt-1">
                  {adminKPIs.totalPrayersCount}<span className="text-xs font-normal text-[#8C8071] ml-0.5">위</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5 truncate">
                  D-7 정진 · {sasiPrayedCheckedIds.size}위 회향완료
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E6DEC8] shadow-sm">
                <div className="text-[10.5px] text-[#8C8071] font-semibold flex items-center justify-between">
                  <span>누적 불사 접수금</span>
                  <Award className="w-3.5 h-3.5 text-[#C59B27]" />
                </div>
                <div className="text-lg font-black text-[#1B1815] mt-1 truncate">
                  {(adminKPIs.totalSettlementAmount / 10000).toLocaleString()}<span className="text-xs font-normal text-[#8C8071] ml-0.5">만원</span>
                </div>
                <div className="text-[10px] text-[#7A6E5E] mt-0.5 truncate">
                  총 {settlements.length}건 봉안 접수
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gradient-to-br from-[#FFF9E6] to-[#FFF3CC] border border-[#E5D399] shadow-sm">
                <div className="text-[10.5px] text-[#8A6510] font-bold flex items-center justify-between">
                  <span>소원사 사찰 귀속</span>
                  <span className="text-xs font-bold text-[#8A6510]">卍</span>
                </div>
                <div className="text-lg font-black text-[#9A7418] mt-1 truncate">
                  {(adminKPIs.templeFund / 10000).toLocaleString()}<span className="text-xs font-normal text-[#8A6510] ml-0.5">만원</span>
                </div>
                <div className="text-[10px] text-[#8A6510] font-semibold mt-0.5 truncate">
                  실입금액 50% 사찰 계좌
                </div>
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
                  접수 후 7일 이내 정진 불자만 자동 추출됩니다. (금일 축원 체크: <strong>{sasiPrayedCheckedIds.size}위</strong>)
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

            {/* 1. 신규 포교위원 / 회원 등록 및 10만 신도 고속 검색 관리 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-kr font-bold text-base">
                    1. 통합 회원 & 포교위원회 DB 관리 ({members.length}명)
                  </h3>
                  <p className="text-[11px] text-[#8C8071] mt-0.5">
                    10만 신도 대비 1초 실시간 검색 및 등급 관리
                  </p>
                </div>
                <span className="text-xs text-[#9A7418] font-bold bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E5DEC9]">
                  포교위원 {agents.length}명 · 신도 {members.length - agents.length}명
                </span>
              </div>

              {/* 등록 방식 선택 탭: 1. 종무소 신도 & 가족사주 등록 | 2. 포교위원 등록 | 3. 기존 전산 엑셀 일괄 이관 */}
              <div className="flex items-center gap-1.5 p-1 bg-[#231F1C] rounded-xl border border-[#C59B27]/40 text-xs">
                <button
                  type="button"
                  onClick={() => setAdminRegMode('family')}
                  className={`flex-1 py-2 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    adminRegMode === 'family'
                      ? 'bg-[#F5D061] text-[#1B1815] shadow'
                      : 'text-[#D6CEC2] hover:text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-amber-700" />
                  <span>🏮 종무소 신도 & 가족사주 등록 (현장/전화)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminRegMode('quick')}
                  className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    adminRegMode === 'quick'
                      ? 'bg-[#F5D061] text-[#1B1815] shadow'
                      : 'text-[#D6CEC2] hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>⚡ 포교위원 등록</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminRegMode('excel')}
                  className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                    adminRegMode === 'excel'
                      ? 'bg-[#F5D061] text-[#1B1815] shadow'
                      : 'text-[#D6CEC2] hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📂 엑셀 일괄 이관</span>
                </button>
              </div>

              {/* 1) 종무소 현장/전화 접수용: 신도 및 가족 사주 전문 등록 폼 */}
              {adminRegMode === 'family' && (
                <form
                  onSubmit={handleRegisterFamilyMember}
                  className="p-4 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#F5EFE6] border-2 border-[#D5C59B] space-y-3.5 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[#E6DEC8]">
                    <div className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-[#8A6510]" />
                      <span>소원사 종무소 신도 & 가족 신적부(교적부) 등록</span>
                    </div>
                    <span className="text-[10.5px] text-[#8A6510] font-semibold">
                      생년월일 입력 시 띠·간지 100% 자동 산출
                    </span>
                  </div>

                  {/* 대표 신도 기본 인적사항 */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-[#6B5E4F]">1. 대표 신도 인적사항</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={regBelieverName}
                        onChange={(e) => setRegBelieverName(e.target.value)}
                        placeholder="대표 신도 성함 (예: 이정숙)"
                        required
                        className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={regBelieverDharma}
                        onChange={(e) => setRegBelieverDharma(e.target.value)}
                        placeholder="법명 (예: 무량화)"
                        className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                      />
                      <input
                        type="tel"
                        value={regBelieverPhone}
                        onChange={(e) => setRegBelieverPhone(e.target.value)}
                        placeholder="휴대폰 번호 (예: 010-8234-1088)"
                        required
                        className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                      <input
                        type="text"
                        value={regBelieverAddress}
                        onChange={(e) => setRegBelieverAddress(e.target.value)}
                        placeholder="거주지 주소 (예: 제주특별자치도 제주시 애월읍 애월로 12)"
                        className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                      />
                      <select
                        value={regBelieverParent}
                        onChange={(e) => setRegBelieverParent(e.target.value)}
                        className="px-2 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs font-semibold text-[#8A6510]"
                      >
                        <option value="55570267">🏛️ 1. 본사 귀속: 양영문 창건주 회장 (55570267 · 사찰본부 직속)</option>
                        <option value="33065540">👑 2. 귀속: 김철수 총괄대표 (33065540 · 전국포교본부 / 자연유입)</option>
                        {agents
                          .filter((a) => a.code !== '55570267' && a.code !== '33065540')
                          .map((a) => (
                            <option key={a.code} value={a.code}>
                              귀속: {a.name} ({a.role === 'agent' ? '위원장' : '위원'})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* 가족 사주 및 간지 일괄 등록 표 */}
                  <div className="space-y-2 pt-1 border-t border-[#E6DEC8]">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-[#6B5E4F] flex items-center gap-1.5">
                        <span>2. 가족 사주 명단 (세주/배우자/자녀)</span>
                        <span className="text-[10px] text-[#8C8071]">
                          *축원 시 세주(가장)부터 자동 낭독됩니다.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFamilyRow}
                        className="px-2 py-1 rounded-lg bg-[#231F1C] text-[#F5D061] text-[10.5px] font-bold hover:bg-[#302A25] transition flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>+ 가족 추가</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {regFamilyList.map((f, idx) => {
                        const { ganji, animal } = computeZodiacAndGanji(f.birth_year || f.birth_date)
                        return (
                          <div
                            key={f.id || idx}
                            className="p-2 rounded-lg bg-white border border-[#DDD3C1] flex items-center gap-2 flex-wrap text-xs"
                          >
                            <select
                              value={f.relation}
                              onChange={(e) => handleUpdateFamilyRow(f.id, 'relation', e.target.value)}
                              className="px-2 py-1.5 rounded bg-[#FAF8F5] border border-[#DDD4C4] text-[11px] font-bold text-[#8A6510] shrink-0"
                            >
                              <option value="세주(가장)">세주(가장)</option>
                              <option value="배우자">배우자</option>
                              <option value="장남">장남</option>
                              <option value="차남">차남</option>
                              <option value="장녀">장녀</option>
                              <option value="차녀">차녀</option>
                              <option value="부">부(아버지)</option>
                              <option value="모">모(어머니)</option>
                              <option value="자녀">자녀</option>
                              <option value="가족">기타가족</option>
                            </select>

                            <input
                              type="text"
                              value={f.name}
                              onChange={(e) => handleUpdateFamilyRow(f.id, 'name', e.target.value)}
                              placeholder="성함"
                              className="w-24 px-2 py-1.5 rounded bg-white border border-[#DDD4C4] text-xs font-semibold"
                            />

                            <input
                              type="text"
                              value={f.dharma_name}
                              onChange={(e) => handleUpdateFamilyRow(f.id, 'dharma_name', e.target.value)}
                              placeholder="법명(선택)"
                              className="w-20 px-2 py-1.5 rounded bg-white border border-[#DDD4C4] text-xs"
                            />

                            <input
                              type="text"
                              value={f.birth_year}
                              onChange={(e) => handleUpdateFamilyRow(f.id, 'birth_year', e.target.value)}
                              placeholder="생년(예: 1959)"
                              className="w-24 px-2 py-1.5 rounded bg-white border border-[#DDD4C4] text-xs font-mono"
                            />

                            <select
                              value={f.lunar_solar}
                              onChange={(e) => handleUpdateFamilyRow(f.id, 'lunar_solar', e.target.value)}
                              className="px-1.5 py-1.5 rounded bg-[#FAF8F5] border border-[#DDD4C4] text-[11px]"
                            >
                              <option value="음력">음력</option>
                              <option value="양력">양력</option>
                            </select>

                            {/* 자동 계산된 육십간지 및 띠 배지 */}
                            <div className="flex-1 min-w-[130px] flex items-center gap-1.5">
                              {ganji ? (
                                <span className="px-2 py-1 rounded bg-[#FFF5DC] text-[#7A5B0B] border border-[#E8D4A2] font-bold text-[11px] animate-in fade-in">
                                  {ganji} ({animal})
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#A69B8D]">
                                  생년 입력 시 간지 자동계산
                                </span>
                              )}
                            </div>

                            {regFamilyList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveFamilyRow(f.id)}
                                className="p-1 rounded text-[#999999] hover:text-red-600 hover:bg-red-50 transition shrink-0"
                                title="가족 행 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 3. 동시 기도 접수 (선택) */}
                  <div className="space-y-1.5 pt-1 border-t border-[#E6DEC8]">
                    <div className="text-[11px] font-bold text-[#6B5E4F]">
                      3. 대웅전 기도 동시 접수 (선택사항)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={regPrayerType}
                        onChange={(e) => setRegPrayerType(e.target.value)}
                        className="px-2.5 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs font-bold text-[#8A6510]"
                      >
                        <option value="none">기도 동시 접수 없음 (신적부만 등록)</option>
                        <option value="indeung_1yr">🏮 대웅전 1년 인등 (가족등 · 365일 정진)</option>
                        <option value="prayer_100d">📿 100일 특별기도 (D-100일 정진)</option>
                        <option value="lantern_1d">🪔 1일 소원등 (사시예불 당일 축원)</option>
                        <option value="jesujae">⚱️ 생전예수재 황금위패 봉안</option>
                      </select>
                      {regPrayerType !== 'none' && (
                        <input
                          type="text"
                          value={regWishText}
                          onChange={(e) => setRegWishText(e.target.value)}
                          placeholder="발원문 (예: 온 가족 무병장수 및 사업번창 발원)"
                          className="px-3 py-2 rounded-lg bg-white border border-[#DDD4C4] text-xs"
                        />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] via-[#8A6510] to-[#231F1C] text-[#FAF8F5] font-extrabold text-xs shadow-md hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-1.5"
                  >
                    <span>卍 소원사 종무전산에 가족 신적부 등록하기</span>
                  </button>
                </form>
              )}

              {/* 2) 포교위원 빠른 등록 폼 */}
              {adminRegMode === 'quick' && (
                <form
                  onSubmit={handleAdminAddMember}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2.5"
                >
                  <div className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-[#9A7418]" />
                    <span>신규 포교위원 빠른 등록 (초기비번: 0000)</span>
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
                      <option value="agent">포교위원장 등록 (40%)</option>
                      <option value="committee_member">포교위원 등록 (30%)</option>
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
                    className="w-full py-2.5 rounded-lg bg-[#231F1C] text-[#F5D061] font-bold text-xs hover:bg-[#302A25] transition"
                  >
                    + 포교위원 DB에 즉시 등록하기
                  </button>
                </form>
              )}

              {/* 3) 기존 전산 엑셀 일괄 이관 마법사 */}
              {adminRegMode === 'excel' && (
                <div className="p-4 rounded-xl bg-white border-2 border-dashed border-[#D5C59B] space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#E6DEC8]">
                    <div className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[#8A6510]" />
                      <span>기존 사찰 전산(모아소프트 등) 신도 명부 엑셀 일괄 이관</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                      복사 & 붙여넣기 원터치 이관
                    </span>
                  </div>

                  <p className="text-xs text-[#554E45] leading-relaxed">
                    기존 전산에서 다운로드받은 엑셀 파일의 내용(이름, 전화번호, 법명, 주소)을 복사(Ctrl+C)하여 아래 칸에 그대로 붙여넣기(Ctrl+V) 하세요.
                  </p>

                  <textarea
                    rows={4}
                    value={excelPasteText}
                    onChange={(e) => setExcelPasteText(e.target.value)}
                    placeholder="예시 (엑셀에서 복사해 붙여넣기):&#10;홍길동	010-1234-5678	보현심	제주특별자치도 제주시&#10;김철수	010-9876-5432	법륜	제주특별자치도 서귀포시"
                    className="w-full p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DDD4C4] text-xs font-mono placeholder:text-[#AAAAAA] focus:outline-none focus:border-[#C59B27]"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleParseExcel}
                      className="px-4 py-2 rounded-lg bg-[#231F1C] text-[#F5D061] text-xs font-bold hover:bg-[#302A25] transition"
                    >
                      1. 데이터 분석 및 미리보기
                    </button>
                    {excelParsedRows.length > 0 && (
                      <button
                        type="button"
                        onClick={handleBatchImportExcel}
                        disabled={isExcelUploading}
                        className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          2. {excelParsedRows.length}명 소원사 DB로 즉시 일괄 등록
                        </span>
                      </button>
                    )}
                  </div>

                  {excelParsedRows.length > 0 && (
                    <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#DDD4C4] space-y-1.5 max-h-48 overflow-y-auto">
                      <div className="text-[11px] font-bold text-[#8A6510]">
                        분석된 신도 미리보기 (총 {excelParsedRows.length}명):
                      </div>
                      <div className="space-y-1 text-xs">
                        {excelParsedRows.slice(0, 5).map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-[#444444]">
                            <span className="font-bold text-[#111111]">{r.name}</span>
                            <span>{r.phone}</span>
                            {r.dharma_name && <span className="text-[#8A6510]">({r.dharma_name})</span>}
                            <span className="text-[#888888] truncate">{r.address}</span>
                          </div>
                        ))}
                        {excelParsedRows.length > 5 && (
                          <div className="text-[10px] text-[#888888]">
                            ... 외 {excelParsedRows.length - 5}명
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  <span>📋 10만 신도 고속 검색 목록형</span>
                </button>
              </div>

              {adminMemberViewMode === 'tree' ? (
                <OrganizationTreeView
                  members={members}
                  rootCode={null}
                  activeAgentCode={currentUser?.code}
                  onSelectMember={(m) => {
                    setSelectedMemberDetail(m)
                  }}
                />
              ) : (
                /* 10만 신도 대비 1초 고속 검색 엔진 및 목록 */
                <div className="space-y-3">
                  {/* 실시간 검색창 */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#8C8071] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={adminMemberSearchQuery}
                      onChange={(e) => setAdminMemberSearchQuery(e.target.value)}
                      placeholder="성함, 법명, 남편(세주)/가족 이름, 전화번호 뒷4자리, 고유코드, 주소 검색 (10만 신도 1초 검색)"
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#D5C59B] text-xs placeholder:text-[#A89D8E] focus:outline-none focus:border-[#C59B27] shadow-inner"
                    />
                    {adminMemberSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setAdminMemberSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8071] hover:text-[#1B1815] p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 등급별 필터 칩 & 정렬 드롭다운 */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                      {[
                        { id: 'all', label: `전체 (${members.length})` },
                        {
                          id: 'lantern_active',
                          label: `🔥 점등 (${members.filter((m) => getMemberPrayerAndPaymentInfo(m).isLanternActive).length})`,
                        },
                        {
                          id: 'lantern_off',
                          label: `⚪ 소등 (${members.filter((m) => !getMemberPrayerAndPaymentInfo(m).isLanternActive).length})`,
                        },
                        { id: 'committee_member', label: `포교위원 (${members.filter((m) => m.role === 'committee_member').length})` },
                        { id: 'agent', label: `위원장 (${members.filter((m) => m.role === 'agent').length})` },
                        { id: 'believer', label: `일반신도 (${members.filter((m) => m.role === 'believer').length})` },
                        { id: 'admin', label: `본부임원 (${members.filter((m) => m.role === 'temple_admin' || m.role === 'master').length})` },
                      ].map((chip) => (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => setAdminMemberRoleFilter(chip.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition ${
                            adminMemberRoleFilter === chip.id
                              ? 'bg-[#1B1815] text-[#F5D061] shadow-sm'
                              : 'bg-[#FAF8F5] text-[#6B6155] border border-[#DDD4C4] hover:bg-white'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <select
                      value={adminMemberSort}
                      onChange={(e) => setAdminMemberSort(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white border border-[#DDD4C4] text-[11px] font-semibold text-[#231F1C] ml-auto shrink-0"
                    >
                      <option value="latest">최신 등록순</option>
                      <option value="name">성함 가나다순</option>
                      <option value="merit">공덕(기도) 많은순</option>
                    </select>
                  </div>

                  <div className="text-[11px] text-[#7A6E5E] flex justify-between items-center px-1">
                    <span>검색 결과: <strong>{filteredAdminMembers.length}명</strong></span>
                    {adminMemberSearchQuery && (
                      <span className="text-[#8A6510]">검색어: “{adminMemberSearchQuery}”</span>
                    )}
                  </div>

                  {/* 등록된 회원 목록 */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {filteredAdminMembers.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#8C8071] border border-dashed border-[#DDD4C4] rounded-xl">
                        일치하는 신도 또는 포교위원이 없습니다.
                      </div>
                    ) : (
                      filteredAdminMembers.map((m) => (
                        <div
                          key={m.code}
                          className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] hover:border-[#D5C59B] transition flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#231F1C]">
                                {m.name} {m.dharma_name ? `(${m.dharma_name})` : ''}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                                공덕 {Number(m.merit_count || 0).toLocaleString()}
                              </span>
                              {m._matchedFamily && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-300 font-bold flex items-center gap-0.5">
                                  <span>가족일치:</span>
                                  <strong>{m._matchedFamily.name}</strong>
                                  <span className="text-purple-700">({m._matchedFamily.relation})</span>
                                </span>
                              )}
                              {m.family_members && m.family_members.length > 0 && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                                  가족 {m.family_members.length}인
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#786E63] truncate mt-0.5">
                              {m.phone} {m.address ? `· ${m.address}` : ''}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedMemberDetail(m)}
                              className="px-2 py-1 rounded-lg bg-white hover:bg-[#FAF8F5] border border-[#D5C59B] text-[11px] font-bold text-[#8A6510] transition"
                            >
                              상세보기
                            </button>
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
                              className="px-2 py-1 rounded-lg bg-white border border-[#D5C59B] text-[11px] font-bold text-[#231F1C]"
                            >
                              <option value="believer">일반신도</option>
                              <option value="committee_member">포교위원 (30%)</option>
                              <option value="agent">포교위원장 (40%)</option>
                              <option value="temple_admin">창건주·신도회장 본부</option>
                              <option value="master">총괄 포교위원장 (제주AI파트너)</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                    산하에 포교위원장/포교위원이 없는 라인에서 성사 시, 50% 총판 풀 전액이 김철수 총괄 수당으로 귀속됩니다.
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
                      <span className="text-[10px] text-[#8C8071] block mt-0.5">직접 추천 포교비</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FFF9E6] border border-[#E5D399]">
                      <span className="text-[#8A6510] block font-bold">총괄 오버라이딩 마진:</span>
                      <strong className="text-[#9A7418] text-xs">+실입금액의 10%</strong>
                      <span className="text-[10px] text-[#8A6510] block mt-0.5">총괄 관리 지도비</span>
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
                      <span className="text-[9.5px] text-[#8C8071] block">직접 추천</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-[#E4DDD0]">
                      <span className="text-[#6B6155] block">상위위원장:</span>
                      <strong className="text-[#1B1815]">10%</strong>
                      <span className="text-[9.5px] text-[#8C8071] block">관리 지도비</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#FFF9E6] border border-[#E5D399]">
                      <span className="text-[#8A6510] block font-bold">총괄마진:</span>
                      <strong className="text-[#9A7418]">+10%</strong>
                      <span className="text-[9.5px] text-[#8A6510] block">총괄 관리비</span>
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
                    직접 성사 유치 위원 (1차 30% · 조직도 고정)
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl bg-[#F0EAE1] border border-[#DDD4C4] text-xs font-bold text-[#3D3630] flex items-center justify-between">
                    <span>{getRecommenderName(simAgentCode)}</span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                      🔒 조직도 자동 확정
                    </span>
                  </div>
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

            {/* 4. 위패 봉안 정산 원장 리스트 고도화 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-serif-kr font-bold text-base">
                    4. 위패 봉안 수당 정산 원장 ({filteredSettlements.length}건)
                  </h3>
                  <span className="text-[11px] text-[#8C8071]">
                    지급상태 원클릭 토글 및 수령자별 필터링
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySettlementsReport}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-white border border-[#D5C59B] text-[11px] font-bold text-[#8A6510] flex items-center gap-1 transition"
                  title="카카오톡 및 장부 보고용 텍스트 복사"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>정산집계표 복사</span>
                </button>
              </div>

              {/* 정산 원장 상태 & 포교사 필터 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={settlementStatusFilter}
                  onChange={(e) => setSettlementStatusFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-semibold text-[#231F1C]"
                >
                  <option value="all">전체 지급상태 ({settlements.length}건)</option>
                  <option value="confirmed">수당확정 / 미지급 ({settlements.filter((s) => s.payment_status === 'confirmed').length}건)</option>
                  <option value="settled">정산지급완료 ({settlements.filter((s) => s.payment_status === 'settled').length}건)</option>
                </select>

                <select
                  value={settlementAgentFilter}
                  onChange={(e) => setSettlementAgentFilter(e.target.value)}
                  className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] font-semibold text-[#231F1C]"
                >
                  <option value="all">전체 유치 포교사</option>
                  {agents.map((a) => (
                    <option key={a.code} value={a.code}>
                      유치: {a.name} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 정산 원장 리스트 */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredSettlements.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8C8071] border border-dashed border-[#DDD4C4] rounded-xl">
                    해당 조건에 일치하는 정산 내역이 없습니다.
                  </div>
                ) : (
                  filteredSettlements.map((s) => {
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

                    const isSettled = s.payment_status === 'settled'

                    return (
                      <div
                        key={s.id}
                        className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DEC9] space-y-2.5 hover:border-[#D5C59B] transition"
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

                        <div className="text-[10.5px] text-[#786E63] px-1 flex justify-between">
                          <span>직접유치: {s.agent_1st_name}</span>
                          {s.agent_2nd_name && s.agent_2nd_name !== '-' && (
                            <span>상위관리: {s.agent_2nd_name}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#EAE2D3]">
                          <span className="text-[#8C7A5B]">접수일: {s.created_at}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSettlementStatus(s.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-1 transition shadow-sm ${
                              isSettled
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            }`}
                            title="클릭하여 지급완료/수당확정 상태 전환"
                          >
                            {isSettled ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>정산지급완료</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>수당확정 (미지급)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </main>
        )}

        {/* 🪷 사시예불 축원 원만회향 안내 팝업 (오전 11시 이후 소원등 신청 신도님 본인에게만 감동 노출) */}
        {hoehangModalData && (() => {
          const dismissHoehang = () => {
            hoehangDismissedRef.current = true
            const todayKey = formatLocalDateKey(new Date())
            const seenKey = `sowonsa_hoehang_seen_${todayKey}`
            try {
              localStorage.setItem(seenKey, 'true')
              sessionStorage.setItem(seenKey, 'true')
            } catch (e) {}
            try {
              const raw = localStorage.getItem('sowonsa_7day_lantern')
              if (raw) {
                const parsed = JSON.parse(raw)
                if (parsed.sasi_date_key === todayKey) {
                  parsed.hoehang_seen = true
                  localStorage.setItem('sowonsa_7day_lantern', JSON.stringify(parsed))
                }
              }
            } catch (e) {}
            setHoehangModalData(null)
          }

          return (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) dismissHoehang()
              }}
            >
              <div className="w-full max-w-[385px] max-h-[85dvh] overflow-y-auto bg-[#1F1B17] text-white rounded-3xl p-5 sm:p-6 border-2 border-[#F5D061] text-center space-y-3 shadow-2xl animate-in zoom-in-95 duration-150 relative my-auto">
                <button
                  type="button"
                  onClick={dismissHoehang}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-13 h-13 rounded-full bg-gradient-to-b from-[#FFE27A] to-[#D48817] border-2 border-[#FFF3B8] mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(245,208,97,0.6)] text-2xl">
                  🪷
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs font-extrabold text-emerald-300">
                  <span>✨ 오늘 오전 10시 사시예불 원만회향</span>
                </div>

                <h3 className="font-serif-kr text-lg sm:text-xl font-bold text-[#F5D061] leading-snug">
                  소원등 축원이 원만히 회향되었습니다
                </h3>

                <p className="text-xs text-[#E2DAD0] leading-relaxed break-keep px-1">
                  <strong className="text-[#FAF8F5]">{hoehangModalData.believer_name}</strong> 불자님께서 부처님 전에 밝혀주신 간절한 발원이 대웅전 사시예불에서 주지스님의 정성스러운 축원 속에 원만히 회향되었습니다.
                </p>

                {/* 회향 상세 확인 카드 */}
                <div className="p-3.5 rounded-2xl bg-[#2A231B] border border-[#C59B27]/60 text-left shadow-md space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#C59B27] text-[#1B1815]">
                      축원 회향 내역
                    </span>
                    <span className="text-[11px] font-bold text-[#F5D061]">
                      {hoehangModalData.wish_category || '대웅전 소원등'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-[11.5px] pt-0.5">
                    <span className="text-[#A89D8E] shrink-0">축원 불자</span>
                    <span className="font-bold text-[#FAF8F5] text-right break-keep">
                      {hoehangModalData.believer_name}
                      {hoehangModalData.believer_phone ? ` · ${hoehangModalData.believer_phone}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
                    <span className="text-[#A89D8E] shrink-0">축원 일시</span>
                    <span className="font-bold text-emerald-300 text-right">
                      오늘 오전 10:00 사시예불
                    </span>
                  </div>
                  {hoehangModalData.wish_text && (
                    <div className="pt-1 border-t border-white/5">
                      <div className="text-[10.5px] text-[#A89D8E] mb-0.5">발원 내용</div>
                      <div className="text-[11px] text-[#E8DFD1] leading-relaxed break-keep line-clamp-2">
                        “{hoehangModalData.wish_text}”
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#D4AF37]">
                  🙏 부처님의 대자대비하신 가피가 온 가족과 늘 함께하시기를 축원합니다.
                </div>

                {/* 합장하며 확인 (닫기) */}
                <button
                  type="button"
                  onClick={dismissHoehang}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#AA7C11] hover:brightness-110 text-[#1B1815] font-black text-sm active:scale-95 transition cursor-pointer shadow-md"
                >
                  합장하며 확인 (닫기)
                </button>
              </div>
            </div>
          )
        })()}

        {/* 이미 현재 사시예불 회차에 1일 소원등이 점등 중인 회원에게 띄우는 안내 팝업 (중복 DB 등록 및 중복 문자 발송 없음) */}
        {alreadyLitModalData && (() => {
          const sasiInfo = getSasiDisplayInfo(alreadyLitModalData.sasi_date_key)
          return (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setAlreadyLitModalData(null)
              }}
            >
              <div className="w-full max-w-[385px] max-h-[84dvh] overflow-y-auto bg-[#1F1B17] text-white rounded-3xl p-5 sm:p-6 border-2 border-[#F5D061] text-center space-y-3 shadow-2xl animate-in zoom-in-95 duration-150 relative my-auto">
                <button
                  type="button"
                  onClick={() => setAlreadyLitModalData(null)}
                  className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-12 h-12 rounded-full bg-gradient-to-b from-[#FFE27A] to-[#D48817] border-2 border-[#FFF3B8] mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(245,208,97,0.5)]">
                  <Flame className="w-6 h-6 text-[#1B1815] fill-[#1B1815]" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs font-extrabold text-emerald-300">
                  <span>✨ 🪔 누적 {alreadyLitModalData.total_count || userLanternStats.totalCount}회 · 🔥 {alreadyLitModalData.streak || userLanternStats.streak}일 연속 정진 중</span>
                </div>

                <h3 className="font-serif-kr text-lg sm:text-xl font-bold text-[#F5D061] leading-snug">
                  현재 소원등이 점등 중입니다
                </h3>

                <p className="text-xs text-[#E2DAD0] leading-relaxed break-keep">
                  <strong className="text-[#FAF8F5]">{alreadyLitModalData.believer_name}</strong> 불자님의 1일 소원등이 이미 대웅전에 밝게 켜져 있으며,{' '}
                  <strong className="text-[#F5D061]">{sasiInfo.shortLabel}</strong>에 스님께서 정성껏 축원 올립니다.
                  <br />
                  <span className="text-[11px] text-[#B8AEA0]">
                    (예불이 끝나는 오전 11시에 미점등으로 전환되며, 이후 다시 밝히실 수 있습니다.)
                  </span>
                </p>

                <div className="p-3 rounded-2xl bg-[#2A231B] border border-[#C59B27]/60 text-left shadow-md space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#C59B27] text-[#1B1815]">
                      현재 점등 내역
                    </span>
                    <span className="text-[11px] font-bold text-[#F5D061]">
                      {alreadyLitModalData.wish_category}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-[11.5px] pt-0.5">
                    <span className="text-[#A89D8E] shrink-0">점등 불자</span>
                    <span className="font-bold text-[#FAF8F5] text-right break-keep">
                      {alreadyLitModalData.believer_name}
                      {alreadyLitModalData.believer_phone ? ` · ${alreadyLitModalData.believer_phone}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
                    <span className="text-[#A89D8E] shrink-0">축원 일정</span>
                    <span className="font-bold text-emerald-300 text-right">
                      {sasiInfo.detailLabel}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-white/5">
                    <div className="text-[10.5px] text-[#A89D8E] mb-0.5">발원 내용</div>
                    <div className="text-[11px] text-[#E8DFD1] leading-relaxed break-keep whitespace-pre-wrap">
                      “{alreadyLitModalData.wish_text}”
                    </div>
                  </div>
                </div>

                {/* 합장하며 확인 (닫기) */}
                <button
                  type="button"
                  onClick={() => setAlreadyLitModalData(null)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#AA7C11] hover:brightness-110 text-[#1B1815] font-black text-sm active:scale-95 transition cursor-pointer shadow-md"
                >
                  합장하며 확인 (닫기)
                </button>
              </div>
            </div>
          )
        })()}

        {/* 축원 완료 모달 (선택한 종목에 맞춰 100% 맞춤 렌더링) */}
        {showSuccessModal && (() => {
          const isWipaeCat = (wishCategory || '').includes('위패') || (wishCategory || '').includes('생전예수재')
          const isSamseongCat = (wishCategory || '').includes('삼성각') || (wishCategory || '').includes('기와') || (wishCategory || '').includes('단청') || (wishCategory || '').includes('명패')
          const isIndeungCat = (wishCategory || '').includes('인등')
          const is100dCat = (wishCategory || '').includes('100일')
          const is49jaeCat = (wishCategory || '').includes('49재') || (wishCategory || '').includes('천도재') || (wishCategory || '').includes('기일')
          const isRiceCat = (wishCategory || '').includes('공양미')

          const nowSchedule = computeSasiSchedule(Date.now())
          const nowSasiInfo = getSasiDisplayInfo(nowSchedule.sasiDateKey)
          const previewStreak = previewNextStreakCount(
            nowSchedule.sasiDateKey,
            nowSchedule.prevSasiDateKey
          )

          const title = isWipaeCat
            ? '🏛️ 영구 위패 봉안 불사 접수 확인'
            : isSamseongCat
            ? '🏔️ 삼성각 성전 건립 대작불사 접수 확인'
            : isIndeungCat
            ? '🪔 대웅전 1년 인등(가족등) 접수 확인'
            : is100dCat
            ? '🪷 100일 소원성취 특별기도 접수 확인'
            : is49jaeCat
            ? '🪷 49재 · 천도재 · 기일제사 접수 확인'
            : isRiceCat
            ? '🪷 대웅전 공양미 / 불전시주 접수 확인'
            : '대웅전 소원등 점등 확인'

          const badge = isWipaeCat
            ? '🏛️ 영구 봉안 대원력 (사시예불 영구 축원)'
            : isSamseongCat
            ? '🏔️ 칠성·산신·독성 성전 건립 무량공덕'
            : isIndeungCat
            ? '🪔 365일 대웅전 무량광명 가족등'
            : is100dCat
            ? '🪷 100일 지극정성 소원성취 특별기도'
            : is49jaeCat
            ? '🪷 영가 극락왕생 및 칠칠재 천도발원'
            : isRiceCat
            ? '🪷 부처님 전 공양 공덕 및 복덕구족'
            : `🪔 ${previewStreak}일 연속 정진! (${nowSasiInfo.shortLabel} 축원)`

          const desc = isWipaeCat
            ? '소원사 법당에 정결하게 위패를 봉안하고, 매일 오전 10시 사시예불마다 영가 극락왕생과 가내 평안을 정성껏 축원합니다.'
            : isSamseongCat
            ? '성전 건립 대작불사 공덕이 삼성각 영전에 영구 봉안되며, 칠성·산신·독성 성인의 가피가 가정에 늘 함께하시길 축원합니다.'
            : isIndeungCat || is100dCat || is49jaeCat || isRiceCat
            ? '매일 오전 10시 대웅전 사시예불에서 주지스님께서 불자님 가정의 간절한 서원을 부처님 전에 정성껏 축원 올립니다.'
            : `소원등이 즉시 점등되며, ${nowSasiInfo.shortLabel}에서 스님께서 불자님과 가족의 발원을 정성껏 축원 올립니다.`

          const previewWishText =
            (wishText || '').trim() ||
            PRAYER_CATEGORY_TEMPLATES[wishCategory] ||
            '우리 가족 올 한 해 무병장수하고 하는 일마다 순조롭게 풀리기를 발원합니다.'

          const shareTarget = wishTarget && wishTarget !== '본인' ? ` (${wishTarget})` : ''
          const shareTitle = isWipaeCat
            ? '제주 소원사 영구 위패 봉안 접수'
            : isSamseongCat
            ? '제주 소원사 삼성각 성전 건립 대작불사 동참'
            : isIndeungCat
            ? '제주 소원사 대웅전 1년 인등(가족등) 접수'
            : is100dCat
            ? '제주 소원사 100일 소원성취 특별기도 접수'
            : '제주 소원사 소원등 점등'

          const shareMsg = isWipaeCat
            ? `🏛️ [제주 소원사 영구 위패 봉안]\n${wishName.trim()} 불자님의 영구 위패 봉안 불사가 부처님 전에 정식 접수되었습니다.\n\n"매일 오전 10시 사시예불마다 스님께서 극락왕생과 가내 평안을 영구 축원합니다."\n\n🙏 소원사 모바일 법당:\nhttps://sowonpray.vercel.app`
            : isSamseongCat
            ? `🏔️ [제주 소원사 삼성각 건립 불사]\n${wishName.trim()} 불자님의 성전 건립 동참 공덕이 정식 접수되었습니다.\n\n"칠성·산신·독성 성인의 무량가피가 온 가족과 함께하시길 축원합니다."\n\n🙏 소원사 모바일 법당:\nhttps://sowonpray.vercel.app`
            : `🪔 [제주 소원사 대웅전]\n${wishName.trim()}${shareTarget} 불자님의 간절한 소원등이 부처님 전에 밝혀졌습니다.\n\n"매일 오전 10시 사시예불마다 스님께서 정성껏 축원 올립니다."\n\n🙏 함께 소원등 켜고 축원 받기:\nhttps://sowonpray.vercel.app`

          return (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCancelSubmittedPrayer()
              }}
            >
              <div className="w-full max-w-[385px] max-h-[84dvh] sm:max-h-[90vh] overflow-y-auto bg-[#1F1B17] text-white rounded-3xl p-4 sm:p-6 border border-[#F5D061] text-center space-y-2.5 sm:space-y-3 shadow-2xl animate-in zoom-in-95 duration-150 relative my-auto">
                {/* 상단 우측 X 닫기/취소 버튼 */}
                <button
                  type="button"
                  onClick={handleCancelSubmittedPrayer}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer z-10"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#F5D061]/20 border border-[#F5D061] mx-auto flex items-center justify-center text-xl sm:text-2xl">
                  {isWipaeCat ? '🏛️' : isSamseongCat ? '🏔️' : isIndeungCat ? '🪔' : (is100dCat || is49jaeCat || isRiceCat) ? '🪷' : <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-[#F5D061] fill-[#F5D061]" />}
                </div>

                <h3 className="font-serif-kr text-lg sm:text-xl font-bold text-[#F5D061] leading-snug px-4">
                  {title}
                </h3>

                {/* 뱃지 */}
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-[#F5D061]/15 border border-[#F5D061]/50 text-[11px] sm:text-xs font-bold text-[#F5D061]">
                  <span>{badge}</span>
                </div>

                <p className="text-[11.5px] sm:text-xs text-[#E2DAD0] leading-snug break-keep px-1">
                  {desc}
                </p>

                {/* 중간 확인 카드: 중복 인사말 대신 [내가 입력한 접수 확인 내역] 전문을 말줄임표(...) 없이 전부 표시 */}
                <div className="p-3 rounded-2xl bg-[#2A231B] border border-[#C59B27]/60 text-left shadow-md space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 flex-wrap">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#C59B27] text-[#1B1815] shrink-0">
                      접수 확인 내역
                    </span>
                    <span className="text-[11px] font-bold text-[#F5D061] text-right break-keep">
                      {wishCategory || '대웅전 소원등'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-[11.5px] pt-0.5">
                    <span className="text-[#A89D8E] shrink-0">신청 불자</span>
                    <span className="font-bold text-[#FAF8F5] text-right break-keep">
                      {wishName.trim()}{wishTarget && wishTarget !== '본인' ? ` (${wishTarget.trim()})` : ''} · {wishPhone.trim()}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-white/5">
                    <div className="text-[10.5px] text-[#A89D8E] mb-0.5">발원 내용</div>
                    <div className="text-[11px] text-[#E8DFD1] leading-relaxed break-keep whitespace-pre-wrap">
                      “{previewWishText}”
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#D4AF37]">
                  🙏 도량에 오시기 전날 미리 연락 주시면 따뜻한 차와 공양을 대접해 드립니다. (010-4912-1083)
                </div>

                {/* 가족·지인에게 알리기 (카카오톡 공식 피드 카드 및 전문 전송) */}
                <button
                  type="button"
                  onClick={() => {
                    handleConfirmSubmittedPrayer({ closeModal: false })
                    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '6e9a618a3862f884e3eece4bb6550922'
                    const code = currentUser?.code || referralCode || '33065540'
                    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
                    const shareUrl = `${origin}/?ref=${code}`
                    const altarImageUrl = 'https://sowonpray.vercel.app/images/sowonsa_altar_card.jpg?v=3'

                    // 1) 카카오톡 공식 JavaScript SDK 피드 카드 전송 (사진 + 제목 + 축원문 + 바로가기 버튼 완벽 전송)
                    if (typeof window !== 'undefined' && window.Kakao) {
                      try {
                        if (!window.Kakao.isInitialized()) {
                          window.Kakao.init(kakaoKey)
                        }
                        if (window.Kakao.isInitialized() && window.Kakao.Share) {
                          window.Kakao.Share.sendDefault({
                            objectType: 'feed',
                            content: {
                              title: `🪷 [제주 소원사] ${wishCategory || '대웅전 소원등'} 축원 접수`,
                              description: `발원문: "${previewWishText}"`,
                              imageUrl: altarImageUrl,
                              imageWidth: 1024,
                              imageHeight: 693,
                              link: {
                                mobileWebUrl: shareUrl,
                                webUrl: shareUrl,
                              },
                            },
                            itemContent: {
                              profileText: '제주 소원사 대웅전 축원접수증',
                              titleImageText: `${wishCategory || '대웅전 소원등'}`,
                              titleImageCategory: `${nowSasiInfo.shortLabel} 축원`,
                              items: [
                                { item: '신청불자', itemOp: `${wishName.trim()}${shareTarget}` },
                                { item: '연락처', itemOp: wishPhone.trim() },
                                { item: '기원종목', itemOp: wishCategory || '가족건강' },
                                { item: '축원일정', itemOp: nowSasiInfo.shortLabel },
                                { item: '종무소', itemOp: '010-4912-1083' },
                              ],
                            },
                            buttons: [
                              {
                                title: '🪷 소원사 모바일 법당 함께하기',
                                link: {
                                  mobileWebUrl: shareUrl,
                                  webUrl: shareUrl,
                                },
                              },
                            ],
                          })
                          return
                        }
                      } catch (err) {
                        console.warn('Kakao share fallback error:', err)
                      }
                    }

                    // 2) 일반 브라우저 공유 fallback (본문+링크 통합 전송하여 카톡 링크 전락 방지!)
                    const fullText = `${shareMsg}\n\n👉 제주 소원사 모바일 법당:\n${shareUrl}`
                    if (navigator.share) {
                      navigator.share({
                        title: shareTitle,
                        text: fullText,
                      }).catch(() => {})
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(fullText)
                      showToast('📋 축원 메시지가 복사되었습니다! 카카오톡 가족방에 붙여넣어 보세요.')
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FEE500] to-[#FADA0A] text-[#3C1E1E] font-black text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#3C1E1E] shrink-0" />
                  <span>가족·지인에게 내 발원 알리기 (카톡 공유)</span>
                </button>

                {/* 하단 접수 취소 및 합장 확인 2단 버튼 */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelSubmittedPrayer}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-[#D6CEC2] hover:text-red-300 border border-white/10 font-bold text-xs transition cursor-pointer"
                    title="방금 접수한 내용을 취소하고 장부에서 제외합니다"
                  >
                    접수 취소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmSubmittedPrayer({ closeModal: true })}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1B1815] via-[#2A231C] to-[#1B1815] hover:brightness-110 text-[#F5D061] border border-[#C59B27] font-bold text-xs transition cursor-pointer shadow-md"
                  >
                    합장하며 확인
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* 도량 방문 & 사찰 공양(식사) 사전 예약 확인 모달 */}
        {showVisitSuccessModal && (() => {
          const draft = pendingVisitDraftRef.current || {}
          const vName = draft.visitorName || wishName.trim()
          const vPhone = draft.visitorPhone || wishPhone.trim()
          const vDate = draft.visitDate || visitDate
          const vTime = draft.visitTime || visitTime
          const vCount = draft.exactHeadcount || Math.max(1, Number(visitHeadcount) || 1)
          const vPurpose = draft.visitPurpose || visitPurpose
          const vMemo =
            draft.memo ||
            visitMemo.trim() ||
            `방문 인원 총 ${vCount}명 따뜻한 차와 사찰 공양(${vCount}인분) 부탁드립니다.`

          const visitShareMsg = `🍵 [제주 소원사 도량 방문 · 사찰 공양 예약]\n${vName} 불자님 외 총 ${vCount}명 방문 및 사찰 공양 예약이 접수되었습니다.\n\n• 방문 일시: ${vDate} ${vTime}\n• 방문 인원: 총 ${vCount}명 (${vPurpose})\n• 요청 메모: "${vMemo}"\n• 종무소 문의: 064-805-2007 / 010-4912-1083`

          return (
            <div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCancelSubmittedVisit()
              }}
            >
              <div className="w-full max-w-[385px] max-h-[84dvh] sm:max-h-[90vh] overflow-y-auto bg-[#1F1B17] text-white rounded-3xl p-4 sm:p-6 border border-[#F5D061] text-center space-y-2.5 sm:space-y-3 shadow-2xl animate-in zoom-in-95 duration-150 relative my-auto">
                {/* 상단 우측 X 닫기/취소 버튼 */}
                <button
                  type="button"
                  onClick={handleCancelSubmittedVisit}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer z-10"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#F5D061]/20 border border-[#F5D061] mx-auto flex items-center justify-center text-xl sm:text-2xl">
                  🍵
                </div>

                <h3 className="font-serif-kr text-lg sm:text-xl font-bold text-[#F5D061] leading-snug px-4">
                  도량 방문 · 사찰 공양 예약 확인
                </h3>

                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-[#F5D061]/15 border border-[#F5D061]/50 text-[11px] sm:text-xs font-bold text-[#F5D061]">
                  <span>🍵 {vDate} · {vTime.split(' ')[0]} 방문 (총 {vCount}명)</span>
                </div>

                <p className="text-[11.5px] sm:text-xs text-[#E2DAD0] leading-snug break-keep px-1">
                  도량에 오시는 날 따뜻한 차와 정성스러운 사찰 공양({vCount}인분)을 대접해 드릴 수 있도록 공양간과 종무소에 예약을 전달합니다.
                </p>

                {/* 예약 확인 내역 카드 */}
                <div className="p-3 rounded-2xl bg-[#2A231B] border border-[#C59B27]/60 text-left shadow-md space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 flex-wrap">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#C59B27] text-[#1B1815] shrink-0">
                      예약 확인 내역
                    </span>
                    <span className="text-[11px] font-bold text-[#F5D061] text-right break-keep">
                      총 {vCount}명 · {vPurpose}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-[11.5px] pt-0.5">
                    <span className="text-[#A89D8E] shrink-0">방문 일시</span>
                    <span className="font-bold text-emerald-300 text-right break-keep">
                      {vDate} · {vTime}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2 text-[11.5px] pt-0.5">
                    <span className="text-[#A89D8E] shrink-0">예약 불자</span>
                    <span className="font-bold text-[#FAF8F5] text-right break-keep">
                      {vName} · {vPhone}
                    </span>
                  </div>
                  <div className="pt-1 border-t border-white/5">
                    <div className="text-[10.5px] text-[#A89D8E] mb-0.5">요청 메모</div>
                    <div className="text-[11px] text-[#E8DFD1] leading-relaxed break-keep whitespace-pre-wrap">
                      “{vMemo}”
                    </div>
                  </div>
                </div>

                {/* 1) 카카오톡 공유 버튼 (동행 가족·지인 또는 종무소 공유) */}
                <button
                  type="button"
                  onClick={() => {
                    handleConfirmSubmittedVisit({ closeModal: false })
                    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '6e9a618a3862f884e3eece4bb6550922'
                    const code = currentUser?.code || referralCode || '33065540'
                    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://sowonpray.vercel.app'
                    const shareUrl = `${origin}/?ref=${code}`
                    const altarImageUrl = 'https://sowonpray.vercel.app/images/sowonsa_altar_card.jpg?v=3'

                    if (typeof window !== 'undefined' && window.Kakao) {
                      try {
                        if (!window.Kakao.isInitialized()) {
                          window.Kakao.init(kakaoKey)
                        }
                        if (window.Kakao.isInitialized() && window.Kakao.Share) {
                          const shortPurpose = vTime.includes('점심')
                            ? `점심공양 (${vCount}인분)`
                            : vTime.includes('스님')
                            ? '스님 차담·상담'
                            : vTime.includes('오후 04')
                            ? '오후 기도·참배'
                            : '참배·차담'
                          window.Kakao.Share.sendDefault({
                            objectType: 'feed',
                            content: {
                              title: `🍵 [제주 소원사] 방문·공양 예약 (${vDate})`,
                              description: `요청사항: "${vMemo}"`,
                              imageUrl: altarImageUrl,
                              imageWidth: 1024,
                              imageHeight: 693,
                              link: {
                                mobileWebUrl: shareUrl,
                                webUrl: shareUrl,
                              },
                            },
                            itemContent: {
                              profileText: '제주 소원사 도량방문 예약확인증',
                              titleImageText: `총 ${vCount}명 방문 예약`,
                              titleImageCategory: `${vDate} · ${vTime.split(' ')[0]}`,
                              items: [
                                { item: '예약불자', itemOp: vName },
                                { item: '연락처', itemOp: vPhone },
                                { item: '방문일시', itemOp: `${vDate} ${vTime.split(' ')[0]}` },
                                { item: '방문목적', itemOp: `총 ${vCount}명 · ${shortPurpose}` },
                                { item: '종무소', itemOp: '010-4912-1083' },
                              ],
                            },
                            buttons: [
                              {
                                title: '🪷 소원사 모바일 법당 보기',
                                link: {
                                  mobileWebUrl: shareUrl,
                                  webUrl: shareUrl,
                                },
                              },
                            ],
                          })
                          return
                        }
                      } catch (err) {
                        console.warn('Kakao visit share fallback error:', err)
                      }
                    }

                    const fullText = `${visitShareMsg}\n\n👉 제주 소원사 모바일 법당:\n${shareUrl}`
                    if (navigator.share) {
                      navigator.share({
                        title: '제주 소원사 방문 · 사찰 공양 예약',
                        text: fullText,
                      }).catch(() => {})
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(fullText)
                      showToast('📋 방문 예약 내역이 복사되었습니다! 카카오톡에 붙여넣어 공유하세요.')
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FEE500] to-[#FADA0A] text-[#3C1E1E] font-black text-xs shadow flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#3C1E1E] shrink-0" />
                  <span>가족·지인에게 방문 예약 알리기 (카톡 공유)</span>
                </button>

                {/* 2) 종무소(010-4912-1083)로 휴대폰 문자(SMS) 즉시 보내기 버튼 (유료 API 없이도 100% 무료 직통 발송) */}
                <button
                  type="button"
                  onClick={() => {
                    handleConfirmSubmittedVisit({ closeModal: false })
                    const smsBody = `[제주 소원사 방문·공양 예약]\n• 예약자: ${vName} (${vPhone})\n• 방문일시: ${vDate} ${vTime}\n• 방문인원: 총 ${vCount}명 (${vPurpose})\n• 요청사항: ${vMemo}`
                    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent || '')
                    const sep = isIOS ? '&' : '?'
                    window.location.href = `sms:010-4912-1083${sep}body=${encodeURIComponent(smsBody)}`
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>📩 종무소(010-4912-1083)로 예약 문자 바로 보내기</span>
                </button>

                {/* 하단 예약 취소 및 합장 확인 2단 버튼 */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelSubmittedVisit}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-[#D6CEC2] hover:text-red-300 border border-white/10 font-bold text-xs transition cursor-pointer"
                    title="방금 입력한 방문 예약을 취소합니다"
                  >
                    예약 취소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmSubmittedVisit({ closeModal: true })}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1B1815] via-[#2A231C] to-[#1B1815] hover:brightness-110 text-[#F5D061] border border-[#C59B27] font-bold text-xs transition cursor-pointer shadow-md"
                  >
                    합장하며 예약 확인
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

        {/* 사경 회향 공덕장 (황금 인증서) 모달 */}
        {showMeritCertModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-fadeIn">
            <div className="w-full max-w-[390px] sm:max-w-[420px] max-h-[96dvh] overflow-y-auto bg-gradient-to-b from-[#251F19] via-[#1B1713] to-[#120F0D] text-white rounded-3xl p-3 sm:p-5 border-2 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.35)] relative my-auto">
              {/* 상단 장식 빛무리 */}
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#F5D061]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

              {/* 닫기 버튼 */}
              <button
                type="button"
                onClick={() => setShowMeritCertModal(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-[#E5DCD0] flex items-center justify-center transition active:scale-90 z-10"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 공덕장 내부 본문 카드 (전통 한지 & 황금 테두리) */}
              <div
                ref={meritCertRef}
                className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5EEDB] text-[#241F1A] border-2 border-[#C59B27] relative shadow-md"
                style={{
                  boxShadow: '0 4px 20px rgba(197, 155, 39, 0.15)',
                }}
              >
                {/* 내부 전통 괘선 (이중 금선 프레임) */}
                <div className="border border-[#D4AF37]/60 rounded-xl p-3 sm:p-4 bg-white/40">
                  {/* 상단 사찰 표기 */}
                  <div className="flex items-center justify-center gap-2">
                    <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#C59B27]" />
                    <span className="text-[10.5px] text-[#8C6D1F] font-serif-kr tracking-[0.2em] font-extrabold">
                      卍 제주 소원사 卍
                    </span>
                    <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#C59B27]" />
                  </div>

                  {/* 공덕장 대명칭 */}
                  <h3 className="font-serif-kr text-[21px] sm:text-[23px] font-black text-[#523505] text-center tracking-[0.14em] mt-1.5 drop-shadow-sm">
                    {meritCertType === 'lantern' ? '소원등 정진 공덕장' : '사경 회향 공덕장'}
                  </h3>

                  <div className="my-2.5 border-t border-[#C59B27]/40 border-dashed" />

                  {/* 수여 대상 정보 */}
                  <div className="space-y-1 text-xs sm:text-[13px] text-[#3A3228] font-serif-kr">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D1F] font-extrabold text-[12px]">정진 불자</span>
                      <span className="font-black text-[#1C1814] text-[13.5px]">
                        {currentUser?.name || lanternData?.believer_name || '소원사 정진 불자'}
                        {currentUser?.dharma_name ? ` (${currentUser.dharma_name})` : ''} 합장
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C6D1F] font-extrabold text-[12px]">
                        {meritCertType === 'lantern' ? '정진 공덕' : '회향 경전'}
                      </span>
                      <span className="font-extrabold text-[#6B4E08] text-[13px]">
                        {meritCertType === 'lantern'
                          ? `소원등 총 ${userLanternStats.totalCount}회 점등 (${userLanternStats.streak}일 연속)`
                          : (currentSutra?.title || '반야심경')}
                      </span>
                    </div>
                  </div>

                  {/* 중앙 본문 박스 (사경 구절 또는 소원등 발원문) */}
                  <div className="mt-3 p-3 rounded-xl bg-[#F8F3E8] border border-[#D5C59B] text-center shadow-[inset_0_1px_3px_rgba(197,155,39,0.06)]">
                    {meritCertType === 'lantern' ? (
                      <div>
                        <span className="inline-block text-[11px] font-extrabold text-[#8A6510] bg-[#FAF3DF] px-2.5 py-0.5 rounded-md border border-[#E5D399] mb-1">
                          발원 분야: {lanternData?.wish_category || '가족건강'}
                        </span>
                        <p className="font-serif-kr text-[14.5px] sm:text-[15.5px] font-black text-[#1F1912] leading-relaxed break-keep mt-0.5">
                          “{lanternData?.wish_text || '지극정성으로 온 가족의 무병장수와 만복·소원성취를 발원합니다.'}”
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-serif-kr text-[16px] sm:text-[17px] font-black text-[#1A1208] leading-relaxed tracking-normal whitespace-pre-line">
                          {(() => {
                            const raw = currentSutra?.text?.trim() || ''
                            if (raw === '색즉시공 공즉시색 수상행식 역부여시') return '“색즉시공 공즉시색\n수상행식 역부여시”'
                            if (raw === '옴 마니 반메 훔 옴 마니 반메 훔') return '“옴 마니 반메 훔\n옴 마니 반메 훔”'
                            if (raw === '수리수리 마하수리 수수리 사바하') return '“수리수리 마하수리\n수수리 사바하”'
                            if (raw === '범소유상 개시허망 약견제상비상 즉견여래') return '“범소유상 개시허망\n약견제상비상 즉견여래”'
                            if (raw.length > 15 && raw.includes(' ')) {
                              const words = raw.split(' ')
                              const mid = Math.ceil(words.length / 2)
                              return `“${words.slice(0, mid).join(' ')}\n${words.slice(mid).join(' ')}”`
                            }
                            return `“${raw}”`
                          })()}
                        </p>
                        {currentSutra?.meaning && (
                          <div className="text-[12px] sm:text-[12.5px] text-[#5C452D] font-serif-kr mt-2 pt-2 border-t border-[#D5C59B]/60 leading-relaxed break-keep font-medium">
                            {currentSutra.meaning}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 하단 일자 및 주지 직인 서명 (표창장 정통 2단 레이아웃: 1행 날짜 / 2행 주지 서명 & 합장 직인) */}
                  <div className="mt-3.5 pt-2 border-t border-[#C59B27]/40 text-center font-serif-kr space-y-1 w-full">
                    {/* 1행: 날짜 단독 한 줄 */}
                    <div className="text-[11.5px] sm:text-xs text-[#736352] font-medium tracking-wide">
                      {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>

                    {/* 2행: 제주 소원사 주지 합장 & 합장(🙏) 직인 배지 */}
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      <span className="font-black text-[#4F3906] text-[13px] sm:text-[14px] tracking-wide">
                        제주 소원사 주지 합장
                      </span>
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] bg-[#AB2317] text-white text-[11px] font-black border border-[#7D150C] shadow-sm select-none shrink-0" title="합장 직인">
                        🙏
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 💌 가족·도반에게 카카오톡 복 나누기 (80만 바이럴 루프 핵심 버튼) */}
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleShareMyLantern(currentUser?.name || lanternData?.believer_name, {
                      type: meritCertType,
                      category: lanternData?.wish_category,
                      wishText: lanternData?.wish_text,
                      streak: userLanternStats?.streak,
                      totalCount: userLanternStats?.totalCount,
                      sutraTitle: currentSutra?.title,
                      sutraText: currentSutra?.text,
                    })
                    showToast(meritCertType === 'sutra' ? '💌 가족·도반에게 사경 회향 지혜 카드가 공유되었습니다.' : '💌 가족·도반에게 소원등 복(福) 나눔 카드가 공유되었습니다.')
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FEE500] via-[#FDD835] to-[#FBC02D] hover:brightness-105 active:scale-95 text-[#3C1E1E] font-black text-[13.5px] sm:text-sm shadow-[0_4px_16px_rgba(253,216,53,0.4)] flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-[#3C1E1E] shrink-0" />
                  <span>가족·도반에게 복(福) 나누기 (카톡)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMeritCertModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-medium text-xs transition active:scale-95 border border-white/10"
                >
                  합장하며 닫기 (나무아미타불)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🪷 모바일/PC 공용 불사·위패 종목 선택 바텀시트 */}
        {showBulsaCategorySheet && renderBulsaCategorySheet()}

        {/* ==================== 📢 도량 공지사항 상세 모달 (한지 카드 스타일) ==================== */}
        {showNoticeModal && selectedNotice && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
            <div className="w-full max-w-[440px] max-h-[90vh] bg-[#FAF6EE] text-[#241E17] rounded-3xl shadow-2xl border-2 border-[#D4AF37] flex flex-col overflow-hidden relative">
              {/* 모달 상단 헤더 */}
              <div className="bg-gradient-to-r from-[#241E17] via-[#2E2419] to-[#241E17] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#C59B27]/40 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#F5D061] animate-ping shrink-0" />
                  <span className="font-serif-kr text-xs font-bold text-[#F5D061] tracking-wider whitespace-nowrap">
                    제주 소원사 도량 소식
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 본문 스크롤 영역 */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* 카테고리 배지 + 날짜 */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#EFE3C3] text-[#7A5B0B] border border-[#D5C59B] text-xs font-bold">
                    {selectedNotice.badge || selectedNotice.category}
                  </span>
                  <span className="text-xs text-[#8A7D6B] font-mono">
                    {selectedNotice.date}
                  </span>
                </div>

                {/* 공지 제목 */}
                <h2 className="font-serif-kr text-lg sm:text-xl font-extrabold text-[#1F1912] leading-snug break-keep">
                  {selectedNotice.title}
                </h2>

                {/* 요약 박스 (있을 시) */}
                {selectedNotice.summary && (
                  <div className="p-3.5 rounded-2xl bg-[#F0EAE1] border border-[#DDD3C1] text-xs text-[#574C3D] leading-relaxed break-keep font-medium">
                    💡 {selectedNotice.summary}
                  </div>
                )}

                {/* 본문 내용 (한지 느낌의 여백과 줄글) */}
                <div className="text-xs sm:text-sm text-[#383026] leading-relaxed space-y-2.5 whitespace-pre-line break-keep font-sans">
                  {selectedNotice.content}
                </div>
              </div>

              {/* 모달 하단 액션 버튼 바 */}
              <div className="p-4 bg-[#F2ECE1] border-t border-[#DDD3C1] shrink-0 space-y-2">
                {selectedNotice.targetTab && (
                  <button
                    type="button"
                    onClick={() => {
                      playSingingBowlSound()
                      setShowNoticeModal(false)
                      setActiveTab(selectedNotice.targetTab)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <span>{selectedNotice.ctaLabel || '관련 정진 바로가기 ▶'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#5C5042] border border-[#DDD3C1] font-bold text-xs transition active:scale-95"
                >
                  확인 및 닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 📋 도량 공지사항 전체 목록 모달 ==================== */}
        {showNoticeListModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
            <div className="w-full max-w-[440px] max-h-[85vh] bg-[#FAF6EE] text-[#241E17] rounded-3xl shadow-2xl border-2 border-[#D4AF37] flex flex-col overflow-hidden relative">
              {/* 상단 헤더 */}
              <div className="bg-gradient-to-r from-[#241E17] via-[#2E2419] to-[#241E17] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#C59B27]/40 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Megaphone className="w-4 h-4 text-[#F5D061] shrink-0" />
                  <span className="font-serif-kr text-sm font-bold text-[#F5D061]">
                    제주 소원사 도량 소식 목록
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNoticeListModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 공지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#E6DEC8]">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      playMoktakSound()
                      setSelectedNotice(n)
                      setShowNoticeListModal(false)
                      setShowNoticeModal(true)
                    }}
                    className="pt-2.5 first:pt-0 cursor-pointer group"
                  >
                    <div className="p-3 rounded-2xl bg-white hover:bg-[#FFF9EE] border border-[#DDD3C1] transition shadow-sm">
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF3DF] text-[#7A5B0B] border border-[#E5D399] text-[10.5px] font-bold">
                          {n.badge || n.category}
                        </span>
                        <span className="text-[10.5px] text-[#8A7D6B] font-mono">
                          {n.date}
                        </span>
                      </div>
                      <h3 className="font-serif-kr text-xs sm:text-sm font-bold text-[#231F1C] group-hover:text-[#9A7418] transition line-clamp-2">
                        {n.title}
                      </h3>
                      {n.summary && (
                        <p className="text-[11px] text-[#6E655C] mt-1 line-clamp-2 leading-relaxed">
                          {n.summary}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 닫기 */}
              <div className="p-3 bg-[#F2ECE1] border-t border-[#DDD3C1] shrink-0">
                <button
                  type="button"
                  onClick={() => setShowNoticeListModal(false)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#5C5042] border border-[#DDD3C1] font-bold text-xs transition"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

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
                    <div className="space-y-1.5">
                      <span className="text-[10.5px] text-[#F5D061] font-semibold flex items-center gap-1">
                        <span>📜</span>
                        <span>포교위원 모바일 파트너 센터</span>
                      </span>
                      <h3 className="font-serif-kr text-base sm:text-lg font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{activeAgent.name}</span>
                        <span className="text-[#F5D061]">
                          {activeAgent.role === 'temple_admin' ? '신도회장' : activeAgent.role === 'master' ? '총괄위원장' : '포교위원장'}
                        </span>
                        <span className="text-[#D6CEC2] text-xs font-normal">님의 도량</span>
                      </h3>
                      {isMasterOrTempleAdmin && (
                        <div className="flex justify-end items-center pt-0.5">
                          <select
                            value={selectedAgentCode}
                            onChange={(e) => setSelectedAgentCode(e.target.value)}
                            className="bg-[#2E2822] text-[#F5D061] border border-[#C59B27]/60 rounded-full px-3 py-1 text-xs font-bold focus:outline-none shadow-sm cursor-pointer"
                          >
                            {agents.map((ag) => (
                              <option key={ag.code} value={ag.code} className="bg-[#231F1C] text-[#F5D061]">
                                {ag.name} ({ag.role === 'temple_admin' ? '신도회장' : ag.role === 'master' ? '총괄위원장' : '포교위원장'})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <div className="text-[10px] text-[#BFB6AA]">산하 인연 신도</div>
                        <div className="text-base font-bold text-[#F5D061] mt-0.5">
                          {myAffiliatedMembers.filter((m) => m.role === 'believer').length}명
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <div className="text-[10px] text-[#BFB6AA]">위패 봉안</div>
                        <div className="text-base font-bold text-white mt-0.5">
                          {myAffiliatedMembers.reduce((sum, m) => sum + (Number(m.wipae_count) || 0), 0)}기
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2">
                        <div className="text-[10px] text-[#BFB6AA]">포교 요율</div>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">
                          {activeAgent.role === 'master' ? '50%' : '40%'}
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
                      <button
                        type="button"
                        onClick={() => {
                          setBusinessCardTarget(activeAgent)
                          setShowBusinessCardModal(true)
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition bg-gradient-to-r from-[#1B1815] to-[#2D241C] text-[#F5D061] border border-[#C59B27] shadow-sm hover:brightness-110 cursor-pointer h-10 whitespace-nowrap"
                        title="모바일 전자명함 보기"
                      >
                        <span>🪪 명함</span>
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

                  {/* 🖨️ 산하 인연 회원명부 A4 인쇄 배너 카드 */}
                  <section className="bg-gradient-to-r from-[#241E17] via-[#2F2417] to-[#1C160F] text-white rounded-2xl p-4 border-2 border-[#D4AF37] shadow-lg flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#1B1815] font-extrabold">
                        산하 관할
                      </span>
                      <h4 className="font-serif-kr text-base font-bold mt-1 text-[#F5D061] truncate">
                        {activeAgent.name} 산하 회원명부 ({myAffiliatedMembers.length}명)
                      </h4>
                      <p className="text-[11px] text-[#D6CEC2] mt-0.5">
                        일반신도 {myAffiliatedMembers.filter((m) => m.role === 'believer').length}명 · 위원장 {myAffiliatedMembers.filter((m) => m.role === 'agent' || m.role === 'master').length}명
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMemberPrintModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 active:scale-95 transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Printer className="w-4 h-4" />
                      <span>A4 인쇄</span>
                    </button>
                  </section>

                  {/* 📜 실시간 산하 회원 검색 및 관리 카드 */}
                  <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-[#EAE2D3]/60">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#8A6510]" />
                        <h4 className="font-serif-kr text-sm font-bold text-[#1B1815]">
                          {activeAgent.name} 산하 회원 명단
                        </h4>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#8A6510] font-bold border border-[#EAE2D3]">
                        총 {myAffiliatedMembers.length}명
                      </span>
                    </div>

                    {/* 실시간 검색창 */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#8C8071] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={adminMemberSearchQuery}
                        onChange={(e) => setAdminMemberSearchQuery(e.target.value)}
                        placeholder="성함, 법명, 연락처 검색"
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#FAF8F5] border border-[#D5C59B] text-xs placeholder:text-[#A89D8E] focus:outline-none focus:border-[#C59B27]"
                      />
                      {adminMemberSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setAdminMemberSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C8071] hover:text-[#1B1815] p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* 등급별 필터 칩 */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                      {[
                        { id: 'all', label: `전체 (${myAffiliatedMembers.length})` },
                        { id: 'believer', label: `일반신도 (${myAffiliatedMembers.filter((m) => m.role === 'believer').length})` },
                        { id: 'agent', label: `포교위원장 (${myAffiliatedMembers.filter((m) => m.role === 'agent' || m.role === 'master').length})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setAdminMemberRoleFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                            adminMemberRoleFilter === tab.id
                              ? 'bg-[#231F1C] text-[#F5D061] border border-[#C59B27]'
                              : 'bg-[#FAF8F5] text-[#6E6354] border border-[#EAE2D3] hover:bg-[#F2ECE1]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* 실시간 회원 리스트 (클릭 시 상세 모달, 원클릭 전화/문자) */}
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {filteredAffiliatedMembers.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#8C8071] border border-dashed border-[#DDD4C4] rounded-xl">
                          조건에 일치하는 산하 회원이 없습니다.
                        </div>
                      ) : (
                        filteredAffiliatedMembers.map((m) => (
                          <div
                            key={m.code}
                            onClick={() => setSelectedMemberDetail(m)}
                            className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] hover:border-[#C59B27] cursor-pointer transition flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <div className="font-bold text-[#231F1C] flex items-center gap-1.5 flex-wrap">
                                <span>{m.name}</span>
                                {m.dharma_name && (
                                   <span className="text-[#8A6510] text-[11px] font-normal">({m.dharma_name})</span>
                                )}
                                <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold ${
                                  m.role === 'agent' ? 'bg-amber-100 text-[#8A6510]' :
                                  m.role === 'temple_admin' ? 'bg-amber-700 text-white font-bold' :
                                  m.role === 'master' ? 'bg-purple-100 text-purple-800 font-black' :
                                  'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {m.role === 'agent' ? '포교위원장' : m.role === 'temple_admin' ? '신도회장' : m.role === 'master' ? '총괄위원장' : '일반신도'}
                                </span>
                                {prayers.some(
                                  (p) =>
                                    (p.member_code === m.code || (p.believer_phone && m.phone && p.believer_phone.replace(/[^0-9]/g, '') === m.phone.replace(/[^0-9]/g, ''))) &&
                                    new Date(p.created_at).toDateString() === new Date().toDateString()
                                ) && (
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded font-black bg-amber-500/15 text-amber-700 border border-amber-500/30 flex items-center gap-0.5">
                                    <span>🪔</span>
                                    <span>오늘 점등</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#8C8071] mt-0.5 flex items-center gap-2 truncate">
                                <span>📞 {m.phone || '연락처 미등록'}</span>
                                {m.address && <span className="truncate">· {m.address}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {m.phone && (
                                <>
                                  <a
                                    href={`tel:${m.phone}`}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                    title="전화걸기"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                  <a
                                    href={`sms:${m.phone}`}
                                    className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
                                    title="문자보내기"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                </>
                              )}
                              <ChevronRight className="w-4 h-4 text-[#A89D8E]" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
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
                        포교위원장 직추천 시 40%가 정산되며, 산하 포교위원이 신도를 인연 맺을 때마다 10%의 관리 지도비가 위원장님께 지속 정산됩니다.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#C5BBAE] block">직접 추천 포교비</span>
                          <span className="text-base font-black text-[#F5D061]">40%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] text-[#C5BBAE] block">산하 관리 오버라이딩</span>
                          <span className="text-base font-black text-emerald-400">10%</span>
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
                        <h3 className="font-serif-kr text-base font-extrabold text-[#1B1815] whitespace-nowrap">
                          🏛️ 3. 사찰본부 전산
                        </h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#8A6510] font-bold border border-amber-300 shrink-0">
                        본부 전용
                      </span>
                    </div>


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

                    {/* 📢 소원사 도량 공지사항 실시간 등록 & 관리 섹션 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4 text-[#8A6510]" />
                          <h4 className="font-serif-kr font-bold text-sm text-[#1B1815]">
                            소원사 도량 공지사항 실시간 관리 ({notices.length}건)
                          </h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-[#8A6510] font-bold">
                          홈 화면 실시간 연동
                        </span>
                      </div>

                      <p className="text-[11px] text-[#7A6E5E] leading-relaxed">
                        등록하신 공지사항은 즉시 모바일 법당 홈 화면 상단 롤링 배너에 반영되며, 모든 신도님들의 스마트폰에 실시간 전파됩니다.
                      </p>

                      {/* 새 공지사항 등록 폼 */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (!adminNoticeTitle.trim() || !adminNoticeContent.trim()) {
                            showToast('공지 제목과 상세 내용을 입력해 주세요.')
                            return
                          }
                          const newNotice = {
                            id: 'notice-' + Date.now(),
                            category: adminNoticeCategory,
                            badge: adminNoticeCategory === '법회' ? '특별법회' : adminNoticeCategory === '불사' ? '대작불사' : '도량안내',
                            title: adminNoticeTitle.trim(),
                            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, ''),
                            summary: adminNoticeContent.trim().slice(0, 70) + (adminNoticeContent.trim().length > 70 ? '...' : ''),
                            content: adminNoticeContent.trim(),
                            targetTab: adminNoticeTargetTab,
                            ctaLabel: adminNoticeCtaLabel || '자세히 보기 ▶',
                            isPinned: false,
                          }
                          setNotices((prev) => [newNotice, ...prev])
                          setAdminNoticeTitle('')
                          setAdminNoticeContent('')
                          playSingingBowlSound()
                          showToast('📢 도량 새 공지사항이 성공적으로 등록되어 홈 화면에 반영되었습니다.')
                        }}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2.5 text-xs"
                      >
                        <div className="font-bold text-[#8A6510] flex items-center gap-1 text-xs">
                          <span>✏️</span>
                          <span>새 공지사항 작성하기</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10.5px] font-semibold text-[#6E6354] mb-1">
                              공지 분류
                            </label>
                            <select
                              value={adminNoticeCategory}
                              onChange={(e) => {
                                const cat = e.target.value
                                setAdminNoticeCategory(cat)
                                if (cat === '법회') {
                                  setAdminNoticeTargetTab('lantern')
                                  setAdminNoticeCtaLabel('소원등 켜고 축원 올리기 ▶')
                                } else if (cat === '불사') {
                                  setAdminNoticeTargetTab('bulsa')
                                  setAdminNoticeCtaLabel('소원 기와 · 위패 불사 보기 ▶')
                                } else {
                                  setAdminNoticeTargetTab('bulsa')
                                  setAdminNoticeCtaLabel('도량 참배 · 차담 예약하기 ▶')
                                }
                              }}
                              className="w-full p-2 rounded-xl bg-white border border-[#DDD4C4] text-xs font-semibold"
                            >
                              <option value="법회">법회 (초하루/특별법회/기도)</option>
                              <option value="불사">불사 (기와/단청/위패/인등)</option>
                              <option value="안내">안내 (도량참배/차담/종무소)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10.5px] font-semibold text-[#6E6354] mb-1">
                              연결 탭 (클릭 시 이동)
                            </label>
                            <select
                              value={adminNoticeTargetTab}
                              onChange={(e) => setAdminNoticeTargetTab(e.target.value)}
                              className="w-full p-2 rounded-xl bg-white border border-[#DDD4C4] text-xs font-semibold"
                            >
                              <option value="lantern">소원등 켜기 (대웅전 축원)</option>
                              <option value="bulsa">불사 안내 (위패/삼성각/차담)</option>
                              <option value="sutra">한줄 사경 (경전 정진)</option>
                              <option value="home">신행홈 (메인)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-[#6E6354] mb-1">
                            공지 제목
                          </label>
                          <input
                            type="text"
                            value={adminNoticeTitle}
                            onChange={(e) => setAdminNoticeTitle(e.target.value)}
                            placeholder="예: 11월 보름 대웅전 특별 축원 안내"
                            required
                            className="w-full p-2 rounded-xl bg-white border border-[#DDD4C4] text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-[#6E6354] mb-1">
                            상세 내용 (줄바꿈 가능)
                          </label>
                          <textarea
                            rows={3}
                            value={adminNoticeContent}
                            onChange={(e) => setAdminNoticeContent(e.target.value)}
                            placeholder="불자님들께 전할 도량 공지 내용을 상세히 적어주세요."
                            required
                            className="w-full p-2 rounded-xl bg-white border border-[#DDD4C4] text-xs leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-[10.5px] font-semibold text-[#6E6354] mb-1">
                            하단 바로가기 버튼 문구
                          </label>
                          <input
                            type="text"
                            value={adminNoticeCtaLabel}
                            onChange={(e) => setAdminNoticeCtaLabel(e.target.value)}
                            placeholder="예: 소원등 켜고 축원 올리기 ▶"
                            className="w-full p-2 rounded-xl bg-white border border-[#DDD4C4] text-xs font-medium"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 active:scale-95 transition"
                        >
                          📢 소원사 공지사항 즉시 등록하기
                        </button>
                      </form>

                      {/* 등록된 공지사항 목록 및 삭제 제어 */}
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-bold text-[#231F1C]">
                          등록된 공지 목록 (상단 순서대로 롤링 노출)
                        </div>
                        <div className="divide-y divide-[#EAE2D3] max-h-60 overflow-y-auto pr-1">
                          {notices.map((n, idx) => (
                            <div key={n.id || idx} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-[#8A6510] text-[10px] font-bold">
                                    {n.category}
                                  </span>
                                  <span className="text-[10px] text-[#8C8071] font-mono">
                                    {n.date}
                                  </span>
                                </div>
                                <div className="font-bold text-[#1B1815] truncate">
                                  {n.title}
                                </div>
                                <p className="text-[11px] text-[#6E6354] truncate mt-0.5">
                                  {n.summary || n.content}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`'${n.title}' 공지를 삭제하시겠습니까?`)) {
                                    setNotices((prev) => prev.filter((item) => item.id !== n.id))
                                    showToast('공지사항이 삭제되었습니다.')
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[10.5px] font-bold shrink-0 transition"
                              >
                                삭제
                              </button>
                            </div>
                          ))}
                        </div>
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
                        <h3 className="font-serif-kr text-base font-extrabold text-[#1B1815] whitespace-nowrap">
                          👑 4. 총괄대표 전산
                        </h3>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1B1815] text-[#F5D061] font-black border border-[#F5D061] shrink-0">
                        총괄 전용
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
                        전국 50% 총판 사업권 및 총괄 10% 극비 마진, 전국 위원회 전체 통제 화면입니다. 사찰 본부 및 타 임직원에게 비공개됩니다.
                      </p>
                    </section>

                    {/* 실입금액 기준 100% 완전 분배 체계 요율표 */}
                    <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#E6DEC8] space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif-kr font-bold text-sm">
                          전국 100% 수익 배분 체계 (실입금액 백분율 요율제)
                        </h3>
                        <span className="text-[10px] text-[#8C8071]">정산 자동화</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-[#1F1B17] to-[#2B231A] text-white border border-[#C59B27]/40 space-y-1">
                          <span className="text-[10.5px] text-[#F5D061] font-bold">1. 사찰 본부 & 대웅전 불사금 (50%)</span>
                          <p className="text-[10.5px] text-[#C5BBAE]">
                            입금액의 50%는 사찰 대웅전 불사금 및 사찰 기본 기금으로 사찰 통장에 원천 적립됩니다.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                          <span className="text-[10.5px] text-[#8A6510] font-bold">2. 김철수 총괄대표 판권 (50%)</span>
                          <p className="text-[10.5px] text-[#6E6354]">
                            포교위원 추천 시 총괄 10% 극비 마진이 귀속되며, 전국 50% 총판 관리비로 정산됩니다.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5D399] space-y-1">
                          <span className="text-[10.5px] text-[#8A6510] font-bold">3. 포교위원장 직추천 (40%)</span>
                          <p className="text-[10.5px] text-[#6E6354]">
                            포교위원장이 직접 신도를 인연 맺을 시 40%가 포교비로 정산됩니다.
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E5D399] space-y-1">
                          <span className="text-[10.5px] text-[#8A6510] font-bold">4. 포교위원 직추천 (30%)</span>
                          <p className="text-[10.5px] text-[#6E6354]">
                            포교위원 30% + 직속 포교위원장 10% 오버라이딩 마진이 배분됩니다.
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
                          <div className="p-2 rounded-lg border border-[#D5C59B] bg-[#F5EEDB] text-xs font-bold text-[#1B1815] flex items-center justify-between">
                            <span className="truncate">{getRecommenderName(simAgentCode)}</span>
                            <span className="text-[9.5px] text-emerald-800 shrink-0 font-bold">🔒 조직도 자동확정</span>
                          </div>
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

        {/* ==================== 소원사 모바일법당 공식 A4 인쇄 모달 (회원명부 & 사시예불 축원) ==================== */}
        <MemberDirectoryPrintModal
          isOpen={showMemberPrintModal}
          onClose={() => setShowMemberPrintModal(false)}
          members={members}
          filteredPrintMembers={filteredPrintMembers}
          memberPrintRoleFilter={memberPrintRoleFilter}
          setMemberPrintRoleFilter={setMemberPrintRoleFilter}
          memberPrintSearchQuery={memberPrintSearchQuery}
          setMemberPrintSearchQuery={setMemberPrintSearchQuery}
        />
        <SasiPrayerPrintModal
          isOpen={showSasiPrintModal}
          onClose={() => setShowSasiPrintModal(false)}
          activeSasiPrayers={activeSasiPrayers}
          filteredSasiPrayers={filteredSasiPrayers}
          sasiPrayedCheckedIds={sasiPrayedCheckedIds}
          toggleSasiPrayedCheck={toggleSasiPrayedCheck}
          sasiPrayerTypeTab={sasiPrayerTypeTab}
          setSasiPrayerTypeTab={setSasiPrayerTypeTab}
          members={members}
        />

                {/* ==================== 10만 신도 고속 검색: 회원 상세 정보 & 가족 사주 관리 모달 ==================== */}
        <MemberDetailModal
          isOpen={!!selectedMemberDetail}
          member={selectedMemberDetail}
          onClose={() => setSelectedMemberDetail(null)}
          isEditingMember={isEditingMember}
          setIsEditingMember={setIsEditingMember}
          memberEditForm={memberEditForm}
          setMemberEditForm={setMemberEditForm}
          onSaveMemberEdit={handleSaveMemberEdit}
          prayers={prayers}
          settlements={settlements}
          members={members}
          getMemberPrayerAndPaymentInfo={getMemberPrayerAndPaymentInfo}
          onOpenIndividualRecordPrint={(m) => {
            setIndividualRecordTargetMember(m)
            setShowIndividualRecordPrintModal(true)
          }}
          onOpenIndeungPrint={(m) => {
            setIndeungTargetMember(m)
            setShowIndeungNameplateModal(true)
          }}
          onOpenSettlement={(m) => {
            setSettlementTargetMember(m)
            setShowSettlementModal(true)
          }}
        />
        <SettlementModal
          isOpen={showSettlementModal && !!settlementTargetMember}
          member={settlementTargetMember}
          onClose={() => {
            setShowSettlementModal(false)
            setSettlementTargetMember(null)
          }}
          members={members}
          settlementItemType={settlementItemType}
          setSettlementItemType={setSettlementItemType}
          settlementStandardAmount={settlementStandardAmount}
          setSettlementStandardAmount={setSettlementStandardAmount}
          settlementPaidAmount={settlementPaidAmount}
          setSettlementPaidAmount={setSettlementPaidAmount}
          settlementPaymentStatus={settlementPaymentStatus}
          setSettlementPaymentStatus={setSettlementPaymentStatus}
          settlementMemo={settlementMemo}
          setSettlementMemo={setSettlementMemo}
          onSubmit={handleRegisterSettlementForMember}
          onOpenCategorySheet={() => setShowBulsaCategorySheet(true)}
        />
        <SettlementEditModal
          isOpen={!!editingSettlement}
          settlement={editingSettlement}
          setEditingSettlement={setEditingSettlement}
          onClose={() => setEditingSettlement(null)}
          onSave={handleSaveEditedSettlement}
          onRefund={handleRefundSettlement}
          onDelete={handleDeleteSettlement}
        />
        <SettlementConfirmModal
          isOpen={!!pendingSettlementConfirm}
          data={pendingSettlementConfirm}
          onClose={() => setPendingSettlementConfirm(null)}
          onConfirm={(data) => executeFinalSettlementRegistration(data)}
          settlementItemType={settlementItemType}
          settlementPaymentStatus={settlementPaymentStatus}
        />
        <BusinessCardModal
          isOpen={showBusinessCardModal}
          isModal={true}
          member={businessCardTarget || currentUser || members.find((m) => m.code === '33065540')}
          onClose={() => setShowBusinessCardModal(false)}
          onNavigateTab={(tab) => setActiveTab(tab)}
          showToast={showToast}
        />
        <IndividualRecordPrintModal
          isOpen={showIndividualRecordPrintModal}
          onClose={() => setShowIndividualRecordPrintModal(false)}
          member={individualRecordTargetMember}
          prayers={prayers}
          settlements={settlements}
        />
        <IndeungNameplatePrintModal
          isOpen={showIndeungNameplateModal}
          onClose={() => setShowIndeungNameplateModal(false)}
          member={indeungTargetMember}
        />

        {/* 통합 공식 푸터 ([신행홈] 탭에서만 노출 · 장식 없는 미니멀 타이포그래피) */}
        {activeTab === 'home' && (
          <footer className="px-4 py-5 text-center text-[11px] text-[#786E63] border-t border-[#EAE2D3] space-y-2">
            <div className="space-y-0.5 leading-relaxed">
              <div className="font-serif-kr font-bold text-[#231F1C] text-xs">
                대한불교 조계종 · 제주 소원사
              </div>
              <p className="text-[11px] text-[#6E655C]">
                제주특별자치도 제주시 죽성서길 75 (오등동 935)
              </p>
              <p className="text-[11px] text-[#5C5349]">
                종무소 <a href="tel:064-805-2007" className="hover:text-[#8A6510]">064-805-2007</a> · <a href="tel:010-4912-1083" className="hover:text-[#8A6510]">010-4912-1083</a>
              </p>
            </div>
            <div className="space-y-0.5 pt-1">
              <p className="text-[10.5px] font-semibold text-[#5C5349]">
                전산 개발 및 총괄: 제주AI파트너
              </p>
              <p className="tracking-wider text-[#9A8F82] text-[10px]">
                Platform © Jeju AI Partner. All rights reserved.
              </p>
            </div>
          </footer>
        )}

        {/* 🪵 [제주 소원사 108 목탁 멍 & 손안의 염주 정진 모달] (산사 sansa.kr 벤치마킹 킬러 기능) */}
        {show108MoktakModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-gradient-to-b from-[#211A13] via-[#17120C] to-[#0E0B08] text-white rounded-3xl p-5 border border-[#C59B27]/50 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden relative">
              {/* 상단 헤더 */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-[#2A1D13] border border-[#C59B27]/40 flex items-center justify-center shadow-md p-1.5 shrink-0">
                    <img src="/images/moktak_realistic.png" alt="목탁" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif-kr font-bold text-base sm:text-lg text-[#F5D061] leading-tight truncate">
                      제주 소원사 108 목탁멍
                    </h3>
                    <p className="text-[11px] text-[#A89D8E] font-medium tracking-tight mt-0.5 truncate">
                      말없이 고요하게 손끝으로 비우는 번뇌
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleReset108Moktak}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#D6CEC2] hover:text-[#F5D061] transition"
                    title="처음부터 다시 정진 (초기화)"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoMoktakOn(false)
                      setShow108MoktakModal(false)
                    }}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-[#D6CEC2] hover:text-white transition"
                    title="닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!is108Completed ? (
                <>
                  {/* 진행 상황 및 108 염주 게이지 */}
                  <div className="bg-[#1C150F]/80 rounded-2xl p-3.5 border border-[#C59B27]/25 space-y-2 shadow-inner">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFE58A]">
                      <span>📿</span>
                      <span>백팔번뇌(百八煩惱) 소멸 정진</span>
                    </div>

                    {/* 진행바 + 우측 1줄 타수 카운트 */}
                    <div className="flex items-center gap-2.5">
                      {/* 프로그레스 바 */}
                      <div className="flex-1 h-2.5 rounded-full bg-black/40 overflow-hidden relative border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-[#C59B27] via-[#F5D061] to-[#FFE58A] transition-all duration-150 rounded-full shadow-[0_0_8px_rgba(245,208,97,0.5)]"
                          style={{ width: `${Math.min(100, (moktak108Count / 108) * 100)}%` }}
                        />
                      </div>

                      {/* 우측 1줄 타수 표시 (줄바꿈 방지) */}
                      <div className="shrink-0 font-mono text-xs sm:text-sm font-bold text-[#F5D061] whitespace-nowrap">
                        <span>{moktak108Count}</span>
                        <span className="text-white/40 text-[11px] ml-1">/ 108타</span>
                      </div>
                    </div>
                  </div>

                  {/* 중앙 인터랙티브 목탁 무대 (심야 대웅전 촛불 감성) */}
                  <div className="py-5 sm:py-6 flex flex-col items-center justify-center relative select-none">
                    {/* 은은한 촛불 앰비언스 후광 */}
                    <div className="absolute w-60 h-60 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

                    {/* 타격 시 퍼지는 연꽃 파동 리플 */}
                    {moktakRipples.map((r) => (
                      <div
                        key={r.id}
                        className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-[#F5D061]/40 animate-ping pointer-events-none"
                      />
                    ))}

                    {/* 떠오르는 축원 단어 (목탁 위에서 피어나는 향기처럼 부드럽게 상승) */}
                    {moktakFloatingTexts.map((f) => (
                      <div
                        key={f.id}
                        className="absolute -top-1 sm:top-0 z-20 text-xs sm:text-sm font-extrabold text-[#FFE58A] drop-shadow-md pointer-events-none whitespace-nowrap bg-[#23170E]/95 px-3.5 py-1 rounded-full border border-[#C59B27]/60 shadow-[0_4px_16px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-200"
                      >
                        {f.text}
                      </div>
                    ))}

                    {/* 대형 인터랙티브 목탁 버튼 (대웅전 촛불 조명 밸런스) */}
                    <button
                      type="button"
                      onClick={handle108MoktakTap}
                      className={`relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-b from-[#2E1E12] via-[#1A110A] to-[#0D0805] border-2 border-[#C59B27]/70 shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_2px_12px_rgba(245,208,97,0.15)] flex flex-col items-center justify-center cursor-pointer transition-all duration-75 select-none active:scale-95 group overflow-hidden ${
                        isMoktakAnimating ? 'scale-90 rotate-[-4deg]' : 'hover:scale-[1.01]'
                      }`}
                    >
                      {/* 은은한 촛불 온기 림라이트 */}
                      <div className="absolute inset-4 rounded-full bg-gradient-to-t from-transparent via-amber-700/10 to-amber-500/15 blur-md pointer-events-none" />

                      <img
                        src="/images/moktak_realistic.png"
                        alt="목탁"
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] filter brightness-100 contrast-[1.05] group-hover:scale-105 transition-transform pointer-events-none relative z-10"
                      />
                      <div className="mt-1 px-3 py-0.5 rounded-full bg-[#3D2614]/85 border border-[#C59B27]/50 shadow-sm relative z-10">
                        <span className="text-[11px] sm:text-xs font-bold text-[#FCE6A6] tracking-wider font-serif-kr drop-shadow-sm">
                          터치하여 탁!
                        </span>
                      </div>
                    </button>
                    <p className="text-[11.5px] text-[#A89D8E] mt-3 font-medium text-center break-keep">
                      화면을 터치할 때마다 실물 대웅전 목탁 소리와 손맛 진동이 울립니다
                    </p>
                  </div>

                  {/* 하단 자동 모드 & 안내 바 */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsAutoMoktakOn((prev) => !prev)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border shadow-sm whitespace-nowrap ${
                        isAutoMoktakOn
                          ? 'bg-amber-500 text-[#1B1815] border-amber-400 font-extrabold animate-pulse'
                          : 'bg-[#2A1D13] text-[#F5D061] border-[#C59B27]/40 hover:bg-[#382618]'
                      }`}
                      title="2.4초 간격으로 목탁을 자동 타종합니다"
                    >
                      {isAutoMoktakOn ? (
                        <>
                          <Pause className="w-3.5 h-3.5 shrink-0" />
                          <span>자동 멍 정지</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 shrink-0 fill-current" />
                          <span>자동 멍때리기</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (moktak108Count >= 108) {
                          setIs108Completed(true)
                        } else {
                          showToast(`🔔 108타 완주 시 대웅전 정진 회향장이 열립니다 (현재 ${moktak108Count}/108타)`)
                        }
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 transition active:scale-95 whitespace-nowrap ${
                        moktak108Count >= 108
                          ? 'bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-black border-amber-300 font-bold shadow-md animate-bounce'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#C59B27]'
                      }`}
                      title="108타 완주 시 회향 축원장 확인"
                    >
                      <span>🔔</span>
                      <span>108타 회향 축원</span>
                    </button>
                  </div>
                </>
              ) : (
                /* 108 완주 회향 축원 카드 */
                <div className="py-4 space-y-4 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E25C2B] to-[#F5D061] text-[#1B1815] flex items-center justify-center text-3xl mx-auto shadow-[0_0_25px_rgba(245,208,97,0.5)]">
                    🪷
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#F5D061] tracking-widest uppercase">
                      Merit Completion
                    </span>
                    <h3 className="font-serif-kr text-xl font-bold text-white">
                      제주 소원사 108 목탁 정진 회향
                    </h3>
                    <p className="text-xs text-[#D6CEC2] max-w-xs mx-auto break-keep pt-1">
                      신도님께서 정성으로 올리신 108번의 청정 목탁 타종으로 백팔번뇌가 맑게 씻겨나갔습니다.
                    </p>
                  </div>

                  {/* 회향 공덕 증표 박스 */}
                  <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-2xl p-4 border border-[#C59B27]/40 text-left space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[#FFE58A] font-bold pb-2 border-b border-white/10">
                      <span>📜 대웅전 회향 공덕원부</span>
                      <span>{new Date().toISOString().slice(0, 10).replace(/-/g, '.')}</span>
                    </div>
                    <div className="space-y-1 text-[#E0D5C3] text-[11.5px]">
                      <div>• 발원자: <strong className="text-white">{currentUser?.name || '소원사 인연 불자님'}</strong></div>
                      <div>• 정진 내용: 108 목탁 타종 및 백팔번뇌 소멸</div>
                      <div>• 공덕 배정: <span className="text-[#4ADE80] font-bold">내일 오전 10시 사시예불 축원 명부 합장</span></div>
                    </div>
                  </div>

                  {/* 신행 복덕 보시금 적립 축하 배너 */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-amber-500/20 border border-[#F5D061]/50 rounded-2xl p-3.5 text-center space-y-1 shadow-sm">
                    <div className="text-[11px] text-[#E0D5C3] font-medium">108 목탁 정진 회향 특별 복덕</div>
                    <div className="text-sm sm:text-base font-extrabold text-[#FFE58A] flex items-center justify-center gap-1.5">
                      <span>💰 신행 복덕</span>
                      <span className="font-mono text-emerald-300 font-black text-base sm:text-lg">+500 공덕</span>
                      <span>실시간 적립 완료</span>
                    </div>
                    <p className="text-[10.5px] text-[#A89D8E]">
                      [내정보 ➔ 나의 신행 복덕 공덕금]에서 언제든 확인 및 사용하실 수 있습니다.
                    </p>
                  </div>

                  {/* 버튼 모음 */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleShare108Merit}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs shadow-md hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4 shrink-0" />
                      <span>카카오톡 / 지인에게 회향 공덕 나누기</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShow108MoktakModal(false)
                        setActiveTab('lantern')
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-1.5"
                    >
                      <Flame className="w-4 h-4 text-[#F5D061] shrink-0" />
                      <span>소원등 켜고 사시예불 축원 올리기</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleReset108Moktak}
                      className="w-full py-2 text-xs text-[#A89D8E] hover:text-[#F5D061] transition"
                    >
                      처음부터 다시 정진하기
                    </button>
                  </div>
                </div>
              )}
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
                  ) : healingAudioTrack === 'sowonsa_prajna_meditation' ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F5D061]/20 text-[#FFE58A] border border-[#F5D061]/40 flex items-center gap-1.5 shadow-sm">
                      <span>🧘</span>
                      <span>제주 소원사 반야심경 대웅전 힐링 명상</span>
                    </span>
                  ) : healingAudioTrack === 'lotus_destiny' ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F5D061]/20 text-[#FFE58A] border border-[#F5D061]/40 flex items-center gap-1.5 shadow-sm">
                      <span>🌸</span>
                      <span>제주 소원사 힐링 찬불가 (연꽃 인연)</span>
                    </span>
                  ) : healingAudioTrack === 'jeju_sowonsa' ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#F5D061]/20 text-[#FFE58A] border border-[#F5D061]/40 flex items-center gap-1.5 shadow-sm">
                      <span>🍊</span>
                      <span>제주 소원사 공식 도량 테마송</span>
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

        {/* ==================== 💳 토스페이먼츠 통합 결제창 모달 (간편결제 + 일반카드 + 할부 + 계좌이체 + 가상계좌) ==================== */}
        {showTossCheckoutModal && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-[440px] bg-white text-[#191F28] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col font-sans">
              {/* 상단 토스페이먼츠 헤더 */}
              <div className="px-5 py-4 bg-[#F9FAFB] border-b border-[#E5E8EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#3182F6] text-white text-[11px] font-extrabold">toss payments</span>
                  <span className="text-xs font-bold text-[#4E5968]">안전결제 (테스트 체험)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTossCheckoutModal(false)}
                  className="p-1 text-[#8B95A1] hover:text-[#191F28] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 주문 요약 */}
              <div className="px-5 py-3.5 bg-[#F2F4F6] flex items-center justify-between border-b border-[#E5E8EB]">
                <div className="min-w-0">
                  <div className="text-[11px] text-[#6B7684] font-semibold">대한불교 본원종 제주 소원사</div>
                  <div className="text-sm font-extrabold text-[#191F28] truncate">
                    {wishCategory || '대웅전 1년 인등(가족등)'} ({wishName || '홍길동 불자'})
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="text-base font-black text-[#3182F6] font-mono">
                    {Number(customPayAmount || 100000).toLocaleString()}원
                  </div>
                </div>
              </div>

              {/* 결제 수단 탭 전환 */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-3 gap-1.5 bg-[#F2F4F6] p-1 rounded-xl text-xs font-bold">
                  {['카드', '계좌이체', '가상계좌'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTossPayMethod(m)}
                      className={`py-2 rounded-lg transition cursor-pointer ${
                        tossPayMethod === m ? 'bg-white text-[#191F28] shadow-sm font-extrabold' : 'text-[#6B7684]'
                      }`}
                    >
                      {m === '카드' ? '카드 · 간편결제' : m === '계좌이체' ? '실시간 계좌이체' : '가상계좌(무통장)'}
                    </button>
                  ))}
                </div>

                {tossPayMethod === '카드' ? (
                  <>
                    {/* 1) 간편결제 선택 */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-extrabold text-[#333D4B]">⚡ 원터치 간편결제</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: '카카오페이', badge: 'KAKAO', bg: 'bg-[#FEE500] text-[#191919]' },
                          { id: '토스페이', badge: 'toss pay', bg: 'bg-[#0064FF] text-white' },
                          { id: '네이버페이', badge: 'N Pay', bg: 'bg-[#03C75A] text-white' },
                          { id: '삼성페이', badge: 'SAMSUNG Pay', bg: 'bg-[#1428A0] text-white' },
                        ].map((ep) => (
                          <button
                            key={ep.id}
                            type="button"
                            onClick={() => setTossSelectedEasyPay(ep.id)}
                            className={`p-2.5 rounded-xl border-2 flex items-center justify-between font-bold transition cursor-pointer ${
                              tossSelectedEasyPay === ep.id
                                ? 'border-[#3182F6] bg-[#E8F3FF]/50'
                                : 'border-[#E5E8EB] bg-white hover:bg-gray-50'
                            }`}
                          >
                            <span>{ep.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${ep.bg}`}>{ep.badge}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2) 일반 신용·체크카드 선택 */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-extrabold text-[#333D4B]">💳 일반 신용 · 체크카드</div>
                      <div className="grid grid-cols-4 gap-1.5 text-xs">
                        {['NH농협카드', 'KB국민카드', '신한카드', '삼성카드', '현대카드', '롯데카드', '하나카드', '우리·BC카드'].map((card) => (
                          <button
                            key={card}
                            type="button"
                            onClick={() => setTossSelectedEasyPay(card)}
                            className={`py-2.5 px-1 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                              tossSelectedEasyPay === card
                                ? 'border-2 border-[#3182F6] bg-[#E8F3FF] text-[#1B64DA] font-extrabold'
                                : 'border-[#E5E8EB] bg-white text-[#4E5968] hover:bg-gray-50'
                            }`}
                          >
                            {card.replace('카드', '')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3) 할부 개월 선택 (5만원 이상일 때 활성화) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#333D4B]">할부 기간 선택</span>
                        <span className="text-[11px] text-[#3182F6] font-bold">5만원 이상 무이자 할부 지원</span>
                      </div>
                      <select
                        value={tossInstallment}
                        onChange={(e) => setTossInstallment(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#D1D6DB] text-xs font-bold text-[#191F28] focus:outline-none focus:border-[#3182F6]"
                      >
                        <option value="일시불">일시불</option>
                        <option value="2개월 (무이자)">2개월 (무이자)</option>
                        <option value="3개월 (무이자)">3개월 (무이자)</option>
                        <option value="6개월 (무이자)">6개월 (무이자)</option>
                        <option value="12개월 할부">12개월 할부</option>
                      </select>
                    </div>
                  </>
                ) : (
                  /* 실시간 계좌이체 / 가상계좌 은행 선택 */
                  <div className="space-y-2">
                    <div className="text-xs font-extrabold text-[#333D4B]">
                      {tossPayMethod === '계좌이체' ? '출금하실 은행을 선택해 주세요' : '입금받으실 가상계좌 은행을 선택해 주세요'}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {['NH농협은행', 'KB국민은행', '신한은행', '우리은행', '하나은행', 'IBK기업은행', '제주은행', '우체국', '새마을금고'].map((bk) => (
                        <button
                          key={bk}
                          type="button"
                          onClick={() => setTossBank(bk)}
                          className={`py-2.5 px-2 rounded-xl border font-bold transition cursor-pointer ${
                            tossBank === bk
                              ? 'border-2 border-[#3182F6] bg-[#E8F3FF] text-[#1B64DA] font-extrabold'
                              : 'border-[#E5E8EB] bg-white text-[#4E5968]'
                          }`}
                        >
                          {bk}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 약관 동의 */}
                <label className="flex items-center gap-2 pt-2 border-t border-[#E5E8EB] text-xs text-[#4E5968] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tossAgreed}
                    onChange={(e) => setTossAgreed(e.target.checked)}
                    className="w-4 h-4 accent-[#3182F6]"
                  />
                  <span className="font-semibold">[필수] 전자금융거래 이용약관 및 결제 진행 동의</span>
                </label>
              </div>

              {/* 하단 결제 실행 버튼 */}
              <div className="p-4 bg-white border-t border-[#E5E8EB]">
                <button
                  type="button"
                  disabled={!tossAgreed}
                  onClick={handleConfirmTossSimulatedPayment}
                  className="w-full py-3.5 rounded-2xl bg-[#3182F6] hover:bg-[#1B64DA] disabled:bg-gray-300 text-white font-extrabold text-sm shadow-lg transition cursor-pointer"
                >
                  {Number(customPayAmount || 100000).toLocaleString()}원 {tossPayMethod === '카드' ? `${tossSelectedEasyPay} (${tossInstallment})` : `${tossBank} ${tossPayMethod}`} 결제하기
                </button>
              </div>
            </div>
          </div>
        )}

        
        {/* 🍃 [산사 힐링 감성] 제주 소원사 고요 법당 (멍스테이) 독립 모달 */}
        <SowonsaSanctuaryModal
          isOpen={showSanctuaryModal}
          onClose={() => setShowSanctuaryModal(false)}
          currentUser={currentUser}
          onAddMerit={addMerit}
          handleShareSanctuary={handleShareSanctuary}
          showToast={showToast}
          onOpenLantern={() => {
            setActiveTab('lantern')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />

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

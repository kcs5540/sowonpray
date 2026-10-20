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
} from 'lucide-react'
import {
  INITIAL_MEMBERS,
  INITIAL_PRAYERS,
  INITIAL_SETTLEMENTS,
  INITIAL_VISITS,
  extractPhone8Code,
  formatPhone11,
} from './lib/supabase'

// 오늘의 부처님 말씀 데이터
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
]

// 사경 구절 목록
const SUTRA_LIST = [
  {
    id: 'sutra-1',
    title: '반야심경 핵심구절',
    hanja: '色卽是空 空卽是色',
    text: '색즉시공 공즉시색 수상행식 역부여시',
    meaning: '형상 있는 것이 곧 비어있음이요, 비어있음이 곧 형상 있는 것이니라.',
  },
  {
    id: 'sutra-2',
    title: '법구경 축원게송',
    hanja: '諸惡莫作 衆善奉行',
    text: '모든 악을 짓지 말고 온갖 선을 받들어 행하라',
    meaning: '스스로 그 마음을 맑게 하는 것, 이것이 모든 부처님의 가르침이니라.',
  },
  {
    id: 'sutra-3',
    title: '관세음보살 본심미묘 육자대명왕진언',
    hanja: '唵 嘛 呢 叭 咪 吽',
    text: '옴 마니 반메 훔 옴 마니 반메 훔',
    meaning: '관세음보살님의 한없는 자비와 지혜로 모든 액난이 소멸하고 소원이 성취되기를 발원합니다.',
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

export default function App() {
  // 탭 상태: 'home' | 'lantern' | 'sutra' | 'agent' | 'admin' | 'profile'
  const [activeTab, setActiveTab] = useState('home')

  // 전체 통합 회원 DB 상태 (신도 + 포교사 + 본부 + 관리자)
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('sowonpray_members_v4')
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

  // 포교사/관리자 목록만 필터링
  const agents = useMemo(() => {
    return members.filter(
      (m) => m.role === 'agent' || m.role === 'temple_admin' || m.role === 'master'
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

  // 상태 변경 시 로컬스토리지 자동 동기화
  useEffect(() => {
    localStorage.setItem('sowonpray_members_v4', JSON.stringify(members))
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

  // 오늘의 법문 선택
  const [quoteIdx, setQuoteIdx] = useState(0)
  const currentQuote = DAILY_QUOTES[quoteIdx]

  // 소원등 탭 상태 (로그인 계정 정보로 자동 프리필)
  const [isLanternLit, setIsLanternLit] = useState(true)
  const [wishName, setWishName] = useState('')
  const [wishPhone, setWishPhone] = useState('')
  const [wishCategory, setWishCategory] = useState('가족건강')
  const [wishText, setWishText] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // 탭 이동 시 해당 탭에 맞는 기본 종목 자동 세팅
  useEffect(() => {
    const bulsaCats = [
      '생전예수재(황금위패)',
      '조상영구위패(흑색)',
      '대웅전 1년 인등(가족등)',
      '49재/천도재/기일제사',
      '대웅전 공양미/불전시주',
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
    if (activeTab === 'bulsa' && !bulsaCats.includes(wishCategory)) {
      setWishCategory('생전예수재(황금위패)')
    } else if (activeTab === 'lantern' && !lanternCats.includes(wishCategory)) {
      setWishCategory('가족건강')
    }
  }, [activeTab])

  // 도량 방문 & 차담·사찰 공양(식사) 사전 예약 폼 상태 (첫 화면 부담을 줄이기 위해 기본 접힘)
  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitDate, setVisitDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000)
    return tomorrow.toISOString().split('T')[0]
  })
  const [visitTime, setVisitTime] = useState('오전 11:30 (점심 공양 및 차담)')
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

  // 사경/명상 탭 상태
  const [selectedSutraIdx, setSelectedSutraIdx] = useState(0)
  const [sutraInput, setSutraInput] = useState('')
  const [sutraCompleted, setSutraCompleted] = useState(false)

  // 로그인/회원가입 전환 상태 ('login' | 'signup')
  const [authMode, setAuthMode] = useState('login')
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

  // 포교사 전산 탭: 총괄관리자일 때는 포교사 선택 가능, 일반 포교사일 때는 본인 고정
  const [selectedAgentCode, setSelectedAgentCode] = useState('52148821')
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
  const [adminNewParent, setAdminNewParent] = useState('49121083')

  // 로그인 핸들러
  const handleLogin = (e) => {
    e.preventDefault()
    const code8 = extractPhone8Code(loginIdInput)
    const found = members.find((m) => m.code === code8)
    if (!found) {
      showToast('등록되지 않은 전화번호(아이디)입니다. 회원가입을 먼저 진행해 주세요.')
      return
    }
    if (loginPwInput.trim() && found.password_pin !== loginPwInput.trim()) {
      showToast('비밀번호가 일치하지 않습니다. (초기 기본값: 0000)')
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
    playSingingBowlSound()
    showToast(`🎉 환영합니다, ${newMember.name} 불자님! 본인 계정이 생성되어 자동 로그인되었습니다.`)
    setActiveTab('home')
  }

  // 내 정보(기본정보 + 사찰 축원 확장정보 + 정산계좌) 저장 핸들러
  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!currentUser) return
    setMembers((prev) =>
      prev.map((m) =>
        m.code === currentUser.code
          ? {
              ...m,
              name: profileForm.name.trim() || m.name,
              password_pin: profileForm.password_pin.trim() || m.password_pin,
              dharma_name: profileForm.dharma_name.trim(),
              birth_date: profileForm.birth_date.trim(),
              lunar_solar: profileForm.lunar_solar,
              address: profileForm.address.trim(),
              family_memo: profileForm.family_memo.trim(),
              bank_name: profileForm.bank_name.trim(),
              bank_account: profileForm.bank_account.trim(),
              account_holder: profileForm.account_holder.trim(),
            }
          : m
      )
    )
    playSingingBowlSound()
    showToast('✅ 내 계정 및 사찰 축원 상세정보가 안전하게 저장되었습니다.')
  }

  // 소원등 점등 및 대웅전 축원 접수 핸들러
  const handlePrayerSubmit = (e) => {
    e.preventDefault()
    if (!wishName.trim() || !wishPhone.trim() || !wishText.trim()) {
      showToast('성함과 연락처, 소원 발원문을 모두 입력해 주세요.')
      return
    }

    playSingingBowlSound()
    setIsLanternLit(true)

    const assignedAgentCode = currentUser?.parent_code || referralCode || '52148821'
    const writerCode = currentUser?.code || extractPhone8Code(wishPhone)

    const newPrayer = {
      id: 'p-' + Date.now(),
      member_code: writerCode,
      believer_name: wishName.trim(),
      believer_phone: wishPhone.trim(),
      agent_code: assignedAgentCode,
      wish_category: wishCategory,
      wish_text: wishText.trim(),
      status: wishCategory.includes('위패') ? 'consulting' : 'prayed',
      prayed_at: wishCategory.includes('위패')
        ? '종무소 위패 봉안 우선 상담 배정됨'
        : '오늘 제주 소원사 대웅전 축원 접수완료',
      created_at: '방금 전',
    }

    setPrayers((prev) => [newPrayer, ...prev])

    // 담당 포교사 인연 신도수 업데이트
    setMembers((prev) =>
      prev.map((m) =>
        m.code === assignedAgentCode
          ? { ...m, believers_count: (m.believers_count || 0) + 1 }
          : m
      )
    )

    setWishText('')
    setShowSuccessModal(true)
    showToast('🙏 대웅전 소원등이 밝게 점등되었습니다. 사시예불마다 정성껏 축원 올립니다.')
  }

  // 전날 도량 방문 & 차담·사찰 공양(식사) 사전 예약 접수 핸들러
  const handleVisitSubmit = (e) => {
    e.preventDefault()
    if (!wishName.trim() || !wishPhone.trim() || !visitDate) {
      showToast('방문자 성함과 연락처, 방문 예정일을 확인해 주세요.')
      return
    }
    const assignedAgentCode = currentUser?.parent_code || referralCode || '52148821'
    const writerCode = currentUser?.code || extractPhone8Code(wishPhone)

    const newVisit = {
      id: 'v-' + Date.now(),
      member_code: writerCode,
      visitor_name: wishName.trim(),
      visitor_phone: wishPhone.trim(),
      agent_code: assignedAgentCode,
      visit_date: visitDate,
      visit_time: visitTime,
      headcount: Number(visitHeadcount),
      visit_purpose: visitPurpose,
      memo: visitMemo.trim() || '따뜻한 차와 정성스러운 사찰 공양(식사) 부탁드립니다.',
      status: 'reserved',
      created_at: '방금 전',
    }

    setVisits((prev) => [newVisit, ...prev])
    setVisitMemo('')
    playSingingBowlSound()
    showToast(
      `🍵 [${visitDate} ${visitTime.split(' ')[0]}] ${visitHeadcount}분 방문 및 사찰 공양(식사) 예약이 접수되었습니다!`
    )
  }

  // 사경 입력 체크 (본인 계정 공덕 횟수에 누적)
  const currentSutra = SUTRA_LIST[selectedSutraIdx]
  const currentMeritCount = currentUser ? currentUser.merit_count || 0 : 108

  const handleSutraChange = (val) => {
    setSutraInput(val)
    if (val.trim() === currentSutra.text.trim() && !sutraCompleted) {
      playSingingBowlSound()
      setSutraCompleted(true)
      if (currentUser) {
        setMembers((prev) =>
          prev.map((m) =>
            m.code === currentUser.code
              ? { ...m, merit_count: (m.merit_count || 0) + 1 }
              : m
          )
        )
      }
      showToast('✨ 한 줄 사경 공덕이 내 계정에 원만히 회향되었습니다. (공덕 +1)')
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
      parent_code: adminNewParent || '49121083',
      bank_name: '',
      bank_account: '',
      account_holder: adminNewName.trim(),
      merit_count: 1,
      believers_count: 0,
      wipae_count: 0,
      extra_data: {},
    }
    setMembers((prev) => [created, ...prev])
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

  // 포교사 추천 링크 복사
  const handleCopyRefLink = (code) => {
    const url = `${window.location.origin}/?ref=${code}`
    navigator.clipboard?.writeText(url)
    showToast(`📋 포교사 전용 링크가 복사되었습니다: ${url}`)
  }

  // 권한 체크 헬퍼
  const isAgentOrAbove =
    currentUser?.role === 'agent' ||
    currentUser?.role === 'temple_admin' ||
    currentUser?.role === 'master'
  const isAdmin =
    currentUser?.role === 'temple_admin' || currentUser?.role === 'master'

  return (
    <div className="min-h-screen bg-[#12100E] flex justify-center selection:bg-[#C59B27] selection:text-white">
      {/* 모바일 앱 컨테이너 (최대 480px 중앙 정렬) */}
      <div className="w-full max-w-[480px] min-h-screen bg-[#FAF8F5] text-[#231F1C] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-[#E8DFD1]/30 pb-24">
        
        {/* 상단 고정 헤더: 제주 소원사 공식 모바일 법당 */}
        <header className="sticky top-0 z-30 bg-[#1B1815]/95 backdrop-blur-md text-[#FAF8F5] px-3.5 py-3 border-b-2 border-[#C59B27]/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5D061] to-[#B6861C] flex items-center justify-center shadow-[0_0_15px_rgba(245,208,97,0.4)] border border-[#FFF3B8]/60 font-serif-kr font-black text-base text-[#1B1815] shrink-0">
              卍
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
                    {currentUser.dharma_name ? `(${currentUser.dharma_name})` : ''}
                  </strong>
                  {currentUser.role === 'master'
                    ? ' 관리자님'
                    : currentUser.role === 'temple_admin'
                    ? ' 회장님'
                    : currentUser.role === 'agent'
                    ? ' 포교사님'
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
          <main className="flex-1 flex flex-col gap-5 p-4">
            {/* 히어로 카드: 제주 소원사 대웅전 (글자 크기를 키워도 절대 겹치지 않는 flex-col 구조) */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#D8CBB8] min-h-[216px] flex flex-col justify-between p-4">
              <img
                src="/images/sowonsa_real_cover_path.png"
                alt="제주 소원사 도량"
                className="absolute inset-0 w-full h-full object-cover brightness-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#161310]/95 via-[#161310]/45 to-black/20" />

              <div className="relative z-10 flex justify-between items-center mb-6">
                <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-sm text-[#F5D061] text-[11px] font-semibold border border-[#F5D061]/35 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  대웅전 부처님 전 소원 축원 진행중
                </span>
              </div>

              <div className="relative z-10 text-white pt-1 pb-1">
                <h1 className="font-serif-kr text-xl sm:text-2xl font-bold leading-tight mb-1.5 break-keep">
                  간절한 기도가 응답받는 곳,{' '}
                  <span className="text-[#F5D061] underline decoration-[#F5D061]/50 underline-offset-4 whitespace-nowrap">
                    제주 소원사
                  </span>
                </h1>
                <p className="text-xs text-[#E8DFD1] leading-relaxed break-keep">
                  거리가 멀어 직접 오시지 못하는 날에도, 모바일 법당에 올리신 한 줄 소원을 제주 소원사 대웅전 부처님 전에 정성껏 축원 올립니다.
                </p>
              </div>
            </div>

            {/* 오늘의 부처님 말씀 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#9A7418] bg-[#FAF3DF] px-2.5 py-1 rounded-full border border-[#E5D399] whitespace-nowrap">
                  오늘의 부처님 말씀
                </span>
                <button
                  onClick={() => {
                    playSingingBowlSound()
                    setQuoteIdx((prev) => (prev + 1) % DAILY_QUOTES.length)
                  }}
                  className="text-xs text-[#786E63] hover:text-[#231F1C] flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>다른 말씀 보기</span>
                </button>
              </div>

              <blockquote className="font-serif-kr text-[16px] sm:text-[17px] font-bold text-[#231F1C] leading-relaxed mb-2.5 break-keep">
                “{currentQuote.verse}”
              </blockquote>
              <p className="text-xs font-semibold text-[#8C7A5B] mb-2">— {currentQuote.source}</p>
              <p className="text-xs text-[#575049] bg-[#FAF8F5] p-3 rounded-xl border border-[#EFE9DD] leading-relaxed break-keep">
                💡 {currentQuote.commentary}
              </p>
            </section>

            {/* 퀵 액션 배너 2종: 소원등 켜기 · 온라인 한줄 사경 (불사안내는 하단 탭으로 분리하여 첫 화면 부담 제거) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  playSingingBowlSound()
                  setActiveTab('lantern')
                }}
                className="bg-gradient-to-br from-[#2B241D] to-[#1A1612] text-white px-3.5 py-3.5 rounded-2xl text-left border border-[#C59B27]/50 shadow-md hover:scale-[1.01] transition flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C59B27]/20 border border-[#F5D061]/40 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-[#F5D061]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10.5px] text-[#F5D061] font-medium whitespace-nowrap">
                    대웅전 무료 축원
                  </span>
                  <h3 className="font-serif-kr font-bold text-sm sm:text-base mt-0.5 whitespace-nowrap">
                    소원등 켜기
                  </h3>
                </div>
              </button>

              <button
                onClick={() => {
                  playSingingBowlSound()
                  setActiveTab('sutra')
                }}
                className="bg-gradient-to-br from-[#F6F1E4] to-[#EAE0C8] text-[#231F1C] px-3.5 py-3.5 rounded-2xl text-left border border-[#D5C59B] shadow-md hover:scale-[1.01] transition flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-[#9A7418]/15 border border-[#9A7418]/30 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-[#8A6510]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[10.5px] text-[#8A6510] font-semibold whitespace-nowrap">
                    나의 공덕 {currentMeritCount}회
                  </span>
                  <h3 className="font-serif-kr font-bold text-sm sm:text-base mt-0.5 whitespace-nowrap">
                    한 줄 사경
                  </h3>
                </div>
              </button>
            </div>

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
                      <select
                        value={visitHeadcount}
                        onChange={(e) => setVisitHeadcount(Number(e.target.value))}
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#26211C] border border-[#C59B27]/50 text-white text-xs font-bold focus:outline-none focus:border-[#F5D061] truncate"
                      >
                        <option value={1}>1명 방문</option>
                        <option value={2}>2명 방문 (부부·동반)</option>
                        <option value={3}>3명 방문 (가족)</option>
                        <option value={4}>4명 방문 (가족·모임)</option>
                        <option value={5}>5명 이상 (단체)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap">
                        방문 시간대
                      </label>
                      <select
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#26211C] border border-[#C59B27]/50 text-white text-xs font-bold focus:outline-none focus:border-[#F5D061] truncate"
                      >
                        <option value="오전 10:30 (오전 참배 및 차담)">오전 10:30 (참배·차담)</option>
                        <option value="오전 11:30 (점심 공양 및 차담)">오전 11:30 (점심공양)</option>
                        <option value="오후 02:00 (오후 차담 및 참배)">오후 02:00 (오후차담)</option>
                        <option value="오후 04:00 (오후 참배 및 상담)">오후 04:00 (오후참배)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-2 w-full">
                      <label className="text-xs text-[#E8DFD1] font-bold whitespace-nowrap">
                        식사 · 차담
                      </label>
                      <select
                        value={visitPurpose}
                        onChange={(e) => setVisitPurpose(e.target.value)}
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#26211C] border border-[#C59B27]/50 text-white text-xs font-bold focus:outline-none focus:border-[#F5D061] truncate"
                      >
                        <option value="따뜻한 차 & 사찰 공양(식사) 대접 예약">차 & 사찰 공양(식사)</option>
                        <option value="도량 참배 및 따뜻한 차담 예약">도량 참배 & 차담</option>
                        <option value="스님 신행 상담 및 차담 예약">스님 신행 상담</option>
                        <option value="가족 기도 및 도량 참배 예약">가족 기도 참배</option>
                      </select>
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
                        placeholder="예: 점심 공양 2인 부탁드립니다"
                        className="block w-full max-w-full min-w-0 box-border px-2.5 py-2 rounded-lg bg-[#FFFDF9] border border-[#C59B27]/60 text-[#1B1815] text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#F5D061] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>방문 · 사찰 공양(식사) 예약 접수 완료하기</span>
                  </button>
                </form>
              )}

              {/* 전화 예약 바로가기 버튼 2종 */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:010-4912-1083"
                  className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-white/15 text-[#F5D061] font-bold text-[11px] border border-[#F5D061]/40 hover:bg-white/20 transition whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>예약 010-4912-1083</span>
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
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-4 h-4 text-[#C59B27] shrink-0" />
                  <h2 className="font-serif-kr font-bold text-base whitespace-nowrap">
                    실시간 소원사 축원 등불
                  </h2>
                </div>
                <span className="text-xs text-[#8C7A5B] whitespace-nowrap shrink-0">
                  대웅전 상시 축원중
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

            {/* 제주 소원사 공식 사이트 & SNS 채널 통합 바로가기 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3">
              <div>
                <span className="text-[11px] font-bold text-[#9A7418]">
                  OFFICIAL CHANNELS
                </span>
                <h2 className="font-serif-kr font-bold text-base text-[#231F1C] mt-0.5 whitespace-nowrap">
                  제주 소원사 공식 사이트 · 채널
                </h2>
              </div>

              <div className="space-y-2">
                {[
                  {
                    title: '제주 소원사 공식 홈페이지',
                    sub: '도량 전경과 주요 전각·불사 종합 안내',
                    url: 'https://sowonsa.vercel.app/',
                    icon: (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#231F1C] to-[#151210] border border-[#C59B27] flex items-center justify-center shadow-sm shrink-0">
                        <Globe className="w-4 h-4 text-[#F5D061]" />
                      </div>
                    ),
                  },
                  {
                    title: '소원사 공식 유튜브 채널',
                    sub: '사계절 도량 풍경과 스님 예불·법문 영상',
                    url: 'https://www.youtube.com/@jejusowonsa',
                    icon: (
                      <div className="w-9 h-9 rounded-xl bg-[#FF0000] flex items-center justify-center shadow-sm shrink-0">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    title: '소원사 공식 인스타그램',
                    sub: '사진으로 만나는 소원사의 따뜻한 일상',
                    url: 'https://www.instagram.com/jejusowonsa/',
                    icon: (
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0"
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
                    title: '소원사 공식 스레드 (Threads)',
                    sub: '매일 전하는 짧은 마음챙김과 도량 소식',
                    url: 'https://www.threads.com/@jejusowonsa',
                    icon: (
                      <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center shadow-sm shrink-0">
                        <svg viewBox="0 0 192 192" className="w-5 h-5 fill-white" aria-hidden="true">
                          <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.552zm-43.096 40.519c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.113 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274z" />
                        </svg>
                      </div>
                    ),
                  },
                  {
                    title: '제주 소원사 모바일 안내카드',
                    sub: '지인에게 카카오톡으로 소원사 소개하기',
                    url: 'https://sowonsa.vercel.app/introcard',
                    icon: (
                      <div className="w-9 h-9 rounded-xl bg-[#FEE500] flex items-center justify-center shadow-sm shrink-0">
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
                    className="p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F3ECE0] border border-[#E6DEC8] flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {ch.icon}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#231F1C] truncate">
                          {ch.title}
                        </div>
                        <div className="text-[11px] text-[#786E63] truncate">
                          {ch.sub}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#9A7418] shrink-0" />
                  </a>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* ==================== 1-B. 불사안내 (생전예수재·위패·기도 통합 신청) 탭 ==================== */}
        {activeTab === 'bulsa' && (
          <main className="flex-1 flex flex-col gap-5 p-4">
            {/* 상단 불사안내 헤더 */}
            <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/50 shadow-md">
              <span className="block text-[11px] text-[#F5D061] font-bold whitespace-nowrap">
                제주 소원사 위패 봉안 · 특별 기도 · 불사 동참
              </span>
              <h2 className="font-serif-kr text-lg sm:text-xl font-bold mt-1 break-keep">
                현세의 복덕과 조상님의 안식을 발원합니다
              </h2>
              <p className="text-xs text-[#D6CEC2] mt-1.5 leading-relaxed break-keep">
                원하시는 불사 항목을 선택하시고 아래 신청란에 남겨주시면 제주 소원사 종무소에서 정성껏 안내 및 축원을 도와드립니다.
              </p>
            </section>

            {/* 대표 위패 2종 실물 비교 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold text-[#9A7418] whitespace-nowrap">
                    1. 명당 위패 봉안 불사 (2종)
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] whitespace-nowrap">
                    생전예수재 황금위패 · 조상 영구위패
                  </h3>
                </div>
                <Award className="w-6 h-6 text-[#C59B27] shrink-0" />
              </div>

              <div className="rounded-xl overflow-hidden border border-[#D8CBB8]">
                <img
                  src="/images/wipae_product.jpg"
                  alt="생전예수재 황금위패와 조상 흑색 위패 실물"
                  className="w-full h-44 object-cover"
                />
                <div className="bg-[#1B1815] text-white px-3 py-2 flex justify-between gap-2 text-[10.5px] font-bold">
                  <span className="text-[#F5D061] whitespace-nowrap">◀ 좌측: 생전예수재 황금위패</span>
                  <span className="text-[#E2DAD0] whitespace-nowrap">우측: 조상 영가 흑색위패 ▶</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* ① 생전예수재 황금위패 */}
                <div className="rounded-xl border-2 border-[#D4AF37] bg-gradient-to-br from-[#FFFDF7] to-[#F9F1D8] p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37] text-[#1B1815] whitespace-nowrap">
                      살아계신 분 · 현세 복덕과 무병장수
                    </span>
                    <span className="text-xs font-extrabold text-[#8A6510] whitespace-nowrap shrink-0">
                      영구 봉안
                    </span>
                  </div>
                  <h4 className="font-serif-kr font-bold text-base text-[#231F1C] break-keep">
                    ① 생전예수재 황금빛 위패
                  </h4>
                  <p className="text-xs text-[#575049] leading-relaxed break-keep">
                    살아생전에 미리 선업과 공덕을 닦아 삼재팔난과 액난을 소멸하고, 부모님과 가족의 무병장수·수복증장을 기원하는 찬란한 황금 위패입니다.
                  </p>
                </div>

                {/* ② 조상 영가 흑색 위패 */}
                <div className="rounded-xl border border-[#3A352F] bg-gradient-to-br from-[#231F1C] to-[#161311] text-white p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/40 whitespace-nowrap">
                      돌아가신 조상님 · 극락왕생 천도
                    </span>
                    <span className="text-xs font-extrabold text-[#F5D061] whitespace-nowrap shrink-0">
                      영구 봉안
                    </span>
                  </div>
                  <h4 className="font-serif-kr font-bold text-base text-[#FAF8F5] whitespace-nowrap">
                    ② 조상 영가 품격 흑색 영구위패
                  </h4>
                  <p className="text-xs text-[#C8C0B7] leading-relaxed break-keep">
                    중후한 흑색 바탕에 순금빛 존함을 새겨 후손들의 제사 부담을 덜어드리고, 사찰에서 영구히 독경과 합동 차례·천도 축원을 올립니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 그 외 주요 기도·불사 종목 모음 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-3">
              <div>
                <span className="block text-[11px] font-bold text-[#9A7418] whitespace-nowrap">
                  2. 상시 기도 및 공덕 불사 종목
                </span>
                <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] whitespace-nowrap">
                  인등 · 천도재 · 기일제사 · 공양미 불사
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    key: '대웅전 1년 인등(가족등)',
                    badge: '365일 점등',
                    title: '③ 대웅전 1년 가족 인등(연등) 불사',
                    desc: '대웅전 부처님 전에 1년 365일 꺼지지 않는 등불을 밝혀 가족의 건강, 자녀 학업·취업, 사업 번창을 매일 축원합니다.',
                  },
                  {
                    key: '49재/천도재/기일제사',
                    badge: '극락왕생 천도',
                    title: '④ 49재 · 천도재 · 기일제사 봉행',
                    desc: '돌아가신 부모·조상님, 수자령(태아령)의 극락왕생을 발원하는 천도재 및 가정에서 모시기 어려운 기일 제사를 정성껏 봉행합니다.',
                  },
                  {
                    key: '대웅전 공양미/불전시주',
                    badge: '무량 공덕 보시',
                    title: '⑤ 대웅전 공양미 · 초 · 향 시주 불사',
                    desc: '부처님 전에 올리는 맑은 공양미와 황초·향 시주 및 제주 소원사 도량 수호 불사에 동참하실 수 있습니다.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setWishCategory(item.key)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      wishCategory === item.key
                        ? 'bg-[#FAF3DF] border-[#C59B27]'
                        : 'bg-[#FAF8F5] border-[#EAE2D3] hover:border-[#C59B27]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-[#231F1C] whitespace-nowrap">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#8A6510] border border-[#E5D399] font-bold whitespace-nowrap shrink-0">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#575049] leading-relaxed break-keep">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 불사·위패·기도 통합 신청란 */}
            <form
              onSubmit={handlePrayerSubmit}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border-2 border-[#C59B27] space-y-4"
            >
              <div className="border-b border-[#EFE9DD] pb-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[10.5px] font-bold text-[#9A7418] whitespace-nowrap">
                    ONLINE APPLICATION
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] whitespace-nowrap">
                    불사 · 위패 · 기도 동참 신청란
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-[10.5px] px-2 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] font-bold border border-[#E5D399] whitespace-nowrap shrink-0">
                    내 계정 연동됨
                  </span>
                )}
              </div>

              {/* STEP 1. 종목 선택 영역 */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF5E6] border border-[#E5D399]">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C] whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold shrink-0">
                      1단계
                    </span>
                    <span>불사 / 기도 종목 선택</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#9A7418] whitespace-nowrap shrink-0">
                    1개 선택
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    '생전예수재(황금위패)',
                    '조상영구위패(흑색)',
                    '대웅전 1년 인등(가족등)',
                    '49재/천도재/기일제사',
                    '대웅전 공양미/불전시주',
                    '기타 특별기도 상담',
                  ].map((cat) => {
                    const isSelected = wishCategory === cat
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setWishCategory(cat)}
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C] whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#8A6510] text-white text-[10px] font-extrabold shrink-0">
                      2단계
                    </span>
                    <span>신청자 성함 · 발원문 작성</span>
                  </div>
                  <span className="text-[10.5px] text-[#7A7065] font-medium whitespace-nowrap shrink-0">
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
                      placeholder="예: 홍길동 (무량심)"
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

                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1">
                    봉안 대상자 정보 및 발원 내용
                  </label>
                  <textarea
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="예: 부모님 생전예수재 황금위패 2기 봉안 상담 희망합니다 / 가족 1년 인등 신청합니다."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm text-[#231F1C] shadow-inner"
                  />
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
          </main>
        )}

        {/* ==================== 2. 디지털 소원등 탭 ==================== */}
        {activeTab === 'lantern' && (
          <main className="flex-1 flex flex-col gap-5 p-4">
            {/* 인터랙티브 3D 광명 연등 */}
            <div className="rounded-2xl bg-gradient-to-b from-[#16120E] via-[#221C15] to-[#16120E] text-white p-6 text-center relative overflow-hidden border border-[#C59B27]/40 shadow-xl">
              <div className="text-xs text-[#F5D061] font-medium mb-1">
                제주 소원사 대웅전 실시간 연동
              </div>
              <h2 className="font-serif-kr text-xl font-bold mb-5 whitespace-nowrap">
                마음의 소원등(願燈)을 밝혀보세요
              </h2>

              {/* 연등 그래픽 + 하단 제주 소원사 축원 명패 */}
              <div className="my-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    playSingingBowlSound()
                    setIsLanternLit((prev) => !prev)
                  }}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-700 border-2 ${
                    isLanternLit
                      ? 'bg-gradient-to-b from-[#FFE27A] via-[#F2A922] to-[#B86B09] border-[#FFF3B8] lantern-active scale-105'
                      : 'bg-[#2C2620] border-[#52473B] opacity-70'
                  }`}
                >
                  <Flame
                    className={`w-12 h-12 transition-transform duration-500 ${
                      isLanternLit
                        ? 'text-[#1E1812] fill-[#FFF5C0] scale-110'
                        : 'text-[#8C8275]'
                    }`}
                  />
                  <span
                    className={`mt-1.5 font-serif-kr font-bold text-xs ${
                      isLanternLit ? 'text-[#1E1812]' : 'text-[#C2B8AB]'
                    }`}
                  >
                    {isLanternLit ? '광명 점등중' : '터치하여 점등'}
                  </span>
                </button>

                {/* 연등 아래 매달린 제주 소원사 황금 축원 명패 */}
                <div className="w-0.5 h-4 bg-[#D4AF37]" />
                <div className="px-5 py-2.5 rounded-xl bg-gradient-to-b from-[#2E251A] to-[#1B1610] border-2 border-[#D4AF37] shadow-lg text-center min-w-[220px]">
                  <div className="text-[10px] text-[#F5D061] font-bold tracking-widest border-b border-[#D4AF37]/30 pb-1 mb-1 whitespace-nowrap">
                    卍 제주 소원사 대웅전 축원 명패
                  </div>
                  <div className="font-serif-kr text-sm font-bold text-white">
                    {wishName.trim() ? `${wishName.trim()} 불자님` : '소원성취 발원 명패'}
                  </div>
                  {currentUser?.address && (
                    <div className="text-[10px] text-[#C8C0B7] mt-0.5 truncate max-w-[200px]">
                      {currentUser.address}
                    </div>
                  )}
                  <div className="text-[11px] text-[#F5D061] mt-0.5 font-semibold">
                    [{wishCategory}]
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#D6CEC2] max-w-xs mx-auto leading-relaxed mt-3 break-keep">
                소원등을 밝히고 아래 발원문을 남겨주시면 제주 소원사 스님께서 아침 사시예불마다 축원해 드립니다.
              </p>
            </div>

            {/* 무료 소원 축원 신청 폼 */}
            <form
              onSubmit={handlePrayerSubmit}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-4"
            >
              <div className="border-b border-[#EFE9DD] pb-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="block text-[10.5px] font-bold text-[#9A7418] whitespace-nowrap">
                    100% 무료 매일 사시예불 축원
                  </span>
                  <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5 whitespace-nowrap">
                    대웅전 소원등 발원문 접수
                  </h3>
                </div>
                {currentUser && (
                  <span className="text-[10.5px] px-2 py-1 rounded-full bg-[#FAF3DF] text-[#8A6510] font-bold border border-[#E5D399] whitespace-nowrap shrink-0">
                    내 계정 연동됨
                  </span>
                )}
              </div>

              {/* STEP 1. 기원 분야 선택 영역 */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#FAF5E6] border border-[#E5D399]">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C] whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#231F1C] text-[#F5D061] text-[10px] font-extrabold shrink-0">
                      1단계
                    </span>
                    <span>기원 분야 선택 (터치)</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#9A7418] whitespace-nowrap shrink-0">
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
                        onClick={() => setWishCategory(cat)}
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#231F1C] whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#8A6510] text-white text-[10px] font-extrabold shrink-0">
                      2단계
                    </span>
                    <span>신청자 성함 · 발원문 작성</span>
                  </div>
                  <span className="text-[10.5px] text-[#7A7065] font-medium whitespace-nowrap shrink-0">
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
                      placeholder="예: 홍길동 (무량심)"
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

                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1">
                    부처님께 올리는 한 줄 소원 (발원문)
                  </label>
                  <textarea
                    rows={3}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="예: 우리 가족 올 한 해 무병장수하고 하는 일마다 순조롭게 풀리기를 발원합니다."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-[#C8BFA8] focus:border-[#C59B27] focus:outline-none text-sm text-[#231F1C] shadow-inner"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF3DF] border border-[#E5D399] text-[11px] text-[#6E5617] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#9A7418] shrink-0 mt-0.5" />
                <div className="break-keep">
                  <strong>제주 소원사 대웅전 매일 축원:</strong> 소원등을 밝히고 남겨주신 발원문은 매일 오전 10시 30분 사시예불마다 부처님 전에 정성껏 축원 올립니다.
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#AA8010] text-[#1B1815] font-bold text-xs sm:text-sm shadow-md hover:brightness-105 transition flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Flame className="w-4 h-4 fill-current shrink-0" />
                <span>대웅전 소원등 켜고 사시예불 축원 올리기</span>
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
                      <span className="whitespace-nowrap shrink-0">{p.created_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        )}

        {/* ==================== 3. 사경/명상 탭 ==================== */}
        {activeTab === 'sutra' && (
          <main className="flex-1 flex flex-col gap-5 p-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/40 shadow-md flex items-center justify-between">
              <div>
                <span className="text-xs text-[#F5D061] font-medium">
                  {currentUser
                    ? `${currentUser.name}${currentUser.dharma_name ? `(${currentUser.dharma_name})` : ''}님의 신행 공덕장`
                    : '나의 온라인 신행 공덕장'}
                </span>
                <h2 className="font-serif-kr text-2xl font-bold mt-0.5">
                  누적 사경 공덕 <span className="text-[#F5D061]">{currentMeritCount}</span>회
                </h2>
                <p className="text-xs text-[#BFB6AA] mt-1">
                  한 글자 한 글자 정성껏 따라 쓰며 마음을 맑게 비워보세요.
                </p>
              </div>
              <button
                onClick={playSingingBowlSound}
                className="w-16 h-16 rounded-2xl bg-[#C59B27]/20 border border-[#F5D061]/50 flex flex-col items-center justify-center gap-1 hover:bg-[#C59B27]/30 transition shrink-0"
              >
                <Volume2 className="w-6 h-6 text-[#F5D061]" />
                <span className="text-[10px] text-[#F5D061] font-semibold">싱잉볼 타종</span>
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {SUTRA_LIST.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedSutraIdx(idx)
                    setSutraInput('')
                    setSutraCompleted(false)
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                    selectedSutraIdx === idx
                      ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                      : 'bg-white text-[#6E655C] border-[#E4DDD0]'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
              <div className="text-center border-b border-[#EFE9DD] pb-4">
                <span className="text-xs text-[#9A7418] font-bold tracking-widest">
                  {currentSutra.hanja}
                </span>
                <h3 className="font-serif-kr text-lg font-bold text-[#231F1C] mt-1">
                  {currentSutra.title}
                </h3>
                <p className="text-xs text-[#6E655C] mt-1">{currentSutra.meaning}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF6EC] border border-[#E6D9B8] text-center">
                <p className="text-[11px] text-[#8C7A5B] mb-2">
                  아래 경전 구절을 그대로 따라 입력해 보세요
                </p>
                <div className="font-serif-kr text-lg font-bold tracking-wide leading-relaxed flex flex-wrap justify-center gap-0.5">
                  {currentSutra.text.split('').map((char, i) => {
                    const typedChar = sutraInput[i]
                    const isMatched = typedChar === char
                    const isWrong = typedChar !== undefined && typedChar !== char
                    return (
                      <span
                        key={i}
                        className={`px-0.5 rounded transition ${
                          isMatched
                            ? 'text-[#9A7418] bg-[#F5D061]/25'
                            : isWrong
                            ? 'text-red-600 bg-red-100'
                            : 'text-[#8C8275]'
                        }`}
                      >
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={sutraInput}
                  onChange={(e) => handleSutraChange(e.target.value)}
                  placeholder={currentSutra.text}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#FAF8F5] border-2 border-[#D5C59B] font-serif-kr text-base text-center focus:outline-none focus:border-[#9A7418]"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSutraChange(currentSutra.text)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399] text-xs font-bold hover:bg-[#F3E7C6] transition"
                >
                  ✨ 어르신 간편 원클릭 사경 완독
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSutraInput('')
                    setSutraCompleted(false)
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#EFECE6] text-[#575049] text-xs font-semibold hover:bg-[#E4DFD7] transition"
                >
                  다시 쓰기
                </button>
              </div>

              {sutraCompleted && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#231F1C] to-[#2E2822] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-[#F5D061] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#F5D061]">
                        사경 1독 회향 완료! (+1 공덕)
                      </div>
                      <div className="text-[11px] text-[#D6CEC2]">
                        이 공덕이 불자님과 가족의 평안으로 회향되기를 발원합니다.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>
        )}

        {/* ==================== 4. 내정보 (로그인 · 회원가입 · 축원정보 관리) 탭 ==================== */}
        {activeTab === 'profile' && (
          <main className="flex-1 flex flex-col gap-5 p-4">
            {/* 대표님 테스트용 원클릭 계정 전환 스위치 바 */}
            <section className="rounded-2xl bg-[#26211C] text-white p-4 border border-[#C59B27]/40 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#F5D061] font-bold whitespace-nowrap">
                  ⚡ 역할별 계정 빠른 전환 (테스트용)
                </span>
                {currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUserCode('')
                      showToast('로그아웃되었습니다. 로그인/회원가입 화면이 표시됩니다.')
                    }}
                    className="text-[11px] text-[#D6CEC2] hover:text-white flex items-center gap-1 underline whitespace-nowrap shrink-0"
                  >
                    <LogOut className="w-3 h-3 shrink-0" />
                    <span>로그아웃(가입화면)</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUserCode('82341088')
                    showToast('🙏 일반신도 [이정숙(무량화)] 본인 계정으로 접속되었습니다.')
                  }}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap ${
                    currentUser?.code === '82341088'
                      ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                      : 'bg-white/5 text-[#E8DFD1] border-white/10'
                  }`}
                >
                  일반신도(이정숙)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUserCode('52148821')
                    showToast('🪷 포교사 [김연화(연화심)] 본인 계정으로 접속되었습니다.')
                  }}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap ${
                    currentUser?.code === '52148821'
                      ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                      : 'bg-white/5 text-[#E8DFD1] border-white/10'
                  }`}
                >
                  포교사(연화심)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUserCode('33065540')
                    showToast('👑 관리자 [김철수] 계정으로 접속되었습니다.')
                  }}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition whitespace-nowrap ${
                    currentUser?.code === '33065540'
                      ? 'bg-[#F5D061] text-[#1B1815] border-[#F5D061]'
                      : 'bg-white/5 text-[#E8DFD1] border-white/10'
                  }`}
                >
                  관리자(김철수)
                </button>
              </div>
            </section>

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
                        비밀번호 (초기 기본값: 0000)
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
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/40 font-bold">
                        {currentUser.role === 'master'
                          ? '관리자 계정'
                          : currentUser.role === 'temple_admin'
                          ? '소원사 본부 계정'
                          : currentUser.role === 'agent'
                          ? '공식 포교사 계정'
                          : '제주 소원사 신도 계정'}
                      </span>
                      <h2 className="font-serif-kr text-xl font-bold mt-1.5">
                        {currentUser.name}
                        {currentUser.dharma_name ? ` (${currentUser.dharma_name})` : ''}님
                      </h2>
                      <p className="text-xs text-[#BFB6AA] mt-0.5">
                        로그인 ID(전화번호): {currentUser.phone} · 고유코드: {currentUser.code}
                      </p>
                    </div>
                  </div>
                </section>

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

                  {/* 3. 포교사/관리자 전용 수당 입금 계좌 정보 */}
                  {isAgentOrAbove && (
                    <div className="pt-3 border-t border-[#EFE9DD] space-y-2.5">
                      <span className="block text-[11px] font-bold text-[#9A7418]">
                        [포교사 전용] 불사 수당 정산 계좌 정보
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
          <main className="flex-1 flex flex-col gap-5 p-4">
            <section className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-5 border border-[#C59B27]/40 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#F5D061] font-semibold">
                    포교사 모바일 파트너 센터
                  </span>
                  <h2 className="font-serif-kr text-xl font-bold mt-0.5">
                    {activeAgent.name}
                    {activeAgent.dharma_name ? `(${activeAgent.dharma_name})` : ''}님의 전법 도량
                  </h2>
                </div>
                {isAdmin && (
                  <select
                    value={selectedAgentCode}
                    onChange={(e) => setSelectedAgentCode(e.target.value)}
                    className="bg-[#2E2822] text-[#F5D061] border border-[#C59B27]/50 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
                  >
                    {agents.map((ag) => (
                      <option key={ag.code} value={ag.code}>
                        {ag.name} ({ag.code})
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
                  <div className="text-[10.5px] text-[#BFB6AA] whitespace-nowrap">1차 포교 수당</div>
                  <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5 whitespace-nowrap">
                    {commissionRules.rate1st}%
                  </div>
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
                </div>
              </div>
            </section>

            {/* 나의 인연 신도 도량 방문 & 사찰 공양(식사) 예약 현황 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Coffee className="w-4 h-4 text-[#9A7418] shrink-0" />
                  <h3 className="font-serif-kr font-bold text-sm sm:text-base whitespace-nowrap">
                    인연 신도 방문 · 공양(식사) 예약 현황
                  </h3>
                </div>
                <span className="text-xs text-[#9A7418] font-semibold whitespace-nowrap shrink-0">
                  총 {visits.filter((v) => isAdmin || v.agent_code === activeAgent.code).length}건
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
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#231F1C]">
                          🍵 {v.visitor_name} ({v.visitor_phone})
                        </span>
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
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            v.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.status === 'confirmed' ? '✓ 공양준비확정' : '예약접수 (터치시 확정)'}
                        </button>
                      </div>
                      <div className="text-xs text-[#8A6510] font-semibold">
                        방문일시: {v.visit_date} · {v.visit_time} ({v.headcount}명)
                      </div>
                      <div className="text-xs text-[#4A433C]">
                        목적: {v.visit_purpose} / “{v.memo}”
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            {/* 나의 인연 신도 리스트 */}
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
                        <span>접수일시: {p.created_at}</span>
                        <span>담당코드: {p.agent_code}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          </main>
        )}

        {/* ==================== 6. 총괄정산 & 회원관리 (관리자 센터) 탭 ==================== */}
        {activeTab === 'admin' && isAdmin && (
          <main className="flex-1 flex flex-col gap-5 p-4">
            <section className="rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#2C241C] text-white p-5 border border-[#C59B27]/50 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F5D061]/20 text-[#F5D061] border border-[#F5D061]/40 font-bold">
                  ADMIN · 관리자 센터
                </span>
                <Settings className="w-4 h-4 text-[#F5D061]" />
              </div>
              <h2 className="font-serif-kr text-xl font-bold">
                통합 회원(포교사·신도) DB & 수당 정산 센터
              </h2>
              <p className="text-xs text-[#D6CEC2] mt-1 leading-relaxed">
                포교사 및 신도 회원 DB를 관리하고, 위패 봉안(기본 200만 원) 시 1·2·3차 포교사 및 플랫폼 총괄(5%) 수당을 자동 정산합니다.
              </p>
            </section>

            {/* 1. 신규 포교사 / 회원 등록 및 등급 관리 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-kr font-bold text-base">
                  1. 통합 회원 & 포교사 DB 관리 ({members.length}명)
                </h3>
                <span className="text-xs text-[#9A7418] font-bold">
                  포교사 {agents.length}명 · 일반신도 {members.length - agents.length}명
                </span>
              </div>

              <form
                onSubmit={handleAdminAddMember}
                className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3] space-y-2.5"
              >
                <div className="text-xs font-bold text-[#231F1C] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#9A7418]" />
                  <span>신규 포교사 / 신도 빠른 등록 (초기비번: 0000)</span>
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
                    <option value="agent">포교사 등록</option>
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

              {/* 등록된 회원 목록 (일반신도 ⇄ 포교사 원클릭 등급 변경 지원) */}
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
                      <option value="agent">포교사</option>
                      <option value="temple_admin">사찰본부</option>
                      <option value="master">관리자</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. 다이나믹 요율 조절 컨트롤러 */}
            <section className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6DEC8] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-kr font-bold text-base">
                  2. 실시간 수당 배분율 설정 (200만 원 위패 기준)
                </h3>
                <span className="text-xs font-bold text-[#9A7418]">합계 100%</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3]">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>① 1차 직접 유치 포교사 ({commissionRules.rate1st}%)</span>
                    <span className="text-[#9A7418]">
                      {((2000000 * commissionRules.rate1st) / 100).toLocaleString()}원
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    value={commissionRules.rate1st}
                    onChange={(e) => updateRule('rate1st', e.target.value)}
                    className="w-full accent-[#C59B27]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3]">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>② 2차 추천 멘토 포교사 ({commissionRules.rate2nd}%)</span>
                    <span className="text-[#9A7418]">
                      {((2000000 * commissionRules.rate2nd) / 100).toLocaleString()}원
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={commissionRules.rate2nd}
                    onChange={(e) => updateRule('rate2nd', e.target.value)}
                    className="w-full accent-[#C59B27]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE2D3]">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>③ 3차 상위 포교 지부장 ({commissionRules.rate3rd}%)</span>
                    <span className="text-[#9A7418]">
                      {((2000000 * commissionRules.rate3rd) / 100).toLocaleString()}원
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={commissionRules.rate3rd}
                    onChange={(e) => updateRule('rate3rd', e.target.value)}
                    className="w-full accent-[#C59B27]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#FFF9E6] border border-[#E5D399]">
                  <div className="flex justify-between text-xs font-bold mb-1 text-[#7D5B0E]">
                    <span>④ 관리자 ({commissionRules.ratePlatform}%)</span>
                    <span>
                      {((2000000 * commissionRules.ratePlatform) / 100).toLocaleString()}원
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={commissionRules.ratePlatform}
                    onChange={(e) => updateRule('ratePlatform', e.target.value)}
                    className="w-full accent-[#9A7418]"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#231F1C] text-white flex justify-between items-center text-xs font-bold">
                  <span>⑤ 제주 소원사 사찰 불사금 귀속 ({commissionRules.rateTemple}%)</span>
                  <span className="text-[#F5D061]">
                    {((2000000 * commissionRules.rateTemple) / 100).toLocaleString()}원
                  </span>
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
                    직접 유치 포교사 (1차)
                  </label>
                  <select
                    value={simAgentCode}
                    onChange={(e) => setSimAgentCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs font-semibold"
                  >
                    {agents.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.name} ({a.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#3D3630] mb-1">
                    봉안 품목 구분
                  </label>
                  <select
                    value={simItemType}
                    onChange={(e) => setSimItemType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DDD4C4] text-xs"
                  >
                    <option value="생전예수재 황금위패 (1기)">생전예수재 황금위패 (1기)</option>
                    <option value="조상 영가 흑색 영구위패 (1기)">조상 영가 흑색 영구위패 (1기)</option>
                    <option value="조상 영가 부부 영구위패 (2기)">조상 영가 부부 영구위패 (2기)</option>
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

                      <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-white p-2.5 rounded-lg border border-[#EFE9DD]">
                        <div>
                          <span className="text-[#786E63]">1차 ({s.agent_1st_name}): </span>
                          <strong className="text-[#231F1C]">{amt1.toLocaleString()}원</strong>
                        </div>
                        <div>
                          <span className="text-[#786E63]">2차 ({s.agent_2nd_name}): </span>
                          <strong className="text-[#231F1C]">{amt2.toLocaleString()}원</strong>
                        </div>
                        <div>
                          <span className="text-[#786E63]">3차 ({s.agent_3rd_name}): </span>
                          <strong className="text-[#231F1C]">{amt3.toLocaleString()}원</strong>
                        </div>
                        <div>
                          <span className="text-[#9A7418] font-semibold">관리자(김철수): </span>
                          <strong className="text-[#9A7418]">{amtPlatform.toLocaleString()}원</strong>
                        </div>
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
                대웅전 소원등 점등 완료
              </h3>
              <p className="text-xs text-[#E2DAD0] leading-relaxed">
                불자님의 간절한 발원이 <strong>제주 소원사 대웅전</strong>에 접수되었습니다. 매일 오전 사시예불마다 스님께서 정성껏 축원 올립니다.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-[#F5D061]">
                🙏 도량에 오시기 전날 미리 연락 주시면 따뜻한 차와 공양(식사)을 대접해 드립니다. (010-4912-1083)
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 rounded-xl bg-[#F5D061] text-[#1B1815] font-bold text-xs"
              >
                합장하며 확인 (나무아미타불)
              </button>
            </div>
          </div>
        )}

        {/* 하단 푸터 */}
        <footer className="px-4 py-6 text-center text-[11px] text-[#8C8275] border-t border-[#E6DEC8]/60 space-y-1.5">
          <div>제주 소원사 · 모바일 법당</div>
          <div className="flex items-center justify-center gap-3">
            <span>종무소 064-805-2007</span>
            <span>·</span>
            <span>신행/차담예약 010-4912-1083</span>
          </div>
        </footer>

        {/* 하단 네비게이션 바 (일반 신도에게는 신행홈·소원등켜기·한줄사경·불사안내·내정보 노출) */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 bg-[#1B1815]/95 backdrop-blur-md border-t border-[#C59B27]/35 px-1.5 py-2 flex items-center justify-around">
          {[
            { id: 'home', label: '신행홈', icon: Heart },
            { id: 'lantern', label: '소원등켜기', icon: Flame },
            { id: 'sutra', label: '한줄사경', icon: BookOpen },
            { id: 'bulsa', label: '불사안내', icon: Award },
            ...(isAgentOrAbove
              ? [{ id: 'agent', label: '포교사전산', icon: Users }]
              : []),
            ...(isAdmin
              ? [{ id: 'admin', label: '총괄정산', icon: TrendingUp }]
              : []),
            { id: 'profile', label: '내정보', icon: User },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
                  isActive ? 'text-[#F5D061]' : 'text-[#9E9488] hover:text-[#D6CEC2]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
                <span className="text-[10.5px] font-semibold mt-1 whitespace-nowrap">
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

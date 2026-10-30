import React, { useState, useMemo, useEffect } from 'react'
import {
  Search,
  UserPlus,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Download,
  Flame,
  FileText,
  RotateCcw,
  Sliders,
  DollarSign,
  Heart,
  Layers,
  ChevronRight,
  X,
  CreditCard,
  Phone,
  Home,
  Check,
} from 'lucide-react'
import {
  SOWONSA_INITIAL_MEMBERS,
  SOWONSA_HWAJU_LIST,
  PRAYER_CATEGORIES,
} from '../../lib/sowonsaLegacyData'
import { computeZodiacAndGanji } from '../../lib/supabase'

// 🏛️ [소원사 종무소 구형 전산(두손모아) 친화형 4분할 데스크 ERP 전산망]
// 🗓️ 삼재(三災) 계산: 띠(지지) 그룹별로 12년 중 3년 연속 삼재가 듭니다.
//   신자진(원숭이·쥐·용) → 인묘진년 / 사유축(뱀·닭·소) → 해자축년
//   인오술(호랑이·말·개) → 신유술년 / 해묘미(돼지·토끼·양) → 사오미년
//   ※ 양력 연도 기준 간이 계산 (입춘·음력 설 경계는 반영하지 않음)
const JIJI_ANIMALS = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'] // year % 12 순서
const SAMJAE_START = { 0: 2, 4: 2, 8: 2, 9: 3, 1: 3, 5: 3, 6: 0, 10: 0, 2: 0, 3: 9, 7: 9, 11: 9 } // 띠(year%12) → 들삼재 시작 해의 year%12
function getSamjaeStage(birthYear, targetYear) {
  const y = parseInt(String(birthYear || '').match(/\d{4}/)?.[0] || '', 10)
  if (!y) return null
  const start = SAMJAE_START[y % 12]
  const diff = (((targetYear % 12) - start) % 12 + 12) % 12
  return diff === 0 ? '들삼재' : diff === 1 ? '눌삼재' : diff === 2 ? '날삼재' : null
}
function getAnimal(birthYear) {
  const y = parseInt(String(birthYear || '').match(/\d{4}/)?.[0] || '', 10)
  return y ? JIJI_ANIMALS[y % 12] : ''
}

export default function DeskERPView({
  externalMembers = [],
  externalPrayers = [],
  onOpenSasiPrint,
  onOpenIndeungPrint,
  onSwitchToSeatMap,
  showToast = () => {},
}) {
  // 로컬 신도 데이터셋 (두손모아 2,409명 호환 시드 + 로컬스토리지 보존)
  const [memberList, setMemberList] = useState(() => {
    try {
      const saved = localStorage.getItem('sowonsa_desk_members_v1')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return SOWONSA_INITIAL_MEMBERS
  })

  // 로컬스토리지 자동 저장
  const saveMemberList = (newList) => {
    setMemberList(newList)
    try {
      localStorage.setItem('sowonsa_desk_members_v1', JSON.stringify(newList))
    } catch (e) {}
  }

  // 검색 & 필터 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [mailFilter, setMailFilter] = useState('all') // 'all', 'yes', 'no'
  const [smsFilter, setSmsFilter] = useState('all') // 'all', 'yes', 'no'
  const [believerFilter, setBelieverFilter] = useState('all') // 'all', 'believer', 'non'
  const [younggaFilter, setYounggaFilter] = useState('all') // 'all', 'has', 'none'
  const [hwajuFilter, setHwajuFilter] = useState('all')
  const [listMode, setListMode] = useState('daeju') // 'daeju' (가구 단위) | 'family' (가족 개인 단위)
  const [samjaeOnly, setSamjaeOnly] = useState(false) // 올해 삼재 대상자만
  const samjaeYear = new Date().getFullYear()

  // 현재 선택된 신도 (Active Member)
  const [selectedMemberCode, setSelectedMemberCode] = useState(() => {
    return memberList[0]?.code || '소원-2054-0'
  })

  // 하단 동참 탭
  const [bottomTab, setBottomTab] = useState('prayers') // 'prayers' (동참내역) | 'settlement' (동참세입)

  // 모달 상태들
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false)
  const [showAddYounggaModal, setShowAddYounggaModal] = useState(false)
  const [showAddPrayerModal, setShowAddPrayerModal] = useState(false)
  const [showCheonhonModal, setShowCheonhonModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedPrayerForReceipt, setSelectedPrayerForReceipt] = useState(null)
  const [showDonationCertModal, setShowDonationCertModal] = useState(false)
  const [donationYear, setDonationYear] = useState(String(new Date().getFullYear()))
  const [donationJumin, setDonationJumin] = useState('')
  const [showMailLabelModal, setShowMailLabelModal] = useState(false)
  const [showSmsModal, setShowSmsModal] = useState(false)
  const [smsTargetMode, setSmsTargetMode] = useState('filtered') // 'selected' | 'filtered'
  const [smsText, setSmsText] = useState('[대한불교 본원종 제주 소원사] 부처님의 자비광명이 가정에 늘 함께하시기를 축원드립니다.')

  // 인쇄 모달이 열려 있을 때 body.print-desk-modal-open 클래스를 자동 부착하여 백지 현상 방지
  useEffect(() => {
    const anyPrintModal = showCheonhonModal || showReceiptModal || showDonationCertModal || showMailLabelModal
    if (anyPrintModal) {
      document.body.classList.add('print-desk-modal-open')
    } else {
      document.body.classList.remove('print-desk-modal-open')
    }
    return () => document.body.classList.remove('print-desk-modal-open')
  }, [showCheonhonModal, showReceiptModal, showDonationCertModal, showMailLabelModal])

  // 4번(신규등록)·5번(엑셀등록)·클라우드 DB의 신도를 데스크 명부에 자동 병합
  useEffect(() => {
    if (!Array.isArray(externalMembers) || externalMembers.length === 0) return
    setMemberList((prev) => {
      const existingCodes = new Set(prev.map((m) => m.code))
      const existingNamesPhones = new Set(prev.map((m) => `${m.name}|${m.phone || ''}`))
      const added = []
      externalMembers.forEach((em) => {
        if (!em || !em.code || existingCodes.has(em.code)) return
        if (existingNamesPhones.has(`${em.name}|${em.phone || ''}`)) return
        const { ganji, animal } = computeZodiacAndGanji(em.birth_date || em.birth_year || '')
        const birthYear = String(em.birth_date || em.birth_year || '').slice(0, 4)
        const famFromJson = Array.isArray(em.family_members) ? em.family_members : []
        const families = [
          {
            id: `f-${em.code}-0`,
            relation: '대주',
            name: em.name,
            dharma_name: em.dharma_name || '',
            birth_year: birthYear,
            lunar_solar: em.lunar_solar || '음력',
            ganji,
            zodiac: animal ? `${animal}띠` : '',
            phone: em.phone || '',
          },
          ...famFromJson.map((f, idx) => {
            const fy = String(f.birth_date || f.birth_year || '').slice(0, 4)
            const fg = computeZodiacAndGanji(fy)
            return {
              id: `f-${em.code}-${idx + 1}`,
              relation: f.relation || '가족',
              name: f.name || '',
              dharma_name: f.dharma_name || '',
              birth_year: fy,
              lunar_solar: f.lunar_solar || '음력',
              ganji: fg.ganji,
              zodiac: fg.animal ? `${fg.animal}띠` : '',
              phone: f.phone || '',
            }
          }),
        ]
        const matchedPrayers = (externalPrayers || [])
          .filter((p) => p.member_code === em.code || p.believer_name === em.name)
          .map((p, idx) => ({
            id: p.id || `pr-${em.code}-${idx}`,
            year: String(p.created_at || new Date().getFullYear()).slice(0, 4),
            category: p.wish_category || '대웅전 축원',
            title: p.wish_title || p.wish_category || '기도 접수',
            applied_at: String(p.created_at || new Date().toISOString()).slice(0, 10),
            live_count: families.length,
            youngga_count: 0,
            amount: Number(p.amount || 100000),
            paid_amount: Number(p.amount || 100000),
            unpaid_amount: 0,
          }))
        added.push({
          code: em.code,
          name: em.name,
          dharma_name: em.dharma_name || '',
          phone: em.phone || '',
          address: em.address || '제주특별자치도',
          mail_receive: true,
          sms_receive: true,
          is_believer: true,
          hwaju: em.recommender_name || '종무소',
          registered_at: String(em.created_at || new Date().toISOString()).slice(0, 10),
          families,
          younggas: [],
          prayers: matchedPrayers,
        })
      })
      if (added.length === 0) return prev
      const merged = [...prev, ...added]
      try { localStorage.setItem('sowonsa_desk_members_v1', JSON.stringify(merged)) } catch (e) {}
      return merged
    })
  }, [externalMembers, externalPrayers])

  // 가족 추가 폼
  const [famRelation, setFamRelation] = useState('자')
  const [famName, setFamName] = useState('')
  const [famDharma, setFamDharma] = useState('')
  const [famBirthYear, setFamBirthYear] = useState('1990')
  const [famLunarSolar, setFamLunarSolar] = useState('음력')
  const [famPhone, setFamPhone] = useState('')
  const [famMemo, setFamMemo] = useState('')

  // 영가 추가 폼
  const [ygPokwi, setYgPokwi] = useState('')
  const [ygRelation, setYgRelation] = useState('선망부')
  const [ygBonkwan, setYgBonkwan] = useState('김해김씨')
  const [ygName, setYgName] = useState('')
  const [ygDharma, setYgDharma] = useState('')
  const [ygType, setYgType] = useState('영구위패')
  const [ygDeathDate, setYgDeathDate] = useState('')
  const [ygMemo, setYgMemo] = useState('')

  // 기도 동참 추가 폼
  const [prCategory, setPrCategory] = useState('대웅전 1년 인등(가족등)')
  const [prYear, setPrYear] = useState('2026')
  const [prAmount, setPrAmount] = useState(100000)
  const [prPaidAmount, setPrPaidAmount] = useState(100000)
  const [prLiveCount, setPrLiveCount] = useState(1)
  const [prYounggaCount, setPrYounggaCount] = useState(0)

  // 현재 선택된 신도 객체
  const selectedMember = useMemo(() => {
    return memberList.find((m) => m.code === selectedMemberCode) || memberList[0] || null
  }, [memberList, selectedMemberCode])

  // 신도 필터링 계산
  const filteredMembers = useMemo(() => {
    return memberList.filter((m) => {
      // 1. 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const codeMatch = m.code.toLowerCase().includes(q)
        const nameMatch = m.name.toLowerCase().includes(q)
        const dharmaMatch = (m.dharma_name || '').toLowerCase().includes(q)
        const phoneMatch = (m.phone || '').includes(q)
        const addrMatch = (m.address || '').toLowerCase().includes(q)
        const hwajuMatch = (m.hwaju || '').toLowerCase().includes(q)

        // 가족 이름 검색
        const familyMatch = (m.families || []).some(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            (f.dharma_name && f.dharma_name.toLowerCase().includes(q))
        )
        // 영가 이름 검색
        const younggaMatch = (m.younggas || []).some(
          (y) =>
            y.name.toLowerCase().includes(q) ||
            (y.dharma_name && y.dharma_name.toLowerCase().includes(q))
        )

        if (
          !codeMatch &&
          !nameMatch &&
          !dharmaMatch &&
          !phoneMatch &&
          !addrMatch &&
          !hwajuMatch &&
          !familyMatch &&
          !younggaMatch
        ) {
          return false
        }
      }

      // 2. 우편 필터
      if (mailFilter === 'yes' && !m.mail_receive) return false
      if (mailFilter === 'no' && m.mail_receive) return false

      // 3. 문자 필터
      if (smsFilter === 'yes' && !m.sms_receive) return false
      if (smsFilter === 'no' && m.sms_receive) return false

      // 4. 신도 구분
      if (believerFilter === 'believer' && !m.is_believer) return false
      if (believerFilter === 'non' && m.is_believer) return false

      // 5. 영가 유무
      if (younggaFilter === 'has' && (!m.younggas || m.younggas.length === 0)) return false
      if (younggaFilter === 'none' && m.younggas && m.younggas.length > 0) return false

      // 6. 화주 필터
      if (hwajuFilter !== 'all' && m.hwaju !== hwajuFilter) return false

      return true
    })
  }, [
    memberList,
    searchQuery,
    mailFilter,
    smsFilter,
    believerFilter,
    younggaFilter,
    hwajuFilter,
  ])

  // 가구 단위 목록 (삼재 필터: 가족 중 1명이라도 올해 삼재면 표시)
  const householdsShown = useMemo(() => {
    if (!samjaeOnly) return filteredMembers
    return filteredMembers.filter((m) =>
      (m.families?.length ? m.families : [{ birth_year: m.birth_year }]).some((f) =>
        getSamjaeStage(f.birth_year, samjaeYear)
      )
    )
  }, [filteredMembers, samjaeOnly, samjaeYear])

  // 가족 개인 단위 목록 (두손모아 "대상: 가족" 대응)
  const familyRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const rows = []
    filteredMembers.forEach((m) => {
      const people = m.families?.length
        ? m.families
        : [{ id: `${m.code}-self`, relation: '대주', name: m.name, dharma_name: m.dharma_name, birth_year: m.birth_year, phone: m.phone }]
      const personMatches = (f) =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.dharma_name || '').toLowerCase().includes(q) ||
        (f.phone || '').includes(q)
      // 검색어가 특정 가족 이름에 맞으면 그 사람만, 주소·번호 등 가구 정보로 맞았으면 가족 전원 표시
      const anyPersonMatch = q && people.some(personMatches)
      people.forEach((f, idx) => {
        if (anyPersonMatch && !personMatches(f)) return
        const samjae = getSamjaeStage(f.birth_year, samjaeYear)
        if (samjaeOnly && !samjae) return
        rows.push({ key: `${m.code}-${f.id || idx}`, member: m, person: f, samjae })
      })
    })
    return rows
  }, [filteredMembers, searchQuery, samjaeOnly, samjaeYear])

  // 가족 추가 실행
  const handleAddFamily = () => {
    if (!famName.trim()) {
      alert('가족 성함을 입력해주세요.')
      return
    }
    const { ganji, animal } = computeZodiacAndGanji(famBirthYear)
    const newFam = {
      id: `f-${Date.now()}`,
      relation: famRelation,
      name: famName.trim(),
      dharma_name: famDharma.trim(),
      birth_year: famBirthYear,
      lunar_solar: famLunarSolar,
      ganji: ganji || '사주미상',
      zodiac: animal || '',
      phone: famPhone.trim(),
      memo: famMemo.trim(),
    }

    const updated = memberList.map((m) => {
      if (m.code === selectedMember.code) {
        return {
          ...m,
          families: [...(m.families || []), newFam],
        }
      }
      return m
    })
    saveMemberList(updated)
    setShowAddFamilyModal(false)
    setFamName('')
    setFamDharma('')
    setFamPhone('')
    setFamMemo('')
    showToast('생축 가족이 성공적으로 추가되었습니다.')
  }

  // 가족 삭제
  const handleDeleteFamily = (famId) => {
    if (!window.confirm('선택하신 가족을 삭제하시겠습니까?')) return
    const updated = memberList.map((m) => {
      if (m.code === selectedMember.code) {
        return {
          ...m,
          families: (m.families || []).filter((f) => f.id !== famId),
        }
      }
      return m
    })
    saveMemberList(updated)
    showToast('가족 정보가 삭제되었습니다.')
  }

  // 영가 추가 실행
  const handleAddYoungga = () => {
    if (!ygName.trim()) {
      alert('영가 성함을 입력해주세요.')
      return
    }
    const newYg = {
      id: `y-${Date.now()}`,
      pokwi: ygPokwi.trim() || selectedMember.name,
      relation: ygRelation,
      bonkwan: ygBonkwan.trim(),
      name: ygName.trim(),
      dharma_name: ygDharma.trim(),
      wipae_type: ygType,
      death_date: ygDeathDate || new Date().toISOString().slice(0, 10),
      memo: ygMemo.trim(),
      seat_code: ygType.includes('영구') ? '위패-지장전' : '',
    }

    const updated = memberList.map((m) => {
      if (m.code === selectedMember.code) {
        return {
          ...m,
          has_youngga: true,
          younggas: [...(m.younggas || []), newYg],
        }
      }
      return m
    })
    saveMemberList(updated)
    setShowAddYounggaModal(false)
    setYgName('')
    setYgDharma('')
    setYgMemo('')
    showToast('망축 선망조상 영가가 등록되었습니다.')
  }

  // 영가 삭제
  const handleDeleteYoungga = (ygId) => {
    if (!window.confirm('선택하신 조상 영가를 삭제하시겠습니까?')) return
    const updated = memberList.map((m) => {
      if (m.code === selectedMember.code) {
        const nextYg = (m.younggas || []).filter((y) => y.id !== ygId)
        return {
          ...m,
          has_youngga: nextYg.length > 0,
          younggas: nextYg,
        }
      }
      return m
    })
    saveMemberList(updated)
    showToast('영가 정보가 삭제되었습니다.')
  }

  // 기도 동참 추가 실행
  const handleAddPrayer = () => {
    const unpaid = Math.max(0, prAmount - prPaidAmount)
    const newPr = {
      id: `pr-${Date.now()}`,
      category: prCategory,
      year: prYear,
      applied_at: new Date().toISOString().slice(0, 10),
      live_count: prLiveCount,
      youngga_count: prYounggaCount,
      amount: prAmount,
      darani: 0,
      extra: 0,
      paid_amount: prPaidAmount,
      unpaid_amount: unpaid,
      status: unpaid === 0 ? '완납' : '미납',
      seat_code: prCategory.includes('인등') ? '대웅전-인등단' : '',
    }

    const updated = memberList.map((m) => {
      if (m.code === selectedMember.code) {
        return {
          ...m,
          prayers: [...(m.prayers || []), newPr],
        }
      }
      return m
    })
    saveMemberList(updated)
    setShowAddPrayerModal(false)
    showToast('기도 동참 접수가 완료되었습니다.')
  }

  // 원터치 입금확인 처리
  const handleTogglePayment = (prayerId) => {
    const updated = memberList.map((m) => {
      if (m.code === selectedMember.code) {
        const nextPr = (m.prayers || []).map((p) => {
          if (p.id === prayerId) {
            const isCurrentlyPaid = p.status === '완납'
            return {
              ...p,
              status: isCurrentlyPaid ? '미납' : '완납',
              paid_amount: isCurrentlyPaid ? 0 : p.amount,
              unpaid_amount: isCurrentlyPaid ? p.amount : 0,
            }
          }
          return p
        })
        return { ...m, prayers: nextPr }
      }
      return m
    })
    saveMemberList(updated)
    showToast('입금 수납 상태가 변경되었습니다.')
  }

  // 기도 삭제
  const handleDeletePrayer = (prayerId) => {
    if (!window.confirm('해당 동참 내역을 삭제하시겠습니까?')) return
    const updated = memberList.map((m) => {
      if (m.code === selectedMember.code) {
        return {
          ...m,
          prayers: (m.prayers || []).filter((p) => p.id !== prayerId),
        }
      }
      return m
    })
    saveMemberList(updated)
    showToast('기도 동참 내역이 삭제되었습니다.')
  }

  // 하단 통계 합계 계산
  const currentPrayers = selectedMember?.prayers || []
  const prayerStats = useMemo(() => {
    let totalAmt = 0
    let totalPaid = 0
    let totalUnpaid = 0
    currentPrayers.forEach((p) => {
      totalAmt += Number(p.amount || 0)
      totalPaid += Number(p.paid_amount || 0)
      totalUnpaid += Number(p.unpaid_amount || 0)
    })
    return {
      count: currentPrayers.length,
      totalAmt,
      totalPaid,
      totalUnpaid,
    }
  }, [currentPrayers])

  return (
    <div className="w-full flex flex-col gap-3 font-sans text-[#FAF8F5]">
      {/* ==================== 1. 상단 두손모아 스타일 종합 검색/필터 바 ==================== */}
      <section className="bg-[#1A1612] border-2 border-[#C59B27]/70 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
        {/* 시스템 정보 & 퀵 바 */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-[#C59B27]/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#2E2419] border border-[#C59B27] text-[#F5D061] flex items-center justify-center font-bold">
              卍
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif-kr font-bold text-sm text-[#F5D061]">
                소원사 종무행정 4분할 스마트 데스크
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/40 font-mono">
                소원사 종무원 본원
              </span>
              <span className="text-[11px] text-[#A69B8D] hidden md:inline">
                오늘: 2026-10-30 (음력 9월 20일, 丙午/戊戌/丁丑)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwitchToSeatMap}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs shadow hover:brightness-105 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-900" />
              <span>🏮 위패·인등 자리배치도 열기</span>
            </button>
            <button
              type="button"
              onClick={onOpenSasiPrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] font-bold text-xs border border-white/20 flex items-center gap-1 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#F5D061]" />
              <span>사시예불 A4</span>
            </button>
            <button
              type="button"
              onClick={onOpenIndeungPrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] font-bold text-xs border border-white/20 flex items-center gap-1 transition cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>인등명패 A4</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDonationCertModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] font-bold text-xs border border-white/20 flex items-center gap-1 transition cursor-pointer"
              title="선택한 신도의 연말정산용 기부금영수증 A4 발급"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>기부금영수증</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMailLabelModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] font-bold text-xs border border-white/20 flex items-center gap-1 transition cursor-pointer"
              title="우편 수신 동의 신도 주소 라벨지 A4 인쇄"
            >
              <Home className="w-3.5 h-3.5 text-sky-300" />
              <span>우편라벨 A4</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSmsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] font-bold text-xs border border-white/20 flex items-center gap-1 transition cursor-pointer"
              title="단체/개별 안내 문자 발송"
            >
              <Phone className="w-3.5 h-3.5 text-pink-300" />
              <span>문자발송</span>
            </button>
          </div>
        </div>

        {/* 세부 필터 & 1초 초고속 검색 바 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs items-center">
          {/* 좌측 필터 조건 그룹 (7컬럼) */}
          <div className="lg:col-span-8 flex flex-wrap items-center gap-3">
            {/* 목록 대상: 대주(가구 단위) / 가족(개인 단위) — 두손모아 신도명부관리 "대상" 대응 */}
            <div
              className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10"
              title="대주: 한 가정을 한 줄로 / 가족: 가족 한 사람을 한 줄씩"
            >
              <span className="text-[#8C8071] text-[11px]">대상:</span>
              <button
                type="button"
                onClick={() => setListMode('daeju')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  listMode === 'daeju' ? 'bg-[#C59B27] text-black' : 'text-[#A69B8D] hover:text-white'
                }`}
              >
                대주
              </button>
              <button
                type="button"
                onClick={() => setListMode('family')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  listMode === 'family' ? 'bg-[#C59B27] text-black' : 'text-[#A69B8D] hover:text-white'
                }`}
              >
                가족
              </button>
            </div>

            {/* 삼재 대상자 조회 */}
            <div
              className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10"
              title={`${samjaeYear}년 삼재(들·눌·날삼재)에 해당하는 사람만 표시`}
            >
              <span className="text-[#8C8071] text-[11px]">삼재:</span>
              <button
                type="button"
                onClick={() => setSamjaeOnly(!samjaeOnly)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                  samjaeOnly ? 'bg-rose-600 text-white' : 'text-[#A69B8D] hover:text-white'
                }`}
              >
                {samjaeYear}년 대상자
              </button>
            </div>

            {/* 우편발송 */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[#8C8071] text-[11px]">우편:</span>
              <button
                type="button"
                onClick={() => setMailFilter(mailFilter === 'yes' ? 'all' : 'yes')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  mailFilter === 'yes' ? 'bg-emerald-600 text-white' : 'text-[#A69B8D]'
                }`}
              >
                발송
              </button>
            </div>

            {/* 문자전송 */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[#8C8071] text-[11px]">문자:</span>
              <button
                type="button"
                onClick={() => setSmsFilter(smsFilter === 'yes' ? 'all' : 'yes')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  smsFilter === 'yes' ? 'bg-blue-600 text-white' : 'text-[#A69B8D]'
                }`}
              >
                수신
              </button>
            </div>

            {/* 신도 구분 */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[#8C8071] text-[11px]">신도:</span>
              <button
                type="button"
                onClick={() => setBelieverFilter(believerFilter === 'believer' ? 'all' : 'believer')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  believerFilter === 'believer' ? 'bg-amber-600 text-white' : 'text-[#A69B8D]'
                }`}
              >
                신도만
              </button>
            </div>

            {/* 영가 유무 */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[#8C8071] text-[11px]">영가:</span>
              <button
                type="button"
                onClick={() => setYounggaFilter(younggaFilter === 'has' ? 'all' : 'has')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                  younggaFilter === 'has' ? 'bg-purple-600 text-white' : 'text-[#A69B8D]'
                }`}
              >
                영가보유
              </button>
            </div>

            {/* 화주 필터 */}
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
              <span className="text-[#8C8071] text-[11px]">화주:</span>
              <select
                value={hwajuFilter}
                onChange={(e) => setHwajuFilter(e.target.value)}
                className="bg-transparent text-[#F5D061] text-[11px] font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#1A1612]">전체 화주</option>
                {SOWONSA_HWAJU_LIST.map((h) => (
                  <option key={h} value={h} className="bg-[#1A1612] text-white">
                    {h}
                  </option>
                ))}
              </select>
            </div>

            {/* 전체 보기: 모든 필터 + 검색어 한 번에 초기화 */}
            {(() => {
              const anyFilterOn =
                mailFilter !== 'all' ||
                smsFilter !== 'all' ||
                believerFilter !== 'all' ||
                younggaFilter !== 'all' ||
                hwajuFilter !== 'all' ||
                samjaeOnly ||
                listMode !== 'daeju' ||
                searchQuery.trim() !== ''
              return (
                <button
                  type="button"
                  disabled={!anyFilterOn}
                  onClick={() => {
                    setMailFilter('all')
                    setSmsFilter('all')
                    setBelieverFilter('all')
                    setYounggaFilter('all')
                    setHwajuFilter('all')
                    setSamjaeOnly(false)
                    setListMode('daeju')
                    setSearchQuery('')
                  }}
                  title="켜진 필터와 검색어를 모두 지우고 전체 신도를 봅니다"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition ${
                    anyFilterOn
                      ? 'bg-[#C59B27] text-black border-[#F5D061] hover:brightness-110 cursor-pointer'
                      : 'bg-black/40 text-[#6B6257] border-white/10 cursor-default'
                  }`}
                >
                  <X className="w-3 h-3" />
                  <span>전체 보기</span>
                </button>
              )
            })()}
          </div>

          {/* 우측 검색 인풋 (5컬럼) */}
          <div className="lg:col-span-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="신도번호, 성명, 불명, 전화, 주소, 가족명..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/60 border border-[#C59B27]/60 text-xs font-bold text-white placeholder-[#8C8071] focus:outline-none focus:border-[#F5D061]"
            />
            <Search className="w-4 h-4 text-[#C59B27] absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-[#8C8071] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ==================== 2. 두손모아 4분할 메인 그리드 레이아웃 ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* -------------------- [좌측 상단: 신도 목록 교적부 Grid] (6컬럼) -------------------- */}
        <section className="lg:col-span-6 bg-[#1A1612] border border-[#C59B27]/40 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[460px]">
          {/* 헤더 바 */}
          <div className="bg-[#241D17] px-3.5 py-2.5 border-b border-[#C59B27]/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-serif-kr font-bold text-xs text-[#F5D061]">
                §. 신도명부 대장 {listMode === 'family'
                  ? `(가족 ${familyRows.length}명 · ${new Set(familyRows.map((r) => r.member.code)).size}가구)`
                  : `(${householdsShown.length} / 총 ${memberList.length}가구)`}
                {samjaeOnly && <span className="ml-1.5 text-rose-400">· {samjaeYear}년 삼재</span>}
              </span>
              <span className="text-[10px] text-[#8C8071] hidden sm:inline">
                (원하는 행 클릭 시 가족/영가/동참 즉시 동기화)
              </span>
            </div>
            <div className="text-[11px] text-[#A69B8D] font-mono">
              선택: <strong className="text-white">{selectedMember?.name || '-'}</strong>
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto flex-1 max-h-[410px] overflow-y-auto">
            {listMode === 'family' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#29211A] text-[#C5BBAF] text-[11px] font-bold border-b border-[#C59B27]/30 z-10 shadow-sm">
                  <tr>
                    <th className="p-2 whitespace-nowrap">신도번호</th>
                    <th className="p-2 whitespace-nowrap">대주명</th>
                    <th className="p-2 whitespace-nowrap">관계</th>
                    <th className="p-2 whitespace-nowrap">성명</th>
                    <th className="p-2 whitespace-nowrap">생년</th>
                    <th className="p-2 whitespace-nowrap">띠</th>
                    <th className="p-2 whitespace-nowrap text-center">삼재</th>
                    <th className="p-2 whitespace-nowrap">휴대폰</th>
                    <th className="p-2 whitespace-nowrap">화주</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {familyRows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-[#8C8071]">
                        조건에 맞는 가족이 없습니다.
                      </td>
                    </tr>
                  )}
                  {familyRows.map(({ key, member: m, person: f, samjae }) => {
                    const isSelected = m.code === selectedMember?.code
                    return (
                      <tr
                        key={key}
                        onClick={() => setSelectedMemberCode(m.code)}
                        className={`cursor-pointer transition select-none ${
                          isSelected
                            ? 'bg-[#3A2D1F] text-white font-bold border-l-4 border-l-[#F5D061]'
                            : 'hover:bg-white/5 text-[#D6CEC2]'
                        }`}
                      >
                        <td className="p-2 font-mono text-[11px] whitespace-nowrap text-[#F5D061]">{m.code}</td>
                        <td className="p-2 whitespace-nowrap text-[#A69B8D]">{m.name}</td>
                        <td className="p-2 whitespace-nowrap text-[11px]">{f.relation || '-'}</td>
                        <td className="p-2 font-bold whitespace-nowrap text-white">
                          {f.name}
                          {f.dharma_name && (
                            <span className="text-[10px] text-[#A69B8D] font-normal ml-1">({f.dharma_name})</span>
                          )}
                        </td>
                        <td className="p-2 font-mono text-[11px] whitespace-nowrap">{f.birth_year || '-'}</td>
                        <td className="p-2 text-[11px] whitespace-nowrap">{getAnimal(f.birth_year) || '-'}</td>
                        <td className="p-2 text-center whitespace-nowrap">
                          {samjae ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-600/80 text-white text-[10px] font-bold">{samjae}</span>
                          ) : (
                            <span className="text-[#8C8071] text-[10px]">-</span>
                          )}
                        </td>
                        <td className="p-2 font-mono text-[11px] whitespace-nowrap">{f.phone || m.phone || '-'}</td>
                        <td className="p-2 text-[10px] text-[#F5D061]/80 truncate max-w-[80px]">{m.hwaju || '종무소'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-[#29211A] text-[#C5BBAF] text-[11px] font-bold border-b border-[#C59B27]/30 z-10 shadow-sm">
                <tr>
                  <th className="p-2 whitespace-nowrap">신도번호</th>
                  <th className="p-2 whitespace-nowrap text-center">우편</th>
                  <th className="p-2 whitespace-nowrap text-center">문자</th>
                  <th className="p-2 whitespace-nowrap">대주명</th>
                  <th className="p-2 whitespace-nowrap">휴대폰</th>
                  <th className="p-2 whitespace-nowrap text-center">가족</th>
                  <th className="p-2 whitespace-nowrap text-center">영가</th>
                  <th className="p-2 whitespace-nowrap">주소</th>
                  <th className="p-2 whitespace-nowrap">화주</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {householdsShown.map((m) => {
                  const isSelected = m.code === selectedMember?.code
                  const famCount = m.families?.length || 1
                  const ygCount = m.younggas?.length || 0

                  return (
                    <tr
                      key={m.code}
                      onClick={() => setSelectedMemberCode(m.code)}
                      className={`cursor-pointer transition select-none ${
                        isSelected
                          ? 'bg-[#3A2D1F] text-white font-bold border-l-4 border-l-[#F5D061]'
                          : 'hover:bg-white/5 text-[#D6CEC2]'
                      }`}
                    >
                      <td className="p-2 font-mono text-[11px] whitespace-nowrap text-[#F5D061]">
                        {m.code}
                      </td>
                      <td className="p-2 text-center text-[10px]">
                        {m.mail_receive ? (
                          <span className="text-emerald-400 font-bold">☑</span>
                        ) : (
                          <span className="text-[#8C8071]">☐</span>
                        )}
                      </td>
                      <td className="p-2 text-center text-[10px]">
                        {m.sms_receive ? (
                          <span className="text-blue-400 font-bold">☑</span>
                        ) : (
                          <span className="text-[#8C8071]">☐</span>
                        )}
                      </td>
                      <td className="p-2 font-bold whitespace-nowrap text-white">
                        {m.name}
                        {m.dharma_name && (
                          <span className="text-[10px] text-[#A69B8D] font-normal ml-1">
                            ({m.dharma_name})
                          </span>
                        )}
                      </td>
                      <td className="p-2 font-mono text-[11px] whitespace-nowrap">
                        {m.phone || '-'}
                      </td>
                      <td className="p-2 text-center font-bold font-mono text-[11px]">
                        {famCount}
                      </td>
                      <td className="p-2 text-center font-mono text-[11px]">
                        {ygCount > 0 ? (
                          <span className="text-purple-300 font-bold">{ygCount}</span>
                        ) : (
                          <span className="text-[#8C8071]">0</span>
                        )}
                      </td>
                      <td className="p-2 text-[11px] truncate max-w-[130px]" title={m.address}>
                        {m.address || '-'}
                      </td>
                      <td className="p-2 text-[10px] text-[#F5D061]/80 truncate max-w-[80px]">
                        {m.hwaju || '종무소'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            )}
          </div>

          {/* 테이블 하단 상태줄 */}
          <div className="bg-[#1F1813] px-3.5 py-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8C8071]">
            <span>표시: {listMode === 'family' ? `${familyRows.length}명` : `${householdsShown.length}가구`}</span>
            <span>소원사 종무원 공식 신적부</span>
          </div>
        </section>

        {/* -------------------- [우측 영역: 생축 가족사주 & 망축 영가] (6컬럼) -------------------- */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          {/* 1) [우측 상단: 생축 가족 사주 만세력 명부] */}
          <section className="bg-[#1A1612] border border-[#C59B27]/40 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[225px]">
            <div className="bg-[#241D17] px-3.5 py-2 border-b border-[#C59B27]/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-serif-kr font-bold text-xs text-[#F5D061]">
                  §. 생축 가족 사주 명부 ({selectedMember?.name} 님 세대)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddFamilyModal(true)}
                className="px-2.5 py-1 rounded-lg bg-[#C59B27] hover:bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>가족 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[180px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#29211A] text-[#C5BBAF] text-[10px] font-bold border-b border-white/10 z-10">
                  <tr>
                    <th className="p-1.5 whitespace-nowrap">관계</th>
                    <th className="p-1.5 whitespace-nowrap">생갑(사주)</th>
                    <th className="p-1.5 whitespace-nowrap">성명</th>
                    <th className="p-1.5 whitespace-nowrap">불명</th>
                    <th className="p-1.5 whitespace-nowrap">생년</th>
                    <th className="p-1.5 whitespace-nowrap">띠</th>
                    <th className="p-1.5 whitespace-nowrap">휴대폰</th>
                    <th className="p-1.5 whitespace-nowrap text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {(selectedMember?.families || []).map((fam, idx) => (
                    <tr key={fam.id || idx} className="hover:bg-white/5">
                      <td className="p-1.5 font-bold text-amber-400 whitespace-nowrap">
                        {fam.relation || '세주'}
                      </td>
                      <td className="p-1.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-[#2D241C] text-[#F5D061] border border-[#C59B27]/40 text-[10px] font-bold">
                          {fam.ganji || '갑진생'}
                        </span>
                      </td>
                      <td className="p-1.5 font-bold text-white whitespace-nowrap">
                        {fam.name}
                      </td>
                      <td className="p-1.5 text-[#C5BBAF] whitespace-nowrap">
                        {fam.dharma_name || '-'}
                      </td>
                      <td className="p-1.5 font-mono text-[#8C8071] whitespace-nowrap">
                        {fam.birth_year || '-'}
                      </td>
                      <td className="p-1.5 text-[10px] text-emerald-400 whitespace-nowrap">
                        {fam.zodiac || '-'}
                      </td>
                      <td className="p-1.5 font-mono text-[10px] whitespace-nowrap">
                        {fam.phone || '-'}
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteFamily(fam.id)}
                          className="p-1 text-red-400/80 hover:text-red-300 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!selectedMember?.families || selectedMember.families.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-xs text-[#8C8071]">
                        등록된 가족이 없습니다. 우측 상단 [가족 추가]를 눌러주세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 2) [우측 중단: 망축 선망 조상 영가 명부] */}
          <section className="bg-[#1A1612] border border-[#C59B27]/40 rounded-2xl flex flex-col shadow-xl overflow-hidden min-h-[225px]">
            <div className="bg-[#241D17] px-3.5 py-2 border-b border-[#C59B27]/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-serif-kr font-bold text-xs text-[#F5D061]">
                  §. 망축 선망 조상 영가정보 ({selectedMember?.younggas?.length || 0}위)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCheonhonModal(true)}
                  className="px-2 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>천혼문 생성</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setYgPokwi(selectedMember?.name || '')
                    setShowAddYounggaModal(true)
                  }}
                  className="px-2 py-1 rounded-lg bg-[#C59B27] hover:bg-[#D4AF37] text-black font-extrabold text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>영가 추가</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[180px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#29211A] text-[#C5BBAF] text-[10px] font-bold border-b border-white/10 z-10">
                  <tr>
                    <th className="p-1.5 whitespace-nowrap">복위자</th>
                    <th className="p-1.5 whitespace-nowrap">관계</th>
                    <th className="p-1.5 whitespace-nowrap">본관</th>
                    <th className="p-1.5 whitespace-nowrap">영가명</th>
                    <th className="p-1.5 whitespace-nowrap">법명</th>
                    <th className="p-1.5 whitespace-nowrap">위패종류</th>
                    <th className="p-1.5 whitespace-nowrap">제사일(기일)</th>
                    <th className="p-1.5 whitespace-nowrap text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {(selectedMember?.younggas || []).map((yg, idx) => (
                    <tr key={yg.id || idx} className="hover:bg-white/5">
                      <td className="p-1.5 text-[#F5D061] whitespace-nowrap">
                        {yg.pokwi || selectedMember.name}
                      </td>
                      <td className="p-1.5 font-bold text-amber-300 whitespace-nowrap">
                        {yg.relation || '선망부모'}
                      </td>
                      <td className="p-1.5 text-[#C5BBAF] whitespace-nowrap">
                        {yg.bonkwan || '-'}
                      </td>
                      <td className="p-1.5 font-bold text-white whitespace-nowrap">
                        {yg.name}
                      </td>
                      <td className="p-1.5 text-[#8C8071] whitespace-nowrap">
                        {yg.dharma_name || '-'}
                      </td>
                      <td className="p-1.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 text-[9px] font-bold">
                          {yg.wipae_type || '영구위패'}
                        </span>
                      </td>
                      <td className="p-1.5 font-mono text-[10px] text-[#8C8071] whitespace-nowrap">
                        {yg.death_date || '-'}
                      </td>
                      <td className="p-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteYoungga(yg.id)}
                          className="p-1 text-red-400/80 hover:text-red-300 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!selectedMember?.younggas || selectedMember.younggas.length === 0) && (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-xs text-[#8C8071]">
                        등록된 영가가 없습니다. 우측 상단 [영가 추가]를 눌러 봉안하세요.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* ==================== 3. 하단 동참내역 & 동참세입 (수납 관제) ==================== */}
      <section className="bg-[#1A1612] border-2 border-[#C59B27]/70 rounded-2xl flex flex-col shadow-2xl overflow-hidden mt-1">
        {/* 상단 탭 & 액션 바 */}
        <div className="bg-[#241D17] px-4 py-2.5 border-b border-[#C59B27]/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBottomTab('prayers')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                bottomTab === 'prayers'
                  ? 'bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-black shadow'
                  : 'text-[#A69B8D] hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-800" />
              <span>§. 동참내역 ({currentPrayers.length}건)</span>
            </button>
            <button
              type="button"
              onClick={() => setBottomTab('settlement')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                bottomTab === 'settlement'
                  ? 'bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-black shadow'
                  : 'text-[#A69B8D] hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-800" />
              <span>§. 동참세입 수납관제</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddPrayerModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#C59B27] hover:bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>기도·불사 접수</span>
            </button>
          </div>
        </div>

        {/* 동참 그리드 테이블 */}
        <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#29211A] text-[#C5BBAF] text-[11px] font-bold border-b border-white/10 z-10 shadow-sm">
              <tr>
                <th className="p-2 whitespace-nowrap">분류</th>
                <th className="p-2 whitespace-nowrap">년도</th>
                <th className="p-2 whitespace-nowrap">기도종목</th>
                <th className="p-2 whitespace-nowrap">접수일자</th>
                <th className="p-2 whitespace-nowrap text-center">생축</th>
                <th className="p-2 whitespace-nowrap text-center">망축</th>
                <th className="p-2 whitespace-nowrap text-right">동참금</th>
                <th className="p-2 whitespace-nowrap text-right">입금액</th>
                <th className="p-2 whitespace-nowrap text-right">미납금</th>
                <th className="p-2 whitespace-nowrap text-center">수납상태</th>
                <th className="p-2 whitespace-nowrap text-center">관리·영수증</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px]">
              {currentPrayers.map((pr) => {
                const isPaid = pr.status === '완납'

                return (
                  <tr key={pr.id} className="hover:bg-white/5">
                    <td className="p-2 font-bold text-amber-400 whitespace-nowrap">
                      {pr.category.includes('인등') ? '인등' : pr.category.includes('위패') ? '위패' : '연등'}
                    </td>
                    <td className="p-2 font-mono text-[#A69B8D] whitespace-nowrap">
                      {pr.year || '2026'}
                    </td>
                    <td className="p-2 font-bold text-white whitespace-nowrap">
                      {pr.category}
                      {pr.seat_code && (
                        <span className="text-[10px] text-[#F5D061] ml-1 font-mono">
                          [{pr.seat_code}]
                        </span>
                      )}
                    </td>
                    <td className="p-2 font-mono text-[#8C8071] whitespace-nowrap">
                      {pr.applied_at || '2026-04-23'}
                    </td>
                    <td className="p-2 text-center font-mono">{pr.live_count || 1}</td>
                    <td className="p-2 text-center font-mono">{pr.youngga_count || 0}</td>
                    <td className="p-2 text-right font-mono font-bold text-white">
                      {Number(pr.amount || 0).toLocaleString()}원
                    </td>
                    <td className="p-2 text-right font-mono text-emerald-400 font-bold">
                      {Number(pr.paid_amount || 0).toLocaleString()}원
                    </td>
                    <td className="p-2 text-right font-mono text-red-400 font-bold">
                      {Number(pr.unpaid_amount || 0).toLocaleString()}원
                    </td>
                    <td className="p-2 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePayment(pr.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          isPaid
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                            : 'bg-red-950 text-red-300 border border-red-500/50 hover:bg-red-900'
                        }`}
                      >
                        {isPaid ? '완납 ✓' : '미납 (입금확인)'}
                      </button>
                    </td>
                    <td className="p-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPrayerForReceipt(pr)
                            setShowReceiptModal(true)
                          }}
                          className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#D6CEC2] text-[10px] font-bold transition cursor-pointer"
                        >
                          영수증
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePrayer(pr.id)}
                          className="p-1 text-red-400/80 hover:text-red-300 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {currentPrayers.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-5 text-center text-xs text-[#8C8071]">
                    접수된 동참 내역이 없습니다. 상단 [+ 기도·불사 접수] 버튼을 눌러 등록하세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 하단 동참 합계 바 */}
        <div className="bg-[#241D17] px-4 py-2 border-t border-[#C59B27]/40 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[#8C8071]">
              동참건수: <strong className="text-white">{prayerStats.count}건</strong>
            </span>
            <span className="text-[#8C8071]">
              동참금 합계:{' '}
              <strong className="text-white">
                {prayerStats.totalAmt.toLocaleString()}원
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-bold">
              입금완료:{' '}
              <strong className="text-emerald-300">
                {prayerStats.totalPaid.toLocaleString()}원
              </strong>
            </span>
            {prayerStats.totalUnpaid > 0 && (
              <span className="text-red-400 font-bold">
                미납잔액:{' '}
                <strong className="text-red-300">
                  {prayerStats.totalUnpaid.toLocaleString()}원
                </strong>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ==================== 4. 모달: 가족 추가 ==================== */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B1815] text-[#FAF8F5] rounded-3xl border-2 border-[#C59B27] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#C59B27]/40">
              <h3 className="font-serif-kr font-bold text-base text-[#F5D061]">
                생축 가족 사주 신규 등록
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFamilyModal(false)}
                className="text-[#8C8071] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#A69B8D] block mb-1">관계</label>
                  <select
                    value={famRelation}
                    onChange={(e) => setFamRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  >
                    <option value="세주">세주 (가장)</option>
                    <option value="배우자">배우자 (처)</option>
                    <option value="장남">장남</option>
                    <option value="차남">차남</option>
                    <option value="장녀">장녀</option>
                    <option value="차녀">차녀</option>
                    <option value="자부">자부 (며느리)</option>
                    <option value="사위">사위</option>
                    <option value="손자">손자</option>
                    <option value="손녀">손녀</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">성명 *</label>
                  <input
                    type="text"
                    value={famName}
                    onChange={(e) => setFamName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[#A69B8D] block mb-1">법명 (불명)</label>
                  <input
                    type="text"
                    value={famDharma}
                    onChange={(e) => setFamDharma(e.target.value)}
                    placeholder="보현심"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">태어난 년도</label>
                  <input
                    type="number"
                    value={famBirthYear}
                    onChange={(e) => setFamBirthYear(e.target.value)}
                    placeholder="1988"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">음/양</label>
                  <select
                    value={famLunarSolar}
                    onChange={(e) => setFamLunarSolar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  >
                    <option value="음력">음력</option>
                    <option value="양력">양력</option>
                  </select>
                </div>
              </div>

              {famBirthYear && (
                <div className="p-2.5 rounded-xl bg-[#2D241C] border border-[#C59B27]/40 flex items-center justify-between text-xs">
                  <span className="text-[#A69B8D]">실시간 산출 사주간지:</span>
                  <span className="font-bold text-[#F5D061]">
                    {computeZodiacAndGanji(famBirthYear).label || '사주미상'}
                  </span>
                </div>
              )}

              <div>
                <label className="text-[#A69B8D] block mb-1">휴대폰</label>
                <input
                  type="tel"
                  value={famPhone}
                  onChange={(e) => setFamPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[#A69B8D] block mb-1">개인 발원 메모</label>
                <input
                  type="text"
                  value={famMemo}
                  onChange={(e) => setFamMemo(e.target.value)}
                  placeholder="예: 시험합격, 사업번창, 건강기원"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddFamilyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#D6CEC2]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddFamily}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-black font-extrabold text-xs shadow hover:brightness-105"
              >
                가족 등록 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. 모달: 영가 추가 ==================== */}
      {showAddYounggaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B1815] text-[#FAF8F5] rounded-3xl border-2 border-purple-500 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/40">
              <h3 className="font-serif-kr font-bold text-base text-purple-300">
                망축 선망 조상 영가 등록
              </h3>
              <button
                type="button"
                onClick={() => setShowAddYounggaModal(false)}
                className="text-[#8C8071] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#A69B8D] block mb-1">복위자 (행효)</label>
                  <input
                    type="text"
                    value={ygPokwi}
                    onChange={(e) => setYgPokwi(e.target.value)}
                    placeholder="신도명"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">관계</label>
                  <select
                    value={ygRelation}
                    onChange={(e) => setYgRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  >
                    <option value="선망부">선망부 (부친)</option>
                    <option value="선망모">선망모 (모친)</option>
                    <option value="시부">시부 (시아버지)</option>
                    <option value="시모">시모 (시어머니)</option>
                    <option value="조부">조부 (할아버지)</option>
                    <option value="조모">조모 (할머니)</option>
                    <option value="백부">백부</option>
                    <option value="숙부">숙부</option>
                    <option value="인연영가">인연영가</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#A69B8D] block mb-1">본관</label>
                  <input
                    type="text"
                    value={ygBonkwan}
                    onChange={(e) => setYgBonkwan(e.target.value)}
                    placeholder="김해김씨, 진주강씨"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">영가 성함 *</label>
                  <input
                    type="text"
                    value={ygName}
                    onChange={(e) => setYgName(e.target.value)}
                    placeholder="영가명"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#A69B8D] block mb-1">위패 종류</label>
                  <select
                    value={ygType}
                    onChange={(e) => setYgType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                  >
                    <option value="지장전 영구황금위패">지장전 영구황금위패</option>
                    <option value="선망조상 일반위패">선망조상 일반위패</option>
                    <option value="49재 천도위패">49재 천도위패</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">제사일 (기일)</label>
                  <input
                    type="date"
                    value={ygDeathDate}
                    onChange={(e) => setYgDeathDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#A69B8D] block mb-1">축원 비고</label>
                <input
                  type="text"
                  value={ygMemo}
                  onChange={(e) => setYgMemo(e.target.value)}
                  placeholder="극락왕생 발원"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddYounggaModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#D6CEC2]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddYoungga}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs shadow hover:brightness-105"
              >
                영가 등록 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. 모달: 기도·불사 접수 ==================== */}
      {showAddPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1B1815] text-[#FAF8F5] rounded-3xl border-2 border-[#C59B27] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#C59B27]/40">
              <h3 className="font-serif-kr font-bold text-base text-[#F5D061]">
                기도 및 불사 신규 동참 접수
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPrayerModal(false)}
                className="text-[#8C8071] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#A69B8D] block mb-1">기도 종목 선택</label>
                <select
                  value={prCategory}
                  onChange={(e) => {
                    const cat = e.target.value
                    setPrCategory(cat)
                    const found = PRAYER_CATEGORIES.find((p) => p.name === cat)
                    if (found) {
                      setPrAmount(found.standardAmount)
                      setPrPaidAmount(found.standardAmount)
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-bold"
                >
                  {PRAYER_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.name}>
                      {cat.name} ({cat.standardAmount.toLocaleString()}원)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#A69B8D] block mb-1">접수 년도</label>
                  <input
                    type="number"
                    value={prYear}
                    onChange={(e) => setPrYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">생축 인원</label>
                  <input
                    type="number"
                    value={prLiveCount}
                    onChange={(e) => setPrLiveCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#A69B8D] block mb-1">동참금 (표준)</label>
                  <input
                    type="number"
                    step="10000"
                    value={prAmount}
                    onChange={(e) => setPrAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[#A69B8D] block mb-1">실제 입금액</label>
                  <input
                    type="number"
                    step="10000"
                    value={prPaidAmount}
                    onChange={(e) => setPrPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddPrayerModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-[#D6CEC2]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddPrayer}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-black font-extrabold text-xs shadow hover:brightness-105"
              >
                동참 접수 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 7. 모달: 천혼문 (조상 영가 축원문) ==================== */}
      {showCheonhonModal && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#FAF8F5] text-[#231F1C] rounded-3xl border-2 border-[#C59B27] p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5C59B]">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#1B1815] text-[#F5D061] flex items-center justify-center font-bold text-sm">
                  卍
                </span>
                <div>
                  <h3 className="font-serif-kr font-bold text-lg text-[#1B1815]">
                    대웅전·지장전 조상 영가 천혼문 (薦魂文)
                  </h3>
                  <p className="text-xs text-[#7A6E5E]">
                    복위자 {selectedMember.name} 님의 선망 부모 및 일체 유연영가 극락왕생 축원문
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCheonhonModal(false)}
                className="p-1.5 text-[#7A6E5E] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-desk-sheet" className="p-5 rounded-2xl bg-white border border-[#E6DEC8] font-serif-kr text-sm leading-relaxed text-[#231F1C] space-y-3 whitespace-pre-line shadow-inner">
              <p className="text-center font-bold text-base text-[#8A6510]">
                【 濟州特別自治道 濟州市 召願寺 薦魂文 】
              </p>
              <p>
                대원본존 지장보살마하살 위신공덕으로 선망 부모 및 일체 영가들의 왕생극락을 지심 발원하옵나이다.
              </p>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D5C59B] text-xs font-mono space-y-1">
                <div>* 복위자 (행효): {selectedMember.name}</div>
                <div>* 도량주소: {selectedMember.address}</div>
                <div>
                  * 봉안 영가:{' '}
                  {(selectedMember.younggas || [])
                    .map((y) => `${y.relation} ${y.bonkwan} ${y.name} 영가`)
                    .join(', ') || '선망 부모 및 일체 유연 영가'}
                </div>
              </div>
              <p className="text-xs text-[#5C5245]">
                이 인연공덕으로 어둔 길 벗어나 아미타 부처님의 품에 안기어 연화대에서 극락왕생하시기를 부처님 전에 지극 정성으로 축원합니다.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5C59B]">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#8A6510] text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>천혼문 인쇄</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCheonhonModal(false)}
                className="px-4 py-2 rounded-xl bg-[#231F1C] text-white font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 8. 모달: 영수증 ==================== */}
      {showReceiptModal && selectedPrayerForReceipt && selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FAF8F5] text-[#231F1C] rounded-3xl border-2 border-[#C59B27] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5C59B]">
              <h3 className="font-serif-kr font-bold text-base text-[#1B1815]">
                소원사 기도·불사 보시 영수증
              </h3>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="text-[#7A6E5E] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div id="printable-desk-sheet" className="p-4 bg-white rounded-2xl border border-[#D5C59B] text-xs space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span className="text-[#7A6E5E]">신도명 / 신도번호:</span>
                <span className="font-bold text-[#1B1815]">
                  {selectedMember.name} ({selectedMember.code})
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-[#7A6E5E]">기도·불사 종목:</span>
                <span className="font-bold text-amber-700">
                  {selectedPrayerForReceipt.category}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-[#7A6E5E]">보시 금액:</span>
                <span className="font-bold font-mono text-base text-black">
                  {Number(selectedPrayerForReceipt.amount || 0).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-[#7A6E5E]">수납 일자:</span>
                <span className="font-mono">
                  {selectedPrayerForReceipt.applied_at || '2026-10-30'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A6E5E]">영수 사찰:</span>
                <span className="font-bold">대한불교 본원종 제주 소원사</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#8A6510] text-white font-extrabold text-xs shadow"
              >
                영수증 인쇄
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="py-2.5 px-4 rounded-xl bg-gray-200 text-black font-bold text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 9. 모달: 연말정산용 기부금영수증 (두손모아 기부금관리 대체) ==================== */}
      {showDonationCertModal && selectedMember && (() => {
        const yearPrayers = (selectedMember.prayers || []).filter(
          (p) => !donationYear || String(p.year || p.applied_at || '').startsWith(donationYear)
        )
        const totalDonated = yearPrayers.reduce((acc, p) => acc + Number(p.paid_amount || p.amount || 0), 0)
        const issueNo = `${donationYear}-${selectedMember.code}`
        return (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white text-[#1B1815] rounded-3xl border-2 border-[#C59B27] p-6 sm:p-8 space-y-5 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1B1815] print:hidden">
                <div>
                  <h3 className="font-serif-kr font-bold text-lg">🧾 종교단체 기부금영수증 발급 (연말정산용)</h3>
                  <p className="text-xs text-gray-600">소득세법 시행규칙 별지 제45호의2서식 호환 · 선택 신도: {selectedMember.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={donationYear}
                    onChange={(e) => setDonationYear(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                  >
                    <option value="2026">2026년 귀속</option>
                    <option value="2025">2025년 귀속</option>
                    <option value="">전체 누적</option>
                  </select>
                  <button type="button" onClick={() => setShowDonationCertModal(false)} className="text-gray-500 hover:text-black">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 인쇄 영역 */}
              <div id="printable-desk-sheet" className="border-2 border-black p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-black pb-3">
                  <span className="font-mono text-[11px]">일련번호: 제 {issueNo} 호</span>
                  <h2 className="font-serif-kr text-xl font-black tracking-widest">기 부 금 영 수 증</h2>
                  <span className="text-[11px] font-bold">종교단체 기부금 (코드 41)</span>
                </div>

                {/* 1. 기부자 */}
                <div>
                  <div className="font-bold bg-gray-100 px-2 py-1 border border-black border-b-0">1. 기부자 (신도 인적사항)</div>
                  <table className="w-full border-collapse border border-black text-xs">
                    <tbody>
                      <tr>
                        <th className="border border-black bg-gray-50 p-2 w-24">성 명</th>
                        <td className="border border-black p-2 font-bold">{selectedMember.name} {selectedMember.dharma_name ? `(${selectedMember.dharma_name})` : ''}</td>
                        <th className="border border-black bg-gray-50 p-2 w-28">주민등록번호</th>
                        <td className="border border-black p-2">
                          <input
                            type="text"
                            value={donationJumin}
                            onChange={(e) => setDonationJumin(e.target.value)}
                            placeholder="예: 650101-2****** (인쇄 전 입력)"
                            className="w-full text-xs font-mono border-b border-dashed border-gray-400 focus:outline-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <th className="border border-black bg-gray-50 p-2">주 소</th>
                        <td colSpan={3} className="border border-black p-2">{selectedMember.address || '-'} (연락처: {selectedMember.phone || '-'})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. 기부금 단체 */}
                <div>
                  <div className="font-bold bg-gray-100 px-2 py-1 border border-black border-b-0">2. 기부금 모집처 (사찰)</div>
                  <table className="w-full border-collapse border border-black text-xs">
                    <tbody>
                      <tr>
                        <th className="border border-black bg-gray-50 p-2 w-24">단 체 명</th>
                        <td className="border border-black p-2 font-bold">대한불교 본원종 제주 소원사</td>
                        <th className="border border-black bg-gray-50 p-2 w-28">고유번호</th>
                        <td className="border border-black p-2 font-mono">616-82-00000 (종교단체)</td>
                      </tr>
                      <tr>
                        <th className="border border-black bg-gray-50 p-2">소 재 지</th>
                        <td colSpan={3} className="border border-black p-2">제주특별자치도 제주시 · 대표자(주지): 성진 합장</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 3. 기부내용 */}
                <div>
                  <div className="font-bold bg-gray-100 px-2 py-1 border border-black border-b-0">3. 기부금 명세 ({donationYear || '전체'}년)</div>
                  <table className="w-full border-collapse border border-black text-xs text-center">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="border border-black p-1.5">연월일</th>
                        <th className="border border-black p-1.5">기도·불사 적요</th>
                        <th className="border border-black p-1.5">구분</th>
                        <th className="border border-black p-1.5 text-right">기부금액(원)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearPrayers.length === 0 ? (
                        <tr><td colSpan={4} className="border border-black p-3 text-gray-500">해당 연도 수납 내역이 없습니다.</td></tr>
                      ) : yearPrayers.map((p) => (
                        <tr key={p.id}>
                          <td className="border border-black p-1.5 font-mono">{p.applied_at}</td>
                          <td className="border border-black p-1.5 text-left font-bold">{p.category} ({p.title})</td>
                          <td className="border border-black p-1.5">금전(보시)</td>
                          <td className="border border-black p-1.5 text-right font-mono font-bold">{Number(p.paid_amount || p.amount || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-amber-50 font-black">
                        <td colSpan={3} className="border border-black p-2">합 계 금 액</td>
                        <td className="border border-black p-2 text-right font-mono text-sm">금 {totalDonated.toLocaleString()} 원정</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-center pt-3 space-y-2">
                  <p className="text-[11px]">위와 같이 종교단체 지정기부금(보시금)을 기부하였음을 증명합니다.</p>
                  <p className="font-mono text-xs">{new Date().toISOString().slice(0, 10)}</p>
                  <p className="font-serif-kr text-base font-black pt-1">대한불교 본원종 제주 소원사 주지 (직인)</p>
                </div>
              </div>

              <div className="flex gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#8A6510] text-white font-extrabold text-xs shadow cursor-pointer"
                >
                  🖨️ 기부금영수증 A4 인쇄
                </button>
                <button
                  type="button"
                  onClick={() => setShowDonationCertModal(false)}
                  className="py-2.5 px-5 rounded-xl bg-gray-200 text-black font-bold text-xs cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ==================== 10. 모달: 우편 발송용 주소 라벨 A4 인쇄 (두손모아 우편출력 대체) ==================== */}
      {showMailLabelModal && (() => {
        const mailTargets = householdsShown.filter((m) => m.mail_receive && m.address)
        return (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl bg-white text-[#1B1815] rounded-3xl border-2 border-[#C59B27] p-6 sm:p-8 space-y-4 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-gray-300 print:hidden">
                <div>
                  <h3 className="font-serif-kr font-bold text-lg">✉️ 우편 발송 주소 라벨 A4 일괄 인쇄 (2열 규격)</h3>
                  <p className="text-xs text-gray-600">현재 필터된 가구 중 우편 수신 동의(☑) 대상: 총 {mailTargets.length}가구</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-[#C59B27] text-black font-extrabold text-xs cursor-pointer"
                  >
                    🖨️ 라벨지 A4 인쇄
                  </button>
                  <button type="button" onClick={() => setShowMailLabelModal(false)} className="text-gray-500 hover:text-black">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div id="printable-desk-sheet" className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto print:max-h-none p-1">
                {mailTargets.map((m) => (
                  <div key={m.code} className="border border-gray-400 rounded-lg p-3.5 flex flex-col justify-between min-h-[105px] bg-white text-xs">
                    <div className="text-[11px] text-gray-700 leading-snug">{m.address}</div>
                    <div className="text-right font-serif-kr text-sm font-black mt-2">
                      {m.name} {m.dharma_name ? `(${m.dharma_name})` : ''} 귀하
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono border-t border-dashed border-gray-200 pt-1 mt-1">
                      <span>대한불교 본원종 소원사</span>
                      <span>{m.code}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ==================== 11. 모달: 단체/개별 안내 문자 발송 (두손모아 문자관리 대체) ==================== */}
      {showSmsModal && (() => {
        const smsTargets = smsTargetMode === 'selected' && selectedMember
          ? [selectedMember]
          : householdsShown.filter((m) => m.sms_receive && m.phone)
        const templates = [
          { label: '사시예불 축원', text: '[제주 소원사] 금일 오전 10시 대웅전 사시예불에 가정의 생축 발원 축원을 여법히 올렸습니다. 성불하십시오.' },
          { label: '초파일 연등 안내', text: '[제주 소원사] 부처님오신날 봉축 연등 및 가족 인등 접수 안내드립니다. 종무소로 문의 바랍니다.' },
          { label: '삼재 풀이 안내', text: `[제주 소원사] ${samjaeYear}년 삼재(돼지·토끼·양띠) 소멸 특별기도 안내드립니다. 가내 평안을 축원합니다.` },
          { label: '합동 천도재 안내', text: '[제주 소원사] 선망 조상 영가 극락왕생 합동 천도재 법회 일정을 안내드립니다.' },
        ]
        return (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-[#1F1A15] text-[#FAF8F5] rounded-3xl border-2 border-[#C59B27] p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <h3 className="font-serif-kr font-bold text-base text-[#F5D061]">💬 종무소 안내 문자 발송</h3>
                  <p className="text-[11px] text-[#A69B8D]">수신 동의 신도 단체 발송 또는 현재 선택 신도 개별 발송</p>
                </div>
                <button type="button" onClick={() => setShowSmsModal(false)} className="text-[#8C8071] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSmsTargetMode('filtered')}
                  className={`flex-1 py-2 rounded-xl font-bold border cursor-pointer ${smsTargetMode === 'filtered' ? 'bg-[#C59B27] text-black border-[#F5D061]' : 'bg-black/40 text-[#A69B8D] border-white/10'}`}
                >
                  필터된 수신동의 전체 ({householdsShown.filter((m) => m.sms_receive && m.phone).length}명)
                </button>
                <button
                  type="button"
                  onClick={() => setSmsTargetMode('selected')}
                  className={`flex-1 py-2 rounded-xl font-bold border cursor-pointer ${smsTargetMode === 'selected' ? 'bg-[#C59B27] text-black border-[#F5D061]' : 'bg-black/40 text-[#A69B8D] border-white/10'}`}
                >
                  선택 신도만 ({selectedMember?.name || '-'})
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] text-[#A69B8D]">빠른 문구 선택:</div>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setSmsText(t.text)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-[#F5D061] cursor-pointer"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={4}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-[#C59B27]/50 text-xs text-white focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`총 ${smsTargets.length}명에게 안내 문자 발송 요청이 접수되었습니다.`)
                    setShowSmsModal(false)
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs shadow cursor-pointer"
                >
                  📨 {smsTargets.length}명 문자 발송 실행
                </button>
                <button
                  type="button"
                  onClick={() => setShowSmsModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 text-white font-bold text-xs cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles,
  Phone,
  MessageSquare,
  MapPin,
  Flame,
  Award,
  Share2,
  Copy,
  Download,
  X,
} from 'lucide-react'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'

// 🪪 [소원사 모바일 전자명함 직함 산정 헬퍼]
export function getMemberCardRoleTitle(m) {
  if (!m) return '소원사 포교사'
  if (m.code === '33065540' || m.code === '55400267') return '소원사 총괄대표 / 총괄위원장 (50% 총괄판권)'
  if (m.code === '55570267') return '소원사 창건주 / 신도회장'
  if (m.role === 'master') return '소원사 총괄대표'
  if (m.role === 'temple_admin') return '소원사 본원 총괄 / 신도회장'
  if (m.role === 'committee_head') return '소원사 포교위원장'
  if (m.role === 'committee_member') return '소원사 포교사'
  if (m.role === 'agent') return '소원사 공덕 포교사'
  return '소원사 정진 불자 / 인연 추천인'
}

export default function BusinessCardModal({
  isOpen = true,
  member,
  onClose,
  onNavigateTab,
  showToast,
  isModal = true,
}) {
  const [cardQrDataUrl, setCardQrDataUrl] = useState('')
  const [isCapturingCard, setIsCapturingCard] = useState(false)
  const businessCardCaptureRef = useRef(null)

  const m = member || {
    name: '김철수',
    dharma_name: '보현행',
    code: '33065540',
    phone: '010-9103-0003',
    role: 'master',
  }

  const roleTitle = getMemberCardRoleTitle(m)
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://sowonpray.vercel.app'
  const cardShareUrl = `${origin}/?tab=card&code=${m.code}`

  // 실시간 QR코드 생성
  useEffect(() => {
    if (isOpen) {
      const refUrl = `${origin}/?ref=${m.code}`
      QRCode.toDataURL(refUrl, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#1B1815',
          light: '#FFFFFF',
        },
      })
        .then((url) => setCardQrDataUrl(url))
        .catch(() => {})
    }
  }, [isOpen, m.code, origin])

  // 카카오톡 전자명함 피드 전송 핸들러
  const handleShareBusinessCardKakao = () => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY || '6e9a618a3862f884e3eece4bb6550922'
    const altarImageUrl = 'https://sowonpray.vercel.app/images/sowonsa_altar_card.jpg?v=3'

    if (typeof window !== 'undefined' && window.Kakao) {
      try {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey)
        }
        if (window.Kakao.isInitialized() && window.Kakao.Share) {
          window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
              title: `🪪 [제주 소원사] ${m.name} ${m.dharma_name ? `(${m.dharma_name})` : ''} 모바일 전자명함`,
              description: `${roleTitle}\n"부처님의 자비광명이 온 가족과 늘 함께하시기를 지극정성으로 축원 올립니다."`,
              imageUrl: altarImageUrl,
              imageWidth: 1024,
              imageHeight: 693,
              link: {
                mobileWebUrl: cardShareUrl,
                webUrl: cardShareUrl,
              },
            },
            buttons: [
              {
                title: '🪪 전자명함 및 모바일 법당 보기',
                link: {
                  mobileWebUrl: cardShareUrl,
                  webUrl: cardShareUrl,
                },
              },
            ],
          })
          return
        }
      } catch (err) {
        console.warn('Kakao share error:', err)
      }
    }

    // fallback
    if (navigator.share) {
      navigator.share({
        title: `[제주 소원사] ${m.name} 모바일 전자명함`,
        text: `[대한불교 본원종 제주 소원사]\n${m.name} (${roleTitle}) 모바일 전자명함입니다.\n부처님의 자비광명이 함께하시기를 축원합니다.\n\n👉 전자명함 바로보기:\n${cardShareUrl}`,
      }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(cardShareUrl)
      if (showToast) showToast('📋 전자명함 링크가 복사되었습니다! 카카오톡이나 문자로 전송해 보세요.')
    }
  }

  // 전자명함 실물 이미지 갤러리 저장 핸들러
  const handleSaveBusinessCardImage = async () => {
    if (!businessCardCaptureRef.current || isCapturingCard) return
    setIsCapturingCard(true)
    try {
      const canvas = await html2canvas(businessCardCaptureRef.current, {
        scale: 2.5,
        backgroundColor: '#151311',
        useCORS: true,
        logging: false,
      })
      const fileName = `제주소원사_전자명함_${m.name}_${m.code}.png`
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = fileName
      link.click()
      if (showToast) showToast('💾 소원사 모바일 전자명함이 갤러리(사진)에 고화질로 저장되었습니다!')
    } catch (e) {
      if (showToast) showToast('명함 이미지 저장 중 오류가 발생했습니다.')
    } finally {
      setIsCapturingCard(false)
    }
  }

  const cardContent = (
    <div className="w-full max-w-[420px] mx-auto space-y-4 my-auto">
      {/* ==================== 1. 실물 캡처 영역 (명함 카드 본체) ==================== */}
      <div
        ref={businessCardCaptureRef}
        className="w-full rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#1C1814] via-[#241F1A] to-[#120F0D] text-[#FAF8F5] border-2 border-[#D4AF37] shadow-[0_12px_45px_rgba(0,0,0,0.85)] relative overflow-hidden"
      >
        {/* 상단/하단 고급 금빛 아우라 광채 */}
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-[#F5D061]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 -right-14 w-40 h-40 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        {/* 모달 닫기 버튼 */}
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer z-10"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* 사찰 공식 타이틀 헤더 */}
        <div className="text-center space-y-1 pb-3 border-b border-[#C59B27]/40 relative">
          <div className="text-[10.5px] font-serif-kr text-[#D4AF37] tracking-[0.25em] font-extrabold">
            卍 大韓佛敎 本源宗 卍
          </div>
          <h2 className="font-serif-kr text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#F5D061] to-[#C59B27] tracking-tight">
            제주 소원사 (濟州 昭願寺)
          </h2>
          <p className="text-[10px] text-[#A89D8E] font-medium tracking-wider">
            간절한 소원이 이루어지는 영험기도 성지
          </p>
        </div>

        {/* 프로필 및 직함 영역 */}
        <div className="py-4 text-center space-y-2">
          {/* 황금 연꽃 심볼 엠블럼 */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D241C] via-[#221C16] to-[#17130F] mx-auto flex items-center justify-center p-2 shadow-[0_0_20px_rgba(245,208,97,0.35)] border-2 border-[#D4AF37]">
            <Sparkles className="w-8 h-8 text-[#F5D061]" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-serif-kr text-2xl sm:text-3xl font-black text-white tracking-widest">
                {m.name}
              </span>
              {m.dharma_name && (
                <span className="font-serif-kr text-sm sm:text-base font-extrabold text-[#F5D061]">
                  ({m.dharma_name})
                </span>
              )}
            </div>
            <div className="inline-block mt-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#C59B27]/25 to-[#F5D061]/25 border border-[#F5D061]/50 text-xs font-bold text-[#FDE68A] shadow-xs">
              {roleTitle}
            </div>
          </div>
        </div>

        {/* 연락처 및 교적 정보 박스 */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-xs text-left">
          <div className="flex items-center justify-between text-[#E8DFD1]">
            <span className="text-[#A89D8E] font-medium">인연 교적코드</span>
            <strong className="font-mono text-[#F5D061] font-extrabold tracking-wider">{m.code}</strong>
          </div>
          <div className="flex items-center justify-between text-[#E8DFD1]">
            <span className="text-[#A89D8E] font-medium">직통 연락처</span>
            <strong className="font-mono font-bold text-white">{m.phone || '010-9103-0003'}</strong>
          </div>
          <div className="flex items-start justify-between text-[#E8DFD1] pt-1 border-t border-white/10 text-[11px]">
            <span className="text-[#A89D8E] font-medium shrink-0 mr-2">도량 위치</span>
            <span className="text-right text-[#DDD4C4] leading-snug">
              제주시 애월읍 유수암평화길 14-8
            </span>
          </div>
        </div>

        {/* 중앙 인연 QR코드 박스 */}
        <div className="mt-4 p-3 rounded-2xl bg-white text-[#1B1815] text-center shadow-lg border border-[#D4AF37]/50">
          {cardQrDataUrl ? (
            <img
              src={cardQrDataUrl}
              alt="소원사 인연 QR코드"
              className="w-40 h-40 mx-auto object-contain"
            />
          ) : (
            <div className="w-40 h-40 mx-auto flex items-center justify-center text-xs text-[#888]">
              QR코드 생성 중...
            </div>
          )}
          <p className="text-[10px] text-[#554E45] font-bold mt-1 tracking-tight">
            카메라로 비추시면 소원사 모바일 법당으로 바로 연결됩니다
          </p>
        </div>
      </div>

      {/* ==================== 2. 외부 원터치 바로 연결 버튼 ==================== */}
      <div className="grid grid-cols-3 gap-2">
        <a
          href={`tel:${m.phone || '010-9103-0003'}`}
          className="py-2.5 px-2 rounded-xl bg-[#2A231C] hover:bg-[#382F26] text-[#F5D061] border border-[#C59B27]/50 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow transition"
        >
          <Phone className="w-4 h-4 text-[#F5D061]" />
          <span>바로 통화</span>
        </a>
        <a
          href={`sms:${m.phone || '010-9103-0003'}`}
          className="py-2.5 px-2 rounded-xl bg-[#2A231C] hover:bg-[#382F26] text-[#F5D061] border border-[#C59B27]/50 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow transition"
        >
          <MessageSquare className="w-4 h-4 text-[#F5D061]" />
          <span>문자 보내기</span>
        </a>
        <a
          href="https://map.naver.com/p/search/%EC%A0%9C%EC%A3%BC%20%EC%86%8C%EC%9B%90%EC%82%AC"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-2 rounded-xl bg-[#2A231C] hover:bg-[#382F26] text-[#F5D061] border border-[#C59B27]/50 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow transition"
        >
          <MapPin className="w-4 h-4 text-[#F5D061]" />
          <span>도량 오시는길</span>
        </a>
      </div>

      {/* ==================== 3. 상대방에게 드리는 복(福) 선물 버튼 2개 ==================== */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose()
            if (onNavigateTab) onNavigateTab('lantern', m.code)
          }}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#C59B27] hover:brightness-110 text-[#1B1815] font-serif-kr font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-between transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#1B1815] fill-[#1B1815]" />
            <span>🪔 1일 무료 소원등 복(福) 선물 켜기</span>
          </span>
          <span className="text-[11px] underline">바로가기 &gt;</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onClose) onClose()
            if (onNavigateTab) onNavigateTab('bulsa', m.code)
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-[#231F1C] hover:bg-[#2F2925] text-[#FAF8F5] border border-[#C59B27]/40 font-serif-kr font-bold text-xs flex items-center justify-between transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#F5D061]" />
            <span>기도 · 위패 · 삼성각 대작불사 동참 안내</span>
          </span>
          <span className="text-[10px] text-[#A89D8E]">상세보기 &gt;</span>
        </button>
      </div>

      {/* ==================== 4. 명함 공유 & 갤러리 저장 액션 ==================== */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={handleShareBusinessCardKakao}
          className="w-full py-3 rounded-2xl bg-[#FEE500] hover:bg-[#FADA0A] text-[#3C1E1E] font-black text-xs shadow flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#3C1E1E]" />
          <span>카카오톡으로 내 전자명함 보내기</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(cardShareUrl)
              if (showToast) showToast('📋 전자명함 링크가 복사되었습니다! 카카오톡이나 문자에 붙여넣어 보세요.')
            }}
            className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#D6CEC2] hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>명함 링크 복사</span>
          </button>

          <button
            type="button"
            disabled={isCapturingCard}
            onClick={handleSaveBusinessCardImage}
            className="py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F5D061] border border-[#C59B27]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isCapturingCard ? '저장 중...' : '명함 사진 저장'}</span>
          </button>
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  if (isModal) {
    return createPortal(
      <div
        className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-3 sm:p-4 overflow-y-auto backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) onClose()
        }}
      >
        {cardContent}
      </div>,
      document.body
    )
  }

  return cardContent
}

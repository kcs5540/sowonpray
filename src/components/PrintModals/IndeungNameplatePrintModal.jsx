import React from 'react'
import { createPortal } from 'react-dom'
import { Printer, X } from 'lucide-react'
import { computeZodiacAndGanji } from '../../lib/supabase'

// 🏮 [대웅전 1년 가족 인등 전통 명패] 종합 A4 원터치 인쇄 모달
export default function IndeungNameplatePrintModal({
  isOpen = true,
  onClose,
  member,
}) {
  if (!isOpen || !member) return null
  if (typeof document === 'undefined') return null

  const m = member

    const familyList = [
      {
        relation: '본인(세주)',
        name: m.name,
        dharma_name: m.dharma_name || m.extra_data?.dharma_name || '',
        birth_date: m.birth_date || m.birth || '-',
        lunar_solar: m.lunar_solar || '음력',
        ganji: m.ganji || computeZodiacAndGanji(m.birth_date || m.birth_year || '').ganji,
        animal: m.animal || computeZodiacAndGanji(m.birth_date || m.birth_year || '').animal,
        wish: m.main_wish || m.wish || '가정평안 및 소원성취',
      },
      ...(Array.isArray(m.family_members) ? m.family_members : []).map((f) => ({
        relation: f.relation || '가족',
        name: f.name,
        dharma_name: f.dharma_name || '',
        birth_date: f.birth_date || f.birth || '-',
        lunar_solar: f.lunar_solar || '음력',
        ganji: f.ganji || computeZodiacAndGanji(f.birth_date || f.birth_year || '').ganji,
        animal: f.animal || computeZodiacAndGanji(f.birth_date || f.birth_year || '').animal,
        wish: f.wish || '무병장수 및 소원성취',
      }))
    ]

    return createPortal(
      <div id="individual-record-portal-root" className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl bg-white text-[#111111] rounded-2xl shadow-2xl flex flex-col my-auto border border-[#E5D399] overflow-hidden max-h-[92vh]">
          {/* 상단 조작 바 (인쇄 시 숨김) */}
          <div className="no-print bg-[#1B1815] text-[#FAF8F5] p-3.5 sm:p-4 flex items-center justify-between gap-3 border-b-2 border-[#D4AF37]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1B1815] flex items-center justify-center font-bold text-sm shrink-0">
                🏮
              </div>
              <div className="min-w-0">
                <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] truncate">
                  대웅전 1년 가족 인등 전통 명패 A4 공식 인쇄
                </h3>
                <p className="text-[11px] text-[#D6CEC2] truncate">
                  {m.name} 불자님 (총 {familyList.length}위 봉안 명패) · 365일 대웅전 인등대 상시축원
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center gap-1.5 shadow hover:brightness-105 active:scale-95 transition"
              >
                <Printer className="w-4 h-4" />
                <span>A4 인쇄하기</span>
              </button>
              <button
                type="button"
                onClick={() => onClose()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* A4 인쇄 대상 본문 */}
          <div className="overflow-y-auto p-4 sm:p-8 pb-16 bg-[#1F1C19]/85 flex flex-col items-center">
            <div
              id="printable-individual-record"
              className="w-full max-w-[210mm] bg-white p-6 sm:p-8 pb-8 font-serif-kr text-[#111] shadow-2xl border-2 border-[#D4AF37] space-y-4 text-xs mb-8"
            >
              {/* 상단 헤더 */}
              <div className="text-center pb-2.5 border-b-2 border-[#1B1815]">
                <div className="flex items-center justify-between text-[10px] text-[#666] mb-0.5">
                  <span>인등대 봉안 등록번호: {m.code || '소원사-인등'}</span>
                  <span>인쇄일자: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF3E0] border border-[#D4AF37] text-[10px] text-[#8A6510] font-bold mb-1">
                  대한불교 본원종 제주 소원사 대웅전 인등대 봉안 원장
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#1B1815] font-serif-kr">
                  대 웅 전 1 년 가 족 인 등 전 통 명 패 (燈 牌)
                </h1>
                <p className="text-[10.5px] text-[#555] mt-1">
                  소원성취 기도도량 · 제주시 죽성서길 75 (오등동 935) · 종무소 064-805-2007
                </p>
              </div>

              {/* 신도 및 권속 인등 기본 정보 바 */}
              <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#D5C59B] text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[#8A6510] font-bold">세주(세대주):</span> <strong className="text-[#1B1815]">{m.name}</strong> {m.dharma_name && `(${m.dharma_name})`}
                </div>
                <div>
                  <span className="text-[#8A6510] font-bold">연락처:</span> <span className="font-mono">{m.phone || '-'}</span>
                </div>
                <div>
                  <span className="text-[#8A6510] font-bold">봉안 기간:</span> <strong>365일 상시정진</strong>
                </div>
                <div>
                  <span className="text-[#8A6510] font-bold">봉안 위치:</span> <strong>대웅전 인등단</strong>
                </div>
                <div className="col-span-2 sm:col-span-4 border-t border-[#E8DEC7] pt-1 text-[10.5px] text-[#666]">
                  <span className="text-[#8A6510] font-bold">축원 거주지:</span> {m.address ? `${m.address} ${m.address_detail || ''}` : '주소 미기재'}
                </div>
              </div>

              {/* 가족별 전통 인등 명패 카드 그리드 */}
              <div>
                <div className="text-[11.5px] font-bold text-[#1B1815] mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#8A6510]">🏮</span> 대웅전 인등대 봉안 가족별 전통 명패 ({familyList.length}위)
                  </div>
                  <span className="text-[10px] text-[#666]">절취선 기준으로 오려 인등대에 봉안</span>
                </div>

                <div className={`grid gap-3 ${familyList.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
                  {familyList.map((f, idx) => (
                    <div
                      key={idx}
                      className="border-2 border-[#D4AF37] rounded-xl p-3 bg-[#FCFAF5] shadow-xs relative flex flex-col justify-between min-h-[140px] text-center"
                    >
                      {/* 상단 관계 배지 & 연꽃 심볼 */}
                      <div className="flex items-center justify-between border-b border-[#E8DEC7] pb-1.5 mb-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-full bg-[#EFE3C3] text-[#7A5B0B] font-bold border border-[#D5C59B]">
                          {f.relation}
                        </span>
                        <span className="text-[#8A6510] font-bold">卍 1년 가족인등</span>
                      </div>

                      {/* 성명 & 법명 */}
                      <div className="my-auto py-1">
                        <div className="text-base sm:text-lg font-black text-[#1B1815] font-serif-kr tracking-wide">
                          {f.name}
                        </div>
                        {f.dharma_name && (
                          <div className="text-xs text-[#8A6510] font-bold mt-0.5">
                            법명: {f.dharma_name}
                          </div>
                        )}
                        <div className="text-[10.5px] text-[#666] font-mono mt-1">
                          {f.birth_date} ({f.lunar_solar}) {f.ganji ? `${f.ganji}생` : ''} {f.animal ? `(${f.animal}띠)` : ''}
                        </div>
                      </div>

                      {/* 개별 발원 */}
                      <div className="border-t border-[#E8DEC7] pt-1.5 mt-2 text-[10px] text-[#444] font-medium truncate" title={f.wish}>
                        발원: {f.wish || '무병장수 및 소원성취'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 하단 사찰 공식 축원문 및 직인 */}
              <div className="pt-3 border-t-2 border-[#1B1815] mt-3">
                <p className="text-center text-[10px] font-bold text-[#333] mb-2 leading-relaxed">
                  위 불자 및 권속은 대한불교 본원종 제주 소원사 대웅전에 1년간 가족 인등을 밝히고<br />
                  매일 사시예불 축원을 올리오니, 부처님의 자비광명으로 가내 평안하고 만사여의원만하기를 지심 축원합니다.
                </p>
                <div className="grid grid-cols-2 gap-3 text-center text-[10px]">
                  <div className="border border-[#444] py-2 px-1 rounded bg-[#FAF8F5]">
                    <div className="text-[9px] text-[#666]">대웅전 축원 증명</div>
                    <div className="font-extrabold text-[#111] mt-0.5 text-xs">대한불교 본원종 제주 소원사</div>
                    <div className="text-[10px] font-bold text-[#8A6510] mt-0.5">주지스님 직인 (인)</div>
                  </div>
                  <div className="border border-[#444] py-2 px-1 rounded bg-[#FAF8F5]">
                    <div className="text-[9px] text-[#666]">사찰 창건 본부 증명</div>
                    <div className="font-extrabold text-[#111] mt-0.5 text-xs">소원사 창건주 양영문 본부</div>
                    <div className="text-[10px] font-bold text-[#8A6510] mt-0.5">창건주 회장 직인 (인)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

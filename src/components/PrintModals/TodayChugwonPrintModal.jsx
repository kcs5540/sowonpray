import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, FileText } from 'lucide-react'

// 요일 한글 변환
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatKoreanFullDate(dateObj) {
  const y = dateObj.getFullYear()
  const buddhistYear = y + 544
  const m = dateObj.getMonth() + 1
  const d = dateObj.getDate()
  const w = WEEKDAYS[dateObj.getDay()]
  return {
    buddhistYear,
    year: y,
    month: m,
    day: d,
    weekday: w,
    fullLabel: `불기 ${buddhistYear}년 (${y}년) ${m}월 ${d}일 (${w}요일)`,
    shortLabel: `${y}년 ${m}월 ${d}일 (${w})`,
  }
}

function formatPrintTimestamp(dateObj) {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  const h = dateObj.getHours()
  const min = String(dateObj.getMinutes()).padStart(2, '0')
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${y}.${m}.${d} ${ampm} ${h12}:${min}`
}

function formatShortReceiptDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '-'
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}/${day} ${h}:${min}`
}

// 📿 [대웅전 사시예불 오늘 축원 명부 — 표지 + 명부 A4 공식 출력 모달]
export default function TodayChugwonPrintModal({
  isOpen = false,
  onClose,
  todayLanterns = [],
}) {
  const [includeCover, setIncludeCover] = useState(true)
  const [textScale, setTextScale] = useState('normal') // 'normal' | 'large' | 'xlarge'

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-sasi-open')
    } else {
      document.body.classList.remove('print-sasi-open')
    }
    return () => {
      document.body.classList.remove('print-sasi-open')
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  const now = new Date()
  const dateInfo = formatKoreanFullDate(now)
  const printTimeStr = formatPrintTimestamp(now)

  const fontScalePercent =
    textScale === 'xlarge' ? 120 : textScale === 'large' ? 110 : 100

  return createPortal(
    <div
      id="sasi-print-portal-root"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 12mm !important;
            }
            #printable-sasi-sheet {
              font-size: ${fontScalePercent}% !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .chugwon-cover-page {
              page-break-after: always !important;
              break-after: page !important;
              min-height: 254mm !important;
              height: 254mm !important;
              width: 100% !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
            }
            .chugwon-roster-page {
              page-break-before: auto !important;
              width: 100% !important;
              box-sizing: border-box !important;
            }
            .chugwon-roster-table {
              width: 100% !important;
              table-layout: fixed !important;
            }
          }
        `}
      </style>

      <div className="w-full max-w-4xl bg-white text-[#1A1612] rounded-2xl shadow-2xl flex flex-col my-auto border border-[#D4AF37] overflow-hidden max-h-[94vh]">
        {/* 상단 컨트롤 바 (인쇄 시 숨김) */}
        <div className="no-print bg-[#1B1815] text-[#FAF8F5] px-4 py-3.5 flex flex-col gap-3 border-b-2 border-[#D4AF37]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1B1815] flex items-center justify-center font-black text-base shrink-0">
                卍
              </div>
              <div className="min-w-0">
                <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] truncate">
                  오늘의 대웅전 사시예불 축원 명부 출력
                </h3>
                <p className="text-[11px] text-[#CFC7BA] truncate">
                  {dateInfo.shortLabel} 오전 10시 사시예불 · 총 {todayLanterns.length}위 (법당 스님 전달용)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow hover:brightness-105 active:scale-95 transition cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                <span>A4 인쇄하기</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 출력 옵션 바 (표지 포함 여부 + 스님 가독성 글자 크기) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCover}
                onChange={(e) => setIncludeCover(e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
              />
              <span className="font-bold text-[#F5E6BE] flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#F5D061]" />
                1페이지 격식 표지 포함 인쇄
              </span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#BFB6A8] mr-1">명부 글자 크기:</span>
              {[
                { key: 'normal', label: '보통' },
                { key: 'large', label: '크게' },
                { key: 'xlarge', label: '아주 크게' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTextScale(opt.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    textScale === opt.key
                      ? 'bg-[#F5D061] text-[#1B1815]'
                      : 'bg-white/10 text-[#D6CEC2] hover:bg-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== A4 인쇄 본문 (id="printable-sasi-sheet") ==================== */}
        <div
          id="printable-sasi-sheet"
          style={{ fontSize: `${fontScalePercent}%` }}
          className="flex-1 overflow-y-auto print:overflow-visible bg-[#EFECE6] print:bg-white p-3 sm:p-6 print:p-0 space-y-6 print:space-y-0 font-serif-kr"
        >
          {/* ============================================================ */}
          {/* [1페이지] 대웅전 사시예불 축원 명부 격식 표지 */}
          {/* ============================================================ */}
          {includeCover && (
            <section className="chugwon-cover-page bg-white mx-auto max-w-[210mm] print:max-w-none shadow-md print:shadow-none border-[3px] border-[#1E1914] p-2.5 sm:p-3.5 print:p-2.5 flex flex-col justify-between min-h-[720px]">
              {/* 내부 금선 이중 테두리 */}
              <div className="flex-1 border border-[#B8922E] p-5 sm:p-8 print:p-7 flex flex-col justify-between relative">
                {/* 네 모서리 전통 장식 코너 */}
                <span className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#1E1914]" />
                <span className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#1E1914]" />
                <span className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#1E1914]" />
                <span className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#1E1914]" />

                {/* 표지 상단: 사찰 격식 헤더 */}
                <div className="text-center space-y-2 pt-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#8A6510] bg-[#FAF5E8] text-[#6B4B08] text-2xl font-black mx-auto">
                    卍
                  </div>
                  <p className="text-xs tracking-[0.35em] text-[#6B5B45] font-semibold pt-1">
                    한라산 영험 기도도량
                  </p>
                  <p className="text-lg sm:text-xl font-bold tracking-[0.22em] text-[#1E1914]">
                    濟州 所願寺 · 제주 소원사
                  </p>
                  <div className="w-24 h-[1px] bg-[#C5A447] mx-auto mt-4" />
                </div>

                {/* 표지 중앙: 대제목 + 봉행 일시 */}
                <div className="text-center my-4 space-y-4">
                  <div className="space-y-2">
                    <div className="inline-block px-4 py-1 rounded-full border border-[#B8922E] bg-[#FAF4E3] text-[#7A5608] text-xs sm:text-sm font-extrabold tracking-[0.2em]">
                      모바일 법당 소원등
                    </div>
                    <p className="text-sm sm:text-base tracking-[0.3em] text-[#7A5B14] font-bold pt-1">
                      大雄殿 巳時禮佛 祝願名簿
                    </p>
                    <h1 className="text-3xl sm:text-4xl print:text-[32px] font-black tracking-[0.18em] text-[#111111] leading-snug">
                      대웅전 사시예불
                      <br />
                      축 원 명 부
                    </h1>
                  </div>

                  {/* 봉행 일시 및 위수 격식 박스 */}
                  <div className="max-w-md mx-auto bg-[#FAF7F0] border-y-2 border-[#1E1914] py-3.5 px-5 space-y-1.5">
                    <div className="text-sm sm:text-base font-bold text-[#1E1914] tracking-wide">
                      {dateInfo.fullLabel}
                    </div>
                    <div className="text-xs sm:text-sm text-[#4A3F31] font-semibold">
                      오전 10시 사시마지(巳時摩旨) 대웅전 봉행
                    </div>
                    <div className="pt-2 mt-1.5 border-t border-[#D8CBB3] flex items-center justify-center gap-4 text-sm">
                      <span className="text-[#5C5040]">금일 축원 위수</span>
                      <strong className="text-lg font-black text-[#8A5A00] tracking-wider">
                        총 {todayLanterns.length} 위 (位)
                      </strong>
                    </div>
                  </div>

                  {/* 전통 축원 서문 */}
                  <p className="max-w-md mx-auto text-xs sm:text-[13px] text-[#3D342A] leading-7 pt-1 break-keep">
                    지극한 정성으로 부처님 전에 소원등을 밝힌 불자님들의
                    <br />
                    간절한 발원이 대웅전 사시예불의 청정한 축원 속에
                    <br />
                    원만히 성취되기를 지심귀명례(至心歸命禮) 하옵나이다.
                  </p>
                </div>

                {/* 표지 하단: 봉정 및 종무원 확인 */}
                <div className="text-center space-y-2.5 pb-2">
                  <div className="w-16 h-[1px] bg-[#C5B392] mx-auto" />
                  <p className="text-sm sm:text-base font-bold tracking-[0.2em] text-[#1E1914]">
                    대웅전 법당 주지스님께 삼가 올림
                  </p>
                  <div className="text-xs text-[#5E5345] space-y-0.5">
                    <p className="font-bold text-[#2E2418]">제주 소원사 종무원</p>
                    <p>제주특별자치도 제주시 죽성서길 75 (오등동)</p>
                    <p className="text-[11px] text-[#7A6F60] pt-0.5 font-mono">
                      출력일시 : {printTimeStr}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* [2페이지~] 오늘의 대웅전 축원 명부 본문 */}
          {/* ============================================================ */}
          <section className="chugwon-roster-page bg-white mx-auto max-w-[210mm] print:max-w-none shadow-md print:shadow-none p-5 sm:p-8 print:p-0 space-y-4">
            {/* 명부 상단 격식 헤더 */}
            <div className="border-b-2 border-[#1E1914] pb-3">
              <div className="flex items-center justify-between text-[11px] text-[#5C5346] mb-1.5">
                <span className="font-bold">卍 제주 소원사 대웅전</span>
                <span>{dateInfo.fullLabel} · 오전 10시 사시예불</span>
                <span className="font-bold text-[#1E1914]">총 {todayLanterns.length}위</span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-[0.12em] text-[#111111]">
                    금일 사시예불 축원 명부
                  </h2>
                  <span className="text-xs font-bold text-[#7A5608] px-2 py-0.5 rounded bg-[#FAF4E3] border border-[#C9B37E]">
                    모바일 법당 소원등
                  </span>
                </div>
                <span className="text-[11px] text-[#6B5E4E] font-mono shrink-0">
                  출력: {printTimeStr}
                </span>
              </div>
            </div>

            {todayLanterns.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-[#C8BEA8] rounded-xl text-sm text-[#6B5E4E]">
                오늘 오전 10시 사시예불에 배정된 축원 명부가 없습니다.
              </div>
            ) : (
              <table className="chugwon-roster-table w-full table-fixed border-collapse border-t-2 border-b-2 border-[#1E1914] text-left">
                <colgroup>
                  <col style={{ width: '6%' }} />
                  <col style={{ width: '24%' }} />
                  <col style={{ width: '15%' }} />
                  <col style={{ width: '48%' }} />
                  <col style={{ width: '7%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-[#F4EFE4] border-b border-[#1E1914] text-[#1A1612] text-[12px] font-bold">
                    <th className="py-2 px-1 border-r border-[#C8BEA8] text-center whitespace-nowrap">연번</th>
                    <th className="py-2 px-2.5 border-r border-[#C8BEA8]">축원 불자 (성함·대상)</th>
                    <th className="py-2 px-1.5 border-r border-[#C8BEA8] text-center whitespace-nowrap">기원 분야</th>
                    <th className="py-2 px-3 border-r border-[#C8BEA8]">지극지성 발원 내용</th>
                    <th className="py-2 px-1 text-center whitespace-nowrap">축원</th>
                  </tr>
                </thead>
                <tbody>
                  {todayLanterns.map((p, idx) => (
                    <tr
                      key={p.id || p.db_id || idx}
                      className={`border-b border-[#D5CCBC] align-top ${
                        idx % 2 === 1 ? 'bg-[#FCFBF8]' : 'bg-white'
                      }`}
                    >
                      <td className="py-2.5 px-1 border-r border-[#D5CCBC] text-center font-mono font-bold text-[12.5px] text-[#3B3226]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-2.5 border-r border-[#D5CCBC]">
                        <div className="font-black text-[13.5px] text-[#111111] leading-snug break-keep">
                          {p.believer_name || '불자'}
                        </div>
                        {p.created_at && (
                          <div className="text-[10px] text-[#7A6F60] font-mono mt-0.5">
                            접수 {formatShortReceiptDate(p.created_at)}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-1.5 border-r border-[#D5CCBC] text-center">
                        <span className="inline-block px-1.5 py-0.5 rounded border border-[#C9B37E] bg-[#FAF4E3] text-[#6E4F0A] text-[10.5px] font-bold break-keep leading-tight">
                          {p.wish_category || '소원성취'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border-r border-[#D5CCBC] text-[12.5px] text-[#1E1A15] leading-relaxed break-keep">
                        {p.wish_text ? `“${p.wish_text}”` : '가정평안 및 소원성취 발원'}
                      </td>
                      <td className="py-2.5 px-1 text-center align-middle">
                        <div className="w-4 h-4 border-[1.5px] border-[#5C5244] rounded-xs mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 명부 하단 회향 확인 및 스님 서명란 */}
            <div className="pt-6 mt-4 border-t border-[#C8BEA8] flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="space-y-1 text-xs text-[#4A4035]">
                <p className="font-bold text-[#1E1914]">
                  상기와 같이 금일 대웅전 사시예불 축원을 원만히 봉행·회향하였음을 확인합니다.
                </p>
                <p className="text-[11px] text-[#7A6F60]">
                  제주 소원사 대웅전 · 제주특별자치도 제주시 죽성서길 75 (오등동)
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 self-end">
                <div className="text-center border border-[#C8BEA8] rounded-lg px-4 py-2 min-w-[110px]">
                  <div className="text-[10px] text-[#6B5E4E] mb-2">집전 스님 확인</div>
                  <div className="text-xs text-[#9E9282] tracking-widest">( 서 명 )</div>
                </div>
                <div className="text-center border border-[#C8BEA8] rounded-lg px-4 py-2 min-w-[110px]">
                  <div className="text-[10px] text-[#6B5E4E] mb-2">회향 시각</div>
                  <div className="text-xs text-[#9E9282]">오전 10 : &nbsp;&nbsp;&nbsp;&nbsp;</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  )
}

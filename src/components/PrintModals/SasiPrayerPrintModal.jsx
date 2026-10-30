import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, Download, X } from 'lucide-react'
import { computeZodiacAndGanji } from '../../lib/supabase'
import PrintScaleControls from './PrintScaleControls'

// 📅 축원 접수일시 포맷팅 헬퍼
function formatPrayerDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = d.getHours()
  const min = d.getMinutes()
  return `${m}/${day} ${h}:${min < 10 ? '0' : ''}${min}`
}

// 📿 [정진 기간 한글 사찰 표준 명칭 헬퍼]
function getPrayerPeriodLabel(p) {
  const c = p.wish_category || ''
  const t = p.prayer_type || ''
  
  if (c.includes('위패') || c.includes('영구')) {
    return '영구 봉안'
  }
  if (c.includes('1년') || c.includes('인등') || t === 'indeung_1yr' || p.duration_days === 365) {
    return '1년 (상시)'
  }
  if (c.includes('100일') || t === 'prayer_100d' || p.duration_days === 100) {
    return '100일 정진'
  }
  if (c.includes('49재') || c.includes('천도재') || c.includes('기일') || c.includes('예수재')) {
    return '특별재'
  }
  if (c.includes('공양미') || c.includes('시주') || c.includes('불사')) {
    return '불전 시주'
  }
  if (t === 'lantern_1d' || t === 'lantern' || p.duration_days === 1 || !t) {
    return '1일 (당일)'
  }
  return p.duration_days ? `${p.duration_days}일` : '1일 (당일)'
}

// 📿 [대웅전 사시예불 축원 명부 A4 공식 인쇄 모달]
export default function SasiPrayerPrintModal({
  isOpen = true,
  onClose,
  activeSasiPrayers = [],
  filteredSasiPrayers = [],
  sasiPrayedCheckedIds = new Set(),
  toggleSasiPrayedCheck,
  sasiPrayerTypeTab = 'all',
  setSasiPrayerTypeTab,
  members = [],
}) {
  // 🖨️ 인쇄 미세조절 슬라이더 상태
  const [fontSize, setFontSize] = useState(100)
  const [marginVertical, setMarginVertical] = useState(15)
  const [marginHorizontal, setMarginHorizontal] = useState(15)
  const [lineHeight, setLineHeight] = useState(1.4)

  const handleResetScale = () => {
    setFontSize(100)
    setMarginVertical(15)
    setMarginHorizontal(15)
    setLineHeight(1.4)
  }

  // A4 인쇄 시 메인 앱 숨김 및 본 모달 전용 출력 스타일 활성화
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

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  // 3대 기도/소원등 분류 카운트
  const count1d = activeSasiPrayers.filter((p) => {
    if (p.prayer_type === 'lantern_1d' || p.prayer_type === 'lantern') return true
    if (p.duration_days === 1 || p.duration_days === 7) return true
    const c = p.wish_category || ''
    return !c.includes('100일') && !c.includes('인등') && !c.includes('위패') && !c.includes('재') && !c.includes('불사') && !c.includes('공양미')
  }).length

  const count100d = activeSasiPrayers.filter((p) => {
    return p.prayer_type === 'prayer_100d' || (p.wish_category && p.wish_category.includes('100일')) || p.duration_days === 100
  }).length

  const count1yr = activeSasiPrayers.filter((p) => {
    return p.prayer_type === 'indeung_1yr' || (p.wish_category && p.wish_category.includes('인등')) || p.duration_days === 365
  }).length

  // 📥 축원 명부 엑셀(CSV) 다운로드 핸들러
  const handleDownloadCsv = () => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const headers = ['연번', '신청자/축원대상', '기원분야', '지극지성 발원문', '정진기간', '접수일시']
    const rows = filteredSasiPrayers.map((p, idx) => [
      idx + 1,
      `"${(p.believer_name || '').replace(/"/g, '""')}"`,
      `"${(p.wish_category || '').replace(/"/g, '""')}"`,
      `"${(p.wish_text || '').replace(/"/g, '""')}"`,
      `"${getPrayerPeriodLabel(p)}"`,
      `"${formatPrayerDate(p.created_at)}"`,
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `제주소원사_사시예불_축원명부_${todayStr}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return createPortal(
    <div
      id="sasi-print-portal-root"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      {/* 동적 인쇄 스타일 주입 */}
      <style>
        {`
          @media print {
            @page {
              margin: ${marginVertical}mm ${marginHorizontal}mm !important;
            }
            #printable-sasi-sheet {
              font-size: ${fontSize}% !important;
              line-height: ${lineHeight} !important;
            }
          }
        `}
      </style>

      <div className="w-full max-w-4xl bg-white text-[#111111] rounded-2xl shadow-2xl flex flex-col my-auto border border-[#E5D399] overflow-hidden max-h-[92vh]">
        {/* 상단 조작 바 (인쇄 시 숨김: no-print) */}
        <div className="no-print bg-[#1B1815] text-[#FAF8F5] p-3.5 sm:p-4 flex flex-col gap-2.5 border-b-2 border-[#D4AF37]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#1B1815] flex items-center justify-center font-bold text-sm shrink-0">
                卍
              </div>
              <div className="min-w-0">
                <h3 className="font-serif-kr text-sm sm:text-base font-bold text-[#F5D061] truncate">
                  오늘의 대웅전 사시예불 축원 명부 (사시마지 당일 축원 대상)
                </h3>
                <p className="text-[11px] text-[#D6CEC2] truncate">
                  대웅전 부처님 전 사시마지 축원 대상 정진 불자 (총 {filteredSasiPrayers.length}위 전원 출력 대상)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition whitespace-nowrap cursor-pointer"
                title="엑셀(CSV) 서식 내려받기"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">양식 다운로드</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] font-extrabold text-xs flex items-center gap-1.5 shadow hover:brightness-105 active:scale-95 transition whitespace-nowrap cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>A4 인쇄하기</span>
              </button>
              <button
                type="button"
                onClick={() => onClose()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#FAF8F5] transition cursor-pointer"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSasiPrayerTypeTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                sasiPrayerTypeTab === 'all'
                  ? 'bg-[#F5D061] text-[#1B1815]'
                  : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
              }`}
            >
              전체 사시예불 ({activeSasiPrayers.length}위)
            </button>
            <button
              type="button"
              onClick={() => setSasiPrayerTypeTab('lantern_1d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                sasiPrayerTypeTab === 'lantern_1d' || sasiPrayerTypeTab === 'lantern'
                  ? 'bg-[#F5D061] text-[#1B1815]'
                  : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
              }`}
            >
              1일 소원등 (무료) ({count1d}위)
            </button>
            <button
              type="button"
              onClick={() => setSasiPrayerTypeTab('prayer_100d')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                sasiPrayerTypeTab === 'prayer_100d'
                  ? 'bg-[#F5D061] text-[#1B1815]'
                  : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
              }`}
            >
              100일 특별기도 ({count100d}위)
            </button>
            <button
              type="button"
              onClick={() => setSasiPrayerTypeTab('indeung_1yr')}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                sasiPrayerTypeTab === 'indeung_1yr'
                  ? 'bg-[#F5D061] text-[#1B1815]'
                  : 'bg-white/10 text-[#C5BBAF] hover:bg-white/20'
              }`}
            >
              대웅전 1년 인등 ({count1yr}위)
            </button>
          </div>
        </div>

        {/* 🖨️ 인쇄 미세조절 슬라이더 컨트롤 바 */}
        <PrintScaleControls
          fontSize={fontSize}
          setFontSize={setFontSize}
          marginVertical={marginVertical}
          setMarginVertical={setMarginVertical}
          marginHorizontal={marginHorizontal}
          setMarginHorizontal={setMarginHorizontal}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          onReset={handleResetScale}
        />

        {/* ==================== A4 인쇄 대상 본문 (id="printable-sasi-sheet") ==================== */}
        <div
          id="printable-sasi-sheet"
          style={{
            fontSize: `${fontSize}%`,
            lineHeight: lineHeight,
          }}
          className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible font-serif-kr bg-white"
        >
          {/* A4 인쇄 시 공식 상단 서식 */}
          <div className="hidden print:block pb-3 mb-2 border-b-2 border-[#1B1815] text-center font-serif-kr">
            <div className="flex justify-between items-center text-[10px] text-[#666666] mb-1 pb-1 border-b border-[#CCCCCC]">
              <span>대한불교 본원종 제주 소원사 종무원</span>
              <span>사시예불 축원 원장 (매일 오전 10:30 사시마지 봉행)</span>
              <span>인쇄일시: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF3E0] border border-[#D4AF37] text-[10px] text-[#8A6510] font-bold mb-1">
              대웅전 부처님 전 지극정성 축원 명부
            </div>
            <h1 className="text-2xl font-black tracking-widest text-[#1B1815] my-1">
              대웅전 사시마지 예불 축원 명부
            </h1>
            <p className="text-[11px] text-[#555555]">
              당일 유효 정진 불자 전원 ({filteredSasiPrayers.length}위 전원 봉독 축원)
            </p>
          </div>

          {filteredSasiPrayers.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#777777] border border-dashed border-[#CCCCCC] rounded-xl">
              현재 조건에 해당하는 사시예불 접수 내역이 없습니다.
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
                  {filteredSasiPrayers.map((p, idx) => {
                    const isChecked = sasiPrayedCheckedIds.has(p.id)
                    return (
                      <tr
                        key={p.id || idx}
                        className={`border-b border-[#CCCCCC] transition ${
                          idx % 2 === 1 ? 'bg-[#FAFAFA]' : 'bg-white'
                        } ${isChecked ? 'bg-amber-50/70' : ''}`}
                      >
                        <td className="p-2 border-r border-[#CCCCCC] text-center font-mono font-bold">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSasiPrayedCheck(p.id)}
                              className="no-print w-3.5 h-3.5 text-[#C59B27] rounded cursor-pointer"
                              title="사시예불 축원 회향 체크"
                            />
                            <span>{idx + 1}</span>
                          </div>
                        </td>
                        <td className="p-2 border-r border-[#CCCCCC] font-bold text-[#111111]">
                          <div className="flex items-center gap-1">
                            <span>{p.believer_name || '신도'}</span>
                          </div>
                        </td>
                        <td className="p-2 border-r border-[#CCCCCC] text-center text-[#555555]">
                          <span className="px-1.5 py-0.5 rounded bg-[#F3EFE6] border border-[#DDD] text-[10px] font-semibold text-[#8A6510]">
                            {p.wish_category || '일반소원'}
                          </span>
                        </td>
                        <td className="p-2 border-r border-[#CCCCCC] text-[#222222] font-serif-kr">
                          {p.wish_text || '가정평안 및 소원성취'}
                        </td>
                        <td className="p-2 border-r border-[#CCCCCC] text-center text-[#555555] font-semibold">
                          {getPrayerPeriodLabel(p)}
                        </td>
                        <td className="p-2 text-center font-mono text-[11px] text-[#666666]">
                          {formatPrayerDate(p.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 하단 사찰 공식 직인란 */}
          <div className="pt-6 border-t-2 border-[#1B1815] flex items-center justify-between text-xs text-[#444444] font-serif-kr">
            <div>
              <div className="font-bold text-[#1B1815]">대한불교 본원종 제주 소원사</div>
              <div className="text-[10px] text-[#777777]">제주특별자치도 제주시 죽성서길 75 (오등동)</div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-[10px] text-[#888888] mb-1">소원사 창건주</div>
                <div className="w-14 h-14 rounded-full border border-red-500/70 text-red-600 font-bold flex items-center justify-center text-[10px] mx-auto shadow-sm">
                  창건주<br />양영문
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#888888] mb-1">소원사 주지스님</div>
                <div className="w-14 h-14 rounded-full border border-red-500/70 text-red-600 font-bold flex items-center justify-center text-[10px] mx-auto shadow-sm">
                  소원사<br />주지인
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

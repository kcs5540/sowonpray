import React from 'react'
import { Sliders, RotateCcw } from 'lucide-react'

// 🖨️ [사찰 종무소 전용 출력물 자유 조절 인쇄 엔진 컨트롤러]
// 글자크기, 상하/좌우 여백, 줄간격을 슬라이더로 실시간 조절하여 어떤 프린터에서도 잘림 없이 완벽 인쇄
export default function PrintScaleControls({
  fontSize = 100, // 80% ~ 140%
  setFontSize,
  marginVertical = 15, // 0mm ~ 35mm
  setMarginVertical,
  marginHorizontal = 15, // 0mm ~ 35mm
  setMarginHorizontal,
  lineHeight = 1.4, // 1.1 ~ 2.2
  setLineHeight,
  onReset,
}) {
  return (
    <div className="no-print bg-[#25201A] text-[#FAF8F5] px-4 py-2.5 border-b border-[#C59B27]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[#F5D061] font-bold">
          <Sliders className="w-3.5 h-3.5" />
          <span>프린터 규격 미세조정</span>
        </div>
        <span className="text-[10px] text-[#A69B8D] hidden sm:inline">
          (A4 여백/글자크기 실시간 조절)
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* 글자 크기 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#D6CEC2]">글자:</span>
          <input
            type="range"
            min="80"
            max="135"
            step="2"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-16 accent-[#F5D061] cursor-pointer"
          />
          <span className="font-mono text-[11px] text-[#F5D061] w-7 text-right">
            {fontSize}%
          </span>
        </div>

        {/* 상하 여백 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#D6CEC2]">상하여백:</span>
          <input
            type="range"
            min="0"
            max="35"
            step="1"
            value={marginVertical}
            onChange={(e) => setMarginVertical(Number(e.target.value))}
            className="w-16 accent-[#F5D061] cursor-pointer"
          />
          <span className="font-mono text-[11px] text-[#F5D061] w-8 text-right">
            {marginVertical}mm
          </span>
        </div>

        {/* 좌우 여백 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#D6CEC2]">좌우여백:</span>
          <input
            type="range"
            min="0"
            max="35"
            step="1"
            value={marginHorizontal}
            onChange={(e) => setMarginHorizontal(Number(e.target.value))}
            className="w-16 accent-[#F5D061] cursor-pointer"
          />
          <span className="font-mono text-[11px] text-[#F5D061] w-8 text-right">
            {marginHorizontal}mm
          </span>
        </div>

        {/* 줄간격 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#D6CEC2]">줄간격:</span>
          <input
            type="range"
            min="1.1"
            max="2.0"
            step="0.05"
            value={lineHeight}
            onChange={(e) => setLineHeight(Number(e.target.value))}
            className="w-16 accent-[#F5D061] cursor-pointer"
          />
          <span className="font-mono text-[11px] text-[#F5D061] w-8 text-right">
            {lineHeight.toFixed(2)}
          </span>
        </div>

        {/* 초기화 버튼 */}
        <button
          type="button"
          onClick={onReset}
          className="p-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#D6CEC2] hover:text-white transition flex items-center gap-1 text-[11px]"
          title="기본값으로 되돌리기"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden md:inline">초기화</span>
        </button>
      </div>
    </div>
  )
}

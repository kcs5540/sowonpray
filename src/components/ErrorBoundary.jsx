import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('소원사 시스템 안전망(ErrorBoundary) 오류 포착:', error, errorInfo)
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1B1815] text-[#FAF8F5] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#241F1A] border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            {/* 소원사 황금 심볼 */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5D061] to-[#C59B27] text-[#1B1815] mx-auto flex items-center justify-center font-bold text-2xl shadow-lg border border-[#FDE68A]">
              卍
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#D4AF37] tracking-widest font-serif-kr block">
                대한불교 본원종 제주 소원사
              </span>
              <h2 className="font-serif-kr text-xl sm:text-2xl font-black text-[#FAF8F5]">
                도량 시스템 안전 보호 작동
              </h2>
              <p className="text-xs text-[#D6CEC2] leading-relaxed break-keep pt-1">
                일시적인 전산 통신 또는 화면 처리 지연이 발생하여 시스템을 안전하게 보호 중입니다. 아래 버튼을 누르시면 정상 화면으로 즉시 복귀합니다.
              </p>
              {this.state.error && (
                <div className="mt-3 p-3 rounded-xl bg-black/80 border border-amber-500/50 text-left overflow-x-auto max-h-48 text-[11px] font-mono text-amber-300">
                  <div className="font-bold text-red-400 mb-1">[전산 오류 감지]</div>
                  <div>{String(this.state.error?.message || this.state.error)}</div>
                  {this.state.error?.stack && (
                    <pre className="mt-1 text-[9.5px] text-gray-400 whitespace-pre-wrap leading-tight">{this.state.error.stack.slice(0, 500)}</pre>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#C59B27] hover:brightness-110 text-[#1B1815] font-serif-kr font-bold text-sm shadow-md transition cursor-pointer"
              >
                🪷 소원사 법당 홈으로 안전하게 복귀
              </button>
            </div>

            <p className="text-[10.5px] text-[#8C8071]">
              문의: 제주 소원사 종무소 (010-4912-1083 / 064-799-1083)
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

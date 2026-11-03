import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  Flame,
  ArrowLeft,
  Calendar,
  Heart,
  MessageCircle,
} from 'lucide-react'

// 🧒 제주 소원사 지혜 동자승 1:1 대화 및 신행 사주 상담 탭 (Gemini AI 탑재)
export default function DongjaBotTab({
  setActiveTab,
  currentUser,
  playMoktakSound,
  showToast,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'dongja',
      text: `보살님, 반갑습니다! 🙏\n저는 제주 소원사 대웅전에서 주지 스님을 모시며 지혜를 닦는 '소원 동자승'이에요.\n\n요즘 마음에 무거운 짐이나 남에게 털어놓지 못한 답답한 일이 있으신가요?\n\n보살님의 [생년월일(음력/양력)과 태어난 시간], 그리고 [요즘의 걱정거리나 바라는 소원]을 편하게 말씀해 주세요. 부처님의 밝은 지혜와 따뜻한 사주 풀이로 마음을 활짝 열어드릴게요! ✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const [inputText, setInputText] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [dongjaMood, setDongjaMood] = useState('smile') // smile, pray, blessing
  const chatBottomRef = useRef(null)

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // 동자승 음성 읽기 (TTS 고품질 지원)
  const speakMessage = (text) => {
    if (!('speechSynthesis' in window)) {
      showToast('이 기기에서는 음성 안내를 지원하지 않습니다.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[🙏✨🪔🧒💡]/g, '').slice(0, 250)
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'ko-KR'
    utterance.rate = 1.02
    utterance.pitch = 1.35 // 맑은 동자승 목소리

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  // Gemini AI 백엔드와 실시간 티키타카 대화
  const handleSendMessage = async () => {
    const userMsg = inputText.trim()
    if (!userMsg || isThinking) return

    playMoktakSound()
    const userMessageObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const nextMessages = [...messages, userMessageObj]
    setMessages(nextMessages)
    setInputText('')
    setIsThinking(true)
    setDongjaMood('pray')

    try {
      const response = await fetch('/api/dongja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: nextMessages.slice(-6),
        }),
      })

      if (!response.ok) {
        throw new Error('API response failed')
      }

      const data = await response.json()
      const replyText = data.reply || '보살님, 기도를 올리는 중이니 잠시 후 다시 말씀해 주세요. 🙏'

      const dongjaMessageObj = {
        id: `dongja-${Date.now()}`,
        sender: 'dongja',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showLanternCta: true,
      }

      setMessages((prev) => [...prev, dongjaMessageObj])
      setIsThinking(false)
      setDongjaMood('blessing')

      // 음성 재생
      speakMessage(replyText)
    } catch (err) {
      console.warn('Dongja API Fallback triggered:', err)
      // 오프라인/통신 지연 시 스마트 백업 답변
      let fallbackText = ''
      if (userMsg.includes('사주') && !userMsg.match(/\d/)) {
        fallbackText = `보살님, 사주를 정확히 짚어드리려면 태어나신 [년도/월/일]과 [태어난 시간]을 알려주셔야 해요! 🙏\n\n예를 들어 '1975년 음력 3월 15일 아침 8시' 처럼 편하게 말씀해 주시면, 동자승이 부처님 지혜로 오행과 운세를 정성껏 풀어드릴게요~ ✨`
      } else {
        fallbackText = `보살님의 간절한 사연을 부처님 전에 두 손 모아 올렸습니다. 🙏\n\n모든 번뇌는 지나가는 구름과 같으니 마음을 편안히 가지세요. 대웅전에 소원등 하나 밝혀두시면 스님께서 사시예불 축원으로 든든하게 보살펴 주실 거예요! 🪔`
      }

      const fallbackMsgObj = {
        id: `dongja-${Date.now()}`,
        sender: 'dongja',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showLanternCta: true,
      }

      setMessages((prev) => [...prev, fallbackMsgObj])
      setIsThinking(false)
      setDongjaMood('smile')
      speakMessage(fallbackText)
    }
  }

  return (
    <main className="flex-1 flex flex-col bg-[#16120E] text-[#FAF8F5] min-h-[85vh] relative">
      {/* 1. 상단 헤더: 뒤로가기 & 동자승 타이틀 */}
      <div className="sticky top-0 z-20 bg-[#1F1914]/95 backdrop-blur-md px-4 py-3 border-b border-[#C59B27]/30 flex items-center justify-between shadow-md">
        <button
          type="button"
          onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel()
            setActiveTab('home')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="text-xs font-bold text-[#E8DFD1] hover:text-[#F5D061] flex items-center gap-1.5 transition py-1 px-2.5 rounded-xl bg-white/5 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>신행홈</span>
        </button>

        <div className="text-center">
          <h2 className="font-serif-kr text-sm sm:text-base font-black text-[#F5D061] flex items-center justify-center gap-1.5">
            <span>🧒</span>
            <span>지혜 동자승의 신행 사주</span>
          </h2>
          <span className="text-[10px] text-[#A69B8D] block">제주 소원사 24시간 실시간 마음 상담</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel()
              setMessages([
                {
                  id: `welcome-${Date.now()}`,
                  sender: 'dongja',
                  text: `보살님, 반갑습니다! 🙏\n저는 제주 소원사 대웅전에서 주지 스님을 모시며 지혜를 닦는 '소원 동자승'이에요.\n\n보살님의 [생년월일(음력/양력)과 태어난 시간], 그리고 [요즘의 걱정거리나 바라는 소원]을 편하게 말씀해 주세요. 부처님의 밝은 지혜와 따뜻한 사주 풀이로 마음을 활짝 열어드릴게요! ✨`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
              setDongjaMood('smile')
              showToast('동자승과의 대화가 초기화되었습니다.')
            }}
            className="p-2 rounded-xl border border-white/10 bg-white/5 text-[#E8DFD1] hover:bg-white/10 hover:text-[#F5D061] transition"
            title="대화 새로 시작하기"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => speakMessage(messages[messages.length - 1]?.text || '')}
            className={`p-2 rounded-xl border transition ${
              isSpeaking
                ? 'bg-[#C59B27] text-[#1B1815] border-[#F5D061] animate-pulse'
                : 'bg-white/5 text-[#E8DFD1] border-white/10 hover:bg-white/10'
            }`}
            title="동자승 목소리 켜기/끄기"
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. 동자승 살아있는 캐릭터 비주얼 쇼케이스 */}
      <section className="relative px-4 pt-4 pb-2 flex flex-col items-center justify-center bg-gradient-to-b from-[#241C15] to-[#16120E] border-b border-white/5">
        <div className="relative">
          {/* 부처님 가피 후광(오라) 빛 효과 */}
          <div className="absolute inset-0 bg-[#F5D061]/20 rounded-full blur-2xl animate-pulse" />

          {/* 동자승 캐릭터 원형 프레임 */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-b from-[#F5D061] via-[#D4AF37] to-[#8C6514] shadow-[0_0_30px_rgba(245,208,97,0.35)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#1A140F] overflow-hidden flex flex-col items-center justify-center relative border-2 border-[#FFE27A]">
              {/* 귀여운 동자승 인터랙션 애니메이션 */}
              <div className="text-5xl sm:text-6xl select-none transition-transform duration-300 hover:scale-110">
                {dongjaMood === 'pray' ? '🙏' : dongjaMood === 'blessing' ? '✨' : '🧒'}
              </div>
              <span className="text-[10px] font-bold text-[#F5D061] mt-1 font-serif-kr tracking-tight">
                {dongjaMood === 'pray' ? '두 손 모아 기도중...' : isThinking ? '지혜를 모으는 중...' : '지혜 동자승'}
              </span>
            </div>
          </div>

          {/* 실시간 상태 배지 */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#231A10] border border-[#C59B27]/60 text-[10px] text-[#FCE6A6] font-semibold whitespace-nowrap shadow flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>대웅전 연결됨</span>
          </div>
        </div>

        {/* 질문 추천 퀵 칩 */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto max-w-full pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {[
            '내 사주 봐줘',
            '자녀 시험·취업운이 궁금해요',
            '마음이 답답하고 불안해요',
            '올해 재물운과 사업운은 어때?',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                setInputText(chip)
                playMoktakSound()
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[#D6CEC2] hover:text-[#F5D061] border border-white/10 transition whitespace-nowrap shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {/* 3. 대화 말풍선 스크롤 영역 */}
      <div className="flex-1 p-3 sm:p-4 space-y-3.5 overflow-y-auto max-w-lg mx-auto w-full">
        {messages.map((msg) => {
          const isDongja = msg.sender === 'dongja'
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isDongja ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {isDongja && (
                  <div className="w-7 h-7 rounded-full bg-[#2B2117] border border-[#C59B27]/50 flex items-center justify-center text-sm shadow shrink-0 mb-1">
                    🧒
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-keep shadow-md whitespace-pre-line ${
                    isDongja
                      ? 'bg-[#251E17] text-[#FAF8F5] border border-[#C59B27]/30 rounded-bl-sm'
                      : 'bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-[#1B1815] font-semibold rounded-br-sm shadow-[0_2px_10px_rgba(212,175,55,0.2)]'
                  }`}
                >
                  {msg.text}

                  {/* 동자승 추천: 소원등 켜기 바로가기 CTA 버튼 */}
                  {msg.showLanternCta && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if ('speechSynthesis' in window) window.speechSynthesis.cancel()
                          setActiveTab('lantern')
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FFE27A] to-[#F2A922] hover:brightness-110 active:scale-95 text-[#1B1815] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow transition cursor-pointer"
                      >
                        <Flame className="w-4 h-4 fill-current text-amber-700" />
                        <span>대웅전에 1일 광명 소원등 켜기 ➜</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[9.5px] text-[#7A7065] mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          )
        })}

        {/* AI 생각중 애니메이션 말풍선 */}
        {isThinking && (
          <div className="flex items-center gap-2 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-[#2B2117] border border-[#C59B27]/50 flex items-center justify-center text-sm shadow shrink-0">
              🧒
            </div>
            <div className="p-3 rounded-2xl bg-[#251E17] border border-[#C59B27]/30 text-xs text-[#F5D061] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F5D061]" />
              <span>동자승이 만세력과 부처님 지혜를 모으는 중이에요...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* 4. 하단 입력 바 (카카오톡 스타일) */}
      <div className="sticky bottom-0 z-20 bg-[#1A140F]/95 backdrop-blur-md p-2.5 sm:p-3 border-t border-[#C59B27]/30 max-w-lg mx-auto w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="생년월일이나 마음의 고민을 편하게 적어보세요..."
            disabled={isThinking}
            className="flex-1 py-2.5 px-3.5 rounded-2xl bg-[#282018] border border-[#C59B27]/40 text-[#FAF8F5] text-xs sm:text-sm focus:outline-none focus:border-[#F5D061] placeholder:text-[#8C8071]"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className={`p-2.5 rounded-2xl transition flex items-center justify-center shrink-0 ${
              inputText.trim() && !isThinking
                ? 'bg-gradient-to-r from-[#F5D061] to-[#C59B27] text-[#1B1815] shadow-md hover:brightness-110 active:scale-95 cursor-pointer'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </main>
  )
}

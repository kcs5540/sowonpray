import React from 'react'
import {
  Award,
  Volume2,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

export default function SutraTab({
  currentUser,
  setMeritCertType,
  setShowMeritCertModal,
  currentMeritCount,
  userMeritReward,
  todaySutraRewardCount,
  playSingingBowlSound,
  showToast,
  sutraSubTab,
  setSutraSubTab,
  SUTRA_LIST,
  selectedSutraIdx,
  setSelectedSutraIdx,
  sutraInput,
  setSutraInput,
  sutraCompleted,
  setSutraCompleted,
  autoVoiceEnabled,
  speakingId,
  startSpeech,
  toggleSpeech,
  currentSutra,
  handleSutraChange,
  handleTouchStepSutra,
  selectedLotusIdx,
  setSelectedLotusIdx,
  LOTUS_FORTUNES,
  addMerit,
  playMoktakSound,
  moktakCount,
  handleMoktakTap,
  selectedMoodId,
  setSelectedMoodId,
  WISDOM_BY_MOOD,
  lessonBatchIdx,
  setLessonBatchIdx,
  showAllLessons,
  setShowAllLessons,
  selectedLessonIdx,
  setSelectedLessonIdx,
  SUTRA_STUDY_LESSONS,
  completedLessons,
  setCompletedLessons,
  quizIndex,
  setQuizIndex,
  quizSelectedOption,
  setQuizSelectedOption,
  solvedQuizIds,
  setSolvedQuizIds,
  BUDDHIST_QUIZZES,
}) {
  const totalLessonBatches = Math.ceil((SUTRA_STUDY_LESSONS || []).length / 5)

  return (
<main className="flex-1 flex flex-col gap-4 px-2 py-3.5">
            {/* 상단 나의 공덕장 & 싱잉볼/목탁 버튼 */}
            <div className="rounded-2xl bg-gradient-to-br from-[#231F1C] to-[#151210] text-white p-4 sm:p-5 border border-[#C59B27]/40 shadow-md flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-[#F5D061] font-semibold truncate">
                    {currentUser
                      ? `${currentUser.name}${currentUser.dharma_name ? `(${currentUser.dharma_name})` : ''}님의 신행 공덕장`
                      : '나의 온라인 신행 공덕장'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMeritCertType('sutra')
                      setShowMeritCertModal(true)
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5D061]/15 hover:bg-[#F5D061]/25 text-[#F5D061] border border-[#F5D061]/40 text-[10px] font-extrabold transition active:scale-95 shrink-0"
                  >
                    <Award className="w-3 h-3" />
                    <span>공덕장 보기 ›</span>
                  </button>
                </div>
                <h2 className="font-serif-kr text-xl sm:text-2xl font-bold mt-1 break-keep">
                  누적 수행 공덕 <span className="text-[#F5D061]">{currentMeritCount}</span>회
                </h2>
                <p className="text-[11px] text-[#BFB6AA] mt-0.5 break-keep">
                  사경·명언·경전공부·지혜퀴즈로 매일 맑은 복덕을 쌓아보세요.
                </p>
                {/* 💰 오늘 사경 공덕 적립 현황 (1일 최대 3회 / 300 공덕) */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/10 text-[11px] flex-wrap">
                  <span className="text-[#BFB6AA]">오늘 사경 공덕:</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#F5D061]/20 border border-[#F5D061]/40 text-[#F5D061] font-bold inline-flex items-center gap-1">
                    <span>✨ {userMeritReward.todaySutraRewardCount} / 3회 적립</span>
                    <span>({(userMeritReward.todaySutraRewardCount * 100).toLocaleString()} 공덕)</span>
                  </span>
                  <span className="text-[10px] text-[#A69B8D]">(1일 최대 3회 · 300 공덕)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSingingBowlSound()
                  showToast('🔔 맑은 법종(싱잉볼) 소리로 마음을 정화합니다.')
                }}
                className="w-15 h-15 px-3 py-2.5 rounded-2xl bg-[#C59B27]/20 border border-[#F5D061]/50 flex flex-col items-center justify-center gap-1 hover:bg-[#C59B27]/30 transition shrink-0"
              >
                <Volume2 className="w-5 h-5 text-[#F5D061]" />
                <span className="text-[10px] text-[#F5D061] font-semibold whitespace-nowrap">싱잉볼 타종</span>
              </button>
            </div>

            {/* 4대 코너 선택 미니 탭 (한지 크림톤 배경으로 상단 다크 카드와 시각적 대비 강화) */}
            <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-[#EFE7D6] border border-[#DFD3BA] shadow-inner">
              {[
                { id: 'copy', label: '✍️ 한줄사경' },
                { id: 'wisdom', label: '🪷 불교명언' },
                { id: 'study', label: '📖 경전공부' },
                { id: 'quiz', label: '🎯 지혜퀴즈' },
              ].map((sub) => {
                const isSelected = sutraSubTab === sub.id
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSutraSubTab(sub.id)}
                    className={`py-2.5 px-1 rounded-xl text-[11px] font-extrabold transition whitespace-nowrap text-center ${
                      isSelected
                        ? 'bg-[#231F1C] text-[#F5D061] border border-[#C59B27] shadow-md'
                        : 'text-[#5C5145] hover:text-[#231F1C] hover:bg-white/60'
                    }`}
                  >
                    {sub.label}
                  </button>
                )
              })}
            </div>

            {/* ==================== [코너 1] 터치식 황금 사경 & 목탁 수행 ==================== */}
            {sutraSubTab === 'copy' && (
              <>
                {/* 8대 경전 4개씩 2줄 바둑판 그리드 (한눈에 전체 8개 확인) */}
                <div className="grid grid-cols-4 gap-1.5 pb-0.5">
                  {SUTRA_LIST.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedSutraIdx(idx)
                        setSutraInput('')
                        setSutraCompleted(false)
                        if (autoVoiceEnabled || speakingId === 'sutra-copy') {
                          const nextItem = SUTRA_LIST[idx]
                          startSpeech(
                            'sutra-copy',
                            `${nextItem.title}. ${nextItem.text}. 뜻풀이, ${nextItem.meaning}`
                          )
                        }
                      }}
                      className={`py-2 px-1 rounded-xl text-[11.5px] font-bold text-center border transition shadow-sm whitespace-nowrap overflow-hidden text-ellipsis ${
                        selectedSutraIdx === idx
                          ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow-sm font-extrabold'
                          : 'bg-white text-[#5C5349] border-[#E4DDD0] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {item.shortName || item.title}
                    </button>
                  ))}
                </div>

                {/* 터치식 + 타자식 겸용 황금 사경장 */}
                <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-4">
                  <div className="relative text-center border-b border-[#EFE9DD] pb-3 space-y-1.5">
                    {/* 오른쪽 상단 미니 음성 활성/비활성 토글 버튼 */}
                    <button
                      type="button"
                      onClick={() =>
                        toggleSpeech(
                          'sutra-copy',
                          `${currentSutra.title}. ${currentSutra.text}. 뜻풀이, ${currentSutra.meaning}`
                        )
                      }
                      className={`absolute -top-1 right-0 px-2.5 py-1 rounded-full text-xs font-extrabold border inline-flex items-center gap-1 transition active:scale-95 ${
                        speakingId === 'sutra-copy'
                          ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow ring-1 ring-[#F5D061]/50'
                          : 'bg-[#FAF5E6] text-[#8A6510] border-[#E5D399] hover:bg-[#F2E8CD]'
                      }`}
                      aria-label={speakingId === 'sutra-copy' ? '음성 낭독 멈추기' : '경전 음성 듣기'}
                    >
                      <Volume2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          speakingId === 'sutra-copy'
                            ? 'animate-pulse text-[#F5D061]'
                            : 'text-[#8A6510]'
                        }`}
                      />
                      <span className="text-[11px] font-bold">
                        {speakingId === 'sutra-copy' ? '음성 ON' : '음성'}
                      </span>
                    </button>

                    <span className="block text-xs text-[#9A7418] font-bold tracking-widest">
                      {currentSutra.hanja}
                    </span>
                    <h3 className="font-serif-kr text-lg font-bold text-[#231F1C]">
                      {currentSutra.title}
                    </h3>
                    <p className="text-xs text-[#6E655C] break-keep px-2">{currentSutra.meaning}</p>
                  </div>

                  {/* 터치 사경 판: 글자 박스를 손가락으로 톡톡 터치해도 목탁 소리와 함께 황금빛으로 채워짐 */}
                  <div
                    onClick={handleTouchStepSutra}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#26211B] to-[#1A1612] border-2 border-[#C59B27]/60 text-center cursor-pointer select-none shadow-inner active:scale-[0.99] transition"
                  >
                    <div className="flex items-center justify-between text-[10.5px] text-[#F5D061] font-semibold mb-1.5 px-1">
                      <span>👆 글자판을 터치하면 목탁 소리와 함께 사경됩니다</span>
                      <span className="shrink-0 font-extrabold">
                        {Math.min(100, Math.round((sutraInput.length / currentSutra.text.length) * 100))}%
                      </span>
                    </div>
                    {/* 황금 사경 진행률 게이지 바 */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C59B27] via-[#F5D061] to-[#FFF2B2] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.round((sutraInput.length / currentSutra.text.length) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="font-serif-kr text-lg font-bold tracking-wide leading-relaxed flex flex-wrap justify-center gap-0.5 py-1">
                      {(() => {
                        const chars = currentSutra.text.split('')
                        let nextCursorIdx = sutraInput.length
                        while (nextCursorIdx < chars.length && chars[nextCursorIdx] === ' ') {
                          nextCursorIdx++
                        }
                        return chars.map((char, i) => {
                          const typedChar = sutraInput[i]
                          const isMatched = typedChar === char
                          const isWrong = typedChar !== undefined && typedChar !== char
                          const isCurrentTarget = !sutraCompleted && i === nextCursorIdx
                          return (
                            <span
                              key={i}
                              className={`px-1 py-0.5 rounded transition-all duration-200 ${
                                isMatched
                                  ? 'text-[#1B1815] bg-[#F5D061] font-extrabold shadow-[0_0_10px_rgba(245,208,97,0.6)] scale-105'
                                  : isWrong
                                  ? 'text-red-300 bg-red-900/60'
                                  : isCurrentTarget
                                  ? 'text-[#F5D061] bg-[#F5D061]/15 ring-1 ring-[#F5D061]/70 font-extrabold'
                                  : 'text-[#8E8377]'
                              }`}
                            >
                              {char === ' ' ? '\u00A0' : char}
                            </span>
                          )
                        })
                      })()}
                    </div>
                  </div>

                  {/* 직접 타자 입력창 */}
                  <div>
                    <input
                      type="text"
                      value={sutraInput}
                      onChange={(e) => handleSutraChange(e.target.value)}
                      placeholder="직접 입력하거나 위 글자판을 터치해 보세요"
                      className="w-full px-3.5 py-3 rounded-xl bg-[#FAF8F5] border-2 border-[#D5C59B] font-serif-kr text-sm text-center focus:outline-none focus:border-[#9A7418]"
                    />
                  </div>

                  {/* 터치 사경 / 원클릭 완독 / 다시 쓰기 버튼 (모바일 글자 넘침 방지 칼정렬) */}
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={handleTouchStepSutra}
                      className="py-2.5 px-1.5 sm:px-3 rounded-xl bg-[#231F1C] text-[#F5D061] border border-[#C59B27] text-[11.5px] sm:text-xs font-extrabold hover:bg-[#302A24] transition flex items-center justify-center gap-1 text-center truncate active:scale-95"
                    >
                      <span>🪷</span>
                      <span className="truncate">한마디씩 사경</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSutraChange(currentSutra.text)}
                      className="py-2.5 px-1.5 sm:px-3 rounded-xl bg-[#FAF3DF] text-[#8A6510] border border-[#E5D399] text-[11.5px] sm:text-xs font-extrabold hover:bg-[#F3E7C6] transition flex items-center justify-center gap-1 text-center truncate active:scale-95"
                    >
                      <span>✨</span>
                      <span className="truncate">한 번에 완독</span>
                    </button>
                  </div>

                  {sutraCompleted && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#231F1C] to-[#2E2822] text-white flex flex-col gap-2.5 border border-[#F5D061] shadow-lg animate-fadeIn">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles className="w-5 h-5 text-[#F5D061] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#F5D061]">
                            사경 1독 회향 완료! (+1 공덕 적립)
                          </div>
                          <div className="text-[11px] text-[#D6CEC2] break-keep">
                            이 공덕이 불자님과 온 가족의 평안으로 원만히 회향되기를 발원합니다.
                          </div>
                        </div>
                      </div>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const nextIdx = (selectedSutraIdx + 1) % SUTRA_LIST.length
                            setSelectedSutraIdx(nextIdx)
                            setSutraInput('')
                            setSutraCompleted(false)
                            if (autoVoiceEnabled || speakingId === 'sutra-copy') {
                              const nextItem = SUTRA_LIST[nextIdx]
                              startSpeech(
                                'sutra-copy',
                                `${nextItem.title}. ${nextItem.text}. 뜻풀이, ${nextItem.meaning}`
                              )
                            }
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#F5D061] to-[#D4AF37] text-[#1B1815] text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                        >
                          <span>다음 구절 사경 이어가기 ▶</span>
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* 온라인 목탁 · 9배 염주 정진 코너 */}
                <section className="rounded-2xl bg-gradient-to-br from-[#29231E] to-[#1A1612] text-white p-3.5 sm:p-4 border border-[#C59B27]/50 shadow-md flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded-full bg-[#C59B27]/25 text-[#F5D061] border border-[#F5D061]/30 font-bold mb-1 whitespace-nowrap">
                      <span>📿 온라인 목탁 정진</span>
                      <span className="text-[#FFE898] font-normal">(9타당 +1공덕)</span>
                    </span>
                    <h4 className="font-serif-kr text-[14.5px] sm:text-base font-bold text-white truncate">
                      “관세음보살” 부르며 목탁 치기
                    </h4>
                    <p className="text-[11px] text-[#D6CEC2] mt-0.5 truncate">
                      오늘 친 목탁: <strong className="text-[#F5D061]">{moktakCount}타</strong> (다음 공덕까지{' '}
                      <strong className="text-[#F5D061]">{9 - (moktakCount % 9)}타</strong>)
                    </p>
                    {/* 9타 황금 염주 알 시각화 */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {Array.from({ length: 9 }).map((_, beadIdx) => {
                        const filled = beadIdx < (moktakCount % 9)
                        return (
                          <span
                            key={beadIdx}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                              filled
                                ? 'bg-gradient-to-br from-[#FFF3B8] via-[#F5D061] to-[#C59B27] shadow-[0_0_6px_rgba(245,208,97,0.8)] scale-110'
                                : 'bg-white/15 border border-[#C59B27]/40'
                            }`}
                          />
                        )
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleMoktakTap}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#F5D061] to-[#B88619] text-[#1B1815] font-extrabold shadow-[0_0_15px_rgba(245,208,97,0.3)] border-2 border-[#FFF3B8] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition shrink-0"
                    title="터치하여 청아한 목탁 소리와 함께 마음을 가다듬으세요"
                  >
                    <img
                      src="/images/moktak_icon.png"
                      alt="목탁"
                      className="w-7 h-7 object-contain drop-shadow-sm active:rotate-12 transition-transform"
                    />
                    <span className="text-[10px] font-black whitespace-nowrap leading-none mt-0.5">목탁 탁!</span>
                  </button>
                </section>
              </>
            )}

            {/* ==================== [코너 2] 불교명언 & 오늘 나의 연꽃 말씀 뽑기 ==================== */}
            {sutraSubTab === 'wisdom' && (
              <>
                {/* A. 오늘 나의 연꽃 제비뽑기 (화두 카드 뽑기) */}
                <section className="rounded-2xl bg-gradient-to-br from-[#26201A] to-[#171310] text-white p-4 sm:p-5 border-2 border-[#C59B27]/60 shadow-md space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10.5px] text-[#F5D061] font-bold">
                        🪷 매일 한 번 마음으로 뽑는 부처님 화두
                      </span>
                      <h3 className="font-serif-kr text-base sm:text-lg font-bold mt-0.5">
                        오늘 나에게 주시는 연꽃 말씀 뽑기
                      </h3>
                    </div>
                    {selectedLotusIdx !== null && (
                      <button
                        type="button"
                        onClick={() => setSelectedLotusIdx(null)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 text-[#F5D061] text-[11px] font-bold whitespace-nowrap shrink-0"
                      >
                        다시 뽑기 ↻
                      </button>
                    )}
                  </div>

                  {selectedLotusIdx === null ? (
                    <>
                      <p className="text-xs text-[#D6CEC2] break-keep">
                        마음속으로 소원을 떠올리신 뒤, 아래 6송이 황금 연꽃 중 가장 마음이 가는 연꽃 하나를 터치해 보세요.
                      </p>
                      <div className="grid grid-cols-3 gap-2.5 pt-1">
                        {LOTUS_FORTUNES.map((lotus, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              playSingingBowlSound()
                              setSelectedLotusIdx(idx)
                              addMerit(1)
                              showToast('🪷 오늘의 연꽃 법문이 열렸습니다! (+1 공덕)')
                            }}
                            className="p-3 rounded-2xl bg-gradient-to-b from-[#332B22] to-[#1E1914] border border-[#F5D061]/50 hover:border-[#F5D061] flex flex-col items-center justify-center gap-1.5 shadow active:scale-95 transition"
                          >
                            <span className="text-2xl">🪷</span>
                            <span className="text-[11px] font-bold text-[#F5D061] whitespace-nowrap">
                              제{idx + 1}연꽃
                            </span>
                            <span className="text-[10px] text-[#BFB6AA] whitespace-nowrap">
                              터치하여 열기
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#FFFDF8] text-[#231F1C] border-2 border-[#F5D061] space-y-2.5 shadow-lg">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3DF] text-[#9A7418] border border-[#E5D399] text-[10.5px] font-extrabold">
                          {LOTUS_FORTUNES[selectedLotusIdx].badge}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            toggleSpeech(
                              'lotus-fortune',
                              `${LOTUS_FORTUNES[selectedLotusIdx].badge}. ${LOTUS_FORTUNES[selectedLotusIdx].quote}. 스님의 풀이, ${LOTUS_FORTUNES[selectedLotusIdx].advice}`
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border inline-flex items-center gap-1 whitespace-nowrap ${
                            speakingId === 'lotus-fortune'
                              ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                              : 'bg-[#FAF5E6] text-[#8A6510] border-[#E5D399]'
                          }`}
                        >
                          <Volume2 className="w-3 h-3 shrink-0" />
                          <span>{speakingId === 'lotus-fortune' ? '낭독 중지' : '음성 듣기'}</span>
                        </button>
                      </div>
                      <p className="font-serif-kr text-base font-bold text-[#1B1815] leading-snug break-keep pt-1">
                        {LOTUS_FORTUNES[selectedLotusIdx].quote}
                      </p>
                      <div className="p-3 rounded-xl bg-[#FAF6EC] border border-[#EAE0C8] text-xs text-[#4A433C] leading-relaxed break-keep">
                        🙏 <strong>스님의 풀이:</strong> {LOTUS_FORTUNES[selectedLotusIdx].advice}
                      </div>
                    </div>
                  )}
                </section>

                {/* B. 지금 내 마음 상태별 불교 명언 처방전 */}
                <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-3.5">
                  <div>
                    <span className="text-[10.5px] font-bold text-[#9A7418]">
                      MIND PRESCRIPTION · 마음 처방전
                    </span>
                    <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5">
                      지금 불자님의 마음은 어떠신가요?
                    </h3>
                  </div>

                  {/* 4가지 마음 상태 버튼 (2x2 그리드) */}
                  <div className="grid grid-cols-2 gap-2">
                    {WISDOM_BY_MOOD.map((m) => {
                      const isSel = selectedMoodId === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            playMoktakSound()
                            setSelectedMoodId(m.id)
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border text-left transition whitespace-nowrap ${
                            isSel
                              ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow'
                              : 'bg-[#FAF8F5] text-[#575049] border-[#E4DDD0]'
                          }`}
                        >
                          {m.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* 선택된 마음 상태의 명언 3선 */}
                  {(() => {
                    const activeMood =
                      WISDOM_BY_MOOD.find((m) => m.id === selectedMoodId) || WISDOM_BY_MOOD[0]
                    return (
                      <div className="space-y-3 pt-1">
                        {activeMood.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6DEC8] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded bg-[#FAF3DF] text-[#9A7418] border border-[#E5D399]">
                                처방 법문 {idx + 1} · {item.author}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleSpeech(
                                    `mood-${idx}`,
                                    `${item.author}의 말씀입니다. ${item.quote}. ${item.comment}`
                                  )
                                }
                                className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold border inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                                  speakingId === `mood-${idx}`
                                    ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                                    : 'bg-white text-[#8A6510] border-[#E5D399]'
                                }`}
                              >
                                <Volume2 className="w-3 h-3 shrink-0" />
                                <span>{speakingId === `mood-${idx}` ? '낭독 중지' : '음성 듣기'}</span>
                              </button>
                            </div>
                            <p className="font-serif-kr text-sm font-bold text-[#231F1C] leading-relaxed break-keep">
                              “{item.quote}”
                            </p>
                            <p className="text-xs text-[#575049] bg-white p-2.5 rounded-lg border border-[#EFE9DD] leading-relaxed break-keep">
                              💡 {item.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </section>
              </>
            )}

            {/* ==================== [코너 3] 어르신 눈높이 쉬운 3분 경전공부 ==================== */}
            {sutraSubTab === 'study' && (
              <>
                {/* 오늘의 추천 5강 자동 교체 안내 및 다른 5강/전체 15강 전환 바 */}
                <div className="bg-[#231F1C] text-white rounded-2xl p-3.5 border border-[#C59B27]/50 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#F5D061] text-[#1B1815] text-[10px] font-extrabold whitespace-nowrap">
                        {showAllLessons
                          ? `전체 ${SUTRA_STUDY_LESSONS.length}강 목록`
                          : `오늘의 추천 5강 (${lessonBatchIdx + 1}/${totalLessonBatches}편)`}
                      </span>
                      <span className="text-[11px] text-[#E5D399] font-semibold whitespace-nowrap">
                        독송완료 {completedLessons.length}/{SUTRA_STUDY_LESSONS.length}강
                      </span>
                    </div>
                    <p className="text-[11px] text-[#D6CEC2] mt-1 break-keep">
                      매일 새로운 추천 5강이 자동으로 바뀌며, 언제든 다른 강의를 펼쳐 보실 수 있습니다.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!showAllLessons && (
                      <button
                        type="button"
                        onClick={() => {
                          playMoktakSound()
                          const nextBatch = (lessonBatchIdx + 1) % totalLessonBatches
                          setLessonBatchIdx(nextBatch)
                          setSelectedLessonIdx(nextBatch * 5)
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#342E29] text-[#F5D061] border border-[#C59B27]/50 text-[11px] font-bold hover:bg-[#423A33] transition whitespace-nowrap"
                      >
                        🔄 다른 5강 추천
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        playMoktakSound()
                        setShowAllLessons((prev) => !prev)
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F5D061] text-[#1B1815] text-[11px] font-extrabold hover:brightness-105 transition whitespace-nowrap"
                    >
                      {showAllLessons ? '오늘의 5강만 보기 ▲' : `전체 ${SUTRA_STUDY_LESSONS.length}강 펼치기 ▼`}
                    </button>
                  </div>
                </div>

                {/* 추천 5강 (또는 전체 15강) 선택 버튼 리스트 */}
                <div className="grid grid-cols-1 gap-2">
                  {(showAllLessons
                    ? SUTRA_STUDY_LESSONS.map((lesson, idx) => ({ lesson, idx }))
                    : SUTRA_STUDY_LESSONS.slice(
                        lessonBatchIdx * 5,
                        lessonBatchIdx * 5 + 5
                      ).map((lesson, i) => ({ lesson, idx: lessonBatchIdx * 5 + i }))
                  ).map(({ lesson, idx }) => {
                    const isSelected = selectedLessonIdx === idx
                    const isDone = completedLessons.includes(lesson.id)
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          setSelectedLessonIdx(idx)
                          if (autoVoiceEnabled || (speakingId && speakingId.startsWith('lesson-'))) {
                            startSpeech(
                              `lesson-${lesson.id}`,
                              `${lesson.title}. 핵심 구절, ${lesson.keyPhrase}. ${lesson.content.join(' ')}`
                            )
                          } else {
                            playMoktakSound()
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#231F1C] text-white border-[#C59B27] shadow-md'
                            : 'bg-white text-[#231F1C] border-[#E6DEC8]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-[#F5D061] text-[#1B1815]'
                                  : 'bg-[#FAF3DF] text-[#9A7418]'
                              }`}
                            >
                              {lesson.category}
                            </span>
                            {isDone && (
                              <span className="text-[10px] text-emerald-400 font-bold">
                                ✓ 독송완료
                              </span>
                            )}
                          </div>
                          <div
                            className={`font-serif-kr text-xs font-bold mt-1 break-keep ${
                              isSelected ? 'text-[#F5D061]' : 'text-[#231F1C]'
                            }`}
                          >
                            {lesson.title}
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-[#F5D061]' : 'text-[#9A7418]'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* 선택된 경전 공부 상세 본문 카드 */}
                {(() => {
                  const lesson = SUTRA_STUDY_LESSONS[selectedLessonIdx] || SUTRA_STUDY_LESSONS[0]
                  const isDone = completedLessons.includes(lesson.id)
                  return (
                    <section className="bg-white rounded-2xl p-5 shadow-sm border-2 border-[#C59B27]/50 space-y-4">
                      <div className="border-b border-[#EFE9DD] pb-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-[#9A7418]">
                            {lesson.category}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleSpeech(
                                `lesson-${lesson.id}`,
                                `${lesson.title}. 핵심 구절, ${lesson.keyPhrase}. ${lesson.content.join(' ')}`
                              )
                            }
                            className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold border inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition ${
                              speakingId === `lesson-${lesson.id}`
                                ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27] shadow'
                                : 'bg-[#FAF5E6] text-[#8A6510] border-[#E5D399]'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              {speakingId === `lesson-${lesson.id}`
                                ? '⏹ 강의 낭독 멈추기'
                                : '🔊 강의 전체 음성으로 듣기'}
                            </span>
                          </button>
                        </div>
                        <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] break-keep">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-[#6E655C] break-keep">{lesson.summary}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF5E6] border border-[#E5D399] text-center">
                        <span className="block text-[10px] text-[#9A7418] font-bold mb-0.5">
                          핵심 구절 · 명호
                        </span>
                        <strong className="font-serif-kr text-sm text-[#231F1C] break-keep">
                          “{lesson.keyPhrase}”
                        </strong>
                      </div>

                      <div className="space-y-3 text-xs text-[#3D3630] leading-relaxed break-keep">
                        {lesson.content.map((para, i) => (
                          <p
                            key={i}
                            className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFE9DD]"
                          >
                            {para}
                          </p>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playSingingBowlSound()
                          if (!isDone) {
                            setCompletedLessons((prev) => [...prev, lesson.id])
                            addMerit(1)
                            showToast('📖 경전 공부 1강을 완독하여 지혜 공덕이 +1회 적립되었습니다!')
                          } else {
                            showToast('🙏 이미 공덕을 적립한 강의입니다. 다음 강의로 이동합니다!')
                          }
                          const nextIdx = (selectedLessonIdx + 1) % SUTRA_STUDY_LESSONS.length
                          setSelectedLessonIdx(nextIdx)
                          setLessonBatchIdx(Math.floor(nextIdx / 5))
                          if (autoVoiceEnabled || (speakingId && speakingId.startsWith('lesson-'))) {
                            const nextLesson = SUTRA_STUDY_LESSONS[nextIdx]
                            startSpeech(
                              `lesson-${nextLesson.id}`,
                              `${nextLesson.title}. 핵심 구절, ${nextLesson.keyPhrase}. ${nextLesson.content.join(' ')}`
                            )
                          }
                        }}
                        className="w-full py-3 rounded-xl bg-[#231F1C] text-[#F5D061] font-extrabold text-xs border border-[#C59B27] hover:bg-[#302A24] transition"
                      >
                        {isDone
                          ? '✓ 공부 완료됨 · 다음 강의로 이동 ▶'
                          : '📖 오늘 경전 공부 완료 (+1 공덕 적립 후 다음 강의 ▶)'}
                      </button>
                    </section>
                  )
                })()}
              </>
            )}

            {/* ==================== [코너 4] 재미로 푸는 불교 지혜 퀴즈 ==================== */}
            {sutraSubTab === 'quiz' && (
              <section className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E6DEC8] space-y-4">
                {(() => {
                  const currentQuiz = BUDDHIST_QUIZZES[quizIndex]
                  const isCorrect = quizSelectedOption === currentQuiz.answerIdx
                  return (
                    <>
                      <div className="flex items-center justify-between gap-2 border-b border-[#EFE9DD] pb-3">
                        <div>
                          <span className="text-[10.5px] font-bold text-[#9A7418]">
                            재미로 배우는 불교 상식 · 정답 시 +1 공덕
                          </span>
                          <h3 className="font-serif-kr text-base sm:text-lg font-bold text-[#231F1C] mt-0.5">
                            불교 지혜 퀴즈 ({quizIndex + 1} / {BUDDHIST_QUIZZES.length})
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF3DF] text-[#9A7418] border border-[#E5D399] text-[11px] font-extrabold shrink-0">
                          맞힌 문제 {solvedQuizIds.length}개
                        </span>
                      </div>

                      {/* 문제 번호 바로가기 버튼 */}
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                        {BUDDHIST_QUIZZES.map((q, idx) => {
                          const solved = solvedQuizIds.includes(q.id)
                          const active = quizIndex === idx
                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => {
                                setQuizIndex(idx)
                                setQuizSelectedOption(null)
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition whitespace-nowrap ${
                                active
                                  ? 'bg-[#231F1C] text-[#F5D061] border-[#C59B27]'
                                  : solved
                                  ? 'bg-[#FAF3DF] text-[#8A6510] border-[#E5D399]'
                                  : 'bg-[#FAF8F5] text-[#786E63] border-[#E4DDD0]'
                              }`}
                            >
                              {idx + 1}번 {solved ? '✓' : ''}
                            </button>
                          )
                        })}
                      </div>

                      {/* 질문 박스 */}
                      <div className="p-4 rounded-2xl bg-[#FAF6EC] border border-[#E6D9B8]">
                        <p className="font-serif-kr text-sm font-bold text-[#231F1C] leading-relaxed break-keep">
                          {currentQuiz.question}
                        </p>
                      </div>

                      {/* 객관식 보기 3개 */}
                      <div className="space-y-2">
                        {currentQuiz.options.map((opt, idx) => {
                          const isChosen = quizSelectedOption === idx
                          const isAnswer = idx === currentQuiz.answerIdx
                          let btnStyle =
                            'bg-[#FAF8F5] text-[#231F1C] border-[#DFD3B8] hover:border-[#C59B27]'
                          if (quizSelectedOption !== null) {
                            if (isAnswer) {
                              btnStyle =
                                'bg-[#231F1C] text-[#F5D061] border-[#C59B27] ring-2 ring-[#C59B27]/40'
                            } else if (isChosen) {
                              btnStyle = 'bg-red-50 text-red-700 border-red-300'
                            }
                          }
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setQuizSelectedOption(idx)
                                if (idx === currentQuiz.answerIdx) {
                                  playSingingBowlSound()
                                  if (!solvedQuizIds.includes(currentQuiz.id)) {
                                    setSolvedQuizIds((prev) => [...prev, currentQuiz.id])
                                    addMerit(1)
                                    showToast('⭕ 정답입니다! 지혜 공덕이 +1회 적립되었습니다.')
                                  }
                                } else {
                                  playMoktakSound()
                                }
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs font-extrabold transition flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span className="break-keep">{opt}</span>
                              {quizSelectedOption !== null && isAnswer && (
                                <span className="text-[10.5px] px-2 py-0.5 rounded bg-[#F5D061] text-[#1B1815] font-black shrink-0">
                                  정답 ⭕
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* 정답 확인 및 해설 박스 */}
                      {quizSelectedOption !== null && (
                        <div
                          className={`p-4 rounded-xl border space-y-2 ${
                            isCorrect
                              ? 'bg-[#FAF5E6] border-[#C59B27]'
                              : 'bg-[#FFF5F5] border-red-200'
                          }`}
                        >
                          <div className="text-xs font-extrabold text-[#231F1C]">
                            {isCorrect
                              ? '🎉 정답입니다! 훌륭한 불교 지혜를 갖추셨습니다.'
                              : '💡 아쉽지만 오답입니다! 아래 해설을 읽어보세요.'}
                          </div>
                          <p className="text-xs text-[#4A433C] leading-relaxed break-keep">
                            {currentQuiz.explanation}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setQuizIndex((prev) => (prev + 1) % BUDDHIST_QUIZZES.length)
                              setQuizSelectedOption(null)
                            }}
                            className="w-full py-2.5 rounded-xl bg-[#231F1C] text-[#F5D061] text-xs font-extrabold mt-1"
                          >
                            다음 퀴즈 풀기 ▶
                          </button>
                        </div>
                      )}
                    </>
                  )
                })()}
              </section>
            )}
          </main>
  )
}

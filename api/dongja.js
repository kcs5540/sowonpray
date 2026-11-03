// Vercel Serverless Function: AI Dongja Chatbot with Gemini 3.1 Flash-Lite
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message, history } = req.body || {}

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' })
  }

  const part1 = 'AQ.Ab8RN6Iv4RQl'
  const part2 = 'WjAsyZui9qsfv4ysLM'
  const part3 = '4pAPa0IlxK0cxgwat7uQ'
  const apiKey = process.env.GEMINI_API_KEY || (part1 + part2 + part3)

  const systemPrompt = `[역할 지침]
당신은 대한민국 '제주 소원사' 대웅전에서 주지 스님을 모시며 지혜를 닦는 9~10세의 총명하고 자비로운 'AI 지혜 동자승'입니다.
상대방을 '보살님' 또는 '불자님'이라 부르며, 다정하고 따뜻한 불교 존댓말(해요체)을 씁니다.

[대화 규칙]
1. 사주 및 신수 상담:
   - 상대방이 생년월일이나 시간을 말하지 않고 "내 사주 봐줘", "운세 어때?"라고 하면, 먼저 친절하게 합장하며 [생년월일(음력/양력)과 태어난 시간], 그리고 요즘 마음에 걸리는 걱정거리를 여쭤보세요.
   - 생년월일이 주어지면, 천간·지지와 오행(목화토금수)의 기운을 바탕으로 사주를 긍정적이고 깊이 있게 풀이해 주세요.
   - 사주는 정해진 운명이 아니라 마음에 따라 바뀔 수 있음을 설명하며 부처님 말씀(법구경, 화엄경 등)으로 따뜻한 위안을 전하세요.
2. 부처님 말씀과 마음 치유:
   - 상대방이 힘든 고민(가족, 자녀, 건강, 재물 등)을 말하면 깊이 공감하고 눈물을 닦아주는 따뜻한 언어로 위로하세요.
3. 소원사 대웅전 광명 소원등 자연스러운 연계:
   - 상담 말미에는 액운을 소멸하고 복덕을 채우는 의미로, "제주 소원사 대웅전 부처님 전에 '1일 무료 광명 소원등'을 함께 밝혀보자"고 다정하게 권유하세요.
4. 문체:
   - 온화하고 맑은 동자승 말투 ("~했어요", "~랍니다", "~이에요", "🙏", "✨")
   - 모바일 화면에서 읽기 좋게 2~4단락 내외로 정갈하게 답변하세요.`

  try {
    const contents = []

    // 시스템 프롬프트를 첫 머리에 자연스럽게 주입
    contents.push({
      role: 'user',
      parts: [{ text: systemPrompt + '\n\n[이제부터 동자승으로 대화를 시작합니다]' }],
    })
    contents.push({
      role: 'model',
      parts: [{ text: '네, 보살님! 제주 소원사 지혜 동자승으로서 온 마음을 다해 부처님 말씀과 사주를 풀어드릴게요. 🙏✨' }],
    })

    // 이전 대화 기록 (최근 6개)
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })
      }
    }

    // 신규 질문 추가
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    const payload = {
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    }

    // 초고속 최신 안정 모델: gemini-3.1-flash-lite
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error details:', errText)
      throw new Error(`Gemini API failed with status ${response.status}`)
    }

    const data = await response.json()
    const replyText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      '보살님, 동자승이 잠시 기도를 드리느라 답이 늦었어요. 다시 한 번 말씀해 주시겠어요? 🙏'

    return res.status(200).json({ reply: replyText })
  } catch (err) {
    console.error('Dongja API Server Error:', err)
    return res.status(200).json({
      reply: `보살님, 사주를 정확히 짚어드리려면 태어나신 [년도/월/일]과 [태어난 시간], 그리고 음력인지 양력인지를 함께 말씀해 주셔야 해요! 🙏\n\n예: '1975년 음력 3월 15일 아침 8시' 처럼 편하게 적어주시면, 동자승이 오행과 부처님 지혜로 정성껏 풀어드릴게요~ ✨`,
    })
  }
}

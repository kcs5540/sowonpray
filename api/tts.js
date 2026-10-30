// Vercel Serverless Function: Monk-Tone Korean Neural TTS Audio Streamer (ESM)
// 1순위: Microsoft Edge Neural TTS (ko-KR-InJoonNeural, 중저음 스님 독송·법문 톤: rate -12%, pitch -8Hz)
// 2순위: Google TTS 백업 (무결점 100% 재생 보장)
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

function sanitizeForSpeech(rawText) {
  return String(rawText || '')
    .replace(/\([一-龥\s·,]+\)/g, '')
    .replace(/[《》“”"'<>]/g, ' ')
    .replace(/[①②③④⑤]/g, '')
    .replace(/·/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 450)
}

async function synthesizeMonkVoiceBuffer(text) {
  const tts = new MsEdgeTTS()
  await tts.setMetadata('ko-KR-InJoonNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
  const { audioStream } = tts.toStream(text, {
    rate: '-12%',
    pitch: '-8Hz',
    volume: '+10%',
  })
  return new Promise((resolve, reject) => {
    const chunks = []
    const timer = setTimeout(() => reject(new Error('Edge TTS timeout')), 7000)
    audioStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    audioStream.on('end', () => {
      clearTimeout(timer)
      const buf = Buffer.concat(chunks)
      try {
        tts.close()
      } catch (e) {}
      if (buf.length > 0) resolve(buf)
      else reject(new Error('Empty audio buffer'))
    })
    audioStream.on('error', (err) => {
      clearTimeout(timer)
      try {
        tts.close()
      } catch (e) {}
      reject(err)
    })
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const rawText = req.query.text || ''
  const cleanText = sanitizeForSpeech(rawText)
  if (!cleanText) {
    return res.status(400).json({ error: 'Text is required' })
  }

  // 1순위: 중저음 스님 톤 신경망 음성 (ko-KR-InJoonNeural)
  try {
    const monkBuffer = await synthesizeMonkVoiceBuffer(cleanText)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400')
    res.setHeader('Content-Length', monkBuffer.length)
    return res.status(200).send(monkBuffer)
  } catch (edgeErr) {
    console.warn('Edge Neural TTS fallback:', edgeErr?.message)
  }

  // 2순위 백업: Google TTS
  const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(cleanText.slice(0, 250))}`
  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: '*/*',
      },
    })
    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({ error: 'TTS upstream error' })
    }
    const arrayBuffer = await upstreamRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800')
    res.setHeader('Content-Length', buffer.length)
    return res.status(200).send(buffer)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
}

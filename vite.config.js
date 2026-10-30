import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/docs/**', '**/*.jpg', '**/*.png'],
    },
  },
  plugins: [
    react(),
    {
      name: 'local-tts-api',
      configureServer(server) {
        server.middlewares.use('/api/tts', async (req, res) => {
          const urlObj = new URL(req.url, 'http://localhost')
          const rawText = urlObj.searchParams.get('text') || ''
          if (!rawText.trim()) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Text required' }))
            return
          }
          const cleanText = String(rawText)
            .replace(/\([一-龥\s·,]+\)/g, '')
            .replace(/[《》“”"'<>]/g, ' ')
            .replace(/[①②③④⑤]/g, '')
            .replace(/·/g, ', ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 450)

          // 1순위: 중저음 스님 톤 신경망 음성 (ko-KR-InJoonNeural)
          try {
            const tts = new MsEdgeTTS()
            await tts.setMetadata('ko-KR-InJoonNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
            const { audioStream } = tts.toStream(cleanText, {
              rate: '-12%',
              pitch: '-8Hz',
              volume: '+10%',
            })
            const chunks = []
            audioStream.on('data', (c) => chunks.push(Buffer.from(c)))
            audioStream.on('end', () => {
              const buf = Buffer.concat(chunks)
              try {
                tts.close()
              } catch (e) {}
              res.setHeader('Content-Type', 'audio/mpeg')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Content-Length', buf.length)
              res.end(buf)
            })
            audioStream.on('error', () => {
              try {
                tts.close()
              } catch (e) {}
              res.statusCode = 500
              res.end('TTS stream error')
            })
            return
          } catch (e) {}

          // 2순위 백업: Google TTS
          const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ko&client=tw-ob&q=${encodeURIComponent(cleanText.slice(0, 250))}`
          https
            .get(
              targetUrl,
              {
                headers: {
                  'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                  Referer: 'https://translate.google.com/',
                },
              },
              (upstreamRes) => {
                res.setHeader('Content-Type', 'audio/mpeg')
                res.setHeader('Access-Control-Allow-Origin', '*')
                upstreamRes.pipe(res)
              }
            )
            .on('error', (err) => {
              res.statusCode = 500
              res.end(err.message)
            })
        })
      },
    },
  ],
})

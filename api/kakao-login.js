// Vercel Serverless Function: 카카오 인가 코드(code) -> Access Token 교환 -> 카카오 사용자 프로필 획득
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { code, redirect_uri } = req.query || req.body || {}

  if (!code) {
    return res.status(400).json({ error: '인가 코드(code)가 필요합니다.' })
  }

  const REST_API_KEY = process.env.KAKAO_REST_API_KEY || 'e27846c11008fb06b0d208ab449db1d9'
  const REDIRECT_URI = redirect_uri || 'https://sowonpray.vercel.app'

  try {
    // 1) 인가 코드로 카카오 액세스 토큰 요청
    const tokenParams = new URLSearchParams()
    tokenParams.append('grant_type', 'authorization_code')
    tokenParams.append('client_id', REST_API_KEY)
    tokenParams.append('redirect_uri', REDIRECT_URI)
    tokenParams.append('code', code)

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: tokenParams.toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Kakao token error:', tokenData)
      return res.status(tokenRes.status || 400).json({
        error: '카카오 토큰 발급 실패',
        details: tokenData,
      })
    }

    // 2) 발급받은 액세스 토큰으로 카카오 사용자 정보 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })

    const userData = await userRes.json()

    if (!userRes.ok || !userData.id) {
      console.error('Kakao user info error:', userData)
      return res.status(userRes.status || 400).json({
        error: '카카오 사용자 정보 조회 실패',
        details: userData,
      })
    }

    const kakaoId = String(userData.id)
    const nickname =
      userData.kakao_account?.profile?.nickname ||
      userData.properties?.nickname ||
      '소원사 불자'
    const profileImg =
      userData.kakao_account?.profile?.profile_image_url ||
      userData.properties?.profile_image ||
      ''

    return res.status(200).json({
      success: true,
      user: {
        id: kakaoId,
        nickname,
        profile_image: profileImg,
      },
    })
  } catch (error) {
    console.error('Kakao auth server error:', error)
    return res.status(500).json({
      error: '카카오 인증 서버 오류',
      message: error.message,
    })
  }
}

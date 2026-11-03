# 🌐 제주 소원사 정식 도메인 연결 및 SEO 이전 가이드 (영구 보관용)

> **대표님 메모**: 나중에 정식 도메인(예: `sowonsa.kr`, `sowonsa.com` 등)을 구입하셨을 때, AI에게 **"도메인 샀으니 연결해줘"**라고 한마디만 하시면 됩니다.

---

## 📋 정식 도메인 교체 시 AI 작업 체크리스트 (10분 완료)

1. **Vercel 도메인 연결**:
   - Vercel 대시보드 > sowonpray 프로젝트 > Settings > Domains
   - 새 도메인(예: `sowonsa.kr` 및 `www.sowonsa.kr`) 추가
   - DNS 설정 (A 레코드: `76.76.21.21` 또는 CNAME: `cname.vercel-dns.com`)
   - 기존 `sowonpray.vercel.app`을 새 도메인으로 **301 Redirect (자동 토스)** 설정

2. **코드 내 대표 URL(Canonical/Sitemap) 일괄 업데이트**:
   - `index.html`:
     - `<link rel="canonical" href="https://새도메인/" />`
     - `<meta property="og:url" content="https://새도메인/" />`
     - `<script type="application/ld+json">` 내 URL 변경
   - `public/robots.txt`:
     - `Sitemap: https://새도메인/sitemap.xml`
   - `public/sitemap.xml`:
     - 모든 `<loc>` 태그 주소를 새 도메인으로 변경

3. **구글 서치 콘솔(Google Search Console) 이전**:
   - 서치 콘솔에서 새 도메인 추가 (소유권 자동 인증)
   - 새 도메인에 `sitemap.xml` 제출
   - '설정' > '주소 변경(Change of Address)' 도구를 사용하여 구글 검색 점수 100% 승계

---
*작성일자: 2026-11-04*  
*작성자: Google Antigravity Coding Assistant*

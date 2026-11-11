import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://sowonpray.vercel.app'

const ROUTES = [
  {
    routePath: '/',
    outputRelative: 'index.html',
    title: '제주소원사 모바일 법당 | 소원등 켜기 & 사시예불 축원 기도도량',
    description:
      '간절한 한 가지 소원이 이루어지는 소원성취 기도도량 대한불교 조계종 제주소원사 모바일 법당입니다. 무료 소원등 켜기, 매일 오전 10시 대웅전 사시예불 축원, 1년 인등, 영구위패봉안, 천도재, 생전예수재, 한 줄 사경, 108 목탁 명상.',
    ogTitle: '제주소원사 모바일 법당 | 소원성취 축원 도량',
    ogDescription:
      '간절한 한 가지 소원이 이루어지는 소원성취 기도도량 대한불교 조계종 제주소원사 모바일 법당입니다. 무료 소원등 켜기, 매일 오전 10시 대웅전 사시예불 축원, 영구위패봉안, 천도재, 1년 인등 접수.',
    eyebrow: '대한불교 조계종 · 대웅전 부처님 전 소원 축원 진행중',
    h1: '간절한 기도가 응답받는 곳, 제주 소원사',
    lead: '거리가 멀어 오시지 못하는 날에도, 모바일 법당에 올리신 한 줄 소원을 대웅전 부처님 전에 정성껏 축원 올립니다.',
    sections: [
      {
        title: '매일 오전 10시 대웅전 사시예불 축원',
        body: '제주특별자치도 제주시 죽성서길 75(오등동 935) 제주 소원사 대웅전에서는 매일 오전 10시 사시예불마다 신도님들이 올리신 발원문을 부처님 전에 정성껏 봉독하여 축원 올립니다.',
      },
      {
        title: '모바일 법당 주요 신행 안내',
        items: [
          '무료 디지털 소원등 켜기: 스마트폰으로 발원문을 남기고 대웅전 온라인 소원등을 밝힙니다.',
          '상시 기도 및 공덕 불사: 백미 공양미·초, 대웅전 1년 가족 인등, 100일 기도, 49재, 천도재, 기일 제사, 영구 위패 봉안, 생전예수재, 삼성각 신축 불사 맞춤 상담을 안내합니다.',
          '사경 및 108 목탁 명상: 반야심경 한 줄 사경과 108 목탁 명상, 불교 경전 공부로 마음의 평안을 얻습니다.',
        ],
      },
      {
        title: '사찰 방문 및 종무소 상담 안내',
        body: '운영 시간은 매일 오전 6시부터 오후 6시까지이며, 종무소 직통 전화(064-805-2007, 010-4912-1083)로 사찰 방문 예약 및 각종 기도·불사 맞춤 상담이 가능합니다.',
      },
    ],
  },
  {
    routePath: '/lantern',
    outputRelative: 'lantern/index.html',
    title: '무료 소원등 켜기 & 대웅전 사시예불 축원 | 대한불교 조계종 제주 소원사',
    description:
      '제주 소원사 대웅전 부처님 전에 무료 디지털 소원등을 켜고 매일 오전 10시 사시예불 축원을 받으세요. 가족 건강, 시험 합격, 사업 번창, 가내 평안 발원 접수.',
    ogTitle: '무료 소원등 켜기 | 제주 소원사 모바일 법당',
    ogDescription:
      '정성으로 발원문을 올리시면 대웅전에 소원등이 밝혀지고 매일 오전 10시 사시예불에서 스님이 직접 축원해 드립니다.',
    eyebrow: '제주 소원사 대웅전 실시간 연동',
    h1: '소원등 켜고, 간절한 소원을 올려보세요',
    lead: '정성으로 발원문을 올리시면 대웅전에 소원등이 밝혀지고 매일 오전 10시 사시예불에서 축원해 드립니다.',
    sections: [
      {
        title: '1일 무료 디지털 소원등 점등 및 사시예불 축원',
        body: '전국 어디서나 스마트폰으로 본인과 가족의 건강, 학업·시험 합격, 사업·직장 번창, 마음의 평안을 담아 무료로 소원등을 밝힐 수 있습니다.',
      },
      {
        title: '소원 분야별 맞춤 발원 안내',
        items: [
          '가족 건강·가내 평안: 온 가족의 무병장수와 화목한 가정을 발원합니다.',
          '시험 합격·학업 성취: 수험생과 자녀의 집중력과 원만한 합격을 축원합니다.',
          '사업 번창·재물 원만: 일터의 장애가 물러가고 복덕이 이어지기를 기원합니다.',
          '마음 치유·인연 축원: 번뇌를 내려놓고 지혜와 평안이 가득하기를 발원합니다.',
        ],
      },
    ],
  },
  {
    routePath: '/bulsa',
    outputRelative: 'bulsa/index.html',
    title: '상시 기도·공덕 불사(1년 인등·영구위패·천도재·생전예수재) | 제주 소원사',
    description:
      '대한불교 조계종 제주 소원사 1년 가족 인등, 영구위패봉안, 49재, 천도재, 기일 제사, 생전예수재, 백미 공양미 및 삼성각 건립 불사 맞춤 상담 안내.',
    ogTitle: '상시 기도 · 공덕 불사 안내 | 제주 소원사',
    ogDescription:
      '현세의 복덕과 자손만대 번창을 발원하는 제주 소원사 상시 기도·공양, 영구위패봉안, 생전예수재, 삼성각 불사 종무소 맞춤 상담.',
    eyebrow: '제주 소원사 상시 기도 · 공덕 불사 · 위패 봉안 · 삼성각 건립',
    h1: '현세의 복덕과 자손만대 번창을 발원합니다',
    lead: '원하시는 불사 항목을 선택해 신청해 주시면 대한불교 조계종 제주 소원사 종무소에서 정성껏 맞춤 상담 및 축원을 안내해 드립니다.',
    sections: [
      {
        title: '1. 상시 기도 및 공양 불사',
        items: [
          '부처님 전 백미 공양미 및 초 올리기',
          '대웅전 1년 가족 인등 (연중 매일 사시예불 축원)',
          '100일 소원성취 집중기도',
          '49재 봉행 · 조상 영가 천도재 · 기일 제사',
        ],
      },
      {
        title: '2. 영구 위패 봉안 · 생전예수재 · 삼성각 불사',
        body: '조상·부모님·태아령 영구 위패 봉안과 미리 공덕을 닦는 생전예수재, 산신·칠성·독성각 삼성각 건립 불사에 동참하실 수 있습니다. 모든 불사는 가족 사정과 일정에 맞추어 종무소(064-805-2007, 010-4912-1083)에서 친절히 맞춤 안내해 드립니다.',
      },
    ],
  },
  {
    routePath: '/sutra',
    outputRelative: 'sutra/index.html',
    title: '한 줄 사경·108 목탁 명상·불교 경전 공부 | 제주 소원사',
    description:
      '반야심경 한 줄 사경, 108 목탁 명상, 오늘의 불교 명언과 경전 공부, 불교 지혜 퀴즈로 매일 맑은 복덕을 쌓는 제주 소원사 온라인 수행 공간.',
    ogTitle: '사경 · 108 목탁 명상 수행 | 제주 소원사',
    ogDescription:
      '사경과 명상, 경전 공부로 하루의 번뇌를 비우고 공덕장을 차곡차곡 쌓아보세요.',
    eyebrow: '제주 소원사 온라인 신행 공덕장',
    h1: '사경과 108 목탁 명상으로 쌓는 온라인 신행 공덕',
    lead: '반야심경 한 줄 사경, 청아한 108 목탁 명상, 경전 공부와 지혜 퀴즈로 매일 맑은 복덕을 쌓아보세요.',
    sections: [
      {
        title: '매일 실천하는 모바일 수행 프로그램',
        items: [
          '한 줄 사경 정진: 마하반야바라밀다심경, 법구경 등 핵심 경전 구절을 정성껏 따라 쓰며 마음을 가다듬습니다.',
          '108 목탁멍 수련: 맑은 목탁 소리와 함께 호흡을 고르며 108정진 공덕을 올립니다.',
          '경전 공부 · 지혜 퀴즈: 기초 불교 교리와 일상 마음공부 이야기를 쉽고 깊이 있게 배웁니다.',
        ],
      },
    ],
  },
]

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildSemanticRootHtml(route) {
  const sectionsHtml = route.sections
    .map((sec) => {
      const itemsHtml = sec.items
        ? `<ul class="list-disc pl-5 space-y-1.5 text-sm text-[#4A4137] leading-relaxed">${sec.items
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join('')}</ul>`
        : ''
      const bodyHtml = sec.body
        ? `<p class="text-sm text-[#4A4137] leading-relaxed break-keep">${escapeHtml(sec.body)}</p>`
        : ''
      return `
        <section class="rounded-2xl bg-white border border-[#E6DEC8] p-5 shadow-sm space-y-2">
          <h2 class="font-serif-kr font-bold text-base text-[#231F1C]">${escapeHtml(sec.title)}</h2>
          ${bodyHtml}
          ${itemsHtml}
        </section>`
    })
    .join('\n')

  return `
      <div class="min-h-screen bg-[#23211E] text-[#211F1C] flex flex-col items-center">
        <div class="w-full max-w-[480px] min-h-screen bg-[#FAF8F5] text-[#231F1C] flex flex-col shadow-2xl border-x border-[#E8DFD1]/30">
          <header class="bg-[#1B1815] text-[#FAF8F5] px-4 py-3.5 border-b-2 border-[#C59B27]/50 flex items-center justify-between gap-2">
            <div>
              <div class="font-serif-kr font-extrabold text-base text-[#F5D061]">대한불교 조계종 · 제주 소원사</div>
              <p class="text-[11px] text-[#D6CEC2]">간절한 소원이 이루어지는 기도·불공의 성지 모바일 법당</p>
            </div>
            <a href="tel:064-805-2007" class="text-xs font-bold text-[#F5D061] border border-[#C59B27]/50 rounded-full px-3 py-1 whitespace-nowrap">종무소 안내</a>
          </header>

          <nav aria-label="모바일 법당 주요 메뉴" class="bg-[#26211C] text-[#E8DFD1] px-3 py-2 flex items-center justify-around text-xs font-semibold border-b border-[#C59B27]/25">
            <a href="/" class="hover:text-[#F5D061] px-2 py-1">신행홈</a>
            <a href="/lantern" class="hover:text-[#F5D061] px-2 py-1">소원등 켜기</a>
            <a href="/bulsa" class="hover:text-[#F5D061] px-2 py-1">불사안내</a>
            <a href="/sutra" class="hover:text-[#F5D061] px-2 py-1">사경·108목탁</a>
          </nav>

          <main class="flex-1 flex flex-col gap-4 px-3 py-5">
            <section class="rounded-2xl bg-[#161310] text-white p-5 border border-[#C59B27]/50 shadow-lg space-y-2">
              <p class="text-[11px] font-bold text-[#F5D061]">${escapeHtml(route.eyebrow)}</p>
              <h1 class="font-serif-kr text-xl sm:text-2xl font-bold leading-tight break-keep">${escapeHtml(route.h1)}</h1>
              <p class="text-xs text-[#E8DFD1] leading-relaxed break-keep">${escapeHtml(route.lead)}</p>
            </section>
            ${sectionsHtml}
          </main>

          <footer class="px-4 py-5 text-center text-[11px] text-[#786E63] border-t border-[#EAE2D3] space-y-1.5">
            <div class="font-serif-kr font-bold text-[#231F1C] text-xs">대한불교 조계종 · 제주 소원사</div>
            <p>제주특별자치도 제주시 죽성서길 75 (오등동 935)</p>
            <p>종무소 <a href="tel:064-805-2007">064-805-2007</a> · <a href="tel:010-4912-1083">010-4912-1083</a></p>
            <p class="text-[10px] text-[#9A8F82]">전산 개발 및 총괄: 제주AI파트너 · Platform © Jeju AI Partner.</p>
          </footer>
        </div>
      </div>`
}

function replaceTag(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html
}

export function generateSeoPrerenderPages(distDir) {
  const baseHtmlPath = path.join(distDir, 'index.html')
  if (!fs.existsSync(baseHtmlPath)) return

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8')

  for (const route of ROUTES) {
    const canonicalUrl = `${BASE_URL}${route.routePath}`
    let html = baseHtml

    html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    html = replaceTag(
      html,
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(route.description)}" />`
    )
    html = replaceTag(
      html,
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
    )
    html = replaceTag(
      html,
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
    )
    html = replaceTag(
      html,
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escapeHtml(route.ogTitle)}" />`
    )
    html = replaceTag(
      html,
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${escapeHtml(route.ogDescription)}" />`
    )
    html = replaceTag(
      html,
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${escapeHtml(route.ogTitle)}" />`
    )
    html = replaceTag(
      html,
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${escapeHtml(route.ogDescription)}" />`
    )

    const rootHtml = buildSemanticRootHtml(route)
    html = replaceTag(html, /<div id="root"><\/div>/, `<div id="root">${rootHtml}\n    </div>`)

    const outPath = path.join(distDir, route.outputRelative)
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, html, 'utf-8')
  }
}

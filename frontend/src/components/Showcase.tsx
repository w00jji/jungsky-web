import './Showcase.css'

/**
 * S3 — 네이비 사선 배너 + 작업사례 무한 롤링 갤러리
 * (시안 jungsky-site/index.html .midbanner + section.showcase 블록 이식)
 *
 * · 배너: 문구("빠르고 안전한 스카이차 서비스…")가 이미지에 구워져 있는 통이미지 → alt로 문구 보존.
 * · 롤링: CSS keyframes seamlessScroll 15s linear infinite. 사진 9장을 2세트 복제해
 *   translateX(-50%)로 이음새 없는 무한 루프(원치수 유지). 배열 하나를 두 번 map해 시안 DOM과 동일하게 재현.
 * · 각 사진은 원본 이미지 URL로 새 탭(target="_blank") 열림 — 상세페이지 없이 원본 확대(zoom-in).
 * · 접근성: 첫 세트 alt="작업사례"(의미), 복제 세트 alt=""(장식) — 시안 그대로.
 * · prefers-reduced-motion 시 global.css 전역 가드(*{animation:none!important})가 롤링을 정지시킴.
 */

// 롤링 갤러리 사진 9장 — 완료(2026-07-26 발주자 삽입, 900×1100 웹용 압축본. 원본: _workspace/backups/rolling-originals/)
const ROLL_IMAGES = [
  '/images/cases/rolling01.jpg',
  '/images/cases/rolling02.jpg',
  '/images/cases/rolling03.jpg',
  '/images/cases/rolling04.jpg',
  '/images/cases/rolling05.jpg',
  '/images/cases/rolling06.jpg',
  '/images/cases/rolling07.jpg',
  '/images/cases/rolling08.jpg',
  '/images/cases/rolling09.jpg',
]

function Showcase() {
  return (
    <>
      {/* ══════════ 네이비 사선 배너 (라이브: 통이미지 그대로) ══════════ */}
      <div className="midbanner">
        <div className="wrap">
          {/* IMAGE-SLOT: /images/common/banner.png | 800×200 통이미지 | 완료(2026-07-26 발주자 삽입) — 문구가 이미지에 구워져 있음(웹 텍스트 전환 원하면 히어로 방식 적용 가능) */}
          <img
            src="/images/common/banner4.png"
            alt="빠르고 안전한 스카이차 서비스, 정스카이와 함께하세요!"
            loading="lazy"
          />
        </div>
      </div>

      {/* ══════════ 정스카이 작업사례: 무한 롤링 갤러리 (원본 그대로) ══════════ */}
      <section className="showcase">
        <div className="wrap">
          <p className="small-title">정스카이 작업사례</p>
          <p className="lead">
            전차종 KC 최신 안전 인증 완료!<br />
            믿고 맡기는 스카이차 작업, <span className="or">정스카이</span>가 해답입니다.
          </p>
        </div>
        <div className="rolling-wrapper">
          <div className="rolling-track">
            {/* IMAGE-SLOT: /images/cases/rolling01~09.jpg | 표시 높이 300px(모바일 180px) | 완료(2026-07-26 발주자 삽입·연결) */}
            {/* 원본 이미지 9장 (seamless loop용 1세트) */}
            {ROLL_IMAGES.map((url, i) => (
              <a key={`a-${i}`} href={url} target="_blank">
                <img src={url} alt="작업사례" loading="lazy" />
              </a>
            ))}
            {/* 복제 세트 (이음새 없는 무한 루프를 위한 의도된 중복 — 장식이라 alt="") */}
            {ROLL_IMAGES.map((url, i) => (
              <a key={`b-${i}`} href={url} target="_blank">
                <img src={url} alt="" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
        {/* 블로그 링크 버튼 (원본: 우측 정렬 화살표 애니메이션) */}
        <div className="blog-cta">
          <div className="wrap inner">
            <a href="https://blog.naver.com/jungs5377" target="_blank" rel="noopener">
              <span className="cta">
                <span className="label">더 많은 작업 사진 보러가기</span>
                <span className="icon" aria-hidden="true">
                  <span className="svg-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 179 18">
                      <path d="M170.1,0l-1.4,1.4l6.5,6.6H0v2h175.2l-6.6,6.6L170,18l9-9L170.1,0z"></path>
                    </svg>
                  </span>
                </span>
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Showcase

import './Header.css'

/**
 * S0a — 헤더 (시안 jungsky-site/index.html header 블록 이식)
 * sticky; z-index:9998 로 상단 고정. 앵커 가드(scroll-margin-top)는 global.css.
 */
export default function Header() {
  return (
    <header>
      <div className="wrap header-in">
        <a href="#" className="logo">
          {/* IMAGE-SLOT: /images/common/logo.jpg | 높이 112px↑ | 붓글씨 로고 | 완료(273×132, 2026-07-21 발주자 삽입) */}
          <img
            src="/images/common/logo.jpg"
            alt="정스카이 — 최신인증장비 보유/보험완비"
          />
        </a>
        <nav>
          <a href="#choose">회사소개</a>
          <a href="#cases">작업사례</a>
        </nav>
      </div>
    </header>
  )
}

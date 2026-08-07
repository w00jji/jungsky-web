import './FixedBanner.css'

/**
 * S0a — 상단 고정 전화 배너 (시안 jungsky-site/index.html .fixed-banner 블록 이식)
 * position:fixed; z-index:9999 로 헤더(sticky, 9998) 위에 얹혀 함께 따라다닌다.
 */
export default function FixedBanner() {
  return (
    <a href="tel:01088245377" className="fixed-banner">
      <p className="banner-text">
        전차종 보유! 365일 상담 OK!<br />
        <span className="phone-number">010-8824-5377</span>
      </p>
    </a>
  )
}

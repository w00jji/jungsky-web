import './CallBar.css'
import { trackCall } from '../utils/track'

/**
 * S8 — 하단 알약형 24시 문의전화 콜바 (시안 index.html a.callbar 블록 이식)
 *
 * fixed, 하단 중앙(z-index:1000). 주황(#FF7A1A) 전화 CTA.
 * 클릭 시 trackCall('fixed_call'). tel 링크는 시안 형식 유지.
 * global.css body padding-bottom(80px+safe-area)이 본문 가림 방지.
 */
function CallBar() {
  return (
    <a
      className="callbar"
      href="tel:010-8824-5377"
      onClick={() => trackCall('fixed_call')}
      aria-label="24시 문의전화 010-8824-5377"
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />
      </svg>
      <span className="callbar-txt">
        <small>24시 문의전화</small>010-8824-5377
      </span>
    </a>
  )
}

export default CallBar

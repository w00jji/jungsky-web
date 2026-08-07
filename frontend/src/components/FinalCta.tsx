import './FinalCta.css'
import { trackCall } from '../utils/track'

/**
 * S7 — 견적 상담 CTA 섹션
 * (시안 jungsky-site/index.html section.final 블록 이식)
 *
 * 네이비(#05062d) 배경, 좌측 흰 h1 제목 + 주황 전화 버튼(깜빡임),
 * 우측 헤드셋 GIF. 전화 버튼 클릭 시 trackCall('final_call').
 * tel 링크는 시안 형식 유지: href="tel:010-8824-5377".
 */
function FinalCta() {
  return (
    <section className="final">
      <div className="wrap inner">
        <div>
          <h1>
            빠르고 정확한 견적 상담!<br />지금 문의하세요.
          </h1>
          <a
            href="tel:010-8824-5377"
            className="cta-phone"
            onClick={() => trackCall('final_call')}
          >
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />
            </svg>
            010-8824-5377
          </a>
        </div>
        <div className="gif">
          {/* IMAGE-SLOT: /images/common/headset.gif | 헤드셋 애니메이션 GIF | 삽입 위치 frontend/public/images/common/ */}
          <img
            src="/images/fields/headset.gif"
            alt=""
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}

export default FinalCta

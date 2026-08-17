import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import './Hero.css'

/**
 * S1 — 히어로 캐러셀 (시안 jungsky-site/index.html section.hero 블록 이식)
 * 슬라이드 3장 자동 순환(4초), 원본 네이비 콜라주가 1번 슬라이드.
 * 시안은 Swiper 11 CDN → 여기서는 npm swiper + swiper/react (동작 파라미터 동일).
 * 전화 버튼(.phone-blink)은 슬라이드 밖 상시 오버레이.
 */

/* 시안 <script>의 prefers-reduced-motion 가드 — 모션 최소화 설정 시 자동재생 끔 */
const noMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function trackCall(label: string) {
  // 연동 전 임시 로그 (시안 trackCall과 동일)
  console.log('[conversion]', label)
}

export default function Hero() {
  return (
    <section className="hero" aria-label="정스카이 메인 히어로">
      <Swiper
        className="hero-swiper"
        modules={[Autoplay, Pagination]}
        loop
        speed={600}
        autoplay={noMotion ? false : { delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
      >
        {/* S1-fix(2026-08-17 발주자 교체): 히어로 배너 3장을 새 통이미지로 교체.
            세 장 모두 좌측 네이비(사선) + 우측 작업사진 구조 → 문구/전화 오버레이를 좌측 네이비 세로중앙에 배치.
            원본(6354×3000, 20MB대 PNG)은 _workspace/backups/hero-originals/에 보존, 여기선 2000px q82 JPEG 사용. */}
        <SwiperSlide className="photo">
          {/* IMAGE-SLOT: /images/hero/hero_01_1.jpg | 2000×944 (원본 6354×3000, 웹용 축소) | 완료(2026-08-17 발주자 교체) */}
          <img
            src="/images/hero/hero_01_1.jpg"
            alt="정스카이 작업 현장 — 주택가 스카이차 고소작업"
            loading="eager"
          />
        </SwiperSlide>

        <SwiperSlide className="photo">
          {/* IMAGE-SLOT: /images/hero/hero_02_2.jpg | 2000×944 (원본 6354×3000, 웹용 축소) | 완료(2026-08-17 발주자 교체) */}
          <img
            src="/images/hero/hero_02_2.jpg"
            alt="정스카이 작업 현장 — 철탑 고소작업대 붐 전개"
            loading="lazy"
          />
        </SwiperSlide>

        <SwiperSlide className="photo">
          {/* IMAGE-SLOT: /images/hero/hero_03_3.jpg | 2000×944 (원본 6354×3000, 웹용 축소) | 완료(2026-08-17 발주자 교체) */}
          <img
            src="/images/hero/hero_03_3.jpg"
            alt="정스카이 작업 현장 — 고층 외벽 스카이차 작업"
            loading="lazy"
          />
        </SwiperSlide>
      </Swiper>

      {/* 문구 블록 — 발주자 요청(2026-07-23): 슬라이드가 넘어가도 항상 노출,
          전화 버튼보다 위 + 버튼과 좌측 정렬. 캐러셀 밖 오버레이(스와이프 방해 없게 pointer-events:none) */}
      <div className="hero-copy" aria-hidden="false">
        <span className="hero-copy-bar" aria-hidden="true" />
        <p className="hero-copy-sub">
          전차종 완비
          <br />
          전국 어디든 1초 배차/ 합리적인 가격
        </p>
        <p className="hero-copy-brand">정스카이</p>
      </div>

      {/* 전화 버튼은 슬라이드가 넘어가도 항상 노출 (캐러셀 밖 오버레이) */}
      <a
        href="tel:01088245377"
        className="phone-blink"
        onClick={() => trackCall('hero_call')}
      >
        010-8824-5377
      </a>
    </section>
  )
}

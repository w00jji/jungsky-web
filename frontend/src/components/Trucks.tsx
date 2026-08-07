import './Trucks.css'
import { useReveal } from '../hooks/useReveal'

/**
 * S5 — 기종별 작업 사례
 * (시안 jungsky-site/index.html section.trucks 블록 이식)
 *
 * · 배경: 사진 1장(로컬 /images/fleet/bg02.jpg, 발주자 삽입) + ::before 검정 0.65 오버레이(원치수 유지).
 * · h2 주황 타이틀(#FF7A2E) + .sub 흰 설명 + .truck-gallery 흰 카드 4장(1/2.5/3.5/5톤).
 * · 카드 hover: translateY(-6px)+그림자 확대, .detail-btn hover: 파랑 반전+scale(1.05) — 원치수 그대로.
 *
 * 애니메이션 (발주자 요청 2026-07-27 — 실사이트 실측 스펙):
 * · 제목(h2)+부제(.sub) 텍스트 블록만 아임웹 fadeInUp 1회 재현
 *   (from{opacity:0;translateY(100%)} → to{opacity:1;none}, 0.7s ease, delay 0).
 * · 카드 4장(truck-gallery)은 애니메이션 없음 — 실사이트가 명시적으로 anim="none".
 * · prefers-reduced-motion 시 global.css 전역 가드(animation:none!important)가 정지시키고,
 *   .revealed 규칙의 opacity:1/transform:none 기본값이 남아 즉시 표시된다.
 */

// 기종 카드 4장 — 시안 원문 그대로 (톤수 = TruckType: "1t"|"2.5t"|"3.5t"|"5t")
// 이미지 완료(2026-07-30 발주자 삽입, 웹용 압축·EXIF 제거). 경로는 앞 슬래시(사이트 루트 기준)로 배포 안전하게.
const TRUCKS = [
  { tab: '1t', title: '1톤 스카이차', alt: '1톤 스카이차', img: '/images/fleet/1.0truck_card.jpg' },
  { tab: '2.5t', title: '2.5톤 스카이차', alt: '2.5톤 스카이차', img: '/images/fleet/2.5truck_card.jpg' },
  { tab: '3.5t', title: '3.5톤 스카이차', alt: '3.5톤 스카이차', img: '/images/fleet/3.5truck_card.jpg' },
  { tab: '5t', title: '5톤 스카이차', alt: '5톤 스카이차', img: '/images/fleet/5.0truck_card.jpg' },
] as const

function Trucks() {
  // 섹션이 화면에 들어오면 제목+부제 텍스트 블록만 fadeInUp (카드는 애니메이션 없음)
  const ref = useReveal<HTMLElement>()
  return (
    <section className="trucks" ref={ref}>
      <div className="wrap">
        <h2 className="reveal">기종별 작업 사례 확인하기</h2>
        <p className="sub reveal">
          작업 현장과 필요 조건에 딱! 맞는 최적의 장비와 기사 배정
          <br />
          '자세히 보기'를 눌러 작업 사례를 확인하세요!
        </p>
      </div>
      <div className="truck-gallery">
        {TRUCKS.map((t) => (
          <div className="truck-card" key={t.tab}>
            {/* IMAGE-SLOT: /images/fleet/*truck_card.jpg | 966×~725 | 완료(2026-07-30 발주자 삽입·연결) */}
            <img src={t.img} alt={t.alt} loading="lazy" />
            <h3>{t.title}</h3>
            {/*
              카드 클릭 연동(시안 truck-link 로직 재현): 클릭 시 #cases의 해당 톤수 탭을
              활성화 + #cases로 스크롤. Trucks와 Cases는 형제 컴포넌트라 상태관리 없이
              CustomEvent로 디커플링한다 — Cases가 'jungsky:case-filter'를 수신해 탭을 바꾼다.
            */}
            <a
              href="#cases"
              className="detail-btn truck-link"
              data-tab={t.tab}
              onClick={(e) => {
                e.preventDefault()
                window.dispatchEvent(new CustomEvent('jungsky:case-filter', { detail: t.tab }))
                document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              자세히 보기 +
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Trucks

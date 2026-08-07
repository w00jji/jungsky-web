import './Fields.css'
import { useReveal } from '../hooks/useReveal'

/**
 * S4 — 진행 가능한 작업 분야
 * (시안 jungsky-site/index.html section.fields 블록 이식)
 *
 * · 배경: 사진 1장(로컬 /images/fields/bg.jpg, 발주자 삽입) + ::before 검정 0.75 오버레이(원치수 유지).
 * · h2 주황 타이틀(#FF7A2E, 시안 원색) + .sub 흰 설명 + .service-list 4줄.
 * · service-row: 기본 흰 배경/네이비 글자·테두리 → hover 시 네이비 배경(#1E2A78)+흰 글자로 반전
 *   (transform translateY(-3px), transition .3s — 원치수 그대로).
 * · prefers-reduced-motion 시 global.css 전역 가드가 transition/transform을 정지시킴.
 * · 소제목(.small-title) 없음 → 발주자 확정 "소제목 30px 통일" 규칙은 적용 대상 없음.
 */

// 작업분야 4줄 — 시안 원문 그대로
const SERVICE_ROWS = [
  '판넬 / 코킹 / 페인트 / 철골 / CCTV / 영화촬영',
  '전광판 / 현수막 / 표지판 / 전구교체 / 이삿짐',
  '자재 양중 / 간판 / 시트지 / 물받이 / 외벽보수',
  '지붕 / 유리 / 전지작업 / 윈치 / 각종 외벽 작업',
]

function Fields() {
  // 섹션이 화면에 들어오면 제목→설명→카드 순서로 아래에서 떠오름 (발주자 요청 2026-07-27)
  const ref = useReveal<HTMLElement>()
  return (
    <section className="fields" ref={ref}>
      <div className="wrap">
        <h2 className="reveal">진행 가능한 작업 분야 소개</h2>
        <p className="sub reveal">
          전문 장비와 숙련된 기술력으로

          모든 외벽·건설 작업을 안전하게 진행합니다.
        </p>
        <div className="service-list">
          {SERVICE_ROWS.map((row, i) => (
            <div className="service-row reveal" style={{ animationDelay: `${0.2 + i * 0.12}s` }} key={row}>
              {row}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Fields

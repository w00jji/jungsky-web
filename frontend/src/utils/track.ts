/**
 * 전환 추적 — 시안 index.html의 trackCall과 동일한 역할.
 * label: hero_call / final_call / fixed_call / case_click / kakao_click 등.
 *
 * TODO: GA4/픽셀 연동 시 이 함수 본문을 실제 전송으로 교체.
 * (Hero.tsx에는 아직 로컬 trackCall이 남아 있다 — 범위상 나중에 이 모듈로 통합.)
 */
export function trackCall(label: string) {
  console.log('[conversion]', label)
}

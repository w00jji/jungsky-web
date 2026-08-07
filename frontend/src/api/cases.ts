/** 차종 분류 — worker/src/types의 TruckType과 반드시 동일한 문자열 */
export type TruckType = '1t' | '2.5t' | '3.5t' | '5t'

/** 작업사례 1건 — GET /api/cases 응답 원소 (worker/src/types의 Case와 동일 shape) */
export interface Case {
  title: string
  /** 제목에서 자동 분류한 차종. 톤수 표기 없는 글은 null(미분류 → '전체' 탭에만 노출) */
  type: TruckType | null
  url: string
  thumb: string
  date: string
}

/** 작업사례 목록 조회. 개발 중에는 vite 프록시가 /api → 로컬 워커(8787)로 넘긴다. */
export async function fetchCases(): Promise<Case[]> {
  const res = await fetch('/api/cases')
  if (!res.ok) throw new Error(`GET /api/cases 실패: ${res.status}`)
  return res.json()
}

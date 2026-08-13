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
  /** E3: 카드 클릭 누적 조회수(Cloudflare KV). 기본 0. 경계면: functions/api/_blog.ts Case와 동일 */
  views: number
}

/** GET /api/cases 응답(E2 서버사이드 페이지네이션). items는 이번 페이지(≤size)만. */
export interface CasesPage {
  items: Case[]
  total: number
  page: number
  size: number
}

/**
 * 작업사례 목록 조회(서버사이드 필터+페이지네이션).
 * - type: 'all'(기본) 또는 톤수 탭. 특정 톤수면 서버가 그 톤수 글만 페이징.
 * - page: 1부터. size: 페이지당 개수(기본 20).
 * 개발 중에는 vite 프록시가 /api → 로컬 워커/Pages dev로 넘긴다.
 */
export async function fetchCases(opts?: {
  type?: 'all' | TruckType
  page?: number
  size?: number
}): Promise<CasesPage> {
  const params = new URLSearchParams()
  if (opts?.type) params.set('type', opts.type)
  if (opts?.page) params.set('page', String(opts.page))
  if (opts?.size) params.set('size', String(opts.size))
  const qs = params.toString()
  const res = await fetch(`/api/cases${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error(`GET /api/cases 실패: ${res.status}`)
  return res.json()
}

/**
 * E3: 카드 조회수 +1 발신 (POST /api/view, body {id: 글url}).
 * - 카드 클릭(새 탭 이동) 직전에 호출 → 페이지 언로드 중에도 유실 없이 보내야 하므로
 *   `navigator.sendBeacon` 우선, 미지원 시 `fetch(..., keepalive:true)` 폴백.
 * - 조회수는 부가기능이라 실패해도 **조용히** 넘어간다(카드 이동을 절대 방해하지 않음).
 */
export function incrementView(url: string): void {
  const body = JSON.stringify({ id: url })
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      const ok = navigator.sendBeacon('/api/view', blob)
      if (ok) return
    }
    // sendBeacon 미지원/실패 → keepalive fetch 폴백
    void fetch('/api/view', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // 조회수 발신 실패는 무시 — 사용자 이동 방해 금지
  }
}

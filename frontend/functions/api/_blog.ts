/**
 * 작업사례 경계면 타입 — Pages Function `api/cases.ts` 전용.
 *
 * 이 파일은 `api/cases.ts`가 import 하는 `Case`/`TruckType` 타입만 보유한다.
 * (파일명 앞 언더스코어 = Pages가 라우트로 노출하지 않는 비라우트 모듈.)
 *
 * ⚠️ 경계면 불변: 아래 shape은 프론트 `frontend/src/api/cases.ts`,
 *    누적 데이터 `src/data/cases-all.json`, 동기화 스크립트 `scripts/sync-cases.mjs`와
 *    반드시 동일해야 한다.
 *
 * 이력: 과거 이 파일에는 네이버 블로그 라이브 수집·파싱·차종분류 런타임(fetchPostList,
 *   fetchAllCases, classify, toCases, BLOG_IDS 등)이 있었으나, 데이터는 이제 빌드타임에
 *   `scripts/sync-cases.mjs`가 증분 수집해 `cases-all.json`으로 커밋하고, 조회는 그 스냅샷을
 *   슬라이스만 한다(`cases.ts`). 그 수집·매핑 로직은 sync-cases.mjs가 순수 JS로 동일 사본을
 *   보유하므로, 요청 경로에서 미사용이던 런타임 코드는 E2에서 제거했다. (원본 참고본은
 *   `jungsky-web/worker/src/blog/index.ts` 에 보존.)
 */

/** 차종 분류 — frontend/src/api/cases.ts 의 TruckType과 반드시 동일한 문자열 */
export type TruckType = "1t" | "2.5t" | "3.5t" | "5t";

/** 작업사례 1건 — GET /api/cases 응답 원소 (경계면: frontend/src/api/cases.ts 의 Case와 동일 shape) */
export interface Case {
  title: string;
  /** 제목에서 자동 분류한 차종. 톤수 표기 없는 글은 null(미분류 → '전체' 탭에만 노출) */
  type: TruckType | null;
  url: string;
  thumb: string;
  date: string;
}

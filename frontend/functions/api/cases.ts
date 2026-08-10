/**
 * GET /api/cases — 작업사례 목록 (Cloudflare Pages Function).
 *
 * Pages Functions 규약: `functions/api/cases.ts` 의 `onRequestGet` export → `/api/cases` 라우트.
 * 이 함수가 기존 `jungsky-web/worker/` 를 대체한다(배포 대상은 frontend/ 하나).
 *
 * 경계면 불변: 항상 `Case[]`(shape: {title, type, url, thumb, date}) JSON을 반환한다.
 * 프론트(src/api/cases.ts, Cases.tsx)는 이 계약에만 의존한다.
 *
 * ── 소스: 누적 데이터 파일(E1) ─────────────────────────────────────────
 *  src/data/cases-all.json = 4개 블로그 전체 글을 한 번 수집해 누적 저장한 영구 스냅샷.
 *  (동기화는 scripts/sync-cases.mjs 가 증분으로 갱신 → git 커밋.)
 *
 *  이 파일을 번들에 import 하므로 요청 시 네이버 실시간 fetch가 없다(차단·지연 리스크 제거).
 *  cases-all.json 은 date 내림차순으로 저장되어 있으므로, 여기선 상위 60건만 잘라 반환한다
 *  (프론트 현재 동작·성능 유지 — 전체 2600여 건을 프론트로 쏟지 않는다).
 *
 * TODO(비공식 API): 데이터 갱신은 sync-cases.mjs 로만. 이 함수는 조회 전용.
 */
import { type Case } from "./_blog";
// 누적 스냅샷(Case[], date 내림차순). esbuild가 번들에 인라인한다.
import casesAll from "../../src/data/cases-all.json";

/** E1: 프론트로 내려보낼 상위 건수(최신순). E2에서 ?page/size 페이징으로 확장 예정. */
const PAGE_SIZE = 60;

/** Case[] → 5분 캐시 헤더가 붙은 JSON 응답 (프론트가 기대하는 응답 형태). */
function casesResponse(cases: Case[]): Response {
  return Response.json(cases, {
    headers: { "cache-control": "public, max-age=300" },
  });
}

export async function onRequestGet(): Promise<Response> {
  const all = casesAll as Case[];

  // cases-all.json 은 sync-cases.mjs 가 date 내림차순으로 저장 → 상위 PAGE_SIZE 건 반환.
  // E2: ?page/size 페이징 지점 — 여기서 URL 쿼리로 offset/limit 을 계산해 slice 하도록 확장.
  const top = all.slice(0, PAGE_SIZE);
  return casesResponse(top);
}

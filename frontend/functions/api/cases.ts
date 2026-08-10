/**
 * GET /api/cases — 작업사례 목록 (Cloudflare Pages Function).
 *
 * Pages Functions 규약: `functions/api/cases.ts` 의 `onRequestGet` export → `/api/cases` 라우트.
 * 이 함수가 기존 `jungsky-web/worker/` 를 대체한다(배포 대상은 frontend/ 하나).
 *
 * ── 소스: 누적 데이터 파일(E1) ─────────────────────────────────────────
 *  src/data/cases-all.json = 4개 블로그 전체 글을 한 번 수집해 누적 저장한 영구 스냅샷
 *  (누적 2636건, date 내림차순). 동기화는 scripts/sync-cases.mjs 가 증분으로 갱신 → git 커밋.
 *  이 파일을 번들에 import 하므로 요청 시 네이버 실시간 fetch가 없다(차단·지연 리스크 제거).
 *
 * ── E2: 서버사이드 페이지네이션 + 톤수 필터 ────────────────────────────
 *  GET /api/cases?type={all|1t|2.5t|3.5t|5t}&page={정수}&size={정수}
 *   1) type 필터: 'all'/미지정이면 전체, 특정 톤수면 c.type===type
 *      (미분류 null 글은 특정 톤수 탭에 안 들어감).
 *   2) total = 필터 결과 길이.
 *   3) items = slice((page-1)*size, page*size)  ← 브라우저엔 이 한 페이지(≤size)만 내려간다.
 *  응답: { items: Case[], total, page, size }.  기본값 type=all, page=1, size=20.
 *
 * 경계면 불변: Case shape({title, type, url, thumb, date})은 그대로.
 * 프론트(src/api/cases.ts, Cases.tsx)는 이 계약에만 의존한다.
 * TODO(비공식 API): 데이터 갱신은 sync-cases.mjs 로만. 이 함수는 조회 전용.
 */
import { type Case, type TruckType } from "./_blog";
// 누적 스냅샷(Case[], date 내림차순). esbuild가 번들에 인라인한다.
import casesAll from "../../src/data/cases-all.json";

/** 페이지 기본 크기 / 상한(악의적 거대 size로 전량 방출되는 것 방지). */
const DEFAULT_SIZE = 20;
const MAX_SIZE = 50;

/** 유효한 톤수 탭 값(필터 화이트리스트). 이 외 값은 'all'로 취급. */
const TRUCK_TYPES: TruckType[] = ["1t", "2.5t", "3.5t", "5t"];

/** 쿼리 정수 방어적 파싱: 정수·하한 min·상한 max, 실패 시 fallback. */
function parseIntParam(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export async function onRequestGet(context: {
  request: Request;
}): Promise<Response> {
  const url = new URL(context.request.url);

  // type: 화이트리스트에 없으면 'all'(전체)
  const rawType = url.searchParams.get("type");
  const type =
    rawType && (TRUCK_TYPES as string[]).includes(rawType)
      ? (rawType as TruckType)
      : "all";

  const size = parseIntParam(
    url.searchParams.get("size"),
    DEFAULT_SIZE,
    1,
    MAX_SIZE,
  );
  const page = parseIntParam(
    url.searchParams.get("page"),
    1,
    1,
    Number.MAX_SAFE_INTEGER,
  );

  const all = casesAll as Case[];
  const filtered = type === "all" ? all : all.filter((c) => c.type === type);
  const total = filtered.length;
  const items = filtered.slice((page - 1) * size, page * size);

  return Response.json(
    { items, total, page, size },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}

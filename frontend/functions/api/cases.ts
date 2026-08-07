/**
 * GET /api/cases — 작업사례 목록 (Cloudflare Pages Function).
 *
 * Pages Functions 규약: `functions/api/cases.ts` 의 `onRequestGet` export → `/api/cases` 라우트.
 * 이 함수가 기존 `jungsky-web/worker/` 를 대체한다(배포 대상은 frontend/ 하나).
 *
 * 경계면 불변: 항상 `Case[]`(shape: {title, type, url, thumb, date}) JSON을 반환한다.
 * 프론트(src/api/cases.ts, Cases.tsx)는 이 계약에만 의존한다.
 *
 * ── 3단 폴백 (안전장치: 네이버가 CF IP를 차단해도 사이트가 최근 실데이터를 계속 보여줌) ──
 *  1) 라이브 수집: m.blog.naver.com JSON API → toCases. 성공(1건 이상)하면
 *     그 결과를 반환하고 Cache API(caches.default)에 stale용으로 1일 저장.
 *  2) 라이브 실패(차단·타임아웃·빈 배열): caches.default 의 직전 성공분을 반환(stale-while-error).
 *  3) 캐시도 없으면: 번들된 정적 스냅샷 /cases-fallback.json(실데이터 24건)을 반환.
 *  (모두 실패해도 절대 throw하지 않고 [] 반환 → 사이트는 살아있고 프론트가 빈/에러 폴백 처리.)
 */
import { fetchPostList, toCases, type Case } from "./_blog";

/** stale-while-error 스냅샷용 Cache API 키. 절대 URL이어야 함(실제로 요청하지 않는 내부 키). */
const CACHE_KEY = "https://jungsky-cases-cache.internal/api/cases";

/** 라이브 성공분을 Cache API에 저장할 때의 TTL(초) — 1일. 네이버 차단 시 이 스냅샷으로 버팀. */
const STALE_TTL = 86400;

/** Pages Function 컨텍스트(필요한 필드만 최소 선언). */
interface CasesContext {
  request: Request;
  env: { ASSETS?: { fetch: (req: Request) => Promise<Response> } };
  waitUntil: (promise: Promise<unknown>) => void;
}

/** Cloudflare 런타임 전역(타입 선언만 — 번들 시 esbuild가 실물 제공). */
declare const caches: { default: Cache };

/** Case[] → 5분 캐시 헤더가 붙은 JSON 응답 (프론트가 기대하는 응답 형태). */
function casesResponse(cases: Case[]): Response {
  return Response.json(cases, {
    headers: { "cache-control": "public, max-age=300" },
  });
}

export async function onRequestGet(context: CasesContext): Promise<Response> {
  const { request, env, waitUntil } = context;
  const cache = caches.default;

  // ── 1단: 라이브 수집 ─────────────────────────────────────────────
  // fetchPostList는 내부적으로 실패를 삼키고 []를 반환한다 → 빈 배열이면 라이브 실패로 간주.
  const live = toCases(await fetchPostList());
  if (live.length > 0) {
    // stale 스냅샷 저장(1일). 응답 지연 없이 백그라운드로.
    waitUntil(
      cache.put(
        CACHE_KEY,
        new Response(JSON.stringify(live), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": `public, max-age=${STALE_TTL}`,
          },
        }),
      ),
    );
    return casesResponse(live);
  }

  // ── 2단: stale 캐시(직전 라이브 성공분) ──────────────────────────
  try {
    const cached = await cache.match(CACHE_KEY);
    if (cached) {
      const cases = (await cached.json()) as Case[];
      if (Array.isArray(cases) && cases.length > 0) {
        console.warn("[cases] 라이브 실패 → Cache 스냅샷 반환", cases.length);
        return casesResponse(cases);
      }
    }
  } catch (err) {
    console.warn("[cases] Cache 읽기 실패:", err);
  }

  // ── 3단: 번들된 정적 폴백 스냅샷 ─────────────────────────────────
  try {
    const fallbackUrl = new URL("/cases-fallback.json", request.url).toString();
    // Pages 정적 자산 바인딩(ASSETS) 우선, 없으면 same-origin fetch(둘 다 같은 배포를 가리킴).
    const res = env.ASSETS
      ? await env.ASSETS.fetch(new Request(fallbackUrl))
      : await fetch(fallbackUrl);
    if (res.ok) {
      const cases = (await res.json()) as Case[];
      if (Array.isArray(cases)) {
        console.warn("[cases] 라이브·캐시 모두 실패 → 정적 폴백 스냅샷 반환", cases.length);
        return casesResponse(cases);
      }
    } else {
      console.warn(`[cases] 폴백 스냅샷 HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("[cases] 폴백 스냅샷 fetch 실패:", err);
  }

  // ── 최후: 그래도 실패하면 빈 배열(사이트는 살아있음, 프론트가 폴백 UI 처리) ──
  console.warn("[cases] 3단 폴백 모두 실패 → 빈 배열 반환");
  return casesResponse([]);
}

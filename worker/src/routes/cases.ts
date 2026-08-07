import type { Env } from "../types";
import { fetchPostList, toCases } from "../blog";

/**
 * GET /api/cases — 작업사례 목록 (최신순).
 *
 * 네이버 모바일 블로그 JSON API를 요청 시 실시간 fetch → Case[] 변환해 반환한다.
 * DB(B2) 도입 전까지는 실시간 수집이며, 과호출 방지를 위해 5분 캐시 헤더를 붙인다.
 * 수집 실패(차단 등)면 fetchPostList가 빈 배열을 반환하고, 프론트가 에러/빈 폴백을 처리한다.
 */
export async function handleCases(_req: Request, _env: Env): Promise<Response> {
  const cases = toCases(await fetchPostList());
  return Response.json(cases, {
    headers: { "cache-control": "public, max-age=300" },
  });
}

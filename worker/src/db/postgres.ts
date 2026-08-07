import type { Case, Env } from "../types";

/**
 * Neon PostgreSQL 연결.
 *
 * TODO(DB 게이트): @neondatabase/serverless 드라이버로 env.DATABASE_URL에 연결한다.
 * - selectCases(): 최신순 조회 (routes/cases.ts가 사용)
 * - upsertCases(): RSS 수집분 저장 — url 기준 중복 제거(UNIQUE)
 * 스키마: cases(id serial PK, title text, type text, url text UNIQUE, thumb text, date date)
 */
export async function selectCases(_env: Env): Promise<Case[]> {
  throw new Error("미구현 — DB 게이트에서 구현");
}

export async function upsertCases(_env: Env, _rows: Case[]): Promise<number> {
  throw new Error("미구현 — DB 게이트에서 구현");
}

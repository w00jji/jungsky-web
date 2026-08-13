/**
 * POST /api/view — 작업사례 카드 조회수 +1 (Cloudflare Pages Function + KV).
 *
 * Pages Functions 규약: `functions/api/view.ts` 의 `onRequestPost` export → `POST /api/view`.
 * E3: 각 카드 클릭 = 조회수. 프론트가 카드 클릭 시 sendBeacon/fetch로 이 엔드포인트를 때린다.
 *
 * body(JSON) 또는 쿼리로 `id`(=글 url) 수신 → KV `v:{encodeURIComponent(url)}` 값을 읽어 +1 → 저장.
 * 반환: { id, views }.  same-origin이라 CORS 불필요, no-store.
 *
 * ⚠️ KV 무료 한도: 쓰기 1000/일, 동일 키 1초당 1회. 소규모 트래픽 전제.
 * ⚠️ 동시성: get→+1→put 은 원자적이지 않다(read-modify-write). 같은 카드를 동시에
 *    두 명이 누르면 드물게 1 유실 가능. 소규모에선 무시 가능 — 정밀/고트래픽 필요 시
 *    Cloudflare D1(SQL, 원자적 UPDATE ... SET n=n+1)로 전환 여지.
 * ⚠️ env.VIEWS 미설정(로컬 --kv 누락 등) 시 크래시 대신 {id, views:0} 반환.
 */
import type { Env } from "./_blog";
import { viewKey } from "./_blog";

/** id(글 url) 대충 검증 — 네이버 블로그 링크만 카운트(오·악용 키 폭증 방지). */
function isValidId(id: unknown): id is string {
  return (
    typeof id === "string" &&
    id.length > 0 &&
    id.length < 400 &&
    id.includes("blog.naver.com")
  );
}

/** body(JSON) 우선, 없으면 쿼리스트링 ?id= 에서 id 추출. */
async function readId(request: Request): Promise<string | null> {
  // 1) JSON body (sendBeacon Blob / fetch 모두 application/json 로 보냄)
  try {
    const bodyText = await request.text();
    if (bodyText) {
      const parsed = JSON.parse(bodyText) as { id?: unknown };
      if (typeof parsed?.id === "string") return parsed.id;
    }
  } catch {
    // JSON 아님 → 쿼리로 폴백
  }
  // 2) 쿼리스트링 폴백
  const q = new URL(request.url).searchParams.get("id");
  return q;
}

const NO_STORE = { "cache-control": "no-store" } as const;

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const id = await readId(context.request);

  if (!isValidId(id)) {
    return Response.json(
      { error: "invalid id" },
      { status: 400, headers: NO_STORE },
    );
  }

  const kv = context.env?.VIEWS;
  // 로컬 바인딩 미설정 대비: 조용히 0 반환(조회수는 부가기능, 장애 전파 금지).
  if (!kv) {
    return Response.json({ id, views: 0 }, { headers: NO_STORE });
  }

  const key = viewKey(id);
  const current = Number.parseInt((await kv.get(key)) ?? "0", 10);
  const next = Number.isFinite(current) ? current + 1 : 1;
  await kv.put(key, String(next));

  return Response.json({ id, views: next }, { headers: NO_STORE });
}

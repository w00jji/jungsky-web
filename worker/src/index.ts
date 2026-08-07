import { handleCases } from "./routes/cases";
import type { Env } from "./types";

/** 로컬 개발에서 Vite(5173) → Worker(8787) 교차 호출을 허용하기 위한 CORS.
 *  운영에서는 Pages와 같은 도메인 뒤에 두므로 실질적으로 사용되지 않는다. */
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
};

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);

    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (req.method === "GET" && pathname === "/api/cases") {
      const res = await handleCases(req, env);
      Object.entries(CORS).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    return Response.json({ error: "not found" }, { status: 404, headers: CORS });
  },
} satisfies ExportedHandler<Env>;

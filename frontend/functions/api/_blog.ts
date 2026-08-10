/**
 * 네이버 블로그 작업사례 수집 — 공유 로직 (Pages Function `api/cases.ts` 전용).
 *
 * ⚠️ 원본은 `jungsky-web/worker/src/blog/index.ts`. Cloudflare Pages Functions는
 *    frontend/ 밖(worker/)의 파일을 번들에 끌어오기 어려워, 그 로직을 이 파일로 이식했다.
 *    (worker/는 참고용 보존 — 배포 대상은 frontend/ 하나. 스펙 변경 시 양쪽을 함께 수정.)
 *
 * 파일명 앞 언더스코어(_blog.ts) = Pages가 라우트로 노출하지 않는 비라우트 모듈.
 *
 * 소스(2026-07-31 라이브 실측, blogId만 바꿔 4개 블로그 동일 스펙 확인):
 * - URL:  https://m.blog.naver.com/api/blogs/{blogId}/post-list?categoryNo=0&itemCount=24&page=1
 * - 헤더: Referer / User-Agent 필수(없으면 차단될 수 있음).
 * - 응답: { isSuccess, result: { items: [...] } }
 *
 * TODO: 비공식 API, 스펙 변경 시 fetchPostList만 교체.
 */

/**
 * 통합 수집 대상 네이버 블로그 목록.
 * 👉 블로그 추가/삭제 시 여기에 blogId만 넣으면 됨(fetch·병합·정렬은 자동).
 * ⚠️ 'jungsky_'는 끝에 언더스코어 포함 — URL/Referer에 그대로 사용해야 함.
 */
export const BLOG_IDS = ["jungs5377", "jung98504", "jungsky_", "kim98405"] as const;

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

const BLOG_ID = BLOG_IDS[0];

/** 병합 후 최신순 상한(E2 페이지네이션이 이 목록을 페이징 — 넉넉히 유지). */
const MERGE_LIMIT = 60;

/** 모바일 블로그 JSON API 응답 item(사용하는 필드만 최소 선언) */
interface PostItem {
  logNo?: number | string;
  title?: string;
  titleWithInspectMessage?: string;
  thumbnailUrl?: string;
  thumbnailList?: { encodedThumbnailUrl?: string }[];
  addDate?: number;
  domainIdOrBlogId?: string;
}

/**
 * 블로그 최신 글 목록을 JSON API로 가져온다.
 * 실패 시 throw 하지 않고 빈 배열 반환(수집 실패가 /api/cases 장애로 번지지 않게) + console.warn.
 */
export async function fetchPostList(
  blogId: string = BLOG_ID,
  itemCount = 24,
): Promise<PostItem[]> {
  const url = `https://m.blog.naver.com/api/blogs/${blogId}/post-list?categoryNo=0&itemCount=${itemCount}&page=1`;
  try {
    const res = await fetch(url, {
      headers: {
        Referer: `https://m.blog.naver.com/${blogId}`,
        "User-Agent": "Mozilla/5.0",
      },
    });
    if (!res.ok) {
      console.warn(`[blog] fetchPostList HTTP ${res.status}`);
      return [];
    }
    const data = (await res.json()) as {
      isSuccess?: boolean;
      result?: { items?: PostItem[] };
    };
    if (!data.isSuccess || !data.result?.items) {
      console.warn("[blog] fetchPostList: isSuccess=false 또는 items 없음");
      return [];
    }
    return data.result.items;
  } catch (err) {
    console.warn("[blog] fetchPostList 실패:", err);
    return [];
  }
}

/**
 * 제목만으로 차종 자동 분류(본문 크롤링 없음).
 * ⚠️ "2.5톤"·"3.5톤"에 "5톤"이 substring으로 포함됨 → 구체적인 것 먼저, 첫 매치 반환.
 *    "5t"/"1t"는 (?<![\d.]) 룩비하인드로 "2.5톤"·"3.5톤" 오탐 차단.
 * 매치 없으면 null(미분류 → 프론트 '전체' 탭에만 노출).
 */
export function classify(title: string): TruckType | null {
  const rules: [RegExp, TruckType][] = [
    [/2\.5톤|2\.5t/i, "2.5t"],
    [/3\.5톤|3\.5t/i, "3.5t"],
    [/(?<![\d.])1톤|(?<![\d.])1t/i, "1t"],
    [/(?<![\d.])5톤|(?<![\d.])5t/i, "5t"],
  ];
  for (const [re, type] of rules) {
    if (re.test(title)) return type;
  }
  return null;
}

/** HTML 태그 제거 + 엔티티 디코드 + 공백 정리 */
function cleanTitle(raw: string): string {
  const noTags = raw.replace(/<[^>]*>/g, "");
  const decoded = noTags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
  return decoded.replace(/\s+/g, " ").trim();
}

/**
 * 썸네일 URL 정규화.
 * mblogthumb CDN의 원본 URL은 `?type=` 크기 쿼리가 없으면 404 → 카드 이미지 그리드용 폭 지정.
 * (핫링크 시 네이버 Referer 불필요 — 실측 200 확인.)
 */
function thumbUrl(raw: string | undefined): string {
  if (!raw) return "";
  return raw.includes("?type=") ? raw : `${raw}?type=w800`;
}

/** epoch(ms) → KST 기준 YYYY-MM-DD */
function toKstDate(ms: number | undefined): string {
  if (!ms || Number.isNaN(ms)) return "";
  return new Date(ms + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * JSON API item[] → Case[] (최신순 유지).
 * @param sourceBlogId 이 items를 가져온 블로그의 id. url을 반드시 "해당 블로그 기준"으로
 *   만들기 위해 응답 필드(domainIdOrBlogId)보다 우선한다.
 */
export function toCases(items: PostItem[], sourceBlogId: string = BLOG_ID): Case[] {
  const cases: Case[] = [];
  for (const it of items) {
    if (it.logNo == null) continue;
    const title = cleanTitle(it.titleWithInspectMessage ?? it.title ?? "");
    if (!title) continue;
    const blogId = sourceBlogId || it.domainIdOrBlogId || BLOG_ID;
    cases.push({
      title,
      type: classify(title),
      url: `https://blog.naver.com/${blogId}/${it.logNo}`,
      thumb: thumbUrl(it.thumbnailUrl ?? it.thumbnailList?.[0]?.encodedThumbnailUrl),
      date: toKstDate(it.addDate),
    });
  }
  return cases;
}

/**
 * BLOG_IDS 전체를 병렬 수집 → Case[] 병합 → 최신순 정렬 → 중복 제거 → 상한 절단.
 *
 * - Promise.allSettled: 한 블로그가 실패해도 나머지는 살린다(각 실패는 console.warn만).
 * - fetchPostList는 내부적으로 실패를 삼키고 []를 반환하므로, 여기서 rejected는 사실상
 *   드물지만 방어적으로 처리한다.
 * - 중복 제거: 같은 글이 두 번 들어오는 것을 대비해 url(=blogId/logNo) 기준 dedup.
 * - 라이브 성공 판정은 호출부(cases.ts)에서 "결과 length>0"로 한다(4개 중 1개라도 성공).
 */
export async function fetchAllCases(itemCount = 24, limit = MERGE_LIMIT): Promise<Case[]> {
  const settled = await Promise.allSettled(
    BLOG_IDS.map(async (id) => toCases(await fetchPostList(id, itemCount), id)),
  );

  const merged: Case[] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      merged.push(...r.value);
    } else {
      console.warn(`[blog] ${BLOG_IDS[i]} 수집 실패:`, r.reason);
    }
  });

  // url(blogId/logNo) 기준 중복 제거
  const seen = new Set<string>();
  const deduped = merged.filter((c) => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });

  // date(YYYY-MM-DD) 내림차순 — 최신순
  deduped.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return deduped.slice(0, limit);
}

/**
 * 네이버 블로그 작업사례 수집 — RSS 아님, 모바일 블로그 **JSON API** 방식.
 *
 * 확정 소스(2026-07-31 라이브 실측):
 * - URL:  https://m.blog.naver.com/api/blogs/jungs5377/post-list?categoryNo=0&itemCount=24&page=1
 * - 헤더: Referer / User-Agent 필수(없으면 차단될 수 있음).
 * - 응답: { isSuccess, result: { items: [...] } }
 *   item 주요 필드:
 *     logNo(number)               → 글 링크 https://blog.naver.com/{blogId}/{logNo}
 *     titleWithInspectMessage     → 제목(HTML 태그 제거 + 엔티티 디코드 필요)
 *     thumbnailUrl                → 썸네일(mblogthumb-phinf.pstatic.net CDN, 그대로 사용)
 *     addDate(number, epoch ms)   → 게시일(최신순 이미 정렬됨)
 *
 * 참고: blog.naver.com / m.blog.naver.com HTML은 JS 렌더라 서버 수집 불가 → 반드시 이 JSON API 사용.
 *
 * TODO: 비공식 API, 스펙 변경 시 fetchPostList만 교체.
 */
import type { Case, TruckType } from "../types";

const BLOG_ID = "jungs5377";

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

/** JSON API item[] → Case[] (최신순 유지). */
export function toCases(items: PostItem[]): Case[] {
  const cases: Case[] = [];
  for (const it of items) {
    if (it.logNo == null) continue;
    const title = cleanTitle(it.titleWithInspectMessage ?? it.title ?? "");
    if (!title) continue;
    const blogId = it.domainIdOrBlogId ?? BLOG_ID;
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

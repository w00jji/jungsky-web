/**
 * sync-cases.mjs — 네이버 블로그 작업사례 "전체 누적 + 증분 동기화" 스크립트.
 *
 * 방식(E1):
 *  - 누적 파일 src/data/cases-all.json(Case[])을 소스로 유지한다.
 *  - 각 블로그를 page=1(최신)부터 훑다가 "이미 저장된 url"을 만나면 그 블로그는 멈춘다.
 *    (최신순이므로 그 뒤는 전부 이미 아는 글 → 증분 수집.)
 *  - 최초 실행(기존 파일 비어있음)에는 known url이 없으므로 자연히 빈 페이지까지 = 전체 수집.
 *  - 새 글만 병합 → url 기준 dedup → date 내림차순 정렬 → 파일 저장.
 *
 * 실행: cd jungsky-web/frontend && node scripts/sync-cases.mjs
 *
 * 매핑 규칙은 functions/api/_blog.ts 와 동일해야 한다(경계면 불변). 여기(순수 JS)에 복제한다.
 * TODO: 비공식 모바일 API. 스펙 변경 시 fetchPage 만 교체.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
/** 누적 데이터 파일(배열, Case[]). git 커밋되어 영구 보존됨. */
const DATA_FILE = resolve(__dirname, "../src/data/cases-all.json");

/**
 * 통합 수집 대상 블로그. functions/api/_blog.ts의 BLOG_IDS와 동일하게 유지.
 * ⚠️ 'jungsky_'는 끝에 언더스코어 포함 — URL/Referer에 그대로 사용.
 */
const BLOG_IDS = ["jungs5377", "jung98504", "jungsky_", "kim98405"];

/** 페이지당 글 수(모바일 API itemCount). */
const ITEM_COUNT = 30;
/** 페이지 간 예의상 지연(ms) — 과부하 방지. */
const PAGE_DELAY_MS = 150;
/** 한 블로그 최대 페이지 상한(무한 루프 방지 안전장치). */
const MAX_PAGES = 300;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 블로그 한 페이지 글 목록을 JSON API로 가져온다.
 * 실패 시 throw 하지 않고 null 반환(호출부에서 "종료"로 처리).
 */
async function fetchPage(blogId, page, itemCount = ITEM_COUNT) {
  const url = `https://m.blog.naver.com/api/blogs/${blogId}/post-list?categoryNo=0&itemCount=${itemCount}&page=${page}`;
  try {
    const res = await fetch(url, {
      headers: {
        Referer: `https://m.blog.naver.com/${blogId}`,
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    });
    if (!res.ok) {
      console.warn(`  [warn] ${blogId} p${page} HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!data?.isSuccess || !data?.result?.items) return [];
    return data.result.items;
  } catch (err) {
    console.warn(`  [warn] ${blogId} p${page} fetch 실패:`, err?.message ?? err);
    return null;
  }
}

/* ── 매핑 규칙 (functions/api/_blog.ts 와 동일) ─────────────────────── */

/** 제목만으로 차종 분류. 톤수 없으면 null. 구체적인 것 먼저 매치. */
function classify(title) {
  const rules = [
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
function cleanTitle(raw) {
  const noTags = String(raw).replace(/<[^>]*>/g, "");
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

/** 썸네일 URL 정규화(폭 지정 쿼리 부여). */
function thumbUrl(raw) {
  if (!raw) return "";
  return raw.includes("?type=") ? raw : `${raw}?type=w800`;
}

/** epoch(ms) → KST 기준 YYYY-MM-DD */
function toKstDate(ms) {
  if (!ms || Number.isNaN(ms)) return "";
  return new Date(ms + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** JSON API item[] → Case[] (해당 블로그 기준 url). */
function toCases(items, blogId) {
  const out = [];
  for (const it of items) {
    if (it?.logNo == null) continue;
    const title = cleanTitle(it.titleWithInspectMessage ?? it.title ?? "");
    if (!title) continue;
    out.push({
      title,
      type: classify(title),
      url: `https://blog.naver.com/${blogId}/${it.logNo}`,
      thumb: thumbUrl(it.thumbnailUrl ?? it.thumbnailList?.[0]?.encodedThumbnailUrl),
      date: toKstDate(it.addDate),
    });
  }
  return out;
}

/* ── 동기화 ────────────────────────────────────────────────────────── */

async function loadExisting() {
  if (!existsSync(DATA_FILE)) return [];
  try {
    const txt = await readFile(DATA_FILE, "utf8");
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.warn("[sync] 기존 cases-all.json 파싱 실패, 빈 배열로 시작:", err?.message ?? err);
    return [];
  }
}

/**
 * 한 블로그를 최신 페이지부터 훑어 "아직 모르는" 새 글만 수집.
 * @param knownUrls 기존 저장된 url Set(최초 실행이면 비어있음 → 끝까지 순회).
 * @returns 이 블로그에서 새로 발견한 Case[](최신순).
 */
async function syncBlog(blogId, knownUrls) {
  const found = [];
  const runSeen = new Set(); // 이번 실행 중 이 블로그에서 이미 담은 url(페이지 중복 방지)
  for (let page = 1; page <= MAX_PAGES; page++) {
    const items = await fetchPage(blogId, page);
    if (items === null) break; // 네트워크/HTTP 오류 → 이 블로그 중단(다음 실행 때 재시도)
    if (items.length === 0) break; // 빈 페이지 = 블로그 끝

    const cases = toCases(items, blogId);
    let addedThisPage = 0;
    let hitKnown = false;
    for (const c of cases) {
      if (knownUrls.has(c.url)) {
        hitKnown = true; // 이미 아는 글 → 이 뒤는 전부 앎(최신순)
        break;
      }
      if (runSeen.has(c.url)) continue; // 페이지 경계 중복
      runSeen.add(c.url);
      found.push(c);
      addedThisPage++;
    }

    if (hitKnown) break; // 증분: 알려진 글을 만나면 이 블로그 종료
    if (addedThisPage === 0) break; // 새로 담긴 게 없으면(API 반복 등) 종료

    if (page < MAX_PAGES) await sleep(PAGE_DELAY_MS);
  }
  console.log(`  ${blogId}: 신규 ${found.length}건`);
  return found;
}

async function main() {
  const startedAt = Date.now();
  const existing = await loadExisting();
  const knownUrls = new Set(existing.map((c) => c.url));
  const firstRun = existing.length === 0;
  console.log(
    `[sync] 시작 — 기존 ${existing.length}건${firstRun ? " (최초 실행: 전체 수집)" : " (증분)"}`,
  );

  const allNew = [];
  for (const blogId of BLOG_IDS) {
    const news = await syncBlog(blogId, knownUrls);
    allNew.push(...news);
  }

  // 병합 → url dedup(기존 우선) → date 내림차순
  const merged = [...existing, ...allNew];
  const seen = new Set();
  const deduped = merged.filter((c) => {
    if (seen.has(c.url)) return false;
    seen.add(c.url);
    return true;
  });
  deduped.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(deduped) + "\n", "utf8");

  const secs = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(
    `[sync] 완료 — 신규 ${allNew.length}건, 총 ${deduped.length}건, ${secs}s → ${DATA_FILE}`,
  );
}

main().catch((err) => {
  console.error("[sync] 치명적 오류:", err);
  process.exit(1);
});

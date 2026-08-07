# jungsky-worker — ⚠️ 참고용 보존 (배포 안 함)

> **이 워커는 Cloudflare Pages Function 으로 대체되었습니다.**
> 실제 배포/운영되는 `/api/cases` 구현은
> **`jungsky-web/frontend/functions/api/cases.ts`** (+ 공유 로직 `functions/api/_blog.ts`) 입니다.
>
> 배포 대상은 **`frontend/` 하나**입니다. 이 `worker/` 디렉터리는
> 수집 로직의 원본 참고용으로만 남겨둡니다(삭제하지 않음, 두 소스 혼동 방지).

## 왜 대체했나

- 기존 구조: `vite 프론트(5173)` + `별도 워커(8787)` 2개 프로세스 → 배포·운영이 번거로움.
- 전환 구조: **Cloudflare Pages Functions** — 정적 프론트와 `/api/cases` 함수가 한 배포에 함께 올라감.
- 안전장치: Pages Function 은 3단 폴백(라이브 수집 → Cache 스냅샷 → 번들된 `cases-fallback.json`)으로,
  네이버가 CF IP를 차단해도 최근 실데이터를 계속 노출한다.

## 로직 원본

- 수집·분류·매핑: `src/blog/index.ts` → `frontend/functions/api/_blog.ts` 로 이식됨.
- 스펙(네이버 JSON API)이 바뀌면 **양쪽(_blog.ts 와 이 파일)을 함께** 수정할 것.

## 로컬 미리보기

`worker/` 를 따로 띄우지 말 것. API까지 포함한 미리보기는 frontend 에서:

```bash
cd ../frontend
npm run preview:pages   # build 후 wrangler pages dev 로 정적+함수 함께 서빙 (0.0.0.0:5173, 폰 접속 가능)
```

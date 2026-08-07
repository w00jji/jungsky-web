# 정스카이 배포 프로젝트 (jungsky-web)

`docs/04-웹-구조-설계.md`의 확정 아키텍처를 그대로 구현한 모노레포.
디자인 원본(완성본 시안)은 `../jungsky-site/index.html`이며, 섹션 단위로 발주자 점검을 거쳐 이곳으로 이식한다.

```
jungsky-web/
├── frontend/   React + TypeScript + Vite  →  Cloudflare Pages (무료)
│   └── src/
│       ├── components/   섹션 컴포넌트 (시안에서 하나씩 이식)
│       ├── pages/
│       ├── api/cases.ts  GET /api/cases 호출
│       ├── hooks/ · utils/ · styles/global.css
│       └── public/images/{common,hero,fleet,cases,fields}/  ← 발주자가 직접 이미지 삽입
└── worker/     Cloudflare Workers (TypeScript)  →  API + RSS 자동화 (무료)
    └── src/
        ├── index.ts          라우터 (GET /api/cases)
        ├── routes/cases.ts   작업사례 API
        ├── rss/              crawler(RSS 수집)·parser(파싱)·category(차종 분류) — 미구현 스텁
        ├── db/postgres.ts    Neon PostgreSQL 연결 — 미구현 스텁
        └── types/            Case·TruckType (프론트 src/api/cases.ts와 shape 동일 유지)
```

## 로컬 개발

```bash
cd worker && npm install && npm run dev      # 워커 API: http://localhost:8787
cd frontend && npm install && npm run dev    # 프론트: http://localhost:5173 (/api는 8787로 프록시)
```

## 검증

```bash
cd frontend && npm run build   # 타입 체크 + 프로덕션 빌드
cd worker && npm run check     # 타입 체크
```

## 배포 (모두 무료 플랜)

- frontend → GitHub 연결 후 Cloudflare Pages 자동 배포 (빌드: `npm run build`, 출력: `dist`)
- worker → `cd worker && npm run deploy` (또는 GitHub 연동). 배포 전 `wrangler secret put DATABASE_URL`
- DB → Neon PostgreSQL 무료 (5분 무활동 시 자동 정지, 첫 쿼리에 자동 기상)

## 진행 상태

섹션 이식·백엔드 게이트 진행표: `../jungsky-site/_workspace/progress.md`

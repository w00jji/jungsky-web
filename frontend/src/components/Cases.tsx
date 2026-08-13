import './Cases.css'
import { useEffect, useRef, useState } from 'react'
import { fetchCases, incrementView, type Case, type TruckType } from '../api/cases'
import { trackCall } from '../utils/track'

/**
 * S6 — 작업사례 필터 섹션
 * (시안 jungsky-site/index.html section.cases#cases 블록 이식)
 *
 * 시안과의 본질적 차이:
 *  · 시안의 정적 `const CASES = [...]`(8건) → `fetchCases()`(GET /api/cases) 로 교체.
 *  · E2: 필터·페이징을 **서버사이드**로. 브라우저엔 한 페이지(20건)만 내려온다
 *    (누적 2636건을 프론트로 쏟지 않는다). 탭(톤수)과 페이지가 함께 동작한다.
 *
 * 상태:
 *  · filter — 'all' 또는 톤수 탭. 변경 시 page=1로 리셋.
 *  · page   — 1부터. 페이지네이션/S5 이벤트로 변경.
 *  · data   — { items(≤20), total } 서버 응답.
 *  · state  — loading / success / error.
 *
 * S5 연동: Trucks의 '자세히 보기 +' 클릭 → CustomEvent('jungsky:case-filter')
 * 수신 → 해당 톤수 탭 활성화 + page=1. 스크롤은 Trucks 쪽에서 #cases로 처리.
 */

// 톤수 라벨 — 시안 TYPE_LABEL 그대로 (탭 순서·값은 워커 TruckType과 동일해야 함)
const TYPE_LABEL: Record<TruckType, string> = {
  '1t': '1톤',
  '2.5t': '2.5톤',
  '3.5t': '3.5톤',
  '5t': '5톤',
}

// 탭 정의 — data-filter 값은 시안 그대로 (all + 4개 톤수)
const TABS: { filter: 'all' | TruckType; label: string }[] = [
  { filter: 'all', label: '전체' },
  { filter: '1t', label: '1톤' },
  { filter: '2.5t', label: '2.5톤' },
  { filter: '3.5t', label: '3.5톤' },
  { filter: '5t', label: '5톤' },
]

type LoadState = 'loading' | 'success' | 'error'

/** 발주자 확정(2026-08-10): 페이지당 개수 반응형 — 웹 4열×2줄=8, 모바일 2열×2줄=4 */
const MOBILE_MQ = '(max-width: 768px)'
function pageSizeFor(): number {
  if (typeof window === 'undefined') return 8
  return window.matchMedia(MOBILE_MQ).matches ? 4 : 8
}
/** 페이지 번호 노출 개수(10개씩 블록) */
const PAGE_WINDOW = 10

/** 블록 방식(2026-08-10 발주자 확정): 10개씩 고정 블록. [1..10] → [11..20] → …
 *  현재 페이지가 속한 블록의 번호들을 반환. `›`는 다음 블록(11부터)으로 뭉텅이 이동. */
function pageWindow(current: number, totalPages: number): number[] {
  if (totalPages <= 0) return []
  const blockStart = Math.floor((current - 1) / PAGE_WINDOW) * PAGE_WINDOW + 1
  const end = Math.min(totalPages, blockStart + PAGE_WINDOW - 1)
  const out: number[] = []
  for (let p = blockStart; p <= end; p++) out.push(p)
  return out
}

function Cases() {
  const [filter, setFilter] = useState<'all' | TruckType>('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ items: Case[]; total: number }>({ items: [], total: 0 })
  const [state, setState] = useState<LoadState>('loading')
  const [size, setSize] = useState(pageSizeFor)
  const sectionRef = useRef<HTMLElement>(null)

  // 화면폭이 모바일↔웹 경계를 넘으면 페이지당 개수(4↔8) 변경 + 1페이지로 리셋
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = () => {
      setSize(mq.matches ? 4 : 8)
      setPage(1)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // API 조회: 마운트 / filter / page / size(반응형) 변경
  useEffect(() => {
    let alive = true
    setState('loading')
    fetchCases({ type: filter, page, size })
      .then((res) => {
        if (!alive) return
        setData({ items: res.items, total: res.total })
        setState('success')
      })
      .catch(() => {
        if (!alive) return
        setState('error')
      })
    return () => {
      alive = false
    }
  }, [filter, page, size])

  // 탭 클릭: 필터 변경 + page 1로 리셋
  const changeFilter = (f: 'all' | TruckType) => {
    setFilter(f)
    setPage(1)
  }

  // S5 기종 카드 → 탭 전환 이벤트 수신 (스크롤은 Trucks 쪽에서 처리)
  useEffect(() => {
    const onFilter = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (detail === 'all' || detail === '1t' || detail === '2.5t' || detail === '3.5t' || detail === '5t') {
        setFilter(detail)
        setPage(1)
      }
    }
    window.addEventListener('jungsky:case-filter', onFilter)
    return () => window.removeEventListener('jungsky:case-filter', onFilter)
  }, [])

  const totalPages = Math.ceil(data.total / size)

  // 페이지 이동: 범위 밖·동일 페이지 무시. 이동 시 섹션 상단으로 부드럽게 스크롤.
  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const windowPages = pageWindow(page, totalPages)

  // 카드 클릭: 전환추적 + 조회수 +1 발신 + 낙관적 업데이트(화면 숫자 즉시 +1).
  // preventDefault 안 함 — target=_blank 새 탭 이동은 그대로 진행된다.
  const handleCardClick = (c: Case) => {
    trackCall('case_click')
    incrementView(c.url)
    setData((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.url === c.url ? { ...it, views: it.views + 1 } : it,
      ),
    }))
  }

  return (
    <section className="cases" id="cases" ref={sectionRef}>
      <div className="wrap">
        <span className="eyebrow">CASES</span>
        <h2>지금도 현장에 있습니다</h2>
        <p className="sec-lead">사진을 누르면 블로그 작업 후기로 바로 이동합니다.</p>

        <div className="case-tabs" role="tablist" aria-label="차종별 작업사례 필터">
          {TABS.map((t) => (
            <button
              key={t.filter}
              className={`case-tab${filter === t.filter ? ' on' : ''}`}
              data-filter={t.filter}
              onClick={() => changeFilter(t.filter)}
              role="tab"
              aria-selected={filter === t.filter}
            >
              {t.label}
            </button>
          ))}
        </div>

        {state === 'loading' && (
          <p className="cases-status">작업사례를 불러오는 중…</p>
        )}

        {state === 'error' && (
          <p className="cases-status">
            사례를 불러오지 못했습니다.{' '}
            <a href="https://blog.naver.com/jungs5377" target="_blank" rel="noopener">
              블로그에서 확인해 주세요
            </a>
            .
          </p>
        )}

        {state === 'success' && data.total === 0 && (
          <p className="cases-status">
            이 차종의 작업사례는 블로그에서 확인할 수 있습니다.{' '}
            <a href="https://blog.naver.com/jungs5377" target="_blank" rel="noopener">
              블로그에서 전체 사례 보기
            </a>
            .
          </p>
        )}

        {state === 'success' && data.total > 0 && (
          <>
            <div className="case-grid" id="caseGrid">
              {data.items.map((c) => (
                <a
                  className="case-card"
                  key={c.url}
                  href={c.url}
                  target="_blank"
                  rel="noopener"
                  onClick={() => handleCardClick(c)}
                >
                  <div className="case-thumb">
                    {c.thumb ? (
                      <img src={c.thumb} alt={c.title} loading="lazy" />
                    ) : (
                      '작업 사진 (교체)'
                    )}
                  </div>
                  <div className="case-info">
                    <span className="tag">
                      {c.type ? `${TYPE_LABEL[c.type]} 스카이차` : '정스카이 작업사례'}
                      {c.date && <span className="case-date">{c.date.replace(/-/g, '.')}</span>}
                    </span>
                    <h4>{c.title}</h4>
                    <div className="case-foot">
                      <span className="go">블로그에서 자세히 보기 ↗</span>
                      {/* E3: 카드 클릭 누적 조회수 — subtle하게 표시 */}
                      <span className="case-views">조회수 {c.views}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="cases-pager" aria-label="작업사례 페이지">
                {/* 블록(뭉텅이) 이동: ‹는 이전 5개 블록, ›는 다음 5개 블록으로. 각 블록의 첫 페이지로 이동 */}
                <button
                  className="pager-arrow"
                  onClick={() => goToPage(windowPages[0] - PAGE_WINDOW)}
                  disabled={windowPages[0] <= 1}
                  aria-label="이전 페이지 묶음"
                >
                  ‹
                </button>
                {windowPages.map((p) => (
                  <button
                    key={p}
                    className={`pager-num${p === page ? ' on' : ''}`}
                    onClick={() => goToPage(p)}
                    aria-current={p === page ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="pager-arrow"
                  onClick={() => goToPage(windowPages[0] + PAGE_WINDOW)}
                  disabled={windowPages[0] + PAGE_WINDOW > totalPages}
                  aria-label="다음 페이지 묶음"
                >
                  ›
                </button>
              </nav>
            )}
          </>
        )}

        <div className="cases-more">
          <a href="https://blog.naver.com/jungs5377" target="_blank" rel="noopener">
            블로그에서 더 많은 사례 보기
          </a>
        </div>
      </div>
    </section>
  )
}

export default Cases

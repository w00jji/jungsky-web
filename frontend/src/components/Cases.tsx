import './Cases.css'
import { useEffect, useState } from 'react'
import { fetchCases, type Case, type TruckType } from '../api/cases'
import { trackCall } from '../utils/track'

/**
 * S6 — 작업사례 필터 섹션
 * (시안 jungsky-site/index.html section.cases#cases 블록 이식)
 *
 * 시안과의 본질적 차이: 시안의 정적 `const CASES = [...]`(8건)를
 * `fetchCases()`(GET /api/cases → vite 프록시 → 로컬 워커 8787)로 교체했다.
 * B3(백엔드) 전까지 워커는 샘플 데이터를 반환한다.
 *
 * 상태 3종:
 *  · loading — "불러오는 중" 안내(레이아웃 유지)
 *  · success — 받은 배열을 시안 카드 마크업으로 렌더, 탭은 클라이언트 필터
 *  · error   — 조용히 실패하지 않고 블로그 링크 폴백
 *
 * S5 연동: Trucks의 '자세히 보기 +' 클릭 → CustomEvent('jungsky:case-filter')
 * 수신 → 해당 톤수 탭 활성화. 스크롤은 Trucks 쪽에서 #cases로 처리.
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

function Cases() {
  const [cases, setCases] = useState<Case[]>([])
  const [state, setState] = useState<LoadState>('loading')
  const [filter, setFilter] = useState<'all' | TruckType>('all')

  // API 조회 (마운트 1회)
  useEffect(() => {
    let alive = true
    fetchCases()
      .then((data) => {
        if (!alive) return
        setCases(data)
        setState('success')
      })
      .catch(() => {
        if (!alive) return
        setState('error')
      })
    return () => {
      alive = false
    }
  }, [])

  // S5 기종 카드 → 탭 전환 이벤트 수신 (스크롤은 Trucks 쪽에서 처리)
  useEffect(() => {
    const onFilter = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (detail === 'all' || detail === '1t' || detail === '2.5t' || detail === '3.5t' || detail === '5t') {
        setFilter(detail)
      }
    }
    window.addEventListener('jungsky:case-filter', onFilter)
    return () => window.removeEventListener('jungsky:case-filter', onFilter)
  }, [])

  // 받은 데이터에 대해 클라이언트 필터링 (시안 renderCases와 동일 로직)
  const list = cases.filter((c) => filter === 'all' || c.type === filter)

  return (
    <section className="cases" id="cases">
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
              onClick={() => setFilter(t.filter)}
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

        {state === 'success' && list.length === 0 && (
          <p className="cases-status">
            이 차종의 작업사례는 블로그에서 확인할 수 있습니다.{' '}
            <a href="https://blog.naver.com/jungs5377" target="_blank" rel="noopener">
              블로그에서 전체 사례 보기
            </a>
            .
          </p>
        )}

        {state === 'success' && list.length > 0 && (
          <div className="case-grid" id="caseGrid">
            {list.map((c) => (
              <a
                className="case-card"
                key={c.url}
                href={c.url}
                target="_blank"
                rel="noopener"
                onClick={() => trackCall('case_click')}
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
                  <div className="go">블로그에서 자세히 보기 ↗</div>
                </div>
              </a>
            ))}
          </div>
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

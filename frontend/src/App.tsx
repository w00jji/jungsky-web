/**
 * 정스카이 원페이지 — 섹션(컴포넌트)은 시안(jungsky-site/index.html)에서
 * 발주자 점검을 거쳐 하나씩 이식된다. 이식 순서·상태: jungsky-site/_workspace/progress.md
 */
import FixedBanner from './components/FixedBanner'
import Header from './components/Header'
import Hero from './components/Hero'
import Choose from './components/Choose'
import Showcase from './components/Showcase'
import Fields from './components/Fields'
import Trucks from './components/Trucks'
import Cases from './components/Cases'
import FinalCta from './components/FinalCta'
import Footer from './components/Footer'
import CallBar from './components/CallBar'
import KakaoFloat from './components/KakaoFloat'

function App() {
  return (
    <main>
      {/* S0a 상단 전화 배너 + 헤더 */}
      <FixedBanner />
      <Header />
      {/* S1 히어로 캐러셀 */}
      <Hero />
      {/* S2 선택 이유 */}
      <Choose />
      {/* S3 사선 배너 + 롤링 */}
      <Showcase />
      {/* S4 작업분야 */}
      <Fields />
      {/* 작업분야↔기종별 사이 흰 여백 — 실사이트 실측(PC 232px 스페이서 섹션 / 모바일 99px) */}
      <div className="section-gap" aria-hidden="true" />
      {/* S5 기종별 */}
      <Trucks />
      {/* S6 작업사례 필터 */}
      <Cases />
      {/* S7 견적 CTA */}
      <FinalCta />
      {/* S8 푸터 */}
      <Footer />
      {/* S8 고정 위젯 — 하단 알약 콜바 + 카카오 플로팅 (fixed) */}
      <CallBar />
      <KakaoFloat />
    </main>
  )
}

export default App

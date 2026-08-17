import './Choose.css'

/**
 * S2 — 정스카이를 선택해야 하는 이유 (시안 jungsky-site/index.html section.choose#choose 블록 이식)
 * 회색 카드 4장 + 라인아트 아이콘 PNG 4개. 인트로 문구·"//" 구분선 원치수 그대로.
 * id="choose"는 헤더 nav '회사소개' 앵커 착지점 (scroll-margin-top: global.css #choose).
 * 아이콘 alt는 시안대로 빈 문자열(장식 이미지) — 카드 제목 h3가 바로 옆에 라벨을 제공.
 */

function Choose() {
  return (
    <section className="choose" id="choose">
      <div className="wrap">
        <p className="small-title">정스카이를 선택해야 하는 이유</p>
        <div className="divider" aria-hidden="true"></div>
        <p className="lead">
          자체 콜센터 운영으로 <span className="or">신속한 배차 서비스</span>와<br />
          <span className="or">1톤부터 5톤까지</span> 다양한 작업 환경에 맞춘 스카이차를 보유하고 있습니다.
        </p>
        <div className="choose-grid">
          <div className="choose-card">
            {/* IMAGE-SLOT: /images/common/car_icon.png | 표시 76×76(모바일 56) | 완료(2026-07-26 발주자 삽입·연결) */}
            <img src="/images/common/car_icon.png" alt="" loading="lazy" />
            <h3>전 차종 보유</h3>
            <p>1톤부터 5톤까지, 다양한 작업<br />환경에 맞춘 스카이차 보유</p>
          </div>
          <div className="choose-card">
            {/* IMAGE-SLOT: /images/common/car_icon2.png | 표시 76×76(모바일 56) | 완료(2026-07-26 발주자 삽입·연결) */}
            <img src="/images/common/car_icon2.png" alt="" loading="lazy" />
            <h3>전국 1초 배차</h3>
            <p>전국 어디든<br />신속한 배차 시스템</p>
          </div>
          <div className="choose-card">
            {/* IMAGE-SLOT: /images/common/chat_icon.png | 표시 76×76(모바일 56) | 완료(2026-07-26 발주자 삽입·연결) */}
            <img src="/images/common/chat_icon.png" alt="" loading="lazy" />
            <h3>맞춤형 상담</h3>
            <p>1시간, 반나절, 하루,<br />야간, 월대, 1일 이상<br />장기 작업까지 조율 가능</p>
          </div>
          <div className="choose-card">
            {/* IMAGE-SLOT: /images/common/phone_icon.png | 표시 76×76(모바일 56) | 완료(2026-07-26 발주자 삽입·연결) */}
            <img src="/images/common/phone_icon.png" alt="" loading="lazy" />
            <h3>자체 콜센터 운영</h3>
            <p>실시간 문의, 민원 처리,<br />신속한 배차까지 원스톱 서비스</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Choose

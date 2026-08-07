import './Footer.css'

/**
 * S8 — 푸터 (시안 jungsky-site/index.html footer 블록 이식)
 *
 * 흰 배경, 붓글씨 로고 + 원형 SNS 아이콘(블로그·인스타), 하단 사업자 정보.
 * 로고는 헤더와 동일 이미지 — 발주자가 S0a에서 삽입한 로컬 /images/common/logo.jpg 재사용.
 * SNS 2개는 로컬 파일 미존재 → 시안 핫링크 유지 + IMAGE-SLOT.
 */
function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <a href="#" className="foot-logo">
            <img src="/images/common/logo.jpg" alt="정스카이" />
          </a>
          <div className="foot-sns">
            <a
              href="https://blog.naver.com/jungs5377"
              target="_blank"
              rel="noopener"
              aria-label="네이버 블로그"
            >
              {/* IMAGE-SLOT: /images/common/sns-blog.png | 원형 44×44 PNG | 삽입 위치 frontend/public/images/common/ */}
              <img
                src="/images/common/sns-blog.png"
                alt="블로그"
                loading="lazy"
              />
            </a>
            <a
              href="https://www.instagram.com/jungsky5377"
              target="_blank"
              rel="noopener"
              aria-label="인스타그램"
            >
              {/* IMAGE-SLOT: /images/common/sns-insta.png | 원형 44×44 PNG | 삽입 위치 frontend/public/images/common/ */}
              <img
                src="/images/common/sns-insta.png"
                alt="인스타그램"
                loading="lazy"
              />
            </a>
          </div>
        </div>
        <p className="info">
          대표 : 김성봉 &nbsp;l&nbsp; 사업자번호 : 892-32-00318
          <br />
          이메일 : jungsky5377@naver.com | 전화번호 : 010-8824-5377
          <br />
          주소 : 대구광역시 동구 위남로 63, 201동 601호
          <br />
          Copyright ©정스카이 All Right Reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer

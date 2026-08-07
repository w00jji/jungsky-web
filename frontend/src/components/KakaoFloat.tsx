import './KakaoFloat.css'
import { trackCall } from '../utils/track'

/**
 * S8 — 카카오톡 오픈채팅 플로팅 버튼 (시안 index.html a.kakao-float-btn 블록 이식)
 *
 * fixed, 우하단(z-index:999, bottom:100px — 콜바 위에 안 겹치게).
 * 클릭 시 trackCall('kakao_click'). 오픈채팅 새 탭.
 * 아이콘은 로컬 파일 미존재 → 시안 핫링크 유지 + IMAGE-SLOT.
 */
function KakaoFloat() {
  return (
    <a
      href="https://open.kakao.com/o/gNgv30oh"
      className="kakao-float-btn"
      target="_blank"
      rel="noopener"
      onClick={() => trackCall('kakao_click')}
      aria-label="카카오톡 오픈채팅 문의"
    >
      <div className="kakao-icon-bg">
        {/* IMAGE-SLOT: /images/common/kakao.png | 카카오 말풍선 아이콘 PNG(투명) | 삽입 위치 frontend/public/images/common/ */}
        <img
          src="/images/common/kakao.png"
          alt="카카오톡 문의"
        />
      </div>
    </a>
  )
}

export default KakaoFloat

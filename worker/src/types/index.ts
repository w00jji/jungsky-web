/** 차종 분류 — 프론트 필터 탭·DB의 type 컬럼과 반드시 동일한 문자열을 쓴다 */
export type TruckType = "1t" | "2.5t" | "3.5t" | "5t";

/** 작업사례 1건 — GET /api/cases 응답 원소이자 DB cases 테이블의 행 */
export interface Case {
  title: string;
  /** 제목에서 자동 분류한 차종. 톤수 표기 없는 글은 null(미분류 → 프론트 '전체' 탭에만 노출) */
  type: TruckType | null;
  /** 네이버 블로그 글 주소 (카드 클릭 시 새 탭 이동) */
  url: string;
  /** 썸네일 이미지 URL (블로그 og:image) */
  thumb: string;
  /** 게시일 YYYY-MM-DD */
  date: string;
}

export interface Env {
  DATABASE_URL: string;
}

import { useEffect, useRef } from 'react'

/**
 * 스크롤 등장 애니메이션 훅 (2026-07-27 발주자 요청).
 * 반환된 ref를 섹션 루트에 달면, 화면에 15% 이상 들어오는 순간 루트에 'revealed' 클래스가 붙는다.
 * 실제 움직임(아래→위 + 페이드인)은 각 섹션 CSS의 .reveal / .revealed .reveal 규칙이 담당.
 * 한 번 나타난 뒤에는 다시 숨기지 않는다(재스크롤 시 반복 등장은 산만함).
 * prefers-reduced-motion 사용자는 global.css 전역 가드가 transition을 꺼서 즉시 표시된다.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

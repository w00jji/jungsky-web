import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // IPv4/IPv6 모두에서 접속 가능하게 (localhost가 127.0.0.1로 풀리는 브라우저 대응
    // + 같은 와이파이의 휴대폰 실기기 확인용 Network 주소 제공)
    host: true,
    // 로컬 개발: /api 요청을 wrangler dev(워커, 8787)로 전달.
    // 운영: Cloudflare Pages에서 /api/* → Worker 라우팅으로 동일 구조 유지.
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})

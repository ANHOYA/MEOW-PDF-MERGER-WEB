# 검색엔진 등록 및 배포 체크리스트

현재 기준 도메인: https://meow-pdf-merger-web.vercel.app

## 자동 준비되는 항목

`npm run build`에서 초기 HTML 본문, 페이지별 title/description/canonical/OG, WebApplication JSON-LD, sitemap.xml, robots.txt, RSS 2.0을 생성한다. URL은 `SITE_URL` 환경변수로 일괄 변경할 수 있다. 가이드 RSS에는 전체 본문 3개가 포함된다.

## 실제 소유권 인증과 제출

파일을 GitHub에 올리는 것만으로 계정 등록이나 색인이 완료되지는 않는다. 각 계정의 소유권 인증 값은 계정 화면에서 발급받아야 한다. 인증하지 않은 가짜 토큰은 넣지 않는다.

1. Vercel 배포의 상태가 Ready인지 확인하고 홈, 7개 도구, 정책, 가이드가 200을 반환하는지 확인한다. 존재하지 않는 URL은 404여야 한다.
2. Google Search Console에서 URL 접두어 속성으로 위 도메인을 추가한다. HTML meta 인증 값을 Vercel 환경변수 `GOOGLE_SITE_VERIFICATION`에 넣고 재배포한 후 확인을 누른다. 사용자 지정 도메인은 DNS 인증도 가능하다.
3. Google Sitemaps에 `/sitemap.xml`을 제출하고 홈 및 주요 도구 URL을 검사한다.
4. 네이버 Search Advisor에서 같은 사이트를 추가한다. meta 인증 값을 `NAVER_SITE_VERIFICATION`으로 설정·재배포한 뒤 소유권을 확인한다. 요청 메뉴에 `/sitemap.xml`과 `/rss.xml`을 각각 제출한다.
5. Bing Webmaster Tools에서 사이트를 등록한다. Google 인증 사이트 가져오기 또는 `BING_SITE_VERIFICATION` meta 인증을 사용하고 사이트맵을 제출한다.
6. 제출 결과와 오류는 각 검색엔진 콘솔에서 확인한다. 제출이나 유효한 사이트맵이 수집·색인·노출을 보장하지 않는다.

## 현재 작업의 경계

Google 및 네이버 콘솔의 로그인 세션에서 이 도메인의 소유권 인증 태그를 발급받아 생성기에 반영했다. 다른 도메인에는 기본 인증값을 적용하지 않는다. 실제 인증 및 제출 결과는 배포 후 아래 실행 기록에 갱신한다.

## 운영

- `SITE_URL` 변경 시 trailing slash 없이 완전한 HTTPS origin을 입력한다.
- 도메인 변경 시 새 canonical·사이트맵·RSS를 생성하고 구 도메인에서 301 리디렉션한다.
- RSS의 날짜는 실제 글 발행 시점과 맞춘다. 사이트맵에는 근거 없는 갱신일을 넣지 않는다.
- 새 가이드를 추가하면 생성기의 articles 데이터에 실제 본문을 넣는다.
- 호스팅의 분석·광고·쿠키 기능을 추가할 경우 개인정보처리방침을 실제 동작에 맞게 수정한다.

## 공식 문서

- Google: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- 네이버 RSS/사이트맵: https://searchadvisor.naver.com/guide/request-feed
- Google 소유권 인증: https://support.google.com/webmasters/answer/9008080
- Bing: https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b

## 실행 기록 · 2026-10-01

- GitHub main 구현 커밋: `b03cb9b`.
- Vercel 실제 사이트에서 새 디자인, Google/네이버 인증 메타태그 확인.
- Google Search Console: HTML 태그 소유권 인증 완료. `sitemap.xml` 제출 결과 **성공**, 발견된 페이지 **15개** 확인.
- 네이버 Search Advisor: 소유확인 완료. `sitemap.xml` 등록 목록 확인(2026-10-01).
- 네이버 RSS: 보안문자 확인 후 `rss.xml` 등록 목록 확인(2026-10-01 08:55:18 KST).
- Bing: 로그인·사이트 추가 완료. `msvalidate.01` 인증 메타태그 배포 후 Verify를 실행했고 Home 경로로 이동했으나 대시보드가 빈 화면으로 표시됨. 새로고침과 브라우저 창 직접 확인 후에도 결과를 읽을 수 없어 최종 소유권 인증 상태는 미확인, 사이트맵 제출은 미완료.
- 검색결과 노출 및 전체 페이지 색인은 별도 처리이며, 이 기록은 색인 완료를 의미하지 않음.

## 기술 검증 결과

- 단위 테스트 14개 통과, Chromium 브라우저 테스트 4개 통과.
- npm audit: 0 vulnerabilities.
- 실제 배포에서 CSP 응답 헤더가 있는 상태로 A4 변환·1페이지 미리보기 성공, 페이지 오류 및 외부/비-GET 요청 없음.
- RSS·사이트맵·robots·정책 페이지 HTTP 200, 존재하지 않는 경로 HTTP 404.
- 15개 페이지의 H1·description·canonical 및 RSS 3개 가이드의 XML 파싱 확인.
- Firefox 및 실제 iOS Safari는 이번 실행에서 검증하지 않음.

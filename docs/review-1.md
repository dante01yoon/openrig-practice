# 독립 리뷰 1 — 필터와 행사 카드

검토자: team-review@culture · 2026-11-01 UTC

## 결과

높음·중간 심각도의 결함은 발견하지 않았다. 낮음 1건이 있다. 핵심 완료 조건인 구·날짜·무료 AND 필터, 카드, 빈 결과 및 로드 실패 안내, 순수 함수 테스트는 확인했다. 앱 코드는 수정하지 않았다.

### 낮음: 예상 가능한 API 실패를 처리한 뒤 다시 예외를 던진다

- 위치: public/index.html:92 (`throw null`)
- 재현: `/api/events` 응답을 HTTP 500으로 대체하고 새로고침한다.
- 실제: 실패 안내가 보이고 구 필터는 비활성화되지만, Chrome의 pageerror에도 메시지 `null`이 기록된다. 정상 목록에서는 pageerror가 없었다.
- 영향: 사용자 복구 안내는 동작하므로 기능 차단은 아니다. 이미 처리한 네트워크 장애가 처리되지 않은 앱 예외로 남아 콘솔과 오류 수집을 오염시키고 원인을 알기 어렵게 한다.
- 권고: 성공한 경우에만 초기화·렌더링하도록 제어 흐름을 나누고, catch에서 다시 예외를 던지지 않는다.

## 검토 범위

- docs/design.md와 docs/research.md를 읽고 public/index.html, public/events.js, public/style.css, test/events.test.mjs 및 기존 server.mjs를 대조했다.
- IS_FREE의 정확한 `무료` 비교, USE_FEE에 의존하지 않는 판별, 시작·종료 당일 포함, 날짜 문자열 비교, 빈 조건, 구·날짜·무료 AND 결합을 확인했다.
- 데이터 텍스트는 createElement/textContent로 출력된다. 링크는 http(s) 접두어로 제한되고 새 탭에 noopener/noreferrer가 적용된다. 이미지 URL은 img.src에만 전달된다.
- 제목·분류·기간·장소·요금·대상, 이미지 대체 칸, 중복 행 보존, 구별 전체 건수, 필터 초기화 시 구 컨트롤로 포커스 복귀를 확인했다.
- 테스트는 긍정·부정 사례와 경계 바깥 날짜를 명시적으로 단언하여 항상 통과하는 형태가 아니다. 실제 데이터 전체/구/무료 건수도 단언한다.
- 2626 종료일 보존과 별도 요금 확인 배지 생략은 확정된 설계 결정이므로 결함으로 분류하지 않았다. 유효하지 않은 HMPG_ADDR일 때 ORG_LINK를 쓰는 동작은 지침보다 넓지만 안전한 대체이며 현재 데이터에 영향 없다.

## 직접 실행한 검증

환경: Node v24.14.1, 로컬 http://localhost:5180/, 설치된 Google Chrome headless, 기존 캐시의 Playwright. Browser plugin not available. 외부 의존성 설치 없음.

| 검증 | 결과 |
| --- | --- |
| `npm test` | 8개 통과, 실패 0 |
| `npm start` 후 페이지 제목·의미 있는 목록 | 서울 문화행사 찾기, 293개 카드 |
| 종로구 → 2026-11-05 → 무료만 | 행사 27개 (전체 293개 중) |
| 2025-01-01로 변경 → 빈 결과 초기화 | 빈 결과 표시 후 전체 293개, activeElement=gu |
| 375×812 화면 | innerWidth=375, documentElement.scrollWidth=375 |
| 1100×800 화면 | 가로 넘침 없음, 3열 grid 계산값 확인 |
| 이미지 요청 강제 실패 | 화면 근처 lazy 이미지 4개가 placeholder로 대체 |
| MAIN_IMG 빈 문자열인 합성 응답 | placeholder 1개 생성 |
| 합성 TITLE/PLACE/USE_FEE에 img/onerror 문자열 주입 | 제목에 문자열 그대로 표시, 주입 전역 변수 생성 없음 |
| javascript:/data: 상세 링크 합성 응답 | 제목 링크 0개 |
| API HTTP 500 | 오류 안내·필터 비활성 통과, pageerror=null 발견 |
| 정상 목록의 런타임 예외 | pageerror 0개 |

브라우저 검증은 셸에서 `node --input-type=module`로 Playwright chromium.launch(executablePath=설치된 Chrome, headless=true), goto, selectOption/fill/check/click, evaluate, route를 실행했다. 저장소 밖을 포함해 임시 파일을 만들지 않았다.

## 접근성 및 남은 한계

- 코드에서 html lang=ko, h1/h2 구조, 암시적 label 연결, 결과 aria-live=polite, 실패 role=alert, 명시적 focus-visible을 확인했다. 무료·유료는 텍스트로도 구분된다.
- 초기화 후 실제 포커스 이동은 확인했다. headless Chrome에서 select 방향키 입력은 값 변경이 관측되지 않아 네이티브 구 선택기의 방향키 조작은 확인 완료로 주장하지 않는다. 실제 OS 브라우저에서 확인 필요하다.
- 스크린 리더 낭독, Safari/Firefox, 날짜 입력의 실제 OS 선택기, 외부 상세 페이지와 외부 이미지 실제 로드는 확인하지 않았다. 이미지 실패는 요청 차단으로 검증했다.
- 스크린샷을 메모리에서 생성했으나 시각적으로 열어 검토하지 않았다. 레이아웃 결과는 DOM/계산된 스타일/스크롤 폭에 근거한다. 파일 생성 제한에 따라 이미지 증거 파일은 남기지 않았다.
- 색 대비는 육안이나 자동 측정으로 검증하지 않았다. 이 보고서는 전면 접근성 인증이 아니다.
- 화면 출처는 데이터셋 이름과 기준일을 표시하지만 README의 원출처 명칭인 서울특별시 서울문화포털은 화면에 직접 적혀 있지 않다. 원출처를 함께 명시하면 데이터 출처가 더 분명해진다.

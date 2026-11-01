# 독립 리뷰 2 — 리뷰 1 후속 수정 재확인

검토자: team-review@culture · 2026-11-01 UTC

## 결과

리뷰 1의 낮음 결함과 출처 문구 개선 의견 모두 현재 파일과 직접 실행에서 해결을 확인했다. 이번 수정 범위에서 새 결함은 발견하지 않았다. 앱 코드는 수정하지 않았다.

- public/index.html:86–105: 로드 처리를 async init 함수로 옮겼고 catch는 오류 안내를 표시한 뒤 return한다. HTTP 오류를 같은 try/catch에서 잡으므로 처리되지 않은 예외가 남지 않는다. 성공한 경우에만 필터 활성화와 렌더링이 실행된다.
- public/index.html:12: 실제 파일에 `출처: 서울특별시 서울문화포털 · 서울 열린데이터광장 문화행사 정보(2026-10-31)`가 들어 있다. 브라우저 DOM에서도 같은 문구를 직접 읽었다. build의 과거 보고에 의존하지 않았다.

## 직접 실행한 검증

환경: Node v24.14.1, `npm start`로 http://localhost:5180/, 설치된 Google Chrome headless, 기존 캐시 Playwright, 375×812. Browser plugin not available로 로컬 Playwright를 사용했고 추가 설치·임시 파일 생성은 하지 않았다.

| 실행·경로 | 관측 결과 |
| --- | --- |
| `npm test` | 8개 통과, 실패 0 |
| 정상 페이지 goto 및 목록 대기 | 제목 서울 문화행사 찾기, 293개, pageerror 0 |
| `.source` innerText 조회 | 원출처 이름과 데이터셋·기준일 정확히 표시 |
| 종로구 선택 → 2026-11-05 → 무료만 | 차례로 57 → 38 → 27개 |
| 초기화 버튼 | 293개 복귀, activeElement=gu |
| 과거 날짜로 0건 → 빈 결과 초기화 버튼 | 빈 결과 안내 후 293개 복귀 |
| 모바일 가로 폭 | innerWidth=375, documentElement.scrollWidth=375 |
| API HTTP 500 주입 후 reload | 오류 안내, 필터 비활성, 카드 0개, 빈 결과 안내 숨김, pageerror 0 |
| API HTTP 200 + 잘못된 JSON 주입 | 동일한 실패 UI, pageerror 0 |
| API 네트워크 요청 abort | 동일한 실패 UI, pageerror 0 |

브라우저 명령은 `node --input-type=module`에서 chromium.launch, newPage, route, goto/reload, selectOption/fill/check/click, evaluate를 사용했다. API 실패 때 gu/date/free/reset 각각의 disabled 속성이 초기 HTML과 성공 전용 활성화 흐름으로 유지됨을 코드와 DOM에서 확인했다.

## 검토 한계

이번 재검토는 위 두 수정과 초기화 흐름의 회귀에 한정한다. 리뷰 1의 미확인 범위(네이티브 구 선택 방향키, 실제 날짜 선택기, 스크린 리더, 색 대비 측정, 외부 이미지·상세 페이지, 다른 브라우저)는 그대로 남는다. 외부 이미지는 요청을 차단했다. 시각 스크린샷 검토는 하지 않았으며 모바일 폭은 DOM 측정에 근거한다. 실제 데이터의 알려진 2626 종료일·요금 불일치는 원래 설계 결정대로 유지된다.

# 서울 문화행사 찾기 (OpenRig 실습)

OpenRig · Herdr · Tailscale · RustDesk 무료 강의의 실습 저장소입니다. 역할마다 다른 모델을 쓰는 에이전트 팀(조사 · 기획 · 구현 · 리뷰)이 이 작은 앱을 함께 만듭니다.

- 지금 상태: 서버가 행사 목록을 돌려주고, 화면은 제목만 나열합니다.
- 강의에서 만드는 것: 구·날짜·무료 여부로 거르기, 행사 카드 화면, 무료 판별 규칙과 테스트.

## 실행

Node 22 이상만 있으면 됩니다. 설치할 패키지는 없습니다.

```bash
npm start
```

브라우저에서 http://localhost:5180 을 엽니다.

## 수업마다 같은 출발점

수업마다 시작 상태와 완성 상태를 태그로 남겨 둡니다. 영상과 같은 화면에서 시작하려면 그 수업의 시작 태그를 받으세요.

```bash
git checkout p01-start
```

| 태그 | 상태 | 수업 |
|---|---|---|
| `p01-start` | 시작 상태(서버 + 제목 목록) | 역할별 모델 팀 짜기 |
| `p02-start` | 운영자가 만든 팀 파일 `rigs/culture` | 조사 · 설계 · 구현 · 교차 리뷰 |
| `p06-done` | 팀이 완성한 앱과 docs 문서, 테스트 8개 | 비용·한계와 팀 끄고 켜기 |

긴 프롬프트 원문은 [PROMPTS.md](PROMPTS.md)에 있습니다. 여러분의 프로젝트로 따라 해도 OpenRig 사용법은 똑같습니다.

## 막힐 때: `rig send operator-agent@kernel`이 오류를 낼 때

영상은 Claude Code와 Codex에 이미 로그인된 컴퓨터로 찍었습니다. 처음 쓰는 컴퓨터에서는 아래 순서로 확인하세요.

1. **데몬이 켜져 있나** — `Cannot connect to the OpenRig daemon`이 나오면 데몬이 꺼진 상태입니다.
   ```bash
   rig daemon status
   rig daemon start
   ```
   데몬이 켜지면 관리 팀 `kernel`도 같이 부팅됩니다(20초쯤).
2. **자리 이름과 ATTN 보기** — `operator-agent@kernel`은 커널 안 운영자 자리 이름입니다. 아래 표의 SESSION 칸에서 찾습니다.
   ```bash
   rig ps --nodes --rig kernel
   ```
3. **ATTN이 yes면 그 자리에 붙어서 풀기** — 이유가 `Harness launch requires attention`이면 사람의 손이 필요해 멈춘 것입니다.
   ```bash
   tmux attach -t operator-agent@kernel
   ```
   - Codex 로그인 화면이면 `Sign in with ChatGPT` → 브라우저에서 계정 선택.
   - `Hooks need review`(훅 신뢰 확인)이면 내용을 확인해 믿기로 고른 뒤 `rig seat continue operator-agent@kernel`.
   - Claude Code 자리(`advisor-lead@kernel`)가 로그인 전이면 같은 방법으로 붙어서 로그인.
   - 빠져나오기: `Ctrl+b` 누른 뒤 `d`.
4. **`Session 'operator-agent@kernel' not found`** — 컴퓨터를 다시 켰거나 tmux가 꺼져 커널 자리가 사라진 경우입니다.
   ```bash
   rig start                    # 데몬 · 커널 · 돌던 팀 한 번에 되살리기
   rig up kernel --existing     # 커널만 다시 띄우기
   ```

다시 `rig ps --nodes --rig kernel`에서 operator-agent의 ATTN이 no면 프롬프트를 그대로 보내면 됩니다.

## 데이터와 인증키

**실습에는 인증키가 필요 없습니다.** 저장소의 `data/events.json`(2026-10-31에 받은 사본)을 그대로 씁니다.

최신 행사로 바꾸고 싶으면 서울 열린데이터광장 Open API 인증키를 받으세요.

1. [data.seoul.go.kr](https://data.seoul.go.kr) 회원가입 → 로그인
2. 마이페이지 「인증키 신청」에서 **일반 인증키**를 신청 → 「인증키 관리」에서 받은 키 확인
3. 키가 맞는지 먼저 확인합니다. 아래 주소의 `sample` 자리에 받은 키를 넣으면 됩니다(`sample`은 5건까지만 됩니다).
   ```bash
   curl "http://openapi.seoul.go.kr:8088/sample/json/culturalEventInfo/1/2/"
   ```
4. 받은 키로 데이터를 새로 받습니다(한 번에 1,000건씩 나눠 받고, 오늘 이후에 끝나는 행사만 남김).
   ```bash
   SEOUL_API_KEY=발급받은키 node scripts/fetch-events.mjs
   ```

호출 형식은 공식 안내([Open API 소개](https://data.seoul.go.kr/together/guide/useGuide.do))를 따릅니다: `http://openapi.seoul.go.kr:8088/(인증키)/json/culturalEventInfo/(시작)/(끝)/`. 키는 코드나 커밋에 넣지 마세요.

## 데이터 출처

`data/events.json`은 [서울 열린데이터광장 「서울시 문화행사 정보」](https://data.seoul.go.kr/dataList/OA-15486/S/1/datasetView.do)에서 2026-10-31에 받은 사본(11월 이후 끝나는 행사 293건)입니다. 공공누리 제1유형(출처 표시)으로 이용합니다. 출처: 서울특별시 서울문화포털.

## 라이선스

코드는 MIT, 데이터는 공공누리 제1유형을 따릅니다.

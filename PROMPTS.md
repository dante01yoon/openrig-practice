# PROMPTS

강의에서 보낸 프롬프트 원문입니다. 그대로 복사해 쓰세요.

## 역할별 모델 팀 짜기 — 운영자에게 팀 만들기 부탁

저장소 폴더에서 실행합니다(`$PWD`가 그 폴더 경로로 바뀝니다).

```bash
rig send operator-agent@kernel "$PWD 저장소에 쓸 새 팀 culture를 만들어 줘. 팀 파일은 rigs/culture/rig.yaml에 둬. 자리는 넷: lead는 Claude Code에 opus 모델(기획·화면 디자인·일 나누기), research는 Claude Code에 haiku 모델(자료 조사), build는 Claude Code에 sonnet 모델(구현), review는 Codex(코드 리뷰). 모든 자리는 권한을 묻지 않게 permission_policy를 builtin:yolo로 해 줘. 팀 파일만 만들고 rig up은 하지 마."
```

> 오류가 나면(`not found`, `Cannot connect`) README의 「막힐 때」 순서를 따라 하세요.

> builtin:yolo는 에이전트가 허락 없이 무엇이든 실행하게 합니다. 실습처럼 따로 떼어 놓은 폴더와 계정에서만 쓰세요.

## Haiku에게 조사 맡기기 — 리드에게 앱 전체 맡기기

Herdr에서 `rig terminal open culture --provider herdr`로 팀을 연 뒤, 리드(team.lead) 타일에 적습니다.

```text
서울 문화행사 찾기 앱을 완성해 줘. 구·날짜·무료 여부로 거르고 행사를 카드로 보여 주면 돼. 데이터 조사는 research, 화면 설계는 네가 직접, 구현은 build, 코드 리뷰는 review에게 맡겨 줘. 조사 결과·화면 설계·리뷰 결과는 docs 폴더에 파일로 남기고, 다 끝나면 human-gate 일감으로 나에게 알려 줘.
```

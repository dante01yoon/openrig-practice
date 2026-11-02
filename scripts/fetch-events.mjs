// 서울 열린데이터광장 「서울시 문화행사 정보」(culturalEventInfo)를 받아 data/events.json을 새로 만든다.
// 사용: SEOUL_API_KEY=<발급받은 일반 인증키> node scripts/fetch-events.mjs
// 키 없이 실습할 때는 저장소에 들어 있는 data/events.json을 그대로 쓰면 된다.
import { writeFile } from 'node:fs/promises';

const KEY = process.env.SEOUL_API_KEY;
if (!KEY) {
  console.error('SEOUL_API_KEY가 없어요. data.seoul.go.kr에서 일반 인증키를 받아 넣어 주세요. (README 「데이터와 인증키」)');
  process.exit(1);
}
const PAGE = 1000; // 한 번에 최대 1,000건
const url = (from, to) => `http://openapi.seoul.go.kr:8088/${KEY}/json/culturalEventInfo/${from}/${to}/`;

async function page(from, to) {
  const res = await fetch(url(from, to));
  const body = await res.json();
  const data = body.culturalEventInfo;
  if (!data) throw new Error(`API 오류: ${JSON.stringify(body.RESULT ?? body)}`);
  return data;
}

const first = await page(1, PAGE);
const total = first.list_total_count;
let rows = first.row;
for (let from = PAGE + 1; from <= total; from += PAGE) rows = rows.concat((await page(from, from + PAGE - 1)).row);

const today = new Date().toISOString().slice(0, 10);
const kept = rows.filter((r) => String(r.END_DATE).slice(0, 10) >= today); // 오늘 이후에 끝나는 행사만
await writeFile(new URL('../data/events.json', import.meta.url), JSON.stringify(kept, null, 1) + '\n');
console.log(`전체 ${total}건 중 오늘(${today}) 이후에 끝나는 ${kept.length}건을 data/events.json에 저장했어요.`);

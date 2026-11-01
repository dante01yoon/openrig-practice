import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isFree, matches, filterEvents, guCounts, linkOf, periodText, feeText, isFiltered } from '../public/events.js';

const rows = JSON.parse(await readFile(new URL('../data/events.json', import.meta.url), 'utf8'));
const row = (o = {}) => ({ GUNAME: '종로구', IS_FREE: '무료', STRTDATE: '2026-11-01 00:00:00.0', END_DATE: '2026-11-10 00:00:00.0', ...o });

test('isFree는 IS_FREE만 본다', () => {
  assert.equal(isFree(row({ IS_FREE: '무료', USE_FEE: '30,000원' })), true);
  assert.equal(isFree(row({ IS_FREE: '유료', USE_FEE: '무료' })), false);
});

test('날짜 경계: 시작·종료 당일 포함, 하루 전후 제외', () => {
  const r = row();
  assert.equal(matches(r, { date: '2026-11-01' }), true);
  assert.equal(matches(r, { date: '2026-11-10' }), true);
  assert.equal(matches(r, { date: '2026-10-31' }), false);
  assert.equal(matches(r, { date: '2026-11-11' }), false);
});

test('구 필터', () => {
  assert.equal(matches(row(), { gu: '종로구' }), true);
  assert.equal(matches(row(), { gu: '중구' }), false);
});

test('세 조건은 AND로 결합', () => {
  const c = { gu: '종로구', date: '2026-11-05', freeOnly: true };
  assert.equal(matches(row(), c), true);
  assert.equal(matches(row({ IS_FREE: '유료' }), c), false);
  assert.equal(matches(row({ GUNAME: '중구' }), c), false);
  assert.equal(matches(row(), { ...c, date: '2026-12-01' }), false);
});

test('빈 조건이면 전체', () => {
  assert.equal(filterEvents(rows, {}).length, rows.length);
  assert.equal(filterEvents(rows, { gu: '', date: '', freeOnly: false }).length, rows.length);
  assert.equal(isFiltered({}), false);
  assert.equal(isFiltered({ freeOnly: true }), true);
});

test('링크는 http(s)만, HMPG_ADDR 우선, 없으면 ORG_LINK', () => {
  assert.equal(linkOf({ HMPG_ADDR: 'https://a.kr', ORG_LINK: 'http://b.kr' }), 'https://a.kr');
  assert.equal(linkOf({ HMPG_ADDR: '', ORG_LINK: 'http://b.kr' }), 'http://b.kr');
  assert.equal(linkOf({ HMPG_ADDR: '-', ORG_LINK: '-' }), null);
  assert.equal(linkOf({ HMPG_ADDR: 'javascript:alert(1)', ORG_LINK: 'ftp://x' }), null);
});

test('기간·요금 문구', () => {
  assert.equal(periodText(row()), '2026-11-01 ~ 2026-11-10');
  assert.equal(periodText(row({ END_DATE: '2026-11-01 00:00:00.0' })), '2026-11-01');
  assert.equal(feeText({ IS_FREE: '무료', USE_FEE: '' }), '무료');
  assert.equal(feeText({ IS_FREE: '유료', USE_FEE: '' }), '요금 정보 없음');
  assert.equal(feeText({ IS_FREE: '유료', USE_FEE: '5,000원' }), '5,000원');
});

test('실제 데이터 건수', () => {
  assert.equal(rows.length, 293);
  assert.equal(filterEvents(rows, { gu: '종로구' }).length, 57);
  assert.equal(filterEvents(rows, { freeOnly: true }).length, 211);
  assert.equal(guCounts(rows).length, 25);
  assert.equal(guCounts(rows).find((g) => g.gu === '종로구').count, 57);
});

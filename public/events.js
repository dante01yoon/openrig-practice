// 문화행사 필터·판별 순수 함수. DOM과 시간대 변환을 쓰지 않는다.
export const isFree = (row) => row.IS_FREE === '무료';

export const datePart = (value) => String(value ?? '').slice(0, 10);

export const eventDates = (row) => ({ start: datePart(row.STRTDATE), end: datePart(row.END_DATE) });

export function matches(row, { gu = '', date = '', freeOnly = false } = {}) {
  if (gu && row.GUNAME !== gu) return false;
  if (freeOnly && !isFree(row)) return false;
  if (date) {
    const { start, end } = eventDates(row);
    if (!(start <= date && date <= end)) return false;
  }
  return true;
}

export const filterEvents = (rows, conditions) => rows.filter((row) => matches(row, conditions));

export const isFiltered = ({ gu = '', date = '', freeOnly = false } = {}) => Boolean(gu || date || freeOnly);

// 구 목록: 가나다순, 전체 데이터 기준 건수.
export function guCounts(rows) {
  const counts = new Map();
  for (const row of rows) counts.set(row.GUNAME, (counts.get(row.GUNAME) ?? 0) + 1);
  return [...counts].sort(([a], [b]) => a.localeCompare(b, 'ko')).map(([gu, count]) => ({ gu, count }));
}

export const isHttpUrl = (value) => /^https?:\/\//i.test(String(value ?? '').trim());

// 카드 제목 링크 대상: HMPG_ADDR, 없거나 http(s)가 아니면 ORG_LINK, 그것도 아니면 null.
export function linkOf(row) {
  for (const candidate of [row.HMPG_ADDR, row.ORG_LINK]) {
    if (isHttpUrl(candidate)) return candidate.trim();
  }
  return null;
}

export function periodText(row) {
  const { start, end } = eventDates(row);
  return start === end ? start : `${start} ~ ${end}`;
}

export function feeText(row) {
  const fee = String(row.USE_FEE ?? '').trim();
  if (fee) return fee;
  return isFree(row) ? '무료' : '요금 정보 없음';
}

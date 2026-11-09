import type { Holiday } from '@/data/holidays';
import { findLongWeekends } from '@/notifications/long-weekends';

function holiday(date: string, changes: Partial<Holiday> = {}): Holiday {
  return {
    id: `test-${date}-${changes.name ?? 'holiday'}`,
    date,
    name: 'Holiday',
    type: 'public',
    isPublic: true,
    isBank: true,
    isMercantile: false,
    ...changes,
  };
}

const range = (weekends: ReturnType<typeof findLongWeekends>) =>
  weekends.map(({ startDate, endDate }) => [startDate, endDate]);

describe('findLongWeekends', () => {
  it('joins a Friday holiday to the weekend', () => {
    expect(range(findLongWeekends([holiday('2026-11-13')]))).toEqual([
      ['2026-11-13', '2026-11-15'],
    ]);
  });

  it('joins a Monday holiday to the weekend', () => {
    expect(range(findLongWeekends([holiday('2026-11-16')]))).toEqual([
      ['2026-11-14', '2026-11-16'],
    ]);
  });

  it('joins holidays on consecutive days into one long weekend', () => {
    const weekends = findLongWeekends([
      holiday('2026-11-12', { name: 'Thursday' }),
      holiday('2026-11-13', { name: 'Friday' }),
    ]);
    expect(range(weekends)).toEqual([['2026-11-12', '2026-11-15']]);
    expect(weekends[0].holidays.map((entry) => entry.name)).toEqual(['Thursday', 'Friday']);
  });

  it('ignores a midweek holiday', () => {
    expect(findLongWeekends([holiday('2026-11-11')])).toEqual([]);
  });

  it('ignores a holiday that falls on a weekend', () => {
    expect(findLongWeekends([holiday('2026-11-14')])).toEqual([]);
  });

  it('ignores bank-only holidays, which most people work', () => {
    expect(findLongWeekends([holiday('2026-11-13', { isPublic: false })])).toEqual([]);
  });

  it('counts a mercantile holiday as a day off', () => {
    const mercantile = holiday('2026-11-13', { isPublic: false, isMercantile: true });
    expect(range(findLongWeekends([mercantile]))).toEqual([['2026-11-13', '2026-11-15']]);
  });
});

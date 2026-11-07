import sampleHolidays from '@/data/sample-holidays.json';
import {
  getDayOfMonth,
  getHolidayByDate,
  getHolidaysFrom,
  getHolidaysInMonth,
  type HolidayType,
} from '@/data/holidays';
import { parseIsoDate, toIsoDate } from '@/utils/calendar';

const holidayTypes: HolidayType[] = ['public', 'poya'];

describe('holiday data file', () => {
  it('has unique ids', () => {
    const ids = sampleHolidays.map((holiday) => holiday.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses real calendar dates in YYYY-MM-DD format', () => {
    for (const holiday of sampleHolidays) {
      expect(holiday.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(toIsoDate(parseIsoDate(holiday.date))).toBe(holiday.date);
    }
  });

  it('uses only known holiday types', () => {
    for (const holiday of sampleHolidays) {
      expect(holidayTypes).toContain(holiday.type);
    }
  });

  it('gives every holiday a name and at least one holiday kind', () => {
    for (const holiday of sampleHolidays) {
      expect(holiday.name.trim()).not.toBe('');
      expect(holiday.isPublic || holiday.isBank || holiday.isMercantile).toBe(true);
    }
  });

  it('marks sample data so it cannot be mistaken for gazette data', () => {
    for (const holiday of sampleHolidays) {
      expect(holiday.id).toMatch(/^sample-/);
    }
  });
});

describe('getHolidaysInMonth', () => {
  it('returns only holidays in the given month', () => {
    const holidays = getHolidaysInMonth({ year: 2026, monthIndex: 10 });
    expect(holidays.map((holiday) => holiday.date)).toEqual(['2026-11-08', '2026-11-24']);
  });

  it('returns an empty list for a month without holidays', () => {
    expect(getHolidaysInMonth({ year: 2026, monthIndex: 5 })).toEqual([]);
  });
});

describe('getHolidaysFrom', () => {
  it('includes holidays on the start date and is sorted by date', () => {
    const dates = getHolidaysFrom('2026-11-24').map((holiday) => holiday.date);
    expect(dates[0]).toBe('2026-11-24');
    expect(dates).toEqual([...dates].sort());
    expect(dates).not.toContain('2026-11-08');
  });
});

describe('single holiday lookups', () => {
  it('finds a holiday by date', () => {
    expect(getHolidayByDate('2026-11-24')?.name).toBe('Il Full Moon Poya');
    expect(getHolidayByDate('2026-11-25')).toBeUndefined();
  });

  it('reads the day of month from the ISO date', () => {
    expect(getDayOfMonth(getHolidayByDate('2026-11-08')!)).toBe(8);
  });
});

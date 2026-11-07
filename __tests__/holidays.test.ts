import sampleHolidays from '@/data/sample-holidays.json';
import {
  getDayOfMonth,
  getDotTypeByDay,
  getHolidaysByDate,
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
  it('finds every holiday on a date', () => {
    expect(getHolidaysByDate('2026-11-24').map((holiday) => holiday.name)).toEqual([
      'Il Full Moon Poya',
    ]);
    expect(getHolidaysByDate('2026-12-23').map((holiday) => holiday.name)).toEqual([
      'Unduvap Full Moon Poya',
      'Sample Bank Holiday',
    ]);
    expect(getHolidaysByDate('2026-11-25')).toEqual([]);
  });

  it('reads the day of month from the ISO date', () => {
    expect(getDayOfMonth(getHolidaysByDate('2026-11-08')[0])).toBe(8);
  });
});

describe('getDotTypeByDay', () => {
  it('shows the Poya color when a Poya shares its date with another holiday', () => {
    const dotTypes = getDotTypeByDay(getHolidaysInMonth({ year: 2026, monthIndex: 11 }));
    expect(dotTypes.get(23)).toBe('poya');
    expect(dotTypes.get(25)).toBe('public');
  });

  it('does the same whichever holiday comes first', () => {
    const december = getHolidaysInMonth({ year: 2026, monthIndex: 11 });
    expect(getDotTypeByDay([...december].reverse()).get(23)).toBe('poya');
  });
});

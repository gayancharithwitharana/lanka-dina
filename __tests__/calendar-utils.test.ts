import {
  getDaysBetween,
  getMonthGridWeeks,
  getMonthName,
  getWeekdayLabels,
  getWeekdayName,
  isSameDay,
  isValidIsoDate,
  parseIsoDate,
  shiftMonth,
  toIsoDate,
} from '@/utils/calendar';

const november2026 = { year: 2026, monthIndex: 10 };

describe('shiftMonth', () => {
  it('moves forward across a year boundary', () => {
    expect(shiftMonth({ year: 2026, monthIndex: 11 }, 1)).toEqual({ year: 2027, monthIndex: 0 });
  });

  it('moves backward across a year boundary', () => {
    expect(shiftMonth({ year: 2026, monthIndex: 0 }, -1)).toEqual({ year: 2025, monthIndex: 11 });
  });
});

describe('getMonthGridWeeks', () => {
  it('starts November 2026 on Sunday when weeks start on Sunday', () => {
    const weeks = getMonthGridWeeks(november2026, 0);
    expect(weeks[0]).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(weeks.at(-1)).toEqual([29, 30, null, null, null, null, null]);
  });

  it('shifts November 2026 by six blanks when weeks start on Monday', () => {
    const weeks = getMonthGridWeeks(november2026, 1);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(weeks).toHaveLength(6);
  });

  it('always returns full weeks of seven days', () => {
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      for (const weekStartsOn of [0, 1] as const) {
        const weeks = getMonthGridWeeks({ year: 2027, monthIndex }, weekStartsOn);
        weeks.forEach((week) => expect(week).toHaveLength(7));
      }
    }
  });

  it('contains every day of the month exactly once', () => {
    const days = getMonthGridWeeks({ year: 2028, monthIndex: 1 }, 0)
      .flat()
      .filter((day) => day !== null);
    expect(days).toEqual(Array.from({ length: 29 }, (_, index) => index + 1));
  });
});

describe('weekday and month names', () => {
  it('lists narrow weekday labels from the chosen start day', () => {
    expect(getWeekdayLabels(0, 'en')).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    expect(getWeekdayLabels(1, 'en')).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });

  it('names the week start day', () => {
    expect(getWeekdayName(0, 'en')).toBe('Sunday');
    expect(getWeekdayName(1, 'en')).toBe('Monday');
  });

  it('names the month', () => {
    expect(getMonthName(november2026, 'en')).toBe('November');
  });
});

describe('ISO dates', () => {
  it('round-trips between Date and ISO string', () => {
    expect(toIsoDate(parseIsoDate('2026-01-05'))).toBe('2026-01-05');
  });

  it('parses as a local date, not UTC', () => {
    const date = parseIsoDate('2026-11-24');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 24]);
  });
});

describe('isSameDay', () => {
  it('matches only the same year, month and day', () => {
    const today = new Date(2026, 10, 7, 15, 30);
    expect(isSameDay(today, november2026, 7)).toBe(true);
    expect(isSameDay(today, november2026, 8)).toBe(false);
    expect(isSameDay(today, { year: 2025, monthIndex: 10 }, 7)).toBe(false);
  });
});

describe('getDaysBetween', () => {
  it('counts calendar days regardless of time of day', () => {
    const lateEvening = new Date(2026, 10, 7, 23, 30);
    expect(getDaysBetween(lateEvening, parseIsoDate('2026-11-08'))).toBe(1);
    expect(getDaysBetween(lateEvening, parseIsoDate('2026-11-07'))).toBe(0);
  });

  it('counts across a year boundary', () => {
    expect(getDaysBetween(parseIsoDate('2026-12-31'), parseIsoDate('2027-01-01'))).toBe(1);
  });
});

describe('isValidIsoDate', () => {
  it('accepts real dates in YYYY-MM-DD format', () => {
    expect(isValidIsoDate('2026-11-24')).toBe(true);
    expect(isValidIsoDate('2028-02-29')).toBe(true);
  });

  it.each([
    ['foo'],
    ['2026-13-01'],
    ['2026-02-30'],
    ['2026-1-5'],
    [''],
    [undefined],
    [['2026-11-24']],
  ])('rejects %p', (value) => {
    expect(isValidIsoDate(value)).toBe(false);
  });
});

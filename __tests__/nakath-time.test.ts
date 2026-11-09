import {
  formatClockTime,
  getDaysUntil,
  getKalaHorawa,
  isWithinRange,
  splitDateTime,
  toMinutes,
} from '@/utils/nakath-time';

const sunday = (hour: number, minute = 0) => new Date(2026, 10, 8, hour, minute);

describe('toMinutes', () => {
  it('converts a clock time to minutes after midnight', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('16:30')).toBe(990);
  });
});

describe('isWithinRange', () => {
  it('includes the start minute and excludes the end minute', () => {
    expect(isWithinRange(sunday(16, 30), '16:30', '18:00')).toBe(true);
    expect(isWithinRange(sunday(17, 59), '16:30', '18:00')).toBe(true);
    expect(isWithinRange(sunday(18, 0), '16:30', '18:00')).toBe(false);
    expect(isWithinRange(sunday(16, 29), '16:30', '18:00')).toBe(false);
  });
});

describe('formatClockTime', () => {
  it('formats a 24-hour clock time for the locale', () => {
    expect(formatClockTime('15:00', 'en')).toBe('3:00 PM');
    expect(formatClockTime('09:05', 'en')).toBe('9:05 AM');
  });
});

describe('splitDateTime', () => {
  it('splits a date with a time', () => {
    expect(splitDateTime('2027-04-14T09:00')).toEqual({
      date: new Date(2027, 3, 14),
      clockTime: '09:00',
    });
  });

  it('leaves out the time for an all-day date', () => {
    expect(splitDateTime('2027-04-13')).toEqual({ date: new Date(2027, 3, 13) });
  });
});

describe('getKalaHorawa', () => {
  it("starts each day at sunrise with the day's ruling planet", () => {
    expect(getKalaHorawa(sunday(6))).toBe('sun');
    expect(getKalaHorawa(new Date(2026, 10, 9, 6))).toBe('moon');
    expect(getKalaHorawa(new Date(2026, 10, 7, 6))).toBe('saturn');
  });

  it('moves to the next planet every hour', () => {
    expect(getKalaHorawa(sunday(7))).toBe('venus');
    expect(getKalaHorawa(sunday(8, 59))).toBe('mercury');
  });

  it("counts hours before sunrise as part of the previous day's cycle", () => {
    expect(getKalaHorawa(new Date(2026, 10, 9, 5, 30))).toBe('mercury');
  });
});

describe('getDaysUntil', () => {
  it('counts whole days to the date part of a date and time', () => {
    expect(getDaysUntil(new Date(2027, 3, 13, 23, 0), '2027-04-14T09:00')).toBe(1);
    expect(getDaysUntil(new Date(2027, 3, 14, 10, 0), '2027-04-14T09:00')).toBe(0);
  });
});

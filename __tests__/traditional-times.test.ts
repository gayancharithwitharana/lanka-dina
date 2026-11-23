import { bundledDataFiles, type TraditionalFile } from '@/data/data-files';
import {
  getCalculationPlace,
  getKalaHorawa,
  getMaruDirection,
  getRahuKalaya,
} from '@/data/traditional';
import { applyDataFile } from '@/db/apply-data-file';
import { getDaytime, getKalaHorawaAt, toClockTime } from '@/utils/traditional-times';

const rules = bundledDataFiles.find(
  (file): file is TraditionalFile => file.dataset === 'traditional',
)!;

const sunday = (hours: number, minutes = 0) => new Date(2026, 10, 22, hours, minutes);
const monday = (hours: number, minutes = 0) => new Date(2026, 10, 23, hours, minutes);

describe('traditional rules file', () => {
  it('gives every weekday a Rahu kalaya part and a ruling planet', () => {
    expect(rules.rahuKalayaParts).toHaveLength(7);
    expect(new Set(rules.rahuKalayaParts)).toEqual(new Set([2, 3, 4, 5, 6, 7, 8]));
    expect(rules.dayRulers).toHaveLength(7);
    expect(new Set(rules.horawaOrder).size).toBe(7);
  });
});

describe('getDaytime', () => {
  it('uses the real Colombo sunrise and sunset for the date', () => {
    const daytime = getDaytime(sunday(12), rules.location)!;
    expect(toClockTime(daytime.start)).toBe('06:03');
    expect(toClockTime(daytime.end)).toBe('17:50');
  });
});

describe('getRahuKalaya', () => {
  it("takes the weekday's eighth of the time between sunrise and sunset", () => {
    expect(getRahuKalaya(new Date(2026, 10, 24))).toEqual({ start: '14:53', end: '16:22' });
  });
});

describe('getKalaHorawaAt', () => {
  it("starts the day at sunrise with the day's ruling planet", () => {
    expect(getKalaHorawaAt(sunday(6, 4), rules)).toBe('sun');
    expect(getKalaHorawaAt(monday(6, 4), rules)).toBe('moon');
  });

  it('moves to the next planet every twelfth of the daytime', () => {
    expect(getKalaHorawaAt(sunday(7, 1), rules)).toBe('sun');
    expect(getKalaHorawaAt(sunday(7, 3), rules)).toBe('venus');
  });

  it('continues through the night from sunset', () => {
    expect(getKalaHorawaAt(sunday(17, 51), rules)).toBe('jupiter');
  });

  it("counts the hours before sunrise as part of the previous day's night", () => {
    expect(getKalaHorawaAt(monday(5, 30), rules)).toBe('mercury');
  });
});

describe('traditional data from the database', () => {
  it('reads the stored rules', () => {
    expect(getKalaHorawa(sunday(6, 4))).toBe('sun');
    expect(getMaruDirection(2)).toBe('west');
    expect(getMaruDirection(0)).toBeNull();
    expect(getCalculationPlace('si')).toBe('කොළඹ');
  });
});

describe('applyDataFile for traditional rules', () => {
  it('replaces the rules with a newer file', () => {
    const maru = ['north', 'east', 'west', 'south', 'north', 'south-east', 'east'];
    expect(applyDataFile({ ...rules, version: rules.version + 1, maru })).toBe(true);
    expect(getMaruDirection(0)).toBe('north');
  });
});

import { lagnas } from '@/constants/lagnas';
import {
  getAyaWaya,
  getLatestAvurudu,
  getMaruDirection,
  getNakathReminderIds,
  getRahuKalaya,
  setNakathReminder,
} from '@/data/nakath';
import { bundledNakath } from '@/db/prepare-database';
import { toMinutes } from '@/utils/nakath-time';

describe('nakath data file', () => {
  it('marks sample nakath so they cannot be mistaken for the official list', () => {
    for (const nakath of bundledNakath.avurudu) {
      expect(nakath.id).toMatch(/^sample-/);
    }
  });

  it('uses unique ids and sort orders', () => {
    const ids = bundledNakath.avurudu.map((nakath) => nakath.id);
    const sortOrders = bundledNakath.avurudu.map((nakath) => nakath.sortOrder);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(sortOrders).size).toBe(sortOrders.length);
  });

  it('uses dates, or dates with times, in ISO format', () => {
    for (const { startsAt, endsAt } of bundledNakath.avurudu) {
      expect(startsAt).toMatch(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/);
      if (endsAt) expect(endsAt > startsAt).toBe(true);
    }
  });

  it('has a Rahu kalaya that ends after it starts for every weekday', () => {
    expect(bundledNakath.rahuKalaya.map((row) => row.weekday)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    for (const { start, end } of bundledNakath.rahuKalaya) {
      expect(toMinutes(end)).toBeGreaterThan(toMinutes(start));
    }
  });
});

describe('getLatestAvurudu', () => {
  it('returns the latest year in timeline order', () => {
    const avurudu = getLatestAvurudu('en');
    expect(avurudu?.year).toBe(2027);
    expect(avurudu?.items.map((nakath) => nakath.name).slice(0, 3)).toEqual([
      'New moon sighting',
      'Bath for the old year',
      'Dawn of the New Year',
    ]);
  });

  it('falls back to English names when a translation is missing', () => {
    expect(getLatestAvurudu('si')?.items[0].name).toBe('New moon sighting');
  });
});

describe('weekday tables', () => {
  it('finds the Rahu kalaya for a weekday', () => {
    expect(getRahuKalaya(2)).toEqual({ start: '15:00', end: '16:30' });
  });

  it('returns null for a weekday without a Maru direction', () => {
    expect(getMaruDirection(2)).toBe('west');
    expect(getMaruDirection(0)).toBeNull();
  });
});

describe('getAyaWaya', () => {
  it('has income and expenses for every lagna in the sample year', () => {
    for (const lagna of lagnas) {
      expect(getAyaWaya(2027, lagna)).toEqual({
        aya: expect.any(Number),
        waya: expect.any(Number),
      });
    }
  });

  it('returns null for a year without data', () => {
    expect(getAyaWaya(2030, 'simha')).toBeNull();
  });
});

describe('nakath reminders', () => {
  it('turns a reminder on once and off again', () => {
    const dawn = getLatestAvurudu('en')!.items[2];

    setNakathReminder(dawn, true);
    setNakathReminder(dawn, true);
    expect([...getNakathReminderIds()]).toEqual([dawn.id]);

    setNakathReminder(dawn, false);
    expect(getNakathReminderIds().size).toBe(0);
  });
});

import { lagnas } from '@/constants/lagnas';
import {
  getAyaWaya,
  getLatestAvurudu,
  getNakathReminderIds,
  setNakathReminder,
} from '@/data/nakath';
import { bundledDataFiles, type NakathFile } from '@/data/data-files';

const bundledNakath = bundledDataFiles.filter(
  (file): file is NakathFile => file.dataset === 'nakath',
);
const bundledAvurudu = bundledNakath.flatMap((file) => file.items);

describe('nakath data file', () => {
  it('names a countdown nakath that exists in the same file', () => {
    for (const file of bundledNakath) {
      expect(file.items.map((nakath) => nakath.key)).toContain(file.countdownKey);
    }
  });

  it('marks sample nakath so they cannot be mistaken for the official list', () => {
    for (const nakath of bundledAvurudu) {
      expect(nakath.id).toMatch(/^sample-/);
    }
  });

  it('uses unique ids and sort orders', () => {
    const ids = bundledAvurudu.map((nakath) => nakath.id);
    const sortOrders = bundledAvurudu.map((nakath) => nakath.sortOrder);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(sortOrders).size).toBe(sortOrders.length);
  });

  it('uses dates, or dates with times, in ISO format', () => {
    for (const { startsAt, endsAt } of bundledAvurudu) {
      expect(startsAt).toMatch(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/);
      if (endsAt) expect(endsAt > startsAt).toBe(true);
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

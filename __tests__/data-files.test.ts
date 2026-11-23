import { eq } from 'drizzle-orm';

import type { HolidayFile, NakathFile } from '@/data/data-files';
import { getDataSource, getDataSources } from '@/data/data-sources';
import { getHolidaysFrom } from '@/data/holidays';
import { getCountdownNakath, getLatestAvurudu, setNakathReminder } from '@/data/nakath';
import { applyDataFile } from '@/db/apply-data-file';
import { db } from '@/db/client';
import { reminders } from '@/db/schema';
import { parseIsoDate } from '@/utils/calendar';

const holiday = (id: string, date: string) => ({
  id,
  date,
  nameEn: id,
  type: 'public' as const,
  isPublic: true,
  isBank: true,
  isMercantile: false,
});

function holidayFile(version: number, items: HolidayFile['items']): HolidayFile {
  return {
    dataset: 'holidays',
    year: 2030,
    version,
    source: { en: 'Holidays gazette 2030', si: 'නිවාඩු ගැසට් 2030' },
    sourceUrl: 'https://documents.gov.lk/2030.pdf',
    retrievedAt: '2029-11-01',
    items,
  };
}

const nakathItem = (id: string, startsAt: string, sortOrder: number) => ({
  id,
  key: id,
  sortOrder,
  nameEn: id,
  startsAt,
});

function nakathFile(
  version: number,
  items: NakathFile['items'],
  countdownKey?: string,
): NakathFile {
  return {
    dataset: 'nakath',
    year: 2031,
    version,
    source: { en: 'Ministry of Buddhasasana, Religious and Cultural Affairs' },
    retrievedAt: '2031-03-01',
    ...(countdownKey ? { countdownKey } : {}),
    items,
  };
}

const holidayNames = () =>
  getHolidaysFrom('2030-01-01', 'en')
    .filter((item) => item.date.startsWith('2030'))
    .map((item) => item.name);

const reminderOn = (date: string) =>
  db.select().from(reminders).where(eq(reminders.date, date)).get();

afterEach(() => {
  db.delete(reminders).run();
});

describe('applyDataFile for holidays', () => {
  it('adds a new year and records its source', () => {
    expect(applyDataFile(holidayFile(1, [holiday('2030-new-year', '2030-04-14')]))).toBe(true);

    expect(holidayNames()).toEqual(['2030-new-year']);
    expect(getDataSource('holidays', 2030, 'si')).toEqual({
      year: 2030,
      name: 'නිවාඩු ගැසට් 2030',
      url: 'https://documents.gov.lk/2030.pdf',
      retrievedAt: '2029-11-01',
    });
    expect(getDataSource('holidays', 2030, 'ta')?.name).toBe('Holidays gazette 2030');
  });

  it('ignores a file that is not newer than the stored one', () => {
    applyDataFile(holidayFile(2, [holiday('2030-new-year', '2030-04-14')]));
    expect(applyDataFile(holidayFile(2, [holiday('2030-other', '2030-05-01')]))).toBe(false);
    expect(applyDataFile(holidayFile(1, [holiday('2030-other', '2030-05-01')]))).toBe(false);
    expect(holidayNames()).toEqual(['2030-new-year']);
  });

  it('removes holidays a newer file no longer lists and leaves other years alone', () => {
    applyDataFile(
      holidayFile(3, [holiday('2030-new-year', '2030-04-14'), holiday('2030-vesak', '2030-05-16')]),
    );
    applyDataFile(holidayFile(4, [holiday('2030-vesak', '2030-05-16')]));

    expect(holidayNames()).toEqual(['2030-vesak']);
    expect(getHolidaysFrom('2026-01-01', 'en').some((item) => item.date.startsWith('2026'))).toBe(
      true,
    );
  });

  it('keeps a custom reminder on its date but drops the link when its holiday moves or goes', () => {
    applyDataFile(
      holidayFile(5, [
        holiday('2030-kept', '2030-06-01'),
        holiday('2030-moved', '2030-07-01'),
        holiday('2030-removed', '2030-08-01'),
      ]),
    );
    for (const [id, date] of [
      ['2030-kept', '2030-06-01'],
      ['2030-moved', '2030-07-01'],
      ['2030-removed', '2030-08-01'],
    ]) {
      db.insert(reminders).values({ date, time: '08:00', kind: 'custom', holidayId: id }).run();
    }

    applyDataFile(
      holidayFile(6, [holiday('2030-kept', '2030-06-01'), holiday('2030-moved', '2030-07-02')]),
    );

    expect(reminderOn('2030-06-01')?.holidayId).toBe('2030-kept');
    expect(reminderOn('2030-07-01')?.holidayId).toBeNull();
    expect(reminderOn('2030-08-01')?.holidayId).toBeNull();
  });
});

describe('applyDataFile for nakath', () => {
  it('replaces the nakath list and its bell reminders', () => {
    applyDataFile(
      nakathFile(1, [
        nakathItem('2031-dawn', '2031-04-14T09:00', 1),
        nakathItem('2031-hearth', '2031-04-14T10:15', 2),
      ]),
    );
    const avurudu = getLatestAvurudu('en')!;
    setNakathReminder(avurudu.items[0], true);
    setNakathReminder(avurudu.items[1], true);

    applyDataFile(nakathFile(2, [nakathItem('2031-dawn', '2031-04-14T09:30', 1)]));

    expect(getLatestAvurudu('en')?.items.map((item) => item.id)).toEqual(['2031-dawn']);
    expect(db.select().from(reminders).all()).toMatchObject([
      { nakathId: '2031-dawn', date: '2031-04-14', time: '09:30' },
    ]);
  });
});

describe('getCountdownNakath', () => {
  const today = parseIsoDate('2031-04-13');

  it('counts down to the nakath the file names', () => {
    applyDataFile(
      nakathFile(
        3,
        [
          nakathItem('2031-moon', '2031-04-13T18:30', 1),
          nakathItem('2031-dawn', '2031-04-14T09:00', 2),
        ],
        '2031-dawn',
      ),
    );
    expect(getCountdownNakath(getLatestAvurudu('en')!, today)?.id).toBe('2031-dawn');
  });

  it('counts down to the next nakath when the named one is missing', () => {
    applyDataFile(
      nakathFile(
        4,
        [nakathItem('2031-bath', '2031-04-12', 1), nakathItem('2031-moon', '2031-04-13T18:30', 2)],
        '2031-dawn',
      ),
    );
    expect(getCountdownNakath(getLatestAvurudu('en')!, today)?.id).toBe('2031-moon');
  });

  it('has no countdown when every nakath has passed', () => {
    applyDataFile(nakathFile(5, [nakathItem('2031-bath', '2031-04-12', 1)]));
    expect(getCountdownNakath(getLatestAvurudu('en')!, today)).toBeNull();
  });
});

describe('getDataSources', () => {
  it('lists one source per year in order', () => {
    expect(getDataSources('holidays', 'en').map((source) => source.year)).toEqual([
      2026, 2027, 2030,
    ]);
  });
});

import Storage from 'expo-sqlite/kv-store';

import { getDataSource } from '@/data/data-sources';
import { getHolidaysByDate } from '@/data/holidays';
import { DATA_URL, updateRemoteData } from '@/data/remote-data';

const holidayFile = (version: number, name: string) => ({
  dataset: 'holidays',
  year: 2032,
  version,
  source: { en: 'Holidays gazette 2032' },
  retrievedAt: '2031-11-01',
  items: [
    {
      id: '2032-new-year',
      date: '2032-04-14',
      nameEn: name,
      type: 'public',
      isPublic: true,
      isBank: true,
      isMercantile: true,
    },
  ],
});

const manifestFor = (version: number) => ({
  files: [{ path: 'holidays-2032.json', dataset: 'holidays', year: 2032, version }],
});

function serve(files: Record<string, unknown>) {
  const fetchMock = jest.fn(async (url: string) => {
    const name = url.replace(DATA_URL, '');
    return name in files
      ? { ok: true, status: 200, json: async () => files[name] }
      : { ok: false, status: 404, json: async () => null };
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const now = new Date(2031, 11, 1, 9, 0);
const laterBy = (minutes: number) => new Date(now.getTime() + minutes * 60_000);
const newYearName = () => getHolidaysByDate('2032-04-14', 'en')[0]?.name;

beforeEach(() => {
  (Storage as unknown as { clear: () => void }).clear();
});

describe('updateRemoteData', () => {
  it('downloads a newer file from the manifest and applies it', async () => {
    serve({ 'manifest.json': manifestFor(1), 'holidays-2032.json': holidayFile(1, 'New Year') });

    expect(await updateRemoteData(now)).toBe(true);
    expect(newYearName()).toBe('New Year');
    expect(getDataSource('holidays', 2032, 'en')?.name).toBe('Holidays gazette 2032');
  });

  it('checks at most once an hour', async () => {
    const fetchMock = serve({ 'manifest.json': manifestFor(1) });

    await updateRemoteData(laterBy(0));
    await updateRemoteData(laterBy(59));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await updateRemoteData(laterBy(60));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('shares one check when launch and foreground ask at the same time', async () => {
    const fetchMock = serve({ 'manifest.json': manifestFor(1) });

    await Promise.all([updateRemoteData(laterBy(120)), updateRemoteData(laterBy(120))]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('skips files whose version the phone already has', async () => {
    serve({ 'manifest.json': manifestFor(2), 'holidays-2032.json': holidayFile(2, 'Renamed') });
    await updateRemoteData(now);
    const fetchMock = serve({ 'manifest.json': manifestFor(2) });

    expect(await updateRemoteData(laterBy(60))).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('ignores an invalid file and keeps the current data', async () => {
    serve({ 'manifest.json': manifestFor(3), 'holidays-2032.json': { dataset: 'holidays' } });
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    expect(await updateRemoteData(now)).toBe(false);
    expect(newYearName()).toBe('Renamed');
  });

  it('fails without changing anything when the phone is offline', async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    await expect(updateRemoteData(now)).rejects.toThrow('Network request failed');
    expect(newYearName()).toBe('Renamed');
  });
});

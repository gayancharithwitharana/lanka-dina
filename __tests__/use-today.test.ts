import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { useToday } from '@/hooks/use-today';
import { toIsoDate } from '@/utils/calendar';

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 7, 23, 59, 30) });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('useToday', () => {
  it('moves to the next day at midnight while the app stays open', async () => {
    const { result } = await renderHook(() => useToday());
    expect(toIsoDate(result.current)).toBe('2026-11-07');

    await act(async () => {
      jest.advanceTimersByTime(60 * 1000);
    });

    expect(toIsoDate(result.current)).toBe('2026-11-08');
  });

  it('catches up when the app returns from the background on a new day', async () => {
    let notifyAppState: (state: AppStateStatus) => void = () => {};
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      notifyAppState = listener;
      return { remove: jest.fn() };
    });
    const { result } = await renderHook(() => useToday());

    jest.setSystemTime(new Date(2026, 10, 9, 8, 0));
    await act(async () => {
      notifyAppState('active');
    });

    expect(toIsoDate(result.current)).toBe('2026-11-09');
  });
});

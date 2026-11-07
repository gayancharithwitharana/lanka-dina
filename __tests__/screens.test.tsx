import { Slot } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import { renderRouter, screen } from 'expo-router/testing-library';
import { act, userEvent } from '@testing-library/react-native';

const APP_DIRECTORY = {
  appDir: 'src/app',
  overrides: { '(tabs)/_layout': () => <Slot /> },
};

beforeEach(() => {
  (Storage as unknown as { clear: () => void }).clear();
  jest.useFakeTimers({ now: new Date(2026, 10, 7, 9, 0), doNotFake: ['nextTick', 'setImmediate'] });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Calendar screen', () => {
  it('shows the current month with its holidays', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/' });

    expect(screen.getByText('November')).toBeOnTheScreen();
    expect(screen.getByText('Deepavali')).toBeOnTheScreen();
    expect(screen.getByText('Il Full Moon Poya')).toBeOnTheScreen();
  });

  it('opens day detail when a holiday card is pressed', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const router = await renderRouter(APP_DIRECTORY, { initialUrl: '/' });

    await user.press(screen.getByText('Il Full Moon Poya'));

    expect(router.getPathname()).toBe('/day/2026-11-24');
    expect(screen.getByText('Tuesday')).toBeOnTheScreen();
  });

  it('pages to the next month', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/' });

    await user.press(screen.getByRole('button', { name: 'Next month' }));

    expect(screen.getByText('December')).toBeOnTheScreen();
    expect(screen.getByText('Christmas Day')).toBeOnTheScreen();
  });
});

describe('Day detail screen', () => {
  it('goes to the calendar when opened directly from a link', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const router = await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-11-24' });

    await user.press(screen.getByRole('button', { name: 'Back to calendar' }));

    expect(router.getPathname()).toBe('/');
    expect(screen.getByText('This month')).toBeOnTheScreen();
  });

  it('lists every holiday on a shared date', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-12-23' });

    expect(screen.getByText('Unduvap Full Moon Poya')).toBeOnTheScreen();
    expect(screen.getByText('Sample Bank Holiday')).toBeOnTheScreen();
  });

  it.each([['/day/foo'], ['/day/2026-13-45']])(
    'shows a fallback for the invalid date %s',
    async (url) => {
      await renderRouter(APP_DIRECTORY, { initialUrl: url });

      expect(screen.getByText("This date doesn't exist")).toBeOnTheScreen();
      expect(screen.getByRole('button', { name: 'Back to calendar' })).toBeOnTheScreen();
    },
  );
});

describe('Upcoming screen', () => {
  it('counts down to upcoming holidays and filters by type', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/upcoming' });

    expect(screen.getByText('Tomorrow')).toBeOnTheScreen();
    expect(screen.getByText('In 17 days')).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: 'Poya' }));

    expect(screen.queryByText('Deepavali')).not.toBeOnTheScreen();
    expect(screen.getByText('Il Full Moon Poya')).toBeOnTheScreen();
  });
});

describe('Upcoming screen at midnight', () => {
  it('updates the countdown when the day changes', async () => {
    jest.setSystemTime(new Date(2026, 10, 7, 23, 59, 30));
    await renderRouter(APP_DIRECTORY, { initialUrl: '/upcoming' });
    expect(screen.getByText('Tomorrow')).toBeOnTheScreen();

    await act(async () => {
      jest.advanceTimersByTime(60 * 1000);
    });

    expect(screen.getByText('Today')).toBeOnTheScreen();
    expect(screen.getByText('In 16 days')).toBeOnTheScreen();
  });
});

describe('Settings screen', () => {
  it('saves the chosen week start', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/settings' });

    await user.press(screen.getByRole('radio', { name: 'Monday' }));

    expect(screen.getByRole('radio', { name: 'Monday' })).toBeChecked();
    expect(JSON.parse(Storage.getItemSync('settings')!)).toMatchObject({ weekStartsOn: 1 });
  });
});

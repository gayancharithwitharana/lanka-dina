import { Slot } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import { renderRouter, screen } from 'expo-router/testing-library';
import { act, userEvent } from '@testing-library/react-native';
import { Share } from 'react-native';

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

  it('shows the Rahu kalaya and Maru direction for the weekday', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-11-24' });

    expect(screen.getByText('3:00 PM – 4:30 PM')).toBeOnTheScreen();
    expect(screen.getByText('West')).toBeOnTheScreen();
  });

  it("opens today's nakath from the Rahu kalaya card", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const router = await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-11-24' });

    await user.press(screen.getByRole('button', { name: /Rahu kalaya/ }));

    expect(router.getPathname()).toBe('/nakath');
    expect(screen.getByText('Rahu kalaya · Saturday')).toBeOnTheScreen();
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

describe('Nakath screen', () => {
  it('counts down to the dawn of the New Year and lists the nakath', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath' });

    expect(screen.getByText('Sinhala & Tamil New Year 2027')).toBeOnTheScreen();
    expect(screen.getByText('158 days')).toBeOnTheScreen();
    expect(screen.getByText('Lighting the hearth')).toBeOnTheScreen();
    expect(screen.getAllByText('Face south · Wear red')).toHaveLength(2);
    expect(screen.getByText('Sample times · not the official list')).toBeOnTheScreen();
  });

  it('turns a nakath reminder on and off with its bell', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath' });
    const bell = () => screen.getByRole('switch', { name: 'Remind me: Lighting the hearth' });

    await user.press(bell());
    expect(bell()).toBeChecked();

    await user.press(bell());
    expect(bell()).not.toBeChecked();
  });

  it('shares the nakath list as text', async () => {
    const share = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath' });

    await user.press(screen.getByRole('button', { name: 'Share' }));

    const { message } = share.mock.calls[0][0] as { message: string };
    expect(message).toContain('Sinhala & Tamil New Year 2027');
    expect(message).toContain('Apr 14 10:15 AM · Lighting the hearth · Face south · Wear red');
    expect(message).toContain('Sample times · not the official list');
  });

  it("shows today's Rahu kalaya, Maru direction and kala horawa", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath' });

    await user.press(screen.getByRole('radio', { name: 'Today' }));

    expect(screen.getByText('Rahu kalaya · Saturday')).toBeOnTheScreen();
    expect(screen.getByText('9:00 AM – 10:30 AM')).toBeOnTheScreen();
    expect(screen.getByText('Now')).toBeOnTheScreen();
    expect(screen.getByText('Not available')).toBeOnTheScreen();
    expect(screen.getByText('Sun')).toBeOnTheScreen();
  });

  it('shows aya-waya once a lagna is set', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath?view=today' });

    await user.press(screen.getByRole('button', { name: 'Set lagna' }));
    await user.press(screen.getByRole('radio', { name: 'Simha' }));

    expect(screen.getByText('Simha lagna · 2027')).toBeOnTheScreen();
    expect(screen.getByText('Income (aya)')).toBeOnTheScreen();
    expect(JSON.parse(Storage.getItemSync('settings')!)).toMatchObject({ lagna: 'simha' });
  });
});

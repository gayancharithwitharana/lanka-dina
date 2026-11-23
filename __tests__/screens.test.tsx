import { router, Slot } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';
import { renderRouter, screen } from 'expo-router/testing-library';
import { act, fireEvent, userEvent } from '@testing-library/react-native';
import { Share } from 'react-native';

import { notifyDataUpdated } from '@/data/data-updates';
import { applyDataFile } from '@/db/apply-data-file';

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

  it("shows the Rahu kalaya from that day's sunrise and sunset, and the Maru direction", async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-11-24' });

    expect(screen.getByText('2:53 PM – 4:22 PM')).toBeOnTheScreen();
    expect(screen.getByText('West')).toBeOnTheScreen();
  });

  it("opens today's nakath from the Rahu kalaya card", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const router = await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-11-24' });

    await user.press(screen.getByRole('button', { name: /Rahu kalaya/ }));

    expect(router.getPathname()).toBe('/nakath');
    expect(screen.getByText('Rahu kalaya · Saturday')).toBeOnTheScreen();
  });

  it('adds a note and shows it on the day', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-11-08' });
    expect(screen.getByText('No note yet')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Add note' }));
    await user.type(screen.getByLabelText('Note'), 'Light the oil lamps');
    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Light the oil lamps')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Edit note' })).toBeOnTheScreen();
  });

  it('sets a reminder for the day at 8:00 AM and deletes it', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/day/2026-12-25' });

    await user.press(screen.getByRole('button', { name: 'Set reminder' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Reminder set · 8:00 AM' })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Reminder set · 8:00 AM' }));
    await user.press(screen.getByRole('button', { name: 'Delete reminder' }));
    expect(screen.getByRole('button', { name: 'Set reminder' })).toBeOnTheScreen();
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
  it('lists the source of each holiday year', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/settings' });

    expect(screen.getByText('2026 · Sample data · not the official list')).toBeOnTheScreen();
    expect(screen.getByText('2027 · Sample data · not the official list')).toBeOnTheScreen();
    expect(screen.getAllByText('Updated Nov 22, 2026')).toHaveLength(2);
  });

  it('shows a newly downloaded holiday year without reopening the screen', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/settings' });

    await act(async () => {
      applyDataFile({
        dataset: 'holidays',
        year: 2028,
        version: 1,
        source: { en: 'Holidays gazette 2028' },
        retrievedAt: '2027-11-01',
        items: [],
      });
      notifyDataUpdated();
    });

    expect(screen.getByText('2028 · Holidays gazette 2028')).toBeOnTheScreen();
  });

  it('saves the chosen week start', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/settings' });

    await user.press(screen.getByRole('radio', { name: 'Monday' }));

    expect(screen.getByRole('radio', { name: 'Monday' })).toBeChecked();
    expect(JSON.parse(Storage.getItemSync('settings')!)).toMatchObject({ weekStartsOn: 1 });
  });
});

describe('Nakath screen', () => {
  it('counts down to the nakath the data names and lists the nakath', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath' });

    expect(screen.getByText('Sinhala & Tamil New Year 2027')).toBeOnTheScreen();
    expect(screen.getByText('Dawn of the New Year in')).toBeOnTheScreen();
    expect(screen.getByText('158 days')).toBeOnTheScreen();
    expect(screen.getByText('Lighting the hearth')).toBeOnTheScreen();
    expect(screen.getAllByText('Face south · Wear red')).toHaveLength(2);
    expect(screen.getByText('Sample data · not the official list')).toBeOnTheScreen();
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
    expect(message).toContain('Sample data · not the official list');
  });

  it("shows today's Rahu kalaya, Maru direction and kala horawa", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath' });

    await user.press(screen.getByRole('radio', { name: 'Today' }));

    expect(screen.getByText('Rahu kalaya · Saturday')).toBeOnTheScreen();
    expect(screen.getByText('8:56 AM – 10:25 AM')).toBeOnTheScreen();
    expect(screen.getByText('Now')).toBeOnTheScreen();
    expect(screen.getByText('Calculated from Colombo sunrise and sunset')).toBeOnTheScreen();
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

describe('Reminders screen', () => {
  it('turns automatic reminders on and off', async () => {
    await renderRouter(APP_DIRECTORY, { initialUrl: '/reminders' });

    expect(screen.getByRole('switch', { name: 'Every Poya day' })).toBeChecked();
    expect(screen.getByText('Evening before, 7:00 PM')).toBeOnTheScreen();

    await act(() =>
      fireEvent(screen.getByRole('switch', { name: 'Long weekends' }), 'valueChange', true),
    );

    expect(screen.getByRole('switch', { name: 'Long weekends' })).toBeChecked();
    expect(JSON.parse(Storage.getItemSync('settings')!)).toMatchObject({
      longWeekendReminders: true,
    });
  });

  it('lists reminders set on days and nakath, soonest first', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/nakath' });
    await user.press(screen.getByRole('switch', { name: 'Remind me: Lighting the hearth' }));

    await act(() => router.push('/day/2026-11-24'));
    await user.press(screen.getByRole('button', { name: 'Set reminder' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));
    await act(() => router.navigate('/reminders'));

    expect(screen.getByText('Il Full Moon Poya')).toBeOnTheScreen();
    expect(screen.getByText('Tue, Nov 24 · 8:00 AM')).toBeOnTheScreen();
    expect(screen.getByText('Lighting the hearth')).toBeOnTheScreen();
    expect(screen.getByText('Wed, Apr 14 · 10:15 AM')).toBeOnTheScreen();
  });

  it('creates a reminder from the + button', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderRouter(APP_DIRECTORY, { initialUrl: '/reminders' });

    await user.press(screen.getByRole('button', { name: 'New reminder' }));
    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(screen.getByText('Reminder for Sat, Nov 7')).toBeOnTheScreen();
  });
});

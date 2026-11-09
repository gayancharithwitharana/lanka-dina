import { DEFAULT_REMINDER_TIME, getDayReminderTime, setDayReminder } from '@/data/day-reminders';
import { getNakathReminderIds, getLatestAvurudu, setNakathReminder } from '@/data/nakath';
import { getNote, saveNote } from '@/data/notes';

describe('notes', () => {
  it('saves, updates and trims a note for a date', () => {
    saveNote('2026-11-24', '  Go to the temple  ');
    expect(getNote('2026-11-24')).toBe('Go to the temple');

    saveNote('2026-11-24', 'Observe sil');
    expect(getNote('2026-11-24')).toBe('Observe sil');
    expect(getNote('2026-11-25')).toBeNull();
  });

  it('deletes the note when it is saved empty', () => {
    saveNote('2026-12-25', 'Family lunch');
    saveNote('2026-12-25', '   ');
    expect(getNote('2026-12-25')).toBeNull();
  });
});

describe('day reminders', () => {
  it('sets one reminder per day at the default time and removes it', () => {
    setDayReminder('2026-11-08', 'sample-2026-11-08', true);
    setDayReminder('2026-11-08', 'sample-2026-11-08', true);
    expect(getDayReminderTime('2026-11-08')).toBe(DEFAULT_REMINDER_TIME);

    setDayReminder('2026-11-08', null, false);
    expect(getDayReminderTime('2026-11-08')).toBeNull();
  });

  it('keeps nakath reminders on the same date separate', () => {
    const dawn = getLatestAvurudu('en')!.items[2];
    setNakathReminder(dawn, true);

    setDayReminder('2027-04-14', null, true);
    setDayReminder('2027-04-14', null, false);

    expect(getNakathReminderIds().has(dawn.id)).toBe(true);
    setNakathReminder(dawn, false);
  });
});

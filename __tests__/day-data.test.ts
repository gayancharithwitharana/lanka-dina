import {
  DEFAULT_REMINDER_TIME,
  deleteDayReminder,
  getDayReminderTime,
  saveDayReminder,
} from '@/data/day-reminders';
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
  it('keeps one reminder per day and replaces its time', () => {
    saveDayReminder('2026-11-08', DEFAULT_REMINDER_TIME, 'sample-2026-11-08');
    saveDayReminder('2026-11-08', '18:30', 'sample-2026-11-08');
    expect(getDayReminderTime('2026-11-08')).toBe('18:30');

    deleteDayReminder('2026-11-08');
    expect(getDayReminderTime('2026-11-08')).toBeNull();
  });

  it('keeps nakath reminders on the same date separate', () => {
    const dawn = getLatestAvurudu('en')!.items[2];
    setNakathReminder(dawn, true);

    saveDayReminder('2027-04-14', DEFAULT_REMINDER_TIME, null);
    deleteDayReminder('2027-04-14');

    expect(getNakathReminderIds().has(dawn.id)).toBe(true);
    setNakathReminder(dawn, false);
  });
});

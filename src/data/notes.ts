import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { notes } from '@/db/schema';

export function getNote(isoDate: string): string | null {
  return db.select().from(notes).where(eq(notes.date, isoDate)).get()?.text ?? null;
}

export function saveNote(isoDate: string, text: string): void {
  const trimmedText = text.trim();
  if (trimmedText === '') {
    db.delete(notes).where(eq(notes.date, isoDate)).run();
    return;
  }

  const updatedAt = new Date().toISOString();
  db.insert(notes)
    .values({ date: isoDate, text: trimmedText, updatedAt })
    .onConflictDoUpdate({ target: notes.date, set: { text: trimmedText, updatedAt } })
    .run();
}

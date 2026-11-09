import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import migrations from '@/db/migrations/migrations';

type ExpoMigrations = Parameters<typeof migrate>[1];

function firstMigrationsOnly(count: number): ExpoMigrations {
  return {
    ...migrations,
    journal: { ...migrations.journal, entries: migrations.journal.entries.slice(0, count) },
  };
}

function openDatabase() {
  const sqlite = new Database(':memory:');
  return { sqlite, db: drizzle(sqlite) as unknown as Parameters<typeof migrate>[0] };
}

describe('database migrations', () => {
  it('upgrades a database from the first release and keeps saved notes and reminders', async () => {
    const { sqlite, db } = openDatabase();
    await migrate(db, firstMigrationsOnly(1));
    sqlite
      .prepare('INSERT INTO notes (date, text, updated_at) VALUES (?, ?, ?)')
      .run('2026-11-08', 'Keep me', '2026-11-08T08:00:00.000Z');
    sqlite
      .prepare('INSERT INTO reminders (date, time, kind, enabled) VALUES (?, ?, ?, ?)')
      .run('2026-11-08', '08:00', 'custom', 1);

    await migrate(db, migrations);

    expect(sqlite.prepare('SELECT text FROM notes').all()).toEqual([{ text: 'Keep me' }]);
    expect(sqlite.prepare('SELECT date, nakath_id FROM reminders').all()).toEqual([
      { date: '2026-11-08', nakath_id: null },
    ]);
    expect(sqlite.prepare('SELECT count(*) AS count FROM nakath').get()).toEqual({ count: 0 });
  });

  it('does nothing when the database is already up to date', async () => {
    const { sqlite, db } = openDatabase();
    await migrate(db, migrations);
    await migrate(db, migrations);

    expect(sqlite.prepare('SELECT count(*) AS count FROM __drizzle_migrations').get()).toEqual({
      count: migrations.journal.entries.length,
    });
  });
});

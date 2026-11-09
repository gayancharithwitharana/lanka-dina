jest.mock('expo-sqlite/kv-store', () => {
  const storedValues = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItemSync: (key: string) => storedValues.get(key) ?? null,
      setItemSync: (key: string, value: string) => storedValues.set(key, value),
      clear: () => storedValues.clear(),
    },
  };
});

jest.mock('@/db/client', () => {
  const Database = require('better-sqlite3');
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  const schema = require('@/db/schema');
  return { db: drizzle(new Database(':memory:'), { schema }) };
});

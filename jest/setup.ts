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

const sharedMockStorage = new Map<string, string>();

const createMockStorage = () => ({
  getString: (key: string): string | undefined => sharedMockStorage.get(key),
  set: (key: string, value: string): void => {
    sharedMockStorage.set(key, value);
  },
  remove: (key: string): void => {
    sharedMockStorage.delete(key);
  },
  clearAll: (): void => {
    sharedMockStorage.clear();
  },
  getAllKeys: (): Array<string> => Array.from(sharedMockStorage.keys()),
  contains: (key: string): boolean => sharedMockStorage.has(key),
  getNumber: (key: string): number | undefined => {
    const value = sharedMockStorage.get(key);
    return value ? Number(value) : undefined;
  },
  getBoolean: (key: string): boolean | undefined => {
    const value = sharedMockStorage.get(key);
    if (value === undefined) {
      return undefined;
    }
    return value === 'true';
  },
  setNumber: (key: string, value: number): void => {
    sharedMockStorage.set(key, String(value));
  },
  setBoolean: (key: string, value: boolean): void => {
    sharedMockStorage.set(key, String(value));
  },
});

export function createMMKV(_options?: { id?: string }) {
  return createMockStorage();
}

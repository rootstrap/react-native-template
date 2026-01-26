const sharedMockStorage = new Map<string, string>();

const createMockStorage = () => {
  const mockGetString = jest.fn((key: string): string | undefined =>
    sharedMockStorage.get(key),
  );

  const mockSet = jest.fn((key: string, value: string): void => {
    sharedMockStorage.set(key, value);
  });

  const mockRemove = jest.fn((key: string): void => {
    sharedMockStorage.delete(key);
  });

  return {
    getString: mockGetString,
    set: mockSet,
    remove: mockRemove,
    clearAll: jest.fn((): void => {
      sharedMockStorage.clear();
    }),
    getAllKeys: jest.fn(
      (): Array<string> => Array.from(sharedMockStorage.keys()),
    ),
    contains: jest.fn((key: string): boolean => sharedMockStorage.has(key)),
    getNumber: jest.fn((key: string): number | undefined => {
      const value = sharedMockStorage.get(key);
      return value ? Number(value) : undefined;
    }),
    getBoolean: jest.fn((key: string): boolean | undefined => {
      const value = sharedMockStorage.get(key);
      if (value === undefined) {
        return undefined;
      }
      return value === 'true';
    }),
    setNumber: jest.fn((key: string, value: number): void => {
      sharedMockStorage.set(key, String(value));
    }),
    setBoolean: jest.fn((key: string, value: boolean): void => {
      sharedMockStorage.set(key, String(value));
    }),
  };
};

export function createMMKV(_options?: { id?: string }) {
  return createMockStorage();
}

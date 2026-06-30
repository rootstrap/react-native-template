import { getItem, removeItem, setItem, storage } from '@/lib/storage';

const TEST_VALUE = 123;
const TEST_NUMBER = 42;

// Mock react-native-mmkv
// Note: The mock is already set up globally in jest-setup.ts
// We just need to cast the storage to access jest mock functions
function setupMockStorage() {
  const mockStorage = storage as unknown as {
    getString: jest.Mock;
    set: jest.Mock;
    remove: jest.Mock;
  };
  jest.clearAllMocks();
  return mockStorage;
}

describe('storage utilities', () => {
  let mockStorage: {
    getString: jest.Mock;
    set: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    mockStorage = setupMockStorage();
  });

  describe('getItem', () => {
    it('should return parsed JSON when value exists', () => {
      const testData = { name: 'test', value: TEST_VALUE };
      mockStorage.getString.mockReturnValue(JSON.stringify(testData));

      const result = getItem('test-key');

      expect(mockStorage.getString).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null when value does not exist', () => {
      mockStorage.getString.mockReturnValue(undefined);

      const result = getItem('non-existent-key');

      expect(mockStorage.getString).toHaveBeenCalledWith('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return null when value is empty string', () => {
      mockStorage.getString.mockReturnValue('');

      const result = getItem('empty-key');

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should store stringified JSON', async () => {
      const testData = { name: 'test', value: TEST_VALUE };

      await setItem('test-key', testData);

      expect(mockStorage.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData),
      );
    });

    it('should handle primitive values', async () => {
      await setItem('string-key', 'test string');
      await setItem('number-key', TEST_NUMBER);
      await setItem('boolean-key', true);

      expect(mockStorage.set).toHaveBeenCalledWith(
        'string-key',
        '"test string"',
      );
      expect(mockStorage.set).toHaveBeenCalledWith('number-key', '42');
      expect(mockStorage.set).toHaveBeenCalledWith('boolean-key', 'true');
    });
  });

  describe('removeItem', () => {
    it('should remove the key from storage', async () => {
      await removeItem('test-key');

      expect(mockStorage.remove).toHaveBeenCalledWith('test-key');
    });
  });
});

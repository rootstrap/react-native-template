import { type MMKV } from 'react-native-mmkv';

import { getItem, removeItem, setItem, storage } from '@/lib/storage';

const TEST_VALUE = 123;
const TEST_NUMBER = 42;

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

function setupMockStorage() {
  const mockStorage = storage as jest.Mocked<MMKV>;
  jest.clearAllMocks();
  return mockStorage;
}

describe('storage utilities', () => {
  let mockStorage: jest.Mocked<MMKV>;

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
    it('should delete the key from storage', async () => {
      await removeItem('test-key');

      expect(mockStorage.delete).toHaveBeenCalledWith('test-key');
    });
  });
});

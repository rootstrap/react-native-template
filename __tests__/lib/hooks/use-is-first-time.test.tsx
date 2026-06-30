import { renderHook } from '@testing-library/react-native';
import { useMMKVBoolean } from 'react-native-mmkv';

import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

// Mock react-native-mmkv before importing the hook
jest.mock('react-native-mmkv', () => ({
  useMMKVBoolean: jest.fn(),
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock the storage module
jest.mock('@/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockUseMMKVBoolean = useMMKVBoolean as jest.MockedFunction<
  typeof useMMKVBoolean
>;

describe('useIsFirstTime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when isFirstTime is undefined', () => {
    mockUseMMKVBoolean.mockReturnValue([undefined, jest.fn()]);

    const { result } = renderHook(() => useIsFirstTime());

    expect(result.current[0]).toBe(true);
    expect(typeof result.current[1]).toBe('function');
  });

  it('should return the actual value when isFirstTime is defined', () => {
    const mockSetIsFirstTime = jest.fn();
    mockUseMMKVBoolean.mockReturnValue([false, mockSetIsFirstTime]);

    const { result } = renderHook(() => useIsFirstTime());

    expect(result.current[0]).toBe(false);
    expect(result.current[1]).toBe(mockSetIsFirstTime);
  });

  it('should return true when isFirstTime is true', () => {
    const mockSetIsFirstTime = jest.fn();
    mockUseMMKVBoolean.mockReturnValue([true, mockSetIsFirstTime]);

    const { result } = renderHook(() => useIsFirstTime());

    expect(result.current[0]).toBe(true);
    expect(result.current[1]).toBe(mockSetIsFirstTime);
  });
});

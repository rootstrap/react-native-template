import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-expect-error - window is not defined in React Native test environment
globalThis.window = {};
// @ts-expect-error - window needs to reference globalThis for react-hook-form compatibility
globalThis.window = globalThis;

jest.mock('react-native-mmkv');
jest.mock('react-native-worklets', () => jest.requireActual<object>('react-native-worklets/src/mock'));
jest.mock('react-native-reanimated/lib/module/initializers.native', () => ({
  initializeReanimatedModule: jest.fn(),
}));
jest.mock('react-native-reanimated/src/initializers.native', () => ({
  initializeReanimatedModule: jest.fn(),
}));
jest.mock('react-native-reanimated', () => jest.requireActual<object>('react-native-reanimated/mock'));

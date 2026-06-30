import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-expect-error - window is not defined in React Native test environment
globalThis.window = {};
// @ts-expect-error - window needs to reference globalThis for react-hook-form compatibility
globalThis.window = globalThis;

jest.mock('react-native-mmkv');

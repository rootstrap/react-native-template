/* eslint-disable react-refresh/only-export-components */
import type { RenderOptions } from '@testing-library/react-native';

import type { ReactElement } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { render, userEvent } from '@testing-library/react-native';
import * as React from 'react';
import '@shopify/flash-list/jestSetup';

<<<<<<< HEAD
jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

const createAppWrapper =
  () =>
  ({ children }: { children: React.ReactNode }) => (
=======
function createAppWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
>>>>>>> f6309e9
    <BottomSheetModalProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </BottomSheetModalProvider>
  );
<<<<<<< HEAD

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
=======
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
>>>>>>> f6309e9
  const Wrapper = createAppWrapper(); // make sure we have a new wrapper for each render
  return render(ui, { wrapper: Wrapper, ...options });
}

// use this if you want to test user events
<<<<<<< HEAD
export const setup = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
=======
export function setup(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
>>>>>>> f6309e9
  const Wrapper = createAppWrapper();
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

export * from '@testing-library/react-native';
export { customRender as render };

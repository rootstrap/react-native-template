import type { RenderOptions } from '@testing-library/react-native';

import type { ReactElement } from 'react';
import type { AnalyticsProviderAdapter } from '@/lib/analytics';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render, userEvent } from '@testing-library/react-native';
import * as React from 'react';
import { AnalyticsProvider } from '@/components/providers/analytics';
import '@shopify/flash-list/jestSetup';

jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

const noAnalyticsProviders: ReadonlyArray<AnalyticsProviderAdapter> = [];

function createAppWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <AnalyticsProvider providers={noAnalyticsProviders}>
      <BottomSheetModalProvider>
        {children}
      </BottomSheetModalProvider>
    </AnalyticsProvider>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const Wrapper = createAppWrapper(); // make sure we have a new wrapper for each render
  return render(ui, { wrapper: Wrapper, ...options });
}

// use this if you want to test user events
export function setup(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const Wrapper = createAppWrapper();
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

export * from '@testing-library/react-native';
export { customRender as render };

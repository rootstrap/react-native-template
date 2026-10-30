import type {
  AnalyticsEvent,
  AnalyticsEventArgs,
  AnalyticsParams,
  AnalyticsProviderAdapter,
} from '@/lib/analytics';
import * as React from 'react';
import { createContext, use, useEffect, useMemo } from 'react';

type AnalyticsContextProps = {
  providers: ReadonlyArray<AnalyticsProviderAdapter>;
  trackEvent: <E extends AnalyticsEvent>(name: E, ...args: AnalyticsEventArgs<E>) => void;
  trackScreen: (screenName: string, params?: AnalyticsParams) => void;
  identify: (userId: string, traits?: AnalyticsParams) => void;
  reset: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

function reportProviderError(error: unknown) {
  console.error('[analytics] provider call failed', error);
}

/**
 * Runs `call` against every provider, isolating failures so a broken vendor
 * SDK never breaks the app or the other providers.
 */
function fanOut(
  providers: ReadonlyArray<AnalyticsProviderAdapter>,
  call: (provider: AnalyticsProviderAdapter) => Promise<void>,
) {
  providers.forEach((provider) => {
    void call(provider).catch(reportProviderError);
  });
}

type AnalyticsProviderProps = {
  /** Keep this array stable (module-level constant) so providers init only once. */
  providers: ReadonlyArray<AnalyticsProviderAdapter>;
  children: React.ReactNode;
};

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  providers,
  children,
}) => {
  useEffect(() => {
    fanOut(providers, async provider => provider.init());
  }, [providers]);

  const values = useMemo<AnalyticsContextProps>(
    () => ({
      providers,
      trackEvent: (name, ...args) => {
        const [params] = args;
        fanOut(providers, async provider => provider.trackEvent(name, params));
      },
      trackScreen: (screenName, params) => {
        fanOut(providers, async provider => provider.trackScreen(screenName, params));
      },
      identify: (userId, traits) => {
        fanOut(providers, async provider => provider.identify?.(userId, traits));
      },
      reset: () => {
        fanOut(providers, async provider => provider.reset?.());
      },
    }),
    [providers],
  );

  return <AnalyticsContext value={values}>{children}</AnalyticsContext>;
};

export function useAnalytics(): AnalyticsContextProps {
  const context = use(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

import type {
  AnalyticsEvent,
  AnalyticsEventArgs,
  AnalyticsParams,
  AnalyticsProviderAdapter,
} from '@/lib/analytics';
import * as React from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

type AnalyticsContextProps = {
  trackEvent: <E extends AnalyticsEvent>(name: E, ...args: AnalyticsEventArgs<E>) => void;
  trackScreen: (screenName: string, params?: AnalyticsParams) => void;
  identify: (userId: string, traits?: AnalyticsParams) => void;
  reset: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

function reportProviderError(error: unknown) {
  // eslint-disable-next-line no-console
  console.info('[analytics] provider call failed', error);
}

type ProviderReadiness = {
  started: boolean;
  ready: Promise<boolean>;
  resolve: (initialised: boolean) => void;
};

function createReadiness(): ProviderReadiness {
  let resolve!: (initialised: boolean) => void;
  const ready = new Promise<boolean>((res) => {
    resolve = res;
  });
  return { started: false, ready, resolve };
}

function useProviderReadiness(providers: ReadonlyArray<AnalyticsProviderAdapter>) {
  const [readiness] = useState(() => new Map<AnalyticsProviderAdapter, ProviderReadiness>());

  const readinessOf = useCallback((provider: AnalyticsProviderAdapter) => {
    let entry = readiness.get(provider);
    if (entry === undefined) {
      entry = createReadiness();
      readiness.set(provider, entry);
    }
    return entry;
  }, [readiness]);

  useEffect(() => {
    providers.forEach((provider) => {
      const entry = readinessOf(provider);
      if (entry.started) {
        return;
      }
      entry.started = true;
      Promise.resolve()
        .then(async () => provider.init())
        .then(
          () => entry.resolve(true),
          (error: unknown) => {
            reportProviderError(error);
            entry.resolve(false);
          },
        );
    });
  }, [providers, readinessOf]);

  return readinessOf;
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
  const readinessOf = useProviderReadiness(providers);

  const values = useMemo<AnalyticsContextProps>(() => {
    const fanOut = (call: (provider: AnalyticsProviderAdapter) => void | Promise<void>) => {
      providers.forEach((provider) => {
        void readinessOf(provider)
          .ready
          .then(async initialised => (initialised ? call(provider) : undefined))
          .catch(reportProviderError);
      });
    };

    return {
      trackEvent: (name, ...args) => {
        const [params] = args;
        fanOut(async provider => provider.trackEvent(name, params));
      },
      trackScreen: (screenName, params) => {
        fanOut(async provider => provider.trackScreen(screenName, params));
      },
      identify: (userId, traits) => {
        fanOut(async provider => provider.identify?.(userId, traits));
      },
      reset: () => {
        fanOut(async provider => provider.reset?.());
      },
    };
  }, [providers, readinessOf]);

  return <AnalyticsContext value={values}>{children}</AnalyticsContext>;
};

export function useAnalytics(): AnalyticsContextProps {
  const context = use(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

import type {
  AnalyticsEvent,
  AnalyticsEventArgs,
  AnalyticsParams,
  AnalyticsProviderAdapter,
} from '@/lib/analytics';
import * as React from 'react';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { clearUserIdentified, markUserIdentified } from '@/lib/analytics';

type AnalyticsContextProps = {
  trackEvent: <E extends AnalyticsEvent>(name: E, ...args: AnalyticsEventArgs<E>) => void;
  trackScreen: (screenName: string, params?: AnalyticsParams) => void;
  identify: (userId: string, traits?: AnalyticsParams) => void;
  reset: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextProps | undefined>(undefined);

export const ANALYTICS_TIMEOUT_MS = 10_000;

function reportProviderError(error: unknown) {
  if (!__DEV__) {
    return;
  }
  console.error('[analytics] provider call failed', error);
}

async function withTimeout(promise: Promise<void>, ms: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`[analytics] provider call timed out after ${ms}ms`)), ms);
  });
  try {
    await Promise.race([promise, timedOut]);
  }
  finally {
    clearTimeout(timeout);
  }
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
      withTimeout(Promise.resolve().then(async () => provider.init()), ANALYTICS_TIMEOUT_MS)
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
  /** Keep this array stable (module-level constant); a new array re-creates the `useAnalytics()` callbacks. */
  providers: ReadonlyArray<AnalyticsProviderAdapter>;
  children: React.ReactNode;
};

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  providers,
  children,
}) => {
  const readinessOf = useProviderReadiness(providers);
  const [identityBarriers] = useState(() => new Map<AnalyticsProviderAdapter, Promise<boolean>>());

  const values = useMemo<AnalyticsContextProps>(() => {
    const barrierOf = async (provider: AnalyticsProviderAdapter) =>
      identityBarriers.get(provider) ?? readinessOf(provider).ready;

    const fanOut = (call: (provider: AnalyticsProviderAdapter) => void | Promise<void>) => {
      providers.forEach((provider) => {
        void barrierOf(provider)
          .then(async initialised => (initialised ? call(provider) : undefined))
          .catch(reportProviderError);
      });
    };

    const fanOutIdentity = (call: (provider: AnalyticsProviderAdapter) => void | Promise<void>) => {
      providers.forEach((provider) => {
        const next = barrierOf(provider).then(async (initialised) => {
          if (initialised) {
            await withTimeout(Promise.resolve().then(async () => call(provider)), ANALYTICS_TIMEOUT_MS)
              .catch(reportProviderError);
          }
          return initialised;
        });
        identityBarriers.set(provider, next);
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
        markUserIdentified();
        fanOutIdentity(async provider => provider.identify?.(userId, traits));
      },
      reset: () => {
        clearUserIdentified();
        fanOutIdentity(async provider => provider.reset?.());
      },
    };
  }, [identityBarriers, providers, readinessOf]);

  return <AnalyticsContext value={values}>{children}</AnalyticsContext>;
};

export function useAnalytics(): AnalyticsContextProps {
  const context = use(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

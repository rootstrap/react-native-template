import { useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAnalytics } from '@/components/providers/analytics';
import { useAuth } from '@/components/providers/auth';
import { hasIdentifiedUser } from '@/lib/analytics';

function isRouteGroup(segment: string) {
  return segment.startsWith('(') && segment.endsWith(')');
}

function toScreenName(segments: ReadonlyArray<string>) {
  return `/${segments.filter(segment => !isRouteGroup(segment)).join('/')}`;
}

/**
 * Reports a screen view to every analytics provider whenever the route
 * changes. Call it once, inside `AnalyticsProvider`, after auth is ready.
 */
export function useAnalyticsScreenTracking() {
  const screenName = toScreenName(useSegments());
  const { trackScreen } = useAnalytics();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (lastTrackedRef.current === screenName) {
        return;
      }
      lastTrackedRef.current = screenName;
      trackScreen(screenName);
    }, 0);
    return () => clearTimeout(timeout);
  }, [screenName, trackScreen]);
}

/**
 * Call it once, inside `AnalyticsProvider`, after auth is ready.
 */
export function useAnalyticsSessionReset() {
  const { isAuthenticated } = useAuth();
  const { reset } = useAnalytics();
  const wasAuthenticatedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const signedOut = wasAuthenticatedRef.current === true && !isAuthenticated;
    const startedSignedOutAfterIdentify = wasAuthenticatedRef.current === null && !isAuthenticated && hasIdentifiedUser();
    if (signedOut || startedSignedOutAfterIdentify) {
      reset();
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, reset]);
}

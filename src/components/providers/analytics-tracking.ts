import { useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAnalytics } from '@/components/providers/analytics';
import { useAuth } from '@/components/providers/auth';

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

  useEffect(() => {
    trackScreen(screenName);
  }, [screenName, trackScreen]);
}

/**
 * Call it once, inside `AnalyticsProvider`, after auth is ready.
 */
export function useAnalyticsSessionReset() {
  const { isAuthenticated } = useAuth();
  const { reset } = useAnalytics();
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      reset();
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, reset]);
}

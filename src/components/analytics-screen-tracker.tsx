import { useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAnalytics } from '@/components/providers/analytics';

function isRouteGroup(segment: string) {
  return segment.startsWith('(') && segment.endsWith(')');
}

function toScreenName(segments: ReadonlyArray<string>) {
  return `/${segments.filter(segment => !isRouteGroup(segment)).join('/')}`;
}

/**
 * Reports a screen view to every analytics provider whenever the route
 * changes. Mount it once, inside `AnalyticsProvider`, after auth is ready.
 */
export function AnalyticsScreenTracker() {
  const screenName = toScreenName(useSegments());
  const { trackScreen } = useAnalytics();

  useEffect(() => {
    trackScreen(screenName);
  }, [screenName, trackScreen]);

  return null;
}

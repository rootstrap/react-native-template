import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { useAnalytics } from '@/components/providers/analytics';

/**
 * Reports a screen view to every analytics provider whenever the route
 * changes. Mount it once, inside `AnalyticsProvider`.
 */
export function AnalyticsScreenTracker() {
  const pathname = usePathname();
  const { trackScreen } = useAnalytics();

  useEffect(() => {
    trackScreen(pathname);
  }, [pathname, trackScreen]);

  return null;
}

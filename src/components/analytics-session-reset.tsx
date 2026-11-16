import { useEffect, useRef } from 'react';

import { useAnalytics } from '@/components/providers/analytics';
import { useAuth } from '@/components/providers/auth';

/**
 * Mount it once, inside `AnalyticsProvider`, after auth is ready.
 */
export function AnalyticsSessionReset() {
  const { isAuthenticated } = useAuth();
  const { reset } = useAnalytics();
  const wasAuthenticatedRef = useRef(isAuthenticated);

  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      reset();
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, reset]);

  return null;
}

import type { Href } from 'expo-router';

import { isReturnToPath } from './deep-link-path';

type GuardState = {
  isFirstTime: boolean;
  isAuthenticated: boolean;
  pendingDeepLink?: string | null;
};

export function getFallbackRoute({
  isFirstTime,
  isAuthenticated,
  pendingDeepLink = null,
}: GuardState): Href {
  if (isFirstTime) {
    return '/onboarding';
  }
  if (!isAuthenticated) {
    return '/sign-in';
  }
  return pendingDeepLink !== null && isReturnToPath(pendingDeepLink) ? pendingDeepLink : '/';
}

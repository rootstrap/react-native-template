import type { NativeIntent } from 'expo-router';

import { hasValidSession, syncSession } from '@/components/providers/auth';
import { isReturnToPath, toAppPath } from '@/lib/auth/deep-link-path';
import { getFallbackRoute } from '@/lib/auth/get-fallback-route';
import { clearPendingDeepLink, setPendingDeepLink } from '@/lib/auth/pending-deep-link';
import { getIsFirstTime } from '@/lib/hooks/use-is-first-time';

type RedirectSystemPathEvent = Parameters<NonNullable<NativeIntent['redirectSystemPath']>>[0];

export function redirectSystemPath({ path }: RedirectSystemPathEvent): string {
  try {
    const appPath = toAppPath(path);
    if (!isReturnToPath(appPath) || hasValidSession()) {
      clearPendingDeepLink();
      return path;
    }

    syncSession();
    const isFirstTime = getIsFirstTime();
    if (isFirstTime) {
      clearPendingDeepLink();
    }
    else {
      setPendingDeepLink(appPath);
    }
    return getFallbackRoute({ isFirstTime, isAuthenticated: false });
  }
  catch {
    clearPendingDeepLink();
    return path;
  }
}

import type { NativeIntent } from 'expo-router';

import { isReturnToPath, toAppPath } from '@/lib/auth/deep-link-path';
import { clearPendingDeepLink, setPendingDeepLink } from '@/lib/auth/pending-deep-link';

type RedirectSystemPathEvent = Parameters<NonNullable<NativeIntent['redirectSystemPath']>>[0];

export function redirectSystemPath({ path }: RedirectSystemPathEvent) {
  try {
    const appPath = toAppPath(path);
    if (isReturnToPath(appPath)) {
      setPendingDeepLink(appPath);
    }
    else {
      clearPendingDeepLink();
    }
  }
  catch {
    clearPendingDeepLink();
  }
  return path;
}

import { create } from 'zustand';

import { createSelectors } from '../utils';
import { isInAppPath } from './deep-link-path';

type PendingDeepLinkState = {
  path: string | null;
};

const _usePendingDeepLink = create<PendingDeepLinkState>(() => ({
  path: null,
}));

export const usePendingDeepLink = createSelectors(_usePendingDeepLink);

export function setPendingDeepLink(path: string) {
  _usePendingDeepLink.setState({ path: isInAppPath(path) ? path : null });
}

export function clearPendingDeepLink() {
  _usePendingDeepLink.setState({ path: null });
}

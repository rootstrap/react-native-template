import type { StoreApi, UseBoundStore } from 'zustand';
import { Linking } from 'react-native';

export function openLinkInBrowser(url: string): void {
  void Linking.canOpenURL(url).then((canOpen) => {
    if (canOpen) {
      void Linking.openURL(url);
    }
  });
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export function createSelectors<
  T extends object,
  S extends UseBoundStore<StoreApi<T>>,
>(_store: S) {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {} as { [K in keyof T]: () => T[K] };

  for (const k of Object.keys(store.getState()) as Array<keyof T>) {
    store.use[k] = () => store(s => s[k]);
  }

  return store;
}

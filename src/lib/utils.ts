import type { StoreApi, UseBoundStore } from 'zustand';
import { Linking } from 'react-native';

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then(canOpen => canOpen && Linking.openURL(url));
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

<<<<<<< HEAD
export const createSelectors = <
  T extends object,
  S extends UseBoundStore<StoreApi<T>>,
>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {} as { [K in keyof T]: () => T[K] };

  for (const k of Object.keys(store.getState()) as Array<keyof T>) {
    store.use[k] = () => store((s) => s[k]);
=======
export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(_store: S) {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store(s => s[k as keyof typeof s]);
>>>>>>> f6309e9
  }

  return store;
}

import { storage } from '@/lib/storage';

const IDENTIFIED_USER_KEY = 'analytics.identified-user';

export function markUserIdentified() {
  storage.set(IDENTIFIED_USER_KEY, true);
}

export function clearUserIdentified() {
  storage.remove(IDENTIFIED_USER_KEY);
}

export function hasIdentifiedUser() {
  return storage.contains(IDENTIFIED_USER_KEY);
}

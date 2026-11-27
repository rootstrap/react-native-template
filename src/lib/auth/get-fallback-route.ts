import type { Href } from 'expo-router';

type GuardState = {
  isFirstTime: boolean;
  isAuthenticated: boolean;
};

export function getFallbackRoute({ isFirstTime, isAuthenticated }: GuardState): Extract<Href, string> {
  if (isFirstTime) {
    return '/onboarding';
  }
  return isAuthenticated ? '/' : '/sign-in';
}

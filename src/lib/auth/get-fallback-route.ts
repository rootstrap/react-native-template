type GuardState = {
  isFirstTime: boolean;
  isAuthenticated: boolean;
};

export function getFallbackRoute({ isFirstTime, isAuthenticated }: GuardState) {
  if (isFirstTime) {
    return '/onboarding' as const;
  }
  return isAuthenticated ? ('/' as const) : ('/sign-in' as const);
}

import { getFallbackRoute } from '../../../src/lib/auth/get-fallback-route';

describe('getFallbackRoute', () => {
  it.each([
    { isFirstTime: true, isAuthenticated: false, expected: '/onboarding' },
    { isFirstTime: true, isAuthenticated: true, expected: '/onboarding' },
    { isFirstTime: false, isAuthenticated: false, expected: '/sign-in' },
    { isFirstTime: false, isAuthenticated: true, expected: '/' },
  ])(
    'returns $expected when isFirstTime=$isFirstTime and isAuthenticated=$isAuthenticated',
    ({ isFirstTime, isAuthenticated, expected }) => {
      expect(getFallbackRoute({ isFirstTime, isAuthenticated })).toBe(expected);
    },
  );
});

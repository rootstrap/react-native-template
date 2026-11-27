import { act, renderHook } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react-native';
import dayjs from 'dayjs';
import { AppState } from 'react-native';

import { Text, TouchableOpacity, View } from '@/components/ui';
import { fireEvent, render, screen } from '@/lib/test-utils';

import {
  AuthProvider,
  clearTokens,
  getTokenDetails,
  getValidAccessToken,
  hasValidSession,
  storeTokens,
  syncSession,
  useAuth,
} from '../../../src/components/providers/auth';

// Mock API client interceptors
jest.mock('@/api', () => ({
  client: {
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  },
}));

const mockAddAppStateListener = jest
  .spyOn(AppState, 'addEventListener')
  .mockImplementation(() => ({ remove: jest.fn() }));

const TestComponent = () => {
  const { token, isAuthenticated, loading, ready, logout } = useAuth();
  return (
    <View>
      <Text testID="token">{token}</Text>
      <Text testID="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</Text>
      <Text testID="loading">{loading ? 'true' : 'false'}</Text>
      <Text testID="ready">{ready ? 'true' : 'false'}</Text>
      <TouchableOpacity testID="logout" onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const mockedAccessToken = 'access-token';
const mockedValidToken = 'valid-token';
const mockedRefreshToken = 'refresh-token';
const mockedExpiryDate = '2025-01-17T00:00:00Z';
const mockedUserId = 'user-id';

describe('Auth Utilities', () => {
  afterEach(() => {
    clearTokens();
  });

  it('stores tokens correctly', () => {
    storeTokens({
      accessToken: mockedAccessToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: mockedExpiryDate,
    });

    const tokens = getTokenDetails();
    expect(tokens).toEqual({
      accessToken: mockedAccessToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: mockedExpiryDate,
    });
  });

  it('clears tokens correctly', () => {
    storeTokens({
      accessToken: mockedAccessToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: mockedExpiryDate,
    });
    clearTokens();

    const tokens = getTokenDetails();
    expect(tokens).toEqual({
      accessToken: '',
      refreshToken: '',
      userId: '',
      expiration: '',
    });
  });
});

describe('session helpers', () => {
  afterEach(() => {
    clearTokens();
  });

  const storeSession = (expiration: string) => {
    storeTokens({
      accessToken: mockedValidToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration,
    });
  };

  it('reports a valid session while the token has not expired', () => {
    storeSession(dayjs().add(1, 'hour').toISOString());

    expect(hasValidSession()).toBe(true);
    expect(getValidAccessToken()).toBe(mockedValidToken);
  });

  it('reports no session when nothing is stored', () => {
    expect(hasValidSession()).toBe(false);
    expect(getValidAccessToken()).toBeNull();
  });

  it('reports no session once the token has expired', () => {
    storeSession(dayjs().subtract(1, 'minute').toISOString());

    expect(hasValidSession()).toBe(false);
    expect(getValidAccessToken()).toBeNull();
  });
});

describe('AuthProvider', () => {
  it('provides initial state correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toEqual({
      token: null,
      isAuthenticated: false,
      loading: false,
      ready: true,
      logout: expect.any(Function),
    });
  });

  it('handles token state correctly', async () => {
    storeTokens({
      accessToken: mockedValidToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: dayjs().add(1, 'hour').toISOString(),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    expect(result.current.token).toBe('valid-token');
    expect(result.current.loading).toBe(false);
    expect(result.current.ready).toBe(true);
  });

  it('starts logged out when the stored token has expired', () => {
    storeTokens({
      accessToken: mockedValidToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: mockedExpiryDate,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.ready).toBe(true);
    clearTokens();
  });

  function storeSession(expiration: string) {
    storeTokens({
      accessToken: mockedValidToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration,
    });
  }

  it('logs out when a session sync finds the stored token expired', () => {
    storeSession(dayjs().add(1, 'hour').toISOString());
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.isAuthenticated).toBe(true);

    storeSession(mockedExpiryDate);
    act(() => syncSession());

    expect(result.current.isAuthenticated).toBe(false);
    clearTokens();
  });

  it('logs out when the app returns to the foreground with an expired token', () => {
    storeSession(dayjs().add(1, 'hour').toISOString());
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    const onAppStateChange = mockAddAppStateListener.mock.calls.at(-1)?.[1];

    storeSession(mockedExpiryDate);
    act(() => onAppStateChange?.('active'));

    expect(result.current.isAuthenticated).toBe(false);
    clearTokens();
  });

  it('stops syncing once unmounted', () => {
    storeSession(dayjs().add(1, 'hour').toISOString());
    const { result, unmount } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    unmount();

    storeSession(mockedExpiryDate);

    expect(() => syncSession()).not.toThrow();
    expect(result.current.isAuthenticated).toBe(true);
    clearTokens();
  });

  it('logs out correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.logout();
    });

    expect(getTokenDetails()).toEqual({
      accessToken: '',
      refreshToken: '',
      userId: '',
      expiration: '',
    });
    expect(result.current.isAuthenticated).toBe(false);
  });
});
describe('TestComponent', () => {
  afterEach(() => {
    clearTokens();
  });

  it('renders correctly and handles logout', async () => {
    // Set initial tokens
    storeTokens({
      accessToken: mockedValidToken,
      refreshToken: mockedRefreshToken,
      userId: mockedUserId,
      expiration: dayjs().add(1, 'hour').toISOString(),
    });

    // Render the component with AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Verify initial state
    expect(screen.getByTestId('token')).toHaveTextContent('valid-token');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('ready')).toHaveTextContent('true');

    // Simulate logout action
    fireEvent.press(screen.getByTestId('logout'));

    // Verify state after logout
    expect(screen.getByTestId('token')).toHaveTextContent('');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('ready')).toHaveTextContent('true');
  });
});

import dayjs from 'dayjs';
import * as React from 'react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createMMKV } from 'react-native-mmkv';

import { client } from '@/api';

const unauthorizedHttpStatusCode = 401;

const storageKey = 'auth-storage';

export const authStorage = createMMKV({
  id: storageKey,
});

export const HEADER_KEYS = {
  ACCESS_TOKEN: 'access-token',
  REFRESH_TOKEN: 'client',
  USER_ID: 'uid',
  EXPIRY: 'expiry',
  AUTHORIZATION: 'Authorization',
};

export function storeTokens(args: {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiration: string;
}) {
  authStorage.set(HEADER_KEYS.ACCESS_TOKEN, args.accessToken);
  authStorage.set(HEADER_KEYS.REFRESH_TOKEN, args.refreshToken);
  authStorage.set(HEADER_KEYS.USER_ID, args.userId);
  authStorage.set(HEADER_KEYS.EXPIRY, args.expiration);
}

export function getTokenDetails() {
  return {
    accessToken: authStorage.getString(HEADER_KEYS.ACCESS_TOKEN) ?? '',
    refreshToken: authStorage.getString(HEADER_KEYS.REFRESH_TOKEN) ?? '',
    userId: authStorage.getString(HEADER_KEYS.USER_ID) ?? '',
    expiration: authStorage.getString(HEADER_KEYS.EXPIRY) ?? '',
  };
}

export function clearTokens() {
  authStorage.clearAll();
}

// Request interceptor to add Authorization header
client.interceptors.request.use(
  (config) => {
    const { accessToken, expiration } = getTokenDetails();

    // Check if token is expired
    if (dayjs().isAfter(dayjs(expiration))) {
      // TODO
      // Handle token refresh logic
      clearTokens();
    }

    if (accessToken) {
      config.headers[HEADER_KEYS.AUTHORIZATION] = `Bearer ${accessToken}`;
    }

    return config;
  },
  async error => Promise.reject(error),
);

// Response interceptor to handle tokens
client.interceptors.response.use(
  (response) => {
    const accessToken = (response.headers[HEADER_KEYS.ACCESS_TOKEN] as string | undefined) ?? '';
    const refreshToken = (response.headers[HEADER_KEYS.REFRESH_TOKEN] as string | undefined) ?? '';
    const userId = (response.headers[HEADER_KEYS.USER_ID] as string | undefined) ?? '';

    const expiryHeader = response.headers[HEADER_KEYS.EXPIRY] as string | undefined;
    const expiration = expiryHeader !== undefined
      ? dayjs
          .unix(Number.parseInt(expiryHeader, 10))
          .toISOString()
      : dayjs().add(1, 'hour').toISOString();

    if (accessToken !== '' && refreshToken !== '' && userId !== '' && expiration !== '') {
      storeTokens({ accessToken, refreshToken, userId, expiration });
    }

    return response;
  },
  async error => Promise.reject(error),
);

type AuthContextProps = {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  ready: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const checkToken = useCallback(() => {
    const storedToken = authStorage.getString(HEADER_KEYS.ACCESS_TOKEN);
    const expiration = authStorage.getString(HEADER_KEYS.EXPIRY);

    if (storedToken === undefined || expiration === undefined) {
      setToken(null);
      setLoading(false);
      setReady(true);
      return;
    }

    const isExpired = dayjs().isAfter(dayjs(expiration));

    if (isExpired) {
      setToken(null); // Token expired, clear it
    }
    else {
      setToken(storedToken); // Token is valid, set it
    }

    setLoading(false);
    setReady(true);
  }, []);

  const logout = () => {
    clearTokens();
    setToken(null);
  };

  useEffect(() => {
    try {
      checkToken();
    }
    catch {
      setReady(true);
    }
    const requestInterceptor = client.interceptors.response.use(
      (config) => {
        if (config.status === unauthorizedHttpStatusCode) {
          logout();
        }
        checkToken();
        return config;
      },
      async error => Promise.reject(error),
    );

    return () => {
      client.interceptors.request.eject(requestInterceptor);
    };
  }, [checkToken]);

  const values = useMemo(
    () => ({
      token,
      isAuthenticated: token !== null,
      loading,
      ready,
      logout,
    }),
    [loading, ready, token],
  );
  return <AuthContext value={values}>{children}</AuthContext>;
};

export function useAuth(): AuthContextProps {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

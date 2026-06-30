import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useLogin } from '@/api/auth/use-login';
import { client } from '@/api/common';

// Mock the client
jest.mock('@/api/common', () => ({
  client: jest.fn(),
}));

const mockedClient = client as jest.MockedFunction<typeof client>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function createMockLoginResponse(overrides = {}) {
  return {
    data: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      ...overrides,
    },
  };
}

function createLoginVariables(overrides = {}) {
  return {
    email: 'test@example.com',
    password: 'password123',
    ...overrides,
  };
}

const createWrapper = () => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useLogin).toBeDefined();
  });

  it('should call client with correct parameters', async () => {
    const mockResponse = createMockLoginResponse();
    mockedClient.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    const variables = createLoginVariables();
    result.current.mutate(variables);

    await waitFor(() => {
      expect(mockedClient).toHaveBeenCalledWith({
        url: '/v1/users/sign_in',
        method: 'POST',
        data: {
          user: variables,
        },
      });
    });
  });

  it('should handle login with expiresInMins parameter', async () => {
    const mockResponse = createMockLoginResponse();
    mockedClient.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    });

    const variables = createLoginVariables({ expiresInMins: 60 });
    result.current.mutate(variables);

    await waitFor(() => {
      expect(mockedClient).toHaveBeenCalledWith({
        url: '/v1/users/sign_in',
        method: 'POST',
        data: {
          user: variables,
        },
      });
    });
  });
});

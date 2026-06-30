import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useSignUp } from '@/api/auth/use-sign-up';
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

function createMockSignUpResponse(overrides = {}) {
  return {
    data: {
      status: 'success',
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        provider: 'email',
        uid: 'test@example.com',
        allowPasswordChange: true,
        ...overrides,
      },
    },
  };
}

function createSignUpVariables(overrides = {}) {
  return {
    email: 'test@example.com',
    name: 'Test User',
    password: 'password123',
    passwordConfirmation: 'password123',
    ...overrides,
  };
}

const createWrapper = () => {
  const queryClient = createTestQueryClient();

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSignUp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useSignUp).toBeDefined();
  });

  it('should call client with correct parameters', async () => {
    const mockResponse = createMockSignUpResponse({
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    });

    mockedClient.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    const variables = createSignUpVariables();
    result.current.mutate(variables);

    await waitFor(() => {
      expect(mockedClient).toHaveBeenCalledWith({
        url: '/v1/users',
        method: 'POST',
        data: {
          user: variables,
        },
      });
    });
  });

  it('should handle sign up with all required fields', async () => {
    const mockResponse = createMockSignUpResponse({
      email: 'newuser@example.com',
      name: 'New User',
      uid: 'newuser@example.com',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    });

    mockedClient.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    const variables = createSignUpVariables({
      email: 'newuser@example.com',
      name: 'New User',
      password: 'securepassword',
      passwordConfirmation: 'securepassword',
    });

    result.current.mutate(variables);

    await waitFor(() => {
      expect(mockedClient).toHaveBeenCalledWith({
        url: '/v1/users',
        method: 'POST',
        data: {
          user: variables,
        },
      });
    });
  });
});

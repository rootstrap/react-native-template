import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useForgotPassword } from '@/api/auth/use-forgot-password';
import { client } from '@/api/common';

// Mock the client
jest.mock('@/api/common', () => ({
  client: jest.fn(),
}));

const mockedClient = client as jest.MockedFunction<typeof client>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useForgotPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useForgotPassword).toBeDefined();
  });

  it('should call client with correct parameters', async () => {
    const mockResponse = {
      data: {
        message: 'Password reset email sent',
      },
    };

    mockedClient.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useForgotPassword(), {
      wrapper: createWrapper(),
    });

    const variables = {
      email: 'test@example.com',
    };

    result.current.mutate(variables);

    await waitFor(() => {
      expect(mockedClient).toHaveBeenCalledWith({
        url: '/v1/users/password',
        method: 'POST',
        data: {
          email: variables.email,
          redirect_url: 'https://example.com',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
});

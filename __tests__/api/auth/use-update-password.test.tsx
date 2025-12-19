import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useUpdatePassword } from '@/api/auth/use-update-password';
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

describe('useUpdatePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useUpdatePassword).toBeDefined();
  });

  it('should call client with correct parameters', async () => {
    const mockResponse = {
      data: {
        message: 'Password updated successfully',
      },
    };

    mockedClient.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useUpdatePassword(), {
      wrapper: createWrapper(),
    });

    const variables = {
      password: 'newPassword123',
      passwordConfirmation: 'newPassword123',
    };

    result.current.mutate(variables);

    await waitFor(() => {
      expect(mockedClient).toHaveBeenCalledWith({
        url: '/v1/users/password',
        method: 'PUT',
        data: variables,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });
});

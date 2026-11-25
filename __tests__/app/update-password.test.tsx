import { Stack } from 'expo-router';

import UpdatePassword from '@/app/update-password';
import { render } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  Stack: { Screen: jest.fn(() => null) },
  useNavigation: jest.fn(() => ({ goBack: jest.fn() })),
}));

jest.mock('@/api/auth/use-update-password', () => ({
  useUpdatePassword: jest.fn(() => ({ mutateAsync: jest.fn() })),
}));

jest.mock('@/components/ui', () => ({
  ...jest.requireActual('@/components/ui'),
  FocusAwareStatusBar: () => null,
}));

const mockStackScreen = Stack.Screen as unknown as jest.Mock;

describe('UpdatePassword', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('titles the screen header', () => {
    render(<UpdatePassword />);

    expect(mockStackScreen).toHaveBeenCalledTimes(1);
    expect(mockStackScreen.mock.calls[0][0].options).toEqual({
      title: 'Update Password',
    });
  });
});

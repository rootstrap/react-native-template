import { Stack, Tabs } from 'expo-router';

import Feed from '@/app/(app)/index';
import Style from '@/app/(app)/style';
import Onboarding from '@/app/onboarding';
import Login from '@/app/sign-in';
import { render, screen } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  Stack: { Screen: jest.fn(() => null) },
  Tabs: { Screen: jest.fn(() => null) },
  Link: ({ children }: { children: React.ReactNode }) => children,
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
}));

jest.mock('@/components/ui', () => ({
  ...jest.requireActual('@/components/ui'),
  FocusAwareStatusBar: () => null,
}));

jest.mock('@/components/ui/icons', () => ({
  Feed: () => null,
  Style: () => null,
}));

jest.mock('@/components/buttons', () => ({ Buttons: () => null }));
jest.mock('@/components/colors', () => ({ Colors: () => null }));
jest.mock('@/components/inputs', () => ({ Inputs: () => null }));
jest.mock('@/components/typography', () => ({ Typography: () => null }));
jest.mock('@/components/cover', () => ({ Cover: () => null }));
jest.mock('@/components/login-form', () => ({ LoginForm: () => null }));

jest.mock('@/lib/hooks', () => ({
  useIsFirstTime: jest.fn(() => [true, jest.fn()]),
}));

jest.mock('@/api/auth/use-login', () => ({
  useLogin: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

const mockStackScreen = Stack.Screen as unknown as jest.Mock;
const mockTabsScreen = Tabs.Screen as unknown as jest.Mock;

const optionsOf = (mock: jest.Mock) => mock.mock.calls[0][0].options;

describe('screen options declared by each screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('titles the feed tab and adds a create link to its header', () => {
    render(<Feed />);

    const options = optionsOf(mockTabsScreen);
    expect(options).toMatchObject({
      title: 'Feed',
      tabBarButtonTestID: 'feed-tab',
    });

    render(options.headerRight());
    expect(screen.getByText('Create')).toBeOnTheScreen();
  });

  it('titles the style tab', () => {
    render(<Style />);

    expect(optionsOf(mockTabsScreen)).toMatchObject({
      title: 'Style',
      tabBarButtonTestID: 'style-tab',
    });
  });

  it('hides the header on onboarding', () => {
    render(<Onboarding />);

    expect(optionsOf(mockStackScreen)).toEqual({ headerShown: false });
  });

  it('hides the header on sign in', () => {
    render(<Login />);

    expect(optionsOf(mockStackScreen)).toEqual({ headerShown: false });
  });
});

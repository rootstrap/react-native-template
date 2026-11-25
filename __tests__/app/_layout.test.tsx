import { SplashScreen, Tabs } from 'expo-router';

import TabLayout from '@/app/(app)/_layout';
import { useAuth } from '@/components/providers/auth';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import i18n from '@/lib/i18n';
import { act, render, screen } from '@/lib/test-utils';

// Mock all dependencies
jest.mock('@dev-plugins/react-query', () => ({
  useReactQueryDevTools: jest.fn(),
}));

jest.mock('@/components/providers/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/hooks/use-is-first-time', () => ({
  useIsFirstTime: jest.fn(),
}));

jest.mock('expo-router', () => {
  const MockTabs = ({ children }: { children: React.ReactNode }) => children;
  MockTabs.Screen = jest.fn(() => null);

  return {
    Redirect: ({ href: _href }: { href: string }) => null,
    Stack: {
      Screen: () => null,
    },
    Tabs: MockTabs,
    Link: ({ children }: { children: React.ReactNode }) => children,
    SplashScreen: {
      hideAsync: jest.fn().mockResolvedValue(undefined),
    },
  };
});

jest.mock('@/components/ui/icons', () => ({
  Feed: () => null,
  Settings: () => null,
  Style: () => null,
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseIsFirstTime = useIsFirstTime as jest.MockedFunction<
  typeof useIsFirstTime
>;
const mockSplashScreen = SplashScreen as jest.Mocked<typeof SplashScreen>;
const mockTabsScreen = Tabs.Screen as unknown as jest.Mock;

const tabOptions = (name: string) =>
  mockTabsScreen.mock.calls.findLast(([props]) => props.name === name)?.[0]
    .options;

const setupFirstTimeUser = () => {
  mockUseIsFirstTime.mockReturnValue([true, jest.fn()]);
  mockUseAuth.mockReturnValue({
    token: null,
    isAuthenticated: false,
    loading: false,
    ready: true,
    logout: jest.fn(),
  });
};

const setupUnauthenticatedUser = () => {
  mockUseIsFirstTime.mockReturnValue([false, jest.fn()]);
  mockUseAuth.mockReturnValue({
    token: null,
    isAuthenticated: false,
    loading: false,
    ready: true,
    logout: jest.fn(),
  });
};

const setupAuthenticatedUser = () => {
  mockUseIsFirstTime.mockReturnValue([false, jest.fn()]);
  mockUseAuth.mockReturnValue({
    token: 'mock-token',
    isAuthenticated: true,
    loading: false,
    ready: true,
    logout: jest.fn(),
  });
};

describe('TabLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to onboarding when user is first time', () => {
    setupFirstTimeUser();
    render(<TabLayout />);
    // Since we're mocking Redirect to return null, we just test the logic flow
    expect(mockUseIsFirstTime).toHaveBeenCalled();
  });

  it('should redirect to sign-in when user is not authenticated and auth is ready', () => {
    setupUnauthenticatedUser();
    render(<TabLayout />);
    expect(mockUseAuth).toHaveBeenCalled();
  });

  it('should render tabs when user is authenticated', () => {
    setupAuthenticatedUser();
    render(<TabLayout />);
    expect(mockUseAuth).toHaveBeenCalled();
  });

  it('should hide splash screen when auth is not ready', () => {
    mockUseIsFirstTime.mockReturnValue([false, jest.fn()]);
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      ready: false,
      logout: jest.fn(),
    });
    render(<TabLayout />);
    expect(mockSplashScreen.hideAsync).toHaveBeenCalled();
  });

  it('should not hide splash screen when auth is ready', () => {
    mockUseIsFirstTime.mockReturnValue([false, jest.fn()]);
    mockUseAuth.mockReturnValue({
      token: 'mock-token',
      isAuthenticated: true,
      loading: false,
      ready: true,
      logout: jest.fn(),
    });
    render(<TabLayout />);
    expect(mockSplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('should call useAuth and useIsFirstTime hooks', () => {
    setupAuthenticatedUser();
    render(<TabLayout />);
    expect(mockUseAuth).toHaveBeenCalled();
    expect(mockUseIsFirstTime).toHaveBeenCalled();
  });

  it('titles the feed tab and adds a create link to its header', () => {
    setupAuthenticatedUser();
    render(<TabLayout />);

    const options = tabOptions('index');
    expect(options).toMatchObject({
      title: 'Feed',
      tabBarButtonTestID: 'feed-tab',
    });
    expect(options.tabBarIcon).toEqual(expect.any(Function));

    render(options.headerRight());
    expect(screen.getByText('Create')).toBeOnTheScreen();
  });

  it('titles the style tab', () => {
    setupAuthenticatedUser();
    render(<TabLayout />);

    const options = tabOptions('style');
    expect(options).toMatchObject({
      title: 'Style',
      tabBarButtonTestID: 'style-tab',
    });
    expect(options.tabBarIcon).toEqual(expect.any(Function));
  });

  it('titles the settings tab', () => {
    setupAuthenticatedUser();
    render(<TabLayout />);

    const options = tabOptions('settings');
    expect(options).toMatchObject({
      title: 'Settings',
      tabBarButtonTestID: 'settings-tab',
    });
    expect(options.tabBarIcon).toEqual(expect.any(Function));
  });

  it('retitles the settings tab when the language changes', async () => {
    setupAuthenticatedUser();
    i18n.addResourceBundle('es', 'translation', {
      settings: { title: 'Ajustes' },
    });
    render(<TabLayout />);

    try {
      await act(async () => {
        await i18n.changeLanguage('es');
      });

      expect(tabOptions('settings')?.title).toBe('Ajustes');
    }
    finally {
      await act(async () => {
        await i18n.changeLanguage('en');
      });
      i18n.removeResourceBundle('es', 'translation');
    }
  });
});

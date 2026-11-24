import { Platform } from 'react-native';

import { fireEvent, render, screen } from '@/lib/test-utils';

import { LinkItem } from '../../../src/components/settings/link-item';

const mockLink = jest.fn();

jest.mock('expo-router', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Link: (props: { href: unknown; children: React.ReactElement }) => {
      mockLink(props.href);
      return React.cloneElement(props.children, {
        onPress: () => mockLink(props.href),
      } as Record<string, unknown>);
    },
  };
});

const URL = 'https://example.com/terms';
const originalOS = Platform.OS;

function setPlatformOS(os: typeof Platform.OS) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

describe('LinkItem component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    setPlatformOS(originalOS);
  });

  it('should render an anchor that opens the URL in a new tab on web', () => {
    setPlatformOS('web');
    render(<LinkItem text="settings.terms" url={URL} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Terms of Service');
    expect(link.props.href).toBe(URL);
    expect(link.props.hrefAttrs).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    expect(mockLink).not.toHaveBeenCalled();
  });

  it.each(['ios', 'android'] as const)(
    'should navigate to the in-app WebView on %s',
    (os) => {
      setPlatformOS(os);
      render(<LinkItem text="settings.terms" url={URL} />);

      fireEvent.press(screen.getByText('Terms of Service'));

      expect(mockLink).toHaveBeenLastCalledWith({
        pathname: '/www',
        params: { url: URL, title: 'Terms of Service' },
      });
      expect(screen.queryByRole('link')).toBeNull();
    },
  );
});

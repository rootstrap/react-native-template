import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';

import WWW from '@/app/www';
import { render, screen } from '@/lib/test-utils';

jest.mock('expo-router', () => ({
  Stack: { Screen: jest.fn(() => null) },
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('react-native-webview', () => ({
  WebView: jest.fn(() => null),
}));

const mockStackScreen = Stack.Screen as unknown as jest.Mock;
const mockWebView = WebView as unknown as jest.Mock;
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('WWW', () => {
  const back = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ back });
  });

  it('opens the url in a modal titled with the title param', () => {
    mockUseLocalSearchParams.mockReturnValue({
      url: 'https://example.com',
      title: 'Example',
    });

    render(<WWW />);

    expect(mockStackScreen).toHaveBeenCalledTimes(1);
    expect(mockStackScreen.mock.calls[0][0].options).toEqual({
      presentation: 'modal',
      title: 'Example',
    });
    expect(mockWebView.mock.calls[0][0].source).toEqual({
      uri: 'https://example.com',
    });
  });

  it('leaves the title empty when the title param is missing', () => {
    mockUseLocalSearchParams.mockReturnValue({ url: 'https://example.com' });

    render(<WWW />);

    expect(mockStackScreen.mock.calls[0][0].options.title).toBe('');
  });

  it('goes back when the page fails to load', () => {
    mockUseLocalSearchParams.mockReturnValue({ url: 'https://example.com' });

    render(<WWW />);
    mockWebView.mock.calls[0][0].onError();

    expect(back).toHaveBeenCalledTimes(1);
  });

  it('shows an error instead of the page when the url is missing', () => {
    mockUseLocalSearchParams.mockReturnValue({});

    render(<WWW />);

    expect(screen.getByText('Invalid Url')).toBeOnTheScreen();
    expect(mockWebView).not.toHaveBeenCalled();
    expect(mockStackScreen).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the url param is repeated', () => {
    mockUseLocalSearchParams.mockReturnValue({
      url: ['https://a.example', 'https://b.example'],
    });

    render(<WWW />);

    expect(screen.getByText('Invalid Url')).toBeOnTheScreen();
    expect(mockWebView).not.toHaveBeenCalled();
  });
});

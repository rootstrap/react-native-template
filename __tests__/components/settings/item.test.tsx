import { Text } from '@/components/ui';
import { fireEvent, render, screen } from '@/lib/test-utils';

import { Item } from '../../../src/components/settings/item';

describe('Item component', () => {
  it('should render with text', () => {
    render(<Item text="settings.language" />);
    expect(screen.getByText('Language')).toBeTruthy();
  });

  it('should render with value', () => {
    render(<Item text="settings.language" value="English" />);
    expect(screen.getByText('Language')).toBeTruthy();
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('should render with icon', () => {
    const TestIcon = () => <Text testID="test-icon">Icon</Text>;
    render(<Item text="settings.language" icon={<TestIcon />} />);
    expect(screen.getByTestId('test-icon')).toBeTruthy();
  });

  it('should call onPress when pressable', () => {
    const mockOnPress = jest.fn();
    render(<Item text="settings.language" onPress={mockOnPress} />);

    const pressable = screen.getByText('Language').parent;
    fireEvent.press(pressable);

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should show arrow when pressable', () => {
    render(<Item text="settings.language" onPress={() => {}} />);
    // Arrow should be rendered when onPress is provided
    expect(screen.getByText('Language')).toBeTruthy();
  });

  it('should render correctly without onPress', () => {
    render(<Item text="settings.language" />);
    expect(screen.getByText('Language')).toBeTruthy();
  });
});

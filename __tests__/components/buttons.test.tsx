import { ActivityIndicator } from 'react-native';

import { Buttons } from '@/components/buttons';
import { render, screen } from '@/lib/test-utils';

describe('Buttons component', () => {
  it('should render the title', () => {
    render(<Buttons />);
    expect(screen.getByText('Buttons')).toBeTruthy();
  });

  it('should render all button variants', () => {
    render(<Buttons />);

    // Check for small buttons (there are multiple, so use getAllByText)
    const smallButtons = screen.getAllByText('small');
    expect(smallButtons.length).toBeGreaterThan(0);

    // Check for main buttons
    expect(screen.getByText('Default Button')).toBeTruthy();
    expect(screen.getByText('Secondary Button')).toBeTruthy();
    expect(screen.getByText('Outline Button')).toBeTruthy();
    expect(screen.getByText('Destructive Button')).toBeTruthy();
    expect(screen.getByText('Ghost Button')).toBeTruthy();
    expect(screen.getByText('Default Button Disabled')).toBeTruthy();
    expect(screen.getByText('Secondary Button Disabled')).toBeTruthy();
  });

  it('should render loading buttons with activity indicators', () => {
    const { UNSAFE_getAllByType } = render(<Buttons />);

    // Loading buttons show ActivityIndicator instead of text
    // Look for ActivityIndicator components directly
    const activityIndicators = UNSAFE_getAllByType(ActivityIndicator);
    expect(activityIndicators.length).toBeGreaterThan(0);
  });
});

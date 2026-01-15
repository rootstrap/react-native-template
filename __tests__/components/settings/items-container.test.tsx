import { Text } from '@/components/ui';
import { render, screen } from '@/lib/test-utils';

import { ItemsContainer } from '../../../src/components/settings/items-container';

describe('ItemsContainer component', () => {
  it('should render children', () => {
    render(
      <ItemsContainer>
        <Text testID="test-child">Test Child</Text>
      </ItemsContainer>,
    );
    expect(screen.getByTestId('test-child')).toBeTruthy();
  });

  it('should render with title', () => {
    render(
      <ItemsContainer title="settings.general">
        <Text testID="test-child">Test Child</Text>
      </ItemsContainer>,
    );
    expect(screen.getByText('General')).toBeTruthy();
    expect(screen.getByTestId('test-child')).toBeTruthy();
  });

  it('should render without title', () => {
    render(
      <ItemsContainer>
        <Text testID="test-child">Test Child</Text>
      </ItemsContainer>,
    );
    expect(screen.getByTestId('test-child')).toBeTruthy();
    expect(screen.queryByText('General')).toBeNull();
  });
});

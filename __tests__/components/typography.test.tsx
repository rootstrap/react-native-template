import { Typography } from '@/components/typography';
import { render, screen } from '@/lib/test-utils';

describe('Typography component', () => {
  it('should render the title', () => {
    render(<Typography />);
    expect(screen.getByText('Typography')).toBeTruthy();
  });

  it('should render all heading levels', () => {
    render(<Typography />);

    expect(screen.getByText('H1: Lorem ipsum dolor sit')).toBeTruthy();
    expect(screen.getByText('H2: Lorem ipsum dolor sit')).toBeTruthy();
    expect(screen.getByText('H3: Lorem ipsum dolor sit')).toBeTruthy();
    expect(screen.getByText('H4: Lorem ipsum dolor sit')).toBeTruthy();
  });

  it('should render paragraph text', () => {
    render(<Typography />);

    expect(
      screen.getByText(/Lorem ipsum dolor sit amet consectetur/),
    ).toBeTruthy();
  });
});

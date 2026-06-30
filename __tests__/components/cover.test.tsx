import { render, screen } from '@/lib/test-utils';

import { Cover } from '../../src/components/cover';

const SVG_WIDTH = 100;
const SVG_HEIGHT = 100;

describe('Cover component', () => {
  it('should render without crashing', () => {
    render(<Cover testID="cover-svg" />);
    expect(screen.getByTestId('cover-svg')).toBeTruthy();
  });

  it('should accept custom props', () => {
    render(<Cover testID="cover-svg" width={SVG_WIDTH} height={SVG_HEIGHT} />);
    const svgElement = screen.getByTestId('cover-svg');
    expect(svgElement).toBeTruthy();
    expect(svgElement.props.width).toBe(SVG_WIDTH);
    expect(svgElement.props.height).toBe(SVG_HEIGHT);
  });
});

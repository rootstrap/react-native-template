import { render, screen } from '@testing-library/react-native';
import { createRef } from 'react';

import type { ProgressBarRef } from '../../../src/components/ui/progress-bar';
import { ProgressBar } from '../../../src/components/ui/progress-bar';

describe('ProgressBar component', () => {
  const PROGRESS_BAR = 'progress-bar';
  it('renders correctly', () => {
    render(<ProgressBar className="custom-class" />);
    expect(screen.getByTestId('progress-bar-container')).toBeTruthy();
  });

  it('sets initial progress correctly', () => {
    render(<ProgressBar initialProgress={50} />);
    expect(screen.getByTestId(PROGRESS_BAR)).toHaveStyle({ width: '50%' });
  });

  it('exposes setProgress through the ref', () => {
    const ref = createRef<ProgressBarRef>();
    render(<ProgressBar ref={ref} initialProgress={0} />);

    expect(screen.getByTestId(PROGRESS_BAR)).toHaveStyle({ width: '0%' });
    expect(() => ref.current?.setProgress(75)).not.toThrow();
  });
});

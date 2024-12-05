/* eslint-disable max-lines-per-function */
import 'react-native';

<<<<<<< HEAD:src/ui/checkbox.test.tsx
import { cleanup, fireEvent, render, screen } from '@/core/test-utils';
=======
import React from 'react';

import { cleanup, screen, setup } from '@/lib/test-utils';
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx

import { Checkbox, Radio, Switch } from './checkbox';

afterEach(cleanup);

<<<<<<< HEAD:src/ui/checkbox.test.tsx
const AGREE_TERMS = 'I agree to terms and conditions';

describe('Checkbox component ', () => {
  const CHECKBOX_LABEL = 'checkbox-label';


  it('<Checkbox /> renders correctly and call on change on Press', () => {
=======
describe('Checkbox, Radio & Switch components ', () => {
  it('<Checkbox /> renders correctly and call on change on Press', async () => {
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Checkbox
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.queryByTestId(CHECKBOX_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('checkbox')).toBeEnabled();

    expect(screen.getByTestId('checkbox')).not.toBeChecked();
    expect(screen.getByTestId('checkbox').props.accessibilityRole).toBe(
      'checkbox',
    );
    expect(screen.getByTestId('checkbox').props.accessibilityLabel).toBe(
      'agree',
    );

    await user.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<CheckBox/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.getByTestId('checkbox')).toBeDisabled();
    await user.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
  it('<CheckBox/> Should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
        label="I agree to terms and conditions"
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeOnTheScreen();
    expect(screen.getByTestId(CHECKBOX_LABEL)).toBeOnTheScreen();
    expect(
      screen.getByTestId('checkbox').props.accessibilityState.checked,
    ).toBe(false);
    expect(screen.getByTestId('checkbox').props.accessibilityRole).toBe(
      'checkbox',
    );

    expect(screen.getByTestId('checkbox').props.accessibilityLabel).toBe(
      'agree',
    );
<<<<<<< HEAD:src/ui/checkbox.test.tsx
    expect(screen.getByTestId(CHECKBOX_LABEL)).toHaveTextContent(AGREE_TERMS);
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Checkbox /> should not render label when empty or not provided', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(<Checkbox testID="checkbox" label="" onChange={mockOnChange}
      accessibilityLabel="agree"/>);
    expect(screen.queryByTestId(CHECKBOX_LABEL)).not.toBeOnTheScreen();
  });

  it('<Checkbox /> renders as checked when checked prop is true', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        testID="checkbox"
        onChange={mockOnChange}
        checked={true}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.getByTestId('checkbox')).toBeChecked();
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledWith(false); // Checkbox should toggle to unchecked
  });
});

describe('Radio component ', () => {
  const RADIO_LABEL = 'radio-label';

  it('<Radio /> renders correctly and call on change on Press', () => {
=======
    expect(screen.getByTestId('checkbox-label')).toHaveTextContent(
      'I agree to terms and conditions',
    );
    await user.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Radio /> renders correctly and call on change on Press', async () => {
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.queryByTestId(RADIO_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('radio')).toBeEnabled();
    expect(screen.getByTestId('radio')).not.toBeChecked();
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    await user.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Radio /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label="I agree to terms and conditions"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
<<<<<<< HEAD:src/ui/checkbox.test.tsx
    expect(screen.getByTestId(RADIO_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(RADIO_LABEL)).toHaveTextContent(AGREE_TERMS);
=======
    expect(screen.getByTestId('radio-label')).toBeOnTheScreen();
    expect(screen.getByTestId('radio-label')).toHaveTextContent(
      'I agree to terms and conditions',
    );
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx

    expect(screen.getByTestId('radio').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
<<<<<<< HEAD:src/ui/checkbox.test.tsx
    fireEvent.press(screen.getByTestId(RADIO_LABEL));
=======
    await user.press(screen.getByTestId('radio-label'));
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Radio/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Radio
        disabled={true}
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
    expect(screen.getByTestId('radio')).toBeDisabled();
    await user.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

<<<<<<< HEAD:src/ui/checkbox.test.tsx
  it('<Radio /> should not render label when empty or not provided', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(<Radio testID="radio" label="" onChange={mockOnChange}
      accessibilityLabel="agree"/>);
    expect(screen.queryByTestId(RADIO_LABEL)).not.toBeOnTheScreen();
  });

  it('<Radio /> renders as checked when checked prop is true', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Radio
        testID="radio"
        onChange={mockOnChange}
        checked={true}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.getByTestId('radio')).toBeChecked();
    fireEvent.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledWith(false); // Radio should toggle to unchecked
  });
})

describe('Switch component ', () => {
  const SWITCH_LABEL = 'switch-label';

  it('<Switch /> renders correctly and call on change on Press', () => {
=======
  it('<Switch /> renders correctly and call on change on Press', async () => {
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    expect(screen.queryByTestId(SWITCH_LABEL)).not.toBeOnTheScreen();
    expect(screen.getByTestId('switch')).toBeEnabled();
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    await user.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Switch /> should render the correct label', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label="I agree to terms and conditions"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
<<<<<<< HEAD:src/ui/checkbox.test.tsx
    expect(screen.getByTestId(SWITCH_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(SWITCH_LABEL)).toHaveTextContent(AGREE_TERMS);
=======
    expect(screen.getByTestId('switch-label')).toBeOnTheScreen();
    expect(screen.getByTestId('switch-label')).toHaveTextContent(
      'I agree to terms and conditions',
    );
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
<<<<<<< HEAD:src/ui/checkbox.test.tsx
    fireEvent.press(screen.getByTestId(SWITCH_LABEL));
=======
    await user.press(screen.getByTestId('switch-label'));
>>>>>>> 627e97c:src/components/ui/checkbox.test.tsx
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("<Switch/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    const { user } = setup(
      <Switch
        disabled={true}
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    await user.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
  
  it('<Switch /> should not render label when empty or not provided', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(<Switch testID="switch" label="" onChange={mockOnChange}
      accessibilityLabel="agree"/>);
    expect(screen.queryByTestId(SWITCH_LABEL)).not.toBeOnTheScreen();
  });

  it('<Switch /> renders as checked when checked prop is true', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        testID="switch"
        onChange={mockOnChange}
        checked={true}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />
    );
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(true);
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledWith(false); // Switch should toggle to unchecked
  });
})
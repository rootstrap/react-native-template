/* eslint-disable max-lines-per-function */
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
import 'react-native';

import { cleanup, fireEvent, render, screen } from '@/lib/test-utils';
=======
import * as React from 'react';
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx

import { Checkbox, Radio, Switch } from '../../../src/components/ui/checkbox';

import 'react-native';

afterEach(cleanup);

<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
const AGREE_TERMS = 'I agree to terms and conditions';

describe('Checkbox component', () => {
  const CHECKBOX_LABEL = 'checkbox-label';

  it('<Checkbox /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
describe('checkbox, Radio & Switch components ', () => {
  it('<Checkbox /> renders correctly and call on change on Press', async () => {
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
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

    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
  it("<CheckBox/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
  it('<CheckBox/> shouldn\'t change value while disabled', async () => {
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
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
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
  it('<CheckBox/> Should render the correct label', async () => {
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
      <Checkbox
        disabled={true}
        testID="checkbox"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
        label={AGREE_TERMS}
=======
        label="I agree to terms and conditions"
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
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
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    expect(screen.getByTestId(CHECKBOX_LABEL)).toHaveTextContent(AGREE_TERMS);
    fireEvent.press(screen.getByTestId('checkbox'));
=======
    expect(screen.getByTestId('checkbox-label')).toHaveTextContent(
      'I agree to terms and conditions',
    );
    await user.press(screen.getByTestId('checkbox'));
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Checkbox /> should not render label when empty or not provided', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Checkbox
        testID="checkbox"
        label=""
        onChange={mockOnChange}
        accessibilityLabel="agree"
      />,
    );
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
      />,
    );
    expect(screen.getByTestId('checkbox')).toBeChecked();
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(mockOnChange).toHaveBeenCalledWith(false); // Checkbox should toggle to unchecked
  });
});

describe('Radio component ', () => {
  const RADIO_LABEL = 'radio-label';

  it('<Radio /> renders correctly and call on change on Press', async () => {
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
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
    fireEvent.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Radio /> should render the correct label', async () => {
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
      <Radio
        testID="radio"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label={AGREE_TERMS}
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('radio')).toBeOnTheScreen();
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    expect(screen.getByTestId(RADIO_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(RADIO_LABEL)).toHaveTextContent(AGREE_TERMS);
=======
    expect(screen.getByTestId('radio-label')).toBeOnTheScreen();
    expect(screen.getByTestId('radio-label')).toHaveTextContent(
      'I agree to terms and conditions',
    );
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx

    expect(screen.getByTestId('radio').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('radio').props.accessibilityRole).toBe('radio');
    expect(screen.getByTestId('radio').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId(RADIO_LABEL));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
  it("<Radio/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
  it('<Radio/> shouldn\'t change value while disabled', async () => {
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
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
    fireEvent.press(screen.getByTestId('radio'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });
});

describe('Switch component ', () => {
  const SWITCH_LABEL = 'switch-label';

  it('<Switch /> renders correctly and call on change on Press', async () => {
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
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
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('<Switch /> should render the correct label', async () => {
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
      <Switch
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        label={AGREE_TERMS}
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
    expect(screen.getByTestId(SWITCH_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(SWITCH_LABEL)).toHaveTextContent(AGREE_TERMS);
=======
    expect(screen.getByTestId('switch-label')).toBeOnTheScreen();
    expect(screen.getByTestId('switch-label')).toHaveTextContent(
      'I agree to terms and conditions',
    );
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      false,
    );
    expect(screen.getByTestId('switch').props.accessibilityRole).toBe('switch');
    expect(screen.getByTestId('switch').props.accessibilityLabel).toBe('agree');
    fireEvent.press(screen.getByTestId(SWITCH_LABEL));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

<<<<<<< HEAD:__tests__/components/ui/checkbox.test.tsx
  it("<Switch/> shouldn't change value while disabled", async () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
=======
  it('<Switch/> shouldn\'t change value while disabled', async () => {
    const mockOnChange = jest.fn(checked => checked);
    const { user } = setup(
>>>>>>> f6309e9:src/components/ui/checkbox.test.tsx
      <Switch
        disabled={true}
        testID="switch"
        onChange={mockOnChange}
        accessibilityLabel="agree"
        accessibilityHint="toggle Agree"
      />,
    );
    expect(screen.getByTestId('switch')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledTimes(0);
  });

  it('<Switch /> should not render label when empty or not provided', () => {
    const mockOnChange = jest.fn((checked) => checked);
    render(
      <Switch
        testID="switch"
        label=""
        onChange={mockOnChange}
        accessibilityLabel="agree"
      />,
    );
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
      />,
    );
    expect(screen.getByTestId('switch').props.accessibilityState.checked).toBe(
      true,
    );
    fireEvent.press(screen.getByTestId('switch'));
    expect(mockOnChange).toHaveBeenCalledWith(false); // Switch should toggle to unchecked
  });
});

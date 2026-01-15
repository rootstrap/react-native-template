import { Inputs } from '@/components/inputs';
import { fireEvent, render, screen } from '@/lib/test-utils';

function renderInputsComponent() {
  return render(<Inputs />);
}

function expectTextToBeVisible(text: string) {
  expect(screen.getByText(text)).toBeTruthy();
}

function testCheckboxInteraction() {
  const checkbox = screen.getByLabelText('accept terms of condition');

  // Initial state should be unchecked
  expect(checkbox.props.accessibilityState.checked).toBe(false);

  // Click checkbox
  fireEvent.press(checkbox);

  // Should be checked after click
  expect(checkbox.props.accessibilityState.checked).toBe(true);
}

function testRadioButtonInteraction() {
  const radioButton = screen.getByLabelText('radio button');

  // Initial state should be unchecked
  expect(radioButton.props.accessibilityState.checked).toBe(false);

  // Click radio button
  fireEvent.press(radioButton);

  // Should be checked after click
  expect(radioButton.props.accessibilityState.checked).toBe(true);
}

function testSwitchInteraction() {
  const switchElement = screen.getByLabelText('switch');

  // Initial state should be unchecked
  expect(switchElement.props.accessibilityState.checked).toBe(false);

  // Click switch
  fireEvent.press(switchElement);

  // Should be checked after click
  expect(switchElement.props.accessibilityState.checked).toBe(true);
}

describe('Inputs component', () => {
  it('should render the title', () => {
    renderInputsComponent();
    expectTextToBeVisible('Form');
  });

  it('should render all input types', () => {
    renderInputsComponent();

    // Check for input labels
    expectTextToBeVisible('Default');
    expectTextToBeVisible('Error');
    expectTextToBeVisible('Focused');
    expectTextToBeVisible('Select');
  });

  it('should render error message for error input', () => {
    renderInputsComponent();
    expectTextToBeVisible('This is a message error');
  });

  it('should render checkbox component', () => {
    renderInputsComponent();
    expectTextToBeVisible('checkbox');
  });

  it('should render radio button component', () => {
    renderInputsComponent();
    expectTextToBeVisible('radio button');
  });

  it('should render switch component', () => {
    renderInputsComponent();
    expectTextToBeVisible('switch');
  });

  it('should handle checkbox interaction', () => {
    renderInputsComponent();
    testCheckboxInteraction();
  });

  it('should handle radio button interaction', () => {
    renderInputsComponent();
    testRadioButtonInteraction();
  });

  it('should handle switch interaction', () => {
    renderInputsComponent();
    testSwitchInteraction();
  });
});

/* eslint-disable max-lines-per-function */

<<<<<<< HEAD:src/ui/select.test.tsx
import { cleanup, fireEvent, render, screen } from '@/core/test-utils';
import type { OptionType } from '@/ui';
=======
import React from 'react';

import type { OptionType } from '@/components/ui';
import { cleanup, render, screen, setup } from '@/lib/test-utils';
>>>>>>> 627e97c:src/components/ui/select.test.tsx

import { Select } from './select';

afterEach(cleanup);

describe('Select component ', () => {
  const SELECT_TRIGGER = 'select-trigger';
  const SELECT_LABEL = 'select-label';
  const SELECT_ERROR = 'select-error';
  const options: OptionType[] = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  it('should render correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select options"
        options={options}
        onSelect={onSelect}
        testID="select"
      />,
    );
    expect(screen.getByTestId(SELECT_TRIGGER)).toBeOnTheScreen();
    expect(screen.getByTestId(SELECT_LABEL)).toBeOnTheScreen();
  });

  it('should render the label correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
      />,
    );
    expect(screen.getByTestId(SELECT_TRIGGER)).toBeOnTheScreen();
    expect(screen.getByTestId(SELECT_LABEL)).toBeOnTheScreen();
    expect(screen.getByTestId(SELECT_LABEL)).toHaveTextContent('Select');
  });

  it('should render the error correctly ', () => {
    const onSelect = jest.fn();
    render(
      <Select
        label="Select"
        options={options}
        onSelect={onSelect}
        testID="select"
        error="Please select an option"
      />,
    );
<<<<<<< HEAD:src/ui/select.test.tsx
    expect(screen.getByTestId(SELECT_TRIGGER)).toBeOnTheScreen();
    expect(screen.getByTestId(SELECT_ERROR)).toBeOnTheScreen();
    expect(screen.getByTestId(SELECT_ERROR)).toHaveTextContent(
      'Please select an option'
=======
    expect(screen.getByTestId('select-trigger')).toBeOnTheScreen();
    expect(screen.getByTestId('select-error')).toBeOnTheScreen();
    expect(screen.getByTestId('select-error')).toHaveTextContent(
      'Please select an option',
>>>>>>> 627e97c:src/components/ui/select.test.tsx
    );
  });

  it('should open options modal on press', async () => {
    const { user } = setup(
      <Select
        label="Select"
        options={options}
        testID="select"
        placeholder="Select an option"
      />,
    );

<<<<<<< HEAD:src/ui/select.test.tsx
    const selectTrigger = screen.getByTestId(SELECT_TRIGGER);
    fireEvent.press(selectTrigger);
=======
    const selectTrigger = screen.getByTestId('select-trigger');
    await user.press(selectTrigger);
>>>>>>> 627e97c:src/components/ui/select.test.tsx

    expect(screen.getByTestId('select-item-chocolate')).toBeOnTheScreen();
    expect(screen.getByTestId('select-item-strawberry')).toBeOnTheScreen();
    expect(screen.getByTestId('select-item-vanilla')).toBeOnTheScreen();
  });

  it('should call onSelect on selecting an option', async () => {
    const onSelect = jest.fn();

    const { user } = setup(
      <Select options={options} onSelect={onSelect} testID="select" />,
    );

    const selectTrigger = screen.getByTestId('select-trigger');
    await user.press(selectTrigger);

    const optionModal = screen.getByTestId('select-modal');
    await user.press(optionModal);

    const optionItem1 = screen.getByTestId('select-item-chocolate');
    await user.press(optionItem1);

    expect(onSelect).toHaveBeenCalledWith(options[0].value);
  });
});

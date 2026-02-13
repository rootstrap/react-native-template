<<<<<<< HEAD:src/components/inputs.tsx
import { useState } from 'react';

import type { OptionType } from '@/components/ui';
=======
import type { OptionType } from '@/components/ui';

import * as React from 'react';
>>>>>>> f6309e9:src/features/style-demo/components/inputs-demo.tsx
import { Checkbox, Input, Radio, Select, Switch, View } from '@/components/ui';

import { Title } from './title';

const options: Array<OptionType> = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
];

<<<<<<< HEAD:src/components/inputs.tsx
export const Inputs = () => {
  const [value, setValue] = useState<string | number | undefined>();
=======
export function Inputs() {
  const [value, setValue] = React.useState<string | number | undefined>();
>>>>>>> f6309e9:src/features/style-demo/components/inputs-demo.tsx
  return (
    <>
      <Title text="Form" />
      <View>
        <Input label="Default" placeholder="Lorem ipsum dolor sit amet" />
        <Input label="Error" error="This is a message error" />
        <Input label="Focused" />
        <Select
          label="Select"
          options={options}
          value={value}
          onSelect={option => setValue(option)}
        />
        <CheckboxExample />
        <RadioExample />
        <SwitchExample />
      </View>
    </>
  );
}

<<<<<<< HEAD:src/components/inputs.tsx
const CheckboxExample = () => {
  const [checked, setChecked] = useState(false);
=======
function CheckboxExample() {
  const [checked, setChecked] = React.useState(false);
>>>>>>> f6309e9:src/features/style-demo/components/inputs-demo.tsx
  return (
    <Checkbox.Root
      checked={checked}
      onChange={setChecked}
      accessibilityLabel="accept terms of condition"
      className="pb-2"
    >
      <Checkbox.Icon checked={checked} />
      <Checkbox.Label text="checkbox" />
    </Checkbox.Root>
  );
}

<<<<<<< HEAD:src/components/inputs.tsx
const RadioExample = () => {
  const [selected, setSelected] = useState(false);
=======
function RadioExample() {
  const [selected, setSelected] = React.useState(false);
>>>>>>> f6309e9:src/features/style-demo/components/inputs-demo.tsx
  return (
    <Radio.Root
      checked={selected}
      onChange={setSelected}
      accessibilityLabel="radio button"
      className="pb-2"
    >
      <Radio.Icon checked={selected} />
      <Radio.Label text="radio button" />
    </Radio.Root>
  );
}

<<<<<<< HEAD:src/components/inputs.tsx
const SwitchExample = () => {
  const [active, setActive] = useState(false);
=======
function SwitchExample() {
  const [active, setActive] = React.useState(false);
>>>>>>> f6309e9:src/features/style-demo/components/inputs-demo.tsx
  return (
    <Switch.Root
      checked={active}
      onChange={setActive}
      accessibilityLabel="switch"
      className="pb-2"
    >
      <Switch.Icon checked={active} />
      <Switch.Label text="switch" />
    </Switch.Root>
  );
}

<<<<<<< HEAD:src/components/buttons.tsx
=======
import * as React from 'react';

>>>>>>> f6309e9:src/features/style-demo/components/buttons-demo.tsx
import { Button, View } from '@/components/ui';

import { Title } from './title';

<<<<<<< HEAD:src/components/buttons.tsx
export const Buttons = () => (
  <>
    <Title text="Buttons" />
    <View>
      <View className="flex-row  flex-wrap">
        <Button label="small" size="sm" className="mr-2" />
        <Button label="small" loading size="sm" className="mr-2 min-w-[60px]" />
        <Button label="small" size="sm" variant="secondary" className="mr-2" />
        <Button label="small" size="sm" variant="outline" className="mr-2" />
=======
export function Buttons() {
  return (
    <>
      <Title text="Buttons" />
      <View>
        <View className="flex-row flex-wrap">
          <Button label="small" size="sm" className="mr-2" />
          <Button
            label="small"
            loading
            size="sm"
            className="mr-2 min-w-[60px]"
          />
          <Button
            label="small"
            size="sm"
            variant="secondary"
            className="mr-2"
          />
          <Button label="small" size="sm" variant="outline" className="mr-2" />
          <Button
            label="small"
            size="sm"
            variant="destructive"
            className="mr-2"
          />
          <Button label="small" size="sm" variant="ghost" className="mr-2" />
          <Button label="small" size="sm" disabled className="mr-2" />
        </View>
        <Button label="Default Button" />
        <Button label="Secondary Button" variant="secondary" />
        <Button label="Outline Button" variant="outline" />
        <Button label="Destructive Button" variant="destructive" />
        <Button label="Ghost Button" variant="ghost" />
        <Button label="Button" loading={true} />
        <Button label="Button" loading={true} variant="outline" />
        <Button label="Default Button Disabled" disabled />
>>>>>>> f6309e9:src/features/style-demo/components/buttons-demo.tsx
        <Button
          label="small"
          size="sm"
          variant="destructive"
          className="mr-2"
        />
        <Button label="small" size="sm" variant="ghost" className="mr-2" />
        <Button label="small" size="sm" disabled className="mr-2" />
      </View>
<<<<<<< HEAD:src/components/buttons.tsx
      <Button label="Default Button" />
      <Button label="Secondary Button" variant="secondary" />
      <Button label="Outline Button" variant="outline" />
      <Button label="Destructive Button" variant="destructive" />
      <Button label="Ghost Button" variant="ghost" />
      <Button label="Button" loading={true} />
      <Button label="Button" loading={true} variant="outline" />
      <Button label="Default Button Disabled" disabled />
      <Button label="Secondary Button Disabled" disabled variant="secondary" />
    </View>
  </>
);
=======
    </>
  );
}
>>>>>>> f6309e9:src/features/style-demo/components/buttons-demo.tsx

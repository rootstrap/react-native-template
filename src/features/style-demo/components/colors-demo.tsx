<<<<<<< HEAD:src/components/colors.tsx
=======
import * as React from 'react';
>>>>>>> f6309e9:src/features/style-demo/components/colors-demo.tsx
import { Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

import { Title } from './title';

type ColorName = keyof typeof colors;

<<<<<<< HEAD:src/components/colors.tsx
export const Colors = () => (
  <>
    <Title text="Colors" />
    {(Object.keys(colors) as Array<ColorName>).map((name) => (
      <Color name={name} key={name} />
    ))}
  </>
);

const Color = ({ name }: { name: ColorName }) => {
  if (typeof colors[name] === 'string') {
    return null;
  }
=======
export function Colors() {
  return (
    <>
      <Title text="Colors" />
      {(Object.keys(colors) as ColorName[]).map(name => (
        <Color name={name} key={name} />
      ))}
    </>
  );
}

function Color({ name }: { name: ColorName }) {
  if (typeof colors[name] === 'string')
    return null;
>>>>>>> f6309e9:src/features/style-demo/components/colors-demo.tsx
  return (
    <View className="pt-2" testID={`color-list-${name}`}>
      <Text className="font-medium">{name.toUpperCase()}</Text>
<<<<<<< HEAD:src/components/colors.tsx
      <View className="flex-row flex-wrap content-between justify-around ">
        {Object.entries(colors[name]).map(([key, value]) => (
          <ColorCard key={`${colors[name]}-${key}`} value={key} color={value} />
        ))}
=======
      <View className="flex-row flex-wrap content-between justify-around">
        {Object.entries(colors[name]).map(([key, value]) => {
          return (
            <ColorCard
              key={`${colors[name]}-${key}`}
              value={key}
              color={value}
            />
          );
        })}
>>>>>>> f6309e9:src/features/style-demo/components/colors-demo.tsx
      </View>
    </View>
  );
}

<<<<<<< HEAD:src/components/colors.tsx
const ColorCard = ({ color, value }: { value: string; color: string }) => (
  <View className="flex-1">
    <View
      className="h-14 w-full rounded-sm"
      style={{ backgroundColor: color }}
    />
    <Text className="text-sm">{value}</Text>
  </View>
);
=======
function ColorCard({ color, value }: { value: string; color: string }) {
  return (
    <View className="flex-1">
      <View
        className="h-14 w-full rounded-sm"
        style={{ backgroundColor: color }}
      />
      <Text className="text-sm">{value}</Text>
    </View>
  );
}
>>>>>>> f6309e9:src/features/style-demo/components/colors-demo.tsx

import { Text, View } from '@/components/ui';
import colors from '@/components/ui/colors';

import { Title } from './title';

type ColorName = keyof typeof colors;

export function Colors() {
  return (
    <>
      <Title text="Colors" />
      {(Object.keys(colors) as Array<ColorName>).map(name => (
        <Color name={name} key={name} />
      ))}
    </>
  );
}

function Color({ name }: Readonly<{ name: ColorName }>) {
  if (typeof colors[name] === 'string') {
    return null;
  }
  return (
    <View className="pt-2" testID={`color-list-${name}`}>
      <Text className="font-medium">{name.toUpperCase()}</Text>
      <View className="flex-row flex-wrap content-between justify-around ">
        {Object.entries(colors[name] as Record<string, string>).map(
          ([key, value]) => (
            <ColorCard key={`${name}-${key}`} value={key} color={value} />
          ),
        )}
      </View>
    </View>
  );
}

function ColorCard({ color, value }: Readonly<{ value: string; color: string }>) {
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

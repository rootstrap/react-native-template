import { Text, View } from '@/ui';
import colors from '@/ui/colors';

import { Title } from './title';
type ColorName = keyof typeof colors;

export const Colors = () => (
  <>
    <Title text="Colors" />
    {(Object.keys(colors) as ColorName[]).map((name) => (
      <Color name={name} key={name} />
    ))}
  </>
);

const Color = ({ name }: { name: ColorName }) => {
  if (typeof colors[name] === 'string') {
    return null;
  }
  return (
    <View className="pt-2" testID={`color-list-${name}`}>
      <Text className="font-medium">{name.toUpperCase()}</Text>
      <View className="flex-row flex-wrap content-between justify-around ">
        {Object.entries(colors[name]).map(([key, value]) => (
          <ColorCard key={`${colors[name]}-${key}`} value={key} color={value} />
        ))}
      </View>
    </View>
  );
};

const ColorCard = ({ color, value }: { value: string; color: string }) => (
  <View className="flex-1">
    <View
      className="h-14 w-full rounded-sm"
      style={{ backgroundColor: color }}
    />
    <Text className="text-sm">{value}</Text>
  </View>
);

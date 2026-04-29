import { Text, View } from '@/components/ui';

type Props = {
  text: string;
};
<<<<<<< HEAD:src/components/title.tsx
export const Title = ({ text }: Props) => (
  <View className="flex-row items-center justify-center  py-4 pb-2">
    <Text className="pr-2 text-2xl">{text}</Text>
    <View className="h-[2px] flex-1 bg-neutral-300" />
  </View>
);
=======
export function Title({ text }: Props) {
  return (
    <View className="flex-row items-center justify-center py-4 pb-2">
      <Text className="pr-2 text-2xl">{text}</Text>
      <View className="h-[2px] flex-1 bg-neutral-300" />
    </View>
  );
}
>>>>>>> f6309e9:src/features/style-demo/components/title.tsx

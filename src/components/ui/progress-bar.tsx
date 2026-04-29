<<<<<<< HEAD
import { forwardRef, useImperativeHandle } from 'react';
=======
import * as React from 'react';
import { useImperativeHandle } from 'react';
>>>>>>> f6309e9
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { twMerge } from 'tailwind-merge';

type Props = {
  initialProgress?: number;
  className?: string;
};

export type ProgressBarRef = {
  setProgress: (value: number) => void;
};

<<<<<<< HEAD
export const ProgressBar = forwardRef<ProgressBarRef, Props>(
  ({ initialProgress = 0, className = '' }, ref) => {
    const progress = useSharedValue<number>(initialProgress ?? 0);
    useImperativeHandle(
      ref,
      () => ({
        setProgress: (value: number) => {
          progress.value = withTiming(value, {
            duration: 250,
            easing: Easing.inOut(Easing.quad),
          });
        },
      }),
      [progress],
    );

    const style = useAnimatedStyle(() => ({
      width: `${progress.value}%`,
      backgroundColor: '#000',
      height: 2,
    }));
    return (
      <View
        testID={'progress-bar-container'}
        className={twMerge(` bg-[#EAEAEA]`, className)}
      >
        <Animated.View testID={'progress-bar'} style={style} />
      </View>
    );
  },
);
=======
export function ProgressBar({ ref, initialProgress = 0, className = '' }: Props & { ref?: React.RefObject<ProgressBarRef | null> }) {
  const progress = useSharedValue<number>(initialProgress ?? 0);
  useImperativeHandle(ref, () => {
    return {
      setProgress: (value: number) => {
        progress.value = withTiming(value, {
          duration: 250,
          easing: Easing.inOut(Easing.quad),
        });
      },
    };
  }, [progress]);

  const style = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
      backgroundColor: '#000',
      height: 2,
    };
  });
  return (
    <View className={twMerge(`bg-[#EAEAEA]`, className)}>
      <Animated.View style={style} />
    </View>
  );
}
>>>>>>> f6309e9

<<<<<<< HEAD
import { forwardRef, useImperativeHandle } from 'react';
=======
import React, { forwardRef, useImperativeHandle } from 'react';
>>>>>>> c7bb80d
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

export const ProgressBar = forwardRef<ProgressBarRef, Props>(
  ({ initialProgress = 0, className = '' }, ref) => {
    const progress = useSharedValue<number>(initialProgress ?? 0);
<<<<<<< HEAD
    useImperativeHandle(
      ref,
      () => ({
=======
    useImperativeHandle(ref, () => {
      return {
>>>>>>> c7bb80d
        setProgress: (value: number) => {
          progress.value = withTiming(value, {
            duration: 250,
            easing: Easing.inOut(Easing.quad),
          });
        },
<<<<<<< HEAD
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
=======
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
      <View className={twMerge(` bg-[#EAEAEA]`, className)}>
        <Animated.View style={style} />
      </View>
    );
  }
>>>>>>> c7bb80d
);

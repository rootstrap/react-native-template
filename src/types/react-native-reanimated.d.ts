import type { EasingFunction as EasingFunctionType } from 'react-native-reanimated';

declare module 'react-native-reanimated' {
  namespace Animated {
    // Extend the Animated namespace to include EasingFunction
    // This is needed for @gorhom/bottom-sheet compatibility with react-native-reanimated v4
    type EasingFunction = EasingFunctionType;
  }
}

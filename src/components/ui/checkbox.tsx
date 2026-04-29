import type { PressableProps } from 'react-native';
import { MotiView } from 'moti';
<<<<<<< HEAD
=======
import * as React from 'react';
>>>>>>> f6309e9
import { useCallback } from 'react';
import {
  I18nManager,
  Pressable,

  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import colors from '@/components/ui/colors';

import { Text } from './text';

const SIZE = 20;
const WIDTH = 50;
const HEIGHT = 28;
const THUMB_HEIGHT = 22;
const THUMB_WIDTH = 22;
const THUMB_OFFSET = 4;

export type RootProps = {
  onChange: (checked: boolean) => void;
  checked?: boolean;
  className?: string;
  accessibilityLabel: string;
} & Omit<PressableProps, 'onPress'>;

export type IconProps = {
  checked: boolean;
};

<<<<<<< HEAD
export const Root = ({
  checked,
=======
export function Root({
  checked = false,
>>>>>>> f6309e9
  children,
  onChange,
  disabled,
  className = '',
  ...props
}: RootProps) {
  const handleChange = useCallback(() => {
    onChange(!checked);
  }, [onChange, checked]);

  return (
    <Pressable
      onPress={handleChange}
      className={`flex-row items-center ${className} ${
        disabled ? 'opacity-50' : ''
      }`}
      accessibilityState={{ checked }}
      disabled={disabled}
      {...props}
    >
      {children}
    </Pressable>
  );
}

type LabelProps = {
  text: string;
  className?: string;
  testID?: string;
};

<<<<<<< HEAD
const Label = ({ text, testID, className = '' }: LabelProps) => (
  <Text testID={testID} className={` ${className} pl-2`}>
    {text}
  </Text>
);

export const CheckboxIcon = ({ checked }: IconProps) => {
=======
function Label({ text, testID, className = '' }: LabelProps) {
  return (
    <Text testID={testID} className={`${className} pl-2`}>
      {text}
    </Text>
  );
}

export function CheckboxIcon({ checked = false }: IconProps) {
>>>>>>> f6309e9
  const color = checked ? colors.primary[300] : colors.charcoal[400];
  return (
    <MotiView
      style={{
        height: SIZE,
        width: SIZE,
        borderColor: color,
      }}
      className="items-center justify-center rounded-[5px] border-2"
      from={{ backgroundColor: 'transparent', borderColor: '#CCCFD6' }}
      animate={{
        backgroundColor: checked ? color : 'transparent',
        borderColor: color,
      }}
      transition={{
        backgroundColor: { type: 'timing', duration: 100 },
        borderColor: { type: 'timing', duration: 100 },
      }}
    >
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ opacity: { type: 'timing', duration: 100 } }}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="m16.726 7-.64.633c-2.207 2.212-3.878 4.047-5.955 6.158l-2.28-1.928-.69-.584L6 12.66l.683.577 2.928 2.477.633.535.591-.584c2.421-2.426 4.148-4.367 6.532-6.756l.633-.64L16.726 7Z"
            fill="#fff"
          />
        </Svg>
      </MotiView>
    </MotiView>
  );
}

<<<<<<< HEAD
const CheckboxRoot = ({ checked, children, ...props }: RootProps) => (
  <Root checked={checked} accessibilityRole="checkbox" {...props}>
    {children}
  </Root>
);
=======
function CheckboxRoot({ checked = false, children, ...props }: RootProps) {
  return (
    <Root checked={checked} accessibilityRole="checkbox" {...props}>
      {children}
    </Root>
  );
}
>>>>>>> f6309e9

function CheckboxBase({
  checked = false,
  testID,
  label,

  ...props
<<<<<<< HEAD
}: RootProps & { label?: string }) => (
  <CheckboxRoot checked={checked} testID={testID} {...props}>
    <CheckboxIcon checked={checked} />
    {label ? (
      <Label
        text={label}
        testID={testID ? `${testID}-label` : undefined}
        className="pr-2"
      />
    ) : null}
  </CheckboxRoot>
);
=======
}: RootProps & { label?: string }) {
  return (
    <CheckboxRoot checked={checked} testID={testID} {...props}>
      <CheckboxIcon checked={checked} />
      {label
        ? (
            <Label
              text={label}
              testID={testID ? `${testID}-label` : undefined}
              className="pr-2"
            />
          )
        : null}
    </CheckboxRoot>
  );
}
>>>>>>> f6309e9

export const Checkbox = Object.assign(CheckboxBase, {
  Icon: CheckboxIcon,
  Root: CheckboxRoot,
  Label,
});

<<<<<<< HEAD
export const RadioIcon = ({ checked }: IconProps) => {
=======
export function RadioIcon({ checked = false }: IconProps) {
>>>>>>> f6309e9
  const color = checked ? colors.primary[300] : colors.charcoal[400];
  return (
    <MotiView
      style={{
        height: SIZE,
        width: SIZE,
        borderColor: color,
      }}
      className="items-center justify-center rounded-[20px] border-2 bg-transparent"
      from={{ borderColor: '#CCCFD6' }}
      animate={{
        borderColor: color,
      }}
      transition={{ borderColor: { duration: 100, type: 'timing' } }}
    >
      <MotiView
        className={`size-[10px] rounded-[10px] ${checked && 'bg-primary-300'}`}
        from={{ opacity: 0 }}
        animate={{ opacity: checked ? 1 : 0 }}
        transition={{ opacity: { duration: 50, type: 'timing' } }}
      />
    </MotiView>
  );
}

<<<<<<< HEAD
const RadioRoot = ({ checked, children, ...props }: RootProps) => (
  <Root checked={checked} accessibilityRole="radio" {...props}>
    {children}
  </Root>
);
=======
function RadioRoot({ checked = false, children, ...props }: RootProps) {
  return (
    <Root checked={checked} accessibilityRole="radio" {...props}>
      {children}
    </Root>
  );
}
>>>>>>> f6309e9

function RadioBase({
  checked = false,
  testID,
  label,
  ...props
<<<<<<< HEAD
}: RootProps & { label?: string }) => (
  <RadioRoot checked={checked} testID={testID} {...props}>
    <RadioIcon checked={checked} />
    {label ? (
      <Label text={label} testID={testID ? `${testID}-label` : undefined} />
    ) : null}
  </RadioRoot>
);
=======
}: RootProps & { label?: string }) {
  return (
    <RadioRoot checked={checked} testID={testID} {...props}>
      <RadioIcon checked={checked} />
      {label
        ? (
            <Label text={label} testID={testID ? `${testID}-label` : undefined} />
          )
        : null}
    </RadioRoot>
  );
}
>>>>>>> f6309e9

export const Radio = Object.assign(RadioBase, {
  Icon: RadioIcon,
  Root: RadioRoot,
  Label,
});

<<<<<<< HEAD
export const SwitchIcon = ({ checked }: IconProps) => {
=======
export function SwitchIcon({ checked = false }: IconProps) {
>>>>>>> f6309e9
  const translateX = checked
    ? THUMB_OFFSET
    : WIDTH - THUMB_WIDTH - THUMB_OFFSET;

  const backgroundColor = checked ? colors.primary[300] : colors.charcoal[400];

  return (
    <View className="w-[50px] justify-center">
      <View className="overflow-hidden rounded-full">
        <View
          style={{
            width: WIDTH,
            height: HEIGHT,
            backgroundColor,
          }}
        />
      </View>
      <MotiView
        style={{
          height: THUMB_HEIGHT,
          width: THUMB_WIDTH,
          position: 'absolute',
          backgroundColor: 'white',
          borderRadius: 13,
          right: 0,
        }}
        animate={{
          translateX: I18nManager.isRTL ? translateX : -translateX,
        }}
        transition={{ translateX: { overshootClamping: true } }}
      />
    </View>
  );
<<<<<<< HEAD
};
const SwitchRoot = ({ checked, children, ...props }: RootProps) => (
  <Root checked={checked} accessibilityRole="switch" {...props}>
    {children}
  </Root>
);
=======
}
function SwitchRoot({ checked = false, children, ...props }: RootProps) {
  return (
    <Root checked={checked} accessibilityRole="switch" {...props}>
      {children}
    </Root>
  );
}
>>>>>>> f6309e9

function SwitchBase({
  checked = false,
  testID,
  label,
  ...props
<<<<<<< HEAD
}: RootProps & { label?: string }) => (
  <SwitchRoot checked={checked} testID={testID} {...props}>
    <SwitchIcon checked={checked} />
    {label ? (
      <Label text={label} testID={testID ? `${testID}-label` : undefined} />
    ) : null}
  </SwitchRoot>
);
=======
}: RootProps & { label?: string }) {
  return (
    <SwitchRoot checked={checked} testID={testID} {...props}>
      <SwitchIcon checked={checked} />
      {label
        ? (
            <Label text={label} testID={testID ? `${testID}-label` : undefined} />
          )
        : null}
    </SwitchRoot>
  );
}
>>>>>>> f6309e9

export const Switch = Object.assign(SwitchBase, {
  Icon: SwitchIcon,
  Root: SwitchRoot,
  Label,
});

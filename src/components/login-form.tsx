import { zodResolver } from '@hookform/resolvers/zod';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import z from 'zod';

import { Button, ControlledInput, Text, View } from '@/ui';

const MIN_CHARS = 6;
const schema = z.object({
  username: z.string({
    required_error: 'Username is required',
  }),
  email: z.string().email('Invalid email format').optional(),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(MIN_CHARS, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const LoginForm = ({ onSubmit = () => {} }: LoginFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <Text testID="form-title" className="pb-6 text-center text-2xl">
          Sign In
        </Text>

        <ControlledInput
          testID="email-input"
          control={control}
          name="email"
          label="Email (optional)"
        />
        <ControlledInput
          testID="username-input"
          control={control}
          name="username"
          label="Username"
        />
        <ControlledInput
          testID="password-input"
          control={control}
          name="password"
          label="Password"
          placeholder="***"
          secureTextEntry={true}
        />
        <Button
          testID="login-button"
          label="Login"
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

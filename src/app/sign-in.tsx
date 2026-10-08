import type { LoginFormProps } from '@/components/login-form';
import { Stack } from 'expo-router';
import * as React from 'react';

import { showMessage } from 'react-native-flash-message';
import { useLogin } from '@/api/auth/use-login';
import { LoginForm } from '@/components/login-form';
import { FocusAwareStatusBar } from '@/components/ui';

export default function Login() {
  const { mutate: login, isPending } = useLogin({
    onError: error => showMessage({ message: error.message, type: 'danger' }),
  });

  const onSubmit: LoginFormProps['onSubmit'] = (data) => {
    login(data);
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} isLoading={isPending} />
    </>
  );
}

import type { LoginFormProps } from '@/components/login-form';
import * as React from 'react';

import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { useLogin } from '@/api/auth/use-login';
import { LoginForm } from '@/components/login-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { usePendingDeepLink } from '@/lib/auth/pending-deep-link';

export default function Login() {
  const { t } = useTranslation();
  const { mutate: login, isPending } = useLogin({
    onError: error => showMessage({ message: error.message, type: 'danger' }),
  });
  const hasPendingDeepLink = usePendingDeepLink.use.path() !== null;

  const onSubmit: LoginFormProps['onSubmit'] = (data) => {
    login(data);
  };
  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm
        onSubmit={onSubmit}
        isLoading={isPending}
        notice={hasPendingDeepLink ? t('auth.signIn.deepLinkMessage') : undefined}
      />
    </>
  );
}

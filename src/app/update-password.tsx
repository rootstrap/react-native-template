import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { showMessage } from 'react-native-flash-message';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';

import { useUpdatePassword } from '@/api/auth/use-update-password';
import {
  Button,
  ControlledInput,
  FocusAwareStatusBar,
  Text,
  View,
} from '@/components/ui';
import { translate } from '@/lib';

type FormValues = { password: string; passwordConfirmation: string };
const MIN_CHARS = 6;

const schema = z
  .object({
    password: z.string().min(
      MIN_CHARS,
      translate('updatePassword.error.shortPassword', {
        minChars: MIN_CHARS,
      }),
    ),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: translate('updatePassword.error.passwordsMustMatch'),
    path: ['passwordConfirmation'],
  });

export default function UpdatePassword() {
  const { t } = useTranslation();
  const navigate = useNavigation();

  const { mutateAsync: updatePassword } = useUpdatePassword({
    onSuccess: () => {
      showMessage({
        message: t('updatePassword.successMessage'),
        type: 'success',
      });
      navigate.goBack();
    },
    onError: () => {
      showMessage({
        message: t('updatePassword.errorMessage'),
        type: 'danger',
      });
    },
  });

  const { handleSubmit, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: FormValues) => {
    await updatePassword(data);
  };

  return (
    <>
      <FocusAwareStatusBar />
      <KeyboardAvoidingView>
        <View className="gap-8 p-4">
          <View className="gap-2">
            <Text className="text-center text-2xl">
              {t('updatePassword.title')}
            </Text>
            <Text className="text-center text-gray-600">
              {t('updatePassword.description')}
            </Text>
          </View>
          <View className="gap-2">
            <ControlledInput
              testID="password-input"
              autoCapitalize="none"
              secureTextEntry
              control={control}
              name="password"
              label={t('updatePassword.passwordLabel')}
              placeholder={t('updatePassword.passwordPlaceholder')}
            />
            <ControlledInput
              testID="confirm-password-input"
              autoCapitalize="none"
              secureTextEntry
              control={control}
              name="passwordConfirmation"
              label={t('updatePassword.confirmPasswordLabel')}
              placeholder={t('updatePassword.confirmPasswordPlaceholder')}
            />
            <Button
              testID="update-password-button"
              label={t('updatePassword.buttonLabel')}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

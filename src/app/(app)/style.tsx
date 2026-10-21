import { Tabs } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Buttons } from '@/components/buttons';
import { Colors } from '@/components/colors';
import { Inputs } from '@/components/inputs';
import { Typography } from '@/components/typography';
import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/components/ui';
import { Style as StyleIcon } from '@/components/ui/icons';

export default function Style() {
  const { t } = useTranslation();

  return (
    <>
      <Tabs.Screen
        options={{
          title: t('tabs.style'),
          tabBarIcon: ({ color }) => <StyleIcon color={color} />,
          tabBarButtonTestID: 'style-tab',
        }}
      />
      <FocusAwareStatusBar />
      <ScrollView className="px-4">
        <SafeAreaView className="flex-1">
          <Typography />
          <Colors />
          <Buttons />
          <Inputs />
        </SafeAreaView>
      </ScrollView>
    </>
  );
}

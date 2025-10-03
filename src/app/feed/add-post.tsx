import { Stack } from 'expo-router';
<<<<<<< HEAD
=======
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { useAddPost } from '@/api';
import {
  Button,
  ControlledInput,
  showErrorMessage,
  View,
} from '@/components/ui';

const schema = z.object({
  title: z.string().min(10),
  body: z.string().min(120),
});

type FormType = z.infer<typeof schema>;

>>>>>>> c7bb80d
export default function AddPost() {
  return (
    <Stack.Screen
      options={{
        title: 'Add Post',
        headerBackTitle: 'Feed',
      }}
    />
  );
}

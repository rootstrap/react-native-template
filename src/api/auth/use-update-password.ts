import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  password: string;
  passwordConfirmation: string;
};

type ResponseData = {
  email: string;
  provider: string;
  uid: string;
  id: number;
  allow_password_change: boolean;
  name: string;
  nickname: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  birthday: string | null;
};

type Response = {
  success: boolean;
  message: string;
  data?: ResponseData;
};

async function updatePasswordRequest(variables: Variables) {
  const { data } = await client({
    url: '/v1/users/password',
    method: 'PUT',
    data: { ...variables },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
}

export const useUpdatePassword = createMutation<Response, Variables>({
  mutationFn: async variables => updatePasswordRequest(variables),
});

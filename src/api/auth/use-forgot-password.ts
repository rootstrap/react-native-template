import { createMutation } from 'react-query-kit';

import { client } from '../common';

type Variables = {
  email: string;
};

type Response = {
  message: string;
};

// Should be replaced with the app's web url.
const redirectUrl = 'https://example.com';

async function sendForgotPasswordInstructions(variables: Variables) {
  const { data } = await client<Response>({
    url: '/v1/users/password', // Dummy endpoint for forgot password
    method: 'POST',
    data: {
      email: variables.email,
      redirect_url: redirectUrl,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
}

export const useForgotPassword = createMutation<Response, Variables>({
  mutationFn: async variables => sendForgotPasswordInstructions(variables),
});

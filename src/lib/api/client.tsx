import axios from 'axios';
<<<<<<< HEAD:src/api/common/client.tsx

import { Env } from '@/lib/env';
=======
import Env from 'env';
>>>>>>> f6309e9:src/lib/api/client.tsx

export const client = axios.create({
  baseURL: Env.EXPO_PUBLIC_API_URL,
});

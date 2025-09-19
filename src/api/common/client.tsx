import axios from 'axios';

import { Env } from '@/lib/env';

export const client = axios.create({
  baseURL: Env.API_URL,
});

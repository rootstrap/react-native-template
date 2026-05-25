import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { signIn, useAuth } from '@/lib';

import { client } from './client';
import { toCamelCase, toSnakeCase } from './utils';

const ACCESS_TOKEN = 'access-token';
const CLIENT_HEADER = 'client';
const UID_HEADER = 'uid';
const EXPIRY_HEADER = 'expiry';
const AUTHORIZATION_HEADER = 'Authorization';

const CONTENT_TYPE = 'Content-Type';
const MULTIPART_FORM_DATA = 'multipart/form-data';

export default function interceptors() {
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuth.getState().token;

    const { headers } = config;

    if (headers && headers[CONTENT_TYPE] !== MULTIPART_FORM_DATA && config.data) {
      config.data = toSnakeCase(config.data);
    }

    if (token) {
      const { access, client: _client, uid, bearer, expiry } = token;

      config.headers[AUTHORIZATION_HEADER] = bearer;
      config.headers[ACCESS_TOKEN] = access;
      config.headers[CLIENT_HEADER] = _client;
      config.headers[UID_HEADER] = uid;
      config.headers[EXPIRY_HEADER] = expiry;
    }

    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const { headers } = response;
      const originalData = response.data as Record<string, unknown>;

      const token = headers[ACCESS_TOKEN] as string | undefined;
      const _client = (headers[CLIENT_HEADER] as string | undefined) ?? '';
      const uid = (headers[UID_HEADER] as string | undefined) ?? '';
      const expiry = (headers[EXPIRY_HEADER] as string | undefined) ?? '';
      const bearer = (headers[AUTHORIZATION_HEADER] as string | undefined) ?? '';

      if (token) {
        signIn({ access: token, client: _client, uid, expiry, bearer });
      }

      response.data = toCamelCase(originalData);

      return response;
    },
    async (error: AxiosError) => Promise.reject(error),
  );
}

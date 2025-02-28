import type {
  GetNextPageParamFunction,
  GetPreviousPageParamFunction,
} from '@tanstack/react-query';

import type { PaginateQuery } from '../types';

type KeyParams = {
  [key: string]: unknown;
};
export const DEFAULT_LIMIT = 10;

export function getQueryKey<T extends KeyParams>(key: string, params?: T) {
  return [key, ...(params ? [params] : [])];
}

// for infinite query pages  to flatList data
export function normalizePages<T>(pages?: PaginateQuery<T>[]): T[] {
  return pages
    ? pages.reduce((prev: T[], current) => [...prev, ...current.results], [])
    : [];
}

// a function that accept a url and return params as an object
export function getUrlParameters(
  url: string | null,
): { [k: string]: string } | null {
  if (url === null) {
    return null;
  }
  const urlObj = new URL(url);
  const params: { [key: string]: string } = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export const getPreviousPageParam: GetNextPageParamFunction<
  unknown,
  PaginateQuery<unknown>
> = (page) => getUrlParameters(page.previous)?.offset ?? null;

export const getNextPageParam: GetPreviousPageParamFunction<
  unknown,
  PaginateQuery<unknown>
> = (page) => getUrlParameters(page.next)?.offset ?? null;

type GenericObject = { [key: string]: unknown };

function isGenericObject(value: unknown): value is GenericObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const toCamelCase = (obj: GenericObject): GenericObject => {
  const newObj: GenericObject = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      const value = obj[key];
      if (isGenericObject(value)) {
        newObj[newKey] = toCamelCase(value);
      } else {
        newObj[newKey] = value;
      }
    }
  }
  return newObj;
};

const camelToSnake = (key: string): string =>
  key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();

export const toSnakeCase = (obj: GenericObject): GenericObject => {
  const newObj: GenericObject = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = camelToSnake(key);
    newObj[newKey] =
      isGenericObject(value) && value !== null ? toSnakeCase(value) : value;
  }
  return newObj;
};

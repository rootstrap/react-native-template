import type {
  GetNextPageParamFunction,
  GetPreviousPageParamFunction,
} from '@tanstack/react-query';

export type PaginateQuery<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

type KeyParams = {
  [key: string]: unknown;
};
export const DEFAULT_LIMIT = 10;

export function getQueryKey<T extends KeyParams>(key: string, params?: T) {
  return [key, ...(params ? [params] : [])];
}

// for infinite query pages  to flatList data
export function normalizePages<T>(pages?: Array<PaginateQuery<T>>): Array<T> {
  return pages
    ? pages.reduce(
        (prev: Array<T>, current) => [...prev, ...current.results],
        [],
      )
    : [];
}

// a function that accept a url and return params as an object
export function getUrlParameters(
  url: string | null,
): { [k: string]: string } | null {
  if (url === null) {
    return null;
  }
<<<<<<< HEAD:src/api/common/utils.tsx
  const urlObj = new URL(url);
  const params: { [key: string]: string } = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
=======
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const params = {};
  let match;
  while ((match = regex.exec(url))) {
    if (match[1] !== null) {
      // @ts-expect-error - Dynamic key assignment
      params[match[1]] = match[2];
    }
  }
>>>>>>> f6309e9:src/lib/api/utils.tsx
  return params;
}

export const getPreviousPageParam: GetNextPageParamFunction<
  unknown,
  PaginateQuery<unknown>
> = page => getUrlParameters(page.previous)?.offset ?? null;

export const getNextPageParam: GetPreviousPageParamFunction<
  unknown,
  PaginateQuery<unknown>
<<<<<<< HEAD:src/api/common/utils.tsx
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
=======
> = page => getUrlParameters(page.next)?.offset ?? null;
>>>>>>> f6309e9:src/lib/api/utils.tsx

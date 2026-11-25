import type { AnalyticsParams } from '@/lib/analytics';
import { useGlobalSearchParams, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAnalytics } from '@/components/providers/analytics';
import { useAuth } from '@/components/providers/auth';
import { hasIdentifiedUser } from '@/lib/analytics';

/**
 * expo-router exposes the URL fragment as a `#` param. It is not a route or
 * search param and often carries credentials (e.g. `#access_token=...`).
 */
const HASH_PARAM = '#';

/**
 * Params with a word in their name that suggests a credential or personal
 * data (deep-link tokens, reset codes, emails...) are never sent to vendors.
 * Names are split on camelCase (including acronyms such as `APIKey`), `_` and
 * `-` and letter/digit boundaries, and a word is sensitive when it ends with
 * one of these (singular or plural) or, for terms of 5+ letters, starts with
 * one. So `resetCode`, `APIKey`, `access_token`, `apikey`, `emails`, `token2`
 * and `tokenvalue` are dropped while `author` or `keyboard` are kept.
 * `client` and `uid` are Devise Token Auth credentials (see `HEADER_KEYS`)
 * that the password-reset redirect puts in the URL.
 * Adjust the list to your app's routes; adapters can filter further.
 */
const SENSITIVE_PARAM_WORDS = [
  'token',
  'secret',
  'password',
  'passwd',
  'pwd',
  'code',
  'otp',
  'email',
  'key',
  'auth',
  'authorization',
  'jwt',
  'session',
  'signature',
  'credential',
  'client',
  'uid',
  'pass',
  'pin',
  'sid',
  'sig',
  'hash',
  'bearer',
  'phone',
  'ssn',
];

const EMAIL_VALUE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_VALUE = /^eyJ[\w-]*\.[\w-]+\.[\w-]*$/;

/**
 * Second layer for credentials or personal data passed under a harmless name
 * (`?ref=<email>`, `?state=<jwt>`): values that look like an email address or
 * a JWT are never sent, whatever the param is called.
 */
function isSensitiveValue(value: string) {
  return EMAIL_VALUE.test(value) || JWT_VALUE.test(value);
}

function toWords(key: string) {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(\d)/gi, '$1 $2')
    .replace(/(\d)([a-z])/gi, '$1 $2')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
}

/**
 * Terms this long are distinctive enough to also match at the start of a word
 * (`tokenvalue`, `passwordconfirm`). Shorter ones (`key`, `auth`, `code`...)
 * only match at the end, so `keyboard` and `author` are still sent.
 */
const MIN_PREFIX_TERM_LENGTH = 5;

function isSensitiveWord(word: string) {
  const singular = word.endsWith('s') ? word.slice(0, -1) : word;
  return SENSITIVE_PARAM_WORDS.some(
    sensitive =>
      word.endsWith(sensitive)
      || singular.endsWith(sensitive)
      || (sensitive.length >= MIN_PREFIX_TERM_LENGTH && word.startsWith(sensitive)),
  );
}

function isTrackableParam(key: string) {
  return key !== HASH_PARAM && !toWords(key).some(isSensitiveWord);
}

/**
 * Which route params are sent with each screen view:
 * - `true` (the default): every param except the URL fragment and the names
 *   matched by `SENSITIVE_PARAM_WORDS`.
 * - `false`: no params; `trackScreen` always receives `undefined`.
 * - a function: only the params whose name it accepts. The denylist still
 *   applies first, so it can narrow what is sent but never re-enable a
 *   sensitive name.
 */
export type TrackScreenParamsOption = boolean | ((name: string) => boolean);

export type AnalyticsScreenTrackingOptions = {
  trackParams?: TrackScreenParamsOption;
};

/**
 * Default decided by the template maintainers: route params are sent with
 * screen views (denylist approach). An opt-in allowlist and `false` were
 * considered as defaults and not chosen, so screen views carry useful context
 * out of the box. The denylist and the value checks above are best effort,
 * not a guarantee: apps that route sensitive data should pass `trackParams`
 * to `useAnalyticsScreenTracking` to turn this off or narrow it.
 */
const DEFAULT_TRACK_PARAMS: TrackScreenParamsOption = true;

function acceptsParam(trackParams: TrackScreenParamsOption, key: string) {
  if (trackParams === false || !isTrackableParam(key)) {
    return false;
  }
  return trackParams === true || trackParams(key);
}

function isRouteGroup(segment: string) {
  return segment.startsWith('(') && segment.endsWith(')');
}

function toScreenName(segments: ReadonlyArray<string>) {
  return `/${segments.filter(segment => !isRouteGroup(segment)).join('/')}`;
}

function isPrimitiveParam(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

/**
 * Navigation params can hold non-string values at runtime (numbers, nested
 * objects), so values are converted to strings and anything that is not a
 * primitive (or an array of primitives) is dropped, keeping params flat.
 */
function toParamValue(value: unknown) {
  if (Array.isArray(value)) {
    const values = value.filter(isPrimitiveParam);
    return values.length > 0 ? values.map(String).join(',') : undefined;
  }
  return isPrimitiveParam(value) ? String(value) : undefined;
}

/**
 * Serialises the route params into a stable key (sorted by name), so the same
 * params in a different order are not reported as a new screen view.
 * Repeated params are joined with commas. Returns an empty string when the
 * route has no params.
 */
function toParamsKey(routeParams: Readonly<Record<string, unknown>>, trackParams: TrackScreenParamsOption) {
  const entries = Object.keys(routeParams)
    .filter(key => acceptsParam(trackParams, key))
    .sort()
    .flatMap((key) => {
      const value = toParamValue(routeParams[key]);
      return value === undefined || isSensitiveValue(value) ? [] : [[key, value] as const];
    });
  return entries.length > 0 ? JSON.stringify(Object.fromEntries(entries)) : '';
}

function fromParamsKey(paramsKey: string): AnalyticsParams | undefined {
  return paramsKey ? (JSON.parse(paramsKey) as Record<string, string>) : undefined;
}

/**
 * Reports a screen view to every analytics provider whenever the route or its
 * params change, sending the route params (dynamic segments and search params)
 * along with the route pattern. By default every param is sent except the
 * denylisted names (see `DEFAULT_TRACK_PARAMS` and `TrackScreenParamsOption`);
 * pass `{ trackParams: false }` to send none, or a function to narrow them.
 * Call it once, inside `AnalyticsProvider`, after auth is ready.
 */
export function useAnalyticsScreenTracking({ trackParams = DEFAULT_TRACK_PARAMS }: AnalyticsScreenTrackingOptions = {}) {
  const screenName = toScreenName(useSegments());
  const paramsKey = toParamsKey(useGlobalSearchParams(), trackParams);
  const { trackScreen } = useAnalytics();
  const lastTrackedRef = useRef<{ screenName: string; paramsKey: string } | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const last = lastTrackedRef.current;
      if (last?.screenName === screenName && last.paramsKey === paramsKey) {
        return;
      }
      lastTrackedRef.current = { screenName, paramsKey };
      trackScreen(screenName, fromParamsKey(paramsKey));
    }, 0);
    return () => clearTimeout(timeout);
  }, [screenName, paramsKey, trackScreen]);
}

/**
 * Call it once, inside `AnalyticsProvider`, after auth is ready.
 */
export function useAnalyticsSessionReset() {
  const { isAuthenticated } = useAuth();
  const { reset } = useAnalytics();
  const wasAuthenticatedRef = useRef<boolean | null>(null);

  useEffect(() => {
    const signedOut = wasAuthenticatedRef.current === true && !isAuthenticated;
    const startedSignedOutAfterIdentify = wasAuthenticatedRef.current === null && !isAuthenticated && hasIdentifiedUser();
    if (signedOut || startedSignedOutAfterIdentify) {
      reset();
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, reset]);
}

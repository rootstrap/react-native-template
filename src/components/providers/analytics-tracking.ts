import type { AnalyticsParams } from '@/lib/analytics';
import { useGlobalSearchParams, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAnalytics } from '@/components/providers/analytics';
import { useAuth } from '@/components/providers/auth';
import { hasIdentifiedUser } from '@/lib/analytics';

/**
 * expo-router exposes the URL fragment as a `#` param. It is not a route or
 * search param, so it is never sent.
 */
const HASH_PARAM = '#';

/**
 * Which route params are sent with each screen view:
 * - `true` (the default): every param except the URL fragment.
 * - `false`: no params; `trackScreen` always receives `undefined`.
 * - a function: only the params whose name it accepts.
 */
export type TrackScreenParamsOption = boolean | ((name: string) => boolean);

export type AnalyticsScreenTrackingOptions = {
  trackParams?: TrackScreenParamsOption;
};

/**
 * Default decided by the template maintainers: every route param is sent with
 * screen views. Route params are treated as non-sensitive by design: they only
 * carry ids, modes and similar values, so never put tokens or personal data
 * in route params.
 */
const DEFAULT_TRACK_PARAMS: TrackScreenParamsOption = true;

function acceptsParam(trackParams: TrackScreenParamsOption, key: string) {
  if (trackParams === false || key === HASH_PARAM) {
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
  const values = (Array.isArray(value) ? value : [value])
    .filter(isPrimitiveParam)
    .map(String);
  return values.length > 0 ? values.join(',') : undefined;
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
      return value === undefined ? [] : [[key, value] as const];
    });
  return entries.length > 0 ? JSON.stringify(Object.fromEntries(entries)) : '';
}

/**
 * The serialised key is the only value the tracking effect depends on, so a
 * new params object on every render never re-triggers it; the params are read
 * back from that key when a screen view is reported. `toParamsKey` only ever
 * serialises a flat object of strings, which is what the cast states.
 */
function fromParamsKey(paramsKey: string): AnalyticsParams | undefined {
  return paramsKey ? (JSON.parse(paramsKey) as Record<string, string>) : undefined;
}

/**
 * Reports a screen view to every analytics provider whenever the route or its
 * params change, sending the route params (dynamic segments and search params)
 * along with the route pattern. By default every param is sent (see
 * `DEFAULT_TRACK_PARAMS` and `TrackScreenParamsOption`); pass
 * `{ trackParams: false }` to send none, or a function to narrow them.
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

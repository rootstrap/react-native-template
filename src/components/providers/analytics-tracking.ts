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
    return value.filter(isPrimitiveParam).map(String).join(',');
  }
  return isPrimitiveParam(value) ? String(value) : undefined;
}

/**
 * Serialises the route params into a stable key (sorted by name), so the same
 * params in a different order are not reported as a new screen view.
 * Repeated params are joined with commas. Returns an empty string when the
 * route has no params.
 */
function toParamsKey(routeParams: Readonly<Record<string, unknown>>) {
  const entries = Object.keys(routeParams)
    .filter(key => key !== HASH_PARAM)
    .sort()
    .flatMap((key) => {
      const value = toParamValue(routeParams[key]);
      return value === undefined ? [] : [[key, value] as const];
    });
  return entries.length > 0 ? JSON.stringify(Object.fromEntries(entries)) : '';
}

function fromParamsKey(paramsKey: string): AnalyticsParams | undefined {
  return paramsKey ? (JSON.parse(paramsKey) as Record<string, string>) : undefined;
}

/**
 * Reports a screen view to every analytics provider whenever the route or its
 * params change, sending the route params (dynamic segments and search params)
 * along with the route pattern. Call it once, inside `AnalyticsProvider`,
 * after auth is ready.
 */
export function useAnalyticsScreenTracking() {
  const screenName = toScreenName(useSegments());
  const paramsKey = toParamsKey(useGlobalSearchParams());
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

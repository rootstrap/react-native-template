import type { Href } from 'expo-router';

import { unwrapDevLaunchURL } from 'expo-linking';

export const AUTH_SCREENS: ReadonlyArray<string> = ['sign-in', 'sign-up', 'forgot-password'];

export const AUTHENTICATED_SCREENS: ReadonlyArray<string> = [
  '(app)',
  'update-password',
  'feed/[id]',
  'feed/add-post',
];

const PUBLIC_ROUTES: ReadonlySet<string> = new Set([...AUTH_SCREENS, 'onboarding', 'www', '_sitemap']);

const WEB_ORIGIN = /^https?:\/\/[^/?#]*/i;
const APP_SCHEME = /^[a-z][a-z\d+.-]*:\/\//i;
const EXPO_GO_PATH_SEPARATOR = '/--/';
const ROUTE_GROUP = /^\(.*\)$/;
const SINGLE_DOT_SEGMENT = /^(?:\.|%2e)$/i;
const DOUBLE_DOT_SEGMENT = /^(?:\.|%2e){2}$/i;
const IN_APP_PATH = /^\/(?![/\\])[^\\\s\p{Cc}]*$/u;

export function toAppPath(url: string): string {
  const target = unwrapDevLaunchURL(url.trim());
  const withoutOrigin = WEB_ORIGIN.test(target)
    ? target.replace(WEB_ORIGIN, '')
    : target.replace(APP_SCHEME, '');
  const expoGoIndex = withoutOrigin.indexOf(EXPO_GO_PATH_SEPARATOR);
  const path = expoGoIndex === -1
    ? withoutOrigin
    : withoutOrigin.slice(expoGoIndex + EXPO_GO_PATH_SEPARATOR.length - 1);
  const [withoutHash = ''] = path.split('#');

  return withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`;
}

export function isInAppPath(path: string): boolean {
  return IN_APP_PATH.test(path);
}

function resolveDotSegments(segments: ReadonlyArray<string>): Array<string> {
  return segments.reduce<Array<string>>((resolved, segment) => {
    if (DOUBLE_DOT_SEGMENT.test(segment)) {
      return resolved.slice(0, -1);
    }
    return SINGLE_DOT_SEGMENT.test(segment) ? resolved : [...resolved, segment];
  }, []);
}

function safelyDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  }
  catch {
    return segment;
  }
}

function getRouteSegments(path: string): Array<string> {
  const [pathname = ''] = path.split('?');
  return resolveDotSegments(pathname.split('/'))
    .map(safelyDecode)
    .filter(segment => segment !== '' && !ROUTE_GROUP.test(segment));
}

export function isPublicPath(path: string): boolean {
  const [firstSegment] = getRouteSegments(path);
  return firstSegment !== undefined && PUBLIC_ROUTES.has(firstSegment);
}

export function isReturnToPath(path: string): path is Extract<Href, string> {
  return isInAppPath(path) && getRouteSegments(path).length > 0 && !isPublicPath(path);
}

export function isOnScreen(segments: ReadonlyArray<string>, screens: ReadonlyArray<string>): boolean {
  const route = segments.join('/');
  return screens.some(screen => route === screen || route.startsWith(`${screen}/`));
}

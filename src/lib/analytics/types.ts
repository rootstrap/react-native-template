/**
 * Values accepted as analytics parameters. Keeping payloads flat and primitive
 * makes them compatible with every major vendor (Firebase, Segment, Amplitude...).
 */
export type AnalyticsParamValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsParamValue>;

type EventCatalogue<T extends Record<string, AnalyticsParams | undefined>> = T;

/**
 * Catalogue of every custom event the app can track, mapped to its params.
 * Add new events here: `trackEvent` is typed against this map, so the event
 * name and its params are checked at compile time.
 * Use `undefined` for events that carry no params.
 */
export type AnalyticsEventParams = EventCatalogue<{
  BUTTON_PRESS: { accessibilityId: string };
}>;

export type AnalyticsEvent = keyof AnalyticsEventParams;

/**
 * Params tuple for `trackEvent`: optional when the event declares `undefined`
 * params, required otherwise.
 */
export type AnalyticsEventArgs<E extends AnalyticsEvent>
  = undefined extends AnalyticsEventParams[E]
    ? [params?: AnalyticsEventParams[E]]
    : [params: AnalyticsEventParams[E]];

/**
 * Contract every analytics vendor must implement. App code never talks to a
 * vendor SDK directly; it goes through `useAnalytics`, which fans out to every
 * registered adapter.
 */
export type AnalyticsProviderAdapter = {
  /** Called once when the app mounts. Initialise the vendor SDK here. */
  init: () => void | Promise<void>;
  trackEvent: (name: AnalyticsEvent, params?: AnalyticsParams) => void | Promise<void>;
  trackScreen: (screenName: string, params?: AnalyticsParams) => void | Promise<void>;
  /** Associate subsequent events with a user. */
  identify?: (userId: string, traits?: AnalyticsParams) => void | Promise<void>;
  /** Clear the current user, e.g. on sign out. */
  reset?: () => void | Promise<void>;
};

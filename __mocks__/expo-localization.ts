export const locale = 'en-US';
export const locales = ['en-US'];
export const timezone = 'UTC';
export const isRTL = false;

export function getLocales() {
  return [
    {
      languageTag: 'en-US',
      languageCode: 'en',
      textDirection: 'ltr',
      digitGroupingSeparator: ',',
      decimalSeparator: '.',
      measurementSystem: 'imperial',
      currencyCode: 'USD',
      currencySymbol: '$',
      regionCode: 'US',
    },
  ];
}

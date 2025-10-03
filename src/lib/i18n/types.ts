//  https://github.com/infinitered/ignite/blob/master/boilerplate/app/i18n/i18n.ts
export type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`
  >;
}[keyof TObj & (string | number)];

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `['${TKey}']` | `.${TKey}`
  >;
}[keyof TObj & (string | number)];

<<<<<<< HEAD
type RecursiveKeyOfHandleValue<TValue, Text extends string> =
  TValue extends Array<unknown>
    ? Text
    : TValue extends object
      ? Text | `${Text}${RecursiveKeyOfInner<TValue>}`
      : Text;
=======
type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? Text | `${Text}${RecursiveKeyOfInner<TValue>}`
    : Text;
>>>>>>> c7bb80d

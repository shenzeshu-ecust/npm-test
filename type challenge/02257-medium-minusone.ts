// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<MinusOne<1>, 0>>,
  Expect<Equal<MinusOne<55>, 54>>,
  Expect<Equal<MinusOne<3>, 2>>,
  Expect<Equal<MinusOne<100>, 99>>,
  Expect<Equal<MinusOne<1101>, 1100>>,
  Expect<Equal<MinusOne<0>, -1>>,
  Expect<Equal<MinusOne<9_007_199_254_740_992>, 9_007_199_254_740_991>>,
]


// ============= Your Code Here =============

type ParseInt<T extends string> = T extends `${infer D extends number}` ? D : never
type ReverseString<T extends string> = T extends `${infer F}${infer R}` ? `${ReverseString<R>}${F}` : ''
type RemoveLeadingZeros<T extends string> = T extends '0' ? T : T extends `0${infer R}` ? RemoveLeadingZeros<R> : T
type InternalMinusOne<S extends string> = 
  S extends `${infer Digit extends number}${infer R}` 
  ? Digit extends 0 ? `9${InternalMinusOne<R>}`
    : `${[9, 0, 1, 2, 3, 4, 5, 6, 7, 8][Digit]}${R}`
  : never 
type InternalPlusOne<S extends string> = S extends "9"
  ? "01"
  : S extends `${infer Digit extends number}${infer Rest}`
  ? Digit extends 9
    ? `0${InternalPlusOne<Rest>}`
    : `${[1, 2, 3, 4, 5, 6, 7, 8, 9][Digit]}${Rest}`
  : never



type PutSign<S extends string> = `-${S}`;
type MinusOne<T extends number> = T extends 0
  ? -1
  : `${T}` extends `-${infer Abs}`
  ? ParseInt<
      PutSign<ReverseString<InternalPlusOne<ReverseString<`${Abs}`>>>>
    >
  : ParseInt<
      RemoveLeadingZeros<ReverseString<InternalMinusOne<ReverseString<`${T}`>>>>
    >;
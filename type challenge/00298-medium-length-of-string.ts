// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<LengthOfString<''>, 0>>,
  Expect<Equal<LengthOfString<'kumiko'>, 6>>,
  Expect<Equal<LengthOfString<'reina'>, 5>>,
  Expect<Equal<LengthOfString<'Sound! Euphonium'>, 16>>,
]


// ============= Your Code Here =============
// type LengthOfString<S extends string, K extends string[] = []> = S extends `${infer F}${infer R}`
//   ? LengthOfString<R, [...K, F]>
//   : K['length']

  // 先通过递归将字符串转化为数组，再通过数组的 length 属性获取数组长度
type StringToArray<S extends string> = S extends `${infer T}${infer R}` ? [T, ...StringToArray<R>] : [];
type LengthOfString<S extends string> = StringToArray<S>['length']
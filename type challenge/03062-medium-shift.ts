// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  // @ts-expect-error
  Shift<unknown>,
  Expect<Equal<Shift<[]>, []>>,
  Expect<Equal<Shift<[1]>, []>>,
  Expect<Equal<Shift<[3, 2, 1]>, [2, 1]>>,
  Expect<Equal<Shift<['a', 'b', 'c', 'd']>, ['b', 'c', 'd']>>,
]


// ============= Your Code Here =============
type Shift<T extends any[]> =  T extends [any, ...infer R]
    ? [...R] // R   直接写 R 也可以
    : T // 必须是本身 不然空数组通不过

// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<Pop<[3, 2, 1]>, [3, 2]>>,
  Expect<Equal<Pop<['a', 'b', 'c', 'd']>, ['a', 'b', 'c']>>,
  Expect<Equal<Pop<[]>, []>>,
]


// ============= Your Code Here =============
// type Pop<T extends any[]> = T extends [...infer R, any] ? R : never 最后一个过不了
type Pop<T extends any[]> = T extends [...infer R, any] ? R : T

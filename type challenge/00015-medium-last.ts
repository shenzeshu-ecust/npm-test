// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<Last<[2]>, 2>>,
  Expect<Equal<Last<[3, 2, 1]>, 1>>,
  Expect<Equal<Last<[() => 123, { a: string }]>, { a: string }>>,
]


// ============= Your Code Here =============
type Last<T extends any[]> = T extends [...any, infer K] ? K : never
// 或者： 加一个元素  取最后一个
// ! ts 取数组长度 T['length']
// type Last<T extends any[]> = [any, ...T][T['length']]

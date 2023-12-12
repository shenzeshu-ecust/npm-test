// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<Permutation<'A'>, ['A']>>,
  Expect<Equal<Permutation<'A' | 'B' | 'C'>, ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']>>,
  Expect<Equal<Permutation<'B' | 'A' | 'C'>, ['A', 'B', 'C'] | ['A', 'C', 'B'] | ['B', 'A', 'C'] | ['B', 'C', 'A'] | ['C', 'A', 'B'] | ['C', 'B', 'A']>>,
  Expect<Equal<Permutation<boolean>, [false, true] | [true, false]>>,
  Expect<Equal<Permutation<never>, []>>,
]


// ============= Your Code Here =============
// * 1 传入给T extends U中的T如果是一个联合类型A | B | C，则这个表达式会被展开成
// * (A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)

// * 2 [U] extends [never] 而不是 U extends never 因为  如果U是never类型，不以元组或数组的方式判断never类型，那么ts会直接推断这个表达式为never不进入预期判断的条件。 
type Permutation<T, U = T> = [U] extends [never] 
  ? []
  : T extends U
    ? [T, ...Permutation<Exclude<U, T>>]
    : [] 



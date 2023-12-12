// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<AnyOf<[1, 'test', true, [1], { name: 'test' }, { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[1, '', false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, 'test', false, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', true, [], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [1], {}]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { name: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], { name: 'test' }, { 1: 'test' }]>, true>>,
  Expect<Equal<AnyOf<[0, '', false, [], {}, undefined, null]>, false>>,
  Expect<Equal<AnyOf<[]>, false>>,
]


// ============= Your Code Here =============
type TypeFalse = undefined | null | 0 | '' | false | [] | Record<string, never>
type AnyOf<T extends readonly any[]> = T extends [infer F, ...infer R]
 ? F extends TypeFalse
  ? AnyOf<R>
  : true
: false


type AnyOf2<T extends any[]> = T[number] extends 0 | '' | false | [] | {[key: string]: never} | undefined | null
? false : true;

// 你的答案1
// 1:
type FalsyVal<V> = V extends [] | Record<string, never> | '' | 0 | false | undefined | null ? false : true
type AnyOf3<T extends readonly any[]> = true extends FalsyVal<T[number]> ? true : false
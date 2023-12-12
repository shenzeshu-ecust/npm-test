// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type X = Promise<string>
type Y = Promise<{ field: number }>
type Z = Promise<Promise<string | number>>
type Z1 = Promise<Promise<Promise<string | boolean>>>
type T = { then: (onfulfilled: (arg: number) => any) => any }

type cases = [
  Expect<Equal<MyAwaited<X>, string>>,
  Expect<Equal<MyAwaited<Y>, { field: number }>>,
  Expect<Equal<MyAwaited<Z>, string | number>>,
  Expect<Equal<MyAwaited<Z1>, string | boolean>>,
  Expect<Equal<MyAwaited<T>, number>>,
]

// @ts-expect-error
type error = MyAwaited<number>


// ============= Your Code Here =============
// interface PromiseLike<T> {
//   then<TResult1 = T, TResult2 = never>(
//     onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, 
//     onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
//   ) : PromiseLike<TResult1 | TResult2>;
// }
// ~ TS 有内置的 PromiseLike类型

type MyAwaited<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? 
  U extends PromiseLike<any>
    ? MyAwaited<U> 
    : U
  : never

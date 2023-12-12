// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<FlattenDepth<[]>, []>>,
  Expect<Equal<FlattenDepth<[1, 2, 3, 4]>, [1, 2, 3, 4]>>,
  Expect<Equal<FlattenDepth<[1, [2]]>, [1, 2]>>,
  Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]], 2>, [1, 2, 3, 4, [5]]>>,
  Expect<Equal<FlattenDepth<[1, 2, [3, 4], [[[5]]]]>, [1, 2, 3, 4, [[5]]]>>,
  Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 3>, [1, 2, 3, 4, [5]]>>,
  Expect<Equal<FlattenDepth<[1, [2, [3, [4, [5]]]]], 19260817>, [1, 2, 3, 4, 5]>>,
]


// ============= Your Code Here =============
type FlattenDepth<T extends unknown[], N extends number = 1, U extends any[] = []> = 
  U['length'] extends N 
    ? T
      : T extends [infer F, ...infer R] 
        ? F extends any[]
          ? [...FlattenDepth<F, N, [...U, 1]>, ...FlattenDepth<R, N, U>]
          : [F, ...FlattenDepth<R, N, U>]
    :T

// ~ 需要注意，只有 ...F 的部分向 U 中添加了元素，进行了 ”+1“，因为只有这部分是真正进行打平操作的，而剩余参数 R 部分的递归，并没有进行打平，只是继续向后传递参数，因此这部分不 ”+1“。

// * 打平一层
type FlattenOnce<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends any[]
    ? [...F, ...FlattenOnce<R>]
    : [F, ...FlattenOnce<R>]
  : T

// * 深度打平
type FlattenDepth1<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends any[]
    ? [...FlattenDepth<F>, ...FlattenDepth<R>]
    : [F, ...FlattenDepth<R>]
  : T

// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

const tree1 = {
  val: 1,
  left: null,
  right: {
    val: 2,
    left: {
      val: 3,
      left: null,
      right: null,
    },
    right: null,
  },
} as const

const tree2 = {
  val: 1,
  left: null,
  right: null,
} as const

const tree3 = {
  val: 1,
  left: {
    val: 2,
    left: null,
    right: null,
  },
  right: null,
} as const

const tree4 = {
  val: 1,
  left: null,
  right: {
    val: 2,
    left: null,
    right: null,
  },
} as const

type cases = [
  Expect<Equal<InorderTraversal<null>, []>>,
  Expect<Equal<InorderTraversal<typeof tree1>, [1, 3, 2]>>,
  Expect<Equal<InorderTraversal<typeof tree2>, [1]>>,
  Expect<Equal<InorderTraversal<typeof tree3>, [2, 1]>>,
  Expect<Equal<InorderTraversal<typeof tree4>, [1, 2]>>,
]


// ============= Your Code Here =============
interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}
type InorderTraversal<T extends TreeNode | null, NT extends  TreeNode = NonNullable<T>> = T extends null ?
  [] :
  [...InorderTraversal<NT['left']>, NT['val'], ...InorderTraversal<NT['right']>]
// * 为什么需要 NonNullable<T> ？ 因为联合类型遇到 extends 走分配律。null 没有 val，right 等属性就会报错
// ~ 法 2 规避分配律
type InorderTraversal1<T extends TreeNode | null>
  = [T] extends [TreeNode] ? [...InorderTraversal<T['left']>, T['val'], ...InorderTraversal<T['right']>]
  : [];

// ! 因为 T 是一个分布式条件类型，分布式条件类型会拿到联合类型中的每一个类型，进行 extends 判断，所以 T extends TreeNode 时，会执行两次 extends 判断:
// ! 1. TreeNode extends TreeNode 、 2. null extends TreeNode，然后 null extends TreeNode 结果是 []
// ! distribute 之后，另一分支即 TreeNode extends TreeNode 让 compiler 持续 resolve （因为独立的每次确实可以 resolve）因而导致递归过身，而如果是 [T] extends [TreeNode] 且 T 为 TreeNode | null，则 compiler 需要知道 T 到底是 TreeNode 还是 null, 所以决定先 defer ，之后瞧着来
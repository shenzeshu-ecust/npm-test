// ============= Test Cases =============
import type { Alike, Expect } from './test-utils'

type cases = [
  Expect<Alike<MyReadonly2<Todo1>, Readonly<Todo1>>>,
  Expect<Alike<MyReadonly2<Todo1, 'title' | 'description'>, Expected>>,
  Expect<Alike<MyReadonly2<Todo2, 'title' | 'description'>, Expected>>,
  Expect<Alike<MyReadonly2<Todo2, 'description' >, Expected>>,
]

// @ts-expect-error
type error = MyReadonly2<Todo1, 'title' | 'invalid'>

interface Todo1 {
  title: string
  description?: string
  completed: boolean
}

interface Todo2 {
  readonly title: string
  description?: string
  completed: boolean
}

interface Expected {
  readonly title: string
  readonly description?: string
  completed: boolean
}


// ============= Your Code Here =============
// 要小心第一个 test case  没有第二个参数  那么默认所有都是只读的

// 因为第二个泛型可能为空，所以需要通过 = 来赋K默认值
// 因为第二个交叉类型使用了 T extends K ? never : T 的判断，所以默认值应该是 keyof T
type MyReadonly2<T, K extends keyof T = keyof T> =  {
   [P in keyof T as P extends K ?  never : P]: T[P] 
} & {
  readonly [P in K]: T[P]
}


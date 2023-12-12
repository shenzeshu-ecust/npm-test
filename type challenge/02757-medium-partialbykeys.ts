// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

interface User {
  name: string
  age: number
  address: string
}

interface UserPartialName {
  name?: string
  age: number
  address: string
}

interface UserPartialNameAndAge {
  name?: string
  age?: number
  address: string
}

type cases = [
  Expect<Equal<PartialByKeys<User, 'name'>, UserPartialName>>,
  Expect<Equal<PartialByKeys<User, 'name' | 'age'>, UserPartialNameAndAge>>,
  Expect<Equal<PartialByKeys<User>, Partial<User>>>,
  // @ts-expect-error
  Expect<Equal<PartialByKeys<User, 'name' | 'unknown'>, UserPartialName>>,
]


// ============= Your Code Here =============
 //* 为了把 {a: number} & {b: string}  -> {a: number, b: string}
type IntersectionToObj<T> = {
  [K in keyof T]: T[K]
}
type PartialByKeys<T, K extends keyof T = keyof T> = IntersectionToObj<{
  [P in K]?: T[P]
} & {
  [P in keyof T as P extends K ? never : P]: T[P]
}
>

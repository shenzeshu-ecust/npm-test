// ============= Test Cases =============
import { Key } from 'rc-table/lib/interface'
import type { Equal, Expect } from './test-utils'

type Foo = {
  name: string
  age: string
}
type Bar = {
  name: string
  age: string
  gender: number
}
type Coo = {
  name: string
  gender: number
}

type cases = [
  Expect<Equal<Diff<Foo, Bar>, { gender: number }>>,
  Expect<Equal<Diff<Bar, Foo>, { gender: number }>>,
  Expect<Equal<Diff<Foo, Coo>, { age: string; gender: number }>>,
  Expect<Equal<Diff<Coo, Foo>, { age: string; gender: number }>>,
]


// ============= Your Code Here =============
// type Diff<O, O1> = {
//   [K in keyof (O & O1) as K extends keyof (O | O1) ? never : K]: (O & O1)[K]
// }
// 或者
type Diff<O, O1> = Omit<O & O1, keyof (O | O1)>
type A = Foo | Bar 
type B = Foo & Bar
let a: A // name, age keyof T2会拿到既存在于Foo，也存在于Bar中的key,因为T2有可能是Foo，也有可能是Bar，所以只有拿共同拥有的key才是安全的。
let b: B // name, age, gender


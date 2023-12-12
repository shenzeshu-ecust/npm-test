// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

interface Model {
  name: string
  age: number
  locations: string[] | null
}

type ModelEntries = ['name', string] | ['age', number] | ['locations', string[] | null]

type cases = [
  Expect<Equal<ObjectEntries<Model>, ModelEntries>>,
  Expect<Equal<ObjectEntries<Partial<Model>>, ModelEntries>>,
  Expect<Equal<ObjectEntries<{ key?: undefined }>, ['key', undefined]>>,
  Expect<Equal<ObjectEntries<{ key: undefined }>, ['key', undefined]>>,
]


// ============= Your Code Here =============
// ! 如何把对象转化为联合类型
// * 对数组，用[number]作为下标
type ArrayUnion = ['1', '2'][number]
// * 对对象，用[keyof]作为下标
type Obj = { name: string, age: number }
type ObjectUnion = Obj[keyof Obj]

// ! Partial
type Partial<T> = { [P in keyof T]?: T[P] | undefined; }

// 需要排除 value 中的 undefined
type RemoveUndefined<T> = [T] extends [undefined] ? T : Exclude<T, undefined>
type ObjectEntries<T> =  {
  [K in keyof T]-?: [K ,RemoveUndefined<T[K]>]
}[keyof T]

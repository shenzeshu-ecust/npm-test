// ============= Test Cases =============
import type { Equal, Expect } from './test-utils'

type cases = [
  Expect<Equal<KebabCase<'FooBarBaz'>, 'foo-bar-baz'>>,
  Expect<Equal<KebabCase<'fooBarBaz'>, 'foo-bar-baz'>>,
  Expect<Equal<KebabCase<'foo-bar'>, 'foo-bar'>>,
  Expect<Equal<KebabCase<'foo_bar'>, 'foo_bar'>>,
  Expect<Equal<KebabCase<'Foo-Bar'>, 'foo--bar'>>,
  Expect<Equal<KebabCase<'ABC'>, 'a-b-c'>>,
  Expect<Equal<KebabCase<'-'>, '-'>>,
  Expect<Equal<KebabCase<''>, ''>>,
  Expect<Equal<KebabCase<'😎'>, '😎'>>,
]


// ============= Your Code Here =============
// ~ 不能用 Lowercase 因为这是全部转化为小写

type KebabCase<S extends string> = S extends `${infer F}${infer R}`
  ? R extends Uncapitalize<R> 
    ? `${Uncapitalize<F>}${KebabCase<R>}`
    : `${Uncapitalize<F>}-${KebabCase<R>}` // 这里不用`${Uncapitalize<F>}-${Uncapitalize<KebabCase<R>>}` 因为下次递归会首字母小写
  : S

  

  type T4 = Uncapitalize<'STRING'>; 
  let a4: T4 =  'sTRING'
  type T3 = Capitalize<'string'>;
  let a3: T3 =  'String'
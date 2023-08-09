// 利用ts的自动推导功能
// 1 实现 ReturnType

type ReturnType1<T> = T extends (...args: any[]) => infer R ? R : T;

type sum = (a: number, b: number) => number;
let sumRes: ReturnType1<sum>;

// 2 推断promise中的类型
type PromiseType<T> = T extends Promise<infer K> ? K : T;
let pr: PromiseType<Promise<string>>;

type PromiseTypeDeep<T> = T extends Promise<infer K> ? PromiseTypeDeep<K> : T;
let prd: PromiseTypeDeep<Promise<Promise<number>>>;

// 3 获取数组每一项的类型
type ArrayType<T> = T extends (infer I)[] ? I : T;

let ar: ArrayType<[string, number]>; // string | number
let ar2: ArrayType<string[]>; // string

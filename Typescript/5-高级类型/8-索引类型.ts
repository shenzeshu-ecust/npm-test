// 使用索引类型，编译器就能够检查使用了动态属性名的代码。
// 例如，一个常见的JavaScript模式是从对象中选取属性的子集。
function pluck1(o, names) {
  return names.map((n) => o[n]);
}
// ! 下面是如何在TypeScript里使用此函数，通过 索引类型查询keyof和 索引访问操作符T[]：
function pluck<T, K extends keyof T>(o: T, names: K[]): T[K][] {
  return names.map((n) => o[n]);
}

interface Person {
  name: string;
  age: number;
}
let person: Person = {
  name: "Jarid",
  age: 35,
};
// 编译器会检查 name是否真的是 Person的一个属性。
let strings: string[] = pluck(person, ["name"]); // ok, string[]

// ! 1 keyof T， 索引类型查询操作符。 对于任何类型 T， keyof T的结果为 T上已知的公共属性名的联合。 例如：
let personProps: keyof Person; // 'name' | 'age'
// keyof Person是完全可以与 'name' | 'age'互相替换的。 不同的是如果你添加了其它的属性到 Person，例如 address: string，
// 那么 keyof Person会自动变为 'name' | 'age' | 'address'。
// ! 2 第二个操作符是 T[K]， 索引访问操作符。
// 在这里，类型语法反映了表达式语法。 这意味着 person['name']具有类型 Person['name'] — 在我们的例子里则为 string类型。
// 然而，就像索引类型查询一样，你可以在普通的上下文里使用 T[K]，这正是它的强大所在。你只要确保类型变量 K extends keyof T就可以了。

// ~ eg 索引类型和字符串索引签名
interface Map1<T> {
  [key: string]: T;
}
let keys: keyof Map1<number>; // string
let value: Map1<number>["foo"]; // number

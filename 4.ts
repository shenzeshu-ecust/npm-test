type Person = {
  name: string;
  age: number;
};
// type PersonKeys = keyof Person; // 'name' | 'age'
// // 例如，我们可以定义一个函数，接收一个对象和一个属性名，返回该对象中该属性名对应的值：
// function getProperty<T, K extends keyof T>(obj: T, key: K) {
//   return obj[key];
// }
// const person: Person = { name: "Alice", age: 30 };
// const name = getProperty(person, "name"); // name: string
// const age = getProperty(person, "age"); // age: number
// const invalidKey = getProperty(person, "invalid"); // TypeScript编译错误：Argument of type 'string' is not assignable to parameter of type '"name" | "age"'

const person: Person = { name: "Alice", age: 30 };
type PersonType = typeof person; // Person
/*
相当于
type PersonType = {
    name: string;
    age: number;
}
*/

type Partialls<T> = {
  [P in keyof T]?: T[P];
};

type Requierdd<T> = {
  [P in keyof T]-?: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Recorddd<K extends keyof any, T> = {
  [P in K]: T;
};

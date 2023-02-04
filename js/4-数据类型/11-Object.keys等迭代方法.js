// Object.keys，values，entries 返回 数组！
/*
对于普通对象，下列这些方法是可用的：

    Object.keys(obj) —— 返回一个包含该对象所有的键的 数组。
    Object.values(obj) —— 返回一个包含该对象所有的值的 数组。
    Object.entries(obj) —— 返回一个包含该对象所有 [key, value] 键值对的 数组。


*/
// ! 与map的map.keys()的区别
/*
 	            Map 	       Object
    调用语法 	 map.keys() 	Object.keys(obj)，而不是 obj.keys()
    返回值 	     可迭代对象 	 “真正的”数组
*/

// ! Object.keys/values/entries 会忽略 symbol 属性
const symbol = Symbol(1);
let user = {
  name: "John",
  age: 30,
  [symbol]: "symbol",
  [1]: 1,
  [2]: 2,
  [1 + 2]: 3, // ! 计算属性: []
};
/*
[
  [ '1', 1 ],
  [ '2', 2 ],
  [ '3', 3 ],
  [ 'name', 'John' ],
  [ 'age', 30 ]
]
*/
// ~ 看见了吗： [1]被转换为1，且遍历后排第一！
console.log(Object.entries(user));
// ! 就像 for..in 循环一样，这些方法会忽略使用 Symbol(...) 作为键的属性。

// ! 通常这很方便。但是，如果我们也想要 Symbol 类型的键，那么这儿有一个单独的方法 Object.getOwnPropertySymbols，它会返回一个只包含 Symbol 类型的 键 的数组。
// ! 另外，还有一种方法 Reflect.ownKeys(obj)，它会返回 所有 键。
const res1 = Object.getOwnPropertySymbols(user);
const res2 = Reflect.ownKeys(user);
console.log(res1); // [ Symbol(1) ]
console.log(res2); // [ '1', '2', '3', 'name', 'age', Symbol(1)

// ! 转换对象（想对 对象 用数组的方法进行处理）
/*
如果我们想应用数组方法，那么我们可以使用 Object.entries，然后使用 Object.fromEntries：

    1 使用 Object.entries(obj) 从 obj 获取由键/值对组成的数组。
    2 对该数组使用数组方法，例如 map，对这些键/值对进行转换。
    3 对结果数组使用 Object.fromEntries(array) 方法，将结果转回成对象。

*/
// 例如，我们有一个带有价格的对象，并想将它们加倍：
let prices = {
  banana: 1,
  orange: 2,
  meat: 4,
};
let pricesEntries = Object.entries(prices);
let pricesEntriesWithDouble = pricesEntries.map((item) => [
  item[0],
  item[1] * 2,
]);
let doublePrices = Object.fromEntries(pricesEntriesWithDouble);
console.log(doublePrices);

let salaries = {
  John: 100,
  Pete: 300,
  Mary: 250,
};

function sumSalaries(salaries) {
  let salaryList = Object.values(salaries);
  if (salaryList.length === 0) return 0;
  let sum = 0;
  for (let salary of salaryList) {
    sum += salary;
  }
  return sum;
}

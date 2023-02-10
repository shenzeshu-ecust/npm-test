/*
使用 obj.__proto__ 设置或读取原型被认为已经过时且不推荐使用（deprecated）了（已经被移至 JavaScript 规范的附录 B，意味着仅适用于浏览器）。

! 1 现代的获取/设置原型的方法有：

   * Object.getPrototypeOf(obj) —— 返回对象 obj 的 [[Prototype]]。
   * Object.setPrototypeOf(obj, proto) —— 将对象 obj 的 [[Prototype]] 设置为 proto。

   ? __proto__ 不被反对的唯一的用法是在创建新对象时，将其用作属性：{ __proto__: ... }。
*/

// ! 2 Object.create(proto, [descriptors])
// 虽然，也有一种特殊的方法：Object.create(proto, [descriptors]) —— 利用给定的 proto 作为 [[Prototype]] 和可选的属性描述来创建一个空对象。
let animal = {
  eats: true,
};

// 创建一个以 animal 为原型的新对象
let rabbit = Object.create(animal, {
  jumps: {
    value: true,
  },
}); // 与 {__proto__: animal} 相同

console.log(rabbit.eats); // true
console.log(rabbit.jumps); //true

console.log(Object.getPrototypeOf(rabbit) === animal); // true

Object.setPrototypeOf(rabbit, {}); // 将 rabbit 的原型修改为 {}

// ! 我们可以使用 Object.create 来实现比复制 for..in 循环中的属性更强大的对象克隆方式：
let obj = {
  name: "szs",
};
// ~ 此调用可以对 obj 进行真正准确地拷贝，包括所有的属性：可枚举和不可枚举的，数据属性和 setters/getters —— 包括所有内容，并带有正确的 [[Prototype]]。
let clone = Object.create(
  Object.getPrototypeOf(obj),
  Object.getOwnPropertyDescriptors(obj)
);
console.log(clone); // { name: 'szs' }

// ! 3 如果速度很重要，就请不要修改已存在的对象的 [[Prototype]]
// 从技术上来讲，我们可以在任何时候 get/set [[Prototype]]。但是通常我们只在创建对象的时候设置它一次，自那之后不再修改：rabbit 继承自 animal，之后不再更改。

// ~ 并且，JavaScript 引擎对此进行了高度优化。用 Object.setPrototypeOf 或 obj.__proto__= “即时”更改原型是一个非常缓慢的操作，因为它破坏了对象属性访问操作的内部优化。
// 因此，除非你知道自己在做什么，或者 JavaScript 的执行速度对你来说完全不重要，否则请避免使用它。

// ! 4 用 __proto__作为键名, 基础类型作为值 --- 会被忽略
let o = {
  name: "sas",
  __proto__: "some value", // ~ __proto__ 属性很特殊：它必须是一个对象或者 null。字符串不能成为原型。这就是为什么将字符串赋值给 __proto__ 会被忽略。
};

console.log(o[__proto__]); // ? undefined!

// ? 我们怎么避免这样的问题呢？

// * 1 我们可以改用 Map 来代替普通对象进行存储，这样一切都迎刃而解：
let map = new Map();
map.set("__proto__", "some value");
console.log(map.get("__proto__")); // some value

// * 2 使用 Object.create(null) 或 {__proto__: null} 创建的无原型的对象。
// 通常，对象会从 Object.prototype 继承内建的方法和 __proto__ getter/setter，会占用相应的键，且可能会导致副作用。原型为 null 时，对象才真正是空的。

// ~  注意：__proto__ 不是对象的属性，也不是[[Prototype]] 本身，它只是访问修改[[Prototype]]的方式
// * Object.create(null) 创建了一个空对象，这个对象没有原型（[[Prototype]] 是 null）
// * 我们可以把这样的对象称为 “very plain” 或 “pure dictionary” 对象，因为它们甚至比通常的普通对象（plain object）{...} 还要简单。

let obj1 = Object.create(null);
// 或者：obj = { __proto__: null }

let key = "__proto__";
obj1[key] = "some value";

console.log(obj1[key]); // "some value"
// ~ 缺点是这样的对象没有任何内建的对象的方法，例如 toString：
console.log(obj1); // 浏览器中会报错

// ~ ……但是它们通常对关联数组而言还是很友好。(也就是不能用  obj.xxx(), 但是可以Object.xxx())
// ，大多数与对象相关的方法都是 Object.something(...)，例如 Object.keys(obj) —— 它们不在 prototype 中，因此在 “very plain” 对象中它们还是可以继续使用：
let chineseDictionary = Object.create(null);
chineseDictionary.hello = "你好";
chineseDictionary.bye = "再见";

console.log(Object.keys(chineseDictionary)); // hello,bye

// TEST
// 1 为 dictionary 添加 toString 方法
// 该方法应该返回以逗号分隔的所有键的列表。你的 toString 方法不应该在使用 for...in 循环遍历数组的时候显现出来。

let dictionary = Object.create(null, {
  toString: {
    // 当我们使用描述器创建一个属性，它的标识默认是 false。
    value() {
      return Object.keys(this).join(",");
    },
  },
});

// 添加一些数据
dictionary.apple = "Apple";
dictionary.__proto__ = "test"; // 这里 __proto__ 是一个常规的属性键

// 在循环中只有 apple 和 __proto__
for (let key in dictionary) {
  console.log(key); // "apple", then "__proto__"
}

// 你的 toString 方法在发挥作用
console.log(dictionary.toString()); // "apple,__proto__"

// 2 调用方式的差异
function Rabbit4(name) {
  this.name = name;
}
Rabbit4.prototype.sayHi = function () {
  console.log(this.name);
};

let rabbit4 = new Rabbit4("Rabbit");

// ? 以下调用做的是相同的事儿还是不同的？

rabbit4.sayHi(); // rabbit
Rabbit4.prototype.sayHi(); // undefined
Object.getPrototypeOf(rabbit4).sayHi(); // undefined
rabbit4.__proto__.sayHi(); // undefined

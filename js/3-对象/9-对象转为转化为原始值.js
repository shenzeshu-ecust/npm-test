/*
对象-原始值转换

    1 只转换为字符串或者数字，没有转换为布尔值。所有的对象在布尔上下文（context）中均为 true，就这么简单。只有字符串和数字转换。
    2 数字转换 —— 发生在对象相减或应用数学函数时。
    3 字符串转换 —— 通常发生在我们像 alert(obj) 这样输出一个对象和类似的上下文中。

我们可以使用特殊的对象方法，自己实现字符串和数字的转换。
*/

// ! JavaScript 是如何决定应用哪种转换的？
// ! 类型转换在各种情况下有三种变体。它们被称为 “hint”，在 规范 所述：

// 1 object - string hint
// 对象到字符串的转换，当我们对期望一个字符串的对象执行操作时，如 “alert”、作为键名：
let obj = { name: "szs" };
// 输出
// alert(obj);
// 将对象作为属性键
// another[obj] = 123;

// 2 object - number hint
// 对象到数字的转换，例如当我们进行数学运算时：
// 显式转换
let num = Number(obj);

// 数学运算（除了二元加法）
let n = +obj; // 一元加法
// let delta = date1 - date2;

// 小于/大于的比较
// let greater = user1 > user2;

// 3 object - default hint
// 在少数情况下发生，当运算符“不确定”期望值的类型时。
// 例如，当二元加法得到对象类型的参数时，它将依据 "default" hint 来对其进行转换：
let obj1 = {
  name: "szs",
};
let obj2 = {
  name: "dlf",
};
let total = obj1 + obj2;
console.log(total); // [object Object][object Object]

// 此外，如果对象被用于与字符串、数字或 symbol 进行 == 比较，这时到底应该进行哪种转换也不是很明确，因此使用 "default" hint。
if (obj == 1) {
  console.log(true);
}

/*
 * 为了进行转换，JavaScript 尝试查找并调用三个对象方法：

    调用 obj[Symbol.toPrimitive](hint) —— 带有 symbol 键 Symbol.toPrimitive（系统 symbol）的方法，如果这个方法存在的话，
    否则，如果 hint 是 "string" —— 尝试调用 obj.toString() 或 obj.valueOf()，无论哪个存在。
    否则，如果 hint 是 "number" 或 "default" —— 尝试调用 obj.valueOf() 或 obj.toString()，无论哪个存在。

 */

// ! 1) Symbol.toPrimitive
// 有一个名为 Symbol.toPrimitive 的内建 symbol，它被用来给转换方法命名，像这样：
obj[Symbol.toPrimitive] = function (hint) {
  // 这里是将此对象转换为原始值的代码
  // 它必须返回一个原始值
  // hint = "string"、"number" 或 "default" 中的一个
};
// ~ 如果 Symbol.toPrimitive 方法存在，则它会被用于所有 hint，无需更多其他方法。

// 例1
let user = {
  name: "John",
  money: 1000,

  [Symbol.toPrimitive](hint) {
    console.log(`hint: ${hint}`);
    return hint == "string" ? `{name: "${this.name}"}` : this.money;
  },
};

// 转换演示：
console.log(user); // hint: string -> {name: "John"}
console.log(+user); // hint: number -> 1000
console.log(user + 500); // hint: default -> 1500

// user[Symbol.toPrimitive] 方法处理了所有的转换情况。

// ~ 如果没有 Symbol.toPrimitive，那么 JavaScript 将尝试寻找 toString 和 valueOf 方法：
// ! 2) toString valueOf

// 对于 "string" hint：调用 toString 方法，如果它不存在，则调用 valueOf 方法（因此，对于字符串转换，优先调用 toString）。
// 对于其他 hint(number/default)：调用 valueOf 方法，如果它不存在，则调用 toString 方法（因此，对于数学运算，优先调用 valueOf 方法）。
// toString 和 valueOf 方法很早己有了。它们提供了一种可选的“老派”的实现转换的方法

/*

这些方法必须返回一个原始值。如果 toString 或 valueOf 返回了一个对象，那么返回值会被忽略（和这里没有方法的时候相同）。

~ 默认情况下，(普通对象)具有 toString 和 valueOf 方法：

   ~ 1  toString 方法返回一个字符串 "[object Object]"。
   ~ 2  valueOf 方法返回对象自身。

*/
let person = { name: "John" };
// alert的话不加toString也可以  默认string转换
console.log(person);
console.log(person.toString()); // [object Object]
console.log(person.valueOf()); // { name: 'John' }{ name: 'John' }
console.log(person.valueOf() === person); // true

// 实现例1 一样的效果
let people = {
  name: "szs",
  age: 16,
  toString() {
    return `my name is ${this.name}`;
  },
  valueOf() {
    return this.age;
  },
};

console.log(people.toString());
console.log(+people); // 16
console.log(people + 500); // 516

// ! 通常我们希望有一个“全能”的地方来处理所有原始转换。在这种情况下，我们可以只实现 toString，就像这样：
let user1 = {
  name: "John",

  toString() {
    return this.name;
  },
};

// alert(user1); // toString -> John
// alert(user1 + 500); // toString -> John500

/*

! 转换可以返回任何原始类型

  关于所有原始转换方法，有一个重要的点需要知道，就是它们不一定会返回 “hint” 的原始值。

  没有限制 toString() 是否返回字符串，或 Symbol.toPrimitive 方法是否为 "number" hint 返回数字。

  ~ 唯一强制性的事情是：这些方法必须返回一个原始值，而不是对象。


    历史原因

      由于历史原因，如果 toString 或 valueOf 返回一个对象，则不会出现 error，但是这种值会被忽略（就像这种方法根本不存在）。这是因为在 JavaScript 语言发展初期，没有很好的 “error” 的概念。
      相反，Symbol.toPrimitive 更严格，它 必须 返回一个原始值，否则就会出现 error。

*/

/*
进一步的转换

我们已经知道，许多运算符和函数执行类型转换，例如乘法 * 将操作数转换为数字。
如果我们将对象作为参数传递，则会出现两个运算阶段：

    对象被转换为原始值（通过前面我们描述的规则）。
    如果还需要进一步计算，则生成的原始值会被进一步转换。

*/
let obj = {
  // toString 在没有其他方法的情况下处理所有转换
  toString() {
    return "2";
  },
};

alert(obj * 2); // 4，对象被转换为原始值字符串 "2"，之后它被乘法转换为数字 2。
alert(obj + 2); // 22（"2" + 2）被转换为原始值字符串 => 级联

// ~ 面试题  实现console.log(a == 1 && a == 2 && a == 3); // true

let a = {
  value: 1,
  valueOf() {
    return this.value++;
  },
};
console.log(a == 1 && a == 2 && a == 3); // true

let b = {
  value: 1,
  [Symbol.toPrimitive](hint) {
    // hint 可以为 string  number| default
    return this.value++;
  },
};
console.log(b == 1 && b == 2 && b == 3); // true

let c = {
  value: 1,
  toString() {
    return this.value++;
  },
};
console.log(c == 1 && c == 2 && c == 3); // true

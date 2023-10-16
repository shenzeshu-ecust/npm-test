/*
根据规范，只有两种原始类型可以用作对象属性键：

    字符串类型
    symbol 类型

否则，如果使用另一种类型，例如数字，它会被自动转换为字符串。
所以 obj[1] 与 obj["1"] 相同， obj[true] 与 obj["true"] 相同。
*/

/*

symbol 有两个主要的使用场景：

    * 1 “隐藏” 对象属性。

    如果我们想要向“属于”另一个脚本或者库的对象添加一个属性，我们可以创建一个 symbol 并使用它作为属性的键。
    symbol 属性不会出现在 for..in 中，因此它不会意外地被与其他属性一起处理。并且，它不会被直接访问，因为另一个脚本没有我们的 symbol。因此，该属性将受到保护，防止被意外使用或重写。

    因此我们可以使用 symbol 属性“秘密地”将一些东西隐藏到我们需要的对象中，但其他地方看不到它。

    * 2 JavaScript 使用了许多系统 symbol，这些 symbol 可以作为 Symbol.* 访问。我们可以使用它们来改变一些内建行为。
    
    例如，在本教程的后面部分，我们将使用 Symbol.iterator 来进行 迭代 操作，使用 Symbol.toPrimitive 来设置 对象原始值的转换 等等。
    使用 Symbol.species 覆盖默认的构造函数

*/

// ! 1 symbol值是唯一的标识符
let id1 = Symbol("id");
let id2 = Symbol("id");
console.log(id1 === id2); // false

// ! 2 symbol 不会被自动转换为字符串
// JavaScript 中的大多数值都支持字符串的隐式转换。
// 例如，我们可以 alert 任何值，都可以生效。symbol 比较特殊，它不会被自动转换。
console.log(id1); // ~ Symbol(id)
// alert(id1); // ~ 类型错误： 无法将symbol值转换为字符串
// 这是一种防止混乱的“语言保护”，因为字符串和 symbol 有本质上的不同，不应该意外地将它们转换成另一个。

// ~ 如果我们真的想显示一个 symbol，我们需要在它上面调用 .toString()，如下所示：
// alert(id1.toString()); // Symbol(id)，现在他有效了

// ! 3 symbol.description 描述
console.log(id1.description); // id

// ! 4 symbol允许我们创建对象的 隐藏 属性，代码的任何其他部分都不能意外访问或重写这些属性。
let user = {
  // 属于另一个代码
  name: "John",
};

let id = Symbol("id");

user[id] = 1;

console.log(user[id]); // ~ 1 , 我们可以使用 symbol 作为键来访问数据

/*
* 使用 Symbol("id") 作为键，比起用字符串 "id" 来有什么好处呢？
    ! 1 不会意外被访问 2 属性不会有冲突 

    ~由于 user 对象属于另一个代码库，所以向它们添加字段是不安全的，因为我们可能会影响代码库中的其他预定义行为。
    ~但 symbol 属性不会被意外访问到。第三方代码不会知道新定义的 symbol，因此将 symbol 添加到 user 对象是安全的。
    另外，假设另一个脚本希望在 user 中有自己的标识符，以实现自己的目的。
    那么，该脚本可以创建自己的 Symbol("id")，像这样：

    let id = Symbol("id");
    user[id] = "Their id value";

~ 我们的标识符和它们的标识符之间不会有冲突，因为 symbol 总是不同的，即使它们有相同的名字。

……但如果我们处于同样的目的，使用字符串 "id" 而不是用 symbol，那么 就会 出现冲突:
let user = { name: "John" };

* 我们的脚本使用了 "id" 属性。
user.id = "Our id value";

* ……另一个脚本也想将 "id" 用于它的目的……
user.id = "Their id value"

* 砰！无意中被另一个脚本重写了 id！
*/

// ! 5 对象中使用symbol作为键
let user1 = {
  name: "John",
  [id]: 123, // 如果是 单纯的id 就是id字符串作为键名
};

// ! 6 symbol在for...in、Object.keys() 循环中被跳过
for (let key in user1) {
  console.log("key is :", key); // key is : name, id键被忽略了
}
console.log(Object.keys(user1)); // [ 'name' ]

/*
 * 从技术上说，symbol 不是 100% 隐藏的。有一个内建方法 Object.getOwnPropertySymbols(obj) 允许我们获取所有的 symbol。
 * 还有一个名为 Reflect.ownKeys(obj) 的方法可以返回一个对象的 所有 键，包括 symbol。

 * 但大多数库、内建方法和语法结构都没有使用这些方法。

 */

// ! 7 Object.assign 会同时复制字符串和 symbol 属性：
let clone = Object.assign({}, user1);
console.log(clone); // { name: 'John', [Symbol(id)]: 123 }

// ! 8 全局symbol - Symbol.for()

// 假如：应用程序的不同部分想要访问的 symbol "id" 指的是完全相同的属性。
// 为了实现这一点，这里有一个 全局 symbol 注册表。
// 我们可以在其中创建 symbol 并在稍后访问它们，它可以确保每次访问相同名字的 symbol 时，返回的都是相同的 symbol。

// ~ 从全局注册表中读取
let nameRaw = Symbol.for("name"); // 如果这个symbol不存在，则创建
// ~ 再次读取（可能是在代码中的另一个位置）
let nameAgain = Symbol.for("name");

// 判断是否是同一个symbol
console.log(nameRaw === nameAgain); // true

// ~ 注册表内的 symbol 被称为 全局 symbol。如果我们想要一个应用程序范围内的 symbol，可以在代码中随处访问 —— 这就是它们的用途。

// ! 9 Symbol.keyFor(sym) 通过 (全局 symbol)返回一个名字

// 对于全局 symbol，Symbol.for(key) 按名字返回一个 symbol

// 通过 name 获取 symbol
let sym = Symbol.for("name");
let sym2 = Symbol.for("id");

// 通过 symbol 获取 name
console.log(Symbol.keyFor(sym)); // name
console.log(Symbol.keyFor(sym2)); // id

// Symbol.keyFor 内部使用 全局 symbol 注册表来查找 symbol 的键。所以它不适用于非全局 symbol。如果 symbol 不是全局的，它将无法找到它并返回 undefined。
let globalSymbol = Symbol.for("name");
let localSymbol = Symbol("name");

console.log(Symbol.keyFor(globalSymbol)); // name，全局 symbol
console.log(Symbol.keyFor(localSymbol)); // undefined，非全局

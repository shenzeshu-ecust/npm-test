// ! 1 创建对象
let user1 = new Object(); // “构造函数” 的语法
let user2 = {
  name: "John",
  "like birds": true, // * 也可以用多字词语来作为属性名，但必须给它们加上引号：
}; // “字面量” 的语法

// ! 2 属性-访问 添加 删除
user1.age = 13;
user1.isAdmin = true;

// ~ 点符号要求 key 是有效的变量标识符。这意味着：不包含空格，不以数字开头，也不包含特殊字符（允许使用 $ 和 _）。
console.log(user2.name);
// ~ 有另一种方法，就是使用方括号，可用于任何字符串：
console.log(user2["like birds"]);

// 我们可以用 delete 操作符移除属性：
delete user1.age;

// ! 3 计算属性
// 当创建一个对象时，我们可以在对象字面量中使用方括号。这叫做 计算属性。
let fruit = "apple";
let bag = {
  [fruit + "Computers"]: 5, // bag.appleComputers = 5
};

// 方括号比点符号更强大。它允许任何属性名和变量，但写起来也更加麻烦。
// 所以，大部分时间里，当属性名是已知且简单的时候，就使用点符号。如果我们需要一些更复杂的内容，那么就用方括号。

// ! 4 对象属性命名没有限制，除了symbol，都会被转为 string 字符串。
// 我们已经知道，变量名不能是编程语言的某个保留字，如 “for”、“let”、“return” 等……
// 但对象的属性名并不受此限制：

// * 这些属性都没问题
let obj = {
  for: 1,
  let: 2,
  return: 3,
};

console.log(obj.for + obj.let + obj.return); // 6

// 例如，当数字 0 被用作对象的属性的键时，会被转换为字符串 "0"：
let obj1 = {
  0: "test", // 等同于 "0": "test"
};

// 都会输出相同的属性（数字 0 被转为字符串 "0"）
console.log(obj1["0"]); // test
console.log(obj1[0]); // test (相同的属性)

// ? 对象一个名为 __proto__ 的属性。我们不能将它设置为一个非对象的值：
let obj2 = {};
obj2.__proto__ = 5; // 分配一个数字
alert(obj2.__proto__); // [object Object] —— 值为对象，与预期结果不同
// ~ 我们从代码中可以看出来，把它赋值为 5 的操作被忽略了。

// ! 5 属性存在测试  in
// ~ 不存在的属性会得到undefined
let user3 = {};
console.log(user3.age === undefined); // true 没有age属性

// ? 为啥还要in ？
// ? ———— 但有一个例外情况，这种比对方式会有问题，但 in 运算符的判断结果仍是对的。
// ? 那就是属性存在，但存储的值是 undefined 的时候：

let obj4 = {
  test: undefined, // 这种情况很少发生，因为通常情况下不应该给对象赋值 undefined。我们通常会用 null 来表示未知的或者空的值。
};
console.log(obj4.test); // ~ undefined 所以属性不存在？其实存在的
console.log("test" in obj4); // ~ true

// * in 的左边必须是 属性名。通常是一个带 引号 "" 的字符串。
// * 如果我们省略引号，就意味着左边是一个变量，它应该包含要判断的实际属性名。例如：
let a = { a: 30 };
let key = "a";
console.log(key in a); // true

// ! TEST 判断空对象
function isEmpty(obj) {
  for (let key in obj) {
    // 如果进到循环里面，说明有属性。
    return false;
  }
  return true;
}

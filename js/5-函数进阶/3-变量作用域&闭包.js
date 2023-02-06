// ! 1 代码块
// 如果在代码块 {...} 内声明了一个变量，那么这个变量只在该代码块内可见。
{
  // ~ 因为 let 声明的变量在代码块外不可见。
  let message = "hello"; // ~  只在此代码块内可见
  console.log(message);
}
// console.log(message); // 报错
{
  // ! var声明的变量代码块外可以访问！
  var a = 1;
  console.log("代码块内部", a);
}
console.log("代码块外部", a); // ! 1 可以访问！
// ~ 对于 if，for 和 while 等，在 {...} 中声明的变量也仅在内部可见

for (let i = 0; i < 3; i++) {
  // 变量 i 仅在这个 for 循环的内部可见
  console.log(i); // 0，然后是 1，然后是 2
}
// ~ 从视觉上看，let i 位于 {...} 之外。但是 for 构造在这里很特殊：在其中声明的变量被视为块的一部分。

// !2 嵌套函数
function makeCounter() {
  let count = 0;
  // ~ 不论在哪里调用，它仍然可以访问相同的外部变量。
  return function () {
    return count++;
  };
}

let counter = makeCounter();

console.log(counter()); // 0
console.log(counter()); // 1
console.log(counter()); // 2

/*
在 JavaScript 中，每个运行的 ①函数，② 代码块 {...} 以及③ 整个脚本，都有一个被称为 词法环境（Lexical Environment） 的内部（隐藏）的关联对象。

~ 【词法环境对象】由两部分组成：

    1 环境记录（Environment Record） —— 一个存储所有局部变量作为其属性（包括一些其他信息，例如 this 的值）的对象。
    2 对 外部词法环境 的引用，与外部代码相关联。

* 一个“变量”只是 环境记录 这个特殊的内部对象的一个属性。“获取或修改变量”意味着“获取或修改词法环境的一个属性”。


一个函数其实也是一个值，就像变量一样。
~ 不同之处在于函数声明的初始化会被立即完成。
~ 当创建了一个词法环境（Lexical Environment）时，函数声明会立即变为即用型函数（不像 let 那样直到声明处才可用）。

这就是为什么我们甚至可以在声明自身之前调用一个以函数声明（Function Declaration）的方式声明的函数。
say() // 调用有效！
function say() {
    console.log('saying...)
}



*/

// 当代码要访问一个变量时 —— 首先会搜索内部词法环境，然后搜索外部环境，然后搜索更外部的环境，以此类推，直到全局词法环境。
// 如果在任何地方都找不到这个变量，那么在严格模式下就会报错（在非严格模式下，为了向下兼容，给未定义的变量赋值会创建一个全局变量）。
let phone = 110;
function getPhase(name) {
  // ~ 所有函数都有名为 [[Environment]] 的隐藏属性，该属性保存了 对 创建该函数的词法环境 的引用。
  console.log(`${name} is calling ${phone}`);
}
getPhase("szs");
// ! 3 闭包
/*

~ 闭包 是指可以记住其外部变量并可以访问这些变量 de 函数。
在某些编程语言中，这是不可能的，或者应该以一种特殊的方式编写函数来实现。
~ 但如上所述，在 JavaScript 中，所有函数都是天生闭包的（只有一个例外，将在 "new Function" 语法 中讲到）。

* 也就是说：JavaScript 中的函数会自动通过隐藏的 [[Environment]] 属性记住创建它们的位置，所以它们都可以访问外部变量。

在面试时，前端开发者通常会被问到“什么是闭包？”，正确的回答应该是闭包的定义，并解释清楚为什么 JavaScript 中的所有函数都是闭包的，以及可能的关于 [[Environment]] 属性和词法环境原理的技术细节。
*/

// ! 5 词法环境的垃圾收集

// 通常，函数调用完成后，会将词法环境和其中的所有变量从内存中删除。因为现在没有任何对它们的引用了。与 JavaScript 中的任何其他对象一样，词法环境仅在可达时才会被保留在内存中。

// 但是，如果有一个嵌套的函数在函数结束后仍可达，则它将具有引用词法环境的 [[Environment]] 属性。
function f() {
  let value = 123;

  return function () {
    console.log(value);
  };
}

let g = f(); // g.[[Environment]] 存储了对相应 f() 调用的词法环境的引用
// ~ 现在， 内存被清理了
g = null;

// ! 6  实际开发中的引擎优化
// 正如我们所看到的，理论上当函数可达时，它外部的所有变量也都将存在。

// ~ 但在实际中，JavaScript 引擎会试图优化它。它们会分析变量的使用情况，如果从代码中可以明显看出有未使用的外部变量，那么就会将其删除。

// ~ 在 V8（Chrome，Edge，Opera）中的一个重要的副作用是，此类变量在调试中将不可用。
function f() {
  let value = Math.random();

  function g() {
    debugger; // 在 Console 中：输入 console.log(value); No such variable!
  }

  return g;
}

let gg = f();
gg();

// TEST
// 1 函数最新值？
let name = "John";

function sayHi() {
  console.log("Hi, " + name);
}

name = "Pete";

sayHi(); // 会显示什么："John" 还是 "Pete"？
// 答案： Hi, Pete （函数将从内到外依次在对应的词法环境中寻找目标变量，它使用最新的值。）

// 2 if的输出值
let phrase = "Hello";

if (true) {
  let user = "John";

  function sayHi() {
    console.log(`${phrase}, ${user}`);
  }
}

sayHi(); // error!
// ~ 函数 sayHi 是在 if 内声明的，所以它只存在于 if 中。外部是没有 sayHi 的。

// 3 闭包sum
// 编写一个像 sum(a)(b) = a+b 这样工作的 sum 函数。

function sum(a) {
  return function (b) {
    return a + b;
  };
}
console.log(sum(1)(2));

// 4 变量可见吗
let x = 1;

function func() {
  // 引擎从函数开始就知道局部变量 x，
  // 但是变量 x 一直处于“未初始化”（无法使用）的状态，直到结束 let（“死区”）
  // 因此答案是 error
  console.log(x); // ReferenceError: Cannot access 'x' before initialization
  let x = 2;
}

func();

/*
从程序执行进入代码块（或函数）的那一刻起，变量就开始进入“未初始化”状态。它一直保持未初始化状态，直至程序执行到相应的 let 语句。

换句话说，一个变量从技术的角度来讲是存在的，但是在 let 之前还不能使用。
[死区]
*/

// 5 按字段排序
let users = [
  { name: "John", age: 20, surname: "Johnson" },
  { name: "Pete", age: 18, surname: "Peterson" },
  { name: "Ann", age: 19, surname: "Hathaway" },
];
function byField(fieldName) {
  return function (a, b) {
    return a[fieldName] > b[fieldName] ? 1 : -1;
  };
}
console.log(users.sort(byField("name")));

// 6 为什么输出一样？
function makeArmy() {
  let shooters = [];

  let i = 0;
  while (i < 10) {
    let shooter = function () {
      // ~ 那么，为什么所有此类函数都显示的是相同的值，10 呢？
      // ~ 这是因为 shooter 函数内没有局部变量 i。当一个这样的函数被调用时，i 是来自于外部词法环境的。
      // 创建一个 shooter 函数，
      console.log(i); // 应该显示其编号
    };
    shooters.push(shooter); // 将此 shooter 函数添加到数组中
    i++;
  }

  // ……返回 shooters 数组
  //   ~ i的词法环境和shooters一样
  return shooters;
}

let army = makeArmy();

// ……所有的 shooter 显示的都是 10，而不是它们的编号 0, 1, 2, 3...
army[0](); // 编号为 0 的 shooter 显示的是 10
army[1](); // 编号为 1 的 shooter 显示的是 10
army[2](); // 10，其他的也是这样。
// ~ 我们可以看到，所有的 shooter 函数都是在 makeArmy() 的词法环境中被创建的。但当 army[5]() 被调用时，makeArmy 已经运行完了，最后 i 的值为 10（while 循环在 i=10 时停止）。

// 如果我们一开始使用 for 循环，也可以避免这样的问题，像这样：

function makeArmy() {
  let shooters = [];

  for (let i = 0; i < 10; i++) {
    let shooter = function () {
      // shooter 函数
      console.log(i); // 应该显示它自己的编号
    };
    shooters.push(shooter);
  }

  return shooters;
}

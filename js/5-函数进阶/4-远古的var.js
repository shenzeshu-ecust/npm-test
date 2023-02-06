// ! 1 “var” 没有 块级作用域
// ~ 用 var 声明的变量，不是函数作用域就是全局作用域。
// ~ 它们在代码块外也是可见的（译注：也就是说，var 声明的变量只有函数作用域和全局作用域，没有块级作用域）
if (true) {
  var test = true; // 使用 "var" 而不是 "let"
  //   let test = true; // ~ 如果使用 "let" 块级作用域有效！
}

console.log(test); // true，变量在 if 结束后仍存在
// 对于循环也是！
for (var i = 0; i < 10; i++) {
  var one = 1;
  // ...
}

console.log(i); // 10，"i" 在循环结束后仍可见，它是一个全局变量
console.log(one); // 1，"one" 在循环结束后仍可见，它是一个全局变量

// ~ 可以看到，var 穿透了 if，for 和其它代码块。这是因为在早期的 JavaScript 中，块没有词法环境，而 var 就是这个时期的代表之一。

// !  2 var 允许重新声明
var name = "szs";
var name = "dlf"; // 这个var会被忽略，等于 name = 'dlf' 也就是重新赋值

// ! 3 变量提升：“var” 声明的变量，可以在其声明语句前被使用
// 当函数开始的时候，就会处理 var 声明（脚本启动对应全局变量）。

// 换言之，var 声明的变量会在函数开头被定义，与它在代码中定义的位置无关（这里不考虑定义在嵌套函数中的情况）。
function sayHi() {
  phrase = "Hello";

  console.log(phrase);

  var phrase;
}
sayHi(); // Hello

// ……甚至与这种情况也一样（记住，代码块是会被忽略的）：

function sayHi1() {
  phrase = "Hello"; // (*)

  if (false) {
    var phrase; // ~ var忽略代码块，只有函数作用域和全局作用域
  }

  console.log(phrase);
}
sayHi1();
// ~ 人们将这种行为称为“提升”（英文为 “hoisting” 或 “raising”），因为所有的 var 都被“提升”到了函数的顶部

// ! 声明会被提升，但是赋值不会。
function sayHi2() {
  console.log(phrase);

  var phrase = "Hello";
}

sayHi2(); // undefined

/*

var phrase = "Hello" 这行代码包含两个行为：

    使用 var 声明变量
    使用 = 给变量赋值。

    声明在函数刚开始执行的时候（“提升”）就被处理了，但是赋值操作始终是在它出现的地方才起作用。所以这段代码实际上是这样工作的：

function sayHi() {
  var phrase; // 在函数刚开始时进行变量声明

  console.log(phrase); // undefined

  phrase = "Hello"; // ……赋值 — 当程序执行到这一行时。
}

sayHi();
*/

// ! 4 “立即调用函数表达式”（immediately-invoked function expressions，IIFE）。
// 在之前，JavaScript 中只有 var 这一种声明变量的方式，并且这种方式声明的变量没有块级作用域，程序员们就发明了一种模仿块级作用域的方法。
// 如今，我们不应该再使用 IIFE 了，但是你可以在旧脚本中找到它们。
(function () {
  var message = "Hello";

  console.log(message); // Hello
})();
console.log("out:", message); // ~ 报错！  因为立即执行函数有自己的作用域
// ~ 这里，创建了一个函数表达式并立即调用。因此，代码立即执行并拥有了自己的私有变量。
// 函数表达式被括号 (function {...}) 包裹起来，因为当 JavaScript 引擎在主代码中遇到 "function" 时，它会把它当成一个函数声明的开始。但函数声明必须有一个函数名

// 除了使用括号，还有其他方式可以告诉 JavaScript 在这我们指的是函数表达式：
(function () {
  console.log("Parentheses around the function");
})();
/*
会被自动格式化
(function () {
  console.log("Parentheses around the whole thing");
}());

!function() {
  alert("Bitwise NOT operator starts the expression");
}();

+function() {
  alert("Unary plus starts the expression");
}();
*/

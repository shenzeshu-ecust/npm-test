// ! 1 eval语法
// let res = eval(code) 内建函数 eval 允许执行一个代码字符串。
eval("console.log(2)");
// 代码字符串可能会比较长，包含换行符、函数声明和变量等。
// ! 2 eval 的结果是最后一条语句的结果。
let val = eval("let i = 0; ++i");
console.log(val); // 1

// ! 3 eval 内的代码在当前词法环境（lexical environment）中执行，因此它能访问外部变量：
let a = 1;
function f() {
  let a = 2;
  eval("console.log(a)");
}
f(); // 2

// ~ 也可以更改外部变量
eval("a = 100");
console.log(a); // ~ 100 值被更改了

// ! 4 严格模式下，eval 有属于自己的词法环境。因此我们不能从外部访问在 eval 中声明的函数和变量：
("use strict");
eval("let x = 5; function t() {}");
console.log(typeof x); // undefined

// ! 5 eval 是魔鬼

/*

现代编程中，已经很少使用 eval 了。人们经常说“eval 是魔鬼”。
原因很简单：很久很久以前，JavaScript 是一种非常弱的语言，很多东西只能通过 eval 来完成。不过那已经是十年前的事了。
如今几乎找不到使用 eval 的理由了。如果有人在使用它，那这是一个很好的使用现代语言结构或 JavaScript Module 来替换它们的机会。

~ 请注意，eval 访问外部变量的能力会产生副作用。
    代码压缩工具（在把 JS 投入生产环境前对其进行压缩的工具）将局部变量重命名为更短的变量（例如 a 和 b 等），以使代码体积更小。
        这通常是安全的，但在使用了 eval 的情况下就不一样了，因为局部变量可能会被 eval 中的代码访问到。因此压缩工具不会对所有可能会被从 eval 中访问的变量进行重命名。这样会导致代码压缩率降低。
    在 eval 中使用外部局部变量也被认为是一个坏的编程习惯，因为这会使代码维护变得更加困难。

*/

// ? 两种方法可以解决此类问题
// * 1）如果 eval 中的代码没有使用外部变量，请以 window.eval(...) 的形式调用 eval：
// ~ 通过这种方式，该代码便会在全局作用域内执行：
let y = 1;
{
  let y = 5;
  window.eval("alert(y)"); // ~ 1 (全局变量)
}
// * 2) 如果 eval 中的代码需要访问局部变量，我们可以使用 new Function 替代 eval，并将它们作为参数传递：

let f = new Function("a", "alert(a)");

f(5); // 5
// ~ 如果我们使用 new Function 创建一个函数，那么该函数的 [[Environment]] 并不指向当前的词法环境，而是指向全局环境。
// ~ 因此，此类函数无法访问外部（outer）变量，只能访问全局变量。
function getFunc() {
  let value = "test";

  let func = new Function("console.log(value)");

  return func;
}

getFunc()(); // error: value is not defined

// 但是可以借助new Function(argsStr, funcStr)中的变量参数作为局部变量

// TEST
// Eval-计算器
let expr = prompt("Type an arithmetic expression?", "2*3+2");

alert(eval(expr));

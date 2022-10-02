// 1 函数声明
function add(a, b) {
  return a + b;
}
// 2 函数表达式

// 由于函数创建发生在赋值表达式的上下文中（在 = 的右侧），因此这是一个 函数表达式。
let sayHi = function () {
  console.log("Hello");
};
// ! 函数是一个值
console.log(add); // [Function: add]
// 浏览器中，上面代码显示了一段字符串值，即函数的源码。

// ~ 我们可以复制函数到其他变量：
let func = add;
func();
add();

// ! 函数声明和函数表达式区别
/*
~ 函数表达式是在代码执行到达时被创建，并且仅从那一刻起可用。

一旦代码执行到赋值表达式 let sum = function… 的右侧，此时就会开始创建该函数，并且可以从现在开始使用（分配，调用等）。

函数声明则不同。

~ 在函数声明被定义之前，它就可以被调用。

* 例如，一个全局函数声明对整个脚本来说都是可见的，无论它被写在这个脚本的哪个位置。

这是内部算法的原故。当 JavaScript 准备 运行脚本时，首先会在脚本中寻找全局函数声明，并创建这些函数。我们可以将其视为“初始化阶段”。

在处理完所有函数声明后，代码才被执行。所以运行时能够使用这些函数。
*/
// sayHello("John"); // error!

// let sayHello = function (name) {
//   // (*) no magic any more
//   console.log(`Hello, ${name}`);
// };

// ! 严格模式下，当一个函数声明在一个代码块内时，它在该代码块内的任何位置都是可见的。但在代码块外不可见。
let age = 16;
if (age < 16) {
  welcome();
  function welcome() {
    console.log("Hello");
  }
  welcome();
} else {
  function greeting() {
    console.log("hi");
  }
  greeting();
}
welcome(); // ! Error: welcome is not defined
// 这是因为函数声明只在它所在的代码块中可见。

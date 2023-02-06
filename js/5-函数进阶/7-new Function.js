// 还有一种创建函数的方法。它很少被使用，但有些时候只能选择它。
// ! 1 let func = new Function ([arg1, arg2, ...argN], functionBody);
let sum = new Function("a", "b", "return a + b");

console.log(sum(1, 2)); // 3

// 没参数
let sayHi = new Function('console.log("Hello")');

sayHi(); // Hello
// 由于历史原因，参数也可以按逗号分隔符的形式给出。
// 以下三种声明的含义相同：

new Function("a", "b", "return a + b"); // 基础语法
new Function("a,b", "return a + b"); // 逗号分隔
new Function("a , b", "return a + b"); // 逗号和空格分隔
// ~ 实际上是通过运行时通过参数传递过来的 字符串 创建的。
// 以前的所有声明方法都需要我们 —— 程序员，在脚本中编写函数的代码。

// 但是 new Function 允许我们将任意字符串变为函数。
// ~ 例如，我们可以从服务器接收一个新的函数并执行它：
let str = `... 动态地接收来自服务器的代码 ...`;

let func = new Function(str);
func();

// ! 使用 new Function 创建函数的应用场景非常特殊，比如在复杂的 Web 应用程序中，我们需要从服务器获取代码或者动态地从模板编译函数时才会使用。

// ! 2 闭包
// 通常，闭包是指使用一个特殊的属性 [[Environment]] 来记录函数自身的创建时的环境的函数。它具体指向了函数创建时的词法环境。
// 普通函数天生是闭包的
// ~ 但是如果我们使用 new Function 创建一个函数，那么该函数的 [[Environment]] 并不指向当前的词法环境，而是指向全局环境。
// ~ 因此，此类函数无法访问外部（outer）变量，只能访问全局变量。

function getFunc() {
  let value = "test";

  let func = new Function("console.log(value)");

  return func;
}

getFunc()(); // error: value is not defined

/*
new Function 的这种特性看起来有点奇怪，不过在实际中却非常实用。

~ 想象一下我们必须通过一个字符串来创建一个函数。在编写脚本时我们不会知道该函数的代码（这也就是为什么我们不用常规方法创建函数），但在执行过程中会知道了。我们可能会从服务器或其他来源获取它。

~ 我们的新函数需要和主脚本进行交互。
* 不过这样是好事，这有助于降低我们代码出错的可能。并且，从代码架构上讲，显式地使用参数传值是一种更好的方法，并且避免了与使用压缩程序而产生冲突的问题。
*/

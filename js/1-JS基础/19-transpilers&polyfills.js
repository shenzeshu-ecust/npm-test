/*
    作为程序员，我们希望使用最新的特性。好东西越多越好！

    另一方面，如何让我们现代的代码在还不支持最新特性的旧引擎上工作？

    有两个工作可以做到这一点：

        转译器（Transpilers）。
        垫片（Polyfills）。

*/
// ! 1 转译器 是一种可以将源码转译成另一种源码的特殊的软件。
// ! 它可以解析（“阅读和理解”）现代代码，并使用旧的语法结构对其进行重写，进而使其也可以在旧的引擎中工作。

// * 例如 ES2020之前没有空值合并运算符 ??
// * 转译器会分析我们的代码，

let resultNew = height ?? 100;

// * 将 height ?? 100 重写为

let resultOld = height !== undefined && height !== null ? height : 100;

/*
    现在，重写了的代码适用于更旧版本的 JavaScript 引擎。
    通常，开发者会在自己的计算机上运行转译器，然后将转译后的代码部署到服务器。

    说到名字，Babel 是最著名的转译器之一。
    现代项目构建系统，例如 webpack，提供了在每次代码更改时自动运行转译器的方法，因此很容易将代码转译集成到开发过程中。
*/

// ! 2 更新/添加新函数的脚本被称为“polyfill”。它“填补”了空白并添加了缺失的实现。

/*
    新的语言特性可能不仅包括语法结构和运算符，还可能包括内建函数。

    例如，Math.trunc(n) 是一个“截断”数字小数部分的函数，例如 Math.trunc(1.23) 返回 1。
    在一些（非常过时的）JavaScript 引擎中没有 Math.trunc 函数，所以这样的代码会执行失败。

    * 由于我们谈论的是新函数，而不是语法更改，因此无需在此处转译任何内容。我们只需要声明缺失的函数。
*/

// 如果没有这个函数
if (!Math.trunc) {
  // 实现它
  Math.trunc = function (number) {
    // Math.ceil 和 Math.floor 甚至存在于上古年代的 JavaScript 引擎中
    return number < 0 ? Math.ceil(number) : Math.floor(number);
  };
}

/*
    两个有趣的 polyfill 库：

        core js 支持了很多特性，允许只包含需要的特性。
        polyfill.io 提供带有 polyfill 的脚本的服务，具体取决于特性和用户的浏览器。
 
*/

/*
    全局对象提供可在任何地方使用的变量和函数。默认情况下，这些全局变量内建于语言或环境中。

    ~ 在浏览器中，它的名字是 “window”，对 Node.js 而言，它的名字是 “global”，其它环境可能用的是别的名字。

    ! 1 最近，globalThis 被作为全局对象的标准名称加入到了 JavaScript 中，所有环境都应该支持该名称。所有主流浏览器都支持它。
*/
console.log(globalThis);
console.log(global);
// ! 2 在浏览器中，使用 var（而不是 let/const！）声明的全局函数和变量会成为全局对象的属性。
// ! 函数声明（特指在主代码流中具有 function 关键字的语句，而不是函数表达式）也有这样的效果。
// var gVar = 5
// console.log(window.gVar) // 5
/*
如果一个值非常重要，以至于你想使它在全局范围内可用，那么可以直接将其作为属性写入：

 将当前用户信息全局化，以允许所有脚本访问它
window.currentUser = {
  name: "John"
};

 代码中的另一个位置
alert(currentUser.name);  // John

或者，如果我们有一个名为 "currentUser" 的局部变量
从 window 显式地获取它（这是安全的！）
alert(window.currentUser.name); // John
*/

// ~ 仅当值对于我们的项目而言确实是全局的时候，才应将其存储在全局对象中。并保持其数量最少。
// ~ 在浏览器中，除非我们使用 modules，否则使用 var 声明的全局函数和变量会成为全局对象的属性。
// ~ 为了使我们的代码面向未来并更易于理解，我们应该使用直接的方式访问全局对象的属性，如 window.x。

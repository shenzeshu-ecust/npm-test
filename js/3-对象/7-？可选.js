// ! 可选链 ?.  是一个最近添加到 JavaScript 的特性。 旧式浏览器可能需要 polyfills.
// ~  ?. 前的变量必须已声明（例如 let/const/var user 或作为一个函数参数）。可选链仅适用于已声明的变量。
let user = {};
console.log(user.name); // undefined
// ! 如果 ?. 左边部分不存在，就会立即停止运算（“短路效应”）。
console.log(user?.address?.street); // undefined

/*

我们可以使用 ?. 来安全地读取或删除，但不能写入

可选链 ?. 不能用在赋值语句的左侧。

例如：
*/
let user1 = null;

user1?.name = "John"; // Error，不起作用
// 因为它在计算的是：undefined = "John"

/*
可选链 ?. 语法有三种形式：

    obj?.prop —— 如果 obj 存在则返回 obj.prop，否则返回 undefined。
    obj?.[prop] —— 如果 obj 存在则返回 obj[prop]，否则返回 undefined。
    obj.method?.() —— 如果 obj.method 存在则调用 obj.method()，否则返回 undefined。

正如我们所看到的，这些语法形式用起来都很简单直接。?. 检查左边部分是否为 null/undefined，如果不是则继续运算。

?. 链使我们能够安全地访问嵌套属性。

但是，我们应该谨慎地使用 ?.，根据我们的代码逻辑，仅在当左侧部分不存在也可接受的情况下使用为宜。以保证在代码中有编程上的错误出现时，也不会对我们隐藏。
*/

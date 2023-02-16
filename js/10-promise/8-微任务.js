// ! promise 的处理程序 .then、.catch 和 .finally 都是异步的。

// ~ 即便一个 promise 立即被 resolve，.then、.catch 和 .finally 下面 的代码也会在这些处理程序之前被执行。
let promise = Promise.resolve();
promise.then(() => {
  console.log(1);
});
console.log(2); //  先打印2，后打印1

// ! 微任务队列（Microtask queue）
/*
    异步任务需要适当的管理。为此，ECMA 标准规定了一个内部队列 PromiseJobs，通常被称为“微任务队列（microtask queue）”（V8 术语）。

    如 规范 中所述：

        队列（queue）是先进先出的：首先进入队列的任务会首先运行。
        只有在 JavaScript 引擎中没有其它任务在运行时，才开始执行任务队列中的任务。

    或者，简单地说，当一个 promise 准备就绪时，它的 .then/catch/finally 处理程序就会被放入队列中：但是它们不会立即被执行。当 JavaScript 引擎执行完当前的代码，它会从队列中获取任务并执行它。

    这就是为什么在上面那个示例中 “2” 会先显示。
    promise 的处理程序总是会经过这个内部队列。
    如果有一个包含多个 .then/catch/finally 的链，那么它们中的每一个都是异步执行的。也就是说，它会首先进入队列，然后在当前代码执行完成并且先前排队的处理程序都完成时才会被执行。
*/

// 如果想要让2在1之后执行怎么办
Promise.resolve()
  .then(() => console.log(1))
  .then(() => console.log(2));
// ! 未处理的rejection

let promise1 = Promise.reject(new Error("Promise Failed!"));
setTimeout(() => promise1.catch((err) => alert("caught")), 1000);

// Error: Promise Failed!
window.addEventListener("unhandledrejection", (event) => alert(event.reason));

// ~ 现在，如果我们运行上面这段代码，我们会先看到 Promise Failed!，然后才是 caught。

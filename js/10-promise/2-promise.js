// ! 1 Promise 生产者
/*
由 new Promise 构造器返回的 promise 对象具有以下内部属性(我们无法直接访问它们)：

    ~ state —— 最初是 "pending"，然后在 resolve 被调用时变为 "fulfilled"，或者在 reject 被调用时变为 "rejected"。
    ~ result —— 最初是 undefined，然后在 resolve(value) 被调用时变为 value，或者在 reject(error) 被调用时变为 error。

    executor 最终将 promise 移至以下状态之一：
    1 state: fulfilled; result: value
    2 state: rejected;  result: error
~ 与最初的 “pending” promise 相反，一个 resolved 或 rejected 的 promise 都会被称为 “settled”。
*/

// ! 只能有一个结果或一个 error
// ~ executor 只能调用一个 resolve 或一个 reject。任何状态的更改都是最终的。
// ~ 所有其他的再对 resolve 和 reject 的调用都会被忽略：
let promise = new Promise(function (resolve, reject) {
  resolve("done");

  reject(new Error("…")); // 被忽略
  setTimeout(() => resolve("…")); // 被忽略
});
// ~ 这的宗旨是，一个被 executor 完成的工作只能有一个结果或一个 error。
// ~ 并且，resolve/reject 只需要一个参数（或不包含任何参数），并且将忽略额外的参数。

// ! 建议使用Error对象（或者继承自Error）进行reject

// ! resolve/reject 可以立即进行
// executor 通常是异步执行某些操作，并在一段时间后调用 resolve/reject，但这不是必须的。
let promise1 = new Promise(function (resolve, reject) {
  // executor
  // 不花时间去做这项工作
  resolve(123); // 立即给出结果：123
}).then((val) => {
  // ~ 只对成功结果感兴趣
  console.log(val);
});

// ! 2 then catch 消费者
let promise2 = new Promise(function (resolve, reject) {
  //   setTimeout(() => resolve("done!"), 1000);
  setTimeout(() => reject(new Error("Whoops!")), 1000);
});

// resolve 运行 .then 中的第一个函数
promise2.then(
  (result) => console.log(result), // 1 秒后显示 "done!"
  (error) => console.log(error) // 不运行
);

// ~ 如果只对error感兴趣，可以用null 作为第一个参数：.then(null, errorHandlingFunction)。或者我们也可以使用 .catch(errorHandlingFunction)，其实是一样的：
let promise3 = new Promise((resolve, reject) => {
  setTimeout(() => reject(new Error("Whoops!")), 1000);
});

// .catch(f) 与 promise.then(null, f) 一样
promise3.catch(console.log); // 1 秒后显示 "Error: Whoops!"

// ~ .catch(f) 调用是 .then(null, f) 的完全的模拟，它只是一个简写形式。

// ! 3 finally 清理
// finally 的功能是设置一个处理程序在前面的操作完成后，执行清理/终结。
// ~ 例如，停止加载指示器，关闭不再需要的连接等。

/* 做一些需要时间的事，之后调用可能会 resolve 也可能会 reject */
// ~ 在 promise 为 settled 时运行，无论成功与否
// ~ 1）finally 处理程序 没有得到 前一个处理程序的结果（它没有参数）
// ~ 2）finally 处理程序将结果或 error “传递”给下一个合适的处理程序
new Promise((resolve, reject) => {
  setTimeout(() => resolve("value"), 2000);
})
  .finally(() => console.log("Promise ready")) // 先触发
  .then((result) => console.log(result)); // <-- .then 显示 "value"
//

// ~ 3）finally 处理程序也不应该返回任何内容。如果它返回了，返回的值会默认被忽略。

// ~ 此规则的唯一例外是当 finally 处理程序抛出 error 时。此时这个 error（而不是任何之前的结果）会被转到下一个处理程序。
new Promise((resolve, reject) => {
  setTimeout(() => resolve("1"), 2000);
})
  .then((result) => console.log(result)) // 先触发
  .finally(() => console.log("2")); //

// TEST
// 1 猜输出
let promise5 = new Promise(function (resolve, reject) {
  // ~ 第二个对 resolve 的调用会被忽略，因为只有第一次对 reject/resolve 的调用才会被处理。进一步的调用都会被忽略。
  resolve(1);

  setTimeout(() => resolve(2), 1000); //~  会被忽略！
});

promise5.then(console.log); // 1

// 2 基于 promise 的延时
function delay(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
    // setTimeout(resolve, ms)
  });
}
delay(3000).then(() => console.log("runs after 3 seconds"));

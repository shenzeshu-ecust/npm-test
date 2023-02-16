// 在 Promise 类中，有 6 种静态方法。我们在这里简单介绍下它们的使用场景。

// 1 Promise.all
// 假设我们希望并行执行多个 promise，并等待所有 promise 都准备就绪。
// 例如，并行下载几个 URL，并等到所有内容都下载完毕后再对它们进行处理。
// let p = Promise.all(iterator);
// Promise.all 接受一个可迭代对象（通常是一个数组项为 promise 的数组），并返回一个新的 promise。
// ~ 当所有给定的 promise 都 resolve 时，新的 promise 才会 resolve，并且其结果数组将成为新 promise 的结果。

Promise.all([
  new Promise((resolve) => setTimeout(() => resolve(1), 3000)), // 1
  new Promise((resolve) => setTimeout(() => resolve(2), 2000)), // 2
  new Promise((resolve) => setTimeout(() => resolve(3), 1000)), // 3
]).then(console.log); // [1,2,3] 当上面这些 promise 准备好时：每个 promise 都贡献了数组中的一个元素
// * 结果数组中元素的顺序与其在源 promise 中的顺序相同。即使第一个 promise 花费了最长的时间才 resolve，但它仍是结果数组中的第一个。

// ~ 如果任意一个 promise 被 reject，由 Promise.all 返回的 promise 就会立即 reject，并且带有的就是这个 error。
Promise.all([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Whoops!")), 2000)
  ),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000)),
]).catch(console.log); // Error: Whoops!

/*
~ 如果出现 error，其他 promise 将被忽略
~ 如果其中一个 promise 被 reject，Promise.all 就会立即被 reject，完全忽略列表中其他的 promise。它们的结果也被忽略。
~ 例如，像上面那个例子，如果有多个同时进行的 fetch 调用，其中一个失败，其他的 fetch 操作仍然会继续执行，但是 Promise.all 将不会再关心（watch）它们。它们可能会 settle，但是它们的结果将被忽略。
~ Promise.all 没有采取任何措施来取消它们，因为 promise 中没有“取消”的概念。
*/

// ~ Promise.all(iterable) 允许在 iterable 中使用非 promise 的“常规”值
// 通常，Promise.all(...) 接受含有 promise 项的可迭代对象（大多数情况下是数组）作为参数。但是，如果这些对象中的任何一个不是 promise，那么它将被“按原样”传递给结果数组。
Promise.all([
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), 1000);
  }),
  2,
  3,
]).then(console.log); // [1, 2, 3]

// 2 Promise.allSettled
// 这是一个最近添加到 JavaScript 的特性。 旧式浏览器可能需要 polyfills.
// ~ Promise.allSettled 等待所有的 promise 都被 settle(fulfilled和rejected都是settle状态)，无论结果如何

// ! Promise.allSettled的结果数组中的元素如下：
// ! {status:"fulfilled", value:result} 对于成功的响应，
// ! {status:"rejected", reason:error} 对于 error。

let urls = [
  "https://api.github.com/users/iliakan",
  "https://api.github.com/users/remy",
  "https://no-such-url",
];

Promise.allSettled(urls.map((url) => fetch(url))).then((results) => {
  // (*)
  console.log(results);
});
/*
[
  {
    status: 'fulfilled',
    value: Response {
      [Symbol(realm)]: null,
      [Symbol(state)]: [Object],
      [Symbol(headers)]: [HeadersList]
    }
  },
  {
    status: 'fulfilled',
    value: Response {
      [Symbol(realm)]: null,
      [Symbol(state)]: [Object],
      [Symbol(headers)]: [HeadersList]
    }
  },
  {
    status: 'rejected',
    reason: TypeError: fetch failed
        at Object.processResponse (node:internal/deps/undici/undici:6323:34)
        at node:internal/deps/undici/undici:6648:42
        at node:internal/process/task_queues:140:7
        at AsyncResource.runInAsyncScope (node:async_hooks:203:9)
        at AsyncResource.runMicrotask (node:internal/process/task_queues:137:8)
        at processTicksAndRejections (node:internal/process/task_queues:95:5)
        at runNextTicks (node:internal/process/task_queues:64:3)
        at process.processImmediate (node:internal/timers:442:9) {
      cause: [ConnectTimeoutError]
    }
  }
]
*/
Promise.allSettled(urls.map((url) => fetch(url))).then((results) => {
  // (*)
  results.forEach((result, num) => {
    if (result.status == "fulfilled") {
      console.log(`${urls[num]}: ${result.value.status}`);
    }
    if (result.status == "rejected") {
      console.log(`${urls[num]}: ${result.reason}`);
    }
  });
});
/*
https://api.github.com/users/iliakan: 200
https://api.github.com/users/remy: 200
https://no-such-url: TypeError: fetch failed
* 所以，对于每个 promise，我们都得到了其状态（status）和 value/reason。
 */

// ! 如果浏览器不支持 Promise.allSettled，很容易进行 polyfill：
if (!Promise.allSettled) {
  const rejectHandler = (reason) => ({ status: "rejected", reason });

  const resolveHandler = (value) => ({ status: "fulfilled", value });

  Promise.allSettled = function (promises) {
    const convertedPromises = promises.map((p) =>
      Promise.resolve(p).then(resolveHandler, rejectHandler)
    );
    return Promise.all(convertedPromises);
  };
}
/*
在这段代码中，promises.map 获取输入值，并通过 p => Promise.resolve(p) 将输入值转换为 promise（以防传递了非 promise 值），然后向每一个 promise 都添加 .then 处理程序。

这个处理程序将成功的结果 value 转换为 {status:'fulfilled', value}，将 error reason 转换为 {status:'rejected', reason}。这正是 Promise.allSettled 的格式。

然后我们就可以使用 Promise.allSettled 来获取 所有 给定的 promise 的结果，即使其中一些被 reject。
*/

// 3 Promise.race
// ~ 与 Promise.all 类似，但只等待第一个 settled 的 promise 并获取其结果（或 error）。
Promise.race([
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 1000)),
  new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Whoops!")), 2000)
  ),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000)),
]).then(console.log); // 1
// 这里第一个 promise 最快，所以它变成了结果。第一个 settled 的 promise “赢得了比赛”之后，所有进一步的 result/error 都会被忽略。

// 4 Promise.any
// 与 Promise.race 类似，区别在于 Promise.any 只等待第一个 fulfilled 的 promise，并将这个 fulfilled 的 promise 返回。
// 如果给出的 promise 都 rejected，那么返回的 promise 会带有 AggregateError —— 一个特殊的 error 对象，在其 errors 属性中存储着所有 promise error。
Promise.any([
  new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Whoops!")), 1000)
  ),
  new Promise((resolve, reject) => setTimeout(() => resolve(1), 2000)),
  new Promise((resolve, reject) => setTimeout(() => resolve(3), 3000)),
]).then(console.log); // 1
// 这里的第一个 promise 是最快的，但 rejected 了，所以第二个 promise 则成为了结果。在第一个 fulfilled 的 promise “赢得比赛”后，所有进一步的结果都将被忽略。

// 这是一个所有 promise 都失败的例子：

Promise.any([
  new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Ouch!")), 1000)
  ),
  new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Error!")), 2000)
  ),
]).catch((error) => {
  console.log(error.constructor.name); // AggregateError
  console.log(error.errors[0]); // Error: Ouch!
  console.log(error.errors[1]); // Error: Error!
});

Promise.any([
  new Promise((resolve, reject) =>
    setTimeout(() => reject(new Error("Ouch!")), 1000)
  ),
]).then(null, (error) => {
  console.log(error.constructor.name); // AggregateError
  console.log(error.errors[0]); // Error: Ouch!
});

// 5 Promise.resolve/reject
// ~ 在现代的代码中，很少需要使用 Promise.resolve 和 Promise.reject 方法，因为 async/await 语法（我们会在 稍后 讲到）使它们变得有些过时了。
// 完整起见，以及考虑到那些出于某些原因而无法使用 async/await 的人，我们在这里对它们进行介绍。

// 1） Promise.resolve
// Promise.resolve(value) 用结果 value 创建一个 resolved 的 promise。
// 如同 let promise = new Promise(resolve => resolve(value))

// 当一个函数被期望返回一个 promise 时，这个方法用于兼容性。
// （译注：这里的兼容性是指，我们直接从缓存中获取了当前操作的结果 value，但是期望返回的是一个 promise，所以可以使用 Promise.resolve(value) 将 value “封装”进 promise，以满足期望返回一个 promise 的这个需求。）

// 例如，下面的 loadCached 函数获取（fetch）一个 URL 并记住其内容。以便将来对使用相同 URL 的调用，它能立即从缓存中获取先前的内容，但使用 Promise.resolve 创建了一个该内容的 promise，所以返回的值始终是一个 promise。
let cache = new Map();

function loadCached(url) {
  if (cache.has(url)) return Promise.resolve(cache.get(url));
  return fetch(url)
    .then((res) => res.text())
    .then((text) => {
      cache.set(url, text);
      return text;
    });
}
// 我们可以使用 loadCached(url).then(…)，因为该函数保证了会返回一个 promise。我们就可以放心地在 loadCached 后面使用 .then。这就是 (*) 行中 Promise.resolve 的目的。

// 2) Promise.reject(error)
// Promise.reject(error) 用 error 创建一个 rejected 的 promise。
// 如同：let promise = new Promise((resolve, reject) => reject(error))
// 实际上，这个方法几乎从未被使用过

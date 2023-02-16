// ! 1 promise 链在错误（error）处理中十分强大。当一个 promise 被 reject 时，控制权将移交至最近的 rejection 处理程序。这在实际开发中非常方便。
fetch("https://no-such-server.blabla") // reject
  .then((response) => response.json())
  .catch((err) => console.log(err)); // TypeError: Failed to fetch（这里的文字可能有所不同）
// ~ 捕获所有 error 的最简单的方法是，将 .catch 附加到链的末尾

// * 隐式try...catch
// promise 的执行者（executor）和 promise 的处理程序（then）周围有一个“隐式的 try..catch”。如果发生异常，它就会被捕获，并被视为 rejection 进行处理。
new Promise((resolve, reject) => {
  reject(new Error("Whoops!"));
}).catch(console.log); // Error: Whoops!

new Promise((resolve, reject) => {
  resolve("ok");
})
  .then((result) => {
    throw new Error("Whoops!"); // reject 这个 promise
  })
  .catch(console.log); // Error: Whoops!

// ! 2 rethrowing
// 在常规的 try..catch 中，我们可以分析 error，如果我们无法处理它，可以将其再次抛出。对于 promise 来说，这也是可以的。

// ~ 如果我们在 .catch 中 throw，那么控制权就会被移交到下一个最近的 error 处理程序。
// ~ 如果我们处理该 error 并正常完成，那么它将继续到最近的成功的 .then 处理程序。

// 在下面这个例子中，.catch 成功处理了 error：
// 执行流：catch -> then
new Promise((resolve, reject) => {
  throw new Error("Whoops!");
})
  .catch(function (error) {
    console.log("The error is handled, continue normally");
  })
  .then(() => console.log("Next successful handler runs"));
// ~ 这里 .catch 块正常完成。所以下一个成功的 .then 处理程序就会被调用。

// 执行流：catch -> catch
new Promise((resolve, reject) => {
  throw new Error("Whoops!");
})
  .catch(function (error) {
    // (*)

    if (error instanceof URIError) {
      // 处理它
    } else {
      console.log("Can't handle such error");

      throw error; // 再次抛出此 error 或另外一个 error，执行将跳转至下一个 catch
    }
  })
  .then(function () {
    /* 不在这里运行 */
  })
  .catch((error) => {
    // (**)

    console.log(`The unknown error has occurred: ${error}`);
    // 不会返回任何内容 => 执行正常进行
  });
// ~ (*) 行的处理程序捕获了 error，但无法处理它（例如，它只知道如何处理 URIError），所以它将其再次抛出：
// ~ 执行从第一个 .catch (*) 沿着链跳转至下一个 (**)。

// ! 3 未处理的rejection
// ? 如果没有catch捕获错误，会发生什么？
new Promise(function () {
  noSuchFunction(); // 这里出现 error（没有这个函数）
}).then(() => {
  // 一个或多个成功的 promise 处理程序
}); // 尾端没有 .catch！

// ~ 和try...catch一样，脚本死了，并在控制台中留下了一个信息。对于在 promise 中未被处理的 rejection，也会发生类似的事。
// ~ JavaScript 引擎会跟踪此类 rejection，在这种情况下会生成一个全局的 error。如果你运行上面这个代码，你可以在控制台中看到。

// * 在浏览器中，我们可以使用 unhandledrejection 事件来捕获这类 error：

window.addEventListener("unhandledrejection", function (event) {
  // 这个事件对象有两个特殊的属性：
  console.log(event.promise); // [object Promise] —— 生成该全局 error 的 promise
  console.log(event.reason); // Error: Whoops! —— 未处理的 error 对象
});

new Promise(function () {
  throw new Error("Whoops!");
}); // 没有用来处理 error 的 catch

// 这个事件是 HTML 标准 的一部分。
/*
    如果出现了一个 error，并且在这没有 .catch，那么 unhandledrejection 处理程序就会被触发，并获取具有 error 相关信息的 event 对象，所以我们就能做一些后续处理了。
    通常此类 error 是无法恢复的，所以我们最好的解决方案是将问题告知用户，并且可以将事件报告给服务器。
*/

// TEST
// 1 输出什么
new Promise((resolve, reject) => {
  unde();
})
  .then()
  .catch(() => {
    console.log(1);
  })
  .catch(() => {
    console.log(2);
  });
// * 只输出1
// ~ 第一个catch执行后 不会继续catch

new Promise((resolve, reject) => {
  unde();
})
  .then()
  .catch(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  });
// * 1 2
// ~成功catch到错误后，继续执行

// ~ 2 setTimeout中的错误
// ? 你怎么看？.catch 会被触发么？解释你的答案。
new Promise(function (resolve, reject) {
  setTimeout(() => {
    throw new Error("Whoops!");
  }, 1000);
}).catch(alert);

// * 不，它不会被触发
// ~ 函数代码周围有个“隐式的 try..catch”。所以，所有同步错误都会得到处理。
// ~ 但是这里的错误并不是在 executor 运行时生成的，而是在稍后生成的。因此，promise 无法处理它。

// ? 如何修改
new Promise(function (resolve, reject) {
  setTimeout(() => {
    try {
      // ...other code
      // then throw
      throw new Error("Whoops!");
    } catch (error) {
      console.log(error.name);
    }
  }, 1000);
}).catch(console.log);

// Promisification它指将一个接受回调的函数转换为一个返回 promise 的函数。
// 由于许多函数和库都是基于回调的，因此，在实际开发中经常会需要进行这种转换。因为使用 promise 更加方便，所以将基于回调的函数和库 promise 化是有意义的。

// 原使用回调函数的例子
function loadScript(src, callback) {
  let script = document.createElement("script");
  script.src = src;

  script.onload = () => callback(null, script);
  script.onerror = () => callback(new Error(`Script load error for ${src}`));

  document.head.append(script);
}

// 用法：
// loadScript('path/script.js', (err, script) => {...})

// * 现在，让我们将其 promise 化吧。
function loadScriptPromise(src) {
  return new Promise((resolve, reject) => {
    loadScript(src, (error, script) => {
      if (error) {
        reject(error);
      } else {
        resolve(script);
      }
    });
  });
}
// 用法
// loadScriptPromise('path/script.js').then(...)

// ! 在实际开发中，我们可能需要 promise 化很多函数，所以使用一个 helper（辅助函数）很有意义。
// ! 我们将其称为 promisify(f)：它接受一个需要被 promise 化的函数 f，并返回一个包装（wrapper）函数。
// promisify(f, true) 来获取结果数组
function promisify(f, manyArgs = false) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      function callback(err, ...results) {
        // 我们自定义的 f 的回调
        if (err) {
          reject(err);
        } else {
          // 如果 manyArgs 被指定，则使用所有回调的结果 resolve
          resolve(manyArgs ? results : results[0]);
        }
      }

      args.push(callback);

      f.call(this, ...args);
    });
  };
}

// 用法：
f = promisify(f, true);
//   f(...).then(arrayOfResults => ..., err => ...);

/*
请记住，一个 promise 可能只有一个结果，但从技术上讲，一个回调可能被调用很多次。

因此，promisification 仅适用于调用一次回调的函数。进一步的调用将被忽略。
*/

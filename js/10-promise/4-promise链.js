// promise链
new Promise(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000); // (*)
})
  .then(function (result) {
    // (**)
    console.log(result); // 1
    return result * 2;
  })
  .then(function (result) {
    // (***)
    console.log(result); // 2
    return result * 2;
  })
  .then(function (result) {
    console.log(result); // 4
    return result * 2;
  });

// ~ 返回promise（返回 promise 使我们能够构建异步行为链。）
// .then(handler) 中所使用的处理程序（handler）可以创建并返回一个 promise。
// 在这种情况下，其他的处理程序将等待它 settled 后再获得其结果。

new Promise(function (resolve, reject) {
  setTimeout(() => resolve(1), 1000);
})
  .then(function (result) {
    console.log(result); // 1
    return new Promise((resolve, reject) => {
      // (*)
      setTimeout(() => resolve(result * 2), 1000);
    });
  })
  .then(function (result) {
    // (**)
    console.log(result); // 2
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(result * 2), 1000);
    });
  })
  .then(function (result) {
    console.log(result); // 4
  });
// * 现在在每次 console.log 调用之间会有 1 秒钟的延迟。

// ! fetch
/*
let promise = fetch(url);

执行这条语句，向 url 发出网络请求并返回一个 promise。当远程服务器返回 header（是在 全部响应加载完成前）时，该 promise 使用一个 response 对象来进行 resolve。

为了读取完整的响应，我们应该调用 response.text() 方法：当全部文字内容从远程服务器下载完成后，它会返回一个 promise，该 promise 以刚刚下载完成的这个文本作为 result 进行 resolve。
*/
fetch("/article/promise-chaining/user.json")
  // 当远程服务器响应时，下面的 .then 开始执行
  .then(function (response) {
    // 当 user.json 加载完成时，response.text() 会返回一个新的 promise
    // 该 promise 以加载的 user.json 为 result 进行 resolve
    return response.text();
  })
  .then(function (text) {
    // ……这是远程文件的内容
    console.log(text); // {"name": "iliakan", "isAdmin": true}
  });

// ~ 从 fetch 返回的 response 对象还包含 response.json() 方法，该方法可以读取远程数据并将其解析为 JSON。
// 同上，但使用 response.json() 将远程内容解析为 JSON
fetch("/article/promise-chaining/user.json")
  .then((response) => response.json())
  .then((user) => console.log(user.name)); // iliakan，获取到了用户名

fetch("/article/promise-chaining/user.json")
  .then((response) => response.json())
  .then((user) => fetch(`https://api.github.com/users/${user.name}`))
  .then((response) => response.json())
  .then(
    (githubUser) =>
      new Promise(function (resolve, reject) {
        // (*)
        let img = document.createElement("img");
        img.src = githubUser.avatar_url;
        img.className = "promise-avatar-example";
        document.body.append(img);

        setTimeout(() => {
          img.remove();
          resolve(githubUser); // (**)
        }, 3000);
      })
  )
  // 3 秒后触发
  .then((githubUser) => console.log(`Finished showing ${githubUser.name}`));
// ~ 第 (*) 行的 .then 处理程序现在返回一个 new Promise，只有在 setTimeout 中的 resolve(githubUser) (**) 被调用后才会变为 settled。链中的下一个 .then 将一直等待这一时刻的到来。

// ! 作为一个好的做法，异步行为应该始终返回一个 promise。这样就可以使得之后我们计划后续的行为成为可能。即使我们现在不打算对链进行扩展，但我们之后可能会需要。

// TEST
// 1 Promise：then 对比 catch
// 这两个代码片段是否相等？换句话说，对于任何处理程序（handler），它们在任何情况下的行为都相同吗？
promise.then(f1).catch(f2); // * 1
promise.then(f1, f2); // * 2

// ? 不，它们不相等：
// ~ 1 中的f1 中出现error，那么catch会处理，但在2中则不会
// ~ 这是因为 error 是沿着链传递的，而在第二段代码中，f1 下面没有链。
// ~ f2只能主动触发reject 但也不能错误捕捉

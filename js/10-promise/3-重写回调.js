// 原函数
function loadScript(src, callback) {
  let script = document.createElement("script");
  script.src = src;

  script.onload = () => callback(null, script);
  script.onerror = () => callback(new Error(`Script load error for ${src}`));

  document.head.append(script);
}

// * 用promise重写
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    let script = document.createElement("script");
    script.src = src;

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));

    document.head.append(script);
  });
}

let promise = loadScript(
  "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.js"
);

promise.then(
  (script) => console.log(`${script.src} is loaded!`),
  (error) => console.log(`Error: ${error.message}`)
);

promise.then((script) => console.log("Another handler..."));
/*
我们立刻就能发现 promise 相较于基于回调的模式的一些好处：
promise 	                                                                      callback
1 promise 允许我们按照自然顺序进行编码。首先，我们运行 loadScript 和 .then 来处理结果。   	1 在调用 loadScript(script, callback) 时，我们必须有一个 callback 函数可供使用。换句话说，在调用 loadScript 之前，我们必须知道如何处理结果。

2 我们可以根据需要，在 promise 上多次调用 .then。                                       2 只能有一个回调。
每次调用，我们都会在“订阅列表”中添加一个新的“粉丝”，一个新的订阅函数。
在下一章将对此内容进行详细介绍：Promise 链。 	

因此，promise 为我们提供了更好的代码流和灵活性。
*/

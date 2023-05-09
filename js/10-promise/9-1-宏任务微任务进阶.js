/*
    JavaScript 单线程执行的，所以对于一些耗时的任务，我们可以将其丢入任务队列当中，这样一来，也就不会阻碍其他同步代码的执行。
    等到异步任务完成之后，再去进行相关逻辑的操作。

    js 在主线程中执行的顺序：宏任务 -> 宏任务 -> 宏任务 ...
    在每一个宏任务中又可以产生微任务，当微任务全部执行结束后执行下一个宏任务。 【宏任务 [微任务]】 -> 【宏任务 [微任务]】-> 【宏任务 [微任务]】...
 */

/*
    
    宏任务

    生成方法：
        用户交互：用户在页面上进行交互操作（例如点击、滚动、输入等），会触发浏览器产生宏任务来响应用户操作。
        网络请求：当浏览器发起网络请求（例如通过 Ajax、Fetch、WebSocket 等方式）时，会产生宏任务来处理请求和响应。
        定时器：通过 JavaScript 宿主环境提供的定时器函数（例如 setTimeout、setInterval）可以设置一定的时间后产生宏任务执行对应的回调函数。
        DOM 变化：当 DOM 元素发生变化时（例如节点的添加、删除、属性的修改等），会产生宏任务来更新页面。
        跨窗口通信：在浏览器中，跨窗口通信（例如通过 postMessage 实现）会产生宏任务来处理通信消息。
        JavaScript 脚本执行事件；比如页面引入的 script 就是一个宏任务。
*/
const t1 = new Date();
setTimeout(() => {
  const t3 = new Date();
  console.log("setTimeout block");
  console.log("t3 - t1 =", t3 - t1); // 203  一般是200ms左右。
}, 100); // 这里100 如果换成大于200的时间，那么上面就会输出定时器设置的延迟时间
// 因为 计时一开始就执行了  但是执行里面的函数 会在主程序函数执行完毕之后才会执行

let t2 = new Date();

while (t2 - t1 < 200) {
  t2 = new Date();
}
console.log("t2 - t1:", t2 - t1); // 200
console.log("end here");

/*
微任务

生成方法：
    Promise：Promise 是一种异步编程的解决方案，它可以将异步操作封装成一个 Promise 对象，通过 then 方法注册回调函数，当 promise 变为 resolve 或者 reject 会将回调函数加入微任务队列中。
    MutationObserver：MutationObserver 是一种可以观察 DOM 变化的 API，通过监听 DOM 变化事件并注册回调函数，将回调函数加入微任务队列中。
    process.nextTick：process.nextTick 是 Node.js 中的一个 API，它可以将一个回调函数加入微任务队列中。
*/

const r = new Promise(function (resolve, reject) {
  console.log("1");
  resolve();
});
r.then(() => console.log("2"));
console.log("3");

// 3 1 2
// ! new Promise 接受一个函数，返回一个 Promise 对象。值得注意的一点是传给 Promise 的那个函数会直接执行。所以会先输出 1 。
// ! Promise 对象拥有一个 then 方法来注册回调函数，当 promise resolve 或者 reject 后会将注册函数加到微任务队列。

async function method() {
  new Promise((resolve) => resolve()).then(() => console.log(1));
  const n = await method2(); // ? 这句相当于 new Promise(resolve => resolve(method2())).then((n) => console.log(n)
  console.log(n);
}
// ~ async 修饰的函数，相当于给当前函数包了一层 Promise。
// ~ 执行到 await，先执行 await 右边的东西，执行完后后会暂停在 await 这里，并且把后边的内容丢到 then 中
// ~ await 还有一个特性，它会把后边执行的代码整个注册为回调函数，相当于放到了 .then 里边，如果 Promise 直接 resolve，相当于将后边的代码放到了微任务队列中。

function method2() {
  const promise = new Promise((resolve) => resolve(2));
  return promise;
}

function main() {
  method();
  console.log(3);
}

main(); // 3 1 2

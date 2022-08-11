// setImmediate的执行时机
// ! 总结： Node.js的Event Loop跟浏览器的Event Loop不一样，他是分阶段的
// ! setImmediate和setTimeout(fn, 0)哪个回调先执行，需要看他们本身在哪个阶段注册的，如果在定时器回调或者I/O回调里面，setImmediate肯定先执行。如果在最外层或者setImmediate回调里面，哪个先执行取决于当时机器状况。

/*
    ~ Node的Event Loop是分阶段的:
    ? timers:               执行setTimeout和setInterval的回调                                                             <-------
    ? pending callbacks:    执行延迟到下一个循环迭代的 I/O 回调                                                                      |  
    ? idle, prepare:        仅系统内部使用                                                                                    (if 定时器到期)   
    ? poll:                 检索新的 I/O 事件;执行与 I/O 相关的回调。事实上除了其他几个阶段处理的事情，其他几乎所有的异步都在这个阶段处理。      |
    ? check:                setImmediate在这里执行                                                                        --------
    ? close callbacks:      一些关闭的回调函数，如：socket.on('close', ...)
    ! 需要注意的是poll阶段，他后面并不一定每次都是check阶段，poll队列执行完后，如果没有setImmediate但是有定时器到期，他会绕回去执行定时器阶段：
*/

// ! 上面的这个流程说简单点就是
// ~ 1 在一个异步流程里，setImmediate会比定时器先执行
console.log('outer');

setTimeout(() => {
  setTimeout(() => {
    console.log('setTimeout');
  }, 0);
  setImmediate(() => {
    console.log('setImmediate');
  });
}, 0);
/**
    outer
    setImmediate
    setTimeout
 */
// ~ 2 在外层流程里： 不一定谁先输出，都有可能（本地试的时候还是setImmediate先输出）
console.log('outer');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

setImmediate(() => {
  console.log('setImmediate');
});
// 结果： 不一定！
// ! 原因:node.js里面setTimeout(fn, 0)会被强制改为setTimeout(fn, 1) 1ms 
// ! 通过上述流程的梳理，我们发现关键就在这个1毫秒，如果【同步代码执行时间较长】，进入Event Loop的时候1毫秒已经过了，setTimeout执行，如果1毫秒还没到，就先执行了setImmediate。每次我们运行脚本时，机器状态可能不一样，导致运行时有1毫秒的差距，一会儿setTimeout先执行，一会儿setImmediate先执行。但是这种情况只会发生在还没进入timers阶段的时候。
// ! 像我们第一个例子那样，因为已经在timers阶段，所以里面的setTimeout只能等下个循环了，所以setImmediate肯定先执行。同理的还有其他poll阶段的API也是这样的，比如：
var fs = require('fs')

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('setTimeout');
    }, 0);
    setImmediate(() => {
        console.log('setImmediate');
    });
});
// ! 类似的，我们再来看一段代码，如果他们两个不是在最外层，而是在 setImmediate 的回调里面，其实情况跟外层一样，结果也是随缘的，看下面代码:

console.log('outer');

setImmediate(() => {
  setTimeout(() => {
    console.log('setTimeout');
  }, 0);
  setImmediate(() => {
    console.log('setImmediate');
  });
});
// ! 原因跟写在最外层差不多，因为setImmediate已经在check阶段了，里面的循环会从timers阶段开始，会先看setTimeout的回调，如果这时候已经过了1毫秒，就执行他，如果没过就执行setImmediate。
// HTML 5里面setTimeout最小的时间限制是4ms

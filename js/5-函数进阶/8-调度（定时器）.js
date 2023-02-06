/*
有时我们并不想立即执行一个函数，而是等待特定一段时间之后再执行。这就是所谓的“计划调用（scheduling a call）”。

目前有两种方式可以实现：

    setTimeout 允许我们将函数推迟到一段时间间隔之后再执行。
    setInterval 允许我们重复运行一个函数，从一段时间间隔之后开始运行，之后以该时间间隔连续重复运行该函数。

* 这两个方法并不在 JavaScript 的规范中。但是大多数运行环境都有内建的调度程序，并且提供了这些方法。目前来讲，所有浏览器以及 Node.js 都支持这两个方法。
*/

// ! 1 setTimeout
// 语法：
// let timerId = setTimeout(func|code, [delay], [arg1], [arg2], ...)

/*
参数说明：

func|code
    ~ 想要执行的函数或代码字符串。 一般传入的都是函数。由于某些历史原因，支持传入代码字符串，但是不建议这样做。
delay
    执行前的延时，以毫秒为单位（1000 毫秒 = 1 秒），默认值是 0；
arg1，arg2…
    ~ 要传入被执行函数（或代码字符串）的参数列表（IE9 以下不支持） 
*/

// ~ 1) 带参数的情况
function sayHi(phrase, who) {
  console.log(phrase + ",", who);
}
setTimeout(sayHi, 1000, "Hello", "John"); // Hello, John

/*
~ 错的！
setTimeout(sayHi(), 1000);

因为 setTimeout 期望得到一个对函数的引用。
而这里的 sayHi() 很明显是在执行函数，所以实际上传入 setTimeout 的是 函数的执行结果。
在这个例子中，sayHi() 的执行结果是 undefined（也就是说函数没有返回任何结果），所以实际上什么也没有调度。

*/

// ~ 2) 如果第一个参数位传入的是字符串，JavaScript 会自动为其创建一个函数。
// node中直接报错，说第一个参数必须是函数 而不是字符串
// setTimeout("console.log('Hello')", 1000);
// * 但是，不建议使用字符串，我们可以使用箭头函数代替它们，如下所示
setTimeout(() => console.log("hi"), 1000);

// ~ 3) 取消定时器
// setTimeout 在调用时会返回一个“定时器标识符（timer identifier）”，
let timerId = setTimeout(() => console.log("never happens"), 1000);
console.log(timerId); // 定时器标识符

clearTimeout(timerId);
console.log(timerId); // ~ 还是这个标识符（并没有因为调度被取消了而变成 null）
// ~ 在浏览器中，定时器标识符是一个数字。在其他环境中，可能是其他的东西。例如 Node.js 返回的是一个定时器对象，这个对象包含一系列方法。

// ! 2 setInterval
/*
下面的例子将每间隔 2 秒就会输出一条消息。5 秒之后，输出停止：

/ 每 2 秒重复一次
let timerId = setInterval(() => alert('tick'), 2000);

/ 5 秒之后停止
setTimeout(() => { clearInterval(timerId); alert('stop'); }, 5000);

~ alert 弹窗显示的时候 计时器依然在进行计时

* 在大多数浏览器中，包括 Chrome 和 Firefox，在显示 alert/confirm/prompt 弹窗时，内部的定时器仍旧会继续“嘀嗒”。

所以，在运行上面的代码时，如果在一定时间内没有关掉 alert 弹窗，那么在你关闭弹窗后，下一个 alert 会立即显示。两次 alert 之间的时间间隔将小于 2 秒。

*/

// ! 3 嵌套setTimeout
// 周期性调度有两种方式。
// 一种是使用 setInterval，另外一种就是嵌套的 setTimeout，就像这样：
let t = setTimeout(function tick() {
  console.log("tick");
  t = setTimeout(tick, 2000); // (*)
}, 2000);
clearTimeout(t);
// ~ 1) 嵌套的 setTimeout 要比 setInterval 灵活得多。采用这种方式可以根据当前执行结果来调度下一次调用，因此下一次调用可以与当前这一次不同。
// 例如，我们要实现一个服务（server），每间隔 5 秒向服务器发送一个数据请求，但如果服务器过载了，那么就要降低请求频率，比如将间隔增加到 10、20、40 秒等。
/*
let delay = 5000;

let timerId = setTimeout(function request() {
  ...发送请求...

  if (request failed due to server overload) {
    / 下一次执行的间隔是当前的 2 倍
    delay *= 2;
  }

  timerId = setTimeout(request, delay);

}, delay);
*/
// ~ 并且，如果我们调度的函数占用大量的 CPU，那么我们可以测量执行所需要花费的时间，并安排下次调用是应该提前还是推迟。

// ~ 2) 嵌套的 setTimeout 相较于 setInterval 能够更精确地设置两次执行之间的延时。
// ~嵌套的 setTimeout 就能确保延时的固定;这是因为下一次调用是在前一次调用完成时再调度的。
/*

let i = 1;
setInterval(function() {
  func(i++);
}, 100);

    使用 setInterval 时，func 函数的实际调用间隔要比代码中设定的时间间隔要短！
    这也是正常的，因为 func 的执行所花费的时间“消耗”了一部分间隔时间。

    也可能出现这种情况，就是 func 的执行所花费的时间比我们预期的时间更长，并且超出了 100 毫秒。
    在这种情况下，JavaScript 引擎会等待 func 执行完成，然后检查调度程序，如果时间到了，则 立即 再次执行它。
    极端情况下，如果函数每次执行时间都超过 delay 设置的时间，那么每次调用之间将完全没有停顿。
*/

// ! 4 垃圾回收和 setInterval/setTimeout 回调（callback）

// ~ 当一个函数传入 setInterval/setTimeout 时，将为其创建一个内部引用，并保存在调度程序中。这样，即使这个函数没有其他引用，也能防止垃圾回收器（GC）将其回收。

// 在调度程序调用这个函数之前，这个函数将一直存在于内存中
setTimeout(function () {}, 100);

// 对于 setInterval，传入的函数也是一直存在于内存中，直到 clearInterval 被调用。

// ~ 这里还要提到一个副作用。如果函数引用了外部变量（译注：闭包），那么只要这个函数还存在，外部变量也会随之存在。它们可能比函数本身占用更多的内存。因此，当我们不再需要调度函数时，最好取消它，即使这是个（占用内存）很小的函数。

// ! 5 零延时的 setTimeout
// setTimeout(func, 0)，或者仅仅是 setTimeout(func)。
// ~ 这样调度可以让 func 尽快执行。但是只有在当前正在执行的脚本执行完成后，调度程序才会调用它。

setTimeout(() => console.log(1));
console.log(2); // 2 --> 1

// ! 零延时实际上不为零（在浏览器中）
// ~ 在浏览器环境下，嵌套定时器的运行频率是受限制的。根据 HTML5 标准 所讲：“经过 5 重嵌套定时器之后，时间间隔被强制设定为至少 4 毫秒”。(前四次0ms调用，后续4ms+)
// ~ 如果我们使用 setInterval 而不是 setTimeout，也会发生类似的情况：setInterval(f) 会以零延时运行几次 f，然后以[ 4 毫秒以上 ]的强制延时运行。
// 对于服务端的 JavaScript，就没有这个限制，并且还有其他调度即时异步任务的方式。例如 Node.js 的 setImmediate。
let start = Date.now();
let times = [];

setTimeout(function run() {
  times.push(Date.now() - start); // 保存前一个调用的延时

  if (start + 100 < Date.now())
    console.log(times); // 100 毫秒之后，显示延时信息
  else setTimeout(run); // 否则重新调度
});

// 浏览器中输出示例：（node中不一样）
// [0, 0, 0, 0, 5, 10, 15, 19, 24, 29, 34, 39, 44, 48, 53, 58, 62, 67, 71, 76, 81, 86, 91, 96, 101]

/*
~ 请注意，所有的调度方法都不能 保证 确切的延时。

例如，浏览器内的计时器可能由于许多原因而变慢：

    CPU 过载。
    浏览器页签处于后台模式。
    笔记本电脑用的是省电模式。

所有这些因素，可能会将定时器的最小计时器分辨率（最小延迟）增加到 300ms 甚至 1000ms，具体以浏览器及其设置为准。
*/

// TEST
// 1 每秒输出一次
// 编写一个函数 printNumbers(from, to)，使其每秒输出一个数字，数字从 from 开始，到 to 结束。
function printNumbers(from, to) {
  let timerId = setInterval(() => {
    if (from > to) {
      clearInterval(timerId);
      return;
    }
    console.log(from++);
  }, 1000);
}
// printNumbers(1, 5);

function printNumbers2(from, to) {
  let timerId = setTimeout(function fn() {
    if (from > to) {
      clearTimeout(timerId);
      return;
    }
    console.log(from++);
    timerId = setTimeout(fn, 1000);
  }, 1000);
}
printNumbers2(1, 4);
// ~ 请注意，在这两种解决方案中，在第一个输出之前都有一个初始延迟。函数在 1000ms 之后才被第一次调用。
// 如果我们还希望函数立即运行，那么我们可以在单独的一行上添加一个额外的调用，像这样：
function printNumbers(from, to) {
  let current = from;

  function go() {
    alert(current++);
    if (current == to) {
      clearInterval(timerId);
    }
  }
  // ~ 先调用下
  go();
  let timerId = setInterval(go, 1000);
}

printNumbers(5, 10);

// 2 setTimeout 会显示什么？
let i = 0;

setTimeout(() => alert(i), 100); // ?

// 假设这段代码的运行时间 >100ms
for (let j = 0; j < 100000000; j++) {
  i++;
}
// * 所以 i 的取值为：100000000。
// * 任何 setTimeout 都只会在当前代码执行完毕之后才会执行。

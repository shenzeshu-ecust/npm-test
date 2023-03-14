/*
 柯里化（Currying）是一种关于函数的高阶技术。它不仅被用于 JavaScript，还被用于其他编程语言。

    ! 柯里化是一种函数的转换，它是指将一个函数从可调用的 f(a, b, c) 转换为可调用的 f(a)(b)(c)。
    柯里化不会调用函数。它只是对函数进行转换。

    ~ JavaScript 实现通常都保持该函数可以被正常调用，并且如果参数数量不足，则返回部分应用函数。

    ~ 柯里化让我们能够更容易地获取部分应用函数。就像我们在日志记录示例中看到的那样，
    ~ 普通函数 log(date, importance, message) 在被柯里化之后，当我们调用它的时候传入一个参数（如 log(date)）或两个参数（log(date, importance)）时，它会返回部分应用函数。
 */

// 1 例子
function curry(f) {
  // curry(f) 执行柯里化转换
  return function (a) {
    return function (b) {
      return f(a, b);
    };
  };
}

// 用法
function sum(a, b) {
  return a + b;
}

let curriedSum = curry(sum);

console.log(curriedSum(1)(2)); // 3
/**
 * 正如你所看到的，实现非常简单：只有两个包装器（wrapper）。

    curry(func) 的结果就是一个包装器 function(a)。
    当它被像 curriedSum(1) 这样调用时，它的参数会被保存在词法环境中，然后返回一个新的包装器 function(b)。
    然后这个包装器被以 2 为参数调用，并且，它将该调用传递给原始的 sum 函数。

 */

import _ from "lodash";

function log(date, importance, message) {
  console.log(
    `[${date.getHours()}:${date.getMinutes()}] [${importance}] ${message}`
  );
}

log = _.curry(log);

log(new Date(), "info", "Hello");
log(new Date())("info")("hello");
// logNow 会是带有固定第一个参数的日志的部分应用函数
let logNow = log(new Date());

// 使用它
logNow("INFO", "message"); // [HH:mm] INFO message

// ! 高级柯里化实现
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}
/*
当我们运行它时，这里有两个 if 执行分支：

   ~ 1 如果传入的 args 长度与原始函数所定义的（func.length）相同或者更长，那么只需要使用 func.apply 将调用传递给它即可。
   ~ 2 否则，获取一个部分应用函数：我们目前还没调用 func。取而代之的是，返回另一个包装器 pass，它将重新应用 curried，将之前传入的参数与新的参数一起传入。

然后，如果我们再次调用它，我们将得到一个新的部分应用函数（如果没有足够的参数），或者最终的结果。

*/
function sum(a, b, c) {
  return a + b + c;
}

let curriedSum1 = curry(sum);

console.log(curriedSum1(1, 2, 3)); // 6，仍然可以被正常调用
console.log(curriedSum1(1)(2, 3)); // 6，对第一个参数的柯里化
console.log(curriedSum1(1)(2)(3)); // 6，全柯里化

/*
    * 只允许确定参数长度的函数

    柯里化要求函数具有固定数量的参数。
    使用 rest 参数的函数，例如 f(...args)，不能以这种方式进行柯里化。

 */

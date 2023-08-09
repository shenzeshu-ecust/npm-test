function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function (...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}
/*
    * 只允许确定参数长度的函数


    柯里化要求函数具有固定数量的参数。
    使用 rest 参数的函数，例如 f(...args)，不能以这种方式进行柯里化。

 */

const s = a;

// ! 【防抖】就是-回城，【节流】就是-放技能

function throttle1(func, ms) {
  let isThrottled = false;
  let savedArgs = arguments;
  let savedThis = this;
  return function wrapper() {
    if (isThrottled) {
      savedArgs = arguments;
      savedThis = this;
      return;
    }
    isThrottled = true;

    func.apply(this, arguments);

    setTimeout(function () {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  };
}

function f3(a) {
  console.log(a);
}

// f1000 最多每 1000ms 将调用传递给 f 一次
let ff1000 = throttle(f3, 1000);

ff1000(1); // 显示 1
ff1000(2); // (节流，尚未到 1000ms)
ff1000(3); // (节流，尚未到 1000ms)

// 当 1000ms 时间到...
// ...输出 3，中间值 2 被忽略

// 非立即执行
function debounceDelay(fn, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
// 立即执行
function debounceAtOnce(fn, delay) {
  let timer;
  let flag = true;
  return function (...args) {
    if (timer) clearTimeout(timer);
    if (flag) {
      fn.apply(this, args);
      flag = false;
    }
    timer = setTimeout(() => {
      flag = true;
    }, delay);
  };
}

// 节流完整版，可选前缘节流或延迟节流，个人感觉这个最舒服
function throttle(fn, delay, isImmediate = true) {
  // isImmediate 为 true 时使用前缘节流，首次触发会立即执行，为 false 时使用延迟节流，首次触发不会立即执行
  let last = Date.now();
  return function () {
    let now = Date.now();
    if (isImmediate) {
      fn.apply(this, arguments);
      isImmediate = false;
      last = now;
    }
    if (now - last >= delay) {
      fn.apply(this, arguments);
      last = now;
    }
  };
}

function throttle(fn, delay) {
  let timer = null;
  return function () {
    if (timer) return;
    let that = this;
    timer = setTimeout(() => {
      fn.apply(that, arguments);
      timer = null;
    }, delay);
  };
}

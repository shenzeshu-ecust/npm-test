function throttle(func, ms) {
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

function debounce(fn, delay) {
  let timer;
  return function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
}

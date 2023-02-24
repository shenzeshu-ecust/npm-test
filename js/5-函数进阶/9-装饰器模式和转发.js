// JavaScript 在处理函数时提供了非凡的灵活性。它们可以被传递，用作对象，现在我们将看到如何在它们之间 转发（forward） 调用并 装饰（decorate） 它们。

// ! 1 透明缓存
/*
 * 假设我们有一个 CPU 重负载的函数 slow(x)，但它的结果是稳定的。换句话说，对于相同的 x，它总是返回相同的结果。

    如果经常调用该函数，我们可能希望将结果缓存（记住）下来，以避免在重新计算上花费额外的时间。
    但是我们不是将这个功能添加到 slow() 中，而是创建一个包装器（wrapper）函数，该函数增加了缓存功能。正如我们将要看到的，这样做有很多好处。
 */
function slow(x) {
  // 这里可能会有重负载的 CPU 密集型工作
  console.log(`After long time and spend a lot, finally the result is ${x}`);
  return x;
}
function cachingDecorator(func) {
  let cache = new Map();
  return function (x) {
    if (cache.has(x)) {
      // 如果缓存中有对应的结果
      return cache.get(x); // 从缓存中读取结果
    }
    let result = func(x); // 否则就调用 func
    cache.set(x, result); // 然后将结果缓存（记住）下来

    return result;
  };
}

slow = cachingDecorator(slow);

console.log(slow(1)); // slow(1) 被缓存下来了，并返回结果
console.log("Again: " + slow(1)); // 返回缓存中的 slow(1) 的结果

/*
在上面的代码中，cachingDecorator 是一个 装饰器（decorator）：一个特殊的函数，它接受另一个函数并改变它的行为。

其思想是，我们可以为任何函数调用 cachingDecorator，它将返回缓存包装器。这很棒啊，因为我们有很多函数可以使用这样的特性，而我们需要做的就是将 cachingDecorator 应用于它们。

~ 总而言之，使用分离的 cachingDecorator 而不是改变 slow 本身的代码有几个好处：

    ~ 1 cachingDecorator 是可重用的。我们可以将它应用于另一个函数。
    ~ 2 缓存逻辑是独立的，它没有增加 slow 本身的复杂性（如果有的话）。
    ~ 3 如果需要，我们可以组合多个装饰器（其他装饰器将遵循同样的逻辑）。

*/

// ! 2 使用 “func.call” 设定上下文
// 上面提到的缓存装饰器不适用于对象方法。

let worker = {
  someMethod() {
    return 1;
  },

  slow(x) {
    console.log("Called with " + x);
    return x * this.someMethod(); // (*)
  },
};

function cachingDecorator(func) {
  let cache = new Map();
  return function (x) {
    if (cache.has(x)) {
      return cache.get(x);
    }
    let result = func.call(this, x); // 现在 "this" 被正确地传递了
    cache.set(x, result);
    return result;
  };
}

worker.slow = cachingDecorator(worker.slow); // 现在对其进行缓存

console.log(worker.slow(2)); // 工作正常
console.log(worker.slow(2)); // 工作正常，没有调用原始函数（使用的缓存）

// ! 3 func.apply(context, args) 使用类数组对象 args 作为参数列表（arguments）。
/*
只有一个关于 args 的细微的差别：

    Spread 语法 ... 允许将 可迭代对象 args 作为列表传递给 call。
    apply 只接受 类数组 args。
~ ……对于即可迭代又是类数组的对象，例如一个真正的数组，我们使用 call 或 apply 均可，但是 apply 可能会更快，因为大多数 JavaScript 引擎在内部对其进行了优化。
*/

// ~ 将所有参数连同上下文一起传递给另一个函数被称为“呼叫转移（call forwarding）”。
let wrapper = function () {
  return func.apply(this, arguments);
};

// ! 4 缓存函数 传递多个参数

let worker1 = {
  slow(min, max) {
    return min + max; // scary CPU-hogger is assumed
  },
};

function hash() {
  // ~ 方法借用（method borrowing）。
  // 从常规数组 [].join 中获取（借用）join 方法，并使用 [].join.call 在 arguments 的上下文中运行它。
  return [].join.call(arguments);
}

console.log("**", hash(1, 2));

function cachingDecorator1(func, hash) {
  let cache = new Map();
  return function () {
    let key = hash(arguments); // (*)
    if (cache.has(key)) {
      return cache.get(key);
    }

    let result = func.call(this, ...arguments); // (**)

    cache.set(key, result);
    return result;
  };
}

worker1.slow = cachingDecorator1(worker1.slow, hash);

console.log(worker1.slow(3, 5)); // works
console.log("Again " + worker1.slow(3, 5)); // same (cached)

// ! 5 装饰器和函数属性（装饰器丢失了原函数的属性！-- 需要用Proxy、Reflect解决）
/*
 通常，用装饰的函数替换一个函数或一个方法是安全的，除了一件小东西。
 ~ 如果原始函数有属性，例如 func.calledCount 或其他，则装饰后的函数将不再提供这些属性。因为这是装饰器。因此，如果有人使用它们，那么就需要小心。

例如，在上面的示例中，如果 slow 函数具有任何属性，而 cachingDecorator(slow) 则是一个没有这些属性的包装器。

一些包装器可能会提供自己的属性。例如，装饰器会计算一个函数被调用了多少次以及花费了多少时间，并通过包装器属性公开（expose）这些信息。

~ 存在一种创建装饰器的方法，该装饰器可保留对函数属性的访问权限，但这需要使用特殊的 Proxy 对象来包装函数。我们将在后面的 Proxy 和 Reflect 中学习它。 
 */
function delay(f, ms) {
  return function () {
    setTimeout(() => f.apply(this, arguments), ms);
  };
}

function sayHi(user) {
  alert(`Hello, ${user}!`);
}

alert(sayHi.length); // 1（函数的 length 是函数声明中的参数个数）

sayHi = delay(sayHi, 3000);

alert(sayHi.length); // 0（在包装器声明中，参数个数为 0)

// TEST:
// 1 间谍装饰器
// 创建一个装饰器 spy(func)，它应该返回一个包装器，该包装器将所有对函数的调用保存在其 calls 属性中。
function spy(func) {
  function wrapper(...args) {
    wrapper.calls.push(args);
    return func.apply(this, args);
  }
  wrapper.calls = [];
  return wrapper;
}
function work(a, b) {
  console.log(a + b); // work 是一个任意的函数或方法
}

work = spy(work);

work(1, 2); // 3
work(4, 5); // 9

for (let args of work.calls) {
  console.log("call:" + args.join()); // "call:1,2", "call:4,5"
}

// 2 延时装饰器
function delay(f, ms) {
  return function () {
    // ~ 注意这里是如何使用箭头函数的。我们知道，箭头函数没有自己的 this 和 arguments，
    // ~ 所以 f.apply(this, arguments) 从包装器中获取 this 和 arguments。
    // ~ 如果我们传递一个常规函数，setTimeout 将调用它且不带参数，并且 this=window（假设我们在浏览器环境）。
    setTimeout(() => f.apply(this, arguments), ms);
  };
}
// 我们仍然可以通过使用中间变量来传递正确的 this，但这有点麻烦：

function delay(f, ms) {
  return function (...args) {
    let savedThis = this; // 将 this 存储到中间变量
    setTimeout(function () {
      f.apply(savedThis, args); // 在这儿使用它
    }, ms);
  };
}
function f(x) {
  console.log(x);
}

// create wrappers
let f1000 = delay(f, 1000);

f1000("test"); // 在 1000ms 后显示 "test"

// ! 3 防抖装饰器
// 举个例子，我们有一个函数 f，并将其替换为 f = debounce(f, 1000)。
// 然后，如果包装函数分别在 0ms、200ms 和 500ms 时被调用了，之后没有其他调用，那么实际的 f 只会在 1500ms 时被调用一次。
// ~ 也就是说：从最后一次调用开始经过 1000ms 的冷却期之后。……并且，它将获得最后一个调用的所有参数，其他调用的参数将被忽略。

// * debounce 是一个处理一系列事件的好方法：无论是系列键盘输入，鼠标移动还是其他类似的事件。

// * 它在最后一次调用之后等待给定的时间，然后运行其可以处理结果的函数。

function debounce(f, ms) {
  let timerId;
  return function () {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => f.apply(this, arguments), ms);
  };
}

let ff = debounce(console.log, 1000);

ff("a");
setTimeout(() => ff("b"), 200);
setTimeout(() => ff("c"), 500);
// 防抖函数从最后一次函数调用以后等待 1000ms，然后执行：console.log("c")

// ! 4 节流装饰器 （例如跟踪鼠标移动）
// ~ 当被多次调用时，它会在每 ms 毫秒最多将调用传递给 f 一次。
/*
* 与防抖（debounce）装饰器相比，其行为完全不同：

    ~ debounce 会在“冷却（cooldown）”期后运行函数一次。适用于处理最终结果。
    ~ throttle 运行函数的频率不会大于所给定的时间 ms 毫秒。适用于不应该经常进行的定期更新。

换句话说，throttle 就像接电话的秘书，但是打扰老板（实际调用 f）的频率不能超过每 ms 毫秒一次。
*/

/*
例如，我们想要跟踪鼠标移动。

在浏览器中，我们可以设置一个函数，使其在每次鼠标移动时运行，并获取鼠标移动时的指针位置。在使用鼠标的过程中，此函数通常会执行地非常频繁，大概每秒 100 次（每 10 毫秒）。

我们想要在鼠标指针移动时，更新网页上的某些信息。

……但是更新函数 update() 太重了，无法在每个微小移动上都执行。高于每 100ms 更新一次的更新频次也没有意义。

因此，我们将其包装到装饰器中：使用 throttle(update, 100) 作为在每次鼠标移动时运行的函数，而不是原始的 update()。装饰器会被频繁地调用，但是最多每 100ms 将调用转发给 update() 一次。

在视觉上，它看起来像这样：

    ~ 1 对于第一个鼠标移动，装饰的变体立即将调用传递给 update。这很重要，用户会立即看到我们对其动作的反应。
      2 然后，随着鼠标移动，直到 100ms 没有任何反应。装饰的变体忽略了调用。
      3 在 100ms 结束时 —— 最后一个坐标又发生了一次 update。
    ~ 4 然后，最后，鼠标停在某处。装饰的变体会等到 100ms 到期，然后用最后一个坐标运行一次 update。因此，非常重要的是，处理最终的鼠标坐标。

*/
function throttle(func, ms) {
  let isThrottled = false;
  let savedArgs;
  let savedThis;

  function wrapper() {
    if (isThrottled) {
      // (2)
      savedArgs = arguments;
      savedThis = this;
      return;
    }
    isThrottled = true;

    func.apply(this, arguments); // (1)

    setTimeout(function () {
      isThrottled = false; // (3)
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, ms);
  }

  return wrapper;
}

/*
    ~ 1 在第一次调用期间，wrapper 只运行 func 并设置冷却状态（isThrottled = true）。
    ~ 2 在这种状态下，所有调用都记忆在 savedArgs/savedThis 中。请注意，上下文和参数（arguments）同等重要，应该被记下来。我们同时需要他们以重现调用。
    ~ 3 ……然后经过 ms 毫秒后，触发 setTimeout。冷却状态被移除（isThrottled = false），如果我们忽略了调用，则将使用最后记忆的参数和上下文执行 wrapper。

第 3 步运行的不是 func，而是 wrapper，因为我们不仅需要执行 func，还需要再次进入冷却状态并设置 timeout 以重置它。
 */
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

const FULFILLED = "fulfilled";
const REJECTED = "rejected";
const PENDING = "pending";

class MyPromise {
  // ! Promise无法捕捉异步的错误！
  #state = PENDING;
  #result = undefined;
  #handlers = []; // 存放

  constructor(executor) {
    const resolve = (data) => {
      this.#changeState(FULFILLED, data);
    };
    const reject = (reason) => {
      this.#changeState(REJECTED, reason);
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      // 产生错误，执行一次reject
      // ~ promise本身就处理不了异步错误
      reject(error);
    }
  }
  #run() {
    // promise是异步时，状态会暂时pending，此时应该不执行回调
    if (this.#state === PENDING) return;
    while (this.#handlers.length) {
      const { onFulfilled, onRejected, resolve, reject } =
        this.#handlers.shift();
      if (this.#state === FULFILLED) {
        if (typeof onFulfilled === "function") {
          onFulfilled(this.#result);
        } else {
          // 如果传的回调不是函数，那就穿透了。
          // new Promise((resolve) => resolve(1)).then(null).then(val => console.log(val))  // 1
          resolve(this.#result);
        }
      } else {
        if (typeof onRejected === "function") {
          onRejected(this.#result);
        }
      }
    }
  }

  #changeState(state, result) {
    // 已经改变过状态了，那么不会再改变一次状态
    if (this.#state !== PENDING) return;
    this.#state = state;
    this.#result = result;
    // 状态改变 执行then中的回调
    this.#run();
  }

  then(onFulfilled, onRejected) {
    // 返回的是promise对象
    return new Promise((resolve, reject) => {
      // 先放在handlers里记录，如果这里直接判断执行，遇到promise是异步时，无法处理
      // 可能promise会有多个then调用，所以用数组存储
      this.#handlers.push({
        onFulfilled,
        onRejected,
        resolve,
        reject,
      });
      this.#run();
    });
  }
}

const p = new MyPromise((resolve, reject) => {
  throw 123;
}).then(
  (res) => {},
  (err) => {}
);

// 可能多次then调用 所以得存在handlers数组之中
p.then((res) => {
  console.log(res);
});

p.then((res) => {
  console.log(res);
});
p.then((res) => {
  console.log(res);
});
p.then((res) => {
  console.log(res);
});

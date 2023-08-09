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
      // 只会使用resolve和reject中的一个
      executor(resolve, reject);
    } catch (error) {
      // 产生错误，执行一次reject
      // ~ promise本身就处理不了异步错误
      reject(error);
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
  #run() {
    // promise是异步时，状态会暂时pending，此时应该不执行回调
    if (this.#state === PENDING) return;
    while (this.#handlers.length) {
      const { onFulfilled, onRejected, resolve, reject } =
        this.#handlers.shift();
      if (this.#state === FULFILLED) {
        this.#runOne(onFulfilled, resolve, reject);
      } else {
        this.#runOne(onRejected, resolve, reject);
      }
    }
  }

  #runOne(callback, resolve, reject) {
    // then放在微队列中运行
    this.#runMicroTask(() => {
      // 如果传的回调不是函数，那就穿透了。
      // new Promise((resolve) => resolve(1)).then(null).then(val => console.log(val))  // 1
      if (typeof callback !== "function") {
        const settled = this.#state === FULFILLED ? resolve : reject;
        settled(this.#result);
        return;
      }

      try {
        const data = callback(this.#result);
        // 如果then返回的是promise类型
        if (this.#isPromiseLike(data)) {
          data.then(resolve, reject);
        } else {
          resolve(data);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  #isPromiseLike(value) {
    // 根据promiseA+规范，只要是对象或者函数且有then方法的，就是promise
    if (
      value !== null &&
      (typeof value === "object" || typeof value === "function")
    ) {
      return typeof value.then === "function";
    }
    return false;
  }

  #runMicroTask(func) {
    // node环境用process.nextTick
    if (typeof process === "object" && typeof process.nextTick === "function") {
      process.nextTick(func);
    } else if (typeof MutationObserver === "function") {
      // 浏览器环境用MutationObserver
      const ob = new MutationObserver(func);
      const textNode = document.createTextNode("1");
      ob.observe(textNode, {
        characterData: true,
      });
      textNode.data = "2";
    } else {
      setTimeout(func, 0);
    }
  }

  then(onFulfilled, onRejected) {
    // 返回的是promise对象
    return new MyPromise((resolve, reject) => {
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

  catch(onRejected) {
    // 和调用reject一样
    return this.then(undefined, onRejected);
  }

  finally(onFinally) {
    // finally不接收参数
    // finally成功失败状态保持之前的样子（状态透传）
    return this.then(
      (data) => {
        onFinally();
        return data;
      },
      (err) => {
        onFinally();
        throw err;
      }
    );
  }

  static resolve(value) {
    // 如果已经是promise类型了，返回本身
    if (value instanceof MyPromise) return value;
    // 如果是thenable，返回promise对象
    // 静态方法里不能调实例方法
    let _resolve, _reject;
    const p = new MyPromise((resolve, reject) => {
      _resolve = resolve;
      _reject = reject;
    });
    if (p.#isPromiseLike(value)) {
      value.then(_resolve, _reject);
    } else {
      _resolve(value);
    }
    return p;
  }

  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
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

const pro = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 1000);
});
pro
  .then((data) => {
    console.log("data1", data);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(data * 2);
      }, 1000);
    });
  })
  .then((data2) => console.log("data2", data2));

function delay(func, ms) {
  return new MyPromise((resolve, reject) => {
    setTimeout((...args) => {
      func.apply(this, args);
      resolve();
    }, ms);
  });
}

delay(() => console.log("1s后输出"), 1000);

// ~ 执行了catch就不会执行then的reject
new MyPromise((resolve, reject) => {
  reject("error");
})
  .catch((err) => console.log("catch"))
  .then(undefined, (err) => console.log("reject:", err))
  .finally(() => {
    console.log("finally");
  });

// ~ 执行了then的reject就不会执行catch

new Promise((resolve, reject) => {
  reject("error");
})
  .then(undefined, (err) => console.log("reject:", err))
  .catch((err) => console.log("catch"));

// ~ Promise.resolve(promise)还是自身
console.log(Promise.resolve(p) === p); // * true

const pp = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject(123);
  }, 1000);
})
  .then(null, (err) => {
    console.log("失败", err); // 123
    return 456;
  })
  .then(
    (data) => {
      console.log("data", data); // ~ 456 执行的是成功的回调
    },
    (err) => {
      console.log("error", err);
    }
  );

new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject(123);
  }, 1000);
})
  .then(null)
  .then(
    (data) => {
      console.log("data", data);
    },
    (err) => {
      console.log("error", err); // ~ 456  穿透，执行的是失败的回调
    }
  );

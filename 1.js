// Promise.all([]).then((val) => console.log("all", val)); // []
// Promise.any([])
//   .then((val) => console.log(val))
//   .catch((err) => console.log("any error", err)); // [AggregateError: All promises were rejected] { [errors]: [] }
// Promise.allSettled([]).then((val) => console.log("allSettled", val)); // []

const { default: axios } = require("./面经哥/24-设计模式");

// Promise.race([])
//   .then((val) => console.log(val))
//   .catch((err) => console.log(err)); // 什么也没有。race如果传递空数组，则返回一个永远不会被解决/拒绝的 Promise 对象。

// function PromiseAny(iterators) {
//   const promises = Array.from(iterators);
//   const num = promises.length;
//   const rejectedList = new Array(num);
//   let rejectedNum = 0;
//   return new Promise((resolve, reject) => {
//     if (num === 0) reject(new AggregateError([], "All promises were rejected"));
//     promises.forEach((promise, index) => {
//       Promise.resolve(promise)
//         .then((val) => {
//           resolve(val);
//         })
//         .catch((err) => {
//           rejectedList[index] = err;
//           if (++rejectedNum === num) {
//             reject(rejectedList);
//           }
//         });
//     });
//   });
// }

// PromiseAny([]).catch((err) => console.log(err));

let range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    return {
      current: this.start,
      last: this.end,

      next() {
        if (this.current <= this.last) {
          return { done: false, value: this.current++ };
        } else {
          return { done: true };
        }
      },
    };
  },
};

// for (let v of range) {
//   console.log(v);
// }

function PromiseAll(iterator) {
  let arr = Array.from(iterator);
  let len = arr.length;
  let count = 0;
  let resolvedArray = new Array(len);
  return new Promise((resolve, reject) => {
    if (len === 0) resolve(resolvedArray);
    arr.forEach((item, i) => {
      Promise.resolve(item)
        .then((val) => {
          resolvedArray[i] = val;
          if (++count === len) {
            resolve(resolvedArray);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}

function PromiseAny(iterator) {
  let arr = Array.from(iterator);
  let len = arr.length;
  let count = 0;
  let rejectArray = new Array(len);
  return new Promise((resolve, reject) => {
    if (len === 0) reject(new AggregateError([], "all promises were rejected"));
    arr.forEach((v, i) => {
      Promise.resolve(v)
        .then((val) => {
          resolve(val);
        })
        .catch((err) => {
          rejectArray[i] = err;
          if (++count === len) {
            reject(rejectArray);
          }
        });
    });
  });
}

function PromiseRace(iterator) {
  let arr = Array.from(iterator);
  return new Promise((resolve, reject) => {
    arr.forEach((v, i) => {
      Promise.resolve(v).then(resolve, reject);
    });
  });
}

function PromiseAllSettled(iterator) {
  let arr = Array.from(iterator);
  let len = arr.length;
  let count = 0;
  let data = new Array(len);
  return new Promise((resolve, reject) => {
    if (len === 0) return data;
    arr.forEach((v, i) => {
      Promise.resolve(v)
        .then((val) => {
          data[i] = { status: "fulfilled", value: val };
        })
        .catch((err) => {
          data[i] = { status: "rejected", reason: err };
        })
        .finally(() => {
          count++;
          if (count === len) resolve(data);
        });
    });
  });
}

function PromiseAll(iterator) {
  let arr = Array.from(iterator);
  let len = arr.length;
  let count = 0;
  let resolvedArray = [];
  return new Promise((resolve, reject) => {
    if (len === 0) resolve(resolvedArray);
    arr.forEach((v, i) => {
      Promise.resolve(v)
        .then((val) => {
          resolvedArray[i] = val;
          count++;
          if (count === len) resolve(resolvedArray);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}

let p1 = new Promise((resolve, reject) => {
  resolve(1);
});
let p2 = new Promise((resolve, reject) => {
  resolve(1);
});

// PromiseAll([p1, p2]).then((val) => console.log(val));

// Promise.race([]).then((val) => console.log(val));
// Promise.allSettled([p1, p2]).then((val) => console.log(val));

let ob = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    return {
      cur: this.from,
      aim: this.to,
      next() {
        if (this.cur <= this.aim) {
          return {
            value: this.cur++,
            done: false,
          };
        } else {
          return { done: true };
        }
      },
    };
  },
};

for (const v of ob) {
  console.log(v);
}

function equal(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
let a = 0.1;
let b = 0.2;
console.log(equal(a + b, 0.3)); // true
console.log(Number.EPSILON); // 2.220446049250313e-16

console.log(parseInt(011)); // 9
console.log(parseInt(018)); // 18  因为超出8进制了。此时vscode会提醒错误

let numm = 100000000;
let s = numm.toString().replace(/\B(?=(\d{3})+$)/g, ",");
console.log(s);

// const FULFILLED = "fulfilled";
// const REJECTED = "rejected";
// const PENDING = "pending";
// class MyPromise {
//   #state = PENDING;
//   #result = undefined;
//   #handlers = [];
//   constructor(executor) {
//     const resolve = (data) => {
//       this.#changeState(FULFILLED, data);
//     };
//     const reject = (reason) => {
//       this.#changeState(REJECTED, reason);
//     };
//     try {
//       executor(resolve, reject);
//     } catch (error) {
//       reject(error);
//     }
//   }

//   #changeState(state, result) {
//     if (this.#state !== PENDING) return;
//     this.#state = state;
//     this.#result = result;
//     this.#run();
//   }

//   #run() {
//     if (this.#state === PENDING) return;
//     const { onFulfilled, onRejected, resolve, reject } = this.#handlers;
//     if(this.#state === FULFILLED) {
//       this.#runOne()
//     }
//   }

//   #runOne(callback)

//   then(onFulfilled, onRejected) {
//     return new MyPromise((resolve, reject) => {
//       this.#handlers.push({
//         onFulfilled,
//         onRejected,
//         resolve,
//         reject,
//       });
//       this.#run();
//     });
//   }
// }

// new Promise((resolve, reject) => {});

function compose(middleware) {
  return async function (...args) {
    await dispatch(0);

    async function dispatch(i) {
      const fn = middleware[i];
      if (!fn) return;
      fn(async () => {
        await dispatch(i + 1);
      }, ...args);
    }
  };
}

let middleware = [];
middleware.push(function (next) {
  console.log(1);
  next();
  console.log(2);
});
middleware.push(function (next) {
  console.log(3);
  next();
  console.log(4);
});
middleware.push(function (next) {
  console.log(5);
  next();
  console.log(6);
});

const onion = compose(middleware);
// onion();

function formatTimeDetail(seconds) {
  const hours = Math.floor(seconds / 60 / 60);
  const minutes = Math.floor((seconds / 60) % 60);
  console.log(hours, minutes);
  let hoursStr = "";
  switch (hours) {
    case 0:
      hoursStr = "";
      break;
    case 1:
      hoursStr = "1 hour";
      break;
    default:
      hoursStr = `${hours} hours`;
  }
  let minutesStr = "";
  switch (minutes) {
    case 0:
      minutesStr = "";
      break;
    case 1:
      minutesStr = "1 minute";
      break;
    default:
      minutesStr = `${minutes} minutes`;
  }
  let joint = hours !== 0 && minutes !== 0 ? " " : "";
  return hoursStr + joint + minutesStr;
}

console.log(formatTimeDetail(10 * 60));

async function compose(middleware) {
  return async function (...args) {
    await dispatch(0);
    async function dispatch(i) {
      const fn = middleware[i];
      if (!fn) return;
      fn(async function next() {
        await dispatch(i + 1);
      }, ...args);
    }
  };
}

function delay(fn, delayTime) {
  return new Proxy(fn, {
    apply: function (target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), delayTime);
    },
  });
}

const fn = function () {
  console.log(111);
};
const delayFn = delay(fn, 1000);
delayFn();

let n = [];
n = new Proxy(n, {
  set(target, property, value, receiver) {
    if (typeof value === "number") {
      target[property] = value;
      return true;
    }
    return false;
  },
  ownKeys() {},
});
n.push(1);
console.log(n);

function delay(fn, ms) {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    },
  });
}

let ooo = {
  data: {
    name: "szd",
  },
};

ooo = new Proxy(ooo, {
  get(target, prop, receiver) {
    const value = Reflect.get(...arguments);
    if (!value) throw new Error("Wrong");
    return typeof value === "function" ? value.bind(target) : value;
  },
});

let symbolHandler = Symbol("handlers");
function makeObservable(target) {
  target[symbolHandler] = [];
  target.observe = function (handler) {
    this[symbolHandler].push(handler);
  };
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      const success = Reflect.set(...arguments);
      if (success) target[symbolHandler].forEach((v) => v(prop, value));
      return success;
    },
  });
}

let exa = {
  name: "szs",
};
console.log(Reflect.get(exa, "name"));
Reflect.set(exa, "age", 15);
console.log(Reflect.get(exa, "age"));
console.log(exa);

function spread(fn) {
  return function (args) {
    return fn.apply(this, args);
  };
}

async function onion(middleware) {
  return async function (...args) {
    await dispatch(0);
    async function dispatch(i) {
      let fn = middleware[i];
      if (!fn) return;
      fn(async () => {
        await dispatch(i + 1);
      }, ...args);
    }
  };
}

const obj = {};
const sym = Symbol("new");
obj[sym] = 111;
// 1 Object.keys() || Object.values()
console.log(Object.keys(obj).length === 0);
console.log(Object.values(obj).length === 0);

// 2 JSON.stringify()
console.log(JSON.stringify(obj) === "{}");
// 3 Object.getOwnPropertyNames()
console.log(Object.getOwnPropertyNames(obj).length === 0);

// ~ 但是以上情况不适用于有symbol键的对象
// 4 Object.getOwnPropertySymbols() + Object.getOwnPropertyNames()
console.log(
  Object.getOwnPropertyNames(obj).length === 0 &&
    Object.getOwnPropertySymbols(obj).length === 0
);
// 5 Reflect.ownKeys()
console.log(Reflect.ownKeys(obj).length === 0); // true

function PromiseAll(iterator) {
  const arr = Array.from(iterator);
  let resolvedArray = [];
  let resolvedCount = 0;

  return new Promise((resolve, reject) => {
    arr.forEach((item, i) => {
      try {
        Promise.resolve(item).then((res) => {
          resolvedArray[i] = res;
          resolvedCount++;

          if (resolvedCount === arr.length) resolve(resolvedArray);
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}
function PromiseAllSettled(iterator) {
  const arr = Array.from(iterator);
  const res = [];
  let count = 0;

  return new Promise((resolve, reject) => {
    if (arr.length === 0) resolve(res);
    arr.forEach((promise, i) => {
      Promise.resolve(promise)
        .then(
          (val) => {
            res[i] = {
              status: "fulfilled",
              value: val,
            };
          },
          (error) => {
            res[i] = {
              status: "rejected",
              reason: error,
            };
          }
        )
        .finally(() => {
          if (++count === arr.length) resolve(res);
        });
    });
  });
}

function cx(root) {
  let res = [];

  function traverse(root, depth) {
    if (!root) return;
    if (!res[depth]) res[depth] = [];
    res[depth].push(root.val);
    traverse(root.left, depth + 1);
    traverse(root.right, depth + 1);
  }

  traverse(root, 0);
  return res;
}

function mergeSort(arr) {
  if (arr.length < 2) return arr;
  let mid = Math.floor(arr.length / 2);
  let left = arr.slice(0, mid);
  let right = arr.slice(mid);
  return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right) {
  let res = [];
  while (left.length && right.length) {
    const a = left.shift();
    const b = right.shift();
    if (a < b) res.push(a);
    else res.push(b);
  }
  const rest = left.length > 0 ? left : right;
  res = res.concat(rest);
}

const lll = [9, 8, 7, 5, 2, 1, 4];
console.log(mergeSort(lll));





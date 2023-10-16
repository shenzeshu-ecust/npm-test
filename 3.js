// import { set } from "./vue源码/3-vm.$set等原理";

// function defineReactive(target, key, value) {
//   if (arguments.length === 2) {
//     target[key] = value;
//   }
//   if (typeof value === "object") {
//     new Observer(value);
//   }
//   const dep = new Dep();
//   Object.defineProperty(target, key, {
//     configurable: true,
//     enumerable: true,
//     get() {
//       dep.depend();
//       return value;
//     },
//     set(newVal) {
//       if (value === newVal) return;
//       value = newVal;
//       dep.notify();
//     },
//   });
// }
// let s = "1{{}}";
// console.log(s.split("{{}}"));

// const arr = data.map((item) => {
//   if (isJPG(item.downloadName)) {
//     item.isJPG = true;
//   }
//   return item;
// });
console.log((0.1).toFixed(20));
console.log((0.2).toFixed(20));
console.log((0.5).toFixed(20));
console.log(0.1 + 0.2);
console.log("sss"[Symbol.iterator]().next());

(function () {
  var undefined = 10;
  console.log(undefined); // 10
})();

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
    if (left[0] < right[0]) res.push(left.shift());
    else res.push(right.shift());
  }
  const rest = left.length > 0 ? left : right;
  res = res.concat(rest);
  return res;
}

const lll = [9, 8, 7, 5, 2, 1, 4];
console.log(mergeSort(lll));

function onion(middleware) {
  return function (...args) {
    dispatch(0);
    function dispatch(i) {
      const fn = middleware[i];
      if (!fn) return;
      return fn(function next() {
        dispatch(i + 1);
      }, ...args);
    }
  };
}

let middleware = [];

const fn1 = function (next) {
  console.log(1);
  next();
  console.log(2);
};

const fn2 = function (next) {
  console.log(3);
  next();
  console.log(4);
};
const fn3 = function (next) {
  console.log(5);
  next();
  console.log(6);
};

middleware = [fn1, fn2, fn3];

onion(middleware)();


let atest = { name: 'test0'}
b = d = atest
console.log(b, d)


function compose(middleware) {
  return function(...args) {
    dispatch(0)
    function dispatch(i) {
      let fn = middleware[i]
      if(!fn) return null
      fn(function next() {
        dispatch(i + 1)
      }, ...args)
    }
  }
}


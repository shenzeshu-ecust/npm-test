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

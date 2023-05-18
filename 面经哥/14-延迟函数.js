// 这种方式返回的函数会丢失原function的属性（name, length，。。。）
function delay(fn, ms) {
  return function () {
    setTimeout(() => fn.apply(this, arguments), ms);
  };
}

// 解决办法 Proxy\
function delay(fn, ms) {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    },
  });
}

function sayHi(user) {
  console.log(`Hello, ${user}!`);
}

sayHi = delay(sayHi, 3000);

console.log(sayHi.length); // ~ 1 (*) proxy 将“获取 length”的操作转发给目标对象

sayHi("John"); // Hello, John!（3 秒后）

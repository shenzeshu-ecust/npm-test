// ! 1 丢失 “this”
// 一旦方法被传递到与对象分开的某个地方 —— this 就丢失。
let user = {
  firstName: "John",
  sayHi() {
    console.log(`Hello, ${this.firstName}!`);
  },
};
// 这是因为 setTimeout 获取到了函数 user.sayHi，但它和对象分离开了
setTimeout(user.sayHi, 1000); // Hello, undefined!

// 浏览器中的 setTimeout 方法有些特殊：它为函数调用设定了 this=window（对于 Node.js，this 则会变为计时器（timer）对象，但在这儿并不重要）。
// 所以对于 this.firstName，它其实试图获取的是 window.firstName，这个变量并不存在。在其他类似的情况下，通常 this 会变为 undefined。

// ! 2 解决 this 丢失问题
// 1） 包装器
setTimeout(function () {
  user.sayHi(); // Hello, John!
}, 1000);
// 或者
setTimeout(() => user.sayHi(), 1000); // Hello, John!
// ? 看起来不错，但是我们的代码结构中出现了一个小漏洞: 如果在 setTimeout 触发之前（有一秒的延迟！）user 的值改变了怎么办？那么，突然间，它将调用错误的对象！

// ~ 2) bind;  let bound = func.bind(context, [arg1], [arg2], ...);
let sayHi = user.sayHi.bind(user);
sayHi(); //  John
setTimeout(sayHi); // John

// bindAll
// 如果一个对象有很多方法，并且我们都打算将它们都传递出去，那么我们可以在一个循环中完成所有方法的绑定：
for (let key in user) {
  if (typeof user[key] == "function") {
    user[key] = user[key].bind(user);
  }
}

// ~ 用bind创建 部分（应用）函数（Partial functions）
function mul(a, b) {
  return a * b;
}
// * 对 mul.bind(null, 2) 的调用创建了一个新函数 double，它将调用传递到 mul，将 null 绑定为上下文，并将 2 绑定为第一个参数。并且，参数（arguments）均被“原样”传递。
let double = mul.bind(null, 2);

console.log(double(3)); // = mul(2, 3) = 6

// ~ 在没有上下文情况下的 partial
/**
 * partial(func[, arg1, arg2...]) 调用的结果是一个包装器 (*)，它调用 func 并具有以下内容：

    与它获得的函数具有相同的 this（对于 user.sayNow 调用来说，它是 user）
    然后给它 ...argsBound —— 来自于 partial 调用的参数（"10:00"）
    然后给它 ...args —— 给包装器的参数（"Hello"）

 * @param {待包装函数} func 
 * @param  {...any} argsBound 
 * @returns 
 */
function partial(func, ...argsBound) {
  return function (...args) {
    return func.call(this, ...argsBound, ...args);
  };
}
// （还有来自 lodash 库的现成的 _.partial 实现。）

// 用法：
let user1 = {
  firstName: "John",
  say(time, phrase) {
    console.log(`[${time}] ${this.firstName}: ${phrase}!`);
  },
};

// 添加一个带有绑定时间的 partial 方法
user1.sayNow = partial(
  user1.say,
  new Date().getHours() + ":" + new Date().getMinutes()
);

user1.sayNow("Hello"); // [10:00] John: Hello!

// TEST
// 1 作为方法的绑定函数
// ~ 绑定函数的上下文是硬绑定（hard-fixed）的。没有办法再修改它。
function f() {
  console.log("*", this); // ? null (但实际是指向了全局...)
}

let user2 = {
  g: f.bind(null),
};

user2.g();

// 2 二次绑定
function f2() {
  console.log(this.name);
}

f2 = f2.bind({ name: "John" }).bind({ name: "Ann" });

f2(); // ~ John; f.bind(...) 返回的外来（exotic）绑定函数 对象仅在创建的时候记忆上下文（以及参数，如果提供了的话）。
// ~ 一个函数不能被二次绑定！

// ! 3 bind 后的函数属性 还在吗
function logName() {
  console.log(this.name);
}
logName.test = 5;
let bd = logName.bind({ name: "szs" });
console.log(bd.test); // ~ undefined!
console.log(bd);
// ~ bind 的结果是另一个对象。它并没有 test 属性。

// 4 使函数正常工作
function askPassword(ok, fail) {
  let password = prompt("Password?", "");
  if (password == "rockstar") ok();
  else fail();
}

let userr = {
  name: "John",

  loginOk() {
    console.log(`${this.name} logged in`);
  },

  loginFail() {
    console.log(`${this.name} failed to log in`);
  },
};
// ? askPassword(user.loginOk, user.loginFail);  当 ask 调用这两个函数时，它们自然会认定 this=undefined。
// 法1
askPassword(userr.loginOk.bind(userr), userr.loginFail.bind(userr));
// 法2 但是可能会在更复杂的场景下失效，例如变量 user 在调用 askPassword 之后但在访问者应答和调用 () => user.loginOk() 之前被修改。
askPassword(
  () => userr.loginOk(),
  () => userr.loginFail()
);

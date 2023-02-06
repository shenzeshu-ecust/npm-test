// ! 1 在 JavaScript 中，函数的类型是 对象。
// 一个容易理解的方式是把函数想象成可被调用的“行为对象（action object）”。我们不仅可以调用它们，还能把它们当作对象来处理：增/删属性，按引用传递等。
// ! 2 函数属性 name：函数的名字。通常取自函数定义，但如果函数定义时没设定函数名，JavaScript 会尝试通过函数的上下文猜一个函数名（例如把赋值的变量名取为函数名）

function sayHi() {
  console.log("Hi");
}

console.log(sayHi.name); // sayHi

let sayHello = function () {
  console.log("sayHello");
};
console.log(sayHello.name); // sayHello
// ~ 规范中把这种特性叫做「上下文命名」。如果函数自己没有提供，那么在赋值中，会根据上下文来推测一个。

// 有时会出现无法推测名字的情况。此时，属性 name 会是空，

// 函数是在数组中创建的
let arr = [function () {}];

console.log(arr[0].name); // <空字符串>
// 引擎无法设置正确的名字，所以没有值

// ! 3 函数属性length：函数定义时的入参的个数（rest 参数不参与计数）
function f1(a) {}
function f2(a, b) {}
function many(a, b, ...more) {}

console.log(f1.length); // 1
console.log(f2.length); // 2
// ~ 可以看到，rest 参数不参与计数。
console.log(many.length); // 2

// ~ 属性 length 有时在操作其它函数的函数中用于做 内省/运行时检查（introspection）。
function ask(question, ...handlers) {
  let isYes = +question;

  for (let handler of handlers) {
    if (handler.length == 0) {
      if (isYes) handler();
    } else {
      handler(isYes);
    }
  }
}

// 对于肯定的回答，两个 handler 都会被调用
// 对于否定的回答，只有第二个 handler 被调用
ask(
  1,
  () => console.log("You said yes"), // fun.length = 0
  (result) => console.log(result) // fun.length = 1
);
// 这就是所谓的 多态性 的一个例子 —— 根据参数的类型，或者根据在我们的具体情景下的 length 来做不同的处理。这种思想在 JavaScript 的库里有应用。

// ! 4 自定义属性
function sayHi2() {
  console.log("Hi");

  // 计算调用次数
  sayHi2.counter++;
}
// ~ 被赋值给函数的属性，比如 sayHi.counter = 0，不会 在函数内定义一个局部变量 counter。换句话说，属性 counter 和变量 let counter 是毫不相关的两个东西。
// ~ 我们可以把函数当作对象，在它里面存储属性，但是这对它的执行没有任何影响。
sayHi2.counter = 0; // 初始值

sayHi2(); // Hi
sayHi2(); // Hi

console.log(`Called ${sayHi2.counter} times`); // Called 2 times

// ? 函数属性有时会用来替代闭包。例如
function makeCounter() {
  // 不需要这个了
  // let count = 0 （闭包方式）

  function counter() {
    return ++counter.count;
  }
  counter.count = 0;
  return counter;
}

let counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2

// ? 函数属性和函数变量（闭包方式）实现的计数器哪个好？(取决于需求)
// ~ 用函数属性绑定的count可以被访问、修改，但是如果用变量（闭包）无法被访问
counter.count = 999;
console.log(counter()); // 1000

// ! 5 命名函数表达式（NFE，Named Function Expression），指带有名字的函数表达式的术语。
// 让我们写一个普通的[函数表达式]：
let sayHi3 = function (who) {
  console.log(`Hello, ${who}`);
};
// ~ 然后给它加一个名字：
let sayHi4 = function func(who) {
  console.log(`Hello, ${who}`);
};
sayHi4("zsz");
/*
    首先请注意，它仍然是一个函数表达式。
    在 function 后面加一个名字 "func"  没有 使它成为一个 函数声明，因为它仍然是作为赋值表达式中的一部分被创建的。

    添加这个名字当然也没有打破任何东西。

    ~ 关于名字 func 有两个特殊的地方，这就是添加它的原因：

    ~ 1 它允许函数在内部引用自己。
    ~ 2 它在函数外是不可见的。

*/
let sayHi5 = function func(who) {
  if (who) {
    console.log(`Hello, ${who}`);
  } else {
    func("Guest"); // ~ 使用 func 再次调用函数自身
  }
};

sayHi5(); // Hello, Guest

// ~ 但这不工作：
// func(); // Error, func is not defined（在函数外不可见）

// ! 为什么 使用NFE，而不是用sayHi嵌套调用自己？
let f3 = function another(name) {
  // * 因为名字 another 是函数局部域的。可以可靠的调用自身
  if (name) {
    console.log(`your name is ${name}`);
  } else {
    // ~ 发生这种情况是因为该函数从它的外部词法环境获取 f3。没有局部的 f3 了，所以使用外部变量。而当调用时，外部的 f3 是 null。
    f3("Guest");
  }
};
// ~ 上面这段代码的问题在于 f3 的值可能会被函数外部的代码改变。如果该函数被赋值给另外一个变量（译注：也就是原变量被修改），那么函数就会开始报错：

let welcome = f3;
f3 = null;
// welcome(); // ~ 报错

// ! 如果使用 NFE
let sayHi6 = function func(who) {
  if (who) {
    console.log(`Hello, ${who}`);
  } else {
    func("Guest"); // 现在一切正常
  }
};

let w = sayHi6;
sayHi6 = null;

w(); // Hello, Guest（嵌套调用有效）

// TEST
// 1 为 counter 添加 set 和 decrease 方法
/*
修改 makeCounter() 代码，使得 counter 可以进行减一和设置值的操作：

    counter() 应该返回下一个数字（与之前的逻辑相同）。
    counter.set(value) 应该将 count 设置为 value。
    counter.decrease() 应该把 count 减 1。
*/
function makeCounter() {
  let count = 0;
  function counter() {
    return count++;
  }
  counter.set = (value) => {
    count = value;
  };
  counter.decrease = () => count--;
  return counter;
}

// ! 2 任意数量的括号求和
// ? sum(0)(1)(2)(3)(4)(5) == 15

/*

    1 为了使整个程序无论如何都能正常工作，sum 的结果必须是函数。
    2 这个函数必须将两次调用之间的当前值保存在内存中。
    3 根据这个题目，当函数被用于 == 比较时必须转换成数字。函数是对象，所以转换规则会按照 对象 —— 原始值转换 章节所讲的进行，我们可以提供自己的方法来返回数字。

*/
function sum(a) {
  let curSum = a;
  function f(b) {
    curSum += b;
    return f; // ~  <-- 没有调用自己，只是返回了自己
  }
  f.toString = function () {
    return curSum;
  };
  return f;
}
// ~ sum返回的是一个函数，但是规定了toString()方式，所以需要转化为原始类型
console.log(+sum(6)(-1)(-2)(-3)); // 0
console.log(+sum(0)(1)(2)(3)(4)(5)); // 15

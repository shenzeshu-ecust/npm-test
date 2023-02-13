// ! 1 语法
class User {
  constructor(name) {
    this.name = name;
  }
  // ~ 类的方法之间没有逗号
  sayHi() {
    console.log(this.name);
  }
  sayNo() {
    console.log("No");
  }
}

// 用法：
let user = new User("John");
user.sayHi();
/*
当 new User("John") 被调用：

    1 一个新对象被创建。
    2 constructor 使用给定的参数运行，并将其赋值给 this.name。
*/

// ! 2 class本质
// ~ 在 JavaScript 中，类是一种函数。
console.log(typeof User); // function

// class 创建时其实做了2件事：
// 1 创建名为User的函数，该函数成为类声明的结果。该函数的代码来自于 constructor 方法（如果我们不编写这种方法，那么它就被假定为空）。
// 2 存储类中的方法，例如 User.prototype 中的 sayHi。

// ~ 当 new User 对象被创建后，当我们调用其方法时，它会从原型中获取对应的方法，因此，对象 new User 可以访问类中的方法。
console.log(User.prototype.sayHi); // [Function: sayHi]

// * 在原型中实际上有3个方法(包括constructor方法！)
console.log(Object.getOwnPropertyNames(User.prototype)); // * [ 'constructor', 'sayHi', 'sayNo' ]

// ! 3 class类 与 普通构造函数 的区别
// 人们常说 class 是一个语法糖，因为我们实际上可以在不使用 class 的情况下声明相同的内容：
function P(name) {
  // 1 创建构造器函数
  this.name = name;
}
// 2 函数的原型（prototype）默认具有 "constructor" 属性，
P.prototype.walk = function () {}; // 3 将方法添加到原型

// ~ 差异
// ~ 1) 通过 class 创建的函数具有特殊的内部属性标记 [[IsClassConstructor]]: true。因此，它与手动创建并不完全相同。

// ① 编程语言会在许多地方检查该属性。例如，与普通函数不同，必须使用 new 来调用它：
// User(); // * TypeError: Class constructor User cannot be invoked without 'new'
// ② 大多数 JavaScript 引擎中的类构造器的字符串表示形式都以 “class…” 开头
console.log(User); // [class User]

// ~ 2) 类方法不可枚举。 类定义将 "prototype" 中的所有方法的 enumerable 标志设置为 false。
// 这很好，因为如果我们对一个对象调用 for..in 方法，我们通常不希望 class 方法出现。

// ~ 3) 类总是使用 use strict。 在类构造中的所有代码都将自动进入严格模式。

// ! 4 类表达式
// 就像函数一样，类可以在另外一个表达式中被定义，被传递，被返回，被赋值等。
let u = class {
  sayHi() {}
};

// 类似于命名函数表达式（Named Function Expressions），类表达式可能也应该有一个名字。
// ~ 如果类表达式有名字，那么该名字仅在类内部可见：

let UU = class MyClass {
  sayHi() {
    console.log(MyClass);
  }
};
new UU().sayHi(); // [class MyClass]
// console.log(MyClass); // ~ ReferenceError: MyClass is not defined

// 我们甚至可以动态地“按需”创建类，就像这样：
function makeClass(phrase) {
  // 声明一个类并返回它
  return class {
    sayHi(name) {
      console.log(name, phrase);
    }
  };
}

// 创建一个新的类
let Userr = makeClass("Hello");

new Userr().sayHi("szs"); // szs Hello

// ! 5 Getters/Setters
// 就像对象字面量，类可能包括 getters/setters，计算属性（computed properties）等。

class Person {
  constructor(name) {
    // ~ 会调用setter
    this.name = name;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    if (value.length < 4) {
      console.log("Your name is too short");
      return;
    }
    this._name = value;
  }
}
let p = new Person("szss");
console.log(p.name); // szss
p = new Person("s"); // Your name is too short

// ! 6 计算属性名称 [..]
class Student {
  ["stand" + "Up"]() {
    // 它们和对象字面量类似。
    console.log("Stand up !");
  }
}
new Student().standUp();

// ! 7 class 字段
// 类字段（field）是最近才添加到语言中的。之前，我们的类仅具有方法。
// “类字段”是一种允许添加任何属性的语法。

// 添加name属性
class S {
  name = "ss"; // 添加属性, 我们也可以在赋值时使用更复杂的表达式和函数调用: name = prompt("Name, please?", "John");
  sayName() {
    console.log(this.name);
  }
}
let sss = new S();
sss.sayName();

// ~ 类字段重要的不同之处在于，它们会在每个独立对象中被设好，而不是设在 User.prototype：
console.log(sss.name); // ss
console.log(S.prototype.name); // undefined

// ! 8 使用类字段制作绑定方法
// 函数绑定 一章中所讲的，JavaScript 中的函数具有动态的 this。它取决于调用上下文。
// 因此，如果一个对象方法被传递到某处，或者在另一个上下文中被调用，则 this 将不再是对其对象的引用。

class Button {
  constructor(value) {
    this.value = value;
  }

  click() {
    console.log(this.value);
  }
}

let button = new Button("hello");

setTimeout(button.click, 1000); // undefined

/*
这个问题被称为“丢失 this”。

我们在 函数绑定 一章中讲过，有两种可以修复它的方式：

    传递一个包装函数，例如 setTimeout(() => button.click(), 1000)。
    将方法绑定到对象，例如在 constructor 中。

*/

// ~ 类字段提供了另一种非常优雅的语法：
class Button1 {
  constructor(value) {
    this.value = value;
  }
  /*
  * 类字段 click = () => {...} 是基于每一个对象被创建的，在这里对于每一个 Button 对象都有一个独立的方法，在内部都有一个指向此对象的 this。
  * 我们可以把 button.click 传递到任何地方，而且 this 的值总是正确的。

    在浏览器环境中，它对于进行事件监听尤为有用。
  */
  click = () => {
    console.log(this.value);
  };
}

let button1 = new Button1("hello");

setTimeout(button1.click, 1000); // hello

// ! 总结
class MClass {
  prop = value; // 属性

  constructor() {
    // 构造器
    // ...
  }

  method() {} // method

  get something() {} // getter 方法
  set something(v) {} // setter 方法

  [Symbol.iterator]() {} // 有计算名称（computed name）的方法（此处为 symbol）
  // ...
}
// ! 技术上来说，MyClass 是一个函数（我们提供作为 constructor 的那个），而 methods、getters 和 setters 都被写入了 MyClass.prototype。

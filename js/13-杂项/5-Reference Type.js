// 本文所讲的是一个高阶主题，能帮你更好地理解一些边缘情况。
// 这仅是锦上添花。许多经验丰富的的开发者不甚了了也过得不错。如果你想了解代码运行的本质，那就继续读下去吧。

// ? 一些情况下可能会丢失this

let user = {
  name: "John",
  hi() {
    console.log(this.name);
  },
  bye() {
    console.log("Bye");
  },
};

user.hi(); // John 正常运行

// 现在让我们基于 name 来选择调用 user.hi 或 user.bye
(user.name == "John" ? user.hi : user.bye)(); // undefined!

// ~ 注意这里是user.hi  而不是user.hi()

// ! Reference type 解读
// ? 为何消失
/*
仔细看的话，我们可能注意到 obj.method() 语句中的两个操作：

    首先，点 '.' 取了属性 obj.method 的值。
    接着 () 执行了它。

那么，this 的信息是怎么从第一部分传递到第二部分的呢？
*/
// ~ 如果我们将这些操作放在不同的行，this 必定是会丢失的：

let user1 = {
  name: "John",
  hi() {
    console.log(this.name);
  },
};

// 把获取方法和调用方法拆成两行
let hi = user1.hi;
hi(); // ~ 报错了，因为 this 的值是 undefined

/*
这里 hi = user.hi 把函数赋值给了一个变量，接下来在最后一行它是完全独立的，所以这里没有 this。
! 为确保 user.hi() 调用正常运行，JavaScript 玩了个小把戏 —— 点 '.' 返回的不是一个函数，而是一个特殊的 Reference Type 的值。

  ! Reference Type 是 ECMA 中的一个“规范类型”。我们不能直接使用它，但它被用在 JavaScript 语言内部。
  ! Reference Type 的值是一个三个值的组合 (base, name, strict)，其中：

      base 是对象。
      name 是属性名。
      strict 在 use strict 模式下为 true。

  对属性 user.hi 访问的结果不是一个函数，而是一个 Reference Type 的值。对于 user.hi，在严格模式下是：
    *  Reference Type 的值
    (user, "hi", true)

  ~当 () 被在 Reference Type 上调用时，它们会接收到关于对象和对象的方法的完整信息，然后可以设置正确的 this（在此处 =user）。

  Reference Type 是一个特殊的“中间人”内部类型，目的是从 . 传递信息给 () 调用。

  ! 任何例如赋值 hi = user.hi 等其他的操作，都会将 Reference Type 作为一个整体丢弃掉，而会取 user.hi（一个函数）的值并继续传递。所以任何后续操作都“丢失”了 this。

  ~ 因此，this 的值仅在函数直接被通过点符号 obj.method() 或方括号 obj['method']() 语法（此处它们作用相同）调用时才被正确传递。
  还有很多种解决这个问题的方式，例如 func.bind()。
*/

// TEST
// 1 检查语法,猜输出
let u = {
  name: "John",
  go() {
    console.log(this.name);
  },
};
// {...}(u.go)(); 会输出什么

// ? 报错！
/*
 * 出现此错误是因为在 user = {...} 后面漏了一个分号。(但是prettier自己补充了一个)

  JavaScript 不会在括号 (user.go)() 前自动插入分号，所以解析的代码如下：
  let user = { go:... }(user.go)()

  * 然后我们还可以看到，这样的联合表达式在语法上是将对象 { go: ... } 作为参数为 (user.go) 的函数。
  * 这发生在 let user 的同一行上，因此 user 对象是甚至还没有被定义，因此出现了错误。


  如果加上分号，一切正常。(u.go)() 中前一个括号没啥作用。
 */

// 2 解释this的值
let obj, method;

obj = {
  go: function () {
    alert(this);
  },
};

obj.go(); // (1) { go: [Function: go] }
// ~ 常规的调用

// (obj.go)(); // (2) { go: [Function: go] }
// ~ 括号没有改变执行的顺序，点符号先执行

(method = obj.go)(); // (3) undefined
// ~ 相当于
/**
 * let method = obj.go
 * method()
 * method作为一个没this的函数 执行的
 */

(obj.go || obj.stop)(); // (4) undefined
// ~ 与 (3) 相类似，在括号 () 的左边也有一个表达式。

/*
  * 要解释 (3) 和 (4) 得到这种结果的原因，我们需要回顾一下属性访问器（点符号或方括号）返回的是引用类型的值。

  * 除了方法调用之外的任何操作（如赋值 = 或 ||），都会把它转换为一个不包含允许设置 this 信息的普通值。
 */

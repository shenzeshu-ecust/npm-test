// ! 构造函数 and new
/*
    ~ 除了字面量 {}创建对象，也可以使用new 构造函数() 创建对象-- 优点：可重用
    构造函数在技术上是常规函数。不过有两个约定：

        * 它们的命名以大写字母开头。
        * 它们只能由 "new" 操作符来执行。

    ~ 当一个函数被使用 new 操作符执行时，它按照以下步骤：

        一个新的空对象被创建并分配给 this。
        函数体执行。通常它会修改 this，为其添加新的属性。
        返回 this 的值。

*/
// 所以new User()就是如下意思
function User(name) {
  // this = {};（隐式创建）

  // 添加属性到 this
  this.name = name;
  this.isAdmin = false;

  // return this;（隐式返回）
}
// 如果我们想创建其他用户，我们可以调用 new User("Ann")，new User("Alice") 等。比每次都使用字面量创建要短得多，而且更易于阅读。

// ! 2 new function() {}
// 创建一个函数并立即使用 new 调用它
/*
    let user = new function () {
    this.name = "John";
    this.isAdmin = false;

    // ……用于用户创建的其他代码
    // 也许是复杂的逻辑和语句
    // 局部变量等
    };
*/
// 这个构造函数不能被再次调用，因为它不保存在任何地方，只是被创建和调用。因此，这个技巧旨在封装构建单个对象的代码，而无需将来重用。

// ! 3 构造器模式测试 new.target
// 在一个函数内部，我们可以使用 new.target 属性来检查它是否被使用 new 进行调用了
// 对于常规调用，它为 undefined，对于使用 new 的调用，则等于该函数：
function User() {
  console.log("**", new.target);
}
User(); // ~ undefined
new User(); // ~ [Function: User]

/*
    它可以被用在函数内部，来判断该函数是被通过 new 调用的“构造器模式”，还是没被通过 new 调用的“常规模式”。

    我们也可以让 new 调用和常规调用做相同的工作，像这样：
*/
function User(name) {
  if (!new.target) {
    // 如果你没有通过 new 运行我
    return new User(name); // ……我会给你添加 new
  }

  this.name = name;
}

let john = User("John"); // 将调用重定向到新用户
console.log(john.name); // John

/*
    这种方法有时被用在库中以使语法更加灵活。这样人们在调用函数时，无论是否使用了 new，程序都能工作。

    不过，到处都使用它并不是一件好事，因为省略了 new 使得很难观察到代码中正在发生什么。
    而通过 new 我们都可以知道这创建了一个新对象。
*/

// ! 4 return
// 通常，构造器没有 return 语句。它们的任务是将所有必要的东西写入 this，并自动转换为结果。
// ~ 如果有return 规则为：
// ~ 1 如果return 对象，则返回的是这个对象，而不是this
// ~ 2 如果返回的是一个原始类型，则忽略--> 还是返回this
function BigUser() {
  this.name = "John";

  return { name: "Godzilla" }; // <-- 返回这个对象
}

console.log(new BigUser().name); // Godzilla，得到了那个对象

// ! 如果返回null  或者空 ---> 默认也是this
function SmallUser() {
  this.name = "John";
  return null; // ~ 或者直接return  默认也是返回this
}
console.log(new SmallUser().name); // John

// ! 5  little tips
// 如果没有参数，我们可以省略 new 后的括号：
// ~ let user1 = new User; // <-- 没有参数
// 等同于
let user2 = new User();

// ! 6 test
// 1 是否可以创建像 new A() == new B() 这样的函数 A 和 B？
// ~ 可以： 根据构造函数返回对象这个特性
let obj = {};
function A() {
  return obj;
}
function B() {
  return obj;
}
let a = new A();
let b = new B();
console.log(a == b);

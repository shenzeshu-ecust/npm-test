// 有两种类型的对象属性。

// 1 数据属性。我们已经知道如何使用它们了。到目前为止，我们使用过的所有属性都是数据属性。
// 2 它是 访问器属性（accessor property）。它们本质上是用于获取和设置值的函数，但从外部代码来看就像常规属性。

// ! 1 getter 和 setter
// 访问器属性由 “getter” 和 “setter” 方法表示。在对象字面量中，它们用 get 和 set 表示：
let user = {
  name: "John",
  surname: "Smith",

  get fullName() {
    return `${this.name} ${this.surname}`;
  },

  set fullName(value) {
    [this.name, this.surname] = value.split(" ");
  },
};

// set fullName 将以给定值执行
user.fullName = "Alice Cooper";

console.log(user.name); // Alice
console.log(user.surname); // Cooper

// ! 2 访问器描述符
// 访问器属性的描述符与数据属性的不同。
// ~ 对于访问器属性，没有 value 和 writable，但是有 get 和 set 函数。
/*
所以访问器描述符可能有：

    get —— 一个没有参数的函数，在读取属性时工作，
    set —— 带有一个参数的函数，当属性被设置时调用，
    enumerable —— 与数据属性的相同，
    configurable —— 与数据属性的相同。

*/
let person = {
  name: "John",
  surname: "Smith",
};
Object.defineProperty(person, "fullName", {
  get() {
    return `${this.name} ${this.surname}`;
  },

  set(value) {
    [this.name, this.surname] = value.split(" ");
  },
});
console.log(person.fullName); // John Smith
for (let i in person) {
  // ~ 默认枚举属性为false
  console.log(i); // name、surname
}
/*
~ 请注意，一个属性要么是访问器（具有 get/set 方法），要么是数据属性（具有 value），但不能两者都是。

~ 如果我们试图在同一个描述符中同时提供 get 和 value，则会出现错误
*/

// ! 3 更聪明的 getter/setter
// getter/setter 可以用作“真实”属性值的包装器，以便对它们进行更多的控制。

// 例如，如果我们想禁止太短的 user 的 name，我们可以创建一个 setter name，并将值存储在一个单独的属性 _name 中：
let u = {
  // ~ name 被存储在 _name 属性中，并通过 getter 和 setter 进行访问。
  get name() {
    return this._name;
  },

  set name(value) {
    if (value.length < 4) {
      console.log("Name is too short, need at least 4 characters");
      return;
    }
    this._name = value;
  },
};

u.name = "Pete";
console.log(u.name); // Pete

u.name = ""; // Name 太短了……
// ~ 从技术上讲，外部代码可以使用 user._name 直接访问 name。但是，这儿有一个众所周知的约定，即以下划线 "_" 开头的属性是内部属性，不应该从对象外部进行访问。
console.log(u._name); // ~ 也能访问

// ! 4 兼容性
// 访问器的一大用途是，它们允许随时通过使用 getter 和 setter 替换“正常的”数据属性，来控制和调整这些属性的行为。

function User(name, birthday) {
  this.name = name;
  this.birthday = birthday;
  // ~ 现在旧的代码也可以工作，而且我们还拥有了一个不错的附加属性。
  // 年龄是根据当前日期和生日计算得出的
  Object.defineProperty(this, "age", {
    get() {
      let todayYear = new Date().getFullYear();
      return todayYear - this.birthday.getFullYear();
    },
  });
}

let john = new User("John", new Date(1992, 6, 1));

console.log(john.birthday); // birthday 是可访问的
console.log(john.age); // ……age 也是可访问的

// ! 1 我们可以把一个方法作为一个整体赋值给类。这样的方法被称为 静态的（static）
// ~ 法1：在一个类的声明中，它们以 static 关键字开头
class User {
  static staticMethod() {
    // ~ this 的值是类构造器 User 自身（“点符号前面的对象”规则）
    console.log(this === User); // True
  }
}
User.staticMethod();

// ~ 法2：也可以这么添加静态属性
User.logName = function () {
  console.log("szs");
};

// 静态方法用于实现属于整个类，但不属于该类任何特定对象的函数（不是实例的）。

// ! 2 工厂方法
/*
比如说，我们需要通过多种方式来创建一篇文章：

    1 通过用给定的参数来创建（title，date 等）。
    2 使用今天的日期来创建一个空的文章。
    3 ……其它方法。

第一种方法我们可以通过 constructor 来实现。对于第二种方式，我们可以创建类的一个静态方法来实现。
*/
class Article {
  constructor(title, date) {
    this.title = title;
    this.date = date;
  }
  static createTodays() {
    // ~ this === Article
    return new this("Today is digest", new Date());
  }
}
// 调用静态方法
let article = Article.createTodays();

// ! 3 静态属性
// 这是一个最近添加到 JavaScript 的特性。 示例可以在最近的 Chrome 工作。
class Publisher extends Article {
  static publisher = "LV";
}
console.log(Publisher.publisher);

// 等同于直接给类加属性
Publisher.subscriber = "zsz";

// ! 4 继承静态属性和方法

// ~ 静态属性和方法是可被继承的。
class Animal {
  static planet = "Earth";

  constructor(name, speed) {
    this.speed = speed;
    this.name = name;
  }

  run(speed = 0) {
    this.speed += speed;
    console.log(`${this.name} runs with speed ${this.speed}.`);
  }

  static compare(animalA, animalB) {
    return animalA.speed - animalB.speed;
  }
}

// 继承于 Animal
class Rabbit extends Animal {
  hide() {
    console.log(`${this.name} hides!`);
  }
}

let rabbits = [new Rabbit("White Rabbit", 10), new Rabbit("Black Rabbit", 5)];
// ~ 可以调用通过基类 继承的方法
rabbits.sort(Rabbit.compare);

// ? 为什么可以继承基类的静态属性、方法？  不是在Animal.prototype上的才能被继承吗
// ~ 通过原型！extends 让 Rabbit 的 [[Prototype]] 指向了 Animal（Rabbit.[[Prototype]] = Animal）。

// ! 所以， Rabbit extends Animal 创建了两个 [[Prototype]] 引用：
// ~ 1 Rabbit 函数原型继承自 Animal 函数。
// ~ 2 Rabbit.prototype 原型继承自 Animal.prototype。

// * So, 结果就是，继承对 常规方法（原型方法） 和 静态方法 都有效。
// 对于静态方法
console.log(Rabbit.__proto__ == Animal); // true
// 对于常规方法
console.log(Rabbit.prototype.__proto__ === Animal.prototype); // true

// TEST:
// ! class Rabbit extends Object / class Rabbit 显式继承、隐式继承了Object,两者区别？
class Rabbit1 {
  constructor(name) {
    this.name = name;
  }
}

let rabbit = new Rabbit1("Rab");

// hasOwnProperty 方法来自于 Object.prototype
console.log(rabbit.hasOwnProperty("name")); // true

// ~ 直接显示继承Object后
class Rabbit2 extends Object {
  constructor(name) {
    super(name); // 必须有这句 才有this
    this.name = name;
  }
}

let rabbit2 = new Rabbit2("Rab");

console.log(rabbit2.hasOwnProperty("name")); // true

// * extends意味着设置了两个原型
console.log(Rabbit2.prototype.__proto__ === Object.prototype); // (1) true
console.log(Rabbit2.__proto__ === Object); // (2) true

// ~ 现在 Rabbit 可以通过 Rabbit 访问 Object 的静态方法
console.log(Rabbit2.getOwnPropertyNames({ a: 1 })); // ['a']
// ~ Function.prototype 也有一些“通用”函数方法，例如 call 和 bind 等。在上述的两种情况下它们都是可用的，因为对于内建的 Object 构造函数而言，Object.__proto__ === Function.prototype。
console.log(Object.__proto__ === Function.prototype); // ~ true

// ! 1 类继承 关键字 extends
class Animal {
  constructor(name) {
    this.speed = 0;
    this.name = name;
  }
  run(speed) {
    this.speed = speed;
    console.log(`${this.name} runs with speed ${this.speed}.`);
  }
  stop() {
    this.speed = 0;
    console.log(`${this.name} stands still.`);
  }
}
class Rabbit extends Animal {
  hide() {
    console.log(`${this.name} hides!`);
  }
}

let rabbit = new Rabbit("White Rabbit");
// 在内部，关键字 extends 使用了很好的旧的原型机制进行工作。它将 Rabbit.prototype.[[Prototype]] 设置为 Animal.prototype。
// 所以，如果在 Rabbit.prototype 中找不到一个方法，JavaScript 就会从 Animal.prototype 中获取该方法。
rabbit.run(5); // White Rabbit runs with speed 5.
rabbit.hide(); // White Rabbit hides!
/*
例如，要查找 rabbit.run 方法，JavaScript 引擎会进行如下检查（如图所示从下到上）：

    1 查找对象 rabbit（没有 run）。
    2 查找它的原型，即 Rabbit.prototype（有 hide，但没有 run）。
    3 查找它的原型，即（由于 extends）Animal.prototype，在这儿找到了 run 方法。

*/

// ~ extend 后面允许任意表达式
function f(phrase) {
  return class {
    say() {
      console.log(phrase);
    }
  };
}
class User extends f("haha ") {}

// ! 2 super 关键字

/*
不希望完全替换父类的方法，而是希望在父类方法的基础上进行调整或扩展其功能。我们在我们的方法中做一些事儿，但是在它之前或之后或在过程中会调用父类方法。

~ Class 为此提供了 "super" 关键字。

    ~ 1 执行 super.method(...) 来调用一个父类方法。
    ~ 2 执行 super(...) 来调用一个父类 constructor（只能在我们的 constructor 中）。

例如，让我们的 cat 在停下来的时候自动 hide：
*/

class Cat extends Animal {
  hide() {
    console.log("Hiding");
  }
  stop() {
    super.stop();
    this.hide();
  }
}
let cat = new Cat("cat");
cat.stop();

// ! 3 箭头函数没有 super

// 正如我们在 深入理解箭头函数 一章中所提到的，箭头函数没有 super。
// 如果被访问，它会从外部函数获取。例如：

class Rabbitt extends Animal {
  stop() {
    setTimeout(() => super.stop(), 1000); // 1 秒后调用父类的 stop
  }
}

// ~ 箭头函数中的 super 与 stop() 中的是一样的，所以它能按预期工作。如果我们在这里指定一个“普通”函数，那么将会抛出错误：
// 意料之外的 super
setTimeout(function () {
  super.stop();
}, 1000); // 报错

// ! 4 重写constructor
// ~ 根据 规范，如果一个类扩展了另一个类并且没有 constructor，那么将生成下面这样的“空” constructor：
class RabbitExample extends Animal {
  // 为没有自己的 constructor 的扩展类生成的
  constructor(...args) {
    super(...args);
  }
}

// ~ 正如我们所看到的，它调用了父类的 constructor，并传递了所有的参数。如果我们没有写自己的 constructor，就会出现这种情况。

/*
~ 继承类的 constructor 必须调用 super(...)，并且 (!) 一定要在使用 this 之前调用。

……但这是为什么呢？这里发生了什么？确实，这个要求看起来很奇怪。

当然，本文会给出一个解释。让我们深入细节，这样你就可以真正地理解发生了什么。

~ 在 JavaScript 中，继承类（所谓的“派生构造器”，英文为 “derived constructor”）的构造函数与其他函数之间是有区别的。
~ 派生构造器具有特殊的内部属性 [[ConstructorKind]]:"derived"。这是一个特殊的内部标签。

* 该标签会影响它的 new 行为：

    ~ 当通过 new 执行一个常规函数时，它将创建一个空对象，并将这个空对象赋值给 this。
    ~ 但是当继承的 constructor 执行时，它不会执行此操作。它期望父类的 constructor 来完成这项工作。

! 因此，派生的 constructor 必须调用 super 才能执行其父类（base）的 constructor，否则 this 指向的那个对象将不会被创建。并且我们会收到一个报错。

为了让 Rabbit 的 constructor 可以工作，它需要在使用 this 之前调用 super()，就像下面这样：
*/
class Animal {
  constructor(name) {
    this.speed = 0;
    this.name = name;
  }

  // ...
}

class Rabbit2 extends Animal {
  constructor(name, earLength) {
    super(name); // ~
    this.earLength = earLength;
  }

  // ...
}

// 现在可以了
let rabbit1 = new Rabbit2("White Rabbit", 10);
console.log(rabbit1.name); // White Rabbit
console.log(rabbit1.earLength); // 10

// ! 5 重写 类字段的诡异之处
// 我们不仅可以重写方法，还可以重写类字段。
// 不过，当我们在父类构造器中访问一个被重写的字段时，有一个诡异的行为，这与绝大多数其他编程语言都很不一样。

class Animal {
  name = "animal";

  constructor() {
    console.log(this.name); // (*)
  }
}

class Rabbit3 extends Animal {
  name = "rabbit";
}

new Animal(); // animal
new Rabbit3(); // animal

/*
  这里，Rabbit 继承自 Animal，并且用它自己的值重写了 name 字段。
  因为 Rabbit 中没有自己的构造器，所以 Animal 的构造器被调用了。
  
  有趣的是在这两种情况下：new Animal() 和 new Rabbit()，在 (*) 行的 console.log 都打印了 animal。
  
  ~ 换句话说，父类构造器总是会使用它自己字段的值，而不是被重写的那一个。
  
  古怪的是什么呢？
  如果这还不清楚，那么让我们用方法来进行比较。
*/

// 这里是相同的代码，但是我们调用 this.showName() 方法而不是 this.name 字段：

class Animal {
  showName() {
    // 而不是 this.name = 'animal'
    console.log("animal");
  }

  constructor() {
    this.showName(); // 而不是 console.log(this.name);
  }
}

class Rabbit extends Animal {
  showName() {
    console.log("rabbit");
  }
}

new Animal(); // animal
new Rabbit(); // rabbit

/*
请注意：这时的输出是不同的。

这才是我们本来所期待的结果。当父类构造器在派生的类中被调用时，它会使用被重写的方法。

~ ……但对于类字段并非如此。正如前文所述，父类构造器总是使用父类的字段。

这里为什么会有这样的区别呢？

! 实际上，原因在于字段初始化的顺序。类字段是这样初始化的：

    ~ 1 对于基类（还未继承任何东西的那种），在构造函数调用前初始化。
    ~ 2 对于派生类，在 super() 后立刻初始化。

在我们的例子中，Rabbit 是派生类，里面没有 constructor()。正如先前所说，这相当于一个里面只有 super(...args) 的空构造器。

* 所以，new Rabbit() 调用了 super()，因此它执行了父类构造器，并且（根据派生类规则）只有在此之后，它的类字段才被初始化。在父类构造器被执行的时候，Rabbit 还没有自己的类字段，这就是为什么 Animal 类字段被使用了。

这种字段与方法之间微妙的区别只特定于 JavaScript。
幸运的是，这种行为仅在一个被重写的字段被父类构造器使用时才会显现出来。接下来它会发生的东西可能就比较难理解了，所以我们要在这里对此行为进行解释。
如果出问题了，我们可以通过使用方法或者 getter/setter 替代类字段，来修复这个问题。
*/

// ! 6 [[HomeObject]]
// 问题
let animall = {
  name: "Animal",
  eat() {
    console.log(`${this.name} eats`);
  },
};
let rabbitt = {
  __proto__: animall,
  eat() {
    // 相当于 rabbitt.eat.call(this)
    this.__proto__.eat.call(this); // (*)
  },
};

let longEarr = {
  __proto__: rabbit,
  eat() {
    // 相当于 rabbitt.eat.call(this)
    this.__proto__.eat.call(this); // (**)
  },
};

longEarr.eat(); // ~ Error: Maximum call stack size exceeded
/*
原因可能不那么明显，但是如果我们跟踪 longEar.eat() 调用，就可以发现原因。
~ 在 (*) 和 (**) 这两行中，this 的值都是当前对象（longEar）。这是至关重要的一点：所有的对象方法都将当前对象作为 this，而非原型或其他什么东西。
~ 因此，在 (*) 和 (**) 这两行中，this.__proto__ 的值是完全相同的：都是 rabbit。它们俩都调用的是 rabbit.eat，它们在不停地循环调用自己，而不是在原型链上向上寻找方法。

--- 用this无法解决这个问题
*/

/*
JavaScript 为函数添加了一个特殊的内部属性：[[HomeObject]]。
~ 当一个函数被定义为类或者对象方法时，它的 [[HomeObject]] 属性就成为了该对象。
~ 然后 super 使用它来解析（resolve）父原型及其方法。
让我们看看它是怎么工作的，首先，对于普通对象：
*/
let animal = {
  name: "Animal",
  eat() {
    // animal.eat.[[HomeObject]] == animal
    console.log(`${this.name} eats.`);
  },
};

let rabbit3 = {
  __proto__: animal,
  name: "Rabbit",
  eat() {
    // rabbit.eat.[[HomeObject]] == rabbit
    super.eat();
  },
};

let longEar = {
  __proto__: rabbit3,
  name: "Long Ear",
  eat() {
    // longEar.eat.[[HomeObject]] == longEar
    super.eat();
  },
};

// 正确执行
longEar.eat(); // Long Ear eats.
/*
  它基于 [[HomeObject]] 运行机制按照预期执行。一个方法，例如 longEar.eat，知道其 [[HomeObject]] 并且从其原型中获取父方法。并没有使用 this。
  方法并不是“自由”的
  
  正如我们之前所知道的，函数通常都是“自由”的，并没有绑定到 JavaScript 中的对象。正因如此，它们可以在对象之间复制，并用另外一个 this 调用它。
  
 ~  [[HomeObject]] 的存在违反了这个原则，因为方法记住了它们的对象。[[HomeObject]] 不能被更改，所以这个绑定是永久的。
 ~ 在 JavaScript 语言中 [[HomeObject]] 仅被用于 super。所以，如果一个方法不使用 super，那么我们仍然可以视它为自由的并且可在对象之间复制。但是用了 super 再这样做可能就会出错。
  */

// ! 7 方法，不是函数属性
// [[HomeObject]] 是为类和普通对象中的[方法]定义的。
// ~ 但是对于对象而言，方法必须确切指定为 method(){}，而不是 "method: function()"[这样的叫做对象的 属性]。
let a = {
  // * 这种是属性
  // ~ 改为 eat() {} 则不会报错
  eat: function () {},
};

let b = {
  __proto__: a,
  eat: function () {
    super.eat();
  },
};
b.eat(); // 报错：错误调用super!  因为这里没有[[HomeObject]]

/*
! 总结

    1 想要扩展一个类：class Child extends Parent：
        这意味着 Child.prototype.__proto__ 将是 Parent.prototype，所以方法会被继承。
    2 重写一个 constructor：
        在使用 this 之前，我们必须在 Child 的 constructor 中将父 constructor 调用为 super()。
    3 重写一个方法：
        我们可以在一个 Child 方法中使用 super.method() 来调用 Parent 方法。
    4 内部：
        方法在内部的 [[HomeObject]] 属性中记住了它们的类/对象。这就是 super 如何解析父方法的。
        因此，将一个带有 super 的方法从一个对象复制到另一个对象是不安全的。

补充：

    5 箭头函数没有自己的 this 或 super，所以它们能融入到就近的上下文中，像透明似的。

*/

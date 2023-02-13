// ! 1 受保护的属性
class CoffeeMachine {
  // ~ 通常，受保护的属性通常以下划线 _ 作为前缀。
  _waterAmount = 0; // 内部水量
  set waterAmount(value) {
    if (value < 0) value = 0;
    this._waterAmount = value;
  }
  get waterAmount() {
    return this._waterAmount;
  }

  constructor(power) {
    this._power = power;
    console.log(`Created a coffee-machine, power: ${power}`);
  }
  // ~ 只读的power——只设置getter， 不设置setter
  get power() {
    return this._power;
  }
}

let coffeeMachine = new CoffeeMachine(100);

// 加水
coffeeMachine.waterAmount = -10; // _waterAmount 将变为 0，而不是 -10
// 现在访问已受到控制，因此将水量的值设置为小于零的数变得不可能。

// ~ 只读属性  设置无效
coffeeMachine.power = 25;
console.log(coffeeMachine.power); // 100

// ! 2 get.../set...函数
// 上面使用了get set语法，但是大部分时间首选get.../set...函数
class CoffeeMachine1 {
  _waterAmount = 0;

  setWaterAmount(value) {
    if (value < 0) value = 0;
    this._waterAmount = value;
  }

  getWaterAmount() {
    return this._waterAmount;
  }
}

new CoffeeMachine1().setWaterAmount(100);
// 这看起来有点长，但函数更灵活。它们可以接受多个参数（即使我们现在还不需要）。
// 另一方面，get/set 语法更短，所以最终没有严格的规定，而是由你自己来决定。

/*

~ 受保护的字段是可以被继承的

  ~ 如果我们继承 class MegaMachine extends CoffeeMachine，那么什么都无法阻止我们从新的类中的方法访问 this._waterAmount 或 this._power。

  ~ 所以受保护的字段是自然可被继承的。与我们接下来将看到的私有字段不同。

*/

// ! 3 私有的 “#waterLimit”;与受保护的字段不同，私有字段由语言本身强制执行。
// 这是一个最近添加到 JavaScript 的特性。 JavaScript 引擎不支持（或部分支持），需要 polyfills。
// ~ 私有属性和方法应该以 # 开头。它们只在类的内部可被访问。
class CoffeeMachine2 {
  #waterLimit = 200;

  #fixWaterAmount(value) {
    if (value < 0) return 0;
    if (value > this.#waterLimit) return this.#waterLimit;
  }

  setWaterAmount(value) {
    this.#waterLimit = this.#fixWaterAmount(value);
  }
}

let coffeeMachine2 = new CoffeeMachine2();

// ~ 不能从类的外部访问类的私有属性和方法
coffeeMachine2.#fixWaterAmount(123); // Error
coffeeMachine2.#waterLimit = 1000; // Error

// ~ 在语言级别，# 是该字段为私有的特殊标志。我们无法从外部或从继承的类中访问它。

// ~ 私有字段与公共字段不会发生冲突。我们可以同时拥有私有的 #waterAmount 和公共的 waterAmount 字段。

// 例如，让我们使 waterAmount 成为 #waterAmount 的一个访问器：
class CoffeeMachine3 {
  #waterAmount = 0;
  get waterAmount() {
    return this.#waterAmount;
  }

  set waterAmount(value) {
    if (value < 0) value = 0;
    this.#waterAmount = value;
  }
}

let machine = new CoffeeMachine3();

machine.waterAmount = 100;
console.log(machine.#waterAmount); // Error

// ~ 但是如果我们继承自 CoffeeMachine，那么我们将无法直接访问 #waterAmount。我们需要依靠 waterAmount getter/setter：

class MegaCoffeeMachine extends CoffeeMachine {
  method() {
    console.log(this.#waterAmount); // Error: can only access from CoffeeMachine
  }
}

// ! 私有字段不能通过 this[name] 访问

// 对于私有字段来说，这是不可能的：this['#name'] 不起作用。这是确保私有性的语法限制。
class User {
  sayHi() {
    let fieldName = "name"; // 正常可以this[name]访问
    console.log(`Hello, ${this[fieldName]}`);
  }
}

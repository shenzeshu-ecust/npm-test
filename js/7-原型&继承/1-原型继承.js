// ! 1 [[Prototype]] 隐式原型
// ~ 在 JavaScript 中，对象有一个特殊的隐藏属性 [[Prototype]]（如规范中所命名的），它要么为 null，要么就是对另一个对象的引用。该对象被称为“原型”

// 属性 [[Prototype]] 是内部的而且是隐藏的，但是这儿有很多设置它的方式。其中之一就是使用特殊的名字 __proto__，就像这样：
let animal = {
  eats: true,
  walk() {
    console.log("Animal walk");
  },
};
let rabbit = {
  jumps: true,
};
let longEar = {
  earLength: 10,
  __proto__: rabbit, // ~ 现在，如果我们从 longEar 中读取一些它不存在的内容，JavaScript 会先在 rabbit 中查找，然后在 animal 中查找。
};
rabbit.__proto__ = animal; // 设置 rabbit.[[Prototype]] = animal； 将 animal 设置为 rabbit 的原型。
console.log(rabbit.eats); // true 也能访问到
// ~ 在这儿我们可以说 "animal 是 rabbit 的原型"，或者说 "rabbit 的原型是从 animal 继承而来的"。

/*
~ 设置原型的时候只有3个限制：

    ~ 1 引用不能形成闭环。如果我们试图给 __proto__ 赋值但会导致引用形成闭环时，JavaScript 会抛出错误。
    ~ 2 __proto__ 的值可以是对象，也可以是 null。而其他的类型都会被忽略。
    ~ 3 只能有一个 [[Prototype]]。一个对象不能从其他两个对象获得继承。
*/

// ! 2 __proto__和[[Prototype]]区别
/*

!  __proto__ 是 [[Prototype]] 的因历史原因而留下来的 getter/setter

初学者常犯一个普遍的错误，就是不知道 __proto__ 和 [[Prototype]] 的区别。

~ 1 请注意，__proto__ 与内部的 [[Prototype]] 不一样。__proto__ 是 [[Prototype]] 的 getter/setter。稍后，我们将看到在什么情况下理解它们很重要，在建立对 JavaScript 语言的理解时，让我们牢记这一点。
~ 2 __proto__ 属性有点过时了。它的存在是出于历史的原因，
~ 3 现代编程语言建议我们应该使用函数 Object.getPrototypeOf/Object.setPrototypeOf 来取代 __proto__ 去 get/set 原型.

~ 4 根据规范，__proto__ 必须仅受浏览器环境的支持。但实际上，包括服务端在内的所有环境都支持它，因此我们使用它是非常安全的。

*/
// ! 3 写入不使用原型
// ~ 原型仅用于读取属性, 对于写入/删除操作可以直接在对象上进行。
rabbit.walk = function () {
  console.log("Rabbit! Bounce-bounce!");
};

rabbit.walk(); // Rabbit! Bounce-bounce!
// ~ 访问器（accessor）属性是一个例外，因为赋值（assignment）操作是由 setter 函数处理的。因此，写入此类属性实际上与调用函数相同。
let user = {
  name: "John",
  surname: "Smith",

  set fullName(value) {
    [this.name, this.surname] = value.split(" ");
  },

  get fullName() {
    return `${this.name} ${this.surname}`;
  },
};

let admin = {
  __proto__: user,
  isAdmin: true,
};

console.log(admin.fullName); // John Smith (*)

// setter triggers!
admin.fullName = "Alice Cooper"; // (**)

console.log(admin.fullName); // Alice Cooper，admin 的内容被修改了
console.log(user.fullName); // John Smith，user 的内容被保护了

// ! 4 this的指向
/*
 * 如果我们调用 obj.method()，而且 method 是从原型中获取的，this 仍然会引用 obj。因此，方法始终与当前对象一起使用，即使方法是继承的。
 */
// animal 有一些方法
let animal2 = {
  walk() {
    if (!this.isSleeping) {
      console.log(`I walk`);
    }
  },
  sleep() {
    // ~ this 根本不受原型的影响。
    this.isSleeping = true;
  },
};

let rabbit2 = {
  name: "White Rabbit",
  __proto__: animal2,
};

// 修改 rabbit.isSleeping
rabbit2.sleep();
// ~ 在一个方法调用（无论这个方法来自对象还是原型）中，this 始终是点符号 . 前面的对象。
console.log(rabbit2.isSleeping); // ? true； 调用 rabbit.sleep() 会在 rabbit 对象上设置 this.isSleeping
console.log(animal2.isSleeping); // undefined（原型中没有此属性）

// ! 5 for...in循环会迭代 继承的属性; Object.keys()不会迭代继承的属性
let person = {
  height: 170,
  name: "hhh",
};
let szs = {
  __proto__: person,
  walk: true,
};
// ~ Object.keys 只返回自己的 key
console.log(Object.keys(szs)); // ['walk]
// ~ for..in 会遍历自己以及继承的键
for (let key in szs) {
  console.log(key); // * walk height name
}

// ~ 如果这不是我们想要的，并且我们想排除继承的属性，那么这儿有一个内建方法 obj.hasOwnProperty(key)：如果 obj 具有自己的（非继承的）名为 key 的属性，则返回 true。
for (let prop in szs) {
  if (szs.hasOwnProperty(prop)) {
    console.log(`Own property:${prop}`); // walk
  } else {
    console.log(`Inherited property:${prop}`); // height name
  }
}

// ? szs.hasOwnProperty() 方法来自哪里
// ~ 继承自Object的 Object.prototype.hasOwnProperty()

// ? 那为什么for..in的时候 szs没有显示出hasOwnProperty
// ~ 这个方法设置为不可枚举 enumerable: false
// ~ 类似 Object.keys 和 Object.values 等几乎所有其他键/值获取方法都会忽略继承的属性，仅对对象本身起作用。

// TEST
// 1 使用原型, 输出什么
let animal3 = {
  jumps: null,
};
let rabbit3 = {
  __proto__: animal3,
  jumps: true,
};

console.log(rabbit3.jumps); // ? (1) true

delete rabbit3.jumps;

console.log(rabbit3.jumps); // ? (2) null

delete animal3.jumps;

console.log(rabbit3.jumps); // ? (3) undefined

// 2 哪一个对象会接收到 full 属性：animal 还是 rabbit？
let animal4 = {
  eat() {
    this.full = true;
  },
};

let rabbit4 = {
  __proto__: animal4,
};
// ~ 这是因为 this 是点符号前面的这个对象，因此 rabbit.eat() 修改了 rabbit。
rabbit4.eat();

console.log(animal4.full); // ~ undefined
console.log(rabbit4.full); // ~ true

// ! 6 从原型获取属性（方法）快 还是从自身快
/*
 *  在现代引擎中，从性能的角度来看，我们是从对象还是从原型链获取属性都是没区别的。它们（引擎）会记住在哪里找到的该属性，并在下一次请求中重用它。

    例如，对于 pockets.glasses 来说，它们（引擎）会记得在哪里找到的 glasses（在 head 中），这样下次就会直接在这个位置进行搜索。
    并且引擎足够聪明，一旦有内容更改，它们就会自动更新内部缓存，因此，该优化是安全的。

 */

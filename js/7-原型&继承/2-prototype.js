// ! 1 F.prototype 仅用在 new F (即 构造函数创建实例) 时
// 如果在创建之后，F.prototype 属性有了变化（F.prototype = <another object>），那么通过 new F 创建的新对象也将随之拥有新的对象作为 [[Prototype]]，但已经存在的对象将保持旧有的值。

// ! 2 每个函数都有 "prototype" 属性
// ~ 默认的 "prototype" 是一个只有属性 constructor 的对象，属性 constructor 指向构造函数自身。
function Rabbit(name) {
  this.name = name;
}

/* 默认的 prototype
 * Rabbit.prototype = { constructor: Rabbit };
 */
console.log(Rabbit.prototype.constructor === Rabbit); // true

let rabbit = new Rabbit("White Rabbit");

// ~ constructor 属性可以通过 [[Prototype]] 给所有 rabbits（实例） 使用：
console.log(rabbit.constructor === Rabbit); // true

// 但是，关于 "constructor" 最重要的是……
// ! 3 JavaScript 自身并不能确保正确的 "constructor" 函数值
// 是的，它存在于函数的默认 "prototype" 中，但仅此而已。之后会发生什么 —— 完全取决于我们。
// 特别是，如果我们将整个默认 prototype 替换掉，那么其中就不会有 "constructor" 了。

// 例如
function Person() {}
Person.prototype = {
  // * 被替换了
  jumps: true,
};
let p = new Person();
console.log(p.constructor === Person); // false

// ~ 因此，为了确保正确的 "constructor"，我们可以选择添加/删除属性到默认 "prototype"，而不是将其整个覆盖：
function People() {}
// 不要将 Rabbit.prototype 整个覆盖
// 可以向其中添加内容
People.prototype.jumps = true;
// ~ 默认的 Rabbit.prototype.constructor 被保留了下来

// ~ 或者，也可以手动重新创建 constructor 属性：
People.prototype = {
  jumps: true,
  constructor: People, // 这样的 constructor 也是正确的，因为我们手动添加了它
};

// TEST
// 1 修改prototype
function Cat() {}
Cat.prototype = {
  eats: true,
};
let cat = new Cat();
console.log(cat.eats); // true

/*
    Cat.prototype = {};
    ~ Cat.prototype 的赋值操作为新对象设置了 [[Prototype]]，但它不影响已有的对象。
    console.log(cat.eats); // ? true
*/

/*
    Cat.prototype.eats = false;
    console.log(cat.eats); // ? false
*/

/*
    delete cat.eats
    ~ 所有 delete 操作都直接应用于对象。这里的 delete rabbit.eats 试图从 rabbit 中删除 eats 属性，但 rabbit 对象并没有 eats 属性。所以这个操作不会有任何影响。
    console.log(cat.eats); // ? true
*/

delete cat.prototype.eats;
console.log(cat.eats); // ? undefined

// 2 使用相同的构造函数创建一个对象
//  可以这样吗？  let obj2 = new obj.constructor();
// 如果我们确信 "constructor" 属性具有正确的值，那么就可以使用这种方法。
// 例如，如果我们不触碰默认的 "prototype"，那么这段代码肯定可以正常运行：
function User(name) {
  this.name = name;
}

let user = new User("John");
let user2 = new user.constructor("Pete");

console.log(user2.name); // Pete (worked!)
// ~ 它起作用了，因为 User.prototype.constructor == User。
// ? ……但是如果有人，重写了 User.prototype，并忘记可重新创建 constructor 以引用 User，那么上面这段代码就会运行失败。
User.prototype = {}; // (*)

let user3 = new user.constructor("Pete");
console.log(user3.name); // undefined
/*
这是 new user.constructor('Pete') 的工作流程：

    首先，它在 user 中寻找 constructor。没找到。
    然后它追溯原型链。user 的原型是 User.prototype，它也没有 constructor（因为我们“忘记”在右侧设定它了）。
    再向上追溯，User.prototype 是一个普通对象 {}，其原型是 Object.prototype。
    最终，对于内建的 Object.prototype，有一个内建的 Object.prototype.constructor == Object。所以就用它了。

所以，最终我们得到了 let user2 = new Object('Pete')。

可能这不是我们想要的。我们想创建 new User 而不是 new Object。这就是缺少 constructor 的结果。

（以防你好奇，new Object(...) 调用会将其参数转换为对象。这是理论上的，在实际中没有人会调用 new Object 并传入一个值，通常我们也不会使用 new Object 来创建对象）。
*/

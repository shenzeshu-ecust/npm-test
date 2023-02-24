/*
Reflect 是一个内建对象，可简化 Proxy 的创建。

~ Reflect API 旨在补充 Proxy。对于任意 Proxy 捕捉器，都有一个带有相同参数的 Reflect 调用。我们应该使用它们将调用转发给目标对象。
~ 前面所讲过的内部方法，例如 [[Get]] 和 [[Set]] 等，都只是规范性的，不能直接调用。
~ Reflect 对象使调用这些内部方法成为了可能。它的方法是内部方法的最小包装。

以下是执行相同操作和 Reflect 调用的示例：

操作 	                  Reflect 调用 	                  内部方法
obj[prop] 	        Reflect.get(obj, prop) 	            [[Get]]
obj[prop] = value 	Reflect.set(obj, prop, value) 	    [[Set]]
delete obj[prop] 	Reflect.deleteProperty(obj, prop) 	[[Delete]]
new F(value) 	    Reflect.construct(F, value) 	    [[Construct]]
*/

let u = {};
Reflect.set(u, "name", "szs");
console.log(u.name); // szs

// 尤其是，Reflect 允许我们将操作符（new，delete，……）作为函数（Reflect.construct，Reflect.deleteProperty，……）执行调用。这是一个有趣的功能，但是这里还有一点很重要。

// ~ 对于每个可被 Proxy 捕获的内部方法，在 Reflect 中都有一个对应的方法，其名称和参数与 Proxy 捕捉器相同。

// 所以，我们可以使用 Reflect 来将操作转发给原始对象。

// 在下面这个示例中，捕捉器 get 和 set 均透明地（好像它们都不存在一样）将读取/写入操作转发到对象，并显示一条消息：
let user = {
  name: "John",
};

user = new Proxy(user, {
  get(target, prop, receiver) {
    console.log(`GET ${prop}`);
    return Reflect.get(target, prop, receiver); // (1)
  },
  set(target, prop, val, receiver) {
    console.log(`SET ${prop}=${val}`);
    return Reflect.set(target, prop, val, receiver); // (2)
  },
});

let name = user.name; // 显示 "GET name"
user.name = "Pete"; // 显示 "SET name=Pete"
/*

    Reflect.get 读取一个对象属性。
   ~ Reflect.set 写入一个对象属性，如果写入成功则返回 true，否则返回 false。


   在大多数情况下，我们可以不使用 Reflect 完成相同的事情，例如，用于读取属性的 Reflect.get(target, prop, receiver) 可以被替换为 target[prop]。尽管有一些细微的差别。
*/

// ! why Reflect.get is better?
//
let user1 = {
  _name: "Guest",
  get name() {
    return this._name;
  },
};

let userProxy = new Proxy(user1, {
  get(target, prop, receiver) {
    return target[prop]; // (*) target = user
  },
});

let admin = {
  __proto__: userProxy,
  _name: "Admin",
};

// 期望输出：Admin
console.log(admin.name); // ? 输出：Guest (?!?)
/*
如果移除代理，一切按预期运行
~ 错误原因：
问题实际上出在代理中，在 (*) 行。

    1 当我们读取 admin.name 时，由于 admin 对象自身没有对应的的属性，搜索将转到其原型。
    2 原型是 userProxy。
    3 从代理读取 name 属性时，get 捕捉器会被触发，并从原始对象返回 target[prop] 属性，在 (*) 行。
   ~ 4 当调用 target[prop] 时，若 prop 是一个 getter，它将在 this=target 上下文中运行其代码。因此，结果是来自原始对象 target 的 this._name，即来自 user。

* 为了解决这种情况，我们需要 get 捕捉器的第三个参数 receiver。它保证将正确的 this 传递给 getter。在我们的例子中是 admin。

? 如何把上下文传递给 getter？对于一个常规函数，我们可以使用 call/apply，但这是一个 getter，它不能“被调用”，只能被访问。
* Reflect.get 可以做到。如果我们使用它，一切都会正常运行。
*/

let userProxyReflect = new Proxy(user1, {
  // ~ 现在 receiver 保留了对正确 this 的引用（即 admin），该引用是在 (*) 行中被通过 Reflect.get 传递给 getter 的。
  get(target, prop, receiver) {
    // receiver = admin
    return Reflect.get(target, prop, receiver);
  },
  // ~ 可以写的更短
  //   get(target, prop, receiver) {
  //     return Reflect.get(...arguments);
  //   },
});
let adminn = {
  __proto__: userProxyReflect,
  _name: "Admin",
};
console.log(adminn.name); // Admin
// Reflect 调用的命名与捕捉器的命名完全相同，并且接受相同的参数。它们是以这种方式专门设计的。
// 因此，return Reflect... 提供了一个安全的方式，可以轻松地转发操作，并确保我们不会忘记与此相关的任何内容。

// proxy 语法
/* 
let proxy = new Proxy(target, handler);

    target —— 是要包装的对象，可以是任何东西，包括函数。
    handler —— 代理配置：带有“捕捉器”（“traps”，即拦截操作的方法）的对象。比如 get 捕捉器用于读取 target 的属性，set 捕捉器用于写入 target 的属性，等等。

对 proxy 进行操作，如果在 handler 中存在相应的捕捉器，则它将运行，并且 Proxy 有机会对其进行处理，否则将直接对 target 进行处理。
*/

// ! 1 没有任何捕捉器handler的代理
let t = {};
let p = new Proxy(t, {});

p.test = 5; // 写入 proxy 对象 (1)
console.log(t.test); // 5 test 属性出现在了 target 中！
console.log(p.test); // 5 我们也可以从 proxy 对象读取它 (2)

/*
由于没有捕捉器，所有对 proxy 的操作都直接转发给了 target。

    写入操作 proxy.test = 5会将值写入 target。
    读取操作 proxy.test 会从 target 返回对应的值。
    迭代 proxy 会从 target 返回对应的值。

~ 我们可以看到，没有任何捕捉器，proxy 是一个 target 的透明包装器（wrapper）—— 透明地将操作转发给 target。。
*/

// ! 2 handler 拦截器
// ~ 对于对象的大多数操作，JavaScript 规范中有一个所谓的“内部方法”，它描述了最底层的工作方式。例如 [[Get]]，用于读取属性的内部方法，[[Set]]，用于写入属性的内部方法，等等。
// ~ 这些方法仅在规范中使用，我们不能直接通过方法名调用它们。

// Proxy 捕捉器会拦截这些方法的调用
/*

对于每个内部方法，此表中都有一个捕捉器：可用于添加到 new Proxy 的 handler 参数中以拦截操作的方法名称：

内部方法 	                    Handler 方法 	                何时触发
[[Get]] 	                    get 	                        读取属性
[[Set]] 	                    set 	                        写入属性
[[HasProperty]] 	            has 	                        in 操作符
[[Delete]] 	                    deleteProperty 	                delete 操作符
[[Call]] 	                    apply 	                        函数调用
[[Construct]] 	                construct 	                    new 操作符
[[GetPrototypeOf]] 	            getPrototypeOf 	                Object.getPrototypeOf
[[SetPrototypeOf]] 	            setPrototypeOf 	                Object.setPrototypeOf
[[IsExtensible]] 	            isExtensible 	                Object.isExtensible
[[PreventExtensions]] 	        preventExtensions 	            Object.preventExtensions
[[DefineOwnProperty]] 	        defineProperty 	                Object.defineProperty, Object.defineProperties
[[GetOwnProperty]] 	            getOwnPropertyDescriptor 	    Object.getOwnPropertyDescriptor, for..in, Object.keys/values/entries
[[OwnPropertyKeys]] 	        ownKeys 	                    Object.getOwnPropertyNames, Object.getOwnPropertySymbols, for..in, Object.keys/values/entries


~ 不变量（Invariant）：
JavaScript 强制执行某些不变量 —— 内部方法和捕捉器必须满足的条件。

其中大多数用于返回值：
    [[Set]] 如果值已成功写入，则必须返回 true，否则返回 false。
    [[Delete]] 如果已成功删除该值，则必须返回 true，否则返回 false。
    ……依此类推，我们将在下面的示例中看到更多内容。

还有其他一些不变量，例如：

    应用于代理（proxy）对象的 [[GetPrototypeOf]]，必须返回与应用于被代理对象的 [[GetPrototypeOf]] 相同的值。
    换句话说，读取代理对象的原型必须始终返回被代理对象的原型。

捕捉器可以拦截这些操作，但是必须遵循上面这些规则。
不变量确保语言功能的正确和一致的行为。完整的不变量列表在 规范 中。如果你不做奇怪的事情，你可能就不会违反它们。


*/

// ! 3 get捕捉器： 修改默认值
// 要拦截读取操作，handler 应该有 get(target, property, receiver) 方法。

/*
读取属性时触发该方法，参数如下：

    target —— 是目标对象，该对象被作为第一个参数传递给 new Proxy，
    property —— 目标属性名，
    receiver —— 如果目标属性是一个 getter 访问器属性，则 receiver 就是本次读取属性所在的 this 对象。
                通常，这就是 proxy 对象本身（或者，如果我们从 proxy 继承，则是从该 proxy 继承的对象）。现在我们不需要此参数，因此稍后我们将对其进行详细介绍。

*/

// 通常，当人们尝试获取不存在的数组项时，他们会得到 undefined，但是我们在这将常规数组包装到代理（proxy）中，以捕获读取操作，并在没有要读取的属性的时返回 0：

let arr = [1, 2, 3];
arr = new Proxy(arr, {
  get(target, property) {
    if (property in target) return target[property];
    else return 0;
  },
});

console.log(arr[1]); // 2
console.log(arr[100]); // 0  （访问不到的被修改为0了）

// 另外的例子——字典默认值返回本身
let dictionary = {
  Hello: "Hola",
  Bye: "Adiós",
};

// ~ 注意这里如何用代理覆盖原变量（代理应该在所有地方都完全替代目标对象。目标对象被代理后，任何人都不应该再引用目标对象。否则很容易搞砸。）
dictionary = new Proxy(dictionary, {
  get(target, property, receiver) {
    if (property in target) return target[property];
    else return property;
  },
});

// 在词典中查找任意短语！
// 最坏的情况也只是它们没有被翻译。
console.log(dictionary["Hello"]); // Hola
console.log(dictionary["Welcome to Proxy"]); // Welcome to Proxy（没有被翻译）

// ! 4 set 捕捉器进行验证
// set(target, property, value, receiver)
// ~ 如果写入操作（setting）成功，set 捕捉器应该返回 true，否则返回 false（触发 TypeError）。

let n = [];
n = new Proxy(n, {
  set(target, property, value, receiver) {
    if (typeof value === "number") {
      target[property] = value;
      return true;
    } else {
      return false;
    }
  },
});

n.push(1);
console.log(n);
// n.push("2"); // TypeError

/*
请注意：数组的内建方法依然有效！值被使用 push 方法添加到数组。当值被添加到数组后，数组的 length 属性会自动增加。我们的代理对象 proxy 不会破坏任何东西。
~ 我们不必重写诸如 push 和 unshift 等添加元素的数组方法，就可以在其中添加检查，因为在内部它们使用代理所拦截的 [[Set]] 操作。

~ 注意：set必须返回 true/false, 如果我们忘记这样做，或返回任何假（falsy）值，则该操作将触发 TypeError。
*/

// ! 5 使用 “ownKeys” 和 “getOwnPropertyDescriptor” 进行迭代
// Object.keys，for..in 循环和大多数其他遍历对象属性的方法都使用内部方法 [[OwnPropertyKeys]]（由 ownKeys 捕捉器拦截) 来获取属性列表。

/*

这些方法在细节上有所不同：

    Object.getOwnPropertyNames(obj) 返回非 symbol 键。
    Object.getOwnPropertySymbols(obj) 返回 symbol 键。
    Object.keys/values() 返回带有 enumerable 标志的非 symbol 键/值（属性标志在 属性标志和属性描述符 一章有详细讲解)。
    for..in 循环遍历所有带有 enumerable 标志的非 symbol 键，以及原型对象的键。

*/

// 我们使用 ownKeys 捕捉器拦截 for..in 对 user 的遍历，并使用 Object.keys 和 Object.values 来跳过以下划线 _ 开头的属性：
let user = {
  name: "John",
  age: 30,
  _password: "***",
};

user = new Proxy(user, {
  ownKeys(target) {
    return Object.keys(target).filter((key) => !key.startsWith("_"));
  },
});

// "ownKeys" 过滤掉了 _password
for (let key in user) console.log(key); // name，然后是 age

// 对这些方法的效果相同：
console.log(Object.keys(user)); // name,age
console.log(Object.values(user)); // John,30

// ? 尽管如此，但如果我们返回对象中不存在的键，Object.keys 并不会列出这些键：

let user1 = {};
user1 = new Proxy(user1, {
  ownKeys(target) {
    return ["a", "b", "c"];
  },
});

console.log(Object.keys(user1)); // []

/*
~ 为什么？原因很简单：Object.keys 仅返回带有 enumerable 标志的属性。
为了检查它，该方法会对每个属性调用内部方法 [[GetOwnProperty]] 来获取 它的描述符（descriptor）。
在这里，由于没有属性，其描述符为空，没有 enumerable 标志，因此它被略过。

为了让 Object.keys 返回一个属性，我们需要它要么 ① 存在于带有 enumerable 标志的对象，
要么 ② 我们可以拦截对 [[GetOwnProperty]] 的调用（捕捉器 getOwnPropertyDescriptor 可以做到这一点)，并返回带有 enumerable: true 的描述符。
*/

let person = {};
person = new Proxy(person, {
  ownKeys(target) {
    // ~ 一旦要获取属性列表就会被调用
    return ["a", "b", "c", "d"];
  },
  getOwnPropertyDescriptor(target, prop) {
    // ~ 被每个属性调用
    return {
      enumerable: true,
      configurable: true,
    };
  },
});
console.log(Object.keys(person)); // [ 'a', 'b', 'c', 'd' ]

let p = {
  a: 1,
  b: 2,
};

p = new Proxy(p, {
  getOwnPropertyDescriptor(target, prop) {
    if (prop === "a") {
      return {
        enumerable: false,
        configurable: true,
      };
    }
    return {
      enumerable: true,
      configurable: true, // 必须得有， 不然报错
    };
  },
});

console.log(Object.keys(p)); // b

// ! 6 具有 “deleteProperty” 和其他捕捉器的受保护属性
// 有一个普遍的约定，即以下划线 _ 开头的属性和方法是内部的。不应从对象外部访问它们。

let userr = {
  name: "John",
  age: 30,
  _password: "***",
  getPassword() {
    return this._password;
  },
};

/*
让我们使用代理来防止对以 _ 开头的属性的任何访问。

我们将需要以下捕捉器：

    get 读取此类属性时抛出错误，
    set 写入属性时抛出错误，
    deleteProperty 删除属性时抛出错误，
    ownKeys 在使用 for..in 和像 Object.keys 这样的的方法时排除以 _ 开头的属性。

*/
userr = new Proxy(userr, {
  get(target, prop) {
    if (prop.startsWith("_")) {
      throw new Error("Access denied");
    }
    let value = target[prop];
    return typeof value === "function" ? value.bind(target) : value; // ~ 为什么我们需要一个函数去调用 value.bind(target)？
    // * 原因是对象方法（例如 userr.getPassword()）必须能够访问 _password
    // ! target 是原始被代理的对象， 它是能够直接访问 _password的
  },
  set(target, prop, value) {
    if (prop.startsWith("_")) {
      throw new Error("Access denied");
    } else {
      target[prop] = value;
      return true; // 不要忘记 return true
    }
  },
  deleteProperty(target, prop) {
    if (prop.startsWith("_")) {
      throw new Error("Access denied");
    } else {
      delete target[prop];
      return true; // 不要忘记 return true
    }
  },
  ownKeys(target) {
    return Object.keys(target).filter((key) => !key.startsWith("_"));
  },
});

// "get" 不允许读取 _password
try {
  console.log(userr._password); // Error: Access denied
} catch (e) {
  console.log(e.message);
}

// "set" 不允许写入 _password
try {
  userr._password = "test"; // Error: Access denied
} catch (e) {
  console.log(e.message);
}

// "deleteProperty" 不允许删除 _password
try {
  delete userr._password; // Error: Access denied
} catch (e) {
  console.log(e.message);
}

// "ownKeys" 将 _password 过滤出去
for (let key in userr) console.log(key); // name age getPassword

// ~ 对象方法可以访问私有属性
console.log(userr.getPassword()); // ***
/*
~ 对 user.getPassword() 的调用会 将 被代理的原对象 user 作为 this（点符号之前的对象会成为 this），因此，当它尝试访问 this._password 时，get 捕捉器将激活（在任何属性读取时，它都会被触发）并抛出错误。
~ 因此，我们在 (*) 行中将对象方法的上下文绑定到原始对象 target。然后，它们将来的调用将使用 target 作为 this，不会触发任何捕捉器。

该解决方案通常可行，但并不理想，因为一个方法可能会将未被代理的对象传递到其他地方，然后我们就会陷入困境：原始对象在哪里，被代理的对象在哪里？
此外，一个对象可能会被代理多次（多个代理可能会对该对象添加不同的“调整”），并且如果我们将未包装的对象传递给方法，则可能会产生意想不到的后果。

因此，在任何地方都不应使用这种代理。

现代 JavaScript 引擎原生支持 class 中的私有属性，这些私有属性以 # 为前缀。无需代理（proxy）。

但是，此类属性有其自身的问题。特别是，它们是不可继承的。

*/

// ! 7 has 捕捉器
let range = {
  start: 1,
  end: 10,
}; // 我们想使用 in 操作符来检查一个数字是否在 range 范围内。

// ~ has 捕捉器会拦截 in 调用。
range = new Proxy(range, {
  has(target, prop) {
    console.log(prop); // 这里获取到的是 5 ， 11
    return prop >= target.start && prop <= target.end;
  },
});

console.log(5 in range); // true
console.log(11 in range); // false

// ! 8 apply  可以将代理（proxy）包装在函数周围。
function delay(f, ms) {
  // 返回一个包装器（wrapper），该包装器将在时间到了的时候将调用转发给函数 f
  return function () {
    // (*)
    setTimeout(() => f.apply(this, arguments), ms);
  };
}
/*
apply(target, thisArg, args) 捕捉器能使代理以函数的方式被调用：

    target 是目标对象（在 JavaScript 中，函数就是一个对象），
    thisArg 是 this 的值。
    args 是参数列表。

    ~ 但是包装函数不会转发属性读取/写入操作或者任何其他操作。进行包装后，就失去了对原始函数属性的访问，例如 name，length 和其他属性
    ! Proxy 的功能要强大得多，因为它可以将所有东西转发到目标对象。
*/

// 用proxy替换掉包装函数
function delay(f, ms) {
  return new Proxy(f, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    },
  });
}
function sayHi(user) {
  console.log(`Hello, ${user}!`);
}

sayHi = delay(sayHi, 3000);

console.log(sayHi.length); // ~ 1 (*) proxy 将“获取 length”的操作转发给目标对象

sayHi("John"); // Hello, John!（3 秒后）

// ~ 结果是相同的，但现在不仅仅调用，而且代理上的所有操作都能被转发到原始函数。所以在 (*) 行包装后的 sayHi.length 会返回正确的结果。
// 我们得到了一个“更丰富”的包装器。

// ! 9 Proxy的局限性
// * 1) 内建对象：内部插槽（Internal slot）（无法拦截内建对象的内部插槽）
// 许多内建对象，例如 Map，Set，Date，Promise 等，都使用了所谓的“内部插槽”。
// ~ 它们类似于属性，但仅限于内部使用，仅用于规范目的。例如，Map 将项目（item）存储在 [[MapData]] 中。内建方法可以直接访问它们，而不通过 [[Get]]/[[Set]] 内部方法。所以 Proxy 无法拦截它们。

// 在类似这样的内建对象被代理后，代理对象没有这些内部插槽，因此内建方法将会失败。
let map = new Map();
let pro = new Proxy(map, {});
pro.set("test", 1); // Error!
// 在内部，一个 Map 将所有数据存储在其 [[MapData]] 内部插槽中。代理对象没有这样的插槽。
// ~ 内建方法 Map.prototype.set 方法试图访问内部属性 this.[[MapData]]，但由于 this=proxy，在 proxy 中无法找到它，只能失败。

// * 解决办法
let proxy2 = new Proxy(map, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value === "function" ? value.bind(target) : value;
  },
});
proxy2.set("terst", 2);
console.log(proxy2.get("terst")); // 2（工作了！）
// ~ 现在它正常工作了，因为 get 捕捉器将函数属性（例如 map.set）绑定到了目标对象（map）本身。
// ~ 与前面的示例不同，proxy.set(...) 内部 this 的值并不是 proxy，而是原始的 map。因此，当set 捕捉器的内部实现尝试访问 this.[[MapData]] 内部插槽时，它会成功。

/*

Array 没有内部插槽

    一个值得注意的例外：内建 Array 没有使用内部插槽。那是出于历史原因，因为它出现于很久以前。
    所以，代理数组时没有这种问题。

*/

// * 2) 私有字段
// 类的私有字段也会发生类似的情况。例如，getName() 方法访问私有的 #name 属性，并在代理后中断：
class User {
  #name = "Guest";

  getName() {
    return this.#name;
  }
}

let user2 = new User();
user2 = new Proxy(user2, {});
console.log(user2.getName()); // Error
// ~ 原因是私有字段是通过内部插槽实现的。JavaScript 在访问它们时不使用 [[Get]]/[[Set]]。
// ~ 在调用 getName() 时，this 的值是代理后的 user，它没有带有私有字段的插槽。

// * 解决办法
user3 = new Proxy(user2, {
  get(target, prop, receiver) {
    let value = Reflect.get(...arguments);
    return typeof value == "function" ? value.bind(target) : value;
  },
});

console.log(user3.getName()); // Guest
// ? 该解决方案也有缺点：它将原始对象暴露给该方法，可能使其进一步传递并破坏其他代理功能。

// ! Proxy!== target
// 代理和原始对象是不同的对象。

// 如果我们使用原始对象作为键，然后对其进行代理，之后却无法找到代理了
let allUsers = new Set();

class User {
  constructor(name) {
    this.name = name;
    allUsers.add(this);
  }
}

let user4 = new User("John");

console.log(allUsers.has(user4)); // true

user4 = new Proxy(user4, {});

console.log(allUsers.has(user4)); // false

// ! 10 Proxy 无法拦截严格相等性检查 ===
// 没有办法拦截对于对象的严格相等性检查。一个对象只严格等于其自身，没有其他值。
// 因此，比较对象是否相等的所有操作和内建类都会区分对象和代理。这里没有透明的替代品。

// ! 11 可撤销 Proxy
/*
一个 可撤销 的代理是可以被禁用的代理。

假设我们有一个资源，并且想随时关闭对该资源的访问。
我们可以做的是将它包装成可一个撤销的代理，没有任何捕捉器。这样的代理会将操作转发给对象，并且我们可以随时将其禁用。

?  let { proxy, revoke } = Proxy.revocable(target, handler);

*/
let object = {
  data: "Valuable Data",
};

let proxyy = Proxy.revocable(object, {});

console.log(proxyy.proxy.data); // Valuable data
// 稍后，在我们的代码中
proxyy.revoke();
// ~ proxy 不再工作（revoked）
console.log(proxyy.proxy.data); // ~ Error

// ~ 对 revoke() 的调用会从代理中删除对目标对象的所有内部引用，因此它们之间再无连接。

// ~ 最初，revoke 与 proxy 是分开的，因此我们可以传递 proxy，同时将 revoke 留在当前范围内。

/*
* 我们可以通过设置 proxy.revoke = revoke 来将 revoke 绑定到 proxy。

* 另一种选择是创建一个 WeakMap，其中 proxy 作为键，相应的 revoke 作为值，这样可以轻松找到 proxy 所对应的 revoke：
*/
// ~ 此处我们使用 WeakMap 而不是 Map，因为它不会阻止垃圾回收。如果一个代理对象变得“不可访问”（例如，没有变量再引用它），则 WeakMap 允许将其与它的 revoke 一起从内存中清除，因为我们不再需要它了。
let revokes = new WeakMap();

let obj = {
  data: "111",
};
let { proxy, revoke } = Proxy.revocable(obj, {});
revokes.set(proxy, revoke);

revoke = revokes.get(proxy);
revoke();

console.log(proxy.data); // Error（revoked）

/*
 * Proxy 有一些局限性：

   1 内建对象具有“内部插槽”，对这些对象的访问无法被代理。请参阅上文中的解决方法。
   2 私有类字段也是如此，因为它们也是在内部使用插槽实现的。因此，代理方法的调用必须具有目标对象作为 this 才能访问它们。
   3 对象的严格相等性检查 === 无法被拦截。
   4 性能：基准测试（benchmark）取决于引擎，但通常使用最简单的代理访问属性所需的时间也要长几倍。实际上，这仅对某些“瓶颈”对象来说才重要。

 */

// TEST
// 1 读取不存在的属性时出错
// 编写一个函数 wrap(target)，该函数接受一个 target 对象，并返回添加此方面功能的代理（proxy）。
function wrap(target) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      let value = Reflect.get(...arguments);
      //或者 if(prop in target)...
      if (!value) throw new Error("不存在该属性");
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
let pp = {
  name: "John",
};
pp = wrap(pp);
console.log(pp.name); // John
console.log(pp.age); // 报错

// 2 实现  array[-1]
let array = [1, 2, 3];

array = new Proxy(array, {
  get(target, prop, receiver) {
    if (prop < 0) {
      // prop是字符串类型，需要转化为数字 arr[-1] 其实就是数组末尾 arr[arr.length + (- 1)]
      prop = +prop + target.length;
    }
    return Reflect.get(target, prop, receiver);
  },
});
console.log(array[-1]); // 3
console.log(array[-2]); // 2

// 3 可观察的（Observable）
// 创建一个函数 makeObservable(target)，该函数通过返回一个代理“使得对象可观察”。
/*
    function makeObservable(target) {
    你的代码 
    }

    let user = {};
    user = makeObservable(user);

    user.observe((key, value) => {
    console.log(`SET ${key}=${value}`);
    });

    user.name = "John"; // alerts: SET name=John
*/

/*
该解决方案包括两部分：

    无论 .observe(handler) 何时被调用，我们都需要在某个地方记住 handler，以便以后可以调用它。我们可以使用 Symbol 作为属性键，将 handler 直接存储在对象中。
    我们需要一个带有 set 陷阱的 proxy 来在发生任何更改时调用 handler。

*/
let handlers = Symbol("handlers");
function makeObservable(target) {
  // 1. 初始化 handler 存储
  target[handlers] = [];
  // 将 handler 函数存储到数组中，以便于之后调用
  target.observe = function (handler) {
    this[handlers].push(handler);
  };
  // 2. 返回 proxy
  return new Proxy(target, {
    set(target, prop, value, receiver) {
      let success = Reflect.set(...arguments); // 将操作转发给对象
      // 调用所有 handler
      if (success) target[handlers].forEach((handler) => handler(prop, value));
      return success;
    },
  });
}
let user5 = {};

user5 = makeObservable(user5);

user5.observe((key, value) => {
  console.log(`SET ${key}=${value}`);
});

user5.name = "John";

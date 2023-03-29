// ! 1 Object.defineProperty()
let car = {};

let val = 3000;
Object.defineProperty(car, "price", {
  enumerable: true,
  configurable: true,
  get() {
    console.log("price属性被读取了");
    return val;
  },
  set(value) {
    console.log("price属性被修改了");
    val = value;
  },
});

console.log(car.price);
car.price = 4000;
console.log(car.price);

// ! 2 实现把car的所有属性都变得可观测
/**
 * 代理函数
 * @param {Object} obj
 * @param {String} key
 * @param {any} val
 * @param {Boolean?} enumerable
 */
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
// 源码位置：src/core/observer/index.js

/**
 * Observer类会通过递归的方式把一个对象的所有属性都转化成可观测对象
 * __ob__: Observer
 * Observer {
    id: number
    subs: Array<Watcher>
    _pending: boolean
    mock: boolean
    shallow: boolean
    value: any
    vmCount: number
  }
 */

const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);
const methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

methodsToPatch.forEach((method) => {
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.splice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    ob.dep.notify();
    return result;
  });
});

function observe(value, asRootData) {
  if (!isObject(value) || value instanceof VNode) return;
  let ob;
  if (hasOwn(val, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else {
    ob = new Observer(value);
  }
  return ob;
}

const hasProto = "__proto__" in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

function protoAugment(target, src, keys) {
  target.__proto__ = src;
}

function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}

export class Observer {
  constructor(value) {
    this.value = value;
    // 给value新增一个__ob__属性，值为该value的Observer实例
    // 相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作
    def(value, "__ob__", this);

    if (Array.isArray(value)) {
      // 当value为数组时的逻辑
      // 在实例和Array.prototype之间挂载数组拦截器
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    } else {
      // 然后判断数据的类型，只有object类型的数据才会调用walk将每一个属性转换成getter/setter的形式来侦测变化。
      this.walk(value);
    }
  }
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  }

  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

/**
 * 使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 */

function defineReactive(obj, key, val) {
  // 如果只传了obj和key，那么val = obj[key]
  if (arguments.length === 2) {
    val = obj[key];
  }
  if (typeof val === "object") {
    // 如果value的值也是对象的话，递归调用new Observer
    new Observer(val);
  }
  //实例化一个依赖管理器，生成一个依赖管理数组dep
  const dep = new Dep();
  let childOb = observe(val);
  // 普通数据类型——开始包装响应式
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      dep.depend(); // ~ 在getter中收集依赖（watcher被收集）
      if (childOb) {
        childOb.dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      val = newVal;
      dep.notify(); // ~ 在setter中通知依赖更新（订阅数组中所有的watcher执行更新）
    },
  });
}

/*
  在上面的代码中，我们定义了observer类，它用来将一个正常的object转换成可观测的object。
  并且给value新增一个__ob__属性，值为该value的Observer实例。这个操作相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作
  然后判断数据的类型，只有object类型的数据才会调用walk将每一个属性转换成getter/setter的形式来侦测变化。 
  最后，在defineReactive中当传入的属性值还是一个object时使用new observer（val）来递归子属性，这样我们就可以把obj中的所有属性（包括子属性）都转换成getter/seter的形式来侦测变化。 
  也就是说，只要我们将一个object传到observer中，那么这个object就会变成可观测的、响应式的object。

  observer类位于源码的src/core/observer/index.js中。
*/

car = new Observer({
  brand: "BMW",
  price: 3000,
});
console.log(car); // Observer { value: { brand: [Getter/Setter], price: [Getter/Setter] } }
console.log(car.value.price); // 3000

// ! 3 依赖收集
/*

? 3.1 什么是依赖收集?

视图里谁用到了这个数据就更新谁，
  1 我们换个优雅说法：我们把"谁用到了这个数据"称为"谁依赖了这个数据",我们给每个数据都建一个依赖数组(因为一个数据可能被多处使用)，
  2 谁依赖了这个数据(即谁用到了这个数据)我们就把谁放入这个依赖数组中，
  3 那么当这个数据发生变化的时候，我们就去它对应的依赖数组中，把每个依赖都通知一遍，告诉他们："你们依赖的数据变啦，你们该更新啦！"。
  这个过程就是依赖收集。

? 3.2 何时收集依赖？何时通知依赖更新？
谁用到了这个数据，那么当这个数据变化时就通知谁。
所谓谁用到了这个数据，其实就是谁获取了这个数据，
而可观测的数据被获取时会触发getter属性，那么我们就可以在getter中收集这个依赖。
同样，当这个数据变化时会触发setter属性，那么我们就可以在setter中通知依赖更新。

总结一句话就是：
~ 在getter中收集依赖，在setter中通知依赖更新。
#

*/

// 3.3 把依赖收集到哪里?

// 在3.1小节中也说了，我们给每个数据都建一个依赖数组，谁依赖了这个数据我们就把谁放入这个依赖数组中。
// 单单用一个数组来存放依赖的话，功能好像有点欠缺并且代码过于耦合。
// 我们应该将依赖数组的功能扩展一下，更好的做法是我们应该为每一个数据都建立一个依赖管理器，把这个数据所有的依赖都管理起来。
// OK，到这里，我们的依赖管理器Dep类应运而生，代码如下：

// 源码位置：src/core/observer/dep.js
export class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }
  // 删除一个依赖
  removeSub(sub) {
    remove(this.subs, sub);
  }
  // 添加一个依赖
  depend() {
    if (window.target) {
      this.addSub(window.target);
    }
  }
  // 通知所有依赖更新
  notify() {
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update(); // 每一个subs是一个watcher， 拥有自己的update()方法
    }
  }
}

export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
// 在上面的依赖管理器Dep类中，我们先初始化了一个subs数组，用来存放依赖，并且定义了几个实例方法用来对依赖进行添加，删除，通知等操作。

// ! 4 依赖到底是谁
/*
  虽然我们一直在说”谁用到了这个数据谁就是依赖“，但是这仅仅是在口语层面上，那么反应在代码上该如何来描述这个”谁“呢？

  其实在Vue中还实现了一个叫做Watcher的类，而Watcher类的实例就是我们上面所说的那个"谁"。
  ~ 1 换句话说就是：谁用到了数据，谁就是依赖，我们就为谁创建一个Watcher实例。
  ~ 2 在之后数据变化时，我们不直接去通知依赖更新，而是通知依赖对应的Watch实例，由Watcher实例去通知真正的视图。
 */

export class Watcher {
  /**
   *
   * @param {目标对象} vm
   * @param {属性名} expOrFn
   * @param {回调函数} cb
   */
  constructor(vm, expOrFn, cb) {
    this.vm = vm;
    this.cb = cb;
    this.getter = parsePath(expOrFn);
    this.value = this.get();
    this.deps = [];
  }
  get() {
    window.target = this;
    const vm = this.vm;
    let value = this.getter.call(vm, vm);
    window.target = undefined;
    if (this.deep) {
      // 读取每个属性，以便将它们全部作为深度监视的依赖项进行跟踪
      traverse(value);
    }
    return value;
  }
  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }
  teardown() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
  }
}

/*
在上面代码中，创建watcher实例的时候会读取被观察的数据，读取了数据就表示依赖了数据，所以watcher实例就会存在于数据的依赖列表中，
~ 同时watcher实例也记录了自己依赖了哪些数据，
另外我们还说过，每个数据都有一个自己的依赖管理器dep，
~ watcher实例记录自己依赖了哪些数据其实就是把这些数据的依赖管理器dep存放在watcher实例的this.deps = []属性中，
当取消观察时即watcher实例不想依赖这些数据了，那么就遍历自己记录的这些数据的依赖管理器，告诉这些数据可以从你们的依赖列表中把我删除了。


vm.$watch(
    function () {
        return this.a + this.b
    },
    function (newVal, oldVal) {
        / 做点什么
    }
)

* 例如一个watcher实例，它观察了数据a和数据b，那么它就依赖了数据a和数据b，
那么这个watcher实例就存在于数据a和数据b的依赖管理器depA和depB中，
同时watcher实例的deps属性中也记录了这两个依赖管理器，即this.deps=[depA,depB]，

当取消观察时，就遍历this.deps，让每个依赖管理器调用其removeSub方法将这个watcher实例从自己的依赖列表中删除。
*/

/**
 * Parse simple path.
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 * 
 *  [^xyz]一个反向字符集。也就是说， 它匹配任何没有包含在方括号中的字符。你可以使用破折号（-）来指定一个字符范围。任何普通字符在这里都是起作用的。

    例如，[^abc] 和 [^a-c] 是一样的。他们匹配"brisket"中的‘r’，也匹配“chop”中的‘h’。 
 */
const bailRE = /[^\w.$]/;
export function parsePath(path) {
  // 不是a.b.c这种直接跳出
  if (bailRE.test(path)) return;
  const segments = path.split(".");
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

let a = {
  b: {
    c: {
      d: 10,
    },
  },
};

a = new Observer(a);
new Watcher(a, "b.c.d", (val, oldValue) => {
  console.log("ok", val, oldValue);
});
a.b.c.d = 55; // ok 55 10

/*
谁用到了数据，谁就是依赖，我们就为谁创建一个Watcher实例，
在创建Watcher实例的过程中会自动的把自己添加到这个数据对应的依赖管理器中，
以后这个Watcher实例就代表这个依赖，当数据变化时，我们就通知Watcher实例，由Watcher实例再去通知真正的依赖。
*/
// 保证存入的dep.id没有重复，不会造成重复收集依赖
const seenObjects = new Set();

export function traverse(val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}
// 该函数其实就是个递归遍历的过程，把被观察数据的内部值都递归遍历读取一遍。
function _traverse(val, seen) {
  let i, keys;
  const isA = Array.isArray(val);
  if ((isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return;
  }
  if (val.__ob__) {
    const depId = val.__ob__.dep.id;
    if (seen.has(depId)) {
      return;
    }
    seen.add(depId);
  }
  if (isA) {
    i = val.length;
    while (i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) _traverse(val[keys[i]], seen);
  }
}
// ~ 这样，把被观察数据内部所有的值都递归的读取一遍后，那么这个watcher实例就会被加入到对象内所有值的依赖列表中，之后当对象内任意某个值发生变化时就能够得到通知了。
/*
下面我们分析Watcher类的代码实现逻辑：

    1 当实例化Watcher类时，会先执行其构造函数；
    2 在构造函数中调用了this.get()实例方法；
    3 在get()方法中，首先通过window.target = this把实例自身赋给了全局的一个唯一对象window.target上，
      然后通过let value = this.getter.call(vm, vm)获取一下被依赖的数据，获取被依赖数据的目的是触发该数据上面的getter，
      上文我们说过，在getter里会调用dep.depend()收集依赖，而在dep.depend()中取到挂载window.target上的值并将其存入依赖数组中，
      在get()方法最后将window.target释放掉。
    4 而当数据变化时，会触发数据的setter，在setter中调用了dep.notify()方法，
      在dep.notify()方法中，遍历所有依赖(即watcher实例)，执行依赖的update()方法，
      也就是Watcher类中的update()实例方法，在update()方法中调用数据变化的更新回调函数，从而更新视图。


    ~ 简单总结一下就是：Watcher先把自己设置到全局唯一的指定位置（window.target），然后读取数据。
    ~ 因为读取了数据，所以会触发这个数据的getter。
    ~ 接着，在getter中就会从全局唯一的那个位置读取当前正在读取数据的Watcher，并把这个watcher收集到Dep中去。
    ~ 收集好之后，当数据发生变化时，会向Dep中的每个Watcher发送通知。
    ~ 通过这样的方式，Watcher可以主动去订阅任意一个数据的变化。
*/

/*
  虽然我们通过Object.defineProperty方法实现了对object数据的可观测，
  但是这个方法仅仅只能观测到object数据的取值及设置值，当我们向object数据里添加一对新的key/value或删除一对已有的key/value时，它是无法观测到的，导致当我们对object数据添加或删除值时，无法通知依赖，无法驱动视图进行响应式更新。

  当然，Vue也注意到了这一点，为了解决这一问题，Vue增加了两个全局API:Vue.set和Vue.delete
*/

/*
 * 其整个流程大致如下：

    1 Data通过observer转换成了getter/setter的形式来追踪变化。
    2 当外界通过Watcher读取数据时，会触发getter从而将Watcher添加到依赖中。
    3 当数据发生了变化时，会触发setter，从而向Dep中的依赖（即Watcher）发送通知。
    4 Watcher接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等。
 */

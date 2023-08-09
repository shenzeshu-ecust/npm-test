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
      configurable: true,
    };
  },
});

console.log(Object.keys(p)); // b

function delay(f, ms) {
  return new Proxy(f, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    },
  });
}

const toHump = (name) => {
  const humpStr = name.replace(/\_(\w)/g, (all, letter) =>
    letter.toUpperCase()
  );
  return humpStr[0].toUpperCase() + humpStr.slice(1);
};

console.log(toHump("single_boolean"));
console.log(toHump("in"));

let arr = [];
arr = new Proxy(arr, {
  get(target, property) {
    if (property in target) return target[property];
    else return 0;
  },
});

// Object.getOwnPropertyNames();
// Object.getOwnPropertySymbols();
console.log("ss".startsWith("s")); // true

let obj = {
  name: "ss",
  home: "nt",
  _age: 18,
};
obj = new Proxy(obj, {
  ownKeys(target, property, receiver) {
    return Object.keys(target).filter((v) => !v.startsWith("_"));
  },
  getOwnPropertyDescriptor(target, property) {
    if (property === "home")
      return {
        enumerable: false,
        configurable: true,
      };
    return {
      enumerable: true,
      configurable: true,
    };
  },
  deleteProperty(target, property) {
    if (property === "name") throw new Error("name不能被删除");

    delete target[property];
    return true;
  },
});
console.log(Object.keys(obj)); //[ 'name' ]
try {
  delete obj.name; // error
} catch (e) {
  console.log(e.message); // name不能被删除
}

function delay(f, ms) {
  return new Proxy(f, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms);
    },
  });
}
let map = new Map();
map.set("one", 1);
map.set("two", 2);

map = new Proxy(map, {
  get(target, property, receiver) {
    const value = Reflect.get(...arguments);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

console.log(map.get("two"));

let oo = {
  name: "ss",
};

const pro = Proxy.revocable(oo, {});
console.log(pro.proxy.name); // ss
pro.revoke();
// console.log(pro.proxy.name); // Error

let weakMap = new WeakMap();

const { proxy, revoke } = Proxy.revocable(oo, {});
weakMap.set(proxy, revoke);
console.log(proxy.name); // ss
const rv = weakMap.get(proxy);
rv();
// console.log(proxy.name); // Error(已经被revoke取消了)

let list = [1, 2, 3];

list = new Proxy(list, {
  get(target, property, receiver) {
    if (property < 0) {
      property = +property + target.length;
    }
    return Reflect.get(target, property, receiver);
  },
});

console.log(list[-2]);

// 实现监听
let handlers = Symbol("handlers");

function makeObservable(obj) {
  obj[handlers] = [];
  obj.observe = (handler) => {
    obj[handlers].push(handler);
  };
  return new Proxy(obj, {
    set(target, property, value, receiver) {
      const res = Reflect.set(...arguments);
      if (res) target[handlers].forEach((handler) => handler(property, value));
      return res;
    },
  });
}

// curry
function curry(func) {
  return function curried(...args) {
    if (args.length >= func.length) {
      return func.apply(this, args);
    } else {
      return function (...argus) {
        return curried.apply(this, args.concat(argus));
      };
    }
  };
}
let obj2;

obj2 = {
  go: function () {
    console.log(this);
  },
};

obj2.go(); // (1) { go: [Function: go] }
// ~ 常规的调用
obj2.go(); // (2) { go: [Function: go] }

// new Promise((resolve, reject) => {
//   setTimeout(() => {
//     throw new Error("Error");
//   }, 1000);
// }).catch(console.log(222));

if (!Promise.allSettled) {
  let resolveHandler = (value) => ({ status: "fulfilled", value });
  let rejectHandler = (reason) => ({ status: "rejected", reason });

  Promise.allSettled = (promises) => {
    const arr = promises.map((p) => {
      return Promise.resolve(p).then(resolveHandler, rejectHandler);
    });
    return Promise.all(arr);
  };
}

// Promise.any([new Promise((_, reject) => reject(new Error("hahaha")))]).then(
//   null,
//   (error) => {
//     console.log(error);
//   }
// );

const arre = [[]].reduce((sum, cur) => {
  cur.push(1);
  cur.push(2);
  sum.push(cur);
  return sum;
}, []);
console.log(arre);

let res = [];

for (let i = 0; i < 3; i++) {
  let fetch = [1, 2]; // 每次产生的数据 假如每次都是【1，2】
  res.push(fetch);
}
console.log(res);
console.log(/[^\w.$]/.test("get()"));

class Observer {
  constructor(value) {
    this.value = value;
    // def(value,__ob__, this);
    if (Array.isArray(value)) {
      //
    } else {
      this.walk(value);
    }
  }
  walk(obj) {
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i]);
    }
  }
}

function defineReactive(obj, key, val) {
  if (arguments.length === 2) val = obj[key];
  if (typeof val === "object") new Observer(val);
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get() {
      dep.depend();
      return val;
    },
    set(newVal) {
      if (val === newVal) return;
      val = newVal;
      dep.notify();
    },
  });
}

class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  removeSub(sub) {
    remove(this.subs, sub);
  }

  depend() {
    if (window.target) this.addSub(window.target);
  }

  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}

function remove(target, item) {
  if (target.length) {
    let index = target.indexOf(item);
    if (index > -1) {
      target.splice(index, 1);
    }
  }
}

class Watcher {
  constructor(target, expOrFn, cb) {
    this.target = target;
    this.cb = cb;
    this.getter = parsePath(expOrFn);
    this.value = this.get();
  }
  get() {
    window.target = this;
    const target = this.target;
    let value = this.getter.call(target, target);
    window.target = undefined;
    return value;
  }

  update() {
    let oldValue = this.value;
    let newValue = this.get();
    this.cb.call(this.target, newValue, oldValue);
  }
}
function parsePath(path) {
  const regExp = /[^\w.$]/;
  if (regExp.test(path)) return;
  const segments = path.split(".");
  return function (data) {
    for (let i = 0; i < segments.length; i++) {
      if (!data) return;
      data = data[segments[i]];
    }
    return data;
  };
}

async function getName() {
  try {
    // code
    const name = await api.getName();
  } catch (error) {
    // do somethine
  }
}

const template = require("@babel/template"); // 使用它来将代码批量生成节点
function babelPlugintryCatch({ types: t }) {
  return {
    visitor: {
      FunctionDeclaration: {
        enter(path) {
          /**
           * 1. 获取当前函数体
           * 2. 如果是async函数，则创建tryCatch并将原函数内容放到try体内
           * 3. 替换原函数
           */
          // 1. 获取当前函数节点信息
          const { params, generator, async, id, body } = path.node;
          // 如果是async，则执行替换
          if (async) {
            // 生成 console.log(error) 的节点数据
            const catchHandler = template.statement("console.log(error)")();
            // 创建trycatch节点，并把原函数体内的代码放到try{}中，把刚刚生成的catchHandler放到catch体内
            const tryStatement = t.tryStatement(
              body,
              t.catchClause(
                t.identifier("error"),
                t.BlockStatement([catchHandler])
              )
            );
            // 创建一个新的函数节点并替换原节点
            path.replaceWith(
              t.functionDeclaration(
                id,
                params,
                t.BlockStatement([tryStatement]),
                generator,
                async
              )
            );
            // 跳过当前节点，否则会重新进入当前节点
            path.skip();
          }
        },
      },
    },
  };
}

module.exports = babelPlugintryCatch;

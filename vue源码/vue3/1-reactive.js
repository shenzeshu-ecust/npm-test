function reactive(obj) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      track(receiver, prop); // 访问时收集依赖
      return Reflect.get(...arguments);
    },
    set(target, prop, value, receiver) {
      const success = Reflect.set(...arguments);
      trigger(receiver, prop); // 设值时自动通知更新
      return success;
    },
  });
}
let activeEffect = null;
function effect(fn) {
  activeEffect = fn;
  activeEffect(); // 触发了代理的get
  activeEffect = null;
}
//  * 我们都知道，每个对象会建立一个Map来存储此对象里属性的dep(使用Set来存储)，那如果有多个对象，该用什么来存储每个对象对应的Map呢？
// 之前的代码只做了单个对象的处理方案，但是现在如果要多个对象，那就得使用WeakMap进行改造了
const targetMap = new WeakMap();
function track(target, key) {
  // 如果此时activeEffect为null则不执行下面
  // 这里判断是为了避免例如console.log(person.name)而触发track
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect); // 把此时的activeEffect添加进去
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const dep = depsMap.get(key);
    if (dep) depsMap.forEach((effect) => effect());
  }
}

let nameStr1 = "";
let typeStr1 = "";
const person = { name: "林三心", age: 22 };
const animal = { type: "dog", height: 50 };

// 函数被收集进去嘞（为了再执行一次更新值）
const effectNameStr1 = () => {
  // 访问属性，触发get
  nameStr1 = `${person.name}是个大菜鸟`;
};
const effectTypeStr1 = () => {
  typeStr1 = `${animal.type}是个大菜鸟`;
};
effect(effectNameStr1);
effect(effectTypeStr1);

// 与数据相关的实例方法有3个，分别是vm.$set、vm.$delete和vm.$watch。
// 它们是在stateMixin函数中挂载到Vue原型上的，代码如下：

import { set, del } from "../observer/index";

export function stateMixin(Vue) {
  // 当执行stateMixin函数后，会向Vue原型上挂载上述3个实例方法。
  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;
  Vue.prototype.$watch = function (expOrFn, cb, options) {};
}

/*

? Vue.set用法回顾

vm.$set( target, propertyName/index, value )

    参数：
        {Object | Array} target
        {string | number} propertyName/index
        {any} value

    返回值：设置的值。

    用法：
    向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。
    它必须用于向响应式对象上添加新属性，因为 Vue 无法探测普通的新增属性 (比如 this.myObject.newProperty = 'hi')

    注意：对象不能是 Vue 实例，或者 Vue 实例的根数据对象。

? 为什么有这个vm.set?

~ 1 对于object型数据，当我们向object数据里添加一对新的key/value或删除一对已有的key/value时，Vue是无法观测到的；
~ 2 而对于Array型数据，当我们通过数组下标修改数组中的数据时，Vue也是是无法观测到的；

正是因为存在这个问题，所以Vue设计了set和delete这两个方法来解决这一问题，
*/

/*
  __ob__: Observer
  Observer {
    id: number
    subs: Array<Watcher>
    dep: ...
    _pending: boolean
    mock: boolean
    shallow: boolean
    value: any
    vmCount: number
  }
*/

// set方法的定义位于源码的src/core/observer/index.js中，如下：

export function set(target, key, val) {
  // 首先判断在非生产环境下如果传入的target是否为undefined、null或是原始类型，如果是，则抛出警告
  if (
    process.env.NODE_ENV !== "production" &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(
      `Cannot set reactive property on undefined, null, or primitive value: ${target}`
    );
  }
  // 接着判断如果传入的target是数组并且传入的key是有效索引的话，那么就取当前数组长度与key这两者的最大值作为数组的新长度，
  // 然后使用数组的splice方法将传入的索引key对应的val值添加进数组。
  // 数组的splice方法已经被我们创建的拦截器重写了，也就是说，当使用splice方法向数组内添加元素时，该元素会自动被变成响应式的。
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  // 如果传入的target不是数组，那就当做对象来处理。

  // 首先判断传入的key是否已经存在于target中，如果存在，表明这次操作不是新增属性，而是对已有的属性进行简单的修改值，那么就只修改属性值即可，如下：
  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }
  // 接下来获取到target的__ob__属性，该属性是否为true标志着target是否为响应式对象
  const ob = target.__ob__;
  // 接着判断如果target是 Vue 实例，或者是 Vue 实例的根数据对象，则抛出警告并退出程序
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid adding reactive properties to a Vue instance or its root $data " +
          "at runtime - declare it upfront in the data option."
      );
    return val;
  }
  // 接着判断如果没有ob属性，那么表明target不是一个响应式对象，那么我们只需简单给它添加上新的属性，不用将新属性转化成响应式，
  if (!ob) {
    target[key] = val;
    return val;
  }
  // 最后，如果target是对象，并且是响应式，那么就调用defineReactive方法将新属性值添加到target上，defineReactive方会将新属性添加完之后并将其转化成响应式，最后通知依赖更新
  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val;
}

// ! vm.$delete(target, propertyName/index)
// 删除对象的属性。如果对象是响应式的，确保删除能触发更新视图。这个方法主要用于避开 Vue 不能检测到属性被删除的限制，但是你应该很少会使用它。
// 注意： 目标对象不能是一个 Vue 实例或 Vue 实例的根数据对象。

// 原理
function del(target, key) {
  if (
    process.env.NODE_ENV !== "production" &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(
      `Cannot delete reactive property on undefined, null, or primitive value: ${target}`
    );
  }
  // ~ 数组的splice方法已经被我们创建的拦截器重写了，所以使用该方法会自动通知相关依赖
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }
  const ob = target.__ob__;
  // 如果target是 Vue 实例，或者是 Vue 实例的根数据对象，则抛出警告并退出程序，如下：
  if (target._isVue(target) || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== "production" &&
      warn(
        "Avoid deleting properties on a Vue instance or its root $data " +
          "- just set it to null."
      );
    return;
  }
  // 接着判断传入的key是否存在于target中，如果key本来就不存在于target中，那就不用删除，直接退出程序即可
  if (!hasOwn(target, key)) {
    return;
  }
  // 最后，如果target是对象，并且传入的key也存在于target中，那么就从target中将该属性删除，
  delete target[key];
  // 判断当前的target是否为响应式对象，如果是响应式对象，则通知依赖更新；如果不是，删除完后直接返回不通知更新，

  if (!ob) {
    return;
  }
  ob.dep.notify();
}

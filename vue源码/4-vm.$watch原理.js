Vue.prototype.$watch = function (expOrFn, cb, options) {
  // const vm: Component = this
  const vm = this;
  if (isPlainObject(cb)) {
    return createWatcher(vm, expOrFn, cb, options);
  }
  // 接着获取到用户传入的options，如果用户没有传入则将其赋值为一个默认空对象，如下：
  options = options || {};
  // $watch方法内部会创建一个watcher实例，由于该实例是用户手动调用$watch方法创建而来的，
  // 所以给options添加user属性并赋值为true，用于区分用户创建的watcher实例和Vue内部创建的watcher实例，
  options.user = true;
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if (options.immediate) {
    // 接着判断如果用户在选项参数options中指定的immediate为true，则立即用被观察数据当前的值触发回调，
    cb.call(vm, watcher.value);
  }
  // 最后返回一个取消观察函数unwatchFn，用来停止触发回调。如下：
  return function unwatchFn() {
    watcher.teardown();
  };
};
/*
    先判断传入的回调cb是不是对象，比如下面这种
    vm.$watch(
        'a.b.c',
        {
            handler: function (val, oldVal) {  },
            deep: true
        }
    )
    如果传入的回调函数是个对象，那就表明用户是把第二个参数回调函数cb和第三个参数选项options合起来传入的，
    此时调用createWatcher函数，该函数定义如下：
 */
function createWatcher(vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    // 先从用户合起来传入的对象中把回调函数cb和参数options剥离出来
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === "string") {
    handler = vm[handler];
  }
  // 然后再以常规的方式调用$watch方法并将剥离出来的参数穿进去
  return vm.$watch(expOrFn, handler, options);
}

function isPlainObject(obj) {}

// ? 首先我们来看看什么是深度观察，假如有如下被观察的数据：
/*
obj = {
    a:2
}

~ 所谓深度观察，就是当obj对象发生变化时我们会得到通知，
~ 当obj.a属性发生变化时我们也要能得到通知，
简单的说就是观察对象内部值的变化。

要实现这个功能也不难，我们知道，要想让数据变化时通知我们，那我们只需成为这个数据的依赖即可，
因为数据变化时会通知它所有的依赖，那么如何成为数据的依赖呢，
~ 很简单，读取一下数据即可。也就是说我们只需在创建watcher实例的时候把obj对象内部所有的值都递归的读一遍，
~ 那么这个watcher实例就会被加入到对象内所有值的依赖列表中，之后当对象内任意某个值发生变化时就能够得到通知了。
*/

class Watcher {
  constructor(/* ... */) {
    // ...
    this.value = this.get();
  }
  get() {
    // ...
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    return value;
  }
}
// traverse函数定义如2中所示

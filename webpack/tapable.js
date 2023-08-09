// ~ Webpack本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是Tapable。
// ~ 其实tapable的核心思路有点类似于node.js中的events，最基本的发布/订阅模式。

// ! 1 SyncHook 同步串行，不关心监听函数的返回值。
// 原理
class SyncHook {
  constructor() {
    this.tabs = [];
  }
  // 订阅
  tap(name, fn) {
    this.tabs.push(fn);
  }
  // 发布
  call() {
    this.tabs.forEach((tap) => tap(...arguments));
  }
}

// ! 2 SyncBailHook 只要监听函数中有一个函数的返回值不为undefined(返回有真值)，则跳过剩下所有的逻辑。
class SyncBailHook {
  constructor() {
    this.taps = [];
  }
  // 订阅
  tap(name, fn) {
    this.taps.push(fn);
  }
  // 发布
  call() {
    for (let i = 0, l = this.taps.length; i < l; i++) {
      let tap = this.taps[i];
      let result = tap(...arguments);
      if (result) {
        break;
      }
    }
  }
}

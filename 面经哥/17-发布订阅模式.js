class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(name, callback) {
    // 订阅
    if (!this.events[name]) {
      this.events[name] = [callback];
    } else {
      this.events[name].push(callback);
    }
  }
  emit(name) {
    // 触发
    this.events[name] && this.events[name].forEach((cb) => cb());
  }
  removeListener(name, callback) {
    // 移除
    if (this.events[name]) {
      this.events[name] = this.events[name].filter((cb) => cb !== callback);
    }
  }
  once(name, callback) {
    // 只执行一次
    let fn = () => {
      callback();
      // 删除fn
      this.removeListener(name, fn);
    };
    this.on(name, fn);
  }
}

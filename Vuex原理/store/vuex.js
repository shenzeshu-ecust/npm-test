let Vue;
// install方法设置，是因为Vue.use(xxx)会执行xxx的install方法
const install = (v) => {
  // 参数v负责接收vue实例
  Vue = v;
  // 全局混入
  Vue.mixins({
    beforeCreate() {
      if (this.$options && this.$options.store) {
        // 根页面，直接将身上的store赋值给自己的$store，
        // 这也解释了为什么使用vuex要先把store放到入口文件main.js里的根Vue实例里
        this.$store = this.$options.store;
      } else {
        // 除了根页面以外，将上级的$store赋值给自己的$store
        this.$store = this.$parent && this.$parent.$store;
      }
    },
  });
};
// 创建Store类
class Store {
  constructor(options) {
    // options接收传入的store对象
    this.vm = new Vue({
      // 确保state是响应式
      data: {
        state: options.state,
      },
    });
    // getter
    let getters = options.getters || {};
    this.getters = {};
    Object.keys(getters).forEach((getterName) => {
      Object.defineProperty(this.getters, getterName, {
        get() {
          return getters[getterName](this.state);
        },
      });
    });
    // mutation
    let mutations = options.mutations || {};
    this.mutations = {};
    Object.keys(mutations).forEach((mutationName) => {
      this.mutations[mutationName] = (payload) => {
        mutations[mutationName](this.state, payload);
      };
    });
    // action
    let actions = options.actions || {};
    this.actions = {};
    Object.keys(actions).forEach((actionName) => {
      this.actions[actionName] = (payload) => {
        actions[actionName](this.state, payload);
      };
    });
  }
  get state() {
    return this.vm.state;
  }
  // commit方法，执行mutations的'name'方法
  commit(name, payload) {
    this.mutations[name](payload);
  }
  // dispatch方法，执行actions的'name'方法
  dispatch(name, payload) {
    this.actions[name](payload);
  }
}

export default {
  install,
  Store,
};

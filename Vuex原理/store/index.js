import Vue from "vue";
import vuex from "./vuex"; // 引入vuex.js暴露出来的对象
Vue.use(vuex); // 会执行vuex对象里的install方法，也就是全局混入mixin

export default new vuex.Store({
  state: {
    num: 1,
  },
  getters: {
    getNum(state) {
      return state.num + 1;
    },
  },
  mutations: {
    decreaseNum(state, payload) {
      state.num -= payload;
    },
  },
  actions: {},
});

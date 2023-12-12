import { __global } from "../cwx.js";

const observerObjs = {};

const addObserverForKey = function (key, callback) {
  // 将回调追加到观察者列表中
  if (!observerObjs[key]) {
    observerObjs[key] = [];
  }
  observerObjs[key].push(callback);

  // 如果此时 cache 中该事件已经有相应的 回调入参值，则直接执行回调。（适用于监听获取全局性数据的事件，主要是为了确认获取数据的事件有没有完成、这个数据能否获取到。比如 onLaunch / onShow 的入参、mktOpenId、CID ）
  if (__global.optionsCacheObj.hasOwnProperty(key) && __global.optionsCacheObj[key] !== "") {
    callback(__global.optionsCacheObj[key]);
  }
};

const addObserverForKeyOnly = function (key, callback) {
  // 如果此时cache中该事件已经有相应的options值，则直接执行回调
  if ( __global.optionsCacheObj.hasOwnProperty(key) && __global.optionsCacheObj[key] !== "") {
    callback(__global.optionsCacheObj[key]);
    return;
  }
  observerObjs[key] = [callback];
};

const noti = function (key, value) {
  // 将 全局事件相关的数据存到 全局cache 中，且只存明确写到 global.js 中的那几个 observerKey
  if (__global.optionsCacheObj.hasOwnProperty(key)) {
    __global.optionsCacheObj[key] = value;
  }
  if (!observerObjs[key]) {
    return;
  }
  let mirrorObserverObjs = [...observerObjs[key]]; // 因为在遍历的过程中，可能会调用 removeObserverForKey 导致调用回调出现问题
  mirrorObserverObjs.forEach(function (observer) {
    // 此时需要判断该 observer 还在不在源内（Observer的数组中），因为有可能在遍历镜像的过程中被删除
    if (observerObjs[key] && observerObjs[key].includes(observer)) {
      if (typeof observer == "function") {
        observer(value);
      } else if (typeof observer == "object") {
        // todo??? 如果是对象的话需要实现 observerNoti
        if (observer.observerNoti) {
          observer.observerNoti(this, key, value);
        }
      }
    }
  });
};

const removeObserverForKey = function (key, observer) {
  if (!observerObjs[key]) {
    return;
  }
  const index = observerObjs[key].indexOf(observer);
  // 如果存在，移除该元素
  if (index !== -1) {
    observerObjs[key].splice(index, 1);
  }
};

const removeAllObserversForKey = function (key) {
  if (!observerObjs[key]) {
    return;
  }
  observerObjs[key] = [];
};

export default {
  addObserverForKey,
  addObserverForKeyOnly,
  noti,
  removeObserverForKey,
  removeAllObserversForKey,
};

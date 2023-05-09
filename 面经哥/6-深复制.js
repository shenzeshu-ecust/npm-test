function deepClone(obj, map = new WeakMap()) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (cache.has(obj)) return cache.get(obj);
  let cloneObj = new obj.constructor();
  cache.set(obj, cloneObj);
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      cloneObj[i] = deepClone(obj[i], cache);
    }
  }
  return cloneObj;
}

function deepClone2(obj) {
  let res;
  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      res = [];
      for (let i = 0; i < obj.length; i++) {
        res[i] = deepClone(obj[i]);
      }
    } else if (obj === null) {
      res = obj;
    } else if (obj.constructor === RegExp) {
      res = obj;
    } else {
      res = {};
      for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
          res[i] = deepClone(obj[i]);
        }
      }
    }
  } else {
    res = obj;
  }
  return res;
}

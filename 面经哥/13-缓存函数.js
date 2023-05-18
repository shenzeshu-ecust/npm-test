function hash() {
  return [].join.call(arguments);
}
// console.log(hash(1, 2)); // 1,2
function cachingDecorator(func, hash) {
  let cache = new Map();
  return function () {
    let key = hash(arguments);
    if (cache.has(key)) {
      console.log("缓存调用");
      return cache.get(key);
    }
    let result = func.apply(this, arguments);
    cache.set(key, result);
    return result;
  };
}

let worker = {
  slow(a, b) {
    return a + b;
  },
};

worker.slow = cachingDecorator(worker.slow, hash);

console.log(worker.slow(2, 4)); // 6
console.log("cache", worker.slow(2, 4)); // 缓存调用 6

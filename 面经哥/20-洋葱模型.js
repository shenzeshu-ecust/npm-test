function compose(middleware) {
  return async function (...args) {
    await dispatch(0);
    async function dispatch(i) {
      const fn = middleware[i];
      if (!fn) return null;
      await fn(function () {
        dispatch(i + 1);
      }, ...args);
    }
  };
}

let middleware = [];
middleware.push((next) => {
  console.log(0);
  next();
  console.log(3);
});
middleware.push((next) => {
  console.log(1);
  next();
  console.log(1.1);
});
middleware.push((next) => {
  console.log(2);
});

let fn = compose(middleware);
fn();
// 0 1 2 1.1 3

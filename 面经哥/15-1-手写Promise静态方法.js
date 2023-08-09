function PromiseAll(iterators) {
  let promises = Array.from(iterators);
  let len = promises.length;
  let resolvedCount = 0;
  let resolvedArray = new Array(len);

  return new Promise((resolve, reject) => {
    if (len === 0) resolve(resolvedArray);
    for (let i = 0; i < len; i++) {
      Promise.resolve(promises[i])
        .then((value) => {
          resolvedCount++;
          resolvedArray[i] = value;
          if (resolvedCount === len) {
            resolve(resolvedArray);
          }
        })
        .catch((err) => reject(err));
    }
  });
}

function PromiseAny(iterators) {
  const promises = Array.from(iterators);
  const len = promises.length;
  const rejectedList = new Array(len);
  let rejectedNum = 0;
  return new Promise((resolve, reject) => {
    // ~ 如果传入了一个空的可迭代数组，那么该方法就会返回一个已经被拒 promise，
    // ~ 其拒因是一个 AggregateError 实例，该实例的 errors 属性会是一个空数组。
    if (len === 0) reject(new AggregateError([], "All promises were rejected"));
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((val) => {
          resolve(val);
        })
        .catch((err) => {
          rejectedList[index] = err;
          if (++rejectedNum === len) {
            reject(rejectedList);
          }
        });
    });
  });
}

function myRace(arr) {
  return new Promise((resolve, reject) => {
    let len = arr.length;
    // ! 其实Promise.race会一直处在pending状态
    if (len === 0) throw new Error("Will always pending");
    for (let i = 0; i < len; i++) {
      Promise.resolve(arr[i])
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
}

function allSettled(promises) {
  return new Promise((resolve) => {
    const data = [];
    const len = promises.length;
    let count = 0;
    if (len === 0) resolve(data);
    for (let i = 0; i < len; i++) {
      Promise.resolve(promise[i])
        .then(
          (res) => {
            data[i] = { status: "fulfilled", value: res };
          },
          (error) => {
            data[i] = { status: "rejected", reason: error };
          }
        )
        .finally(() => {
          // promise has been settled
          if (++count === len) {
            resolve(data);
          }
        });
    }
  });
}

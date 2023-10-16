Promise.resolve()
  .then(() => {
    console.log(0);
    return Promise.resolve(4);
    // ~ 如果then返回一个promise
    // * 将这一步的任务状态从pending - resolved 的这个任务放在Promise.resolve(4).then(() => p0 resolved!)
    // * 并且将上面这件事 放在微任务队列里
  })
  .then((res) => {
    console.log(res);
  });

Promise.resolve()
  .then(() => {
    console.log(1);
  })
  .then(() => {
    console.log(2);
  })
  .then(() => {
    console.log(3);
  })
  .then(() => {
    console.log(5);
  })
  .then(() => {
    console.log(6);
  });

// ~ 0 1 2 3 4 5 6

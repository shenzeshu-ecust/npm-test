/**
 * 并发执行任务
 * @param {Function[]} tasks
 * @param {Number} parallelCount
 */
function parallelTask(tasks, parallelCount = 4) {
  return new Promise((resolve, reject) => {
    if (tasks.length === 0) {
      resolve();
      return;
    }
    let nextIndex = 0;
    let finishedCount = 0;

    function _run() {
      const task = tasks[nextIndex];
      nextIndex++;
      // 一个接一个的执行
      task().then(() => {
        finishedCount++;
        if (nextIndex < tasks.length) {
          _run();
        } else if (finishedCount === tasks.length) {
          resolve();
        }
      });
    }

    for (let i = 0; i < parallelCount && i < tasks.length; i++) {
      // ! 保持每次都最多parallelCount个任务在执行
      _run();
    }
  });
}

const createTask = function (i) {
  return function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("任务", i);
        resolve();
      }, Math.random() * 1000);
    });
  };
};

const tasks = [];
for (let i = 0; i < 20; i++) {
  tasks.push(createTask(i));
}

parallelTask(tasks, 4).then(() => {
  console.log("全部完成");
});

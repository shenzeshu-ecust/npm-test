// ! koa中广泛运用的  洋葱模型
// app.use()

function compose(middleware) {
  return function (...args) {
    return dispatch(0);
    function dispatch(i) {
      const fn = middleware[i];
      if (!fn) return null;
      return fn(function next() {
        dispatch(i + 1);
      }, ...args);
    }
  };
}

let middleware = [];

const use = (fn) => {
  middleware.push(fn);
};
use((next) => {
  console.log(0);
  next();
  console.log(3);
});
use((next) => {
  console.log(1);
  next();
  console.log(1.1);
});
use((next) => {
  console.log(2);
});

let fn = compose(middleware);
// fn();
// 0 1 2 1.1 3


class TaskPro {
  constructor() {
    this._tasks = []
  }
  addTask(fn) {
    this._tasks.push(fn)
  }

  async run() {
    
    const next = async () => {
      await fn()
    }

    const fn = async () => {
      if(this._tasks.length) {
        const todo = this._tasks.shift()
        await todo(next)
        await fn()
      }
    }

    await fn()
  }
}

const taskPro = new TaskPro()
taskPro.addTask(async (next) => {
  console.log(1)
  await next()
  console.log('end')
})

taskPro.addTask(async (next) => {
  console.log(2)
  await next();
  console.log('which is the end')
})

taskPro.addTask(async (next) => {
  console.log(3)
})

taskPro.run()
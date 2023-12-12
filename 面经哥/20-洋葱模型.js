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


// ~ koa 中 compose
// 通过 compose 将中间件进行了合并，这也是 koa 的一个核心实现。
function compose (middleware) { // middleware 中间件函数数组, 数组中是一个个的中间件函数
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}

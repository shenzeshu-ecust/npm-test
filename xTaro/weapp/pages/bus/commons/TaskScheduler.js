function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
class Heap {
  constructor(data = [], compare) {
    this.container = data.slice();
    this.compare = compare;
    this.__buildHeap.call(this, this.container);
  }
  __buildHeap(data) {
    let len = data.length;
    // 从最后一个根节点开始，向前遍历所有根节点
    // 取 len / 2 作为 i 的初始值，是因为最后一个孩子节点是 len - 1
    // 它可能是左孩子也可能是右孩子，那么可以根据公式算出对应的根节点
    // 它一定在 len / 2 附近，且小于 len / 2
    for (let parent = Math.floor(len / 2); parent >= 0; parent--) {
      this.__heapAjust.call(this, data, parent, len);
    }
  }
  __heapAjust(data, parent, len) {
    // 寻找 i 的左孩子
    let child = 2 * parent + 1;
    // 如果 child 大于 len 说明 i 不是根节点
    while (child < len) {
      // 比较两个孩子节点，将 child 指向大的那个
      if (
        child + 1 < len &&
        this.__compare(data[child], data[child + 1], this.compare)
      ) {
        child = child + 1;
      }
      // 如果孩子节点比根节点大，两个节点互换
      if (this.__compare(data[parent], data[child], this.compare)) {
        swap(data, parent, child);
        // 互换之后将被更新的孩子节点继续作为根节点，进行深度查找
        parent = child;
        child = 2 * parent + 1;
      } else {
        break;
      }
    }
  }
  __compare(a, b, compareFunc) {
    if (compareFunc && typeof compareFunc === 'function') {
      return compareFunc(a, b);
    } else {
      return a < b;
    }
  }
  clear() {
    this.container.splice(0, this.container.length);
  }
  push(data) {
    const { container } = this;
    container.push(data);
    let child = container.length - 1;
    while (child) {
      let parent = Math.floor((child - 1) / 2);
      if (this.__compare(container[child], container[parent], this.compare)) {
        break;
      }
      swap(container, child, parent);
      child = parent;
    }
  }
  extract() {
    const { container } = this;
    if (!container.length) {
      return null;
    }
    swap(container, 0, container.length - 1);
    const res = container.pop();
    this.__heapAjust.call(this, container, 0, container.length);
    return res;
  }
  top() {
    if (this.container.length) return this.container[0];
    return null;
  }
}

class Queue {
  constructor(data = []) {
    this.container = data.slice();
  }
  clear() {
    this.container.splice(0, this.container.length);
  }
  push(data) {
    const { container } = this;
    container.push(data);
  }
  extract() {
    const { container } = this;
    if (!container.length) {
      return null;
    }
    const res = container.shift();
    return res;
  }
  top() {
    if (this.container.length) return this.container[0];
    return null;
  }
}
// export
let taskUUid = 0;

class TaskScheduler {
  constructor({ maxThreads, mode = 'priority' }) {
    this.maxThreads = maxThreads;
    this.taskQueue =
      mode === 'priority'
        ? new Heap([], (a, b) => {
            return a.priority < b.priority;
          })
        : new Queue();
    this.__currentTaskNum = 0;
    this.queueId = taskUUid++;
  }
  executeTask(callable) {
    let that = this;
    that.__currentTaskNum++;
    callable().finally(() => {
      that.__currentTaskNum--;
      let nextTask = that.taskQueue.extract();
      if (nextTask) {
        let nextCallable = nextTask.callable;
        that.executeTask(nextCallable);
      }
    });
  }

  addTask(callable, priority = 1) {
    let that = this;
    let taskId = taskUUid++;
    let task = new Promise((resolve, reject) => {
      let callablePromise = () => {
        let result = callable();
        if (result.then && typeof result.then === 'function') {
        } else {
          result = Promise.resolve(result);
        }
        return result
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      };
      if (that.__currentTaskNum < that.maxThreads) {
        that.executeTask(callablePromise);
      } else {
        that.taskQueue.push({
          priority,
          callable: callablePromise,
          taskId,
        });
      }
    });
    task.taskId = taskUUid;

    return task;
  }

  removeAllTask() {
    this.taskQueue.clear();
    this.__currentTaskNum = 0;
  }
}

let Scheduler = new TaskScheduler({
  maxThreads: 5,
});

export default Scheduler;
export { TaskScheduler, Scheduler };

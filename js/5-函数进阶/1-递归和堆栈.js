// ! 1 递归
// 最大的嵌套调用次数（包括首次）被称为 递归深度

// 最大递归深度受限于 JavaScript 引擎。对我们来说，引擎在最大迭代深度为 10000 及以下时是可靠的，有些引擎可能允许更大的最大深度，
// 但是对于大多数引擎来说，100000 可能就超出限制了。有一些自动优化能够帮助减轻这种情况（尾部调用优化），但目前它们还没有被完全支持，只能用于简单场景。

// 递归深度等于堆栈中上下文的最大数量。

/*
我们可以看到，当我们的函数对一个部门求和时，有两种可能的情况：

    要么是由一 数组 的人组成的“简单”的部门 —— 这样我们就可以通过一个简单的循环来计算薪资的总和。
    或者它是一个有 N 个子部门的 对象 —— 那么我们可以通过 N 层递归调用来求每一个子部门的薪资，然后将它们合并起来。

~ 第一种情况是由一数组的人组成的部门，这种情况很简单，是最基础的递归。

~ 第二种情况是我们得到的是对象。那么可将这个复杂的任务拆分成适用于更小部门的子任务。它们可能会被继续拆分，但很快或者不久就会拆分到第一种情况那样。
*/
let company = {
  // 是同一个对象，简洁起见被压缩了
  sales: [
    { name: "John", salary: 1000 },
    { name: "Alice", salary: 1600 },
  ],
  development: {
    sites: [
      { name: "Peter", salary: 2000 },
      { name: "Alex", salary: 1800 },
    ],
    internals: [{ name: "Jack", salary: 1300 }],
  },
};

// 用来完成任务的函数
// * 我们可以很容易地看到其原理：对于对象 {...} 会生成子调用，而数组 [...] 是递归树的“叶子”，它们会立即给出结果。
function sumSalaries(department) {
  if (Array.isArray(department)) {
    // 情况（1）
    return department.reduce((prev, current) => prev + current.salary, 0); // 求数组的和
  } else {
    // 情况（2）
    let sum = 0;
    for (let subdep of Object.values(department)) {
      sum += sumSalaries(subdep); // 递归调用所有子部门，对结果求和
    }
    return sum;
  }
}
// ! 2 链表：与数组不同，链表没有大规模重排，我们可以很容易地重新排列元素。
// ~ 如果我们确实需要 快速插入/删除，则可以选择另一种叫做 链表 的数据结构。
// ~ 缺点： 链表主要的缺点就是我们无法很容易地通过元素的编号获取元素。但在数组中却很容易：arr[n] 是一个直接引用。而在链表中，我们需要从起点元素开始，顺着 next 找 N 次才能获取到第 N 个元素。
// 、比如，要添加一个新值，我们需要更新链表的头：
let list = { value: 1 };
list.next = { value: 2 };
list.next.next = { value: 3 };
list.next.next.next = { value: 4 };

// 将新值添加到链表头部
list = { value: "new item", next: list };

// 要从中间删除一个值，可以修改前一个元素的 next：
list.next = list.next.next;
// ~ 被删除的元素 如果它没有被存储在其它任何地方，那么它会被自动从内存中删除。

// TEST:
// 1 编写一个函数 sumTo(n) 计算 1 + 2 + ... + n 的和。
function sumTo(n) {
  if (n === 0) return 0;
  return n + sumTo(n - 1);
}
console.log(sumTo(100)); // 5050

// ~  我们可以使用递归来计算 sumTo(100000) 吗？  一般来说不可以
// 速度： 通项公式 > for循环累加 > 递归

// 2 阶乘
function factorial(num) {
  if (num === 1) return 1;
  return num * factorial(num - 1);
}

// 3 斐波那契数： Fn = Fn-1 + Fn-2。换句话说，下一个数字是前两个数字的和
function fib(n) {
  if (n == 1 || n == 2) return 1;
  return fib(n - 1) + fib(n - 2);
}
// ~ 优化空间
function fibb(n) {
  if (n == 1 || n == 2) return 1;
  let a = 1;
  let b = 1;
  for (let i = 3; i <= n; i++) {
    let t = b;
    b = a + b;
    a = t;
  }
  return b;
}
console.log(fibb(3));
console.log(fibb(5));
console.log(fibb(6));
console.log(fibb(77));

// 或者
function fib(n) {
  let a = 1;
  let b = 1;
  for (let i = 3; i <= n; i++) {
    let c = a + b;
    a = b;
    b = c;
  }
  return b;
}

// 4  输出单链表
let list1 = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: null,
      },
    },
  },
};

function printList(list) {
  console.log(list.value);
  if (list.next) printList(list.next);
}
printList(list1);
// 或者
function printList(list) {
  let tmp = list;

  while (tmp) {
    console.log(tmp.value);
    tmp = tmp.next;
  }
}
// 从技术上讲，循环更有效。这两种解法的做了同样的事儿，但循环不会为嵌套函数调用消耗资源。

// 5 反向输出list1
function pL(list) {
  if (list.next) pL(list.next);
  console.log(list.value);
}
pL(list1);

// 用循环
function printReverseList(list) {
  let arr = [];
  let tmp = list;

  while (tmp) {
    arr.push(tmp.value);
    tmp = tmp.next;
  }

  for (let i = arr.length - 1; i >= 0; i--) {
    console.log(arr[i]);
  }
}

printReverseList(list1);

//   请注意，递归解法实际上也是这样做的：它顺着链表，记录每一个嵌套调用里链表的元素（在执行上下文堆栈里），然后输出它们。

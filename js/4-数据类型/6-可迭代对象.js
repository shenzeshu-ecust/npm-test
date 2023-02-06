// 可迭代（Iterable） 对象是数组的泛化。这个概念是说任何对象都可以被定制为可在 for..of 循环中使用的对象。
// 数组是可迭代的。但不仅仅是数组。很多其他内建对象也都是可迭代的。例如字符串也是可迭代的。
for (let char of "test") {
  // 触发 4 次，每个字符一次
  console.log(char); // t, then e, then s, then t
}
// 对于代理对（surrogate pairs），它也能正常工作！（译注：这里的代理对也就指的是 UTF-16 的扩展字符）
let str = "𝒳😂";
for (let char of str) {
  console.log(char); // 𝒳，然后是 😂
}
// ! 1 Symbol.iterator
// 将不可迭代的对象 转化为 可迭代的对象

let range = {
  from: 1,
  to: 5,
};

// 我们希望 for..of 这样运行：
// for(let num of range) ... num=1,2,3,4,5

/*
 * 为了让 range 对象可迭代（也就让 for..of 可以运行）我们需要为对象添加一个名为 Symbol.iterator 的[方法]（一个专门用于使对象可迭代的内建 symbol）。

    1 当 for..of 循环启动时，它会调用这个方法（如果没找到，就会报错）。这个方法必须返回一个 迭代器（iterator） —— 一个[有 next 方法]的[对象]。
    2 从此开始，for..of 仅适用于这个被返回的对象。
    3 当 for..of 循环希望取得下一个数值，它就调用这个对象的 next() 方法。
    4 next() 方法返回的结果的格式必须是 {done: Boolean, value: any}，当 done=true 时，表示循环结束，否则 value 是下一个值。

 */

// 1. for..of 调用首先会调用这个：
range[Symbol.iterator] = function () {
  // ~ 它返回迭代器对象（iterator object）：
  // 2. 接下来，for..of 仅与下面的迭代器对象一起工作，要求它提供下一个值
  return {
    current: this.from,
    last: this.to,

    // 3. next() 在 for..of 的每一轮循环迭代中被调用
    next() {
      // 4. 它将会返回 {done:.., value :...} 格式的对象
      if (this.current <= this.last) {
        return { done: false, value: this.current++ };
      } else {
        return { done: true };
      }
    },
  };
};

// 现在它可以运行了！
for (let num of range) {
  console.log(num); // 1, 然后是 2, 3, 4, 5
}

/**
 * 请注意可迭代对象的核心功能：关注点分离。

    range 自身没有 next() 方法。
    相反，是通过调用 range[Symbol.iterator]() 创建了另一个对象，即所谓的“迭代器”对象，并且它的 next 会为迭代生成值。

    因此，迭代器对象和与其进行迭代的对象是分开的。
 */

// 从技术上说，我们可以将它们合并，并使用 range 自身作为迭代器来简化代码。
// 就像这样：

let range1 = {
  from: 1,
  to: 5,

  [Symbol.iterator]() {
    this.current = this.from;
    return this;
  },

  next() {
    if (this.current <= this.to) {
      return { done: false, value: this.current++ };
    } else {
      return { done: true };
    }
  },
};

/*
~ 现在 range[Symbol.iterator]() 返回的是 range 对象自身：它包括了必需的 next() 方法，并通过 this.current 记忆了当前的迭代进程。这样更短，对吗？是的。有时这样也可以。

~ 但缺点是，现在不可能同时在对象上运行两个 for..of 循环了：它们将共享迭代状态，因为只有一个迭代器，即对象本身。但是两个并行的 for..of 是很罕见的，即使在异步情况下。
 */

// ! 2 显示调用迭代器
// 我们将会采用与 for..of 完全相同的方式遍历字符串，但使用的是直接调用。这段代码创建了一个字符串迭代器，并“手动”从中获取值。
let str2 = "hello";
// ~ 获取字符串内部迭代器(是一个函数，需要调用，结果返回是一个对象)
let iterator = str2[Symbol.iterator]();
while (true) {
  // 调用迭代器的next方法
  let res = iterator.next();
  if (res.done) break;
  console.log(res.value);
}

// ! 3 可迭代与类数组array-like

// Iterable 如上所述，是实现了 Symbol.iterator 方法的对象。
// ~ Array-like 是有索引和 length 属性的对象，所以它们看起来很像数组。

// 字符串即是可迭代的（for..of 对它们有效），又是类数组的（它们有数值索引和 length 属性）。
// 但是一个可迭代对象也许不是类数组对象。反之亦然，类数组对象可能不可迭代。

// 可迭代对象和类数组对象通常都 不是数组，它们没有 push 和 pop 等方法。我们想使用数组方法操作 range，应该如何实现呢？

// ! 4 Array.from(obj[, mapFn, thisArg]) 可以接受一个可迭代或类数组的值，并从中获取一个“真正的”数组。
let arrayLike = {
  0: "Hello",
  1: "World",
  length: 2,
};

let arr = Array.from(arrayLike); // (*)
let arrFromIterator = Array.from(range);
console.log(arr.pop());
console.log(arrFromIterator); // [ 1, 2, 3, 4, 5 ]

let arrFromIteratorWithFunc = Array.from(range, (num) => num + 2);
console.log(arrFromIteratorWithFunc); // [ 3, 4, 5, 6, 7 ]

// 也可以处理字符串，包括 代理对 (当然字符串本身就支持 for...of)
let s = "𝒳😂";
let charsArr = Array.from(s);
console.log(charsArr); // [ '𝒳', '😂' ]
// ~ 字符串迭代器能够识别代理对（surrogate pair）。（译注：代理对也就是 UTF-16 扩展字符。）
// ~ 我们甚至可以基于 Array.from 创建代理感知（surrogate-aware）的slice 方法（译注：也就是能够处理 UTF-16 扩展字符的 slice 方法）：
function slice(str, start, end) {
  return Array.from(str).slice(start, end).join("");
}

let stre = "𝒳😂𩷶";

console.log(slice(stre, 1, 3)); // 😂𩷶

// ~ 原生方法不支持识别代理对（译注：UTF-16 扩展字符）
console.log(stre.slice(1, 3)); // 乱码（两个不同 UTF-16 扩展字符碎片拼接的结果）

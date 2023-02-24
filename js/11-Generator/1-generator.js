// ! 定义: generator： function* a(){}  或者 function *a() {}
// 但是通常更倾向于第一种语法，因为星号 * 表示它是一个 generator 函数，它描述的是函数种类而不是名称，因此 * 应该和 function 关键字紧贴一起。
// 常规函数只会返回一个单一值（或者不返回任何值）。

// ! 而 generator 可以按需一个接一个地返回（“yield”）多个值。它们可与 iterable 完美配合使用，从而可以轻松地创建数据流。
// ~ generator 函数与常规函数的行为不同。在此类函数被调用时，它不会运行其代码。而是返回一个被称为 “generator object” 的特殊对象，来管理执行流程。
function* generateSequence() {
  yield 1;
  yield 2;
  return 3;
}
let gen = generateSequence();
console.log(gen); // Object [Generator] {}  函数体 代码还没有开始执行
// ~ 一个 generator 的主要方法就是 next()。当被调用时（译注：指 next() 方法），它会恢复运行，执行直到最近的 yield <value> 语句（value 可以被省略，默认为 undefined）。
// ~ 然后函数执行暂停，并将产出的（yielded）值返回到外部代码。

let one = gen.next();
console.log(one); // { value: 1, done: false }

/*
next() 的结果始终是一个具有两个属性的对象：

    value: 产出的（yielded）的值。
    done: 如果 generator 函数已执行完成则为 true，否则为 false。

*/

let two = gen.next();
console.log(two); // { value: 2, done: false }
let three = gen.next();
console.log(three); // { value: 3, done: true }
console.log(gen.next()); // ~ { value: undefined, done: true }
// * 再对 generator.next() 进行新的调用不再有任何意义。如果我们这样做，它将返回相同的对象：{done: true}。

// ! 1 generator可迭代
// 当你看到 next() 方法，或许你已经猜到了 generator 是 可迭代（iterable）的。

// ~ 1）我们可以使用 for..of 循环遍历它所有的值：
let generator = generateSequence();
for (let value of generator) {
  console.log(value);
}
// ~ ……但是请注意：上面这个例子会先显示 1，然后是 2，然后就没了。它不会显示 3！

// ! 这是因为当 done: true 时，for..of 循环会忽略最后一个 value。因此，如果我们想要通过 for..of 循环显示所有的结果，我们必须使用 yield 返回它们：

function* generateSequence2() {
  yield 1;
  yield 2;
  yield 3;
}

let generator2 = generateSequence2();

for (let value of generator2) {
  console.log(value); // 1，然后是 2，然后是 3
}

// ~2）可以用spread语法... （因为 generator 是可迭代的，我们可以使用 iterator 的所有相关功能）
let sequence = [0, ...generateSequence2()];
console.log(sequence); // [ 0, 1, 2, 3 ]

// ! 2 使用generator进行迭代
// 在前面的 Iterable object（可迭代对象） 一章中，我们创建了一个可迭代的 range 对象，它返回 from..to 的值。
let range = {
  from: 1,
  to: 5,

  // for..of range 在一开始就调用一次这个方法
  [Symbol.iterator]() {
    // ...它返回 iterator object：
    // 后续的操作中，for..of 将只针对这个对象，并使用 next() 向它请求下一个值
    return {
      current: this.from,
      last: this.to,

      // for..of 循环在每次迭代时都会调用 next()
      next() {
        // 它应该以对象 {done:.., value :...} 的形式返回值
        if (this.current <= this.last) {
          return { done: false, value: this.current++ };
        } else {
          return { done: true };
        }
      },
    };
  },
};

// 迭代整个 range 对象，返回从 `range.from` 到 `range.to` 范围的所有数字
console.log([...range]); // 1,2,3,4,5

// ? 如何使用generator实现？
let rangee = {
  from: 1,
  to: 5,
  *[Symbol.iterator]() {
    // [Symbol.iterator]: function* (){} 的简写形式
    for (let value = this.from; value <= this.to; value++) {
      yield value;
    }
  },
};

console.log([...rangee]); // [ 1, 2, 3, 4, 5 ]

/*
之所以代码正常工作，是因为 range[Symbol.iterator]() 现在返回一个 generator对象，而 generator 方法正是 for..of 所期望的：

   ~ 1 它具有 .next() 方法
   ~ 2 它以 {value: ..., done: true/false} 的形式返回值

当然，这不是巧合。generator 被添加到 JavaScript 语言中是有对 iterator 的考量的，以便更容易地实现 iterator。

带有 generator 的变体比原来的 range 迭代代码简洁得多，并且保持了相同的功能。
*/

/*
 * generator 可以永远产出（yield）值

在上面的示例中，我们生成了有限序列，但是我们也可以创建一个生成无限序列的 generator，它可以一直产出（yield）值。
~ 例如，无序的伪随机数序列。

~ 这种情况下肯定需要在 generator 的 for..of 循环中添加一个 break（或者 return）。否则循环将永远重复下去并挂起。

 */

// ! 3 generator 组合
// generator 组合（composition）是 generator 的一个特殊功能，它允许透明地（transparently）将 generator 彼此“嵌入（embed）”到一起。
// ~ generator 组合（composition）是将一个 generator 流插入到另一个 generator 流的自然的方式。它不需要使用额外的内存来存储中间结果。
// ~ 对于 generator 而言，我们可以使用 yield* 这个特殊的语法来将一个 generator “嵌入”（组合）到另一个 generator 中：
function* generateSequence3(start, end) {
  for (let i = start; i <= end; i++) yield i;
}

function* generatePasswordCodes() {
  // 0 - 9
  // 等同于for (let i = 48; i <= 57; i++) yield i;
  yield* generateSequence3(48, 57);
  // A-Z
  yield* generateSequence3(65, 90);
  // a-z
  yield* generateSequence3(97, 122);
}
// ~ yield* 指令将执行 委托 给另一个 generator。
// ~ 这个术语意味着 yield* generateSequence3 在  generateSequence3 上进行迭代，并将其产出（yield）的值透明地（transparently）转发到外部。
// ~ 就好像这些值就是由外部的 generator（generatePasswordCodes） yield 的一样。

let str = "";
for (let code of generatePasswordCodes()) {
  str += String.fromCharCode(code);
}
console.log(str); // 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz

// ! 4 yield的双向性：
// 目前看来，generator 和可迭代对象类似，都具有用来生成值的特殊语法。但实际上，generator 更加强大且灵活。这是因为 yield 是一条双向路（two-way street）
// ! 它不仅可以向外返回结果，而且还可以将外部的值传递到 generator 内。
// ~ 调用 generator.next(arg)，我们就能将参数 arg 传递到 generator 内部。这个 arg 参数会变成 yield 的结果。
function* genn() {
  // 向外部代码传递一个问题并等待答案
  let result = yield "2 + 3 = ?"; // (*)
  console.log(result);
}
let g = genn();
let question = g.next().value; // question: 2 + 3 = ?  <-- yield 返回的 value
g.next(5); //  --> 将结果传递到 generator 中(给yield返回的result)

/*

   ! 1 第一次调用 generator.next() 应该是不带参数的（如果带参数，那么该参数会被忽略）。它开始执行并返回第一个 yield "2 + 2 = ?" 的结果。此时，generator 执行暂停，而停留在 (*) 行上。
    2 然后，yield 的结果进入调用代码中的 question 变量。
    3 在 generator.next(5)，generator 恢复执行，并获得了 5 作为结果：let result = 5。
~ 我们可以看到，与常规函数不同，generator 和调用 generator 的代码可以通过在 next/yield 中传递值来交换结果。
*/

function* geen() {
  let ask1 = yield "2 + 2 = ?";

  console.log(ask1); // 4

  let ask2 = yield "3 * 3 = ?";

  console.log(ask2); // 9
}

let generator4 = geen();

console.log(generator4.next().value); // "2 + 2 = ?"

console.log(generator4.next(4).value); // "3 * 3 = ?"

console.log(generator4.next(9).done); // true
// ~ 这个过程就像“乒乓球”游戏。每个 next(value)（除了第一个）传递一个值到 generator 中，该值变成了当前 yield 的结果，然后获取下一个 yield 的结果。

// ! 5 generator.throw
// 正如我们在上面的例子中观察到的那样，外部代码可能会将一个值传递到 generator，作为 yield 的结果。
// ……但是它也可以在那里发起（抛出）一个 error。这很自然，因为 error 本身也是一种结果。

// ~ 要向 yield 传递一个 error，我们应该调用 generator.throw(err)。在这种情况下，err 将被抛到对应的 yield 所在的那一行。
function* gener() {
  try {
    let result = yield "2 + 2 = ?"; // (1)
    console.log("~~~"); // 没有输出
  } catch (error) {
    console.log(error); // * FFFF
  }
}

let generator5 = gener();
let r = generator5.next().value;
console.log("r", r); // 2 + 2 = ?
// ~ 在这里引入到 generator 的 error 导致了在 (1) 行中的 yield 出现了一个异常。
generator5.throw(new Error("FFFF"));

// ! 6 generator.return
// ~ generator.return(value) 完成 generator 的执行并返回给定的 value。
// 当我们想要在特定条件下停止 generator 时它会很有用。
function* gg() {
  yield 1;
  yield 2;
  yield 3;
}
const ggen = gg();
ggen.next(); // { value: 1, done: false }
ggen.return("foo"); // { value: "foo", done: true }
ggen.next(); // { value: undefined, done: true }

// TEST
// 生成伪随机数据
// 在 JavaScript 中，我们可以使用 Math.random()。但是如果什么地方出现了问题，我们希望能使用完全相同的数据进行重复测试。

// 为此，我们可以使用所谓的“种子伪随机（seeded pseudo-random）generator”。
// 它们将“种子（seed）”作为第一个值，然后使用公式生成下一个值。以便相同的种子（seed）可以产出（yield）相同的序列，因此整个数据流很容易复现。我们只需要记住种子并重复它即可。

// 这样的公式的一个示例如下，它可以生成一些均匀分布的值：

// next = previous * 16807 % 2147483647

function* pseudoRandom(seed) {
  let value = seed;
  while (true) {
    value = (value * 16807) % 2147483647;
    yield value;
  }
}
let geeee = pseudoRandom(1);
console.log(geeee.next().value); // 16807
console.log(geeee.next().value); // 282475249
console.log(geeee.next().value); // 。。。。
console.log(geeee.next().value);

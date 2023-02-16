// 浏览器中 JavaScript 的执行流程和 Node.js 中的流程都是基于 事件循环 的。
// 理解事件循环的工作方式对于代码优化很重要，有时对于正确的架构也很重要。

// ! 1 事件循环
/*
    ~ 事件循环 的概念非常简单。它是一个在 JavaScript 引擎等待任务，执行任务和进入休眠状态等待更多任务这几个状态之间转换的无限循环。

    引擎的一般算法：

        当有任务时：
            从最先进入的任务开始执行。
        休眠直到出现任务，然后转到第 1 步。

    当我们浏览一个网页时就是上述这种形式。JavaScript 引擎大多数时候不执行任何操作，它仅在脚本/处理程序/事件激活时执行。

    任务示例：

        当外部脚本 <script src="..."> 加载完成时，任务就是执行它。
        当用户移动鼠标时，任务就是派生出 mousemove 事件和执行处理程序。
        当安排的（scheduled）setTimeout 时间到达时，任务就是执行其回调。
        ……诸如此类。

    设置任务 —— 引擎处理它们 —— 然后等待更多任务（即休眠，几乎不消耗 CPU 资源）。

    一个任务到来时，引擎可能正处于繁忙状态，那么这个任务就会被排入队列。

    多个任务组成了一个队列，即所谓的“宏任务队列”（v8 术语）

    ~ 例如，当引擎正在忙于执行一段 script 时，用户可能会移动鼠标而产生 mousemove 事件，setTimeout 或许也刚好到期，以及其他任务，这些任务组成了一个队列

    ~ 队列中的任务基于“先进先出”的原则执行。当浏览器引擎执行完 script 后，它会处理 mousemove 事件，然后处理 setTimeout 处理程序，依此类推。

    * 两个细节：

    ~ 1 引擎执行任务时永远不会进行渲染（render）。如果任务执行需要很长一段时间也没关系。仅在任务完成后才会绘制对 DOM 的更改。
    ~ 2 如果一项任务执行花费的时间过长，浏览器将无法执行其他任务，例如处理用户事件。因此，在一定时间后，浏览器会抛出一个如“页面未响应”之类的警报，建议你终止这个任务。这种情况常发生在有大量复杂的计算或导致死循环的程序错误时。

*/

// *用例1： 拆分CPU过载任务
/*
如果你运行下面这段代码，你会看到引擎会“挂起”一段时间。对于服务端 JS 来说这显而易见，并且如果你在浏览器中运行它，尝试点击页面上其他按钮时，你会发现在计数结束之前不会处理其他事件。

let i = 0;
let start = Date.now();
function count() {

  / 做一个繁重的任务
  for (let j = 0; j < 1e9; j++) {
    i++;
  }
  alert("Done in " + (Date.now() - start) + 'ms');
}
count();

~ 可以使用setTimeout拆分这个任务
let i = 0;

let start = Date.now();

function count() {

  / 做繁重的任务的一部分 (*)
  do {
    i++;
  } while (i % 1e6 != 0);

  if (i == 1e9) {
    alert("Done in " + (Date.now() - start) + 'ms');
  } else {
    setTimeout(count); // 安排（schedule）新的调用 (**)
  }

}

count();

现在，浏览器界面在“计数”过程中可以正常使用。

单次执行 count 会完成工作 (*) 的一部分，然后根据需要重新安排（schedule）自身的执行 (**)：

    首先执行计数：i=1...1000000。
    然后执行计数：i=1000001..2000000。
    ……以此类推。

~ 现在，如果在引擎忙于执行第一部分时出现了一个新的副任务（例如 onclick 事件），则该任务会被排入队列，然后在第一部分执行结束时，并在下一部分开始执行前，会执行该副任务。
~ 周期性地在两次 count 执行期间返回事件循环，这为 JavaScript 引擎提供了足够的“空气”来执行其他操作，以响应其他的用户行为。

*/

// * 用例2：进度指示

// 正如前面所提到的，仅在当前运行的任务完成后，才会对 DOM 中的更改进行绘制，无论这个任务运行花费了多长时间。
/*
这是一个示例，对 i 的更改在该函数完成前不会显示出来，所以我们将只会看到最后的值：

<div id="progress"></div>

<script>

  function count() {
    for (let i = 0; i < 1e6; i++) {
      i++;
      progress.innerHTML = i;
    }
  }

  count();
</script>

……但是我们也可能想在任务执行期间展示一些东西，例如进度条。

如果我们使用 setTimeout 将繁重的任务拆分成几部分，那么变化就会被在它们之间绘制出来。

这看起来更好看：

<div id="progress"></div>

<script>
  let i = 0;

  function count() {

    / 做繁重的任务的一部分 (*)
    do {
      i++;
      progress.innerHTML = i;
    } while (i % 1e3 != 0);

    if (i < 1e7) {
      setTimeout(count);
    }

  }

  count();
</script>

现在 div 显示了 i 的值的增长，这就是进度条的一种。
*/

// * 用例3：在事件之后做一些事情
// ~ 在事件处理程序中，我们可能会决定推迟某些行为，直到事件冒泡并在所有级别上得到处理后。我们可以通过将该代码包装到零延迟的 setTimeout 中来做到这一点。
menu.onclick = function () {
  // ...

  // 创建一个具有被点击的菜单项的数据的自定义事件
  let customEvent = new CustomEvent("menu-open", {
    bubbles: true,
  });

  // 异步分派（dispatch）自定义事件
  setTimeout(() => menu.dispatchEvent(customEvent));
}; // ~ 它在 click 事件被处理完成之后发生。

// ! 宏任务与微任务
/*
    ~ 微任务仅来自于我们的代码。
    ~ 它们通常是由 promise 创建的：对 .then/catch/finally 处理程序的执行会成为微任务。微任务也被用于 await 的“幕后”，因为它是 promise 处理的另一种形式。

    ~ 还有一个特殊的函数 queueMicrotask(func)，它对 func 进行排队，以在微任务队列中执行。

    * 每个宏任务之后，引擎会立即执行微任务队列中的所有任务，然后再执行其他的宏任务，或渲染，或进行其他任何操作。

    ? script(macrotask) - microtasks - render - mousemove(macrotask) - microtasks - render - setTimeout(macrotask)
    ~ 微任务会在执行任何其他事件处理，或渲染，或执行任何其他宏任务之前完成。

    * 这很重要，因为它确保了微任务之间的应用程序环境基本相同（没有鼠标坐标更改，没有新的网络数据等）。
    ! 微任务之间上下文相同！
    如果我们想要异步执行（在当前代码之后）一个函数，但是要在更改被渲染或新事件被处理之前执行，那么我们可以使用 queueMicrotask 来对其进行安排（schedule）。
    这是一个与前面那个例子类似的，带有“计数进度条”的示例，但是它使用了 queueMicrotask 而不是 setTimeout。你可以看到它在最后才渲染。就像写的是同步代码一样：

    <div id="progress"></div>

    <script>
    let i = 0;

    function count() {

        / 做繁重的任务的一部分 (*)
        do {
        i++;
        progress.innerHTML = i;
        } while (i % 1e3 != 0);

        if (i < 1e6) {
        queueMicrotask(count);
        }

    }

    count();
    </script>



*/

// ! 总结

/*
~ 更详细的事件循环算法（尽管与 规范 相比仍然是简化过的）：

    1 从 宏任务 队列（例如 “script”）中出队（dequeue）并执行最早的任务。
    2 执行所有 微任务：
        · 当微任务队列非空时：
            · 出队（dequeue）并执行最早的微任务。
    3 如果有变更，则将变更渲染出来。
    4 如果宏任务队列为空，则休眠直到出现宏任务。
    5 转到步骤 1。

~ 安排（schedule）一个新的 宏任务：

    ·使用零延迟的 setTimeout(f)。

它可被用于将繁重的计算任务拆分成多个部分，以使浏览器能够对用户事件作出反应，并在任务的各部分之间显示任务进度。

此外，也被用于在事件处理程序中，将一个行为（action）安排（schedule）在事件被完全处理（冒泡完成）后。

~ 安排一个新的 微任务：

    * 使用 queueMicrotask(f)。
    * promise 处理程序也会通过微任务队列。

~ 在微任务之间没有 UI 或网络事件的处理：它们一个立即接一个地执行。

~ 所以，我们可以使用 queueMicrotask 来在保持环境状态一致的情况下，异步地执行一个函数。
*/

// TEST
// 输出是什么呢
console.log(1);

setTimeout(() => console.log(2));
// `setTimeout` 将回调添加到宏任务队列。
// - 宏任务队列中的内容：
//   `console.log(2)`

Promise.resolve().then(() => console.log(3));
// 将回调添加到微任务队列。
// - 微任务队列中的内容：
//   `console.log(3)`
Promise.resolve().then(() => setTimeout(() => console.log(4)));
// 带有 `setTimeout(...4)` 的回调被附加到微任务队列。
// - 微任务队列中的内容：
//   `console.log(3); setTimeout(...4)`
Promise.resolve().then(() => console.log(5));
// 回调被添加到微任务队列
// - 微任务队列中的内容：
//   `console.log(3); setTimeout(...4); console.log(5)`
setTimeout(() => console.log(6));
// `setTimeout` 将回调添加到宏任务队列
// - 宏任务队列中的内容：
//   `console.log(2); console.log(6)`

console.log(7);

// 1 7 3 5 2 6 4

/*

    1 立即输出数字 1 和 7，因为简单的 console.log 调用没有使用任何队列。
    2 然后，主代码流程执行完成后，开始执行微任务队列。
        ~ 其中有命令行：console.log(3); setTimeout(...4); console.log(5)。
        ~ 输出数字 3 和 5，setTimeout(() => console.log(4)) 将 console.log(4) 调用添加到了宏任务队列的尾部。
        ~ 现在宏任务队列中有：console.log(2); console.log(6); console.log(4)。
    3 当微任务队列为空后，开始执行宏任务队列。并输出 2、6 和 4。

*/

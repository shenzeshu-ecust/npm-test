// ~ react16 以前，采用的架构是【不可中断】的【递归方式】的 -- stack reconciler
// ~ react16 后，采用的架构是【可中断】的 【遍历】方式的 -- fiber reconciler

// * react16时，大多数事件冒泡到 HTML（document） 元素， react17 时，事件冒泡到应用所在根元素
/*
 * 这一改动的出发点是如果页面中存在多个React应用，由于他们都会在顶层document注册事件处理器，如果你在一个React子应用的React事件中调用了e.stopPropagation()，无法阻止事件冒泡到外部树，因为真实的事件早已传播到document。
 * 而将事件委托在React应用的根DOM容器则可以避免这样的问题，减少了多个React应用并存可能产生的问题，并且事件系统的运行也更贴近现在浏览器的表现。
    （ 有些事件没有 冒泡阶段。比如 scroll blur 以及各种媒体事件等）

 */
// 触发更新：
/**
 * 1 ReactDom.render
 * 2 setState
 * 3 useState
 * 4 forceUpdate
 * 5 ref 的改变
 * ....
 */

// ! 1 scheduler（根据优先级调度任务）
/*
当首次渲染或者组件状态发生更新等情况时，此时页面就要发生渲染了。
scheduler 过程会对诸多的任务进行优先级排序，让浏览器的每一帧优先执行高优先级的任务（例如动画、用户点击输入事件等），
从而防止 react 的更新任务太大影响到用户交互，保证了页面的流畅性。

*/

// ! 2 reconciler（diff,  打副作用标签）
/*
reconciler 过程中，会开始根据优先级执行更新任务。
这一过程主要是根据最新状态构建新的 fiber 树，与之前的 fiber 树进行 diff 对比，
对 fiber 节点标记不同的副作用，对应渲染过程中真实 dom 的增删改。
 */

// * 以上是更新过程的 render 阶段 （调度器scheduler和协调器reconciler），这个过程随时可以被打断

// ! 3 commit（  根据 effectList 副作用数组，对真实页面更新）
/*
在 render 阶段中，最终会生成一个 effectList 数组，
记录了页面真实 dom 的新增、删除和替换等以及一些事件响应，
commit 会根据 effectList 对真实的页面进行更新，从而实现页面的改变。
*/

// * 这是更新过程的 commit 阶段 （render 渲染器），这个过程不能被打断



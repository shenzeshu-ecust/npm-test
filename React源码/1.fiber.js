// fiber结构：是一个用对象表示的链表，这样把树结构通过child，sibling, return fiber（父节点）
// 等转化为链表，方便打断

// ~ React16将内部组件层改成Fiber这种数据结构，因此它的架构名也改叫Fiber架构。
// ~ Fiber节点拥有return, child, sibling三个属性，分别对应父节点， 第一个孩子， 它右边的兄弟， 有了它们就足够将一棵树变成一个链表， 实现深度优化遍历。

/**
 * fiber:
 * type 标记节点类型(div/span/...)
 * key 标记节点在当前层级下的唯一性
 * props 属性
 * index 标记当前层级下的位置
 * child 第一个子节点
 * sibling 下一个兄弟节点
 * return 父节点
 * stateNode 如果组件是原生标签则是dom节点，如果是类组件则是类实例
 */
export function createFiber(vnode, returnFiber) {
  const newFiber = {
    type: vnode.type,
    key: vnode.key,
    props: vnode.props,
    stateNode: null,
    child: null,
    return: returnFiber,
    sibling: null,
    alternate: null,
    flags: Placement,
    // ...
  };
  return newFiber;
}
/*
1 type和key字段：这两个字段在reconciliation期间确定Fiber是否可重用。
2 child和sibling字段：这些字段指向 第一个子节点/下一个兄弟节点 的Fiber结构。
    这就使得dom组件的树状结构通过这样一个Fiber指向一个Fiber的过程变成了链表结构。
3 return字段：return fiber 是当程序处理完当前fiber之后返回的fiber。从概念上讲，视为返回父fiber。
4 当我们使用链表结构的Fiber去diff时，便可以做到”被打断“

*/

/*
~ 加入fiber的react将组件更新分为两个时期,这两个时期以render为分界

render前的生命周期为phase1阶段1。
    这个阶段的生命周期是可以被打断的，每隔一段时间它会跳出当前渲染进程，去确定是否有其他更重要的任务。
    此过程，React在 workingProgressTree （并不是真实的virtualDomTree）上复用 current 上的 Fiber 数据结构来一步地（通过requestIdleCallback）来构建新的 tree，标记处需要更新的节点，放入队列中

render后的生命周期为phase2阶段2。
    phase2的生命周期是不可被打断的，React 将其所有的变更一次性更新到DOM上


~ 最重要的是phase1阶段所做的事。因此我们需要具体了解phase1的机制

如果不被打断，那么phase1执行完会直接进入render函数，构建真实的virtualDomTree
* 如果组件再phase1过程中被打断，即当前组件只渲染到一半（也许是在willMount,也许是willUpdate~反正是在render之前的生命周期），那么react会怎么干呢？ 
* react会放弃当前组件所有干到一半的事情，去做更高优先级更重要的任务（当然，也可能是用户鼠标移动，或者其他react监听之外的任务），当所有高优先级任务执行完之后，react通过callback回到之前渲染到一半的组件，从头开始渲染。（看起来放弃已经渲染完的生命周期，会有点不合理，反而会增加渲染时长，但是react确实是这么干的）

* 所有phase1的生命周期函数都可能被执行多次，因为可能会被打断重来

! 所以，facebook在react16增加fiber结构，其实并不是为了减少组件的渲染时间，事实上也并不会减少，最重要的是现在可以使得一些更高优先级的任务，如用户的操作能够优先执行，提高用户的体验，至少用户不会感觉到卡顿
*/

/*
1、链表树遍历算法：通过 节点保存与映射，便能够随时地进行 停止和重启，这样便能达到实现任务分割的基本前提

    首先通过不断遍历子节点，到树末尾；
    开始通过 sibling 遍历兄弟节点；
    return 返回父节点，继续执行2；
    直到 root 节点后，跳出遍历；

2、任务分割
    React 中的渲染更新可以分成两个阶段

        ~ reconciliation 阶段: vdom 的数据对比，是个适合拆分的阶段，比如对比一部分树后，先暂停执行个动画调用，待完成后再回来继续比对
        ~ Commit 阶段: 将 change list 更新到 dom 上，并不适合拆分，才能保持数据与 UI 的同步。否则可能由于阻塞 UI 更新，而导致数据更新和 UI 不一致的情况

3、分散执行： 
    ! 任务分割后，通过requestIdleCallback与requestAnimationFrame这两个API把小任务单元分散到浏览器的空闲期间去排队执行。
    ~ 低优先级的任务交给 requestIdleCallback处理，这是个浏览器提供的事件循环空闲期的回调函数，需要 pollyfill，而且拥有 deadline 参数，限制执行事件，以继续切分任务；
    ~ 高优先级的任务交给 requestAnimationFrame处理；

*/
// 类似于这样的方式
requestIdleCallback((deadline) => {
  // 当有空闲时间时，我们执行一个组件渲染；
  // 把任务塞到一个个碎片时间中去；
  while (
    (deadline.timeRemaining() > 0 || deadline.didTimeout) &&
    nextComponent
  ) {
    nextComponent = performWork(nextComponent);
  }
});

// 4、优先级策略: 文本框输入 > 本次调度结束需完成的任务 > 动画过渡 > 交互反馈 > 数据更新 > 不会显示但以防将来会显示的任务

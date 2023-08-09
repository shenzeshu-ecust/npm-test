/*
在我们的代码里面，休息就是检测时间然后断开Fiber链。

    updateFiberAndView里面先进行updateView，由于节点的更新是不可控，因此全部更新完，才检测时间。并且我们完全不用担心updateView会出问题，因为updateView实质上是在batchedUpdates中，里面有try catch。
    ~ 而接下来我们基于DFS更新节点，每个节点都要check时间，这个过程其实很害怕出错的， 因为组件在挂载过程中会调三次钩子/方法（constructor, componentWillMount, render）， 
    ~ 组件在更新过程中会调4次钩子（componentWillReceiveProps, shouldUpdate, componentWillUpdate）, 总不能每个方法都用try catch包起来，这样会性能很差。
    ~ 而constructor, render是不可避免的，于是对三个willXXX动刀了。
    * 在早期版本中，componentWillMount与componentWillReceiveProps会做内部优化，执行多次setState都会延后到render时进行合并处理。因此用户就肆意setState了。这些willXXX还可以让用户任意操作DOM。 
    ~ 操作DOM会可能reflow，这是官方不愿意看到的。于是官方推出了getDerivedStateFromProps，让你在render设置新state，你主要返回一个新对象，它就主动帮你setState。
    ~ 由于这是一个静态方法，你不能操作instance，这就阻止了你多次操作setState。由于没有instance,也就没有instance.refs.xxx，你也没有机会操作DOM了。
    ~ 这样一来，getDerivedStateFromProps的逻辑应该会很简单，这样就不会出错，不会出错，就不会打断DFS过程。
    * getDerivedStateFromProps取代了原来的componentWillMount与componentWillReceiveProps方法，而componentWillUpdate本来就是可有可无，以前完全是为了对称好看。
    ~ 在即使到来的异步更新中，reconciliation阶段可能执行多次，才执行一次commit，这样也会导致willXXX钩子执行多次，违反它们的语义，它们的废弃是不可逆转的。
    ~ 在进入commit阶段时，组件多了一个新钩子叫getSnapshotBeforeUpdate，它与commit阶段的钩子一样只执行一次。
    ~ 如果出错呢，在componentDidMount/Update后，我们可以使用componentDidCatch方法。于是整个生命周期函数就变成了如今的几个

reconciler阶段的钩子都不应该操作DOM，最好也不要setState，我们称之为轻量钩子*。commit阶段的钩子则对应称之为重量钩子**。
*/

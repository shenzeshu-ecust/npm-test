// * react-dom 的 package 提供了可在应用顶层使用的 DOM（DOM-specific）方法
// todo ----  ReactDOM.render(element, container[, callback])
// 如果提供了可选的回调函数，该回调将在组件 ① 被渲染或 ② 更新之后被执行。
/**
 * 1 ReactDOM.render() 会控制你传入容器节点里的内容。
 *   当首次调用时，容器节点里的所有 DOM 元素都会被替换，后续的调用则会使用 React 的 DOM 差分算法（DOM diffing algorithm）进行高效的更新。
 * 2 ReactDOM.render() 目前会返回对根组件 ReactComponent 实例的引用。
 *   但是，目前应该避免使用返回的引用，因为它是历史遗留下来的内容，而且在未来版本的 React 中，组件渲染在某些情况下可能会是异步的。
 *   如果你真的需要获得对根组件 ReactComponent 实例的引用，那么推荐为根元素添加 callback ref。
 */
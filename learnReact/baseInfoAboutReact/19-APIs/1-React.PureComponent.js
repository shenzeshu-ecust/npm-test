// React.PureComponent 与 React.Component 很相似。
// 两者的区别在于 React.Component 并未实现 shouldComponentUpdate()
// 而 React.PureComponent 中以  浅层对比 prop 和 state 的方式   来实现了该函数。

// React.PureComponent 中的 shouldComponentUpdate() 仅作对象的浅层比较。
// 如果对象中包含复杂的数据结构，则有可能因为无法检查深层的差别，产生错误的比对结果。

// 仅在你的 props 和 state 较为简单时，才使用 React.PureComponent，
// 或者在深层数据结构发生变化时调用 forceUpdate() 来确保组件被正确地更新。

// React.PureComponent 中的 shouldComponentUpdate() 将跳过所有子组件树的 prop 更新。因此，请确保所有子组件也都是“纯”的组件。
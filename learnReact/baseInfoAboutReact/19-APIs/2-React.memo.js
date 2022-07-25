const MyComponent = React.memo(function MyComponent(props) {
    /* 使用 props 渲染 */
}, areEqual);
//   React.memo 为高阶组件。
// ! 它与 React.PureComponent 非常相似，但只适用于 --函数组件-- ，而不适用 class 组件。

// todo 如果你的函数组件在给定相同 props 的情况下渲染相同的结果，那么你可以通过将其包装在 React.memo 中调用，以此通过记忆组件渲染结果的方式来提高组件的性能表现。
// todo 这意味着在这种情况下，React 将跳过渲染组件的操作并直接复用最近一次渲染的结果。

// ! React.memo 仅检查 --props-- 变更。
// 如果函数组件被 React.memo 包裹，且其实现中拥有 useState 或 useContext 的 Hook，当 context 发生变化时，它仍会重新渲染。

// 默认情况下其只会对复杂对象做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。

function MyComponent(props) {
    /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
    /*
    如果把 nextProps 传入 render 方法的返回结果与
    将 prevProps 传入 render 方法的返回结果一致则返回 true，
    否则返回 false
    */
}
export default React.memo(MyComponent, areEqual);
//   此方法仅作为性能优化的方式而存在。但请不要依赖它来“阻止”渲染，因为这会产生 bug。
// 与 class 组件中 shouldComponentUpdate() 方法不同的是，如果 props 相等，areEqual 会返回 true；如果 props 不相等，则返回 false。这与 shouldComponentUpdate 方法的返回值相反。
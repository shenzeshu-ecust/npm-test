// 正常useState
const [state, setState] = useState(initialState);
// ~ 1 函数式更新
// 如果新的 state 需要通过使用先前的 state 计算得出，那么可以将函数传递给 setState。该函数将接收先前的 state，并返回一个更新后的值。
// 下面的计数器组件示例展示了 setState 的两种用法：
function Counter({initialCount}) {
    const [count, setCount] = useState(initialCount);
    return (
      <>
        Count: {count}
        <button onClick={() => setCount(initialCount)}>Reset</button>
        <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
        <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
      </>
    );
  }
// ~ 2 惰性初始state （计算属性）
// ! initialState 参数只会在组件的初始渲染中起作用，后续渲染时会被忽略。
// ! 如果初始 state 需要通过复杂计算获得，则可以传入一个函数，在函数中计算并返回初始的 state，此函数只在初始渲染时被调用：
const [count, setCount] = useState(() => {
    return someExpensiveComputation(props);
  });
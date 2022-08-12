// ! useReducer -- state逻辑比较复杂且包含多个子值，或者下一个state依赖于之前的state等
// const [state, dispatch] = useReducer(reducer, initialArg, init);
/* 
! 指定初始 state

有两种不同初始化 useReducer state 的方式，你可以根据使用场景选择其中的一种。将初始 state 作为第二个参数传入 useReducer 是最简单的方法：
  const [state, dispatch] = useReducer(
    reducer,
    {count: initialCount}  
  );
! 惰性初始化
 ~ 你可以选择惰性地创建初始 state。为此，需要将 init 函数作为 useReducer 的第三个参数传入，这样初始 state 将被设置为 init(initialArg)。
 ~ 这么做可以将用于计算 state 的逻辑提取到 reducer 外部，这也为将来对重置 state 的 action 做处理提供了便利
 */
const { useReducer } = require("react");
function init(initialCount) {
    return {count: initialCount}
}
function reducer(state, action) {
    switch(action.type) {
        case 'increment':
            return {count: state.count + 1}
        case 'decrement':
            return {count: state.count - 1}
        case 'reset':
            return init(action.payload)
        default:
            throw new Error()
    }
}
function Counter({initialCount}) {
    const [state, dispatch] = useReducer(reducer, initialCount, init)
    return (
        <>
            Count: {state.count}
            <button style={{width: '50px', marginTop:'10px'}} onClick={() => dispatch({type: 'decrement'})}>-</button>
            <button style={{width: '50px', marginTop:'10px'}} onClick={() => dispatch({type: 'increment'})}>+</button>
            <button style={{width: '50px', marginTop:'10px'}} onClick={() => dispatch({type: 'reset', payload: initialCount})}>
                Reset
            </button>
        </>
    )
}
export default Counter
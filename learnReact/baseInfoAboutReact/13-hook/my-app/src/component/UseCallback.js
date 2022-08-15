/*
  在hooks出来之后，我们能够使用function的形式来创建包含内部state的组件。但是，使用function的形式，失去了上面的shouldComponentUpdate，我们无法通过判断前后状态来决定是否更新。
  而且，在函数组件中，react不再区分mount和update两个状态，这意味着函数组件的每一次调用都会执行其内部的所有逻辑，那么会带来较大的性能损耗。因此useMemo 和useCallback就是解决性能问题的杀手锏。
 
  !  useCallback和useMemo的参数跟useEffect一致，他们之间最大的区别有是useEffect会用于处理副作用，而前两个hooks不能。
   ! useMemo和useCallback都会在组件第一次渲染的时候执行，之后会在其依赖的变量发生改变时再次执行；
    ! 并且这两个hooks都返回缓存的值，useMemo返回缓存的变量，useCallback返回缓存的函数。
  */
const { useCallback, useState, useEffect } = require("react");
// 该回调函数仅在某个依赖项改变时才会更新。
// const memoizedCallback = useCallback(() => {
//     doSomething(a, b)
// }, [a ,b]) // ! 返回一个memoized函数
// ! useCallback(fn, deps) 相当于 useMemo(() => fn, deps)。

// 使用场景是：有一个父组件，其中包含子组件，子组件接收一个函数作为props；通常而言，如果父组件更新了，子组件也会执行更新；
// 但是大多数场景下，更新是没有必要的，我们可以借助useCallback来返回函数，然后把这个函数作为props传递给子组件；这样，子组件就能避免不必要的更新。
export default function Parent() {
  const [count, setCount] = useState(1)
  const [val, setVal] = useState('')
  const callback = useCallback(() => {
    console.log('callback');
    return count
  }, [count])
  return (
      <div>
            <h4>父组件{count}</h4>
            <Child callback={callback}/>
            <div>
                <button onClick={() => setCount(count + 1)}>+</button>
                <input value={val} onChange={event => setVal(event.target.value)}/>
            </div>
      </div>
    )
}
function Child({callback}) {
  const [count, setCount] = useState(() => callback())
  useEffect(() => {
    setCount(callback())
  }, [callback])
  return (
    <div>
      子组件{count}
    </div>
  )
}

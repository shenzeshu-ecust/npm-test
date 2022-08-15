import { forwardRef, useEffect } from "react";
import { useImperativeHandle } from "react";
import { useRef,React } from "react";
// !我们都知道父组件可以利用ref可以访问子组件实例或者DOM元素，这其实相当于子组件向父组件输出  本身实例或者 DOM元素.
// !子组件利用useImperativeHandle可以让父组件输出  任意数据。
// ! useImperativeHandle(ref, createHandle, [deps])
/*
  
   ~ 1 ref
    需要被赋值的ref对象。
   ~ 2 createHandle：
    createHandle函数的返回值作为ref.current的值。 返回值是一个对象！
   ~ 3 [deps]
    依赖数组，依赖发生变化会重新执行createHandle函数。


   ? 什么时候执行createHandle函数？
        ! createHandle函数的执行时机和useLayoutEffect一致，这样就保证了在任意位置的useEffect里都能拿到最新的ref.current的值。
    ? 应用场景
    !  主要是解决父组件获取子组件的数据或者调用子组件的里声明的函数。
 */
const FancyInput = forwardRef(function FancyInput(props, ref) {
    const inputRef = useRef
    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current.focus()
        }
    }))
    return <input ref={inputRef}/>
}) 



export default FancyInput
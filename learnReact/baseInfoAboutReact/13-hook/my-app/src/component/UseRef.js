// ! const refContainer = useRef(initialValue);
import { useRef, useEffect, useState } from 'react'
// ! useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内保持不变。
export default function TextInputWithFocusButton() {

    const inputEl = useRef(null);
    const onButtonClick = () => {
        // `current` 指向已挂载到 DOM 上的文本输入元素
        console.log('---', inputEl); // ~ {current: input.my-input}
        inputEl.current.focus();
    };
    return (
        <>
            <input ref={inputEl} type="text" className='my-input' />
            <button onClick={onButtonClick}>Focus the input</button>
        </>
    );
}
// useRef() Hook 不仅可以用于 DOM refs。「ref」 对象是一个 current 属性可变且可以容纳任意值的通用容器，类似于一个 class 的实例属性。

function Timer() {
    const intervalRef = useRef(); // useRef必须放在函数里，不能放在顶层

    useEffect(() => {
        const id = setInterval(() => {
            // ...
        });
        intervalRef.current = id;
        return () => {
            clearInterval(intervalRef.current);
        };
    });

    // ...
    //   如果我们只是想设定一个循环定时器，我们不会需要这个 ref（id 可以是在 effect 本地的），
    // ~ 但如果我们想要在一个事件处理器中清除这个循环定时器的话这就很有用了：
    // ...
    function handleCancelClick() {
        clearInterval(intervalRef.current);
    }
    // ...
    // ! 通常你应该在事件处理器和 effects 中修改 refs。
}
/*
useRef() 和自建一个 {current: ...} 对象的唯一区别是，useRef 会在每次渲染时返回同一个 ref 对象。

请记住，当 ref 对象内容发生变化时，useRef 并不会通知你。

! 变更.current 属性不会引发组件重新渲染。

如果想要在 React 绑定或解绑 DOM 节点的 ref 时运行某些代码，则需要使用回调 ref 来实现。
 */
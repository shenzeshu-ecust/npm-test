import React, { ReactDOM } from "react";
import { useState } from "react";
import { useLayoutEffect } from "react";
// 1 类式组件
// class Demo extends Component {
//     state = {count:0}
// myRef = React.createRef()
//     add= ()=> {
//         this.setState({count:this.state.count+1});
//     }
//  类式组件 可以使用钩子函数
//     componentDidMount() {
//        let timer =  setInterval(()=> {
//             this.setState(state=> {count:state.count+1});
//         },1000)
//     }
// death =()=> {
//     ReactDOM.unmountComponentAtNode(document.getElementById('root'))
// }
// show= ()=> {
//     alert(this.myRef.current.value)
// }
// componentWillUnmount() {
//     clearInterval(timer)
// }
//     render() {
//         return (
//             <div>
// <input type="text" ref={this.myRef}/>
//                 <h2>当前求和为：{this.state.count}</h2>
//                 <button onClick={this.add}>点我+1</button>
//                 <button onClick={this.death}>卸载组件</button>
//                 <button onClick={this.show}>show input</button>
//             </div>
//         );
//     }
// }
// 2 函数式组件
/**
 * 
 ! 传递给 useEffect 的函数在每次渲染中都会有所不同，这是刻意为之的。
 ! 事实上这正是我们可以在 effect 中获取最新的 count 的值，而不用担心其过期的原因。
 ! 每次我们重新渲染，都会生成新的 effect，替换掉之前的。
 ! 某种意义上讲，effect 更像是渲染结果的一部分 —— 每个 effect “属于”一次特定的渲染。
 */
function Demo() {
  const [count, setCount] = React.useState(0);
  const [name, setName] = React.useState("Tom");
  // ~ React.useEffect 相当于componentDidMount + componentDidUpdate + componentWillUnmount
  const myRef = React.useRef();
  // ~ React 保证了每次运行 effect 的同时，DOM 都已经更新完毕(浏览器完成画面渲染之后)
  // ~ React 将按照 effect 声明的顺序  依次调用组件中的每一个 effect。
  // ~ useEffect 默认就会处理: 更新update逻辑。它会在调用一个新的 effect 之前对前一个 effect 进行清理。
  React.useEffect(() => {
    // !  state\prop已经保存在函数作用域中。Hook 使用了 JavaScript 的闭包机制，而不用在 JavaScript 已经提供了解决方案的情况下，还引入特定的 React API。
    // let timer = setInterval(() => {
    //   setCount((count) => ++count);
    // }, 1000);
    return () => {
      // useEffect的返回的函数语句相当于  componentWillUnmount
      // clearInterval(timer);
    };
  }, []); // 挂载时 开启定时器
  React.useEffect(() => {
    // console.log("@");
    console.log('useEffect执行');

  }, [count]); // ! 第二个参数为空数组时，只在  挂载时执行（谁也不监测）
  // ! 不加[]（变量都检测） 挂载、更新都会调用
  //  [count] 只监测count

  const [n, setN] = useState(0)
    //! useEffect在浏览器渲染完成后执行
    // ! useLayoutEffect在DOM更新后执行
// ? useLayoutEffect
    // useLayoutEffect 总是比 useEffect 先执行
    // 使用 useLayoutEffect 时，里面的作用最好改变布局 ，否则会占用等待时间

    // 为了用户体验，优先使用 useEffect（优先渲染），因为大部分时候，我们不会去改变DOM
    // useLayoutEffect 会影响用户看到画面变化的时间

  useLayoutEffect(() => {
    document.querySelector('.txt').innerHTML = `1000`
    console.log('useLayoutEffect执行');
  }, [n])
  function add() {
    // setCount(count +1) // 第一种写法
    setCount((count) => count + 1); // 第二种写法
  }
  function change() {
    setName("Jack");
  }
  function unLoad() {
    ReactDOM.unmountComponentAtNode(document.querySelector("#root"));
  }
  function show() {
    alert(myRef.current.value);
  }
  return (
    <div>
      <h2>当前求和为：{count}</h2>
      <h2>我的名字是{name}</h2>
      <input type="text" ref={myRef} />
      <button onClick={add}>点我+1</button>
      <button onClick={change}>点我改名</button>
      <button onClick={unLoad}>卸载组件</button>
      <button onClick={show}>显示input</button>
      <div className="txt">100</div>
    </div>
  );
}
export default Demo;

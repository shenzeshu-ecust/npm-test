import React, { ReactDOM } from "react";
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
function Demo() {
  const [count, setCount] = React.useState(0);
  const [name, setName] = React.useState("Tom");
  // React.useEffect 相当于componentDidMount + componentDidUpdate + componentWillUnmount
  const myRef = React.useRef();
  React.useEffect(() => {
    let timer = setInterval(() => {
      setCount((count) => ++count);
    }, 1000);
    return () => {
      // useEffect的返回的函数语句相当于  componentWillUnmount
      clearInterval(timer);
    };
  }, []); // 挂载时 开启定时器
  React.useEffect(() => {
    console.log("@");
  }, [count]); // 第二个参数为空数组时，只在挂载时执行（谁也不监测）
  // 不加[]（变量都检测） 挂载、更新都会调用
  //  [count] 只监测count
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
    </div>
  );
}
export default Demo;

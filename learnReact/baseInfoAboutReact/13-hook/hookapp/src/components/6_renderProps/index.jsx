import React, { Component } from "react";
import "./index.css";

// 插槽 技术 —— 动态传入组件
// render 属性后面跟一个返回 组件的函数

class Demo extends Component {
  render() {
    return (
      <div className="parent">
        <h3>我是Demo组件</h3>

        {/*  
                1 children Props
                想要传递值 不写成这样
                <B>
                    <C/>
                </B> 
                */}
        {/* 2 render Props 可以传递值 */}
        <B render={(name) => <C name={name} />} />
        {/* 组件体中内容需要通过props.children展现 */}
        {/* 想要展示B标签里的内容，需要在子组件里用props.children接收！ */}
        {/* <B>你好啊</B>  */}
      </div>
    );
  }
}
class B extends Component {
  state = { name: "Tom" };

  render() {
    const { name } = this.state;
    return (
      <div className="child">
        <h3>我是B组件</h3>
        展示下C组件 ↓{/* {this.props.children}*/}
        {/* 插槽 */}
        {this.props.render(name)}
        {/* <C/> */}
      </div>
    );
  }
}
class C extends Component {
  render() {
    return (
      <div className="grand">
        <h3>我是C组件</h3>
        <h4>{this.props.name}</h4>
      </div>
    );
  }
}
export default Demo;

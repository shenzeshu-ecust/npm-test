import React, { Component } from 'react';
import './index.css'
// Context需要放在ABC组件都能访问到的位置
// 1 创建context
const MyContext = React.createContext()
const {Provider,Consumer} = MyContext
class Demo extends Component {
    state = {username:'JACK',age:13}
    render() {
        const {username,age}= this.state
        return (
            <div className="parent">
                <h3>我是Demo组件</h3>
                <h4>我的用户名：{username}</h4>
                <Provider value={{username,age}}> 
                    <B/>
                </Provider>
            </div>
        );
    }
}
class B extends Component {
    render() {
        console.log('B',this.context); // 没声明 所以收不到

        return (
            <div className="child">
                <h3>我是B组件</h3>
                <h4>我从Demo组件获得的用户名：??</h4>
                <C/>
            </div>
        );
    }
}
// class C extends Component {
//     static contextType = MyContext  // 声明 要接受  必须是static
//     /**
//      * static contextType = MyContext 
//      * this.context
//      * 两者搭配 只适用于类组件
//      * --------------------
//      * 第二种方式： 函数组件 类组件都可以
//      *  <xxContext.Consumer>
//      *  {
//      *         value => ( // value就是context中的value数据
//      *         )
//      * }
//      * </xxContext.Consumer>
//      */
//     render() {
//         console.log('C',this.context);
//         return (
//             <div className="grand">
//                 <h3>我是C组件</h3>
//                 <h4>我从Demo组件获得的用户名：{this.context.username}</h4>
//                 <h4>我从Demo组件获得的年龄：{this.context.age}</h4>

                
//             </div>
//         );
//     }
// }
function C() {
    return (
        <div className="grand">
            <h3>我是C组件</h3>
            <h4>我从Demo组件获得的用户名：
                <Consumer>
                    {
                        value => {
                            console.log(value);
                            return `${value.username}，年龄是${value.age}`
                            // 或者 return <span>value.username</span>
                        }
                    }
                </Consumer>
            </h4>
            
        </div>
    );
}
export default Demo;
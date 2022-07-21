import React, { Component } from 'react';

class Demo extends Component {
    state = {count : 0}
    add = ()=> {
        // 1 获取值
        // const {count} = this.state
        // 2 更新值
        /*
        // <1>对象式的setState
        // setState(stateChange,[callback]) 有一个可选参数
        
        this.setState({count:count+1},()=> {
            console.log('=========== render更新后的值 === react改完后的值 ======================');
            console.log(this.state.count);
            console.log('====================================');
        }) // react状态更新是异步的
        console.log('=========== 非[callback]中查看的值 =========================');
        console.log(count); //落后一步的count值
        console.log('====================================');
        */
    //    <2> 函数式的setState setState(updater,[callback])
        this.setState((state,props)=> {
            console.log('====================================');
            console.log(state,props);
            console.log('====================================');
            return {count:state.count+1 +props.a}
        });
    }
    render() {
        return (
            <div>
                <h1>当前和为：{this.state.count}</h1>
                <button onClick={this.add}>点我+1</button>
            </div>
        );
    }
}

export default Demo;
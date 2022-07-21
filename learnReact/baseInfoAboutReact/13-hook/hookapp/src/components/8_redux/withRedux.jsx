import React, { Component } from 'react';
// 引入store 用以获取
import store from './redux/store'
import {createDecrementAction, createIncrementAction, createIncrementAsyncAction} from './redux/count_action'
class Demo extends Component {
    /*
    ! 这里如果每个组件都这样写 会造成臃肿 所以最终是在index.js里写一次。
    componentDidMount() {
        // 检测redux状态变化，只要发生变化，就调用render触发更新。
        store.subscribe(()=> {
            this.setState({})
        })
    }
    */
    increment = ()=> {
        // console.log(this.selectNumber);
        const {value} = this.selectNumber
        // store.dispatch({type:'increment',data:value*1})
        store.dispatch(createIncrementAction(value * 1))
        
    }
    decrement = ()=> {
        
        const {value} = this.selectNumber
        // store.dispatch({type:'decrement',data:value*1})
        store.dispatch(createDecrementAction(value * 1))
    }
    incrementIfOdd = ()=> {
        console.log(this.selectNumber);
        const {value} = this.selectNumber
        const count = store.getState()
        if(count % 2 !== 0) {
            // store.dispatch({type:'increment',data:value*1})
        store.dispatch(createIncrementAction(value * 1))



        }
    }
    incrementAsync = ()=> {
        
        const {value} = this.selectNumber
        
        // setTimeout(()=> {
            // store.dispatch({type:'increment',data:value*1})
             // ! 这里把异步交给redux；而不是在组件里完成异步逻辑
            store.dispatch(createIncrementAsyncAction(value * 1, 500))
        // },500)
    }
    render() {
        return (
            <div>
                <h3>当前求和为: 
                    <span style={{color:'red'}}> {store.getState()}</span>
                </h3>
                <select ref={c=>this.selectNumber = c}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>


                </select> &nbsp;
                <button onClick={this.increment}>+</button>&nbsp;
                <button onClick={this.decrement}>-</button>&nbsp;
                <button onClick={this.incrementIfOdd}>当前求和值为奇数才加</button>&nbsp;
                <button onClick = {this.incrementAsync}>异步加</button>


            </div>
        );
    }
}

export default Demo;
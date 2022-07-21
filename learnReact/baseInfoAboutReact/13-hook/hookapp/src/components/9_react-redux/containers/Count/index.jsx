import React, { Component } from 'react';
import { createIncrementAsyncAction, createDecrementAction, createIncrementAction } from '../../redux/actions/count'
// 引入connnect用于连接UI组件和redux
import { connect } from 'react-redux'
// ! 总体 容器组件和UI组件要混合成一个文件
// 定义Count的UI组件
class Count extends Component {
    
    increment = ()=> {
        const {value} = this.selectNumber
        this.props.increment(value * 1)
    }
    decrement = ()=> {  
        const {value} = this.selectNumber
        this.props.decrement(value * 1)

    }
    incrementIfOdd = ()=> {
        const {value} = this.selectNumber
        if(this.props.count % 2 !== 0) {
            this.props.increment(value * 1)
        }
    }
    incrementAsync = ()=> {
        const {value} = this.selectNumber
        this.props.incrementAsync(value * 1, 500)

    }
    render() {
        // console.log('Count容器组件传过来的props为： ', this.props);
        return (
            <div>
                <h2 style={{color:"cadetblue", borderBottom:"1px #ccc solid"}}>Count组件</h2>
                <h4>当前求和为: 
                    <span style={{color:'red'}}> {this.props.count}</span>
                    <hr />
                    <span>本Count组件内获得的Person组件人数为: {this.props.person.length}</span>
                </h4>
            
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
// 1 mapStateToProps 是一个函数，并且返回一个对象；返回对象中的key作为传递给UI组件props的key。
const mapStateToProps = state => ({ count: state })

// 2 mapDispatchToProps 是一个函数，并且返回一个对象；返回对象中的key作为传递给UI组件props的key。
// * 自带参数用以执行dispatch
const mapDispatchToProps = dispatch => ({
    increment: (number) => {
        dispatch(createIncrementAction(number))
    },
    decrement: (number) => {
        dispatch(createDecrementAction(number))
    },
    incrementAsync: (number, delay) => {
        dispatch(createIncrementAsyncAction(number, delay))
    }
})

// TODO 通过connect()()函数创建并暴露一个容器组件 
// ? mapStateToProps 用于传递状态，而mapDispatchToProps用于传递操作状态的方法。
// export default connect(mapStateToProps, mapDispatchToProps)(CountUI)
// mapDispatchToProps 的简写版本
// 也是用的多的一种方式 => 第二个参数传对象

export default connect(state => 
    ({ count: state.count, person: state.persons }),
    {
        increment: createIncrementAction,
        decrement: createDecrementAction,
        incrementAsync: createIncrementAsyncAction
    }

)(Count)



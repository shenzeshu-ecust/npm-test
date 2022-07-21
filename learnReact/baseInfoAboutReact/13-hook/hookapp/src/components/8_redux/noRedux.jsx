import React, { Component } from 'react';

class Demo extends Component {
    state = {count:0}
    increment = ()=> {
        // console.log(this.selectNumber);
        const {value} = this.selectNumber
        const {count} = this.state
        this.setState({count:count+value*1});
    }
    decrement = ()=> {
        
        const {value} = this.selectNumber
        const {count} = this.state
        this.setState({count:count-value*1});
    }
    incrementIfOdd = ()=> {
        console.log(this.selectNumber);
        const {value} = this.selectNumber
        const {count} = this.state
        if(count % 2 !== 0) {
            this.setState({count:count+value*1});

        }
    }
    incrementAsync = ()=> {
        
        const {value} = this.selectNumber
        const {count} = this.state
        setTimeout(()=> {
            this.setState({count:count+value*1});
        },500)
    }
    render() {
        return (
            <div>
                <h3>当前求和为: 
                    <span style={{color:'red'}}> {this.state.count}</span>
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
import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
import Search from './components/Search'
import List from './components/List'
export default class App extends Component {
    // 初始化状态
    state = {
        users: [],
        isFirst: true, // 是否第一次打开页面
        isLoading: false, // 标识是否处于加载中
        err: '', // 存储错误信息
    }
    saveUsers = (users) => {
        this.setState({users})
    }
    updateAppState = (stateObj) => {
        this.setState(stateObj)
    }
    render() {
        // const {users} = this.state
        return (
            <div className="container">
               <Search updateAppState={this.updateAppState}></Search>
               <List {...this.state}></List>
            </div>
        )
    }
}

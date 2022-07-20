import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
import Search from './components/Search'
import List from './components/List'
export default class App extends Component {
    // 初始化状态
    state = {
        
    }
   
    render() {
        
        return (
            <div className="container">
               <Search></Search>
               <List></List>
            </div>
        )
    }
}

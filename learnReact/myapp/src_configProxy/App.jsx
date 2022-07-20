import React, { Component } from 'react'
import axios from 'axios'
import './App.css'
export default class App extends Component {
    // 初始化状态
    state = {
        count: 0
    }
    getStudentsInfo = () => {
        // 需要解决跨域：
        // 方法1：针对一个代理
        // package.json添加proxy（"proxy": "http://localhost:5001"），转发到5001端口
        // 3000端口没有的文件才回去proxy的端口找，
        // 如果有，比如http://localhost:3000/index.html,那么就可以找到，找到的就是 public文件夹下的index.html
        axios.get('http://localhost:3000/api1/students').then(res => {
            console.log('success!', res.data);
        }, err => {
            console.log('something wrong!');
        })
    }
    getCarsInfo = () => {
        // 需要解决跨域：
        // 方法2：src下新建setupProxy.js文件 --- 可以配置多个代理，灵活控制请求是否走代理
        
        axios.get('http://localhost:3000/api2/cars').then(res => {
            console.log('success!', res.data);
        }, err => {
            console.log('something wrong!');
        })
    }
    render() {
        const { count } = this.state
        return (
            <div className='box'>
                <h2>{count}</h2>
                <button className='btn' onClick={this.getStudentsInfo}>getStudentInfo</button>
                <button className='btn' onClick={this.getCarsInfo}>getCarsInfo</button>

            </div>
        )
    }
}

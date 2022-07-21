import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
// ! 为了让store里的状态也可触发更新，引入
// import store from './components/8_redux/redux/store'
import store from './components/9_react-redux/redux/store';
import { Provider } from 'react-redux'
/*     
 ? 如果用react-redux 就不需要这个就可以实现页面更新，原理是connnect函数 可以自己实现更新
    store.subscribe(() => {
        ReactDOM.render( < App / > , document.getElementById('root'))

    }) */
// ReactDOM.render( < App / > , document.getElementById('root'))
// 不需要自己在App.jsx中传入store属性。而是借用Provider实现store的传递
ReactDOM.render( <
    Provider store = { store } >
    <
    App / >
    <
    /Provider>,
    document.getElementById('root'))
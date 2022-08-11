import React, { Component } from 'react';
// import Demo from './components/1_setState'
import Demo from './components/2_hooks/index'
// import Demo from './components/3_Fragment'
// import Demo from './components/4_Context'
// import Demo from './components/5_组件优化'
// import Demo from './components/6_renderProps'
// import Demo from './components/7_发布订阅/index'
// import Demo from './components/8_redux/noRedux'
// import Demo from './components/8_redux/withRedux'
// ! react-redux引入的是容器组件
// import Count from './components/9_react-redux/containers/Count/index';
// import Person from './components/9_react-redux/containers/Person/index';
import store from './components/9_react-redux/redux/store';

class App extends Component {
    render() {
        return (
            <>
                {/* 给容器组件传递store */}
                {/* <Demo a={100} store={store}/> */}
                {/* 去他的更上级 index.js 中 用Provider传递store */}
                <Demo a={100}/>
                {/* <Count/>
                <Person/> */}
            </>
        );
    }
}

export default App;
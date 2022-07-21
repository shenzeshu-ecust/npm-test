// 该文件专门用于暴露一个store对象，整个应用只有一个store对象
// 引入redux中的createStore 专门用于创建redux中核心的store对象
import { createStore, applyMiddleware } from 'redux'
// 引入汇总后的reducers
import allReducers from './reducers/index'
// 引入用于支持异步action的redux-thunk
import thunk from 'redux-thunk';
// 引入redux的开发者工具（chorme中可以调试这个工具）
import { composeWithDevTools } from 'redux-devtools-extension';


// export default createStore(allReducers, applyMiddleware(thunk))
// 如果没用到异步，第二个参数直接就是composeWithDevTools()
export default createStore(allReducers, composeWithDevTools(applyMiddleware(thunk)))
// 该文件专门用于暴露一个store对象，整个应用只有一个store对象
// 引入redux中的createStore 专门用于创建redux中核心的store对象
import { createStore, applyMiddleware } from 'redux'
import countReducer from './count_reducer'
// 引入用于支持异步action的redux-thunk
import thunk from 'redux-thunk';
export default createStore(countReducer, applyMiddleware(thunk))
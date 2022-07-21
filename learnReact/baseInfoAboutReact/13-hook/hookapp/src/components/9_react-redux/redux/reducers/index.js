// 该文件用于汇总reducers
import { combineReducers } from 'redux';
import count from './count'
import persons from './person';
// 合并reducers
export default combineReducers({
    count,
    persons
});
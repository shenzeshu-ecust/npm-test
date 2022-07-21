/* 该文件用于创建一个为Count组件服务的reducer 
 todo reducers 纯函数
 * 本质就是一个函数
 * 接收两个参数（preState,action）
 */
import { INCREMENT, DECREMENT } from './constant';
// ! 设置一个初始值
const initState = 0

export default function countReducer(preState = initState, action) {
    console.log("🚀 ~ file: count_reducer.js ~ line 10 ~ countReducer ~ preState , action is :", preState, action)
        // 如果不初始化，preState是undefined
        // if (preState === undefined) preState = 0
        // 从action对象中 获取：type、 data
        // 初始值 type: "@@redux/INITu.f.f.z.m.k"
    const { type, data } = action
    // 根据type决定如何让加工数据
    switch (type) {
        case INCREMENT:
            return preState + data
        case DECREMENT:
            return preState - data
        default:
            return preState

    }
}
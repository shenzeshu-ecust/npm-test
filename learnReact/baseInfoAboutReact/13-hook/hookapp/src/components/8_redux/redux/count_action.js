// todo 该文件专门为Count组件生成action对象
// ! 如果想要返回对象形式的对象，那么不用return的话 ，需要加一个（）
import { INCREMENT, DECREMENT } from './constant'
//  同步action：action的值为Object类型的对象
export const createIncrementAction = data => ({ type: INCREMENT, data })
export const createDecrementAction = data => ({ type: DECREMENT, data })
    // 异步action：action的值为函数function
    // * 异步action中一般会调用同步action
export const createIncrementAsyncAction = (data, time) => {
    return (dispatch) => {
        setTimeout(() => {
            dispatch(createIncrementAction(data))
        }, time)
    }
}
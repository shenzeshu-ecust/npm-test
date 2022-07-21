import { ADD_PERSON } from '../constant';
const initState = [{ id: '001', name: 'Tom', age: '21' }]
export default function personReducer(preState = initState, action) {
    console.log('personReducer执行了');
    const { type, data } = action
    switch (type) {
        case ADD_PERSON:
            // ? 这里如果使用unshift方式添加，会造成reducer不更新。因为默认浅比较,而preState是数组对象
            // ? 当发现地址一样时，仍然输出原始值
            // // preState.unshift(data) 此处不可以这样写 会改写preState
            // // return preState
            return [data, ...preState]
        default:
            return preState
    }
    /*
    TODO redux的reducer必须是一个纯函数
     * 纯函数
    只要是同样的输入（实参），必定得到同样的输出
    必须遵守以下约定：
    ! 不得改写参数数据
    ! 不会产生任何副作用，例如网络请求，输入和输出设备等
    ! 不能调用Date.now() 或者 Math.random()等不纯的方法
     */
}
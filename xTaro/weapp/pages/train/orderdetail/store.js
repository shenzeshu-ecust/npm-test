import util from '../common/util'
import { handleOrderInfoToBreak } from './common'
import {
    OrderDetailModel,
} from '../common/model'
/**
 * 组件之间以及页面之间的全局属性 我们都定义在这里 同时也要在用的地方的 data 里声明该属性 否则会无法更新改属性
 */
export default {
    data: {
        oid: '',
        subOrderId: '',
        orderInfo: {},
        configs: {},
        begain: '',
        showType: '',
        isWorkTime: true,
        properties: {
            text: '请登录该订单对应的携程账户',
            loginHandler: 'ctripLogin',
        },
    },
    loadData(oid){
        const deferred = util.getDeferred()
        const params = {
            OrderId: oid,
            ver: 1,
            Channel: 'WX',
        }
        OrderDetailModel(params, data => {
            // auth 失效的情况要注意
            if (data.ResponseStatus && data.ResponseStatus.Errors && data.ResponseStatus.Errors.length) {
                deferred.reject(data)
            } else if (Object.keys(data).length === 0) {
                util.showModal({
                    m: '系统异常，请稍后重试',
                })
                deferred.reject()
            } else {
                // parse 未通过核验的 content
                data?.OrderInfo?.TopMessageInfo?.MessageList?.forEach(msg => {
                    if (msg.MessageType === 3 && msg.Content) {
                        msg.Content = JSON.parse(msg.Content)
                    }
                })
                if ( handleOrderInfoToBreak(data?.OrderInfo) ){
                    return deferred.reject()
                }
                deferred.resolve(data)
            }
        }, err => {
            deferred.reject(err)
        }, () => {})

        return deferred.promise
    },
}

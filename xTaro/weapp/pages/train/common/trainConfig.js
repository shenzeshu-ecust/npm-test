import { cwx } from "../../../cwx/cwx"
import { pageIds } from './pageid'
import { globalListenerInit } from './globalListener'

let shared = (function () {
    let shared = cwx.train
    let trainConfig = {
        partnerName: 'Ctrip.Train',
        maxOtherAmount: 11,
        traceChannel: 'weixin',
        childAgeLimit:'2023-01-01'
    }

    //独立版 WX_Train 主版 WX 支付宝 AliApp
    switch (cwx.appId) {
        case '11048657':
            trainConfig.channel = 'Baidu'
            trainConfig.requestChannel = "Train.Baidu"
            trainConfig.traceChannel = "baidu"
            break
        case 'wxd18d0e7f7784a6c4':
            trainConfig.channel = 'WX_Train'
            trainConfig.requestChannel = "Train.Train"
            trainConfig.traceChannel = "train"
            break
        case '2017081708237081':
            trainConfig.channel = 'AliApp'
            trainConfig.requestChannel = "Train.Aliapp"
            trainConfig.traceChannel = "alipay"
            break
        case 'wx0e6ed4f51db9d078':
        default:
            trainConfig.channel = 'WX'
            trainConfig.requestChannel = "Train.Ctrip"
            break
    }

    trainConfig.pageIds = pageIds[cwx.appId]
    trainConfig.isTrainApp = trainConfig.requestChannel === 'Train.Train'
    trainConfig.isCtripApp = trainConfig.requestChannel === 'Train.Ctrip'
    trainConfig.isAliApp = trainConfig.requestChannel === 'Train.Aliapp'
    trainConfig.isBaiduApp = trainConfig.requestChannel === "Train.Baidu"
    trainConfig.pasCntLimit = 5

    Object.assign(shared, trainConfig)

    return shared
})()

globalListenerInit()

export { shared }

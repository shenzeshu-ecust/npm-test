import cDate from '../common/cDate'
import util from '../common/util'
import { cwx } from '../../../cwx/cwx'
import { TrainGrabTicketChangeAcceptInfoV2OuterModel } from '../common/model'

function parseCDateTime(time) {
    try {
        // 下单后立即读取订单详情，会出现 ...-0000 时间
        let tmp = time.replace(/\/Date\(([+-\d]+)\)\//gi, "$1")

        return new cDate(parseInt(tmp))
    } catch (e) {
        return ''
    }
}

function handleOrderInfoToBreak(OrderInfo) {
    if (!OrderInfo) {
        return false
    }
    const { ExceptionOrderDetailPage } = OrderInfo
    if (ExceptionOrderDetailPage?.JumpUrl) {
        const JumpUrl = ExceptionOrderDetailPage.JumpUrl
        if(JumpUrl.indexOf('/pages') === 0){
            cwx.redirectTo({
                url: JumpUrl,
            })

            return true
        }
        const jumpUrl = JumpUrl.includes('showhead')
            ? JumpUrl : `${JumpUrl}&showhead=0`
        cwx.redirectTo({
            url: `/pages/train/authorise/web/web?data=${JSON.stringify({
                url: encodeURIComponent(jumpUrl),
                needLogin: true,
                title: '中断'
            })}`,
        })
        return true
    }
    return false
}

function formatDateTime(timeCDate) {
    if (!timeCDate) {
        return ''
    }
    let time = timeCDate.format('YmdHi')
    let dDate = new Date(time.substring(0,4) + '/' + time.substring(4,6) + '/' + time.substring(6, 8))
    let nowDate = new cDate()
    let date = new cDate(dDate.getTime() / 1000)
    if (nowDate.trimDay().stamp() == date.trimDay().stamp()){
        return '今天' + ' ' + time.substring(8, 10) + ':' + time.substring(10, 12)
    } else {
        return time.substring(4,6) + '.' + time.substring(6, 8) + ' ' + time.substring(8, 10) + ':' + time.substring(10, 12)
    }
}

function getTicketChangeParams(params = {}) {
    const { AppendList = [], OriginalOrderId, ChangeType = 0, RecommmendServiceList = [], TrainNumbers, SeatNames } = params

    return {
        Channel: 'ctripwx',
        IsAllDayJL: false,
        IsAcceptRecTrainJL: false,
        GrabType: 0, // 0:按车次抢，1:按时间段, 目前都按车次抢
        ChangeType, // 0 正常改单，1原单添加加速包，2保底票改单，3原单修改为24小时柜台票 4改签抢票改单 5改签抢票单独添加加速包  6原单使用vip抢票特权  7原单详情页使用积分对应加速包 8取消订单挽回9原单使用抢票年卡vip特权,10=购买无忧抢票,11=购买抢票智能推荐服务，12=单独开启临近推荐 13=原单使用指定vip抢票特权(新流程) 17=专人抢票
        PreOrderId: 0, // TODO: 保底票流程使用，目前传0
        AppendList,
        OriginalOrderId,
        RecommmendServiceList,
        TrainNumbers,
        SeatNames,
    }
}
/**
 * 改单
 */
function ticketChangeAppendProduct(params) {
    return util.promisifyModel(TrainGrabTicketChangeAcceptInfoV2OuterModel)(params)
}


export {
    parseCDateTime,
    formatDateTime,
    ticketChangeAppendProduct,
    getTicketChangeParams,
    handleOrderInfoToBreak,
}

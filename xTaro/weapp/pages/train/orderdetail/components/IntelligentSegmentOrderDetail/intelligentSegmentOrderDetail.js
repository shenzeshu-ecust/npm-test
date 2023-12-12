import { _ } from '../../../../../cwx/cwx'
import util from '../../../common/util'
import cDate from '../../../common/cDate'
import { TrainStationStore } from '../../../common/store'
import {
    OrderDetailModel,
} from '../../../common/model'
import {
    getConfigInfoJSON,
} from '../../../common/common'
import { cwx } from '../../../../../cwx/cwx'

const weekDay = {
    1: '周一',
    2: '周二',
    3: '周三',
    4: '周四',
    5: '周五',
    6: '周六',
    7: '周日',
    0: '周日',
}

const orderStatusMap = {
    1: "待出票",
    2: "出票中",
    3: "出票异常",
    4: "已出票",
    0: "待出票",
};

const groupOrderStatusMap = {
    1: '待确认',
    2: '出票中',
    3: '部分抢票成功',
    4: '抢票成功',
}

export default {
    properties: {
        orderInfo: {
            type: Object,
        },
    },
    data: {
        originOrderInfo: null,
        jLDetailInfo: null,
        recommendTicketInfo: null,
        recommendInfo: null,
        orderInfo1: null,
        orderInfo2: null,
    },
    onReady() {
    },
    onShow() {
    },
    methods: {
        async intelligenceRecommendEntranceHandler(orderInfo) {
            const segmentationInfo = this.getSegmentationInfo(orderInfo)

            const intelligenceRecommendStr = orderInfo?.ExtendList?.find(item => item.Key === 'IntelligenceRecommendV3')?.Value

            if (!!segmentationInfo) {
                await this.segmentationTripHandler(orderInfo, segmentationInfo)
            } else if (!!intelligenceRecommendStr) {
                await this.secondTripHandler(orderInfo, intelligenceRecommendStr)
            }
        },
        async segmentationTripHandler(orderInfo, segmentationInfo) {
            let relationOrderDetail = null
            try {
                util.showLoading()

                this.setData({ intelligentSegmentDisplay: true })

                if (segmentationInfo.groupOrderStatus === 2) {
                    cwx.redirectTo({
                        url: `../../webview/webview?url=${encodeURIComponent(
                            `https://m.ctrip.com/webapp/train/intelligentSegmentation?oid=${orderInfo.OrderId}&needLogin=true`,
                            // `https://pages.ctrip.com/IntelligentSegmentation?oid=${orderInfo.OrderId}`,
                        )}&data=${JSON.stringify({needLogin: true})}`,
                    })
                }

                if (!segmentationInfo.relationOrderNumber) {
                    util.hideLoading()

                    return
                }

                const res = await this.getOrderInfoByOid(segmentationInfo.relationOrderNumber)
                if (res.RetCode == 1) {
                    relationOrderDetail = res.OrderInfo
                }

                let orderInfo1 = null
                let orderInfo2 = null

                if (segmentationInfo.currentRouteSequence === 2) {
                    this.setData({
                        isOriginOrderFromSecondTrip: true,
                    })
                    orderInfo1 = this.setOriginTicketInfo(relationOrderDetail)
                    orderInfo2 = this.setOriginTicketInfo(orderInfo)
                } else if (segmentationInfo.currentRouteSequence === 1) {
                    orderInfo1 = this.setOriginTicketInfo(orderInfo)
                    orderInfo2 = this.setOriginTicketInfo(relationOrderDetail)
                }

                const segmentationInfo1 = this.getSegmentationInfo(orderInfo1)
                const segmentationInfo2 = this.getSegmentationInfo(orderInfo2)
                orderInfo1.OrderStatusBarInfo.StatusName = this.data.isOriginOrderFromSecondTrip ? orderStatusMap[segmentationInfo.ticketInfoList?.[0]?.segmentationOrderStatus] : orderStatusMap[segmentationInfo1?.currentOrderStatus]
                orderInfo2.OrderStatusBarInfo.StatusName = this.data.isOriginOrderFromSecondTrip ? orderStatusMap[segmentationInfo2?.currentOrderStatus] : orderStatusMap[segmentationInfo.ticketInfoList?.[0]?.segmentationOrderStatus]
                orderInfo.OrderStatusName = groupOrderStatusMap[segmentationInfo?.groupOrderStatus]
                const segmentationOrderStatusName = groupOrderStatusMap[segmentationInfo?.groupOrderStatus]


                let intelligentType

                if (segmentationInfo?.segmentationType == 4) {
                    intelligentType = 3
                } else if (segmentationInfo?.segmentationType == 2 && segmentationInfo?.isSameTrain == false) {
                    intelligentType = 4
                } else {
                    intelligentType = segmentationInfo?.segmentationType
                }

                if (segmentationInfo?.groupOrderStatus === 4 || segmentationInfo?.groupOrderStatus === 3) {
                    util.ubtTrace('s_trn_c_trace_10650037941', {
                        exposureType: 'normal',
                        bizKey: 'grabSuccess',
                        channel: 'WX',
                        orderId: segmentationInfo.currentRouteSequence === 1 ? orderInfo1.OrderId : orderInfo2.OrderId,
                        relationOrderId: segmentationInfo.currentRouteSequence === 1 ? orderInfo2.OrderId : orderInfo1.OrderId,
                        scene: segmentationInfo?.groupOrderStatus === 4 ? 2 : 3,
                        type: intelligentType,
                    })
                }

                if (segmentationInfo1?.segmentationType == 2 && segmentationInfo1?.isSameTrain == false && this.data.isOriginOrderFromSecondTrip) {
                    segmentationInfo = segmentationInfo1
                }

                if (segmentationInfo.segmentationType == 2 && segmentationInfo.isSameTrain == false) {
                    const startDateTime = orderInfo1.ticketInfo.ArriveDate + ' ' + orderInfo1.ticketInfo.ArriveTime
                    const endDateTime = orderInfo2.ticketInfo.DepartDate +  ' ' +orderInfo2.ticketInfo.DepartTime

                    // const diff = new Date(endDateTime).getTime() - new Date(startDateTime).getTime();
                    const diff = cDate.createUTC8CDate(endDateTime).getTime() - cDate.createUTC8CDate(startDateTime).getTime()

                    const days = Math.floor(diff / (24 * 3600 * 1000))

                    let left = diff % (24 * 3600 * 1000)
                    const hours = Math.floor(left / (3600 * 1000))
                     left = left % (3600 * 1000)
                    const minutes = Math.floor(left / (60 * 1000))

                    segmentationInfo.costTimeInfo = `换乘${hours !== 0 ? hours + '小时': ''}${minutes}分钟`
                }

                // 分段跨站
                let segmentationCrossInfo = null
                const segmentationCrossInfoStr = orderInfo1?.ExtendList?.find(item => item.Key === 'SegmentationCross')?.Value || orderInfo2?.ExtendList?.find(item => item.Key === 'SegmentationCross')?.Value
                if (!!segmentationCrossInfoStr) {
                  try {
                    segmentationCrossInfo = typeof segmentationCrossInfoStr === 'string' ? JSON.parse(segmentationCrossInfoStr) : segmentationCrossInfoStr
                  } catch (err) {
                    console.log(err)
                  }
                }

                if (!!segmentationCrossInfo) {
                    let timeInfo = null
                    let diff = ''

                    if (segmentationCrossInfo?.crossType === 1) {
                        timeInfo = this.getDateInfo(segmentationCrossInfo?.originalDepartTime)
                        diff = Math.abs(new Date(timeInfo.date.slice(0, 10)) - new Date(orderInfo.ticketInfo?.ArriveDate))
                    } else if (segmentationCrossInfo?.crossType === 2) {
                        timeInfo = this.getDateInfo(segmentationCrossInfo?.originalArriveTime)
                        diff = Math.abs(new Date(timeInfo.date.slice(0, 10)) - new Date(orderInfo.ticketInfo?.DepartDate))
                    }

                    const isDateDiff = diff >= 24 * 60 * 60 * 1000
                    const timeInfoStr = isDateDiff ? `${timeInfo.dateText}${timeInfo.timeText}` : timeInfo.timeText

                    segmentationCrossInfo.crossStationTitle = `请于<span style="color:#0086F6">${timeInfoStr}</span>，在 <span style="color:#0086F6">${segmentationCrossInfo?.crossType === 1
                        ? segmentationCrossInfo?.originalDepartStation
                        : segmentationCrossInfo?.originalArriveStation}</span> ${segmentationCrossInfo?.crossType === 1 ? "上车" : "下车"}`

                    segmentationCrossInfo.crossStationFrom = `${segmentationCrossInfo?.crossType === 1
                        ? segmentationCrossInfo?.originalDepartStation
                        : orderInfo1.ticketInfo.DepartStation}`

                    segmentationCrossInfo.crossStationTo = `${segmentationCrossInfo?.crossType === 2
                        ? segmentationCrossInfo?.originalArriveStation
                        : orderInfo2.ticketInfo.ArriveStation}`
                }

                segmentationInfo.msgInfo = segmentationInfo?.orderMessageInfo?.messageList?.[0] || segmentationInfo2?.orderMessageInfo?.messageList?.[0]

                this.setData({
                    orderInfo1,
                    orderInfo2,
                    segmentationInfo,
                    segmentationOrderStatusName,
                    segmentationCrossInfo,
                    intelligentType
                })
            } catch (err) {
                console.error(err)
            } finally {
                util.hideLoading()
            }
        },
        async secondTripHandler(orderInfo, intelligenceRecommendStr) {
            try {
                let relationOrderDetail = null
                let intelligenceRecommend = null
                util.showLoading()
                intelligenceRecommend = typeof intelligenceRecommendStr === 'string' ? JSON.parse(intelligenceRecommendStr) : intelligenceRecommendStr

                if (orderInfo.RecommendOrderTicketType === 2 && orderInfo?.JLDetailInfo?.JLOrderStatus === 'C') {
                    cwx.redirectTo({
                        url: `../../webview/webview?url=${encodeURIComponent(
                            `https://m.ctrip.com/webapp/train/activity/ctrip-intelligent-recommend/?oid=${orderInfo.OrderId}&isSecondTripDisplay=YES`,
                            // `https://pages.ctrip.com?oid=${orderInfo.OrderId}&isSecondTripDisplay=YES`,
                        )}`,
                    })

                    return
                }

                if (!intelligenceRecommend.relationOrderNumber) {
                    if (orderInfo?.JLDetailInfo?.JLOrderStatus === 'C') {
                        cwx.redirectTo({
                            url: `../../webview/webview?url=${encodeURIComponent(
                                `https://m.ctrip.com/webapp/train/activity/ctrip-intelligent-recommend/?oid=${orderInfo.OrderId}`,
                                // `https://pages.ctrip.com/?oid=${this.store.data.oid}&needLogin=true`,
                            )}&data=${JSON.stringify({needLogin: true})}`,
                        })
                    } else {
                        util.hideLoading()
                    }
                    return
                }

                const res = await this.getOrderInfoByOid(intelligenceRecommend.relationOrderNumber)
                if (res.RetCode == 1) {
                    relationOrderDetail = res.OrderInfo
                }

                if (relationOrderDetail?.JLDetailInfo?.JLOrderStatus === 'C' && relationOrderDetail?.RecommendOrderTicketType === 2) {
                    cwx.redirectTo({
                        url: `../../webview/webview?url=${encodeURIComponent(
                            `https://m.ctrip.com/webapp/train/activity/ctrip-intelligent-recommend/?oid=${intelligenceRecommend.relationOrderNumber}&isSecondTripDisplay=YES`,
                        )}`,
                    })

                    return
                }

                if ((relationOrderDetail?.RecommendOrderTicketType === 2 && relationOrderDetail?.JLDetailInfo?.JLOrderStatus !== 'O') || (orderInfo.RecommendOrderTicketType === 2 && orderInfo?.JLDetailInfo?.JLOrderStatus !== 'O')) {
                    this.setData({ intelligentSegmentDisplay: true })
                    let orderInfo1 = null
                    let orderInfo2 = null

                    if (orderInfo.RecommendOrderTicketType === 2) {
                        this.setData({
                            isOriginOrderFromSecondTrip: true,
                        })
                        orderInfo1 = this.setOriginTicketInfo(relationOrderDetail)
                        orderInfo2 = this.setOriginTicketInfo(orderInfo)

                    } else if (relationOrderDetail.RecommendOrderTicketType === 2) {
                        orderInfo1 = this.setOriginTicketInfo(orderInfo)
                        orderInfo2 = this.setOriginTicketInfo(relationOrderDetail)
                    }

                    this.setData({
                        orderInfo1,
                        orderInfo2,
                    })

                    util.ubtTrace('s_trn_c_trace_10650037941', {
                        exposureType: 'normal',
                        bizKey: 'grabSuccess',
                        channel: 'WX',
                        orderId: orderInfo1.OrderId,
                        scene: 4,
                        relationOrderId: orderInfo2.OrderId,
                        // type,
                    })
                }

            } catch (err) {
                console.error(err)
            } finally {
                util.hideLoading()
            }
        },
        dealWithCheckInTips(checkIn = '') {
            if (!checkIn || checkIn === '--') {
                return ''
            }

            return checkIn.replace(/^(检票口|候车地点)[:|：]?/, '检票口：')
        },
        goTTOrigin_v1(e) {
            const orderType = e.currentTarget.dataset.type
            const ticketInfo = orderType === 1 ? this.data.orderInfo1?.TicketInfos?.[0] : this.data.orderInfo2?.TicketInfos?.[0]

            !!ticketInfo && util.goTimeTable(ticketInfo, this)
        },
        async intelligentSecondTripHandler(orderInfo) {

            const orderInfo1 = this.setOriginTicketInfo(res.OrderInfo)
            const orderInfo2 = this.setRecommendTicketInfo(orderInfo)

            this.setData({
                orderInfo1,
                orderInfo2,
                recommendInfo: orderInfo2,
            })

            // this.setRecommendTicketInfo(orderInfo)
            // this.setJLDetailInfo(orderInfo)
            // this.setRecommendInfo(orderInfo)
            this.setJLDetailInfo(orderInfo)
            this.setRecommendInfo(orderInfo)
        },


        setOriginTicketInfo(orderInfo) {
            orderInfo.ticketInfo = orderInfo.TicketInfos?.[0]

            orderInfo.ticketInfo.arriveDate = new cDate(
                orderInfo.ticketInfo?.ArriveDate,
            ).format('m月d日')
            orderInfo.ticketInfo.arriveTime = new cDate(
                orderInfo.ticketInfo?.ArriveTime,
            ).format('H:i')
            orderInfo.ticketInfo.departDate = new cDate(
                orderInfo.ticketInfo?.DepartDate,
            ).format('m月d日')
            orderInfo.ticketInfo.departTime = new cDate(
                orderInfo.ticketInfo?.DepartTime,
            ).format('H:i')

            orderInfo.ticketInfo.departWeekday =
                weekDay[new Date(orderInfo.ticketInfo.DepartDate).getDay()]
            orderInfo.ticketInfo.arriveWeekday =
                weekDay[new Date(orderInfo.ticketInfo.ArriveDate).getDay()]
            orderInfo.ticketInfo.PassengerInfos?.map((item) => {

                const price = item.TicketPrice || item.RealTicketInfo?.DealTicketPrice || orderInfo.ticketInfo.TicketPrice
                item.TicketPrice = Number(price).toFixed(1)

                return item
            })

            const checkIn = orderInfo.ticketInfo.TicketEntrance
            if (!checkIn || checkIn === '--') {
                orderInfo.ticketInfo.tEntrance = ''
            } else {
                orderInfo.ticketInfo.tEntrance = checkIn.replace(/^(检票口|候车地点)[:|：]?/, '检票口：')
            }

            orderInfo.ticketInfo.passengerInfoListForDisplay =
                orderInfo.ticketInfo.PassengerInfos?.slice(0, 2)

            return orderInfo
        },
        setRecommendTicketInfo(orderInfo) {
            const getFormatDate = (date) => {
                return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)} ${date.slice(8, 10)}:${date.slice(10, 12)}:${date.slice(12, 14)}`;
            }

            const recommendTicketInfo = JSON.parse(
                JSON.stringify(orderInfo.JLDetailInfo?.RecommendTicketInfo || {}),
            )

            // 时间
            recommendTicketInfo.ticketInfo = recommendTicketInfo.TicketInfoList?.[0] || {
                PassengerInfoList: [],
            }

            recommendTicketInfo.ticketInfo.arriveDate = new cDate(
                getFormatDate(recommendTicketInfo.ticketInfo?.ArriveDateTime),
            ).format('m月d日')
            recommendTicketInfo.ticketInfo.ArriveTime = new cDate(
                getFormatDate(recommendTicketInfo.ticketInfo?.ArriveDateTime),
            ).format('H:i')
            recommendTicketInfo.ticketInfo.departDate = new cDate(
                getFormatDate(recommendTicketInfo.ticketInfo?.DepartDateTime),
            ).format('m月d日')
            recommendTicketInfo.ticketInfo.DepartTime = new cDate(
                getFormatDate(recommendTicketInfo.ticketInfo?.DepartDateTime),
            ).format('H:i')

            recommendTicketInfo.ticketInfo.departWeekday =
                weekDay[new Date(getFormatDate(recommendTicketInfo.ticketInfo.DepartDateTime)).getDay()]

            recommendTicketInfo.ticketInfo.arriveWeekday =
                weekDay[new Date(getFormatDate(recommendTicketInfo.ticketInfo.ArriveDateTime)).getDay()]

            recommendTicketInfo.ticketInfo.PassengerInfoList?.map((item) => {
                item.TicketPrice = Number(item.TicketPrice).toFixed(1)

                return item
            })

            recommendTicketInfo.ticketInfo.passengerInfoListForDisplay =
                recommendTicketInfo.ticketInfo.PassengerInfoList?.slice(0, 2)

            recommendTicketInfo.ContentLeft = recommendTicketInfo.Content?.split('原方案')[0]
            recommendTicketInfo.ContentRight = recommendTicketInfo.Content?.split('原方案')[1]

            return recommendTicketInfo
        },

        setJLDetailInfo(orderInfo) {
            const jLDetailInfo = JSON.parse(JSON.stringify(orderInfo.JLDetailInfo || {}))

            // 原方案
            const speedLevels = ['低速', '快速', '高速', '极速', '光速', 'VIP']
            jLDetailInfo.speedTitle = `原方案 ${speedLevels[jLDetailInfo.LightningLevel - 1]}抢票中`
            jLDetailInfo.JLAllTrainNumbers = jLDetailInfo.JLAllTrainNumbers?.split(',')?.join('，')
            jLDetailInfo.JLAllSeatNames = jLDetailInfo.JLAllSeatNames?.split(',')?.join('，')

            // 日期
            let alternativeDates = []
            if (jLDetailInfo.JLAlternativeDate) {
                alternativeDates = jLDetailInfo.JLAlternativeDate?.split(',')
            } else {
                alternativeDates = orderInfo.ticketInfo.DepartDate?.split(',')
            }

            alternativeDates = alternativeDates?.map((item) => {
                const time = item?.split('-').join('')

                return new cDate(time).format('m月d日')
            })

            alternativeDates = alternativeDates?.join(',')
            jLDetailInfo.alternativeDates = alternativeDates

            // 其他权益
            let contentList = []
            const appendProductList = orderInfo.AppendProductList

            if (!!appendProductList && appendProductList.length > 0) {
                contentList = appendProductList?.map((item) => {
                    return `${item.AppendProductTitle} ${item.AppendProductDesc || ''}`
                })
            }

            // 乘客
            const passengerInfoList =
                orderInfo.TicketInfos?.[0]?.PassengerInfos ||
                this.data.recommendTicketInfo.TicketInfoList?.[0]?.PassengerInfoList

            const psgNameList = passengerInfoList?.map((item) => {
                return item.PassengerName
            })

            jLDetailInfo.contentList = contentList?.join('，')

            jLDetailInfo.psgNameList = psgNameList?.join('，')
            this.setData({ jLDetailInfo })

            // 订单总价
            let passengerNameStr = '' // 乘客姓名相关
            let sumPriceStr = 0 // 订单总价

            for (let indexI = 0; indexI < passengerInfoList?.length; indexI++) {
                const i = passengerInfoList[indexI]
                if (indexI < 2) {
                    if (passengerNameStr) {
                        passengerNameStr += '、' + i.PassengerName
                    } else {
                        passengerNameStr += i.PassengerName
                    }
                }
                if (indexI == 2) {
                    passengerNameStr += `…(${passengerInfoList.length}人)`
                }
                sumPriceStr += +i.TicketPrice

                jLDetailInfo.passengerNameStr = passengerNameStr
                jLDetailInfo.sumPriceStr = sumPriceStr
            }
        },
        setRecommendInfo(orderInfo) {
            const extendInfo = orderInfo.ExtendList?.find(
                (item) => item.Key === 'IntelligenceRecommendV3',
            )

            const recommendInfo = typeof extendInfo?.Value === 'object' ? extendInfo?.Value : JSON.parse(extendInfo?.Value || '{}')
            // recommendType 1=临近，2=跨站，3=坐席，4=车次
            this.setData({ recommendInfo })

            let segmentationInfo = null
            const segmentationInfoStr = orderInfo?.ExtendList?.find(item => item.Key === 'GrabTicketSegmentation')?.Value
            if (!!segmentationInfoStr) {
                try {
                    segmentationInfo = typeof segmentationInfoStr === 'string' ? JSON.parse(segmentationInfoStr) : segmentationInfoStr
                } catch (err) {
                    console.error(err)
                }
            }
        },
        async getOrderInfoByOid(oid) {
            const deferred = util.getDeferred()
            const params = {
                OrderId: oid,
                ver: 1,
                Channel: 'WX',
            }

            OrderDetailModel(params, data => {
                util.hideLoading()
                if (Object.keys(data).length === 0) {
                    util.showModal({
                        m: '系统异常，请稍后重试',
                    })
                    deferred.reject()
                } else {
                    deferred.resolve(data)
                }
            }, err => {
                util.hideLoading()
                deferred.reject(err)
                util.showToast(err)
            }, () => { })

            return deferred.promise
        },
        showPassengerDetail1() {
            this.data.orderInfo1.ticketInfo.passengerInfoListForDisplay =
                this.data.orderInfo1.ticketInfo.PassengerInfos

            this.data.orderInfo1.originPassengerDetailVisible = true
            this.setData({ orderInfo1: this.data.orderInfo1 })
        },
        showPassengerDetail2() {
            this.data.orderInfo2.ticketInfo.passengerInfoListForDisplay =
                this.data.orderInfo2.ticketInfo.PassengerInfos

            this.data.orderInfo2.originPassengerDetailVisible = true
            this.setData({ orderInfo2: this.data.orderInfo2 })
        },
        goOrderDetail(e) {
            const ordertype = e.currentTarget.dataset.ordertype

            if (this.data.orderInfo2?.RecommendOrderTicketType === 2) {
                util.ubtTrace('c_trn_c_10650037941', {
                    bizKey: 'GrabSuccessClick',
                    channel: 'WX',
                    clickType: 1,
                })
            } else if (this.data.segmentationInfo?.groupOrderStatus === 3) {
                util.ubtTrace('c_trn_c_10650037941', {
                    bizKey: 'grabPartialSuccessClick',
                    orderId: this.data.segmentationInfo?.currentRouteSequence === 1 ? this.data.orderInfo1?.OrderId : this.data.orderInfo2?.OrderId,
                    relationOrderId: this.data.segmentationInfo?.currentRouteSequence === 1 ? this.data.orderInfo2?.OrderId : this.data.orderInfo1?.OrderId,
                    clickType: 2,
                    type: this.data.intelligentType,
                })
            }

            if (this.data.segmentationInfo?.groupOrderStatus === 4) {
                util.ubtTrace('c_trn_c_10650037941', {
                    bizKey: 'splitGrabSuccessClick',
                    orderId: this.data.segmentationInfo?.currentRouteSequence === 1 ? this.data.orderInfo1?.OrderId : this.data.orderInfo2?.OrderId,
                    relationOrderId: this.data.segmentationInfo?.currentRouteSequence === 1 ? this.data.orderInfo2?.OrderId : this.data.orderInfo1?.OrderId,
                    type: this.data.intelligentType,
                    clickType: 5,
                })
            }

            cwx.navigateTo({
                url: `/pages/train/orderdetail/orderdetail?oid=${ordertype === 1 ? this.data.orderInfo1?.OrderId : this.data.orderInfo2?.OrderId}&hideSegment=YES`,
            })
        },
        goRefundUrlByUrl(e) {
            if (this.data.segmentationInfo?.groupOrderStatus === 4) {
                util.ubtTrace('c_trn_c_10650037941', {
                    bizKey: 'splitGrabSuccessClick',
                    orderId: this.data.segmentationInfo?.currentRouteSequence === 1 ? this.data.orderInfo1?.OrderId : this.data.orderInfo2?.OrderId,
                    relationOrderId: this.data.segmentationInfo?.currentRouteSequence === 1 ? this.data.orderInfo2?.OrderId : this.data.orderInfo1?.OrderId,
                    type: this.data.intelligentType,
                    clickType: 4,
                })
            }

            const ordertype = e.currentTarget.dataset.ordertype
            const orderInfo = ordertype === 1 ? this.data.orderInfo1 : this.data.orderInfo2
            let url = orderInfo.RefundInfoUrl

            this.navigateTo({
                url: `/pages/train/webview/webview`,
                data: {
                    url: url,
                    needLogin: true,
                },
            })
        },
        onClickGoToGrabPage(e) {
            const ordertype = e.currentTarget.dataset.ordertype
            const orderInfo = ordertype === 1 ? this.data.orderInfo1 : this.data.orderInfo2

            const outParams = {
                dStation: orderInfo.ticketInfo.DepartStation,
                aStation: orderInfo.ticketInfo.ArriveStation,
                dDate: cDate.parse(orderInfo.ticketInfo.DepartDate).format('Y-m-d'),
                trainName: orderInfo.ticketInfo.TrainNumber,
                seat: orderInfo.ticketInfo.SeatName,
                isgd: '',
                stu: '',
            }

            util.ubtTrace('c_trn_c_10650037941', {
                bizKey: 'grabPartialSuccessClick',
                orderId: this.data.segmentationInfo.currentRouteSequence === 1 ? this.data.orderInfo1.OrderId : this.data.orderInfo2.OrderId,
                relationOrderId: this.data.segmentationInfo.currentRouteSequence === 1 ? this.data.orderInfo2.OrderId : this.data.orderInfo1.OrderId,
                clickType: 1,
                type: this.data.intelligentType,
            })

            cwx.navigateTo({
                url: `/pages/train/booking/grab/grab?${util.outparamsToString(outParams)}`,

            })
        },
        getSegmentationInfo(orderInfo) {
            let segmentationInfo = null
            const segmentationInfoStr = orderInfo?.ExtendList?.find(item => item.Key === 'GrabTicketSegmentation')?.Value
            if (!!segmentationInfoStr) {
                try {
                    segmentationInfo = typeof segmentationInfoStr === 'string' ? JSON.parse(segmentationInfoStr) : segmentationInfoStr
                } catch (err) {
                    console.error(err)
                }
            }

            return segmentationInfo
        },
        rescheduleTicketForIntelligence(e) {
            if (this.data.orderInfo1?.RecommendOrderTicketType === 2) {
                util.ubtTrace('c_trn_c_10650037941', {
                    bizKey: 'GrabSuccessClick',
                    channel: 'WX',
                    clickType: 2,
                })
            }

            this.rescheduleTicket(e)
        },
        refundTicketForIntelligence(e) {
            if (this.data.orderInfo1?.RecommendOrderTicketType === 2) {
                util.ubtTrace('c_trn_c_10650037941', {
                    bizKey: 'GrabSuccessClick',
                    channel: 'WX',
                    clickType: 3,
                })
            }

            this.refundTicket(e)
        },
        getDateInfo(dateStr) {
            if (!dateStr) {
                return "";
              }

            const insertStr = function (soure, start, txt) {
                return soure?.slice(0, start) + txt + soure?.slice(start)
              }

              let date = dateStr
              date = insertStr(date, 4, '-')
              date = insertStr(date, 7, '-')
              date = insertStr(date, 10, ' ')
              date = insertStr(date, 13, ':')
              date = insertStr(date, 16, ':')

            const dateText = new cDate(date).format("m月d日");
            const timeText = new cDate(date).format("H:i");
            const week = weekDay[new Date(date).getDay()];
            return {
              dateText,
              timeText,
              week,
              date
            };
          }
    },

}

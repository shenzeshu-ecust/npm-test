
import util from '../../../common/util'
import {
    GetOrderAllowanceEntranceInfoModel,
} from '../../../common/model'

export default {
    data: {},
    methods: {
        toCashbackPage() {
            let url = `/pages/train/2020cashback/index?shareKey=${encodeURIComponent(this.data.cashbackInfo.ShareKey)}`
            console.log('------------ navigateUrl', url)
            this.navigateTo({ url })
        },
        getCashbackInfo() {
            const deferred = util.getDeferred()
            const params = {
                Channel: 'wx',
                OrderNumber: this.store.data.oid,
            }
            GetOrderAllowanceEntranceInfoModel(params, res => {
                if (res.RetCode == 1) {
                    // res = {
                    //     ActivityStatusCode:2,
                    //     ButtonName:"去领取",
                    //     Content:"买票成功领补贴",
                    //     IsShow:true,
                    //     ResponseStatus:{
                    //         ack:"Success",
                    //         errors:[

                    //         ],
                    //         extension:[

                    //         ]
                    //     },
                    //     RetCode:1,
                    //     ShareKey:"kxfzS3y8neu6CAbrMbg2kw==",
                    //     Title:"<span style='margin-top: 0;margin-bottom:0;font-size: 17px;color: #333333;'>下张车票<span style='color:#FF6913;'>最高返100元</span></span>",
                    //     ActivityEndDateTime: '20200514200000'
                    // }

                    // ActivityStatusCode 活动状态，1=待领取，2=继续领，3=已结束(达成目标)，4=已结束(未达成目标)
                    const { IsShow, Title, Content, ButtonName, ActivityEndDateTime, ActivityStatusCode, ShareKey } = res
                    if (!IsShow) {
                        deferred.resolve()

                        return
                    }
                    this.setData({
                        cashbackInfo: {
                            Title,
                            Content,
                            ButtonName,
                            ActivityEndDateTime,
                            ActivityStatusCode,
                            ShareKey,
                        },
                    })

                    if (ActivityStatusCode == 2) {
                        this.setCashbackInterval(ActivityEndDateTime)
                    }
                }
                deferred.resolve()
            })

            return deferred.promise
        },
        setCashbackInterval(ActivityEndDateTime) {
            const year = ActivityEndDateTime.substring(0, 4)
            const month = ActivityEndDateTime.substring(4, 6) - 1
            const day = ActivityEndDateTime.substring(6, 8)
            const hour = ActivityEndDateTime.substring(8, 10)
            const min = ActivityEndDateTime.substring(10, 12)
            const second = ActivityEndDateTime.substring(12, 14)
            let time =
                (new Date(year, month, day, hour, min, second, 0) -
                    Date.now()) /
                1000
            setTimeout(() => {
                this.doCashbackInterval(time)
            }, 0)
            let inPageInterval = util.safeInPageTimerFn(setInterval, this.route)
            this.cashbackId = inPageInterval(() => {
                time -= 1
                this.doCashbackInterval(time)
            }, 1000)
        },
        doCashbackInterval(time) {
            if (time <= 0) {
                this.setData({
                    'cashbackInfo.countdown': {
                        hour: '00',
                        min: '00',
                        second: '00',
                        txt: '已结束',
                    },
                })
                this.getCashbackInfo()
                clearInterval(this.cashbackId)

                return
            }
            let hour = String(Math.floor(time / 3600))
            let min = String(Math.floor((time - hour * 3600) / 60))
            let second = String(Math.floor(time - hour * 3600 - min * 60))
            hour = util.pad(hour)
            min = util.pad(min)
            second = util.pad(second)
            this.setData({
                'cashbackInfo.countdown': {
                    hour,
                    min,
                    second,
                    txt: '后结束',
                },
            })
        },
    },
}

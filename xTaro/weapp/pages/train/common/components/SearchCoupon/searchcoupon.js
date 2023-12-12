import { cwx } from "../../../../../cwx/cwx"
import {
    ActivitySendCouponModel,
    GetActivityCouponInfoModel,
} from '../../model'
import util from '../../util'

export default {
    getBusinessCouponList (activityCode) {
        let params = {
            ActivityCode: activityCode,
            Channel: 'wx',
            MobilePhone: '',
        }

        return util.promisifyModel(GetActivityCouponInfoModel)(params).then(data => {
            if (data && data.CouponItemList) {
                const { CouponItemList } = data
                let haveStock = data.ExtendList.find(item => item.Key == 'haveStock')?.Value ?? '' // 字符串
                let hasReceived = CouponItemList.some(item => item.IsSend)
                cwx.getCurrentPage()?.setData({
                    searchCouponInfo: {
                        soldOut: haveStock ? !JSON.parse(haveStock) : false,
                        hasReceived,
                        couponDetail: CouponItemList[0],
                        activityCode,
                    },
                })
            }
        })
    },
    recieveBusinessCoupon (e, cb) {
        // util.showLoading()

        const SubType = e?.target?.dataset['subtype']
        const ActivityCode = e?.target?.dataset['activitycode']
        const IsFromAwakenH5 = e?.target?.dataset['isfromawakenh5']

        if (IsFromAwakenH5){
            util.ubtTrace('c_trn_c_10320640939', {
                exposureType: 'normal',
                bizKey: 'couponBannerClick',
            })
        }
        let params = {
            SubType,
            ActivityCode,
            Channel: 'wx',
            MobilePhone: '',
        }
        if (!cwx.user.isLogin()) {
            this.loginFn(() => {
                cwx.getCurrentPage()?.setData({
                    isLogin: true,
                })
                this.getBusinessCouponList(ActivityCode)
                    .then(() => {
                        this.doRecieveBusinessCoupon({
                            SubType: cwx.getCurrentPage()?.data?.searchCouponInfo?.couponDetail?.SubType,
                            ActivityCode,
                            Channel: 'wx',
                            MobilePhone: '',
                        }, ActivityCode, cb)
                    })
            })
        } else {
            cwx.user.checkLoginStatusFromServer((data) => {
                if (!data) {
                    this.loginFn(() => {
                        cwx.getCurrentPage()?.setData({
                            isLogin: true,
                        })
                        this.doRecieveBusinessCoupon(params, ActivityCode, cb)
                    })
                } else {
                    this.getBusinessCouponList(ActivityCode)
                        .then(() => {
                            this.doRecieveBusinessCoupon({
                                SubType: cwx.getCurrentPage()?.data?.searchCouponInfo?.couponDetail?.SubType,
                                ActivityCode,
                                Channel: 'wx',
                                MobilePhone: '',
                            }, ActivityCode, cb)
                        })
                }
            })
        }
    },
    doRecieveBusinessCoupon(params, activityCode, cb = function() {}) {
        ActivitySendCouponModel(params, data => {
            if (data.RetCode == 1) {
                util.showToast('优惠券领取成功', 'none')
                this.getBusinessCouponList(activityCode)
                cb()
            } else if (data.RetCode == 4) {
                util.showToast('您已领过该券，不可重复领取哦', 'none')
            } else {
                util.showToast(data.Message || '领取失败请稍后重试', 'none')
            }
        }, () => {
            util.showToast('领取失败请稍后重试', 'none')
        })
    },
    loginFn(success) {
        cwx.user.login({
            param: {},
            callback: (res) => {
                if (res.ReturnCode === '0') {
                    return success()
                }
                return util.showToast('请先授权才能领取领取优惠券', 'none')
            }
        })
    },
}

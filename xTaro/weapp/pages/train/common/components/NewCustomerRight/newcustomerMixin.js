import {
    NewCustomersRightsDetailModel,
    IsCanReceiveNewCustomerRightsModel,
    ReceiveNewCustomerRightsModel,
    TrainGetNewGuestInfoModel,
    UserNewCustomersRightsInfoModel,
    getActivityStautsInfoV2
} from '../../model'
import util from '../../util'


const needUseNewFlagTypeList = [7, 15, 20, 21, 18]

// 用户领取前获取权益信息
function getNewCustomerRights(self, FromType) {
    const params = {
        Channel: 'ctripwx',
        FromType
    }


    if (needUseNewFlagTypeList.includes(FromType)) {
        params.newFlag = true
    }

    return new Promise((resolve, reject) => {
        NewCustomersRightsDetailModel(params, res => {
            if (res.RetCode == 1 && res.RightList && res.OriginPrice) {
                const { RightList, OriginPrice, Title, AbValue, JumpUrl, ButtonName, NewFlagAbValue } = res
                const RightListType1 = RightList === null ? [] : RightList.filter( e => e.Type === 1)
                const RightListType2 = RightList === null ? [] : RightList.filter( e => e.Type === 2)
                const rightListType1Amount = RightListType1.reduce((sum, v) => sum += v.Price, 0)
                if (self && self.setData) {
                    if (AbValue == 'a') {
                        self.setData({
                            newCustomerRightInfo: {
                                RightList,
                                OriginPrice,
                                Title,
                                AbValue,
                                JumpUrl,
                                ButtonName,
                                NewFlagAbValue,
                                priceAmount: OriginPrice,
                                RightInfoType2: {
                                    list: RightListType2
                                },
                                RightInfoType1: {
                                    list: RightListType1,
                                    price: rightListType1Amount
                                }
                            },
                        })
                    } else {
                        self.setData({
                            newCustomerRightInfo: {
                                RightList: RightList.map(v => ({ ...v, desc1: v.Desc.split('|')[0], desc2: v.Desc.split('|')[1] })),
                                OriginPrice,
                                Title,
                                AbValue,
                                JumpUrl,
                                ButtonName,
                                NewFlagAbValue,
                                priceAmount: OriginPrice,
                                RightInfoType2: {
                                    list: RightListType2
                                },
                                RightInfoType1: {
                                    list: RightListType1,
                                    price: rightListType1Amount
                                }
                            },
                        })
                    }
                }
                return resolve(res)
            }
            return reject()
        })
    })
}

/**
 * 用户领取后获取权益信息
 * 230713版本 FromType 首页 20 列表浮层 21
 */
function getUserNewCustomerRight(self, FromType) {
    return new Promise((resolve, reject) => {
        let payload = {FromType, Channel: "WX"}

        if (needUseNewFlagTypeList.includes(FromType)) {
            payload = {FromType, newFlag: true, Channel: "WX"}
        }

        UserNewCustomersRightsInfoModel(payload, res => {
            if (res.RetCode != 1) return reject()
            const {
                TopTips,
                RightList,
                Tiltle,
                TitleUrl,
                Content,
                IsHaveRights,
                OriginPrice,
                ExpireTimeDesc,
                RightType,
                JumpUrl
            } = res

            const RightListType1 = RightList === null ? [] : RightList.filter( e => e.Type === 1)
            const RightListType2 = RightList === null ? [] : RightList.filter( e => e.Type === 2)

            self.setData({
                TopTips,
                newCustomerRightInfo: {
                    RightList,
                    Tiltle,
                    Content,
                    IsHaveRights,
                    OriginPrice,
                    RightType,
                    JumpUrl,
                    hasReceived: true,
                    RightListType1,
                    RightListType2
                },
                // 新字段来兼容固定场景+列表页浮层
                newGuestGiftInfo: {
                    RightList,
                    Tiltle,
                    TitleUrl,
                    Content,
                    IsHaveRights,
                    OriginPrice,
                    ExpireTimeDesc,
                    RightType,
                    JumpUrl,
                    hasReceived: true,
                    RightListType1,
                    RightListType2
                }
            })
            resolve(res.TopTips)
        })
    })
}

// 判断用户是否领取过礼包
function checkCanReceiveNewCustomerRight() {
    const defferd = util.getDeferred()
    IsCanReceiveNewCustomerRightsModel({}, res => {
        if (res.RetCode == 1 && res.IsCanReceive) {
            defferd.resolve()
        } else {
            defferd.reject()
        }
    })

    return defferd.promise
}

// 列表页新客入口卡片
async function getListActivityStautsInfo (payload) {
    try {
        const res = await util.promisifyModel(getActivityStautsInfoV2)(payload)        

        if (res.retCode !== 1) throw res
        if (!res.activityInfo || res.activityInfo.activityType !== 3) throw res

        return res.activityInfo
    } catch (error) {
        console.log('新客信息失败嘞', error)
        return
    }
}

function receiveNewCustomerRight(FromType = 1, RightType, data) {
    /**
     * 来源：1=首页弹窗，2=X页，3=小站地推，4=汽车票拉新 5=公众号助力
     *      6=滴滴公交合作 7=小程序抢票助力页面 8=支付宝火车首页
     *      9=pc首页导流小程序首页，10=pc列表页导流小程序列表页
     *      11=pc填写页导流到列表页 12=独立版首页弹窗 14=小程序助力-专享礼券
     *
     */

    /**
     * RightType 0=120礼包 1=返现券礼包
     */
    const params = {
        ChannelName: 'ctripwx',
        FromType,
        RightType,
        ...data
    }

    // 0 新客礼包时 用新的信息
    if (needUseNewFlagTypeList.includes(FromType)) {
        params.newFlag = true
    }

    if (!RightType) {
        params['newFlag'] = true
    }
    return util.promisifyModel(ReceiveNewCustomerRightsModel)(params)

}

// 判断用户是否是新客
function trainGetNewGuestInfo() {
    return util.promisifyModel(TrainGetNewGuestInfoModel)({})
        .then(({ IsNewGuest, RetCode }) => {
            if (RetCode === 1 && IsNewGuest) {
                return Promise.resolve()
            }
            return Promise.reject()
        })
}
// 仅获取领取后新客权益信息
function getUserNewCustomerRightOnly(self, FromType, dataKey) {
    return new Promise((resolve, reject) => {
        let payload = {FromType, Channel: "WX"}
        if (needUseNewFlagTypeList.includes(FromType)) {
            payload = {FromType, newFlag: true, Channel: "WX"}
        }
        UserNewCustomersRightsInfoModel(payload, res => {
            if (res.RetCode != 1) return reject()
            const { TopTips,RightList,Tiltle,TitleUrl,Content,IsHaveRights,OriginPrice,ExpireTimeDesc,RightType,JumpUrl } = res
            const data = {}
            data[dataKey] = {
                RightList,
                Tiltle,
                Content,
                IsHaveRights,
                OriginPrice,
                RightType,
                JumpUrl,
                hasReceived: true
            }
            self.setData(data)
            resolve(res.TopTips)
        })
    })
}

export const newcustomerMixin = {
    getNewCustomerRights,
    checkCanReceiveNewCustomerRight,
    receiveNewCustomerRight,
    trainGetNewGuestInfo,
    getUserNewCustomerRight,
    getUserNewCustomerRightOnly,
    getListActivityStautsInfo
}

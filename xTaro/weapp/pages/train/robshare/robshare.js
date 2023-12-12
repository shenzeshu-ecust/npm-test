import { cwx, _ } from '../../../cwx/cwx'
import TPage from '../common/TPage'
import {
    CheckIsOpenSuperMemberModel,
    GetAcceleratePackageListInfoModel,
    GetShareImgModel,
    AcquireActivityCouponModel,
    CouponListModel,
    GetActivityCouponInfoModel,
    ActivitySendCouponModel,
    TrainGetGrabNewAccelerateInfoModel,
    TrainGetGrabNewAccelerateFriendListModel,
    GetLuckyStarListInfoModel,
    GetFriendsHelpTaskListModel,
    ProductSaleRecommendModal,
    RecallPackageDetailModel,
    TrainStationModel,
    getFollowPublicAccountInfoModel,
    LBSModel,
    getConfigByKeysModel,
    FriendHelp,
    FriendHelpEntrance,
    bindUidAndUnionidModel,
    getUserIdByUnionidModel,
    GetUserReceiveDetailOfNewUserCoupon,
    GetTrainSuperPowerUnlockInfo,
    getBlindBoxCity,
    GetGrabTicketAlertInfo,
    GetUserTag
} from '../common/model'
import cDate from '../common/cDate'
import util from '../common/util'
import {
    CalculateAcceleratePackageModel,
    ShareGrabModel,
    RobTicketShareInfoModel,
    ConfigInfoPromise,
    saveUserFormID,
    GetShareImgNew,
    ShareGrabPromise,
    ctripNewGuestStepPromise,
    getConfigInfoJSON,
    getUserBindedPhoneNumber,
    setConfigSwitchAsyncPromise,
    GetShareImgPromise,
    receiveLossGift,
    getLossGiftDetail,
    getConfigByKeysPromise,
    Sync12306OrderInfoPromise,
} from '../common/common'
import { TrainActStore, TrainBookStore } from '../common/store'
import { buMapMixin } from '../common/components/buMap/buMap'
import { newcustomerMixin } from '../common/components/NewCustomerRight/newcustomerMixin'
import { subscribeMixin } from '../common/components/Subscribe/Subscribe'
import { shared } from '../common/trainConfig'
import studentCardMixin from '../common/components/StudentCard/studentcard'
import robCouponPop from '../common/components/robCouponPop/robCouponPop'
const robErrorCode = {
    test: -1,
    acceError: 1, // 助力时 error
    couponError: 2, // 领券时 error
    openIdEmpty: 3, // openid 为空
    openIdErr: 4, // openid promise error
    pkgListError: 5, // 获取助力包列表 error
    shareError: 6, // 生成助力订单 error
    infoError: 7, // 获取助力信息 error
    balloontxt: 8,
    checkVipError: 9, // 获取是否是超级会员 error
}
const ActivityCode = {
    double: '9103c8c82514f39d8360c7430c4ee557',
    cashBack: '6555CA309B08FE79C5FAA7F97C9DC891',
}

const tempVideoArr = [
    {id:'DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA_2.mp4'},
    {id:'F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA-%E4%BC%98%E6%83%A0%E8%BF%87%E6%9C%9F%E6%8F%90%E9%86%92.mp4'},
    {id:'VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA-%E8%8E%B7%E5%BE%97%E5%A5%96%E5%8A%B1%E9%80%9A%E7%9F%A5.mp4'},
    {id:'_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA-%E7%81%AB%E8%BD%A6%E7%A5%A8%E8%B4%AD%E7%A5%A8%E6%8F%90%E9%86%92.mp4'},
    {id:'BsQ-j76DZe4wkyVw-3qnZ-U2qwGCH9ugw-xyuBIwbXs', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA-%E4%BC%98%E6%83%A0%E8%BF%87%E6%9C%9F%E6%8F%90%E9%86%92.mp4'},
]

const page = {
    checkPerformance: true,
    pageId: shared.pageIds.robshare.pageId,
    isPIPGPage: true,
    data: {
        assistTaskList: [],
        hideNewUserSwiper: false,
        didShow: false,
        robSharePic: '',
        hideShareFlag: 0,
        hideShareInRobshare: 0,
        showShareImage: false,
        calendarDescTrigger: false,
        taskCountDownText: '',
        assistTaskInterval: null,
        newFeatureFlag: false,
        acceState: 0, //0：可以，1：openid不可助力，2：OrderNumber不可助力
        isAccelerating: false,
        initAcceState: true,    //  进入页面初始是否可助力
        totalBag: 0,
        friendList: [],
        ArriveStation: '',
        TrainNum: '',
        SpeedLevelName: '',
        LightningLevel: 0,
        nextLevel: '',
        isSuperVip: false, // 是否是超级会员
        // 助力包排列顺序如下
        //  A | B | C
        //  F | E | D
        accePackages: null,
        // 初始化当前选中助力包索引
        curPkgIdx: '',
        lottery: {
            isRunning: false,
            hasResult: false, // 抽中助力包标识
        },
        showMask: '',
        // showMask: '',
        showCoupon: false,
        canRichText: util.canIUse('rich-text'),
        canShare: util.canIUse('button.open-type.share'),
        getCouponAfterLogin: false,
        sharePic: '',
        isCtripApp: shared.isCtripApp,
        isSubOrder: false,
        couponCount: 0,
        couponProfitDesc: '',
        showRobshareAd: false,
        isGetDouble: false,
        GrabTicketStatus: '',
        UnableSpeedReason: '', // 不能助力的原因
        isForceGroup: false,
        themeConfig: { open: false },
        bannerImg: '',
        bannerUrl: '',
        isShowAd: false,
        topImg: 'http://images3.c-ctrip.com/train/wechat/jiasu/top-bg-blue.png',
        topImgHeight: 360,
        canAddMiniapp: util.canAddMiniapp(),
        hasCollected: TrainActStore.getAttr('HASCOLLECTED'), // 首页领取过收藏助力券后认定为收藏过小程序
        OrderUserIsSuperMember: false, // 分享用户是否是超级会员
        isNationalActivityOpen: false,
        isCtripNew: false,
        isLogin: false,
        showLoading: true,
        fromApp: false, // 是否是从app分享卡片或者app点击打开
        launchAPPUrl: '',
        launchAppAbTest: '',
        abtest: {},
        dateCanBuy: new cDate().addDay(29).format('n月j日'),
        dateCanRob: new cDate().addDay(92).format('n月j日'),
        month: new cDate().format('n月'),
        day: new cDate().format('j'),
        ticketActivityInfo: {},
        nowStamp: '',
        curTimeIndex: '',
        ticketTimeDiff: '',
        timeContent: '',
        stopFlag: false,
        openedTime: '',
        ticketHandle: true,
        piggyHandle: true,
        duration: 10,
        overDay: false,
        piggyCount: 0,
        bottomBannerHandle: '',
        bottomBannerImg: '',
        bottomBannerUrl: '',
        calanderHandle: true,
        userInfo: '',
        mobileToken: '',
        userBindedPhoneNumber: '',
        activityConfig: null,
        couponItemList: [],
        couponListWill: [],
        couponList: [],
        couponListShow: [],
        robDescList: [],
        showGrabfestival: false,
        ruleUrl: '',
        newCustomerRightInfo: null,
        hasSubscribedTicket: true, // 默认已订阅 防止出现闪烁
        hasSubscribedRouteNotify: true, // 默认已订阅 防止出现闪烁
        isShowSubsribeTemp: true,
        IsLuckyStar: false,
        IsReceiveGiftPack: false,   //  是否已领取召回礼包
        LuckyStarType: 0,    //  0 福星1号 1 福星2号
        isRuleCardShow: false,  //  任意行活动规则
        anyGoInfo: {},  //  任意行信息
        arrivedCitys: [],
        arrivedStations: [],
        CouponDesc: "", //  助力成功送券
        GrabAccelNumber: 0,
        isShowFollowAccount: false,
        assistAbVersion: '',
        taskRwardInfo: null,
        externalTaskInfo: null,
        taskInfo: null,
        assistTaskStatus: 0,
        preSaleData: {}, // 预售期啥的
        userCouponFromType: 7,
        newUserFlag: 0,
        hasShareGuideShow: false,
        reshareInfo: null,
        superPowerInfo:{},
        speedTaskAbVersion: 'A',
        showVideo: false,
        canReceiveNewUserRights: false,
        needPopClose: false,
        blindBoxCityList: [],
        toolbarAfterAssist: {}, // 助力后出现的工具栏的配置数据
        toolbarTagAfterAssist:{}, // 助力后出现的工具栏的tag数据
        newCustomerRightInfoAfterAssist: {}, // 保存新客礼包领后数据
        lostUserPopDetail: {}, // 流失用户礼包
        isAssistLimit: false, // 助力达到上限，需要展示达到上限的文案
        subscribeGuideFlag: false, // 订阅引导
        subVideoSource:'',
        showOneTagToOpen: false
    },
    async onLoad(options) {
        util.ubtFuxiTrace('GCWAssistMainPage_CalendarEntrance_exposure',{ PageId: this.pageId})
        this.getTrainWxShareConfig()
        Promise.prototype.finally || (Promise.prototype.finally = function (callback) {
            return this.then(
              value => Promise.resolve(callback()).then(() => value),
              reason => Promise.resolve(callback()).then(() => { throw reason; })
            );
          })

        console.log(options, 'robshare options')
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true,
            })
        }
        this.orderNumber = util.convertBlank(options.oid || '')
        this.avatarUrl = decodeURIComponent(options.avatar || '')
        this.subOrderId = util.convertBlank(options.subOrderId || options.suborderid || '')
        this.acceImm = util.convertBlank(options.acce || '')
            ? true
            : false
        this.stuFlag = options.stuFlag == 1
        this.ref = options.ref || ''
        this.source = options.source
        this.assistType = options.type
        this.shareUserShareKey = decodeURIComponent(options.shareUserShareKey)
        this.shareKey = decodeURIComponent(options.shareKey)

        if (options.newUserFlag == 6) {
            this.setData({ userCouponFromType: 15 })
        }

        if (this.subOrderId) {
            this.setData({ isSubOrder: true })
        }
        this.openIdPromise = util.getOpenId().then(OpenId => {
            this.OpenId = OpenId
            if (!OpenId) {
                this.robTrace({ code: robErrorCode.openIdEmpty })
            }

            return OpenId
        }).catch(e => {
            this.robTrace({ code: robErrorCode.openIdErr, err: e })
        })

        // 改签抢必须每次调用 shareGrab 接口
        if (this.subOrderId) {
            this.initPromise = this.ShareGrab()
        }

        if (cwx.user.isLogin()) {
            cwx.user.checkLoginStatusFromServer((data) => {
                if (!data) {
                    cwx.user.logout(() => {
                        this.setData({
                            isLogin: false,
                        })
                    })
                } else {
                    this.setData({
                        isLogin: true,
                    })
                }
            })
        } else {
        }

        GetShareImgNew().then(imgUrls => {
            const imgArr = JSON.parse(imgUrls)
            this.shareImgs = imgArr
        }).catch(e => {
            console.log(e)
        })

        this.setData({ isIOS: util.isIOS(), isAndroid: util.isAndroid(), isIphoneX: util.isIphoneX(), hasCollected: TrainActStore.getAttr('HASCOLLECTED'), newFeatureFlag: options.newFeatureFlag == 1 })
        // 从app分享卡片或者app内部
        if (cwx.scene == 1036 || cwx.scene == 1069) {
            this.setData({ fromApp: true, launchAPPUrl: "ctrip://wireless/train_inquire?allianceid=263382&sid=1464973&utmSource=wxappRobshare&needguid=1&guidtype=qdhzxcxhc" })
        }
        console.log('TRN: 是否可以添加到小程序: ' + this.data.canAddMiniapp)
        await this.getAbTest()
        this.getSuperMemberInfo()
        // this.getThemeConfig()
        // this.getBannerListConfig()
        // 新版轮播图32104222306
        this.getBannerItemList()
        this.getTrainWXUserState()
        this.getCollectConfig()
        this.getActivityConfig()
        this.getBottomBannerConfig()
        this.getRuleConfig()
        this.getBuList()
        this.getHBUrlConfig()
        this.getThemeOldConfig()
        this.getReshareRuleList()
        this.getMoreShareQconfig()
        this.getToolbarAfterAssistQconfig()
        this.getSuperPowerLotteryConfig()
        this.getPreSaleDays().then(this.getQconfig)
        if (this.data.newFeatureFlag) {
            this.getRobDescConfig()
            this.getThemeNewConfig()
        }
        this.handleSubIds(['_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM'],[{id:'_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM'}],true)

        util.ubtTrace(`s_trn_c_trace_${shared.pageIds.robshare.pageId}`, { exposureType: 'pv', bizKey: 'assistGrabVisitfrom', scene: `${options.allianceid}&${options.sid}` })
    },
    onHide() {
        clearInterval(this.ticketTimer)
    },
    async onShow() {
        // this.wxLogin()
        // 放在 onShow 里防止失败后无法设置
        console.log('shareOnShow', this.shareTriggered)
        this.shareTriggered = 0 // 分享按钮点击后走了onshow，认为是分享成功了

        // cwx.showShareMenu && cwx.showShareMenu({ withShareTicket: true }) // 移到下面去了，读取配置后才决定开ShareMenu
        let self = this
        // util.showLoading()
        this.openIdPromise.then(() => {
            if (this.data.getCouponAfterLogin) {
                this.setData({ getCouponAfterLogin: false })
                if (cwx.user.isLogin()) {
                    this.getCoupon()
                }
            }
            if (this.initPromise) {
                return this.initPromise
                    .then(this.getAcceList)
                    .then(this.RecallPackageDetail) //  1. 是否领取召回礼包 2. 你是不是福星 (这俩都是福星 2 号需求
                    .then(async () => {
                        console.log('订单状态和用户是否可以助力状态', this.data.isAccelerating, this.data.acceState)
                        const { isAccelerating, LightningLevel, acceState, isLogin, abtest } = this.data

                        // 用户初始是否可助力
                        this.setData({ initAcceState: !acceState && isAccelerating })

                        // // 用户不可加速 订单可加速 未达到最高速
                        // if (LightningLevel < 5 && (isAccelerating && acceState !== 0) && !this.data.hasShareGuideShow) {
                        //     this.setData({
                        //         showMask: 'shareGuide',
                        //         hasShareGuideShow: true
                        //     })
                        //     this.ubtTrace('train_grab_noacccshare', true)
                        //     this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'popup', bizKey: 'assistPopupExposure', status: 1 }, true)
                        // }

                        if (cwx.user.isLogin()) {
                            newcustomerMixin.getNewCustomerRights(self, this.data.userCouponFromType)
                                .then(newcustomerMixin.checkCanReceiveNewCustomerRight)
                                .then(() => {
                                    return newcustomerMixin.receiveNewCustomerRight(this.data.userCouponFromType)
                                })
                                .then((res) => {
                                    this.setData({ canReceiveNewUserRights: true })
                                    const { AbValue, RightList } = this.data.newCustomerRightInfo
                                    if (!AbValue || AbValue == 'a') {
                                        util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'oldFixedNewcustExposure', version: AbValue })
                                    }

                                    if (!(isAccelerating && acceState == 0) || this.data.loginBtnClick) {
                                        if (res?.IsReceiveSuccess) {
                                            const amount = res.RightInfo.DescList.reduce((sum, v) => sum += v.Price, 0)
                                            const data = {
                                                ...res,
                                                priceAmount: amount,
                                            }

                                            this.setData({ newGuestReceivedPopData: data, showMask: 'newGuestRightPop' , canReceiveNewUserRights: false})
                                            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "newCustmerRightPop", exposureType: "popup", version: AbValue, scene: 2 })
                                            this.ubtTrace('train_grab_noaccnewbie', !(isAccelerating && acceState == 0) || !isLogin)
                                            this.ubtTrace('train_grab_hpnewbieent', !!this.data.newCustomerRightInfo && !(isAccelerating && acceState == 0))
                                        }
                                    }
                                }).catch(e => {
                                    if (this.data.loginBtnClick) {
                                        util.showToast('不符合新客领取条件', 'none')
                                    }
                                    console.log('报错', e)
                                })
                                .finally(() => {
                                    const { AbValue, RightList } = this.data.newCustomerRightInfo || {}
                                    if (RightList?.length && AbValue !== 'a') {
                                        util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'newFixedNewcustExposure', version: AbValue })
                                    }

                                    // 用户不可加速 订单可加速 未达到最高速
                                    if (!this.data.didShow && LightningLevel < 5 && (isAccelerating && acceState !== 0) && !this.data.hasShareGuideShow && !this.data.showMask && this.data.hideShareInRobshare === 0) {
                                        this.setData({
                                            showMask: 'shareGuide',
                                            hasShareGuideShow: true
                                        })
                                        this.ubtTrace('train_grab_noacccshare', true)
                                        this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'popup', bizKey: 'assistPopupExposure', status: 1 }, true)
                                    }

                                    this.setData({
                                        didShow: true
                                    })
                                    this.showNewOrLostRightsInfoAfterAssist() // 展示助力后新客流失礼包模块
                                })
                            // 订单或者用户无法加速的时候
                            this.initSuscribeTicketStatus()
                            this.getLuckyStarListInfo().then(() => {
                                this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'pageviewExposure_login' }, true)
                            })
                            // this.getAnyGoInfo() //  任意行信息
                            this.getReduceCouponInfo() //  任意行信息
                        } else {
                            newcustomerMixin.getNewCustomerRights(self, this.data.userCouponFromType).then(() => {
                                const { AbValue, RightList } = this.data.newCustomerRightInfo
                                if (!(isAccelerating && acceState == 0)) {
                                    this.setData({ showMask: 'newCustmerRightUnPop' })
                                    util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "awaitTakePopupExposure", exposureType: "popup", version: AbValue, scene: 2 })
                                }

                                util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'oldFixedNewcustExposure', version: AbValue })
                                if (RightList?.length && AbValue !== 'a') {
                                    util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'newFixedNewcustExposure', version: AbValue })
                                }
                                this.ubtTrace('train_grab_noaccnewbie', !(isAccelerating && acceState == 0) || !isLogin)
                                this.ubtTrace('train_grab_hpnewbieent', !!this.data.newCustomerRightInfo && !(isAccelerating && acceState == 0))
                            })
                        }

                        if (abtest?.cashbackAbTest == 'B') {
                            this.getCashBackCouponList(ActivityCode.cashBack)
                        }
                        // 曝光埋点
                        this.ubtTraceAdapter('s_trn_c_trace_10320655842', {
                            exposureType: 'normal',
                            bizKey: 'pageviewExposure',
                            zhuliStatus: (isAccelerating || acceState != 2) ? 1 : 0,
                            zhuliLevel: LightningLevel,
                            loginStatus: cwx.user.isLogin() ? 1 : 0,
                            zhuliCase: this.getBoostedStatus() ? 1 : 0,
                            orderid: this.orderNumber,
                            version: this.data.assistAbVersion,
                            pageStyle: 'b',
                            visitSource: {
                                'gongzhonghao_zhuban': 1,
                                'masterUidTwice': 3,
                                'alreadyAddEnterpriseTwice': 4,
                                'pageShowMaxTimesTwice': 5,
                                'alreadyAddEnterprise': 6,
                                'pageShowMaxTimes': 8,
                            }[this.source]
                        })

                        if (!this.data.newFeatureFlag && this.data.isAccelerating && this.data.acceState !== 0) {
                            util.ubtTrace('s_trn_c_trace_10320655842', {
                                bizKey: "inviteFriendAssistExposure",
                                exposureType: "normal"
                            })
                        }
                    })
            } else {
                return this.getAcceList()
                    .then(this.RecallPackageDetail)
                    .then(async () => {
                        console.log('订单状态和用户是否可以助力状态', this.data.isAccelerating, this.data.acceState)
                        const { isAccelerating, LightningLevel, acceState, isLogin, abtest } = this.data

                        // 用户初始是否可助力
                        this.setData({ initAcceState: !acceState && isAccelerating })

                        // // 用户不可加速 订单可加速 未达到最高速
                        // if (LightningLevel < 5 && (isAccelerating && acceState !== 0) && !this.data.hasShareGuideShow) {
                        //     this.setData({
                        //         // showMask: 'shareGuide',
                        //         hasShareGuideShow: true
                        //     })
                        //     this.ubtTrace('train_grab_noacccshare', true)
                        //     this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'popup', bizKey: 'assistPopupExposure', status: 1 }, true)
                        // }

                        if (cwx.user.isLogin()) {
                            newcustomerMixin.getNewCustomerRights(self, this.data.userCouponFromType)
                                .then(newcustomerMixin.checkCanReceiveNewCustomerRight)
                                .then(() => {
                                    return newcustomerMixin.receiveNewCustomerRight(this.data.userCouponFromType)
                                })
                                .then((res) => {
                                    this.setData({ canReceiveNewUserRights: true })
                                    const { AbValue, RightList } = this.data.newCustomerRightInfo || {}
                                    if (!AbValue || AbValue == 'a') {
                                        util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'oldFixedNewcustExposure', version: AbValue })
                                    }

                                    if (!(isAccelerating && acceState == 0) || this.data.loginBtnClick) {
                                        if (res?.IsReceiveSuccess) {
                                            const amount = res.RightInfo.DescList.reduce((sum, v) => sum += v.Price, 0)
                                            const data = {
                                                ...res,
                                                priceAmount: amount,
                                            }

                                            this.setData({ newGuestReceivedPopData: data, showMask: 'newGuestRightPop', canReceiveNewUserRights: false})
                                            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "newCustmerRightPop", exposureType: "popup", version: AbValue, scene: 2 })
                                            this.ubtTrace('train_grab_noaccnewbie', !(isAccelerating && acceState == 0) || !isLogin)
                                            this.ubtTrace('train_grab_hpnewbieent', !!this.data.newCustomerRightInfo && !(isAccelerating && acceState == 0))
                                        }
                                    }
                                }).catch(e => {
                                    if (this.data.loginBtnClick) {
                                        util.showToast('不符合新客领取条件', 'none')
                                    }
                                    console.log('报错', e)
                                })
                                .finally(() => {
                                    const { AbValue, RightList } = this.data.newCustomerRightInfo || {}
                                    if (RightList?.length && AbValue !== 'a') {
                                        util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'newFixedNewcustExposure', version: AbValue })
                                    }

                                    // 用户不可加速 订单可加速 未达到最高速
                                    if (!this.data.didShow && LightningLevel < 5 && (isAccelerating && acceState !== 0) && !this.data.hasShareGuideShow && !this.data.showMask && this.data.hideShareInRobshare === 0) {
                                        this.setData({
                                            showMask: 'shareGuide',
                                            hasShareGuideShow: true
                                        })
                                        this.ubtTrace('train_grab_noacccshare', true)
                                        this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'popup', bizKey: 'assistPopupExposure', status: 1 }, true)
                                    }

                                    this.setData({
                                        didShow: true
                                    })
                                    this.showNewOrLostRightsInfoAfterAssist() // 展示助力后新客流失礼包模块
                                })
                            this.initSuscribeTicketStatus()
                            this.getLuckyStarListInfo().then(() => {
                                this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'pageviewExposure_login' }, true)
                            })
                            // this.getAnyGoInfo() //  任意行信息
                            this.getReduceCouponInfo() //  任意行信息
                        } else {
                            newcustomerMixin.getNewCustomerRights(self, this.data.userCouponFromType).then(() => {
                                const { AbValue, RightList } = this.data.newCustomerRightInfo
                                if (!(isAccelerating && acceState == 0)) {
                                    this.setData({ showMask: 'newCustmerRightUnPop' })
                                    util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "awaitTakePopupExposure", exposureType: "popup", version: AbValue, scene: 2 })
                                }
                                util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'oldFixedNewcustExposure', version: AbValue })
                                if (RightList?.length && AbValue !== 'a') {
                                    util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'newFixedNewcustExposure', version: AbValue })
                                }
                                this.ubtTrace('train_grab_noaccnewbie', !(isAccelerating && acceState == 0) || !isLogin)
                                this.ubtTrace('train_grab_hpnewbieent', !!this.data.newCustomerRightInfo && !(isAccelerating && acceState == 0))
                            })
                        }

                        if (abtest?.cashbackAbTest == 'B') {
                            this.getCashBackCouponList(ActivityCode.cashBack)
                        }

                        // 曝光埋点
                        this.ubtTraceAdapter('s_trn_c_trace_10320655842', {
                            exposureType: 'normal',
                            bizKey: 'pageviewExposure',
                            zhuliStatus: (isAccelerating || acceState != 2) ? 1 : 0,
                            zhuliLevel: LightningLevel,
                            loginStatus: cwx.user.isLogin() ? 1 : 0,
                            zhuliCase: this.getBoostedStatus() ? 1 : 0,
                            orderid: this.orderNumber,
                            version: this.data.assistAbVersion,
                            pageStyle: 'b',
                            visitSource: {
                              'gongzhonghao_zhuban': 1,
                              'masterUidTwice': 3,
                              'alreadyAddEnterpriseTwice': 4,
                              'pageShowMaxTimesTwice': 5,
                              'alreadyAddEnterprise': 6,
                              'pageShowMaxTimes': 8,
                            }[this.source]
                        })

                        if (!this.data.newFeatureFlag && this.data.isAccelerating && this.data.acceState !== 0 ) {
                            util.ubtTrace('s_trn_c_trace_10320655842', {
                                bizKey: "inviteFriendAssistExposure",
                                exposureType: "normal"
                            })
                        }
                    })

            }
        })

        if (cwx.user.isLogin()) {
            this.setData({ isLogin: true })
            this.checkHasBindMobile().then(this.checkUserInfo)
            this.getCouponList()
            try {
                this.getNewCouponList(ActivityCode.double)
            } catch (e) { console.log('try catch', e) }
            ctripNewGuestStepPromise({}).then(data => {
                if (data.RetCode == 1) {
                    this.setData({ isCtripNew: data.IsCtripNewGuest })
                }
            })

            if (this.stuFlag) {
                studentCardMixin.methods.getStudentRightsInfo(1, self = this).then(() => {
                    this.ubtTrace('train_grab_hpstudent', !!this.data.studentCardInfo && !(this.data.isAccelerating && this.data.acceState == 0))
                })
            }
        } else {
            this.setData({ isLogin: false })
        }
        this.shareCb()
        this.getTrainSuperPowerUnlockInfoFunc()
    },
    onUnload() {
        clearTimeout(this.timeoutId)
        clearInterval(this.ticketTimer)
        clearInterval(this.calendarTimer)
    },
    async initSuscribeTicketStatus() {
        if (!shared.isCtripApp) {
            return
        }
        const type = this.data.initAcceState ? 6 : 10 // 正常抢票助力流程的订阅 type 为 6，不可助力状态为 10
        const toggle = await ConfigInfoPromise({ ConfigKey: 'train_wx_subscribeticket' })
        // 获取订阅状态
        const templist = [
            { id: "_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM", FromType: 2, ActivityCode: 'CtripBuyTicketForBISend' },   //  购票提醒
            { id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY", FromType: 6, ActivityCode: 'DueReminder' },   //  优惠券到期
            { id: "DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4", FromType: 3, ActivityCode: 'CtripLineStatusAlert' },  //  余量提醒
            { id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: type, ActivityCode: 'ReceiveBonus' },   //  奖励提醒
        ]

        const res = await subscribeMixin.checkSubscribeStatus(templist)
        if (res?.length) {
            const [
                hasSubscribedTicket,
                hasSubscribedExpire,
                hasSubscribedRouteNotify,
                hasSubscribedBonus
            ] = res

            this.setData({
                hasSubscribedTicket: hasSubscribedTicket.status,
                hasSubscribedRouteNotify: hasSubscribedRouteNotify.status,
                hasSubscribedBonus: hasSubscribedBonus.status,
                hasSubscribedExpire: hasSubscribedExpire.status,
            })
        }

        this.setData({
            subscribeTicketToggle: toggle?.ConfigInfo?.Content == 1,
        })
    },
    /**
     * B版回流APP 181022_tra_back
     */
    getAbTest() {
        const abValues = [
            // 下面3个实验现在好像不做了 还是先留着吧
            { key: '181022_tra_back', name: 'launchAppAbTest' },
            { key: '190408_tra_jszh', name: 'acceAbTest' },
            { key: '200818_TRN_JSXFX', name: 'cashbackAbTest' },
            { key: '220127_TRN_sub', name: "subscribeAb" },    //  新客弹窗订阅 ab
            { key: '220322_TRN_yhq', name: 'productAb' }, // 任意行和立减券包出现
            { key: '220322_TRN_QPZL', name: 'assistTest' },
            { key: '220601_TRN_act', name: 'travelTaskAb' }, // 出行任务入口ab
            { key: '230418_TRN_renwu', name: 'taskComponentAb'}, // 任务组件展示Ab
            { key: '230824_TRN_new', name: 'rightAfterAssistAb'}, // 助力后新客/流失礼包展示Ab
            { key: '230824_TRN_bag', name: 'newBagAfterAssistAb'} // 助力后新客礼包内容ab
        ]

        const getAbAsync = ({ key, name }) => new Promise(resolve => {
            cwx.ABTestingManager.valueForKeyAsync(key, value => resolve({ [name]: value }))
        })

        return Promise.all(abValues.map(v => getAbAsync(v))).then(arr => {
            const abtest = arr.reduce((obj, v) => ({ ...obj, ...v }), {})
            this.setData({ abtest })
            console.log('异步获取 ab 实验组', abtest)
        })
    },
    async getAccePkgList(HelpNumber) {
        let params = {
            ChannelName: 'WX',
            HelpNumber,
            GrabSpeedTest: this.data.speedTaskAbVersion
        }
        // util.showLoading()
        const data = await util.promisifyModel(GetAcceleratePackageListInfoModel)(params)
        try {
            if (!data || !data.AccePackageTable) {
                util.showModal({ m: '领取失败，请重试' })

                return
            }
            let accePackages = []
            accePackages.push(data.AccePackageTable.PackageTable_A)
            accePackages.push(data.AccePackageTable.PackageTable_B)
            accePackages.push(data.AccePackageTable.PackageTable_C)
            accePackages.push(data.AccePackageTable.PackageTable_F)
            accePackages.push(data.AccePackageTable.PackageTable_E)
            accePackages.push(data.AccePackageTable.PackageTable_D)
            this.setData({ accePackages })
            // if (cb) {
            //     cb()
            // }
        } catch (err) {
            util.showToast('出错了..即将自动跳转', 'none')
            this.robTrace({ code: robErrorCode.pkgListError, err: err })
            setTimeout(util.goToHomepage, 2500)
        }
        // GetAcceleratePackageListInfoModel(params, data => {
            // util.hideLoading()
        // }, err => {
            // util.hideLoading()
        // }, () => { })
    },

    launchAppError(e) {
        console.log(e.detail.errMsg)
        this.setData({ fromApp: false })
    },

    getAcceList(cb) {
        if (!this.data.showLoading) {
            // util.showLoading()
        }
        if (this.data.newFeatureFlag) {
            this.getNewRobLevelDetail()
            this.getNewRobFriendList()
        }
        const deferred = util.getDeferred()
        const params = {
            OrderNumber: this.orderNumber,
            ChangeOrderNumber: this.subOrderId,
            OpenId: this.getOpenId(),
            IsAlternativeChannel: this.data.newFeatureFlag,
        }
        RobTicketShareInfoModel(params, async (res) => {
            // mock
            // res = {"ResponseStatus":{"Timestamp":"/Date(1691131104846+0800)/","Ack":"Success","Errors":[],"Build":null,"Version":null,"Extension":[{"Id":"CLOGGING_TRACE_ID","Version":null,"ContentType":null,"Value":"3439651368963946385"},{"Id":"RootMessageId","Version":null,"ContentType":null,"Value":"100025527-0a068a23-469758-154645"}]},"DepartureStation":"上海虹桥","ArriveStation":"北京南","TrainNum":"G102","GrabTicketStatus":"正在抢票","PassageCount":1,"FlowPacketCount":6,"Speed":39.0,"LightningLevel":3,"SpeedLevelName":"高速抢票","SpeedLevelDesc":"本轮抢票结束啦，我也要试试携程抢票","UpPacketNum":2,"PacketInfo":12.00,"SharedInfo":[{"PassageName":"","PassageTag":"","PassagePhotoUrl":"","FlowPacket":6,"PacketAmount":12.00,"AcceTime":"/Date(1688975305000+0800)/","IsSelf":true,"IsLuckyStar":false}],"IsShared":0,"OrderUserIsSuperMember":false,"activityShare":0,"IsStudentTicket":false,"IsSelf":true,"UnableSpeedReason":null,"TaskAbVersion":"B","RetCode":0,"RetMessage":null,"ServiceInfo":{"SpeedLevelDesc":"再邀<span style='color: #FF9A14'>1人</span>，可升至极速抢票","ServiceList":[{"ImgUrl":"https://images3.c-ctrip.com/train/2022/app/8.59/qiangpiao/jiasubao/icon_zhulibao@3x.png","Title":"20个助力包","SubTitle":"可全额退款","Tag":""},{"ImgUrl":"https://images3.c-ctrip.com/train/2022/app/8.59/qiangpiao/jiasubao/icon_wangsu@3x.png","Title":"350m/s网速","SubTitle":"余票监控","Tag":""},{"ImgUrl":"https://images3.c-ctrip.com/train/2022/app/8.59/qiangpiao/jiasubao/icon_zhineng@3x.png","Title":"更多智能方案","SubTitle":"持续无票时推荐","Tag":""},{"ImgUrl":"https://images3.c-ctrip.com/train/2022/app/8.59/qiangpiao/jiasubao/icon_butie@3x.png","Title":"候补出票补贴","SubTitle":"出票后即返","Tag":"限时"}],"DescList":["免费扫描候补席位，全程自动提交，含¥200租车券"]},"DouYinJumpUrl":"&shareTemplateList=50"}


            this.setData({ showLoading: false })
            // util.hideLoading()
            if (!util.isAuthValid(res)) {
                cwx.user.login({
                    callback: function (res) {
                        if (res.ReturnCode == "0") { }
                    },
                })
                return false
            }

            // fat 测试用
            // this.setData({ isAccelerating: false, IsSelf: false, acceState: 0 })
            // return deferred.resolve()

            if (res.RetCode == 0) { //成功

                let shareInfo = res?.SharedInfo || []
                let totalBag = 0
                shareInfo.forEach(item => {
                    totalBag += item.FlowPacket
                })
                let selfAvatar = shareInfo?.find(item => item.IsSelf)?.PassagePhotoUrl
                let nextLevel = ''
                try {
                    nextLevel = res.SpeedLevelDesc.replace(
                        /<font[\s]+color=([^>]*)>([^<]*)<\/font>/ig, (this.data.canRichText)
                        ? "<span style='color:$1;'>$2</span>"
                        : '$2')
                } catch (e) {
                    console.log(e)
                }

                let {
                    ArriveStation = '',
                    TrainNum = '',
                    GrabTicketStatus,
                    SpeedLevelName,
                    LightningLevel,
                    UpPacketNum = 0,
                    DepartureStation = '',
                    IsStudentTicket = false,
                    OrderUserIsSuperMember,
                    UnableSpeedReason,
                    IsSelf,
                    TaskAbVersion
                } = res

                this.setData({
                    speedTaskAbVersion: TaskAbVersion?.toUpperCase() || 'A',
                    IsSelf,
                    selfAvatar,
                    totalBag,
                    friendList: shareInfo.slice(0, 4),
                    acceState: res.IsShared || 0,
                    isAssistLimit: res.IsLimit || false,
                    ArriveStation,
                    TrainNum,
                    GrabTicketStatus,
                    SpeedLevelName,
                    LightningLevel,
                    isAccelerating: GrabTicketStatus === '正在抢票',
                    acceSuccess: GrabTicketStatus === '抢票成功',
                    acceOver: GrabTicketStatus === '已取消抢票',
                    UpPacketNum,
                    nextLevel,
                    DepartureStation,
                    IsStudentTicket,
                    isChangeOrderFlag: !!this.subOrderId,
                    UnableSpeedReason: UnableSpeedReason,
                    OrderUserIsSuperMember: OrderUserIsSuperMember && !this.data.newFeatureFlag
                })
                if(this.data.IsSelf){
                  console.log('orderNumber-self', this.orderNumber)
                  this.setData({ moreAssistTaskCompid: '224012',moreAssistTaskTempid: 'task_trn_wechat_qp_1',moreAssistTaskChannel: 'O90YP7E27F',orderData:{secondId: this.orderNumber, secondType: 1} })
                } else if(this.data.abtest.taskComponentAb === 'B'){
                  console.log('orderNumber-noself', this.orderNumber)
                  this.setData({ moreAssistTaskCompid: '223995',moreAssistTaskTempid: 'task_trn_wechat_qp_b',moreAssistTaskChannel: 'U5M8WG7G36',orderData:{secondId: this.orderNumber, secondType: 1} })
                } else if (this.data.isAccelerating) {
                  console.log('orderNumber-noself', this.orderNumber)
                  this.setData({ moreAssistTaskCompid: '214812',moreAssistTaskTempid: 'task_trn_wechat_qp',moreAssistTaskChannel: 'O5X0KZEP37',orderData:{secondId: this.orderNumber, secondType: 1} })
                } else {
                  this.setData({
                    moreAssistTaskNotShow: true,
                  })
                }

                this.friendHelpEntrance()
                this.ubtTrace('train_grabacc_maxspeed', this.data.LightningLevel == 5)
                this.ubtTrace('train_grabacc_grabend', this.data.acceSuccess)
                this.ubtTrace('train_grabacc_cantacc', !(this.data.isAccelerating && this.data.acceState == 0))
                setTimeout(() => {
                    if (this.data.abtest.rightAfterAssistAb === 'B'
                        && cwx.user.isLogin()
                        && !(this.data.isAccelerating && this.data.acceState == 0)
                        && this.data.toolbarAfterAssist.isToolsShow
                        && this.data.toolbarAfterAssist?.toolsConfig?.length) {
                        util.ubtFuxiTrace('GCWAssistMainPage_ToolModule_exposure', { PageId: this.pageId })
                    }
                }, 2000);
                deferred.resolve()
            } else if (res.RetCode == 1) {
                if (this.retryTimes > 1) {
                    this.acceImm = false
                    util.showToast('出错了..即将自动跳转', 'none')
                    this.setData({ acceState: -1 })
                    setTimeout(util.goToHomepage, 2500)
                } else {
                    if (this.retryTimes) {
                        this.retryTimes++
                    } else {
                        this.retryTimes = 1
                    }
                    const params = {
                        OrderNumber: this.orderNumber,
                        ChangeOrderNumber: this.subOrderId,
                    }

                    // util.showLoading()
                    ShareGrabModel(params, () => { }, err => {
                        this.robTrace({ code: robErrorCode.shareError, err })
                    }, () => {
                        setTimeout(() => {
                            // util.hideLoading()
                            this.getAcceList()
                        }, 1000)
                    })
                }
                deferred.reject()
            } else {
                this.acceImm = false
                util.showToast('出错了..即将自动跳转', 'none')
                this.setData({ acceState: -1 })
                setTimeout(util.goToHomepage, 2500)
                deferred.reject()
            }
            // 获取对应的城市和站点
            // if (this.data.ArriveStation) this.getArrivedStationAndCity()
        }, err => {
            this.setData({ showLoading: false })
            this.acceImm = false
            // util.hideLoading()
            this.robTrace({ code: robErrorCode.infoError, err })
            deferred.reject()
        }, () => {
        })

        return deferred.promise
    },
    getNewRobLevelDetail() {
        const params = {
            subordernumber: this.subOrderId,
            ordernumber: this.orderNumber,
            channel: 'ctripwx',
        }
        TrainGetGrabNewAccelerateInfoModel(params, res => {
            if (res.retCode == 1) {
                const { wxDiscountTag, wxDiscountDesc, trainRangeList = [], currentLevel = 0, acceleratePackageText } = res
                trainRangeList.forEach(item => { item.Current = item.level == currentLevel })
                this.setData({
                    wxDiscountTag,
                    wxDiscountDesc,
                    trainRangeList,
                    currentLevel,
                    acceleratePackageText,
                })
            } else {
                util.showModal({
                    m: '系统错误',
                })
            }
        })
    },
    getNewRobFriendList() {
        const params = {
            subordernumber: this.subOrderId,
            ordernumber: this.orderNumber,
            channel: 'ctripwx',
        }
        TrainGetGrabNewAccelerateFriendListModel(params, res => {
            if (res.retCode == 1) {
                const { assistedFriendsList = [] } = res
                this.setData({
                    assistedFriendsList: assistedFriendsList.slice(0, 4),
                })
            } else {
                util.showModal({
                    m: '系统错误',
                })
            }
        })
    },
    buyTicketSubmit(e) {
        util.ubtTrace('c_trn_c_10320655842', { bizKey: 'toBuyTicket' })

        saveUserFormID(e.detail.formId)
        this.buyTicket()
    },

    buyTicket() {
        this.toHomePage()
    },
    toHomePage() {
        if (shared.isTrainApp) {
            cwx.reLaunch({
                url: '/pages/train/index/index?allianceid=263382&sid=712744&savetohome=1',
            })
        } else {
            // 新客礼包 ab 点击跳转会加参数
            // const { AbValue } = this.data.newCustomerRightInfo || {}
            // const url = `/pages/train/index/index?allianceid=263382&sid=712744&savetohome=1${AbValue == 'a' || !AbValue ? '' : '&newUserFlag=2'}`
            const url = `/pages/train/index/index?allianceid=263382&sid=712744&savetohome=1`

            this.navigateTo({ url })
        }
    },
    onClickReceiveGifts() {
        const { couponListWillCashBack } = this.data
        let hasCashBack = couponListWillCashBack && couponListWillCashBack.length
        this.setData({
            newCustomerRightInfo: null,
        })
        if (shared.isTrainApp) {
            cwx.reLaunch({
                url: !hasCashBack ? '/pages/train/index/index?OrderSource=TRA_GrabBoost_Guide_NewGuest_CreateOrder' : `/pages/train/index/index?subType=${this.data.couponListWillCashBack[0].SubType}&activityCode=${ActivityCode.cashBack}&cashamount=${this.data.couponListWillCashBack[0]?.Price}`,
            })
        } else {
            this.navigateTo({
                url: !hasCashBack ? '../index/index?OrderSource=TRA_GrabBoost_Guide_NewGuest_CreateOrder' : `../index/index?subType=${this.data.couponListWillCashBack[0].SubType}&activityCode=${ActivityCode.cashBack}&cashamount=${this.data.couponListWillCashBack[0]?.Price}`,
            })
        }
    },
    receiveCombineGifts(e) {
        const { issend } = e.currentTarget && e.currentTarget.dataset
        this.setData({ newCustomerRightInfo: null })
        if (shared.isTrainApp) {
            cwx.reLaunch({
                url: issend ? '/pages/train/index/index' : `/pages/train/index/index?subType=${this.data.couponListWillCashBack[0]?.SubType}&activityCode=${ActivityCode.cashBack}&cashamount=${this.data.couponListWillCashBack[0]?.Price}`,
            })
        } else {
            this.navigateTo({
                url: issend ? '../index/index?' : `../index/index?subType=${this.data.couponListWillCashBack[0]?.SubType}&activityCode=${ActivityCode.cashBack}&cashamount=${this.data.couponListWillCashBack[0]?.Price}`,
            })
        }
    },
    getCoupon() {
        let self = this
        const goLogin = () => {
            self.setData({ getCouponAfterLogin: true })
            cwx.user.login({ callback: function () { } })
        }
        if (!cwx.user.isLogin()) {
            goLogin()

            return
        }

        // formId 中传递助力时的 formId, 后台用来区分是否领取过优惠券
        let params = {
            partner: 'Ctrip.Train',
            mobile: '',
            formId: shared.isCtripApp
                ? (this.acceFormId || '')
                : '',
            activityCode: this.data.isGetDouble
                ? 2007
                : 2006,
        }
        const errCb = () => {
            self.setData({ showMask: 'get-fail' })
        }
        util.showLoading()
        if (TrainActStore.getAttr(!TrainActStore.setAttr('YOUGETCOUPON', true)))
            return
        AcquireActivityCouponModel(params, data => {
            // util.hideLoading()
            if (!util.isAuthValid(data)) {
                cwx.user.logout(() => {
                    console.log('TRN get coupon auth invalid, logout')
                })
                goLogin()

                return
            }
            if (data.resultCode == 1) {
                // this.setData({
                //     showMask: 'you-get',
                // })
                util.showToast('领取成功')
                TrainActStore.setAttr('YOUGETCOUPON', true)
                this.getAcceList()
            } else if (data.resultCode == 400 || data.resultCode == 406) {
                TrainActStore.setAttr('YOUGETCOUPON', true)
                util.showToast('您已领取过抢票券')
                // this.setData({
                //     showMask: 'geted'
                // })
            } else {
                errCb()
            }
        }, err => {
            // util.hideLoading()
            errCb()
            this.robTrace({ code: robErrorCode.couponError, err })
        }, () => { })
    },

    onShareAppMessage(options) {
        const ArriveStation = this.data.ArriveStation

        let isShareForDouble = false
        if (options && options.from === 'button') {
            const { target } = options
            isShareForDouble = target.dataset.type
        }
        if (options) {
            if (options.from === 'button') {
                const { target } = options
                let shareType = target.dataset.share
                if (shareType === 'more') {
                    util.shareTrace({ c: 2, msg: 'help share' })
                }
                if (shareType == 'double') {
                    this.shareFlag = true
                }
                if (shareType == 'superpower') {
                    const url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-super-power/lottery?shareKey=${this.data.superPowerInfo.shareKey}&powerType=${this.data.superPowerInfo.powerType}&titleBgColor=99D3FF&titleColor=ffffff`
                    const shareMiniPath = `pages/train/shareWebView/shareWebView?data={"url":"${encodeURIComponent(
                        url,
                      )}","hideShare":true}`
                    let title = '分享给你购票超能力小知识'
                    let imageUrl = 'https://images3.c-ctrip.com/train/2022/app/8.59/zhuliucheng/chaonengliplus/img-ckmj-new.png'
                    return {
                        bu: "train",
                        title: title,
                        path: shareMiniPath,
                        imageUrl: imageUrl,
                    }
                }
            }
        }

        let type
        let shareKey
        let shareUserShareKey
        if (this.data.reshareInfo?.Type === 3) {
            type = this.data.reshareInfo?.Type
            shareKey = encodeURIComponent(this.data.reshareInfo?.ShareKey)
            shareUserShareKey = encodeURIComponent(this.data.reshareInfo?.ShareUserShareKey)
        }
        return util.getRobShareObj({
          ArriveStation,
          oid: this.orderNumber,
          subOrderId: this.subOrderId,
          avatar: encodeURIComponent(this.avatarUrl || ''),
          shareImgs: this.shareImgs,
          aid: isShareForDouble
              ? '263382'
              : '3825094',
          sid: isShareForDouble
              ? '1367549'
              : '21793907',
          newFeatureFlag: Number(this.data.newFeatureFlag),
          filterType: 'time',
          stuFlag: Number(this.stuFlag),
          sharePath: this.data.closeEnterpriseMoreShare ? '/pages/train/robshare/robshare': '/pages/trainActivity/robshareMidPage/index',
          ref: 1,
          type,
          shareKey,
          shareUserShareKey,
          webviewUrl: ''
      })
    },

    shareCb() {
        if (this.shareFlag) {
            this.shareFlag = false
            this.recieveNewCoupon()
        }
    },
    // 加速包接口抽离 (里面有福星字段
    calculateAcceleratePkg(formId = this.acceFormId) {
        let source = shared.isCtripApp
            ? this.ref ? 'mini_ref_zhuban' : 'mini_zhuban'
            : this.ref ? 'mini_ref_duliban' : 'mini_duliban'

        if (!!this.source) {
            source = [
              "masterUidTwice",
              "alreadyAddEnterpriseTwice",
              "pageShowMaxTimesTwice",
            ].includes(this.source) ? 'mini_ref_zhuban' : this.source
        }

        const params = {
            ChannelName: 'WX',
            OrderNum: this.orderNumber,
            ChangeOrderNumber: this.subOrderId,
            PassageName: this.data.userInfo ? this.data.userInfo.nickName : '',
            PassagePhotoUrl: this.data.userInfo ? this.data.userInfo.avatarUrl : '',
            UserId: this.getOpenId(),
            MobilePhone: this.data.userBindedPhoneNumber,
            MobileToken: this.data.mobileToken,
            FormId: shared.isCtripApp
                ? (formId || '')
                : '', // 独立版不推送模板消息
            VersionFlag: 1, // 新助力包计算逻辑传 1
            IsRocketPack: this.data.newFeatureFlag,
            source
        }

        return util.promisifyModel(CalculateAcceleratePackageModel)(params)
        // mock
        // return Promise.resolve({"ResponseStatus":{"Timestamp":"/Date(1691129388180+0800)/","Ack":"Success","Errors":[],"Build":null,"Version":null,"Extension":[{"Id":"CLOGGING_TRACE_ID","Version":null,"ContentType":null,"Value":"1494594117333438855"},{"Id":"RootMessageId","Version":null,"ContentType":null,"Value":"100016183-0a38086a-469758-186407"}]},"ResultCode":1,"Message":"发放失败","ResultMessage":"发放失败","Table_Num":"D","GrabAccelNumber":4,"IsLuckyStar":false,"LuckyStarType":0,"CouponDesc":null})
    },
    async openLottery(formId = this.acceFormId) {
        util.showLoading()

        if (this.assistType == 2 || (this.assistType == 3 && this.shareUserShareKey && this.shareUserShareKey)) {
            await this.friendHelp(+this.assistType)
        }
            this.calculateAcceleratePkg(formId)
                .then(async(data) => {
                    try {
                        bindUidAndUnionidModel({
                            Unionid: cwx.cwx_mkt.unionid,
                        }, (data) => {
                            console.log('bindinfo', data)
                        })
                    } catch (err) {
                        console.log('binderr', err)
                    }

                    await this.getAccePkgList(data.GrabAccelNumber)
                    util.hideLoading()

                    if (data.ResultCode == 1) {
                        cwx.sendUbtByPage.ubtMetric({
                            name: "237218",
                            value: 1,
                            tag: { status: 'success' },
                        })
                    } else {
                        cwx.sendUbtByPage.ubtMetric({
                            name: "237218",
                            value: 1,
                            tag: { status: 'failure' },
                        })
                    }

                    if (data.ResultCode == 1) {
                        let target
                        switch (data.Table_Num) {
                            case 'A':
                            case 'a':
                                target = 0
                                break
                            case 'B':
                            case 'b':
                                target = 1
                                break
                            case 'C':
                            case 'c':
                                target = 2
                                break
                            case 'D':
                            case 'd':
                                target = 5
                                break
                            case 'E':
                            case 'e':
                                target = 4
                                break
                            case 'F':
                            case 'f':
                                target = 3
                                break
                            default:
                                target = -1
                                break
                        }
                        if (target === -1) {
                            util.showModal({ m: '助力失败，请重试' })
                            this.getAcceList()

                            return
                        }
                        this.setData({ travelTaskAssistShow: true }) // 助力成功显示出行任务入口
                        this.setData({ showMask: 'lottery' })
                        this.startLottery(target).then(() => {
                            if (!cwx.user.isLogin()) {
                                this.setTimeout(() => {
                                    this.getAcceList()
                                    this.setData({ showMask: '' })
                                }, 2000)

                                return
                            }

                            this.setBoostedStatus() //该用户该订单已助力
                            this.getAcceList()
                            this.showNewOrLostRightsInfoAfterAssist()
                            util.ubtFuxiTrace('GCWAssistMainPage_GCWAssistSuccPage_exposure', { PageId: this.pageId, ActivityId: this.data.abtest.rightAfterAssistAb !== 'B' ? 2 : 1, AbtestGroup: this.data.abtest.newBagAfterAssistAb })
                            this.getCouponList()
                            this.getLuckyStarListInfo()
                            // this.getAnyGoInfo()
                            this.getReduceCouponInfo()

                            this.setTimeout(async() => {
                                if ((this.data.newCustomerRightInfo || this.data.couponItemListCashBack?.length) && this.data.canReceiveNewUserRights && this.data.newGuestReceivedPopData) {
                                    // 不能领取返现券时且可以领取权益礼包时 展示权益礼包弹窗 其他情况都展示新的混合礼包弹窗
                                    if (this.data.newCustomerRightInfo && !this.data.couponListWillCashBack?.length) {
                                        const { AbValue, RightList } = this.data.newCustomerRightInfo

                                        if (!RightList?.length) return

                                        this.setData({ newGuestReceivedPopData, showMask: 'newGuestRightPop',canReceiveNewUserRights: false })
                                        util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "newCustmerRightPop", exposureType: "popup", version: AbValue, scene: 2 })
                                        this.ubtTrace('train_grab_noaccnewbie', !(isAccelerating && acceState == 0) || !isLogin)
                                        this.ubtTrace('train_grab_hpnewbieent', !!this.data.newCustomerRightInfo && !(isAccelerating && acceState == 0))

                                        util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "newCustmerRightPop", exposureType: "popup", version: AbValue, scene: 1 })
                                        this.ubtTrace('train_grab_newbiepop', true)
                                    } else {
                                        this.setData({ showMask: 'combineGifts' })
                                        try {
                                            if (this.data.newCustomerRightInfo && this.data.couponListWillCashBack?.length) {
                                                this.ubtTrace('train_grab_nebiecashpop', true)
                                            }
                                            if (!this.data.couponListWillCashBack?.length) {
                                                this.ubtTrace('train_grab_cashusepop', true)
                                            }
                                            if (!this.data.newCustomerRightInfo && this.data.couponListWillCashBack?.length) {
                                                this.ubtTrace('train_grab_cashpop', true)
                                            }
                                        } catch (error) { }
                                    }
                                }  else if (this.data.LuckyStarType !== 1) {
                                    this.setData({
                                        GrabAccelNumber: data.GrabAccelNumber, 
                                        CouponDesc: data.CouponDesc
                                    })
                                    await this.assistAlertPopHandler()
                                    
                                }
                            }, this.data.isSuperVip || this.data.OrderUserIsSuperMember || this.data.IsLuckyStar
                                ? 3800
                                : 1800)
                        })
                    } else if (data.ResultCode == 302) {
                        util.showModal({ m: '抢票已结束' })
                        this.setData({ travelTaskAssistShow: true }) // 抢票结束显示出行任务入口
                        this.getAcceList()
                    } else if (data.ResultCode == 400) {
                        util.showModal({
                            m: data && data.Message || '每人每天可帮好友助力次数有限，您已达到上限，明天再来帮忙吧！',
                            confirmText: '我知道了',
                        })
                        this.setData({ travelTaskAssistShow: true }) // 助力上限显示出行任务入口
                        this.getAcceList()
                    } else if (data.ResultCode == 401) {
                        util.showModal({ m: '您已经为这个订单加过速啦' })
                        this.setData({ travelTaskAssistShow: true }) // 重复助力显示出行任务入口
                        this.getAcceList()
                    } else {
                        // 403 获取订单详情失败
                        // "ResultCode":-1,"Message":"userid is null"
                        util.showModal({
                            m: data && data.Message || '服务器开小差了，请重试',
                        })
                        this.getAcceList()
                    }
                })
                .catch((err) => {
                    util.hideLoading()
                    this.robTrace({ code: robErrorCode.acceError, err })
                })
        // })
    },

    startLottery(target) {
        const deferred = util.getDeferred()
        let self = this
        let speed = 10000,
            loopCnt = 0,
            totalItems = this.data.accePackages.length
        this.setData({
            curPkgIdx: -1,
            lottery: {
                isRunning: true,
            },
        })
        roll()

        return deferred.promise
        function roll() {
            setTimeout(function () {
                if (loopCnt == 0) {
                    speed = 1
                } else if (loopCnt < 10) {
                    part1()
                } else if (loopCnt < 30) {
                    part2()
                } else {
                    part3(loopCnt)
                }
                loopCnt++
                if (self.data.lottery.isRunning) {
                    roll()
                }
            }, 1000 / speed)
        }

        function part1() {
            // 助力阶段
            if (speed < 50) {
                speed += 2
            }
            addCurPkgIdx()
        }
        function part2() {
            // 匀速阶段
            addCurPkgIdx()
        }
        function part3() {
            if (speed > 10) {
                // 减速阶段
                speed -= 2
                addCurPkgIdx()
            } else if (target === self.data.curPkgIdx) {
                self.setData({
                    lottery: {
                        isRunning: false,
                    },
                })
                setTimeout(() => {
                    self.setData({
                        lottery: {
                            hasResult: true,
                        },
                    })
                    self.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'popup', bizKey: 'assistPopupExposure', status: 0 }, true)
                }, 800)
                deferred.resolve()
            } else {
                addCurPkgIdx()
            }
        }

        function addCurPkgIdx() {
            self.setData({
                curPkgIdx: (self.data.curPkgIdx + 1) % totalItems,
            })
        }
    },
    newCustomerGoHome() {
        const params = 'OrderSource=TRA_GrabBoost_Guide_NewGuest_CreateOrder'
        util.goTrainHome(params)
    },
    async onClickSubscirbeAndtoTrainHome(e) {
        const { fixed } = e.target.dataset
        const { newCustomerRightInfo: { AbValue } = {} } = this.data
        if (fixed) {
            util.ubtTrace('c_trn_c_10320655842', { bizKey: "oldFixedNewcustClick", version: AbValue })
        } else {
            util.ubtTrace('c_trn_c_10320655842', { bizKey: "rewardTakenClick", version: AbValue, scene: this.getBoostedStatus() ? 1 : 2 })
        }
        // b 不订阅
        try {
            if (!fixed) {
                await this.checkNeedSubscribe()
            }
        } catch (error) {
            console.log('未订阅', error)
        }
        this.newCustomerGoHome()
        this.hideBackdrop()
    },
    hideBackDrop() {
        // 兼容lostUserPop组件
        this.hideBackdrop()
    },
    onClickLostUserRuleBtn(e) {
        // 兼容lostUserPop组件
        const { url } = e.currentTarget.dataset
        this.navigateTo({
            url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`,
        })
    },
    hideBackdrop() {
        const showMask = this.data.showMask
        const isGetDouble = this.data.isGetDouble

        if (showMask === 'blind-box-assist-pop') {
            util.ubtTrace('c_trn_c_10320655842', { bizKey: "popupCloseButton", scene: 7 })
        }

        if (showMask === 'lost-user-assist-pop') {
            util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_click',{ PageId: this.pageId, ActivityId: 3})
        }

        if (showMask === 'assistTaskReceived') {
            return
        }

        // 特殊情况处理
        if (this.data.LuckyStarType === 1 && showMask === 'lottery') {
            this.setData({ showMask: '' })
            return
        }
        if (this.data.lottery.isRunning || ['lottery'].indexOf(showMask) > -1) {
            // 抽奖中不允许关闭蒙层，抽奖完成即可关闭
            return
        }
        // todo enhancement 只在分享那几个蒙层出现时重置回调
        if (showMask === 'friend-get' && !isGetDouble) {
            this.getCoupon()
        }
        if (showMask === 'success-pkg' || showMask === 'coupon') {
            this.hideSuccessPkg()

            return
        }
        if (showMask === 'acitivityPop' || (showMask === 'success-pkg' && !this.data.activityConfig)) {
            setTimeout(this.scrollToItem, 200)
        }
        // B实验 关闭获取头像弹窗 仍然助力
        if (showMask == 'getInfoPop') {
            this.openLottery()

            return
        }
        // 待领取新客关闭埋点
        if (showMask == 'newCustmerRightUnPop') {
            util.ubtTrace('c_trn_c_10320655842', { bizKey: "awaitTakePopupClose" })
        }

        this.setData({ showMask: '' })
    },
    hideSuccessPkg(e) {
        const type = e?.currentTarget?.dataset?.type
        if (!this.hasShownSubscribe && type == 'end') {
            this.checkNeedSubscribe()
        }
        if (this.data.showMask == 'combineGifts' && !this.hasShownSubscribe) {
            this.checkNeedSubscribe()
        }

        if (this.data.activityConfig && this.data.showMask) {
            this.setData({ showMask: 'acitivityPop' })
            util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'popup', bizKey: "grabAdExposure", scene: this.data.activityConfig.key })
        } else if (this.data.showMask) {
            this.setData({ showMask: '' })
            setTimeout(this.scrollToItem, 200)
        }

        this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'popup', bizKey: 'assistPopupConfirm' })
    },
    empty() {
        // 保留 click 回调函数做统计
    },
    acceSubmit(e) {
        this.acceFormId = e.detail.formId
    },

    showAllFriendList() {
        this.setData({ showType: 'allFriendList' })
    },

    hideAllFriendList() {
        this.setData({ showType: '' })
    },

    /**
     * [getGrabTicketAward 领取抢票券]
     * @return {[type]} [description]
     */
    getGrabTicketAward() {
        this.getCoupon()
    },

    showGuide() {
        this.setData({ showMask: 'guide' })
        TrainActStore.setAttr('clickCollectedIcon', true)
    },
    hideGuide() {
        this.setData({ showMask: '' })
    },
    showPost() {
        let self = this
        const showPost = () => {
            self.setData({ showMask: 'post' })
        }
        if (self.data.sharePic) {
            showPost()

            return
        }
        util.showLoading()
        const params = {
            ShareKey: this.orderNumber,
            RequestId: this.getOpenId(),
            ReqTime: '' + (
                new Date()).getTime(),
            Partner: 'ctrip',
            FromStation: this.data.DepartureStation,
            ToStation: this.data.ArriveStation,
            PassagePhotoUrl: this.avatarUrl || '',
            channel: shared.channel,
        }
        GetShareImgModel(params, data => {
            util.hideLoading()
            if (data.ImgUrl) {
                this.setData({ sharePic: data.ImgUrl })
                showPost()
            } else {
                util.showModal({ m: '生成图片失败，请稍后再试' })
            }
        }, () => {
            util.hideLoading()
            util.showModal({ m: '生成图片失败，请稍后再试' })
        })
    },
    savePost(e) {
        let that = this
        let picUrl = e.currentTarget.dataset.url || ""

        wx.downloadFile({
            url: picUrl,
            success: function (res) {
                console.log("*********** 下载海报图片 - 成功 ************")
                console.log(res)

                that.setData({ downloadTempPath: res.tempFilePath })
                that.saveSharePic()
            },
            fail: function (e) {
                console.log("*********** 下载海报图片 - 失败 ************")
                console.log(e)

                util.showModal({
                    m: "图片下载失败，错误信息： " + e.errMsg,
                })
            },
        })
    },
    saveSharePic() {
        let that = this

        if (!wx.saveImageToPhotosAlbum || !_.isFunction(wx.saveImageToPhotosAlbum)) {
            wx.showModal({ title: "提示", content: "客户端版本较低，暂不支持保存图片至相册系统，建议截图保存，或升级后重试", showCancel: false, success: function () { } })

            return
        }

        wx.saveImageToPhotosAlbum({
            filePath: that.data.downloadTempPath,
            success: function (sres) {
                console.log("*********** 保存海报图片 - 成功 ************")
                console.log(sres)

                util.showModal({ m: '已保存到相册系统' })
                that.hideBackdrop()
            },
            fail: function (e) {
                console.log("*********** 保存海报图片 - 失败 ************")
                console.log(e)
                that.reopenAuth() //提示用户重新授权相册系统
            },
        })
    },
    reopenAuth() {
        let that = this
        let _irrd = false

        wx.getSetting({
            success(res) {
                _irrd = res.authSetting["scope.writePhotosAlbum"]

                if (_irrd == undefined) {
                    console.log("*************** 相册授权undefined *****************")
                    that.hideBackdrop()
                } else if (_irrd == false) {
                    console.log("*************** 相册未授权 *****************")
                    wx.showModal({
                        title: "提示",
                        content: "相册系统未授权，请重新授权并保存图片",
                        success: function (stRes) {
                            if (stRes.confirm) {
                                wx.openSetting({
                                    success(res) {
                                        if (res.authSetting["scope.writePhotosAlbum"]) {
                                            console.log("*************** 相册重新授权 - 成功 *****************")
                                            that.saveSharePic()
                                        } else {
                                            console.log("*************** 相册重新授权 - 失败 *****************")
                                            that.hideBackdrop()
                                        }
                                    },
                                })
                            } else {
                                that.hideBackdrop()
                            }
                        },
                    })
                } else {
                    console.log("*************** 相册已授权 *****************")
                    that.saveSharePic()
                }
            },
        })
    },
    showShareMenuSubmit(e) {
        saveUserFormID(e.detail.formId)
        this.showShareMenu()
    },
    showShareMenu() {
        this.setData({ showMask: 'share' })
    },
    getCouponList() {
        let params = {
            ProductLineID: 13,
            ChannelName: 'WX',
        }
        let couponList = []
        CouponListModel(params, data => {
            if (data.CouponList && data.CouponList.length) {
                couponList = data.CouponList
                let max = 0
                let couponProfitDesc = ''

                couponList.forEach(item => {
                    max = max > item.DeductionAmount ? max : item.DeductionAmount
                });

                if (+max > 0) {
                    couponProfitDesc = `享${couponList.length > 1 ? '最高立减' : ''}${max}元优惠`
                }

                this.setData({
                    couponCount: couponList.length,
                    couponProfitDesc
                })
            }
        }, () => { }, () => { })
    },
    getNewCouponList(ActivityCode) {
        let params = {
            ActivityCode,
            Channel: 'wx',
            MobilePhone: this.data.userBindedPhoneNumber || '',
        }
        GetActivityCouponInfoModel(params, data => {
            if (data && data.CouponItemList) {
                const { CouponItemList } = data
                let couponList = CouponItemList.filter(item => item.IsSend)
                let couponListWill = CouponItemList.filter(item => !item.IsSend)
                let couponListShow = couponList.slice(0, 4)
                this.setData({
                    couponItemList: CouponItemList,
                    couponList,
                    couponListWill,
                    couponListShow,
                })
            }
        })
    },
    friendHelpEntrance() {
        const params = {
            FromType: 3,
            Ordernumber: this.orderNumber
        }
        FriendHelpEntrance(params, data => {
            if (data.RetCode !== 1 || !data.FriendHelpList || data.FriendHelpList?.length <= 0) {
                return
            }

            const rewardList = data.FriendHelpList[0].RewardList
            const rewardStepCountList = rewardList.map(item => {
                return item.ReceiveRewardFriendCount
            })

            let reshareInfo = data.FriendHelpList?.[0]

            const progressPercent = {
                0: 0,
                1: 0,
                2: 50,
                3: 75,
                4: 100,
            }[data.FriendHelpList[0].HasHelpFriendCount]
            reshareInfo.progressPercent = progressPercent


            if (!this.data.newFeatureFlag && this.data.isAccelerating && this.data.acceState !== 0  && !this.data.IsSelf && this.data.LightningLevel < 5) {
                util.ubtTrace('s_trn_c_trace_10320655842', {
                    bizKey: "doubleShareExposure",
                    exposureType: "normal"
                })

                this.setData({
                    reshareInfo
                })
            }
        })
    },
    getCashBackCouponList(ActivityCode) {
        let params = {
            ActivityCode,
            Channel: 'wx',
            MobilePhone: this.data.userBindedPhoneNumber || '',
        }
        GetActivityCouponInfoModel(params, data => {
            if (data && data.CouponItemList) {
                const { CouponItemList } = data
                let couponList = CouponItemList.filter(item => item.IsSend)
                let couponListWill = CouponItemList.filter(item => !item.IsSend)
                this.setData({
                    couponItemListCashBack: CouponItemList,
                    couponListCashBack: couponList,
                    couponListWillCashBack: couponListWill,
                })
                if (!(this.data.isAccelerating && this.data.acceState == 0) && this.data.couponItemListCashBack[0].IsSend) {
                    this.setData({
                        showMask: 'cashbackGuide',
                    })
                    this.ubtTrace('train_grab_noacccashback', true)
                }
            }
        })
    },
    async receiveAndSubcribe(e) {
        if (!this.hasShownSubscribe) {
            this.checkNeedSubscribe()
        }
        this.recieveNewCoupon(e)
    },
    recieveNewCoupon(e) {
        util.showLoading()
        const SubType = e && e.target ? e.target.dataset['subtype'] : '2'
        const ActivityCode = e && e.target ? e.target.dataset['activitycode'] : '9103c8c82514f39d8360c7430c4ee557'
        let params = {
            SubType,
            ActivityCode,
            Channel: 'wx',
            MobilePhone: this.data.userBindedPhoneNumber || '',
        }
        ActivitySendCouponModel(params, data => {
            this.hideSuccessPkg()
            if (data.RetCode == 1) {
                util.showToast('优惠券领取成功', 'none')
                this.getNewCouponList(ActivityCode.double)
            } else {
                util.showToast('领取失败', 'none')
            }
        }, () => {
            this.hideSuccessPkg()
            util.showToast('领取失败', 'none')
        })
    },
    getOpenId() {
        return this.OpenId || cwx.cwx_mkt.openid
    },
    showAllCoupon() {
        this.setData({
            couponListShow: this.data.couponList,
        })
    },
    /**
     *
     * @param {*} param0
     */
    robTrace({
        code = 0,
        err = '',
    }) {
        const msg = {
            code,
            e: truncString(err),
        }
        this.ubtTrace(101520, msg)
    },
    showAllRecords() {
        this.setData({
            isShowAll: !this.data.isShowAll,
        })
    },
    setTimeout(fn = () => { }, delay = 0) {
        const deferred = util.getDeferred()
        const _fn = () => {
            fn()
            deferred.resolve()
        }
        this.timeoutId = setTimeout(_fn, delay)

        return deferred.promise
    },
    setTimeoutFn(...args) {
        return () => {
            this.setTimeout(...args)
        }
    },
    hideBackdropSubmit(e) {
        saveUserFormID(e.detail.formId)
        this.hideBackdrop()
    },
    doubleSubmit(e) {
        saveUserFormID(e.detail.formId)
    },
    retrySubmit(e) {
        saveUserFormID(e.detail.formId)
        this.getCoupon()
    },
    okSubmit(e) {
        saveUserFormID(e.detail.formId)
        this.setData({ showMask: '' })
        this.scrollToItem()
    },
    shareForAwards() {
        util.shareTrace({ c: 1, msg: 'double success' })
        this.setTimeout(() => {
            this.setData({ isGetDouble: true })
        }, 500)

    },
    getfiveSubmit(e) {
        saveUserFormID(e.detail.formId)
        this.getCoupon()
    },
    scrollToItem() {
        if (!cwx.pageScrollTo || !cwx.createSelectorQuery) {
            return
        }

        let query = wx.createSelectorQuery()
        query.select('#friendList').boundingClientRect()
        query.exec(function (res) {
            //res就是 所有标签为idt的元素的信息 的数组
            //取高度
            if (res[0]) {
                wx.pageScrollTo({
                    scrollTop: res[0].top - 200,
                })
            }
        })
    },
    adClick(e) {
        const { url } = e.currentTarget.dataset
        if (!url) return
        if (url.indexOf('appId') !== -1) { // 外部小程序跳转
            let reg = new RegExp("(^|&)" + "appId" + "=([^&]*)(&|$)", "i")
            let querys = url.match(reg)
            let appId = unescape(querys[2])
            cwx.navigateToMiniProgram({
                appId: appId,
                path: url,
                envVersion: 'release', // develop开发版 trial体验版  release正式版
                success() {
                    // 打开成功
                },
            })
        } else {
            cwx.navigateTo({
                url,
            })
        }
        console.log('---------------- navigateTo', url)
    },
    /**
     * 分享的订单要先调用该接口
     */
    ShareGrab() {
        const params = {
            OrderNumber: this.orderNumber,
            ChangeOrderNumber: this.subOrderId,
        }

        return ShareGrabPromise(params)
    },
    /**
     * 已有用户信息和手机号时直接助力
     */
    async acce() {
        try {
            await this.checkNeedSubscribe()
        } catch (error) {
            console.log('没订阅', error)
        }
        this.openLottery()

        this.ubtTraceAdapter("c_trn_c_10320655842", { bizKey: 'assistClick' }, true)
    },
    getUserInfoAndAcce(e) {
        const userInfo = e.detail.userInfo
        this.setData({ userInfo })
        this.openLottery()

        this.ubtTraceAdapter("c_trn_c_10320655842", { bizKey: 'assistClick' }, true)
    },
    getUserProfileAndAcce() {
        this.ubtTraceAdapter("c_trn_c_10320655842", { bizKey: 'assistClick' }, true)
        wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: res => {
                this.setData({
                    userInfo: res.userInfo,
                })
                TrainActStore.setAttr('USERINFO', {
                    ...res.userInfo,
                    openid: cwx.cwx_mkt.openid,
                })
                this.openLottery()
            },
            fail: (e) => {
                console.error(e)
                this.openLottery()
            },
        })
    },
    // abtest
    getUserPhoneAndAcce(e) {
        let self = this

        this.ctripLogin().then(() => {
            this.checkHasBindMobile().then(this.checkUserInfo).then(this.checkNeedGetUserInfo).catch(this.checkNeedGetUserInfo)
            this.getNewCouponList(ActivityCode.double)
            if (this.data.abtest?.cashbackAbTest == 'B') {
                this.getCashBackCouponList(ActivityCode.cashBack)
            }
            if (this.stuFlag) {
                studentCardMixin.methods.getStudentRightsInfo(1, self = this).then(() => {
                    this.ubtTrace('train_grab_hpstudent', !!this.data.studentCardInfo && !(this.data.isAccelerating && this.data.acceState == 0))
                })
            }
            newcustomerMixin.getNewCustomerRights(self, this.data.userCouponFromType)
                .then(newcustomerMixin.checkCanReceiveNewCustomerRight)
                .then(() => {
                    return newcustomerMixin.receiveNewCustomerRight(this.data.userCouponFromType)
                })
                .then(() => {
                    this.setData({ canReceiveNewUserRights: true })
                    this.ubtTrace('train_grab_hpnewbieent', !!this.data.newCustomerRightInfo && !(this.data.isAccelerating && this.data.acceState == 0))
                }).catch(_ => _)
            this.initSuscribeTicketStatus()
            this.getLuckyStarListInfo().then(() => {
                this.ubtTraceAdapter('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'pageviewExposure_login' }, true)
            })
        }).catch(() => {
            util.hideLoading()
        })

        this.ubtTraceAdapter("c_trn_c_10320655842", { bizKey: 'assistClick' }, true)
    },

    loginAndReceiveRights(e) {
        // 判断是弹窗点击还是固定入口点击
        const { fixed } = e.target.dataset
        const { AbValue, RightList } = this.data.newCustomerRightInfo || {}

        this.setData({
            showMask: '',
            loginBtnClick: true,
        })
        this.ctripLogin().then(() => {
            this.setData({
                isLogin: true,
                hideNewUserSwiper: true
            })
        })

        return
    },
    async checkNeedSubscribe() {
        let {
            hasSubscribedTicket,
            subscribeTicketToggle,
            hasSubscribedRouteNotify,
            hasSubscribedBonus,
            hasSubscribedExpire
        } = this.data


        return new Promise(async (resolve, reject) => {
            if (!subscribeTicketToggle || !shared.isCtripApp) return resolve()
            if (hasSubscribedTicket && hasSubscribedRouteNotify && hasSubscribedBonus && hasSubscribedExpire) return resolve()

            // 订阅方法
            const templist = [
                { id: "_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM", FromType: 2, ActivityCode: 'CtripBuyTicketForBISend', status: hasSubscribedTicket },   //  购票提醒
                { id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY", FromType: 6, ActivityCode: 'DueReminder', status: hasSubscribedExpire },   //  优惠券到期
                // { id: "DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4", FromType: 3, ActivityCode: 'CtripLineStatusAlert', status: hasSubscribedRouteNotify },  //  余量提醒
            ]

            console.log('是否会添加奖励通知', this.data.IsSelf, this.data.abtest.subscribeAb)
            // 奖励通知
            if (!this.data.initAcceState && this.data.abtest.subscribeAb != 'B') {
                templist.push({ id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 10, ActivityCode: 'ReceiveBonus', status: hasSubscribedBonus })
            }
            // 非本人订单且 ab 可以订阅
            if (this.data.initAcceState && !this.data.IsSelf) {
                templist.push({ id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 6, ActivityCode: 'ReceiveBonus', status: hasSubscribedBonus })
            }
            const temArr = templist.map(item => item.id)
            await this.handleSubIds(temArr,templist)
            subscribeMixin.requestSubscribe(templist, { OpenID: this.getOpenId(), OrderNumber: this.orderNumber })
                .then(({ subIds, errMsg }) => {
                    // 出现一次订阅就不再显示
                    this.hasShownSubscribe = true
                    this.setData({subscribeGuideFlag: false})
                    if (errMsg) {
                        util.ubtTrace('c_trn_c_10320655842', { bizKey: "subscribeClick", result: 0, templateid: [] })
                        return reject()
                    }

                    if (subIds.includes('_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM')) {
                        this.setData({ isShowSubsribeTemp: false })
                    }

                    util.showToast('订阅成功', 'none')
                    util.ubtTrace('c_trn_c_10320655842', { bizKey: "subscribeClick", result: 1, templateid: subIds })

                    // 更新订阅状态
                    this.initSuscribeTicketStatus()

                    resolve()
                })
                .catch(e => {
                    this.setData({subscribeGuideFlag: false})
                    reject()
                })
        })
    },
    /**
     * [checkNeedGetUserInfo 校验是否需要用户信息]
     * @return {[type]} [description]
     */
    checkNeedGetUserInfo() {
        // if (!this.data.userInfo.nickName && !this.data.userInfo.avatarUrl) {
        //     // 获取头像信息弹窗
        //     this.setData({
        //         showMask: 'getInfoPop',
        //     })
        // } else {
        //     this.openLottery()
        // }

        this.openLottery()
    },

    async onClickSubscribeTicket() {
        const templist = [
            { id: "_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM", FromType: 2, ActivityCode: 'CtripBuyTicketForBISend' }
        ]

        const statusList = await subscribeMixin.checkSubscribeStatus(templist)
        await this.handleSubIds(['_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM'],statusList)
        subscribeMixin.requestSubscribe(statusList, { OpenID: this.getOpenId() })
            .then(({ errMsg }) => {
                this.setData({subscribeGuideFlag: false})
                if (errMsg) {
                    this.ubtDevTrace('subscribeerr', errMsg)
                    return
                }

                this.setData({ isShowSubsribeTemp: false })
                // util.showToast('订阅成功', 'none')
            })
            .catch(e => {
                this.setData({ subscribeGuideFlag: false })
                util.showToast('订阅失败，请稍后重试', 'none')
            })
    },
    getSuperMemberInfo() {
        const deferred = util.getDeferred()
        CheckIsOpenSuperMemberModel({}, data => {
            this.setData({ isSuperVip: data.IsSupermember && !this.data.newFeatureFlag })
        }, err => {
            this.robTrace({ code: robErrorCode.checkVipError, err })
        }, () => {
            deferred.resolve()
        })

        return deferred.promise
    },
    // 收藏入口
    getCollectConfig() {
        return setConfigSwitchAsyncPromise('train_wx_collect_toggle')
            .then(([res]) => {
                this.setData({
                    collectFlag: res,
                })
            })
    },
    getThemeConfig() {
        return getConfigInfoJSON('train_wx_robshare_theme_20190620')
            .then(config => {
                if (config.open) {
                    let {
                        beginTime,
                        endTime,
                    } = config
                    const curTs = +new Date()
                    if ((+new Date(beginTime)) < curTs && curTs < (+new Date(endTime))) {
                        this.setData({
                            themeConfig: {
                                open: config.open,
                                topSrc: config.topSrc,
                                popHdSrc: config.popHdSrc,
                                btnStyle: config.btnStyle || "background-image:url(https://pic.c-ctrip.com/train/wechat/robshare/2019chunyun/btn-big.png);box-shadow: 0 12rpx 24rpx rgba(246,59,46,.2)",
                            },
                        })
                        util.setNavigationBarColor({
                            backgroundColor: config.navColor,
                            frontColor: config.frontColor,
                        })
                    }
                }
            })
            .catch(() => { })
    },
    getThemeOldConfig() {
        return getConfigInfoJSON('train_wx_robshare_theme_20191226')
            .then(config => {
                const curTs = +new Date()
                let themeConfig = config.find(item => (+new Date(item.beginTime)) < curTs && curTs < (+new Date(item.endTime)))
                if (themeConfig) {
                    this.setData({
                        themeConfig,
                    })
                    util.setNavigationBarColor({
                        frontColor: themeConfig.frontColor || '#ffffff',
                        backgroundColor: themeConfig.navColor,
                    })
                }
            })
            .catch(() => { })
    },
    getThemeNewConfig() {
        return getConfigInfoJSON('train_wx_robshare_theme_new_20191226')
            .then(config => {
                const curTs = +new Date()
                let themeConfig = config.find(item => (+new Date(item.beginTime)) < curTs && curTs < (+new Date(item.endTime)))
                if (themeConfig) {
                    this.setData({
                        themeConfig: {
                            open: !!themeConfig.open,
                            topSrc: themeConfig.topSrc || 'https://pic.c-ctrip.com/train/wechat/robshare/top-bg-jiasu.png',
                            popHdSrc: themeConfig.popHdSrc || 'http://pic.c-ctrip.com/train/wechat/robshare/pop-jiasu-box.png',
                            marqueeSrc: themeConfig.marqueeSrc || "http://pic.c-ctrip.com/train/wechat/robshare/2019chunyun/pop-jiasu-choujiang.png",
                            itemSrc: themeConfig.itemSrc || "http://pic.c-ctrip.com/train/wechat/robshare/2019chunyun/pop-jiasu-choujiang-default.png",
                            fontColor: themeConfig.fontColor || "#FFEB9D",
                            couponColor: themeConfig.couponColor || "#FFEB9D",
                            btnSrc: themeConfig.btnSrc || "http://pic.c-ctrip.com/train/wechat/robshare/pop-jiasu-btn.png",
                            tagSrc: themeConfig.tagSrc || "http://pic.c-ctrip.com/train/wechat/robshare/pop-coupon-new.png",
                            btnStyle: themeConfig.btnStyle || "background-image:url(http://pic.c-ctrip.com/train/wechat/robshare/btn-go-default.png);",
                        },
                    })
                    util.setNavigationBarColor({
                        frontColor: themeConfig.frontColor || '#ffffff',
                        backgroundColor: themeConfig.navColor,
                    })
                }
            })
            .catch(() => { })
    },
    // 旧版轮播图
    getBannerItemList() {
        const param = {
            ConfigKey: 'train_wx_robshare_bannerlist_new',
        }
        ConfigInfoPromise(param)
            .then(data => {
                const arr = JSON.parse(data.ConfigInfo.Content);
                this.setData({
                    bannerItemList: arr
                })
            })
            .catch(err => {
                console.log(err)
            })
    },
    getReshareRuleList() {
        const param = {
            ConfigKey: 'ctrip-robshare-reshare',
        }
        ConfigInfoPromise(param)
            .then(data => {
                const config = JSON.parse(data.ConfigInfo.Content);
                this.setData({
                    reshareRuleList: config.ruleList
                })

            })
            .catch(err => {
                console.log(err)
            })
    },
    getArrivedStationAndCity() {
        try {
            const stationArr = [this.data.ArriveStation]
            let CityArr = [];

            this.setData({
                arrivedStations: [...stationArr]
            })
            TrainStationModel(
                {},
                data => {
                    if (data.TrainStationsInfo) {
                        let rawData = data.TrainStationsInfo
                        stationArr.forEach(item => {
                            rawData.forEach(train => {
                                if (train.StationName == item) {
                                    CityArr.push(train.CityName)
                                }
                            }
                            )
                        })
                    }
                    this.setData({
                        arrivedCitys: [...CityArr]
                    })
                },
            )
        } catch (error) {
            console.log('报错信息', error)
        }
    },
    noop() {
      util.ubtTrace('c_trn_c_10320655842', {
        bizKey: "haveAssistedPopupClick",
        exposureType: "normal",
      })
    },
    toDetailPage(e) {
        const { url } = e.currentTarget.dataset
        util.jumpToUrl(url)
    },
    // ************//
    getBottomBannerConfig() {
        const param = {
            ConfigKey: 'train_wx_robshare_banner_bot',
        }

        return ConfigInfoPromise(param).then(data => {
            this.setData({
                bottomBannerHandle: JSON.parse(data.ConfigInfo.Content).open,
                bottomBannerImg: JSON.parse(data.ConfigInfo.Content).botBannerImg,
                bottomBannerUrl: JSON.parse(data.ConfigInfo.Content).url,
            })
        }).catch(err => {
            console.log(err)
        })
    },

    toBottomBanner() {
        if (this.data.bottomBannerUrl) {
            cwx.navigateTo({
                url: this.data.bottomBannerUrl,
            })
        } else {
            this.getBottomBannerConfig().then(() => {
                cwx.navigateTo({
                    url: this.data.bottomBannerUrl,
                })
            })
        }
    },

    /**
     * [checkHasBindMobile 获取当前登录账户绑定手机号信息]
     * @return {[type]} [description]
     */
    checkHasBindMobile() {
        if (!this.data.isLogin) return

        return getUserBindedPhoneNumber().then((res) => {
            if (res) {
                this.setData({
                    userBindedPhoneNumber: res,
                })
            }
        }).catch(e => {
            console.log(e)
        })
    },

    /**
     * [checkUserInfo 获取当前用户头像昵称]
     * @return {[type]} [description]
     */
    checkUserInfo() {
        // 必须是在用户已经授权的情况下调用
        const deferred = util.getDeferred()
        let userInfo = TrainActStore.getAttr('USERINFO')
        if (userInfo && userInfo.openid == cwx.cwx_mkt.openid) {
            this.setData({
                userInfo,
            })
        }
        deferred.resolve()

        return deferred.promise
    },
    hideSubscribeTemp() {
        this.setData({
            isShowSubsribeTemp: false,
        })
    },
    activityBtnHandler() {
        util.ubtTrace('c_trn_c_10320655842', { bizKey: "grabAdClick", scene: this.data.activityConfig.key })
        const {
            activityConfig: {
                url,
            },
        } = this.data
        cwx.navigateTo({
            url: this.data.showGrabfestival && this.data.grabfestivalFlag ? '/pages/train/grabfestival/index' : url,
        })
        this.hideBackdrop()
    },
    getActivityConfig() {
        return getConfigInfoJSON('c_train_wx_robshare_activitypop_0420')
            .then(data => {
                let now = +new Date
                let activityConfig = data.activityConfig.find(item => {
                    let beginTime = new Date(item.beginTime)
                    let endTime = new Date(item.endTime)
                    if (+beginTime < now && now < +endTime) {
                        return true
                    }
                })
                this.setData({
                    activityConfig,
                })
            }).catch(e => {
                console.log(e)
            })
    },
    getRobDescConfig() {
        return getConfigInfoJSON('train_wx_robshare_robdescconfig')
            .then(res => {
                this.setData({ robDescList: res })
            })
    },
    getTrainWxShareConfig(){
        getConfigInfoJSON('train_wx_share_config')
            .then(res => {
                this.setData({ hideShareFlag: res.hideShareFlag, hideShareInRobshare: res.hideShareInRobshare || 0 })
                if ((res.hideShareInRobshare || 0) === 0) {
                    cwx.showShareMenu && cwx.showShareMenu({ withShareTicket: true })
                } else {
                    cwx.hideShareMenu()
                }
            })
    },
    getRuleConfig() {
        // getConfigInfoJSON('train_wx_robshare_ruleconfig')
        //     .then(res => {
        //         this.setData({ ruleList: res })
        //     })
        getConfigInfoJSON('train_wx_robshare_newruleconfig')
            .then(res => {
                this.setData({ newruleList: res })
            })

        getConfigInfoJSON('train_wx_robshare_ruleconfigs')
            .then(res => {
                if (this.data.speedTaskAbVersion === 'B') {
                    this.setData({ ruleList: res?.ruleListPerson })
                } else {
                    this.setData({ ruleList: res?.ruleList })
                }
            })
    },
    goBu(e) {
        util.ubtTrace('c_trn_c_10320655842', {
            "bizKey": "iconClick",
            "type": e.currentTarget.dataset.buName
        })

        buMapMixin.methods.goBu(e.currentTarget.dataset.url || e.currentTarget.dataset.JumpUrl)
    },
    saveAndShowPost() {
        if (this.data.hideShareFlag !== 1) {
          this.shareTriggered = new Date() // 不用setTimeout，防止分享唤起好友列表后可能存在的未知bug
          return
        }

        if (this.data.hideShareFlag === 1) {
            util.ubtTrace('c_trn_c_10320655842', {
                "bizKey": "doubleSharePic",
            })
        }

        this.getRobShareImg()
            .then(this.saveImageToAlbumHandle)
    },
    getRobShareImg() {
        util.showLoading()
        // let { astation, dstation} = this.data
        let params = {
            ShareKey: this.orderNumber,
            FromStation: this.data.DepartureStation,
            ToStation: this.data.ArriveStation,
            PassagePhotoUrl: '',
            ChangeOrderNumber: this.subOrderId,
            PathSuffix: "&source=shareImg"
        }

        return GetShareImgPromise(params)
            .then(res => {
                this.setData({
                    robSharePic: res.ImgUrl,
                })
            })
            .catch(() => {
                throw util.showToast('生成图片失败', 'none')
            })
    },
    saveImageToAlbumHandle() {
        let self = this

        util.hideLoading()
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            // 保存图片
                            self.downloadFile().then(self.doSaveImageToAlbum)
                        },
                        fail() {
                            util.showToast('请点击右上角设置进行相册授权')
                            self.setData({
                                hasRejectAlbum: true,
                            })
                        },
                    })
                } else {
                    // 用户之前同意了授权
                    self.downloadFile().then(self.doSaveImageToAlbum)
                }
            },
            fail(res) {
                util.showToast('授权失败', 'none')
                console.log(res)
            },
        })
    },
    downloadFile () {
        let self = this

        return new Promise((resolve, reject) => {
            wx.downloadFile({
                url: self.data.robSharePic,
                success(res) {
                    // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                    if (res.statusCode === 200) {
                        if (res.tempFilePath) {
                            self.setData({tempFilePath: res.tempFilePath})
                            resolve()
                        } else {
                            reject(res)
                        }
                    }
                },
                fail(res) {
                    util.showToast(res.errMsg || '下载失败', 'none')
                },
            })
        })
    },
    // 授权后 保存网络图片到系统相册
    doSaveImageToAlbum() {
        let self = this
        wx.saveImageToPhotosAlbum({
            filePath: self.data.tempFilePath,
            success() {
                self.setData({
                    showMask: 'showShareImage',
                })

            },
            fail(res) {
                self.setData({
                    showMask: 'showShareImageWithoutSave',
                })
                // console.log(res)
                // util.showToast('保存失败', 'none')
            },
        })
    },
    hideShareImage() { // 隐藏背景图片
        this.setData({
            showMask: '',
        })
    },
    getBuList() {
        buMapMixin.methods.getBuList('train_wx_robshare_bulist').then(data => {
            if (data && data.open) {
                data.buList?.forEach(item => {
                    util.ubtTrace('s_trn_c_trace_10320655842', {
                        "exposureType": "normal",
                        "bizKey": "iconExp",
                        "type": item.buName
                    })
                });

                this.setData({
                    buList: data.buList,
                })
            }
        })
    },
    goCHome() {
        buMapMixin.methods.goCHome('allianceid=30613&sid=1941252')
    },
    getHBUrlConfig() {
        getConfigInfoJSON('train_wx_ronshare_hbintro')
            .then(res => {
                this.setData({ ruleUrl: res.url || 'https://pages.ctrip.com/ztrip/document/pyy-hbp.html?autoawaken=close&popup=close&__ares_maxage=3m&from=banner' })
            }).catch(e => console.log(e))
    },
    showHBIntro() {
        this.navigateTo({
            url: `../webview/webview`,
            data: {
                url: this.data.ruleUrl,
            },
        })
    },
    copyText(e) {
        const {
            text,
        } = e.target.dataset
        util.copyText(text, '已复制好友昵称到剪贴板')

        if (this.data.hideShareFlag === 1) {
          return this.saveAndShowPost()
        }

        this.shareTriggered = new Date()
    },
    getLuckyStarListInfo() {
        const params = {
            OrderNumber: this.orderNumber,
        }
        return util.promisifyModel(GetLuckyStarListInfoModel)(params)
            .then(res => {
                if (res.RetCode == 1) {
                    const {
                        LuckyStarList,
                    } = res
                    // 将数组分为m个只包含四个元素的数组 用作分屏展示
                    if (LuckyStarList && LuckyStarList.length) {
                        const currentUser = LuckyStarList.find(v => v.UserType === 1)
                        let arr = []
                        for (let i = 0; i < LuckyStarList.length; i += 4) {
                            arr.push(LuckyStarList.slice(i, i + 4))
                        }
                        this.setData({
                            LuckyStarList,
                            multidimensionalLuckyList: arr,
                            LuckyStarType: currentUser && currentUser.LuckyStarType || 0,
                            IsLuckyStar: !!currentUser
                        })
                        if (this.data.acceState !== 0 && this.data.isAccelerating) {
                            this.ubtTrace('c_trainwx_acc_invitefx_show', true)
                        }
                    }
                } else {
                    // util.showToast('获取福星列表信息失败', 'none')
                }
            })
    },
    // 获取当前用户是否已助力状态
    getBoostedStatus() {
        const list = cwx.getStorageSync('hasBoostedOrders')
        const keyName = `${this.orderNumber}_${this.getOpenId()}`

        return list && list[keyName]
    },
    setBoostedStatus() {
        const keyName = `${this.orderNumber}_${this.getOpenId()}`
        const list = cwx.getStorageSync('hasBoostedOrders')
        if (list) {
            const tempBoostedOrders = { ...list, [keyName]: true }
            cwx.setStorageSync('hasBoostedOrders', tempBoostedOrders)
        } else {
            cwx.setStorageSync('hasBoostedOrders', { [keyName]: true })
        }
    },
    // 任意行业务 需要判断该用户是否已助力该单
    // async getAnyGoInfo() {
    //     // 是否是本人
    //     if (!this.getBoostedStatus()) return

    //     const params = {
    //         Channel: "ctripwx",
    //         OrderNumber: this.orderNumber
    //     }
    //     GetFriendsHelpTaskListModel(params, data => {
    //         const { RetCode, FriendsHelpTaskList = [] } = data
    //         const anyGoInfo = FriendsHelpTaskList.find(({ TaskType }) => TaskType === 1) || {}

    //         if (RetCode === 1) {
    //             this.setData({ anyGoInfo })
    //             this.boostCountDown()   //  开始倒计时
    //         }
    //     }, err => console.log('GetFriendsHelpTaskListModel 接口请求失败'))
    // },
    // onClickGetBoostBtn() {
    //     this.ubtTrace('o_tra_wx_helpsuccess_ryxbanner_click', true)
    //     // 跳转 h5
    //     const robShareUrl = `https://m.ctrip.com/webapp/train/activity/ctrip-train-travelcard?Source=assistancePage&OrderNumber=${this.orderNumber}&BoostCount=${this.data.anyGoInfo.BoostPackageCount}`
    //     this.navigateTo({
    //         url: "/pages/train/webview/webview",
    //         data: {
    //             url: decodeURIComponent(robShareUrl),
    //             needLogin: true
    //         }
    //     })
    // },
    // showRuleCard() {
    //     this.setData({ isRuleCardShow: true })
    // },
    // hideRuleCard() {
    //     this.setData({ isRuleCardShow: false })
    // },
    // async boostCountDown() {
    //     while (true) {
    //         const nowTime = Date.now()
    //         const endTime = new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000
    //         const diffTime = endTime - nowTime
    //         const h = util.fillZeroTime(parseInt(diffTime / 3600000))
    //         const m = util.fillZeroTime(parseInt(diffTime / 60000) - h * 60)
    //         const s = util.fillZeroTime(parseInt(diffTime / 1000) - h * 3600 - m * 60)
    //         const CountDownTime = `${h}:${m}:${s}`

    //         this.setData({ anyGoInfo: { ...this.data.anyGoInfo, CountDownTime } })

    //         await this.setTimeout(() => { }, 1000)
    //     }
    // },
    // 立减券包模块
    getReduceCouponInfo() {
        if (!this.getBoostedStatus()) return

        return util.promisifyModel(ProductSaleRecommendModal)({ FromType: 3 })
            .then(({ ProductList }) => {
                const info = ProductList.find(v => v.ProductType == 5)

                this.setData({ reduceCoupon: info })
                info?.Status == 0 && util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'couponSaleEntranceExposure' })
            })
    },
    toReduceCouponPage() {
        util.ubtTrace('c_trn_c_10320655842', { bizKey: 'couponSaleEntranceClick' })
        this.navigateTo({
            url: '/pages/train/webview/webview',
            data: {
                url: decodeURIComponent(`${this.data.reduceCoupon.JumpUrl}&oid=${this.orderNumber}`),
                needLogin: true,
            },
            confirm() {
                this.getReduceCouponInfo()
            }
        })
    },
    // 跳转召回礼包
    toRecallPage() {
        const url = 'https://m.ctrip.com/webapp/train/activity/20210707-ctrip-callback-gift/'
        const popupStatus = [1, 2].includes(this.data.acceState) ? 1 : 0

        this.navigateTo({
            url: '/pages/train/webview/webview',
            data: {
                url: decodeURIComponent(url),
                needLogin: true,
            },
            callback: () => {
                if (!this.data.IsReceiveGiftPack) {
                    this.RecallPackageDetail()
                }
            }
        })

        this.ubtTraceAdapter('c_trn_c_10320655842', { bizKey: "assistRewardClick", popupStatus, clickStatus: this.data.IsReceiveGiftPack ? 1 : 0 })
    },
    // 召回礼包领取状态
    RecallPackageDetail() {
        return util.promisifyModel(RecallPackageDetailModel)({})
            .then(({ IsReceiveGiftPack }) => {
                this.setData({ IsReceiveGiftPack })
            })
    },
    // 福星 2 号的埋点
    ubtTraceAdapter(key, payload, isUserType = false) {
        // 0 福星1号 1 福星2号 2 超级会员 3 其他
        let userType = 3

        if (this.data.IsLuckyStar && this.data.LuckyStarType === 0) {
            userType = 0
        } else if (this.data.IsLuckyStar && this.data.LuckyStarType === 1) {
            userType = 1
        } else if (this.data.isSuperVip) {
            userType = 2
        }
        if (payload.bizKey === 'assistPopupConfirm') {
            util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_click',{ PageId: this.pageId, ActivityId: 4})
        }
        payload = isUserType ? { ...payload, userType } : payload

        return util.ubtTrace(key, payload)
    },
    // 是否关注公众号
    getTrainWXUserState() {
        if (!cwx.user.isLogin()) return;
        const params = {
            UnionId: cwx.cwx_mkt.unionid,
            PublicAccountId: 'wxceb61b5cfae46a8c'
        }
        getFollowPublicAccountInfoModel(params, res => {
            if (res.RetCode === 1) {
                this.setData({
                    isShowFollowAccount: !res.IsFollow
                })
                this.data.isShowFollowAccount && util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: 'publicAccountCoupon', exposureType: 'normal' })
            }
        })
    },
    tapToFollowAcconut() {
        cwx.navigateTo({
            url: `/pages/train/authorise/web/web?data={"url":"https%3A%2F%2Fm.ctrip.com%2Fwebapp%2Ftrain%2Factivity%2Fctrip-official-account-event%2F%3Fsource%3Dmini-robshare-banner"}`
        })
        util.ubtTrace('c_trn_c_10320655842', { bizKey: 'publicAccountCouponClick' })
        util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: 'publicAccountCouponQR', exposureType: 'normal' })
    },
    // 更多助力任务组件回调
    getMoreAssistTaskList(e){
      const { taskList } = e.detail

      this.setData({
        assistTaskList: taskList
      })

      console.log('moreTaskDetail', taskList)
      if(!taskList.length){
        this.setData({
          moreAssistTaskNotShow: true,
        })
      }
      this.setData({
        moreAssistTaskInitComplete: true,
      })
    },
    userAcceptMoreAssistTaskPrize(e){
      this.getSuperMemberInfo()
      this.getBannerItemList()
      this.getTrainWXUserState()
      this.getBuList()
      this.getAcceList()
    },
    getTaskAwardData(e){
      const { taskAwardData } = e.detail
      console.log(taskAwardData.receivedCount) // 已领数量
      console.log(taskAwardData.totalCount) // 总数
      console.log(taskAwardData.remaindCount) // 剩余数量
    },
    friendHelpTest() {
        this.friendHelp(3)
    },
    async friendHelp(Type) {
        // Type =3
        const params = {
            NickName: this.data.userInfo ? this.data.userInfo.nickName : '',
            PhotoUrl: this.data.userInfo ? this.data.userInfo.avatarUrl : '',
            OrderNumber: this.orderNumber,
            Type,
        }

        if (Type === 3) {
            params.ShareUserShareKey = this.shareUserShareKey
            params.ShareKey = this.shareKey
        }

        const res = await util.promisifyModel(FriendHelp)(params)

        if (res.RetCode !== 1 && res.RetCode !== -2) {
            util.showToast(res.Toast || '网络开小差，请稍后再试', 'none')
            return Promise.reject()
        }

        return Promise.resolve()
    },
    onClickGoToTaskPage() {
        const jumpUrl = this.data.taskRwardInfo.JumpUrl
        cwx.navigateTo({
            url: jumpUrl[0] === '/' ? jumpUrl : '/' + jumpUrl
        })

        this.setData({
            showMask: "assistTaskReceived"
        })
    },
    onClickClearTaskBtn() {
        this.setData({
            showMask: 'assistTaskSucceed'
        })
    },
    onClickHideTaskPop() {
        this.setData({
            showMask: ''
        })
    },
    // async getCurrentCityId() {
    //     return new Promise((resolve, reject) => {
    //         cwx.getLocation({
    //             type: 'wgs84',
    //             success: function (res) {
    //                 const params = {
    //                     Latitude: res.latitude,
    //                     Longitude: res.longitude,
    //                     Language: "CN",
    //                 }
    //                 LBSModel(params, data => {
    //                     resolve(data.DistrictId)
    //                 }, (e) => {
    //                     resolve()
    //                 })
    //             },
    //             fail: function (e) {
    //                 resolve()
    //             }
    //         })
    //     })
    // },
    // 新客礼包 ab 的跳转新客落地页
    goNewCustomerPage(e) {
        const { fixed } = e.target.dataset
        const { JumpUrl, AbValue } = this.data.newCustomerRightInfo || {}

        let scene
        if (fixed) {
            if (this.data.initAcceState) {
                scene = 4
            } else {
                scene = 1
            }
            util.ubtTrace('c_trn_c_10320655842', { bizKey: "newFixedNewcustClick", version: AbValue })
        } else {
            if (this.getBoostedStatus()) {
                scene = 2
            } else {
                scene = 3
            }
            util.ubtTrace('c_trn_c_10320655842', { bizKey: "awaitNewGiftPopupClick", version: AbValue, scene: this.getBoostedStatus() ? 2 : 1 })
        }

        this.navigateTo({ url: `${JumpUrl}?scene=${scene}` })
        this.hideBackdrop()
    },
    async onClickLoginAndReceive() {
        util.ubtTrace('c_trn_c_10320655842', { bizKey: "rewardTakenClick", version: 'b', scene: this.getBoostedStatus() ? 1 : 2 })

        const receiveHandler = async () => {
            let isNewUser = false
            try {
                await newcustomerMixin.trainGetNewGuestInfo()
                isNewUser = true
            } catch { }

            if (!isNewUser) {
                util.showToast('抱歉，仅限火车票新用户领取', 'none')
                this.setData({
                    showMask: ''
                })

                return
            }

            await newcustomerMixin.getNewCustomerRights(this, this.data.userCouponFromType)
            if (isNewUser) {
                await newcustomerMixin.getUserNewCustomerRight(this, this.data.userCouponFromType)
                util.showLoading()

                if (this.data.newCustomerRightInfo.IsHaveRights && this.data.newCustomerRightInfo.RightList.length) {
                    util.hideLoading()

                    if (this.data.newCustomerRightInfo.RightType === 1) {
                        this.setData({
                            showMask: 'newGuestRightPop',
                            canReceiveNewUserRights: false
                        })
                    } else {
                        this.setData({
                            showMask: ''
                        })
                        util.showToast("对不起，暂无领取资格", "none")
                    }
                    return
                }

                return newcustomerMixin.checkCanReceiveNewCustomerRight()
                    .then(() => newcustomerMixin.getNewCustomerRights(this, this.data.userCouponFromType))
                    .then(() => {
                        return newcustomerMixin.receiveNewCustomerRight(this.data.userCouponFromType, rightType, { OpenId: cwx.cwx_mkt.openid || '', })
                    })
                    .then(() => {
                        if (this.data.newCustomerRightInfo.RightList.length) {
                            util.hideLoading()
                            util.showToast('恭喜你，领取成功', 'none')
                            this.setData({
                                showMask: 'newGuestRightPop',
                                canReceiveNewUserRights: false
                            })

                        }
                    })
                    .catch(() => {
                        util.hideLoading()
                        util.showToast('抱歉，仅限火车票新用户领取', 'none')
                        this.setData({
                            showMask: ''
                        })

                    })
            } else {
                util.hideLoading()
                util.showToast('抱歉，仅限火车票新用户领取', 'none')
                this.setData({
                    showMask: ''
                })
            }
        }

        if (cwx.user.isLogin()) {
            receiveHandler()
        } else {
            this.ctripLogin().then(() => {
                receiveHandler()
            }).catch(() => {
                util.hideLoading()
            })
        }
    },
    async onClickGoToBuyTicket() {
        this.setData({
            loginBtnClick: false
        })

        const tempList = [
            { id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 18, ActivityCode: 'newGuestBuyTicket'},
            { id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY", FromType: 18, ActivityCode: 'newGuestBuyTicket'},
        ]
        await this.handleSubIds(['VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q','F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY'], tempList)
        subscribeMixin.requestSubscribe(tempList, { OpenID: cwx.cwx_mkt?.openid || '' })
            .then(_ => {
                this.setData({subscribeGuideFlag: false})
                this.hideBackdrop()
                cwx.navigateTo({
                    url: '/pages/train/index/index',
                })
            }).catch(e => this.setData({subscribeGuideFlag: false}))
    },
    onClickGoToNewGuestActivity(e) {
        const { jumpurl } = e.currentTarget.dataset
        this.navigateTo({
            url: jumpurl,
        })
    },
    ctripLogin() {
        return new Promise((resolve, reject) => {
            cwx.user.login({
                callback(res) {
                    if (res.ReturnCode == 0) {
                        TrainBookStore.setAttr('auth', cwx.user.auth)
                        getUserBindedPhoneNumber().then(num => {
                            if (num) {
                                this.userBindedMobile = num
                                this.setData({ mobile: num })
                            }
                        })

                        this.setData({
                            isLogin: true,
                        })

                        resolve()
                    } else {
                        reject()
                    }
                },
            })
        })
    },
    checkPopHasShow(showType, autoShow = true) {
        // 对应订单一天弹一次
        if (showType === 'newGuestRightUpPop') {
            const lastViewDate = TrainActStore.getAttr('ROBSHARELASTVIEWDATE') || ''
            const nowDate = new cDate().format('Y-m-d')

            if (nowDate !== lastViewDate) {
                TrainActStore.setAttr(showType.toUpperCase(), null)
                TrainActStore.setAttr('ROBSHARELASTVIEWDATE', nowDate)
            }
        }

        // 弹过的弹窗不再弹
        if (TrainActStore.getAttr(showType.toUpperCase()) && TrainActStore.getAttr(showType.toUpperCase()).oids.includes(this.orderNumber)) {

            return true
        }

        if (autoShow) {
            this.setData({ showMask: showType })
        }

        this.setStorageOids(showType.toUpperCase())
        return false
    },
    setStorageOids(key) {
        let oids = TrainActStore.getAttr(key) ? TrainActStore.getAttr(key).oids : []
        oids.push(this.orderNumber)

        oids = Array.from(new Set(oids))
        TrainActStore.setAttr(key, { oids })
    },
    async onClickReshare(e) {
        if (this.data.hideShareFlag === 1) {
            this.saveAndShowPost()
            return
        }

        this.shareTriggered = new Date()

        // 邀请好友为TA助力
        const templist = [
            { id: "BsQ-j76DZe4wkyVw-3qnZ-U2qwGCH9ugw-xyuBIwbXs", FromType: 17, ActivityCode: 'SecondShareUser' },
            { id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 17, ActivityCode: 'SecondShareUser' },
            { id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY", FromType: 17, ActivityCode: 'SecondShareUser' }
        ]

        let subResult
        if (this.data.reshareInfo && this.data.reshareInfo.HasHelpFriendCount <= this.data.reshareInfo.NeedHelpFriendCount) {
            // 订单纬度订阅成功后不再展示 后端优化后去除限制
            if (!TrainActStore.getAttr('reshare-has-subscribe')
                || !TrainActStore.getAttr('reshare-has-subscribe')?.oids?.includes(this.orderNumber)
                || TrainActStore.getAttr('reshare-has-subscribe')?.openId !== this.getOpenId()) {
                const ids = ['BsQ-j76DZe4wkyVw-3qnZ-U2qwGCH9ugw-xyuBIwbXs','VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q','F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY']
                await this.handleSubIds(ids, templist)
                subscribeMixin.requestSubscribe(templist, { OpenID: this.getOpenId(), OrderNumber: this.orderNumber })
                    .then(({ errMsg }) => {
                        this.setData({subscribeGuideFlag: false})
                        if (errMsg) {
                            subResult = 2
                            util.showToast('订阅失败，请稍后重试', 'none')
                            return
                        }

                        subResult = 1
                        util.showToast('订阅成功', 'none')

                        let oids = TrainActStore.getAttr('reshare-has-subscribe') ? TrainActStore.getAttr('reshare-has-subscribe').oids : []
                        oids.push(this.orderNumber)

                        oids = Array.from(new Set(oids))
                        TrainActStore.setAttr('reshare-has-subscribe', { oids, openId: this.getOpenId() })
                    })
                    .catch(e => {
                        this.setData({subscribeGuideFlag: false})
                        subResult = 2
                        util.showToast('订阅失败，请稍后重试', 'none')
                    })
            }
        }

        if (e.target?.dataset?.ubtKey === 'inviteFriendAssistClick') {
            util.ubtTrace('c_trn_c_10320655842', {
                bizKey: "inviteFriendAssistClick",
                exposureType: "normal",
                subResult
            })
        }
    },
    onClickReshareRuleBtn() {
        this.setData({
            showMask: "reshareRule"
        })
    },
    setTaskNavigateCountDown(jumpUrl) {
        let countDown = 3
        this.setData({
            taskCountDownText: `${countDown}秒后自动跳转`
        })
        const assistTaskInterval = setInterval(() => {
            if (countDown === 0) {
                clearInterval(this.data.assistTaskInterval)
                this.setData({
                    assistTaskInterval: null
                })

                cwx.navigateTo({
                    url: jumpUrl[0] === '/' ? jumpUrl : '/' + jumpUrl
                })

                this.setData({
                    showMask: ""
                })
            } else {
                countDown--
                this.setData({
                    taskCountDownText: `${countDown}秒后自动跳转`
                })
            }
        }, 1000);

        this.setData({
            assistTaskInterval
        })
    },
    // 获取预售期
    async getPreSaleDays() {
        const res = await getConfigInfoJSON('sale-day-12306')
        this.setData({ preSaleData: res })
    },

    async handleSubIds(temArr,statusList,fromOneTab){
        const needSubList = statusList.filter((v) => !v.status);
        if(needSubList.length > 0) {
            const subIds = await subscribeMixin.getNotLongSubIds(temArr)
            const showIds = needSubList.filter(item => subIds.includes(item.id))
            if(showIds.length > 0) {
                if(fromOneTab) {
                    this.setData({showOneTagToOpen: true})
                    return
                }
                const video = tempVideoArr.find(item => item.id === showIds[0].id)?.videoSrc
                this.setData({subscribeGuideFlag: true, subVideoSource: video})
            }
        }
    },
    async getQconfig() {
        const payload = {
            keys: ['jiasu-marketing-banner','wechat-mini-task-components-rule']
        }

        const { resultCode, resultMessage, configs } = await util.promisifyModel(getConfigByKeysModel)(payload)

        if (resultCode != 1) throw new Error(resultMessage)

        configs.forEach(({ key, data }) => {
            if (key == 'jiasu-marketing-banner') {
                this.setData({ robCalendar: data })
                this.fillCalendarData()
            }
            if (key == 'wechat-mini-task-components-rule') {
              this.setData({
                ruleDesc: data.actCenterRule,
              })
          }
        })
    },
    // 获取小程序配置
    getMoreShareQconfig() {
      const payload = {
          keys: ['wechat_mini_grab_share']
      }
      getConfigByKeysModel(payload, res => {
          const { resultCode, resultMessage, configs } = res

          if (resultCode != 1) throw new Error(resultMessage)
          configs.forEach(({ key, data }) => {
              if (key == 'wechat_mini_grab_share') {
                  this.setData({
                    closeEnterpriseMoreShare: data[shared.traceChannel].closeEnterpriseMoreShare,
                    closeAssistTaskContainer: data[shared.traceChannel].closeAssistTaskContainer,
                  })
                  if (data[shared.traceChannel].closeRobSharePageShare) {
                    cwx.hideShareMenu()
                  }
              }
          })
      })
    },
    async initSync12306OrderInfo(isOnline = false) {
        const bookInfo = TrainBookStore.get()
        // 区分在线换座和之前的逻辑
        const isCheckAuth = !isOnline ? cwx.user.auth === bookInfo.auth : true
        if (cwx.user.isLogin() && bookInfo && isCheckAuth) {
            try {
                const accountInfo = bookInfo.bind12306
                if (!accountInfo?.name) {
                    throw '无12306账号'
                }
                const mobile = bookInfo.mobile || await getUserBindedPhoneNumber()
                const payload = {
                    channel: 'WX',
                    mobilePhone: mobile,
                    userName12306: util.encodeAES(accountInfo.name),
                    actionType: 2,
                }
                await Sync12306OrderInfoPromise(payload)
            } catch (error) {
            }
        }
    },
    // 获取助力后增加的工具栏的配置
    getToolbarAfterAssistQconfig() {
        this.initSync12306OrderInfo()
        const payload = {
            keys: ['robshare-toolbar-after-assist']
        }
        // 先去拿用户tag，再插入tool配置中
        GetUserTag({}, res => {
            if (res.RetCode === 1) {
                this.setData({
                    toolbarTagAfterAssist: {
                        houbuTag: res.UserTag >> 1,
                        syncTag: res.UserTag >> 0,
                    }
                })
            }
            getConfigByKeysModel(payload, res => {
                const { resultCode, resultMessage, configs } = res
                if (resultCode != 1) throw new Error(resultMessage)
                configs.forEach(({ key, data }) => {
                    if (key == 'robshare-toolbar-after-assist') {
                        if (data.usertagSwitch) {
                            data.toolsConfig.forEach(c => {
                                if (c.key === 'ticketquery' && this.data.toolbarTagAfterAssist.houbuTag) {
                                    c.tag = '测得准'
                                }
                                if (c.key === 'online' && this.data.toolbarTagAfterAssist.syncTag) {
                                    c.tag = '免费换'
                                }
                            })
                        }
                        this.setData({
                            toolbarAfterAssist: data,
                        })
                    }
                })
            })
        })
    },
    // 获取超能力抽奖开关
    getSuperPowerLotteryConfig() {
        const payload = {
            keys: ['ctrip-train-super-power-lottery']
        }
        getConfigByKeysModel(payload, res => {
            const { resultCode, resultMessage, configs } = res

            if (resultCode != 1) throw new Error(resultMessage)
            configs.forEach(({ key, data }) => {
                if (key == 'ctrip-train-super-power-lottery') {
                    this.setData({
                      isShowSuperPowerLottery: data.isOpen,
                    })
                }
            })
        })
      },
    fillCalendarData () {
        const {
            robCalendar: {
                expireDateTime,
                holidayDateTime,
                beginDateTime,
                lunarList,
            },
            preSaleData: { preSaleDays } = { preSaleDays: 15 }
        } = this.data
        const dateNow = Date.now()
        const oneDay = 24 * 60 * 60 * 1000
        // 是否显示
        const beginTime = new Date(beginDateTime).getTime()
        const expireTime = new Date(expireDateTime).getTime()
        const show = dateNow >= beginTime && dateNow <= expireTime
        // 预售期
        const sellDateTimeIns = new cDate(dateNow).addDay(preSaleDays - 1).getTime()
        const sellDateTime = new cDate(sellDateTimeIns).format('Y-m-d H:i:s')
        const sellDate = new cDate(sellDateTimeIns).format('Y-m-d')
        // 节日差值
        const holidayTime = new Date(holidayDateTime).getTime()
        const holidayOffsetDay = Math.ceil((holidayTime - sellDateTimeIns) / oneDay)

        // 填充标题
        const formatHolidayInfo = (diffDay, cfgInfo) => {
            if (diffDay == null || !cfgInfo) return ''
            let title = ''
            let buttonName
            if (diffDay > 0) {
                const patt = /\${(.+)\}/g;
                title = cfgInfo?.preSellDayTitle?.replace(patt, () => diffDay)
                buttonName = cfgInfo?.buttonName
            } else if (diffDay === 0) {
                title = cfgInfo?.currSellDayTitle
                buttonName = cfgInfo?.currSellButtonName
            } else {
                title = cfgInfo?.afterSellDayTitle
                buttonName = cfgInfo?.afterButtonName
            }
            return {title, buttonName}
        }

        this.setData({
            robCalendar: {
                ...this.data.robCalendar,
                show,
                sellDateTime,
                holidayOffsetDay,
                lunar: lunarList[sellDate],
                buttonName: formatHolidayInfo(holidayOffsetDay, this.data.robCalendar)?.buttonName,
                subTitle: formatHolidayInfo(holidayOffsetDay, this.data.robCalendar)?.title,
                month: (new Date(sellDateTimeIns).getMonth() + 1).toString().padStart(2, '0'),
                day: new Date(sellDateTimeIns).getDate().toString().padStart(2, '0'),
            }
        })

        this.setRobCalendarDesc()

        if (show && this.data.robCalendar.open) {
            util.ubtTrace('s_trn_c_trace_10320655842', { exposureType: 'normal', bizKey: 'calendarEnterExposure', userType: this.data.canReceiveNewUserRights ? 1 : 2 })
        }
    },
    setRobCalendarDesc() {
        let count = 0
        // let nextCount = count + 1
        if (this.calendarTimer) {
            return
        }
        this.calendarTimer = setInterval(() => {
            this.setData({
                // robCalendarDesc: this.data.robCalendar.descList[count],
                // nextRobCalendarDesc: this.data.robCalendar.descList[nextCount],
                calendarDescTrigger:  count % 2 == 0
            })

            count++
            if (count >= this.data.robCalendar.descList.length) {
                count = 0
            }
        }, 3000);
    },
    goCalendarPage(e) {
        util.ubtTrace('c_trn_c_10320655842', { bizKey: 'calendarEnterClick', userType: this.data.canReceiveNewUserRights ? 1 : 2 })
        const url = this.data.robCalendar.jumpUrlNew + (e.target.dataset?.anchor ? `&anchor=${e.target.dataset?.anchor}` : '')

        this.navigateTo({ url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}&bgColor=2893FF&ftColor`})
    },
    getTrainSuperPowerUnlockInfoFunc() {
        GetTrainSuperPowerUnlockInfo({
            orderNumber: this.orderNumber
        }, res =>{
            console.log("GetTrainSuperPowerUnlockInfo", res)
            this.setData({
                superPowerInfo: {
                    shareKey: res.shareKey,
                    ...res.expirencedPower
                }
            })
        })
    },
    // onClick123() {
    //     cwx.Observer.addObserverForKey('mkt_task_event', (res) => {
    //         const {eventName, data: taskData} = res
    //         if (eventName === 'videoModal') {
    //             // status    openFail   openSuccess  close clickBtn
    //             // openFail   打开失败 reason 原因
    //             // openSuccess 打开成功
    //             // close 弹窗关闭
    //             // clickBtn 点击观看

    //             const {status, reason} = taskData
    //             console.log(res)

    //             if (status === 'openFail') {
    //                 this.setData({showMask: 'success-pkg' })

    //             } else if (status !== 'openSuccess') {
    //                 util.ubtTrace('s_trn_c_trace_10320655842', {
    //                     exposureType : "normal",
    //                     bizKey : "watchVedioExposure"
    //                 })
    //             }

    //             if (status === 'clickBtn') {
    //                 util.ubtTrace('c_trn_c_10320655842', {bizKey: 'watchVedioClick' })
    //             }
    //         }
    //     })

    //     cwx.Observer.noti("train_task_event", { eventName: 'assistSuccess', data: { assistCount: 1, awardText: 'asdasdsa' } })
    // },
    handleShowRule() {
      this.setData({
          showTaskRulePanel: true,
      })
      console.log(this.data.showTaskRulePanel)
    },
    handleCloseRule() {
      this.setData({
          showTaskRulePanel: false
      })
    },
    onClickWindow() {
      console.log('wndow click', new Date(), this.shareTriggered)
      if (this.shareTriggered && new Date() - this.shareTriggered > 500) {
        // 500ms后还是没有在onshow的情况下点击了其他区域，则认为分享失败
        this.shareTriggered = 0
        cwx.sendUbtByPage.ubtMetric({
          name: "train_tinyapp_shareerror_metric",
          value: 1,
        })
      }
    },
    hideNewGuestRightPopBackDrop() {
        this.setData({ showMask: '', loginBtnClick: false })
    },
    async showBlindBoxAssistPop() {
        const params = {
            FromType: 1,
            Channel: 'WX'
        }
        
        const blindCityList = [
            {
                BgColor:
                "https://images3.c-ctrip.com/train/activity/20230724-ctrip-PointBlindBox/img-guilvse.png",
                CityName: "隐藏款",
                Image:
                "https://images3.c-ctrip.com/train/activity/20230724-ctrip-PointBlindBox/img-yingcang1.png",
                Desc: "任意的目的地",
            },
            {
                BgColor:
                "https://images3.c-ctrip.com/train/activity/20230724-ctrip-PointBlindBox/img-fensess.png",
                CityName: "隐藏款",
                Image:
                "https://images3.c-ctrip.com/train/activity/20230724-ctrip-PointBlindBox/img-yingcang2.png",
                Desc: "任意的目的地",
            },
            {
                BgColor:
                "https://images3.c-ctrip.com/train/activity/20230724-ctrip-PointBlindBox/img-huangse.png",
                CityName: "隐藏款",
                Image:
                "https://images3.c-ctrip.com/train/activity/20230724-ctrip-PointBlindBox/img-yingcang3.png",
                Desc: "任意的目的地",
            },
        ];
        const data = await util.promisifyModel(getBlindBoxCity)(params)

        if (data.CityList.length === 9) {
            data.CityList.splice(2, 1, blindCityList[0]);
            data.CityList.splice(4, 1, blindCityList[1]);
            data.CityList.splice(6, 1, blindCityList[2]);
            this.setData({
                blindBoxCityList: data.CityList,
                showMask: "blind-box-assist-pop"
            })
            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "popupExposure", scene: 7 })
        } else {
            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "popupExposure", scene: 0 })
            util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_exposure',{ PageId: this.pageId, ActivityId: 4})
            this.setData({
                showMask: 'success-pkg'
            })
        }

    },
    async assistAlertPopHandler() {
        const {
            GrabAccelNumber, 
            CouponDesc
        } = this.data
        
        try {
            let alertInfoRes = await util.promisifyModel(GetGrabTicketAlertInfo)({
                OrderId: this.orderNumber 
            })

            // mock
            // alertInfoRes.AlertInfo.Type = 7
            
            
    
            const alertInfo = alertInfoRes.AlertInfo
            this.setData({
                assistAlertInfo: alertInfo
            })
    
            // const alertType = {
            //     5: '视频号',
            //     0: '兜底',
            //     7: '旅行盲盒'
            // }[alertInfo.Type]

            if (alertInfo.Type === 5 && this.data.assistTaskList?.length > 0) {
                cwx.Observer.addObserverForKey('mkt_task_event', (res) => {
                    const {eventName, data: taskData} = res
                    if (eventName === 'videoModal') {
                        // status    openFail   openSuccess  close clickBtn
                        // openFail   打开失败 reason 原因
                        // openSuccess 打开成功
                        // close 弹窗关闭
                        // clickBtn 点击观看
        
                        const {status, reason} = taskData
        
                        this.setData({showMask: ''})
                        console.log('taskData',taskData)
                        if (status === 'openFail') {
                            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "popupExposure", scene: 0 })
                            util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_exposure',{ PageId: this.pageId, ActivityId: 4})
                            this.setData({showMask: 'success-pkg', CouponDesc })
                        } else if (status === 'openSuccess') {
                            util.ubtTrace('s_trn_c_trace_10320655842', {
                                exposureType : "normal",
                                bizKey : "watchVedioExposure"
                            })

                            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "popupExposure", scene: 5 })

                            this.setData({
                                needPopClose: true
                            })
                        }
        
        
                        if (status === 'clickBtn') {
                            util.ubtTrace('c_trn_c_10320655842', {bizKey: 'watchVedioClick' })
                        }
                        if (status === 'clickBtn' || status === 'close') {
                            this.setData({
                                needPopClose: false
                            })
                        }
                    }
                })
                cwx.Observer.noti("train_task_event", { eventName: 'assistSuccess', data: { assistCount: GrabAccelNumber, awardText: CouponDesc ? `恭喜你获得${CouponDesc}` : ''} })
                return
            }
            if (alertInfo.Type === 7) {
                return await this.showBlindBoxAssistPop()
            }
            if (alertInfo.Type === 1) {
                util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_exposure',{ PageId: this.pageId, ActivityId: 1})
                // 特种兵
                return this.setData({ showMask: 'special-arm-assist-pop' })
            }
            if (alertInfo.Type === 2) {
                util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_exposure',{ PageId: this.pageId, ActivityId: 2})
                // 在线换座
                return this.setData({ showMask: 'replace-seat-assist-pop' })
            }
            if (alertInfo.Type === 6) {
                await this.getLostUserPopDetail()
                // 流失
                if (this.data.lostUserPopDetail.ShowLostUserRight) {
                    util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_exposure',{ PageId: this.pageId, ActivityId: 3})
                    return this.setData({ showMask: 'lost-user-assist-pop' })
                }
            }

            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "popupExposure", scene: 0 })
            util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_exposure',{ PageId: this.pageId, ActivityId: 4})
            this.setData({showMask: 'success-pkg', CouponDesc })

        } catch (err) {
            console.error('助力弹窗：' + err.message)
            util.ubtTrace('s_trn_c_trace_10320655842', { bizKey: "popupExposure", scene: 0 })
            util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_exposure',{ PageId: this.pageId, ActivityId: 4})
            this.setData({showMask: 'success-pkg', CouponDesc })
        }


    },
    onClickSpecialArmJumpBtn() {
        util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_click',{ PageId: this.pageId, ActivityId: 1})
        this.navigateTo({
            url: this.data.assistAlertInfo.JumpUrl
        })
    },
    onClickReplaceSeatJumpBtn() {
        util.ubtFuxiTrace('GCWAssistMainPage_SuccAssistPopup_click',{ PageId: this.pageId, ActivityId: 2})
        this.navigateTo({
            url: this.data.assistAlertInfo.JumpUrl
        })
    },
    onClickBlindBoxJumpBtn() {
        util.ubtTrace('c_trn_c_10320655842', { bizKey: "popupClick", scene: 7 })
        
        this.navigateTo({
            url: this.data.assistAlertInfo.JumpUrl
        })
    },
    // 助力后出现的工具箱点击
    onClickTools(e) {
        // kingkong应该可以去掉
        const { index } = e.currentTarget.dataset
        util.ubtFuxiTrace('GCWAssistMainPage_ToolModule_click',{ PageId: this.pageId, ActivityId: index + 1})
        const curr = this.data.toolbarAfterAssist.toolsConfig[index]
        const mobile = TrainBookStore.getAttr("mobile") || ''
        const bind12306 = TrainBookStore.getAttr("bind12306")
        // const kingkong = TrainActStore.getAttr('kingkong') || []
        // if (curr.point) {
        //     kingkong.push(`${curr.key}-point`)
        // }
        // if (curr.tag) {
        //     kingkong.push(`${curr.key}-tag-${curr.tag}`)
        // }

        // TrainActStore.setAttr('kingkong', kingkong)

        // 点击埋点
        // util.ubtFuxiTrace('TCWFrontPage_QaModule_click', { PageId: this.pageId, Type: curr.name })

        if (curr.key === 'online') {
            // util.ubtFuxiTrace('230985', { PageId: this.pageId })
            const _url = `${curr.link}&userName12306=${bind12306?.name || ''}&hideShare=true`
            const url = `/pages/trainActivity/twebview/index?url=${encodeURIComponent(_url)}`
            return this.navigateTo({ url })
        }

        if (curr.key === 'ticketquery') {
            const _url = `${curr.link}&userName12306=${bind12306?.name || ''}&mobile=${mobile}&hideShare=true`
            const url = `/pages/trainActivity/twebview/index?url=${encodeURIComponent(_url)}`
            return this.navigateTo({ url })
        }

        return this.navigateTo({
            url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(curr.link)}`
        })
    },
    async showNewOrLostRightsInfoAfterAssist(){
        if (this.data.abtest.rightAfterAssistAb !== 'B') {
            return
        }
        // 已助力+正在抢票才展示
        if (this.data.isAccelerating && this.data.acceState == 0) {
            return
        }
        if (!this.data.isAccelerating) {
            return
        }
        const that= this
        // 检查abtest，走新样式才走后面的逻辑
        let isNewUser = false
        try {
            await newcustomerMixin.trainGetNewGuestInfo()
            isNewUser = true
        } catch { }
        if (isNewUser) {
            // 新客礼包会静默领取，直接拿新客礼包信息就可以了
            await newcustomerMixin.getUserNewCustomerRightOnly(that, this.data.userCouponFromType, 'newCustomerRightInfoAfterAssist')
            // 领后数据应该另起存放  之前把领前领后塞一起是有问题的
        } else {
            // 走流失的逻辑
            const payload = {
                Channel: 'wx',
                SceneId: 'TS-11'
            }
            try {
                await receiveLossGift(payload)
            } catch { }
            this.getLostUserPopDetail()
        }
    },
    async getLostUserPopDetail() {
        const payload = {
            Channel: 'wx',
            SceneId: 'TS-11'
        }
        const res = await getLossGiftDetail(payload)
        const { EntranceGiftList = [], Price, RuleUrl, CrowdId, AlertTitle, AlertSubTitle, AlertGiftList = [], AlertTip } = res
        if (EntranceGiftList?.length && AlertGiftList?.length) {
            this.setData({
                lostUserPopDetail: { EntranceGiftList, ShowLostUserRight: true, Price, RuleUrl, CrowdId, AlertTitle, AlertSubTitle, AlertGiftList, AlertTip }
            })
        }
    },
}

util.useMixin(page, [studentCardMixin])
util.useMixin(page, [robCouponPop])
TPage(page)

function truncString(obj) {
    if (!obj) {
        return ''
    }
    let res
    try {
        if (obj.message) {
            res = obj.message.toString()
        } else {
            res = JSON.stringify(obj)
        }
        if (res.length > 50) {
            res = res.slice(0, 50)
        }
    } catch (e) {
        res = 'trunc fail'
    }

    return res
}

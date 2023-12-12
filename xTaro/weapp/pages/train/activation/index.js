import { cwx } from "../../../cwx/cwx"
import TPage from '../common/TPage'
import {
    ActivationLandingPageInfoModel,
    GetActivateAssistedFriendsInfoModel,
    IsCanReceiveNewCustomerRightsModel,
    FreeReceiveVipGrabRightsHelpModel,
    StudentCardInfoModel,
    NewCustomersRightsDetailModel,
    UserNewCustomersRightsInfoModel,
    GetStudentCardDetailInfoModel,
    StudentCardDetailModel,
    getUserStatusOnTrainWechatEnterpriseModel,
    qyGetGroupEntryQrCodeWithUidModel,
    bindUserCommonPageTaskModel
} from '../common/model'
import {
    getConfigInfoJSON,
    getConfigByKeysPromise
} from '../common/common'
import { shared } from '../common/trainConfig'
import util from "../common/util"
import { TrainActStore } from '../common/store'
import cDate from '../common/cDate'
import { newcustomerMixin } from '../common/components/NewCustomerRight/newcustomerMixin'
const systeminfo = wx.getSystemInfoSync()

let page = {
    checkPerformance: true,
    pageId: shared.pageIds.activation.pageId,
    data: {
        IsAssisted: false,
        timeOutEvent: null,
        showType: '',
        statusBarHeight: systeminfo.statusBarHeight,
        IsSelf: false,
        GrabOrderStatus: 0,
        ArriveStation: '',
        newCustomersRights: null,
        RightsInfo: {
            Type: 0,
        },
        prizeDesc: '',
        OtherRightsInfoList: [],
        expiredTime: '',
        IsCanAssisted: true,
        AssistedFriendsList: [],
        rules: [],
        userInfo: null,
        loginFlag: false,
        IsHaveStudentPassenage: false,
        canvasBg: 'https://images3.c-ctrip.com/train/app/827/qiangpiao/xcx/pic_xcx_pyq.png',
        otherRightsInfoForCoupon: {},
        usertype: 1, // 区分新客 学生
        newUserFromType: 22,
        newCustomerRightInfo: {},
        newUserFlag: false,
        showWecom: false,
        wecomQRCode: ''
    },
    async onLoad(options) {
        wx.hideShareMenu()
        const { OrderNumber, Avatar, usertype } = options
        this.OrderNumber = OrderNumber
        this.setData({ Avatar, usertype })

        util.ubtTrace(222595, {
            "PageId": 10650047418,
            "userType": this.data.usertype
        })

        await this.getConfigs()
        this.checkUserInfo()

        const stack = getCurrentPages()
        if (stack.length == 1) {
            this.setData({ firstStack: true })
        }

        cwx.getSystemInfo({
            success: (res) => {
                let systemHeight = res.windowHeight
                let statusBarHeight = res.statusBarHeight
                this.setData({
                    systemHeight,
                    statusBarHeight,
                })
            },
        })
    },
    async onShow() {
        // util.ubtTrace(222596, {
        //     "PageId": 10650047418,
        //     "userType": this.data.usertype
        // })

        // util.ubtTrace(222590, {
        //     "PageId": 10650047418,
        //     "userType": this.data.usertype,
        //     "subResult": 1
        // })

        // util.ubtTrace(222590, {
        //     "PageId": 10650047418,
        //     "userType": this.data.usertype,
        //     "subResult": 2
        // })

        // util.ubtTrace(222589, {
        //     "PageId": 10650047418,
        //     "userType": this.data.usertype
        // })

        cwx.user.wxLogin(_ => console.log('刷新登录态'))
        if (!cwx.user.isLogin()) {
            // 获取微信logincode 方式用户第一次点击登录时 没有这个code
            this.setData({
                loginFlag: false,
            })
            this.onShowLoginCb()
        } else {
            cwx.user.checkLoginStatusFromServer((data) => {
                if (!data) {
                    cwx.user.logout(() => { console.log('logout') })
                    this.setData({ loginFlag: false })
                } else {
                    this.setData({ loginFlag: true })
                }
                this.onShowLoginCb()
            })
        }
    },
    async onShowLoginCb() {
        const { IsCanAssisted, RetCode, IsSelf } = await this.getLandingPageData()

        try {
            await newcustomerMixin.trainGetNewGuestInfo()
            this.setData({
                newUserFlag: true
            })
        } catch { }

        // 登录之后再查学生卡信息
        if (this.data.loginFlag && this.data.IsHaveStudentPassenage) {
            const { ReceiveCardUrl, IsCanReceive, IsReceived, CardDetailUrl } = await this.getStudentRightsInfo() // 是否可领取 以及 是否已领
            // 领过学生卡
            if (IsReceived) {
                let { TrainRightsList } = await this.getStudentRights()
                TrainRightsList = TrainRightsList && TrainRightsList.slice(0, 4)
                let studentsCardsInfo = {
                    TrainRightsList,
                    ReceiveCardUrl,
                    IsReceived,
                    CardDetailUrl,
                    IsCanReceive,
                }
                this.setData({
                    studentsCardsInfo,
                })
            } else if (IsCanReceive) { // 能领学生卡
                let { TrainRightsList } = await this.getStudentRightsList()
                TrainRightsList = TrainRightsList && TrainRightsList.slice(0, 4)
                let studentsCardsInfo = {
                    TrainRightsList,
                    ReceiveCardUrl,
                    IsReceived,
                    CardDetailUrl,
                    IsCanReceive,
                }
                this.setData({
                    studentsCardsInfo,
                })
            }
        }

        this.ubtTrace('train_student_newbieent', !!this.data.studentsCardsInfo && (this.data.IsSelf || (!this.data.IsSelf && !this.data.IsCanAssisted)))


        await newcustomerMixin.getUserNewCustomerRight(this, this.data.newUserFromType)

        if ((!IsCanAssisted && !IsSelf) || !this.data.loginFlag) {
            let res2 = await this.checkCanReceiveRights()
            this.setData({
                canReceiveNewCustomerRight: res2.IsCanReceive,
            })

            if (res2.IsCanReceive || !this.data.loginFlag) {
                this.getNewCustomerRights().then(res => {
                    if (res.RetCode == 1 && res.RightList) {
                        const { RightList, OriginPrice } = res
                        this.setData({
                            newCustomerRightInfo: {
                                RightList,
                                OriginPrice,
                            },
                        })
                    }
                })
            }
        }

        if (RetCode == 1) {
            return Promise.resolve()
        } else {
            return Promise.reject()
        }
    },
    /**
     * 首页信息落地
     */
    async getLandingPageData() {
        util.showLoading('正在加载')
        const params = {
            OrderNumber: this.OrderNumber,
        }
        let res = await util.promisifyModel(ActivationLandingPageInfoModel)(params)
        // let res ={"ResponseStatus":null,"RetCode":1,"RetMessage":null,"ArriveStation":"苏州","IsSelf":false,"IsHaveStudentPassenage":false,"IsCanAssisted":true,"NotCanAssistedReason":"感谢支援！我正在使用携程抢票，推荐你也试试","GrabOrderStatus":0,"FreeActivateFriendsNumber":4,"prizeDesc":"助力好友立即送你一张3元立减券","RightsInfo":{"Name":"VIP抢票特权","OriginPrice":80,"Type":1,"Status":0},"AssistedFriendsList":[{"PhotoUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKABUOialWDJn4HllqvlYmKg0C4mZDA3BwPZ6ueAgIFSE49cS5vrticWdH2wrK6s4sM0uqceoFl8Png/132","NickName":"SuperPeng"},{"PhotoUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKABUOialWDJn4HllqvlYmKg0C4mZDA3BwPZ6ueAgIFSE49cS5vrticWdH2wrK6s4sM0uqceoFl8Png/132","NickName":"SuperPeng"}],"OtherRightsInfoList":[{"Type":1,"Name":"火车票返现券","OriginPrice":2,"ExpiredTime":"20220121145825","Icon":"https://images3.c-ctrip.com/train/2021/app/V8.42.6/zengzhang/app_xiadanliuchengquanyiganzhi/text_zhoumofuli.png","JumpUrl":""}]}

        // res = {"ResponseStatus":null,"RetCode":1,"RetMessage":null,"ArriveStation":"松江","IsSelf":false,"IsHaveStudentPassenage":false,"IsAssisted":true,"IsCanAssisted":false,"NotCanAssistedReason":"感谢支援！我正在使用携程抢票，推荐你也试试","GrabOrderStatus":0,"FreeActivateFriendsNumber":4,"prizeDesc":"助力好友立即送你一张3元立减券","RightsInfo":{"Name":"VIP抢票特权","OriginPrice":80,"Type":1,"Status":0},"AssistedFriendsList":[{"PhotoUrl":"https://images3.c-ctrip.com/train/activity/20200714-vip-qiangpiao/avatar.png","NickName":"携程用户"}],"OtherRightsInfoList":null}
        if (res.RetCode == 1) {
            util.hideLoading()
            const {
                ArriveStation,
                AssistedFriendsList,
                GrabOrderStatus,
                IsSelf,
                IsCanAssisted,
                IsHaveStudentPassenage,
                NotCanAssistedReason,
                RightsInfo,
                FreeActivateFriendsNumber,
                prizeDesc,
                OtherRightsInfoList,
                IsAssisted
            } = res
            this.setData({
                ArriveStation,
                AssistedFriendsList,
                GrabOrderStatus,
                IsSelf,
                IsCanAssisted,
                IsHaveStudentPassenage,
                NotCanAssistedReason,
                RightsInfo,
                FreeActivateFriendsNumber,
                prizeDesc,
                OtherRightsInfoList,
                IsAssisted
            })

            if (OtherRightsInfoList && OtherRightsInfoList.find(item => item.Type == 1)) {
                let expiredTime = cDate.parse(OtherRightsInfoList.find(item => item.Type == 1).ExpiredTime.slice(0, 8)).format('Y-m-d')
                this.setData({
                    otherRightsInfoForCoupon: OtherRightsInfoList.find(item => item.Type == 1),
                    expiredTime,
                })
                util.ubtTrace('s_trn_c_trace_10650047418', { exposureType: 'normal', bizKey: 'vipRightOldExposure', userType: this.data.usertype })
            }
            if ((RightsInfo?.Status == 0 && !IsSelf && IsCanAssisted) || (IsSelf && RightsInfo?.Status == 0) && GrabOrderStatus == 0) {
                util.ubtTrace('s_trn_c_trace_10650047418', { exposureType: 'normal', bizKey: "vipRightNewExposure", userType: this.data.usertype })
            }
            return Promise.resolve(res)
        } else {
            util.showToast(res.RetMessage || '网络错误，请稍后再试 :(', 'none')

            return Promise.reject()
        }
    },
    /**
     * 助力列表
     */
    getAssistedFriendList() {
        const params = {
            OrderNumber: this.OrderNumber,
        }

        return util.promisifyModel(GetActivateAssistedFriendsInfoModel)(params)
    },
    /**
     * 新客权益是否可以领取
     */
    checkCanReceiveRights() {
        return util.promisifyModel(IsCanReceiveNewCustomerRightsModel)({})
    },
    /**
     * 学生权益相关 包含是否可以领取学生权益
     */
    getStudentRightsInfo() {
        const params = {
            ChannelName: 'ctripwx',
            FromType: '',
        }

        return util.promisifyModel(StudentCardInfoModel)(params)
    },
    /**
     * 新客权益列表
     */
    getNewCustomerRights() {
        const params = {
            Channel: 'ctripwx',
            FromType: this.data.newUserFromType
        }

        return util.promisifyModel(NewCustomersRightsDetailModel)(params)
    },
    /**
     * 学生卡权益列表 跟用户相关
     */
    getStudentRights() {
        const params = {
            Channel: 'ctripwx',
        }

        return util.promisifyModel(GetStudentCardDetailInfoModel)(params)
    },
    /**
     * 学生卡权益列表 服务包
     */
    getStudentRightsList() {
        const params = {
            Channel: 'ctripwx',
        }

        return util.promisifyModel(StudentCardDetailModel)(params)
    },
    /**
     * vip信息相关
     */
    getVipRightsInfo() {
        const params = {
            Channel: 'ctripwx',
        }

        return util.promisifyModel(UserNewCustomersRightsInfoModel)(params)
    },
    /**
     * 获取配置
     */
    async getConfigs() {
        getConfigInfoJSON('train_wx_activation_rule').then(res => {
            this.setData({ rules: res })
        })
    },
    showShareBoard() {
        this.setData({
            canvasBg: this.data.RightsInfo.Type == 1 ? 'https://images3.c-ctrip.com/train/app/827/qiangpiao/xcx/pic_xcx_pyq.png' : 'https://images3.c-ctrip.com/train/app/827/qiangpiao/xcx/pic_xcx_studengt_fenxiang.png',
            showType: 'shareBoard',
        })
    },
    hideBackDrop() {
        this.setData({ showType: '' })
    },
    vipRightToBuy(e) {
        const { buytype } = e.currentTarget.dataset
        util.ubtTrace('c_trn_c_10650047418', { bizKey: 'vipRightOldtoBuy', scene: buytype })
        this.buyTicket()
    },
    buyTicket() {
        const params = 'OrderSource=TRA_Rights_Share_844Version'
        util.goTrainHome(params)
    },
    /**
     * 激活vip助力 + 领取权益
     */
    async doAssist() {
        this.assist()
            .then(async () => {
                if (this.data.newUserFlag) {
                    this.receiveNewCustomerRight()
                } else {
                    // this.setData({
                    //     receiveFinish: true
                    // })
                }
            })

            .catch(e => {
                console.log(e)
                // util.hideLoading()
            })
    },
    /**
     * 激活助力
     */
    async assist() {
        util.showLoading('激活中')
        const params = {
            OrderNumber: this.OrderNumber,
            PhotoUrl: this.data.userInfo && this.data.userInfo.avatarUrl,
            NickName: this.data.userInfo && this.data.userInfo.nickName,
        }
        let res = await util.promisifyModel(FreeReceiveVipGrabRightsHelpModel)(params)
        await this.getLandingPageData()
        util.hideLoading()
        if (res.RetCode == 1 && res.IsSuccess) {
            util.showToast('助力成功')
            return Promise.resolve()
        } else {
            this.hideBackDrop()
            util.showToast(res.RetMessage || '激活失败，请稍后再试 :(', 'none')

            return Promise.reject()
        }
    },
    /**
     * 授权获取头像昵称后助力 同意或者拒绝授权都会去加速
     */
    getUserInfoAndAsssit(e) {
        this.hideBackDrop()
        if (e.detail && e.detail.errMsg === 'getUserInfo:ok') {
            this.setData({ userInfo: JSON.parse(e.detail.rawData) })
        }
        this.doAssist()
    },
    getUserProfileAndAssist() {
        this.hideBackDrop()
        try {
            wx.getUserProfile({
                desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                success: async (res) => {

                    util.ubtTrace(222590, {
                        "PageId": 10650047418,
                        "userType": this.data.usertype,
                        "subResult": 1
                    })

                    util.ubtTrace('c_trn_c_10650047418', { bizKey: 'nicknameAuthClick', result: 1 })

                    this.setData({
                        userInfo: res.userInfo,
                    })
                    TrainActStore.setAttr('USERINFO', {
                        ...res.userInfo,
                        openid: cwx.cwx_mkt.openid,
                    })

                    const isAlreadyAdd = await this.getWecomEntranceAlreadyAdd()
                    if (!isAlreadyAdd) {
                        this.setData({
                            showWecom: true
                        })
                        util.ubtTrace('s_trn_c_trace_10650047418', { bizKey: 'WecomAddFriendExposure', userType: this.data.usertype })

                        console.log('showwecom style')
                    } else {
                        this.doAssist()
                    }
                },
                fail: () => {
                    util.ubtTrace('c_trn_c_10650047418', { bizKey: 'nicknameAuthClick', result: 0 })
                    this.doAssist()
                    util.ubtTrace(222590, {
                        "PageId": 10650047418,
                        "userType": this.data.usertype,
                        "subResult": 2
                    })
                },
            })
        } catch (error) {
            this.doAssist()
        }
    },
    /**
     * 手机号授权登录后助力
     */
    async loginAndAssist(e) {
        this.myAuthorize({
            success: async () => {
                this.setData({ loginFlag: true })
                await this.onShowLoginCb()
                if (this.data.userInfo) {

                    const isAlreadyAdd = await this.getWecomEntranceAlreadyAdd()
                    if (!isAlreadyAdd) {
                        this.setData({
                            showWecom: true
                        })
                        util.ubtTrace('s_trn_c_trace_10650047418', { bizKey: 'WecomAddFriendExposure', userType: this.data.usertype })

                        console.log('showwecom style')
                    } else {
                        this.doAssist()
                    }
                } else {
                    util.ubtTrace('c_trn_c_10650047418', { bizKey: 'nicknameAuthExposure', userType: this.data.usertype })
                    this.setData({ showType: 'userInfo' })

                    util.ubtTrace(222589, {
                        "PageId": 10650047418,
                        "userType": this.data.usertype
                    })
                }
            },
            reject: () => {
                util.showToast('授权成功后才可助力哦', 'none')
            },
        })
    },
    async receiveStudentRight() {
        this.ubtTrace('train_student_newbiepop', this.data.studentsCardsInfo && this.data.studentsCardsInfo.IsCanReceive)
        if (this.data.studentsCardsInfo && this.data.studentsCardsInfo.IsCanReceive) {
            util.hideLoading()
            this.setData({
                showType: 'studentCard',
            })
            this.onShowLoginCb()
        } else {
            util.hideLoading()
            this.receiveNewCustomerRight()
        }
    },
    async receiveNewCustomerRight() {
        util.showLoading()
        await newcustomerMixin.getUserNewCustomerRight(this, this.data.newUserFromType)
        if (this.data.newCustomerRightInfo.IsHaveRights) {
            util.hideLoading()
            return
        }

        return newcustomerMixin.checkCanReceiveNewCustomerRight()
            .then(() => newcustomerMixin.getNewCustomerRights(this, this.data.newUserFromType))
            .then(() => {
                const { AbValue } = this.data.newCustomerRightInfo
                let rightType = AbValue == 'a' ? 0 : 1

                return newcustomerMixin.receiveNewCustomerRight(this.data.newUserFromType, rightType, { OpenId: cwx.cwx_mkt.openid || '', })
            })
            .then(async (res) => {
                if (res.RetCode === 1 && res.IsReceiveSuccess && this.data.newCustomerRightInfo.RightList.length) {
                    await newcustomerMixin.getUserNewCustomerRight(this, this.data.newUserFromType)
                    util.hideLoading()
                    util.showToast('恭喜你，领取成功', 'none')
                } else {
                    util.hideLoading()
                    // util.showToast('抱歉，仅限火车票新用户领取', 'none')
                }

                console.log(res, this.data.newCustomerRightInfo.RightList, 'zzzzzzzzz')
            })
            .catch(() => {
                util.hideLoading()
                util.showToast('抱歉，仅限火车票新用户领取', 'none')
            })
    },
    loginAndReceiveNewCustomerRight(e) {
        this.myAuthorize({
            success: async () => {
                this.setData({ loginFlag: true })
                await this.onShowLoginCb()
                const { IsCanReceive, RetCode } = await this.checkCanReceiveRights()
                if (RetCode == 1 && IsCanReceive) {
                    this.buyTicket()
                } else {
                    this.setData({
                        showType: 'receiveFail',
                    })
                }
            },
            reject: () => {
                util.showToast('授权成功后才可领取', 'none')
            },
        })
    },
    toStudentCardPage(e) {
        const { url } = e.currentTarget.dataset
        this.navigateTo({
            url: '/pages/train/authorise/web/web',
            data: {
                url,
            },

        })
    },
    shareMoments() {
        util.showLoading()
        let url = `pages/train/activation/index?OrderNumber=${this.OrderNumber}&Avatar=${this.data.Avatar}`
        let path = shared.isTrainApp ? url : `pages/home/homepage?toUrl=${encodeURIComponent(`/${url}`)}`
        this.setData({
            qrcodePath: path,
            showType: 'momentsPost',
        })
    },
    onSharePictureSuccessAward() {
        util.hideLoading()
    },
    onSharePictureSaveAward(e) {
        console.log(e)
        wx.showModal({
            title: '提示',
            content: '图片保存成功，快去发个朋友圈吧~',
            showCancel: false,
            success: () => {
                this.setData({
                    showShareImagesAward: false,
                })
                this.hideBackDrop()
            },
        })
    },
    onSharePictureFailAward(e) {
        console.log(e.detail)
        const { showShareImagesAward } = this.data
        if (showShareImagesAward) {
            util.hideLoading()
            util.showToast(e.detail.msg || '保存失败 请稍后重试:(', 'none')
        }
    },
    onShareAppMessage(res) {
        let title, imageUrl
        let url = `pages/train/activation/index?OrderNumber=${this.OrderNumber}&Avatar=${this.data.Avatar}`
        let path = shared.isTrainApp ? url : `pages/home/homepage?toUrl=${encodeURIComponent(`/${url}`)}`

        if (res.from == 'button' && res.target.id === 'right') {
            title = 'VIP抢票这里竟然免费了！推荐你也试试'
        } else {
            title = '我正在激活VIP抢票特权，你也可以领'
        }

        if (this.data.RightsInfo && this.data.RightsInfo.Type == 1) {
            imageUrl = 'https://images3.c-ctrip.com/train/app/827/qiangpiao/xcx/xcx_fm_xinke.png'
        } else {
            imageUrl = 'https://images3.c-ctrip.com/train/app/827/qiangpiao/xcx/xcx_fm_students.png'
        }

        return {
            title,
            bu: "train",
            path,
            imageUrl,
        }
    },
    /**
     * [myAuthorize 唤起微信授权]
     * @param  {[type]} e       [此处的 e必传]
     * @param  {[type]} success [授权并登陆成功的回调函数]
     * @param  {[type]} reject  [拒绝授权时的回调函数 不传时默认跳转到其他登录方式页面]
     * @return {[type]}         [description]
     */
    myAuthorize(
        {
            success,
            reject = data => {
                if (!data) {
                    data = {}
                }
                if (!data.param || typeof data.param !== "object") {
                    data.param = {}
                }
                if (!data.callback || typeof data.callback !== "function") {
                    data.callback = function () { }
                }
                cwx.user.login(data)
            },
        } = {},
    ) {
        cwx.user.login({
            param: {},
            callback: (res) => {
                if (res.ReturnCode === '0') {
                    return success()
                }
                return reject()
            }
        })
    },

    /**
     * [checkUserInfo 获取当前用户头像昵称]
     * @return {[type]} [description]
     */
    checkUserInfo() {
        const deferred = util.getDeferred()
        let userInfo = TrainActStore.getAttr('USERINFO')
        if (userInfo && userInfo.openid == cwx.cwx_mkt.openid) {
            this.setData({
                userInfo,
            })
        }

        return deferred.promise
    },
    toRightDetailPage(e) {
        const { url } = e.currentTarget.dataset
        if (!url) return
        if (url.indexOf("https") > -1) {
            this.navigateTo({
                url: "../webview/webview",
                data: { url },
            })
        } else {
            this.navigateTo({ url })
        }
    },
    goBack() {
        cwx.navigateBack()
    },
    scrollMove(e) {
        console.log(e)
        let { scrollTop } = e.detail
        if (scrollTop > 60) {
            this.setData({ scollMove: true })
        } else {
            this.setData({ scollMove: false })
        }
    },
    onPullDownRefresh() {
        this.onShowLoginCb()
            .then(wx.stopPullDownRefresh)
            .catch(wx.stopPullDownRefresh)
    },
    noop() { },
    showCouponDoc() {
        this.setData({
            showType: 'couponDialog'
        })
    }, // 展示优惠券详情
    async assistActivateButton(e) {
        util.ubtTrace('c_trn_c_10650047418', { bizKey: 'vipRightNewAssistActivate', userType: this.data.usertype })
        console.log('assistActivateButton');
        const { bindtype } = e.currentTarget.dataset
        if (bindtype == 1) {
            const isAlreadyAdd = await this.getWecomEntranceAlreadyAdd()
            if (this.data.userInfo && !isAlreadyAdd) {
                this.setData({
                    showWecom: true
                })
                util.ubtTrace('s_trn_c_trace_10650047418', { bizKey: 'WecomAddFriendExposure', userType: this.data.usertype })

                console.log('showwecom style')
            } else {
                this.doAssist()
            }
        } else if (bindtype == 3) {
            this.getUserProfileAndAssist()
        }
    },
    onClickGoToTrainActivity(e) {
        const { rightInfo } = e?.currentTarget?.dataset

        if (rightInfo?.Type === 3) {
            this.navigateTo({
                url: rightInfo.JumpUrl
            })
        }
    },
    async getWecomEntranceAlreadyAdd() {

        util.showLoading()
        try {
            const configRes = await getConfigByKeysPromise({
                keys: ["wechat-activation-config"]
            })

            if (configRes.resultCode != 1) {
                throw '配置获取失败'
            }

            const wecomEntranceSwitch = configRes.configs[0].data.wecomEntranceSwitch


            if (!wecomEntranceSwitch) {
                util.hideLoading()
                return true
            }

            const params = {
                entryId: '71e649ac9a2e48bea24ec41e66bc49ab',
                unionId: cwx.cwx_mkt.unionid
            }

            const res = await util.promisifyModel(getUserStatusOnTrainWechatEnterpriseModel)(params)
            // res.alreadyAdd = false
            // mock

            if (res.resultCode === 1 && !res.alreadyAdd) {
                await this.bindUserCommonPageTask()
                await this.generateWecomQRcode()
                if (this.data.wecomQRCode) {
                    util.hideLoading()
                    return false
                }
            }
            util.hideLoading()
            return true
        } catch (err) {
            util.hideLoading()
            util.showToast("网络开小差，请稍后再试", "none")
            throw err
        }

    },
    async generateWecomQRcode() {
        const params = {
            entryId: '71e649ac9a2e48bea24ec41e66bc49ab',
            unionId: cwx.cwx_mkt.unionid
        }
        const qrRes = await util.promisifyModel(qyGetGroupEntryQrCodeWithUidModel)(params)

        if (qrRes.errcode === 0) {
            this.setData({
                wecomQRCode: qrRes.groupEntryActiveQrCode
            })
        }
    },
    async bindUserCommonPageTask() {
        const params = {
            orderId: this.OrderNumber,
            activityType: 'wecom',
            source: 'vip_qiwei',
            unionId: cwx.cwx_mkt.unionid,
        }

        const qrRes = await util.promisifyModel(bindUserCommonPageTaskModel)(params)

        if (qrRes.errcode === 0) {
            this.setData({
                wecomQRCode: qrRes.groupEntryActiveQrCode
            })
        }
    },

    onTouchStart() {
        const timer = setTimeout(() => {
            util.ubtTrace(222596, {
                "PageId": 10650047418,
                "userType": this.data.usertype
            })
        }, 800);

        this.setData({
            timeOutEvent:timer
        })
        return false
      },
      onTouchEnd() {
        clearTimeout(this.data.timeOutEvent)
        return false
      },
      onTouchMove() {
        clearTimeout(this.data.timeOutEvent)
      },
}
TPage(page)

// pages/train/inviterob/inviterob.js
import { cwx } from '../../../cwx/cwx'
import TPage from '../common/TPage'
import {
    GrabTicketFlowShared,
    GrabAccelerateTask,
    GetGrabOrderAcceleratedTaskList,
    CheckIsCanGiftPackageForWxModel,
    TrainGiftPackageForWxModel,
    GetLuckyStarListInfoModel,
    TrainSingleChannelToDoubleChannelModel,
    ReceiveHotelTask,
    ActivitySendCouponModel,
    getConfigByKeysModel,
    GetActivityCouponInfoModel,
    OrderDetailModel,
} from '../common/model'

import {
    GetShareImgPromise,
    GetShareImgNew,
    GetOrderHBInfoV2Promise,
    login12306,
    AddOrderAccountInfoPromise,
    getConfigInfoJSON
} from '../common/common'

import util from '../common/util'
import { shared } from '../common/trainConfig'
import robCouponPop from '../common/components/robCouponPop/robCouponPop'



const speed = ['低速', '快速', '高速', '极速', '光速', 'VIP']

const taskIcon = [
    '//pic.c-ctrip.com/train/wechat/inviterob/icon-12306.png',
    '//pic.c-ctrip.com/train/wechat/inviterob/icon-gzh.png',
    '//images3.c-ctrip.com/train/2021/app/V8.41.6/xiaochengxu/zhuliucheng/ic-tubiao.png',
]

const page = {
    checkPerformance: true,
    pageId: shared.pageIds.inviterob.pageId,
    data: {
        speedTaskAbVersion: 'A',
        ruleList: [],
        oid: '', // 订单号
        astation: '', // 到达站,
        dstation: '', // 出发站
        isLoadFinish: false, // 是否load结束
        accePacketInfo: {}, // 当前速度相关信息
        taskList: [], // 任务列表
        showRulesPrompt: false, // 是否展示规则弹窗
        showAccePacketLimitPrompt: false, // 助力限制弹窗
        currentLevel: '', //当前的速度
        shareTypeInfo: '', // 分享送助力包相关信息
        showRobPrompt: false, // 分享浮层
        hasRejectAlbum: false, // 是否拒绝过授权
        sharePic: '', // 朋友圈分享的图片
        shareImgs: '', // 好友分享的图片
        showShareImage: false,
        tempFilePath: '',
        isIphoneX: util.isIphoneX(),
        curTabIndex: 1,
        showTag: true,
        taskIcon,
        hbInfo: {},
        bindAccountInfo: null,
        orderMobile: '',
        popType: '',
        isCanFaceAuthentication: false,
        hideShareFlag: 0, //0 不隐藏分享  1 隐藏好友分享  2隐藏朋友圈分享
        closeInviteRobShare: true,
        subOrderId: '', // 改签抢订单号
        taskRwardInfo: null,
        taskCountDownText: '',
        firstStack: false,
        orderData:{},
        showMarketComponent:true,
    },
    async onLoad(options) {
        const { data = {}, from } = options
        let { oid = '', astation = '', dstation = '', orderMobile = '', isCanFaceAuthentication, subOrderId } = from === 'h5' ? JSON.parse(decodeURIComponent(data)) : data
        this.setData({
            oid,
            subOrderId,
            astation,
            dstation,
            orderMobile,
            isCanFaceAuthentication,
        })
        console.log('当前流程子订单为：'+subOrderId)
        if (!subOrderId) {
            console.log('当前流程子订单不存在')
        }
        const stack = getCurrentPages()
        if (stack.length == 1) {
            this.setData({ firstStack: true })
        }
        if (!cwx.user.isLogin()) {
            await this.ctripLogin()
        }
        this.getIsOrderSelf().then(data => {
            this.getAccePacketInfo()
            this.getAccePacketInfo()
            this.getLuckyStarListInfo()

            GetShareImgNew().then(imgUrls => {
                const imgArr = JSON.parse(imgUrls)
                this.setData({ shareImgs: imgArr })
            })


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

            util.ubtTrace('s_trn_c_trace_10650033089', { exposureType: 'pv', bizKey: 'pageviewExposure' })

            getConfigInfoJSON('train_wx_share_config')
                .then(res => {
                    this.setData({ hideShareFlag: res?.hideShareFlag })
                })
        })
    },
    onShow() {
        this.onShareCb()
    },
    goBack() {
        if (this.data.firstStack) {
            cwx.reLaunch({
                url: '/pages/home/homepage',
            })
        } else {
            cwx.navigateBack()
        }
    },
    getIsOrderSelf() {
        const deferred = util.getDeferred()
        const params = {
            OrderId: this.data.oid,
            ver: 1,
            Channel: 'WX',
        }
        OrderDetailModel(params, data => {
            // auth 失效的情况要注意
            if (data.ResponseStatus && data.ResponseStatus.Errors && data.ResponseStatus.Errors.length) {
                // this.wxLogin()
                if (data.ResponseStatus.Ack == 'Failure') {
                    let errors = data.ResponseStatus.Errors
                    let errorCode = errors[0].ErrorCode
                    if (errors.length > 0) {
                        let Message = errors[0].Message || ''
                        if (errorCode == '-1' && Message.indexOf('不属于用户') > -1) {
                            setTimeout(util.goToHomepage, 1500)
                        } else if (errorCode.indexOf('MobileRequestFilterException') !== -1) { // auth失效
                            setTimeout(util.goToHomepage, 1500)
                        }
                    }

                    return
                }
                util.showModal({
                    m: data.RetMessage || '系统异常，请稍后重试',
                })
                setTimeout(util.goToHomepage, 2500)
                deferred.reject()
                return
            } else if (Object.keys(data).length === 0) {
                util.showModal({
                    m: data.RetMessage || '系统异常，请稍后重试',
                })
                deferred.reject()
                return
            } else {
                deferred.resolve(data)
            }
        }, err => {
            deferred.reject(err)
            return
        }, () => { })
        return deferred.promise
    },
    // 获取当前助力信息
    getAccePacketInfo() {
        let { oid, subOrderId } = this.data
        if (!oid) {
            return
        }
        let params = {
            OrderNumber: oid,
            FromType: 1,
            ChangeOrderNumber: subOrderId,
            IsRiskSwitch:true
        }
        GrabTicketFlowShared(params, res => {
            if (res.RetCode == 0) {
                this.setData({
                    isLoadFinish: true,
                    accePacketInfo: {
                        LightningLevel: res.LightningLevel || 1, // 当前助力度等级
                        SpeedLevelDesc: res.SpeedLevelDesc?.replace(/<font[\s]+color=([^>]*)>([^<]*)<\/font>/ig, "<span style='color:$1;'>$2</span>") || '', // 等级的描述
                        PassageCount: res.PassageCount || 0, // 好友助力人数
                        FlowPacketCount: res.FlowPacketCount || 0, // 好友助力包
                    },
                    currentLevel: speed[(res.LightningLevel || 1) - 1],
                    speedTaskAbVersion: res.TaskAbVersion?.toUpperCase() || 'A',
                })
                this.getAcceleTaskList()
                this.checkIsCanGiftPackageForWx()
                this.getQconfig()
            }
        }, () => {

        }, () => {

        })
    },
    // 校验是否可以增加助力包
    checkIsCanGiftPackageForWx() {
        let { oid, subOrderId } = this.data
        let params = {
            OrderNumber: subOrderId || oid + '',
        }
        CheckIsCanGiftPackageForWxModel(params, res => {
            if (res.RetCode == 1 && res.ShareTypeList && res.ShareTypeList.length > 0) {
                let shareFriend = res.ShareTypeList.find(item => item.ShareType == 1)
                let shareCircle = res.ShareTypeList.find(item => item.ShareType == 2)
                this.setData({
                    shareTypeInfo: {
                        shareFriend,
                        shareCircle,
                    },
                })
            } else {
                this.setData({
                    shareTypeInfo: '',
                })
            }
        }, () => {
            this.setData({
                shareTypeInfo: '',
            })
        }, () => {

        })
    },
    // 分享后送助力包
    getTrainGiftPackageForWx(type) {
        let { oid, shareTypeInfo = {} } = this.data
        let params = {
            OrderNumber: oid + '',
            ShareType: type, // 1为分享至群， 2为分享至朋友圈
        }
        let count = 0
        if (type == 1) {
            count = shareTypeInfo.shareFriend.GiftPackageNum || 1
        } else {
            count = shareTypeInfo.shareCircle.GiftPackageNum || 1
        }
        TrainGiftPackageForWxModel(params, res => {
            if (res.RetCode == 1 && res.IsSuccess) {
                util.showToast(`分享成功，获得${count}份助力包`, 'none')
                this.getAccePacketInfo()
            } else {
                util.showToast('获取助力包失败', 'none')
            }
        }, () => {
            util.showToast('获取助力包失败', 'none')
        })
    },
    // 获取小程序配置
    getQconfig() {
        const payload = {
            keys: ['wechat_mini_grab_share']
        }
        getConfigByKeysModel(payload, res => {
            const { resultCode, resultMessage, configs } = res

            if (resultCode != 1) throw new Error(resultMessage)
            configs.forEach(({ key, data }) => {
                if (key == 'wechat_mini_grab_share') {
                    this.setData({
                        closeInviteRobShare: data[shared.traceChannel].closeInviteRobShare,
                        closeInviteDoubleRobShare: data[shared.traceChannel].closeInviteDoubleRobShare,
                        ruleList: data[{
                            A: "ruleListA",
                            B: "ruleListB"
                        }[this.data.speedTaskAbVersion]]
                    })
                    if (data[shared.traceChannel].closeInviteRobPageShare) {
                      cwx.hideShareMenu()
                    }
                }
            })
        })
    },
    // 获取任务列表
    getAcceleTaskList() {
        let params = {
            Channel: 'ctripwx',
            FromType: this.data.subOrderId ? 1 : 0,
            OrderNumber: this.data.oid
        }
        GetGrabOrderAcceleratedTaskList(params, res => {
            if (res.RetCode == 1 && res.TaskList && res.TaskList.length >= 0) {
                this.setData({
                    taskList: res.TaskList,
                })
                res.TaskList.forEach(item => {
                    util.ubtTrace('s_trn_c_trace_10650033089', {
                        exposureType: 'normal',
                        bizKey: 'freePackage',
                        type: item.TaskID,
                        state: item.TaskStatus,
                        channel: "WX",
                    })
                });
            } else {
                this.setData({
                    taskList: [],
                })
            }
        }, () => {
            this.setData({
                taskList: [],
            })
        }, () => {

        })
    },
    getMoreAssistTaskList(e) {
        console.log('市场组件length:'+e.detail.taskList.length)
        if (e.detail.taskList.length === 0) {
            this.setData({
                showMarketComponent:true
            })
        }
    },
    userAcceptMoreAssistTaskPrize(e) {
        this.getAccePacketInfo()
    },
    clickTab(e) {
        const {
            index,
        } = e.target.dataset
        if (index == 0) {
            this.setData({
                showTag: false,
            })
        }
        this.setData({
            curTabIndex: index,
        })
    },
    copyText(e) {
        const {
            text,
        } = e.target.dataset
        const currentUser = this.data.LuckyStarList.find(v => v.NickName === text)
        const { UserId, LuckyStarType } = currentUser

        util.copyText(text, '已复制好友昵称到剪贴板')

        if (LuckyStarType == 1) {
            util.ubtTrace('c_trn_c_10650033089', { bizKey: 'assistInviteFuxing', userid: UserId })
        }
    },
    getLuckyStarListInfo() {
        const params = {
            OrderNumber: this.data.oid,
        }
        GetLuckyStarListInfoModel(params, res => {
            if (res.RetCode == 1) {
                const {
                    LuckyStarList,
                } = res
                this.setData({
                    LuckyStarList,
                })
                if (LuckyStarList && LuckyStarList.length) {
                    let curTabIndex = LuckyStarList.some(item => item.Status == 0) ? 1 : 0
                    this.setData({
                        curTabIndex,
                        showTag: Boolean(curTabIndex),
                    })
                    this.ubtTrace('c_train_acctask_invitefx_show', true)
                }
            } else {
                // util.showToast('获取福星列表信息失败', 'none')
            }
        })
    },
    // 切换规则展示
    toggleShowRulePrompt(e) {
        let type = e.target.dataset.type || ''
        this.setData({
            showRulesPrompt: type == 'show',
        })
    },
    // 邀请好友助力
    inviteRob() {
        util.ubtTrace('c_trn_c_10650033089', { bizKey: 'inviteFriendZhuliClick' })
        let { accePacketInfo = {} } = this.data
        let { LightningLevel = 1 } = accePacketInfo
        if (LightningLevel >= 6) {
            util.showModal({
                m: '本单已到达好友助力最高速',
            })
        } else {
            this.setData({
                showRobPrompt: true,
            })
        }
    },
    // 关闭分享浮层
    closeRobSharePrompt() {
        let { showRobPrompt } = this.data
        if (showRobPrompt) {
            this.setData({
                showRobPrompt: false,
            })
        }
    },
    // 点击任务
    clickTask(e) {
        console.log(e)
        let { dataset = {} } = e.target
        let { taskId = '', taskStatus = '', acceleratePackageNum = 0 } = dataset

        util.ubtTrace('c_trn_c_10650033089', {
            bizKey: 'freePackageClick',
            type: taskId,
            state: taskStatus,
            channel: "WX"
        })

        const taskInfo = this.data.taskList.find(task => task.TaskID === taskId)
        console.log('taskInfo', taskInfo)
        if (!taskInfo.HotelTaskActionId) {
            console.log('获取到了HotelTaskActionId')
        }

        if (taskStatus == 2) {
            if (taskId === 6 || taskId === 9) {
                this.goHotelPage(taskId)
            }
            return
        } else if (taskStatus == 1) {
            this.getTaskReward(taskId, acceleratePackageNum)
        } else {
            if (taskId == 1) {
                this.goBind12306()
            } else if (taskId == 2) {
                this.goWeChatPage()
            } else if (taskId === 3) {
                this.goActive()
            } else if (taskId === 12) {
                this.goActive(taskId)
            } else if (taskId === 6 || taskId === 9) {
                this.goHotelPage(taskId)
            } else if (taskId === 13 || taskId === 19) {
                this.goEnterprisePage(taskId)
            }
        }
    },
    // 浏览酒店、民宿任务
    goHotelPage(taskId) {
        const taskInfo = this.data.taskList.find(task => task.TaskID === taskId)
        if (taskInfo.TaskStatus == 0) {
            let params = {
                HotelTaskActionId: taskInfo.HotelTaskActionId || '',
                FromType: 1,
                OrderNumber: this.data.oid,
                TaskId: taskId,
            }
            ReceiveHotelTask(params, res => {
                console.log('ReceiveHotelTask', res)
                if (res.RetCode == 1 && res.Result == 1 && res.JumpUrl) {
                    this.ReceiveHotelTaskCoupon(taskId, res.JumpUrl)
                }
            })
        } else {
            console.log('sb', taskInfo.JumpUrl)
            cwx.navigateTo({
                url: taskInfo.JumpUrl[0] === '/' ? taskInfo.JumpUrl : '/' + taskInfo.JumpUrl
            })
        }
    },
    // 领取酒店任务发放优惠券
    async ReceiveHotelTaskCoupon(taskId, url) {
        let activityCode = ''
        if (taskId === 6) {
            activityCode = 'fbce5c8812724fb0cd7d452abba9f7a3'
        } else if (taskId === 9) {
            activityCode = '8180f914347831d22f2e21112a40e7fd'
        }
        const params = {
            ActivityCode: activityCode,
            Channel: 'wx',
            OrderNumber: this.data.oid,
        }
        GetActivityCouponInfoModel(params, res => {
            try {
                console.log('GetActivityCouponInfoModel', res)
                if (res.RetCode == 1) {
                    this.setData({
                        taskRwardInfo: {
                            Title: res.Tittle,
                            SubTitle: res.SubTittle,
                            CouponList: res.CouponItemList.map((item) => ({
                                Title: item.Tittle,
                                SubTitle: item.SubTittle,
                                Amount: item.Price,
                                Unit: '元'
                            })),
                            JumpUrl: url
                        }
                    })
                    console.log('taskRwardInfo', this.data.taskRwardInfo)
                    ActivitySendCouponModel(params, res => {
                        console.log('ActivitySendCouponModel', res)
                        if (res.RetCode == 1) {
                            this.setTaskNavigateCountDown(url)
                            this.setData({
                                showMask: "assistTaskReceived"
                            })
                        } else {
                            cwx.navigateTo({
                                url: url[0] === '/' ? url : '/' + url
                            })
                        }
                    })
                } else {
                    cwx.navigateTo({
                        url: url[0] === '/' ? url : '/' + url
                    })
                }
            } catch (error) {
                cwx.navigateTo({
                    url: url[0] === '/' ? url : '/' + url
                })
            }
        })
    },
    // 企微任务跳转
    goEnterprisePage(taskId) {
        const taskInfo = this.data.taskList.find(task => task.TaskID === taskId)
        if (taskId === 13) {
            cwx.navigateTo({
                url: `/pages/trainActivity/twebview/index?url=https%3A%2F%2Fm.ctrip.com%2Fwebapp%2Ftrain%2Factivity%2Fctrip-train-account-assist%2FenterpriseAppAssist%3Fsource%3DappTask`
            })
        } else if (taskId === 19) {
            if (taskInfo.JumpUrl) {
                cwx.navigateTo({
                    url: taskInfo.JumpUrl[0] === '/' ? taskInfo.JumpUrl : '/' + taskInfo.JumpUrl
                })
            } else {
                let params = {
                    HotelTaskActionId: taskInfo.HotelTaskActionId || '',
                    FromType: 1,
                    OrderNumber: this.data.oid,
                    TaskId: taskId,
                }
                ReceiveHotelTask(params, res => {
                    if (res.RetCode == 1 && res.Result == 1 && res.JumpUrl) {
                        cwx.navigateTo({
                            url: res.JumpUrl[0] === '/' ? res.JumpUrl : '/' + res.JumpUrl
                        })
                    }
                })
            }
        }
    },
    // 绑定12306
    goBind12306() {
        this.navigateTo({
            url: `../webview/webview`,
            data: {
                url: `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/login?from=booking`,
                bridgeIns: () => {
                    // this.getAcceleTaskList()
                }, // 回调函数
                needLogin: true,
            },
        })
    },
    // 关注公众号
    goWeChatPage() {
        this.navigateTo({
            url: `../webview/webview`,
            data: {
                url: `https://m.ctrip.com/webapp/train/activity/ctrip-official-account-event/?source=mini-grab-task`,
                bridgeIns: () => {
                    // this.getAcceleTaskList()
                }, // 回调函数
                needLogin: true,
            },
        })
    },

    goActive(taskId) {
        login12306({
            from: 'orderdetail',
            push: 2, // 候补流程需要会员核验，0不需激活，1普通激活，2不可跳过激活, 3可跳过激活切登录message回调不在登录完成触发，在流程最后触发
            success: data => {
                const [{
                    userName = '',
                    loginPW = '',
                }] = data
                let formType = -1
                formType = taskId == 12 ? 8 : -1
                this.bind12306ToOrder(userName, loginPW, formType).then(data => {
                    if (data.RetCode == 1) {
                        this.singleToDouble()
                    }
                }).catch(e => {
                    console.error(e)
                })
            },
        })
    },
    singleToDouble() {
        util.showLoading()
        const params = {
            OrderNumber: this.data.oid,
            FromType: 2, //请求来源，0=单转双(先扣钱)，1=重新开启双通道，2单通道转双通道（登录账号)(什么时候候补成功什么时候扣钱)
        }
        TrainSingleChannelToDoubleChannelModel(params, res => {
            if (res.RetCode == 1) {
                console.log('single to double success')
                setTimeout(() => {
                    util.hideLoading()
                    this.getAcceleTaskList()
                }, 2000)
            } else {
                util.hideLoading()
                util.showToast('none', res.RetMessage || '开启双通道抢票失败')
            }
        })
    },
    hidePop() {
        this.setData({
            popType: '',
        })
    },
    bind12306ToOrder(account, pwd, loginFrom) {
        const params = {
            Channel: 'ctripwx',
            FromType: loginFrom, // 0=候补订单候补失败(有待兑现订单)时添加账号，1=秒杀时添加账号，2=无账号下单用户添加账号，3=代购购票中添加账号，4=抢票购票中添加账号，5=无账号代购购票中引导用户添加账号
            OrderNumber: this.data.oid,
            UserName12306: account,
            Password12306: pwd,
            ExtendInfoList: [],
        }

        return AddOrderAccountInfoPromise(params)
    },
    // 领取奖励
    getTaskReward(taskId, rewardNum) {
        let {
            oid,
        } = this.data
        let params = {
            Channel: 'ctripwx',
            TaskID: taskId + '',
            OrderNumber: oid + '',
            SubOrderNumber: '',
        }
        GrabAccelerateTask(params, res => {
            if (res.RetCode == 1 && res.IsSuccess) {
                this.setData({
                    taskRwardInfo: {
                        Title: '恭喜您，领取奖励成功',
                        Content: `已为您增加${rewardNum}个助力包`,
                        TrainRewardInfoList: [
                            { Content: `助力包+${rewardNum}` },
                            { Content: `省下￥${rewardNum * 2}` }
                        ],
                        rewardNum,
                        price: rewardNum * 2,
                    },
                    showMask: 'assistTaskSucceed'
                })
                // util.showToast(`恭喜您完成任务，${rewardNum}个助力包已为您加至此订单中`, 'none')
                this.getAccePacketInfo()
                // 订单详情再传一个方法来刷新订单的数据
            } else {
                util.showToast('领取失败')
            }
        }, () => {
            util.showToast('领取失败，请稍后重试')
        }, () => {

        })
    },
    reAuthorize(e) {
        if (e.detail.authSetting['scope.writePhotosAlbum']) {
            this.setData({
                hasRejectAlbum: false,
            })
        }
    },
    // 分享朋友圈
    // 1.获取分享链接
    // 2.下载图片并保存 (已授权)
    // 3.展示分享图
    saveAndShowPost() {
        util.ubtTrace('c_trn_c_10650033089', {
            bizKey: 'assistSharePopupClick',
            scene: 1,
        })
        this.setData({
            showRobPrompt: false,
        })
        this.getRobShareImg()
            .then(this.saveImageToAlbumHandle)
    },
    onClickSaveSharePost() {
        this.saveAndShowPost()
        util.ubtTrace('c_trn_c_10650033089', { bizKey: "savePicShare" })
    },
    getRobShareImg() {
        util.showLoading()
        let { oid, astation, dstation } = this.data
        let params = {
            ShareKey: oid,
            FromStation: dstation,
            ToStation: astation,
            PassagePhotoUrl: '',
        }

        return GetShareImgPromise(params)
            .then(res => {
                util.hideLoading()
                this.setData({
                    sharePic: res.ImgUrl,
                })
            })
            .catch(() => {
                throw util.showToast('生成图片失败', 'none')
            })
    },
    saveImageToAlbumHandle() {
        let self = this
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
                            util.showToast('请先授权相册')
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
    downloadFile() {
        let self = this

        return new Promise((resolve, reject) => {
            wx.downloadFile({
                url: self.data.sharePic,
                success(res) {
                    // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                    if (res.statusCode === 200) {
                        if (res.tempFilePath) {
                            self.setData({ tempFilePath: res.tempFilePath })
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
                    showShareImage: true,
                })
            },
            fail(res) {
                console.log(res)
                util.showToast('保存失败', 'none')
            },
        })
    },
    hideShareImage() { // 隐藏背景图片
        this.setData({
            showShareImage: false,
        })
        let { shareTypeInfo = '' } = this.data
        if (!!shareTypeInfo && shareTypeInfo.shareCircle && shareTypeInfo.shareCircle.IsCanGiftPackage) {
            // this.getTrainGiftPackageForWx(2)
        }
    },
    onClickShareFriend() {
        util.ubtTrace('c_trn_c_10650033089', {
            bizKey: 'assistSharePopupClick',
            scene: 0,
        })
    },
    onShareAppMessage(e) { // 好友分享
        this.setData({
            showRobPrompt: false,
        })
        let { shareTypeInfo = '', astation, subOrderId, oid, shareImgs } = this.data
        let canRewardAcc = !!shareTypeInfo && shareTypeInfo.shareFriend && shareTypeInfo.shareFriend.IsCanGiftPackage
        if (e.from === 'button' && e.target.id === 'robtaskshare' && canRewardAcc) {
            this.shareFlag = true
        }
        const userinfo = wx.getStorageSync('USERINFO')

        return util.getRobShareObj({
            ArriveStation: astation,
            oid,
            avatar: encodeURIComponent(userinfo.avatarUrl),
            shareImgs,
            subOrderId: subOrderId,
            filterType: 'time',
            stuFlag: shared.stuFlag,
            sharePath: '/pages/train/robshare/robshare',
        })
    },
    onShareCb() { // 分享到好友的回调
        if (this.shareFlag) {
            // 完成分享的回调 以及相关交互
            // this.getTrainGiftPackageForWx(1)
            this.shareFlag = false
        }
    },
    ctripLogin() {
        return new Promise((resolve, reject) => {
            cwx.user.login({
                callback(res) {
                    if (res.ReturnCode == 0) {
                        resolve()
                    } else {
                        reject()
                    }
                },
            })
        })
    },
}

util.useMixin(page, [robCouponPop])

TPage(page)

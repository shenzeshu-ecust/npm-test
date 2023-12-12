import util from "../common/util";
import { cwx } from "../../../cwx/cwx";
import TPage from '../common/TPage'
import { shared } from "../common/trainConfig";
import { TrainActStore } from "../common/store";
import { getUserBindedPhoneNumber, getConfigInfoJSON } from "../common/common";
import {
    SendUserScenesMarketingInfoModel,
    GetUserScenesMarketingInfoModel,
    OrderDetailModel,
} from "../common/model";
import { subscribeMixin } from "../common/components/Subscribe/Subscribe";

const page = {
    checkPerformance: true,
    pageId: shared.pageIds.shareCoupon.pageId,
    data: {
        openId: "",
        scene: "", //  1 抢票 2 购票 3 智能改签抢 4 专人抢 6 安心抢 7 vip抢 8 双通道
        oid: "",
        arriveStation: "", //  抢票站
        entrance: "",    //  渠道埋点 0: 小程序渠道分享  1: APP渠道分享  2：APPpush  3: 弹窗  4: 截屏图片 5: app朋友圈分享
        OrderSource: '',
        scollMove: false, //  顶部导航栏滚动
        isLogin: false,
        firstStack: false,
        userInfo: null,
        mobile: "",
        showMask: '',
        isBagOpen: 1, //  红包开启状态 0 未开 1 打开 2 关闭
        isReceived: false, //  旧版红包页面步骤
        ImgUrl: "", //  老版本智能改签抢 bg
        RuleList: [],
        isGiftRuleOpen: false, //  权益规则弹窗
        PackageInfoList: [], //  礼包列表
        CouponRuleList: [], //  优惠券规则
        sceneConfig: {}, //  主副标题配置
        scrollView: "",
        floatBox: true, //  右下角浮动盒子
        floatScene: false,  //  盒子是否需要出现
        subscribeStatus: [  // 优惠券到期 获得奖励 活动进度提醒  // 市场和后端都需要订阅和查询
            {
                id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY",
                FromType: 7,
                ActivityCode: "DueReminder",
            },
            // {
            //     id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q",
            //     FromType: 7,
            //     ActivityCode: "EarnRewards",
            // },
            // {
            //     id: "BsQ-j76DZe4wkyVw-3qnZ-U2qwGCH9ugw-xyuBIwbXs",
            //     FromType: 7,
            //     ActivityCode: "ActivityProgressReminder",
            // },
        ],
    },
    async onLoad(options) {
        const { oid, scene, arriveStation, channel, OrderSource } = options;
        this.setData({
            oid,
            scene,
            arriveStation,
            entrance: channel,
            OrderSource: OrderSource || 'TRA_EffectExter_Guide_CreateOrder'
        });

        this.loginDeferred = util.getDeferred();

        const stack = getCurrentPages();
        if (stack?.length == 1) {
            this.setData({ firstStack: true });
        }

        this.getConfig();
        this.getOpenId();
        this.checkCanSubscribe()

        cwx.getSystemInfo({
            success: (res) => {
                let systemHeight = res.windowHeight;
                let statusBarHeight = res.statusBarHeight;
                this.setData({
                    systemHeight,
                    statusBarHeight,
                });
            },
        });

        if (cwx.user.isLogin()) {
            cwx.user.checkLoginStatusFromServer((data) => {
                if (!data) {
                    cwx.user.logout(() => {
                        this.setData({ isLogin: false, showMask: 'awaitOpenPop' });
                    });
                } else {
                    this.setData({ isLogin: true });
                    this.checkUserInfo();
                    this.firstReceivePackage();
                    this.checkSubscribeStatus();
                }
            });
        } else {
            cwx.user.wxLogin(() => {});
            this.setData({ showMask: 'awaitOpenPop' });
            util.ubtTrace('s_trn_c_trace_10650068442', {
                exposureType: "popup",
                bizKey: 'unloginPopupExposure'
            })
        }

        // 是否非本人判断
        if (this.data.entrance == '2' || this.data.entrance == '3') {
            this.checkIsSelf()
        }

        // 红包浮标
        const floatScene = [3,4,5,6,7,8].includes(scene * 1)
        this.setData({ floatScene })
        this.intersectionOb = cwx
            .createIntersectionObserver()
            .relativeToViewport({ bottom: -400 })
            .observe("#coupon-box", (res) => {
                this.setData({ floatBox: !res.intersectionRatio });
            });

        // 埋点
        util.ubtTrace("s_trn_c_trace_10650068442", {
            exposureType: "normal",
            bizKey: "enterAwaitReceive",
            scenes: scene,
            entrance: channel,
            duid: cwx.user.duid,
        });
        console.log("效果外化页面加载完毕", options);
    },
    onUnload() {
        this.intersectionOb?.disconnect();
    },
    getConfig() {
        getConfigInfoJSON("ctrip-shareCoupon-scene").then((data) => {
            const current = data?.find((v) => v.scene == this.data.scene);
            this.setData({ sceneConfig: current });
        });

        getConfigInfoJSON("ctrip-shareCoupon-rule").then((data) => {
            this.setData({ RuleList: data });
        });
    },
    // 领取礼包
    SendUserScenesMarketingInfo() {
        const params = {
            ScennesInfoList: [],
            SourceType: 2,
            IsBISource: false,
            OrderNumber: this.data.oid
        };

        return util
            .promisifyModel(SendUserScenesMarketingInfoModel)(params)
            .then(({ RetCode, RetMessage, IsSuccess }) => {
                if (RetCode !== 1 || IsSuccess !== 1) {
                    util.showToast(RetMessage, "none");
                    return Promise.reject();
                }

                this.setData({ isReceived: IsSuccess === 1 });
            })
            .catch((_) => {
                util.showToast("网络错误,请稍后重试", "none")
            });
    },
    // 礼包详情
    GetUserScenesMarketingInfo() {
        const params = {
            SourceType: 2,
            IsBISource: false,
            OrderNumber: this.data.oid,
        };

        return util
            .promisifyModel(GetUserScenesMarketingInfoModel)(params)
            .then(({ RetCode, RetMessage, MarketingInfoList }) => {
                    const [{ PackageInfoList, Status }] = MarketingInfoList

                    if (RetCode !== 1) {
                        util.showToast(RetMessage, "none");
                        return;
                    }

                    this.setData({ PackageInfoList });
                    return {Status, PackageInfoList};
                }
            )
    },
    firstReceivePackage() {
        return this.GetUserScenesMarketingInfo()
            .then(({Status, PackageInfoList}) => {
                // 领取过礼包
                if (Status == 1) {
                    const isExpired = PackageInfoList.some(v => v.Status == 1)

                    this.setData({ isReceived: true, showMask: '' });
                    isExpired && util.showToast('一个用户仅限领取一次，过期无效', 'none')

                    // 埋点
                    util.ubtTrace("s_trn_c_trace_10650068442", {
                        exposureType: "normal",
                        bizKey: "receiveSuccessPage",
                        scenes: this.data.scene,
                        duid: cwx.user.duid,
                        entrance: this.data.entrance,
                    });
                    return Promise.reject();
                }

                this.setData({ showMask: 'awaitOpenPop' });
                return Promise.resolve();
            })
            .catch(_ => _);
    },
    // 获取用户 openid
    getOpenId() {
        return util.getOpenId().then((id) => {
            this.setData({ openId: id || cwx.cwx_mkt.openid });
        });
    },
    checkUserInfo() {
        // 必须是在用户已经授权的情况下调用
        let userInfo = TrainActStore.getAttr("USERINFO");
        if (userInfo && userInfo.openid == cwx.cwx_mkt.openid) {
            this.setData({
                userInfo,
            });
        }
        return Promise.resolve()
    },
    checkCanSubscribe() {
        const store = TrainActStore.getAttr('SHARECOUPONSUB')

        return !store
    },
    setStorage() {
        const arr = TrainActStore.getAttr('SHARECOUPONSUB') || []
        arr.push({ timeout: 24 * 60 })
        TrainActStore.setAttr('SHARECOUPONSUB', [...new Set(arr)])
    },
    myAuthorize({ resolve, reject }) {
        cwx.user.login({
            param: {},
            callback: (res) => {
                if (res.ReturnCode === '0') {
                    this.setData({ isLogin: true });
                    return resolve()
                }
                return reject()
            }
        })
    },
    checkHasBindMobile() {
        if (!this.data.isLogin) return;

        return getUserBindedPhoneNumber()
            .then((res) => {
                if (res) {
                    this.setData({
                        userBindedPhoneNumber: res,
                    });
                }
            })
            .catch((e) => {
                console.log(e);
            });
    },
    getUserPhoneAndAcceBack(){
        this.onClickBagHide()
        this.getUserPhoneAndAcce()
    },
    // 手机号授权
    getUserPhoneAndAcce() {
        this.myAuthorize({
            resolve: () => {
                this.checkHasBindMobile()
                    .then(this.checkUserInfo)
                    .then(this.checkSubscribeStatus)
                    .then(this.firstReceivePackage)
                    .finally(() => {
                        util.ubtTrace("s_trn_c_trace_10650068442", {
                            exposureType: "normal",
                            bizKey: "awaitReceiveLogin",
                            scenes: this.data.scene,
                            duid: cwx.user.duid,
                            entrance: this.data.entrance,
                        });
                    })
            },
            reject: () => {
                util.showToast("用户拒绝授权", "none");
            },
        });

        util.ubtTrace('c_trn_c_10650068442', { bizKey: "unloginPopupClick" })
    },
    noop() {}, //  有用 别删
    onClickBagOpen() {
        util.ubtTrace("c_trn_c_10650068442", {
            bizKey: "getGiftClick",
            scenes: this.data.scene,
            duid: cwx.user.duid,
            entrance: this.data.entrance,
        });

        this.SendUserScenesMarketingInfo()
            .then(this.GetUserScenesMarketingInfo)
            .then(({Status}) => {
                debugger
                if (Status === 1) {
                    this.setData({ isReceived: true, showMask: 'openPop' });
                    util.ubtTrace("s_trn_c_trace_10650068442", {
                        exposureType: "popup",
                        bizKey: "receiveSuccessPopup",
                        scenes: this.data.scene,
                        duid: cwx.user.duid,
                        entrance: this.data.entrance,
                    });
                }
            });
    },
    onClickBagHide() {
        this.setData({ showMask: '' });

        // 埋点
        util.ubtTrace("s_trn_c_trace_10650068442", {
            exposureType: "normal",
            bizKey: "receiveSuccessPage",
            scenes: this.data.scene,
            duid: cwx.user.duid,
            entrance: this.data.entrance,
        });
    },
    // 权益规则
    onClickGiftRuleShow(e) {
        const { idx } = e && e.currentTarget.dataset;
        const { CouponRuleList } = this.data.PackageInfoList[idx];
        this.setData({ isGiftRuleOpen: true, CouponRuleList });
    },
    onClickGiftRuleHide() {
        this.setData({ isGiftRuleOpen: false });
    },
    // 俩个唤起订阅的按钮
    onClickBuyTicket() {
        this.requestSubscribe().finally(this.toHomePage)
        util.ubtTrace('c_trn_c_10650068442', {
            bizKey: "toBuyTicket",
            duid: cwx.user.duid,
            entrance: this.data.entrance
        })
    },
    onClickAlertShare() {
        this.requestSubscribe()
            .finally(this.onClickBagHide)

        util.ubtTrace('c_trn_c_10650068442', {bizKey: 'takeRewardPopupClick'})
    },
    onClickHideAndSubscribe() {
        this.requestSubscribe()
            .then(this.onClickBagHide)

        util.ubtTrace("c_trn_c_10650068442", {bizKey: "takeRewardPopupClose"})
    },
    goBack() {
        if (!this.data.firstStack) {
            cwx.navigateBack();
        } else {
            cwx.switchTab({
                url: "/pages/home/homepage",
            });
        }
    },
    toHomePage() {
        const params = `OrderSource=${this.data.OrderSource}`
        util.goTrainHome(params)
    },
    onShareAppMessage({ from }) {
        const { oid, scene, arriveStation, entrance } = this.data;
        const shareInfo = [
            {
                imageUrl:
                    "https://images3.c-ctrip.com/train/2021/app/V8.41.6/xiaochengxu/xiaoguowaihua/img-share2.png",
                title: `去${arriveStation}抢票成功，送你幸运红包。快来拆开看看`,
                scenes: [1,4,5,6,7,8]
            },
            {
                imageUrl:
                    "https://images3.c-ctrip.com/train/2021/app/V8.41.6/xiaochengxu/xiaoguowaihua/img-share1.png",
                title: "你的好友分享一个红包给你，快来领火车票",
                scenes: [2]
            },
            {
                imageUrl:
                    "https://images3.c-ctrip.com/train/2021/app/V8.41.6/xiaochengxu/xiaoguowaihua/img-share3.png",
                title: "你的好友分享一个红包给你，快来领火车票",
                scenes: [3]
            },
        ];
        const info = shareInfo.find(({ scenes }) => scenes.includes(Number(scene)));
        delete info['scenes']

        if (from === "button") {
            util.ubtTrace("c_trn_c_10650068442", {
                bizKey: "shareFriendClick",
                scenes: scene,
                entrance,
                duid: cwx.user.duid,
                entrance: this.data.entrance,
            });
        }

        return {
            bu: "train",
            path: `/pages/train/shareCoupon/shareCoupon?oid=${oid}&scene=${scene}&channel=0&arriveStation=${arriveStation}`,
            ...info,
        };
    },
    scrollMove(e) {
        const { scrollTop } = e.detail;
        if (scrollTop > 44) {
            !this.data.scollMove && this.setData({ scollMove: true });
        } else {
            this.data.scollMove && this.setData({ scollMove: false });
        }
    },
    moveto() {
        this.setData({ scrollView: "coupon-box" });
    },
    async checkSubscribeStatus() {
        const subscribeStatus = await subscribeMixin.checkSubscribeStatus(this.data.subscribeStatus)
        this.setData({ subscribeStatus })
    },
    requestSubscribe() {
        console.log('是否可以订阅', this.checkCanSubscribe(), this.data.subscribeStatus)
        if (!this.checkCanSubscribe()) return Promise.resolve()

        const payload = {
            OrderNumber: this.data.oid,
            OpenID: this.data.openId,
        }
        return subscribeMixin.requestSubscribe(this.data.subscribeStatus, payload)
            .then(({ errMsg }) => {
                if (errMsg) {
                    util.ubtTrace('c_trn_c_10650068442', {bizKey: "subScribeClick", result: 0})
                    return
                }
                this.setStorage()   //  一天允许用户订阅一次
                util.ubtTrace('c_trn_c_10650068442', {bizKey: "subScribeClick", result: 1})
            })
            .catch(_ => _)
    },
    // 判断是否是本人跳转订单详情
    checkIsSelf() {
        const params = {
            OrderId: this.data.oid,
            ver: 1,
            Channel: 'WX'
        }
        util.showLoading()
        util.promisifyModel(OrderDetailModel)(params)
            .then((data) => {
                util.hideLoading()
                if (!data?.ResponseStatus?.Errors?.length && Object.keys(data).length) {
                    cwx.reLaunch({ url: `/pages/train/orderdetail/orderdetail?oid=${this.data.oid}` })
                }
            })
    }
};

TPage(page);

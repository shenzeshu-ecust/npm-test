import {
    cwx,
    _,
    CPage,
    BusRouter,
    Utils,
    Pservice,
    BusConfig,
} from '../index.js';
import DefaultData, { changeOwner } from './defaultState';
import shareMenu from '../common/template/shareMenu.js';
import shareModal from '../common/template/shareModal';

function message() {
    let now = new Date().getTime();
    let hour = now / 1000 / 60 / 60 - 460700;
    return `${parseInt(12345 + hour * 134, 10)}人已经获得，狂撒1000万`;
}
CPage({
    customStyle: {
        frontColor: '#000000',
    },
    data: {
        navbarData: {
            showBack: false,
            showCapsule: true,
            customBack: true,
            customHome: true,
            showColor: false,
            navigationBarColor: '#ffffff',
        },
        selectedTabIndex: 0,
        activity: changeOwner(DefaultData),
        avatarArray: [
            {
                letter: '+',
                mock: true,
            },
            {
                userNick: 'test1',
                letter: '+',
                userIcon:
                    'https://pages.c-ctrip.com/bus-images/rn_bus/share/headIcon.png',
            },
        ],
        showRulesModal: false, //提现规则弹窗
        showOverTimeModal: false, //提现超时弹窗
        showSuccessModal: false, // 提现成功弹窗
        showStayModal: false, //挽留弹窗,
        showDismantleRecord: true, //帮拆弹框
        shareInfoData: {
            showShare: false,
        },
        modalData: {},
        reactTimeMessage: message(),
    },
    onLoad(options) {
        this.onUbtTrace(
            'exposure',
            'axtActivityPage_show',
            '安心退活动页曝光',
            ''
        );
        new shareMenu(this);
        new shareModal(this);
    },
    onShow() {
        BusRouter.isLogin(2).then(({ isLogin }) => {
            this.setData(
                {
                    isLogin,
                },
                () => {}
            );
            this.loadData();
        });
    },

    getTraceType() {
        let orderType = this.orderType;
        let big_client_type = BusConfig.big_client_type;

        if (orderType === 'offlineOrder') {
            if (big_client_type === 'wechatxcx') {
                return 'ctripxcx_wx_offline';
            }
            if (big_client_type === 'alixcx') {
                return 'ctripxcx_alipay_offline';
            }
        }
        return 'ctripwxxcx';
    },
    loadData() {
        let options = this.options;
        let orderType = options.orderType || '';
        this.orderType = orderType;
        this.orderNumber = options.orderNumber || '';
        this.activityId = options.activityId || '';

        let traceType = this.getTraceType();
        this.loadActivity(options)
            .then((data) => {
                let activity = data.activity;
                this.setData(data);
                this.updateShareData(activity);
                this.participateActivity(activity);
            })
            .catch((err) => {
                //提示加载失败
            });
    },
    loadActivity(data) {
        let activityId = data.activityId;
        let orderNumber = data.orderNumber || '';

        let traceType = this.getTraceType();
        let params = {
            orderNumber: orderNumber,
        };
        if (activityId) {
            params.activityId = parseInt(activityId, 10);
        }
        return Pservice.activityInsuranceDetail(params)
            .then((res) => {
                let activity = res.data;
                if (!activity) {
                    throw res;
                }
                let state = { activity };
                return state;
            })
            .catch((err) => {
                let erActivity = null;
                if (err && err.data && err.data.rewardList) {
                    erActivity = err.data;
                }

                let activity = {};
                if (erActivity) {
                    console.log(activity);
                    activity = {
                        ...DefaultData,
                        ...erActivity,
                        status: 1,
                        activityId,
                    };
                } else {
                    activity = {
                        ...DefaultData,
                        status: 1,
                        activityId,
                    };
                    this.showShareModal({
                        message: err.message || '加载失败',
                        action: 'failLoadAction',
                        buttonTitle: this.data.isLogin ? '知道了' : '去登录',
                        canClose: this.data.isLogin ? true : false,
                    });
                }

                return { activity };
            })
            .then((res) => {
                let activity = res.activity;
                let data = this.formatAvatars(activity);

                let leftTime = activity.leftTime || '0';
                let nowDate = new Date();
                let time = nowDate.getTime() + parseInt(leftTime, 10) * 1000;
                let endDate = new Date(time);
                activity.endDateTime = endDate.format('yyyy-MM-dd hh:mm:ss');
                // activity.status = '2';

                // activity.activityOwner = true;
                if (activity.activityOwner) {
                    let title = Utils.formatHighLight(activity.title);
                    activity.activityTitle = title;
                } else {
                    let title = [];
                    switch (parseInt(activity.status, 10)) {
                        case 1:
                            {
                                title = [
                                    {
                                        text: '长按二维码，',
                                    },
                                    {
                                        text: '添加福利官',
                                        highLight: true,
                                    },
                                    {
                                        text: '为好友助力',
                                    },
                                ];
                            }
                            break;
                        case 2:
                            {
                                title = [
                                    {
                                        text: '本轮助力已完成',
                                    },
                                ];
                            }
                            break;
                        case 3:
                            {
                                title = [
                                    {
                                        text: '活动已结束',
                                    },
                                ];
                            }
                            break;
                        default: {
                            title = [
                                {
                                    text: '活动已结束',
                                },
                            ];
                        }
                    }

                    activity.activityTitle = title;
                }

                return {
                    ...res,
                    ...data,
                    activity,
                };
            });
    },
    failLoadAction() {
        console.log('gah');
        if (!this.data.isLogin) {
            BusRouter.checkLogin(2).then((res) => {
                this.loadData();
            });
        }
    },
    failJoinAction() {
        var pages = getCurrentPages();
        console.log(wx.canIUse('exitMiniProgram'), 'failJoinAction');
        if (pages.length > 1) {
            cwx.navigateBack();
        } else {
            if (wx.canIUse('exitMiniProgram')) {
                wx.exitMiniProgram({
                    success: function () {},
                });
            }
        }
    },
    participateActivity(activity) {
        if (!this.data.isLogin) return;
        if (activity.activityOwner) {
            return;
        }
        if (this.isParticipate) {
            return;
        }
        this.isParticipate = true;
        let activityId = activity.activityId;

        let params = {};
        if (activityId) {
            params.activityId = parseInt(activityId, 10);
        }
        return Pservice.orderInsuranceJoin(params)
            .then((res) => {
                this.isParticipate = false;
                if (res.code == 0) {
                    throw res;
                }
                this.hideLoading();

                let activityIn = res.data || {};

                let partStatus = activityIn.status || 3;

                // partStatus = 3;
                if (partStatus == 2) {
                    this.showShareModal({
                        message: activityIn.notice || '参与活动失败',
                        action: 'failJoinAction',
                    });
                }

                let partTitle = Utils.formatHighLight(activityIn.title || '');
                let partSubTitle = Utils.formatHighLight(
                    activityIn.subTitle || ''
                );

                this.setData({
                    activity: {
                        ...activity,
                        partTitle,
                        partStatus,
                        partSubTitle,
                        awardList: activityIn.awardList,
                    },
                });
            })
            .catch((err = {}) => {
                this.isParticipate = false;
                this.hideLoading();
                this.showShareModal({
                    message: err.message || '参与活动失败',
                });
            });
    },
    updateShareData(activity) {
        let link = `/pages/bus/share/index?orderNumber=${this.orderNumber}&activityId=${activity.activityId}`;
        this.updateShareInfo({
            share_title: activity.activityContent,
            share_bg_img:
                activity.imageUrl && activity.imageUrl.indexOf('http') == 0
                    ? activity.imageUrl
                    : '',
            share_link: link,
            share_desc: activity.activityContent,
            share_img: activity.imageUrl,
        });
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline'],
        });
        return { message: 'ok-' };
    },
    showRuleModal() {
        this.setData({ showRulesModal: true });
    },
    formatAvatars(activity) {
        let { assistList = [], maxNum = 2 } = activity;

        let avatarArray = assistList.map((item) => {
            return {
                userIcon: item.imageUrl,
                userNick: item.name,
            };
        });
        while (avatarArray.length < maxNum) {
            avatarArray.push({
                mock: true,
            });
        }
        return {
            avatarArray: avatarArray,
            canInvite: maxNum - assistList.length > 0,
        };
    },
    clickTab(e) {
        let id = parseInt(e.currentTarget.id);
        this.setData({
            selectedTabIndex: id,
        });
    },
    onUbtTrace(type, typeSnd, comment, content) {
        let key =
            type === 'click'
                ? 'bus_ctrip_wxxcx_allpage_click'
                : 'bus_ctrip_wxxcx_allpage_show';
        let keyid = type === 'click' ? '200534' : '200558';
        let key_des =
            type === 'click'
                ? '汽车票小程序点击全埋点'
                : '汽车票小程序曝光全埋点';
        let info = {
            keyid,
            key_des,
            pageId: this.pageId,
            type: BusConfig.traceType || 'ctripwxxcx',
            typeSnd,
            comment,
        };
        let utmSource = this.data.utmSource || '';
        if (comment.indexOf('新人') >= 0) {
            utmSource = 'wxxcx_xrhd';
            info['isNew'] = this.data.offlineOldUser ? '0' : '1';
        }
        info['utmSource'] = utmSource;
        if (content) {
            info['content'] = content;
        }
        this.ubtTrace(key, info);
    },
    onSubscribe() {
        let act = this.properties.activity;
        let temps = (act.subscribeList || []).map((item) => {
            return item.templateId;
        });
        this.onUbtTrace(
            'click',
            'axtActivityPage_inviteFriendsButton_click',
            '安心退活动页-邀请好友免费得按钮点击',
            ''
        );
        if (temps.length > 0) {
            CPage.subscribeTemplateMessage(temps, (success) => {
                if (success) {
                    this.showToast({
                        icon: 'none',
                        message: '订阅成功',
                    });
                } else {
                }
            });
        }
    },
    goAction(e) {
        console.log('跳转');
        let url = e.currentTarget.dataset.url;
        console.log(url, 'rulrulrul');
        let traceType = this.getTraceType();
        if (url.indexOf('appid') >= 0) {
            let reg = new RegExp('appid' + '=([^&]*)(&|$)', 'i');
            let query = url.match(reg);
            let appId = unescape(query[1]);
            cwx.navigateToMiniProgram({
                appId,
                path: url,
                envVersion: 'release', //develop ,release , trial
                extraData: {
                    auth: cwx.user.auth || '',
                },
            });
        } else {
            cwx.navigateTo({
                url: url || '/pages/bus/index/index',
            });
        }
    },
    otherAction(e) {
        console.log('跳转到奖品领取页面');
        cwx.navigateTo({
            url: '/pages/activity/marketGift/index?activityId=MarketGift-bus',
        });
    },
    goOrderDetail() {
        cwx.navigateTo({
            url: '/pages/bus/orderdetail/orderdetail?oid=' + this.orderNumber,
        });
    },
    onBack() {
        this.pop();
    },
    pop() {
        BusRouter.navigateBack();
    },
    activityAction() {
        let activityStatus =
            this.data.activity && this.data.activity.activityStatus;
        switch (activityStatus) {
            case 1:
                this.shareAction();
                break;
            case 2:
                this.cashAction();

                break;
            case 3:
                this.alertSuccess();
                break;
            case 4:
                this.alertOverTime();
                break;
            case 5:
                this.goAction();
                break;
            default:
                this.goAction();
                break;
        }
        console.log('活动操作');
    },
    alertSave(remainCount) {
        this.setData({
            showDismantleRecord: false,
            showOverTimeModal: false,
            showRulesModal: false,
            showStayModal: true,
            remainCount,
        });
    },
    alertOverTime() {
        this.setData({
            showOverTimeModal: true,
        });
    },
    alertSuccess() {
        this.showShareModal({
            backgroundImage:
                'https://s.qunarzz.com/nnc_module_qunar_bus/share_cash_success.png',
            title: '提现成功',
            titleColor: '#ffffff',
            showClose: true,
            showLine: false,
            message: '请前往【携程钱包】查看返现金额',
            width: '580rpx',
            height: '488rpx',
        });
    },
    shareAction() {
        this.showShareMenu();
    },

    showRulesModal() {
        this.setData({ showRulesModal: true });
    },
    closeModal(e) {
        let type = e.detail.type;
        if (type == 'rules') {
            this.setData({ showRulesModal: false });
        } else if (type == 'overTime') {
            this.setData({ showOverTimeModal: false });
        } else if (type == 'stay') {
            this.setData({ showStayModal: false });
        } else if (type === 'dismantle') {
            this.setData({ showDismantleRecord: false });
        }
    },
    onShareAppMessage() {
        const activityInfo = this.onShareApp();
        this.ubtTrace('q_bus_newfission_invitation_click', {
            page_id: this.pageId,
            ...activityInfo,
        });

        let traceType = this.getTraceType();
        Utils.sendClickTrace('fission_activity_inviteFriendsButton_click', {
            type: traceType,
            comment: '购后返现金裂变活动页-邀请好友帮拆按钮点击',
        });
        return activityInfo;
    },
    onShareTimeline() {
        return {
            title: '快来抢红包',
            query: 'id=121212121',
            imageUrl:
                'https://s.qunarzz.com/nnc_module_qunar_bus/share_safety.png',
        };
    },
});

import {
    cwx,
    CPage
} from '../../../../../cwx/cwx.js';
import funscoredata from './../funscoredata.js';
import huser from '../../../common/hpage/huser.js';
import util from '../../../common/utils/util.js';
const scoreList = [0, 5, 10, 20, 50, 100];

CPage({
    pageId: '10650026951',
    /**
   * 页面的初始数据
   */
    data: {
        userPoints: 0, // 用户积分数
        remainingTime: 0, // 剩余抽奖次数
        cost: 0, // 抽奖所需积分数
        shareStatus: 0, // 是否已分享
        showShareButton: false, // 是否展示分享按钮
        usedTimes: 0, // 用户已抽奖次数
        shareTips: '',
        rollStyle: 'transform: rotateZ(0deg)', // 转盘旋转样式
        panelTran: 1, // 转盘默认转动3s，0-转到1s
        lightClass: '',
        current: 0, // 设置滚动后选中样式
        lotteryLayer: {
            hidden: true,
            showSuccess: false, // 抽奖成功
            showFail: false, // 未抽中
            showNotEnough: false, // 积分不足
            points: 0 // 弹窗说明文案
        },
        fromShare: 0, // 是否分享后回到页面
        canShowShareBtn: 0, // 分享按钮开关，0-关闭，1-打开
        packUpStatus: false, // 浮球展示收起状态
        isLandingPage: false, // 是否为落地页
        flag: 1 // 防止用户重复点击抽奖按钮
    },
    /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
    // 判断登录态 强登录
        this.checkUserInfo();
        this.setData({
            isLandingPage: this.isLandingPage()
        });
    },
    /**
   * 生命周期函数--监听页面显示
   */
    onShow: function () {
        const fromShare = this.data.fromShare;
        if (fromShare) {
            this.getUserLotteryInfo();
            this.onError('分享成功！恭喜获得1次免费抽奖机会');
            this.data.fromShare = 0;
        }
    },
    /**
   * 当前页面是否为落地页
   */
    isLandingPage: function () {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];

        return util.isEmpty(prevPage);
    },
    clickLorrery: function () {
    // 去抽奖
        this.getPlayLottery();
    },
    showShareTips: function () {
        const text = this.data.canShowShareBtn ? '分享给名好友，免费多抽1次~' : '本日抽奖次数已达上限，明日再来吧~';
        this.onError(text);
    },
    overTips: function () {
        if (!this.data.lotteryLayer.showNotEnough) {
            this.onError('本日抽奖次数已达上限，明日再来吧~');
        }
    },
    getPlayLottery: function () {
        const self = this;
        const reqData = {
            cost: self.data.cost || 5
        };
        const lotteryLayer = this.data.lotteryLayer;
        if (this.data.flag) {
            this.data.flag = 0;
            funscoredata.playLottery(reqData, (res) => {
                if (res.resultCode === 200) {
                    // 抽奖成功，滚动转盘，然后再出弹窗
                    const type = res.prizeType || 0;
                    self.setLotteryDate(type);
                    setTimeout(() => {
                        lotteryLayer.points = scoreList[type];
                        lotteryLayer.showSuccess = type > 0;
                        lotteryLayer.showFail = type === 0;
                        lotteryLayer.showNotEnough = false;
                        lotteryLayer.hidden = false;
                        self.setData({
                            lotteryLayer
                        });
                        self.getUserLotteryInfo();
                    }, 5000);
                } else if (res.resultCode === 503) {
                    this.data.flag = 1;
                    lotteryLayer.showNotEnough = true;
                    lotteryLayer.showSuccess = false;
                    lotteryLayer.showFail = false;
                    lotteryLayer.points = 0;
                    lotteryLayer.hidden = false;
                    self.setData({
                        lotteryLayer,
                        remainingTime: 0
                    });
                } else if (res.resultCode === 501) {
                    this.data.flag = 1;
                    self.onError('超过每日抽奖次数上限~');
                } else {
                    this.data.flag = 1;
                    self.onError('抽奖失败，请稍后重试~');
                }
            }, () => {
                this.data.flag = 1;
                self.onError('抽奖失败，请稍后重试~');
            });
        }
    },
    resetLotteryDate: function () {
        const current = 0;
        const rollStyle = 'transform: rotateZ(0deg)';
        this.setData({
            rollStyle,
            panelTran: 0,
            lightClass: '',
            current
        });
    },
    setLotteryDate: function (type) {
        const self = this;
        const current = parseInt(type) + 1;
        const rollDeg = 1080 - current * 60;
        const rollStyle = 'transform: rotateZ(' + rollDeg + 'deg)';
        self.setData({
            rollStyle,
            lightClass: 'light-twinkling'
        });
        setTimeout(() => {
            self.setData({
                current
            });
        }, 3000);
    },
    closeLayer: function () {
        this.data.lotteryLayer.hidden = true;
        this.setData({
            lotteryLayer: this.data.lotteryLayer
        });
    },
    checkUserInfo: function () {
        const self = this;
        huser.checkLoginStatus(true).then((isLogin) => {
            if (isLogin) {
                self.getUserLotteryInfo();
            } else {
                self.toLogin();
            }
        });
    },
    toLogin: function () {
        const self = this;
        huser.login({
            callback: (res) => {
                if (res && res.ReturnCode === '0') {
                    self.getUserLotteryInfo();
                }
            }
        });
    },
    toFunScore: function () {
        if (this.data.isLandingPage) {
            cwx.reLaunch({
                url: '/pages/hotel/market/funscore/index'
            });
        } else {
            cwx.navigateBack();
        }
    },
    toInquire: function () {
        cwx.reLaunch({
            url: '/pages/hotel/inquire/index'
        });
    },
    packUp: function (e) {
        this.setData({
            packUpStatus: !this.data.packUpStatus
        });
    },
    getUserLotteryInfo: function () {
        const self = this;
        funscoredata.getUserLotteryInfo({}, (res) => {
            if (res) {
                self.setData({
                    userPoints: res.userPoints,
                    shareStatus: res.shareStatus,
                    showShareButton: res.usedTimes > 0 && (res.shareStatus === 0), // 当用户抽过一次将，并且未分享过的场景下，出分享按钮
                    remainingTime: res.remainingTime,
                    cost: res.cost,
                    usedTimes: res.usedTimes,
                    canShowShareBtn: res.canShowShareBtn,
                    panelTran: 1
                });
            } else {
                self.onError('请求失败，请稍后重试~');
            }
        }, () => {
            self.onError('请求失败，请稍后重试~');
        });
    },
    shareLottery: function () {
        funscoredata.shareLottery({}, (res) => {
            this.resetLotteryDate();
            this.data.flag = 1;
            console.log('获得' + res.achievedTime + '次免费抽奖机会');
        }, () => {
            console.log('请求失败，请稍后重试~');
        });
    },
    /**
   * 用户分享
   */
    onShareAppMessage: function (e) {
        const data = e.target && e.target.dataset;
        const type = data && data.type || '';
        if (type === 'lottery') {
            this.data.fromShare = 1;
            this.shareLottery();
        }
        const path = 'pages/hotel/market/funscore/raffle/index';
        const imageUrl = 'https://pages.c-ctrip.com/hotels/wechat/market/funscore/turn-share.png';
        const title = '我分享了一个酒店积分抽大奖的活动，快来看看吧~';
        return {
            bu: 'hotel',
            title,
            path,
            imageUrl
        };
    },
    onError: function (txt) {
        wx.showToast({
            title: txt,
            icon: 'none',
            duration: 3000
        });
    },
    /* Empty method, do nothing */
    noop: function () {}
});

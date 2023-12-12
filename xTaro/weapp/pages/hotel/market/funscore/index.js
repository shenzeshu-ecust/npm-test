import {
    cwx,
    CPage,
    __global
} from '../../../../cwx/cwx.js';
import funscoredata from './funscoredata.js';
import components from '../../components/components.js';
import StorageUtil from '../../common/utils/storage.js';
import DateUtil from '../../common/utils/date.js';
import huser from '../../common/hpage/huser';
import util from '../../common/utils/util.js';
import funscoretrace from '../../common/trace/funscoretrace.js';
import commonrest from '../../common/commonrest.js';
// 更多任务弹窗文案
const equityData = {
    dpjd: {
        title: '点评酒店',
        text: '对住过的酒店进行点评，上传图片可得更多积分哦~',
        imageUrl: 'https://pages.c-ctrip.com/hotels/wechat/market/funscore/score-dpjd.png',
        showForm: false
    },
    jdyd: {
        title: '酒店预订',
        text: '获得积分=订单成交房费金额×积分系数×50%',
        imageUrl: 'https://pages.c-ctrip.com/hotels/wechat/market/funscore/score-jdyd.png',
        showForm: true
    }
};
CPage({
    pageId: '10650020013',
    checkPerformance: true, // 白屏检测标志位
    /**
     * 页面的初始数据
     */
    data: {
        showMask: false, // page-meta防止滚动穿透
        // 页面数据
        openId: 0, // 页面当前用户的openid
        totalAvailable: 0, // 用户积分数
        taskList: [], // 任务列表
        questionShareId: 0, // 答题分享链接进入时会带
        remarksList: [], // 赚积分弹层
        reqTaskListData: {
            pageSize: 10, // 一页10条
            pagdeIndex: 0,
            startTime: '',
            endTime: ''
        }, // 积分明细request
        userPointListData: [{
            reason: '暂无积分',
            reasonType: '',
            reasonReferenceID: '',
            expireTime: '',
            expireTimeDisaply: '',
            earnedTime: '',
            earnedAmount: ''
        }], // 用户积分列表
        shareHotelData: { // 分享酒店任务 type===share_hotel
            id: 0,
            name: '分享酒店给好友',
            typeName: 'share_hotel',
            rule: '',
            ruleDesc: '1位好友当日打开分享内容, 可领取2积分奖励',
            points: 2,
            endTime: '',
            isComplete: 0,
            isReceivedPoint: 0, // 积分是否已领取 1=已领取
            isReceiveTask: 0, // 任务是否已领 1=已领取
            shareId: 0,
            buttonType: 1, // 1:领取任务 2:立即前往 3:领取积分 4:已领取积分
            isHidden: true
        },
        dailyTaskData: { // 每日一题任务 type===daily_question
            id: 0,
            name: '每日一题',
            typeName: 'daily_question',
            rule: '',
            points: 1,
            endTime: '',
            isComplete: 0,
            isReceivedPoint: 0, // 积分是否已领取 1=已领取
            isReceiveTask: 0, // 任务是否已领 1=已领取
            progress: '',
            shareId: 0,
            questionData: {},
            isHidden: true
        },
        shareQuestionData: { // 邀请好友答题任务 type===share_question
            id: 0,
            name: '邀请好友答题',
            typeName: 'share_question',
            rule: '',
            ruleDesc: '1位好友当日完成答题, 可领取10积分奖励',
            points: 5,
            endTime: '',
            isComplete: 0,
            isReceivedPoint: 0, // 积分是否已领取 1=已领取
            isReceiveTask: 0, // 任务是否已领 1=已领取
            shareId: 0,
            buttonType: 1, // 1:领取任务 2:立即前往 3:领取积分 4:已领取积分
            isHidden: true
        },
        hiddenPointView: true, // 是否隐藏积分明细
        hiddenGetPoint: true, // 如何获取积分
        hiddenExchangePoint: true, // 积分兑换
        hasNextPointPage: true, // 积分列表是否有下一页
        rowCount: 29,
        taskServiceList: [], // 记录正在领取任务的服务，正在请求的服务，不能连续请求
        pointServiceList: [], // 正在领取积分的服务，正在请求的服务，不能连续请求
        questionServiceList: [], // 答题服务，用户快速多次点击答题按钮时，不能连续请求同一个服务
        toAnswerView: false,
        toGetScore: false,
        isIphoneX: util.isIPhoneX(),
        layerData: {
            hidden: true,
            title: '', // 弹窗标题
            imageUrl: '', // 弹窗图片
            text: '', // 弹窗说明文案
            showForm: false // 是否展示表格
        },
        signInfo: {
            canSignIn: 0, // 是否签到按钮可点 1-可以签到
            maxPoints: 0, // 最高可领积分数
            signInInfoList: [], // 用户积分列表
            stepStyle: 'width:0%',
            canShowSignIn: 0, // 签到模块是否展示 1-展示
            canShowLottery: 0 // 抽奖入口是否展示 1-展示
        },
        signLayer: {
            hidden: true,
            remark: ''
        },
        selectTabInfo: {
            tab: 1,
            idx: 0
        },
        equityLayer: {
            hidden: false,
            memberType: 0,
            exchange: false,
            title: ''
        },
        exchangeData: {
            freeRewardList: [],
            memberPointRewards: [],
            userGradeLevel: 0 // 用户会员等级: 0=普通会员;12=黄金会员;13=铂金会员;14=钻石会员;96=白银会员
        },
        enableMoreScoreDetail: false // 查看积分详情新旧版开关
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.questionShareId = options.shareid ? parseInt(options.shareid) : 0;
        this.data.toAnswerView = this.data.questionShareId > 0;
        this.data.toGetScore = options.getScore;
        // 页面开关
        this.checkUniversalSwitches();
    },
    onShow: function () {
        // 判断登录态 强登录
        this.checkUserInfo();
    },
    checkUserInfo: function () {
        const self = this;
        huser.checkLoginStatus(true).then((isLogin) => {
            if (isLogin) {
                self.loadPage();
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
                    self.loadPage();
                }
            }
        });
    },
    loadPage: function (data) {
        // 页面数据
        this.getUserPointInfo();
        this.getUserPointList((data) => {
            this.setData({
                userPointListData: data.userPointList
            });
        });
        this.getTaskListData();
        this.getUserSignInInfo();
        this.getMemberPointRewards();
    },
    /**
     * 获得用户签到信息
     */
    getUserSignInInfo: function () {
        const self = this;
        const signInfo = {};
        funscoredata.getUserSignInInfo({}, (res) => {
            if (res) {
                const signInInfoList = res.signInInfoList || [];
                signInfo.canSignIn = res.canSignIn;
                signInfo.maxPoints = res.maxPoints;
                let i = 0;
                signInInfoList.forEach((item) => {
                    const signInInDate = item.signInInDate;
                    const date = new Date(signInInDate);
                    const month = date.getMonth() + 1;
                    const day = date.getDate();
                    const inDate = item.isToday ? '今天' : (month + '.' + day);
                    item.date = inDate;
                    if (item.isSignIn) {
                        i++;
                    }
                });
                if (i === 7) {
                    signInfo.stepStyle = 'width:100%';
                } else {
                    signInfo.stepStyle = 'width:' + 16 * i + '%';
                }
                signInfo.signInInfoList = signInInfoList;
                signInfo.canShowSignIn = res.canShowSignIn;
                signInfo.canShowLottery = res.canShowLottery;
                self.setData({ signInfo });
            }
        }, () => {
            self.onError('请求失败，请稍后重试~');
        });
    },
    /**
     * 用户签到
     */
    goSignIn: function () {
        const self = this;
        const signLayer = {};
        funscoredata.signInWechatPoint({}, (res) => {
            if (res.resultCode === 200) {
                signLayer.hidden = false;
                signLayer.remark = res.remark;
                signLayer.points = res.points;
                self.setData({ signLayer });
                self.loadPage();
            } else {
                self.onError('签到失败，请重试~');
            }
        }, () => {
            self.onError('请求失败，请稍后重试~');
        });
    },
    closeSignLayer: function () {
        this.data.signLayer.hidden = true;
        this.setData({
            signLayer: this.data.signLayer
        });
    },
    /**
     * 获得用户积分明细
     */
    getUserPointInfo: function () {
        const self = this;
        funscoredata.getUserPointInfo({}, (res) => {
            if (res && res.remarks) {
                self.setData({
                    totalAvailable: res.totalAvailable,
                    remarksList: res.remarks
                });
            }
        });
    },
    /**
     * 获得用户积分明细
     */
    getUserPointList: function (callback, err) {
        const self = this;
        const reqTaskListData = self.data.reqTaskListData;
        const index = self.data.reqTaskListData.pagdeIndex;
        self.data.reqTaskListData.pagdeIndex = (index === 0) ? 1 : index;
        // 查询用户积分明细 需要做分页
        funscoredata.getUserPointList(reqTaskListData, (res) => {
            if (res && res.resultCode === '200') {
                const curCount = self.data.userPointListData.length + res.userPointList.length;
                self.data.hasNextPointPage = curCount < res.rowCount;
                callback && callback(res);
            }
        });
    },

    loadMore: function (e) {
        const d = this.data;
        if (d.hasNextPointPage && !d.loadMorePointLock) {
            this.data.reqTaskListData.pagdeIndex = this.data.reqTaskListData.pagdeIndex + 1;
            this.getUserPointList((data) => {
                const userPointList = data.userPointList;
                this.setData({
                    userPointListData: d.userPointListData.concat(userPointList)
                });
            });
        }
    },

    /**
     * 获得任务列表
     */
    getTaskListData: function () {
        const self = this;
        let shareHotelData = {};
        let dailyTaskData = {};
        let shareQuestionTask = {};
        // 查询用户总积分
        funscoredata.getDailyTaskList({}, (res) => {
            if (!(res && res.taskList)) {
                this.onError('请求无结果');
                return;
            }
            const taskList = res.taskList || [];
            // 整理每日任务列表的数据
            taskList.forEach((task, i) => {
                switch (task.typeName) {
                case 'share_hotel':
                    if (task.isReceiveTask) {
                        const shareStorageData = {
                            hasTask: true,
                            date: DateUtil.today()
                        };
                        StorageUtil.setStorage('P_FUNSCORE_SHARE_HOTEL', shareStorageData);
                    }
                    shareHotelData = task ? self.setTaskData(task) : {};
                    break;
                case 'daily_question':
                    dailyTaskData = task ? self.setDailyTask(task) : {};
                    break;
                case 'share_question':
                    shareQuestionTask = task ? self.setTaskData(task) : {};
                    break;
                default:
                    break;
                }
            });
            self.setData({
                shareHotelData,
                dailyTaskData,
                shareQuestionData: shareQuestionTask
            });
            if (self.data.questionShareId && self.data.toAnswerView) {
                this.toAnswerView();
            }
        }, () => {
            self.onError('请求失败，请稍后重试');
        });
    },
    toAnswerView: function () {
        const self = this;
        const query = wx.createSelectorQuery();
        query.select('#js_answer').boundingClientRect();
        query.selectViewport().scrollOffset();
        let topVal = 0;
        query.exec(function (res) {
            topVal = res && res[0] && res[0].top; // #the-id节点的上边界坐标
            // 显示区域的竖直滚动位置res[1].scrollTop;
            wx.pageScrollTo({
                scrollTop: topVal,
                duration: 300
            });
            self.data.toAnswerView = false;
        });
    },
    toGetScore: function () {
        const self = this;
        // eslint-disable-next-line
        const toGetScore = self.data.toGetScore;
        const query = wx.createSelectorQuery();
        query.select('#js_getscore').boundingClientRect();
        query.selectViewport().scrollOffset();
        let topVal = 0;
        query.exec(function (res) {
            topVal = res && res[0] && res[0].top; // #the-id节点的上边界坐标
            // 显示区域的竖直滚动位置res[1].scrollTop;
            wx.pageScrollTo({
                scrollTop: topVal,
                duration: 300
            });
        });
        self.setData({
            toGetScore: false
        });
    },
    /**
     * 设置每日答题任务
     * done-完成答题 answer-results-我的答案 right-正确答案 error-错误答案
     */
    setDailyTask: function (data) {
        const dailyTaskData = data || {};
        const questionOne = (data && data.questionList[0]) || {};
        const optionIdList = (questionOne && questionOne.optionIdList) || [];
        optionIdList.forEach((item, j) => {
            if (dailyTaskData.isComplete) {
                if (item.isRight && item.isUserSelected) {
                    item.className = 'answer-results';
                } else if (item.isRight) {
                    item.className = 'right';
                } else if (item.isUserSelected) {
                    item.className = 'error';
                } else {
                    item.className = 'done';
                }
            } else {
                item.className = '';
            }
        });
        questionOne.optionIdList = optionIdList;
        dailyTaskData.questionData = questionOne;
        return dailyTaskData;
    },
    /**
     * 设置分享酒店给好友的数据
     */
    setTaskData: function (task) {
        let type = 1;
        if (task.isReceivedPoint === 1) {
            type = 4;
        } else if (task.isComplete === 1) {
            type = 3;
        } else if (task.isReceiveTask === 1) {
            type = 2;
        }
        task.buttonType = type;
        task.isHidden = false;
        return task;
    },
    /**
     * 用户答题
     */
    answerQuestion: function (e) {
        const self = this;
        const data = e.currentTarget.dataset;
        const optionId = data.optionid;
        const questionId = data.questionid;
        const taskId = data.taskid;
        const right = data.right;
        const shareId = self.data.questionShareId;
        const reqData = {
            taskId,
            questionId,
            optionId,
            shareId
        };
        // 判断上一次点击领取按钮调用的服务是否返回
        const questionServiceList = self.data.questionServiceList || [];

        if (questionServiceList.indexOf(taskId) < 0) {
            questionServiceList.push(taskId);
            const index = questionServiceList.indexOf(taskId);
            self.data.questionServiceList = questionServiceList;

            funscoredata.answerQuestion(reqData, (res) => {
                if (res && res.resultCode === '200') {
                    const points = self.data.dailyTaskData.points;
                    let title = '回答错误… 邀请好友答题，也可获得积分奖励';
                    if (right) {
                        title = '恭喜回答正确！获得' + points + '积分奖励';
                    }
                    self.onError(title);
                    self.loadPage();
                } else {
                    self.data.questionServiceList.splice(index, 1);
                    self.onError('请求失败 请重试！');
                }
            }, () => {
                self.data.questionServiceList.splice(index, 1);
                self.onError('请求失败 请重试！');
            });
        }
    },
    goHotelList: function (e) {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        // 积分页分享酒店任务立即前往埋点
        const dataset = e.currentTarget.dataset;
        if (dataset.type === 'share_hotel' && prevPage) {
            funscoretrace.gonow(this, { prepageid: prevPage.pageId });
        }

        if (util.isEmpty(prevPage)) {
            cwx.redirectTo({
                url: '/pages/hotel/inquire/index'
            });
        } else {
            cwx.navigateBack();
        }
    },
    /**
     * 领取任务  type可以为：browse_hotel share_hotel daily_question share_question
     */
    getTaskStory: function (e) {
        const self = this;
        const data = e.currentTarget.dataset;
        const type = data.type;
        const taskId = data.id;
        // 判断上一次点击领取按钮调用的服务是否返回
        const taskServiceList = self.data.taskServiceList || [];

        if (taskServiceList.indexOf(type) < 0) {
            taskServiceList.push(type);
            const index = taskServiceList.indexOf(type);
            self.data.taskServiceList = taskServiceList;

            // 如果type是browse_hotel,则为浏览历史任务,先清空原酒店列表的缓存 然后变换状态
            funscoredata.recieveTask({
                taskId
            }, (res) => {
                if (res && res.resultCode === '200') {
                    // 根据type来变化对于button的状态
                    switch (type) {
                    case 'share_hotel':
                        // eslint-disable-next-line
                        const shareStorageData = {
                            hasTask: true,
                            date: DateUtil.today()
                        };
                        StorageUtil.setStorage('P_FUNSCORE_SHARE_HOTEL', shareStorageData);
                        break;
                    case 'daily_question':
                        // todo
                        break;
                    case 'share_question':
                        // todo
                        break;
                    default:
                        break;
                    }
                } else {
                    self.data.taskServiceList.splice(index, 1);
                }
                self.getTaskListData();
            }, (err) => {
                self.data.taskServiceList.splice(index, 1);
                self.onError(err);
            });
        }
    },
    /**
     * 领取积分
     */
    getRecievePoint: function (e) {
        const self = this;
        const data = e.currentTarget.dataset;
        const taskId = data.id;
        const type = data.type;
        const points = '+' + data.points + '积分';
        const pointServiceList = this.data.pointServiceList || [];
        // 判断上一次点击领取按钮调用的服务是否返回
        if (pointServiceList.indexOf(type) < 0) {
            pointServiceList.push(type);
            const index = self.data.pointServiceList.indexOf(type);
            self.data.pointServiceList = pointServiceList;

            funscoredata.recievePoint({
                taskId
            }, (res) => {
                if (res && res.resultCode === '200') {
                    self.onError(points);
                    self.loadPage();
                } else {
                    self.data.pointServiceList.splice(index, 1);
                }
            }, (res) => {
                self.data.pointServiceList.splice(index, 1);
                self.onError('服务请求失败');
            });
        }
    },
    /**
     * 展示积分明细浮层
     */
    showPointView: function () {
        this.setData({
            hiddenPointView: !this.data.hiddenPointView
        });
    },
    /**
     * 如何获取积分
     */
    showGetPoint: function () {
        this.setData({
            hiddenGetPoint: !this.data.hiddenGetPoint
        });
    },
    /**
     * 积分兑换
     */
    showExchangePoint: function () {
        this.setData({
            showMask: this.data.hiddenExchangePoint,
            hiddenExchangePoint: !this.data.hiddenExchangePoint
        });
    },
    /**
     * 将小数转化为百分数
     */
    toPercent: function (point) {
        let str = Number(point * 100).toFixed(1);
        str += '%';
        return str;
    },
    tabExchange: function (e) {
        const tabId = e.currentTarget.dataset.id;
        const tabIdx = e.currentTarget.dataset.idx;

        this.setData({
            selectTabInfo: {
                tab: tabId,
                idx: tabIdx
            }
        });
    },
    showEquityLayer: function (e) {
        const equityLayer = {};
        const eq = equityLayer;
        const cdn = 'https://pages.c-ctrip.com/hotels/wechat/market/funscore/equity-layer-membertype';
        const memberType = e.currentTarget.dataset.id;
        const ex = e.currentTarget.dataset.type;
        eq.desc = '在填写订单时，您可用账户下的积分兑换积分权益';
        eq.image = 'https://pages.c-ctrip.com/hotels/wechat/market/funscore/equity-layer-all.png';
        eq.isPrimeMember = [12, 13, 14, 28, 80, 96].includes(memberType);
        eq.isSilverMember = [96].includes(memberType);

        // 我的0积分兑换入口进入
        // eslint-disable-next-line
        if (memberType == 1) {
            eq.memberType = 1;
            eq.title = '超级会员';
            eq.desc = '在填写订单时,带有“超级会员权益”标签的即可享受0积分兑换';
            eq.image = cdn + '-equity1.png';
            eq.number = 1;
            // eslint-disable-next-line
        } else if (memberType == 2) {
            eq.memberType = 2;
            eq.title = '新客';
            eq.desc = '在填写订单时,带有“新客权益”标签的即可享受0积分兑换';
            eq.image = cdn + '-equity2.png';
            eq.number = 1;
            // eslint-disable-next-line
        } else if (memberType == 96) {
            eq.memberType = 96;
            eq.title = '白银会员';
            eq.number = 1;
            // eslint-disable-next-line
        } else if (memberType == 12) {
            eq.memberType = 12;
            eq.title = '黄金会员';
            eq.image = cdn + '-equity12.png';
            eq.number = 1;
            // eslint-disable-next-line
        } else if (memberType == 13) {
            eq.memberType = 13;
            eq.title = '铂金会员';
            eq.image = cdn + '-equity13.png';
            eq.number = 2;
            // eslint-disable-next-line
        } else if (memberType == 14) {
            eq.memberType = 14;
            eq.title = '钻石会员';
            eq.image = cdn + '-equity14.png';
            eq.number = 4;
            // eslint-disable-next-line
        } else if (memberType == 28) {
            eq.memberType = 28;
            eq.title = '黑钻会员';
            eq.number = '不限';
            // eslint-disable-next-line
        } else if (memberType == 80) {
            eq.memberType = 80;
            eq.title = '金钻会员';
            eq.number = '不限';
        }

        // 积分兑换 > 查看详情 及 内容tag 进入
        if (ex === 'jfExchange') {
            eq.exchange = true;

            const u = this.data.exchangeData.userGradeLevel;
            if (u === 0) { // 普通会员
                eq.image = cdn + '0.png';
            } else if (u === 96) {
                eq.title = '白银会员';
            } else if (u === 12) {
                eq.title = '黄金会员';
                eq.image = cdn + '12.png';
            } else if (u === 13) {
                eq.title = '铂金会员';
                eq.image = cdn + '13.png';
            } else if (u === 14) {
                eq.title = '钻石会员';
                eq.image = cdn + '14.png';
            } else if (u === 28) {
                eq.title = '黑钻会员';
            } else if (u === 80) {
                eq.title = '金钻会员';
            } else {
                eq.image = '';
            }
        }
        eq.hidden = !this.data.equityLayer.hidden;

        this.setData({
            equityLayer
        });
    },
    /**
     * 积分权益服务
     */
    getMemberPointRewards: function () {
        const self = this;
        const scene = 3;
        const exchangeData = {};
        funscoredata.getMemberPointRewards({ scene }, (res) => {
            if (res) {
                exchangeData.inspireInfoList = res.inspireInfoList;
                exchangeData.userGradeLevel = res.userGradeLevel;
                exchangeData.memberPointRewards = res.memberPointRewards;
                exchangeData.freeRewardList = res.freeRewardList;
                [28, 80].includes(res.userGradeLevel) && (exchangeData.goldOrBlackDiamond = true);

                const memberPointRewards = exchangeData.memberPointRewards;
                const freeRewardList = exchangeData.freeRewardList || [];
                memberPointRewards.forEach((item) => {
                    switch (item.rewardId) {
                    case 1:
                        item.ubtKey = 'xcx_cxy_point_zc';
                        break;
                    case 2:
                        item.ubtKey = 'xcx_cxy_point_mfqx';
                        break;
                    case 3:
                        item.ubtKey = 'xcx_cxy_point_yctf';
                        break;
                    case 4:
                        item.ubtKey = 'xcx_cxy_point_fxsj';
                        break;
                    case 5:
                        item.ubtKey = 'xcx_cxy_point_swff';
                        break;
                    case 7:
                        item.ubtKey = 'xcx_cxy_point_hysg';
                        break;
                    case 8:
                        item.ubtKey = 'xcx_cxy_point_tqrz';
                        break;
                    }
                    if (item.discount) {
                        item.discount = item.discount * 10;
                    }
                });

                const getMemberIcon = (mem) => {
                    const memberType = mem.memberType;
                    if ([1, 12, 13, 14, 22, 28, 80].includes(memberType)) return `icon-member${memberType}`;
                    if (memberType === 2 && mem.desc.indexOf('体验·黄金会员') > -1) return 'icon-member12';
                    return 'icon-member-def';
                };
                const rewardConf = {
                    key1: 'xcx_wdjf_free_zc',
                    key2: 'xcx_wdjf_free_mfqx',
                    key3: 'xcx_wdjf_free_yctf',
                    key4: 'xcx_wdjf_free_fxsj'
                };
                freeRewardList.forEach((item) => {
                    item.ubtKey = rewardConf[`key${item.rewardId}`] || '';

                    const rightsMembers = item.items || [];
                    rightsMembers.forEach((mem = {}) => {
                        mem.iconCls = getMemberIcon(mem);
                    });
                });

                self.setData({
                    exchangeData
                });

                if (self.data.toGetScore) {
                    this.toGetScore();
                }
            }
        });
    },
    /**
     * 立即预订酒店
     */
    goToBooking: function (e) {
        cwx.reLaunch({
            url: '/pages/hotel/inquire/index'
        });
    },
    /**
     * 跳转积分权益兑换H5页面
     */
    jumpExchange: function (e) {
        const dataset = e.currentTarget.dataset;
        const type = dataset.type;
        const host = __global.env === 'prd' ? 'm.ctrip.com' : 'm.fat39.qa.nt.ctripcorp.com';

        components.webview({
            url: `https://${host}/webapp/hotel/wechatlab/funscore/?type=${type}`,
            needLogin: true,
            hideShare: true,
            title: '积分兑换权益'
        });
    },
    onError: function (txt) {
        wx.showToast({
            title: txt,
            icon: 'none',
            duration: 3000
        });
    },
    onShareAppMessage: function (e) {
        // 分享好友埋点
        funscoretrace.shareFriends(this, { isctripshare: e.from === 'button' ? 'T' : 'F' });

        const data = e.target && e.target.dataset; // 邀好友答题type==='share_question'
        const type = (data && data.type) || '';
        const shareId = this.data.shareQuestionData.shareId;
        let path = 'pages/hotel/market/funscore/index';
        let imageUrl = 'https://pages.c-ctrip.com/hotels/wechat/market/funscore/funscore-share02.png';
        let title = '快来携程酒店小程序做任务领积分，积分可免费兑换酒店权益，每天都可以领积分哦~';
        if (type === 'share_question') {
            path += '?shareid=' + shareId;
            imageUrl = 'https://pages.c-ctrip.com/hotels/wechat/market/funscore/funscore-share03.png';
            title = '在吗？快来和我一起答题赚取携程积分吧！每天都可以回答一次哦~';
        }
        return {
            bu: 'hotel',
            title,
            path,
            imageUrl
        };
    },
    showLayer: function (e) {
        const data = e.currentTarget && e.currentTarget.dataset;
        const type = (data && data.type) || '';
        this.data.layerData = equityData[type];
        this.data.layerData.hidden = false;
        this.setData({
            layerData: this.data.layerData
        });
    },
    closeLayer: function () {
        this.data.layerData.hidden = true;
        this.setData({
            layerData: this.data.layerData
        });
    },
    /**
     * 跳转至抽奖活动
     */
    goRafflePage: function () {
        cwx.navigateTo({
            url: 'raffle/index'
        });
    },
    /* 页面开关状态 */
    checkUniversalSwitches: function () {
        const self = this;
        const keys = [
            'market_view_more_score_detail'
        ];
        commonrest.getWechatSoaSwitch(keys, (data) => {
            if (data) {
                const rs = data.result || [];
                for (let i = 0, n = rs.length; i < n; i++) {
                    const curItem = rs[i] || {};
                    const key = curItem.key;
                    const opened = curItem.value === '1';
                    switch (key) {
                    case 'market_view_more_score_detail':
                        self.setData({
                            enableMoreScoreDetail: opened
                        });
                        break;
                    default:
                        break;
                    }
                }
            }
        });
    },
    toViewMoreScore () {
        // 积分详细说明
        const url = 'https://pages.c-ctrip.com/hotels/wechat/static/mexchange/activityrules.html';
        cwx.component.cwebview({
            data: {
                url: encodeURIComponent(url)
            }
        });
    },
    /* Empty method, do nothing */
    noop: function () {}
});

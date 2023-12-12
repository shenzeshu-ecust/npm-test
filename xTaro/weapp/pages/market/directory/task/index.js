import {
    isObject
} from "../../../../3rd/lodash.core.min.js";
import {
    cwx
} from "../../../../cwx/cwx.js";
import utils from "../../common/utils";
import Exposure from './exposure';
const model = require('./model');
const viewTaskHandler = require('./viewTask');
const videoTaskHandler = require('./videoTask');
const subscribeTaskHandler = require('./subscribeTask');
const adVideoTaskHandler = require('./adVideoTask');
const inviteHelpTaskHandler = require('./inviteHelpTask');
const TaskContentBackendAudit = require('./TaskContentBackendAudit')
const {
    signinTaskHandler,
    externalThirdHandler,
    integralTaskHandler,
    qywxAddFriendHandler,
    openWxVideoHandler,
    yoDeductionTaskHandler,
    goodReviewsHandler,
} = require('./taskType');
const {
    handleSubScribe,
    createTriggerFnByTime,
    parseJson,
    COMB_TYPE,
    SORT_TYPE,
    sortByTop,
} = require('./utils')
const localUtils = require('./utils')
var trainBehavior = require('./behaviors/train')

let mPage, pageId = "",
    openid = '';
let mktUnionData = {}

export const eventMenu = {
    inviteHelp: 'INVITE_HELP',
    inviteTaskAB: 'INVITE_HELP_TASK',
    qywxAddFriend: 'ENTERPRISE_WX_ADD_FRIENDS', // 企业微信加好友
    contentBackendAudit: 'CONTENT_BACKEND_AUDIT', // 笔记评级
    openWxVideo: 'OPEN_WX_VIDEO', // 视频号任务
    yoDeduction: 'YO_DEDUCTION_EVENT', // yo票扣减事件
    wxMpOrderComment: 'WX_MP_ORDER_COMMENT', // 五星好评
}

let videoParams = null
const createVideoAd = (_adUnitId, _taskId, _context) => {
    videoParams = {
        adUnitId: _adUnitId,
        taskId: _taskId,
        context: _context
    }
    const {
        taskId,
        context
    } = videoParams
    let videoAd = context.videoAd
    if (videoAd) return videoAd

    if (wx.createRewardedVideoAd) {
        // 只创建一次
        context.videoAd = wx.createRewardedVideoAd({
            adUnitId: videoParams.adUnitId
        })
        videoAd = context.videoAd;

        videoAd.onLoad(() => {
            context.customerUbtTrace({
                action: "videoAdOnLoad",
            })

        })
        videoAd.onError((err) => {
            context.customerUbtTrace({
                action: "videoAdOnError",
                err
            })
        })
        videoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            context.customerUbtTrace({
                action: "videoAdOnClose",
            })

            if (res && res.isEnded) {
                // 正常播放结束，可以下发游戏奖励               
                console.log('广告播放完毕，开始发放奖励')
                context.customerUbtTrace({
                    action: "videoAdOnEnded",
                })

                model.requestUrl('userTodoTask', {
                    'channelCode': context.data.taskInfo.channelCode, //int	项目id
                    'taskId': taskId, //long	任务id
                    'done': 1,
                    'status': 1
                }, res => {
                    if (res.code === 200) {
                        // 激励广告任务完成
                        console.log('激励广告任务完成')
                        // 更新次数
                        context.updateProcess(taskId)
                    } else {
                        wx.showToast({
                            title: res.msg,
                            icon: 'none'
                        })
                    }
                }, () => {
                    wx.showToast({
                        title: 'something error',
                        icon: 'none'
                    })
                })
            } else {
                // 播放中途退出，不下发游戏奖励
                console.log('播放中途退出，不下发游戏奖励')
                context.customerUbtTrace({
                    action: "videoAdOnAbort",
                })

            }
        })
    } else {
        wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
    }

    return videoAd;
}

Component({
    behaviors: [trainBehavior],
    options: {
        addGlobalClass: true,
        multipleSlots: true
        // styleIsolation: 'apply-shared'
    },
    /**
     * 组件的属性列表
     */
    properties: {
        clazz: {
            type: String,
            value: ''
        },
        tempid: {
            type: String,
            value: ''
        },
        compid: {
            type: String,
            value: ''
        },
        isShow: {
            type: Boolean,
            value: false
        },
        noMask: {
            type: Boolean,
            value: false
        },
        channelCodeStr: {
            type: String,
            value: ''
        },
        // 用于英雄联盟活动
        posterBgStr: {
            type: String,
            value: ''
        },
        extraData: {
            type: Object,
            value: null
        },
        // 用于订单维度，有值会传入接口代入
        orderData: {
            type: Object,
            value: null,
        },
        // 隐藏更新用户头像昵称
        hideUpdateAvatar: {
            type: Boolean,
            value: false
        },
        trainMaster: { // 火车票主态
            type: Boolean,
            value: false
        }
    },
    observers: {
        'isShow': async function (isShow) {
            if (isShow) {
                console.log('【task】:observers.isShow')
                this.checkLoginState();
                this.fetchTemplateData()
            }
        },
        'extraData': function (extraData) {
            if (extraData != this.data.extraData) {
              this.getTaskList()
            }
        },
        'channelCodeStr': function (channelCodeStr) {
          if (channelCodeStr != this.data.channelCodeStr) {
            this.fetchTemplateData()
          }
        },
        'taskList': function (taskList) {
            const taskAwardData = this.completeTrainAward?.(taskList)
            this.setData({
                taskAwardData
            })
            this.customerTriggerEvent('getTaskAwardData', {
                taskAwardData
            })
            if (taskList.length > 0) {
                this.exposure()
            }
        
        },
        'compid': function(compid) {
          if (compid !== this.data.compid) {
            this.checkLoginState();
            this.fetchTemplateData()
          }
        }
    },
    lifetimes: {
        attached: function () {
            console.log('【task】:lifetimes.attached')
            this.checkLoginState();
            this.fetchTemplateData()
            this.initUnionData()
            mPage = cwx.getCurrentPage()
            pageId = mPage ? (mPage.pageid || mPage.pageId || '') : ''
            openid = cwx.cwx_mkt.openid || ''
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
            this._observer && this._observer.disconnect()
        },
    },
    pageLifetimes: {
        show: async function () {
            // 处理页面跳转至登录页回来的情况
            if (!this.isLogin) {
                this.checkLoginState()
            }
            console.log('【task】:pageLifetimes.show')
            mPage = cwx.getCurrentPage()
            pageId = mPage ? (mPage.pageid || mPage.pageId || '') : ''
            openid = cwx.cwx_mkt.openid || ''
            const isChange = await this.checkTask()
            this.getTaskList({
                isCheckTask: false
            })
            // viewTaskHandler.checkViewTaskStatus(this)

            this.customerUbtTrace({
                action: 'lifetimesShow'
            })
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isLogin: false, // 登录方式不再适用静默登录，接口返回100就跳转登录页，所以强制设置为true
        canIUse: wx.canIUse('getUserProfile'),
        taskInfo: {
            taskProjectCode: '', // 渠道code
            taskModule: '', // 组件展示形式
            jobHeadBackgroundImg: '', // 标题banner图
            jobBackgroudColor: '', // 组件总体背景颜色
            jobBackgroudImg: '', // 组件总体背景底图
            taskBackgroudColor: '', // 子任务背景颜色
            taskBackgroudImg: '', // 子任务背景图片
            taskTodo: '', // 未领任务时按钮文字颜色
            taskTodoBtn: '', // 未领任务时按钮颜色
            taskTodoBtnBgImg: '', // 未领任务时按钮背景图
            taskDone: '', // 未领奖励时按钮文字颜色
            taskDoneBtn: '', // 未领奖励时按钮颜色
            taskDoneBtnBgImg: '', // 未领奖励时按钮背景图
            rewardDone: '', // 奖励领取后按钮文字颜色
            rewardDoneBtn: '', // 奖励领取后按钮颜色
            rewardDoneBtnBgImg: '', // 奖励领取后按钮颜色背景图
            unDonePointColor: '', // 未完成时积分颜色
            donePointColor: '', // 完成时积分颜色
            taskNameSize: '', // 任务标题字号
            taskNameColor: '', // 任务标题颜色
            taskDescSize: '', // 任务描述字号
            taskDescColor: '', // 任务描述颜色
            maxDisplayNum: 0, // 任务最大展示个数
            showMoreBtnColor: '', // 更多按钮色号
            showMoreBtnSize: '', // 更多按钮字号
            channelCode: ''
        },
        combData: null,
        taskList: [],
        expand: false,
        title: '',
        subscribeFlag: false,
        adUnitId: '',
        taskWrapHeight: '680rpx',
        showSignModal: false,
        signInModalData: null,
        peaceShowPrizeId: '',
        shareConfig: null,
        showSharePanel: false,
        showRulePanel: false,
        taskAwardData: null, // 任务奖励 相关的数据
        receiveTaskAwardData: null, // 领取任务得奖励数据
        ruleDesc: '', // 规则弹窗内容
    },

    /**
     * 组件的方法列表
     */
    methods: {
        async checkTask() {
            let isViewChange, isSigninChange;
            isViewChange = await viewTaskHandler.checkViewTaskStatus(this)

            let p = cwx.getCurrentPage()
            const pageOptions = p.options
            console.log('pageOptions', pageOptions)
            if (!pageOptions.taskinvite) {
                isSigninChange = await signinTaskHandler.checkSigninTaskStatus(this)
            }
            console.log('pagshow 开始拉取数据list')
            return isViewChange || isSigninChange
        },
        commonParams() {
            let ret = {}
            if (isObject(this.data.orderData)) {
                ret = {
                    ...ret,
                    ...this.data.orderData
                }
            }
            return ret
        },
        /**
         * 获取模板数据 并且拉取任务数据
         * @param  {String} tempid 模板id
         */
        async fetchTemplateData() {
            const res = await model.fetch('loadLegaoTemplate', {
                templateCode: this.data.tempid
            })
            if (res.code == 0 && res.template) {
                try {
                    const pageComps = res.components
                    let i = 0,
                        len = pageComps.length;
                    let _taskInfo = null;
                    for (i; i < len; i++) {
                        if (pageComps[i].id == this.data.compid) {
                            _taskInfo = JSON.parse(pageComps[i].property)
                            break
                        }
                    }
                    // 2021-07-27  taskProjectCode 替换为 channelCode
                    // 先取props的channelCodeStr传值
                    _taskInfo.channelCode = this.data.channelCodeStr || _taskInfo.taskProjectCode
                    _taskInfo.taskProjectCode = this.data.channelCodeStr || _taskInfo.taskProjectCode
                    if (!_taskInfo.taskModule) {
                        _taskInfo.taskModule = 1
                    }
                    this.resolveConfig(_taskInfo)
                    console.log('taskInfo', _taskInfo)
                    this.setData({
                        taskInfo: _taskInfo
                    }, () => {
                        this.getTaskList()
                    })
                } catch (e) {
                    console.log('tpl JSON parse err: ', e)
                }
            }
        },

        async getTaskList(options) {
            const {
                isCheckTask = true
            } = options || {}
            if (!this.data.taskInfo.taskProjectCode) return
            const res = await model.fetch('getTaskList', {
                channelCode: this.data.taskInfo.taskProjectCode,
                version: '3',
                ...this.commonParams()
            })
            if (res.code == 200) {
                const {
                    taskList,
                    combData
                } = this.buildTaskConfig(res)

                let sortTaskList = this.sortTask(taskList);
                sortTaskList = this.resolveAvatarData(sortTaskList)
                this.customerTriggerEvent('getTaskList', {
                    taskList: sortTaskList,
                })

                let {
                    taskInfo
                } = this.data
                if (taskInfo.maxDisplayNum == 0) {
                    taskInfo.maxDisplayNum = sortTaskList.length
                }

                this.setData({
                    taskList: sortTaskList,
                    taskInfo,
                    combData,
                })
                console.warn('【task】taskList', this.data.taskList)
                this.customerUbtTrace({
                    action: "getTaskList",
                    taskList: sortTaskList,
                    taskInfo
                })
                if (isCheckTask) {
                    const taskChange = await this.checkTask()
                    if (taskChange) {
                        this.getTaskList({
                            isCheckTask: false
                        })
                    }
                }
            }
        },

        buildTaskConfig(res) {
            let sortType = res.sortType || SORT_TYPE.default
            // 乐高拓展字段配置排序
            let { taskInfo } = this.data
            const legaoExtensionJson = parseJson(taskInfo.extensionJson)
            if (legaoExtensionJson?.sortType) {
                sortType = legaoExtensionJson.sortType
            }
            this.sortType = sortType

            let _unCompletedTaskInfoList = res.todoTaskList || []
            let _completedTaskInfoList = res.finishTaskList || []
            _unCompletedTaskInfoList = _unCompletedTaskInfoList.sort((a, b) => {
                return b.status - a.status
            })
            let _taskList = [..._unCompletedTaskInfoList, ..._completedTaskInfoList];

            const len = _taskList.length;
            for (let i = 0; i < len; i++) {
                // 接口参数变更
                _taskList[i]['taskId'] = _taskList[i]['id']
                _taskList[i]['taskStatus'] = _taskList[i]['status']
                _taskList[i]['htmlUrl'] = _taskList[i]['h5Url']
                _taskList[i]['taskIcon'] = _taskList[i]['icon']
                _taskList[i]['taskName'] = _taskList[i]['displayName']
                _taskList[i]['taskTarget'] = this.computeTaskTarget(_taskList[i])
                _taskList[i]['taskProcess'] = this.computeTaskProcess(_taskList[i])
                _taskList[i]['taskDesc'] = _taskList[i]['description']
                _taskList[i]['currencyNum'] = this.computeTaskCurrency(_taskList[i])
                _taskList[i]['receiveTaskText'] = this.computeReceiveTaskBtn(_taskList[i]) // 领任务
                _taskList[i]['buttonText'] = this.computeTodoTaskBtn(_taskList[i]) // 去完成
                _taskList[i]['receiveAwardTaskText'] = this.computeReceiveAwardTaskBtn(_taskList[i]) // 领奖励
                _taskList[i]['buttonDoneText'] = this.computeDoneTaskBtn(_taskList[i]) // 已完成
                _taskList[i]['disabeld'] = this.computeDisabeldBtn(_taskList[i])
                _taskList[i]['viewTime'] = _taskList[i]['browseSeconds']
                _taskList[i]['isCombination'] = _taskList[i]['taskGroupDto']?.type == COMB_TYPE.group
                _taskList[i]['extendObj'] = resolveJsonToObj(_taskList[i]['extendJson'])
                _taskList[i]['eventDisplayObj'] = resolveJsonToObj(_taskList[i]['eventDisplay'])
                if (_taskList[i].taskDesc) {
                    _taskList[i]['descList'] = _taskList[i].taskDesc.split('\n')
                } else {
                    _taskList[i]['descList'] = []
                }
            }

            let combData = {
                type: 0,
            }
            const exclusiveTaskItem = _taskList.find(item => item.taskGroupDto?.type == COMB_TYPE.MutuallyExclusive)
            if (exclusiveTaskItem) {
                combData = {
                    ...exclusiveTaskItem.taskGroupDto
                }
            }
            return {
                combData,
                taskList: _taskList
            }
        },

        resolveConfig: function (config) {
            config.extensionJson = parseJson(config.extensionJson, {}) || {}
            config.combinationShowProcess = !!config.extensionJson.combinationShowProcess
        },

        computeTaskCurrency: function (taskItem) {
            return taskItem?.awardDesc || ''
        },

        computeTaskProcess: function (taskItem) {
            const isCombination = taskItem.taskGroupDto?.type == COMB_TYPE.group
            return isCombination ? taskItem.taskGroupDto.currentProcess : taskItem.process
        },

        computeTaskTarget: function (taskItem) {
            const isCombination = taskItem.taskGroupDto?.type == COMB_TYPE.group
            return isCombination ? taskItem.taskGroupDto.totalProcess : taskItem.eventTarget
        },

        computeReceiveTaskBtn: function (taskItem) {
            return taskItem.buttonReceiveText || '领任务'
        },
        computeTodoTaskBtn: function (taskItem) {
            const eventDisplay = localUtils.parseJson(taskItem.eventDisplay)
            if (taskItem.eventType == eventMenu.contentBackendAudit) {
                if (taskItem.status == 1) {
                    let {
                        _rateLevel
                    } = eventDisplay
                    if (_rateLevel) {
                        return localUtils.RATE_LEVEL_MAP[_rateLevel || 1]
                    }
                }
                if (taskItem.status == 0) {
                    return taskItem.buttonText
                }
            }
            return taskItem.buttonText || '去完成'
        },
        computeReceiveAwardTaskBtn: function (taskItem) {
            return taskItem.buttonAwardText || '领奖励'
        },
        computeDoneTaskBtn: function (taskItem) {
            return taskItem.buttonDoneText || '已完成'
        },

        computeDisabeldBtn: function (taskItem) {
            if (taskItem.eventType == eventMenu.contentBackendAudit) {
                const eventDisplay = localUtils.parseJson(taskItem.eventDisplay)
                if (eventDisplay._rateLevel == 2) {
                    return true
                }
            }
            return false
        },

        /**
         * @description 根据链接上的task_sort对任务列表重新排序
         * 2021-08-09 通过url上参数task_sort=1,2,3,4 （数字为taskid）来置顶任务  
            置顶排序按照该字段  仅在 未领取&已领取未完成 基础上置顶
            任务排序优化，领奖励>未领取&已领取未完成>已完成
         */
        sortTask(taskList) {
            const sortByQuery = (a, b) => {
                let taskSort = []
                const mPage = cwx.getCurrentPage()
                taskSort = mPage.options && mPage.options.task_sort && mPage.options.task_sort.split(',').map(c => ~~c) || []
                if (a.status == 3) return 1
                if (taskSort.includes(a.id) && taskSort.includes(b.id)) {
                    return taskSort.indexOf(a.id) - taskSort.indexOf(b.id);
                }
                if (taskSort.includes(a.id)) {
                    return -1
                }
                if (!taskSort.includes(a.id)) {
                    return 1
                }
                return 0
            }
            const sortByIndex = (a, b) => {
                if (a.sort === b.sort) {
                    return 1
                } else {
                    return a.sort - b.sort
                }
            }
            const filterDone = item => item.status == 3
            const filterUnDone = item => item.status != 3
            // 3.固定排序 + 已完成沉底
            if (this.sortType === SORT_TYPE.byDoneDown) {
                taskList = taskList.sort(sortByIndex).sort(sortByQuery)
                taskList = [...taskList.filter(filterUnDone), ...taskList.filter(filterDone)]
                return taskList
            }
            // 2. 固定排序，按照sort升序排列
            if (this.sortType === SORT_TYPE.byIndex) {
                taskList = taskList.sort(sortByIndex)
                return taskList
            }
            // 1. 先按照 领奖励 去完成 已完成 来排序
            // task_sort排序的置顶，并且忽略已完成状态
            let statusSort = [
                [2],
                [1, 0],
                [3]
            ];
            const sortByStatus = (a, b) => {
                let sortWithStatus = statusSort.findIndex(c => c.includes(a.status)) - statusSort.findIndex(c => c.includes(b.status));
                if (sortWithStatus != 0) {
                    return sortWithStatus;
                }
                if (![0, 1].includes(a.status)) {
                    return 0;
                }
            }

            taskList = taskList.sort(sortByStatus)
            // 负数排序置顶逻辑
            taskList = sortByTop(taskList).sort(sortByQuery)
            return [...taskList]
        },

        onlyReceiveTask(taskItem) {
            const mktUnionData = this.mktUnionData
            const {
                taskId
            } = taskItem
            model.fetch('userTodoTask', {
                'channelCode': this.data.taskInfo.channelCode, //int	项目id
                'taskId': taskId, //long	任务id
                'done': 0,
                'status': 0,
                'allianceid': mktUnionData.allianceid,
                'sid': mktUnionData.sid,
                'ouid': mktUnionData.ouid,
                'sourceid': mktUnionData.sourceid,
                'pushcode': mktUnionData.pushcode,
                'innersid': mktUnionData.innersid,
                'innerouid': mktUnionData.innerouid,
                ...this.commonParams()
            }).then(res => {
                if (res.code == 100) {
                    cwx.user.login({
                        param: {
                            sourceId: "market"
                        },
                    });
                    return
                }
                let {
                    taskList
                } = this.data
                taskList.find(task => task.id == taskId).taskStatus = 1;
                // 任务进入1状态 广播任务内容
                try {
                    this.customerTriggerEvent('receiveTask', {
                        taskItem: taskList.find(task => task.id == taskId),
                        taskList
                    })
                } catch (error) {
                    console.log('customerTriggerEvent', error)
                }
                this.customerUbtTrace({
                    action: 'onlyReceiveTask success',
                    channelCode: this.data.taskInfo.channelCode,
                    taskId: taskId,
                    done: 1,
                })
                this.getTaskList()
            })
        },

        async registerEvent(taskItem) {
            const taskType = taskItem.eventType
            const {
                taskId
            } = taskItem
            const extendJson = resolveJsonToObj(taskItem.extendJson)
            // if (!this.data.hideUpdateAvatar) {
            //   if (!['MP_SUBSCRIBE'].includes(taskType)) {
            //     // 订阅不需要获取用户头像
            //     try {
            //         await utils.getAndUpdateUserProfile()
            //     } catch (err) {
            //       console.log(err)
            //     }
            //   }
            // }
            // 去完成前订阅消息，登录态下才会执行
            let subscribeCodeBeforeTodo = extendJson.subscribeCodeBeforeTodo
            if (subscribeCodeBeforeTodo) {
                subscribeCodeBeforeTodo = extendJson.subscribeCodeBeforeTodo.split(',')
                const fn = createTriggerFnByTime(handleSubScribe, {
                    key: 'mkt_task_subscribe_todo',
                    endTime: Math.min(taskItem.deadline || 0, taskItem.validityEndTime),
                    itemKey: this.data.taskInfo.channelCode + '_' + taskId
                })
                console.log('订阅')
                await fn(subscribeCodeBeforeTodo || [], this.data.taskInfo.channelCode, taskId, this)
            }
        },

        /**
         * @description 用户领取任务
         */
        async handleTask(e) {
            let taskId = ''
            if (e && e.target && e.target.dataset) {
              taskId = e.target.dataset.taskid || e.currentTarget.dataset.taskid || e.detail.taskId
            } else {
              taskId = e
            }
            const taskItem = this.data.taskList.find(item => item.id == taskId)
            if (!taskItem) {
                return
            }
            const taskType = taskItem.eventType
            const url = taskItem.wechatUrl
            const progress = taskItem.taskProcess
            const needReceive = taskItem.needReceive == 1
            if (!this.data.isLogin) {
                this.toLogin()
                return
            }
            if (needReceive && taskItem.taskStatus == 0) {
                this.onlyReceiveTask(taskItem)
                return
            }
            await this.registerEvent(taskItem)
            this.customerUbtTrace({
                action: "handleTask",
                taskType: taskType,
                taskId: taskId
            })
            switch (taskType) {
                // 浏览任务
                case 'BROWSE':
                case 'BROWSE_DYNAMIC_URL':
                    viewTaskHandler.goTargetView(this, taskId, url, progress)
                    break;
                    // 无重复浏览
                case 'NO_REPEAT_BROWSE':
                    viewTaskHandler.goTargetViewNoRepeat(this, taskId, url, progress)
                    break;
                    // 签到
                case 'SIGN_IN':
                    signinTaskHandler.handleSign(this, taskId);
                    break;
                    // 积分
                case 'INTEGRAL_DEDUCTION_EVENT':
                    integralTaskHandler.handleIntegral(this, taskId);
                    break;
                case eventMenu.yoDeduction:
                    yoDeductionTaskHandler.handleTask(this, taskId)
                    break;
                    // 视频号任务
                case 'ENERGYEXCHANGE_VIDEOLIKE':
                case 'ENERGYEXCHANGE_VIDEOFOCUS':
                    videoTaskHandler.handleTripVideo(this, url, taskId)
                    break;
                    // 订阅任务
                case 'MP_SUBSCRIBE':
                    const templateIdList = resolveJsonToObj(taskItem.eventDisplay).subMessageConf?.map(c => c.tmpId).join(',');
                    subscribeTaskHandler.receiveSubscribeTask(this, taskId, templateIdList)
                    break;
                    // 激励广告任务
                case 'MP_AD':
                    this.receiveTask(taskId, () => {
                        const code = resolveJsonToObj(taskItem.eventDisplay).code
                        const ad = new createVideoAd(code, taskId, this)
                        adVideoTaskHandler.openAdVideo(ad)
                    })
                    break;
                  // 视频号
                case eventMenu.openWxVideo:
                  openWxVideoHandler.handleTask(this, taskId)
                  break;
                    // 邀请助力
                case eventMenu.inviteHelp:
                    // a + b 同邀请助力
                case eventMenu.inviteTaskAB:
                    inviteHelpTaskHandler.receiveInviteHelpTask(this, taskId)
                    break;
                    // 丽程
                case 'REGISTER_LI_CHEN':
                    // 第三方通用事件
                case 'EXTERNAL_THIRD_PARTY_EVENT':
                    externalThirdHandler.handleTask(this, taskId)
                    break;
                    // 微信加企微
                case eventMenu.qywxAddFriend:
                    qywxAddFriendHandler.handleTask(this, taskId)
                    break;
                case eventMenu.contentBackendAudit:
                    TaskContentBackendAudit.handleTask(this, taskId);
                    break;
                case eventMenu.wxMpOrderComment:
                    goodReviewsHandler.handleTask(this, taskId)
                    break;
                    // 订单类任务
                case 'ORDER_AMOUNT':
                default:
                    this.receiveTask(taskId, () => this.goTargetUrl(url))
                    break;
            }
        },

        /**
         * @description 任务完成后继续浏览
         */
        async handleWithoutTask(e) {
            const {
                taskList
            } = this.data
            const taskId = e.target.dataset.taskid || e.currentTarget.dataset.taskid || e.detail.taskId
            const curItem = taskList.find(item => item.taskId == taskId)
            // 插入额外逻辑
            await this.injectRedPacket({
                taskItem: curItem
            })
            const {
                eventType,
                finishJump,
                extendObj
            } = curItem
            if (!finishJump) return
            let url = curItem.wechatUrl.split(',')[0]
            if (curItem.status == 3 && extendObj?.taskDoneJumpUrl) {
                url = extendObj?.taskDoneJumpUrl
            }
            switch (eventType) {
                case 'BROWSE':
                    // 支持浏览任务 已完成后 可以继续浏览
                    if (url.indexOf('&wxpopup=') > 0) {
                        // 已经完成的任务  不要再出倒计时浮层
                        url = url.replace('&wxpopup=', '&nopopup=')
                    }
                    this.goTargetUrl(url, curItem)
                    break;
                case 'MP_SUBSCRIBE':
                  // 订阅任务什么也不做
                  break;
                // 视频号
                case eventMenu.openWxVideo:
                  openWxVideoHandler.openVideo(this, {}, curItem)
                  break;
                default:
                    this.goTargetUrl(url, curItem)
                    break;
            }
        },

        // 切换任务详情展开与否
        toggleDesc(e) {
            const taskId = e.target.dataset.taskid || e.currentTarget.dataset.taskid
            let _taskList = [...this.data.taskList]
            const len = _taskList.length

            for (let i = 0; i < len; i++) {
                if (_taskList[i].expand === undefined) {
                    _taskList[i].expand = false
                }
                if (_taskList[i].taskId === taskId) {
                    _taskList[i].expand = !_taskList[i].expand
                } else {
                    _taskList[i].expand = false
                }
            }

            this.setData({
                taskList: _taskList
            })
        },

        /*
         * 领取任务
         */
        receiveTask(taskId, cb) {
            const mktUnionData = this.mktUnionData
            model.requestUrl('userTodoTask', {
                'channelCode': this.data.taskInfo.channelCode, //int	项目id
                'taskId': taskId, //long	任务id
                'done': 0,
                'status': 0,
                'allianceid': mktUnionData.allianceid,
                'sid': mktUnionData.sid,
                'ouid': mktUnionData.ouid,
                'sourceid': mktUnionData.sourceid,
                'pushcode': mktUnionData.pushcode,
                'innersid': mktUnionData.innersid,
                'innerouid': mktUnionData.innerouid,
                ...this.commonParams()
            }, async (res) => {
                if (res.code == 100) {
                    cwx.user.login({
                        param: {
                            sourceId: "market"
                        },
                    });
                    return
                }
                if (res.code === 200) {
                  // 领奖成功需要提示，阻断做任务的动作
                  const receiveSuccess = await this.receiveTaskSendAward(taskId, res.infoMap.receivedTaskId)
                  if (receiveSuccess) {
                    return
                  }
                    cb && typeof cb === 'function' && cb()
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none'
                    })
                }
            })
        },

        // 领取奖励
        handleUserAcceptPrize(e) {
            const taskId = e.target.dataset.taskid
            const {
                taskList
            } = this.data
            const taskItem = taskList.find(item => item.taskId == taskId)
            const currencyNum = e.target.dataset.currencynum
            model.requestUrl('userAcceptPrize', {
                channelCode: this.data.taskInfo.channelCode,
                taskId: taskId,
                ...this.commonParams()
            }, async (res) => {
                if (res.code === 200) {
                    try {
                        await this.injectRedPacket({
                            taskItem,
                            reward: res
                        })
                    } catch (error) {}
                    // 奖励领取成功， 更新任务列表
                    const isTrain = this.data.taskInfo.taskStyle == 17
                    if (isTrain) {
                        // this.completeTrainAwardItem(res)
                        this.handleTrainAwardItemShow(res)
                    } else {
                        wx.showToast({
                            title: '领取成功',
                        })
                    }
                    const taskList = this.updateTaskListStatus(taskId, 3)
                    // 告知页面有积分/能量等需要更新
                    this.customerTriggerEvent('userAcceptPrize', {
                        code: 200,
                        currencyNum: currencyNum,
                        taskList,
                        taskItem
                    })
                    if (taskItem.isCombination) {
                        this.fetchTemplateData()
                    } else {
                      this.getTaskList({
                        isCheckTask: false
                      })
                    }
                } else {
                    if (res.message) {
                        wx.showToast({
                            title: res.message,
                            icon: 'none'
                        })
                    }
                }

                this.customerUbtTrace({
                    action: "handleUserAcceptPrize",
                    taskId: taskId
                })

            })
        },

        async injectRedPacket({
            taskItem,
            reward
        }) {
            let currencyDtoList
            if (reward) {
                currencyDtoList = reward.currencyDtoList
            } else {
                currencyDtoList = taskItem.currencyDtoList
            }

            const redPacket = currencyDtoList.find(item => item.type == 10)
            if (redPacket) {
                const {
                    extInfoMap
                } = redPacket
                const code = extInfoMap?.code
                if (!code) {
                    console.log('缺少code')
                    return
                }
                this.goTargetUrl(code)
                return Promise.reject(0) // 阻止调用位置继续执行
            }

            return Promise.resolve(1)
        },

        updateStatusToComplete(taskItem) {
            const noAward = taskItem.currencyDtoList?.length === 1 && taskItem.currencyDtoList[0]?.type == 6

            if (noAward) {
                taskItem.taskStatus = 3
            } else {
                taskItem.taskStatus = 2
            }
        },

        // 领取任务时发奖励
        async receiveTaskSendAward(taskId, receiveTaskId) {
          const taskItem = this.data.taskList.find((item) => item.id == taskId)
          if (taskItem.status == 0) {
            let params = {
              taskId,
              receiveTaskId: receiveTaskId,
              channelCode: this.data.taskInfo.channelCode,
              ...this.data.orderData
            }
            const res = await model.fetch('receiveTaskAward', params)
            if (res.code == 200 && res.popupType == 1) {
              let defaultImage = 'https://images3.c-ctrip.com/train/2022/app/8.55/zengzhang/zhuli/pop_pic_blue.png'
              this.setData({
                receiveTaskAwardData: {
                  topImage: res.popupPicUrl || defaultImage,
                  title: res.title,
                  subTitle: res.subTitle,
                  picture: res.awardPicUrl,
                  taskId
                }
              })
              this.getTaskList({ isCheckTask: false })
              return true
            }
          } else {
            return false
          }
        },
        //  领奖励弹窗
        handleCloseTrainReceiveAwardModal() {
          this.setData({
            trainAwardData: null
          })
        },
        // 领任务发奖励关闭弹窗
        handleCloseTrainReceiveTaskAwardModal() {
          const { taskId } = this.data.receiveTaskAwardData
          this.setData({
            receiveTaskAwardData: null
          })
          this.handleTask(taskId)
        },

        // 领取任务 / 领取奖励后 更新列表状态
        updateTaskListStatus(taskId, targetStatus) {
            if (!taskId) {
                return
            }

            const taskList = this.data.taskList
            const taskItem = taskList.find(item => item.taskId == taskId)
            if (taskItem.taskStatus == 2) {
                // 点击领奖励
                taskItem.taskStatus = targetStatus
            } else {
                this.updateStatusToComplete(taskItem)
            }

            this.setData({
                taskList
            })
            return taskList
        },

        // 更新次数
        updateProcess(taskId) {
            const _taskList = [...this.data.taskList]
            const _task = _taskList.find(item => item.taskId == taskId)
            if (!_task) return

            // 如果完成就退出
            if (_task.taskTarget <= _task.taskProcess) {
                this.customerTriggerEvent('complateTask', {
                    taskItem: this.data.taskList.find(item => item.taskId == taskId),
                    taskList: this.data.taskList
                })
                return
            }

            _task.taskProcess = Number(_task.taskProcess) + 1
            this.setData({
                taskList: _taskList
            })
            const _isDone = _task.taskTarget <= _task.taskProcess
            // 完成就更新按钮状态
            if (_isDone) {
                this.updateTaskListStatus(taskId, 2)
            }
        },

        handleClickSigninReceive(e) {
            this.handleUserAcceptPrize(e)
            this.signinModalClose()
        },

        handleShowPrize(e) {
            const taskId = e.target.dataset.taskid
            console.log(taskId)
            if (this.data.peaceShowPrizeId == taskId) {
                this.setData({
                    peaceShowPrizeId: ''
                })
                return
            }
            this.setData({
                peaceShowPrizeId: taskId
            })
        },

        signinModalClose() {
            this.setData({
                showSignModal: false
            })
        },
        /*
         *  =============================================工具方法=============================================
         */
        closeFloat() {
            this.customerTriggerEvent('triggerEvent', false)
            this.customerUbtTrace({
                action: "closeFloat",
            })

        },

        goTargetUrl(targetUrl, taskItem) {
            if (taskItem) {
                let extendJson = parseJson(taskItem.extendJson)
                if (extendJson?.jumpClosePopup == 'true') {
                    return
                }
            }
            if (targetUrl) {
                // 跳转独立小程序
                if (targetUrl.indexOf('thirdAppId') > 0) {
                    targetUrl = targetUrl.match(/^\//) ? targetUrl : `/${targetUrl}`
                    wx.navigateToMiniProgram({
                        appId: utils.getUrlQuery(targetUrl, 'thirdAppId'),
                        path: targetUrl.trim(),
                        extraData: {}
                    });
                } else if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
                    // 跳转H5页面
                    cwx.component.cwebview({
                        data: {
                            url: encodeURIComponent(targetUrl)
                        }
                    })
                } else {
                    if (targetUrl[0] == '/' && targetUrl.slice) {
                        targetUrl = targetUrl.slice(1)
                    }
                    cwx.navigateTo({
                        url: "/" + targetUrl.trim(),
                        fail: () => {}
                    });
                }
            }
        },
        /*
         *检测登录态
         */
        checkLoginState() {
            return new Promise((resolve, reject) => {
                cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
                    console.log('-------------- 初始化获取登录态--------------------', checkLoginRes)
                    if (!checkLoginRes) {
                        this.setData({
                            isLogin: false
                        })
                        //未登录情况下获取登录凭证
                        cwx.user.wxLogin((errCode, funtionName, errorMsg) => {
                            if (errCode != 0) {
                                wx.showToast({
                                    title: errorMsg,
                                    icon: 'none'
                                })
                            }
                        })
                        resolve(false)
                    } else {
                        this.setData({
                            isLogin: true
                        })
                        resolve(true)
                    }
                })
            })
        },
        toLogin() {
            cwx.user.login({
                param: {
                    sourceId: "market"
                },
            })
        },

        // 加载更多任务
        showMore() {
            this.setData({
                expand: true
            })
            this.customerUbtTrace({
                action: "showMore",
            })
        },

        clickAvatar(e) {
            const taskId = e.currentTarget.dataset.taskid || e.detail.taskId
            const idx = e.currentTarget.dataset.idx ?? e.detail.idx
            const {
                taskList
            } = this.data
            const taskItem = taskList.find(item => item.id == taskId)
            let headUrl = taskItem.itemList[idx].data?.headUrl
            if (!headUrl) {
                inviteHelpTaskHandler.receiveInviteHelpTask(this, taskId, mktUnionData)
                return
            } else {
                // 领取奖励
                const extraData = this.data.extraData
                const hasExtra = extraData && extraData.taskList.find(item => item.taskid == taskItem.taskid)
                if (hasExtra) {
                    // 外部的领奖励
                    console.log('外部领奖励')
                } else {
                    let toReceiveArard = taskItem.itemList[idx].data?.awardStatus == '0' // 去领奖
                    if (toReceiveArard) {
                        inviteHelpTaskHandler.toReceiveSmallAward(this, taskItem, idx, mktUnionData)
                        return
                    }
                }
            }
        },

        resolveAvatarData(taskList) {
            const extraData = this.data.extraData

            const resolveAvatarList = (list = [], target) => {
                if (list.length < 4) {
                    let temp = Array.from({
                        length: target - list.length
                    }).fill({})
                    list.push(...temp)
                }
                return list
            }
            let listMap = {}
            if (extraData?.taskList?.length > 0) {
                extraData.taskList.forEach(item => {
                    listMap[item.id] = item
                })
            }
            // 邀请任务，处理头像
            taskList.forEach(item => {
                if (item.eventType == eventMenu.inviteHelp || item.eventType == eventMenu.inviteTaskAB) {
                    item.itemList = resolveAvatarList(item.itemList, item.eventTarget)

                    const curMap = listMap[item.id]
                    if (curMap && curMap.awards) {
                        item.itemList.forEach((m, index) => {
                            item.itemList[index] = {
                                ...m,
                                acount: curMap.awards[index]
                            }
                        })
                    }
                }
            })
            return taskList
        },

        setTaskdone(taskId) {
          model.requestUrl('userTodoTask', {
            'channelCode': this.data.taskInfo.channelCode, //int	项目id
            'taskId': taskId, //long	任务id
            'done': 1,
            'status': 1
          }, res => {
              if (res.code === 200) {
                this.getTaskList({
                  isCheckTask: false
                })
              } else {
                  wx.showToast({
                      title: res.msg,
                      icon: 'none'
                  })
              }
          }, () => {
              wx.showToast({
                  title: 'something error',
                  icon: 'none'
              })
          })
        },

        customerTriggerEvent(type, ...data) {
            console.log('customerTriggerEvent:', type, ...data)
            switch (type) {
                case 'getTaskList':
                    this.triggerEvent(type, ...data)
                    break;

                case 'userAcceptPrize':
                    this.triggerEvent(type, ...data)
                    cwx.Observer.noti("mkt_taskevent_acceptprize", ...data)
                    break;

                case 'complateTask':
                    this.triggerEvent(type, ...data)
                    break;

                case 'triggerEvent':
                    this.triggerEvent(type, ...data)
                    break;

                case 'receiveTask':
                    this.triggerEvent(type, ...data)
                    break;

                case 'clickTodo':
                    this.triggerEvent(type, ...data)
                    break;

                case 'getTaskAwardData':
                    this.triggerEvent(type, ...data)
                    break;

                default:
                    this.triggerEvent(type, ...data)
                    break;
            }
        },

        handleCloseRule() {
            this.setData({
                showRulePanel: false
            })
        },

        handleShowRule(e) {
          const taskId = e.target.dataset.taskid
          const ruleDesc = this.data.taskList.find(item => item.id == taskId).ruleDesc
            this.setData({
                showRulePanel: true,
                ruleDesc,
            })
        },

        handleCloseSharePanel(e) {
            this.setData({
                showSharePanel: false
            })
        },

        initUnionData() {
            cwx.mkt.getUnion((unionData) => {
                mktUnionData['allianceid'] = String(unionData.allianceid) || ''
                mktUnionData['sid'] = String(unionData.sid) || ''
                mktUnionData['ouid'] = String(unionData.ouid) || ''
                mktUnionData['sourceid'] = String(unionData.sourceid) || ''
                let extUnionData = JSON.parse(unionData.exmktid)
                mktUnionData['pushcode'] = String(extUnionData.pushcode) || ''
                mktUnionData['innersid'] = String(extUnionData.innersid) || ''
                mktUnionData['innerouid'] = String(extUnionData.innerouid) || ''
                this.mktUnionData = mktUnionData
            })
        },

        customerUbtTrace(args) {
            console.warn(args)
            mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_miniapp_task_component', {
                openid: openid,
                pageid: pageId,
                auth: cwx.user.auth,
                tempid: this.data.tempid,
                channelCode: this.data.taskInfo.taskProjectCode,
                platform: 'miniProgram',
                ...args
            });
        },
        exposure() {
            // 请勿重复添加
            if (this.addExposured) {
                return
            }
            this.addExposured = true
            this._observer = new Exposure(this, this.exposureTrace.bind(this))
            this._observer.relativeToViewport().observe(`.compid_${this.data.compid} .task_item_exposure`)
        },
      
        exposureTrace (args) {
            const params = {
                type: 'exposure',
                channelCode: this.data.taskInfo.channelCode,
                templateId: this.data.tempid,
                componentId: this.data.compid,
                platform: 'miniProgram',
                openid: openid,
                pageid: pageId,
                auth: cwx.user.auth,
                ...args
            }
            // console.log('【task exporesur】', params)
            mPage && mPage.ubtTrace && mPage.ubtTrace('mkt_miniapp_task_component', params);
        },
    }
})

function resolveJsonToObj(str) {
    let ret = {}
    try {
        ret = JSON.parse(str)
    } catch (error) {}
    return ret
}
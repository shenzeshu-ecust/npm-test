// pages/market/directory/duobao/index.js
import {
  cwx,
  __global,
  CPage
} from "../../../../cwx/cwx.js";
import {
  fetch
} from './model'
import {
  resolveProcessWidth,
  parseJson
} from './utils'
import {
  resolveStatus,
  legaoPrizeUrlFat,
  legaoPrizeUrlProd,
  cmsActFat,
  cmsActProd
} from './config'
import utils, {
  debounceFunc
} from '../../common/utils';
CPage({
  pageId: '10650084801',
  checkPerformance: true,  
  /**
   * 页面的初始数据
   */
  data: {
    env: __global.env,
    actId: __global.env == 'fat' ? cmsActFat : cmsActProd,
    navbarData: {
      showCapsule: 1, //是否显示头部左上角小房子 1显示 0 不显示
      showBack: 1, //是否显示返回 1显示 0不显示
      showColor: 0, //navbar背景颜色 1蓝色 0白色
      bgTransparent: true,
      iconColor: 'white',
      titleColor: 'white'
    },
    activityId: '',
    showDuobaoModal: false,
    showGuideModal: '',
    showTouzhuSuccessModal: false,
    voteInfo: null,
    activityInfo: null,
    kanbanStatus: '',
    // 1 立即加投 2继续加投 3中奖 4夺宝号已满 待开奖 5未中奖 6开奖失败-总数不足 7开奖失败-无人
    processInfo: null,
    voteInputNum: 1,
    yoTicketNum: 0,
    yoTicketNumPerVote: 0, //TODO
    step1Top: 0,
    step2Top: 0,
    tipsModal: false,
    scribeStatus: 0, // 0未开启  1开启
    subIds: [],
    subCountdown: 3,
    enableMaskclose: true, // 控制投票浮层是否点击mask可关闭，解决键盘没有完成按钮的问题，导致用户点击梦层误触
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    this.getOpenId()
    this.changeNum = debounceFunc(this.initDuobaoData.bind(this), 200)
    const {
      activityId
    } = options
    this.setData({
      activityId
    })
    this.init()
    this.initConfig()
      .then(() => {
        // this.checkDingyue()
      })
    wx.onKeyboardHeightChange((res) => {
        console.log('wx.onKeyboardHeightChange触发', res.height)
        this.handlekeyboardheightchange(res.height)
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.init()
  },

  async initGuide() {
    let isShow = false
    if (this.data.kanbanStatus == 1) {
      isShow = this.storageShow()
      if (isShow) {
        setTimeout(() => {
          this.handleShowGuideModal()
        }, 500)
      }
    }
    this.logTrace({
      type: 'initGuide',
      kanbanStatus: this.data.kanbanStatus,
      isShow
    })
    return isShow
  },

  storageShow: function () {
    const key = 'mkt_duobao'
    let ret = false
    try {
      let storageData = wx.getStorageSync(key) || {}
      if (storageData) {
        const {
          time
        } = storageData
        if (!time || time > Date.now() + 1000 * 60 * 60 * 24 * 7) {
          ret = true
        }
      }
      storageData.time = Date.now()
      wx.setStorageSync(key, storageData)
    } catch (e) {
      console.log(e)
      // Do something when catch error
    }
    return ret
  },

  async getOpenId() {
    utils.getOpenid(() => {
      this.setData({
        openId: cwx.cwx_mkt.openid
      })
    })
  },

  async init() {
    if (this.initPending) return
    this.initPending = true
    await this.initMyYo()
    await this.initData()
    await this.initDuobaoData()
    await this.initKanbanStatus()
    this.initPending = false
  },

  async initData() {
    const {
      activityId
    } = this.data
    const actRes = await fetch('yoTicketActivityInfoQuery', {
      activityId
    })
    if (actRes.errcode == 0) {
      const {
        activityName,
        activityStatus,
        winUserName,
        winNumber,
        numberList,
        activityImg,
        activityProgress,
        votedNumberList,
        maxVoteNum,
        maxVoteTotal
      } = actRes
      this.setData({
        activityInfo: {
          ...actRes
        },
        processInfo: {
          process: activityProgress.reached,
          target: activityProgress.total,
          width: resolveProcessWidth(activityProgress.reached, activityProgress.total)
        },
        voteInfo: {
          maxVoteNum,
          maxVoteTotal,
          votedNumberList,
          votedNumberStr: votedNumberList.join('、'),
          votedNum: votedNumberList.length,
        },
        plusDisabled: this.data.voteInputNum >= maxVoteNum,
      })
    }
    this.logTrace({
      type: 'yoTicketActivityInfoQuery',
      data: actRes
    })
  },

  async initConfig() {
    const res = await fetch('getActivityConfig', {
      "activityId": this.data.actId,
    })
    if (res && res.errcode == 0 && res.activityCustomfields.subIds) {
      this.setData({
        subIds: res.activityCustomfields.subIds.split(','),
      })
      this.logTrace({
        type: 'getActivityConfig',
        subIds: res.activityCustomfields.subIds.split(','),
      })
    }
  },

  async initMyYo() {
    const res = await fetch('yoTicketNumQuery')
    if (res.errcode == 0) {
      this.setData({
        yoTicketNum: res.yoTicketNum
      })
    }
    this.logTrace({
      type: 'yoTicketNumQuery',
      data: res
    })
  },
  // 如果穿voteNum表示是用户手动输入的，不传就是默认最大的可投注数
  async initDuobaoData(voteNum, votedNumList) {
    const {
      activityId,
      voteInfo
    } = this.data
    voteNum = voteNum || 1
    const _votedNumList = votedNumList || []
    const res = await fetch('yoTicketVoteInfoQuery', {
      activityId,
      voteNum,
      votedNumList: _votedNumList
    })
    if (res.errcode == 0) {
      const {
        generateNumberList,
        votedNumberList,
        maxVoteNum,
        maxVoteTotal
      } = res
      this.setData({
        'voteInfo.generateNumberList': generateNumberList,
        yoTicketNumPerVote: res.yoTicketNumPerVote,
        voteInputNum: voteNum // || maxVoteNum, // 如果穿voteNum表示是用户手动输入的，不传就是默认最大的可投注数
      })
    } else if (res.errcode == 8004) {
      // 不足
      console.log('不足')
    }
    this.logTrace({
      type: 'yoTicketVoteInfoQuery',
      activityId,
      voteNum,
      data: res,
    })
  },

  async initKanbanStatus() {
    const {
      activityInfo,
      voteInfo
    } = this.data
    const kanbanStatus = this.resolveKanbanStatus(activityInfo, voteInfo)
    this.setData({
      kanbanStatus
    })
    this.logTrace({
      type: 'initKanbanStatus',
      kanbanStatus,
    })
  },
  // 1 引导 2已投注-未开奖 3开奖-中奖 4开奖-未中奖 5开奖-失败
  resolveKanbanStatus(actRes, res) {
    const {
      activityStatus,
      winSelf: winNumber,
      activityProgress: {
        reached,
        total
      }
    } = actRes
    const {
      votedNumberList,
      maxVoteTotal,
      votedNum
    } = res
    const numberFull = votedNum >= maxVoteTotal
    return resolveStatus({
      numberFull,
      activityStatus,
      reached,
      total,
      winNumber,
      join: votedNumberList.length > 0
    })
  },
  // 夺宝号个数改变
  handleChangeVoteNum: function (e) {
    let {
      value
    } = e.detail
    this.setData({
      enableMaskclose: true
    })
    value = Number(value)
    if (value == this.data.voteInputNum) {
      return
    }
    if (value > this.data.voteInfo.maxVoteNum) {
      // 1 大于20总数  2 邮票不足
      const needNum = this.data.yoTicketNumPerVote * value
      if (needNum > this.data.yoTicketNum) {
        wx.showToast({
          title: 'YO票数额不足',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '超过最大可投数',
          icon: 'none'
        })
      }
      this.setData({
        voteInputNum: this.data.voteInputNum,
      })
      return
    }
    if (value <= 0) {
      this.setData({
        voteInputNum: this.data.voteInputNum,
      })
      return
    }
    if (value > 0) {
      this.setData({
        voteInputNum: value,
        plusDisabled: value >= this.data.voteInfo.maxVoteNum,
      })
      this.changeNum(value)
    }
  },
  handleMinus: function () {
    let {
      voteInputNum,
      voteInfo
    } = this.data
    const {
      maxVoteNum
    } = voteInfo
    voteInputNum--
    if (voteInputNum <= 0) {
      return
    }
    let generateNumberList = this.data.voteInfo?.generateNumberList
    generateNumberList.pop()
    this.setData({
      'voteInfo.generateNumberList': generateNumberList,
      voteInputNum,
      plusDisabled: voteInputNum >= maxVoteNum
    })
    // this.changeNum(voteInputNum)
  },
  handlePlus: function () {
    let {
      voteInputNum,
      voteInfo
    } = this.data
    const {
      maxVoteNum
    } = voteInfo
    voteInputNum++
    if (voteInputNum > maxVoteNum) {
      return
    }
    this.setData({
      voteInputNum,
      plusDisabled: voteInputNum >= maxVoteNum
    })
    this.changeNum(voteInputNum, this.data.voteInfo?.generateNumberList)
  },

  handleTouZhuChange: function (e) {
    let {
      list
    } = e.detail
    list = this.formatList(list)
    console.log('change', list)
    this.setData({
      enableMaskclose: true,
      'voteInfo.generateNumberList': list
    })
  },

  handlekeyboardheightchange: function (e) {
    // let {
    //   height
    // } = e.detail || {}
    // if (typeof height == 'undefined') {
    //   return
    // }
    // console.log('input触发', height)
    // if (height > 0) {
    //   this.setData({
    //     enableMaskclose: false
    //   })
    // } else {
    //   this.setData({
    //     enableMaskclose: true
    //   })
    // }
  },

  handleInpitFocus: function() {
    this.setData({
      enableMaskclose: false
    })
  },

  touzhuFocus: function(e) {
    this.setData({
      enableMaskclose: false,
    })
    this.trace({
        action: 'changeNumber',
        activityId: this.data.activityId,
        activityName: this.data.activityInfo?.activityName
    })
  },

  formatList: function (list) {
    return list.map(item => {
      if (item > 0) {
        return item
      } else {
        return ''
      }
    })
  },

  handleClickKanbanDuobao: async function () {
    // 票数不足
    if (this.data.voteInfo.maxVoteNum <= 0) {
      this.handleShowTipsMpdal()
      return
    }
    const showGuide = await this.initGuide()
    if (!showGuide) {
      this.handleShowModal()
    }
  },

  handleSubmit: async function () {
    const {
      activityId,
      openId
    } = this.data
    const voteNumberList = this.data.voteInfo.generateNumberList
    if (!activityId || !openId) {
      return
    }
    const hasError = voteNumberList.findIndex(item => item == '') > -1
    if (voteNumberList.length == 0 || hasError) {
      return
    }
    const res = await fetch('yoTicketVote', {
      voteNumberList,
      activityId,
      openId
    })
    this.logTrace({
      action: 'yoTicketVote submit',
      voteNumberList,
      activityId,
      openId,
      res
    })
    if (res.errcode == 0) {
      this.handleShowSuccessModal()
      this.init()
    } else if (res.errcode == 8011) {
      const list = parseJson(res.errmsg, [])
      const list1 = list.filter(item => item.type == 1) // 1超出范围
      const list2 = list.filter(item => item.type == 2) // 2数字重复
      const list3 = list.filter(item => item.type == 3) // 3数字连续
      if (list1.length > 0) {
        wx.showToast({
          title: '夺宝号超出最大范围',
          icon: 'none'
        })
        return
      }
      if (list2.length > 0) {
        wx.showToast({
          title: '夺宝号不能有重复数',
          icon: 'none'
        })
        return
      }
      if (list3.length > 0) {
        wx.showToast({
          title: '夺宝号不能有连续数',
          icon: 'none'
        })
        return
      }
    } else if (res.errcode == 40019) {
      wx.showToast({
        title: '您不满足参与活动的条件',
        icon: 'none'
      })
      return
    } else if (res.errcode == 8008 || res.errcode == 8009 || res.errcode == 8013) {
      wx.showToast({
        title: '开奖中',
        icon: 'none'
      })
      return
    } else {
      wx.showToast({
        title: '网络异常',
        icon: 'none'
      })
      return
    }
  },

  handleRefreshNumber: function () {
    this.initDuobaoData(this.data.voteInputNum)
    this.trace({
      action: 'refreshNumber',
      activityId: this.data.activityId,
      activityName: this.data.activityInfo?.activityName
    })
  },
  handleCloseTipsMpdal: function () {
    this.setData({
      tipsModal: false
    })
  },
  handleShowTipsMpdal: function () {
    this.setData({
      tipsModal: true
    })
  },
  jumpIndex: function () {
    cwx.navigateBack({
      success: function (res) {
        setTimeout(() => {
          const prevPage = cwx.getCurrentPage()
          prevPage.scrollToTask()
        }, 300)
      }
    })
  },
  handleCloseModal: function () {
    this.setData({
      showDuobaoModal: false
    })
  },
  handleShowModal: function () {
    this.setData({
      showDuobaoModal: true
    })
    this.trace({
        action: 'showDuobaoPanel',
        activityId: this.data.activityId,
        activityName: this.data.activityInfo?.activityName
    })
  },
  handleCloseGuideModal() {
    this.setData({
      showGuideModal: ''
    }, () => {
      this.handleClickKanbanDuobao()
      this.handleShowStep1()
    })
  },
  handleShowGuideModal: function () {
    this.setData({
      showGuideModal: 0
    })
  },
  handleShowStep1: function () {
    this.setData({
      showGuideModal: 1
    })
  },
  handleGuideStep1: function () {
    this.setData({
      showGuideModal: 2
    })
  },
  handleGuideStep2: function () {
    this.setData({
      showGuideModal: ''
    })
  },
  handleClickGuideMask: function () {
    if (this.data.showGuideModal == 1) {
      this.handleGuideStep1()
      return
    }
    if (this.data.showGuideModal == 2) {
      this.handleGuideStep2()
      return
    }
  },
  handleContinue: function () {
    if (this.data.voteInfo.maxVoteNum > 0) {
      this.setData({
        showTouzhuSuccessModal: false,
        // showDuobaoModal: true
      })
      this.handleShowModal()
    } else if (this.data.voteInfo.votedNum >= this.data.voteInfo.maxVoteTotal) {
      this.handleCloseSuccessModal()
    } else {
      // 不足
      this.handleShowTipsMpdal()
      this.handleCloseSuccessModal()
    }
  },
  handleShowSuccessModal: function () {
    this.setData({
      showTouzhuSuccessModal: true,
      showDuobaoModal: false
    })
    if (this.data.scribeStatus == 1) {
      this.startCountDown()
    }
  },
  handleCloseSuccessModal: function () {
    this.setData({
      showTouzhuSuccessModal: false
    })
  },
  seePrize() {
    const url = this.data.env == 'fat' ?
      legaoPrizeUrlFat :
      legaoPrizeUrlProd
    utils.goTargetUrl(url)
  },
  jumpDetail() {
    utils.goTargetUrl('/pages/market/directory/duobao/myyo')
  },
  checkDingyue: function (success) {
    const scribeTempList = this.data.subIds
    if (scribeTempList.length == 0) return

    cwx.mkt.getSubscribeMsgInfo(scribeTempList, (data) => {
      const subed = data.templateSubscribeStateInfos && data.templateSubscribeStateInfos.every(item => item.subscribeState)
      this.setData({
        scribeStatus: subed || 0
      })
      if ((data.templateSubscribeStateInfos && data.templateSubscribeStateInfos[0].subscribeState)) {
        success?.()
        // 已订阅上报
        this.trace({
          action: 'subscribed',
          activityId: this.data.activityId,
          activityName: this.data.activityInfo?.activityName
        })
      } else {
        // 未订阅上报
        this.trace({
          action: 'unSubscribed',
          activityId: this.data.activityId,
          activityName: this.data.activityInfo?.activityName
        })
      }
      this.logTrace({
        action: 'checkDingyue',
        data
      })
    }, (err) => {
      console.log('订阅状态fail===', err)
    })
  },

  noopFn: () => {
    console.log('noop')
  },

  openSub: function () {
    const scribeTempList = this.data.subIds
    if (scribeTempList.length == 0) return
    cwx.mkt.subscribeMsg(scribeTempList, (data) => {
      console.log('scribeTempList', scribeTempList)
      console.log('subscribeMsg res', data)
      if (data && data.templateSubscribeStateInfos) {
        console.log('-------------订阅消息点击 允许--------------------', data);
        this.logTrace({
          action: 'openSub',
          data: '订阅成功'
        })
        this.trace({
          action: 'subscribed',
          activityId: this.data.activityId,
          activityName: this.data.activityInfo?.activityName
        })
        wx.showToast({
          title: '订阅成功',
          icon: 'success',
          mask: true
        })
        this.setData({
          scribeStatus: 1
        })
        this.startCountDown()
        // this.checkDingyue(() => {
        //   this.startCountDown()
        // })
      } else {
        console.log('-------------订阅消息点击 取消---------------------', data);
        this.trace({
          action: 'cancelSubscribe',
          activityId: this.data.activityId,
          activityName: this.data.activityInfo?.activityName
        })
        this.logTrace({
          action: 'openSub',
          data: '订阅取消'
        })
      }
    }, (err) => {
      console.log('-------------订阅消息点击 取消---------------------', err);
      this.trace({
        action: 'cancelSubscribe',
        activityId: this.data.activityId,
        activityName: this.data.activityInfo?.activityName
      })
      this.logTrace({
        action: 'openSub',
        data: '订阅取消err',
        err
      })
    })
  },
  startCountDown() {
    let timer = setInterval(() => {
      if (this.data.subCountdown == 0) {
        clearInterval(timer)
        this.handleCloseSuccessModal()
        this.setData({
          subCountdown: 3
        })
      } else {
        this.setData({
          subCountdown: this.data.subCountdown - 1
        })
      }
    }, 1000)
  },
  logTrace(args = {}) {
    try {
      this.ubtTrace(225994, {
        openid: cwx.cwx_mkt.openid,
        ...args
      });
    } catch (e) {
      //异常
    }
  },
  trace(args={}) {
    console.log('trace', args)
    try {
      this.ubtTrace(233752, {
        openid: cwx.cwx_mkt.openid,
        ...args
      });
    } catch (e) {
      //异常
    }
  },
})
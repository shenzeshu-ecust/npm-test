import {
  cwx,
  __global,
  CPage
} from "../../../../cwx/cwx.js";
import {
  cmsActFat,
  cmsActProd,
  legaoPrizeUrlFat,
  legaoPrizeUrlProd,
  guideAssist
} from './config'
import {
  loadAssist,
  parseJson
} from './utils'
import {
  fetch
} from './model'
import utils from '../../common/utils';
let COUNT = 5;
CPage({
  pageId: '10650084799',
  checkPerformance: true,  
  data: {
    env: __global.env,
    actId: __global.env == 'fat' ? cmsActFat : cmsActProd,
    tempid: __global.env == 'fat' ? 'duobao' : 'duobao',
    compid: __global.env == 'fat' ? '103969' : '196385',
    taskAssistTempid: __global.env == 'fat' ? 'duobao_assist' : 'duobao_assist',
    taskAssistCompid: __global.env == 'fat' ? '104829' : '196386',
    pageOptions: {},
    navbarData: {
      showCapsule: 1, //是否显示头部左上角小房子 1显示 0 不显示
      showBack: 1, //是否显示返回 1显示 0不显示
      showColor: 0, //navbar背景颜色 1蓝色 0白色
      bgTransparent: true,
      iconColor: 'white',
      titleColor: 'white'
    },
    shareTitle: '携程旅行',
    shareImg: '',
    shareLink: '',
    actTabBar: 1,
    step: 1,
    switchIndex: '',
    modalType: '', // 1 赠送首券  2中奖 3不足 4 累计5次夺宝达成
    activityList: [],
    activityLoading: false,
    myList: [],
    myLoading: false,
    yoNumber: 0,
    yotransTop: 0,
    winModalInfo: null, //中奖弹窗信息
    guideAssistLocalList: {},
    guideAssist: guideAssist,
    avatarList: [],
    bigAwardCount: COUNT, // 需要夺宝n次
    bigAwardLineWidth: (COUNT - 1) * 88.75,
    bigAwardArr: Array.from({
      length: COUNT
    }),
    bigAwardInfo: null, // 当月5次大奖信息
    widgetConfig: null, // 挂件配置
  },

  onLoad(options) {
    this.setData({
        pageOptions: options
    })
    this.init()
    this.fetchConfig()
    const { tab } = options
    if (tab == 2) {
      this.switchTabbat(2)
    }
  },

  onShow() {
    this.init()
  },

  async initAssist() {
    const res = await loadAssist(guideAssist)
    this.setData({
      guideAssistLocalList: res
    })
  },

  async init() {
    if (this.isPending) return
    this.isPending = true
    await this.initData()
    this.initYoNumber()
    this.initMyData()
    if (!this.data.pageOptions.taskinvite) {
        this.getCurrentMonthAward()
        this.initFree()
    }
    this.checkIsWin()
    this.getAwardMemberList()
    this.isPending = false
  },

  // 当月夺宝5次领奖信息
  async getCurrentMonthAward() {
    const res = await fetch('yoTicketTotalRewardQuery')
    this.logTrace({
      action: 'getCurrentMonthAward',
      data: res
    })
    if (res.errcode == 0) {
      COUNT = res.totalRewardJoinNum
      if (res.totalNum >= COUNT && !res.receiveTotalReward) {
        // 可领奖
        this.handleReceivedBigAwardModal()
      }
      this.setData({
        bigAwardInfo: {
          receiveTotalReward: res.receiveTotalReward,
          totalNum: res.totalNum,
          totalRewardImg: res.totalRewardImg,
          totalRewardName: res.totalRewardName,
          bigAwardCount: COUNT, // 需要夺宝n次
          bigAwardLineWidth: (COUNT - 1) * 88.75,
          bigAwardArr: Array.from({
            length: COUNT
          }),
        }
      })
    } else {

    }
  },

  handleClickKxsx() {
    this.receiveBigAward()
    this.handleCloseModal()
  },

  async receiveBigAward() {
    const res = await fetch('yoTicketTotalRewardReceive')
    this.logTrace({
      action: 'receiveBigAward',
      data: res
    })
    if (res.errcode == 0) {
      this.getCurrentMonthAward()
      // wx.showToast({
      //   title: '领取成功',
      //   icon: 'none'
      // })
    } else {
      wx.showToast({
        title: '领取失败，请稍后再试~',
        icon: 'none'
      })
    }
  },

  async getAwardMemberList() {
    const res = await fetch('yoTicketAwardHistoryQuery')
    if (res.errcode == 0) {
      const list = res.awardHistoryList.map(item => ({
        avatar: item.avatar,
        name: item.nickname,
        prize: item.awardName
      }))
      this.setData({
        avatarList: list
      })
    }
  },

  async checkIsWin() {
    const res = await fetch('yoTicketPopInfoQuery')
    if (res.errcode == 0) {
      if (res.activityId) {
        this.setData({
          modalType: '2',
          winModalInfo: {
            activityId: res.activityId || '',
            activityName: res.activityName,
            activityImg: res.activityImg
          }
        })
      }
    }
    this.logTrace({
      action: 'checkIsWin',
      data: res
    })
  },

  async handleReceivedBigAwardModal() {
    this.setData({
      modalType: '4'
    })
    this.logTrace({
      action: '累计五次夺宝达成',
    })
  },

  async initFree() {
    const res = await fetch('yoTicketFreeReceive')
    if (res.errcode == 0) {
      await this.initAssist()
      this.initCard()
    }
    this.logTrace({
      action: 'initFree',
      data: res
    })
  },

  async initYoNumber() {
    const res = await fetch('yoTicketNumQuery')
    if (res.errcode == 0) {
      this.setData({
        yoNumber: res.yoTicketNum
      })
    } else {

    }
    this.logTrace({
      action: 'initYoNumber',
      data: res
    })
  },

  async initData() {
    this.setData({
      activityLoading: true
    })
    const res = await fetch('getList', {})
    this.logTrace({
      action: 'getList',
      data: res
    })
    if (res.errcode == 0) {
      const activityList = this.resolveList(res.activityList)
      this.setData({
        activityList
      })
    } else if (res.errcode == 1001) {
      this.toLogin()
    } else {
      wx.showToast({
        title: res.errmsg,
        icon: 'none'
      })
    }
    this.setData({
      activityLoading: false
    })
  },

  resolveList(list) {
    const now = Date.now()
    return list.map(item => {
      const announceTimeNum = item.announceTime ? new Date(Date.parse(item.announceTime.replace(/-/g, '/'))).getTime() : 0
      return {
        ...item,
        announceTimeNum,
        announceDay: item.announceTime ? item.announceTime.split(' ')[0].replace(/-/g, '.') : '',
        remindTime: Math.max(announceTimeNum - now, 0)
      }
    })
  },

  toLogin() {
    cwx.user.login({
      param: {
        sourceId: "market"
      },
    });
  },

  async initMyData() {
    this.setData({
      myLoading: true
    })
    const res = await fetch('getMyList', {})
    this.logTrace({
      action: 'getMyList',
      data: res
    })
    if (res.errcode == 0) {
      let myList = res.activityList.map((item) => {
        return {
          ...item,
          join: true
        }
      })
      myList = this.resolveList(myList)
      this.setData({
        myList
      })
    } else if (res.errcode == 1001) {

    } else {
      wx.showToast({
        title: res.errmsg,
        icon: 'none'
      })
    }
    this.setData({
      myLoading: false
    })
  },

  async initCard() {
    this.setData({
      modalType: 1,
      step: 1
    })
  },

  async initCard2() {
    this.setData({
      step: 3
    })
  },
  async initYoTrans() {
    const query = wx.createSelectorQuery()
    query.select('.db_activity__myyo').boundingClientRect(async (res) => {
      const top = res.top * 2 // - 100 // 163 #the-id 节点的上边界坐标（相对于显示区域）
      this.setData({
        yotransTop: top
      })
      setTimeout(() => {
        this.setData({
          yotransTop: 0
        })
      }, 1500)
    })
    query.exec()
  },

  handleClickCard1(e) {
    const {
      changedTouches
    } = e
    const {
      clientX: x,
      clientY: y
    } = changedTouches[0]
    if (x < 120) {
      this.setData({
        step: 2
      }, () => {
        setTimeout(() => {
          this.switchCards(0)
        }, 300)
      })
    } else if (x > 250) {
      this.setData({
        step: 2
      }, () => {
        setTimeout(() => {
          this.switchCards(2)
        }, 300)
      })
    } else {
      // this.switchCards(1)
    }
    setTimeout(() => {
      this.initCard2()
    }, 1000)
  },

  switchCards(index) {
    this.setData({
      switchIndex: index
    })
  },

  handleCloseFirstModal() {
    this.setData({
      modalType: ''
    })
    this.initYoTrans()
    setTimeout(() => {
      this.init()
    }, 1500)
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const {
      shareTitle,
      shareImg,
      shareLink
    } = this.data
    return {
      title: shareTitle,
      imageUrl: shareImg,
      path: shareLink
    }
  },

  // 1 立即加投 2继续加投 3中奖 4夺宝号已满 待开奖 5未中奖 6开奖失败-总数不足 7开奖失败-无人
  handleClickBtn: function (e) {
    const item = e.detail
    const {
      type
    } = item
    if (type == 1) {
      const _list = this.data.actTabBar == 1 ? this.data.activityList : this.data.myList
      const idx = _list.findIndex(_item => _item.activityId == item.activityId)
      this.trace({
        action: 'firstJoin',
        activityId: item.activityId,
        activityName: item.activityName,
        index: idx + 1
      })
    }
    if (type == 2) {
      const _list = this.data.actTabBar == 1 ? this.data.activityList : this.data.myList
      const idx = _list.findIndex(_item => _item.activityId == item.activityId)
      this.trace({
        action: 'continusJoin',
        activityId: item.activityId,
        activityName: item.activityName,
        index: idx + 1
      })
    }
    this.logTrace({
      action: 'handleClickBtn',
      item,
      type
    })
    if (item.activityStatus == 1 && item.remindTime <= 0) {
      wx.showToast({
        title: '开奖中，请稍后~',
        icon: 'none'
      })
      return
    }
    if (type == 3) {
      cwx.navigateTo({
        url: `./duobao?activityId=${item.activityId}`
      })
    } else {
      cwx.navigateTo({
        url: `./duobao?activityId=${item.activityId}`
      })
    }
  },

  handleSwitchTabbar(e) {
    const index = e.target.dataset.index;
    this.switchTabbat(index)
  },
  switchTabbat(index) {
    if (index == 1) {
      this.initData()
    }
    if (index == 2) {
      this.initMyData()
    }
    this.setData({
      actTabBar: index
    })
  },
  handleMyEmptyClick: function () {
    this.switchTabbat(1)
  },
  jumpMyYo: function () {
    cwx.navigateTo({
      url: `./myyo`
    })
  },
  jumpRule: function (e) {
    const {
      index
    } = e.target.dataset
    cwx.navigateTo({
      url: `./rule?index=${index}`
    })
  },
  handleCloseModal: function () {
    this.setData({
      modalType: ''
    })
  },
  userAcceptPrize: function () {
    this.init()
  },
  async fetchConfig() {
    const res = await fetch('getActivityConfig', {
      "activityId": this.data.actId,
    })
    if (res && res.errcode == 0) {
      const {
        duobao_share_img,
        duobao_share_title,
        duobao_share_link,
        widgetConfig
      } = res.activityCustomfields
      this.setData({
        shareTitle: duobao_share_title,
        shareImg: duobao_share_img,
        shareLink: duobao_share_link,
        widgetConfig: {
          ...parseJson(widgetConfig, {}),
          needShow: this.completeWidgetShow()
        }
      })
      this.logTrace({
        shareTitle: duobao_share_title,
        shareImg: duobao_share_img,
        shareLink: duobao_share_link,
      })
    }
  },
  /**
   * 关于助力弹窗 和 首次赠送yo票(包括首次赠送和当月大奖)的弹窗重复问题 的解决方式
   * 如果路径参数带有taskinvte 首次赠送弹窗由助力弹窗的回调控制打开
   * status:openSuccess 表示打开成功 openFail表示打开失败 closeSuccess表示关闭助力弹窗
   * openFail closeSuccess 之后走打开首次弹窗逻辑
   * 
   * 如果参数不带有taskinvite 走原始逻辑 由onload时机的函数控制
   */
  // 带有taskinvite才会触发此回调
  handleTaskAssistPopup(e) {
    const { status, reason } = e.detail
    if (status === 'openSuccess') {
        console.log('openSuccess')
    }
    if (status === 'closeSuccess') {
        this.initFree()
        this.getCurrentMonthAward()
    }
    if (status === 'openFail') {
        this.initFree()
        this.getCurrentMonthAward()
    }
  },
  onCountDownEnd() {
    this.init()
  },
  seePrize() {
    const url = this.data.env == 'fat' ?
      legaoPrizeUrlFat :
      legaoPrizeUrlProd
    utils.goTargetUrl(url)
  },
  handleClickWidget() {
    const {
      mpUrl
    } = this.data.widgetConfig
    cwx.navigateTo({
      url: mpUrl
    })
  },
  handleClickWidgetClose() {
    const KEY = 'mkt_duobao_widget'
    const expireTime = Date.now() + 24 * 60 * 60 * 1000
    cwx.setStorageSync(KEY, {
			value: true,
			expireTime
    })
    this.setData({
      'widgetConfig.needShow': false
    })
  },
  /**
   * 未设置过关闭 或者 超过过期时间 都返回ture 展示
   * 否则返回 不展示
   */
  completeWidgetShow() {
    const KEY = 'mkt_duobao_widget'
    const storage = cwx.getStorageSync(KEY) || {}; 
    const { expireTime, value } = storage
    if (value) {
      if (Date.now() > expireTime) {
        return true
      }
    } else {
      return true
    }
  },
  scrollToTask() {
    wx.pageScrollTo({
      // scrollTop: res.top,
      selector: '.db_task'
    })
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
  logTrace(args = {}) {
    try {
      this.ubtTrace(225994, {
        openid: cwx.cwx_mkt.openid,
        ...args
      });
    } catch (e) {
      //异常
    }
  }
})
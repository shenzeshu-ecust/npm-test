import { cwx, _, __global} from "../../../cwx/cwx"
import TPage from '../common/TPage'
import { shared } from '../common/trainConfig'
import {
  TrainNoticeModel,
  TrainStationModel,
  RobTicketShareInfoModel,
  AcquireActivityCouponModel,
  TrainCheckCouponStatusModel,
  GetUserInfoForIndexModel,
  ActivitySendCouponModel,
  GetActivityCouponInfoModel,
  QuerySubscribeMessageStatusModel,
  SubscribeMessageTemplateModel,
  GetRightsPerceiveInfoModel,
  HomePageSecondScreenRecommendModel,
  OnlineChangeSeatPromotionInfo
} from "../common/model"

import {
  AccelerateGrabTicketRateModel,
  AcquireActivityCouponPromise,
  openCalendar,
  openCity,
  getOfflineUnions,
  setConfigSwitchAsyncPromise,
  getConfigInfoJSON,
  GetPreSaleDayConfig,
  Sync12306OrderInfoPromise,
  getUserBindedPhoneNumber,
  getConfigByKeysPromise,
  receiveLossGift,
  getLossGiftDetail
} from "../common/common"
import {
  TrainStationStore,
  TrainQueryStore,
  TrainBookStore,
  TrainActStore,
  OverseaTrainQueryStore
} from "../common/store"
import cDate from "../common/cDate"
import util from "../common/util"
import commonApi from "../common/common"
import { newcustomerMixin } from '../common/components/NewCustomerRight/newcustomerMixin'
import { subscribeMixin } from '../common/components/Subscribe/Subscribe'
import { init12306Account } from "../common/account12306"

const systeminfo = wx.getSystemInfoSync()

if (!shared.isCtripApp) {
  cwx.config.init()
}

shared.preSaleDays = 30
shared.preRobDays = 62

const defaultDStation = "上海"
const defaultAStation = "北京"

const todayDateStr = new cDate().addDay(shared.preSaleDays).format("n.j")
const preSaleDateStr = new cDate().addDay(shared.preRobDays).format("n.j")

const tempVideoArr = [
  {id:'DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA_2.mp4'},
  {id:'F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA-%E4%BC%98%E6%83%A0%E8%BF%87%E6%9C%9F%E6%8F%90%E9%86%92.mp4'},
  {id:'VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA-%E8%8E%B7%E5%BE%97%E5%A5%96%E5%8A%B1%E9%80%9A%E7%9F%A5.mp4'},
  {id:'_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM', videoSrc:'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA-%E7%81%AB%E8%BD%A6%E7%A5%A8%E8%B4%AD%E7%A5%A8%E6%8F%90%E9%86%92.mp4'}
]
const page = {
  checkPerformance: true,
  pageId: shared.pageIds.index.pageId,
  data: {
    biSource: "",
    dStation: "",
    dStationShow: "",
    aStation: "",
    aStationShow: "",
    monthDay: "",
    nextDay:"",
    today:"",
    dayInfo: "",
    selectDate: "",
    exchange: false,
    isGaotieOnly: false,
    isStu: false,
    notice: null,
    bannerNotice: "",
    showType: "",
    showMask: "",
    isFilterViewAnimation: false,
    bannerswitch: false,
    isShowLayer: false,
    isShowCoup: false,
    isShowCoupSuc: true,
    noticetxt: `今日可预约购买${todayDateStr}日-${preSaleDateStr}日火车票`,
    isTrainApp: shared.isTrainApp,
    isCtripApp: shared.isCtripApp,
    isShowCoupon: false,
    webViewUrl: "",
    bannerImg: "https://images3.c-ctrip.com/train/wxapp/train-index-top.png",
    activity: null,
    // isShowFutureOrders: false,
    futureOrdersLength: 0,
    historyPairs: [],
    isRedTheme: false,
    isCtripNew: false,
    isIphoneX: util.isIphoneX(),
    hasCollected: "", // 是否收藏过小程序
    showCollected: false, // 显示收藏浮标
    hasShowCouponLoginTip: false, // 领券之前是否提醒过登录
    newAdvertiseData: {
      width: systeminfo.windowWidth,
    },
    statusBarHeight: systeminfo.statusBarHeight,
    userCouponInfo: null,
    userCouponInfoFlag: true,
    collectTagFlag: false,
    slideVideo: {
      delayTime: 5000,
      dotShow:true,
      dotWidthAndHeight:[6,6],
      dotMargin:4,
      dotCurrentColor:'#fff',
      dotCurrentType:'pencil',//dot,pencil 【注：默认选中也是原点，和没有选中一样，pencil 类似老的系统，选中的是长条圆头】
      dotColor:'#fff',
      dotOpacity:0.4,
      dotCurrentOpacity:1,
      dotPosition:'center',
      bottom:35,
      left:10,
      right:10,
    },
    isIOS: util.isIOS(),
    isAndroid: util.isAndroid(),
    magicDoorNum:0,
    isAnimated: false,
    CardInfoList : [],
    animateCount: 0,
    mainRecommendList: [],
    newUserFlag: 0, // 这个字段标记渠道，部分值必出新客弹窗 1公众号 2小程序助力后跳转 3滴滴公交小程序 4pc扫码导流 5 企微新客礼包 6 H5关注公众号助力-后置绑定
    latitude: 0,
    longitude:0,
    pushCouponInfo: null,
    doubleBonus: false,
    showTaskListCmp: true,
    lonAndLat:{isEnable: false},
    toolsConfig: [],
    showLostUserSwiper: false,
    lostUserPopDetail: null,
    lostUserSwiperDetail: null,
    lostUserPopProType: false,
    otherTools: [],
    allOtherTools: [],
    isKingkongExpand: false,
    newGuestReceivedPopData: null, // 新客弹窗
    // showPopup: fasle,//儿童组件浮层
    activeTabbarIndex: 0, // 顶部tab切换， 0为国内火车，1为国际火车
    swiperHeight: 0, // 首页swiper高度
    passengerChoiceVisible: false, //乘客数量选择器
    overseaPassengerInfo: null,
    overSeaUtmSource: '', // 国际火车订单来源
    abroadSwitchFlag: true, // 国际火车开关
    subscribeGuideFlag: false, // 订阅引导
    subVideoSource:'',
    onlineChangeSeatPopVisible: false, // 在线换座弹窗显示
    onlineChangeSeatPopBgImage: '', // 在线换座弹窗背景图
    onlineChangeSeatPopInfo: {},// 在线换座弹窗状态
  },
  onLoad(options) {
    console.log(this.pageId,'pageid')
    util.ubtFuxiTrace('TCWFrontPage_CalendarEntrance_exposure',{ PageId: this.pageId})
    console.log("TRN index onLoad options begin:")
    console.log(options)
    console.log("TRN index onLoad options end")
    console.log("cid:" + cwx.clientID)
    console.log("scene: " + cwx.scene)
    init12306Account()
    this.ubtTrace('c_train_12306storage', TrainBookStore.getAttr("bind12306") || '')
    let self = this
    const outParams = util.getOutParams(options)
    if (outParams.hasOutParams) {
      this.setOutParams(outParams)
    }
    this.activityCode = options.activityCode
    this.subType = options.subType
    this.advType = options.advType
    this.showType = options.showType
    this.lostUserScene = options.lostUserScene
    this.abroadFlag = options.abroadFlag || ''
    if (this.abroadFlag) {
      this.abroadOutParams = util.getAbroadOutParams(options)
    }

    if (options.source) {
      this.setData({
        source: options.source,
      })
    }

    if (options.biSource) {
      this.setData({
        biSource: options.biSource,
      })
    }

    if (options.sourceType) {
      this.sourceType = parseInt(options.sourceType)
    }
    // 零元购和特种兵省钱
    if (options.taskOrderType) {
      this.taskOrderType = parseInt(options.taskOrderType)
    }
    if (options.activitySource) {
      shared.activitySource = options.activitySource
    } else {
      shared.activitySource = ''
    }

    if (options.cashamount) {
      this.setData({
        cashamount: options.cashamount,
      })
    }
    if (options.fromh5 === '1') {
      this.setData({
        isFromAwakenH5: true,
      })
    }

    if (this.showType) {
      this.setData({
        showType: this.showType,
      })
    }

    if (this.showType === 'pushCouponType') {
      this.getPushCoupon()
    }

    if (options.newUserFlag) {
      this.setData({ newUserFlag: options.newUserFlag })
    }

    if (options.fromSubMsg) {
      // 1 优惠券到期 2 奖励通知
      this.setData({fromSubMsg: options.fromSubMsg})
    }

    if (options.subId) {
      this.setData({ subId: options.subId, subFromtype: options.subFromtype })
    }

    this.loadQueryFromStore()
    this.loadNotice()
    this.loadTopTips()
    this.clearStation()
    this.loadStation()
    this.getRightsPerceiveInfo()
    this.getHomePageRecommend()
    this.showNewCustomerByQuery() // 某些渠道进入必出新客弹窗
    this.showWecomAppPop() // v8.50 APP添加企微入口弹窗
    this.lostUsersPopHandler() // 流失用户弹窗
    // this.getGeoInfo()
    GetPreSaleDayConfig()
    this.initSync12306OrderInfo(true) // 进入页面就开始订单同步

    if (options.oid) {
      const onAcceRate = () => {
        self.onAcceRate(
          options.oid,
          options.subOrderId || options.suborderid
        )
      }
      if (!cwx.user.isLogin()) {
        cwx.user.login({
          callback: function(res) {
            if (res.ReturnCode == "0") {
              onAcceRate()
            }
          },
        })
      } else {
        onAcceRate()
      }
    }
    if (options.card_id) {
      // 当从微信卡包进入时，会在 url 里携带 card_id 信息
      shared.hasCard = true
    }

    // 微信搜一搜进入的页面需要发券
    if (this.advType == 'search') {
      if (cwx.user.isLogin()) {
        this.getNewCouponList('673AA2C107BDE8C3AB83E887C46DDC81').then(() => {
          if (this.data.couponListWill.length) {
            this.setData({
              showType: 'searchCoupon',
            })
          }
        }).catch(e => {
          this.ubtTrace('searchcoupon err', e)
        })
      } else {
        this.setData({
          showType: 'searchCoupon',
        })
      }
    }

    const stack = getCurrentPages()
    if (stack.length == 1) {
      this.setData({ firstStack: true })
    }
    setConfigSwitchAsyncPromise("train_wx_index_bonus_pop").then(([res]) => {
      if (res && this.data.showType === 'bonus') {
        util.ubtTrace('s_trn_c_trace_10320640935', {
          bizKey: 'helpOthersPopupExposure',
          exposureType: 'Popup',
          orderid: options.oid,
        })
      }

      this.setData({
        bonusPopHandle: res,
      })
    })
    shared.orderSource = shared.orderSource || options.orderSource || options.OrderSource
    // 入口埋点
    this.enterUbt()
  },
  onReady() {
    // 因为aid和sid写入在onload事件结束之后，所以在onready事件里判断aid和sid
    getOfflineUnions().then(sids => {
      const activities = [
        {
          activityCode: 1003,
          unionList: ["263382&1290482"],
        },
        {
          activityCode: 2026,
          unionList: sids,
        }
      ]
      util.getUnion().then(data => {
        this.unionData = data
        const { allianceid, sid } = data
        let currentUnion = `${allianceid}&${sid}`
        let activity = null
        activities.forEach(item => {
          if (activity) {
            return
          }
          if (item.unionList && item.unionList.indexOf(currentUnion) > -1) {
            activity = item
          }
        })
        if (activity) {
          this.setData({
            activity: {
              activityCode: activity.activityCode,
            },
            isShowCoupon: true,
          })
          if (!TrainBookStore.getAttr(this.getActivityKey())) {
            this.showCoupon()
          }
        }
      })
    })
  },
  async onShow() {
    this.loadPairHistory()
    this.initQconfgData()


    this.checkHasRecivedCoupon()
      .then(() => {
        this.setData({
          hasCollected: TrainActStore.getAttr("HASCOLLECTED"),
          showCollected: !TrainActStore.getAttr("clickCloseCollect"),
        })
      })
      .catch(() => {
        this.setData({
          hasCollected: TrainActStore.getAttr("HASCOLLECTED"),
          showCollected: !TrainActStore.getAttr("clickCloseCollect"),
        })
      })
    
    // 此处为获取实验以及是否新客，为下面的判断准备条件
    this.isNewUser = false
    try {
      await newcustomerMixin.trainGetNewGuestInfo()
      this.isNewUser = true
    } catch { }

    await newcustomerMixin.getNewCustomerRights(this, 20)
    const { NewFlagAbValue } = this.data.newCustomerRightInfo
    this.abTest = NewFlagAbValue

    if (cwx.user.isLogin()) {
      this.setData({
        isLogin: true,
      })
      if (this.advType !== 'search' && !this.showType && this.data.source !== 'wecom_apphome' && this.data.source !== 'wecom_apphome1') { //  从搜一搜进来的页面 不出新客礼包弹窗 这里是防止新客和搜一搜礼包弹窗同时出现
        /**
                 * 只能领取新客礼包
                 * 只能领取返现券
                 * 新客礼包和返现券都可以领
                 * 这三种情况都依赖服务端的返回
                 */
        const promises = []

        this.ubtDevTrace('c_train_newcustomerrightflag', this.checkIsNeedGetInfo())
        
        // 根据缓存判断是否要请求新客权益相关接口 || b实验，新客已登录但没领取过礼包，展示弹窗
        console.log('!this.data.newUserFlag', !this.data.newUserFlag, this.checkIsNeedGetInfo())
        if (this.checkIsNeedGetInfo() && !this.data.newUserFlag && !this.data.stopAutoReceive || (this.isNewUser === true && this.abTest === 'B' && !this.data.newGuestGiftInfo.IsHaveRights)) {
          let type = 1
          if (this.abTest === 'B') {
            type = 20
          } else {
            type = this.convertNewUserFromType() || 1
          }
          
          const rightsPromise = newcustomerMixin.getNewCustomerRights(this, type)
            .then(newcustomerMixin.checkCanReceiveNewCustomerRight)
            .then(() => {
              const { AbValue, RightList } = this.data.newCustomerRightInfo
              const rightType = AbValue == 'a' ? 0 : 1
              if (RightList.length && !AbValue || AbValue == 'a') {
                return newcustomerMixin.receiveNewCustomerRight(type, rightType)  
              } else if (AbValue != 'a' && type === 1) {
                // v8.50 首页弹窗 b版本
                this.setData({
                  showType: 'newGuestRightUpPop',
                })
                util.ubtTrace('s_trn_c_trace_10320640935', {
                  bizKey: 'newGiftExposure',
                  exposureType: 'Popup',
                })
              }

              this.setStorageArr('NEWCUSTOMERRIGHTFLAG', {key: cwx.user.auth, timeout: 24 * 60})
            })
            .then(res => {
              if (res?.IsReceiveSuccess) {
                const list = res.RightInfo.DescList
                const amount = list.reduce((sum, v) => sum += v.Price, 0)
                // 代金券，type为2
                const cashList =  list === null ? [] : list.filter( e => e.Type === 2)
                // 权益，type为1
                const rightList = list === null ? [] : list.filter( e => e.Type === 1)
                const rightListAmount = rightList.reduce((sum, v) => sum += v.Price, 0)
                const data = {
                  ...res,
                  priceAmount: amount,
                  RightInfoType2: {
                    list: cashList
                  },
                  RightInfoType1: {
                    list: rightList,
                    price: rightListAmount
                  }
                }
                this.setData({ newGuestReceivedPopData: data, showType: 'newGuestRightPop' })
                util.ubtTrace('s_trn_c_trace_10320640935', {
                  exposureType: "popup",
                  bizKey: 'newgiftPopupExposure',
                  visitSource: {
                    'gongzhonghao_zhubanpost': 1,
                    'wecom_push': 2,
                    'wecom_apptask': 3,
                    'gongzhonghaoPush': 7,
                    'qiweiPush': 8,
                  }[this.data.biSource || this.data.source],
                })
              }
            })
            .catch(() => {
              // 不能领取新客权益
              this.setStorageArr('NEWCUSTOMERRIGHTFLAG', {key: cwx.user.auth, timeout: 24 * 60})
            })
          promises.push(rightsPromise)
        } else {
          promises.push(Promise.resolve({}))
        }

        // 从抢票加速页跳转过来 需要领取返现券
        if (this.activityCode && this.subType && this.data.cashamount) {
          promises.push(this.recieveNewCoupon(this.activityCode, this.subType))
        } else {
          promises.push(Promise.resolve({}))
        }

        Promise.all(promises).then(res => {
          const [rightsRes, couponRes] = res
          if (rightsRes?.IsReceiveSuccess && couponRes?.RetCode == 1) {
            // 新客权益和返现券都可以领
            this.setStorageArr('NEWCUSTOMERRIGHTFLAG', {key: cwx.user.auth, timeout: 7 * 24 * 60})
            this.setData({
              showType: 'combineGifts',
            })
            this.ubtTrace('train_inquire_hpnewbiecashent', true)
          } else if (couponRes?.RetCode !== 1 && rightsRes?.IsReceiveSuccess) {
            // 只能领取新客权益
            this.setStorageArr('NEWCUSTOMERRIGHTFLAG', {key: cwx.user.auth, timeout: 7 * 24 * 60})
            this.setData({ showType: 'newGuestRightPop' })
            this.ubtTrace('train_inquire_hpnewbieent', true)
            util.ubtTrace('s_trn_c_trace_10320640935', {
              exposureType: "popup",
              bizKey: 'newgiftPopupExposure',
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'gongzhonghaoPush': 7,
                'qiweiPush': 8,
              }[this.data.biSource || this.data.source],
            })
            util.ubtTrace(`s_trn_c_trace_${this.pageId}`, {
              exposureType: 'Popup',
              bizKey: "homepagePopupExpousre",
              scene: this.data.newUserFlag,
              status: 1,
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'gongzhonghaoPush': 7,
                'qiweiPush': 8,
              }[this.data.biSource || this.data.source],
            })
          } else if (couponRes?.RetCode == 1 && !rightsRes?.IsReceiveSucces) {
            // 只能领取返现券
            this.setData({
              showType: 'cashback',
            })
            this.ubtTrace('train_inquire_hpcashtoast', true)
          }
        }).catch(e => {
          this.ubtMetric('combineigifts err', e)
          console.warn(e)
        })

      }
    } else {
      // cwx.user.wechatcode = '';
      // this.wxLogin()
      this.setData({
        isLogin: false,
      })
      cwx.user.wxLogin(_ => console.log('刷新登录态'))

      // 231009_TRN_new2 ab实验分流，未登录展示弹窗
      if (this.abTest === 'B') {
        const newCustomerUnLoginGiftPopTime = TrainActStore.getAttr("NEWCUSTOMERUNLOGINGIFTPOPTIME") || 0;
        if (new cDate().getTime() < newCustomerUnLoginGiftPopTime) return;
        newcustomerMixin.getNewCustomerRights(this, 20)
          .then(_ => {
            const res = this.data.newCustomerRightInfo
            const { NewFlagAbValue } = res
            if (NewFlagAbValue !== 'B') return
            
            this.setData({showType: "newCustomerUnloginPop", newCustomerRightInfo: res })
            // 限制弹窗1天仅出现1次
            TrainActStore.setAttr("NEWCUSTOMERUNLOGINGIFTPOPTIME",new cDate().addDay(1).getTime());
            util.ubtTrace(`s_trn_c_trace_${this.pageId}`, {
              exposureType: 'Popup',
              bizKey: "homepagePopupExpousre",
              scene: this.data.newUserFlag,
              status: 0,
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'gongzhonghaoPush': 7,
                'qiweiPush': 8,
              }[this.data.biSource || this.data.source],
            })
            // 曝光埋点
            util.ubtFuxiTrace('TCWFrontPage_unloginNewGift_exposure', { PageId: this.pageId })
          })
      }
      const newGuestGiftInfo = await newcustomerMixin.getNewCustomerRights(this, 20)
      this.setData({
        newGuestGiftInfo: {
          ...newGuestGiftInfo,
          needShow: true,
        },
      })
      util.ubtTrace('s_trn_c_trace_10320640935', {
        exposureType: "normal",
        bizKey: 'newgiftFixedPositionExposure',
        login: 0,
      })

      
      // newGuestGiftInfo: {
      //     RightList,
      //     Tiltle,
      //     TitleUrl,
      //     Content,
      //     IsHaveRights,
      //     OriginPrice,
      //     ExpireTimeDesc,
      //     RightType,
      //     JumpUrl,
      //     hasReceived: true
      // }
    }


    commonApi.setConfigSwitchAsync("wx_force12306", "forceBuyPackage")
    setConfigSwitchAsyncPromise("train_wx_collect_toggle").then(([res]) => {
      this.setData({
        collectFlag: res,
      })
    })

    let k = ""
    if (shared.isTrainApp) {
      k = "train_wx_train_indexpage_banner_share_swith"
    } else if (shared.isCtripApp) {
      k = "train_wx_indexpage_banner_share_swith"
    }
    if (k) {
      commonApi
        .setConfigSwitchAsync(k, "bannerswitch")
        .then(([res, key]) => {
          let data = {}
          data[key] = res
          this.setData(data)

          if (res) {
            // this.getWebViewUrl();
          }
        })
    }

    // 1089	微信聊天主界面下拉，“最近使用”栏（基础库2.2.4版本起将包含“我的小程序”栏）
    // 1001	发现栏小程序主入口，“最近使用”列表（基础库2.2.4版本起将包含“我的小程序”列表）
    // 1104	微信聊天主界面下拉，“我的小程序”栏（基础库2.2.4版本起该场景值废弃）
    // 1001 || 1089 “最近使用”列表（基础库2.2.4版本起将包含“我的小程序”列表）
    // 1023 安卓系统桌面图标
    // 1103, 1104 基础库2.2.4版本起废弃
    if (
      [1089, 1023, 1104].includes(parseInt(cwx.scene)) &&
            TrainActStore.getAttr("clickCollectedIcon") &&
            !TrainActStore.getAttr("HASCOLLECTED")
    ) {
      if (!cwx.user.isLogin()) {
        this.setData({
          showType: "couponTip",
        })

        return
      }
      this.checkCollectedReward()
    }

    this.setData({
      collectTagFlag: !TrainActStore.getAttr('COLLECTTAGSHOWN'),
    })
    TrainActStore.setAttr('COLLECTTAGSHOWN', true)
    this.getOnlineChangePopInfo() // 在线换座弹窗
    
		
	},
  async goBack() {
    let HASSUBSCRIBEDINDEX = TrainActStore.getAttr('HASSUBSCRIBEDINDEX')
    let HASSUBSCRIBED = TrainActStore.getAttr('HASSUBSCRIBED')
    if (this.data.isLogin && shared.isCtripApp && !HASSUBSCRIBEDINDEX && !HASSUBSCRIBED) {
      let res = await this.getSubscirbeTicketStatus()
      if (!res) {
        let d = new Date()
        d.setDate(new Date().getDate() + 1)

        let diff = d.setHours(0, 0, 0) - Date.now()
        let timeout = Math.floor(diff / 1000 / 60)
        TrainActStore.setAttr('HASSUBSCRIBEDINDEX', {key: true, timeout})

        this.setData({
          showType: 'subscribe',
        })
      } else {
        cwx.navigateBack()
      }
    } else {
      cwx.navigateBack()
    }
  },
  tabBarClickHandle(e) {
    if (!this.data.abroadSwitchFlag) return;
    const { index } = e.target.dataset;
    this.setData({
      activeTabbarIndex: index,
    })
    if (index === 1) {
        this.sendOverseasTrainPV();
    }
  }, 
  // 国际火车pv埋点
  sendOverseasTrainPV(){
     // pv 埋点
    this.ubtSendPV({
        pageId: '10650106904',
    });
  },
  getHomePageRecommend() {
    if (shared.isTrainApp) {
      return
    }
    const allStations = getAllStations()
    const arriveCtripCityId = allStations.find(station => station.cityName == this.data.aStation)?.cityID
    const arriveCtripCityName = allStations.find(station => station.cityName == this.data.aStation)?.CtripCityName
    const params = {
      fromType: 'WX_XCX',
      ArriveCityId: arriveCtripCityId, // 到达城市id
      ArriveCityName: arriveCtripCityName, // 到达城市
      DepartDate: this.data.selectDate,
    }
    HomePageSecondScreenRecommendModel(params, res =>{
      if (res.RetCode == 1) {
        this.setData({
          mainRecommendList:res.MainRecommendList,
        })
        if (res.MainRecommendList && res.MainRecommendList.find(item => item.Type == 1)){
          util.ubtTrace('s_trn_c_10320640935',{bizKey:'hotelCardExposure',exposureType:'normal'})
        }
        if (res.MainRecommendList && res.MainRecommendList.find(item => item.Type == 2)) {
          util.ubtTrace('s_trn_c_10320640935',{bizKey:'carCardExposure',exposureType:'normal'})
        }
      }
    })

  },
  // 市场关注组件
  getTaskListCb( e) {
    const taskList = e.detail.taskList
    if ( !taskList || !taskList.length || !shared.isCtripApp) {
      this.setData({
        showTaskListCmp: false,
      })
    }
  },
  getSubscirbeTicketStatus() {
    return new Promise((resolve, reject) => {
      // 获取该用户订阅状态
      cwx.mkt.getSubscribeMsgInfo(['_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM'], data => {
        console.log('subscribeInfos', data)
        let hasSubscribedTicket = data.templateSubscribeStateInfos?.some(item => item.subscribeState == 1)
        resolve(hasSubscribedTicket)
      }, err => {
        reject(err)
        console.error('subscribeInfos', err)
      })
    })
  },
  doSubScirbeInfo({
    OpenID,
    OrderNumber,
    ActivityCode,
    ShareAuth,
    NickName,
    PhotoUrl,
    FromType = 1,
    TemplateIDList,
  }) {
    const params = {
      FromType,
      OpenID,
      OrderNumber,
      ActivityCode,
      ShareAuth,
      NickName,
      PhotoUrl,
      TemplateIDList,
    }
    let promise = util.promisifyModel(SubscribeMessageTemplateModel)(params)

    return promise.then(res => Promise.resolve(res))
  },
  async getOnlineChangePopInfo() {
    // 首先判断是否符合7天一次，如果符合，再进行请求
    const onlineChangeSeatPopTime = TrainActStore.getAttr("ONLINECHANGESEATPOPTIME") || 0
    if (new cDate().getTime() < onlineChangeSeatPopTime) return
    try {
      const res = await util.promisifyModel(OnlineChangeSeatPromotionInfo)({})
      if (res.RetCode === 1) {
        const status = parseInt(res.AlertInfo?.SeatType)
        if (!status || !res.AlertInfo?.IsShow) return
        const statusToUrl = {
          1: 'https://images3.c-ctrip.com/train/2023-3/app-qiangpiao/3yue/zaixianhuanzuo/shouye/pop_kaochuang@3x.png',
          2: 'https://images3.c-ctrip.com/train/2023-3/app-qiangpiao/3yue/zaixianhuanzuo/shouye/pop_xiapu@3x.png',
          3: 'https://images3.c-ctrip.com/train/2023-3/app-qiangpiao/3yue/zaixianhuanzuo/shouye/pop_youzuo@3x.png',
          4: 'https://images3.c-ctrip.com/train/2023-3/app-qiangpiao/3yue/zaixianhuanzuo/shouye/pop_lianzuo@3x.png',
        }
        this.setData({
          showType: 'onlineChangeSeat',
          onlineChangeSeatPopBgImage: statusToUrl[status],
          onlineChangeSeatPopInfo: {
            status,
            jumpUrl: res.AlertInfo?.JumpUrl,
          },
        })
        // 曝光埋点
        util.ubtFuxiTrace('TCWFrontPage_ChangeSeatPopup_exposure', {
          PageId: this.pageId,
          Type: status,
        })
        TrainActStore.setAttr("ONLINECHANGESEATPOPTIME",new cDate().addDay(7).getTime())
      }
    } catch (e) {
      console.log('onLineChangeSeat',e)
    }
  },
  handleChangeSeatPopClick(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      showType: '',
    })
    const { onlineChangeSeatPopInfo } = this.data
    const { status, jumpUrl } = onlineChangeSeatPopInfo
    if (type === 1) {
      if (jumpUrl) {
        this.navigateTo({ url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(jumpUrl)}`})
      } else {
        this.goToOnline()
      }
    }
    // 点击按钮
    util.ubtFuxiTrace('TCWFrontPage_ChangeSeatPopup_click',{
      PageId: this.pageId,
      Type: status,
      clickType: type,
    })
  },
  async onClickSubscribeTicket() {
    this.setData({ showType: '' })
    const tempList = [
      {
        id: '_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM',
        ActivityCode: 'CtripBuyTicketForBISend',
        FromType: 2,
        status: false,
      }
    ]
    await this.handleSubIds(['_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM'],tempList)
    subscribeMixin.requestSubscribe(tempList, { OpenID: cwx.cwx_mkt?.openid || '' })
      .then(_ => {
        this.setData({subscribeGuideFlag: false})
        if (_?.errMsg) {
          this.ubtDevTrace('subscribeerr', _?.errMsg)

          return
        }
      })
      .finally(() => {
        this.setData({subscribeGuideFlag: false})
        cwx.navigateBack()
      })
  },
  // 其他登录方式成功回调
  ctripLogin() {
    const deferred = util.getDeferred()
    cwx.user.login({
      callback(res) {
        if (res.ReturnCode == 0) {
          this.hideBackDrop()
          this.checkCollectedReward()
          deferred.resolve()
        } else {
          deferred.reject()
        }
      },
    })

    return deferred.promise
  },
  // 在有缓存有效期 不会去请求跟新客权益相关的接口
  checkIsNeedGetInfo() {
    const store = TrainActStore.getAttr('NEWCUSTOMERRIGHTFLAG')
    if (!store) {
      return true
    } else {
      if (Array.isArray(store)) {
        let auths = store.map(item => { return item.key })
        if (auths.includes(cwx.user.auth)) {
          return false
        } else {
          return true
        }
      }
    }
  },
  setStorageArr(key, value) {
    if (!key || !value) return
    let arr = TrainActStore.getAttr(key) || []
    arr.push(value)
    TrainActStore.setAttr(key, [...new Set(arr)])
  },
  // 弹窗 领取优惠券
  receiveCouponHandle() {
    this.hideBackDrop()
    this.ctripLogin()
    this.setData({
      hasShowCouponLoginTip: true,
    })
  },
  grabTicketFlowShared(oid, refreshAfterAcce) {
    util.showLoading()

    const params = {
      OrderNumber: oid,
      OpenId: cwx.cwx_mkt.openid,
    }

    RobTicketShareInfoModel(
      params,
      res => {
        const {
          RetCode,
          FlowPacketCount = 0,
          IsShared = 0,
        } = res
        if (RetCode !== 0) {
          this.showAcceModal(1)

          return
        }
        if (IsShared === 0) {
          this.showAcceModal(0, FlowPacketCount)
        } else if (IsShared === 1) {
          if (refreshAfterAcce) {
            this.showAcceModal(0, FlowPacketCount)
          } else {
            this.showAcceModal(2)
          }
        } else {
          this.showAcceModal(1)
        }
      },
      () => {
        this.showAcceModal(1)
      },
      () => {
        util.hideLoading()
      }
    )
  },
  onAcceRate(oid, subOrderId) {
    if (!oid || !cwx.cwx_mkt.openid) {
      // return;
    }

    const params = {
      OrderNumber: oid,
      OpenId: cwx.cwx_mkt.openid,
      PassageName: cwx.cwx_mkt.nickName || "",
      ChangeOrderNumber: subOrderId,
    }

    AccelerateGrabTicketRateModel(
      params,
      res => {
        if (res.RetCode == 1) {
          this.showAcceModal(1)
        } else if (res.RetCode == 2) {
          this.showAcceModal(2)
        } else {
          //accelerate success
          this.grabTicketFlowShared(oid, true)
        }
      },
      () => {}
    )
  },
  showAcceModal(opt, FlowPacketCount) {
    switch (opt) {
      case 0:
        util.showModal({
          m: `助力成功，好友已有${FlowPacketCount}个助力包。作为回报，送你免费抢票助力权益！`,
          title: "领取助力福利",
          confirmText: "立即购票",
        })
        break
      case 1:
        util.showModal({
          m: "助力已结束，依然感谢，送你免费抢票助力权益！",
          title: "领取助力福利",
          confirmText: "立即购票",
        })
        break
      case 2:
        util.showModal({
          m: "您已为好友助力, 不能重复助力。快来使用免费抢票助力！",
          title: "领取助力福利",
          confirmText: "立即购票",
        })
        break
      default:
        break
    }
  },
  hideCollectTip() {
    this.setData({
      showCollected: false,
    })
    TrainActStore.setAttr("clickCloseCollect", true)
  },
  loadQueryFromStore() {
    let tmp = TrainQueryStore.get() || {}
    let dStation = tmp.dStation || defaultDStation
    let aStation = tmp.aStation || defaultAStation
    let selectDate = tmp.date || ""
    let departCtripCityName = tmp.departCtripCityName || defaultDStation
    let arriveCtripCityName = tmp.arriveCtripCityName || defaultAStation
    let departDate = selectDate.replace(/-/g, '') || new cDate().addDay(1).format('Ymd')

    if (
      new cDate(selectDate).getTime() <=
                new cDate().addDay(-1).getTime() ||
            !selectDate
    ) {
      selectDate = new cDate().addDay(1).format("Y-m-d")
    }

    let monthDay = cDate.format(selectDate, "n月j日")
    let today = new cDate().format("n月j日")
    let nextDay = new cDate().addDay(1).format("n月j日")
    let dayInfo = cDate.format(selectDate, "D") || cDate.weekday(selectDate)

    let isGaotieOnly = tmp.isGaotieOnly
    let stu = tmp.stu

    this.setData({
      dStation,
      aStation,
      dStationShow: util.getHongKongStationNameShow(dStation),
      aStationShow: util.getHongKongStationNameShow(aStation),
      selectDate,
      monthDay,
      today,
      nextDay,
      dayInfo,
      isGaotieOnly,
      isStu: stu,
      departCtripCityName,
      arriveCtripCityName,
      departDate,
    })
  },
  loadNotice() {
    const params = {
      Channel: "ctripwx",
    }

    TrainNoticeModel(
      params,
      data => {
        if (data.NoticeInfo) {
          this.setData({
            notice: data.NoticeInfo,
          })
        }
      },
      () => {}
    )
  },
  loadCouponInfo() {
    const params = {}
    GetUserInfoForIndexModel(params, res => {
      // IconUrl:图标Url
      // Content:内容
      // JumpUrl：调整Url
      if (res.RetCode == 1) {
        const { IconUrl, Content , JumpUrl } = res
        if (Content) {
          this.setData({
            userCouponInfo: {
              IconUrl,
              Content,
              JumpUrl,
            },
          })
        }
      }
    })
  },
  loadTopTips() {
    newcustomerMixin.getUserNewCustomerRight(this, 20).then(topTips => {
      // 固定入口曝光
      if (this.data.newGuestGiftInfo.IsHaveRights) {
        util.ubtTrace('s_trn_c_trace_10320640935', {
          exposureType: "normal",
          bizKey: 'newgiftFixedPositionExposure',
          login: 1,
        })
      }
      if (!topTips) {
        this.loadCouponInfo()
      }
    }).catch(() => {
      this.loadCouponInfo()
    })
  },
  getRightsPerceiveInfo() {
    const params = {
      Channel:'ctripwx',
    }

    GetRightsPerceiveInfoModel(params,res => {
      if (!res || res.RetCode !== 1 || !res.CardInfoList ) return
      util.ubtTrace('s_trn_c_10320640935',{bizKey:'benefitPerceptionExposure',exposureType:'normal'})
      let { CardInfoList = [] } = res
      if ( CardInfoList.length >= 2) {
        CardInfoList.push(CardInfoList[0])
      }
      this.setData({
        CardInfoList,
      })
      if ( CardInfoList.length >= 2 ){
        setTimeout(this.equityAnimation, 2400)
      }

    },() => {})

  },
  equityAnimation() {
    const { animateCount = 0, CardInfoList = []} = this.data
    this.setData({isAnimated: true})
    const resetFlag = animateCount >= CardInfoList.length - 1

    this.setData({
      animateCount: resetFlag ? 0 : animateCount + 1,
    })
    if (resetFlag) {
      this.setData({isAnimated: false})
      setTimeout(this.equityAnimation, 400)
    } else {
      setTimeout(this.equityAnimation, 2400)
    }
  },
  hideUserCouponInfoBanner() {
    this.setData({ userCouponInfoFlag: false })
  },
  // showNewCustomerRight() {
  //     this.setData({ showType: 'newGuestRightPop' })
  //     this.ubtTrace('train_inquire_hpnewbieent', true)
  // },
  toCouponInfoPage() {
    this.navigateTo({url: `/pages/market/promocode/index/index?p=13&o=0`})
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
  toHomeRecommendPage(e) {
    const { url, pagetype} = e.currentTarget.dataset
    if (pagetype == 1){
      util.ubtTrace('c_trn_c_10320640935',{bizKey:'hotelCardClick'})
    } else if (pagetype == 2) {
      util.ubtTrace('c_trn_c_10320640935',{bizKey:'carCardClick'})
    }
    if (!url) return
    util.jumpToUrl(url)
  },
  loadStation() {
    if (TrainStationStore.get() && TrainStationStore.getAttr('cityMainList')) return
    // util.showLoading()
    TrainStationModel(
      {},
      data => {
        if (data.TrainStationsInfo) {
          let rawData = data.TrainStationsInfo
          this.handleStation(rawData)
        }
      },
      () => {},
      () => {
        // util.hideLoading()
      }
    )
  },
  // 处理车站信息
  handleStation(all) {
    let stations = []
    let tmp = {}
    _.each(all, station => {
      let temp = {
        cityName: station.StationName,
        cityID: station.StationID,
        CtripCityName: station.CityName,
        py: station.PinYin,
        pyHead: station.PinYinHead,
        firstLetter: station.FirstLetter,
        CtripCityID: station.CtripCityID,
      }
      stations.push(temp)
    })

    stations = _.sortBy(stations, "firstLetter")

    _.each(stations, s => {
      if (!tmp[s.firstLetter]) {
        tmp[s.firstLetter] = []
      }

      tmp[s.firstLetter].push({
        cityName: s.cityName,
        CtripCityName: s.CtripCityName,
        cityID: s.cityID,
        py: s.py,
        pyHead: s.pyHead,
        CtripCityID: s.CtripCityID,
      })
    })

    TrainStationStore.setAttr("cityMainList", tmp)
  },
  clearStation() {
    if (!TrainActStore.getAttr("hasClearedStations0917")) {
      TrainStationStore.set()
      TrainActStore.setAttr("hasClearedStations0917", true)
    }
  },
  chooseStation(e) {
    let type = e.currentTarget.dataset.type
    let title =
            (type == "d" ? 1 : 0) ^ (this.data.exchange ? 1 : 0)
              ? "出发"
              : "到达"

    openCity(
      {
        title,
      },
      obj => {
        if (type == "d") {
          this.setData({
            dStation: obj.cityName,
            dStationShow: util.getHongKongStationNameShow(
              obj.cityName
            ),
            departCtripCityName :obj.CtripCityName || obj.cityName,
          })
        } else {
          console.log(obj,'objjjjjjj')
          this.setData({
            aStation: obj.cityName,
            aStationShow: util.getHongKongStationNameShow(
              obj.cityName
            ),
            arriveCtripCityName :obj.CtripCityName || obj.cityName,
          })
          this.getHomePageRecommend()
        }
      }
    )
  },
  exchangeStation() {
    this.setData({
      exchange: !this.data.exchange,
    })
    if (this.data.exchange) {
      this.setData({
        departCtripCityName: this.data.arriveCtripCityName,
        arriveCtripCityName: this.data.departCtripCityName,
      })
    } else {
      this.setData({
        departCtripCityName: this.data.departCtripCityName,
        arriveCtripCityName: this.data.arriveCtripCityName,
      })
    }
  },
  chooseDate() {
    let choosenDate = this.data.selectDate
    openCalendar(
      {
        choosenDate,
        title: "选择出发日期",
        tips: shared.calendarTip,
      },
      date => {
        let selectDate = cDate.parse(date).format("Y-m-d")
        let monthDay = cDate.parse(date).format("n月j日")
        let today = new cDate().format("n月j日")
        let nextDay = new cDate().addDay(1).format("n月j日")
        let dayInfo =
                    cDate.parse(date).format("D") +
                    " " +
                    cDate.weekday(selectDate)
        let departDate = selectDate.replace(/-/g, '')

        this.setData({
          selectDate,
          monthDay,
          nextDay,
          today,
          dayInfo,
          departDate,
        })
        // this.getHomePageRecommend()
      }
    )
  },
  switchChange() {
    this.setData({
      isGaotieOnly: !this.data.isGaotieOnly,
    })
    if (this.data.isStu){
      if (this.data.magicDoorNum > 10){
        this.totestPage()
        this.setData({
          magicDoorNum:0,
        })

        return
      }
      this.setData({
        magicDoorNum:this.data.magicDoorNum + 1,
      })
    }
    this.ubtTrace('o_tra_homegaotie_click', true)
    if (this.data.isGaotieOnly) {
      this.ubtTrace('e_tra_homegaotie_show', true)
    }
  },
  search() {
    if (this.data.dStation == this.data.aStation) {
      return util.showModal({ m: "出发和到达站不能相同，请重新选择" })
    }

    let tmp = {
      date: this.data.selectDate,
      isGaotieOnly: this.data.isGaotieOnly,
      stu: this.data.isStu,
    }
    if (this.data.exchange) {
      tmp.dStation = this.data.aStation
      tmp.aStation = this.data.dStation
    } else {
      tmp.dStation = this.data.dStation
      tmp.aStation = this.data.aStation
    }
    const allStations = getAllStations()
    const departCtripCityName = allStations.find(station => station.cityName == tmp.dStation)?.CtripCityName
    const arriveCtripCityName = allStations.find(station => station.cityName == tmp.aStation)?.CtripCityName
    tmp.departCtripCityName = departCtripCityName
    tmp.arriveCtripCityName = arriveCtripCityName
    let autoFilterDStation = tmp.dStation == tmp.departCtripCityName ? '' : tmp.dStation
    let autoFilterAStation = tmp.aStation == tmp.arriveCtripCityName ? '' : tmp.aStation
    TrainQueryStore.set(tmp)

    this.navigateTo({
      url:
                "../list/list?dstation=" +
                tmp.dStation +
                "&astation=" +
                tmp.aStation +
                "&ddate=" +
                tmp.date +
                "&isgd=" +
                !!tmp.isGaotieOnly +
                "&stu=" +
                !!tmp.stu +
                "&autoFilterDStation=" + autoFilterDStation +
                "&autoFilterAStation=" + autoFilterAStation +
                (this.data.isFromAwakenH5 ? '&fromh5=1' : '') +
                (this.taskOrderType ? `&taskOrderType=${this.taskOrderType}` : ''),
    })
    let dStation = tmp.dStation == "香港" ? "中国香港" : tmp.dStation
    let aStation = tmp.aStation == "香港" ? "中国香港" : tmp.aStation
    addHistoryPair(`${dStation} - ${aStation}`)
  },
  // 跳转在线换座 h5
  async goToOnline() {
    util.ubtFuxiTrace('230985', { PageId: this.pageId })

    // 获取本地已登录 12306 账号
    const bind12306 = TrainBookStore.getAttr('bind12306') || {}
    const host = __global.env == 'fat' ? 'https://m.fws.qa.nt.ctripcorp.com/' : 'https://m.ctrip.com/'
    const url = `${host}webapp/train/activity/ctrip-online-change-seats?userName12306=${bind12306?.name || ''}&hideShare=true&isHideNavBar=YES`

    this.navigateTo({ url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`})
  },
  async goToTrainList() {
    if (this.data.activeTabbarIndex === 0) {
      await this.initSync12306OrderInfo()
    }
    if (shared.isTrainApp) {
      cwx.switchTab({
        url: "../../myctrip/list/list",
      })
    } else {
      if (!cwx.user.isLogin()) {
        cwx.user.login({
          callback: function(res) {
            if (res.ReturnCode == "0") {
              this.goToTrainList()
            }
          },
        })

        return
      }
      this.navigateTo({
        url: "/pages/myctrip/list/list",
        data: {
          id: "train",
        },
      })
    }
  },
  async initSync12306OrderInfo (isOnline = false) {
    const bookInfo = TrainBookStore.get()
    // 区分在线换座和之前的逻辑
    const isCheckAuth = !isOnline ? cwx.user.auth === bookInfo.auth : true
    console.log('是否调用同步订单', cwx.user.isLogin() && bookInfo && isCheckAuth)
    if (cwx.user.isLogin() && bookInfo && isCheckAuth) {
      try {
        const accountInfo = bookInfo.bind12306
        if (!accountInfo?.name) {
          throw '无12306账号'
        }

        const mobile = bookInfo.mobile || await getUserBindedPhoneNumber()
        const payload = isOnline
          ? {
            Channel: 'H5',
            FromType: 1, // 0=默认，1=在线换座
            actionType: 2,
            userName12306: accountInfo.name,
          } : {
            channel: 'WX',
            mobilePhone: mobile,
            userName12306: util.encodeAES(accountInfo.name),
            actionType: 2,
          }
        await Sync12306OrderInfoPromise(payload)
      } catch (error) {
        util.devTrace('', {
          bizKey: 'sync_12306_order_fail',
          error,
        })
      }
    }
  },
  onUnload() {
    // 清理临时数据
  },
  noticeHandle() {
    const { Content } = this.data.notice
    if (!Content) return
    if (Content.indexOf("https") > -1) {
      this.navigateTo({
        url: "../webview/webview",
        data: { url: Content },
      })
    } else {
      this.setData({ showType: "noticePop" })
    }
  },
  totestPage() {
    cwx.navigateTo({
      url: "/pages/train/subpages/testpage/testpage",
    })
  },
  testHandle(event) {
    let { touches = [] } = event
    if (touches.length == 3) {
      if (util.isIOS()) {
        wx.getConnectedWifi({
          success: function(w) {
            cwx.WifiInfo = w
            console.log("已连接wifi", w)
            if (
              cwx.WifiInfo &&
                            cwx.WifiInfo.wifi &&
                            cwx.WifiInfo.wifi.SSID == "DEV" &&
                            util.isIOS()
            ) {
              cwx.navigateTo({
                url: "/pages/train/subpages/testpage/testpage",
              })
            }
          },
        })
      } else {
        let env = __wxConfig.envVersion
        console.log(" __wxConfig.envVersion", __wxConfig.envVersion)
        if (env == "develop" || env == "trial") {
          cwx.navigateTo({
            url: "/pages/train/subpages/testpage/testpage",
          })
        }
      }
    }

    this.setData({
      isFilterViewAnimation: false,
    })
  },
  getActivityKey() {
    let { activityCode: key = "index_activity_default_key" } =
            this.data.activity || {}

    return key
  },
  hideLayer() {
    TrainBookStore.setAttr(this.getActivityKey(), true)
    this.setData({
      isShowLayer: false,
      isShowCoup: false,
      isShowCoupSuc: false,
    })
  },
  loginAndReceiveBonus() {
    util.ubtTrace('c_trn_c_10320640935', {
      bizKey: 'helpOthersPopupClick',
    })

    this.myAuthorize({
      success: () => {
        this.setData({
          isLogin: true,
        })
        this.hideBackDrop()
        this.checkCollectedReward()
        this.receiveBonus()
      },
      reject: () => {
        util.showToast('需授权登录后才能领取哦', 'none')
      },
    })
  },
  receiveBonus(e) {
    if (e?.target?.dataset?.ubtKey === 'helpOthersPopupClick') {
      util.ubtTrace('c_trn_c_10320640935', {
        bizKey: 'helpOthersPopupClick',
      })
    }
    const promises = []

    let rightsPromise = newcustomerMixin.checkCanReceiveNewCustomerRight()
      .then(newcustomerMixin.receiveNewCustomerRight)
      .catch(e => {
        console.error(e)
      })
    promises.push(rightsPromise)

    let cashbackPromise = this.getNewCouponList('6555CA309B08FE79C5FAA7F97C9DC891').then(() => {
      if (this.data.couponListWill && this.data.couponListWill.length) {
        return this.recieveNewCoupon('6555CA309B08FE79C5FAA7F97C9DC891', this.data.couponListWill[0]?.SubType)
      }
    }).catch(e => {
      console.error(e)
    })
    promises.push(cashbackPromise)

    Promise.all(promises).then(res => {
      console.log('bindgetphonenumber="loginAndReceiveBonus', res)
      const [rightsRes, couponRes] = res
      if (rightsRes?.IsReceiveSuccess
                && rightsRes?.RightInfo
                && couponRes?.RetCode == 1) {
        // 新客权益和返现券都可以领
        rightsRes.RightInfo.RightList = rightsRes?.RightInfo?.DescList // 这里是为了字段统一
        let bonusVIPItem = rightsRes.RightInfo.RightList?.find(item => item?.Desc.indexOf('抢票'))

        this.setData({
          bonusVIPItem,
          showType: 'bonus-success',
          doubleBonus: true,
        })

        util.ubtTrace('c_trn_c_10320640935', {
          bizKey: 'takeSuccessExposure',
        })
        this.ubtTrace('train_inquire_hpnewbiecashent', true)
      } else if (couponRes?.RetCode == 1) {
        this.setData({
          showType: 'bonus-success',
        })

        util.ubtTrace('c_trn_c_10320640935', {
          bizKey: 'takeSuccessExposure',
        })
      } else {
        this.setData({ showType: '' })
        util.showToast('您已领取过奖励，快去购票吧', 'none')
      }
    }).catch(e => {
      this.setData({ showType: '' })
      util.showToast('领取失败，请稍后再试', 'none')
      this.ubtMetric('combineigifts err', e)
      console.warn(e)
    })
  },
  showCoupon() {
    this.setData({
      isShowLayer: true,
      isShowCoup: true,
      isShowCoupSuc: false,
    })
  },
  getCoupon() {
    const self = this
    const goLogin = () => {
      cwx.user.login({
        callback: function(res) {
          if (res.ReturnCode == "0") {
            self.getCoupon()
          }
        },
      })
    }
    if (!cwx.user.isLogin()) {
      return goLogin()
    }

    if (this.data.activity.activityCode == 2026) {
      this.hideLayer()
      this.navigateTo({
        url: "../newguestgifts/newguestgifts",
      })

      return
    }

    const params = {
      partner: "Ctrip.Train",
      activityCode: 1003,
    }
    const errCb = () => {
      util.showModal({
        m: "服务器开小差了，优惠券没领到",
      })
    }

    return AcquireActivityCouponPromise(params)
      .then(data => {
        if (!util.isAuthValid(data)) {
          return goLogin()
        }
        if (data.resultCode == 1) {
          this.setData({
            isShowCoup: false,
            isShowCoupSuc: true,
          })
        } else if (data.resultCode == 400 || data.resultCode == 406) {
          util.showModal({
            m: "每个用户限领一次，你已经领取过了，快去买票吧",
          })
        } else {
          errCb()
        }
      })
      .catch(errCb)
  },
  checkCollectedReward() {
    let params = {
      partner: "Ctrip.Train",
      mobile: "",
      formId: shared.isCtripApp ? this.acceFormId || "" : "",
      activityCode: 3019,
    }
    const errCb = opt => {
      util.showModal({
        m: opt.m,
        confirmText: opt.confirmText,
        done: opt.done,
      })
    }
    util.showLoading()
    AcquireActivityCouponModel(
      params,
      data => {
        util.hideLoading()
        if (data.resultCode === 1) {
          this.setData({
            showType: "collectedReward",
            hasCollected: true,
          })
          TrainActStore.setAttr("HASCOLLECTED", true)
        } else if (data.resultCode === 400) {
          // 400：重复领取优惠券 等同于已领取 不显示首页收藏蓝条
          this.setData({
            showType: "hasReceived",
            hasCollected: true,
          })
          TrainActStore.setAttr("HASCOLLECTED", true)
          // errCb()
        } else if (data.resultCode === 406) {
          // 未登录用户 登录后 错误提示
          // 已登录用户 不提示错误
          if (!this.data.hasShowCouponLoginTip) return
          errCb({
            m: "网络繁忙，请稍后再试",
            text: "确定",
            done: this.hideBackDrop,
          })
        } else {
          // 未登录用户 登录后 错误提示
          // 已登录用户 不提示错误
          if (!this.data.hasShowCouponLoginTip) return
          errCb({
            m: "领取优惠券失败，请重试",
            text: "重试",
            done: this.checkCollectedReward,
          })
        }
      },
      () => {
        util.hideLoading()
        // errCb()
      },
      () => {}
    )
  },
  checkHasRecivedCoupon() {
    const deferred = util.getDeferred()
    if (this.data.hasCollected || !cwx.user.isLogin()) {
      deferred.resolve()

      return deferred.promise
    }

    let params = {
      ActivityCode: 3019,
    }
    TrainCheckCouponStatusModel(
      params,
      res => {
        if (!res.IsCanReceive) {
          TrainActStore.setAttr("HASCOLLECTED", true)
        }
        deferred.resolve()
      },
      err => {
        deferred.reject()
        console.log(err)
      }
    )

    return deferred.promise
  },
  clickRecieveSearchCoupon(e) {
    const { type } = e.currentTarget.dataset
    this.recieveNewCoupon('673AA2C107BDE8C3AB83E887C46DDC81', type).then(res => {
      if (res.RetCode == 1) {
        this.hideBackDrop()
        util.showToast('领取成功')
      } else {
        util.showToast(res.Message || '领取失败，每位用户限领一次', 'none')
      }
    })
  },
  loginAndReciveSearchCoupon(e) {
    const { type } = e.currentTarget.dataset
    this.myAuthorize({
      success: () => {
        console.log('手机号登录成功')
        this.setData({ isLogin: true })
        this.recieveNewCoupon('673AA2C107BDE8C3AB83E887C46DDC81', type).then(res => {
          if (res.RetCode == 1) {
            this.hideBackDrop()
            util.showToast('领取成功')
          } else {
            util.showToast(res.Message || '领取失败，每位用户限领一次', 'none')
          }
        })
      },
      reject: () => {
        util.showToast('需授权登录后才能领取哦', 'none')
      },
    })
  },
  getNewCouponList (ActivityCode) {
    const deferred = util.getDeferred()
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
        deferred.resolve()
      } else {
        deferred.reject()
      }
    })

    return deferred.promise
  },
  recieveNewCoupon (ActivityCode, SubType) {
    const deferred = util.getDeferred()
    util.showLoading()
    let params = {
      SubType,
      ActivityCode,
      Channel: 'wx',
      MobilePhone: '',
    }
    ActivitySendCouponModel(params, data => {
      util.hideLoading()
      deferred.resolve(data)
    }, () => {
      deferred.reject()
      util.showToast('领取失败，每位用户限领一次', 'none')
    })

    return deferred.promise
  },
  getSubsribeStatus(ActivityCode,FromType) {
    const params = {
      ActivityCode,
      FromType,
    }

    return util.promisifyModel(QuerySubscribeMessageStatusModel)(params)
  },
  async hideBackDrop() {
    const { showType, newUserFlag } = this.data
    util.setTitle("火车票")

    if (showType == 'newGuestRightPop' || showType == 'combineGifts') {
      this.loadTopTips()
    }

    if (showType == 'subscribe') {
      cwx.navigateBack()
    }

    if (showType == 'newCustomerRightUnPop') {
      util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "awaitTakePopupClose" })
    }

    if (showType === 'bonus-success') {
      util.ubtTrace(`c_trn_c_10320640935`, { bizKey: "takeSuccessClick" })
    }

    if (showType == 'newGuestRightPop' && shared.isCtripApp) {
      const expireTypeMap = new Map([[1, 8],[2, 9],[4, 6]])
      const expireType = expireTypeMap.get(newUserFlag * 1) || 4

      const templist = [
        { id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY", FromType: expireType, ActivityCode: 'NewCustomerGiftBagExpire_Home' }, //  优惠券到期
        { id: "_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM", FromType: 2, ActivityCode: 'CtripBuyTicketForBISend_Home' }, //  购票提醒
        { id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 4, ActivityCode: 'ReceiveBonus_Home' } //  奖励提醒
      ]
      const statusList = await subscribeMixin.checkSubscribeStatus(templist)
      console.log('订阅状态=====', statusList)
      if (statusList?.length) {
        const temArr = ['F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY','_eKHfuBUthFg4Eqtp9BERfz-V9YeJtxVKenuNMgdYPM','VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q']
        await this.handleSubIds(temArr, statusList)
        subscribeMixin.requestSubscribe(statusList, { OpenID: cwx.cwx_mkt?.openid || "" })
          .then(({ errMsg }) => {
            this.setData({subscribeGuideFlag: false})
            if (errMsg) {
              this.ubtDevTrace('c_train_subscribemsgerr', errMsg)
              util.ubtTrace(`c_trn_c_${this.pageId}`, { bizkey: "subscribeClick", result: 0 })

              return
            }

            this.ubtTrace('o_tra_xinkeyunxu_click', true)
            util.ubtTrace(`c_trn_c_${this.pageId}`, { bizkey: "subscribeClick", result: 1 })
          }).catch(e => this.setData({subscribeGuideFlag: false}))

        util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "homepagePopupGiftClick", status: 2 })
      }
    }

    this.setData({ showType: "" })
  },
  onShareAppMessage() {
    return {
      bu: "train",
      title: "携程火车票，12306抢票",
      path: "/pages/train/index/index",
    }
  },
  setAbroadOutParams(outParams) {
    if (!outParams.hasOutParams) return
    if (
      !outParams.fromCity &&
      !outParams.toCity
    ) {
      return
    }
    // if (this.data.abroadSwitchFlag) {
      // this.setData({
      //   activeTabbarIndex: this.abroadFlag ? 1 : 0,
      // })
      // if (this.abroadFlag) {
      //     this.sendOverseasTrainPV();
      // }
    this.setData({
      overSeaUtmSource: outParams?.utmSource
    })
    OverseaTrainQueryStore.set(outParams)
    // }
  },
  setOutParams(outParams) {
    if (
      !outParams.dStation &&
            !outParams.aStation &&
            !outParams.dDate &&
            outParams.isgd === undefined &&
            outParams.stu === undefined
    ) {
      return
    }
    let tmp = {
      dStation: outParams.dStation,
      aStation: outParams.aStation,
      date: outParams.dDate || "",
      isGaotieOnly: outParams.isgd ? true : false,
      stu: outParams.stu,
    }
    TrainQueryStore.set(tmp)
  },
  switchStu() {
    this.setData({
      isStu: !this.data.isStu,
    })
  },
  goReward() {
    const self = this
    if (!cwx.user.isLogin()) {
      cwx.user.login({
        callback: function(res) {
          if (res.ReturnCode == "0") {
            util.goReward(self)
          }
        },
      })

      return
    }
    util.goReward(self)
  },
  // hideFutureOrders() {
  //     this.setData({
  //         isShowFutureOrders: false,
  //     })
  // },
  /**
     * 设置之前搜索过的出发到达站
     */
  loadPairHistory() {
    this.setData({
      historyPairs: getHistoryPair(),
    })
  },

  clickHistoryPair(e) {
    const index = e.currentTarget.dataset.index
    const pair = this.data.historyPairs[index]
    const [dStation, aStation] = pair.split("-").map(t => t.replace(/\s+/g, ''))
    this.setData({
      dStation,
      aStation,
      dStationShow: util.getHongKongStationNameShow(dStation),
      aStationShow: util.getHongKongStationNameShow(aStation),
      exchange: false,
    })
  },
  clearHistory() {
    setHistoryPair()
    this.setData({
      historyPairs: [],
    })
  },
  goHome() {
    util.goToHomepage()
  },
  goRedTheme() {
    util.goTrainHome("theme=red")
  },

  logWithBlockName: function(block) {
    this.ubtMetric({
      name: "101662",
      value: 1,
      tag: { block: block, abtest: this._homeABTest },
      callback: function(res) {
        console.log("callback ： res = ", res)
      },
    })
  },
  /**
     * [myAuthorize 唤起微信授权]
     * @param  {[type]} e       [此处的 e必传]
     * @param  {[type]} success [授权并登陆成功的回调函数]
     * @param  {[type]} reject  [拒绝授权时的回调函数 不传时默认跳转到其他登录方式页面]
     * @return {[type]}         [description]
     */
  myAuthorize ({success, reject = (data) => {
    if (!data) {
      data = {}
    }
    if (!data.param || typeof data.param !== 'object') {
      data.param = {}
    }
    if (!data.callback || typeof data.callback !== 'function') {
      data.callback = function () { }
    }
    cwx.user.login(data)
  }} = {}) {
    cwx.user.login({
      param: {},
      callback: (res) => {
        if (res.ReturnCode === '0') {
          this.setData({
            isLogin: true,
          })

          return success()
        }

        return reject()
      },
    })
  },
  // 入口埋点
  enterUbt() {
    //  0: 公众号新客推送入口 1: 优惠券到期通知 2: 获得奖励通知
    const { fromSubMsg, newUserFlag, subId, subFromtype } = this.data
    const entrance = newUserFlag == 1
      ? 0
      : fromSubMsg
        ? fromSubMsg * 1 + 1
        : ''
    util.ubtTrace(`s_trn_c_trace_${this.pageId}`, { exposureType: 'normal', bizkey: 'enterAppletsHomepage', entrance, templateid: subId, from_type: subFromtype })
  },
  // 某渠道必出新客
  showNewCustomerByQuery() {
    const mustShow = [1, 3, 4]
    const mustShowNew = [2]
    const mustShowVersionBNew = [5, 6]

    const type = this.convertNewUserFromType()

    if (mustShow.includes(this.data.newUserFlag * 1)) {
      if (!cwx.user.isLogin()) {
        return newcustomerMixin.getNewCustomerRights(this)
          .then(_ => {
            this.setData({showType: "newCustomerRightUnPop"})
            util.ubtTrace(`s_trn_c_trace_${this.pageId}`, {
              exposureType: 'Popup',
              bizKey: "homepagePopupExpousre",
              scene: this.data.newUserFlag,
              status: 0,
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'gongzhonghaoPush': 7,
                'qiweiPush': 8,
              }[this.data.biSource || this.data.source],
            })
          })
      }
      
      return newcustomerMixin.checkCanReceiveNewCustomerRight()
        .then(() => newcustomerMixin.getNewCustomerRights(this))
        .then(() => newcustomerMixin.receiveNewCustomerRight(type))
        .then(res => {
          if (res?.IsReceiveSuccess) {
            const list = res.RightInfo.DescList
            const amount = list.reduce((sum, v) => sum += v.Price, 0)
            // 代金券，type为2
            const cashList =  list === null ? [] : list.filter( e => e.Type === 2)
            // 权益，type为1
            const rightList = list === null ? [] : list.filter( e => e.Type === 1)
            const rightListAmount = rightList.reduce((sum, v) => sum += v.Price, 0)
            const data = {
              ...res,
              priceAmount: amount,
              RightInfoType2: {
                list: cashList
              },
              RightInfoType1: {
                list: rightList,
                price: rightListAmount
              }
            }
            this.setData({ newGuestReceivedPopData: data, showType: 'newGuestRightPop' })

            util.ubtTrace('s_trn_c_trace_10320640935', {
              exposureType: "popup",
              bizKey: 'newgiftPopupExposure',
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'gongzhonghaoPush': 7,
                'qiweiPush': 8,
              }[this.data.biSource || this.data.source],
            })
          }
        })
        .then(() => {
          util.showToast('恭喜你，领取成功', 'none')
          this.setData({ showType: "newGuestRightPop" })
          util.ubtTrace(`s_trn_c_trace_${this.pageId}`, {
            exposureType: 'Popup',
            bizKey: "homepagePopupExpousre",
            scene: this.data.newUserFlag,
            status: 1,
            visitSource: {
              'gongzhonghao_zhubanpost': 1,
              'wecom_push': 2,
              'wecom_apptask': 3,
              'gongzhonghaoPush': 7,
              'qiweiPush': 8,
            }[this.data.biSource || this.data.source],
          })
        })
        .catch(_ => {
          util.showToast('对不起，不符合领取资格', 'none')
        })
    } else if (mustShowNew.includes(this.data.newUserFlag * 1)) {
      // 新客礼包 ab 助力跳转首页需要出现(用户没领券时)
      newcustomerMixin.getNewCustomerRights(this, type)

    } else if (mustShowVersionBNew.includes(this.data.newUserFlag * 1)) {
      newcustomerMixin.getNewCustomerRights(this, type)
        .then(() => {
          // const { AbValue, RightList } = this.data.newCustomerRightInfo
          // if (AbValue !== 'a' && RightList.length) {
          //     this.setData({ showType: 'newGuestRightUpPop' })
          //     util.ubtTrace('s_trn_c_trace_10320640935', {
          //         bizKey: 'newGiftExposure',
          //         exposureType: 'Popup',
          //         visitSource: {
          //             'gongzhonghao_zhubanpost': 1,
          //             'wecom_push': 2,
          //             'wecom_apptask': 3
          //         }[this.data.source]
          //     })
          // }
        })
    }
  },
  // 登录后领取新客礼包逻辑
  loginAndReceiveRights() {
    util.ubtFuxiTrace('TCWFrontPage_unloginNewGift_click', {})
    if (this.abTest === 'B') {
      this.setData({ showType: ""})
    }
    const type = this.convertNewUserFromType()
    let that = this
    this.myAuthorize({
      success: async() => {
        await newcustomerMixin.getUserNewCustomerRight(that, 20)
        // 已领取过 展示
        if (that.data.newCustomerRightInfo.IsHaveRights) {
          util.showToast('您已领取过奖励，快去购票吧', 'none')
          this.setData({showType: ""})
          return
        }
        newcustomerMixin.checkCanReceiveNewCustomerRight()
          .then(() => newcustomerMixin.receiveNewCustomerRight(type))
          .then(async(res) => {
            if (this.abTest === 'B') {
              await newcustomerMixin.getUserNewCustomerRight(that, 20)
            } else {
              if (res?.IsReceiveSuccess) {
                const list = res.RightInfo.DescList
                const amount = list.reduce((sum, v) => sum += v.Price, 0)
                // 代金券，type为2
                const cashList =  list === null ? [] : list.filter( e => e.Type === 2)
                // 权益，type为1
                const rightList = list === null ? [] : list.filter( e => e.Type === 1)
                const rightListAmount = rightList.reduce((sum, v) => sum += v.Price, 0)
                const data = {
                  ...res,
                  priceAmount: amount,
                  RightInfoType2: {
                    list: cashList
                  },
                  RightInfoType1: {
                    list: rightList,
                    price: rightListAmount
                  }
                }
                this.setData({ newGuestReceivedPopData: data, showType: 'newGuestRightPop' })
                util.ubtTrace('s_trn_c_trace_10320640935', {
                  exposureType: "popup",
                  bizKey: 'newgiftPopupExposure',
                  visitSource: {
                    'gongzhonghao_zhubanpost': 1,
                    'wecom_push': 2,
                    'wecom_apptask': 3,
                    'gongzhonghaoPush': 7,
                    'qiweiPush': 8,
                  }[this.data.biSource || this.data.source],
                })
              }
            }
          })
          .then(() => {
            if (this.data.newCustomerRightInfo.RightList.length) {
              util.showToast('恭喜你，领取成功', 'none')
              if (this.abTest === 'B') return
              this.setData({ showType: "newGuestRightPop" })
            }
          })
          .catch(() => {
            util.showToast('抱歉，仅限火车票新用户领取', 'none')
            this.setData({showType: ""})
          })

        util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "homepagePopupLoginAuth", status: 1 })
      },
      reject: () => {
        util.showToast('需授权登录后才能领取哦', 'none')
        util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "homepagePopupLoginAuth", status: 2 })
      },
    })

    util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "homepagePopupGiftClick", status: 1 })
  },
  convertNewUserFromType() {
    const map = new Map([[1, 5], [3, 6], [4, 9], [5, 17], [6, 15]])
    const { newUserFlag } = this.data

    return map.get(newUserFlag * 1) || 1
  },

  // getGeoInfo() {
  //     let _this = this
  //     cwx.getSetting({
  //         success(res) {
  //           if (res.authSetting['scope.userLocation']) {
  //             cwx.getLocation({
  //               type: 'gcj02',
  //               success(res) {
  //                 _this.setData({
  //                     latitude: res.latitude,
  //                     longitude: res.longitude
  //                 })
  //               }
  //             })
  //           }
  //         },
  //         fail(res) {
  //             console.log(res)
  //         }
  //       })
  // },
  getPushCoupon() {
    util.ubtTrace(`c_trn_c_${this.pageId}`, {
      exposureType: 'normal',
      bizKey: 'enterAppletsHomepage',
      marketingScene: this.sourceType,
      entrance: 3,
    })
    GetActivityCouponInfoModel({
      ActivityCode: '66f21718dc8174427b9bdba47a00j8h5',
      Channel: 'wx',
      SubType: 0,
      SourceType: this.sourceType,
    }, data => {
      if (data.RetCode === 1) {
        const expiredDateTime = data.CouponItemList[0].ExpiredDateTime
        const expired = new cDate(`${expiredDateTime.slice(0, 4)}/${expiredDateTime.slice(4, 6)}/${expiredDateTime.slice(6, 8)}`)
        this.setData({
          pushCouponInfo: {
            ...data,
            IsSend: data.CouponItemList[0].IsSend,
            expiredText: expired.format('Y-m-d'),
          },
        })
        util.ubtTrace(`c_trn_c_${this.pageId}`, {
          exposureType: 'Popup',
          bizKey: 'homepagePopupExpousre',
          scene: 5,
          status: data.CouponItemList[0].IsSend ? 1 : 0,
          type: 1,
          visitSource: {
            'gongzhonghao_zhubanpost': 1,
            'wecom_push': 2,
            'wecom_apptask': 3,
            'wecom_apphome': 4,
            'wecom_apphome1': 5,
            'gongzhonghaoPush': 7,
            'qiweiPush': 8,
          }[this.data.biSource || this.data.source],
        })
      }
    }, (err) => {
      console.error(err)
    })
  },
  onClickReceivePushCouponButton() {
    util.showLoading()
    cwx.user.checkLoginStatusFromServer(data => {
      if (!data) {
        cwx.user.login({
          callback(res) {
            util.hideLoading()
            this.getPushCoupon()
          },
        })
        util.ubtTrace(`c_trn_c_${this.pageId}`, {
          bizKey: "couponGetClick",
          status: 0,
          visitSource: {
            'gongzhonghao_zhubanpost': 1,
            'wecom_push': 2,
            'wecom_apptask': 3,
            'wecom_apphome': 4,
            'wecom_apphome1': 5,
          }[this.data.biSource || this.data.source],
        })
      } else {
        ActivitySendCouponModel({
          ActivityCode: '66f21718dc8174427b9bdba47a00j8h5',
          Channel: 'wx',
          SubType: 0,
          SourceType: this.sourceType,
        }, data => {
          util.hideLoading()
          this.getPushCoupon()
          if (data.RetCode !== 1) {
            util.showToast('网络开小差，请稍后再试', 'none')
          }
        }, (err) => {
          console.error(err)
          util.showToast('网络开小差，请稍后再试', 'none')
        })
        util.ubtTrace(`c_trn_c_${this.pageId}`, {
          bizKey: "couponGetClick",
          status: 1,
          visitSource: {
            'gongzhonghao_zhubanpost': 1,
            'wecom_push': 2,
            'wecom_apptask': 3,
            'wecom_apphome': 4,
            'wecom_apphome1': 5,
          }[this.data.source],
        })
      }
    })
  },
  async onClickPushCouponSubscribeButton() {
    const tempList = [
      { id: "DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4", FromType: 13, ActivityCode: 'CtripLineStatusAlert' },
      { id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 13, ActivityCode: 'ReceiveBonus' } //  奖励提醒
    ]
    const temArr = ['DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4','VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q']
    await this.handleSubIds(temArr, tempList)
    subscribeMixin.requestSubscribe(tempList, { OpenID: cwx.cwx_mkt?.openid || '' })
      .then(_ => {
        this.setData({subscribeGuideFlag: false})
        if (_?.errMsg) {
          util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "subscribeClick", result: 0, type: 1 })
        } else {
          this.hideBackDrop()
          util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "subscribeClick", result: 1, type: 1 })
        }
      }).catch(e => this.setData({subscribeGuideFlag: false}))
    util.ubtTrace(`c_trn_c_${this.pageId}`, { bizKey: "homepagePopupIknowClick" })
  },
  async onClickGoToBuyTicket() {
    util.ubtTrace('c_trn_c_10320640935', {
      bizKey: 'newGiftIKnowClick',
      visitSource: {
        'gongzhonghao_zhubanpost': 1,
        'wecom_push': 2,
        'wecom_apptask': 3,
        'wecom_apphome': 4,
        'wecom_apphome1': 5,
        'gongzhonghaoPush': 7,
        'qiweiPush': 8,
      }[this.data.biSource || this.data.source],
    })

    util.ubtTrace('c_trn_c_10320640935', {
      bizKey: "newgiftPopupClick",
      visitSource: {
        'gongzhonghao_zhubanpost': 1,
        'wecom_push': 2,
        'wecom_apptask': 3,
        'gongzhonghaoPush': 7,
        'qiweiPush': 8,
      }[this.data.biSource || this.data.source],
    })

    // 230713 修改订阅 fromType+code
    const tempList = [
      { id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 18, ActivityCode: 'newGuestBuyTicket'},
      { id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY", FromType: 18, ActivityCode: 'newGuestBuyTicket'}
    ]
    const temArr = ['VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q','F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY']
    await this.handleSubIds(temArr, tempList)
    subscribeMixin.requestSubscribe(tempList, { OpenID: cwx.cwx_mkt?.openid || '' })
      .then(_ => {
        this.setData({subscribeGuideFlag: false})
        this.hideBackDrop()
      })
      .catch( e => {
        console.log(e)
        this.setData({subscribeGuideFlag: false})
      })
  },
  async getPushCouponAndReceive() {
    try {
      util.showLoading()
      const data = await util.promisifyModel(GetActivityCouponInfoModel)({
        ActivityCode: '66f21718dc8174427b9bdba47a00j8h5',
        Channel: 'wx',
        SubType: 0,
        SourceType: this.sourceType,
      })

      if (data.RetCode === 1) {
        const expiredDateTime = data.CouponItemList[0].ExpiredDateTime
        const expired = new cDate(`${expiredDateTime.slice(0, 4)}/${expiredDateTime.slice(4, 6)}/${expiredDateTime.slice(6, 8)}`)
        this.setData({
          pushCouponInfo: {
            ...data,
            IsSend: data.CouponItemList[0].IsSend,
            expiredText: expired.format('Y-m-d'),
          },
        })

        util.ubtTrace(`c_trn_c_${this.pageId}`, {
          exposureType: 'Popup',
          bizKey: 'homepagePopupExpousre',
          scene: 5,
          status: data.CouponItemList[0].IsSend ? 1 : 0,
          type: 1,
          visitSource: {
            'gongzhonghao_zhubanpost': 1,
            'wecom_push': 2,
            'wecom_apptask': 3,
            'wecom_apphome': 4,
            'wecom_apphome1': 5,
            'gongzhonghaoPush': 7,
            'qiweiPush': 8,
          }[this.data.biSource || this.data.source],
        })

        if (this.data.pushCouponInfo.IsSend) {
          return
        }

        cwx.user.checkLoginStatusFromServer(data => {
          if (!data) {
            cwx.user.login({
              callback(res) {
                util.hideLoading()
                this.getPushCoupon()
              },
            })
            util.ubtTrace(`c_trn_c_${this.pageId}`, {
              bizKey: "couponGetClick",
              status: 0,
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'wecom_apphome': 4,
                'wecom_apphome1': 5,
              }[this.data.source],
            })
          } else {
            ActivitySendCouponModel({
              ActivityCode: '66f21718dc8174427b9bdba47a00j8h5',
              Channel: 'wx',
              SubType: 0,
              SourceType: this.sourceType,
            }, data => {
              util.hideLoading()
              this.getPushCoupon()
              if (data.RetCode !== 1) {
                util.showToast('网络开小差，请稍后再试', 'none')
              }
            }, (err) => {
              console.error(err)
              util.showToast('网络开小差，请稍后再试', 'none')
            })
            util.ubtTrace(`c_trn_c_${this.pageId}`, {
              bizKey: "couponGetClick",
              status: 1,
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'wecom_apphome': 4,
                'wecom_apphome1': 5,
              }[this.data.source],
            })
          }
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      util.hideLoading()
    }
  },
  // app企微入口 显示弹窗
  async showWecomAppPop() {
    const fromType = 18

    if (this.data.source !== 'wecom_apphome' && this.data.source !== 'wecom_apphome1') {
      return
    }

    let isNewUser = false
    try {
      await newcustomerMixin.trainGetNewGuestInfo()
      isNewUser = true
    } catch { }
    if (cwx.user.isLogin()) {
      // 新客 已领取信息
      if (isNewUser) {
        await newcustomerMixin.getUserNewCustomerRight(this, 20)

        // 固定入口曝光
        if (this.data.newGuestGiftInfo.IsHaveRights) {
          util.ubtTrace('s_trn_c_trace_10320640935', {
            exposureType: "normal",
            bizKey: 'newgiftFixedPositionExposure',
            login: 1,
          })
        }

        if (this.data.newCustomerRightInfo.IsHaveRights && this.data.newCustomerRightInfo.RightList.length) {
          if (this.data.newCustomerRightInfo.RightType === 1) {
            this.setData({
              showType: 'newGuestRightPop',
            })
            util.ubtTrace('s_trn_c_trace_10320640935', {
              exposureType: "popup",
              bizKey: 'newgiftPopupExposure',
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'gongzhonghaoPush': 7,
                'qiweiPush': 8,
              }[this.data.biSource || this.data.source],
            })

            util.ubtTrace('s_trn_c_trace_10320640935', {
              bizKey: 'newGiftExposure',
              exposureType: 'Popup',
              visitSource: {
                'wecom_apphome': 4,
                'wecom_apphome1': 5,
              }[this.data.source],
            })
          } else {
            util.showToast("对不起，暂无领取资格", "none")
          }

          return
        }
      } else {
        this.sourceType = 5
        this.showType = 'pushCouponType'
        this.setData({
          showType: 'pushCouponType',
        })

        this.getPushCoupon()

        return
      }
    }

    util.ubtTrace('s_trn_c_trace_10320640935', { bizKey: "newPopupExposure", exposureType: "popup", visitSource: {
      'gongzhonghao_zhubanpost': 1,
      'wecom_push': 2,
      'wecom_apptask': 3,
      'wecom_apphome': 4,
      'wecom_apphome1': 5,
      'gongzhonghaoPush': 7,
      'qiweiPush': 8,
    }[this.data.biSource || this.data.source],

    })
    this.setData({
      showType: 'wecomGuestUpPop',
    })
  },
  //v8.50 新客未领取弹窗 领券点击
  async onClickLoginAndReceive() {
    const isWecom = this.data.source === 'wecom_apphome' || this.data.source == 'wecom_apphome1'

    let fromType = isWecom ? 18 : 1

    const mustShowVersionBNew = [5, 6]
    if (mustShowVersionBNew.includes(this.data.newUserFlag * 1)) {
      fromType = this.convertNewUserFromType()
    }

    const receiveHandler = async () => {
      let isNewUser = false

      try {
        await newcustomerMixin.trainGetNewGuestInfo()
        isNewUser = true
      } catch { }

      if (isNewUser) {
        util.showLoading()

        await newcustomerMixin.getUserNewCustomerRight(this, fromType)
        // 固定入口曝光
        if (this.data.newGuestGiftInfo.IsHaveRights) {
          util.ubtTrace('s_trn_c_trace_10320640935', {
            exposureType: "normal",
            bizKey: 'newgiftFixedPositionExposure',
            login: 1,
          })
        }

        if (this.data.newCustomerRightInfo.IsHaveRights && this.data.newCustomerRightInfo.RightList.length) {
          util.hideLoading()

          if (this.data.newCustomerRightInfo.RightType === 1) {
            this.setData({
              showType: 'newGuestRightPop',
            })
            util.ubtTrace('s_trn_c_trace_10320640935', {
              exposureType: "popup",
              bizKey: 'newgiftPopupExposure',
              visitSource: {
                'gongzhonghao_zhubanpost': 1,
                'wecom_push': 2,
                'wecom_apptask': 3,
                'gongzhonghaoPush': 7,
                'qiweiPush': 8,
              }[this.data.biSource || this.data.source],
            })

            if (isWecom) {
              util.ubtTrace('s_trn_c_trace_10320640935', {
                bizKey: 'newGiftExposure',
                exposureType: 'Popup',
                visitSource: {
                  'wecom_apphome': 4,
                  'wecom_apphome1': 5,
                }[this.data.source],
              })
            }

          } else {
            this.setData({
              showType: '',
            })
            util.showToast("对不起，暂无领取资格", "none")
          }

          return
        }

        return newcustomerMixin.checkCanReceiveNewCustomerRight()
          .then(() => newcustomerMixin.getNewCustomerRights(this, fromType))
          .then(() => {
            const { AbValue } = this.data.newCustomerRightInfo
            let rightType = AbValue == 'a' ? 0 : 1

            return newcustomerMixin.receiveNewCustomerRight(fromType, rightType, {OpenId: cwx.cwx_mkt.openid || ''})
          })
          .then(res => {
            if (res?.IsReceiveSuccess) {
              const list = res.RightInfo.DescList
              const amount = list.reduce((sum, v) => sum += v.Price, 0)
              // 代金券，type为2
              const cashList =  list === null ? [] : list.filter( e => e.Type === 2)
              // 权益，type为1
              const rightList = list === null ? [] : list.filter( e => e.Type === 1)
              const rightListAmount = rightList.reduce((sum, v) => sum += v.Price, 0)
              const data = {
                ...res,
                priceAmount: amount,
                RightInfoType2: {
                  list: cashList
                },
                RightInfoType1: {
                  list: rightList,
                  price: rightListAmount
                }
              }
              this.setData({ newGuestReceivedPopData: data, showType: 'newGuestRightPop' })
              util.ubtTrace('s_trn_c_trace_10320640935', {
                exposureType: "popup",
                bizKey: 'newgiftPopupExposure',
                visitSource: {
                  'gongzhonghao_zhubanpost': 1,
                  'wecom_push': 2,
                  'wecom_apptask': 3,
                  'gongzhonghaoPush': 7,
                  'qiweiPush': 8,
                }[this.data.biSource || this.data.source],
              })
            }
          })
          .then(() => {
            if (this.data.newCustomerRightInfo.RightList.length) {
              util.hideLoading()
              util.showToast('恭喜你，领取成功', 'none')
              this.setData({
                showType: 'newGuestRightPop',
              })

            }
          })
          .catch(() => {
            util.hideLoading()
            util.showToast('抱歉，仅限火车票新用户领取', 'none')
            this.setData({
              showType: '',
            })
          })
      } else if (isWecom) {
        // 老客3元券领取
        this.sourceType = 5
        this.showType = 'pushCouponType'
        this.setData({
          showType: 'pushCouponType',
        })

        await this.getPushCouponAndReceive()
      } else {
        util.hideLoading()
        util.showToast('抱歉，仅限火车票新用户领取', 'none')
        this.setData({
          showType: '',
        })
      }
    }
    if (cwx.user.isLogin()) {
      receiveHandler()
    } else {
      this.myAuthorize({
        success: () => {
          receiveHandler()
        },
        reject: () => {
          util.showToast('需授权登录后才能领取哦', 'none')
        },
      })
    }
  },

  onClickGoToAgreement1() {
    util.jumpToUrl('https://m.ctrip.com/webapp/abouth5/common/agreement?type=1&back=true')
  },
  onClickGoToAgreement2() {
    util.jumpToUrl('https://m.ctrip.com/webapp/abouth5/common/agreement?type=2&back=true')
  },
  onClickGoToNewGuestActivity(e) {
    const { jumpurl } = e.currentTarget.dataset
    this.navigateTo({
      url:  jumpurl,
    })
  },
  async initQconfgData() {
    const data = await this.getQconfigData();
    if (!data) return
    this.initKingkongStatus(data)
    this.setData({
      abroadSwitchFlag : data.abroadSwitchFlag
    })
    if (!data.abroadSwitchFlag) {
      this.setData({
        activeTabbarIndex: 0
      })
    } else {
      if (this.abroadFlag && !this.hasShowFromAbroadURL) {
        this.hasShowFromAbroadURL = true
        this.setData({
          activeTabbarIndex: 1,
        })
        this.sendOverseasTrainPV()
        this.setAbroadOutParams(this.abroadOutParams)
      }
    }
  },
  // qconfig配置获取 在线换座气泡配置
  async getQconfigData() {
    try {
      const { resultCode, resultMessage, configs } = await getConfigByKeysPromise({
        keys: ["ctrip-mini-index"],
      })
      console.log("config", configs)
      if (resultCode !== 1) throw resultMessage
      const data = configs.find(config=>config.key === 'ctrip-mini-index')?.data
      return data
    } catch (e) {
      console.log("获取qconfig失败", e)
    }
    
  },
  initKingkongStatus(data) {
    const { toolsConfig, otherTools = [], isToolsShow } = data
    const kingkong = TrainActStore.getAttr('kingkong')

    if (!kingkong) {
      this.setData({ isToolsShow, toolsConfig: toolsConfig, otherTools: otherTools.slice(0, 4), allOtherTools: otherTools })
    } else {
      const _toolsConfig = toolsConfig.map(v => {
        const isActived = kingkong.filter(k => k.split('-')[0] === v.key)
        if (isActived) {
          const isPointed = isActived.some(k => k.split('-')[1] === 'point')
          const isTag = isActived.find(k => k.split('-')[1] === 'tag')?.split('-')[2]

          return { ...v, point: !isPointed && v.point, tag: (isTag !== v.tag) && v.tag }
        }

        return v
      })
      const _otherTools = otherTools.map(v => {
        const isActived = kingkong.filter(k => k.split('-')[0] === v.key)
        if (isActived) {
          const isPointed = isActived.some(k => k.split('-')[1] === 'point')
          const isTag = isActived.find(k => k.split('-')[1] === 'tag')?.split('-')[2]

          return { ...v, point: !isPointed && v.point, tag: (isTag !== v.tag) && v.tag }
        }

        return v
      })

      this.setData({ isToolsShow, toolsConfig: _toolsConfig, otherTools: _otherTools.slice(0, 4), allOtherTools: _otherTools })
    }

    // 宫格埋点曝光
    if (isToolsShow && toolsConfig.length) {
      toolsConfig.forEach(t => util.ubtFuxiTrace("TCWFrontPage_QaModule_exposure", { PageId: this.pageId, Type: t.name }))
    }
    if (isToolsShow && otherTools.length) {
      otherTools.forEach(t => util.ubtFuxiTrace("TCWFrontPage_QaModule_exposure", { PageId: this.pageId, Type: t.name }))
    }
  },
  onClickToggleKingkong() {
    const {isKingkongExpand, allOtherTools} = this.data
    if (!isKingkongExpand) {
      this.setData({ isKingkongExpand: true, otherTools: allOtherTools })
    } else {
      this.setData({ isKingkongExpand: false, otherTools: allOtherTools.slice(0, 4) })
    }
  },
  // 工具箱入口点击
  onClickTools(e) {
    const { index } = e.currentTarget.dataset
    const curr = this.data.toolsConfig[index]
    const mobile = TrainBookStore.getAttr("mobile") || ''
    const bind12306 = TrainBookStore.getAttr("bind12306")
    const kingkong = TrainActStore.getAttr('kingkong') || []
    if (curr.point) {
      kingkong.push(`${curr.key}-point`)
    }
    if (curr.tag) {
      kingkong.push(`${curr.key}-tag-${curr.tag}`)
    }

    TrainActStore.setAttr('kingkong', kingkong)

    // 点击埋点
    util.ubtFuxiTrace('TCWFrontPage_QaModule_click', { PageId: this.pageId, Type: curr.name })

    if (curr.key === 'online') {
      util.ubtFuxiTrace('230985', { PageId: this.pageId })
      const _url = `${curr.link}&userName12306=${bind12306?.name || ''}&hideShare=true`
      const url = `/pages/trainActivity/twebview/index?url=${encodeURIComponent(_url)}`

      return this.navigateTo({ url })
    }

    if (curr.key === 'ticketquery') {
      const _url = `${curr.link}&userName12306=${bind12306?.name || ''}&mobile=${mobile}&hideShare=true`
      const url = `/pages/trainActivity/twebview/index?url=${encodeURIComponent(_url)}`

      return this.navigateTo({ url })
    }
    curr.link = curr.link.replace(/\$\{([a-zA-Z]+)\}/g, (...args) => {
      switch(args[0]) {
        case "${from}": 
          return this.data.dStation
        case "${to}" :
          return this.data.aStation
        case "${date}":
          return this.data.selectDate
      }
    })
    return this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(curr.link)}`,
    })
  },
  async lostUsersPopHandler() {
    if (this.data.showType) {
      return
    }

    let lostUserScene = this.lostUserScene || 'TS-06'
    if (!cwx.user.isLogin()) {
      if ('TS-06' === lostUserScene) {
        return
      } else {
        await new Promise((resolve, reject) => {
          return cwx.user.login({
            callback(res) {
              if (res.ReturnCode == 0) {
                resolve()
              } else {
                reject()
              }
            },
          })
        })
      }
    }

    const payload = {
      Channel: 'wx',
      SceneId: lostUserScene,
    }

    const receiveRes = await receiveLossGift(payload)

    if (receiveRes.RetCode !== 1 || !receiveRes.IsReceiveSuccess) {
      if (lostUserScene === 'TS-06') {
        return
      } else {
        return util.showToast( receiveRes.RetMessage || '领取失败', 'none')
      }
    }

    this.lostUsersSwiperHandler() // 流失用户固定展示轮播
    const res = await getLossGiftDetail(payload)

    if (res.RetCode !== 1 || res.AlertGiftList?.length < 1 || !res.AlertTitle) {
      return
    }

    const storageKey = `LOSTUSERPOP-${cwx.cwx_mkt?.openid || ''}`
    const expireDate = TrainActStore.getAttr(storageKey)
    if (new cDate().getTime() < new cDate(expireDate).getTime()) {
      console.log('lostuserpop storage', new cDate().getTime(),new cDate(expireDate).getTime(), new cDate().getTime() < new cDate(expireDate).getTime())

      return
    } else {
      util.ubtTrace('s_trn_c_trace_10320640935', {
        bizKey: 'lostuserPopupExposure',
        scene: lostUserScene,
        userGroup: res.CrowdId,
      })

      TrainActStore.setAttr(storageKey, new cDate().addDay(30).format('Y-m-d'))
      if (lostUserScene === 'TS-06') {
        const abValue = { key: '231011_TRN_XCXTC', name: 'lostPopProType' }
        const getAbAsync = ({ key, name }) => new Promise(resolve => {
          cwx.ABTestingManager.valueForKeyAsync(key, value => resolve({ [name]: value }))
        })
        const { lostPopProType } = (await getAbAsync(abValue)) || {}
        if (lostPopProType === 'B') {
          this.setData({ lostUserPopProType: true })
        }
      }
      this.setData({
        showType: 'lostUserPop',
        lostUserPopDetail: res,
      })
    }
  },
  async lostUsersSwiperHandler() {
    const lostUserScene = null
    const payload = {
      Channel: 'wx',
      SceneId: lostUserScene,
    }

    const res = await getLossGiftDetail(payload)
    // res = {"ResponseStatus":null,"RetCode":1,"RetMessage":null,"RuleUrl":"https://m.ctrip.com/webapp/train/activity/static/ctrip/ctrip-common-config-page.html?configId=Bi2ioqX5gN","EntranceTitle":"https://images3.c-ctrip.com/train/2023-3/zengzhang/6yue/liushi/wenan2.png","EntranceSubTitle":"1天后失效","AlertTitle":"惊喜礼包","AlertSubTitle":"老朋友,久违了送你一份见面礼","AlertTip":"*红包发放和红包金额具有随机性","EntranceTag":"老用户专属","ButtonName":"我知道了","AlertGiftList":[{"Price":"3","Unit":"元","Title":"火车票3元返现券","SubTitle":"价值3元","JumpUrl":null,"ButtonName":null,"IsSend":false,"Icon":"https://images3.c-ctrip.com/train/2023-3/zengzhang/6yue/liushi/ic_yhq.png","Tag":null,"Inventory":0},{"Price":"20","Unit":"元","Title":"高速抢票权益","SubTitle":"抢票直升高速","JumpUrl":null,"ButtonName":null,"IsSend":true,"Icon":"https://images3.c-ctrip.com/train/2023-3/zengzhang/6yue/liushi/ic_jiasu.png","Tag":null,"Inventory":999},{"Price":"10","Unit":"元","Title":"指定靠窗权益","SubTitle":"抢票靠窗","JumpUrl":null,"ButtonName":null,"IsSend":true,"Icon":"https://images3.c-ctrip.com/train/2023-3/zengzhang/6yue/liushi/ic_huanzuo.png","Tag":null,"Inventory":999}],"CrowdId":3,"EntranceGiftList":[{"Price":"3","Unit":"元","Title":"价值3元","SubTitle":"3元套餐券","JumpUrl":null,"ButtonName":null,"IsSend":false,"Icon":"https://images3.c-ctrip.com/train/2023-3/zengzhang/6yue/liushi/ic_yhq.png","Tag":"已抢光","Inventory":0},{"Price":"20","Unit":"元","Title":"高速抢票","SubTitle":"直达高速","JumpUrl":null,"ButtonName":null,"IsSend":true,"Icon":"https://images3.c-ctrip.com/train/2023-3/zengzhang/6yue/liushi/ic_jiasu.png","Tag":null,"Inventory":999},{"Price":"10","Unit":"元","Title":"指定靠窗","SubTitle":"抢到靠窗","JumpUrl":null,"ButtonName":null,"IsSend":true,"Icon":"https://images3.c-ctrip.com/train/2023-3/zengzhang/6yue/liushi/ic_huanzuo.png","Tag":null,"Inventory":999}],"Price":"33"}
    // console.log(res, 11111)
    if (res.RetCode !== 1 || res.EntranceGiftList?.length < 1 || !res.EntranceTitle) {
      return
    }


    // res.EntranceGiftList.push({})
    // res.EntranceGiftList.push({})
    // res.EntranceGiftList[1].Tag = '已抢光'
    if (res.RetCode === 1 && res.EntranceGiftList?.length > 0) {
      util.ubtTrace('s_trn_c_trace_10320640935', {
        bizKey: 'lostuserFixedExposure',
        scene: lostUserScene,
        userGroup: res.CrowdId,
      })

      this.setData({
        showLostUserSwiper: true,
        lostUserSwiperDetail: res,
      })
    }
  },
  async onClickLosrUserSubscribeBtn() {
    const templist = [
      { id: "VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q", FromType: 1, ActivityCode: 'LostUserSubscribe'}, //  奖励领取提醒
      { id: "F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY", FromType: 1, ActivityCode: 'LostUserSubscribe'} //  火车票新客礼包过期提醒
    ]

    const statusList = await subscribeMixin.checkSubscribeStatus(templist)
    console.log('订阅状态=====', statusList)
    await this.handleSubIds(['VpOfhossUQuSqtd9nISbYtxvVsM3z-45ZgFF3PU0a9Q','F3HaACHAEbOpFkpTQIr65zjhjlCX3hY4IMqPLePVIpY'], statusList)
    subscribeMixin.requestSubscribe(statusList, { OpenID: cwx.cwx_mkt?.openid || "" })
      .then(({ errMsg }) => {
        this.setData({subscribeGuideFlag: false, showType: '' })
        if (errMsg) {
          util.ubtTrace('s_trn_c_trace_10320640935', {
            bizKey: 'lostuserPopupClick',
            scene: this.lostUserScene || 'TS-06',
            userGroup: this.data.lostUserPopDetail.CrowdId,
            is_sub: false,
          })
          console.error(errMsg)

          return
        }

        util.ubtTrace('s_trn_c_trace_10320640935', {
          bizKey: 'lostuserPopupClick',
          scene: this.lostUserScene || 'TS-06',
          userGroup: this.data.lostUserPopDetail.CrowdId,
          is_sub: true,
        })

      }).catch(e => this.setData({subscribeGuideFlag: false}))

  },
  onClickLostUserRuleBtn(e) {
    const { url } = e.currentTarget.dataset
    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`,
    })
  },
  onClickOtherTools(e) {
    const { index } = e.currentTarget.dataset
    const curr = this.data.allOtherTools[index]
    const kingkong = TrainActStore.getAttr('kingkong') || []

    if (curr.key === 'more') return

    if (curr.point) {
      kingkong.push(`${curr.key}-point`)
    }
    if (curr.tag) {
      kingkong.push(`${curr.key}-tag-${curr.tag}`)
    }

    TrainActStore.setAttr('kingkong', kingkong)
    util.ubtFuxiTrace('TCWFrontPage_QaModule_click', { PageId: this.pageId, Type: curr.name })

    return this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(curr.link)}`,
    })
  },
  onClickGoNewGuestRule() {
    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(this.data.newGuestGiftInfo.JumpUrl)}`,
    })
  },
  async handleSubIds(temArr,statusList){
    const needSubList = statusList.filter((v) => !v.status)
    if (needSubList.length > 0) {
      const subIds = await subscribeMixin.getNotLongSubIds(temArr)
      const showIds = needSubList.filter(item => subIds.includes(item.id))
      if (showIds.length > 0) {
        const video = tempVideoArr.find(item => item.id === showIds[0].id)?.videoSrc
        this.setData({subscribeGuideFlag: true, subVideoSource: video})
      }
    }
  },
  async onClickReceiveNewGuestBtn() {
    util.ubtTrace('c_trn_c_10320640935', {
      bizKey: 'limitTimeTake',
    })

    const that = this
    async function receive() {
      await newcustomerMixin.getUserNewCustomerRight(that, 20)
      // 已领取过 展示
      if (that.data.newCustomerRightInfo.IsHaveRights) {
        return util.showToast('您已领取过奖励，快去购票吧', 'none')
      }

      let isNewUser = false
      try {
        await newcustomerMixin.trainGetNewGuestInfo()
        isNewUser = true
      } catch { }

      if (!isNewUser) {
        return util.showToast('您已是火车票老用户，无法领取新客特权哦', 'none')
      }

      try {
        await newcustomerMixin.checkCanReceiveNewCustomerRight()
        const receiveData = await newcustomerMixin.receiveNewCustomerRight(20)
        await newcustomerMixin.getUserNewCustomerRight(that, 20)
        const list = receiveData.RightInfo.DescList
        const amount = list.reduce((sum, v) => sum += v.Price, 0)
        // 代金券，type为2
        const cashList =  list === null ? [] : list.filter( e => e.Type === 2)
        // 权益，type为1
        const rightList = list === null ? [] : list.filter( e => e.Type === 1)
        const rightListAmount = rightList.reduce((sum, v) => sum += v.Price, 0)
        const data = {
          ...receiveData,
          priceAmount: amount,
          RightInfoType2: {
            list: cashList
          },
          RightInfoType1: {
            list: rightList,
            price: rightListAmount
          }
        }

        that.setData({ newGuestReceivedPopData: data, showType: 'newGuestRightPop' })
      } catch (e) {
        console.error(e, 111)
        util.showToast('新客特权领取失败，不符合资格', 'none')
      }
    }

    if (!this.isLogin) {
      this.myAuthorize({
        success: () => {
          this.setData({
            isLogin: true,
            stopAutoReceive: true,
            newGuestGiftInfo: {
              ...this.data.newGuestGiftInfo,
              needShow: false,
            },
          })

          receive()
        },
        reject: () => {

          util.showToast('需授权登录后才能领取哦', 'none')
        },
      })
    } else {
      receive()
    }

  },
  onClickPassengerChoice(e) {
    this.setData({
      passengerChoiceVisible: true,
      overseaPassengerInfo: e.detail.passengerInfo
    })
  },
  onClosePassengerChoice() {
    this.setData({
      passengerChoiceVisible: false
    })
  },
  onConfirmChoosePassenger(e) {
    this.setData({
      passengerChoiceVisible: false,
      overseaPassengerInfo: e.detail.passengerInfo
    })
  },
  // 8.50 新客礼包 已登录新客默发
  // async versionBNewCustomerPopHandler() {
  //     const rightType = 1
  //     const fromType = 1

  // await newcustomerMixin.getUserNewCustomerRight(this, fromType)

  // if (this.data.newCustomerRightInfo.IsHaveRights && this.data.newCustomerRightInfo.RightList.length) {
  //     this.setData({
  //         showType: 'newGuestRightPop'
  //     })
  //     util.hideLoading()
  //     return
  // }

  //     newcustomerMixin.checkCanReceiveNewCustomerRight()
  //     .then(() => newcustomerMixin.getNewCustomerRights(this, fromType))
  //     .then(() => newcustomerMixin.receiveNewCustomerRight(fromType, rightType))
  //     .then(() => {
  //             util.hideLoading()
  //             util.showToast('领取成功！', 'none')
  //             this.setData({
  //                 showType: 'newGuestRightPop'
  //             })
  //         }).catch(() => {
  //             util.hideLoading()
  //         })
  // },
}

TPage(page)

const historyPairsStoreKey = "historyPairs"
function addHistoryPair(val) {
  if (!val) {
    return
  }
  const list = getHistoryPair()
  if (list.includes(val)) {
    return
  } else {
    list.unshift(val)
  }
  if (list.length > 3) {
    list.splice(list.length - 1)
  }
  setHistoryPair(list)
}
function setHistoryPair(list = []) {
  TrainStationStore.setAttr(historyPairsStoreKey, list)
}

/**
 * 获取最近搜索过的出发到达站
 * @returns {String[]}
 */
function getHistoryPair() {
  return TrainStationStore.getAttr(historyPairsStoreKey) || []
}

function getAllStations() {
  const mainCityList = TrainStationStore.getAttr('cityMainList') || {}
  let allStations = []
  for (let key in mainCityList) {
    allStations = allStations.concat(mainCityList[key] || [])
  }

  return allStations
}

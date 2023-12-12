import create from '../utils/create';
import { cwx, __global } from '../../../../cwx/cwx';
import store from '../store';
import util from '../../common/util';
import {
  createRandomAccount,
  createRandomPassword,
} from '../../common/createRandomAccount';
import cDate from '../../common/cDate';
import commonApi from '../../common/common';
import { TrainActStore } from '../../common/store';
import strideTrain from '../../common/components/strideTrain/strideTrain';
import hotelMixin from '../components/hotel/hotel';
import carMixin from '../components/car/car';
import freeOrderMixin from '../components/FreeOrder/freeorder';
import turnToGrabOrderMixin from '../components/TurnToGrabOrder/turnToGrabOrder';
import rewardMixin from '../components/reward/reward';
import cashbackMixin from '../components/cashback/cashback';
import intelligentMixin from '../components/IntelligentSegmentOrderDetail/intelligentSegmentOrderDetail';
import newIntelligentMixin from '../components/intelligentSegment/intelligentSegment';
import couponModalMixin from '../components/CouponModal/couponmodal';
import { subscribeMixin } from '../../common/components/Subscribe/Subscribe';
import bookNotice from '../../common/components/book-notice/book-notice';
import { getThenByTicketInfo } from '../../common/components/thenByTicket/thenByTicket';
import secondTicketMixin from '../components/secondTicketBox/secondTicketBox';

import { shared } from '../../common/trainConfig';
import {
  OrderCancelModel,
  RefundTicketModel,
  getOrderHBInfoModel,
  PrePayActionOutModel,
  checkPrePayOutModel,
  getPrePayInfoForH5Model,
  TrainOrderProductDetail,
  TrainChangeOrderOuter,
  ChatScence,
  GetTicketEntranceModel,
  createModel,
  GetVerifyOrderPayTypeInfoModel,
  TrainTicketReturnRuleAsyncsModel,
  GetOrderCashBackCouponInfoModel,
  TrainFaceAuthenticationRiskModel,
  CheckFaceSuccessNotifyModel,
  SubscribeMessageTemplateModel,
  QuerySubscribeMessageStatusModel,
  TrainStationModel,
  getFollowPublicAccountInfoModel,
  OrderDetailModel,
  TrainPreEleCounterTicketArtificialReturnModel,
  TrainPreEleCounterTicketArtificialReschedule,
  GetEncodeTicketSharingParamModel,
  ApplyProductClaimModel,
  GetClaimPriceListModel,
  JoinGroupEntranceModel,
  GetActivityCouponInfoModel,
  ActivitySendCouponModel,
  ChangeTicketOrderDetailModel,
  RecommendRescheduleGrabTicketModel,
  GetExternalTaskInfo,
  getHtmlConfigByKeysModel,
  GetWeChatGroupInfo,
  ReceiveExternalTask,
  GetTrainCrossTaskDetailFront,
  combineServiceProductDetailModel,
  GetUserAccountInfo,
  GetOrderPointPayNotify,
  GetBindAccountInfoModel,
} from '../../common/model';
import {
  saveUserFormID,
  setConfigSwitchAsyncPromise,
  RequestSignPay,
  GetOnTrainThenByTicketSoluPromise,
  ConfigInfoPromise,
  PreHoldSeatResultPromise,
  getConfigInfoJSON,
  GetRegister12306UserInfoPromise,
  CheckAccountCanLogOutV2Promise,
  registerUserAccountInfoPromise,
  login12306,
  AddOrderAccountInfoPromise,
  getUserBindedPhoneNumber,
  getConfigByKeysPromise,
  handleChildTicket,
} from '../../common/common';

// const env = __global.env

// let host = 'https://m.ctrip.com/'
// if (env == 'fat') {
//     host = 'https://m.fat20.qa.nt.ctripcorp.com/'
// } else if (env == 'uat') {
//     host = 'https://m.ctrip.uat.qa.nt.ctripcorp.com/'
// }

const getBargainInfo = util.promisifyModel(
  createModel({ channel: 13534, path: 'GetBargainInfoInOrderDetail' })
);
const getRewardInfo = util.promisifyModel(
  createModel({ channel: 14666, path: 'RewardSend' })
);
const getUserAccountInfo = util.promisifyModel(GetUserAccountInfo);
const getOrderPointPayNotify = util.promisifyModel(GetOrderPointPayNotify);

const defaultCountdownObj = {
  hour: '00',
  min: '00',
  second: '00',
  txt: '砍价已结束',
};

const defaultOrderFlags = {
  countdownOrderTips: false, // 倒计时
  activity: false, // 活动图片
  altInfo: false, // 非抢票状态下的备选信息
  isShowBuyAgain: false,
  isShowRobSame: false,
  isShowBuyReturn: false,
  isTimeOut: false, // 是否订单支付超时
  hasReturned: false, // 是否退票vc0 ----------------------,-0
};

function checkHongkong(orderInfo) {
  let hasHongkong = false;
  if (!orderInfo.TicketInfos?.length) return false;
  orderInfo.TicketInfos.forEach((ticket) => {
    if (hasHongkong) {
      return;
    }
    if (
      ticket.DepartStation.indexOf('香港') > -1 ||
      ticket.ArriveStation.indexOf('香港') > -1
    ) {
      hasHongkong = true;
    }
  });

  return hasHongkong;
}
create(store, {
  checkPerformance: true,
  pageId: '10650037941',
  mixins: [
    strideTrain,
    hotelMixin,
    rewardMixin,
    cashbackMixin,
    carMixin,
    freeOrderMixin,
    turnToGrabOrderMixin,
    newIntelligentMixin,
    intelligentMixin,
    couponModalMixin,
    bookNotice,
    secondTicketMixin,
  ],
  //
  data: {
    orderInfo: null,
    isWorkTime: null,
    ZLTopMessage: '',
    bookTips: '',
    textConfigAbout12306: [
      {
        title: '铁路局规定出行必须实名制，请立即登录/注册12306账号完成实名',
        btn: '登录/注册',
        popTextTop: '根据铁路局规定',
        popTextMid:
          '铁路出行必须实名制，请登录12306账号完成实名操作，若您无账号请立即注册',
        popTextBottom: '实名出行后更安心，还可免费兑换车票',
      },
      {
        title: '注册12306畅行会员，享受火车票积分累计、免费兑换车票等优惠',
        btn: '立即注册',
        popTextTop: '注册12306畅行会员',
        popTextMid:
          '您尚未注册12306畅行会员，暂无法享受火车票积分累计、免费兑换车票等优惠',
        popTextBottom: '',
      },
      {
        title: '激活12306畅行会员，享受火车票积分累计、免费兑换车票等优惠',
        btn: '激活攻略',
        popTextTop: '激活12306畅行会员',
        popTextMid:
          '您尚未激活12306畅行会员，暂无法享受火车票积分累计、免费车票等优惠',
        popTextBottom: '',
      },
    ],
    reschedulePassengerType: ['成人票', '儿童票', '学生票'],
    showInsurancePrompt: '',
    showType: '',
    popType: '',
    showMask: '',
    orderBannerImg: '',
    loopCount: 0, // 轮询结果次数
    loopCountCheck: 0, // 轮询次数
    preHoldPercent: 0,
    firstFlag: true,
    isLandingView: true,
    isIOS: false,
    isAndroid: false,
    showExpansionList: false, // 是否展示附加产品
    daigoushareswitch: false,
    refundInfo: {},
    entranceTipShow: false,
    isOpenPrice: false,
    hasShowPop: [],
    canAddMiniapp: util.canAddMiniapp(),
    preholdSeatId: null,
    NoSeatModal: null,
    bargainInfo: null,
    HBFullModal: {},
    HBPayModal: {},
    HBStatus: '', // 是否候补票
    HBHandle: false, // 候补票开关
    hasCollected: false, // 是否收藏过小程序
    collectFlag: false,
    insurancePromptEntrance: {
      // 代购详情售卖保险
      isShow: false,
      insuranceInfo: {},
      saleProductEntranceInfo: {},
    },
    isTrainApp: shared.isTrainApp,
    isCtripApp: shared.isCtripApp,
    isIphoneX: util.isIphoneX(),
    configs: null,
    rewardInfo: null,
    ...defaultOrderFlags,
    cashbackInfo: null,
    // 引导用户注册12306 信息
    register12306UserInfo: {},
    openRegister12306UserInfoConfig: false,
    protocalToogle: false,
    refreshTimer: '',
    subscribeFlag: true,
    bannerItemList: [],
    arrivedCity: [],
    arrivedStation: [],
    isShowFreeOrder: false,
    freeOrderIconConfig: {
      open: false,
      url: '',
    },
    freeOrderModalConfig: {
      open: false,
      url: '',
    },
    isShareEntranceOpen: false,
    encodeTicketInfo: '',
    intelligentSegmentDisplay: false, // 旧智能分段
    intelligentDisplay: false, // 新智能分段
    isMergePay: false, // 合并支付订单
    intelligentInfo: null, // 新智能分段用的票数据
    tripAxis: null, // 中转和跨站的行程轴
    isOriginOrderFromSecondTrip: false,
    claimDisplay: null,
    isShowCouponDialog: false,
    userBindedPhoneNumber: '',
    rescheduleShareInfo: {},
    scanFaceNeedCheck: false,
    protocalToogle: false,
    rescGrabShowInfo: null,
    isShowChangeSeat: false,
    OnlineChangeCardInfo: null,
    saveTaskInfo: null, // 省钱Or返现 任务信息
    saveTaskTips: '', //省钱任务倒计时
    saveRuleConfig: null, //省钱任务规则配置
    showSaveRuleModal: false, //省钱任务规则浮层
    wechatGroupData: {}, // 加群接口数据
    isShowSaveTaskPop: false, // 返现任务领取弹窗
    saveTaskPopInfo: null, // 返现任务领取弹窗信息
    saveTaskGuidePopInfo: null, // 返现任务引导弹窗信息
    isShowGuideSaveTaskPop: false, // 返现任务引导弹窗
    showChildTip: false, // 儿童申报提示
    omnipotentInfo: null, // 全能抢票浮层信息
    expansionBtn: false, // 附加产品是否有申领按钮样式
    isIssueTicketSuccess: false, //是否出票成功
    freeDeclareChildren: [], //免费申报儿童列表
    orderMessageInfo: null, // 关怀金的顶部提示
    combiJourneyInfo: null, //组合座弹窗信息
    showPayPwdInput: false, //是否展示密码输入层
    payFocus: false, //输入密码文本框焦点
    pwdVal: '', //输入的密码
    isPointPay: false, //是否为积分支付
    pointUseTotal: '', //账户积分余额
    shopPoint: '', //本次消费积分
    pointCard: '', //积分提醒卡片
    effectConfig: null, // 详情页的配置 可扩展（目前只有功能区入口
    newGuestPopCount: 3,
    multipleBookingAndGrabSegmentationInfo: null, //买加抢第二程信息
  },
  onLoad: async function (options) {
    console.log('====options====', options);
    // process 携带参数指定进入页面的操作
    let { orderInfo, showType, oid, mark, isNoSeat } = this.store.data;
    this.oid = oid;
    if (options?.from === 'tinyGrabDetail') {
      await this.loadData(oid);
    }
    await this.checkMergePay(orderInfo); // 新旧智能分段流程都在这
    // await this.intelligenceRecommendEntranceHandler(orderInfo)
    this.tripConflictionHandler(orderInfo, options.params);
    this.updateDeclareChildren(orderInfo);
    this.getCombiJourneyInfo(orderInfo); // 获取组合座行程轴信息
    this.getThenByTicketJourney(orderInfo); // 上车补/跨站
    this.setData({
      orderInfo,
      isIOS: util.isIOS(),
      isAndroid: util.isAndroid(),
      mark,
      isNoSeat,
    });

    this.setPointTips(orderInfo);

    if (options.oid && options.from === 'zhiduoxing') {
      const res = await this.getOrderInfoByOid(options.oid);

      this.setData({
        orderInfo: res.OrderInfo,
        optionsOid: options.oid,
        from: 'zhiduoxing',
      });

      (this.optionsOid = options.oid), (orderInfo = res.OrderInfo);
      this.from = 'zhiduoxing';
    }

    // 改签抢入口
    this.showRescheduleGrabEntrance(orderInfo);

    // 智多星入口
    if (orderInfo.IsZDXRecommendOrder) {
      orderInfo.IsPreHoldSeat = true;
    }

    getConfigInfoJSON('ctrip-intelligent-recommend').then((data) => {
      if (
        data?.isOpen &&
        orderInfo.RelationOrderInfo &&
        options.from !== 'zhiduoxing'
      ) {
        let url = `https://m.ctrip.com/webapp/train/zhiduoxing?oid=${this.store.data.oid}&relationOid=${orderInfo.RelationOrderInfo.RelationOrderNumber}&needLogin=true`;

        // 学生优惠区间错误或优惠次数用完
        if (orderInfo.RelationOrderInfo?.SceneType === 3) {
          url = url + '&zhiduoxingSceneType=3';
        }
        cwx.redirectTo({
          url: `../../webview/webview?url=${encodeURIComponent(
            url
          )}&data=${JSON.stringify({ needLogin: true })}`,
        });
      }
    });
    // 对改签抢订单进行处理
    this.handleRescheduleGrabOrder(orderInfo);
    // 省钱任务返现入口
    this.showSaveTaskEntrance(orderInfo);
    //获取轮播图数据
    this.getBannerItemList();
    // 获取到达站点和城市
    this.getArrivedStationAndCity(orderInfo);
    // 获取关注公众号免单配置
    this.getFreeOrderConfig();
    this.showType = showType;
    if (
      TrainActStore.getAttr('clickCloseCollect') ||
      TrainActStore.getAttr('HASCOLLECTED')
    ) {
      this.setData({
        hasCollected: true,
      });
    }
    if (
      TrainActStore.getAttr('showChildTip')?.key !== this.data.orderInfo.OrderId
    ) {
      TrainActStore.setAttr('showChildTip', {
        key: this.data.orderInfo.OrderId,
      });
      util.ubtTrace('TCWDetail_ChildBubble_exposure', {
        PageId: '10650037941',
        orderId: this.data.orderInfo.OrderId,
      });
      this.setData({ showChildTip: true });
    }
    this.onLoadSync(orderInfo);
    this.onLoadAsync(orderInfo);
    this.setPopTypeDeps(orderInfo).then(() => {
      this.handlePopType(showType, orderInfo);
    });

    if (orderInfo.OrderStatusBarInfo?.StatusName === '待支付') {
      try {
        let fastPayFailInfo = (orderInfo.ExtendList || []).filter(
          (item) => item.Key === 'FastPayFailInfo'
        );
        let info = JSON.parse(fastPayFailInfo);
        if (info.scene === 1 || info.scene === 2) {
          util.ubtTrace('s_trn_c_10650037939', {
            exposureType: 'pv',
            bizKey: 'pageviewExposure',
            state: info.scene,
          });
        }
      } catch (err) {
        console.log(err, 'pageviewExposure');
      }

      util.ubtTrace('s_trn_c_trace_10650037941', {
        exposureType: 'normal',
        bizKey: 'toPayExposure',
        orderId: oid,
      });
    }
    orderInfo.OrderStatusBarInfo?.StatusName === '占座失败' &&
      options.from !== 'zhiduoxing' &&
      this.zhiduoxingEntranceTimer(this.oid);

    // 购票中引导订阅/ 购票中10s后更新进度
    if (orderInfo.OrderStatus === 5 || orderInfo.OrderStatus === 4) {
      this.guideSubscribeResult(orderInfo.OrderId);
      this.autoRefreshDefer(orderInfo);
    }

    // 订单详情 乘客信息未核验模块
    if (orderInfo?.TopMessageInfo?.MessageList?.length) {
      const isUncheck = orderInfo?.TopMessageInfo?.MessageList.some(
        (v) => v.MessageType == 3
      );
      isUncheck &&
        util.ubtTrace('s_trn_c_trace_10320640941', {
          exposureType: 'normal',
          bizKey: 'passengerVerification',
          orderId: oid,
        });
    }

    // 改签抢跳转后的自动操作
    this.enterAutoProcess(options);

    // 订单详情加群入口
    this.getWeChatGroupInfo();

    // 全能抢票
    this.getOmnipotentData();

    util.ubtTrace('TCWDetail_exposure', {
      PageId: '10650037941',
      channel: 'WX',
      Content: orderInfo.OrderStatusBarInfo.StatusName,
      orderId: orderInfo.OrderId,
      ExpoType: isNoSeat == 1 ? 1 : 0,
      IsCheapest: orderInfo.IsCanPointsPay ? 1 : 0,
    });
  },
  onPageScroll(e) {
    this.setData({
      hideIcon: e.scrollTop > 120,
    });
  },
  onShow() {
    // 重置全局改签flga，即从改签状态退出
    // console.log("onloadonload2",getCurrentPages());
    shared.isReschedule = false;
    if (this.data.firstFlag) {
      this.setData({
        firstFlag: false,
      });
    } else {
      this.loadData(this.store.data.oid);
      this.getBargainInfo(); // 离开页面清除了定时器 再次回到页面时需要再次设置定时器
    }
    // 获取用户关注公众号状态
    if (shared.isCtripApp) {
      this.getTrainWXUserState();
    }
  },
  onHide() {
    this.hideBackDrop();
  },
  onUnload() {
    clearInterval(this.zhiduoxingTimer);
    this.zhiduoxingTimer = null;
    if (!!this.store.data.needJump) {
      cwx.navigateTo({
        url: '/pages/train/index/index',
      });
    }
  },
  onLoadSync(orderInfo) {
    console.log('订单详情', orderInfo);
    this.loadDataUpdate(orderInfo);
    //设置非第一次进页面
    this.setData({
      isLandingView: false,
    });
    console.log('diff', Date.now() - this.store.data.begain);
  },
  // 异步方法
  onLoadAsync() {
    this.loadConfig();
    this.getBoardNoticeTitile();
    this.getBannerUrl();
    this.getHotelHandle();
    this.getHbHandle();
    this.getCashBackCouponInfo();
    this.getShareParams();
    this.getTeamupInfo();
    // 初始化酒店相关信息 没有主动选择日期case 这里的初始化只需要执行一次 并且是在为选择时间之前
    if (!this.data.hotelConfig.hasSelectedDate) {
      this.getHotelCityInfo(shared);
      this.initHotelTime(shared.orderinfos?.time);
    }
    const params = {
      OrderNumber: this.store.data.oid,
    };
    this.getHotelRecommendList(this.store.data.oid);

    console.log(
      this.data.hotelList,
      this.data.hotelConfig,
      'hotelListhotelList'
    );
    getOrderHBInfoModel(params, (res) => {
      if (res) {
        this.setData({
          HBStatus: Number(res.HBStatus),
        });
      }
      console.log(this.data.HBStatus);
      console.log('HB', res);
    });
    this.getClaimPriceListInfo();
  },

  setPointTips(orderInfo) {
    // 设置积分订单的提示信息
    const pointTip = orderInfo.ExtendList?.find(
      (v) => v.Key === 'PointOrder'
    )?.Value;
    if (pointTip) {
      this.setData({
        pointCard: pointTip,
      });
    }
  },

  onClickRescGrabDesc() {
    this.jumpToRescGrab(this.data.rescGrabShowInfo.DescJumpUrl);
  },
  async onClickRescGrab(e) {
    util.ubtTrace('c_trn_c_10650037941', {
      bizKey: 'rescheduleEntryClick',
      orderId: this.data.orderInfo.OrderId,
    });
    if (await this.checkHongkongResc()) {
      this.jumpToRescGrab(this.data.rescGrabShowInfo.JumpUrl);
    }
  },
  jumpToRescGrab(url) {
    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
        url + '&needLogin=true'
      )}`,
    });
  },
  checkHongkongResc() {
    return new Promise((resolve, reject) => {
      if (checkHongkong(this.store.data.orderInfo)) {
        util.showModal({
          m: `跨境车票改签后不可办理退票，您确认需要改签吗？`,
          showCancel: true,
          cancelText: '取消',
          confirmText: '确认改签',
          done: (modalRes) => {
            if (modalRes.cancel) {
              resolve(false);
            }
            resolve(true);
          },
        });
        return;
      }
      resolve(true);
    });
  },
  // 跳转投保须知
  onClickJumpToDesc(e) {
    const { Type = 0, DescUrl = '' } = e.currentTarget.dataset.item;
    if (Type === 1) {
      cwx.navigateTo({
        url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
          'https://m.ctrip.com/webapp/train/activity/static/ctrip/insuranceDetail/?productID=6551&titleType=2&pageId=10650052925&insurancePrice=30&terminal=1'
        )}`,
      });
      return;
    }
    if (DescUrl) {
      cwx.navigateTo({
        url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
          DescUrl
        )}`,
      });
      return;
    }
  },
  getShareParams() {
    const orderInfo = this.store.data.orderInfo; // 订单信息
    const passengerInfo = []; // 乘客信息
    let shareTicketInfo = {};
    // 过滤部分属性
    if (!orderInfo.TicketInfos) {
      return;
    }
    // 改签票
    if (orderInfo.RescheduleTicketList?.length) {
      shareTicketInfo = JSON.parse(
        JSON.stringify(
          orderInfo.RescheduleTicketList[0],
          function (key, value) {
            if (key === 'ReschedulePassengerList') {
              return undefined;
            } else {
              return value;
            }
          }
        )
      );
      const departDate = shareTicketInfo.DepartTime;
      const arriveDate = shareTicketInfo.ArriveTime;
      shareTicketInfo.DepartTime = new cDate(departDate || '').format('H:i');
      shareTicketInfo.ArriveTime = new cDate(arriveDate || '').format('H:i');
      shareTicketInfo.DepartDate = new cDate(departDate || '').format('Y-m-d');
      shareTicketInfo.ArriveDate = new cDate(arriveDate || '').format('Y-m-d');
    } else {
      // 原始票
      shareTicketInfo = JSON.parse(
        JSON.stringify(orderInfo.TicketInfos[0], function (key, value) {
          if (key === 'PassengerInfos' || key === 'RescheduleUrl') {
            return undefined;
          } else {
            return value;
          }
        })
      );
    }
    // 筛选部分属性
    if (orderInfo.RescheduleTicketList?.length) {
      for (const item of orderInfo.RescheduleTicketList[0]
        .ReschedulePassengerList) {
        let obj = {};
        obj.TicketPassengerName = item.PassengerName;
        obj.DealSeatNo = item.DealSeatNo;
        obj.SeatName = item.SeatName;
        obj.TicketTypeName = orderInfo.TicketInfos[0].PassengerInfos.filter(
          (pas) => pas.IDCardNumberAES === item.IDCardNumberAES
        )[0].TicketTypeName;
        passengerInfo.push(obj);
      }
    } else {
      for (const item of orderInfo.TicketInfos[0].PassengerInfos) {
        let obj = {};
        obj.TicketPassengerName = item.TicketPassengerName;
        obj.TicketTypeName = item.TicketTypeName;
        if (item.RealTicketInfo) {
          obj.DealSeatNo = item.RealTicketInfo.DealSeatNo;
          obj.SeatName = item.RealTicketInfo.SeatName;
        }
        passengerInfo.push(obj);
      }
    }
    console.log('passengerInfo', passengerInfo);
    // 信息拼接
    shareTicketInfo.PassengerInfos = passengerInfo;
    shareTicketInfo.arriveTimeStamp = shared.orderinfos.time.arriveTime;
    shareTicketInfo.departTimeStamp = shared.orderinfos.time.departTime;
    shareTicketInfo.ElectronicNumber =
      orderInfo.TicketInfos[0].ElectronicNumber;
    shareTicketInfo.RouteSequence = orderInfo.TicketInfos[0].RouteSequence;
    let param = encodeURIComponent(JSON.stringify([shareTicketInfo]) || '');
    let params = {
      info: param,
      oid: this.store.data.oid,
    };
    GetEncodeTicketSharingParamModel(params, (res) => {
      if (res.resultCode === 1) {
        this.setData({ encodeTicketInfo: res.shortUrl });
      }
    });
  },
  getTeamupInfo() {
    const params = {
      OrderNumber: this.store.data.oid,
    };
    JoinGroupEntranceModel(
      params,
      (data) => {
        if (data && data.RetCode === 1) {
          const {
            RetMessage,
            Title,
            ButtonName,
            IsInitiator,
            IsShow,
            JumpUrl,
          } = data;
          this.setData({
            teamupInfo: {
              RetMessage,
              Title,
              ButtonName,
              IsInitiator,
              IsShow,
              JumpUrl,
            },
          });
          if (IsShow)
            util.ubtTrace('s_trn_c_trace_10320640941', {
              exposureType: 'normal',
              bizKey: 'groupGrabResultEntry',
              groupState: Title,
            });
        }
      },
      (err) => {}
    );
  },
  // 前往拼团详情
  onTapToTeamupDetail() {
    util.ubtTrace('c_trn_c_10650037941', {
      bizKey: 'groupGrabResultEntryClick',
      groupState: this.data.teamupInfo.Title,
    });
    const enURL = encodeURIComponent(
      `${this.data.teamupInfo.JumpUrl}&appointOrder=${this.data.orderInfo.OrderId}`
    );
    const url = `/pages/train/authorise/web/web?data={"url":"${enURL}"}`;
    cwx.navigateTo({
      url,
    });
  },
  // 获取html配置
  async getHtmlConfigByKeys() {
    if (
      this.data.isShowSaveTaskPop ||
      this.data.saveTaskInfo?.TaskType === 31
    ) {
      const casBackres = await util.promisifyModel(getHtmlConfigByKeysModel)({
        keys: ['ciiHunExI2'],
      });
      if (casBackres.resultCode === 1 && casBackres.configs?.length > 0) {
        this.setData({
          saveRuleConfig: casBackres.configs[0],
        });
      }
      return;
    }
    const res = await util.promisifyModel(getHtmlConfigByKeysModel)({
      keys: ['ORmvfvInTt'],
    });
    if (res.resultCode === 1 && res.configs?.length > 0) {
      this.setData({
        saveRuleConfig: res.configs[0],
      });
    }
  },
  // 判断是否展示在线换座入口
  isShowChangeSeatSet(orderInfo) {
    // console.log("22222222",orderInfo?.TicketInfos)
    if (!!orderInfo.TicketInfos?.[0].OnlineChangeCardInfo) {
      this.setData({
        isShowChangeSeat: true,
        OnlineChangeCardInfo: orderInfo.TicketInfos[0].OnlineChangeCardInfo,
      });
    } else {
      this.setData({
        isShowChangeSeat: false,
      });
    }
  },

  showRescheduleGrabEntrance(orderInfo) {
    try {
      if (orderInfo?.IsCanGrabTicket) {
        const params = {
          OrderNumber: orderInfo.OrderId,
        };
        RecommendRescheduleGrabTicketModel(
          params,
          (data) => {
            if (data.RetCode != 1) return;
            this.setData({
              rescGrabShowInfo: data.EntranceInfo,
            });
            // 改签抢模块
            if (
              data.EntranceInfo &&
              orderInfo.IsCanGrabTicket &&
              this.data.isSuccess
            ) {
              util.ubtTrace('s_trn_c_10650037941', {
                exposureType: 'normal',
                bizKey: 'rescheduleEntry',
                orderId: orderInfo.OrderId,
              });
            }
          },
          (err) => {
            console.error('获取改签抢入口', err);
          }
        );
      }
    } catch (e) {
      console.log('获取改签抢入口', e);
    }
  },

  async showSaveTaskEntrance(orderInfo) {
    this.setData({ isShowGuideSaveTaskPop: false });
    try {
      const params = {
        FromType: 'wx',
        OpenId: (cwx.cwx_mkt && cwx.cwx_mkt.openid) || '',
        OrderNumber: orderInfo.OrderId,
        SourceType: 2,
      };
      const res = await util.promisifyModel(GetExternalTaskInfo)(params);
      if (res.RetCode === 1) {
        this.setData({ saveTaskInfo: res.BannerTaskInfo });
        if (res.BannerTaskInfo) {
          if (res.BannerTaskInfo.TaskType !== 31) {
            util.ubtTrace('TCWBuyDetail_SaveMoneyTask_exposure', {
              PageId: '10650037941',
            });
          } else {
            util.ubtTrace('TCWDetail_FanxianModule_exposure', {
              PageId: '10650037941',
              Type: this.data.orderInfo.OrderType === 'JL' ? 1 : 0,
              orderId: this.data.orderInfo.OrderId,
            });
          }
          if (res.BannerTaskInfo.LatestOrderTime) {
            this.getSaveTaskTips(res.BannerTaskInfo.LatestOrderTime);
          }
        }
        if (res.PoplayerInfo?.Title) {
          this.setData({
            isShowGuideSaveTaskPop: true,
            saveTaskGuidePopInfo: res.PoplayerInfo,
          });
        }
        // 获取html配置
        await this.getHtmlConfigByKeys();
      } else {
        return;
      }
    } catch (err) {
      console.log('获取省钱任务banner失败', err);
    }
  },

  // 省钱任务倒计时
  getSaveTaskTips(orderTime) {
    clearInterval(this.saveCountId);
    let saveTaskTips = '';
    const year = orderTime.substring(0, 4);
    const month = orderTime.substring(4, 6) - 1;
    const day = orderTime.substring(6, 8);
    const hour = orderTime.substring(8, 10);
    const min = orderTime.substring(10, 12);
    const second = orderTime.substring(12, 14);
    let lastPayTime = new Date(year, month, day, hour, min, second, 0) / 1000;
    let now = Date.now() / 1000;
    if (now >= lastPayTime) return;
    this.saveCountId = setInterval(() => {
      now = Date.now() / 1000;
      if (now >= lastPayTime) {
        saveTaskTips = '';
        clearInterval(this.saveCountId);
        this.setData({ saveTaskTips });
        setTimeout(() => {
          this.loadData(this.store.data.oid);
        }, 1000);
        return;
      }
      const time = lastPayTime - now;
      let hour = '',
        min = '',
        second = '';
      let day = String(Math.floor(time / (3600 * 24)));
      if (!parseInt(day)) {
        hour = String(Math.floor((time - day * 3600 * 24) / 3600));
        min = String(Math.floor((time - day * 3600 * 24 - hour * 3600) / 60));
        second = String(
          Math.floor(time - day * 3600 * 24 - hour * 3600 - min * 60)
        );
        hour = util.pad(hour);
        min = util.pad(min);
        second = util.pad(second);
      }
      this.setData({
        saveTaskTips: parseInt(day)
          ? `还剩${day}天`
          : `仅剩${hour}:${min}:${second}`,
      });
    }, 1000);
  },

  // 省钱任务详情读配置
  changeSaveModal() {
    this.setData({ showSaveRuleModal: !this.data.showSaveRuleModal });
  },

  onClickFinishSaveTask() {
    if (
      this.data.isShowSaveTaskPop ||
      this.data.saveTaskInfo?.TaskType === 31
    ) {
      util.ubtTrace('TCWDetail_FanxianModule_click', {
        PageId: '10650037941',
        Type: this.data.orderInfo.OrderType === 'JL' ? 1 : 0,
        orderId: this.data.orderInfo.OrderId,
      });
    } else {
      util.ubtTrace('TCWBuyDetail_SaveMoneyTask_Complete_click', {
        PageId: '10650037941',
      });
    }
    if (this.data.isShowSaveTaskPop) {
      this.receiveSaveTask(true);
      return;
    } else if (
      this.data.saveTaskInfo.TaskType === 31 &&
      this.data.saveTaskInfo.Status === 3
    ) {
      cwx.navigateTo({
        url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
          this.data.saveTaskInfo.JumpUrl
        )}`,
      });
      return;
    } else if (
      this.data.saveTaskInfo.TaskType === 31 &&
      this.data.saveTaskInfo.Status === 4
    ) {
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(this.data.saveTaskInfo.JumpUrl),
          needLogin: true,
        },
      });
      return;
    }
    this.navigateTo({
      url: this.data.saveTaskInfo.JumpUrl,
    });
  },
  preventBackMove() {},

  handleRescheduleGrabOrder(orderInfo) {
    try {
      // if( !orderInfo.RescheduleTicketList?.length || !orderInfo.RescheduleTicketList[0].ReschedulePassengerList[0].GrabTicketDetailButtonDisplay)return;
      const {
        RescheduleTicketList: [
          {
            RescheduleOrderNumber = '',
            ReschedulePassengerList: [
              { GrabTicketDetailButtonDisplay = false },
            ],
          },
        ] = [{ RescheduleOrderNumber: '', ReschedulePassengerList: [{}] }],
      } = orderInfo;
      // GrabTicketDetailButtonDisplay 改签抢还没成功 或者改签过程中 才会为true
      if (!GrabTicketDetailButtonDisplay) return;
      const params = {
        OrderId: RescheduleOrderNumber,
      };
      ChangeTicketOrderDetailModel(
        params,
        (data) => {
          if (!data.ChangeTicketInfo || data.RetCode != 0) return;
          const {
            JLAlternativeDate,
            JLAllSeatNames,
            JLAllTrainNumbers,
            JLExpiredTime = '',
            SpeedLevel = 1,
          } = data;
          const {
            DepartureStationName,
            ArrivalStationName,
            JLAlternativeTrain,
            JLAlternativeSeat,
            DepartureDateTime,
            TicketPrice,
          } = data.ChangeTicketInfo;
          const JLExpiredTimeArr = JLExpiredTime.match(/\d{13}/);
          let DepartDateStr = DepartureDateTime.replace(/-/g, '/');
          let TimeStr = new cDate(DepartDateStr || '').format('H:i');
          DepartDateStr = new cDate(DepartDateStr || '').format('m月d日');
          const JLExpiredTimeStr =
            '抢票截止时间 ' +
            new cDate(+JLExpiredTimeArr[0] || '').format('m月d日 H:i');
          const JLAlternativeDateStr = JLAlternativeDate.replace(
            /(\d{4})-(\d{2})-(\d{2})/g,
            (_, $1, $2, $3) => {
              // return util.formatDatemd(item.trim())
              return $2 + '月' + $3 + '日';
            }
          );
          const StatusName =
            (['低速', '快速', '高速', '极速', '光速', 'VIP'][SpeedLevel - 1] ||
              '') + '改签抢中';
          this.setData({
            IsRescGrabOrder: true,
            rescGrabInfo: {
              StationsStr: `${DepartureStationName}-${ArrivalStationName}`,
              DepartDateStr,
              JLAlternativeTrain,
              JLAlternativeSeat,
              TicketPrice,
              JLAllSeatNames,
              JLAllTrainNumbers,
              JLAlternativeDateStr,
              JLAlternativeSeat,
              StatusName,
              JLExpiredTimeStr,
              TimeStr,
            },
          });
        },
        (err) => {
          console.error('处理改签详情失败', err);
        }
      );
    } catch (e) {
      console.log('获取改签详情失败', e);
    }
  },
  onTapOpenRescGrabDetail() {
    this.setData({
      showRescGrabDetail: !this.data.showRescGrabDetail,
    });
  },
  setPopTypeDeps(orderInfo) {
    if (!orderInfo) {
      return;
    }
    const promises = [];

    promises.push(this.getBargainInfo());

    let isNeedGetRegister12306UserInfo = (orderInfo.ExtendList || []).filter(
      (item) => item.Key === 'IsNeedGetRegister12306UserInfo'
    )[0];
    if (
      isNeedGetRegister12306UserInfo &&
      isNeedGetRegister12306UserInfo.Value == '1'
    ) {
      promises.push(this.getRegister12306UserInfo());
      promises.push(this.getRegister12306UserInfoConfig());
    }

    if (orderInfo.IsCanReward) {
      promises.push(this.getRewardInfo());
    }

    if (orderInfo.IsCanReward) {
      promises.push(this.getRewardInfo());
    }
    promises.push(this.getSaveTaskPopInfo(orderInfo));

    promises.push(this.getCashbackInfo());

    promises.push(this.get12306Config());

    promises.push(this.setSubsribedFlag());

    promises.push(this.getGrabInfo(orderInfo));

    return Promise.all(promises);
  },

  async getSaveTaskPopInfo(orderInfo) {
    this.setData({ isShowSaveTaskPop: false });
    try {
      const params = {
        OrderNumber: orderInfo?.OrderId,
        SourceType: 2,
        FromType: 'wx',
      };
      const res = await util.promisifyModel(GetTrainCrossTaskDetailFront)(
        params
      );
      if (
        res.RetCode === 1 &&
        res.IsShow &&
        res.TaskList.find((item) => item.TaskType === 31)
      ) {
        this.setData({
          isShowSaveTaskPop: true,
          saveTaskPopInfo: res.TaskList.find((item) => item.TaskType === 31)
            ?.PoplayerInfo,
          saveTaskInfo: res.TaskList.find((item) => item.TaskType === 31)
            ?.BannerTaskInfo,
        });
        util.ubtTrace('TCWDetail_FanxianModule_exposure', {
          PageId: '10650037941',
          Type: orderInfo.OrderType === 'JL' ? 1 : 0,
          orderId: orderInfo.OrderId,
        });
        await this.getHtmlConfigByKeys();
      }
    } catch (e) {
      console.log('获取返现任务领取弹窗信息失败');
    }
  },

  get12306Config() {
    return setConfigSwitchAsyncPromise(
      'train_wx_orderdetail_12306_v3',
      'isOpen12306Config'
    ).then(([res]) => {
      this.setData({
        isOpen12306Config: res,
      });
    });
  },
  hidePop() {
    this.hideBackDrop();
  },
  /**
   * [handlePopType ]
   * @param  {[type]} showType [初始化时传入的showType]
   * @param  {[type]} options [判断依赖项]
   * @return {[type]}          [最终绑定的popType]
   * 设置弹窗类型 只使用popType并且在逻辑层处理 不要在视图层做逻辑(除了加载的配置外 因为配置是单独的)
   */
  async handlePopType(showType = '', orderInfo) {
    let { AlertInfo, OrderStatus, IsFastPay, IsCanReward } = orderInfo;
    const checkPopList = [
      'saveTask',
      'saveTaskGuide',
      'noaccountCheck',
      'ticketsBreak',
      'robbreakScan',
      'mobileCheck',
      'TURNTOGRABORDERDRAWER',
      'HASSUBSCRIBED',
      'BARGAIN',
      'cashback',
      'ELECTICKET',
      'reward',
      '12306ALERT',
      'FREEORDERMODAL',
      'newGuestPrivilege',
      'COUPONMODAL',
      'hotel',
    ];
    let { hasShowPop = [], register12306UserInfo = {} } = this.data;
    let needPop = [];
    checkPopList.forEach((item) => {
      if (
        TrainActStore.getAttr(item) &&
        TrainActStore.getAttr(item).oids?.includes(this.store.data.oid)
      ) {
        hasShowPop.push(item);
      }
      if (item === 'HASSUBSCRIBED' && TrainActStore.getAttr(item)) {
        hasShowPop.push(item);
      }
      if (item === 'FREEORDERMODAL' && TrainActStore.getAttr(item)) {
        hasShowPop.push(item);
      }
      if (item === 'COUPONMODAL' && TrainActStore.getAttr(item)) {
        hasShowPop.push(item);
      }
      if (
        item === 'saveTaskGuide' &&
        TrainActStore.getAttr(item)?.key == this.data.orderInfo.OrderId
      ) {
        hasShowPop.push(item);
      }
      if (
        item === 'saveTask' &&
        TrainActStore.getAttr(item)?.key == this.data.orderInfo.OrderId
      ) {
        hasShowPop.push(item);
      }
      if (
        item === 'newGuestPrivilege' &&
        TrainActStore.getAttr(item)?.key == this.data.orderInfo.OrderId
      ) {
        hasShowPop.push(item);
      }
    });

    this.setData({
      hasShowPop,
    });

    let hasHongkong = false;
    if (!TrainActStore.getAttr('hongkongTips')) {
      hasHongkong = checkHongkong(orderInfo);
    }
    if (hasHongkong) {
      showType = 'hongkong';
      TrainActStore.setAttr('hongkongTips', true);
    }

    // 待支付 非信用付 全部不弹弹窗
    if (OrderStatus === 1 && !IsFastPay) {
      showType = '';
    }

    if (showType) {
      this.ubtTrace(102588, {
        showType,
      });
    }
    if (AlertInfo) {
      let { AlertType = 0 } = AlertInfo;
      if (AlertType === 13 && !hasShowPop.includes('ELECTICKET')) {
        this.setElecTicketPop(orderInfo);
        needPop.push('ELECTICKET');
      } else if (
        [7, 8, 9].includes(AlertType) &&
        !hasShowPop.includes('12306ALERT') &&
        this.data.isOpen12306Config
      ) {
        // 7: 未登录，8: 未注册12306会员，9: 未激活12306会员
        needPop.push('12306ALERT');
      } else if (AlertType === 18 && !hasShowPop.includes('mobileCheck')) {
        needPop.push('mobileCheck');
      } else if (AlertType == 22) {
        needPop.push('robbreakScan');
      } else if (
        AlertType == 23 &&
        this.data.extendValues?.ETicketUser12306Process?.guideCode == 2
      ) {
        needPop.push('ticketsBreak');
      } else if (AlertType == 25) {
        needPop.push('noaccountCheck');
      } else if (
        AlertType === 41 &&
        !hasShowPop.includes('newGuestPrivilege')
      ) {
        // 新人特权出票成功弹窗
        needPop.push('newGuestPrivilege');
        this.initNewGuestData(orderInfo);
      }
    }
    if (
      !!this.data.cashbackInfo &&
      this.data.extendValues &&
      !hasShowPop.includes('cashback')
    ) {
      this.ubtTrace('c_train_wx_getbonus_pop', {
        show: true,
      });
      needPop.push('cashback');
    }

    if (IsCanReward && this.data.rewardInfo && !hasShowPop.includes('reward')) {
      needPop.push('reward');
    }

    if (
      !hasShowPop.includes('HASSUBSCRIBED') &&
      shared.isCtripApp &&
      !this.data.subscribeFlag
    ) {
      needPop.push('HASSUBSCRIBED');
    }

    if (this.showType === 'BARGAIN' && !hasShowPop.includes('BARGAIN')) {
      needPop.push('BARGAIN');
    }
    // push没有优先级
    if (this.data.isShowFreeOrder && !hasShowPop.includes('FREEORDERMODAL')) {
      needPop.push('FREEORDERMODAL');
    }
    // 一键转抢浮层
    if (
      this.data.isShowTurnToGrab &&
      !hasShowPop.includes('TURNTOGRABORDERDRAWER')
    ) {
      needPop.push('TURNTOGRABORDERDRAWER');
    }
    if (
      !hasShowPop.includes('COUPONMODAL') &&
      this.data.isShowHotelSuccess &&
      !this.data.isTrainApp
    ) {
      // 优惠券弹窗需要跳转酒店，在独立版不弹
      needPop.push('COUPONMODAL');
    }
    if (!hasShowPop.includes('saveTask') && this.data.isShowSaveTaskPop) {
      needPop.push('saveTask');
    }
    if (
      !hasShowPop.includes('saveTaskGuide') &&
      this.data.isShowGuideSaveTaskPop
    ) {
      needPop.push('saveTaskGuide');
    }

    if ((!showType || showType === 'hotel') && this.data.isSuccess) {
      showType = checkPopList.find((item) => needPop.includes(item));
      if (showType == 'BARGAIN') {
        this.ubtTrace('c_train_wx_kanjia_popshow', true);
      } else if (showType == 'HASSUBSCRIBED') {
        this.ubtTrace('c_train_wx_has_subscribed_popshow', true);

        let timeout = util.getNextDayTimeOut();
        // 订阅成功前端缓存成功状态 当天只提醒订阅一次
        TrainActStore.setAttr('HASSUBSCRIBED', { key: true, timeout });
        // 关注公众号免单
      } else if (showType == 'FREEORDERMODAL') {
        let timeout = util.getNextDayTimeOut();
        TrainActStore.setAttr('FREEORDERMODAL', { key: true, timeout });
      } else if (showType == 'saveTaskGuide') {
        // 省钱任务引导弹窗
        let timeout = util.getNextDayTimeOut();
        TrainActStore.setAttr('saveTaskGuide', {
          key: this.data.orderInfo.OrderId,
          timeout,
        });
        util.ubtTrace('TCWDetail_FanxianPopup_exposure', {
          PageId: '10650037941',
          ProductType: 1,
          Type: this.data.orderInfo.OrderType === 'JL' ? 1 : 0,
          orderId: this.data.orderInfo.OrderId,
        });
      } else if (showType == 'saveTask') {
        // 省钱任务领取弹窗
        let timeout = util.getNextDayTimeOut();
        TrainActStore.setAttr('saveTask', {
          key: this.data.orderInfo.OrderId,
          timeout,
        });
        util.ubtTrace('TCWDetail_FanxianPopup_exposure', {
          PageId: '10650037941',
          ProductType: 0,
          Type: this.data.orderInfo.OrderType === 'JL' ? 1 : 0,
          orderId: this.data.orderInfo.OrderId,
        });
      }
      // else if (showType == 'COUPONMODAL') {
      //     let d = new Date()
      //     d.setDate(new Date().getDate() + 1)
      //     let diff = d.setHours(0, 0, 0) - Date.now()
      //     let timeout = Math.floor(diff / 1000 / 60)
      //     TrainActStore.setAttr('COUPONMODAL', {key: true, timeout,})
      // }
    } else if (
      needPop.includes('mobileCheck') ||
      needPop.includes('robbreakScan') ||
      needPop.includes('noaccountCheck') ||
      needPop.includes('ticketsBreak') ||
      needPop.includes('TURNTOGRABORDERDRAWER')
    ) {
      showType = checkPopList.find((item) => needPop.includes(item));
    }

    // 引导用户注册12306
    if (
      register12306UserInfo &&
      register12306UserInfo.isShow &&
      this.data.openRegister12306UserInfoConfig &&
      this.data.isSuccess
    ) {
      let register12306UserInfoStore =
        TrainActStore.getAttr('order_detail_12306');
      let dateStr = new cDate().format('Y-m-d');
      if (
        !(
          register12306UserInfoStore &&
          register12306UserInfoStore['date_' + dateStr] &&
          register12306UserInfoStore['date_' + dateStr].indexOf(this.oid) !== -1
        )
      ) {
        showType = '12305NEWMODAL';
        this.ubtTrace('orderdetail_signin_popup', true);
        let oidArr = [];
        if (
          register12306UserInfoStore &&
          register12306UserInfoStore['date_' + dateStr]
        ) {
          oidArr = register12306UserInfoStore['date_' + dateStr];
        }
        oidArr.push(this.oid);
        TrainActStore.setAttr('order_detail_12306', {
          ['date_' + dateStr]: oidArr,
        });
      }
    }

    if (showType) {
      this.showType = '';
      if (
        checkPopList.includes(showType) &&
        showType !== 'robbreakScan' &&
        showType !== 'ticketsBreak' &&
        showType !== 'noaccountCheck' &&
        showType !== 'HASSUBSCRIBED' &&
        showType !== 'FREEORDERMODAL' &&
        showType !== 'COUPONMODAL' &&
        showType !== 'saveTask' &&
        showType !== 'saveTaskGuide'
      ) {
        let oidArr = TrainActStore.getAttr(showType)?.oids || [];
        oidArr.push(this.store.data.oid);
        oidArr = Array.from(new Set(oidArr));

        TrainActStore.setAttr(showType, { oids: oidArr });
      }
      if (showType == 'COUPONMODAL') {
        await this.checkHasBindMobile();
        if (this.data.isShowCouponDialog) {
          util.ubtTrace('s_trn_c_10320640941', {
            exposureType: 'popup',
            bizKey: 'couponExposure',
            couponname: this.data.couponList.map((item) => item.Tittle),
          });
        } else {
          showType = '';
        }
      }
      this.setData({ popType: showType || '' });
      if (showType == 'noaccountCheck') {
        this.ubtTrace('tableshow_buyticketpause_typea', true);
      }
      if (showType == 'ticketsBreak') {
        this.ubtTrace('tableshow_buyticketpause_typeb', true);
      }
      if (showType === 'TURNTOGRABORDERDRAWER') {
        util.ubtTrace('s_trn_c_10320640941', {
          exposureType: 'actionbar',
          bizKey: 'transferGrabActionbar',
          orderId: '' + this.data.orderInfo.OrderId,
        });
      }
      if (showType === 'BARGAIN') {
        util.ubtTrace('s_trn_c_trace_10650037941', {
          bizKey: 'bargainPopupExposure',
          orderid: this.data.orderInfo?.OrderId,
        });
      }

      this.ubtTrace(
        'buyticket_needverify_orderdetail',
        this.data.popType == 'robbreakScan' &&
          !this.store.data.orderInfo?.extendValues?.RescheduleOrderNumber
      );
      this.ubtTrace(
        'changeticket_needverify_orderdetail',
        this.data.popType == 'robbreakScan' &&
          this.store.data.orderInfo?.extendValues?.RescheduleOrderNumber
      );
      this.ubtTrace(
        'e_traapplets_orderdetailpage_hotel_exposure',
        this.data.popType == 'hotel' &&
          this.data.hotelConfig?.handle &&
          this.data.isSuccess &&
          this.data.hotelConfig?.cityname
      );
    }
    console.log(showType, 'couponmodal7');
  },
  autoRefreshDefer(orderInfo) {
    if (orderInfo.OrderStatus === 5) {
      let timer = setTimeout(() => {
        this.onPullDownRefresh();
        this.setData({
          refreshTimer: '',
        });
      }, 10 * 1000);
      this.setData({
        refreshTimer: timer,
      });
    }
  },

  clickCheckAccount() {
    const {
      ETicketGuidUserCheckFace: {
        ActionCode,
        JumpUrl,
        MobilePhone12306,
        UserName,
      } = {},
    } = this.data.extendValues || {};
    if (!this.data.protocalToogle && (ActionCode == 1 || ActionCode == 4)) {
      return util.showToast('请阅读并勾选协议', 'none');
    }
    this.checkAction(ActionCode, UserName, JumpUrl, MobilePhone12306);
  },
  clickTicketBreakCheck() {
    const {
      ETicketUser12306Process: {
        actionCode,
        jumpUrl,
        mobilePhone12306,
        userId12306,
      } = {},
    } = this.data.extendValues || {};
    this.checkAction(actionCode, userId12306, jumpUrl, mobilePhone12306);
  },
  clickTicketBreakNotice(e) {
    const { guidecode } = e.currentTarget.dataset;
    if (guidecode == 1) {
      // 若引导
      this.clickTicketBreakCheck();
    }
    if (guidecode == 2) {
      // 强引导
      this.showBreakPop();
    }
  },
  checkAction(ActionCode, UserName, JumpUrl, MobilePhone12306) {
    // actioncde: 1=刷脸核验解封，2=跳转url(账号解封的)，3=短信核验解封，4=(刷脸核验解封+短信核验解封)，5=重新登录12306账号，6=添加12306账号，7=12306账号手机号核验(双向核验)
    switch (+ActionCode) {
      case 1:
        this.faceCheckAction(UserName);
        break;
      case 2:
        util.jumpToUrl(JumpUrl);
        break;
      case 3:
        this.smsCheckAction(UserName, MobilePhone12306);
        break;
      case 4:
        this.faceCheckAction(UserName);
        break;
      case 5:
        this.login12306Action(3);
        break;
      case 6:
        this.login12306Action(3);
        break;
      case 7:
        util.showToast('暂不支持双向核验');
        break;
      case 8:
        let url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/retrieve?userName=${UserName}&retrieveUsePC=1`;
        this.navigateTo({
          url: `/pages/train/webview/webview`,
          data: {
            url: url,
            bridgeIns: (e) => {
              const { userName, loginPW } = e.detail.data[0];

              this.bind12306ToOrder(userName, loginPW, 3)
                .then((data) => {
                  if (data.RetCode == 1) {
                    this.store
                      .loadData(this.store.data.oid)
                      .then((res) => {
                        this.loadDataUpdate(res.OrderInfo);
                      })
                      .catch((e) => {
                        console.log(e);
                      });
                  }
                })
                .catch((e) => {
                  console.error(e);
                });
            },
            needLogin: true,
          },
        });
        break;
      default:
        util.showToast('暂不支持，请前往携程app完成核验');
        return;
    }
    this.ubtTrace(
      'needverify_goscan_orderdetail',
      ActionCode == 1 &&
        !this.store.data.orderInfo?.extendValues?.RescheduleOrderNumber
    );
    this.ubtTrace(
      'needverify_gotext_orderdetail',
      ActionCode == 3 &&
        !this.store.data.orderInfo?.extendValues?.RescheduleOrderNumber
    );
    this.ubtTrace(
      'needverify_gourl_orderdetail',
      ActionCode == 2 &&
        !this.store.data.orderInfo?.extendValues?.RescheduleOrderNumber
    );

    this.ubtTrace(
      'needverify_goscan_changeticket',
      ActionCode == 1 &&
        this.store.data.orderInfo?.extendValues?.RescheduleOrderNumber
    );
    this.ubtTrace(
      'needverify_gotext_changeticket',
      ActionCode == 3 &&
        this.store.data.orderInfo?.extendValues?.RescheduleOrderNumber
    );
  },
  faceCheckAction(UserName) {
    this.navigateTo({
      url: `/pages/train/face/face?fromType=4&userName=${UserName}`,
      callback: (res) => {
        console.log("i'm back from facepage", res);
        const _do = () => {
          if (res.fromType == 4) {
            let success = res?.certificationResultCode == 1;
            // 回推结果
            this.pushScanFaceResult(success, 0, UserName).then(() => {
              this.store
                .loadData(this.store.data.oid)
                .then((res) => {
                  this.loadDataUpdate(res.OrderInfo);
                })
                .catch((e) => {
                  console.log(e);
                });
            });
            if (!success) {
              this.setData({
                popType: 'robbreakScanFail',
              });
            }
          }
        };
        setTimeout(() => {
          _do();
        }, 500);
      },
    });
  },
  smsCheckAction(UserName, MobilePhone12306) {
    let url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/verify?mobile=${
      MobilePhone12306 || '您的下单手机'
    }&userName=${UserName}`;
    this.navigateTo({
      url: `../../webview/webview`,
      data: {
        url: url,
        bridgeIns: (e) => {
          console.log('TRN PROPS gotten', e.detail.data);
          const [{ unRisk = false }] = e.detail.data;
          setTimeout(() => {
            // 回推结果
            this.pushScanFaceResult(unRisk, 1, UserName).then(() => {
              this.store
                .loadData(this.store.data.oid)
                .then((res) => {
                  this.loadDataUpdate(res.OrderInfo);
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          }, 500);
        },
        needLogin: true,
      },
    });
  },
  clickLogin12306(e) {
    const { type } = e.currentTarget.dataset;
    this.login12306Action(type);
  },
  login12306Action(fromType) {
    login12306({
      from: 'orderdetail',
      success: (data) => {
        const [{ userName = '', loginPW = '' }] = data;
        this.bind12306ToOrder(userName, loginPW, fromType)
          .then((data) => {
            if (data.RetCode == 1) {
              this.store
                .loadData(this.store.data.oid)
                .then((res) => {
                  this.loadDataUpdate(res.OrderInfo);
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          })
          .catch((e) => {
            console.error(e);
          });
      },
    });
  },
  bind12306ToOrder(account, pwd = '', fromType) {
    const params = {
      Channel: 'ctripwx',
      FromType: fromType, // 0=候补订单候补失败(有待兑现订单)时添加账号，1=秒杀时添加账号，2=无账号下单用户添加账号，3=代购购票中添加账号，4=抢票购票中添加账号，5=无账号代购购票中引导用户添加账号
      OrderNumber: this.store.data.oid,
      UserName12306: account,
      Password12306: pwd,
      ExtendInfoList: this.store.data.orderInfo?.ExtendList,
    };

    return AddOrderAccountInfoPromise(params);
  },
  pushScanFaceResult(success = false, type = 0, UserName, fromType = 3) {
    // FromType：来源：1=正向流程，2=逆向流程
    const params = {
      Channel: 'WX',
      OrderNumber: this.store.data.oid,
      AccountName: UserName,
      FromType: fromType,
      CheckFaceStatus: success ? 0 : 1, // 0=成功，1=失败
      AuthenticationType: type, // 0=扫脸，1=短信，5=PC引擎修改密码后重新登录12306账号
      ExtendInfoList: this.store.data.orderInfo?.ExtendList,
    };
    let promise = util.promisifyModel(CheckFaceSuccessNotifyModel)(params);

    return promise;
  },
  showBreakPop() {
    this.setData({
      popType: 'ticketsBreak',
    });
  },
  showBreakPopNoaccount() {
    this.setData({
      popType: 'noaccountCheck',
    });
  },
  onClickHandle12306() {
    const { register12306UserInfo } = this.data;
    if (
      register12306UserInfo.IdentityNo &&
      register12306UserInfo.MobilePhone &&
      register12306UserInfo.IdentityType &&
      register12306UserInfo.PassegerName
    ) {
      this.toAccountRegister(register12306UserInfo);
    } else {
      this.to12306Login();
    }
  },
  toAccountRegister(info) {
    this.setData({ popType: '' });
    // IdentityType：证件类型：1身份证、2护照、7回乡证、8台胞证、10港澳通行证、22台湾通行证
    let type = info.IdentityType;
    if (type == 1) {
      type = '1';
    } else if (type == '2') {
      type = 'B';
    } else if (type == '7') {
      type = 'C';
    }
    let UserName = createRandomAccount(info.PassegerName);
    let Password = createRandomPassword();
    const params = {
      PartnerName: 'Ctrip.Train',
      Channel: 'H5',
      PartnerUid: '',
      // 证件类型：1身份证；B护照；C 回乡证
      PassportType: type,
      PassportName: info.PassegerName,
      PassportNumber: info.IdentityNo,
      MobileNumber: info.MobilePhone,
      UserName,
      Password,
    };
    console.log('registerUserAccountInfoPromise params', params);
    util.showLoading();
    registerUserAccountInfoPromise(params)
      .then((res) => {
        util.hideLoading();
        console.log('registerUserAccountInfoPromise success', res);
        this.to12306Mobile(
          info.MobilePhone,
          res.registerKey,
          UserName,
          Password
        );
      })
      .catch((err) => {
        console.log('registerUserAccountInfoPromise err', err);
        if (err && err.failCode == 1) {
          //已注册的错误
          this.checkAccountCanLogOut(info);
        } else {
          util.hideLoading();
          this.to12306Login();
        }
      });
  },
  checkAccountCanLogOut(info, PollingKey) {
    const deferred = util.getDeferred();
    let params = {
      IdentityType: info.IdentityType,
      IdentityNo: info.IdentityNo,
      PassageName: info.PassegerName,
      PollingKey: PollingKey || null,
    };
    console.log('CheckAccountCanLogOutV2Promise params', params);
    CheckAccountCanLogOutV2Promise(params)
      .then((data) => {
        console.log('CheckAccountCanLogOutV2Promise data', data);
        if (data.RetCode == 1) {
          if (data.Result == 1) {
            // 成功
            util.hideLoading();
            if (data.IsPublic) {
              if (data.IsCanLogOut) {
                this.checkCanScanFace();
              } else {
                util.hideLoading();
                this.to12306Login();
              }
            } else {
              util.hideLoading();
              this.to12306Login();
            }
          } else if (data.Result == 3) {
            setTimeout(() => {
              this.checkAccountCanLogOut(info, data.PollingKey).catch(() => {
                deferred.reject();
              });
            }, data.RequestRate * 1000);
          } else {
            util.hideLoading();
            this.to12306Login();
            deferred.reject();
          }
        } else {
          util.hideLoading();
          this.to12306Login();
          deferred.reject();
        }
      })
      .catch((err) => {
        console.log('CheckAccountCanLogOutV2Promise err', err);
        util.hideLoading();
        this.to12306Login();
        deferred.reject();
      });

    return deferred.promise;
  },
  checkCanScanFace() {
    const { orderInfo } = this.data;
    const params = {
      Mobile: orderInfo.UserInfo.ContactMobileAES,
      OrderID: orderInfo.OrderId,
      OrderType: orderInfo.OrderType,
      DepartStation: orderInfo.TicketInfos[0].DepartStation,
      ArriveStation: orderInfo.TicketInfos[0].ArriveStation,
      DepartDate: orderInfo.TicketInfos[0].DepartDate.split('-').join(''),
      TrainNumber: orderInfo.TicketInfos[0].TrainNumber,
      SeatName: orderInfo.TicketInfos[0].SeatName,
      SeatPrice: orderInfo.TicketInfos[0].TicketPrice,
    };
    console.log('TrainFaceAuthenticationRiskModel params', params);
    TrainFaceAuthenticationRiskModel(
      params,
      (res) => {
        console.log('TrainFaceAuthenticationRiskModel res', res);
        if (res.RetCode == 1 && res.IsCanFaceAuthentication) {
          console.log('TrainFaceAuthenticationRiskModel res', res);
          util.hideLoading();
          this.toScanFacePage();
        } else {
          util.hideLoading();
          this.to12306Login();
        }
      },
      (err) => {
        console.log('TrainFaceAuthenticationRiskModel err', err);
        util.hideLoading();
        this.to12306Login();
      }
    );
  },
  toScanFacePage() {
    const { register12306UserInfo } = this.data;
    let certificationInfo = {
      name: encodeURIComponent(register12306UserInfo.PassegerName),
      passportType: register12306UserInfo.IdentityType,
      passportNumber: register12306UserInfo.IdentityNo,
      mobile: register12306UserInfo.MobilePhone,
    };
    console.log('toScanFacePage register12306UserInfo', register12306UserInfo);
    let h5Url =
      'https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/register';
    this.navigateTo({
      url: `/pages/train/face/face?fromType=3&fromPage=orderdetail&h5Url=${h5Url}&userName=${
        register12306UserInfo.PassegerName
      }&certificationInfo=${JSON.stringify(certificationInfo)}`,
      callback: (res) => {
        console.log("i'm back from facepage", res);
      },
    });
  },
  to12306Mobile(mobile, registerKey, randomAccount, randomPassword) {
    let url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/register?mobile=${mobile}&registerKey=${
      registerKey || ''
    }&randomAccount=${randomAccount || ''}&randomPassword=${
      randomPassword || ''
    }`;
    this.navigateTo({
      url: `../../webview/webview`,
      data: {
        url: url,
        needLogin: true,
      },
    });
  },
  to12306Login() {
    const webviewCb = (e) => {
      console.log('TRN PROPS gotten', e);
      const [{ userName = '', loginPW = '' }] =
        (e && e.detail && e.detail.data) || {};
      if (userName && loginPW) {
        this.setData({
          popType: '12306LOGINSUC',
        });
      }
    };
    let url =
      'https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/login?from=orderdetail';
    this.navigateTo({
      url: `../../webview/webview`,
      data: {
        url: url,
        bridgeIns: webviewCb,
        needLogin: true,
      },
    });
  },
  loadDataUpdate(orderInfo) {
    if (!orderInfo?.TicketInfos) {
      return;
    }
    this.formatOrderDate(orderInfo);
    this.formatOrderInfo(orderInfo);
    this.setOrderFlags(orderInfo);
    this.setHBInfo(orderInfo);
    this.setOrderStatus(orderInfo); // 最终将 orderInfo 绑定到页面上
    this.loadInsuranceInfo(orderInfo);
    this.getExtendValue(orderInfo);
    this.handleTicketInfo(orderInfo);
    this.update({ orderInfo });
    this.setData({ orderInfo });
    this.updateDeclareChildren(orderInfo);
    this.getCombiJourneyInfo(orderInfo);
    this.getThenByTicketJourney(orderInfo);
    this.showRescheduleGrabEntrance(orderInfo);
    // 在线换座入口
    // this.isShowChangeSeatSet(orderInfo)
    this.showSaveTaskEntrance(orderInfo);
    this.getSaveTaskPopInfo(orderInfo);
    this.setPointTips(orderInfo);
    if (this.data.isShowRobSame) {
      this.loadGetOnList(orderInfo);
    }
    // this.loadQuestionList()
    this.getAIQuestionList(orderInfo);

    //待支付，标志需要弹框
    if (orderInfo.EnablePayOrder && this.showType == 'pay-isSuccess') {
      this.prePayCallBack();
    }
    this.getTransitSplitInfo();
    // 接送站服务
    this.getCarRecommendIno(this.store.data.oid);
    this.handleExpansionList();
    // 智能分段
    this.checkMergePay(orderInfo);
    // 关怀金入口更新
    this.getClaimPriceListInfo();
    // 跳转改签抢
    this.goChangeDetail();
    // 买加抢第二程信息
    this.getMultipleBookingAndGrabSegmentation(orderInfo);
  },
  handleTicketInfo(orderInfo) {
    let { TicketInfos, RescheduleTicketList } = orderInfo;
    try {
      RescheduleTicketList.forEach((item) => {
        const dealItem = {
          ...item,
          departTime: item.rescheduledDepartTime,
          arriveTime: item.rescheduledArriveTime,
          DepartDate: item.DepartTime?.split(' ')[0],
        };
        const res = util.handleLocalTime(dealItem, dealItem.DepartDate);
        Object.assign(item, res);
      });
      TicketInfos.forEach((item) => {
        const dealItem = {
          ...item,
          departTime: item.DepartTime,
          arriveTime: item.ArriveTime,
        };
        const res = util.handleLocalTime(dealItem, dealItem.DepartDate);
        Object.assign(item, res);

        item.PassengerInfos.forEach((pas) => {
          if (pas.RealTicketInfo.TicketStatusCode == 5) {
            item.hasChanged = true;
          }
          if (pas.RealTicketInfo.TicketStatusCode == 4) {
          }
          // 判断改签抢类型 + 改签状态 显示“查看进度”改签抢页面的入口
          const currPas = RescheduleTicketList?.find((t) =>
            t.ReschedulePassengerList?.find(
              (p) =>
                p.IDCardNumberAES == pas.IDCardNumberAES &&
                pas.TicketType == p.PassengerType
            )
          );
          pas.changing =
            currPas?.ReschedulePassengerList[0].GrabTicketDetailButtonDisplay &&
            currPas?.ReschedulePassengerList[0].RescheduleType != 9;
        });
      });
    } catch (error) {
      console.log(error);
    }
  },

  updateDeclareChildren(orderInfo) {
    const freeDeclareChildren = orderInfo.TicketInfos[0].PassengerInfos.filter(
      (i) => i.FreePassengerInfo
    ).map((pas) => pas.FreePassengerInfo);
    // 6,7,8都是出票成功 10:部分成功
    const isIssueTicketSuccess = [6, 7, 8, 10].includes(orderInfo.OrderStatus);
    this.setData({
      freeDeclareChildren,
      isIssueTicketSuccess,
    });
  },

  getCombiJourneyInfo(orderInfo) {
    const trainTicketSegmentRelation = orderInfo.ExtendList?.find(
      (item) => item.Key === 'TrainTicketSegmentRelation'
    )?.Value;

    const multipleBookingAndGrabSegmentation = orderInfo.ExtendList?.find(
      (item) => item.Key === 'MultipleBookingAndGrabSegmentation'
    )?.Value;
    if (multipleBookingAndGrabSegmentation) return;
    // ReturnTicketStateForWX，RescheduleTicketStateForWX, 0=默认值，未退\未改签 1=部分退票/部分改签 2=全部退票\全部改签
    const isBuyTicketSuccess =
      ['ReturnTicketStateForWX', 'RescheduleTicketStateForWX'].every(
        (key) =>
          orderInfo.ExtendList?.find((item) => item.Key === key)?.Value === '0'
      ) && [6, 7, 8].includes(orderInfo.OrderStatus);
    if (trainTicketSegmentRelation) {
      const trainTicketSegmentRelationList = JSON.parse(
        trainTicketSegmentRelation
      );
      if (trainTicketSegmentRelation) {
        const isCombiSeat = JSON.parse(trainTicketSegmentRelation)?.every(
          (item) => item.isCombinSeat
        );
        if (isCombiSeat) {
          const subChangeTitList = trainTicketSegmentRelationList.map(
            (item) => {
              if (
                item.combinSeatChangeTrainNum &&
                item.combinSeatChangeTrainStation
              ) {
                return `，<font style="color:#0086F6">${item.combinSeatChangeTrainStation}</font>车次号变更为<font style="color:#0086F6">${item.combinSeatChangeTrainNum}</font>`;
              }
              return '';
            }
          );
          const tit =
            `在<font style="color:#0086F6">${orderInfo.TicketInfos[0].ArriveStation}</font>需换个座（无需下车）` +
            subChangeTitList.join('');
          const combiJourneyInfo = {
            isCross: false,
            isCombi: isBuyTicketSuccess,
            tit,
            isSameTrain: true,
            fSeat: `第1程 ${orderInfo.TicketInfos[0]?.SeatName}`,
            sSeat: `第2程 ${orderInfo.TicketInfos[1]?.SeatName}`,
            stations: [
              orderInfo.TicketInfos[0]?.DepartStation,
              orderInfo.TicketInfos[0]?.ArriveStation,
              orderInfo.TicketInfos[1]?.ArriveStation,
            ],
          };
          this.setData({ combiJourneyInfo });
        }
      }
    }
  },

  getThenByTicketJourney(orderInfo) {
    if (
      ['全部退票', '已退票'].includes(
        orderInfo.OrderStatusBarInfo?.StatusName
      ) ||
      ![6, 7, 8].includes(orderInfo.OrderStatus)
    ) {
      this.setData({
        curThenByTicketInfo: null,
        hideTicketEntrance: false,
      });
      return;
    }
    const multipleBookingAndGrabSegmentation = orderInfo.ExtendList?.find(
      (item) => item.Key === 'MultipleBookingAndGrabSegmentation'
    )?.Value;
    if (multipleBookingAndGrabSegmentation) {
      this.setData({
        curThenByTicketInfo: null,
        hideTicketEntrance: false,
      });
      return;
    }
    const onTrainThenByTicketSolu = orderInfo.ExtendList?.find(
      (item) => item.Key === 'OnTrainThenByTicketSolu'
    )?.Value;
    if (onTrainThenByTicketSolu) {
      const curThenByTicketInfo = getThenByTicketInfo(
        JSON.parse(onTrainThenByTicketSolu),
        'DEFAULT'
      );
      const originInfo = curThenByTicketInfo.originInfo;
      const { recommendArriveType, recommendDepartType } = curThenByTicketInfo;
      // 上车补
      if (recommendArriveType < 0 && recommendDepartType === 0) {
        curThenByTicketInfo.pickUpTip = `上车后请找列车员补票至<span style="color: #0086F6;">${originInfo.originArriveStation}站</span>`;
        //   curThenByTicketInfo.pickUpTip = `上车必须补票，请遵守铁路政策服从列车员安排！<span style='color:#ff7700;'>利用“买短乘长”恶意逃票属违法行为</span>，情节严重需承担法律责任 `;
        curThenByTicketInfo.orderSuperTag = '上车补';
        curThenByTicketInfo.jumpUrl =
          'https://m.ctrip.com/webapp/train/activity/orderservice/InsuranceDetail.aspx?ProductID=5433&terminal=1';
      } else if (recommendDepartType > 0) {
        const checkStr = originInfo.originTicketCheck
          ? `检票口：<span style="color: #0086F6;">${originInfo.originTicketCheck}</span>`
          : `临近发车时更新检票口`;
        // 前跨
        curThenByTicketInfo.pickUpTip = `请于 <span style="color: #0086F6;">${originInfo.originDepartTime}</span> 在 <span style="color: #0086F6;">${originInfo.originDepartStation}站</span> 上车，${checkStr}`;
        curThenByTicketInfo.orderSuperTag = '前跨多买';
      } else if (recommendArriveType > 0) {
        // 后跨
        curThenByTicketInfo.pickUpTip = `请于 <span style="color: #0086F6;">${originInfo.originArriveTime}</span> 在 <span style="color: #0086F6;">${originInfo.originArriveStation}站</span> 下车`;
        curThenByTicketInfo.orderSuperTag = '后跨多买';
      }
      const hideTicketEntrance = curThenByTicketInfo.crossType === 'FRONT';
      this.setData({
        curThenByTicketInfo,
        hideTicketEntrance,
      });
    }
  },

  formatOrderDate(orderInfo) {
    let order;
    // 改签票、原始票及中转票 统一格式时间和车站
    if (
      orderInfo.RescheduleTicketList &&
      orderInfo.RescheduleTicketList.length
    ) {
      // 改签票
      order = orderInfo.RescheduleTicketList[0];
      shared.orderinfos = {
        time: {
          arriveTime: new Date(
            (order.ArriveDate + ' ' + order.ArriveTime).replace(/-/g, '/')
          ).getTime(),
          departTime: new Date(
            (order.DepartDate + ' ' + order.DepartTime).replace(/-/g, '/')
          ).getTime(),
        },
        station: {
          departStation: order.DepartStation,
          arriveStation: order.ArriveStation,
        },
      };
    } else {
      if (
        orderInfo.TicketInfos.length > 1 &&
        orderInfo.TicketInfos[0].DepartStation !==
          orderInfo.TicketInfos[1].ArriveStation
      ) {
        // 中转票
        order = orderInfo.TicketInfos;
        shared.orderinfos = {
          time: {
            departTime: new Date(
              (order[0].DepartDate + ' ' + order[0].DepartTime).replace(
                /-/g,
                '/'
              )
            ).getTime(),
            arriveTime: new Date(
              (order[1].ArriveDate + ' ' + order[1].ArriveTime).replace(
                /-/g,
                '/'
              )
            ).getTime(),
          },
          station: {
            departStation: order[0].DepartStation,
            arriveStation: order[1].ArriveStation,
          },
        };
      } else {
        this.setData({
          isRoundTrip: true,
        });
        // 原始票及往返票
        order = orderInfo.TicketInfos[0];
        shared.orderinfos = {
          time: {
            arriveTime: new Date(
              (order.ArriveDate + ' ' + order.ArriveTime).replace(/-/g, '/')
            ).getTime(),
            departTime: new Date(
              (order.DepartDate + ' ' + order.DepartTime).replace(/-/g, '/')
            ).getTime(),
          },
          station: {
            departStation: order.DepartStation,
            arriveStation: order.ArriveStation,
          },
        };
      }
    }
  },
  getExtendValue(orderInfo) {
    let extendValues = {};
    if (!orderInfo.ExtendList?.length) {
      this.setData({ extendValues });
    } else {
      orderInfo.ExtendList.forEach((item) => {
        if (item.Value) {
          try {
            if (item.Key == 'ticketallowanceactivityalert') {
              //额外处理下金额
              let info = JSON.parse(item.Value);
              let contents = info.content.split('¥');
              info.content = contents[0];
              info.award = contents[1];
              extendValues.ticketallowanceactivityalert = info;
            }
            if (item.Key == 'ETicketGuidUserCheckFace') {
              let info = JSON.parse(item.Value);
              try {
                info.Desc = info.Desc.replace(/&lt;/g, '<');
                info.Desc = info.Desc.replace(/&gt;/g, '>');
              } catch (e) {
                console.log(e);
              }
              extendValues.ETicketGuidUserCheckFace = info;
            } else if (
              item.Key === 'WXYellowTip' ||
              item.Key === 'PointOrder'
            ) {
              extendValues[item.Key] = item.Value;
            } else {
              try {
                // 可能富文本
                extendValues[item.Key] = JSON.parse(item.Value);
              } catch (error) {
                extendValues[item.Key] = item.Value;
              }
            }
          } catch (error) {
            console.error('getExtendvalues', error);
          }
        }
        this.setData({ extendValues });
      });
    }
  },
  getTransitSplitInfo() {
    let TRANSITSTORE = TrainActStore.getAttr('TrainTransferInfosStore') || [];
    if (TRANSITSTORE.length) {
      TRANSITSTORE.forEach((item) => {
        if (item.oid == this.store.data.oid) {
          let transitInfo = item.trainTransferInfos.find(
            (transit) =>
              transit.TrainNumber !==
              this.data.orderInfo.TicketInfos[0].TrainNumber
          );
          this.setData({
            transitInfo,
          });
        }
      });
    }
  },
  toBookingTransit() {
    const tmp = this.data.transitInfo;
    shared.train = tmp;
    cwx.navigateTo({
      url: '/pages/trainBooking/booking/ordinary/index',
    });
    let TRANSITSTORE = TrainActStore.getAttr('TrainTransferInfosStore') || [];
    TRANSITSTORE.forEach((item) => {
      if (item.oid == this.store.data.oid) {
        item.trainTransferInfos = '';
      }
    });
  },
  getVerifyOrderPayTypeInfo(FromType) {
    const deferred = util.getDeferred();
    const params = {
      channelName: 'wx',
      OrderNumber: this.store.data.oid,
      FromType,
    };
    GetVerifyOrderPayTypeInfoModel(params, (res) => {
      if (res.RetCode == 1) {
        deferred.resolve(res);
      } else {
        deferred.reject();
      }
    });

    return deferred.promise;
  },
  getRewardInfo() {
    return getRewardInfo({
      Channel: 'ctripwx',
      OrderType: this.store.data.OrderType,
      OrderNumber: this.store.data.oid,
    }).then((res) => {
      if (res.RetCode == 1 && res.RewardAmountList) {
        const { RewardAmountList, RewardInfo } = res;
        this.update({
          rewardInfo: {
            RewardAmountList,
            ...RewardInfo,
          },
        });
      }
    });
  },
  getRegister12306UserInfo() {
    return GetRegister12306UserInfoPromise({
      OrderNumber: this.oid,
    })
      .then((data) => {
        if (data.RetCode === 1 && data.IsSuccess) {
          this.setData({
            register12306UserInfo: {
              ...data,
              isShow: true,
            },
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getRegister12306UserInfoConfig() {
    return getConfigInfoJSON('ctrip_wechat_order_12306_modal')
      .then((res) => {
        this.setData({
          openRegister12306UserInfoConfig: res.isOpen,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  },

  showRewardPop() {
    this.setData({ popType: 'reward' });
  },
  getCashBackCouponInfo() {
    GetOrderCashBackCouponInfoModel(
      {
        OrderNumber: this.oid,
        ChannelName: 'ctripwx',
      },
      (res) => {
        if (res.RetCode == 1) {
          const { IsShow, Title, Desc, JumpUrl, IconUrl, StatusCode } = res;
          this.setData({
            cashBackCouponInfo: {
              IsShow,
              Title,
              Desc,
              JumpUrl,
              IconUrl,
              StatusCode,
            },
          });
          this.ubtTrace(
            'train_detail_cashwithdrawent',
            this.data.cashBackCouponInfo?.IsShow
          );
        }
      }
    );
  },

  showWithdrawTip() {
    this.setData({
      popType: 'withdrawTip',
    });
  },
  getUserAccountInfo() {
    return getUserAccountInfo({
      UserName123: this.store.data.orderInfo.UserId12306,
    })
      .then((res) => {
        if (res.RetCode !== 1) {
          return;
        } else {
          const { PointUseTotal } = res;
          this.setData({
            pointUseTotal: PointUseTotal,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getBargainInfo() {
    return getBargainInfo({
      OrderNumber: this.store.data.oid,
      Channel: 'wx',
    }).then((res) => {
      if (res.RetCode !== 1) {
        return;
      } else {
        const {
          IsShow,
          CashBackEndTime,
          CashBackSumAmount,
          GainSumAmount,
          Status,
          FailReason,
          ActivityType,
          Title,
          SubTitle,
          ButtonName,
        } = res;
        if (!IsShow) {
          this.setData({
            bargainInfo: null,
          });

          return;
        }

        util.ubtTrace('s_trn_c_trace_10650037941', {
          bizKey: 'bargainFixedPosExposure',
          orderid: this.data.orderInfo?.OrderId,
        });

        this.ubtTrace('c_train_wx_kanjia_bannershow', true);

        let desc = '';
        let amount = 0;
        let btnText = '';
        let countdown = {
          ...defaultCountdownObj,
        };
        let CashBackSumAmountFloat =
          +CashBackSumAmount < 10
            ? '0' + (+CashBackSumAmount).toFixed(2)
            : (+CashBackSumAmount).toFixed(2);
        let CashBackSumAmountArr = CashBackSumAmountFloat.split('');

        CashBackSumAmountArr.splice(2, 1);

        clearInterval(this.bargainId);
        if (Status <= 1) {
          this.setBargainInterval(CashBackEndTime);
          if (Status == 0) {
            this.showType = 'BARGAIN';
          }
        }
        if (Status === 0) {
          amount = CashBackSumAmount;
          desc = '参与砍价，可返现';
          btnText = '去砍价';
        } else if (Status === 1) {
          amount = GainSumAmount;
          desc = '目前已砍';
          btnText = '继续砍价';
        } else {
          btnText = '去查看';
          if (Status >= 2 && Status <= 5) {
            desc = '恭喜！砍得';
            amount = GainSumAmount;
          } else {
            desc = FailReason;
          }
        }
        this.setData({
          bargainInfo: {
            IsShow,
            CashBackEndTime,
            CashBackSumAmount,
            GainSumAmount,
            Status,
            FailReason,
            desc,
            amount,
            btnText,
            countdown,
            ActivityType,
            Title,
            SubTitle,
            ButtonName,
            CashBackSumAmountArr,
          },
        });
      }
    });
  },
  goBargain() {
    util.ubtTrace('c_trn_c_10650037941', {
      bizKey: 'bargainFixedPosClick',
      orderid: this.data.orderInfo?.OrderId,
    });
    this.setData({
      popType: '',
    });
    if (this.data.bargainInfo?.ActivityType == 2) {
      this.navigateTo({
        url:
          '../../2020fanxian/index?OrderNumber=' +
          this.store.data.oid +
          '&OrderType=' +
          this.data.orderInfo.OrderType +
          '&Entrance=1',
      });
    } else {
      this.navigateTo({
        url:
          '../../2019fanxian/index?OrderNumber=' +
          this.store.data.oid +
          '&OrderType=' +
          this.data.orderInfo.OrderType +
          '&Entrance=1',
      });
    }
  },
  setBargainInterval(CashBackEndTime) {
    if (!CashBackEndTime) return;
    const year = CashBackEndTime.substring(0, 4);
    const month = CashBackEndTime.substring(4, 6) - 1;
    const day = CashBackEndTime.substring(6, 8);
    const hour = CashBackEndTime.substring(8, 10);
    const min = CashBackEndTime.substring(10, 12);
    const second = CashBackEndTime.substring(12, 14);
    let time =
      (new Date(year, month, day, hour, min, second, 0) - Date.now()) / 1000;
    setTimeout(() => {
      this.doBargainInterval(time);
    }, 0);
    let inPageInterval = util.safeInPageTimerFn(setInterval, this.route);
    this.bargainId = inPageInterval(() => {
      time -= 1;
      this.doBargainInterval(time);
    }, 1000);
  },
  doBargainInterval(time) {
    if (time <= 0) {
      this.setData({
        'bargainInfo.countdown': {
          ...defaultCountdownObj,
        },
      });
      this.getBargainInfo();
      clearInterval(this.bargainId);

      return;
    }
    let hour = String(Math.floor(time / 3600));
    let min = String(Math.floor((time - hour * 3600) / 60));
    let second = String(Math.floor(time - hour * 3600 - min * 60));
    hour = util.pad(hour);
    min = util.pad(min);
    second = util.pad(second);
    this.setData({
      'bargainInfo.countdown': {
        hour,
        min,
        second,
        txt: '后结束',
      },
    });
  },
  // 获取候补票显示默认状态
  getHbHandle() {
    const param = {
      ConfigKey: 'train_wx_orderdetail_hbp_entry',
    };

    return ConfigInfoPromise(param)
      .then((data) => {
        this.setData({
          HBHandle: JSON.parse(data.ConfigInfo.Content),
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  /**
   * 将 OrderInfo 里候补相关信息进行格式化
   */
  setHBInfo(orderInfo) {
    if (!orderInfo.HBGrabInfo) {
      return;
    }
    const {
      HBGrabInfo: { HBTask },
    } = orderInfo;
    if (!HBTask) {
      return;
    }
    const [dates, route, HBAllTrainNumbers, HBAllSeatNames] = HBTask.split('|');
    const list = [];
    addToList('行程', dates + ' ' + route);
    addToList('车次', HBAllTrainNumbers);
    addToList('座席', HBAllSeatNames);
    addToList(
      '乘客',
      orderInfo.TicketInfos[0].PassengerInfos.map(
        (item) => item.PassengerName
      ).join(',')
    );
    addToList('手机', orderInfo.UserInfo.ContactMobile);
    orderInfo.HBGrabInfo.frontProps = {
      list,
      taskTab: 'rob',
    };
    function addToList(label, txt) {
      list.push({
        label,
        txt,
      });
    }
  },
  /**
   * 格式化 orderInfo 的日期信息
   */
  formatOrderInfo(orderInfo) {
    if (!orderInfo || !orderInfo.RescheduleTicketList) {
      return;
    }
    orderInfo.RescheduleTicketList.forEach((item) => {
      let departTime = new cDate(item.DepartTime.replace(/\-/g, '/'));
      item.rescheduledDepartTime = departTime.format('H:i');
      item.rescheduledDepartDate = departTime.format('m月d日');

      let arriveTime = new cDate(item.ArriveTime?.replace(/\-/g, '/'));
      item.rescheduledArriveTime = arriveTime.format('H:i');
      item.rescheduledArriveDate = arriveTime.format('m月d日');

      let tktEntrace = item.ReschedulePassengerList[0]?.TicketEntrance;
      if (tktEntrace) {
        item.TicketEntrance = tktEntrace.replace(
          /(检票口|候车地点)[:|：]?/,
          ''
        );
      }
    });

    //
    orderInfo.TicketInfos.forEach((item, index) => {
      let DepartDateStr = util.formatDatemd(item.DepartDate);
      if (!DepartDateStr) {
        DepartDateStr = new cDate(item.DepartDate).format('m月d日');
      }
      let ArriveDateStr = util.formatDatemd(item.ArriveDate);
      if (!ArriveDateStr) {
        ArriveDateStr = new cDate(item.ArriveDate).format('m月d日');
      }
      orderInfo.TicketInfos[index].DepartDateStr = DepartDateStr;
      orderInfo.TicketInfos[index].ArriveDateStr = ArriveDateStr;
      let checkIn = item.TicketEntrance;
      let diff = shared.orderinfos.time.departTime - Date.now();
      const isSuccess = [6, 7, 8].includes(orderInfo.OrderStatus);

      if (checkIn) {
        checkIn = checkIn.replace(/(检票口|候车地点)[:|：]?/, '');
        item.TicketEntrance = checkIn;
      }

      // 距离发车小于24小时 更新检票口信息
      if (diff > 0 && diff < 24 * 3600 * 1000 && isSuccess) {
        this.getTicketEntrance({
          OrderNumber: this.store.data.oid,
          StationName: orderInfo.TicketInfos[index].DepartStation,
          TrainNo: orderInfo.TicketInfos[index].TrainNumber,
          DepartDate: orderInfo.TicketInfos[index].DepartDate,
        })
          .then((data) => {
            checkIn = data.replace(/(检票口|候车地点)[:|：]?/, '');
            item.TicketEntrance = checkIn;
          })
          .catch((e) => {
            console.log(e);
          });
      }
      // 解析乘客身份证件号码
      try {
        orderInfo.TicketInfos[index].PassengerInfos.forEach((psg) => {
          psg.IDCardNumber = cwx.util.base64Decode(psg.IDCardNumberAES);
        });
        orderInfo.RescheduleTicketList?.[
          index
        ]?.ReschedulePassengerList?.forEach((psg) => {
          psg.IDCardNumber = cwx.util.base64Decode(psg.IDCardNumberAES);
        });
      } catch (e) {
        console.log(e);
      }
    });
  },
  getTicketEntrance({ OrderNumber, StationName, TrainNo, DepartDate }) {
    const deferred = util.getDeferred();
    const params = {
      OrderNumber,
      StationName,
      TrainNo,
      DepartDate,
    };
    GetTicketEntranceModel(params, (res) => {
      console.log(res);
      if (res.RetCode == 1) {
        deferred.resolve(res.Entrance);
      } else {
        deferred.reject();
      }
    });

    return deferred.promise;
  },
  /**
   * 设置 orderFlags
   * @param {Object} o orderInfo
   */
  setOrderFlags(o) {
    let isSuccess =
      ((o.OrderType == 'E' || o.OrderType == 'P') && o.OrderStatus == 8) ||
      o.OrderStatusName == '购票成功' ||
      (o.OrderType == 'P' && o.OrderStatus == 6);

    const orderFlags = Object.assign({}, defaultOrderFlags);
    orderFlags.countdownOrderTips =
      o.IsPreHoldSeat && o.OrderStatus == 1 && o.EnablePayOrder;
    orderFlags.activity = isSuccess;
    orderFlags.altInfo = isSuccess;
    // 显示更新购票进度时不显示购买返程按钮
    orderFlags.hasReturned = /全部退票|已退票/.test(o.OrderStatusName);

    orderFlags.isShowBuyReturn =
      !orderFlags.hasReturned &&
      isSuccess &&
      o.TicketInfos.length < 2 &&
      o.OrderStatus != 5;

    console.log('isShowBuyReturn----', orderFlags.isShowBuyReturn);

    orderFlags.isShowBuyAgain =
      !orderFlags.isShowBuyReturn && (o.OrderStatus == 8 || o.OrderStatus == 9);

    orderFlags.isShowRobSame =
      o.FailReason &&
      (o.FailReason.indexOf('已售完') > -1 ||
        o.FailReason.indexOf('无票') > -1 ||
        o.FailReason.indexOf('余票不足') > -1 ||
        o.FailReason.indexOf('没有足够的票') > -1)
        ? true
        : false;
    orderFlags.isTimeOut = /订单超时/.test(o.OrderStatusName);
    orderFlags.isSuccess = [6, 7, 8].includes(o.OrderStatus); // 购票成功 有个阶段前端显示购票中
    orderFlags.paidSuccess =
      /支付成功/.test(o.OrderStatusBarInfo?.StatusName) || o.OrderStatus == 4;
    orderFlags.isPreHolding = o.OrderStatusBarInfo?.StatusType === 1; // 扣位中订单
    orderFlags.isShowHotelSuccess =
      orderFlags.isSuccess &&
      o.OrderStatusName !== '已退票' &&
      o.OrderStatusName !== '已取消';
    this.setData({
      ...orderFlags,
    });
    util.setNavigationBarColor({
      backgroundColor: '#0086F6',
      frontColor: '#ffffff',
    });
    wx.setBackgroundColor({
      backgroundColor: '#0086F6',
    });
    if (orderFlags.isShowRobSame) {
      this.ubtTrace(101977, {
        c: 1,
      });
    }

    if (orderFlags.isSuccess) {
      this.setEntranceTipStatus();
    }

    return Promise.resolve();
  },
  setEntranceTipStatus() {
    let diff = shared.orderinfos.time.departTime - Date.now();
    if (diff > 0 && diff < 24 * 3600 * 1000) {
      this.setData({ entranceTipShow: true });
      setTimeout(() => {
        this.setData({ entranceTipShow: false });
      }, 2000);
    }
  },
  setOrderStatus(o) {
    if (
      !o.IsFastPay &&
      o.OrderStatus == 1 &&
      !o.EnablePayOrder &&
      (o.OrderType === 'CZL' || o.OrderType === 'DZL')
    ) {
      if (o.OrderType === 'CZL' || o.OrderType === 'DZL') {
        this.setData({
          ZLTopMessage: '请到手机携程中操作该订单',
        });
        o.OrderStatusName = '待支付';
      }
    } else if (o.IsPreHoldSeat && o.OrderStatus == 1 && !o.EnablePayOrder) {
      this.setData({
        preHoldingMesssage: '正在为您占座，请耐心等待',
      });
      this.getPreholdResult();
    } else if (o.IsPreHoldSeat && o.OrderStatus == 1 && o.EnablePayOrder) {
      this.count(o);
    } else if (o.OrderStatus == 5 || o.OrderStatus == 4) {
      this.setData({ bookTips: '' });
    } else if (o.OrderStatus == 8 && this.isRefunding(o)) {
      this.setData({ bookTips: '' });
      this.autoload();
    } else {
      try {
        clearInterval(this.autoid);
        this.setData({ bookTips: '' });
      } catch (e) {}
    }
    let cusTotalPrice = 0;
    let firstTicket = o.TicketInfos[0];
    for (let j = 0; j < firstTicket.PassengerInfos.length; j++) {
      let onePas = firstTicket.PassengerInfos[j];
      if (onePas.RealTicketInfo) {
        cusTotalPrice += parseFloat(onePas.RealTicketInfo.DealTicketPrice);
      }
    }
    if (!cusTotalPrice) {
      cusTotalPrice = firstTicket.TicketPrice * firstTicket.TicketCount;
    }
    o.cusTotalPrice = cusTotalPrice;
    this.update({
      orderInfo: o,
    });
  },
  isRefunding(o) {
    let tmp = false;
    let route = o.TicketInfos[0];
    let tickets = route?.PassengerInfos || [];
    tickets.forEach((t) => {
      if (
        t.RealTicketInfo?.TicketStatusCode == 2 ||
        t.RealTicketInfo?.TicketStatusCode == '退票处理中'
      ) {
        tmp = true;
      }
    });

    return tmp;
  },
  loadData(orderId) {
    this.loadFinish = false;
    if (!this.data.isLandingView) {
      util.showLoading('加载订单信息');
    }
    setTimeout(function () {
      if (!this.loadFinish) {
        util.hideLoading(); //防止超时无响应
      }
    }, 2000);
    this.store
      .loadData(orderId)
      .then((res) => {
        console.log('刷星');
        this.loadFinish = true;
        this.loadDataUpdate(res.OrderInfo);
        setTimeout(function () {
          util.hideLoading();
        }, 600);
      })
      .catch(() => {
        util.hideLoading();
        console.error('加载订单信息失败');
      });
  },

  setElecTicketPop(orderInfo) {
    let _PassengerInfos = [];
    let { TicketInfos } = orderInfo;

    TicketInfos.forEach((item) => {
      let { PassengerInfos } = item;
      PassengerInfos.forEach((pas) => {
        _PassengerInfos.push(pas);
      });
    });

    if (
      _PassengerInfos.every(
        (item) =>
          item.TicketType == 1 &&
          (item.IdentityTypeName == '身份证' ||
            item.IdentityTypeName == '港澳台居民居住证' ||
            item.IdentityTypeName == '外国人永久居留身份证')
      )
    ) {
      this.setData({
        elecTicketPopType: 1,
      });
    } else if (
      !_PassengerInfos.some(
        (item) =>
          item.TicketType == 1 &&
          (item.IdentityTypeName == '身份证' ||
            item.IdentityTypeName == '港澳台居民居住证' ||
            item.IdentityTypeName == '外国人永久居留身份证')
      )
    ) {
      this.setData({
        elecTicketPopType: 2,
      });
    } else {
      const SelfHelp = ['身份证', '港澳台居民居住证', '外国人永久居留身份证'];
      const ArtificialCard = ['护照', '回乡证', '台胞证'];
      const ArtificialType = ['学生票', '儿童票'];
      let Arr1 = [];
      let Arr2 = [];

      _PassengerInfos.forEach((item) => {
        if (SelfHelp.includes(item.IdentityTypeName)) {
          Arr1.push(item.IdentityTypeName);
        }
        if (ArtificialType.includes(item.TicketTypeName)) {
          Arr2.push(item.TicketTypeName);
        }
        if (ArtificialCard.includes(item.IdentityTypeName)) {
          Arr2.push(item.IdentityTypeName);
        }
      });

      Arr1 = Array.from(new Set(Arr1));
      Arr2 = Array.from(new Set(Arr2));

      this.setData({
        elecTicketPopType: 3,
        elecTicketPopText: [Arr1.join(','), Arr2.join(',')],
      });
    }
  },
  /**
   * 候补票已满弹窗按钮回调
   */
  HBGoOrderChange(e) {
    const { type = '' } = e.currentTarget.dataset;
    this.setData({
      'HBFullModal.show': false,
    });
    if (type === 'hide') {
      return;
    }
    this.goOrderChange();
  },
  HBPayModallCallback(e) {
    const { type = '' } = e.currentTarget.dataset;
    this.setData({
      'HBPayModal.show': false,
    });
    if (type === 'now') {
      this.prePay();
    }
  },
  autoload() {
    clearInterval(this.autoid);
    this.autoid = setInterval(() => {
      this.loadData(this.store.data.oid);
    }, 10000);
  },
  count(orderInfo) {
    clearInterval(this.countId);
    let bookTips = '';

    let lastPayTime = parseInt(
      cDate.parse(orderInfo.LastPayTime).getTime() / 1000
    );
    let now = parseInt(new cDate().getTime() / 1000);

    if (now >= lastPayTime) return;

    this.countId = setInterval(() => {
      now = parseInt(new cDate().getTime() / 1000);
      if (now >= lastPayTime) {
        bookTips = '';
        clearInterval(this.countId);
        this.setData({ bookTips });
        setTimeout(() => {
          this.loadData(this.store.data.oid);
        }, 1000);

        return;
      }

      let minute = util.pad(parseInt((lastPayTime - now) / 60));
      let second = util.pad(parseInt((lastPayTime - now) % 60));
      bookTips = minute + '分' + second + '秒';
      this.setData({ bookTips });
    }, 1000);
  },
  loadConfig() {
    let k = '';
    if (shared.isTrainApp) {
      k = 'train_wx_train_daigoushareswitch';
    } else if (shared.isCtripApp) {
      k = 'train_wx_daigoushareswitch';
    }
    if (k) {
      commonApi
        .setConfigSwitchAsync(k, 'daigoushareswitch')
        .then(([res, key]) => {
          let data = {};
          data[key] = res;
          this.setData(data);
        });
    }

    setConfigSwitchAsyncPromise(
      'train_wx_orderdetail_guessbox',
      'guessbox'
    ).then(([res]) => {
      this.setData({
        guessBoxFlag: res,
      });
    });

    setConfigSwitchAsyncPromise('train_wx_collect_toggle').then(([res]) => {
      this.setData({
        collectFlag: res,
      });
    });

    this.getTextInfoAbout12306();
    this.getHBUrlConfig();
    this.getShareEntranceConfig();
    this.getFeConfigInfos();
  },
  getFeConfigInfos() {
    const params = {
      keys: ['ctrip-scan-face-checkbox-flag', 'mini-detail-ordinary'],
    };
    getConfigByKeysPromise(
      params,
      (data) => {
        if (data.resultCode != 1) {
          throw data.resultMessage;
        }

        data.configs.forEach(({ key, data }) => {
          switch (key) {
            case 'ctrip-scan-face-checkbox-flag':
              const { needCheck } = data;
              this.setData({
                scanFaceNeedCheck: needCheck,
                protocalToogle: !needCheck,
              });
              break;
            case 'mini-detail-ordinary':
              this.initEffectConfig(data);
              break;
            default:
              break;
          }
        });
      },
      (err) => {
        console.log(err);
      }
    );
  },
  async initEffectConfig(data) {
    const { RetCode, ResultMessage, UserInfoList } = await util.promisifyModel(
      GetBindAccountInfoModel
    )({});
    const username = !UserInfoList?.length ? '' : UserInfoList[0].UserName;

    const shutDownUrl = (url, orderInfo) => {
      if (!orderInfo.TicketInfos?.length) return '';

      const { DepartStation, ArriveStation, DepartDate } =
        orderInfo.TicketInfos[0];

      return `${url}&fromStation=${DepartStation}&toStation=${ArriveStation}&fromDate=${DepartDate}`;
    };
    const bigscreenUrl = (url, orderInfo) => {
      if (!orderInfo.TicketInfos?.length) return '';

      const { DepartStation } = orderInfo.TicketInfos[0];

      return `${url}&queryStationName=${DepartStation}&arriveFlag=0`;
    };
    const keyPassengerUrl = (url, username) => {
      return username ? `${url}&userName=${username}` : '';
    };

    const o = this.store.data.orderInfo;
    const list = data.funcToolsEntrance.list
      .map((v) => {
        const { key, link } = v;
        let _link = link;

        if (key === 'shutdown') {
          _link = shutDownUrl(link, o);
        }
        if (key === 'bigscreen') {
          _link = bigscreenUrl(link, o);
        }
        if (key === 'keyPassenger') {
          _link = keyPassengerUrl(link, username);
        }
        return { ...v, link: _link };
      })
      .filter((v) => v.link || v.key === 'more');

    this.setData({
      effectConfig: {
        ...data,
        funcToolsEntrance: { ...data.funcToolsEntrance, list },
      },
    });

    // 埋点
    if (data.funcToolsEntrance.isShow) {
      list.forEach((t) =>
        util.ubtFuxiTrace('TCWDetail_GridModule_exposure', {
          PageId: shared.pageIds.orderdetail.pageId,
          Type: t.name,
        })
      );
    }

    // 记录接口异常
    if (RetCode === 0) {
      throw new Error(ResultMessage);
    }
  },
  getHBUrlConfig() {
    getConfigInfoJSON('train_wx_orderdetail_hbintro')
      .then((res) => {
        this.setData({
          ruleUrl:
            res.url ||
            'https://pages.ctrip.com/ztrip/document/pyy-hbp.html?autoawaken=close&popup=close&__ares_maxage=3m&from=banner',
        });
      })
      .catch((e) => {
        console.log(e);
      });
  },
  loadGetOnList(orderInfo) {
    const TicketInfo = util.getTicketInfo({
      orderInfo,
    });
    if (!TicketInfo) {
      return;
    }

    this.setData({
      getOnQueryDate: TicketInfo.DepartDate,
    });
    const params = {
      DepartStation: TicketInfo.DepartStation,
      ArriveStation: TicketInfo.ArriveStation,
      DepartDate: cDate.parse(TicketInfo.DepartDate).format('Ymd'),
      MainTrainNums: '',
      FromType: 0, // 列表页传 0
    };

    return GetOnTrainThenByTicketSoluPromise(params)
      .then((data) => {
        if (data.ResultCode == 0) {
          return data.GetOnTrainThenByTicketSoluList.slice(0, 2);
        }
      })
      .then((list) => {
        this.setData({
          GetOnTrainThenByTicketSoluList: list,
        });

        return list;
      })
      .catch((e) => {
        console.error(e);
      });
  },
  getBannerUrl() {
    const params = {
      ConfigKey: 'train_wx_orderdtail_banner_imgurl',
    };

    return ConfigInfoPromise(params)
      .then((data) => {
        if (data.ConfigInfo && data.ConfigInfo.Content) {
          this.setData({
            orderBannerImg: data.ConfigInfo.Content,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },
  // 获取酒店显示默认状态
  getHotelHandle() {
    const param = {
      ConfigKey: 'train_wx_orderdetail_hotel_entry',
    };

    return ConfigInfoPromise(param)
      .then((data) => {
        this.setData({
          ['hotelConfig.handle']: JSON.parse(data.ConfigInfo.Content).open,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getAIQuestionList(orderInfo) {
    const { OrderId = '', OrderStatus = '', FailReason = '' } = orderInfo;
    const params = {
      Channel: 'ctripwx',
      PageId: shared.pageIds.orderdetail.pageId,
      NoTicketReason: FailReason || '',
      OrderInfo: {
        OrderId,
        OrderStatus,
        UserInfo: {
          Uid: cwx.user.auth,
        },
      },
    };
    ChatScence(
      params,
      (data) => {
        if (data.Status == 'SUCCESS' && data.ScenceInfos) {
          let QuestionList = data.ScenceInfos.filter(
            (item) => !!item.ScenceContent
          ).map((item) => {
            return {
              ...item,
              Content: !!item.ScenceContent && item.ScenceContent,
            };
          });
          this.setData({
            QuestionList,
            QuestionsUrl: data.MoreQuestionJumpUrl || '',
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  },
  getPreholdResult() {
    const params = {
      UserId: cwx.user.auth,
      OrderNumber: this.store.data.oid,
    };

    return PreHoldSeatResultPromise(params)
      .then((data) => {
        if (data.RetCode == 1) {
          // 前置扣位失败，异常
          this.loadData(this.store.data.oid);
        } else if (data.RetCode == 0) {
          setTimeout(() => {
            this.setData({
              preHoldPercent: 99,
            });
            this.setData({
              preHoldingMesssage: '',
            });
            this.loadData(this.store.data.oid);
          }, 500);
        } else {
          if (this.data.preHoldPercent < data.HoldSchedule) {
            this.setData({
              preHoldPercent: data.HoldSchedule, // 后台返回的扣位进度
            });
          }
          let i = 0;
          let span = 151;
          // 根据后台返回值决定多久时间后再次请求，如无返回值，默认为 5
          let totalSpan = (data.RequestRate > 0 ? data.RequestRate : 5) * 1000;
          const action = () => {
            let preHoldPercent = this.data.preHoldPercent;
            preHoldPercent < 99 ? (preHoldPercent += 1) : 99;
            this.setData({
              preHoldPercent: preHoldPercent,
            });
          };
          const route = cwx.getCurrentPage().route;
          const waitFn = () => {
            if (i * span < totalSpan) {
              i++;

              const { promise, timeoutId: preholdSeatId } = util.wait(
                span,
                route
              );
              this.preholdSeatId = preholdSeatId;

              return promise.then(action).then(waitFn);
            } else {
              return this.getPreholdResult(this.store.data.oid);
            }
          };

          return waitFn();
        }
      })
      .catch((e) => {
        console.log(e);
      });
  },
  getTextInfoAbout12306() {
    const param = {
      ConfigKey: 'train_wx_orderdetail_12306text',
    };

    return ConfigInfoPromise(param)
      .then((data) => {
        console.log(data);
        const textConfigAbout12306 = JSON.parse(data.ConfigInfo.Content);
        this.setData({ textConfigAbout12306 });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  getBoardNoticeTitile() {
    const params = {
      ConfigKey: 'train_wx_orderdtail_boardNoticeTitile',
    };

    return ConfigInfoPromise(params)
      .then((data) => {
        if (data.ConfigInfo && data.ConfigInfo.Content) {
          this.setData({
            boardNoticeTitile: data.ConfigInfo.Content,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  },
  handleExpansionList() {
    // 切换样式
    const hasBtn = this.data.orderInfo?.ExpansionList?.some(
      (v) => v.Type === 4
    );
    this.setData({ expansionBtn: hasBtn });
  },
  // 附加产品明细点击申报...
  onClickApply(e) {
    const idx = e.currentTarget.dataset.index;
    const { Type, ApplyStatus, JumpUrl } =
      this.data.orderInfo.ExpansionList[idx];

    if (Type === 4) {
      if (ApplyStatus === 1) {
        const query = {
          showRightBtn: false,
          showLeftBtn: false,
          img: JumpUrl,
        };

        cwx.navigateTo({
          url: `/pages/train/share/share?${util.stringifyQuery(query)}`,
        });
      } else {
        util.showToast('已领取补贴');
      }
    }
  },
  toggleShowExpandList() {
    this.setData({
      showExpansionList: !this.data.showExpansionList,
    });
  },
  goTTOrigin(e) {
    const idx = e.currentTarget.dataset.index;
    util.goTimeTable(this.store.data.orderInfo.TicketInfos[idx], this);
  },
  goTTReschedule(e) {
    const idx = e.currentTarget.dataset.index;
    const rescheduleTicket =
      this.store.data.orderInfo.RescheduleTicketList[idx];
    rescheduleTicket.DepartDate = cDate
      .parse(rescheduleTicket.DepartTime)
      .format('Y-m-d');
    util.goTimeTable(rescheduleTicket, this);
  },
  goQuestionList() {
    this.navigateTo({
      url: '../../service/service',
      data: {
        oid: this.store.data.oid,
        isGetAnswer: false,
      },
    });
  },
  goToBuAnswer(e) {
    let item = e.currentTarget.dataset.item;
    this.navigateTo({
      url: '../../service/service',
      data: {
        item,
        oid: this.store.data.oid,
        isGetAnswer: true,
      },
    });
  },
  clickPay() {
    if (this.store.data.orderInfo.IsCanPointsPay) {
      return this.pointPay();
    }
    this.pay(this.store.data.oid);
  },
  clickTicketBreakOrderChange(e) {
    const { type, id } = e.currentTarget.dataset;
    let productList = [];
    const { TicketInfos = [] } = this.store.data.orderInfo;
    if (id) {
      productList.push({
        AppendID: id,
        AppendCount:
          TicketInfos.length > 1
            ? TicketInfos[0]?.PassengerInfos.length * 2
            : TicketInfos[0]?.PassengerInfos.length,
      });
    }
    let extendInfoList = this.store.data.orderInfo.ExtendList;
    this.orderChangeFastPay(type, productList, extendInfoList);
  },
  clickOrderChangeFastPay(e) {
    let { type } = e.currentTarget.dataset;
    type = type == 3 ? 3 : 1;

    this.orderChangeFastPay(type);
  },
  orderChangeFastPay(type, productList = [], extendInfoList = []) {
    let params = {
      Channel: 'ctripwx',
      OrderNumber: this.store.data.oid,
      ChangeType: type, // ChangeType，1=订单转为海南电子客票  3=购买套餐  6=订单详情购买跳过核验套餐 7=免费转海南
      TrainAppendProductList: productList,
      ExtendInfoList: extendInfoList,
    };
    TrainChangeOrderOuter(
      params,
      (res) => {
        util.hideLoading();
        if (res.RetCode == 1 && res.IsSuccess) {
          this.hidePop();
          this.store.loadData(this.store.data.oid).then((_res) => {
            this.loadDataUpdate(_res.OrderInfo);
            if (params.ChangeType !== 7) {
              this.pay(res.ChangeOrderId);
            }
          });
        } else {
          // 提示错误原因
          util.showModal({ m: '系统异常，请稍后重试' });
        }
      },
      () => {
        // 提示错误原因
        util.showModal({ m: '系统异常，请稍后重试' });
        util.hideLoading();
      }
    );
  },
  inputPwd(e) {
    this.setData({ pwdVal: e.detail.value });
  },
  getFocus() {
    this.setData({ payFocus: true });
  },
  async onClickConfirmPointPop() {
    util.showLoading();
    this.consumePopTrace(1);
    if (this.data.pwdVal.length < 6) {
      return util.showToast('请输入6位消费密码', 'none');
    }
    let res = await this.loopOrderPointPayNotify();
    util.hideLoading();
    console.log(res);
    util.ubtTrace('TCWDetail_SaveSeat_CodePopup_Result', {
      PageId: '10650037941',
      orderId: this.data.orderInfo.OrderId,
      TaskResult: res.PollingResult === 1 ? 1 : 0,
    });
    if (res.RetCode === 1 && res.PollingResult === 1) {
      this.setData({
        popType: '',
        pwdVal: '',
      });
      //密码正确的操作
      util.showToast('兑换成功');
      this.store
        .loadData(this.store.data.oid)
        .then((res) => {
          this.loadDataUpdate(res.OrderInfo);
        })
        .catch((e) => {
          console.log(e);
        });
    } else {
      this.setData({
        popType: 'pointsPayFail',
      });
    }
  },

  async loopOrderPointPayNotify(key = '') {
    const res = await getOrderPointPayNotify({
      PointSecret: util.encodeAES(this.data.pwdVal),
      OrderNumber: this.data.orderInfo.OrderId,
      ChannelName: 'WX',
      Pollingkey: key,
    });
    if (res.RetCode === 1 && res.PollingResult === 3) {
      await util.delay(res.PollingRate * 1000);
      return this.loopOrderPointPayNotify(res.Pollingkey);
    }
    return res;
  },

  paySubmit(e) {
    saveUserFormID(e.detail.formId);
    let orderInfo = this.store.data.orderInfo;
    if (!orderInfo.EnablePayOrder) return;
    if (orderInfo.IsCanPointsPay) {
      this.pointPay();
    } else {
      this.prePay();
      try {
        let orderInfo = this.store.data.orderInfo;
        let fastPayFailInfo = (orderInfo.ExtendList || []).filter(
          (item) => item.Key === 'FastPayFailInfo'
        );
        let info = JSON.parse(fastPayFailInfo);
        if (info.scene === 1 || info.scene === 2) {
          util.ubtTrace('c_trn_c_10650037939', {
            bizKey: 'makePaymentClick',
            state: info.scene,
          });
        }
      } catch (err) {
        console.log(err, 'makePaymentClick');
      }

      util.ubtTrace('c_trn_c_10650037941', {
        bizKey: 'toPayClick',
        orderId: this.data.orderInfo?.OrderId,
      });
    }
    util.ubtTrace('TCWDetail_SaveSeat_Pay_click', {
      PageId: '10650037941',
      channel: 'WX',
      Content: this.data.orderInfo.OrderStatusBarInfo.StatusName,
      orderId: this.data.orderInfo.OrderId,
      ExpoType: this.data.isNoSeat == 1 ? 1 : 0,
      IsCheapest: this.data.orderInfo.IsCanPointsPay ? 1 : 0,
    });
  },
  pointPay() {
    let payMoney = this.store.data.orderInfo.OrderAmount;
    util.ubtTrace('TCWDetail_SaveSeat_CodePopup_exposure', {
      PageId: '10650037941',
      orderId: this.data.orderInfo.OrderId,
    });
    this.getUserAccountInfo();
    this.setData({
      popType: 'pointsPay',
      showPayPwdInput: true,
      isPointPay: true,
      shopPoint: payMoney * 100,
      payFocus: true,
    });
  },
  prePayCallBack() {
    wx.showModal({
      content: '订单系统收款会略有延迟，支付成功后可刷新订单查看结果',
      confirmText: '支付成功',
      cancelText: '支付失败',
      complete: (res) => {
        this.showType = '';
        let action = res.confirm ? 1 : res.cancel ? 2 : 0;
        util.showLoading('支付检查中...');
        this.doPrePayActionOut(action)
          .then(this.checkPrePayResult)
          .catch(() => {
            util.hideLoading();
            this.loadData(this.store.data.oid);
          });
      },
    });
  },
  prePay() {
    let orderInfo = this.store.data.orderInfo;

    if (!orderInfo.EnablePayOrder) return;

    // 身份未核验转海南电子客票时的身份确认
    if (
      orderInfo.PayButtonFrontAlertType == '1' &&
      orderInfo.OrderStatus == '1'
    ) {
      try {
        let oids = TrainActStore.getAttr('infoCheckOids') || [];
        if (!oids.includes(this.store.data.oid)) {
          this.setData({ popType: 'infoCheck' });
          oids.push(this.store.data.oid);
          TrainActStore.setAttr('infoCheckOids', oids);

          return;
        }
      } catch (error) {
        return this.setData({ popType: 'infoCheck' });
      }
    }
    // 手机未核验转海南电子客票时的支付确认
    if (orderInfo.IsNeedVerifyPayType) {
      return this.getVerifyOrderPayTypeInfo(0)
        .then((res) => {
          // CancelAlertInfo.Type 0=默认转海南电子客票，3=购买套餐
          const {
            IsSupport,
            PayTypeList,
            CancelAlertInfo,
            Title,
            Content,
            IconUrl,
          } = res;
          if (IsSupport) {
            this.setData({
              IsSupport,
              PayTypeList,
              CancelAlertInfo,
              checkVsTitle: Title,
              checkVsContent: Content,
              checkVsIcon: IconUrl,
              popType: 'checkVs',
            });
          } else {
            this.pay(this.store.data.oid);
          }
        })
        .catch(() => {
          this.pay(this.store.data.oid);
        });
    }

    // 支付前的提醒
    if (orderInfo.PayButtonFrontTips) {
      util.showModal({
        m: orderInfo.PayButtonFrontTips,
        showCancel: false,
        done: (res) => {
          if (res.confirm) {
            // 转海南电子客票
            if (orderInfo.IsNeedVerifyPayType && this.data.IsSupport) {
              let _item =
                this.data.PayTypeList.find((item) => item.Type !== 1) || {};
              // type 1=先支付后核验，2=转海南电子客票, 3=购买套餐
              this.clickOrderChangeFastPay(_item.Type || 2);
            } else {
              this.pay(this.store.data.oid);
            }
          }
        },
      });
      return;
    }

    this.pay(this.store.data.oid);
  },
  pay(oid = this.store.data.oid) {
    let self = this;
    // 防止重复唤起支付
    if (self.isInPayAction) {
      return;
    }
    self.isInPayAction = true;
    setTimeout(() => {
      self.isInPayAction = false;
    }, 3000);

    // 支付宝小程序移花接木

    const ordinaryPayfn = (oid) => {
      let oneTic = self.data.orderInfo.TicketInfos[0];
      function redirect() {
        cwx.redirectTo({
          url: '../../orderdetail/orderdetail?oid=' + self.store.data.oid,
        });
      }

      function successRedirect() {
        let url = '../../orderdetail/orderdetail?oid=' + self.store.data.oid;
        if (self.data.orderInfo.IsPreHoldSeat) {
          url += `&showType=pay-success-popup`;
        }
        console.error(url);
        cwx.redirectTo({
          url,
        });
      }

      // const errHandler = () => {
      //     util.showToast("系统繁忙，请重新支付!")
      // }

      let token = {
        oid,
        // todo 中转票修改 title
        title: oneTic.DepartStation + '⇀' + oneTic.ArriveStation,
        amount: self.data.orderInfo.OrderAmount,
      };

      RequestSignPay(
        {
          token,
        },
        {
          sbackCallback: successRedirect,
          ebackCallback: redirect,
          rbackCallback: redirect,
        }
      );
    };
    if (this.store.data.orderInfo.IsCanPrePay) {
      // 移花接木
      this.getPrePayInfoForH5(oid).catch(() => {
        ordinaryPayfn(oid);
      });
    } else {
      ordinaryPayfn(oid);
    }
  },
  /**
   * 移花接木获取支付表单
   */
  getPrePayInfoForH5(oid, PollingKey) {
    util.showLoading();
    const deferred = util.getDeferred();
    let params = {
      Channel: shared.isTrainApp || shared.isCtripApp ? 'WX' : shared.channel,
      PayType: 'weixin', // 支付方式，默认支付宝；alipay支付宝  weixin 微信
      OrderID: oid,
      RescheduleOrderNumber: '',
      IsAsyn: true,
      PollingKey,
    };

    getPrePayInfoForH5Model(params, (data) => {
      if (data.RetCode == 1) {
        if (data.PrePayResult == 1) {
          // 成功
          util.hideLoading();
          const { PrePayInfo } = data;
          this.setData({ popType: '' });
          const callback = () => {
            this.prePayCallBack();
          };
          util.jumpToSchemePay(PrePayInfo, callback);
        } else if (data.PrePayResult == 3 && this.data.loopCount < 15) {
          // 需要轮询
          let loopCount = this.data.loopCount + 1;
          this.setData({
            loopCount: loopCount,
          });
          let { RequestRate = 2, PollingKey } = data; // 需要轮询的间隔秒数
          setTimeout(() => {
            this.getPrePayInfoForH5(oid, PollingKey).catch(() => {
              deferred.reject();
            });
          }, RequestRate * 1000);
        } else {
          util.hideLoading();
          console.log('获取支付表单失败');
          this.ubtTrace('获取支付表单失败');
          deferred.reject();
        }
      } else {
        util.hideLoading();
        console.log('获取支付表单失败');
        this.ubtTrace('获取支付表单失败');
        deferred.reject();
      }
    });

    return deferred.promise;
  },
  checkPrePayResult() {
    const deferred = util.getDeferred();
    let param = {
      OrderID: this.store.data.oid,
      RescheduleOrderNumber: '',
    };
    checkPrePayOutModel(param, (data) => {
      // 0未支付(需轮询)，1已支付，-1获取信息失败
      if (data.Code == 0 && this.data.loopCountCheck < 10) {
        let loopCountCheck = this.data.loopCountCheck + 1;
        this.setData({
          loopCountCheck: loopCountCheck,
        });
        const { PollingRate = 1 } = data;
        setTimeout(() => {
          this.checkPrePayResult().catch(() => {
            deferred.reject();
          });
        }, PollingRate * 1000);
      } else {
        util.hideLoading();
        this.store.loadData(this.store.data.oid).then((res) => {
          this.loadDataUpdate(res.OrderInfo);
          this.setPopTypeDeps(res.OrderInfo).then(() => {
            this.handlePopType('', res.OrderInfo);
          });
        });
      }
    });

    return deferred.promise;
  },
  doPrePayActionOut(action) {
    const deferred = util.getDeferred();
    let params = {
      OrderID: this.store.data.oid,
      IsAsyn: true,
      RescheduleOrderNumber: '',
      Action: action,
    };
    PrePayActionOutModel(params, (data) => {
      if (data.Code == 0) {
        deferred.resolve();
      } else {
        deferred.reject();
      }
    });

    return deferred.promise;
  },
  buyAgain() {
    util.goToHomepage();
  },
  openPrice() {
    if (!this.data.isOpenPrice) {
      this.setData({
        isOpenPrice: true,
      });
    } else {
      this.hidePrice();
    }
  },
  hidePrice() {
    this.setData({
      isOpenPrice: false,
    });
  },
  onRefundFeeDescCLick() {
    if (this.data.intelligentSegmentDisplay) {
      util.ubtTrace('c_trn_c_10650037941', {
        bizKey: 'GrabSuccessClick',
        channel: 'WX',
        clickType: 4,
      });
    }

    cwx.navigateTo({
      url: '/cwx/component/cwebview/cwebview?data={"url":"https%3A%2F%2Fpages.ctrip.com%2Fztrip%2Fdocument%2Fydxzctrip.html%3Fnoticetype%3D1%26__ares_maxage%3D3m"}',
    });
  },
  /**
   * 计算并设置退票费
   * @param {*} price 车票价格
   * @param {*} isRefundReschedule 是否退改签票
   * @param {*} tIndex 车票index
   * @param {*} hasHongkong 是否是跨境车票
   * @param {*} pIndex 乘客index
   */
  getRefundFee(
    price,
    isRefundReschedule,
    tIndex,
    hasHongkong,
    pIndex,
    EleCTicketIsOnlineReturn = false
  ) {
    let train;
    let passenger;
    let departTime;
    let isOutage = false;
    const { orderInfo = {} } = this.data;

    if (isRefundReschedule) {
      train = this.store.data.orderInfo.RescheduleTicketList[tIndex];
      passenger = train.ReschedulePassengerList[pIndex];
      departTime = train.DepartTime;

      if (passenger.TrainStatus == 1) {
        isOutage = true;
      }
    } else {
      train = this.store.data.orderInfo.TicketInfos[tIndex];
      passenger = train.PassengerInfos[pIndex];
      departTime = train.DepartDate + ' ' + train.DepartTime + ':00';
      if (passenger.RealTicketInfo.TrainStatus == 1) {
        isOutage = true;
      }
    }
    const params = {
      ChannelName: 'ctripwx',
      OrderId: orderInfo.OrderId,
      IsBuyPackage: this.data.insurancePromptEntrance.isShow, // 是否购买保险
      DepartDateTime: departTime.replace(/(-|:|\s)/g, ''),
      TicketList: [
        {
          OldOrderTicketId: this.ticketId,
          OrderTicketId: this.ticketId,
          TicketPrice: price,
          IsResignTicket: isRefundReschedule,
          IsOutage: isOutage,
        },
      ],
      IsArtificialReturn: false,
      EleCTicketIsOnlineReturn,
    };
    let passportType =
      passenger.IdentityTypeName.indexOf('身份证') !== -1
        ? 1
        : passenger.IdentityTypeName.indexOf('护照') !== -1
        ? 2
        : 7;
    let refundShareInfo = {
      passportName: passenger.PassengerName,
      passportType: passportType,
      passportNumber: passenger.IDCardNumber,
      mobile: passenger.PassengerMobileAES,
      ticketId: this.ticketId,
      departStation: train.DepartStation,
      arriveStation: train.ArriveStation,
      departDate: train.DepartDate || train.rescheduledDepartDate,
      arriveDate: train.ArriveDate || train.rescheduledArriveDate,
      trainNumber: train.TrainNumber,
      seatName: train.SeatName,
      orderPrice: price,
      orderId: this.store.data.oid,
    };
    this.getRundInfo(params, refundShareInfo);
  },
  getOfflineTicketRefundInfo(orderInfo) {
    if (!orderInfo.ExtendList) return;
    const refundInfo = orderInfo.ExtendList.find(
      (item) => item.Key == 'canguideappreturntips'
    );
    if (refundInfo.Value) {
      this.setData({ offlineTicketRefundInfo: JSON.parse(refundInfo.Value) });
    }
  },
  getRundInfo(params, refundShareInfo) {
    util.showLoading();
    TrainTicketReturnRuleAsyncsModel(
      params,
      (res) => {
        // TODO:测试数据
        if (res.RetCode === 1) {
          if (res.PollingResult == 1) {
            util.hideLoading();
            let refundInfo = {
              ticketPrice: res.TicketPrice,
              fee: res.ProcedureFeeDetail,
              remaining: res.ReturnPriceDetail,
              feeDesc: res.ProcedureFeeDesc,
              instructionList: res.ReturnInstructionList,
              topTips: res.TopTips,
              returnPriceDesc: res.ReturnPriceDesc,
              returningTipList: res.ReturningTipList,
              guaranteeDesc: res.GuaranteeDesc,
              guaranteePrice: res.GuaranteePrice,
              carePrice: res.CarePrice,
              carePriceDesc: res.CarePriceDesc,
              carePriceTitle: res.CarePriceTitle,
              EleCTicketIsOnlineReturn: params.EleCTicketIsOnlineReturn,
              EleCTicketOnlineReturnType: res.EleCTicketOnlineReturnType,
            };
            this.setData({ refundInfo, popType: 'refund' });
          } else if (res.PollingResult == 3) {
            setTimeout(() => {
              this.getRundInfo(
                { ...params, Pollingkey: res.Pollingkey },
                refundShareInfo
              );
            }, (res.PollingRate || 2) * 1000);
          } else if (res.PollingResult == 2) {
            //失败
            util.hideLoading();
            if (res.FailCode == 1) {
              //扫脸解封
              this.doFaceVerify(res, params, 6);
            } else if (res.FailCode == 2) {
              //短信解封
              this.doSmsVerify(res, params, 6);
            } else if (
              res.FailCode == 3 ||
              res.FailCode == 4 ||
              res.FailCode == 9
            ) {
              let userName12306 = res.ExtendInfoList?.find(
                (item) => item.Key == 'UserName12306'
              )?.Value;
              // 本人核验
              let { mobile } = refundShareInfo;
              if (res.FailCode === 9 && (!mobile || mobile.includes('*'))) {
                const key = cwx.aes.enc.Utf8.parse('-!@QWaszx#^GDFUN');
                const iv = cwx.aes.enc.Utf8.parse('09,.34ajoydfuEEi');
                const encryptText = cwx.aes.AES.decrypt(
                  this.data.orderInfo.UserInfo.ContactMobileAES,
                  key,
                  {
                    mode: cwx.aes.mode.CBC,
                    padding: cwx.aes.pad.Pkcs7,
                    iv,
                  }
                );
                mobile = encryptText.toString(cwx.aes.enc.Utf8);
              }
              this.setData({
                refundShareInfo: {
                  ...refundShareInfo,
                  mobile,
                  failCode: res.FailCode,
                  userName: userName12306,
                },
                popType: 'REFUNDISSELF',
              });
              util.ubtTrace('s_trn_c_trace_10320640941', {
                bizKey: 'returnTicketPersonCheck',
                exposureType: 'popup',
                scene: 1,
              });
            } else if (res.FailCode == 7) {
              let userName12306 = res.ExtendInfoList?.find(
                (item) => item.Key == 'UserName12306'
              )?.Value;
              util.showModal({
                m: `您的12306账号(${userName12306})密码太久未修改，账号安全性低。请找回密码后继续办理退票`,
                showCancel: true,
                cancelText: '取消',
                confirmText: '立即找回',
                done: (modalRes) => {
                  if (modalRes.cancel) {
                    return;
                  }
                  let url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/retrieve?userName=${userName12306}&retrieveUsePC=1`;
                  this.navigateTo({
                    url: `/pages/train/webview/webview`,
                    data: {
                      url: url,
                      bridgeIns: (e) => {
                        const { userName, loginPW } = e.detail.data[0];
                        this.pushScanFaceResult(true, 5, userName, 6).then(
                          () => {
                            this.getRundInfo(params);
                          }
                        );
                      },
                      needLogin: true,
                    },
                  });
                },
              });
            } else {
              util.showToast('获取退票信息失败');
            }
          }
        } else {
          util.hideLoading();
          util.showToast('获取退票信息失败');
        }
      },
      () => {
        util.hideLoading();
        util.showToast('获取退票信息失败');
      }
    );
  },
  //人脸核验
  doFaceVerify(data, params, notifyType) {
    try {
      let infoList = data.ExtendInfoList || [];
      let userName12306 = infoList.find(
        (item) => item.Key == 'UserName12306'
      ).Value;
      let accountName = infoList.find((item) => item.Key == 'AccountName');
      accountName = (accountName && accountName.Value) || '本人';
      const _refund = (e) => {
        console.log('TRN PROPS gotten', e);
        let { certificationResultCode } = e;
        if (certificationResultCode == 1) {
          this.pushScanFaceResult(true, 1, userName12306, notifyType).then(
            () => {
              this.getRundInfo(params);
            }
          );
        } else {
          util.showToast('验证失败，请重试~');
          this.pushScanFaceResult(false, 1, userName12306, notifyType);
        }
      };
      const _do = () => {
        this.navigateTo({
          url: `../../face/face?fromType=${4}&userName=${userName12306}`,
          callback: (e) => {
            setTimeout(() => {
              _refund(e), 500;
            });
          },
        });
      };
      util.showModal({
        m: `当前操作需要验证是否本人，请确保您是${accountName}哦`,
        done: () => {
          _do();
        },
      });
    } catch (e) {
      console.error(e);
      util.showToast('获取退票信息失败');
    }
  },
  //短信解封
  doSmsVerify(data, params, notifyType) {
    try {
      let infoList = data.ExtendInfoList || [];
      let userName12306 = infoList.find((item) => item.Key == 'UserName12306');
      let mobilePhone12306 = infoList.find(
        (item) => item.Key == 'MobilePhone12306'
      );
      if (!userName12306) {
        util.showToast('获取退票信息失败');

        return;
      }
      let url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/verify?mobile=${
        (mobilePhone12306 && mobilePhone12306.Value) || '您的下单手机'
      }&userName=${userName12306 && userName12306.Value}`;
      this.navigateTo({
        url: `../../webview/webview`,
        data: {
          url: url,
          bridgeIns: (e) => {
            console.log('TRN PROPS gotten', e.detail.data);
            const [{ unRisk = false }] = e.detail.data;
            this.pushScanFaceResult(unRisk, 1, userName12306, notifyType).then(
              () => {
                if (unRisk) {
                  setTimeout(() => {
                    this.getRundInfo(params);
                  }, 500);
                }
              }
            );
          },
          needLogin: true,
        },
      });
    } catch (e) {
      console.error(e);
      util.showToast('获取退票信息失败');
    }
  },
  buySame(e) {
    const type = e.currentTarget.dataset.type;
    const { orderInfo } = this.data;
    util.buySame({
      orderInfo,
      type,
    });
  },
  showGuide() {
    this.setData({
      popType: 'guide',
    });
    TrainActStore.setAttr('clickCollectedIcon', true);
  },
  hideGuide() {
    this.setData({
      showMask: '',
    });
  },
  checkCZLRefundable() {
    if (this.store.data.orderInfo.OrderType === 'CZL') {
      util.showModal({
        m: '当前订单暂不支持在小程序端退票，如有需要可前往手机携程办理',
      });

      return false;
    }

    return true;
  },
  async refundTicket(e) {
    if (this.data.segmentationInfo?.groupOrderStatus === 4) {
      util.ubtTrace('c_trn_c_10650037941', {
        bizKey: 'splitGrabSuccessClick',
        orderId:
          this.data.segmentationInfo?.currentRouteSequence === 1
            ? this.data.orderInfo1?.OrderId
            : this.data.orderInfo2?.OrderId,
        relationOrderId:
          this.data.segmentationInfo?.currentRouteSequence === 1
            ? this.data.orderInfo2?.OrderId
            : this.data.orderInfo1?.OrderId,
        type: this.data.intelligentType,
        clickType: 2,
      });
    }

    const dataset = e.currentTarget.dataset;
    let ticketIndex = dataset.tickindex;
    let idx = dataset.index;
    let pas =
      this.store.data.orderInfo.TicketInfos[ticketIndex].PassengerInfos[idx];
    const realTicketInfo = pas.RealTicketInfo;
    let ticketPrice = realTicketInfo.DealTicketPrice;
    this.ticketId = realTicketInfo.OrderRealTicketId;
    this.ubtDevTrace('c_train_refundticket', pas);
    if (!realTicketInfo.EnableReturnTicket) {
      util.devTrace('train_tinyapp_dev_log', {
        desc: 'notEnableReturnTicket',
        pas,
      });
      if (realTicketInfo.IsCanGuideAppReturn) {
        this.getOfflineTicketRefundInfo(this.store.data.orderInfo);
        this.setData({ popType: 'serviceTalk' });
      } else {
        util.showModal({
          m: realTicketInfo.ErrorMsg || '无法退票',
        });
      }
      return;
    }

    this.setData({
      curRefundPas: {
        ...pas,
        ticketIndex,
        idx,
        ticketPrice,
        isRefundReschedule: false,
        reWay: 0,
      }, // 只有本人这种方式，所以reway是0
    });

    if (
      this.data.orderInfo.IsCanArtificialReturn ||
      this.data.orderInfo.EleCTicketIsCanOnlineReturn
    ) {
      await this.handleArtAndOnlineRefund(
        pas,
        ticketIndex,
        idx,
        ticketPrice,
        false
      );
      return;
    }

    this.getRefundFee(
      ticketPrice,
      false,
      ticketIndex,
      checkHongkong(this.store.data.orderInfo),
      idx
    );
  },
  async handleArtAndOnlineRefund(
    pas,
    ticketIndex,
    idx,
    ticketPrice,
    isRefundReschedule
  ) {
    const PEleTicketArtificialReturnAlertInfo =
      await this.getTrainPreEleCounterTicketArtificialReturnInfo({
        OrderId: this.data.orderInfo.OrderId,
        OrderTicketId: this.ticketId,
        EleCTicketIsCanOnlineReturn: true,
      });
    if (PEleTicketArtificialReturnAlertInfo) {
      const {
        ButtonList = [],
        Content,
        Title,
      } = PEleTicketArtificialReturnAlertInfo;
      if (ButtonList.length === 1) {
        util.ubtTrace('s_trn_c_trace_10320640941', {
          bizkey: 'returnTicket',
          exposureType: 'popup',
          type: 1,
        });
        this.setData({
          popType: '',
        });
        return util.showModal({
          title: Title,
          m: Content || '无法退票',
          done: () =>
            util.ubtTrace('c_trn_c_10320640941', {
              bizKey: 'returnTicketClick',
              type: 1,
              clickType: 3,
            }),
        });
      }
      const reWay = PEleTicketArtificialReturnAlertInfo.ButtonList.reduce(
        (pre, cur) => {
          return +cur.ActionType + pre;
        },
        0
      );
      util.ubtTrace('s_trn_c_trace_10320640941', {
        bizkey: 'returnTicket',
        exposureType: 'popup',
        type: reWay,
      });
      this.setData({
        PEleTicketArtificialReturnAlertInfo,
        popType: 'REFUNDWAYSELECT',
        curRefundPas: {
          ...pas,
          ticketIndex,
          idx,
          ticketPrice,
          isRefundReschedule,
          reWay,
        },
      });
    }
  },
  async refundTicketRescheduled(e) {
    let tIndex = e.currentTarget.dataset.tIndex;
    let pIndex = e.currentTarget.dataset.pIndex;
    let pas =
      this.store.data.orderInfo.RescheduleTicketList[tIndex]
        .ReschedulePassengerList[pIndex];
    let ticketPrice =
      this.store.data.orderInfo.RescheduleTicketList[tIndex]
        .ReschedulePassengerList[pIndex].DealTicketPrice;
    this.ticketId = pas.OrderRealTicketId;

    this.ubtDevTrace('c_train_refundticket', pas);
    if (!pas.EnableReturnTicket) {
      if (pas.IsCanGuideAppReturn) {
        this.setData({ popType: 'serviceTalk' });
      } else {
        util.showModal({
          m: pas.NotReturnReason || '无法退票',
        });
      }

      return;
    }

    this.setData({
      curRefundPas: {
        ...pas,
        ticketIndex: tIndex,
        idx: pIndex,
        ticketPrice,
        isRefundReschedule: true,
        reWay: 0,
      }, // 只有本人这种方式，所以reway是0
    });
    if (
      this.data.orderInfo.IsCanArtificialReturn ||
      this.data.orderInfo.EleCTicketIsCanOnlineReturn
    ) {
      await this.handleArtAndOnlineRefund(
        pas,
        tIndex,
        pIndex,
        ticketPrice,
        true
      );
      return;
    }

    this.getRefundFee(
      ticketPrice,
      true,
      tIndex,
      checkHongkong(this.store.data.orderInfo),
      pIndex
    );
  },
  cancelRefund() {
    this.setData({
      popType: '',
    });
    this.ubtDevTrace('c_train_confirm_refundticket', 'cancelRefund');
  },
  confirmRefund() {
    this.refundAction();
    this.getClaimPriceListInfo();
    this.setData({
      popType: '',
    });
    this.ubtDevTrace('c_train_confirm_refundticket', 'confrimRefund');
  },
  refundAction() {
    util.showLoading();
    let ticList = [
      {
        OrderTicketID: this.ticketId,
        RefundFee: 0,
      },
    ];

    const params = {
      OrderId: this.store.data.orderInfo.OrderId,
      OrderType: this.store.data.orderInfo.IsDirect,
      ReturnTickets: ticList,
      EleCTicketIsOnlineReturn: this.data.refundInfo.EleCTicketIsOnlineReturn,
      EleCTicketOnlineReturnType:
        this.data.refundInfo.EleCTicketOnlineReturnType,
      IsArtificialReturn: false,
      channel: 'WX',
    };

    RefundTicketModel(
      params,
      (data) => {
        if (data.RetCode !== 0) {
          return util.showToast(data.RetMessage || '退票失败，请稍候再试!');
        }

        this.loadData(data.OrderId);
        const { topTips, returningTipList } = this.data.refundInfo;
        let val = {
          topTips: topTips && encodeURIComponent(topTips),
          returningTipList,
        };
        let url = `https://m.ctrip.com/webapp/train/activity/ctrip-ticket-refund-page/?refundInfo=${JSON.stringify(
          val
        )}`;
        const enURL = encodeURIComponent(url);
        this.navigateTo({
          url: `../../webview/webview`,
          data: {
            url: enURL,
            needLogin: true,
          },
        });
        // this.navigateTo({
        //     url: '../../refundaffirm/refundaffirm',
        //     data: {
        //         refundInfo: this.data.refundInfo,
        //     },
        // })
      },
      () => {
        util.showToast('退票失败，请稍候再试!');
      },
      () => {
        util.hideLoading();
      }
    );
  },
  // 改签
  async rescheduleTicket(e) {
    if (!(await this.checkHongkongResc())) {
      return;
    }

    if (this.data.segmentationInfo?.groupOrderStatus === 4) {
      util.ubtTrace('c_trn_c_10650037941', {
        bizKey: 'splitGrabSuccessClick',
        orderId:
          this.data.segmentationInfo?.currentRouteSequence === 1
            ? this.data.orderInfo1?.OrderId
            : this.data.orderInfo2?.OrderId,
        relationOrderId:
          this.data.segmentationInfo?.currentRouteSequence === 1
            ? this.data.orderInfo2?.OrderId
            : this.data.orderInfo1?.OrderId,
        type: this.data.intelligentType,
        clickType: 1,
      });
    }

    let ticketIndex = e.currentTarget.dataset.tickindex;
    let idx = e.currentTarget.dataset.index;
    let pas =
      this.store.data.orderInfo.TicketInfos[ticketIndex].PassengerInfos[idx];
    this.ticketId = pas.RealTicketInfo.OrderRealTicketId;
    this.setData({ ticketIndex });
    if (!pas.RealTicketInfo.EnableChangeTicket) {
      util.showModal({
        m: pas.RealTicketInfo.ChangeTicketErrorMsg || '无法改签',
      });
      return;
    }
    if (!!this.store.data.orderInfo.RescheduleTicketRuleIsGoNewInterface) {
      await this.handleArtAndOnlineResc(pas, ticketIndex, idx);
      return;
    }
    this.goReschedule(ticketIndex);
  },
  async handleArtAndOnlineResc(pas, ticketIndex, idx) {
    let { EleCTicketIsCanOnlineReschedule = false } = this.store.data.orderInfo;
    const PEleTicketArtificialRescheduleAlertInfo =
      await this.getTrainPreEleCounterTicketArtificialRescheduleInfo({
        OrderId: this.data.orderInfo.OrderId,
        OrderRealTicketId: this.ticketId,
        EleCTicketIsCanOnlineReschedule: EleCTicketIsCanOnlineReschedule,
        ChannelName: 'WX',
      });
    let train = this.store.data.orderInfo.TicketInfos[ticketIndex];
    let passenger = pas;
    let ticketPrice = pas.RealTicketInfo.DealTicketPrice;
    if (passenger.RealTicketInfo.TrainStatus == 1) {
      isOutage = true;
    }
    let passportType =
      passenger.IdentityTypeName.indexOf('身份证') !== -1
        ? 1
        : passenger.IdentityTypeName.indexOf('护照') !== -1
        ? 2
        : 7;
    let rescheduleInfo = {
      passportName: passenger.PassengerName,
      passportType: passportType,
      passportNumber: passenger.IDCardNumber,
      mobile: passenger.PassengerMobileAES,
      ticketId: this.ticketId,
      departStation: train.DepartStation,
      arriveStation: train.ArriveStation,
      departDate: train.DepartDate || train.rescheduledDepartDate,
      arriveDate: train.ArriveDate || train.rescheduledArriveDate,
      trainNumber: train.TrainNumber,
      seatName: train.SeatName,
      orderId: this.store.data.oid,
      isReschedule: true,
      orderPrice: ticketPrice,
      pIndex: idx,
    };
    this.setData({
      rescheduleShareInfo: {
        ...this.data.rescheduleShareInfo,
        ...rescheduleInfo,
      },
    });
    if (PEleTicketArtificialRescheduleAlertInfo) {
      const {
        ButtonList = [],
        Content,
        Title,
      } = PEleTicketArtificialRescheduleAlertInfo;
      if (ButtonList.length === 1) {
        util.ubtTrace('s_trn_c_trace_10320640941', {
          bizkey: 'returnTicket',
          exposureType: 'popup',
          type: 1,
          scene: 2,
        });
        this.setData({
          popType: '',
        });
        return util.showModal({
          title: Title,
          m: Content || '无法退票',
          confirmText: ButtonList[0].ButtonName,
          done: () =>
            util.ubtTrace('c_trn_c_10320640941', {
              bizKey: 'returnTicketClick',
              type: 1,
              clickType: 3,
              scene: 2,
            }),
        });
      }
      let reWay = PEleTicketArtificialRescheduleAlertInfo.ButtonList.reduce(
        (pre, cur) => {
          return +cur.ActionType + pre;
        },
        0
      );
      reWay = reWay == 3 ? reWay : reWay + 3;
      util.ubtTrace('s_trn_c_trace_10320640941', {
        bizkey: 'returnTicket',
        exposureType: 'popup',
        type: reWay,
        scene: 2,
      });
      this.setData({
        PEleTicketArtificialRescheduleAlertInfo,
        popType: 'RESCHEDULEWAYSELECT',
        curRescPas: { ...pas, ticketIndex, idx, reWay },
      });
    }
  },
  onTapSelectRescWay(e) {
    const ACTIONTYPE = {
      STATION: 0,
      ARTIFICIAL: 2, // 跑腿
      ONLINE: 1, // 本人
    };
    const { btn = {} } = e.currentTarget.dataset;
    const { curRescPas = {} } = this.data;
    util.ubtTrace('c_trn_c_10320640941', {
      bizKey: 'returnTicketClick',
      type: curRescPas.reWay,
      clickType: +btn.ActionType,
      scene: 2,
    });
    switch (+btn.ActionType) {
      case ACTIONTYPE.ONLINE:
        // 本人改签 判断是否需要核验
        if (btn.Code === 1) {
          this.goReschedule(curRescPas.ticketIndex, ACTIONTYPE.ONLINE);
        } else {
          this.setData({
            popType: 'RESCHEDULEISSELF',
            rescBtnActionCode: btn.Code,
          });
          util.ubtTrace('s_trn_c_trace_10320640941', {
            bizKey: 'returnTicketPersonCheck',
            exposureType: 'popup',
            scene: 2,
          });
        }
        break;
      case ACTIONTYPE.ARTIFICIAL:
        // 跑腿
        this.goReschedule(curRescPas.ticketIndex, ACTIONTYPE.ARTIFICIAL);
        break;
      case ACTIONTYPE.STATION:
      default:
        this.setData({
          popType: '',
        });
        break;
    }
  },
  async getTrainPreEleCounterTicketArtificialRescheduleInfo(params) {
    const res = await util.promisifyModel(
      TrainPreEleCounterTicketArtificialReschedule
    )(params);
    if (res.RetCode !== 1)
      return util.showToast('改签请求失败，请稍后再试', 'none');
    if (res.PollingResult === 1) {
      const { PEleTicketArtificialRescheduleAlertInfo } = res;
      let userName12306 = res.ExtendInfoList?.find(
        (item) => item.Key == 'UserName12306'
      )?.Value;
      this.setData({
        rescheduleShareInfo: {
          ...this.data.rescheduleShareInfo,
          userName: userName12306,
        },
      });
      return PEleTicketArtificialRescheduleAlertInfo;
    } else if (res.PollingResult === 3) {
      // setTimeout(()=>{
      //     this.getTrainPreEleCounterTicketArtificialRescheduleInfo({...params, Pollingkey: res.Pollingkey})
      //   }, (res.PollingRate || 2)*1000)

      const info =
        await this.getTrainPreEleCounterTicketArtificialRescheduleInfo({
          ...params,
          Pollingkey: res.Pollingkey,
        });
      return info;
    } else if (res.PollingResult === 2)
      return util.showToast(`改签请求失败，请稍后重试~`, 'none');
  },
  rescheduleTicketRescheduled(e) {
    let tIndex = e.currentTarget.dataset.tIndex;
    let pIndex = e.currentTarget.dataset.pIndex;
    let pas =
      this.store.data.orderInfo.RescheduleTicketList[tIndex]
        .ReschedulePassengerList[pIndex];

    if (!pas.EnableChangeTicket) {
      util.showModal({
        m: pas.NotChangeTicketReason || '无法改签',
      });

      return;
    }

    this.goReschedule(tIndex);
  },
  goReschedule(ticketIndex, rescheduleCode = 0) {
    const ticketInfo = this.store.data.orderInfo.TicketInfos[ticketIndex];
    shared.isReschedule = true;
    shared.rescheduleInfo = {
      ticketInfo,
      artiPasIndex: this.data.rescheduleShareInfo.pIndex || '',
      orderInfo: this.store.data.orderInfo,
      isAbroad: [ticketInfo.DepartStation, ticketInfo.ArriveStation].includes(
        '香港西九龙'
      ), // 跨境车票
    };
    let url = `../../list/list?dstation=${ticketInfo.DepartStation}&astation=${ticketInfo.ArriveStation}&ddate=${ticketInfo.DepartDate}&isgd=false&rescheduleCode=${rescheduleCode}`;
    this.navigateTo({
      url,
    });
  },
  // 跳转到酒店锚点
  toHotelView() {
    this.ubtTrace('o_traapplets_orderdetailpage_hotel_tosee', true);
    let self = this;
    let query = wx.createSelectorQuery();
    query.select('#hotelView').boundingClientRect();
    query.exec(function (res) {
      wx.pageScrollTo({
        scrollTop: res[0].top,
      });
      self.setData({
        popType: '',
      });
    });
  },
  toWebviewPage(e) {
    const { url } = e.currentTarget.dataset;
    this.navigateTo({
      url: '../../webview/webview',
      data: {
        url,
      },
    });
  },
  toWebviewPageVerify(e) {
    const { url } = e.currentTarget.dataset;
    this.navigateTo({
      url: '../../webview/webview',
      data: {
        url,
        needLogin: true,
      },
    });
  },
  cancelOrder() {
    const orderInfo = this.store.data.orderInfo;
    util.ubtTrace('TCWDetail_SaveSeat_Cancel_click', {
      PageId: '10650037941',
      channel: 'WX',
      Content: this.data.orderInfo.OrderStatusBarInfo.StatusName,
      orderId: this.data.orderInfo.OrderId,
      ExpoType: this.data.isNoSeat == 1 ? 1 : 0,
      IsCheapest: this.data.orderInfo.IsCanPointsPay ? 1 : 0,
    });
    if (orderInfo.IsNeedVerifyPayType) {
      return this.getVerifyOrderPayTypeInfo(1)
        .then((res) => {
          const { IsSupport, PayTypeList, CancelAlertInfo } = res;
          if (IsSupport) {
            this.setData({
              IsSupport,
              PayTypeList,
              CancelAlertInfo,
              popType: 'cancelOrder',
            });
          } else {
            this.normalCancle();
          }
        })
        .catch(() => {
          this.normalCancle();
        });
    }

    // 取消订单挽回弹窗
    if (orderInfo.RedeemAlertInfoList && orderInfo.RedeemAlertInfoList.length) {
      let cancelOrderRedeemAlertInfo = orderInfo.RedeemAlertInfoList.find(
        (item) => item.Type == 2
      );

      return this.setData({
        cancelOrderRedeemAlertInfo,
        popType: 'infoCheckCancel',
      });
    }

    let modelOPt = {};
    if (orderInfo.OrderType == 'JL') {
      if (orderInfo.OrderStatus == 1 && orderInfo.EnablePayOrder) {
        modelOPt = {
          m: '现在去支付，抢到票的成功率更高',
          showCancel: true,
          cancelText: '取消抢票',
          confirmText: '去支付',
          done: (res) => {
            if (res.confirm) {
              this.prePay();
            } else if (res.cancel) {
              this.requestCancelOrder();
            }
          },
        };
      } else {
        modelOPt = {
          m: '确定取消订单吗？',
          showCancel: true,
          cancelText: '取消',
          confirmText: '确定',
          done: (res) => {
            if (res.confirm) {
              this.requestCancelOrder();
            }
          },
        };
      }
      util.showModal(modelOPt);
    } else {
      if (orderInfo.EnablePayOrder && orderInfo.IsPreHoldSeat) {
        modelOPt = {
          m: '确定要取消该订单吗？（每天最多取消三次）',
          showCancel: true,
          cancelText: '点错了',
          confirmText: '取消订单',
          cancelColor: '#0086F6',
          confirmColor: '#0086F6',
          done: (res) => {
            if (res.confirm) {
              this.requestCancelOrder();
            }
          },
        };
        util.showModal(modelOPt);
      } else {
        this.requestCancelOrder();
      }
    }
  },
  normalCancle() {
    let modelOPt = {
      m: '确定取消订单吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      done: (res) => {
        if (res.confirm) {
          this.requestCancelOrder();
        }
      },
    };
    util.showModal(modelOPt);
  },
  requestCancelOrder() {
    this.setData({ popType: '' });

    const self = this;
    const oid = this.store.data.oid;
    util.showLoading('正在取消订单');
    const params = {
      OrderId: this.store.data.oid,
      oid: this.store.data.oid,
    };

    OrderCancelModel(
      params,
      (data) => {
        if (data.RetMessage) {
          util.showModal({
            m: data.RetMessage,
            done() {
              self.store.loadData(oid).then((res) => {
                self.loadDataUpdate(res.OrderInfo);
              });
            },
          });
        } else {
          self.store.loadData(oid).then((res) => {
            this.loadDataUpdate(res.OrderInfo);
          });
        }
      },
      () => {
        util.showModal({
          m: '网络异常，请稍后再试。',
          done: () => {},
        });
      },
      () => {
        util.hideLoading();
      }
    );
  },
  rescGrabDetail(e) {
    const {
      currentTarget: {
        dataset: { index, tindex, type },
      },
    } = e;
    const {
      TicketInfos: [{ PassengerInfos }],
      RescheduleTicketList,
    } = this.data.orderInfo;
    let currChangeNumebr = '';

    if (type !== 'change') {
      let IDCardNumberAES = PassengerInfos[index].IDCardNumberAES;
      let PassengerType = PassengerInfos[index].TicketType;
      let currPassenger = RescheduleTicketList.find((t) =>
        t.ReschedulePassengerList.find(
          (p) =>
            p.IDCardNumberAES == IDCardNumberAES &&
            p.PassengerType == PassengerType
        )
      );
      currChangeNumebr = currPassenger.RescheduleOrderNumber;
    } else {
      currChangeNumebr = RescheduleTicketList[tindex].RescheduleOrderNumber;
    }

    shared.orderInfo = this.store.data.orderInfo;
    const url = `https://m.ctrip.com/webapp/train/rescheduleGrabDetail?&subOrderId=${currChangeNumebr}&orderId=${this.store.data.oid}`;
    return cwx.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`,
    });
  },
  toWebviewAbout12306(e) {
    this.setData({ popType: '' });
    let type = e.currentTarget.dataset.type;
    let url;
    if (type == 'login') {
      // 登录注册
      url =
        'https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/login';
    } else if (type == 'member') {
      // 设置消费密码
      if (this.data.login12306Name && this.data.login12306Pas) {
        url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/member?userName=${encodeURIComponent(
          this.data.login12306Name
        )}&loginPW=${encodeURIComponent(this.data.login12306Pas)}`;
      } else {
        url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-12306/#/login?push=1`;
      }
    } else if (type == 'active') {
      // 激活会员
      url =
        'https://pages.ctrip.com/ztrip/market/12306active/?__ares_maxage=3m&from=mini';
    }
    this.navigateTo({
      url: `../../webview/webview`,
      data: {
        url: url,
        bridgeIns: this.onWebViewProps,
        needLogin: true,
      },
    });
  },
  goRefundUrl() {
    let url = this.store.data.orderInfo.RefundInfoUrl;
    this.navigateTo({
      url: `../../webview/webview`,
      data: {
        url: url,
        needLogin: true,
      },
    });
  },
  goOrderChange() {
    shared.orderInfo = this.store.data.orderInfo;

    const url = `https://m.ctrip.com/webapp/train/modifyOrder?orderId=${this.data.orderInfo.OrderId}&fromminiapp=1`;
    cwx.navigateTo({
      url: `/pages/train/authorise/web/web?data={"url":"${encodeURIComponent(
        url
      )}","bgColor":"19A0F0"}`,
    });
  },
  loadInsuranceInfo(orderInfo) {
    let {
      OrderId = '',
      OrderStatus = 0,
      OrderType = '',
      OrderAmount = 0,
      TicketInfos = [],
    } = orderInfo;
    let params = {
      Channel: 'ctripwx',
      OrderNumber: OrderId,
      OrderState: OrderStatus,
      OrderType,
      TicketPrice: (!!TicketInfos[0] && TicketInfos[0].TicketPrice) || 0,
      TotalPrice: OrderAmount,
      ExtendInfo: '263382&1464975',
    };
    TrainOrderProductDetail(
      params,
      (res) => {
        if (
          res.RetCode == 1 &&
          !!res.TrainAppendProductList &&
          res.TrainAppendProductList.length > 0 &&
          !!res.SaleProductEntranceInfo
        ) {
          this.setData({
            insurancePromptEntrance: {
              isShow: true,
              insuranceInfo: res.TrainAppendProductList[0],
              saleProductEntranceInfo: res.SaleProductEntranceInfo,
            },
          });
        } else {
          this.setData({
            insurancePromptEntrance: {
              isShow: false,
              insuranceInfo: {},
              saleProductEntranceInfo: {},
            },
          });
        }
      },
      () => {
        this.setData({
          insurancePromptEntrance: {
            isShow: false,
            insuranceInfo: {},
            saleProductEntranceInfo: {},
          },
        });
      }
    );
  },
  // 切换保险展示
  toggleShowInsurancePrompt(e) {
    let { dataset = {} } = e.target;
    let { showType = '' } = dataset;
    this.setData({
      showInsurancePrompt: showType == 'show',
    });
  },
  // 购买保险
  buyInsurance() {
    this.setData({
      showInsurancePrompt: false,
    });
    let { insurancePromptEntrance = {}, orderInfo = {} } = this.data;
    let { insuranceInfo = {} } = insurancePromptEntrance;
    util.showLoading('请稍等...');
    let count = orderInfo.TicketInfos[0].PassengerInfos.length;
    let params = {
      Channel: 'ctripwx',
      OrderNumber: orderInfo.OrderId,
      trainAppendProductList: [
        {
          AppendID: insuranceInfo.AppendID,
          AppendCount: count,
        },
      ],
    };
    TrainChangeOrderOuter(
      params,
      (res) => {
        util.hideLoading();
        if (res.RetCode == 1 && res.IsSuccess) {
          let payInfo = {
            orderId: res.ChangeOrderId,
            amount: res.ChangeOrderAmount,
            title:
              res.OrderPriceList.length == 1
                ? res.OrderPriceList[0].OrderPriceName
                : '附加产品',
            insuranceinfos: res.InsuranceInfos || '',
          };
          // 调用支付
          this.payInsurance(payInfo);
        } else {
          // 提示错误原因
          util.showModal({ m: '系统异常，请稍后重试' });
        }
      },
      () => {
        util.hideLoading();
      }
    );
  },
  payInsurance(payInfo) {
    let { orderId, amount, title, insuranceinfos } = payInfo;
    let token = {
      oid: orderId, // 用新的订单号 以及分账信息
      title,
      amount,
    };
    RequestSignPay(
      {
        token,
      },
      {
        sbackCallback: () => {
          this.loadData(this.store.data.oid);
        },
        ebackCallback: () => {
          util.showModal({ m: '系统异常，请稍后重试' });
        },
        rbackCallback: () => {
          // util.showModal({m: '系统异常，请稍后重试'})
        },
      }
    );
  },

  onClickTaskBtn() {
    const clickType = this.data.isShowGuideSaveTaskPop ? 1 : 2;
    util.ubtTrace('TCWDetail_FanxianPopup_click', {
      PageId: '10650037941',
      ProductType: 1,
      Type: this.data.orderInfo.OrderType === 'JL' ? 1 : 0,
      orderId: this.data.orderInfo.OrderId,
      clickType,
    });
    if (this.data.isShowGuideSaveTaskPop) {
      cwx.navigateTo({ url: this.data.saveTaskGuidePopInfo.JumpUrl });
    } else {
      this.receiveSaveTask();
    }
    this.setData({ popType: '' });
  },

  async receiveSaveTask(isFromBanner) {
    try {
      const params = {
        TaskType: 31,
        OrderNumber: this.data.orderInfo.OrderId,
        FromType: 'wx',
        Source: isFromBanner ? 4 : 2, // 5=订单详情弹框用户点击领取 7=订单详情卡片用户点击领取
      };
      const res = await util.promisifyModel(ReceiveExternalTask)(params);
      if (res.RetCode === 1 && res.ReceiveResult === 1 && res.JumpUrl) {
        cwx.navigateTo({
          url: res.JumpUrl,
        });
        console.log('领取返现任务成功');
      }
    } catch (e) {
      this.setData({ popType: '' });
      console.log('领取返现任务失败');
    }
  },

  hideBackDrop() {
    if (this.data.popType == 'hotel') {
      this.ubtTrace('o_traapplets_orderdetailpage_hotel_toclose', true);
    }
    if (
      this.data.popType === 'saveTask' ||
      this.data.popType === 'saveTaskGuide'
    ) {
      util.ubtTrace('TCWDetail_FanxianPopup_click', {
        PageId: '10650037941',
        ProductType: 1,
        Type: this.data.orderInfo.OrderType === 'JL' ? 1 : 0,
        orderId: this.data.orderInfo.OrderId,
        clickType: 0,
      });
    }
    if (this.data.popType !== 'COUPONMODAL') {
      this.setData({
        popType: '',
      });
    }
  },

  consumePopTrace(clickType) {
    util.ubtTrace('TCWDetail_SaveSeat_CodePopup_click', {
      PageId: '10650037941',
      orderId: this.data.orderInfo.OrderId,
      clickType, //0-取消，1-确认，2-忘记密码去重置
    });
  },

  onClickHidePointPop() {
    if (this.data.popType === 'pointsPay') {
      this.consumePopTrace(0);
    }
    if (
      this.data.popType === 'pointsPay' ||
      this.data.popType === 'pointsPayFail'
    ) {
      this.setData({ popType: '', pwdVal: '', payFocus: false });
    }
  },
  onClickInputAgain() {
    this.setData({ popType: 'pointsPay', payFocus: false, pwdVal: '' });
  },
  onClickResetPwd() {
    //重置密码操作
    this.consumePopTrace(2);
    const jumpUrl = `https://m.ctrip.com/webapp/train/updateMemberpsd?titleBgColor=C6DDFC&userName=${util.encodeAES(
      this.data.orderInfo.UserId12306
    )}`;
    cwx.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
        jumpUrl
      )}`,
    });
  },
  HideNoSeatModal() {
    this.setData({
      NoSeatModal: null,
    });
  },
  onShareAppMessage(e) {
    // 如果是退票核验的弹窗
    const fromType = e.target?.dataset?.fromType || '';
    const fromTarget = e.target?.dataset?.fromTarget || '';
    console.log(fromType, 'fromType');
    if (fromTarget === 'shareToVerify') {
      util.ubtTrace('c_trn_c_10320640941', {
        bizKey: 'returnTicketPersonCheckClick',
        clickType: 0,
        scene: fromType ? 2 : 1,
      });
      const title = `我在为你${fromType ? '改签' : '退票'}，需要验证`;
      const imageUrl = fromType
        ? 'https://images3.c-ctrip.com/train/2022/xiaochengxv/v-8.47/001_img_share.png'
        : 'https://images3.c-ctrip.com/train/app/8.29/tpyanzheng.png';
      let encodeStringParams = '';
      const shareInfo = fromType
        ? this.data.rescheduleShareInfo
        : this.data.refundShareInfo;
      console.log(shareInfo, 'fromType');

      for (const key in shareInfo) {
        let val = shareInfo[key];
        val = val ?? '';
        encodeStringParams += '&' + key + '=' + encodeURIComponent(val);
      }
      const url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-refund-verify?source=mp${encodeStringParams}`;
      const path = `/pages/train/shareWebView/shareWebView?data={"url":"${encodeURIComponent(
        url
      )}","needLogin": true}`;
      return { bu: 'train', title, path, imageUrl };
    }
    // 右上角转发分享行程
    let ticketType = 0;
    const orderInfo = this.store.data.orderInfo; // 订单信息
    if (orderInfo.TicketInfos?.length === 1) {
      ticketType = 0;
    } else if (orderInfo.TicketInfos?.length > 1) {
      if (
        orderInfo.TicketInfos[0].DepartStation ===
        orderInfo.TicketInfos[1].ArriveStation
      ) {
        ticketType = 1;
      } else {
        ticketType = 2;
      }
    }
    const url = `https://m.ctrip.com/webapp/train/activity/ctrip-ticket-itineray-sharing/share?oid=${this.store.data.oid}&showDetail=0&bgColor=0086F6&ticketType=${ticketType}&shareType=itineray&chooseTicketInfos=${this.data.encodeTicketInfo}`;
    console.log('分享链接', url, e, '分享链接 a');
    const shareMiniPath = `pages/train/shareWebView/shareWebView?data={"url":"${encodeURIComponent(
      url
    )}","hideShare":true}`;
    let title = `【${shared.orderinfos.station.departStation}站 - ${
      shared.orderinfos.station.arriveStation
    }站】的火车票, ${new cDate(shared.orderinfos.time.departTime).format(
      'n月j日'
    )}出发`;
    let imageUrl =
      'https://images3.c-ctrip.com/train/2021/app/V8.41.6/xiaochengxu/xiaoguowaihua/img-xingcheng.png';
    return {
      bu: 'train',
      title: title,
      path: shareMiniPath,
      imageUrl: imageUrl,
    };
  },
  protocalHandle() {
    this.setData({
      protocalToogle: !this.data.protocalToogle,
    });
  },
  onPullDownRefresh() {
    const oid =
      this.from === 'zhiduoxing' ? this.optionsOid : this.store.data.oid;
    this.store.loadData(oid).then((res) => {
      this.loadDataUpdate(res.OrderInfo);
      this.showRescheduleGrabEntrance(res.OrderInfo);
      this.setPopTypeDeps(res.OrderInfo).then(() => {
        this.handlePopType('', res.OrderInfo);

        // this.data.intelligentSegmentDisplay && this.intelligenceRecommendEntranceHandler()
      });
      wx.stopPullDownRefresh();
    });
    // 清除定时器
    this.data.refreshTimer && clearTimeout(this.data.refreshTimer);
  },
  preventBackMove() {},
  toIMPage() {
    if (this.data.QuestionsUrl) {
      //IM+
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(this.properties.QuestionsUrl),
        },
      });
    }
  },
  async setSubsribedFlag() {
    const params = {
      ActivityCode: 'CtripLineStatusAlert',
      FromType: 3,
    };
    const toggle = await ConfigInfoPromise({
      ConfigKey: 'train_wx_subscribeticket',
    });
    if (toggle?.ConfigInfo?.Content != 1) {
      return;
    }
    const res = await util.promisifyModel(QuerySubscribeMessageStatusModel)(
      params
    );
    this.setData({
      subscribeFlag: res.Status === 1,
    });
  },
  async onClickSubscribeTicket() {
    this.setData({
      popType: '',
    });
    cwx.mkt.subscribeMsg(
      ['DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4'],
      (data) => {
        this.ubtTrace('o_tra_Backwardgetsub_requireA', true);
        if (data?.errMsg) {
          // 取消订阅
          this.ubtDevTrace('c_train_subscribemsgerr', data?.errMsg);
        } else {
          // 订阅成功
          let { templateSubscribeStateInfos = [] } = data;
          let hasSubscribedTemp =
            templateSubscribeStateInfos?.filter(
              (item) => item.subscribeState
            ) ?? [];
          console.log(
            '-------templateSubscribeStateInfos',
            templateSubscribeStateInfos
          );
          console.log('-----hasSubscribedTemp', hasSubscribedTemp);
          const m = new Map();
          m.set(
            'DhLBZPFtgtvI3UxDslMDKqOczWUUW2m_euc2ujHV0S4',
            'CtripLineStatusAlert'
          );
          console.log('--- m', m);
          hasSubscribedTemp.forEach((item) => {
            if (m.has(item.templateId)) {
              console.log(
                '-----SubscribeMessageTemplateModel',
                SubscribeMessageTemplateModel
              );
              let params = {
                OpenID: (cwx.cwx_mkt && cwx.cwx_mkt.openid) || '',
                TemplateIDList: [item.templateId],
                ActivityCode: m.get(item.templateId),
                OrderNumber: '',
                ShareAuth: '',
                NickName: '',
                PhotoUrl: '',
                FromType: 3,
              };
              SubscribeMessageTemplateModel(params, (res) => {
                this.ubtDevTrace('subscribeModelRes', res);
                if (res.RetCode == 1) {
                  util.showToast('订阅成功', 'none');
                } else {
                  util.showToast('订阅失败', 'none');
                }
              });
            }
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  },

  // 获取关注公众号免单角标和弹窗配置
  getFreeOrderConfig() {
    getConfigInfoJSON('ctrip-official-account-source')
      .then((res) => {
        const freeOrderIconConfig = res['wechat-order-detail-free-order-icon'];
        const freeOrderModalConfig =
          res['wechat-order-detail-free-order-dialog'];
        this.setData({
          freeOrderIconConfig,
          freeOrderModalConfig,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  },
  // 获取微信公众号关注状态
  getTrainWXUserState() {
    const params = {
      UnionId: cwx.cwx_mkt.unionid,
      PublicAccountId: 'wxceb61b5cfae46a8c',
    };
    getFollowPublicAccountInfoModel(params, (res) => {
      if (res.RetCode === 1) {
        const { IsFollow } = res;
        this.setData({
          isShowFreeOrder: !IsFollow,
        });
        console.log('7654321res', res);
      }
    });
  },
  getArrivedStationAndCity(orderInfo) {
    try {
      const stationArr =
        orderInfo.TicketInfos?.map((v) => v.ArriveStation) || [];
      let CityArr = [];

      this.setData({
        arrivedStation: [...stationArr],
      });
      TrainStationModel({}, (data) => {
        if (data.TrainStationsInfo) {
          let rawData = data.TrainStationsInfo;
          stationArr.forEach((item) => {
            rawData.forEach((train) => {
              if (train.StationName == item) {
                CityArr.push(train.CityName);
              }
            });
          });
        }
        this.setData({
          arrivedCity: [...CityArr],
        });
      });
    } catch (error) {
      console.log('大概率是TicketInfos', error);
    }
  },
  getBannerItemList() {
    const param = {
      ConfigKey: 'train_wx_orderdetail_swiper_banner',
    };
    ConfigInfoPromise(param)
      .then((data) => {
        const arr = JSON.parse(data.ConfigInfo.Content);
        this.setData({
          bannerItemList: arr,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async getOrderInfoByOid(oid) {
    const deferred = util.getDeferred();
    const params = {
      OrderId: oid,
      ver: 1,
      Channel: 'WX',
    };

    OrderDetailModel(
      params,
      (data) => {
        util.hideLoading();
        if (Object.keys(data).length === 0) {
          util.showModal({
            m: '系统异常，请稍后重试',
          });
          deferred.reject();
        } else {
          deferred.resolve(data);
        }
      },
      (err) => {
        util.hideLoading();
        deferred.reject(err);
        util.showToast(err);
      },
      () => {}
    );

    return deferred.promise;
  },
  // 行程分享入口配置
  getShareEntranceConfig() {
    return getConfigInfoJSON('2021_travel_share_config')
      .then(({ isOpen }) => {
        this.setData({ isShareEntranceOpen: isOpen });
      })
      .catch((_) => console.log(_));
  },
  shareTripPage(e) {
    let index = e.currentTarget.dataset.index || 0;
    if (this.data.segmentationInfo?.groupOrderStatus === 4) {
      util.ubtTrace('c_trn_c_10650037941', {
        bizKey: 'splitGrabSuccessClick',
        orderId:
          this.data.segmentationInfo?.currentRouteSequence === 1
            ? this.data.orderInfo1?.OrderId
            : this.data.orderInfo2?.OrderId,
        relationOrderId:
          this.data.segmentationInfo?.currentRouteSequence === 1
            ? this.data.orderInfo2?.OrderId
            : this.data.orderInfo1?.OrderId,
        type: this.data.intelligentType,
        clickType: 3,
      });
    }

    console.log('分享跳转页面', e);
    const url = `https://m.ctrip.com/webapp/train/activity/ctrip-ticket-itineray-sharing?oid=${this.oid}&tIndex=${index}`;
    this.navigateTo({
      url: '../../webview/webview',
      data: {
        url: encodeURIComponent(url),
      },
    });

    // 埋点
    const {
      OrderStatusBarInfo: { StatusType },
      RescheduleTicketInfoList: { PassengerInfoList = [] } = {},
      IntelligentType,
    } = this.data.orderInfo;
    const ticketStatus = PassengerInfoList.some(
      ({ TicketStatus }) => TicketStatus === 40
    );
    let scenes = 0;

    if (StatusType === 4) scenes = 0;
    if (StatusType === 3) scenes = 1;
    if (ticketStatus && IntelligentType == 1) scenes = 2;

    util.ubtTrace('c_trn_c_10650037941', {
      bizKey: 'shareClick',
      scenes,
      userid: cwx.user.duid,
    });
  },
  zhiduoxingEntranceTimer(oid) {
    const params = {
      OrderId: oid,
      ver: 1,
      Channel: 'WX',
    };

    this.zhiduoxingTimer = setInterval(() => {
      OrderDetailModel(params, (data) => {
        if (Object.keys(data).length === 0) {
          return;
        } else {
          const orderInfo = data.OrderInfo;

          getConfigInfoJSON('ctrip-intelligent-recommend').then((res) => {
            if (
              res?.isOpen &&
              orderInfo?.RelationOrderInfo &&
              this.from !== 'zhiduoxing'
            ) {
              let url = `https://m.ctrip.com/webapp/train/zhiduoxing?oid=${this.store.data.oid}&relationOid=${orderInfo.RelationOrderInfo.RelationOrderNumber}&needLogin=true`;

              if (orderInfo?.RelationOrderInfo?.SceneType === 3) {
                url = url + '&zhiduoxingSceneType=3';
              }
              cwx.redirectTo({
                url: `../../webview/webview?url=${encodeURIComponent(
                  url
                )}&data=${JSON.stringify({ needLogin: true })}`,
              });
              // cwx.redirectTo({
              //     url: `../../webview/webview?url=${encodeURIComponent(
              //         `https://m.ctrip.com/webapp/train/zhiduoxing?oid=${this.store.data.oid}&relationOid=${orderInfo.RelationOrderInfo.RelationOrderNumber}&needLogin=true`,
              //         // `https://pages.ctrip.com/zhiduoxing?oid=${this.store.data.oid}&relationOid=${orderInfo.RelationOrderInfo.RelationOrderNumber}&needLogin=true`,
              //     )}&data=${JSON.stringify({needLogin: true})}`,
              // })
            }
          });
        }
      });
    }, 2000);

    setTimeout(() => {
      clearInterval(this.zhiduoxingTimer);
      this.zhiduoxingTimer = null;
    }, 20000);
  },
  toggleCareRefundFlag() {
    const { showCareRefundFlag } = this.data;
    this.setData({
      showCareRefundFlag: !showCareRefundFlag,
    });
  },
  // 退票关怀金
  getClaimPriceListInfo() {
    const params = { type: 1, OrderNumber: this.store.data.oid, Channel: 'WX' };

    GetClaimPriceListModel(params, (res) => {
      if (res.RetCode !== 1) {
        return;
      } else {
        this.setData({
          claimPriceList: res.ClaimPriceList,
          claimDisplay: res.ClaimPriceList?.length > 0,
        });
      }
    });
  },
  onClickGoClaim() {
    const url =
      'https://m.ctrip.com/webapp/train/activity/orderservice/InsuranceDetail.aspx?ProductID=1118&terminal=1';

    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`,
    });
  },
  onCareRefundClick(e) {
    const { SerialNumber, Status } = e.currentTarget.dataset.item;
    if (Status !== 0) {
      // 0=未申请，1=已申请，2=申请成功，3=申请失败
      return;
    }

    this.applyProductClaim(SerialNumber);
  },
  applyProductClaim(SerialNumber) {
    const params = {
      SerialNumber,
      Type: 1,
      OrderNumber: this.store.data.oid + '',
      Channel: 'WX',
    };

    ApplyProductClaimModel(params, (res) => {
      if (res.RetCode !== 1) {
        util.showToast('申请失败，请稍后重试', 'none');
      } else if (!res.IsSuccess && !res.IsRealNameAuthentication) {
        util.showToast('请实名认证后再来申请', 'none');
      } else if (res.IsSuccess) {
        util.showToast('申请成功，稍后返现至您的携程钱包', 'none');
      } else {
        util.showToast('申请失败，请稍后重试', 'none');
      }

      setTimeout(() => this.loadData(this.store.data.oid), 1500);
    });
  },
  async getCouponList() {
    let params = {
      ActivityCode: '66f21718dc8174427b9bdba47a00b024',
      Channel: 'wx',
      MobilePhone: this.data.userBindedPhoneNumber || '',
      OrderNumber: this.store.data.oid,
    };
    let data = await util.promisifyModel(GetActivityCouponInfoModel)(params);
    if (data && data.CouponItemList) {
      const { CouponItemList } = data;
      let couponListWill = CouponItemList.filter((item) => !item.IsSend);
      if (couponListWill && couponListWill.length) {
        this.setData({
          couponList: couponListWill,
        });
        await this.receiveNewCoupon();
      }
    }
  },
  async receiveNewCoupon() {
    let params = {
      SubType: 0,
      ActivityCode: '66f21718dc8174427b9bdba47a00b024',
      Channel: 'wx',
      MobilePhone: this.data.userBindedPhoneNumber || '',
      GetActivityExtendList: [
        {
          Key: 'haveStock',
          Value: 'true',
        },
        {
          Key: 'orderNumber',
          Value: this.store.data.oid,
        },
      ],
    };
    let data = await util.promisifyModel(ActivitySendCouponModel)(params);
    if (data.RetCode == 1) {
      this.setData({
        isShowCouponDialog: true,
      });
    } else {
      this.setData({
        isShowCouponDialog: false,
      });
    }
  },

  async checkHasBindMobile() {
    const num = await getUserBindedPhoneNumber();
    if (num) {
      this.setData({ userBindedPhoneNumber: num });
    }
    await this.getCouponList();
  },
  tripConflictionHandler(orderInfo, params) {
    let paramsInfo;
    if (params) {
      paramsInfo = JSON.parse(params);
    }

    const isCancel = paramsInfo?.isCancel ? paramsInfo?.isCancel : false;

    let conflictionInfo = null;
    const conflictionInfoStr = orderInfo?.ExtendList?.find(
      (item) => item.Key === 'TripConflict'
    )?.Value;

    if (!!conflictionInfoStr) {
      try {
        conflictionInfo =
          typeof conflictionInfoStr === 'string'
            ? JSON.parse(conflictionInfoStr)
            : conflictionInfoStr;
      } catch (err) {
        console.error(err);
      }
    }

    if (
      !!conflictionInfo &&
      orderInfo?.JLDetailInfo?.JLOrderStatus === 'K' &&
      !isCancel
    ) {
      cwx.redirectTo({
        url: `../../webview/webview?url=${encodeURIComponent(
          `https://m.ctrip.com/webapp/train/itineraryConfliction?oid=${orderInfo.OrderId}&needLogin=true`
          // `https://pages.ctrip.com/itineraryConfliction?oid=${orderInfo.OrderId}`,
        )}&data=${JSON.stringify({ needLogin: true })}`,
      });
    }
  },
  // refund退票前置信息获取
  async getTrainPreEleCounterTicketArtificialReturnInfo(params) {
    const res = await util.promisifyModel(
      TrainPreEleCounterTicketArtificialReturnModel
    )(params);
    if (res.RetCode !== 1)
      return util.showToast(`退票请求失败，请稍后重试~`, 'none');
    if (res.PollingResult === 1) {
      const { PEleTicketArtificialReturnAlertInfo } = res;
      return PEleTicketArtificialReturnAlertInfo;
    } else if (res.PollingResult === 3) {
      setTimeout(
        () =>
          this.getTrainPreEleCounterTicketArtificialReturnInfo({
            ...params,
            Pollingkey: res.Pollingkey,
          }),
        (res.PollingRate || 2) * 1000
      );
    } else if (res.PollingResult === 2)
      return util.showToast(`退票请求失败，请稍后重试~`, 'none');
  },
  // 退票方式选择
  onTapSelectRefundWay(e) {
    const ACTIONTYPE = {
      STATION: 3,
      ARTIFICIAL: 2,
      ONLINE: 1,
    };
    const { btn = {} } = e.currentTarget.dataset;
    const { curRefundPas = {} } = this.data;
    util.ubtTrace('c_trn_c_10320640941', {
      bizKey: 'returnTicketClick',
      type: curRefundPas.reWay,
      clickType: +btn.ActionType,
    });
    switch (+btn.ActionType) {
      case ACTIONTYPE.ONLINE:
        this.getRefundFee(
          curRefundPas.ticketPrice,
          curRefundPas.isRefundReschedule,
          curRefundPas.ticketIndex,
          checkHongkong(this.store.data.orderInfo),
          curRefundPas.idx,
          true
        );
        break;
      case ACTIONTYPE.ARTIFICIAL:
        const params = this.getArtificialParam();
        let paramsStr = '';
        for (const key in params) {
          let val = params[key];

          val = val ?? '';
          paramsStr += key + '=' + encodeURIComponent(val) + '&';
        }
        const url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-artificial-refund?${paramsStr}`;
        this.navigateTo({
          url: `/pages/train/authorise/web/web`,
          data: { url },
        });
        // 跳转到跑腿退票页面
        break;
      case ACTIONTYPE.STATION:
      default:
        this.setData({
          popType: '',
        });
        util.showModal({
          m: btn.ButtonTips || '无法退票',
        });

        break;
    }
  },
  // 点击确认我是本人
  onTapSelfVerify(e) {
    const fromType = e.currentTarget.dataset.fromType ? 2 : 1;
    util.ubtTrace('c_trn_c_10320640941', {
      bizKey: 'returnTicketPersonCheckClick',
      clickType: 1,
      scene: fromType,
    });
    const refundVerifySuccessCb = (e) => {
      try {
        const verifySuccess = e.detail.data.find(
          (item) => item.from === 'verify' && item.success
        );
        const { curRefundPas } = this.data;
        if (!verifySuccess) return;
        this.getRefundFee(
          curRefundPas.ticketPrice,
          curRefundPas.isRefundReschedule,
          curRefundPas.ticketIndex,
          checkHongkong(this.store.data.orderInfo),
          curRefundPas.idx,
          true
        );
      } catch (e) {
        console.log(e);
        util.showToast('本人核验成功，请再次点击退票～', 'none'); // 无法自动调用退票时，也给用户提示
      }
    };
    if (!e.currentTarget.dataset.fromType) {
      if (this.data.refundShareInfo?.userName) {
        this.setData({
          popType: 'REFUNDIDENTIFY',
        });
        return;
      } else {
        let encodeStringParams = '';
        for (const key in this.data.refundShareInfo) {
          let val = this.data.refundShareInfo[key];
          val = val ?? '';
          encodeStringParams += '&' + key + '=' + encodeURIComponent(val);
        }
        const url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-refund-verify?isNormalWebView=1&isSelf=true&source=mp${encodeStringParams}`;
        this.navigateTo({
          url: `/pages/train/webview/webview`,
          data: {
            url,
            bridgeIns: (e) => refundVerifySuccessCb(e),
            needLogin: true,
          },
        });
      }
    } else {
      // 根据code返回判断
      if (this.data.rescBtnActionCode === 0) {
        // 需要核验
        // 没有账号
        if (this.data.rescheduleShareInfo?.userName) {
          this.setData({
            popType: 'RESCHEDULEIDENTIFY',
          });
          return;
        } else {
          let encodeStringParams = '';
          for (const key in this.data.rescheduleShareInfo) {
            let val = this.data.rescheduleShareInfo[key];
            val = val ?? '';
            encodeStringParams += '&' + key + '=' + encodeURIComponent(val);
          }
          const url = `https://m.ctrip.com/webapp/train/activity/ctrip-train-refund-verify?isSelf=true&isReschedule=true&source=mp${encodeStringParams}`;
          console.log(url, 'urlurl');
          this.navigateTo({
            url: `/pages/train/authorise/web/web`,
            data: {
              url,
            },
          });
        }
      } else {
        // 不需要核验，走改签流程
        this.goReschedule(curRescPas.ticketIndex, 1);
      }
    }
  },

  // 退票 同意扫脸
  onTapRefundScanFace(e) {
    if (!this.data.protocalToogle) {
      return util.showToast('请阅读并勾选协议', 'none');
    }
    const { actionType } = e.currentTarget.dataset;
    const {
      userName = '',
      passportName = '',
      passportNumber = '',
      mobile = '',
      passportType,
      loginPW = '',
      failCode = 0,
    } = actionType ? this.data.rescheduleShareInfo : this.data.refundShareInfo;
    const certificationInfo = {
      name: encodeURIComponent(passportName),
      passportType,
      passportNumber,
      mobile,
    };
    const fromType = failCode === 9 ? 7 : 6;
    this.navigateTo({
      url: `/pages/train/face/face?fromType=${fromType}&userName=${userName}&certificationInfo=${JSON.stringify(
        certificationInfo
      )}`,
      callback: (res) => {
        console.log("i'm back from facepage", res);
        const success = res.certificationResultCode == 1;
        const authenticationType = failCode === 9 ? 9 : 0; // 9是快捷退票专用的
        if (actionType) {
          return this.pushScanFaceResult(
            success,
            authenticationType,
            userName,
            11
          ).then(() => {
            if (success) {
              setTimeout(() => {
                this.goReschedule(this.data.curRescPas.ticketIndex, 1);
              }, 500);
            }
          });
        } else {
          // 退票、快捷退票 fromtype都传3
          return this.pushScanFaceResult(
            success,
            authenticationType,
            userName,
            3
          ).then(() => {
            if (success) {
              this.store
                .loadData(this.store.data.oid)
                .then((res) => {
                  this.loadDataUpdate(res.OrderInfo);
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          });
        }
      },
    });
  },
  // 获取跑腿退票参数
  getArtificialParam() {
    // '二代身份证': '1', '护照': 'B' / 2, '回乡证': 'C'/ 7, '台胞证': 'G', '外国人永久居留身份证': 'H', '港澳台居民居住证': 'P'
    const { curRefundPas = {} } = this.data;
    const {
      ticketIndex: tIndex,
      idx: pIndex,
      isRefundReschedule = false,
    } = curRefundPas;
    const train = isRefundReschedule
      ? this.data.orderInfo.RescheduleTicketList[tIndex]
      : this.data.orderInfo.TicketInfos[tIndex];
    return {
      passportName: curRefundPas.PassengerName,
      passportTypeName: curRefundPas.IdentityTypeName,
      passportNumber: curRefundPas.IdentityNo,
      mobile: curRefundPas.PassengerMobileAES,
      ticketId: isRefundReschedule
        ? curRefundPas.OrderRealTicketId
        : curRefundPas.RealTicketInfo.OrderRealTicketId,
      orderPrice: isRefundReschedule
        ? curRefundPas.DealTicketPrice
        : curRefundPas.RealTicketInfo.DealTicketPrice,
      ticketType: isRefundReschedule
        ? curRefundPas.PassengerType
        : curRefundPas.TicketType,
      orderId: this.data.orderInfo.OrderId,
      isBuyPackage: this.data.insurancePromptEntrance.isShow,
      orderType: this.data.orderInfo.IsDirect,
      departDateTime: isRefundReschedule
        ? train.DepartTime.replace(/(-|:|\s)/g, '')
        : (train.DepartDate + train.DepartTime).replace(/(-|:|\s)/g, '') + '00',
      isRefundReschedule,
      channel: 'WX',
    };
  },
  // 购票中订阅
  async guideSubscribeResult(oid) {
    if (this.hasGuideSubscribe) return;
    this.hasGuideSubscribe = true;
    const ticketResultOids = TrainActStore.getAttr('ticketResultOids') || [];
    if (ticketResultOids.includes(oid)) return;
    const tempList = [
      {
        id: 'SgQ749UY85SjV55FP7S4-4Mv4XUkYv7ZFpg-RnOuTl8',
        ActivityCode: 'MessageCostReduce',
        FromType: 1,
      },
    ];
    const statusList = await subscribeMixin.checkSubscribeStatus(tempList);
    // statusList[0].status = false
    if (statusList && statusList.some((temp) => !temp.status)) {
      util.ubtTrace('s_trn_c_trace_10320640941', {
        bizKey: 'allowNotification',
        exposureType: 'popup',
      });
      util.showModal({
        title: '温馨提示',
        m: '允许携程发送购票结果通知，更快掌握车票信息',
        confirmText: '去看看',
        done: () => {
          util.ubtTrace('c_trn_c_10320640941', {
            bizKey: 'allowNotificationClick',
          });
          oid &&
            ticketResultOids.push(oid) &&
            TrainActStore.setAttr('ticketResultOids', ticketResultOids);
          subscribeMixin
            .requestSubscribe(statusList, {
              OpenID: cwx.cwx_mkt?.openid || '',
              OrderNumber: oid,
            })
            .then((_) => {
              util.ubtTrace('s_trn_c_trace_10320640941', {
                bizKey: 'subscribleNotification',
                exposureType: 'actionbar',
              });
              console.log('执行完了');
              if (_?.errMsg) {
                util.ubtTrace('c_trn_c_10320640941', {
                  bizKey: 'subscribleNotificationClick',
                  clickType: 0,
                });
              } else {
                util.ubtTrace('c_trn_c_10320640941', {
                  bizKey: 'subscribleNotificationClick',
                  clickType: 1,
                });
              }
            });
        },
      });
    }
  },

  delay(timer = 2000) {
    return new Promise((resolve) => {
      setTimeout(resolve, timer);
    });
  },

  // 进入页面自动操作的流程
  async enterAutoProcess(options) {
    if (!options.params || !JSON.parse(options.params).process) return;

    const { process, idaes, ticktype } = JSON.parse(options.params);
    const index = this.data.orderInfo.TicketInfos[0].PassengerInfos.findIndex(
      (p) => p.IDCardNumberAES == idaes && p.TicketType == ticktype
    );

    const payload = {
      currentTarget: {
        dataset: {
          tickindex: 0,
          index,
        },
      },
    };

    await this.delay();

    if (process === 'refund') {
      this.refundTicket(payload);
    }
    if (process === 'reschedule') {
      this.rescheduleTicket(payload);
    }
  },

  // 获取加群入口
  async getWeChatGroupInfo() {
    const payload = {
      FromType: 'wx',
      OrderNumber: this.data.orderInfo.OrderId,
      UserId: '',
    };
    const res = await util.promisifyModel(GetWeChatGroupInfo)(payload);
    // const mock = {"RetCode":1,"RetMessage":null,"IsShow":true,"WelfareInfo":{"IconUrl":"https://images3.c-ctrip.com/train/2022/app/8.58/zengzhang/yindaojinqiweiqun/ic-wanlequn-left.png","Title":"超出文案超出文案超z","SubTitle":"xxxxx苏州攻略推荐","ButtonName":"立即进群","JumpUrl":"https://m.ctrip.com/webapp/train/activity/ctrip-train-account-assist/enterpriseAppAssist?source=wechatMiniTicketDetail&orderId=36508693049","BackgroundImgUrl":"","Tag":'送 666666 礼包',"Price":"668","CityName":"苏州"}}
    if (!res) throw Error('企微进群接口异常');
    const { IsShow, WelfareInfo } = res;

    if (IsShow) {
      util.ubtTrace('s_trn_c_trace_10320640941', {
        bizKey: 'wecomGroupExposure',
        version: WelfareInfo.Title,
      });
    }

    this.setData({
      wechatGroupData: {
        IsShow,
        WelfareInfo,
      },
    });
  },
  onClickAddGroup() {
    const { JumpUrl } = this.data.wechatGroupData.WelfareInfo;
    util.ubtTrace('c_trn_c_10320640941', { bizKey: 'wecomGroupClick' });
    if (!JumpUrl) return;

    if (JumpUrl.includes('/pages')) {
      cwx.navigateTo({
        url: JumpUrl,
      });
    } else {
      cwx.navigateTo({
        url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
          JumpUrl
        )}`,
      });
    }
  },
  // 在线换座
  async goToOnline() {
    // 获取本地已登录 12306 账号
    // const bind12306 = TrainBookStore.getAttr('bind12306') || {}
    const url = this.data.OnlineChangeCardInfo.ButtonList[0].JumpUrl;
    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(url)}`,
    });
  },
  closeChildTip() {
    this.setData({ showChildTip: false });
  },
  goChildrenDeclare(e) {
    const canaddfreechild = e.currentTarget.dataset.canaddfreechild;
    const isFromReschedule = e.currentTarget.dataset.isfromreschedule;
    if (!canaddfreechild) {
      return;
    }
    util.ubtTrace('TCWDetail_ChildButton_click', {
      PageId: '10650037941',
      orderId: this.data.orderInfo.OrderId,
    });
    const ticketIndex = e.currentTarget.dataset.tickindex;
    const idx = e.currentTarget.dataset.index;
    const ticketInfo = isFromReschedule
      ? this.data.orderInfo.RescheduleTicketList[ticketIndex]
      : this.data.orderInfo.TicketInfos[ticketIndex];
    const pas = isFromReschedule
      ? ticketInfo.ReschedulePassengerList[idx]
      : ticketInfo.PassengerInfos[idx];
    const departDate = isFromReschedule
      ? ticketInfo.DepartTime?.split(' ')[0]
      : ticketInfo.DepartDate;
    const ticketId = isFromReschedule
      ? pas.OrderRealTicketId
      : pas.RealTicketInfo.OrderRealTicketId;
    const psgInfos = isFromReschedule
      ? ticketInfo.ReschedulePassengerList
      : ticketInfo.PassengerInfos;
    const childrenNameStr = psgInfos
      .map((item) => {
        if (item.CanAddFreeChild) {
          return item.FreePassengerInfo?.PassportName || '';
        }
      })
      .filter((item) => item)
      .join(',');
    const userName = encodeURIComponent(
      util.encodeAES(this.data.orderInfo.UserId12306)
    );
    // const JumpUrl = 'https://m.ctrip.com/webapp/train/childrenDeclare?orderId=22426617620&orderTicketId=865576525&childrenNameStr=&departDate=2023-02-12&isHideNavBar=yes&userName=i1mHe%2FPr1v5AAYy6Qg41mw%3D%3D&from_native_page=1&erudaDebug=1&mp=1&_sync=1&_token=XLvMyh6jic2g6AJHwToolp7DE21K6bkV03f%2FTDWt6OSByj%2FI4LZeoJlwR7NblmAtb1F1QgWY9sQ7ivqeTi8vAzderYyvGDAgNzyXwMrfAOlfNc06mcdBJXDqlp2sfoqcVWIxp0Y05iDrtrV7fHnlMdPDxIwKo3SoM8YEzPW9P7yzg6Jqo2DsCGnMRHHJY2U5a%2BH7o6SwG1IvAPJnVKW3AQ%3D%3D&_cid=52271127111125514472&openId=3f94781b-ae38-40c8-8a7c-772ffa087011&unionId=oHkqHt54RsquvOCx2oCJStEvpr0Q&miniProgramType=weixin&fromminiapp=weixin'
    const JumpUrl = `https://m.ctrip.com/webapp/train/childrenDeclare?orderId=${this.data.orderInfo.OrderId}&orderTicketId=${ticketId}&childrenNameStr=${childrenNameStr}&departDate=${departDate}&isHideNavBar=yes&userName=${userName}&from_native_page=1`;
    console.log('跳转儿童申报', JumpUrl);
    cwx.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
        JumpUrl
      )}`,
    });
  },

  handleFreeChild(e) {
    const isFromReschedule = e.currentTarget.dataset.isfromreschedule;
    const ticketIndex = e.currentTarget.dataset.tickindex;
    const idx = e.currentTarget.dataset.index;
    const ticketInfo = isFromReschedule
      ? this.data.orderInfo.RescheduleTicketList[ticketIndex]
      : this.data.orderInfo.TicketInfos[ticketIndex];
    const pas = isFromReschedule
      ? ticketInfo.ReschedulePassengerList[idx]
      : ticketInfo.PassengerInfos[idx];
    const ticketId = isFromReschedule
      ? pas.OrderRealTicketId
      : pas.RealTicketInfo.OrderRealTicketId;
    const freePassengerInfo = e.currentTarget.dataset.freepassenger;
    util.showModal({
      title: '温馨提示',
      m: '确定删除？',
      showCancel: true,
      done: (res) => {
        if (res.confirm) {
          this.delFreeChild(ticketId, freePassengerInfo);
        }
      },
    });
  },

  async delFreeChild(ticketId, freePassengerInfo) {
    util.ubtTrace('TCWDetail_DeleteChildButton_click', {
      PageId: '10650037941',
      orderId: this.data.orderInfo.OrderId,
    });
    util.showLoading();
    const res = await handleChildTicket({
      OrderNumber: this.data.orderInfo.OrderId,
      OrderTicketId: ticketId,
      ActionType: 2,
      Username: this.data.orderInfo.UserId12306,
      ChildInfo: {
        Name: freePassengerInfo.PassportName, //儿童姓名
        IdType: freePassengerInfo.PassportType, //证件类型, eg：1=身份证（同下单的PassportType）
        IdNumber: freePassengerInfo.PassportNo, //证件号码（神盾）（对应详情给的）
        Mobile: freePassengerInfo.ContactMobile, // 手机号（神盾）（对应详情给的）
      },
    });
    if (res.RetCode !== 1 || (res.RetCode === 1 && res.Result === 2)) {
      util.hideLoading();
      return util.showToast('删除失败，请稍后重试', 'none');
    } else {
      this.store
        .loadData(this.store.data.oid)
        .then((res) => {
          this.loadDataUpdate(res.OrderInfo);
          util.hideLoading();
        })
        .catch((e) => {
          console.log(e);
        });
    }
  },
  async getOmnipotentData() {
    const { TicketInfos, OrderId } = this.data.orderInfo;
    const { DepartDate, ArriveStation, DepartStation, TrainNumber } =
      TicketInfos[0];

    const payload = {
      FromType: 2, // 1=X页；2=订单详情；3=多程x页
      OrderNumber: OrderId,
      DepartureDate: new cDate(DepartDate).format('Ymd'),
      ArriveStation,
      DepartStation,
      TrainNumber,
    };

    // util.showLoading();
    const { RetCode, RetMessage, ServiceDetailInfo } =
      await util.promisifyModel(combineServiceProductDetailModel)(payload);
    // util.hideLoading();

    if (RetCode !== 1) throw RetMessage;

    this.setData({
      omnipotentInfo: ServiceDetailInfo,
    });
  },
  // 唤起全能抢票浮层
  onClickShowOmniPop() {
    this.setData({
      popType: 'omniShow',
    });
  },
  // 页面刷新后跳转改签抢
  goChangeDetail() {
    // 跳转改签抢详情页 改签抢人数等于原票人数且都处于改签中 直接跳转
    // RescheduleType 0 改签 1 改签抢 2 保底票改签抢 3 直连代付改签 4 直连代付改签  5纯直连改签 6前置扣位改签 7改签先抢后付 8智能改签抢 9跑腿改签
    const { RescheduleTicketList, TicketInfos } = this.data.orderInfo;
    if (!RescheduleTicketList?.length) return;

    const canJumpChangeGrabPage =
      RescheduleTicketList?.length &&
      TicketInfos[0].PassengerInfos.length ===
        RescheduleTicketList[0].ReschedulePassengerList.length &&
      RescheduleTicketList[0].ReschedulePassengerList.every(
        (v) =>
          v.TicketStatusCode == 30 &&
          v.RescheduleType != 0 &&
          v.RescheduleType != 9
      );
    if (canJumpChangeGrabPage) {
      shared.orderInfo = this.data.orderInfo;
      const url = `https://m.ctrip.com/webapp/train/rescheduleGrabDetail?orderId=${this.store.data.oid}`;
      return cwx.redirectTo({
        url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
          url
        )}`,
      });
    }
  },
  // 新人特权弹窗数据 倒计时
  initNewGuestData(_orderInfo) {
    const txt = '携程赠送您的新人特权：';
    const AlertInfo = {
      ..._orderInfo.AlertInfo,
      TitleList: [_orderInfo.AlertInfo.Title.replace(txt, ''), txt],
    };

    this.setData({
      orderInfo: {
        ..._orderInfo,
        AlertInfo,
      },
    });

    const timer = setInterval(() => {
      const { newGuestPopCount } = this.data;

      if (!newGuestPopCount) {
        this.hideBackDrop();
        clearInterval(timer);
        return;
      }

      this.setData({ newGuestPopCount: newGuestPopCount - 1 });
    }, 1000);
  },
  onClickFuncTools(e) {
    const key = e.currentTarget.dataset.key;
    const isMore = key === 'more';
    const curr = this.data.effectConfig.funcToolsEntrance.list.find(
      (v) => v.key === key
    );
    const link = curr.link;

    util.ubtFuxiTrace('TCWDetail_GridModule_click', {
      PageId: '10650037941',
      Type: curr.name,
    });

    if (isMore) return;

    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
        link
      )}`,
    });
  },
  // 风险提示点击跳转
  clickTips(e) {
    console.log('点击跳转');
    this.navigateTo({
      url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
        e.currentTarget.dataset.url
      )}`,
    });
  },
  getMultipleBookingAndGrabSegmentation(orderInfo) {
    const multipleBookingAndGrabSegmentation = orderInfo.ExtendList?.find(
      (item) => item.Key === 'MultipleBookingAndGrabSegmentation'
    )?.Value;
    if (multipleBookingAndGrabSegmentation) {
      const multipleBookingAndGrabSegmentationValue = JSON.parse(
        multipleBookingAndGrabSegmentation
      );
      const {
        currentRouteSequence,
        currentOrderStatusName,
        currentOrderStatus,
        currentOrderNumber,
      } = multipleBookingAndGrabSegmentationValue;
      let relationOrderInfoList =
        multipleBookingAndGrabSegmentationValue?.relationOrderInfoList;
      if (relationOrderInfoList) {
        try {
          const {
            orderNumber,
            orderStatusName,
            ticketInfoList,
            routeSequence,
            canShowStationInfo,
            orderStatus,
          } = relationOrderInfoList[0];
          let relationOrderStatus = orderStatus;
          const {
            departDateTime,
            departStation,
            arriveDateTime,
            arriveStation,
          } = ticketInfoList[0];
          let departTime = `${departDateTime.substring(
            8,
            10
          )}:${departDateTime.substring(10, 12)}`;
          let arriveTime = `${arriveDateTime.substring(
            8,
            10
          )}:${arriveDateTime.substring(10, 12)}`;

          const date1 = new Date(
            departDateTime.substring(0, 4), // 年
            parseInt(departDateTime.substring(4, 6)) - 1, // 月
            departDateTime.substring(6, 8) // 日
          );
          const date2 = new Date(
            arriveDateTime.substring(0, 4),
            parseInt(arriveDateTime.substring(4, 6)) - 1,
            arriveDateTime.substring(6, 8)
          );
          // 计算两个日期之差（天）
          const diffDays = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));

          this.setData({
            multipleBookingAndGrabSegmentationInfo: {
              orderStatusName,
              departTime,
              departStation,
              arriveTime,
              arriveStation,
              orderNumber,
              routeSequence,
              currentRouteSequence,
              currentOrderStatusName,
              canShowStationInfo,
              relationOrderStatus,
              currentOrderStatus,
              diffDays,
              currentOrderNumber,
            },
          });
          util.ubtTrace('TCWDetail_MultiRoutes_exposure', {
            PageId: '10650037941',
            orderId: currentOrderNumber,
            channel: 'wx',
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  },
});

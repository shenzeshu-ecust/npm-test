import { cwx, __global } from '../../../cwx/cwx';
import { handleOrderInfoToBreak } from './common';
import create from './utils/create';
import store from './store';
import util from '../common/util';
import {
  OrderDetailModel,
  ChangeTicketOrderDetailModel,
  notifyStartUpModel,
} from '../common/model';
import {
  setConfigSwitchAsyncPromise,
  getConfigByKeysPromise,
} from '../common/common';

import { shared } from '../common/trainConfig';
import getExtendValue from './utils/getExtendValue';
import { isWaitSplitOrderStatus } from './utils/isWaitSplitOrderStatus';

const getTaroOrderSwitch = getConfigByKeysPromise({
  keys: ['taro-train-order-switch'],
})
  .then((res) => {
    if (res.resultCode != 1) {
      throw '获取配置失败';
    }
    return res.configs[0].data.switch;
  })
  .catch((e) => {});

/**
 * westore 状态管理工具 https://github.com/Tencent/westore
 * store: 订单详情页 全局数据中心 分发状态数据源
 * data: 页面和组件上需要声明依赖的 data，这样 westore 会按需根据store局部更新。另外也可以定义 store.data 没有的属性，该属性的变更只能通过 this.setData 进行更新视图
 *
 * 这个页面只做总状态获取并且跳转  不同页面在该页面做数据处理逻辑
 */
create(store, {
  checkPerformance: true,
  pageId: shared.pageIds.orderdetail.pageId,
  data: {
    orderInfo: null,
    showType: null,
    configs: null,
    isIphoneX: util.isIphoneX(),
    params: null,
    taroDetailFlag: false,
  },
  onLoad: function (options) {
    const { oid, showType = '', mark, isNoSeat, needJump } = options;
    this.update({
      oid,
      showType,
      mark,
      isNoSeat,
      needJump,
    });

    const params = {
      ...options,
      isCancel: options.isCancel,
      showNearTrainModal: options.showNearTrainModal, //疫情城市改单触达
      showModal: options.showModal,
      entrance: options.entrance,
    };

    this.setData({
      params,
    });

    let abValue = cwx.ABTestingManager.valueForKeySync('220328_TRN_WSP');
    this.setData({
      taroDetailFlag: abValue === 'B',
    });
  },
  onShow() {
    if (!this.readyToRedirectPromise) {
      this.readyToRedirectPromise = new Promise((resolve) => {
        this.readyToRedirectResolve = resolve;
      });
    }
    this.onShowLoginCb();
    this.loadConfigs();
  },
  onReady() {
    this.readyToRedirectResolve();
  },
  setConfigs(configKey, storeKey) {
    let configs = this.store.data.configs || {};
    setConfigSwitchAsyncPromise(configKey, storeKey)
      .then(([res]) => {
        configs[storeKey] = res;
        this.update({ configs });
      })
      .catch((e) => {
        this.ubtTrace('loadconfigErr', e);
      });
  },
  loadConfigs() {
    this.setConfigs('train_wx_orderdetail_guessbox_new', 'guessbox');
    this.setConfigs('train_wx_orderdetail_splittransit', 'splittransitflag');
    this.setConfigs('train_wx_orderdetail_isHideGuideApp', 'isHideGuideApp');
  },
  // OrderStatus订单状态 1:待支付;2:支付处理中;3:支付失败;4:支付成功待出票;5:购票中;6:已购票;7:已配送;8:已成交;9:已取消;10:部分退票;11:已退票
  loadData(oid) {
    const deferred = util.getDeferred();
    const params = {
      OrderId: oid,
      ver: 1,
      Channel: 'WX',
    };
    OrderDetailModel(
      params,
      (data) => {
        // auth 失效的情况要注意
        if (
          data.ResponseStatus &&
          data.ResponseStatus.Errors &&
          data.ResponseStatus.Errors.length
        ) {
          // this.wxLogin()
          if (data.ResponseStatus.Ack == 'Failure') {
            let errors = data.ResponseStatus.Errors;
            let errorCode = errors[0].ErrorCode;
            if (errors.length > 0) {
              let Message = errors[0].Message || '';
              if (errorCode == '-1' && Message.indexOf('不属于用户') > -1) {
                this.ctripLogin();
              } else if (
                errorCode.indexOf('MobileRequestFilterException') !== -1
              ) {
                // auth失效
                this.ctripLogin();
              }
            }

            return;
          }
          util.showModal({
            m: data.RetMessage || '系统异常，请稍后重试',
          });
          deferred.reject();
        } else if (Object.keys(data).length === 0) {
          util.showModal({
            m: data.RetMessage || '系统异常，请稍后重试',
          });
          deferred.reject();
        } else {
          deferred.resolve(data);
        }
      },
      (err) => {
        deferred.reject(err);
      },
      () => {}
    );

    return deferred.promise;
  },
  // 其他登录方式成功回调
  ctripLogin() {
    const deferred = util.getDeferred();
    cwx.user.login({
      callback(res) {
        if (res.ReturnCode == 0) {
          this.setData({ showType: '' });
          this.onShowLoginCb();
          deferred.resolve();
        } else {
          deferred.reject();
        }
      },
    });

    return deferred.promise;
  },
  async handleIntelligenceRescheduleGrab(orderInfo) {
    const env = __global.env;
    const JLView =
      orderInfo.OrderType == 'JL' &&
      (orderInfo.OrderStatus == 4 ||
        (orderInfo.IsFastPay && orderInfo.OrderStatus == 1)) &&
      !orderInfo.EnablePayOrder &&
      orderInfo.JLDetailInfo;
    let host = 'https://m.ctrip.com/';
    // if (env == 'fat') {
    //     host = 'https://m.fat20.qa.nt.ctripcorp.com/'
    // }
    const deferred = util.getDeferred();
    try {
      const RescheduleOrderNumber =
        orderInfo.RescheduleTicketList[0]?.RescheduleOrderNumber || '';
      if (orderInfo.IntelligentType !== 1) return;
      const params = {
        OrderId: RescheduleOrderNumber,
      };
      const data = await util.promisifyModel(ChangeTicketOrderDetailModel)(
        params
      );
      // ChangeTicketOrderDetailModel(params,
      // data => {
      if (!data.ChangeTicketInfo || data.RetCode != 0) {
        // deferred.reject()
        return;
      }
      const changeGrabString =
        data?.ExtendList?.find(
          (item) => item.Key === 'SmartRescheduleGrabScene'
        )?.Value || null;
      if (!changeGrabString) {
        return;
      }
      /**
       * 1.3 改签车次 2.8 坐席高改低
       */
      const scene = `${JSON.parse(changeGrabString).changeGrabType1}.${
        JSON.parse(changeGrabString).changeGrabType2
      }`;
      if (
        (data.JLOrderStatus === 'D' || data.JLOrderStatus === 'E') &&
        ['1.2', '1.3', '2.1', '2.2', '2.8', '2.12', '2.24', '2.25'].includes(
          scene
        )
      ) {
        const url = `${host}webapp/train/intelligentRescheduleGrab?titleBgColor=0086F6&titleColor=ffffff&orderId=${orderInfo.OrderId}&rescheduleOrderNumber=${RescheduleOrderNumber}`;
        cwx.redirectTo({
          url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
            url
          )}`,
        });
      } else {
        this.goDetail(orderInfo, JLView);
      }
      //  deferred.resolve(data)
      // }
      // ,
      //     err => {
      //         deferred.reject()
      //     }
      // )
    } catch (e) {
      deferred.reject();
      return;
    }
    return deferred.promise;
  },
  goDetail(orderInfo, JLView) {
    const goDetailWithPath = (path, nexOid) => {
      if (nexOid) {
        return cwx.redirectTo({
          url: `${path}?params=${JSON.stringify({
            ...(this.data.params || {}),
            oid: nexOid,
          })}`,
        });
      }
      if (this.data.params) {
        return cwx.redirectTo({
          url: `${path}?params=${JSON.stringify(this.data.params)}`,
        });
      }
      return cwx.redirectTo({ url: path });
    };

    if (JLView) {
      getTaroOrderSwitch
        .then((res) => {
          if (res) {
            shared.orderInfo = orderInfo;
            shared.showType = this.store.data.showType;
            return goDetailWithPath('/pages/trainOrder/orderdetail/grab/index');
          }
          throw '开关关闭';
        })
        .catch(() => {
          goDetailWithPath('/pages/train/orderdetail/grab/grab');
        });
      return;
    }

    let ordinaryDetailPath = '/pages/train/orderdetail/ordinary/ordinary';
    let splitOrderPath = '/pages/trainOrder/orderdetail/splitorder/index';

    // goDetailWithPath(splitOrderPath);
    // return
    let extendValues = getExtendValue(orderInfo);
    if (extendValues.MultipleBookingAndGrabSegmentation) {
      let multipleBookingAndGrabSegmentation =
        extendValues.MultipleBookingAndGrabSegmentation;
      if (
        multipleBookingAndGrabSegmentation.groupOrderStatus <= 1 &&
        isWaitSplitOrderStatus(multipleBookingAndGrabSegmentation)
      ) {
        goDetailWithPath(splitOrderPath);
        return;
      }
    }
    goDetailWithPath(ordinaryDetailPath);
  },
  onShowLoginCb() {
    if (!cwx.user.isLogin()) {
      // this.wxLogin()
      if (!this.hasGoLogin) {
        this.hasGoLogin = true;
        this.ctripLogin().then(() => {
          this.onShowLoginCb();
        });
        return;
      }
      if (getCurrentPages().length === 1) {
        util.showModal({
          m: '请先登录携程账号后继续查看',
          confirmText: '去登录',
          done: () => {
            this.ctripLogin().then(() => {
              this.onShowLoginCb();
            });
          },
        });
        return;
      }

      return cwx.navigateBack();
    }

    this.loadData(this.store.data.oid)
      .then(async (data) => {
        const { OrderInfo } = data;

        if (OrderInfo.UserId12306) {
          notifyStartUpModel(
            { UserName: OrderInfo.UserId12306, Channel: 'WX' },
            (res) => {
              if (!res.RetCode === 1) {
                console.log(`notifyStartUp fail: ${res.RetMessage}`);
              }
            }
          );
        }

        this.entranceTrace(OrderInfo, this.data.params);

        const JLView =
          OrderInfo.OrderType == 'JL' &&
          (OrderInfo.OrderStatus == 4 ||
            (OrderInfo.IsFastPay && OrderInfo.OrderStatus == 1)) &&
          !OrderInfo.EnablePayOrder &&
          OrderInfo.JLDetailInfo;
        if (handleOrderInfoToBreak(OrderInfo)) {
          return;
        }

        convertData(OrderInfo);
        this.update({
          orderInfo: OrderInfo,
          begain: Date.now(),
        });

        // 捡漏收费页面
        if (
          OrderInfo.JLDetailInfo &&
          OrderInfo.JLDetailInfo.JLOrderStatus === 'L'
        ) {
          // const env = __global.env
          let host = 'https://m.ctrip.com/';
          // if (env == 'fat') {
          //     host = 'https://m.fws.qa.nt.ctripcorp.com/'
          // }
          const url = `${host}webapp/train/activity/20220930-ctrip-payfor-jianlou?oid=${this.store.data.oid}`;
          return cwx.redirectTo({
            url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
              url
            )}`,
          });
        }

        // 优先智能改签抢
        if (
          OrderInfo.IntelligentType === 1 &&
          OrderInfo.RescheduleTicketList.length !== 0
        ) {
          // await util.promisifyModel(this.handleIntelligenceRescheduleGrab)(OrderInfo)
          await this.handleIntelligenceRescheduleGrab(OrderInfo);
        }

        // 跳转改签抢详情页 改签抢人数等于原票人数且都处于改签中 直接跳转
        // RescheduleType 0 改签 1 改签抢 2 保底票改签抢 3 直连代付改签 4 直连代付改签  5纯直连改签 6前置扣位改签 7改签先抢后付 8智能改签抢 9跑腿改签
        const { RescheduleTicketList, TicketInfos } = OrderInfo;
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
          shared.orderInfo = OrderInfo;
          const url = `https://m.ctrip.com/webapp/train/rescheduleGrabDetail?orderId=${this.store.data.oid}`;
          return cwx.redirectTo({
            url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
              url
            )}`,
          });
        }

        await this.readyToRedirectPromise;
        this.goDetail(OrderInfo, JLView);
      })
      .catch((e) => {
        this.ubtDevTrace('c_train_loaddataerr', e || {});
      });
  },
  // 查看订单来源埋点
  entranceTrace(OrderInfo, params) {
    if (!params?.entrance) return;
    const scene =
      [
        'TRAIN_OFFICIAL_ACCOUNT',
        'TRAIN_ENTERPRISE_WECHAT',
        'GRAB_INTERRUPT',
        'GRAB_WEAK_GUIDE',
        'GRAB_NO_START',
      ].findIndex((item) => item === params.entrance) + 1;
    util.ubtTrace('s_trn_c_trace_10320640941', {
      exposureType: 'normal',
      bizKey: 'wechatPublicAccountEntry',
      orderid: OrderInfo.OrderId,
      scene: scene,
    });
  },
});

// 尽量别写业务吧
const convertData = (orderInfo) => {
  // parse 未通过核验的 content
  orderInfo?.TopMessageInfo?.MessageList?.forEach((msg) => {
    if (msg.MessageType === 3 && msg.Content) {
      msg.Content = JSON.parse(msg.Content);
    }
  });

  // 弱引导字段格式化
  orderInfo.GrabInterrupteInfoV2 = util.getLowerCaseKeyObject(
    orderInfo.GrabInterrupteInfoV2
  );
};

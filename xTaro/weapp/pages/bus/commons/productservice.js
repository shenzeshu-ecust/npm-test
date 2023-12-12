import { Pservice } from './request';
import BusConfig from './busConfig';
import { cwx } from './cwx/index';
const newSoaUrl = '/restapi/soa2/';
var newBaseUrl = '/restapi/buscommon/index.php?param=/api/home&method=';

var baseParam = 'ref=ctrip.h5&partner=ctrip.app&clientType=wx&version=';

const requestRegister = Pservice.requestRegister;

//以下是接口配置
var home = {
  getHomeNotice: {
    url: 'notice.getHomeNotice',
    baseUrl: newBaseUrl,
    baseParam: baseParam,
    extraParam: {
      business_type: 'bus',
      client_type: 'ctrip.h5',
    },
  },
  // 出发城市
  getFromCityList: {
    baseUrl: '/restapi/busbooking/bus/',
    url: 'getFromCityList.json',
    noUrlBase: true,
    isNew: true,
  },

  // 到达城市
  getToCityList: {
    baseUrl: '/restapi/busbooking/bus/',
    url: 'getToCityList.json',
    noUrlBase: true,
    isNew: true,
  },

  getFromCityListSOA: {
    baseUrl: newSoaUrl,
    url: '13906/json/getFromCityList',
    noUrlBase: true,
    isNew: true,
  },
  getToCityListSOA: {
    baseUrl: newSoaUrl,
    url: '13906/json/getToCityList',
    noUrlBase: true,
    isNew: true,
  },

  locationCityList: {
    baseUrl: newSoaUrl,
    url: '13025/json/locationCityList',
    noUrlBase: true,
    isNew: true,
  },

  // from city suggest
  fromCitySuggest: {
    url: '13025/json/fromCitySuggest',
    isNew: true,
    baseUrl: newSoaUrl,
    noUrlBase: true,
  },
  // to city suggest
  toCitySuggest: {
    url: '13025/json/toCitySuggest',
    isNew: true,
    baseUrl: newSoaUrl,
    noUrlBase: true,
  },

  getHomeOrder: {
    baseUrl: newSoaUrl,
    url: '13025/json/getHomeOrder',
    noUrlBase: true,
    isNew: true,
  },
  receSendCoupon: {
    url: 'receivable.sendCoupon',
    baseUrl: newBaseUrl,
    extraParam: {
      ref: 'ctrip.h5',
    },
  },
  sendCouponAfterWxOrder: {
    url: '14338/json/SendCouponAfterWxOrder',
    noUrlBase: true,
    baseUrl: newSoaUrl,
    isNew: true,
  },
  receiveCouponInfoQuery: {
    url: '20920/json/receiveCouponInfoQuery',
    noUrlBase: true,
    isNew: true,
    baseUrl: newSoaUrl,
  },
  receiveCouponCallBack: {
    url: '20920/json/receiveCouponCallBack',
    noUrlBase: true,
    isNew: true,
    baseUrl: newSoaUrl,
  },
  machineSendCoupon: {
    baseUrl: newSoaUrl,
    url: '13025/json/machineSendCoupon',
    noUrlBase: true,
    isNew: true,
  },
  homeCouponNotice: {
    baseUrl: newSoaUrl,
    url: '13025/json/homeCouponNotice',
    noUrlBase: true,
    isNew: true,
  },
  getWxqrCode: {
    baseUrl: newSoaUrl,
    url: '13242/getWxqrCode',
    noUrlBase: true,
    isNew: true,
  },
  exchangeAppPath: {
    url: '12673/exchangeAppPath',
    baseUrl: newSoaUrl,
    isNew: true,
    baseParam: '',
    noUrlBase: true,
  },
  getShipRecommend: {
    url: '15123/getIndexRecommend',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getShipNotice: {
    url: '13025/json/getBusNotice',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getShipCouponData: {
    url: '15123/getCouponList',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getCouponList: {
    url: '18734/json/getCoupon',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getNewGuestActivity: {
    url: '18734/json/newGuestActivity',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getCouponExpireNotice: {
    url: '13025/json/couponExpireNotice',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getSearchButtonUrl: {
    url: '13025/json/getSearchButtonUrl',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getOldGuestActivity: {
    url: '18734/json/oldGuestActivity',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
};
//新订单相关接口
var orderNew = {
  getLaunchPay: {
    url: '14338/getLaunchPay',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  applyRefundNote: {
    baseUrl: newSoaUrl,
    url: '14338/json/applyRefundNote',
    noUrlBase: true,
    baseParam: '',
    isNew: true,
  },
  applyRefundProduct: {
    baseUrl: newSoaUrl,
    url: '14338/json/applyRefundProduct',
    noUrlBase: true,
    baseParam: '',
    isNew: true,
  },
  orderCancel2: {
    baseUrl: newSoaUrl,
    url: '14338/json/cancelOrder?fake=0',
    noUrlBase: true,
    baseParam: '',
    isNew: true,
  },
  orderRefund2: {
    baseUrl: newSoaUrl,
    url: '14338/json/applyRefundTicket?fake=0',
    noUrlBase: true,
    baseParam: '',
    isNew: true,
  },

  createBookingOrder: {
    url: '13906/json/createBookingOrder',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  newAddorder: {
    url: '13906/json/addOrder',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
    baseParam: '',
    extraParam: {
      clientInfo: (function () {
        var systemInfo = cwx.util.systemInfo || {};
        return {
          clientType: systemInfo.platform + BusConfig.suffix,
          clientDesc:
            ('' + systemInfo.model).replace(/<[^>]*>/g, '') +
            '--' +
            systemInfo.version,
          clientVersion: BusConfig.client_version || systemInfo.version,
        };
      })(),
    },
  },
  orderDetail: {
    url: '14338/orderDetail',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
};

let list = {
  busListV2: {
    url: '13906/json/busListV2',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  checkBook: {
    url: '13906/json/checkTicketBook',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  checkBookDate: {
    url: '20872/json/checkBookDates',
    isNew: true,
    noUrlBase: true,
    baseUrl: newSoaUrl,
  },
  getNoResultRecommend: {
    url: '20872/json/getNoResultRecommend',
    isNew: true,
    noUrlBase: true,
    baseUrl: newSoaUrl,
  },
  lineRecoverSubscribeStatus: {
    url: '13906/json/lineRecoverSubscribeStatus',
    isNew: true,
    noUrlBase: true,
    baseUrl: newSoaUrl,
  },
  lineRecoverSubscribe: {
    url: '13906/json/lineRecover',
    isNew: true,
    noUrlBase: true,
    baseUrl: newSoaUrl,
  },
  confirmPromise: {
    baseUrl: newSoaUrl,
    url: '13025/json/confirmPromise',
    noUrlBase: true,
    baseParam: '',
    isNew: true,
  },
  submitConfirmPromise: {
    baseUrl: newSoaUrl,
    url: '13025/json/submitConfirmPromise',
    noUrlBase: true,
    baseParam: '',
    isNew: true,
  },
};

let passengers = {
  getCommonPassengers: {
    url: '14606/GetCommonPassenger.json',
    baseUrl: newSoaUrl,
    soa: true, // 非汽车票接口接口返回没有code值，需特殊判断
    noUrlBase: true,
    extraParam: {
      ParameterList: [
        { Key: 'BizType', Value: 'BUS' },
        { Key: 'BookingType', Value: 'B' },
        {
          Key: 'CipherDataType',
          Value: '1',
        },
        {
          Key: 'ResultDataType',
          Value: '1',
        },
      ],
    },
  },
  savePassenger: {
    url: '14338/savePassenger.json',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
};
let book = {
  getBusDetail: {
    baseUrl: newSoaUrl,
    url: '13906/json/getBusDetail',
    noUrlBase: true,
    baseParam: '',
    isNew: true,
  },
  activityXList: {
    url: '17387/json/activityXList',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getBookingActivity: {
    url: '17387/json/activityBookingList',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getBookActivityList: {
    url: '17387/json/activityBookingListV2',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getServiceFeeExplain: {
    baseUrl: newSoaUrl,
    url: '13025/json/getServiceFeeExplain',
    noUrlBase: true,
    isNew: true,
  },
};
let helper = {
  point: {
    baseUrl: newSoaUrl,
    url: '22044/json/point',
    isNew: true,
    noUrlBase: true,
  },

  getRealNamePacket: {
    domain: 'https://gateway.secure.ctrip.com',
    // domain: 'https://gateway.secure.fws.qa.nt.ctripcorp.com', //堡垒机
    baseUrl: '/restful/soa2/',
    url: '14523/sendPacket',
    soa: true,
    noUrlBase: true,
  },
  getChildTicketDescription: {
    baseUrl: newSoaUrl,
    url: '13025/json/getChildTicketDescription',
    isNew: true,
    noUrlBase: true,
  },
  getPurseBalanceFee: {
    url: '13025/json/getPurseBalanceFee',
    isNew: true,
    baseUrl: newSoaUrl,
    noUrlBase: true,
  },
  getPurseList: {
    baseUrl: newSoaUrl,
    url: '13025/json/getPurseList',
    isNew: true,
    noUrlBase: true,
  },
  getBusListType: {
    baseUrl: newSoaUrl,
    url: '13025/json/getBusListType',
    noUrlBase: true,
    isNew: true,
  },
  discountNoticeBeforeBuy: {
    url: '17387/json/discountNoticeBeforeBuy',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
};

// 用户相关
var user = {
  // 校验新用户
  checkIsNewUser: {
    isNew: true,
    baseUrl: newSoaUrl,
    url: '13025/json/lotterySendCoupon?aparam=1',
  },
  getLotteryCouponMsg: {
    isNew: true,
    baseUrl: newSoaUrl,
    url: '13025/json/getLotteryCouponMsg?aparam=1',
  },
  checkBusNewUser: {
    baseUrl: newSoaUrl,
    url: '13025/json/checkBusNewUser',
    isNew: true,
    noUrlBase: true,
  },
  // 获取优惠券
  filteredCouponQuery: {
    url: '20920/json/filteredCouponQuery',
    isNew: true,
    baseUrl: newSoaUrl,
    noUrlBase: true,
  },
  // 获取用户手机号
  getMobileByAuth: {
    url: 'user.getBindMobile',
    baseUrl: newBaseUrl,
    baseParam: baseParam,
  },
  getNewGuestActivity: {
    url: '18734/json/newGuestActivity',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getOldGuestActivity: {
    url: '18734/json/oldGuestActivity',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  // 新客挽留发券
  newUserSaveCoupon: {
    url: '13025/json/NewUserSaveCoupon?t=1',
    isNew: true,
    baseUrl: newSoaUrl,
  },
};
let getConfig = {
  getConfigInfo: {
    url: '13025/json/getConfigInfo',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
  getShipConfigInfo: {
    url: '15123/wechatBanner',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
};
//新接口
requestRegister(home);
requestRegister(orderNew);
requestRegister(list);
requestRegister(passengers);
requestRegister(book);
requestRegister(helper);
requestRegister(user);
requestRegister(getConfig);

var terminalBase = '/restapi/terminalbooking/storemobile/api/json/';
var terminalBooking = {
  aiMiniAppBookingInfo: {
    baseUrl: terminalBase,
    url: 'AIMiniAppBookingInfo',
    soa: true,
    noUrlBase: true,
  },
  aiMiniAppAddOrderInfo: {
    baseUrl: terminalBase,
    url: 'AIMiniAppAddOrderInfo',
    soa: true,
    noUrlBase: true,
  },
  aiMiniAppUpdateOrderContent: {
    baseUrl: terminalBase,
    url: 'AIMiniAppUpdateOrderContent',
    soa: true,
    noUrlBase: true,
  },
  offlineMiniAppSubOrder: {
    baseUrl: terminalBase,
    url: 'OfflineMiniAppSubOrder',
    soa: true,
    noUrlBase: true,
    extraParam: {
      clientType: (function () {
        var systemInfo = cwx.util.systemInfo || {};
        return systemInfo.platform + BusConfig.suffix;
      })(),
      clientInfo: (function () {
        var systemInfo = cwx.util.systemInfo || {};
        return (
          ('' + systemInfo.model).replace(/<[^>]*>/g, '') +
          '--' +
          systemInfo.version
        );
      })(),
    },
  },
  miniAppOrderInfo: {
    baseUrl: terminalBase,
    url: 'MiNiAppOrderInfo',
    soa: true,
    noUrlBase: true,
  },
  getLongUrl: {
    baseUrl: terminalBase,
    url: 'GetLongUrl',
    soa: true,
    noUrlBase: true,
    extraParam: {
      clientType: (function () {
        var systemInfo = cwx.util.systemInfo || {};
        return systemInfo.platform + BusConfig.suffix;
      })(),
      clientInfo: (function () {
        var systemInfo = cwx.util.systemInfo || {};
        return (
          ('' + systemInfo.model).replace(/<[^>]*>/g, '') +
          '--' +
          systemInfo.version
        );
      })(),
    },
  },

  getLongUrlTrans: {
    url: '13025/json/GetLongUrl',
    baseUrl: newSoaUrl,
    isNew: true,
    baseParam: '',
    noUrlBase: true,
  },
};
requestRegister(terminalBooking);

let newTerminal = {
  offlineMiniAppSubOrderNew: {
    baseUrl: newSoaUrl,
    url: '22044/json/OfflineMiniAppSubOrder',
    isNew: true,
    noUrlBase: true,
    extraParam: {
      clientType: (function () {
        var systemInfo = cwx.util.systemInfo || {};
        return systemInfo.platform + BusConfig.suffix;
      })(),
      clientInfo: (function () {
        var systemInfo = cwx.util.systemInfo || {};
        return (
          ('' + systemInfo.model).replace(/<[^>]*>/g, '') +
          '--' +
          systemInfo.version
        );
      })(),
    },
  },
  offlineGetPayParams: {
    baseUrl: newSoaUrl,
    url: '22044/json/payParams',
    isNew: true,
    noUrlBase: true,
  },
  orderConfig: {
    baseUrl: newSoaUrl,
    url: '22044/json/orderConfig',
    isNew: true,
    noUrlBase: true,
  },
  point: {
    baseUrl: newSoaUrl,
    url: '22044/json/point',
    isNew: true,
    noUrlBase: true,
  },
};
requestRegister(newTerminal);

var tipMask = {
  homePrompt: {
    url: '13025/ctripxcxHomePromptService',
    baseUrl: newSoaUrl,
    isNew: true,
    noUrlBase: true,
  },
};
requestRegister(tipMask);

Pservice.getBindedPhoneNumber = function () {
  let promise = new Promise((resolve, reject) => {
    if (cwx.user.getPhoneNumberByTicket) {
      cwx.user.getPhoneNumberByTicket(function (
        resCode,
        foo,
        errorMsg,
        phoneNumber
      ) {
        if (resCode != 0) {
          console.warn(errorMsg);
          resolve('');
        } else {
          if (phoneNumber === undefined) {
            // util.showModal({
            //     m: '该账户未绑定手机号'
            // })
          } else {
            // util.showModal({
            //     m: '该账户已绑定手机号'
            // })
          }
        }
        console.info(
          'getPhoneNumberByTicket, phoneNumber:' +
            phoneNumber +
            ', resCode:' +
            resCode +
            ', errMsg:' +
            errorMsg
        );
        resolve(phoneNumber || '');
      });
    } else {
      resolve('');
    }
  });

  return promise;
};

export { Pservice };
export default Pservice;

/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2022-03-23 14:37:08
 * @LastEditors: lh_sun
 * @LastEditTime: 2022-04-06 18:39:03
 */
import {
  cwx
} from '../../../../cwx/cwx.js';
import __global from '../../../../cwx/ext/global.js';
import {
  PayWayStore,
  PayParamsStore
} from '../models/stores';
import * as libs from '../libs/index';
import {
  getUniid,
  clearPaymentTraceId
} from './util'

const version = '8.63.6'
let paymentType = 'SDK'

let payWayStore = PayWayStore();
let payToken = ''

let ubtBusiness = 'pre_payment'
let extend = null
let sysInfo = {}
let addOrderRes = {} // 视频号检查结果
let h5plat = 29
cwx.getSystemInfo({
  success: (result) => {
    sysInfo = result
  },
})

function checkBeforeAddOrder(callback) {
  try {
    wx.checkBeforeAddOrder({
      success(res) {
        addOrderRes = res && res.data
        if (addOrderRes.requireOrder == 1) {
          h5plat = 55
        } else {
          h5plat = 29
        }
        console.log('checkBeforeAddOrder', res)
        sendUbt({
          type: 'chain',
          chainName: `checkAddOrder_${addOrderRes.requireOrder}`,
          desc: '检查是否视频号',
          devOriKey: `checkBeforeAddOrder`,
          extend: res
        })
        callback && callback()
      },
      fail(res) {
        console.error(res)
        callback && callback()
      }
    })
  } catch (error) {
    console.error(error)
    sendUbt({
      type: 'error',
      desc: '检查是否视频号 catch',
      devOriKey: `checkBeforeAddOrder_catch`,
      extend: error
    })
    callback()
  }
}

function getH5Plat() {
  return h5plat
}

const initFullChain = (bus, type = 'SDK') => {
  ubtBusiness = bus
  extend = null
  libs.setUbtOrder(0)
  libs.setPageTraceId(getUniid())
  clearPaymentTraceId()
  paymentType = type
}

const payParamsStore = PayParamsStore()
let clearStore = function () {

};

let sendUbtTrace = function (ubtData) {
  sendUbt(ubtData);
};

function getOrderid() {
  const orderInfo = payWayStore.getAttr('orderInfo') || {};
  return orderInfo.outTradeNo
}

function getMerchantId() {
  try {
    const payOrderInfo = getOrderInfos()
    if (!payOrderInfo) return ''
    return payOrderInfo.merchantId
  } catch (error) {
    console.log(error)
  }
}

let sendUbt = function (ubtData) {
  const data = {
    type: 'info',
    ...ubtData,
    appid: __global.appId,
    plat: 'mini',
    miniType: 'wx',
    company: 'ctrip',
    business: ubtBusiness,
    orderId: getOrderid(),
    payToken,
    version,
    merchId: getMerchantId(),
    devOriKey: ubtData.devOriKey || ubtData.a || '',
    desc: ubtData.desc || ubtData.dd || '',
    deviceBrand: sysInfo.brand,
    osName: sysInfo.platform,
    locale: sysInfo.language,
    env: __global.env,
    paymentType,
    h5plat,
  }
  delete data.dd
  delete data.a
  console.log(data);
  libs.sendUbt(data, {
    cwx
  });
};

let getOrderInfos = function () {
  return libs.getOrderInfo(payWayStore.get());
};

// 31104404 阻塞问题告警
const reportErrorLog = function (data) {
  try {
    console.log('reportErrorLog data:', data)
    const payToken = payParamsStore.getAttr('payToken')
    const uid = payParamsStore.getAttr('uid')
    const mPage = cwx.getCurrentPage();
    const extendInfo = {
      plat: 'weixin',
      appid: __global.appId,
      uid,
      ...data.extendInfo
    }
    delete data.extendInfo
    sendUbt({
      type: 'warning',
      warningCode: data.errorType,
      level: data.level || 'p2',
      desc: data.errorMessage,
      devOriKey: `warning_${data.errorType}`
    })
    libs.writeLogModel({
      data: {
        errorType: '30000',
        errorMessage: '系统异常',
        payToken,
        pageId: mPage.pageId,
        extendInfo: JSON.stringify(extendInfo),
        ...data
      },
      context: {
        cwx: cwx,
        env: __global.env,
        subEnv: 'fat18'
      },
      success: () => console.log('reportErrorLog success'),
      fail: () => console.log('reportErrorLog fail'),
      complete: () => console.log('reportErrorLog complete')
    }).excute()
  } catch (error) {
    console.log('reportErrorLog catch', error)
  }
}

function getParam() {
  return {
    h5plat,
    appId: cwx.appId,
    thirdSubTypeID: "4",
  }
}

function getOpenid() {
  return cwx.cwx_mkt.openid; //调用框架方法获取市场openid

}

// 记录用户trace
function reportTraceLog(param = {}) {
  try {
    if (!extend) {
      extend = {
        enterTime: libs.formatDate(new Date()),
        FSP: 0,
        reqPaywayTime: param.reqPaywayTime,
        pageWidth: sysInfo.screenWidth,
        pageHeight: sysInfo.screenHeight,
        version,
        company: 'ctrip',
        plat: 'mini',
        miniType: 'wx',
        deviceBrand: sysInfo.brand,
        URL: getCurrentPages().slice(-1)[0].route,
        status102: param.status102
      };
    }
    extend = {
      ...extend,
      business: ubtBusiness,
      ...param
    }
    if (param.payToken) payToken = param.payToken
    libs.recordUserOrder({
      data: {
        payToken: param.payToken || payToken,
        pageTraceId: getPageTraceId(),
        extend: JSON.stringify(extend),
      },
      context: {
        cwx: cwx,
        env: __global.env,
        subEnv: 'fat18'
      },
    }).excute();
  } catch (error) {
    console.log(error);
  }
}

function getPageTraceId() {
  return libs.getPageTraceId()
}

// 当前是否在支付页面
function isPaynewPage() {
  const page = cwx.getCurrentPage()
  const res = /paynew/.test(page.route)
  sendUbt({
    a: 'page.route',
    dd: '查看当前route',
    extend: {
      route: page.route,
      res
    }
  })
  return res
}

function getBackDelta() {
  const page = cwx.getCurrentPage()
  const route = page.route
  sendUbt({
    a: 'page.route',
    dd: '查看当前route',
    extend: {
      route,
      page
    }
  })
  if (/paywallet/.test(route)) return 2
  else return 1
}

// 循环回退直到BU页面
function navBackToBU() {
  sendUbt({
    a: 'navBackToBU',
    dd: '循环回退直到BU页面-init'
  })
  if (!isPaynewPage()) return
  wx.navigateBack({
    delta: getBackDelta()
  })
}



export {
  reportErrorLog,
  clearStore,
  sendUbt,
  sendUbtTrace,
  getOrderInfos,
  getParam,
  getOpenid,
  getMerchantId,
  reportTraceLog,
  initFullChain,
  getPageTraceId,
  navBackToBU,
  isPaynewPage,
  getH5Plat,
  addOrderRes,
  checkBeforeAddOrder,
}
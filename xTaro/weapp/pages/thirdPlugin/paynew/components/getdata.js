import {
  cwx
} from '../../../../cwx/cwx.js';
import * as Business from '../common/combus';
import {
  appendQuery,
  pageQueryStr
} from '../libs/index';

let orderInfoTmp = {} // 缓存 orderInfo
let sback = ''
let eback = ''
let rback = ''

function redirectUrl(url, data) {
  const Urldata = pageQueryStr(data);

  const urlRegStr = '^((https|http|ftp|file)?://)';
  const urlReg = new RegExp(urlRegStr);
  Business.sendUbtTrace({ type:'chain', chainName: 'jumpBUPage', a: 'wx.requestpayment.jumpBUPage', c: 6010, dd: '微信唤起之后跳转', data });
  //H5直联跳转
  if (urlReg.test(url)) {
    console.log('开始直连跳转', url)
    url = appendQuery(url, Urldata);
    Business.sendUbtTrace({
      a: 'redirectUrl',
      c: 1001011,
      dd: '跳转直连回跳URL地址成功',
      d: url
    });
    cwx.component.cwebview({
      data: {
        url: encodeURIComponent(url),
        needLogin: true,
        isNavigate: false,
      }
    })
  } else {
    Business.sendUbtTrace({
      a: 'redirectUrl',
      c: 1001011,
      dd: '跳转小程序原生页地址',
      d: url
    });
    cwx.redirectTo({
      url: appendQuery(url, Urldata),
      success: function (res) {
        Business.sendUbtTrace({
          a: 'redirectUrl.success',
          c: 1001011,
          dd: '跳转小程序原生页地址成功',
          d: 'redirectUrl success!',
          extend: res
        });
      },
      fail: function (res) {
        Business.sendUbtTrace({
          a: 'redirectUrl.fail',
          c: 1001012,
          dd: '跳转小程序原生页地址失败',
          d: 'redirectUrl fail! res::::' + JSON.stringify(res || '')
        });
      }
    })
  }


  Business.sendUbtTrace({
    a: 'redirectUrl',
    c: 1001010,
    dd: '跳转直连回跳URL地址完成',
    d: 'redirectUrl  URL::::' + url
  });

}

function getDataDirectPay(resPayInfos, callback, direct) {
  const that = this;
  let orderInfo = Business.getOrderInfos();
  orderInfoTmp = {...orderInfo}
  console.info(JSON.stringify(orderInfo));
  Business.sendUbtTrace({
    a: 'getDataDirectPay',
    c: 1001010,
    dd: '解析订单信息',
    extend: orderInfo
  });
  //判断BU过来之后是否传token
  if (direct) {
    //from URL回调
    if (orderInfo.fromUrl) {
      that.settings.fromCallback = function () {
        Business.navBackToBU()
      }
    }
    //sback URL回调
    if (orderInfo.sback) {
      sback = orderInfo.sback
      that.settings.sbackCallback = function (data) {
        data.action = 'sback'; //set webview share tag
        Business.sendUbtTrace({
          a: 'sbackCallback',
          c: 1001010,
          dd: '调用sbackCallback',
          d: sback
        });
        return redirectUrl(sback, data);
      }
    }
    //eback URL回调
    if (orderInfo.eback) {
      eback = orderInfo.eback
      that.settings.ebackCallback = function (data) {
        data.action = 'eback'; //set webview share tag
        return redirectUrl(eback, data)
      }
    }
    //rback URL回调
    if (orderInfo.rback) {
      rback = orderInfo.rback
      that.settings.rbackCallback = function (data) {
        data.action = 'rback'; //set webview share tag
        return redirectUrl(rback, data)
      }
    }
  }
  Business.sendUbtTrace({
    type: 'chain',
    chainName: 'parseData102Ok',
    a: '102_parse_suc',
    c: 1000,
    d: 'H5 直连',
    dd: '102数据解析成功'
  });
}

function getData(orderDetailData = {}, paywayResponse) {
  var that = this;
  var params = {};
  var detailJson = orderDetailData;
  var ErrorMsg = '';

  if (!detailJson.payToken) {
    ErrorMsg = '系统异常，请重新提交订单(1503)';
    that.modalConfirm(ErrorMsg, function () {
      if (typeof that.settings.fromCallback === 'function') {
        return that.settings.fromCallback.call(that, {
          msg: ErrorMsg
        });
      }
    });
    return;
  } else {
    params.payToken = detailJson.payToken;
  }
  orderInfoTmp = Business.getOrderInfos()
  that.data.payData = {
    orderDetail: params,
    orderInfo: paywayResponse.orderInfo
  };
  //paytoken add
  that.data.payToken = detailJson.payToken;

  Business.sendUbtTrace({
    type: 'chain',
    chainName: 'parseData102Ok',
    a: '102_parse_suc',
    c: 1000,
    d: 'SDK 接入',
    dd: '102数据解析成功'
  });
  return params;
}

function directBack(type, data) {
  if (type == 'from') {
    Business.navBackToBU()
  }
  //sback URL回调
  if (type=='sback') {
    data.action = 'sback'; //set webview share tag
    Business.sendUbtTrace({
      a: 'directBack-sbackCallback',
      c: 1001010,
      dd: '调用sbackCallback',
      d: orderInfoTmp.sback
    });
    return redirectUrl(orderInfoTmp.sback, data);
  }
  //eback URL回调
  if (type == 'eback') {
    data.action = 'sbebackack'; //set webview share tag
    Business.sendUbtTrace({
      a: 'directBack-eback',
      c: 1001010,
      dd: '调用ebackCallback',
      d: orderInfoTmp.eback
    });
    return redirectUrl(orderInfoTmp.eback, data);
  }
  //rback URL回调
  if (type == 'rback') {
    Business.sendUbtTrace({
      a: 'directBack-rback',
      c: 1001010,
      dd: '调用rbackCallback',
      d: orderInfoTmp.rback
    });
    return redirectUrl(orderInfoTmp.rback, data);
  }
}

module.exports = {
  getData: getData,
  directBack,
  getDataDirectPay: getDataDirectPay
}
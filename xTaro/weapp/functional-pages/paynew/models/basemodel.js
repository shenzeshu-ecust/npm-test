var _ = require('../libs/lodash.core.min.js');
var Stores = require('../models/stores.js');
var orderDetailStore = Stores.OrderDetailStore();
const paramStore = Stores.PayParamsStore()
var Util = require('../common/util.js');

let getFrameWorkRequestHeader = function () {
  let auth = orderDetailStore.getAttr('auth'),
    cid = '';
  return {
    "cid": cid,
    "ctok": "",
    "cver": "1.0",
    "lang": "01",
    "sid": "8888",
    "syscode": "09",
    "auth": auth,
    "extension": [{
      "name": "locale",
      "value": "zh-CN"
    }]
  };
};

let getPayRequestHeader = function (customizeHead) {
  let cid = '';
  const defaultHead = {
    "locale": "zh-CN",
    "sysCode": "09",
    "version": "999001",
    "payVersion": "999.001",
    "applicationId": "B000001",
    "appId": "99999999",
    "platform": "mini",
    "nonce": uuid(),
    "deviceInfo": {
      "userAgent": '',
      "clientId": cid,
      "sourceId": "8888",
      "userIp": "",
      "rmsToken": ""
    }
  };
  return Object.assign(defaultHead, customizeHead);
};

function uuid() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}

function BaseModel(settings) {
  this.settings = _.extend({
    url: "",
    method: "POST",
    data: {

    },
    success: function () {},
    fail: function () {},
    serviceCode: ''
  }, settings || {});
}

_.extend(BaseModel.prototype, {
  constructor: BaseModel,
  buildUrl: function () {
    let serverDomain = 'https://gateway.secure.ctrip.com';
    let subEnv = '';
    let requestUrl = '';

    let isDev = orderDetailStore.getAttr('isDev')
    console.log('isDev', isDev)
    if (isDev) {
      serverDomain = 'http://gateway.secure.fws.qa.nt.ctripcorp.com';
      subEnv = 'fat5068'
    }

    requestUrl = Util.appendQuery(serverDomain + this.settings.url, 'paytimestamp=' + (+new Date()));
    // requestUrl = Util.appendQuery(requestUrl, 'isCtripCanaryReq=1');

    if (!!subEnv) {
      requestUrl += '&subEnv=' + subEnv;
    }

    return requestUrl;
  },
  excute: function () {
    var self = this;

    try {
      var _data = self.getData();
      const url = self.buildUrl()
      paramStore.setAttr(`model_${self.settings.serviceCode}_start`, new Date())
      wx.request({
        url,
        data: _data,
        method: "POST",
        header: {
          'Content-Type': 'application/json'
        },
        success: function (json) {
          paramStore.setAttr(`model_${self.settings.serviceCode}_end`, new Date())
          console.log('wx.request success', json)
          var result = null;

          try {
            var desObj = {
              statusCode: json.statusCode,
              ResponseStatus: json.data.ResponseStatus
            };

            var c = 3020;
            var a = 'request ComSuc status 200';
            var dd = 'request success 响应 200';


          } catch (e) {}

          if (json && json.statusCode && json.statusCode == 200 && json.data && json.data.ResponseStatus && json.data.ResponseStatus.Ack && json.data.ResponseStatus.Ack === 'Success') {
            result = json.data || {};
            result.ResponseStatus = result.ResponseStatus || {};
            result.retCode = 0;
            result.retMsg = "SOA2执行成功";
            result.clientCheckData = {
              clientCheckIdStr: _data.clientCheckIdStr,
              isUnifiedPay: _data.isUnifiedPay || false
            }
            self.settings.success(result);
          } else {
            try {
              var jsonData = json.data || {};
              var message = jsonData.ResponseStatus && jsonData.ResponseStatus.Errors && jsonData.ResponseStatus.Errors.length && jsonData.ResponseStatus.Errors[0].Message || "";
              var logParam = "";
              if (message) {
                if (/No auth/img.test(message) || /authentication/img.test(message)) {
                  logParam = {
                    pagename: "index",
                    id: "o_pay_getpayway_exception_noauth",
                    message: message
                  };
                } else if (/deserialize/img.test(message)) {
                  logParam = {
                    pagename: "index",
                    id: "o_pay_getpayway_exception_DeserializeException",
                    message: message
                  };
                } else if (/RuntimeException/img.test(message)) {
                  logParam = {
                    pagename: "index",
                    id: "o_pay_getpayway_exception_RuntimeException",
                    message: message
                  };
                } else {
                  logParam = {
                    pagename: "index",
                    id: "o_pay_getpayway_exception_NotIncludeException",
                    message: message
                  };
                }
              } else {
                logParam = jsonData;
              }

            } catch (e) {}
            self.settings.fail({
              retCode: 1,
              //retMsg : "SOA2执行失败" + message
              retMsg: JSON.stringify(jsonData) + JSON.stringify(_data) + self.buildUrl()
            });
          }

        },
        fail: function (e) {
          console.log('wx.request fail', e)
          self.settings.fail({
            retCode: 2,
            retMsg: "SOA2执行失败"
          });
        },
        complete: function (res) {
          console.log('wx.request complete', res)
          // self.settings.fail({
          // 	retCode : 1,
          // 	//retMsg : "SOA2执行失败" + message
          // 	retMsg : JSON.stringify(res) + JSON.stringify(_data) + self.buildUrl()
          // }); 
          self.settings.complete && self.settings.complete(res);
        }
      });
    } catch (e) {

    }
  },
  getData: function () {
    const self = this;
    const isCtrip = true
    const requestHead = self.settings.requestHead || {};
    console.log(requestHead, 'libs=requestHead');
    const frameWorkRequestHeader = getFrameWorkRequestHeader();
    const payRequestHeader = getPayRequestHeader(requestHead);
    const wrapRequestHeader = JSON.stringify({
      "alg": "RS256",
      "key": "200565",
      "serviceCode": self.settings.serviceCode,
      "auth": "",
      "loginType": "QUNAR",
      "clientIp": ""
    });

    //requestHead
    self.settings.data = self.settings.data || {};
    let userForm = [];
    let h5plat = self.settings.h5plat || 29;
    h5plat = h5plat + '';
    userForm.push('43');
    const payload = Object.assign({
      "head": frameWorkRequestHeader,
      "markInfo": {
        "userFrom": userForm,
        "supportPayInfos": []
      },
      "requestHead": payRequestHeader,
    }, self.settings.data);

    if (isCtrip) {
      return payload;
    } else {
      return {
        "payload": JSON.stringify(payload),
        "head": frameWorkRequestHeader,
        "requestHead": wrapRequestHeader
      }
    }



  }
});


module.exports = {
  BaseModel: BaseModel
}
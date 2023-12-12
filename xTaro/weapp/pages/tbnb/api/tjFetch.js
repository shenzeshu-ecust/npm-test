var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
import { twx } from '../business/tjbase/index';
import Fetch from '../utils/Fetch';
import mpConfig from '../config/ctrip/mp_config';
import variableJs from '../business/variable_config/js/variable.ctrip';
import utils from '../utils/index';
var _a = mpConfig.MP_STORAGE_KEY,
  USER_INFO_KEY = _a.USER_INFO_KEY,
  TJ_OPENID_KEY = _a.TJ_OPENID_KEY;
var IS_TUJIA = variableJs.platformName === 'tujia';
var IS_CTRIP = variableJs.platformName === 'ctrip';
var IS_QUNAR = variableJs.platformName === 'qunar';
function generateTraceid() {
  var traceIdStr = '';
  if (IS_CTRIP) {
    traceIdStr = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  } else if (IS_QUNAR) {
    traceIdStr = 'xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx';
  }
  return traceIdStr.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
function ctripExtensionVal(customHeadData, item, extItem) {
  var extItemVal = '';
  if (extItem === 'terminaltype') {
    extItemVal = '40';
  } else if (extItem === 'traceid') {
    extItemVal = generateTraceid();
  } else if (extItem === 'crnv') {
    extItemVal = '236';
  } else {
    extItemVal = customHeadData[item][extItem] || '';
  }
  return extItemVal;
}
function ctripNetworkParams(req) {
  var _a, _b, _c, _d;
  var extensionNameValue = ['page', 'channelid', 'terminaltype', 'traceid', 'crnv'];
  var head = {};
  var customHeadData = wx.getStorageSync('REQUEST_HEAD_DATA') || {};
  if (customHeadData && Object.keys(customHeadData).length) {
    Object.keys(customHeadData).forEach(function (item) {
      if (item === 'extension') {
        extensionNameValue.forEach(function (extItem) {
          if (Array.isArray(head[item])) {
            head[item].push({
              name: extItem,
              value: ctripExtensionVal(customHeadData, item, extItem)
            });
          } else {
            head[item] = [];
          }
        });
      } else {
        head[item] = customHeadData[item];
      }
    });
  }
  req.params = {
    head: head,
    parameter: req.data.params
  };
  if (((_a = req.data.passthrough) === null || _a === void 0 ? void 0 : _a.apiType) === 1) {
    req.params = {
      head: head,
      args: JSON.stringify({
        parameter: req.data.params
      })
    };
    if ((_b = req.data.passthrough) === null || _b === void 0 ? void 0 : _b.isNodeApi) {
      req.url = req.url.replace(16593, 20466);
    }
  } else if (((_c = req.data.passthrough) === null || _c === void 0 ? void 0 : _c.apiType) === 2) {
    req.params = {
      head: head,
      path: req.url,
      args: JSON.stringify({
        parameter: req.data.params
      })
    };
    req.url = ((_d = req.data.passthrough) === null || _d === void 0 ? void 0 : _d.isNodeApi) ? '/restapi/soa2/20466/transmissionAuthOnDemand' : '/restapi/soa2/16593/transmissionAuthOnDemand';
  }
  if (twx.global.projectInfo.env.toLowerCase() !== 'prd') {
    req.url = req.url + "?subEnv=FAT9";
  }
  return req;
}
function qunarNetworkParams(req) {
  var _a, _b, _c, _d;
  var isPrdEnv = twx.global.projectInfo.env.toLowerCase() === 'prd';
  var qunarHost = isPrdEnv ? 'https://xcxtravel.qunar.com' : 'https://wxapp.beta.qunar.com';
  var code = wx.getStorageSync('H5_CODE') || '';
  req.params = {
    b: req.data.params,
    c: {
      crnVersion: '236',
      newPlatform: true,
      traceId: "Q_" + req.url.slice(1) + "_" + new Date().getTime() + "_" + generateTraceid(),
      source: 'wechat',
      fromForLog: code
    },
    u: ''
  };
  if (((_a = req.data.passthrough) === null || _a === void 0 ? void 0 : _a.apiType) === 1) {
    req.params = Object.assign({}, req.params, {
      b: {
        parameter: req.data.params
      },
      u: ((_b = req.data.passthrough) === null || _b === void 0 ? void 0 : _b.isNodeApi) ? "/bnbapp-node-cq" + req.url : "/bnbbingo" + req.url
    });
    req.url = '/tjbnb/app/common/nologin';
  } else if (((_c = req.data.passthrough) === null || _c === void 0 ? void 0 : _c.apiType) === 2) {
    if (req.upath && ((_d = req.data.passthrough) === null || _d === void 0 ? void 0 : _d.isNodeApi)) {
      req.upath = req.upath.replace('bnbbingo', 'bnbapp-node-cq');
    }
    req.params = Object.assign({}, req.params, {
      b: {
        parameter: req.data.params
      },
      u: req.upath ? req.upath : ''
    });
  }
  req.url = "" + qunarHost + req.url;
  return req;
}
export default new Fetch({
  reqHandle: function (req) {
    var _a, _b;
    var openId = wx.getStorageSync(TJ_OPENID_KEY) || '';
    var userInfo = wx.getStorageSync(USER_INFO_KEY) || {};
    var tkn = userInfo.userToken || '';
    var uid = userInfo.userId || '';
    var uuid = ((_a = twx.trace) === null || _a === void 0 ? void 0 : _a.getMpUUID) && (((_b = twx.trace) === null || _b === void 0 ? void 0 : _b.getMpUUID()) || '');
    var header = {
      userId: String(uid),
      userToken: tkn,
      openId: openId,
      mpVersion: mpConfig.MP_API_VERSION,
      wrapperId: mpConfig.WRAPPER_ID,
      cookie: '',
      uid: uuid
    };
    if (req.data && Object.keys(req.data).length) {
      req.params = req.data.params;
      if (IS_CTRIP) {
        req = ctripNetworkParams(req);
      }
      if (IS_QUNAR) {
        var cookie = [];
        var initUserData = utils.getStorageSyncByKey('UserData');
        var extraCookie = utils.getStorageSyncByKey('extraCookie');
        for (var name_1 in initUserData.cookies) {
          cookie.push(name_1 + "=" + initUserData.cookies[name_1]);
        }
        for (var name_2 in extraCookie) {
          cookie.push(name_2 + "=" + extraCookie[name_2]);
        }
        header.cookie = cookie.join(';');
        req = qunarNetworkParams(req);
      }
    }
    req.headers = __assign(__assign({}, header), req.headers);
  },
  resHandle: function (res, promiser, options) {
    if (options.isPassportApi) {
      if (!res.errorCode) {
        promiser.resolve({
          data: res.content
        });
      } else {
        promiser.reject({
          errorNo: res.errorCode,
          errorMsg: res.errorMessage,
          data: res.content
        });
      }
    } else {
      if (options.dataType !== 'json') {
        return promiser.resolve(res);
      }
      if (res.ret) {
        promiser.resolve({
          data: res.data
        });
      } else {
        if (IS_TUJIA && res.errcode === 55004) {
          wx.navigateTo({
            url: '/pages/user/login/login'
          });
        }
        if (res.wafcode && res.wafcode === 999 || res.monitorcode && res.monitorcode === 999) {
          console.log('域名需要进行安全校验');
        } else {
          var errorNo = res.errcode;
          var errorMsg = res.errmsg;
          if (res.wafcode && res.wafcode === 998) {
            errorNo = res.wafcode;
            errorMsg = res.errorMessage || '您的输入包含恶意数据';
          }
          promiser.reject({
            errorNo: errorNo,
            errorMsg: errorMsg,
            data: res.data
          });
        }
      }
    }
  }
});
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
import variableJs from '../business/variable_config/js/variable.ctrip';
import coordTransformUtils from './coordTransformUtils';
import host from '../config/ctrip/host';
var PWA_TUJIA_HOST = host.PWA_TUJIA_HOST;
var IS_TUJIA = variableJs.platformName === 'tujia';
var IS_CTRIP = variableJs.platformName === 'ctrip';
var IS_QUNAR = variableJs.platformName === 'qunar';
function showModal(content, options) {
  if (options === void 0) {
    options = {};
  }
  var defaultOpt = {
    cancelText: '取消',
    confirmText: '确定',
    title: '',
    cancelColor: '#999999',
    confirmColor: '#FF9645'
  };
  Object.assign(defaultOpt, options);
  return wx.showModal(__assign({
    content: content
  }, defaultOpt));
}
function toast(text, cb) {
  wx.showToast({
    title: text,
    icon: 'none',
    complete: function () {
      !!cb && typeof cb === 'function' && cb();
    }
  });
}
function getSystemInfo() {
  var res = wx.getSystemInfoSync();
  res.platform = res.platform && res.platform.toLowerCase() || '';
  var isAndroid = res.platform === 'android';
  var isIos = res.platform === 'ios';
  res.isNeedShiPei = res.platform === 'ios' && (res.screenWidth == 414 || res.screenWidth == 375) && res.screenHeight > 800;
  res.radio = res.windowWidth / 750;
  res.isIos = isIos;
  res.isAndroid = isAndroid;
  return res;
}
function senceFilter(senceStr) {
  return decodeURIComponent(senceStr).split('_');
}
function dataTrack(_a) {
  var _b, _c;
  var traceKey = _a.traceKey,
    traceData = _a.traceData,
    pageName = _a.pageName;
  if (!traceKey || !traceData || !pageName) {
    return false;
  }
  ((_b = twx.trace) === null || _b === void 0 ? void 0 : _b.dataTrack) && ((_c = twx.trace) === null || _c === void 0 ? void 0 : _c.dataTrack({
    traceKey: traceKey,
    traceData: traceData,
    pageName: pageName
  }));
}
function errorTrack(_a) {
  var _b, _c;
  var message = _a.message,
    error = _a.error,
    _d = _a.level,
    level = _d === void 0 ? 1 : _d;
  ((_b = twx.trace) === null || _b === void 0 ? void 0 : _b.setCustomError) && ((_c = twx.trace) === null || _c === void 0 ? void 0 : _c.setCustomError({
    message: message,
    level: level,
    error: error
  }));
}
function getBackgroundColor(background) {
  if (background.color) {
    return "background:" + background.color + ";";
  } else if (background.image) {
    return "background-image:url(" + background.image + ");background-size:100% 100%;";
  } else if (background.gradientColor) {
    return "background: linear-gradient(270deg, " + background.gradientColor.colors[0] + " 0%, " + background.gradientColor.colors[1] + " 100%);";
  } else {
    return '';
  }
}
function openLocation(latitude, longitude, unitname, address, geoCoordSysType, isOversea) {
  var coordData = coordTransformUtils.GCJ02Transformer({
    isOversea: isOversea,
    type: geoCoordSysType,
    longitude: longitude,
    latitude: latitude
  });
  wx.openLocation({
    latitude: coordData.latitude,
    longitude: coordData.longitude,
    scale: 16,
    name: unitname,
    address: address
  });
}
function createIntersectionObserver(curScope, nodeSelect) {
  return new Promise(function (resolve, reject) {
    if (curScope && nodeSelect) {
      var domObserverInstance_1 = wx.createIntersectionObserver(curScope);
      domObserverInstance_1.relativeToViewport().observe(nodeSelect, function (res) {
        resolve({
          observerInstance: domObserverInstance_1,
          observerData: res
        });
      });
    } else {
      reject({
        errMsg: '请传入当前页面/组件实例或需要选取的节点class/id值'
      });
    }
  });
}
function createUrlParamsString(url, obj) {
  if (url === void 0) {
    url = '';
  }
  if (!obj) {
    return url;
  }
  var urls = [];
  var joinedUrls = '';
  for (var i in obj) {
    if (obj[i] || obj[i] === 0 || obj[i] === false) {
      urls.push(i + "=" + obj[i]);
    }
  }
  joinedUrls = urls.join('&');
  var isExistSearchData = url.includes('?');
  return url ? isExistSearchData ? url + "&" + joinedUrls : url + "?" + joinedUrls : joinedUrls;
}
function jointUrlParametersAndRemoveRepeatOptions(url, needJointPatameters) {
  var isObjParameters = Object.prototype.toString.call(needJointPatameters).slice(8, -1) === 'Object';
  if (!url || !needJointPatameters || !isObjParameters) {
    !isObjParameters && console.log('传入的待拼接的参数不是对象类型，不做拼接处理');
    return url;
  }
  var searchParametersObj = parseQuery(url) || {};
  Object.keys(needJointPatameters).forEach(function (item) {
    searchParametersObj[item] = needJointPatameters[item];
  });
  return createUrlParamsString(url.split('?')[0], searchParametersObj);
}
function formatGoodProduct(detail) {
  var _a, _b, _c, _d, _e, _f;
  var image_list = [];
  var unitName = ((_b = (_a = detail.mainPart) === null || _a === void 0 ? void 0 : _a.topModule) === null || _b === void 0 ? void 0 : _b.houseName) || '';
  var unitId = detail.houseId;
  var housePictureArr = ((_d = (_c = detail.mainPart) === null || _c === void 0 ? void 0 : _c.topModule) === null || _d === void 0 ? void 0 : _d.housePicture) && ((_f = (_e = detail.mainPart) === null || _e === void 0 ? void 0 : _e.topModule) === null || _f === void 0 ? void 0 : _f.housePicture.housePics) || [];
  if (housePictureArr.length) {
    image_list = housePictureArr.map(function (v) {
      return v.url;
    });
  }
  var product = {
    item_code: String(unitId),
    title: unitName,
    desc: unitName,
    category_list: ['旅游', '民宿', '公寓', '客栈'],
    image_list: image_list,
    brand_info: {
      name: variableJs.logoName
    },
    src_mini_program_path: "/pages/tbnb/pages/main/detail/index?unitId=" + unitId
  };
  return product;
}
function setCollectionGuideInfoHandle(guideInfo) {
  if (!guideInfo && typeof guideInfo !== 'object') {
    return;
  }
  var existCollectionGuideInfo = getCollectionGuideInfoHandle() || {};
  var collectionInfoStr = Object.assign(existCollectionGuideInfo, guideInfo);
  wx.setStorageSync('collectionGuide', JSON.stringify(collectionInfoStr));
}
function getCollectionGuideInfoHandle() {
  var collectionGuideStr = getStorageSyncByKey('collectionGuide');
  var guideData = collectionGuideStr && JSON.parse(collectionGuideStr);
  return guideData;
}
function getStorageSyncByKey(key) {
  return wx.getStorageSync(key);
}
function getNumberFromString(str) {
  var reg = /[0-9]{1,}[.]?[0-9]*/;
  var arr = reg.exec(str);
  return arr && arr[0] || '0.0';
}
function toDecimal(x, pos) {
  var f = Math.round(x * 100) / 100;
  var s = f.toString();
  var rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  while (s.length <= rs + pos) {
    s += '0';
  }
  return s;
}
function parseQuery(url) {
  if (!url) {
    return;
  }
  var ps = url.split('?');
  if (ps.length !== 2) {
    return;
  }
  var query = ps[ps.length - 1];
  var reg = /([^=&\s]+)[=\s]*([^&\s]*)/g;
  var obj = {};
  while (reg.exec(query)) {
    obj[RegExp.$1] = RegExp.$2;
  }
  return obj;
}
function openWebview(url, type, appid) {
  if (type === void 0) {
    type = 'navigateTo';
  }
  if (IS_TUJIA) {
    try {
      var isMiniProgram = type === 'miniProgram';
      var mpParams = void 0;
      if (!isMiniProgram && /miniprogram.com/.test(url)) {
        isMiniProgram = true;
        mpParams = parseQuery(url);
        if (mpParams && mpParams.appid && mpParams.page) {
          appid = mpParams.appid;
          url = decodeURIComponent(mpParams.page);
          if (mpParams.extraData) {
            mpParams.extraData = JSON.parse(decodeURIComponent(mpParams.extraData));
          }
        }
      }
      if (isMiniProgram && appid) {
        var navigateParams = {
          appId: appid,
          path: url,
          extraData: {}
        };
        if (mpParams.extraData) {
          navigateParams.extraData = mpParams.extraData;
        }
        return wx.navigateToMiniProgram(navigateParams);
      } else {
        var path = /m\.tujia.com\/gongyu\/beijing\//.test(url) ? '/pages/units/units?condintionUrl=' : '/pages/webview/index?h5url=';
        url = path + encodeURIComponent(url);
        wx[type]({
          url: url
        });
      }
    } catch (err) {
      console.log('openWebview error:', err);
    }
  } else if (IS_CTRIP) {
    var jumpUrl = decodeURIComponent(url);
    wx[type]({
      url: "/pages/bnb/bnbwebview?url=" + encodeURIComponent(jumpUrl)
    });
  } else if (IS_QUNAR) {
    var jumpUrl = decodeURIComponent(url);
    wx[type]({
      url: "/pages/platform/webView/index?url=" + encodeURIComponent(jumpUrl)
    });
  }
}
function getCurrentPage() {
  var pages, page;
  try {
    pages = getCurrentPages();
    page = pages && pages.length ? pages[pages.length - 1] : null;
  } catch (e) {
    page = getApp().getCurrentPage();
  }
  return page;
}
function getPrevPage() {
  var pages = getCurrentPages();
  var prevPage = pages[pages.length - 2];
  if (prevPage && prevPage.$component) {
    return prevPage.$component;
  }
  return prevPage || null;
}
function openChat(unitId, houseName, chatId, hotelId, hotelName, ctripHotel, tripHotelId, newChatId, beginDate, endDate) {
  var url = '';
  var h5Url = '';
  if (IS_TUJIA) {
    h5Url = PWA_TUJIA_HOST + "/h5/mob/im/index?hotelid=" + hotelId + "&houseid=" + unitId + "&chatid=" + chatId + "&hotelchatid=" + newChatId + "&checkinDate=" + beginDate + "&checkoutDate=" + endDate;
    url = "/pages/webview/index?h5url=" + encodeURIComponent(h5Url);
  } else if (IS_CTRIP) {
    var orderInfo = {};
    if (!ctripHotel) {
      orderInfo = {
        ctype: 'PRD',
        biz: 'BNB',
        cid: unitId,
        desc: houseName,
        supplierId: hotelId,
        supplierName: hotelName,
        supplierPid: unitId
      };
    } else {
      orderInfo = {
        ctype: 'PRD',
        biz: 'hotel',
        cid: tripHotelId,
        desc: houseName,
        supplierId: tripHotelId,
        supplierName: hotelName,
        supplierPid: tripHotelId,
        supplierRole: 'EBK'
      };
    }
    orderInfo = encodeURIComponent(JSON.stringify(orderInfo));
    var bizType = ctripHotel ? 1695 : 1650;
    var sceneCode = ctripHotel ? 0 : 2;
    var path = "/webapp/servicechatv2?bizType=" + bizType + "&sceneCode=" + sceneCode + "&orderInfo=" + orderInfo + "&pageCode=10650035942&isPreSale=1&source=tujia_app";
    h5Url = twx.global.projectInfo.env.toLowerCase() === 'prd' ? "https://m.ctrip.com" + path : "https://servicechat.fat2857.qa.nt.ctripcorp.com" + path;
    var data = {
      url: encodeURIComponent(h5Url),
      needLogin: false
    };
    url = "/cwx/component/cwebview/cwebview?data=" + JSON.stringify(data);
  } else if (IS_QUNAR) {
    console.log('qunar 不支持小程序IM');
  }
  wx.navigateTo({
    url: url
  });
}
function urlJointFasTraceIdSearchDataHandle(urlData) {
  if (!urlData || !IS_TUJIA) {
    return urlData;
  }
  var _app = getApp();
  var isExistSearchData = urlData.includes('?');
  var traceId = _app.glbAnalyticsUtils.getFasTraceId(_app);
  return isExistSearchData ? urlData + "&_mpTraceId=" + traceId : urlData + "?_mpTraceId=" + traceId;
}
function distinguishPlatform(obj) {
  return obj[variableJs.platformName];
}
function goHome() {
  if (IS_TUJIA) {
    wx.switchTab({
      url: '/pages/index/index'
    });
  } else if (IS_CTRIP) {
    wx.redirectTo({
      url: '/pages/bnb/bnbwebview'
    });
  } else if (IS_QUNAR) {
    wx.reLaunch({
      url: '/pages/bnb/home/index'
    });
  }
}
function goChannelHome() {
  if (IS_TUJIA) {
    wx.switchTab({
      url: '/pages/index/index'
    });
  } else if (IS_CTRIP) {
    wx.switchTab({
      url: '/pages/home/homepage'
    });
  } else if (IS_QUNAR) {
    wx.switchTab({
      url: '/pages/platform/indexWx/index'
    });
  }
}
function setRequestNeedHeadParamsToStorage(obj) {
  wx.setStorageSync('REQUEST_HEAD_DATA', obj);
}
function platformLogin(params, sucCb, failCb, h5url, fromCode) {
  if (params === void 0) {
    params = {};
  }
  if (failCb === void 0) {
    failCb = null;
  }
  if (h5url === void 0) {
    h5url = '';
  }
  if (fromCode === void 0) {
    fromCode = '';
  }
  var isFunction = function (func) {
    return func && typeof func === 'function';
  };
  twx.login.isLogin().then(function (resLogin) {
    if (!resLogin) {
      twx.login.handleGoToLogin(params, function (res) {
        var timer = setTimeout(function () {
          if (IS_CTRIP) {
            if (res) {
              isFunction(sucCb) && sucCb();
            } else {
              isFunction(failCb) && failCb();
            }
          } else {
            isFunction(sucCb) && sucCb();
          }
          clearTimeout(timer);
        }, 500);
      }, h5url, fromCode);
    } else {
      isFunction(sucCb) && sucCb();
    }
  });
}
function sceneQuery(url) {
  if (!url) {
    return {};
  }
  var ps = url.split('__');
  if (!ps.length) {
    return {};
  }
  var obj = {};
  for (var i = 0; i < ps.length; i++) {
    var sps = ps[i].split('_');
    obj[sps[0]] = sps[1];
  }
  return obj;
}
export default {
  showModal: showModal,
  toast: toast,
  systemInfo: getSystemInfo(),
  senceFilter: senceFilter,
  dataTrack: dataTrack,
  errorTrack: errorTrack,
  getBackgroundColor: getBackgroundColor,
  openLocation: openLocation,
  createIntersectionObserver: createIntersectionObserver,
  createUrlParamsString: createUrlParamsString,
  jointUrlParametersAndRemoveRepeatOptions: jointUrlParametersAndRemoveRepeatOptions,
  setCollectionGuideInfoHandle: setCollectionGuideInfoHandle,
  getCollectionGuideInfoHandle: getCollectionGuideInfoHandle,
  getStorageSyncByKey: getStorageSyncByKey,
  formatGoodProduct: formatGoodProduct,
  getNumberFromString: getNumberFromString,
  toDecimal: toDecimal,
  parseQuery: parseQuery,
  openWebview: openWebview,
  getCurrentPage: getCurrentPage,
  getPrevPage: getPrevPage,
  openChat: openChat,
  urlJointFasTraceIdSearchDataHandle: urlJointFasTraceIdSearchDataHandle,
  distinguishPlatform: distinguishPlatform,
  goHome: goHome,
  goChannelHome: goChannelHome,
  setRequestNeedHeadParamsToStorage: setRequestNeedHeadParamsToStorage,
  platformLogin: platformLogin,
  sceneQuery: sceneQuery
};
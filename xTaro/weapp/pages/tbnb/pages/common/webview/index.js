var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};
import { TPage, twx } from '../../../business/tjbase/index';
import utils from '../../../utils/index';
import authApi from '../../../api/authApi';
import { urlNameMapping, MSG_KEY } from './config/index';
import globalVariable from '../../../business/variable_config/js/variable.ctrip';
var IS_TUJIA = globalVariable.platformName === 'tujia';
var IS_QUNAR = globalVariable.platformName === 'qunar';
var IS_CTRIP = globalVariable.platformName === 'ctrip';
var IS_MAYI = globalVariable.platformName === 'mayi';
var LOCAL_STORAGE_MEMBER_INFO = 'local_storage_member_info';
var LOCAL_STORAGE_LOGINED_TOKEN = 'local_storage_logined_token';
var isProdEnv = twx.global.projectInfo.env.toLowerCase() === 'prd';
var M_TUJIA_HOST = isProdEnv ? 'https://m.tujia.com' : 'https://m.fvt.tujia.com';
var _globalApp = getApp();
var app_type = 'weapp';
TPage({
  originOptData: null,
  formatedOptData: {
    h5url: '',
    needLogin: false,
    hideShareMenu: false,
    shareData: {}
  },
  shareData: {
    title: '',
    path: '',
    imageUrl: ''
  },
  data: {
    h5url: '',
    isShowWsg: false,
    wsg: '目标地址出了点问题，请重新打开该页面',
    canUseWebView: wx.canIUse('web-view'),
    globalColor: globalVariable.globalColor,
    isCtrip: IS_CTRIP
  },
  openId: '',
  unionId: '',
  personalRecommendSwitch: true,
  localRecommendSwitch: true,
  marketSwitch: true,
  pageShowTime: 0,
  isNoRunMemberInfoReplaceApiCallback: false,
  openAppFlag: 0,
  count: 0,
  backpre: false,
  onLoad: function (options) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
      var prSettingData, transformedData, h5url, paramObj, code, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            console.log('webview参数', options);
            console.info('prSettingData---start--');
            return [4, twx.methods.getPRSetting()];
          case 1:
            prSettingData = _d.sent();
            if (prSettingData) {
              console.info('prSettingData---', prSettingData);
              this.personalRecommendSwitch = prSettingData.personalRecommendSwitch;
              this.localRecommendSwitch = prSettingData.localRecommendSwitch;
              this.marketSwitch = prSettingData.marketSwitch;
            }
            this.backpre = (options === null || options === void 0 ? void 0 : options.backpre) == '1' ? true : false;
            if ((_a = options === null || options === void 0 ? void 0 : options.from) === null || _a === void 0 ? void 0 : _a.length) {
              utils.dataTrack({
                traceKey: 'C_QRCODE_EXPOSURE',
                traceData: {
                  ext: options === null || options === void 0 ? void 0 : options.from
                },
                pageName: 'bnbwebview'
              });
            }
            return [4, twx.methods.webviewOptionsTransformH5urlHandle(options)];
          case 2:
            transformedData = _d.sent();
            options = transformedData.options;
            if (transformedData.isBreak) {
              return [2, transformedData.cbFunc()];
            }
            twx.methods.setCookieRecordHandle(options);
            this.formatedOptData = this._formatWebviewOptionsHandle(options);
            h5url = this.formatedOptData.h5url && this._h5urlDecodeURIComponent(this.formatedOptData.h5url) || '';
            this._checkWebviewUrlHandle({
              h5url: h5url
            });
            h5url = this._setWebviewUrlEnvHandle({
              h5url: h5url
            });
            paramObj = utils.parseQuery(h5url) || {};
            code = paramObj.code || '';
            if (IS_CTRIP) {
              utils.setRequestNeedHeadParamsToStorage({
                extension: {
                  channelid: code
                }
              });
            } else if (IS_QUNAR) {
              wx.setStorageSync('H5_CODE', code);
            }
            return [4, this._syncLoginAndSetWebUrlHandle({
              h5url: h5url
            })];
          case 3:
            _d.sent();
            _b = this;
            return [4, twx.global.userInfo.openId()];
          case 4:
            _b.openId = _d.sent();
            _c = this;
            return [4, twx.global.userInfo.unionId()];
          case 5:
            _c.unionId = _d.sent();
            console.info('---openid---unionId---', this.openId, this.unionId);
            this._mergeShareDataHandle(this.formatedOptData);
            return [2];
        }
      });
    });
  },
  onShow: function () {
    var _this = this;
    this.pageShowTime += 1;
    setTimeout(function () {
      if (!IS_CTRIP && _this.pageShowTime > 1 && _this.formatedOptData && _this.formatedOptData.needLogin && _this.isNoRunMemberInfoReplaceApiCallback) {
        utils.goChannelHome();
      }
    }, 2000);
  },
  webPostMessage: function (e) {
    console.log('postMessage data:', e);
    var postData = e.detail.data;
    if (Array.isArray(postData)) {
      var postCount = postData.length;
      for (var i = 0; i < postCount; i++) {
        var sData = postData[i];
        this._formatPostMessageHandle(sData);
      }
    } else {
      this._formatPostMessageHandle(postData);
    }
  },
  onPageLoadError: function () {
    this._checkWebviewUrlHandle();
  },
  onShareAppMessage: function (options) {
    options = options || {};
    var httpRegex = /^(https|http):\/\//;
    var _a = options.webViewUrl,
      webViewUrl = _a === void 0 ? '' : _a;
    if (!this.shareData.title) {
      this.shareData.title = '民宿短租';
    }
    var shareParams = Object.assign({}, this.formatedOptData, {
      h5url: encodeURIComponent(webViewUrl)
    });
    if (!this.shareData.path) {
      this.shareData.path = "/pages/tbnb/pages/common/webview/index?optionsData=" + JSON.stringify(shareParams);
    } else {
      var isHttpUrlPath = httpRegex.test(this.shareData.path);
      if (isHttpUrlPath) {
        shareParams = Object.assign({}, this.formatedOptData, {
          h5url: encodeURIComponent(this.shareData.path)
        });
        this.shareData.path = "/pages/tbnb/pages/common/webview/index?optionsData=" + JSON.stringify(shareParams);
      }
    }
    if (this.formatedOptData && this.formatedOptData.shareData && this.formatedOptData.shareData.customShareAddr) {
      var customShareData = this.formatedOptData.shareData.customShareAddr;
      var customSharePath = customShareData.customShareUrl || webViewUrl;
      if (customShareData.isWxNativePage) {
        if (httpRegex.test(customSharePath)) {
          customSharePath = this._resetSharePathHandle(shareParams, true);
        }
      } else {
        if (!httpRegex.test(customSharePath)) {
          customSharePath = this._resetSharePathHandle(shareParams, true);
        } else {
          shareParams = Object.assign({}, this.formatedOptData, {
            h5url: encodeURIComponent(customSharePath)
          });
          customSharePath = "/pages/tbnb/pages/common/webview/index?optionsData=" + JSON.stringify(shareParams);
        }
      }
      this.shareData.path = customSharePath;
    }
    this.shareData.path = this._shareAddJumpSharePageUrl(this.shareData.path);
    return this.shareData;
  },
  _shareAddJumpSharePageUrl: function (shareDataPath) {
    var shareDataPathParamsObj = utils.parseQuery(shareDataPath);
    if (shareDataPathParamsObj && shareDataPathParamsObj.optionsData && JSON.parse(shareDataPathParamsObj.optionsData).h5url) {
      var decodeH5Url = this._h5urlDecodeURIComponent(JSON.parse(shareDataPathParamsObj.optionsData).h5url);
      var decodeH5UrlDomain = decodeH5Url.split('?')[0];
      if (decodeH5UrlDomain !== M_TUJIA_HOST && decodeH5UrlDomain !== M_TUJIA_HOST + '/' && decodeH5UrlDomain.indexOf(M_TUJIA_HOST) !== -1) {
        if (IS_TUJIA || IS_MAYI) {} else if (IS_QUNAR || IS_CTRIP) {}
      }
    }
    return shareDataPath;
  },
  _h5urlDecodeURIComponent: function (h5url) {
    h5url = decodeURIComponent(h5url);
    if (h5url.indexOf('https://') !== -1) {
      return h5url;
    }
    return this._h5urlDecodeURIComponent(h5url);
  },
  _formatPostMessageHandle: function (postMsgData) {
    if (postMsgData.type && postMsgData.type.toLowerCase() === MSG_KEY.onshare) {
      this.shareData = postMsgData.data;
    }
    if (postMsgData.homeOpt) {
      if (postMsgData.homeOpt.from === MSG_KEY.citysuggest || postMsgData.homeOpt.from === MSG_KEY.keywordsuggest || postMsgData.homeOpt.from === MSG_KEY.clearstandard) {
        wx.setStorageSync('SEARCH_RESULT', postMsgData.homeOpt);
      } else if (postMsgData.homeOpt.from === MSG_KEY.cdsselected) {
        wx.setStorageSync('SEARCH_RESULT_CDS', postMsgData.homeOpt);
      }
    } else {
      if (IS_TUJIA || IS_MAYI) {
        this._postMessageBehaviorHandle(postMsgData);
      }
    }
  },
  _postMessageBehaviorHandle: function (parseData) {
    if (parseData.msgKey) {
      if (parseData.msgKey === MSG_KEY.callback) {
        this._handleWebviewCallback(parseData.msgData);
      } else if (!parseData.type && parseData.msgKey.toLowerCase() === MSG_KEY.onshare) {
        this.shareData = parseData.msgData;
      }
    } else {
      this._updateTJUser(parseData);
    }
  },
  _formatWebviewOptionsHandle: function (options) {
    var formatedOptions = {
      h5url: '',
      needLogin: false,
      hideShareMenu: false,
      shareData: {}
    };
    if ((IS_MAYI || IS_TUJIA) && options.scene) {
      var scene = options.scene.split('_');
      var gocode = scene[0].replace('gcd', '');
      var env = '';
      if (options.scene.indexOf('fvt') > -1) {
        env = '.fvt';
      }
      if (options.scene.indexOf('t1') > -1) {
        env = '1.fvt';
      }
      if (options.scene.indexOf('t2') > -1) {
        env = '2.fvt';
      }
      var query = utils.sceneQuery(options.scene) || {};
      options.h5url = utils.jointUrlParametersAndRemoveRepeatOptions("https://go" + env + ".tujia.com/" + gocode + "/", {
        mref: 'wxclient',
        code: query.c
      });
    }
    if (options.h5url || options.path) {
      this.originOptData = options;
      formatedOptions.h5url = this._formatOptionsH5urlHandle(options);
      formatedOptions.hideShareMenu = typeof options.hideShareMenu === 'string' ? !!(options.hideShareMenu === 'true') : !!options.hideShareMenu;
      if (typeof options.needLogin === 'undefined') {
        formatedOptions.needLogin = false;
      } else {
        formatedOptions.needLogin = typeof options.needLogin === 'string' ? !!(options.needLogin === 'true') : !!options.needLogin;
      }
      if (options.shareData) {
        formatedOptions.shareData = this._jsonParseOptionsHandle(options.shareData);
      }
    }
    var paramsData;
    if (options.optionsData) {
      paramsData = this._jsonParseOptionsHandle(options.optionsData);
      if (typeof paramsData.needLogin === 'undefined') {
        paramsData.needLogin = false;
      }
      this.originOptData = JSON.parse(JSON.stringify(paramsData));
      if (paramsData.path || paramsData.queryParams) {
        paramsData.h5url = utils.jointUrlParametersAndRemoveRepeatOptions(this._urlPathNameMappingHandle(paramsData), paramsData.queryParams);
        delete paramsData.path;
        delete paramsData.queryParams;
      }
      formatedOptions = Object.assign({}, formatedOptions, paramsData);
    }
    return formatedOptions;
  },
  _jsonParseOptionsHandle: function (needParseData) {
    var parsedData = {};
    if (!needParseData) {
      return {};
    }
    if (typeof needParseData === 'string') {
      try {
        parsedData = JSON.parse(needParseData);
      } catch (e) {
        try {
          parsedData = JSON.parse(decodeURIComponent(needParseData));
        } catch (err) {
          this._showErrorPageHandle('传入的参数信息有误');
        }
      }
    }
    return parsedData;
  },
  _formatOptionsPathQueryHandle: function (path) {
    var curPath = decodeURIComponent(path);
    var pathArr = curPath.split('?');
    var pathName = /[a-z]+/.exec(pathArr[0]);
    return pathName ? pathName[0] : 'index';
  },
  _formatOptionsH5urlHandle: function (options) {
    var curH5url = '';
    if (options.h5url) {
      curH5url = options.h5url;
    } else if (options.path) {
      var curPath = decodeURIComponent(options.path);
      var pathSearchObj = utils.parseQuery(curPath) || {};
      curH5url = utils.jointUrlParametersAndRemoveRepeatOptions(this._urlPathNameMappingHandle({
        path: this._formatOptionsPathQueryHandle(options.path),
        queryParams: pathSearchObj
      }), pathSearchObj);
    }
    return curH5url;
  },
  _urlPathNameMappingHandle: function (paramsData) {
    var urlPath = '';
    switch (paramsData.path) {
      case 'index':
        urlPath = urlNameMapping[paramsData.path];
        break;
      case 'unitList':
        urlPath = urlNameMapping[paramsData.path];
        break;
      case 'detail':
        var curUnitid = paramsData.queryParams && (paramsData.queryParams.unitid || paramsData.queryParams.unitId);
        urlPath = curUnitid >= 0 ? urlNameMapping[paramsData.path].replace(/[0-9]+/, curUnitid) : urlNameMapping['index'];
        break;
      default:
        urlPath = urlNameMapping['index'];
        break;
    }
    return urlPath;
  },
  _urlCodeHandle: function () {
    var code = '';
    var pagePathName = '';
    var codeAppType = app_type !== 'weapp' ? "_" + app_type : '';
    if (this.originOptData && this.originOptData.path) {
      pagePathName = this._formatOptionsPathQueryHandle(this.originOptData.path);
    }
    switch (globalVariable.platformName) {
      case 'tujia':
        code = "tmp" + pagePathName + codeAppType;
        break;
      case 'ctrip':
        code = "cmp" + pagePathName + codeAppType;
        break;
      case 'qunar':
        code = "qmp" + pagePathName + codeAppType;
        break;
      case 'mayi':
        code = "mmp" + pagePathName + codeAppType;
        break;
      default:
        code = "tmp" + pagePathName + codeAppType;
        break;
    }
    return code;
  },
  _joinUrlSearchInfoHandle: function (_a) {
    var _b, _c;
    var h5url = _a.h5url,
      _d = _a.options,
      options = _d === void 0 ? {} : _d;
    return __awaiter(this, void 0, void 0, function () {
      var urlSearchObj, needAddSearchData, c_auth, channleInfo;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            urlSearchObj = utils.parseQuery(h5url) || {};
            needAddSearchData = {
              tjchannelid: globalVariable.platformName,
              tjopenid: this.openId,
              tjuserid: 0,
              tjusertoken: '00000000-0000-0000-0000-000000000000'
            };
            if (typeof urlSearchObj.code === 'undefined') {
              needAddSearchData.code = this._urlCodeHandle();
            }
            if (!(options.userId && options.token)) return [3, 2];
            needAddSearchData.tjuserid = options.userId;
            needAddSearchData.tjusertoken = options.token;
            if (!IS_CTRIP) return [3, 2];
            return [4, twx.global.userInfo.token()];
          case 1:
            c_auth = _e.sent();
            needAddSearchData.c_auth = c_auth;
            _e.label = 2;
          case 2:
            channleInfo = this._getChannelInfoHandle();
            needAddSearchData.tjchanneltoken = encodeURIComponent(JSON.stringify(channleInfo));
            if ((_b = twx.trace) === null || _b === void 0 ? void 0 : _b.getFasTraceId()) {
              needAddSearchData._mpTraceId = (_c = twx.trace) === null || _c === void 0 ? void 0 : _c.getFasTraceId();
            }
            if (!(IS_TUJIA || IS_MAYI)) return [3, 4];
            return [4, this._setSceneParamsToH5urlHandle(h5url, options)];
          case 3:
            h5url = _e.sent();
            _e.label = 4;
          case 4:
            return [2, utils.jointUrlParametersAndRemoveRepeatOptions(h5url, needAddSearchData)];
        }
      });
    });
  },
  _getChannelInfoHandle: function () {
    var channelInfoObj = {};
    if (IS_QUNAR) {
      var qunarUserData = utils.getStorageSyncByKey('UserData') || {};
      var _sCookie = qunarUserData.cookies && qunarUserData.cookies._s || '';
      channelInfoObj.s_cookie = _sCookie;
    }
    if (IS_CTRIP) {
      channelInfoObj.cid = twx.global.projectInfo.cwx.clientID;
    }
    if (IS_TUJIA || IS_MAYI) {
      var storageABTest = utils.getStorageSyncByKey('tj_abtest') || [];
      var item = storageABTest.find(function (subItem) {
        return subItem.key === 'miniapp_home';
      });
      channelInfoObj.ab_bucket = item && item.value || '';
      if (this.originOptData.orderSourceLandlordId) {
        channelInfoObj.orderSourceLandlordId = this.originOptData.orderSourceLandlordId || '';
      }
      if (this.originOptData.landlordSearchInfo) {
        channelInfoObj.landlordSearchInfo = this.originOptData.landlordSearchInfo || {};
      }
      if (this.originOptData.landlordSourceChannelCode) {
        channelInfoObj.landlordSourceChannelCode = this.originOptData.landlordSourceChannelCode || '';
      }
      if (this.originOptData.customerSourceChannelCode) {
        channelInfoObj.customerSourceChannelCode = this.originOptData.customerSourceChannelCode || '';
      }
    }
    channelInfoObj.unionId = this.unionId;
    channelInfoObj.personalRecommendSwitch = this.personalRecommendSwitch;
    channelInfoObj.localRecommendSwitch = this.localRecommendSwitch;
    channelInfoObj.marketSwitch = this.marketSwitch;
    return channelInfoObj;
  },
  _setWebviewUrlEnvHandle: function (_a) {
    var h5url = _a.h5url;
    var urlRegx = /^https:\/\/m(\.fvt|1\.fvt|2\.fvt)?\.tujia\.com/;
    var fvtTestUrl = 'https://m.fvt.tujia.com';
    if (!isProdEnv && urlRegx.test(h5url)) {
      h5url = h5url.replace(urlRegx, fvtTestUrl);
    }
    return h5url;
  },
  _setDelayDayHandle: function (delayDay) {
    if (delayDay === void 0) {
      delayDay = 7;
    }
    var dateobj = new Date();
    dateobj.setDate(dateobj.getDate() + delayDay);
    var year = dateobj.getFullYear();
    var month = dateobj.getMonth() + 1;
    var date = dateobj.getDate();
    month = month < 10 ? '0' + month : month;
    date = date < 10 ? '0' + date : date;
    return year + '-' + month + '-' + date;
  },
  _syncLoginAndSetWebUrlHandle: function (_a) {
    var _b = _a.h5url,
      h5url = _b === void 0 ? '' : _b,
      _c = _a.isReload,
      isReload = _c === void 0 ? false : _c;
    return __awaiter(this, void 0, void 0, function () {
      var loginParam, urlSearchObj, fromCode_1, storageMemberData, globalUserInfo, _d;
      var _this = this;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            if (!(this.formatedOptData && this.formatedOptData.needLogin)) return [3, 1];
            if (!IS_CTRIP) {
              this.isNoRunMemberInfoReplaceApiCallback = true;
            }
            loginParam = {};
            if (IS_TUJIA) {
              loginParam = {
                needLogin: true
              };
            }
            urlSearchObj = utils.parseQuery(h5url) || {};
            fromCode_1 = urlSearchObj && urlSearchObj.code || this._urlCodeHandle();
            utils.platformLogin(loginParam, function () {
              return __awaiter(_this, void 0, void 0, function () {
                var params, _a, flag, replacedMemberInfoRes, memberInfoData, query, storageMemberInfo;
                var _this = this;
                return __generator(this, function (_b) {
                  switch (_b.label) {
                    case 0:
                      if (!IS_CTRIP) {
                        this.isNoRunMemberInfoReplaceApiCallback = false;
                      }
                      _a = {};
                      return [4, twx.global.userInfo.token()];
                    case 1:
                      params = (_a.token = _b.sent(), _a.expireTime = this._setDelayDayHandle(2), _a);
                      return [4, this._isRepeatGetMemberInfoTokenHandle(params.token)];
                    case 2:
                      flag = _b.sent();
                      if (!(flag || isReload)) return [3, 4];
                      return [4, twx.methods.replaceMpUserInfoToken(params)];
                    case 3:
                      replacedMemberInfoRes = _b.sent();
                      if (replacedMemberInfoRes && replacedMemberInfoRes.isSuccess) {
                        memberInfoData = {};
                        if (replacedMemberInfoRes.data) {
                          memberInfoData = replacedMemberInfoRes.data || {};
                          memberInfoData.storageTimestamp = +new Date();
                        }
                        console.log('账号置换后:', memberInfoData);
                        wx.setStorageSync(LOCAL_STORAGE_MEMBER_INFO, JSON.stringify(memberInfoData));
                        wx.setStorageSync(LOCAL_STORAGE_LOGINED_TOKEN, params.token);
                        this._loadWebUrlHandle({
                          h5url: h5url,
                          options: memberInfoData
                        });
                      } else {
                        if (IS_CTRIP) {
                          if (this.count < 1) {
                            twx.login.handleGoToLogin({}, function (res) {
                              return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                  switch (_a.label) {
                                    case 0:
                                      if (!res) return [3, 2];
                                      return [4, this._syncLoginAndSetWebUrlHandle({
                                        h5url: h5url,
                                        isReload: true
                                      })];
                                    case 1:
                                      _a.sent();
                                      this.count += 1;
                                      return [3, 3];
                                    case 2:
                                      this.gobackOrHome();
                                      _a.label = 3;
                                    case 3:
                                      return [2];
                                  }
                                });
                              });
                            }, h5url, fromCode_1);
                          } else {
                            this.gobackOrHome();
                          }
                        } else if (IS_TUJIA) {
                          query = utils.parseQuery(h5url);
                          if (!(query === null || query === void 0 ? void 0 : query.needLogin)) {
                            this._loadWebUrlHandle({
                              h5url: h5url
                            });
                          }
                        } else {
                          this._replaceMpUserInfoErrorHandle();
                        }
                      }
                      return [3, 6];
                    case 4:
                      return [4, this._getStorageMemberInfoHandle()];
                    case 5:
                      storageMemberInfo = _b.sent();
                      this._loadWebUrlHandle({
                        h5url: h5url,
                        options: storageMemberInfo
                      });
                      _b.label = 6;
                    case 6:
                      return [2];
                  }
                });
              });
            }, this.gobackOrHome, h5url, fromCode_1);
            return [3, 6];
          case 1:
            return [4, this._getStorageMemberInfoHandle()];
          case 2:
            storageMemberData = _e.sent();
            if (!(IS_TUJIA || IS_MAYI)) return [3, 4];
            return [4, twx.methods.replaceMpUserInfoToken()];
          case 3:
            _d = _e.sent();
            return [3, 5];
          case 4:
            _d = {
              data: storageMemberData
            };
            _e.label = 5;
          case 5:
            globalUserInfo = _d;
            this._loadWebUrlHandle({
              h5url: h5url,
              options: globalUserInfo.data
            });
            _e.label = 6;
          case 6:
            return [2];
        }
      });
    });
  },
  gobackOrHome: function () {
    if (this.backpre && IS_CTRIP) {
      wx.navigateBack();
    } else {
      utils.goChannelHome();
    }
  },
  _replaceMpUserInfoErrorHandle: function () {
    utils.showModal('转换用户信息失败，请重试', {
      showCancel: false,
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          utils.goChannelHome();
        }
      }
    });
  },
  _getStorageMemberInfoHandle: function () {
    return __awaiter(this, void 0, void 0, function () {
      var memberInfoStorage, parseData, isLogin;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            memberInfoStorage = wx.getStorageSync(LOCAL_STORAGE_MEMBER_INFO);
            parseData = {};
            return [4, twx.login.isLogin()];
          case 1:
            isLogin = _a.sent();
            if (isLogin && memberInfoStorage) {
              try {
                parseData = JSON.parse(memberInfoStorage);
              } catch (error) {
                parseData = {};
              }
            }
            return [2, parseData];
        }
      });
    });
  },
  _isRepeatGetMemberInfoTokenHandle: function (loginedToken) {
    return __awaiter(this, void 0, void 0, function () {
      var prevLoginedToken, storageMemberData, curDateTimestamp;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            prevLoginedToken = wx.getStorageSync(LOCAL_STORAGE_LOGINED_TOKEN);
            return [4, this._getStorageMemberInfoHandle()];
          case 1:
            storageMemberData = _a.sent();
            console.log('上一次置换的账号信息:', storageMemberData);
            curDateTimestamp = +new Date();
            if (prevLoginedToken && prevLoginedToken === loginedToken && curDateTimestamp - storageMemberData.storageTimestamp < 7200000) {
              return [2, false];
            }
            return [2, true];
        }
      });
    });
  },
  _loadWebUrlHandle: function (_a) {
    var _b = _a === void 0 ? {} : _a,
      _c = _b.h5url,
      h5url = _c === void 0 ? '' : _c,
      _d = _b.options,
      options = _d === void 0 ? {} : _d;
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            if (!h5url) {
              return [2, this._checkWebviewUrlHandle()];
            }
            return [4, this._joinUrlSearchInfoHandle({
              h5url: h5url,
              options: options
            })];
          case 1:
            h5url = _e.sent();
            console.log('加载 webview 的 h5url:', h5url);
            this.setData({
              h5url: h5url
            });
            return [2];
        }
      });
    });
  },
  _resetSharePathHandle: function (shareParams, isShowToast) {
    isShowToast && utils.toast('传入的分享页面地址与配置信息不匹配');
    return "/pages/tbnb/pages/common/webview/index?optionsData=" + JSON.stringify(shareParams);
  },
  _mergeShareDataHandle: function (formatedOptd) {
    var hideShareMenu = formatedOptd && formatedOptd.hideShareMenu;
    if (!!hideShareMenu) {
      wx.hideShareMenu();
    }
    if (formatedOptd && formatedOptd.shareData) {
      this.shareData = Object.assign(this.shareData, formatedOptd.shareData);
    }
  },
  _showErrorPageHandle: function (errMsg) {
    if (errMsg === void 0) {
      errMsg = '';
    }
    this.setData({
      h5url: '',
      isShowWsg: true,
      wsg: errMsg || '目标地址出了点问题，请重新打开该页面'
    });
  },
  _checkWebviewUrlHandle: function (_a) {
    var _b = _a === void 0 ? {} : _a,
      _c = _b.h5url,
      h5url = _c === void 0 ? '' : _c,
      _d = _b.errMsg,
      errMsg = _d === void 0 ? '' : _d;
    if (!h5url || h5url.length === 0) {
      this._showErrorPageHandle(errMsg);
    }
  },
  _setSceneParamsToH5urlHandle: function (h5url, loginRes) {
    return __awaiter(this, void 0, void 0, function () {
      var globalData, scene, miniPath, needJoinData, userInfoUrl, authRes, resData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            globalData = _globalApp.globalData;
            scene = parseInt(globalData.globalSceneCode, 10);
            if (scene === 1036 || scene === 1069) {
              this.openAppFlag = 1;
            } else if (scene !== 1038 && scene !== 1089 && scene !== 1090) {
              this.openAppFlag = 0;
            }
            if (!(this.formatedOptData.loginType == 1 || this.formatedOptData.loginType == 2)) return [3, 1];
            if (loginRes.userId && loginRes.token) {
              h5url = this._initAuthor(h5url);
            } else {
              miniPath = "/pages/tbnb/pages/common/webview/index?h5url=" + encodeURIComponent(h5url);
              return [2, wx.redirectTo({
                url: "/package_one/pages/wifi/matAndWifi/wifiLogin/index?nextPath=" + encodeURIComponent(miniPath) + "&openType=redirect"
              })];
            }
            return [3, 4];
          case 1:
            needJoinData = {
              flag: this.openAppFlag
            };
            if (h5url.indexOf('mref') === -1) {
              needJoinData.mref = 'wxclient';
            }
            userInfoUrl = '/h5/appw/landloardInvite/index';
            if (!h5url.includes(userInfoUrl)) return [3, 3];
            return [4, this._checkAuthor()];
          case 2:
            authRes = _a.sent();
            resData = authRes.data || {};
            if (authRes.isSuccess && !resData.hasBind) {
              return [2, this._showNotbindModalHandle()];
            }
            _a.label = 3;
          case 3:
            h5url = utils.jointUrlParametersAndRemoveRepeatOptions(h5url, needJoinData);
            _a.label = 4;
          case 4:
            return [2, h5url];
        }
      });
    });
  },
  _showNotbindModalHandle: function () {
    wx.showModal({
      title: '提示',
      content: '请使用房东身份登录',
      showCancel: false,
      complete: function () {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  },
  _initAuthor: function (h5url) {
    return __awaiter(this, void 0, void 0, function () {
      var checkAuthorRes, resData, miniPath;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4, this._checkAuthor()];
          case 1:
            checkAuthorRes = _a.sent();
            resData = checkAuthorRes.data;
            if (checkAuthorRes.isSuccess) {
              if (this.formatedOptData.loginType == 2 && !resData.hasBind) {
                this._showNotbindModalHandle();
              }
              h5url = utils.jointUrlParametersAndRemoveRepeatOptions(h5url, {
                mref: 'wxclient',
                hasbind: resData.hasBind,
                groupGuid: resData.groupGuid,
                storeGuid: resData.storeGuid,
                flag: this.openAppFlag
              });
            } else {
              if (this.formatedOptData.loginType == 2) {
                miniPath = "/pages/tbnb/pages/common/webview/index?h5url=" + encodeURIComponent(h5url) + "&loginType=2";
                wx.redirectTo({
                  url: "/pages/user/login/login?nextPath=" + encodeURIComponent(miniPath) + "&openType=redirect"
                });
              } else {
                h5url = utils.jointUrlParametersAndRemoveRepeatOptions(h5url, {
                  mref: 'wxclient',
                  flag: this.openAppFlag
                });
              }
            }
            return [2, h5url];
        }
      });
    });
  },
  _checkAuthor: function () {
    return __awaiter(this, void 0, void 0, function () {
      var tjUserInfoData, newAuthoryRes, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            tjUserInfoData = _globalApp.globalUserInfo.tjUserInfo;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3,, 4]);
            return [4, authApi.newClientAuthCheck({
              userToken: tjUserInfoData && tjUserInfoData.userToken
            })];
          case 2:
            newAuthoryRes = _a.sent();
            return [2, {
              isSucess: true,
              data: newAuthoryRes
            }];
          case 3:
            error_1 = _a.sent();
            console.log('err:', error_1);
            return [2, {
              isSucess: false,
              data: null
            }];
          case 4:
            return [2];
        }
      });
    });
  },
  _handleWebviewCallback: function (data) {
    var prevPage = utils.getPrevPage();
    if (prevPage && prevPage.onWebviewCallback) {
      prevPage.onWebviewCallback(data);
    }
  },
  _updateTJUser: function (data) {
    var globalUserInfo = _globalApp.globalUserInfo.tjUserInfo || {};
    var _data = Array.isArray(data) ? data[0] : data;
    if (!globalUserInfo.userId || !globalUserInfo.token) {
      _globalApp.setTjUserInfo({
        userId: _data.userId || '',
        userToken: _data.userToken || ''
      });
    }
  }
});
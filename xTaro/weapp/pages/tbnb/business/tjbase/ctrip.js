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
import { CPage, cwx, __global } from '../../../../cwx/cwx.js';
import keyConfig from './config/index';
import utils from '../../utils/index';
import memberInfoApi from '../../api/memberInfo';
var base = {
  TPage: CPage,
  TComponent: Component,
  twx: {
    request: cwx.request,
    login: {
      isLogin: function () {
        return __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            return [2, !!cwx.user.auth];
          });
        });
      },
      handleGoToLogin: function (params, cb, h5url, fromCode) {
        if (h5url === void 0) {
          h5url = '';
        }
        if (fromCode === void 0) {
          fromCode = '';
        }
        var loginOptions = {
          callback: function () {
            var _a;
            var auth = (_a = cwx.user) === null || _a === void 0 ? void 0 : _a.auth;
            console.log('登录后的 auth', auth);
            cb && cb(auth);
          }
        };
        if (Object.keys(params).length && (params.hasOwnProperty('IsAuthentication') || params.hasOwnProperty('showDirectLoginBtn'))) {
          loginOptions.param = params;
        }
        if (h5url) {
          utils.dataTrack({
            traceKey: 'webview_toLogin',
            traceData: {
              code: fromCode,
              url: h5url
            },
            pageName: 'bnbwebview'
          });
        }
        cwx.user.login(loginOptions);
      }
    },
    global: {
      projectInfo: __global,
      userInfo: {
        openId: function () {
          return cwx.cwx_mkt.openid;
        },
        unionId: function () {
          return cwx.cwx_mkt.unionid;
        },
        token: function () {
          return cwx.user.auth;
        }
      }
    },
    trace: {
      traceOptions: {
        detail: {
          pageId: '10650046017',
          ubtKey: keyConfig.ctrip
        },
        share: {
          pageId: '',
          ubtKey: keyConfig.ctrip
        },
        bnbwebview: {
          pageId: '',
          ubtKey: keyConfig.ctrip
        }
      },
      dataTrack: function (_a) {
        var traceKey = _a.traceKey,
          traceData = _a.traceData,
          pageName = _a.pageName;
        var curPage = utils.getCurrentPage();
        var curTraceOption = this.traceOptions || {};
        var pageOptions = pageName && curTraceOption[pageName];
        var curTraceKey = pageOptions && traceKey && pageOptions.ubtKey[traceKey];
        if (!curPage || !pageOptions || !curTraceKey) {
          return;
        }
        curPage.ubtTrace(curTraceKey, traceData);
      },
      getFasTraceId: function () {
        return '';
      }
    },
    methods: {
      replaceMpUserInfoToken: function (params) {
        return __awaiter(this, void 0, void 0, function () {
          var res;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4, memberInfoApi.unionLoginByToken({
                  params: params,
                  passthrough: {
                    apiType: 2,
                    isNodeApi: true
                  }
                })];
              case 1:
                res = _a.sent();
                return [2, res];
            }
          });
        });
      },
      webviewOptionsTransformH5urlHandle: function (options) {
        if (options === void 0) {
          options = {};
        }
        return {
          options: options,
          isBreak: false,
          cbFunc: function () {}
        };
      },
      setCookieRecordHandle: function () {},
      authTemplateId: function (params) {
        cwx.mkt.subscribeMsg(params.templateList, function (data) {
          console.log(data);
        }, function (err) {
          console.log(err);
        });
      },
      startGetGeoPoint: function (params) {
        return cwx.locate.startGetGeoPoint(params);
      },
      getPRSetting: function () {
        return cwx.getPRSetting();
      }
    }
  }
};
export default base;
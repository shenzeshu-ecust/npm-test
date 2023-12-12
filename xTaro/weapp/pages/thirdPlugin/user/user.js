import { _, cwx, __global } from '../../../cwx/cwx';
import ServiceMetric, {
  ServiceMetricTypeEnum, ServiceErrTypeEnum, ServiceResultEnum
} from './src/utils/ServiceMetric';

import { loginCommon } from './common';
import loginBase from './loginbase';
import {
  logApiCall, isNonMember, nonmemberLogin, mobileQueryOrder,
  unionLogin, logout, writeCrossTicket,exchangeAuthToken, precheckUserInfo, logTrace,
  qconfigSingleton,
} from './core/usercore';
import Login from './core/Login';

const checkloginurl = 'soa2/13191/getTicketPropertys.json';
const logouturl = 'soa2/13191/logoutByTicket.json';
// 检查跨平台登录态是否为相同用户
const checkCrossUserByToken = 'soa2/13191/checkCrossUserByToken.json';
// 使用当前ticket获取crosstoken
const checkCrossTicket = 'soa2/14458/checkCrossTicket.json';

const STAT = {
  WECHAT_ONECLICK_TOKEN: 'c_wechat_oneclick_token'
};
const DEFAULT_USER_AVATAR = 'https://pages.c-ctrip.com/basebiz/accounts/wechat/common_myctrip_home_avatar_ico.png';

// WTF ...
;(function load() {
  global.wechatcode = global.wechatcode || '';
}());

const sendUbtDevTrace = function(traceName, value) {
  const page = cwx.getCurrentPage();
  if (page && page.ubtDevTrace) {
    try {
      page.ubtDevTrace(traceName, value);
    } catch (error) {
    }
  } else {
    setTimeout(() => {
      sendUbtDevTrace(traceName, value);
    }, 300);
  }
};

const sendUbtMetric = function(tag) {
  const page = cwx.getCurrentPage();
  if (page && page.ubtMetric) {
    try {
      const tags = {
        path: page.__route__ || 'NA',
        ...tag
      };
      console.log('[accounts] wx_user_api_metric', tags);
      page.ubtMetric({
        name: 'wx_user_api_metric',
        tag: tags,
        value: 1
      });
    } catch (error) {
    }
  } else {
    setTimeout(() => {
      sendUbtMetric(tag);
    }, 300);
  }
};
const sendApiCallUbtMetric = function(scene) {
  sendUbtMetric({
    stage: STAGE.API_CALL,
    ...scene
  });
};
const API_TYPE = {
  show: 'show',
  success: 'success'
};
const sendApiUbtTrace = (scene, type) => {
  // 微信授权手机一键登录api
  // c_wechat_mobiletoken_login_api
  const traceKey = 214652;
  try {
    cwx.sendUbtByPage.ubtTrace(traceKey, {
      scene,
      scenetype: type
    });
  } catch (e) {
    // ...
  }
};

const SCENE = {
  IS_LOGIN: {
    scene: 'isLogin',
    url: 'cwx.user.isLogin'
  },
  IS_LOGIN_ASYNC: {
    scene: 'checkLoginStatusFromServer',
    url: checkloginurl
  },
  CHECK_AUTH: {
    scene: 'checkAuth',
    url: checkloginurl
  },
  BIND_PHONE: {
    scene: 'bindPhone',
    url: 'cwx.user.bindPhone'
  },
  CLEAR_AUTH: {
    scene: 'clearAuth',
    url: 'cwx.user.clearAuth'
  },
  LOGOUT: {
    scene: 'logout',
    url: logouturl
  },
  CHECK_SAME_USER: {
    scene: 'checkSameUserByCrossToken',
    url: checkCrossUserByToken
  },
  // 旧版一键登录对外api
  WECHAT_PHONE_LOGIN: {
    scene: 'wechatPhoneLogin',
    url: 'cwx.user.wechatPhoneLogin'
  },
  WECHAT_PHONE_LOGIN_NEW: {
    scene: 'wechatPhoneLoginNew',
    url: 'cwx.user.wechatPhoneLoginNew'
  },
  WX_LOGIN: {
    scene: 'wxLogin',
    url: 'cwx.user.wxLogin'
  },
  GET_PHONE_NUMBER_BY_TICKET: {
    scene: 'getPhoneNumberByTicket',
    url: 'cwx.user.getPhoneNumberByTicket'
  },
  GET_MOBILE_TOKEN: {
    scene: 'getMobileToken',
    url: 'cwx.user.getMobileToken'
  },
  MOBILE_TOKEN_SEIZE_BIND: {
    scene: 'mobileTokenSeizeBind',
    url: 'cwx.user.mobileTokenSeizeBind'
  },
  MOBILE_TOKEN_LOGIN: {
    scene: 'mobileTokenLogin',
    url: 'cwx.user.mobileTokenLogin'
  },
  MOBILE_TOKEN_LOGIN_NEW: {
    scene: 'mobileTokenLoginNew',
    url: 'cwx.user.mobileTokenLoginNew'
  },
  GET_THIRD_TOKEN: {
    scene: 'getThirdToken',
    url: 'cwx.user.getThirdToken'
  },
  THIRD_TOKEN_SEIZE_BIND: {
    scene: 'thirdTokenSeizeBind',
    url: 'cwx.user.thirdTokenSeizeBind'
  },
  THIRD_TOKEN_LOGIN: {
    scene: 'thirdTokenLogin',
    url: 'cwx.user.thirdTokenLogin'
  },
  GET_UID_BY_MOBILE_TOKEN: {
    scene: 'getUidByMobileToken',
    url: 'cwx.user.getUidByMobileToken'
  },
  LOGIN: {
    scene: 'login',
    url: 'cwx.user.login'
  },
  AUTH: {
    scene: 'auth',
    url: 'cwx.user.auth'
  },
  DUID: {
    scene: 'duid',
    url: 'cwx.user.duid'
  },
  UUID: {
    scene: 'uuid',
    url: 'cwx.user.uuid'
  },
  WECHAT_CODE: {
    scene: 'wechatcode',
    url: 'cwx.user.wechatcode'
  },
  IS_AUTHORIZATION: {
    scene: 'isAuthorization',
    url: 'cwx.user.isAuthorization'
  }
};

const STAGE = {
  REQUEST: 'request',
  SUCCESS: 'success',
  FAIL: 'fail',
  API_CALL: 'apiCall'
};

const User = {
  auth: '', // 登录后得到的Ticket
  // uid: '', //当前登录的用户ID, 未登录状态下是空
  // ubt 数据
  duid: '',
  uuid: '',
  wechatcode: '',
  logintype: '', // 控制是否显示授权登录
  /**
   * 获取uuid
   * @deprecated
   */
  setuuid(callback) {
    logApiCall('setuuid');
    if (typeof callback === 'function') {
      callback(true);
    }
  },
  /**
   * 获取unionid
   * @deprecated
   */
  getUnionid(callback) {
    logApiCall('getUnionid');
    if (typeof callback === 'function') {
      callback({
        unionid: ''
      });
    }
  },
  // 判断是否登录-local
  isLogin() {
    sendApiCallUbtMetric(SCENE.IS_LOGIN);
    // 同步判断
    if (!this.auth) {
      return false;
    }
    return true;
  },
  /**
   * 登录态校验和续期
   * @param {function} callback
   * @param {{ stage?: string }} [options] 临时参数，仅调整埋点信息，不推荐修改
   * @returns {boolean} isSuccess
   */
  checkLoginStatusFromServer(callback, options) {
    sendApiCallUbtMetric(SCENE.IS_LOGIN_ASYNC);
    const devTraceSuccess = (value) => sendUbtDevTrace('wx_userjs_checkLoginStatusFromServer_success', value);
    const devTraceFailed = (value) => sendUbtDevTrace('wx_userjs_checkLoginStatusFromServer_fail', value);
    const metric = new ServiceMetric('checkLoginStatusFromServer');
    const stage = options?.stage ?? 'NA';

    devTraceSuccess({
      Stage: 'before',
      Info: this.auth
    });

    if (!this.auth) {
      devTraceSuccess({
        Stage: 'after',
        IsLogin: false,
        Info: 'no auth'
      });
      metric.send(ServiceResultEnum.success, null, ServiceMetricTypeEnum.local, stage);
      callback(false);
    } else {
      const data = {
        ticket: this.auth,
        ticketVersion: 2,
        accountHead: {
          accessCode: '8DF37737425CCFC1'
        }
      };
      const _success = (res1) => {
        const result = res1.data;
        const inretcode = result ? result.returnCode : '904';
        if (inretcode == 0) {
          devTraceSuccess({
            Stage: 'after',
            IsLogin: true,
            ...(result.propertys || {})
          });
          metric.send(ServiceResultEnum.success, null, ServiceMetricTypeEnum.service, stage);
          callback(true);
        } else {
          // 服务下发201代表ticket过期，本地auth需要清理
          if (inretcode == 201) {
            this.clearAuth();
          }

          const serviceError = new Error(`checkLoginStatusFromServer: can't deal with inretcode ${inretcode}`);
          serviceError.serviceErrCode = inretcode;
          _fail(serviceError);
        }
      };
      var _fail = function(error) {
        const isError = error instanceof Error;
        const isServiceError = isError && !_.isUndefined(error.serviceErrCode);

        let ErrType;
        let ErrorCode;
        let ErrMessage;
        if (isServiceError) {
          ErrType = ServiceErrTypeEnum.service;
          ErrorCode = error.serviceErrCode;
          ErrMessage = error.message;
        } else if (isError) {
          ErrType = ServiceErrTypeEnum.fatal;
          ErrorCode = -1000; // 前端通用错误
          ErrMessage = error.message;
        } else {
          ErrType = ServiceErrTypeEnum.network;
          ErrorCode = error.errMsg || 'na';
          ErrMessage = error.errMsg || 'na';
        }

        metric.send(
          ServiceResultEnum.failed,
          {
            errType: ErrType,
            errCode: ErrorCode
          },
          ServiceMetricTypeEnum.service,
          stage
        );

        devTraceFailed({
          Stage: 'after',
          IsLogin: false,
          ErrType,
          ErrorCode,
          ErrMessage
        });
        callback(false);
      };

      try {
        cwx.request(loginCommon.getRequestObject(checkloginurl, data, _success, _fail));
      } catch (error) {
        _fail(error);
      }
    }
  },
  checkAuth(callback) {
    sendApiCallUbtMetric(SCENE.CHECK_AUTH);
    this.checkLoginStatusFromServer(callback);
  },

  // 跳转登录页面
  login(data) {
    sendApiCallUbtMetric(SCENE.LOGIN);
    Login.goLogin(data);
  },

  /**
   * 跳转绑定手机页面
   * @deprecated 内部方法，外部接入请勿使用，后续会下线
   * @param data
   */
  bindPhone(data) {
    sendApiCallUbtMetric(SCENE.BIND_PHONE);
  },

  // 退出
  logout,
  // 清除本地地auth
  clearAuth() {
    sendApiCallUbtMetric(SCENE.CLEAR_AUTH);
    cwx.user.auth = '';
    cwx.user.duid = '';
  },
  // 小程序间跳转写登录态
  writeCrossTicket,

  // 判断crossToken用户是否与当前登录用户为同一用户。只有返回码为0时进行同一用户判断，如果为true为同一用户，否则为两个用户
  checkSameUserByCrossToken(crossToken, callback) {
    console.log(`checkSameUserByCrossToken, crossToken:${crossToken}`);
    if (cwx.user.auth == '' || cwx.user.auth == undefined) {
      sendUbtMetric({
        ...SCENE.CHECK_SAME_USER,
        stage: STAGE.FAIL,
        params: JSON.stringify({
          data: 'ticket is empty, callback(\'420022\').'
        })
      });
      callback('420022', 'ticket is empty');
    }

    if (crossToken != '' && crossToken != undefined) {
      const data = {
        AccountHead: {},
        Data: {
          token: crossToken,
          context: {
            thirdConfigCode: __global.accesscode,
            ClientID: cwx.clientID
          },
          accountHead: {
            locale: loginCommon.locale,
            platform: loginCommon.platform
          }
        }
      };

      sendUbtMetric({
        ...SCENE.CHECK_SAME_USER,
        stage: STAGE.REQUEST,
        params: JSON.stringify(data)
      });

      const _success = function(res1) {
        const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
        if (retcode == 0) {
          const result = JSON.parse(res1.data.Result);
          let inretcode = (result) ? result.returnCode : '904';

          let message = '';
          let payload;

          const isOK = inretcode == 0;
          let desc = `inretcode(${inretcode}): ${isOK ? 'Success' : 'Fail'} to check same user. callback(${inretcode}). `;

          if (isOK) {
            message = 'success';
            payload = result.sameUser;
            desc += `sameUser: ${result.sameUser}`;
          } else if (inretcode == 420022) {
            message = 'ticket is empty';
          } else if (inretcode == 420023) {
            message = 'token can\'t empty';
          } else if (inretcode == 530022) {
            message = 'ticket invalid';
          } else if (inretcode == 560023) {
            message = 'token invalid';
          } else {
            inretcode = 900;
            message = 'inner error';
          }

          console[isOK ? 'log' : 'error'](`${desc} ${message}`);
          sendUbtMetric({
            ...SCENE.CHECK_SAME_USER,
            stage: STAGE.SUCCESS,
            data: JSON.stringify({
              desc,
              message
            })
          });

          callback(String(inretcode), message, payload);
        } else {
          console.error(`checkSameUserByCrossToken, request success, can't deal with AccountGateway's retcode: ${retcode}`);
          sendUbtMetric({
            ...SCENE.CHECK_SAME_USER,
            stage: STAGE.SUCCESS,
            data: JSON.stringify({
              desc: `retcode(${retcode}): can't deal with accountgateway retcode. callabck('900')`
            })
          });
          callback('900', `can't deal with AccountGateway's retcode: ${retcode}`);
        }
      };
      const _fail = function(error) {
        console.error('checkSameUserByCrossToken, AccountGateway request fail');
        sendUbtMetric({
          ...SCENE.CHECK_SAME_USER,
          stage: STAGE.FAIL,
          data: JSON.stringify({
            desc: 'accountgateway request fail. callback(\'900\')',
            message: `${error.message}, ${error.stack}`
          })
        });
        callback('900', 'AccountGateway request fail');
      };
      try {
        cwx.request(loginCommon.getGatewayRequestObj(checkCrossUserByToken, data, _success, _fail));
      } catch (error) {
        _fail(error);
      }
    } else {
      sendUbtMetric({
        ...SCENE.CHECK_SAME_USER,
        stage: STAGE.FAIL,
        data: JSON.stringify({
          message: 'crossToken can\'t empty, callback(\'420023\').'
        })
      });
      callback('420023', 'token can\'t empty');
    }
  },
  // 根据当前登录态取crosstoken
  getCrossToken(callback) {
    logApiCall('getCrossToken');
    console.log(`getCrossToken, ticket:${this.auth}`);
    if (this.auth) {
      exchangeAuthToken(callback)
    } else {
      sendUbtDevTrace('bbz_accounts_wx_flow', {
        type: 'getCrossToken',
        info:'no auth'
      });
      callback('', true);
    }
  },

  // 手机号一键登录封装接口
  // @deprecated 已废弃，请使用新函数wechatPhoneLoginNew
  wechatPhoneLogin(res, pageId, pageUrl, callback) {
    sendApiCallUbtMetric(SCENE.WECHAT_PHONE_LOGIN);
    sendApiUbtTrace(SCENE.WECHAT_PHONE_LOGIN.scene, API_TYPE.show);
    if (!cwx.user.uuid || cwx.user.uuid == '') {
      cwx.user.setuuid();
    }
    console.log('wechatPhoneLogin被调用');
    loginBase.mobilePhoneLogin(res, 'wechatPhone', pageId, pageUrl, (code, ...rest) => {
      if (Number(code) === 0) {
        sendApiUbtTrace(SCENE.WECHAT_PHONE_LOGIN.scene, API_TYPE.success);
      }
      callback(code, ...rest);
    });
  },
  wechatPhoneLoginNew(res, context, callback) {
    sendApiCallUbtMetric(SCENE.WECHAT_PHONE_LOGIN_NEW);
    sendApiUbtTrace(SCENE.WECHAT_PHONE_LOGIN_NEW.scene, API_TYPE.show);
    if (!cwx.user.uuid || cwx.user.uuid == '') {
      cwx.user.setuuid();
    }
    console.log('wechatPhoneLoginNew被调用');
    loginBase.mobilePhoneLoginNew(res, context, (code, ...rest) => {
      if (Number(code) === 0) {
        sendApiUbtTrace(SCENE.WECHAT_PHONE_LOGIN_NEW.scene, API_TYPE.success);
      }
      callback(code, ...rest);
    });
  },
  // 获取微信临时登录凭证
  wxLogin(callback) {
    sendApiCallUbtMetric(SCENE.WX_LOGIN);
    cwx.user.wechatcode = '';
    loginBase.loginNow(callback);
  },
  // 查询当前登录用户是否绑定手机号
  getPhoneNumberByTicket(callback) {
    sendApiCallUbtMetric(SCENE.GET_PHONE_NUMBER_BY_TICKET);
    loginBase.getPhoneNumberByTicket(callback);
  },
  // 授权获取手机token
  getMobileToken(res, callback) {
    sendApiCallUbtMetric(SCENE.GET_MOBILE_TOKEN);
    loginBase.mobileAuthenticate(res, false, callback);
  },
  // 手机token抢占式绑定
  mobileTokenSeizeBind(mobileToken, callback) {
    sendApiCallUbtMetric(SCENE.MOBILE_TOKEN_SEIZE_BIND);
    loginBase.mobileTokenSeizeBind(mobileToken, callback);
  },
  // 手机token登录(如果未注册，则注册并登录)
  // @deprecated 已废弃，请使用新函数mobileTokenLoginNew
  mobileTokenLogin(mobileToken, callback) {
    sendApiCallUbtMetric(SCENE.MOBILE_TOKEN_LOGIN);
    loginBase.getUidByMobileToken(mobileToken, callback);
  },
  // 手机token登录(如果未注册，则注册并登录)
  mobileTokenLoginNew(mobileToken, context, callback) {
    sendApiCallUbtMetric(SCENE.MOBILE_TOKEN_LOGIN_NEW);
    loginBase.getUidByMobileTokenSourceId(mobileToken, context, callback);
  },
  // 授权获取第三方token
  getThirdToken(res, callback) {
    sendApiCallUbtMetric(SCENE.GET_THIRD_TOKEN);
    loginBase.authenticate(res, callback);
  },
  // 第三方token抢占式绑定
  thirdTokenSeizeBind(thirdToken, callback) {
    sendApiCallUbtMetric(SCENE.THIRD_TOKEN_SEIZE_BIND);
    loginBase.thirdTokenSeizeBind(thirdToken, callback);
  },
  // 第三方token登录
  thirdTokenLogin(thirdToken, callback) {
    sendApiCallUbtMetric(SCENE.THIRD_TOKEN_LOGIN);
    sendApiUbtTrace(SCENE.THIRD_TOKEN_LOGIN.scene, API_TYPE.show);
    loginBase.thirdTokenLogin(thirdToken, (code, ...rest) => {
      if (Number(code) === 0) {
        sendApiUbtTrace(SCENE.THIRD_TOKEN_LOGIN.scene, API_TYPE.success);
      }
      callback(code, ...rest);
    });
  },
  // 查询当前登录用户是否绑定手机号
  getUidByMobileToken(mobileToken, callback) {
    sendApiCallUbtMetric(SCENE.GET_UID_BY_MOBILE_TOKEN);
    loginBase.getUidByMobileTokenNew(mobileToken, false, callback);
  },

  // region 非会员相关
  mobileQueryOrder: mobileQueryOrder,
  nonmemberLogin: nonmemberLogin,
  isNonMember: isNonMember,
  // endregion 非会员相关

  // 联合登录
  unionLogin
};

Object.defineProperty(User, 'auth', {
  get() {
    return cwx.getStorageSync('auth');
  },
  set(val) {
    try {
      cwx.setStorageSync('auth', val);
    } catch (e) {
      console.log(e);
    }
  }
});
Object.defineProperty(User, 'duid', {
  get() {
    return cwx.getStorageSync('duid');
  },
  set(val) {
    try {
      cwx.setStorageSync('duid', val);
    } catch (e) {
      console.log(e);
    }
  }
});
Object.defineProperty(User, 'uuid', {
  get() {
    return cwx.getStorageSync('uuid');
  },
  set(val) {
    try {
      cwx.setStorageSync('uuid', val);
    } catch (e) {
      console.log(e);
    }
  }
});

Object.defineProperty(User, 'wechatcode', {
  get() {
    return global.wechatcode;
  },
  set(val) {
    global.wechatcode = val;
  }
});

Object.defineProperty(User, 'isAuthorization', {
  get() {
    return cwx.getStorageSync('isAuthorization');
  },
  set(val) {
    try {
      cwx.setStorageSync('isAuthorization', val);
    } catch (e) {
      console.log(e);
    }
  }
});
User.getToken = function(callback) {
  logApiCall('getToken');
  exchangeAuthToken(callback)
};

// 获取快捷登录标记，并将信息存储在 User 的 userInfo 字段上
async function setUserInfo() {
  try {
    const res = await precheckUserInfo();
    logTrace(STAT.WECHAT_ONECLICK_TOKEN);
    const {
      nickName = '尊敬的携程用户',
      profilePictureUrl = DEFAULT_USER_AVATAR
    } = res;
    User.userInfo = {
      nickName,
      profilePictureUrl,
    }
  } catch (error) {
    // 没有成功获取到快捷登录标记，重置用户信息
    User.userInfo = null;
  }
  console.log('userInfo:', User.userInfo);
}

// 刷新后端判断的「快捷登录标记」 和 QConfig的 「授权手机号开关」
async function handleOnShow() {
  setUserInfo();
  qconfigSingleton.refreshConfig();
}

setTimeout(() => {
// 小程序启动时，对用户登录态做校验和续期
  User.checkLoginStatusFromServer(() => {
  }, {
    stage: 'launch'
  });
  try {
    const infos = cwx.getStorageInfoSync();
    sendUbtDevTrace('bbz_accounts_wx_flow', {
      type: 'checkLoginStatusFromServerOnLaunch',
      unionid: cwx.cwx_mkt.unionid,
      storageKeys: infos && infos.keys instanceof Array ? infos.keys.join(', ') : 'NA'
    });
  } catch (e) {
    console.warn(e);
  }
}, 5);

// 只有主版小程序才会触发快捷登录的 标记&开关 刷新
if (cwx.checkIsMasterMiniapp && cwx.checkIsMasterMiniapp()) {
  cwx.Observer.addObserverForKey('appjs_onShow', handleOnShow)
}

module.exports = User;

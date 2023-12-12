/* global wx */

import { cwx } from '../../../cwx/cwx';
import { loginCommon, __global } from './common';

const LoginBase = {
  mobileLoginType: 'messageCode',
  deviceName: '',
  osType: '',
  pageUrl: '',
  pageId: '',
  sourceId: '55552689',
  // 手机号登录
  mobilePhoneLogin(res, loginType, pageId, pageUrl, callback) {
    const self = this;
    console.log('wechatPhoneLogin被调用');
    self.mobileLoginType = loginType;
    // 获取系统信息
    if (!self.deviceName || self.deviceName == '') {
      const sys = wx.getSystemInfoSync();
      self.deviceName = `${sys.brand} ${sys.model}`;
    }
    if (!self.osType || self.osType == '') {
      const sys = wx.getSystemInfoSync();
      self.osType = sys.platform;
    }
    self.pageId = pageId;
    self.pageUrl = pageUrl;
    self.sourceId = '55552689';
    this.mobileAuthenticate(res, true, callback);
  },
  mobilePhoneLoginNew(res, context, callback) {
    const self = this;
    console.log('wechatPhoneLogin被调用');
    self.mobileLoginType = 'wechatPhone';
    // 获取系统信息
    if (!self.deviceName || self.deviceName == '') {
      const sys = wx.getSystemInfoSync();
      self.deviceName = `${sys.brand} ${sys.model}`;
    }
    if (!self.osType || self.osType == '') {
      const sys = wx.getSystemInfoSync();
      self.osType = sys.platform;
    }
    self.sourceId = '55552689';
    if (context) {
      if (context.pageid) {
        self.pageId = `${context.pageid}`;
      }
      if (context.pageurl) {
        self.pageUrl = `${context.pageurl}`;
      }
      if (context.sourceid) {
        self.sourceId = `${context.sourceid}`;
      }
    }
    this.mobileAuthenticate(res, true, callback);
  },

  // 调用微信的wx.login
  loginNow(callback) {
    const self = this;
    cwx.login({
      success(res1) {
        if (res1.code && res1.code != 'the code is a mock one') {
          console.log(`loginNow, code:${res1.code}`);
          self.wechatLogin(res1.code, callback);
        } else {
          console.error('loginNow, 请求login成功，但无法获取code');
          callback(100, 'loginNow', '请求login成功，但无法获取code');
        }
      },
      fail(res1) {
        console.error('loginNow, 获取code失败');
        callback(100, 'loginNow', '网络不稳定，请稍后再试');
      },
    });
  },

  // 使用微信临时登录凭证code取相关信息后返回携程认证wechatcode
  wechatLogin(code, callback) {
    const self = this;
    const data = {
      AccountHead: {},
      Data: {
        authCode: code,
        thirdConfigCode: __global.accesscode,
        Context: {},
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        const inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          console.log(`wechatLogin, 请求携程wechatLogin成功, wechaCode:${result.wechatCode}`);
          const { wechatCode } = result;
          cwx.user.wechatcode = wechatCode;
          callback(0, 'wechatLogin', `请求携程wechatLogin成功, wechaCode:${cwx.user.wechatcode}`);
        } else {
          console.error(`wechatLogin, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(100, 'wechatLogin', `请求携程wechatLogin失败，请稍候再试(${inretcode})`);
        }
      } else {
        console.error(`wechatLogin, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
        callback(100, 'wechatLogin', `请求携程wechatLogin失败，请稍候再试(${retcode})`);
      }
    };
    const _fail = function (res2) {
      console.error(`wechatLogin, AccountGateway请求失败${res2}`);
      callback(100, 'wechatLogin', '请求携程wechatLogin失败，请稍候再试(900)');
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.wechatLogin, data, _success, _fail));
  },

  // 手机认证
  mobileAuthenticate(res0, isGetUid, callback) {
    const self = this;
    if (cwx.user.wechatcode == '') {
      console.warn('mobileAuthenticate, 未认证携程wechatCode，请稍后再试');
      self.loginNow((resCode, funtionName, errorMsg) => {
      });
      callback(100, 'mobileAuthenticate', '未认证携程wechatCode，请稍后再试(900)');
    } else {
      wx.checkSession({
        success() {
          console.log('mobileAuthenticate, checkSession结果为：有效');
          if (res0 && res0.detail && res0.detail.errMsg == 'getPhoneNumber:ok') {
            const { encryptedData } = res0.detail;
            const { iv } = res0.detail;
            console.log(`mobileAuthenticate, encryptedData:${encryptedData},iv:${iv}`);
            const data = {
              AccountHead: {},
              Data: {
                authCode: cwx.user.wechatcode,
                ThirdType: 'wechat_app',
                thirdConfigCode: __global.accesscode,
                Context: { encryptedData, iv, uuid: cwx.user.uuid },
              },
            };
            const _success = function (res1) {
              const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
              if (retcode == 0) {
                const result = JSON.parse(res1.data.Result);
                const inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
                if (inretcode == 0) {
                  const mobileToken = result.token;
                  console.log(`mobileAuthenticate, 请求成功, mobileToken:${mobileToken}`);
                  if (isGetUid == true) {
                    self.getUidByMobileTokenNew(mobileToken, true, callback);
                  } else {
                    callback(0, 'mobileAuthenticate', '获取手机token成功', mobileToken);
                  }
                } else if (inretcode == 550025) {
                  console.warn('mobileAuthenticate, 请求成功, wechatcode已过期');
                  self.loginNow((resCode, funtionName, errorMsg) => {
                  });
                  callback(100, 'mobileAuthenticate', `微信临时登录态已过期，请重新登录(${inretcode})`);
                } else {
                  console.error(`mobileAuthenticate, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
                  callback(100, 'mobileAuthenticate', `微信临时登录态已过期，请重新登录(${inretcode})`);
                }
              } else {
                console.error(`mobileAuthenticate, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
                callback(100, 'mobileAuthenticate', `请求微信手机授权失败，请稍候再试(${retcode})`);
              }
            };
            const _fail = function (res1) {
              console.error('mobileAuthenticate, AccountGateway请求失败');
              callback(100, 'mobileAuthenticate', '请求微信手机授权失败，请稍候再试(900)');
            };
            cwx.request(loginCommon.getGatewayRequestObj(loginCommon.mobileAuthenticate, data, _success, _fail));
          } else {
            // 用户拒绝手机授权
            console.warn('用户拒绝微信手机号授权，请重新授权');
            callback(100, 'mobileAuthenticate', '用户拒绝微信手机号授权，请重新授权');
          }
        },
        fail() {
          console.warn('mobileAuthenticate, checkSession结果为：无效');
          self.loginNow((resCode, funtionName, errorMsg) => {
          });
          callback(100, 'mobileAuthenticate', 'checkSession检查session已过期，请稍后再试(900)');
        },
      });
    }
  },

  // 根据mobileToken获取uid
  getUidByMobileToken(mobileToken, callback) {
    const self = this;
    self.sourceId = '55552689';
    self.getUidByMobileTokenNew(mobileToken, true, callback);
  },

  // 根据mobileToken获取uid
  getUidByMobileTokenSourceId(mobileToken, context, callback) {
    const self = this;
    self.sourceId = '55552689';
    if (context) {
      if (context.pageid) {
        self.pageId = `${context.pageid}`;
      }
      if (context.pageurl) {
        self.pageUrl = `${context.pageurl}`;
      }
      if (context.sourceid) {
        self.sourceId = `${context.sourceid}`;
      }
    }
    self.getUidByMobileTokenNew(mobileToken, true, callback);
  },

  // 根据mobileToken获取uid
  getUidByMobileTokenNew(mobileToken, autoLogin, callback) {
    const self = this;
    const data = {
      AccountHead: {},
      Data: {
        token: mobileToken,
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        const inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          const { uid } = result;
          console.log(`getUidByMobileToken, 请求成功, 请求（绑定）登录, uid:${uid}`);
          if (autoLogin) {
            self.mobileTokenLogin(mobileToken, callback);
          } else {
            callback(0, 'getUidByMobileToken', '已绑定', uid);
          }
        } else if (inretcode == 550001) {
          console.log('getUidByMobileToken, 请求成功, 请求注册并（绑定）登录');
          if (autoLogin) {
            self.userRegisterByToken(mobileToken, callback);
          } else {
            callback(1, 'getUidByMobileToken', '手机号未绑定uid');
          }
        } else {
          console.error(`getUidByMobileToken, 请求成功, 返回码无法处理, inretcode:${inretcode}`);
          callback(100, 'getUidByMobileToken', `请求手机Token获取Uid失败，请稍候再试(${retcode})`);
        }
      } else {
        console.error(`getUidByMobileToken, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
        callback(100, 'getUidByMobileToken', `请求手机Token获取Uid失败，请稍候再试(${retcode})`);
      }
    };
    const _fail = function (res1) {
      console.error('getUidByMobileToken, AccountGateway请求失败');
      callback(100, 'getUidByMobileToken', '请求手机Token获取Uid失败，请稍候再试(900)');
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.getUidByMobileToken, data, _success, _fail));
  },

  // 手机token注册
  userRegisterByToken(mobileToken, callback) {
    const self = this;
    console.log(`userRegisterByToken, mobileToken:${mobileToken}`);
    const data = {
      AccountHead: {},
      Data: {
        accessCode: '8885B588C0CC44DA',
        strategyCode: '963760474EA19816',
        token: mobileToken,
        sourceId: self.sourceId,
        locale: loginCommon.locale,
        extendedProperties: [
          {
            key: 'Platform',
            value: loginCommon.platform,
          },
          {
            key: 'ClientID',
            value: cwx.clientID,
          },
          {
            key: 'locale',
            value: loginCommon.locale,
          },
          {
            key: 'mobileRegisterType',
            value: self.mobileLoginType,
          },
          {
            key: 'thirdConfigCode',
            value: __global.accesscode,
          },
          {
            key: 'page_id',
            value: self.pageId,
          },
          {
            key: 'Url',
            value: self.pageUrl,
          },
          {
            key: 'deviceName',
            value: self.deviceName,
          },
          {
            key: 'OsType',
            value: self.osType,
          },
        ],
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        const inretcode = result ? result.returnCode : '904';
        if (inretcode == 0) {
          console.log(`userRegisterByToken, 请求成功, 注册成功, 请求（绑定）登录, mobileToken:${mobileToken}`);
          self.mobileTokenLogin(mobileToken, callback);
        } else {
          console.error(`userRegisterByToken, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(100, 'userRegisterByToken', `微信绑定手机注册失败，请稍候再试(${inretcode})`);
        }
      } else {
        console.error(`userRegisterByToken, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
        callback(100, 'userRegisterByToken', `微信绑定手机注册失败，请稍候再试(${retcode})`);
      }
    };
    const _fail = function (res1) {
      console.error('userRegisterByToken, AccountGateway请求失败');
      callback(100, 'userRegisterByToken', '微信绑定手机注册失败，请稍候再试(900)');
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.userRegisterByToken, data, _success, _fail));
  },

  // 手机token登录
  mobileTokenLogin(mobileToken, callback) {
    const self = this;
    // 获取系统信息
    if (!self.deviceName || self.deviceName == '') {
      const sys = wx.getSystemInfoSync();
      self.deviceName = `${sys.brand} ${sys.model}`;
    }
    if (!self.osType || self.osType == '') {
      const sys = wx.getSystemInfoSync();
      self.osType = sys.platform;
    }
    const data = {
      AccountHead: {},
      Data: {
        accessCode: 'B6CE8D84FEBBFC0E',
        strategyCode: '85D4BB47E79522CA',
        loginName: '',
        certificateCode: mobileToken,
        extendedProperties: [
          { key: 'clientID', value: cwx.clientID },
          { key: 'Version', value: '1.0' },
          { key: 'Url', value: self.pageUrl },
          { key: 'Platform', value: loginCommon.platform },
          { key: 'locale', value: loginCommon.locale },
          { key: 'page_id', value: self.pageId },
          { key: 'thirdConfigCode', value: __global.accesscode },
          { key: 'mobileLoginType', value: self.mobileLoginType },
          { key: 'deviceName', value: self.deviceName },
          { key: 'OsType', value: self.osType },
        ],
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        var inretcode = result ? result.returnCode : '904';
        if (inretcode == 0) {
          cwx.user.auth = result.ticket;
          const arrays = result.extendedProperties;
          for (let i = 0; i < arrays.length; i++) {
            if (arrays[i].key == 'duid') {
              if (arrays[i].value != 'null' && arrays[i].value != '') {
                cwx.user.duid = arrays[i].value;
              }
            }
          }
          console.log(`mobileTokenLogin, 登录成功，uid:${result.uid},duid:${cwx.user.duid},uuid:${cwx.user.uuid},ticket:${cwx.user.auth}`);
          callback(0, 'mobileTokenLogin', '登录成功');
        } else {
          console.error(`mobileTokenLogin, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(100, 'mobileTokenLogin', `${'登录失败，请重试' + '('}${inretcode})`);
        }
      } else {
        console.error(`mobileTokenLogin, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
        callback(100, 'mobileTokenLogin', `${'登录失败，请重试' + '('}${inretcode})`);
      }
    };
    const _fail = function (res1) {
      console.error('mobileTokenLogin, AccountGateway请求失败');
      callback(100, 'mobileTokenLogin', `${'登录失败，请重试' + '('}${inretcode})`);
    };
    // 组件调用无需记录市场业绩
    // self.setMarketReferralCode(inviteText, false);
    // inviteText = "";
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.userLogin, data, _success, _fail));
  },

  // 手机token抢占式绑定
  mobileTokenSeizeBind(mobileToken, callback) {
    const self = this;
    const data = {
      AccountHead: {},
      Data: {
        accountHead: {
          accessCode: '1AFB25DAC7A8B11E',
          locale: loginCommon.locale,
          platform: loginCommon.platform,
        },
        head: {
          auth: cwx.user.auth,
        },
        operateType: 'newBind',
        token: mobileToken,
        context: {
          ClientID: cwx.clientID,
          thirdConfigCode: __global.accesscode,
        },
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        const inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          console.log(`mobileTokenSeizeBind, 请求成功, 绑定成功, auth:${cwx.user.auth}, token:${mobileToken}`);
          callback(0, 'mobileTokenLogin', '绑定成功');
        } else if (inretcode == 101) {
          console.error(`mobileTokenSeizeBind, 请求成功, 接入代码不能为空, inretcode:${inretcode}`);
          callback(101, 'mobileTokenSeizeBind', '接入代码不能为空');
        } else if (inretcode == 102) {
          console.error(`mobileTokenSeizeBind, 请求成功, 策略代码不能为空, inretcode:${inretcode}`);
          callback(102, 'mobileTokenSeizeBind', '策略代码不能为空');
        } else if (inretcode == 103) {
          console.error(`mobileTokenSeizeBind, 请求成功, uid不能为空(uid可以从auth认证获取), inretcode:${inretcode}`);
          callback(103, 'mobileTokenSeizeBind', 'uid不能为空(uid可以从auth认证获取)');
        } else if (inretcode == 104) {
          console.error(`mobileTokenSeizeBind, 请求成功, Code不能为空, inretcode:${inretcode}`);
          callback(104, 'mobileTokenSeizeBind', 'Code不能为空');
        } else if (inretcode == 201) {
          console.error(`mobileTokenSeizeBind, 请求成功, 策略无效, inretcode:${inretcode}`);
          callback(201, 'mobileTokenSeizeBind', '策略无效');
        } else if (inretcode == 301) {
          console.error(`mobileTokenSeizeBind, 请求成功, uid不存在, inretcode:${inretcode}`);
          callback(301, 'mobileTokenSeizeBind', 'uid不存在');
        } else if (inretcode == 300) {
          console.error(`mobileTokenSeizeBind, 请求成功, 绑定失败  (绑定失败, 无权限), inretcode:${inretcode}`);
          self.checkUnbindMobilePermission(mobileToken, callback);
        } else if (inretcode == 302) {
          console.error(`mobileTokenSeizeBind, 请求成功, code校验失败, inretcode:${inretcode}`);
          callback(302, 'mobileTokenSeizeBind', 'code校验失败');
        } else if (inretcode == 303) {
          console.error(`mobileTokenSeizeBind, 请求成功, 手机号已被绑定其他账号, inretcode:${inretcode}`);
          callback(303, 'mobileTokenSeizeBind', '手机号已被绑定其他账号');
        } else if (inretcode == 304) {
          console.error(`mobileTokenSeizeBind, 请求成功, 账号已经绑定其他手机号, inretcode:${inretcode}`);
          callback(304, 'mobileTokenSeizeBind', '账号已经绑定其他手机号');
        } else {
          console.error(`mobileTokenSeizeBind, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(inretcode, 'mobileTokenSeizeBind', `无法处理的返回码, inretcode:${inretcode}`);
        }
      } else {
        console.error(`mobileTokenSeizeBind, 请求成功, 绑定失败, retcode:${retcode}`);
        callback(retcode, 'mobileTokenSeizeBind', `无法处理的返回码, retcode:${retcode}`);
      }
    };
    const _fail = function (res1) {
      console.error('mobileTokenSeizeBind, 请求失败');
      callback(100, 'mobileTokenSeizeBind', '请求失败');
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.bindOrReBindMobile, data, _success, _fail));
  },

  // 第三方token抢占式绑定
  thirdTokenSeizeBind(thirdToken, callback) {
    const self = this;
    console.log(`thirdSeizeBindByTicket, thirdToken:${thirdToken}`);
    const data = {
      AccountHead: {},
      Data: {
        accountHead: {
          accessCode: 'BCD566376CE8D84F',
          locale: loginCommon.locale,
          platform: loginCommon.platform,
        },
        head: {
          auth: cwx.user.auth,
        },
        token: thirdToken,
        context: {
          ClientID: cwx.clientID,
          thirdConfigCode: __global.accesscode,
        },
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        const inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          console.log(`thirdSeizeBindByTicket, 请求成功, 绑定成功, auth:${cwx.user.auth}, thirdToken:${thirdToken}`);
          callback(0, 'mobileTokenLogin', '绑定成功');
        } else if (inretcode == 420023) {
          console.error(`thirdSeizeBindByTicket, 请求成功, token为空, inretcode:${inretcode}`);
          callback(420023, 'thirdSeizeBindByTicket', 'token为空');
        } else if (inretcode == 420022) {
          console.error(`thirdSeizeBindByTicket, 请求成功, ticket为空, inretcode:${inretcode}`);
          callback(420022, 'thirdSeizeBindByTicket', 'ticket为空');
        } else if (inretcode == 560023) {
          console.error(`thirdSeizeBindByTicket, 请求成功, token失效, inretcode:${inretcode}`);
          callback(560023, 'thirdSeizeBindByTicket', 'token失效');
        } else if (inretcode == 560022) {
          console.error(`thirdSeizeBindByTicket, 请求成功, ticket失效, inretcode:${inretcode}`);
          callback(560022, 'thirdSeizeBindByTicket', 'ticket失效');
        } else if (inretcode == 540001) {
          console.error(`thirdSeizeBindByTicket, 请求成功, UID已绑定相同第三方, inretcode:${inretcode}`);
          callback(540001, 'thirdSeizeBindByTicket', 'UID已绑定相同第三方');
        } else if (inretcode == 540005) {
          console.log('checkUnbindMobilePermission, 请求权限系统成功， 权限不足');
          self.checkUnbindThirdPermission(thirdToken, callback);
        } else {
          console.error(`thirdSeizeBindByTicket, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(inretcode, 'thirdSeizeBindByTicket', `无法处理的返回码, inretcode:${inretcode}`);
        }
      } else {
        console.error(`thirdSeizeBindByTicket, 请求成功, 绑定失败, retcode:${retcode}`);
        callback(retcode, 'thirdSeizeBindByTicket', `无法处理的返回码, retcode:${retcode}`);
      }
    };
    const _fail = function (res1) {
      console.error('thirdSeizeBindByTicket, 请求失败');
      callback(100, 'thirdSeizeBindByTicket', '请求失败');
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.thirdBindByTicket, data, _success, _fail));
  },

  // 查询已登录用户手机号
  getPhoneNumberByTicket(callback) {
    const self = this;
    console.log('getPhoneNumberByTicket');
    const data = {
      AccountHead: {},
      Data: {
        accountHead: {
          locale: loginCommon.locale,
          platform: loginCommon.platform,
        },
        ticket: cwx.user.auth,
        context: [
          { key: 'ClientID', value: cwx.clientID },
          { key: 'thirdConfigCode', value: __global.accesscode },
        ],
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        const inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          console.log(`getPhoneNumberByTicket, 请求成功, 查询成功, auth:${cwx.user.auth}`);
          callback(0, 'getPhoneNumberByTicket', '查询成功', result.bindMobilePhone);
        } else if (inretcode == 420022) {
          console.error(`getPhoneNumberByTicket, 请求成功, Ticket为空, inretcode:${inretcode}`);
          callback(420022, 'getPhoneNumberByTicket', 'Ticket为空');
        } else if (inretcode == 530022) {
          console.error(`getPhoneNumberByTicket, 请求成功, Ticket无效, inretcode:${inretcode}`);
          callback(530022, 'getPhoneNumberByTicket', 'Ticket无效');
        } else if (inretcode == 800) {
          console.error(`getPhoneNumberByTicket, 请求成功, 用户已注销, inretcode:${inretcode}`);
          callback(800, 'getPhoneNumberByTicket', '用户已注销');
        } else {
          console.error(`getPhoneNumberByTicket, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(inretcode, 'getPhoneNumberByTicket', `无法处理的返回码, inretcode:${inretcode}`);
        }
      } else {
        console.error(`getPhoneNumberByTicket, 请求成功, 查询失败, retcode:${retcode}`);
        callback(retcode, 'getPhoneNumberByTicket', `无法处理的返回码, retcode:${retcode}`);
      }
    };
    const _fail = function (res1) {
      console.error('getPhoneNumberByTicket, 请求失败');
      callback(100, 'getPhoneNumberByTicket', '请求失败');
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.getAccountInfoByTicket, data, _success, _fail));
  },

  authenticate(res0, callback) {
    const self = this;
    if (cwx.user.wechatcode == '') {
      console.warn('Authenticate, 未认证携程wechatCode，请稍后再试');
      self.loginNow();
      callback(100, 'authenticate', '未认证携程wechatCode，请稍后再试(900)');
    } else {
      wx.checkSession({
        success() {
          console.log('authenticate, checkSession结果为：有效');
          if (
              // open-type为getUserInfo获取匿名用户信息+正常加密openid unionid的途径
              (res0 && res0.detail && res0.detail.errMsg === 'getUserInfo:ok')
              // wx.getUserProfile获取用户信息+正常加密openid unionid的途径
              || (res0 && res0.errMsg === 'getUserProfile:ok')
          ) {
            // 是否是通过getUserInfo进来的
            const isGetUserInfo = res0 && res0.detail && res0.detail.errMsg === 'getUserInfo:ok';

            // 不同api数据结构不同
            const encryptedData = isGetUserInfo ? res0.detail.encryptedData : res0.encryptedData;
            const iv = isGetUserInfo ? res0.detail.iv : res0.iv;
            console.log(`authenticate, uuid:${cwx.user.uuid},encryptedData:${encryptedData},iv:${iv}`);

            const data = {
              AccountHead: {},
              Data: {
                authCode: cwx.user.wechatcode,
                thirdType: 'wechat_app',
                thirdConfigCode: __global.accesscode,
                context: { encryptedData, iv, uuid: cwx.user.uuid },
              },
            };
            const _success = function (res1) {
              const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
              if (retcode == 0) {
                const result = JSON.parse(res1.data.Result);
                var inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
                if (inretcode == 0) {
                  console.log(`authenticate, 请求成功, token:${result.token}`);
                  callback(0, 'authenticate', '获取第三方token成功', result.token);
                } else if (inretcode == 550025) {
                  console.warn('authenticate, 请求成功, wechatcode已过期');
                  callback(550025, 'authenticate', `微信临时登录态已过期，请重新登录(${inretcode})`);
                } else {
                  console.error(`authenticate, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
                  callback(100, 'authenticate', `微信临时登录态已过期，请重新登录(${inretcode})`);
                }
              } else {
                console.error(`authenticate, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
                callback(100, 'authenticate', `微信临时登录态已过期，请重新登录(${inretcode})`);
              }
            };
            const _fail = function (res1) {
              console.error('authenticate, AccountGateway请求失败');
              callback(100, 'authenticate', '请求微信手机授权失败，请稍候再试(900)');
            };
            cwx.request(loginCommon.getGatewayRequestObj(loginCommon.authenticate, data, _success, _fail));
          } else {
            // 用户拒绝用户信息授权
            console.warn('用户拒绝微信公开信息授权，请重新授权');
            callback(100, 'authenticate', '用户拒绝微信公开信息授权，请重新授权');
          }
        },
        fail() {
          console.log('Authenticate, checkSession结果为：无效');
          self.loginNow();
          callback(100, 'mobileAuthenticate', 'checkSession检查session已过期，请稍后再试(900)');
        },
      });
    }
  },

  // 第三方token登录
  thirdTokenLogin(thirdToken, callback) {
    const self = this;
    // 获取系统信息
    if (!self.deviceName || self.deviceName == '') {
      const sys = wx.getSystemInfoSync();
      self.deviceName = `${sys.brand} ${sys.model}`;
    }
    if (!self.osType || self.osType == '') {
      const sys = wx.getSystemInfoSync();
      self.osType = sys.platform;
    }
    const data = {
      AccountHead: {},
      Data: {
        accountHead: {
          locale: loginCommon.locale,
          platform: loginCommon.platform,
        },
        token: thirdToken,
        extendedProperties: {
          clientID: cwx.clientID,
          page_id: self.pageId,
          Url: self.pageUrl,
          thirdConfigCode: __global.accesscode,
          deviceName: self.deviceName,
          OsType: self.osType,
        },
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        var inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          cwx.user.auth = result.ticket;
          cwx.user.duid = result.extendedProperties.duid;
          console.log(`thirdTokenLogin, 登录成功，uid:${result.uid},duid:${cwx.user.duid},uuid:${cwx.user.uuid},ticket:${cwx.user.auth}`);
          callback(0, 'thirdTokenLogin', '登录成功');
        } else {
          console.error(`thirdTokenLogin, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(100, 'thirdTokenLogin', `${'登录失败，请重试' + '('}${inretcode})`);
        }
      } else {
        console.error(`thirdTokenLogin, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
        callback(100, 'thirdTokenLogin', `${'登录失败，请重试' + '('}${inretcode})`);
      }
    };
    const _fail = function (res1) {
      console.error('thirdTokenLogin, AccountGateway请求失败');
      callback(100, 'thirdTokenLogin', `${'登录失败，请重试' + '('}${inretcode})`);
    };
    // self.setMarketReferralCode(inviteText, false);
    // inviteText = "";
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.thirdPartyLogin, data, _success, _fail));
  },

  // 校验手机token解绑权限
  checkUnbindMobilePermission(mobileToken, callback) {
    const self = this;
    const data = {
      AccountHead: {},
      Data: {
        accountHead: {
          locale: loginCommon.locale,
          platform: loginCommon.platform,
        },
        checkMode: 'checkMobile',
        context: {
          clientID: cwx.clientID,
          thirdConfigCode: __global.accesscode,
          deviceName: self.deviceName,
          OsType: self.osType,
          mobileToken,
        },
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        var inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          console.log('checkUnbindMobilePermission, 请求权限系统成功， 有权限');
          callback(0, 'checkUnbindMobilePermission', '有权限');
        } else if (inretcode == 500) {
          console.log('checkUnbindMobilePermission, 请求权限系统成功， 权限不足');
          callback(500, 'checkUnbindMobilePermission', '权限不足', result.results);
        } else {
          console.error(`checkUnbindMobilePermission, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(100, 'checkUnbindMobilePermission', `${'请求权限系统成功， 请重试' + '('}${inretcode})`);
        }
      } else {
        console.error(`checkUnbindMobilePermission, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
        callback(100, 'checkUnbindMobilePermission', `${'请求权限系统成功, 请重试' + '('}${inretcode})`);
      }
    };
    const _fail = function (res1) {
      console.error('checkUnbindMobilePermission, AccountGateway请求失败');
      callback(100, 'checkUnbindMobilePermission', `${'请求权限系统成功，请重试' + '('}${inretcode})`);
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.checkPermission, data, _success, _fail));
  },

  // 校验手机token解绑权限
  checkUnbindThirdPermission(thirdToken, callback) {
    const self = this;
    const data = {
      AccountHead: {},
      Data: {
        accountHead: {
          locale: loginCommon.locale,
          platform: loginCommon.platform,
        },
        checkMode: 'thirdPartBindSeize',
        context: {
          clientID: cwx.clientID,
          thirdConfigCode: __global.accesscode,
          deviceName: self.deviceName,
          OsType: self.osType,
          thirdToken,
        },
      },
    };
    const _success = function (res1) {
      const retcode = (res1 && res1.data) ? res1.data.ReturnCode : '904';
      if (retcode == 0) {
        const result = JSON.parse(res1.data.Result);
        var inretcode = (result && result.resultStatus) ? result.resultStatus.returnCode : '904';
        if (inretcode == 0) {
          console.log('checkUnbindMobilePermission, 请求权限系统成功， 有权限');
          callback(0, 'checkUnbindMobilePermission', '有权限');
        } else if (inretcode == 500) {
          console.log('checkUnbindMobilePermission, 请求权限系统成功， 权限不足');
          callback(500, 'checkUnbindMobilePermission', '权限不足', result.results);
        } else {
          console.error(`checkUnbindMobilePermission, 请求成功, 无法处理的返回码, inretcode:${inretcode}`);
          callback(100, 'checkUnbindMobilePermission', `${'请求权限系统成功， 请重试' + '('}${inretcode})`);
        }
      } else {
        console.error(`checkUnbindMobilePermission, 请求成功, 无法处理AccountGateway的返回码, retcode:${retcode}`);
        callback(100, 'checkUnbindMobilePermission', `${'请求权限系统成功, 请重试' + '('}${inretcode})`);
      }
    };
    const _fail = function (res1) {
      console.error('checkUnbindMobilePermission, AccountGateway请求失败');
      callback(100, 'checkUnbindMobilePermission', `${'请求权限系统成功，请重试' + '('}${inretcode})`);
    };
    cwx.request(loginCommon.getGatewayRequestObj(loginCommon.checkPermission, data, _success, _fail));
  },

};

export default LoginBase;

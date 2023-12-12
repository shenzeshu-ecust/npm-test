import { __global, cwx } from '../../../cwx/cwx';

const loginCommon = {
  // 100013285 Authenticate 解密用户信息换取token
  authenticate: 'soa2/14553/authenticate.json',
  // 100013285 MobileAuthenticate 解密手机信息换取token
  mobileAuthenticate: 'soa2/14553/mobileAuthenticate.json',
  // 100013285 WechatLogin 微信code换取sessionkey
  wechatLogin: 'soa2/14553/wechatLogin.json',
  // 100008237 GetUidByThirdToken 使用thirdToken取uid
  getUidByThirdToken: 'soa2/13191/getUidByThirdToken.json',
  // 100008237 GetUidByMobileToken 使用mobileToken取uid
  getUidByMobileToken: 'soa2/13191/getUidByMobileToken.json',
  // 100005874 ThirdPartyLogin 使用thirdToken登录
  thirdPartyLogin: 'soa2/12559/thirdPartyLogin.json',
  // 100005286 UserRegisterByToken 使用mobileToken注册
  userRegisterByToken: 'soa2/12343/userRegisterByToken.json',
  // 100006499 ThirdBindByMobileToken 将第三方账号绑定到手机账户
  thirdBindByMobileToken: 'soa2/12715/thirdBindByMobileToken.json',
  // 100005874 UserLogin 使用mobileToken登录
  userLogin: 'soa2/12559/userLogin.json',
  // 100003020 checkPhoneCode 校验手机动态码
  checkPhoneCode: 'soa2/11448/checkPhoneCode.json',
  // 100003020 sendMessageByPhone 获取手机动态码
  sendMessageByPhone: 'soa2/11448/sendMessageByPhoneLogin.json',
  // 100006499 bindOrReBindMobile 抢占绑定或改绑手机
  bindOrReBindMobile: 'soa2/12715/bindOrReBindMobile.json',
  // 100006499 thirdBindByTicket 通过ticket绑定第三方(可配置为抢占式)
  thirdBindByTicket: 'soa2/12715/thirdBindByTicket.json',
  // 100008237 getAccountInfoByTicket 查询用户信息
  getAccountInfoByTicket: 'soa2/13191/getAccountInfoByTicket.json',
  // 100008237 checkPermission 校验权限
  checkPermission: 'soa2/13191/checkPermission.json',
  locale: 'zh_CN',
  platform: 'MINIAPP',

  getRequestObject(urlName, dataobj, successback, failback) {
    const param = {};
    const host = this.getRequestHost();
    console.log(`host:${host}`);
    param.url = `${host}/restapi/${urlName}`;
    param.data = dataobj;
    param.success = successback;
    param.fail = failback;
    console.log(param);
    return param;
  },

  getGatewayRequestObj(urlName, dataobj, successback, failback) {
    const param = {};
    const host = this.getGatewayRequestHost();
    console.log(`host:${host}`);
    param.url = `${host}/gateway/api/${urlName}`;
    param.data = dataobj;
    param.success = successback;
    param.fail = failback;
    console.log(param);
    return param;
  },

  getGatewayRequestHost() {
    const { env } = __global;
    let host = '';
    if (env.toLowerCase() === 'fat') {
      host = 'http://passport.fat466.qa.nt.ctripcorp.com';
    } else if (env.toLowerCase() === 'uat') {
      host = 'http://passport.ctrip.uat.qa.nt.ctripcorp.com';
    } else if (env.toLowerCase() === 'prd') {
      host = 'https://passport.ctrip.com';
    }

    return host;
  },

  getRequestHost() {
    const { env } = __global;
    let host = '';
    if (env.toLowerCase() === 'fat') {
      host = 'https://gateway.m.fws.qa.nt.ctripcorp.com';
    } else if (env.toLowerCase() === 'uat') {
      host = 'https://gateway.m.uat.qa.nt.ctripcorp.com';
    } else if (env.toLowerCase() === 'prd') {
      host = 'https://m.ctrip.com';
    }
    return host;
  },
};

export {
  __global,
  loginCommon,
  cwx
};

import { cwx, __global } from '../cwx/index';
import { colorConfigWithAppid } from './bus.colorConfig';

const extConfig = cwx.getExtConfigSync ? cwx.getExtConfigSync() : {};
const appid = __global.customAppId || __global.appId;
const styleAppId = __global.styleAppId || __global.appId;

var busHeaderMap = {
  SHAXY: {
    'x-ctx-CanaryReq': '1',
    'x-ctx-CanaryIdc': 'SHAXY',
  },
  SHARB: {
    'x-ctx-CanaryReq': '1',
    'x-ctx-CanaryIdc': 'SHARB',
  },
  SHAOY: {
    'x-ctx-CanaryReq': '1',
    'x-ctx-CanaryIdc': 'SHAXY',
  },
};

let headerControl = wx.getStorageSync('BUS_:HEADER_CONTROL');

var BusConfig = {
  wx0e6ed4f51db9d078: {
    //主版
    app: 'ctrip',
    // big_channel: 'bus',
    big_channel: 'ctripwx',
    // "smallchannel": "",
    smallchannel: 'ctripwx',
    suffix: '--wx',
    // "big_client_type": 'rn',
    big_client_type: 'wechatxcx',
    client_version: '4.0.5',
    report_submit: false,
    showBottomBar: true,
    supportAuthInfo: true,
    supportAfterPay: true,
    showSlogan: 1,
    showRecommend: 1,
    usingPayComponents: false,
    appName: '携程',
    busHeaderMap: busHeaderMap,
    headerControl: headerControl,
    traceType: 'ctripwxxcx',
    supportOcrComponent: true,
    displayPrivacyPolicy: false,
  },
  2017081708237081: {
    //支付宝
    app: 'ctrip',
    big_channel: 'ctripali',
    smallchannel: 'ctripali',
    suffix: '--alipay',
    big_client_type: 'alixcx',
    client_version: '1.1.0',
    report_submit: false,
    showBottomBar: true,
    showSlogan: 1,
    showRecommend: 1,
    usingPayComponents: false,
    appName: '携程',
    traceType: 'ctripalixcx',
  },
  11048657: {
    app: 'ctrip', //百度
    big_channel: 'ctripbd',
    smallchannel: ':ctripbd',
    suffix: '--baidu',
    big_client_type: 'wechatxcx',
    client_version: '1.0.0',
    report_submit: false,
    showBottomBar: true,
    supportAuthInfo: false,
    showSlogan: 1,
    showRecommend: 0,
    usingPayComponents: false,
    appName: '携程',
    traceType: 'ctripbdxcx',
  },
  100252857: {
    //主版
    app: 'ctrip', //快应用
    // "big_channel": "bus",
    big_channel: 'ctripqck',
    // "smallchannel": "",
    smallchannel: 'ctripqck',
    suffix: '--qck',
    // "big_client_type": 'rn',
    big_client_type: 'wechatxcx',
    client_version: '3.3.5',
    report_submit: false,
    showBottomBar: true,
    supportAuthInfo: false,
    showSlogan: 1,
    showRecommend: 1,
    usingPayComponents: false,
    appName: '携程',
    busHeaderMap: busHeaderMap,
    headerControl: headerControl,
    supportAfterPay: false,
    traceType: 'ctripqckxcx',
  },
  wx1746b19d13d9bbe7: {
    //汽车票大管家
    app: 'ctrip',
    // "big_channel": "bus",
    big_channel: 'ctripwx',
    // "smallchannel": "",
    smallchannel: 'ctripwx',
    suffix: '--wx-bus',
    // "big_client_type": 'rn',
    big_client_type: 'wechatxcx',
    client_version: '4.0.5',
    report_submit: false,
    showBottomBar: true,
    supportAuthInfo: false,
    showSlogan: 1,
    showRecommend: 1,
    usingPayComponents: false,
    appName: '汽车票大管家',
    supportAfterPay: true,
    traceType: 'ctripwxdgj',
    displayPrivacyPolicy: true,
    displayLogout: true,
  },
};

function configWithAppid(appid, styleAppid) {
  var mergedColorConfig = colorConfigWithAppid(styleAppid || appid);
  var appBusConfig = Object.assign(
    BusConfig['wx0e6ed4f51db9d078'],
    mergedColorConfig,
    BusConfig[appid] || {}
  );
  var extBusconfig = {};
  if (extConfig && extConfig.busConfig) {
    extBusconfig = extConfig.busConfig;
  }
  return Object.assign({}, appBusConfig, extBusconfig);
}

const customConfig = function (forceUpdate) {
  var appid = __global.customAppId || __global.appId;
  var styleAppid = __global.styleAppId || __global.appId;
  if (__customConfig && !forceUpdate) {
    return __customConfig;
  } else {
    __customConfig = configWithAppid(appid, styleAppid);
    return __customConfig;
  }
};

let config = configWithAppid(appid, styleAppId);
config.configWithAppid = configWithAppid;
config.customConfig = customConfig;

export default config;

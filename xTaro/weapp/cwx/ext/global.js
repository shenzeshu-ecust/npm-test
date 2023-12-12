let miniappConfig = require('../../config.js'); // 项目配置文件

const DEFAULT_ENV = "prd";
const ENV_STORAGE_KEY = "globalEnvSetting";
const DEFAULT_CANARY = false;
const CANARY_STORAGE_KEY = "NET_CANARY_CACHE"
const DEFAULT_SUBENV = "";
const SUBENV_STORAGE_KEY = "NET_SUBENV_CACHE"
let env = getEnv(DEFAULT_ENV, ENV_STORAGE_KEY);
let useCanary = getCache(DEFAULT_CANARY, CANARY_STORAGE_KEY);
let subEnv = getCache(DEFAULT_SUBENV, SUBENV_STORAGE_KEY);

/**
 * 全局对象global文件
 * @module global
 */
let __global = {
	// 1. 微信宿主环境提供的一些全局变量
	__wxConfig: __wxConfig || {},
	
	// 2. 小程序账号信息（兜底值为 config.js 中配置的值；优先从 wx.getAccountInfoSync() 中获取）
	appId: miniappConfig.appId,
	useProtectComponent: miniappConfig.useProtectComponent,
	version: miniappConfig.version, // 优先取 wx.getAccountInfoSync() 返回的 version（只有正式版小程序中能获取到），其次取 config.js 中配置的值
	cversion: miniappConfig.cversion,
	cwxVersion: miniappConfig.cwxVersion,
	envVersion: 'release', // 优先取 wx.getAccountInfoSync() 返回的 envVersion，其次取 __wxConfig.envVersion；枚举值：develop / trial / release

	// 3. 携程应用信息
	mcdAppId: miniappConfig.mcdAppId,
	extMcdAppId: miniappConfig.extMcdAppId,
	systemCode: miniappConfig.systemCode,
	accesscode: miniappConfig.accesscode,

	// 4. 本小程序的配置
	tabbar: miniappConfig.tabbar,

	// 5. 开发相关配置
    env, // prd uat fat 网络环境 ， 发布前一定要设置为prd
    subEnv,
	useCanary,
	enableEncryptSOA: false, // requestMsgMsgSecurity, 是否加密请求内容，在 cwx.cryptoFetch.js 中用到了
	infoProtectionAuthSwitch: true, // 开启授权弹窗，需要用户授权才能调用指定的 API
	removeStorageCountMax: 10,
	storageKeyWhiteList: [ // todo??? 需要梳理、增删
		'clientID',
		'CTRIP_UBT_M',
		'ABTestingManager', 
		'cwx_market_new', 
		'GS_HOME_HISTORY_CACHE', 
		'GS_DISTRICT_TYPE_INFO_CACHE', 
		'GS_DISTRICT_NEW_USER_GUIDE_CACHE', 
		'GS_DISTRICT_LIST_CACHE', 
		'GS_SEARCH_HISTORIES_CACHE', 
		'GS_HOT_DISTRICTS_CACHE', 
		'P_HOTEL_SESSIONID', 
		'mkt_union', 
		'mkt_bargain_stopOnShow', 
		'P_HOTEL_BOOKROOMDATA', 
		'HOTEL.ROOM.TRACEID', 
		'P_HOTEL_COUPON_LAYER', 
		'P_HOTEL_DETAIL_FILTER', 
		'minpPriceInfo', 
		'P_HOTEL_LIST_QMJ_COUPON', 
		'hotelCities', 
		'P_HOTEL_SELECTED_CITY', 
		'P_HOTEL_CITY_HISTORY_INLAND', 
		'P_HOTEL_CITY_HISTORY_OVERSEA', 
		'P_HOTEL_OVERSEA_ADDRESS', 
		'P_HOTEL_CITY',
		"auth",
		"duid",
	],
	optionsCacheObj: { // todo, 这里的作用要标注下
      'CIDReady': '',
      "OpenIdObserver": '',
	  'appjs_onLaunch_getoptions': '',
	  'appjs_onShow_getoptions': ''
	},
	cwebview: {
		targetPagePath: '/cwx/component/extraCweb/cweb5', // cwebview 跳转的目标页路径兜底值，实际还会异步动态从 MCDConfig 中获取
		sharePagePath: '/cwx/component/extraCweb/cweb7', // cwebview 分享的页面路径兜底值，实际还会异步动态从 MCDConfig 中获取
	},
	scwebview: {
		targetPagePath: '/cwx/component/extraScweb/scweb3',
		sharePagePath: '/cwx/component/extraScweb/scweb4',
	},
	JSErrorWarning: {
		"envVersion":[],
		"extBundleMapping": {
			"commonAPI/cwx": "cwx/ext",
			"commonComponent/captcha": "cwx/component",
			"commonComponent/cwaterfall": "cwx/component",
			"cwx/component": "cwx/component",
			"cwx/cpage": "cwx/cpage",
			"cwx/ext": "cwx/ext",
			"cwx/cwx": "cwx/cwx",
			"pages/thirdPlugin/user": "pages/accounts",
			"pages/thirdPlugin/market": "pages/market",
			"pages/thirdPlugin/pay": "pages/pay",
		},
		"platform":["devtools"]
	},
	ubtConfig: {
		//是否批量接口发送
		isMultiPost: false,
		//批量发送ubt间隔时间
		mpIntervalTime: 2000,
		//批量上报最多同时请求个数
		mpMaxCount: 200,
		//批量上报最大size
		mpMaxSize: 300000,
		//是否上报seqNumber
		isReportSeq: false,
		//可用storage大小
		storageMaxSize: Math.pow(2, 10) * 2,
		//最大本地存储个数
		mpStoreMaxCount: 50,
		//单条ubt最大size
		maxSize: 50000
  },
  timelineUbtMap: {
    "app_onLaunch_1154": "weapp_app_onLaunch_open_in_timeline",
    "app_onLaunch_1155": "weapp_app_onLaunch_open_from_timeline",
    "app_onShow_1154": "weapp_app_onShow_open_in_timeline",
    "app_onShow_1155": "weapp_app_onShow_open_from_timeline"
  },

	// 6. 建议不要修改
	host: 'm.ctrip.com', // 默认都是用这个域名，建议不要修改 (禁止修改)
	uat:'gateway.m.uat.qa.nt.ctripcorp.com', // uat域名
	fat:'gateway.m.fws.qa.nt.ctripcorp.com'  // fat域名
};

Object.defineProperty(__global, "env",
	{
		get: function () {
			return getEnv(DEFAULT_ENV, ENV_STORAGE_KEY);
		}
	}
)

Object.defineProperty(__global, "useCanary",
	{
		get: function () {
			return getCache(DEFAULT_CANARY, CANARY_STORAGE_KEY);
		}
	}
)

Object.defineProperty(__global, "subEnv",
	{
		get: function () {
			return getCache(DEFAULT_SUBENV, SUBENV_STORAGE_KEY);
		}
	}
)

function getEnv (defaultVal, storageKey) {
  try {
    let _env = wx.getStorageSync(storageKey);
    if (_env != null && _env.length) {
      // console.log("%c 获取的 env 是本地缓存", "color:red", _env);
      return _env;
    }
  } catch (e) {
    console.error(e);
  }
  // console.log("%c 获取的 env 是默认值 prd", "color:red");
  return defaultVal; // 注意！如果需要强制设置环境变量的话，直接修改这里
}

/**
 * 从本地缓存获取 网络环境 (env) 和 堡垒 (canary) 数据，有默认的兜底值
 * 缓存： JSON.stringify 后的 { value: "", expiration: 13位时间戳（字符串类型） }
 * todo??? getEnv 和 setEnv 都写到这里
 */
function getCache (defaultVal, storageKey) {
  let result = defaultVal;
  try {
    let cache = wx.getStorageSync(storageKey);
	// console.log("%c [getCache] cache", "color:red", cache);

    // 有缓存
    if (cache) {
      try {
        if (typeof cache === "string" && cache.length) {
          cache = JSON.parse(cache);
          // 值有效 且 在有效期内（固定有效期为从手动设置起的 1 小时内）
          let { val = "", expire = 0 } = cache;
          if (typeof val === "string" && val.length && expire > new Date().getTime()) {
            // console.log("%c [getCache] 获取的是本地缓存", "color:red", val);
            return val;
          }
        }
        console.log("%c [getCache] 本地缓存值无效 或 过期了，即将清除缓存", "color:red", cache);
        wx.removeStorage({
          key: storageKey,
          success (res) {
            console.log(res)
          },
          fail (err) {
            console.error(err)
          }
        })
      } catch (err) {
        console.error(err);
      }
    }
  } catch (e) {
    console.error(e)
  }
//   console.log("%c [getCache] 返回值", "color:red", result);
  return result;
}

try {
	const accountInfo = wx.getAccountInfoSync();
	console.log('当前帐号信息：', accountInfo);
	if(accountInfo.miniProgram) {
		if (accountInfo.miniProgram.appId !== __global.appId) {
			console.error("当前帐号信息中的 appid 为：", accountInfo.miniProgram.appId);
			console.error("项目根目录 config.js 中配置的 appid 为：", __global.appId);
			console.error('请检查项目根目录的 config.js, project.config.json 中配置的 appid 是否正确！')
		}
		__global.appId = accountInfo.miniProgram.appId || __global.appId;
		__global.envVersion = accountInfo.miniProgram.envVersion || __wxConfig.envVersion || __global.envVersion;
		__global.version = accountInfo.miniProgram.version || __global.version;
		let vArr = __global.version.split('.');
		if(vArr.length === 3) {
			// version 转 cversion 的规则： 第一位保持， 第二位2位数，不足头部补0， 第三个是三位数，不足也补0
			vArr = vArr.map(function (item, index) {
				if (index + 1 < item.length) {
					return item;
				}
				return "0".repeat(index + 1 - item.length) + item; // 前缀补0操作
			})
			__global.cversion = `${vArr[0] + vArr[1]}.${vArr[2]}`; 
		}
	}
	console.log('appId:', __global.appId);
	console.log('小程序运行环境类型:', __global.envVersion);
	console.log('小程序代码包版本: ', __global.version);
	console.log('cversion: ', __global.cversion);
} catch (e) {
}

export default __global;

// @doc: https://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=3708
import { cwx, __global } from "../cwx.js";
const defaultInterval = 60000; // 循环请求 MCD 配置的间隔

/**
 * 从MCD下发配置参数
 * @module cwx/config
 */
let refreshStore = function (callback) {
  if (config.isRefreshNow != true) {
    config.isRefreshNow = true;
    let params = {
      appId: cwx.mcdAppId,
      categoryList: config.keys, // ["LBS"],
      platform: 2,
      head: {
        cid: cwx.clientID,
        cver: __global.cversion,
        sid: "8061",
        syscode: cwx.systemCode,
      },
    };
    cwx.request({
      url: "/restapi/soa2/12378/json/GetAppConfig",
      isNotCheckSensitive: true,
      method: "POST",
      data: params,
      success: function (res) {
        //setTimeout(function(){
        config.isRefreshNow = false;
        let newStore = {};
        if (res.data && res.data.configList) {
          res.data.configList.forEach(function (item) {
            try {
              newStore[item.configCategory] = JSON.parse(item.configContent);
            } catch (e) {
              newStore[item.configCategory] = item.configContent;
            }
          });
          config.lastModified = +new Date();

          callback && callback(JSON.parse(JSON.stringify(newStore)));

          for (let k in newStore) {
            try {
              let oldVal = config.store[k]
                ? JSON.stringify(config.store[k])
                : "";
              let newVal = newStore[k] ? JSON.stringify(newStore[k]) : "";

              if (oldVal != newVal) {
                config.watchDirty[k] = JSON.parse(JSON.stringify(newStore[k]));
                if (k in config.watchFn) {
                  config.watchFn[k] && config.watchFn[k](config.watchDirty[k]);
                  delete config.watchDirty[k];
                }
              }
            } catch (e) {
              //
            } finally {
              config.store[k] = newStore[k];
            }
          }
        }
        //}, 2000)
      },
      fail: function (res) {
        config.isRefreshNow = false;
        config.logError("wxapp_getConfigFail", "");
      },
    });
  }else{
    callback && callback(config.store);
  }
};

let logError = function (type, msg) {
  let params = {
    ac: "tl",
    pi: "212044",
    key: type,
    val: msg,
    pv: "1497592824873.1w6agx.280.32764",
    v: "6",
    env: "weixin",
    _mt: "jakomjwclpoq9",
    t: +new Date(),
  };
  let add = [];
  for (let p in params) {
    add.push(p + "=" + encodeURIComponent(params[p]));
  }
  wx.request({
    url: "https://s.c-ctrip.com/bf.gif?" + add.join("&"), // todo??? 要改成跟支付宝一样吗？待确认
  });
};

let get = function (key, callback) {
  if (config.keys.indexOf(key) > -1) {
    //
  } else {
    config.keys.push(key);
  }
  config.refreshStore(function (data = {}) {
    callback(data[key]);
  });
};

let watch = function (key, callback) {
  config.watchFn[key] = callback;
  if (key in config.watchDirty) {
    callback && callback(config.watchDirty[key]);
    delete config.watchDirty[key];
  } else if (key in config.store) {
    callback && callback(config.store[key]);
  }
  config.refreshStore();
};

let run = function () {
  config.refreshStore();
  if (config.timer) {
    clearInterval(config.timer);
  }
  config.timer = setInterval(function () {
    //console.error('compare config');
    config.refreshStore();
  }, defaultInterval);
};

let config = {
  store: {},
  keys: [
    "cwxCalendar",
    "infoProtectionAuth",
    "requestMsgSecurity",
    "updateManager",
    "JSErrorWarning",
    "scwebviewTarget",
    "cwebviewTarget",
    "cwxLocate",
    "sensitiveWords",
    "WeixinWebviewDomain",
    "lbsnew",
    "homeBgColor",
    "tips",
    "More",
    "ubtConfig",
    "tripShoot",
    "sightDetail",
    "collectFnInfo",
    "coffeebeanConfig"
  ],
  watchFn: {},
  watchDirty: {},
  isRefreshNow: false,
  lastModified: +new Date(),
  refreshStore: function (callback) {
    refreshStore(callback);
  },
  logError: function (type, msg) {
    logError(type, msg);
  },
  get: function (key, callback) {
    get(key, callback);
  },
  watch: function (key, callback) {
    watch(key, callback);
  },
  run: function () {
    run();
  },
};

export default config;

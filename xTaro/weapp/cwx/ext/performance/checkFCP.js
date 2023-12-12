// 小程序性能采集：FCP, TTI
// 1. 从调用 路由 API 开始，创建 guid，添加到 url 上，通过 url 传递
// 2. 跳转到目标页时，onLoad 中拿到 options，options 中有 fcpGUID，然后从 fcpCache 中用 fcpGUID 来取值，并继续添加属性值
// 3. 记录页面 onLoad、onShow、onReady
// 4. onReady 时发送埋点

import { cwx, __global } from "../../cwx";
import { addQueryToOptUrl, createGUID, checkValidGUID, getCommonInfo } from "./util"

const FCP_PREIFX = "fcp";
let fcpCache = {};

/**
 * 供 cwx 的路由 API 使用：缓存页面路由信息、给 options.url 添加公共参数
 * @param { string } apiName 路由API的名字
 * @param { object } options 这里的 options 是 路由API 的入参
 * @return { object } options 处理后的 options
 */
export const createRouteBegin = function (apiName, options) {
  const routeBegin = Date.now();
  const fcpGUID = createGUID(`${FCP_PREIFX}_${apiName}`);
  fcpCache[fcpGUID] = {
    routeBegin, // 路由开始时间
    routeType: apiName,
    from: cwx.getCurrentPageRouter(), // 来源页面, todo, 取值方式是否可以进一步优化
  }
  // 给 options 添加 fcpGUID, pubRouteBegin
  options = addQueryToOptUrl(options, {
    fcpGUID,
    pubRouteBegin: routeBegin // 公开给 BU 用的
  })
  // console.log(`%c [createBegin] options:`, 'color:#0f0;')
  // console.log(options)
  return options;
}

/**
 * 在小程序应用启动时 (cwx.setup里) 调用
 * 注意！！！ switchTab 因为 url 不能带参数，所以拿不到 fcpGUID，也计算不了 FCP
 */
export const checkFCP = function () {
  cwx.Observer.addObserverForKey("cpage_onLoad", function (options) {
    try {
      let {
        fcpGUID,
        __pageType,
        pagePath,
        bridgeGUID, // webview 内嵌 h5 特有：bridge.js 拼接的
        bridgeRoute, // webview 内嵌 h5 特有：bridge.js 拼接的
        pubRouteBegin
      } = options || {};
      if (bridgeGUID) {
        fcpCache[bridgeGUID] = {
          routeBegin: pubRouteBegin, // 路由开始时间
          routeType: bridgeRoute,
          from: "h5", // 来源页面, todo, 取值方式是否可以进一步优化
          to: pagePath, // 目标页面路径，不带参数
          onLoad: Date.now() - pubRouteBegin,
          pageType: __pageType
        }
        return;
      }

      if (!checkValidGUID(fcpGUID, fcpCache)) {
        return;
      }
      
      fcpCache[fcpGUID]["to"] = pagePath; // 目标页面路径，不带参数
      fcpCache[fcpGUID]["onLoad"] = Date.now() - fcpCache[fcpGUID]["routeBegin"];
      fcpCache[fcpGUID]["pageType"] = __pageType;
      // console.log("%c --- cpage_onLoad", "color:#0f0");
      // console.log(fcpCache[fcpGUID]);
    } catch (e) {
      console.error("cpage_onLoad checkFCP error:", e)
    }
  });

  cwx.Observer.addObserverForKey("cpage_onShow", function (options) {
    try {
      let {
        fcpGUID,
        bridgeGUID
      } = options || {};
      if (checkValidGUID(bridgeGUID, fcpCache)) {
        fcpCache[bridgeGUID]["onShow"] = Date.now() - fcpCache[bridgeGUID]["routeBegin"];
        return;
      }

      if (!checkValidGUID(fcpGUID, fcpCache)) {
        return;
      }
      fcpCache[fcpGUID]["onShow"] = Date.now() - fcpCache[fcpGUID]["routeBegin"];
      // console.log("%c --- cpage_onShow", "color:#0f0");
      // console.log(fcpCache[fcpGUID]);
    } catch (e) {
      console.error("cpage_onShow checkFCP error:", e);
    }
  });

  cwx.Observer.addObserverForKey("cpage_onReady", function (options) {
    try {
      let {
        fcpGUID,
        bridgeGUID
      } = options || {};
      if (checkValidGUID(bridgeGUID, fcpCache)) {
        fcpCache[bridgeGUID]["onReady"] = Date.now() - fcpCache[bridgeGUID]["routeBegin"];
        
        sendUbt(bridgeGUID);
        delete fcpCache[bridgeGUID];
        return;
      }

      if (!checkValidGUID(fcpGUID, fcpCache)) {
        return;
      }
      fcpCache[fcpGUID]["onReady"] = Date.now() - fcpCache[fcpGUID]["routeBegin"];
      // console.log("%c --- cpage_onReady ", "color:#0f0");
      // console.log(fcpCache[fcpGUID]);
      // console.log(Date.now());
      sendUbt(fcpGUID);
      delete fcpCache[fcpGUID];
    } catch (e) {
      console.error("cpage_onReady checkFCP error:", e);
    }
  });
}

function sendUbt(fcpGUID) {
  try {
    let {
      pageType,
      routeBegin, // 路由开始时间
      routeType, // 路由类型
      from, // 来源页面路径
      to, // 目标页面路径
      onLoad,
      onShow,
      onReady,
    } = fcpCache[fcpGUID];
    // 组合数据
    let ubtData = {
      pageType, // 页面类型
      routeBegin, // 路由开始时间
      routeType,
      from, // 来源页面路径
      to, // 目标页面路径
      onLoad,
      onShow,
      onReady
    }
    // console.log("%c ------ [checkFCP.js] o_miniapp_page_show ------", "color:#0f0");
    // console.log(ubtData);

    cwx.sendUbtByPage.ubtMetric({
      name: "o_miniapp_page_show",
      tag: Object.assign(ubtData, getCommonInfo()),
      value: ubtData.onReady || 0
    });
  } catch (e) {
    console.error("sendUbt checkWhiteScreen error:", e)
  }
}

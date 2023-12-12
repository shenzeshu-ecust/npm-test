import {cwx, __global} from "../../cwx";
import { createGUID, checkValidGUID, getCommonInfo } from "./util"

const PAGE_LIFE_TOO_SHORT = 2000;
const WHITESCREEN_PREIFX = "whiteScreen";

let whiteScreenCache = {};

export const initWhiteScreen = function () {
    const guid = createGUID(WHITESCREEN_PREIFX);
    whiteScreenCache[guid] = {};
    return guid;
}

const calculateWhiteDuration = function (currentWhite) {
  const now = Date.now();
  // 在 Hide 期间 ready 或 onUnload
  currentWhite.whiteWaitDuration = (now - currentWhite.__onLoadTime) - currentWhite.pageHideDuration;
  if (currentWhite.pageHideBegin) {
    currentWhite.whiteWaitDuration = currentWhite.whiteWaitDuration - (now - currentWhite.pageHideBegin);
  }
}

/**
 * 已添加到 原生页面 和 Taro页面 的基类上
 * CSS 动画完成时触发，表示视图层初始化好了
 * @param guid
 */
export const handleViewReadyEvent = function (guid) {
//   console.log("%c ------ handleViewReadyEvent ------ ", "color:#0f0");
  if (checkValidGUID(guid, whiteScreenCache)) {
    const currentWhite = whiteScreenCache[guid];
    // console.log(currentWhite);
    calculateWhiteDuration(currentWhite);
    currentWhite.__viewIsReady = true;
    currentWhite.viewReadyTimeStamp = Date.now();
  }
}

/**
 * 在小程序应用启动时 (cwx.setup里) 调用
 */
export const checkWhiteScreen = function () {
    cwx.Observer.addObserverForKey("cpage_onLoad", function (options) {
        try {
            let {whiteScreenGUID, pagePath, __pageType} = options || {};
            if (!checkValidGUID(whiteScreenGUID, whiteScreenCache)) {
                return;
            }
            whiteScreenCache[whiteScreenGUID] = {
                pagePath, // 页面路径
                pageType: __pageType, // 页面的开发方式类型，枚举值: "origin", "taro"
                __onLoadTime: Date.now(), // onLoad 触发时的时间戳
                pageHideBegin: null, // onHide 标志位，时间戳
                pageHideDuration: 0, // onHide 累加时长
                __viewIsReady: false, // 视图层是否初始化完成
                viewReadyTimeStamp: 0, // 视图层初始化完成的时间戳
                whiteWaitDuration: 0, // 用户看到的白屏时长
            }
        } catch (e) {
            console.error("cpage_onLoad checkWhiteScreen error:", e)
        }
    });

    cwx.Observer.addObserverForKey("cpage_onShow", function (options) {
        try {
            let { whiteScreenGUID } = options || {};
            if (!checkValidGUID(whiteScreenGUID, whiteScreenCache)) {
                return;
            }
            const currentWhite = whiteScreenCache[whiteScreenGUID];
            
            // 重置 Hide 状态，累加 Hide 时长
            if (currentWhite.pageHideBegin) {
                currentWhite.pageHideDuration += Date.now() - currentWhite.pageHideBegin;
                currentWhite.pageHideBegin = null;
            }
            // console.log("%c --- cpage_onShow ", "color:#0f0");
            // console.log(currentWhite);
        } catch (e) {
            console.error("cpage_onHide checkWhiteScreen error:", e);
        }
    });

    //用于判断页面过早跳出
    cwx.Observer.addObserverForKey("cpage_onHide", function (options) {
        try {
            let { whiteScreenGUID } = options || {};
            if (!checkValidGUID(whiteScreenGUID, whiteScreenCache)) {
                return;
            }
            const currentWhite = whiteScreenCache[whiteScreenGUID];

            currentWhite.pageHideBegin = Date.now();
            // console.log("%c --- cpage_onHide ", "color:#0f0");
            // console.log(currentWhite);
        } catch (e) {
            console.error("cpage_onHide checkWhiteScreen error:", e);
        }
    });

    cwx.Observer.addObserverForKey("cpage_onUnload", function (options) {
        try {
            let { whiteScreenGUID } = options || {};
            if (!checkValidGUID(whiteScreenGUID, whiteScreenCache)) {
                return;
            }
            const currentWhite = whiteScreenCache[whiteScreenGUID];
            // todo, onHide 的状态下，直接 onUnload??? 测一下，onUnload 是否会触发

            // 没有计算出白屏时长，也意味着视图层没有 ready, 这时候，用 pageActiveTime - pageHideDuration
            if (!currentWhite.__viewIsReady) {
              calculateWhiteDuration(currentWhite);
            }

            // console.log("%c --- cpage_onUnload ", "color:#0f0");
            // console.log(currentWhite);
            sendUbt(whiteScreenGUID);
            delete whiteScreenCache[whiteScreenGUID];
        } catch (e) {
            console.error("cpage_onUnload checkWhiteScreen error:", e);
        }
    });
}

function sendUbt(whiteScreenGUID) {
    try {
        let {
          pagePath = "", 
          pageType, 
          __onLoadTime, 
          __viewIsReady,
          viewReadyTimeStamp, // viewReadyTimeStamp - __onLoadTime = whiteWaitDuration + pageHideDuration
          whiteWaitDuration, 
          pageHideDuration
        } = whiteScreenCache[whiteScreenGUID];
        const pageActiveTime = (Date.now() - __onLoadTime) - pageHideDuration;
        // 组合数据
        let ubtData = {
            pagePath, // 页面路径
            pageType, // 页面类型
            time: pageActiveTime, // 页面活动时长。 time < 2000ms 表示用户过早离开。
            whiteWaitDuration,
            viewReady: whiteWaitDuration, // 用户看到的白屏时长
            viewReadyTimeStamp, // 页面初始化渲染完成的时间戳
            onLoadTime: __onLoadTime, // onLoad 触发的时间戳
        }

        ubtData["code"] = "00"; // 页面卸载时，非白屏（初始渲染完成）
        if (!__viewIsReady) {
          if (pageActiveTime > PAGE_LIFE_TOO_SHORT) {
            ubtData["code"] = "01"; // 页面卸载时，仍然为白屏
          } else {
            ubtData["code"] = "03"; // 过早离开
          }
          delete ubtData["viewReady"];
          delete ubtData["viewReadyTimeStamp"];
        }

        // console.log("%c ------ [checkWhiteScreen.js] o_miniapp_page_render_check ------", "color:#0f0");
        // console.log(ubtData);
        let ubtKeyName = "o_miniapp_page_render_check";
        if (__global.envVersion === "develop") {
            ubtKeyName = "o_miniapp_page_render_check_develop"
            console.log("%c 当前为开发版，将使用 o_miniapp_page_render_check_develop 发送白屏检测数据", "color:#0f0");
        }
        cwx.sendUbtByPage.ubtMetric({
            name: ubtKeyName,
            tag: Object.assign(ubtData, getCommonInfo()),
            value: Number(ubtData["time"])
        });
    } catch (e) {
        console.error("sendUbt checkWhiteScreen error:", e)
    }
}
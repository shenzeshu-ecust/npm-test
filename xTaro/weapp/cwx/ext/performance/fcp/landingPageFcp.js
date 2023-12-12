import { cwx, __global } from "../../../cwx";
import { routeArr } from "./routePageFcp";
import { getCommonInfo } from "../util";

const LFCP_DATA_WHITE_LIST = [
    "appLaunchStartTime", // wx.getPerformance item.name === "appLaunch" 的 startTime
    "appLaunch", // wx.getPerformance item.name === "appLaunch" 的 duration
    "firstRender", // wx.getPerformance item.name === "firstRender" 的 duration
    // "evaluateScript", // wx.getPerformance item.name === "evaluateScript" 的 duration
    "appOnLaunch", // 调用 wx.getPerformance 的时间戳，即 app.onLaunch 触发的时间戳
    "onShow", // cpage_onShow 的 时间戳
    "pagePath", // 从 pageInfo 里取值
    "appOnShow", // appjs_onShow 的 时间戳
    "handlerType", // 发送埋点的方式
];
let landingPageCache = {};
let timer = null;

function comparePath(target, source) {
    if (target && target.indexOf("/") === 0) {
        target = target.slice(1);
    }
    if (source && source.indexOf("/") === 0) {
        source = target.slice(1);
    }
    return target === source;
}

/**
 * 非匿名函数，在landingPage监听完毕后需要删除监听
 */
const landingPageHandler = function (list) {
    let needSend = false;
    for (let i = 0; i < list.length; i++) {
        const { entryType, name, path } = list[i];
        if (entryType === "navigation" && name !== "appLaunch") {
            //此时可以判断是转场，需要判断转场的页面是否跟当前landingPage的页面一致
            handlerRouteStart(path);
        } else if (name === "appLaunch") {
            landingPageCache["appLaunch"] = list[i];
            landingPageCache["pagePath"] = path;
            needSend = true;
            timer = setTimeout(function () {
                //强制触发
                // console.log("%c 发送埋点， 获取到 appLaunch 后，定时10秒，强制发送 ==========", "color:#ff0")
                sendUbt(true, "landingPageHandler_force");
            }, 10 * 1000);
        } else if (LFCP_DATA_WHITE_LIST.includes(name) && path) {
            //此时判断routPage是否已经开始
            if (landingPageCache.pagePath) {
                if (path === landingPageCache.pagePath) {
                    //在routePage中，如果发现路由跟当前landingPage的路由一样，则会强制发送landingPage
                    landingPageCache[name] = list[i];
                    needSend = true;
                }
            } else if (!routeArr.includes(path)) {
                landingPageCache[name] = list[i];
                needSend = true;
            }
        }
    }
    if (needSend) {
        //做一次发送检查
        // console.log("%c 发送埋点，获取到性能数据 list ==========", "color:#ff0")
        sendUbt(false, "landingPageHandler");
    }
};
const handlerOnLaunch = function (options) {
    try {
        // console.log("%c >>> appjs_onLaunch_getoptions", "color:#0f0");
        landingPageCache["pagePath"] = options.path;
        if (options && options.cAppOnLaunchTS) {
            landingPageCache["appOnLaunch"] = options.cAppOnLaunchTS;
        }
    } catch (e) {
        console.error("handlerOnLaunch error:", e);
    }
    cwx.Observer.removeObserverForKey("appjs_onLaunch_getoptions", handlerOnLaunch)
}
const handlerAppOnShow = function (options) {
    try {
        // console.log("%c >>> appjs_onShow_getoptions", "color:#0f0");
        if (options && options.cAppOnShowTS) {
            landingPageCache["appOnShow"] = options.cAppOnShowTS;
        }
    } catch (e) {
        console.error("handlerAppOnShow error:", e);
    }
    //做一次发送检查
    // console.log("%c 发送埋点， handlerAppOnShow ==========", "color:#ff0")
    sendUbt(false, "handlerAppOnShow");
    cwx.Observer.removeObserverForKey("appjs_onShow_getoptions", handlerAppOnShow)
}

const handlerRouteStart = function (pagePath = "") {
    try {
        if (comparePath(pagePath, landingPageCache.pagePath)) {
            //如果跳转的页面跟当前页面的landingPage一致，需要强行发送landingPage的数据
            // console.log("%c 发送埋点，跳转的页面跟当前页面的landingPage一致，强制发送 ==========", "color:#ff0")
            sendUbt(true, "handlerRouteStart_force");
        }
    } catch (e) {
        console.error("handlerRouteStart error:", e);
    }
};

const handlerPageOnshow = function (options) {
    try {
        if (comparePath(options.pagePath, landingPageCache.pagePath)) {
            //跟当前landingPage的pagePath一致并且landingPage的也没有触发过
            if (!landingPageCache["onShow"] && options && options.cpageOnShowTS) {
                landingPageCache["onShow"] = options.cpageOnShowTS;
                landingPageCache["pageType"] = options.__pageType;
            }
        }
    } catch (e) {
        console.error("handlerPageOnshow error:", e);
    }
    //做一次发送检查
    // console.log("%c 发送埋点，handlerPageOnshow ==========", "color:#ff0")
    sendUbt(false, "handlerPageOnshow");
};

/**
 * 初始化监听landingPage的事件
 */
const initLandingPagePerformance = function () {
    cwx.Observer.addObserverForKey("wx_performance", landingPageHandler);
    // cache data
    cwx.Observer.addObserverForKey("appjs_onLaunch_getoptions", handlerOnLaunch);
    // cache data
    cwx.Observer.addObserverForKey("appjs_onShow_getoptions", handlerAppOnShow);
    // cache data
    cwx.Observer.addObserverForKey("cpage_onShow", handlerPageOnshow);
};

const sendUbt = function (force, handlerType) {
    if (landingPageCache.appLaunch && landingPageCache["appLaunch"].startTime) {
        let appLaunchStartTime = landingPageCache["appLaunch"].startTime || "";
        // 一定有值的数据，在初始化 ubtData 时先添加上去
        const ubtData = {
            pagePath: landingPageCache["pagePath"],
            pageType: landingPageCache["pageType"],
            appLaunchStartTime,
            handlerType
        };

        // convert 发送数据
        Object.keys(landingPageCache).forEach(function (key) {
            if (ubtData.hasOwnProperty(key)) {
                return;
            }
            if (landingPageCache[key].duration) {
                ubtData[key] = landingPageCache[key].duration;
            } else {
                ubtData[key] = landingPageCache[key] - appLaunchStartTime;
            }
        });

        if (!force) {
            // 如果不是强制发送，则检查属性是否已经采集齐全
            let res = LFCP_DATA_WHITE_LIST.every(function (item) {
                return ubtData[item];
            });
            if (!res) {
                return;
            }
        }
        if(timer){
        //   console.log("%c ------- [landingPageFCP.js] 清理定时器", "color:#0ff");
            clearTimeout(timer);
            timer = null;
        }
        //  即将发送埋点，此时可以移除监听器
        cwx.Observer.removeObserverForKey("wx_performance", landingPageHandler);
        cwx.Observer.removeObserverForKey("cpage_onShow", handlerPageOnshow);
        LFCP_DATA_WHITE_LIST.forEach(function (key) {
            if (!ubtData[key] && ubtData[key] !== 0) {
                delete ubtData[key];
            }
        });

        // console.log("%c ------ [landingPageFCP.js] o_wxapp_load_success ------", "color:#0f0");
        // console.log(ubtData);
        // 判断运行环境类型，只有 release 时才发埋点
        if (__global.envVersion !== "release") {
            console.log("%c LFCP 的埋点，只有在线上环境时才会发，避免测试数据影响整体性能数据", "color:#f00");
            return;
        }
        cwx.sendUbtByPage.ubtMetric({
            name: "o_wxapp_load_success",
            tag: Object.assign(ubtData, getCommonInfo()), // 添加公共属性
            value: ubtData["appLaunch"].duration && Number(ubtData["appLaunch"].duration) || 0,
        });
        landingPageCache = {};
        // routeArr = []; // Error: "routeArr" is read-only.
    }
};
export default initLandingPagePerformance;

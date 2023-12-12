import cwx from "../../../cwx";
import {getCommonInfo} from "../util"

/**
 * 当前页面的性能埋点数据，只保留当前页面的信息
 * @type {{}}
 */
let routePageCache = {}

export let routeArr = []
const CACHE_DATA_WHITE_LIST = [
    "route",
    "firstRender",
    "firstPaint",
    "firstContentfulPaint",
    "largestContentfulPaint",
];
let timer = null
/**
 * 初始化监听landingPage的事件
 */
const initRoutePagePerformance = function () {
    cwx.Observer.addObserverForKey("wx_performance", function (list) {
        for (let i = 0; i < list.length; i++) {
            // console.log("%c wx_performance item:", "color:#f0f");
            // console.log(list[i]);
            const {entryType, name, path, navigationType, referrerPath} = list[i];
            // console.log("%c path:", "color:#f0f;", path);
            // console.log("%c name:", "color:#f0f;", name);
            // console.log("%c entryType:", "color:#f0f;", entryType);
            if (CACHE_DATA_WHITE_LIST.includes(name) && path) {
                if (navigationType !== "navigateBack") {
                    if (!routePageCache[path]) {
                        routePageCache[path] = {
                            pagePath: path
                        }
                    }
                }
                // console.log("%c entryType:", "color:#f0f;", entryType);
                // console.log("%c navigationType:", "color:#f0f;", navigationType);
                // todo??? appLaunch 不在白名单内，肯定进不到这里，为啥还判断 name !== "appLaunch"？
                // 过滤 navigateBack 的数据，避免其触发强制发送
                if (entryType === "navigation" && name !== "appLaunch" && navigationType !== "navigateBack") {
                    const referrerPer = routePageCache[referrerPath] || {}
                    let isForceSendReferrer = Object.keys(referrerPer).length === 1
                    //此时可以判断是转场，需要判断转场的页面是否跟当前landingPage的页面一致
                    //routePageCache中当前referrerPath的性能数据长度===1时发送，也就是除了route
                    //没有接收到任何的性能数据，就发生了跳转
                    //理由是跳转过快，前一个页面的数据不具备参考意义
                    if (isForceSendReferrer) {
                        //判断内部有上个页面的数据，直接强制发送
                        sendUbt(true, "initRoutePagePerformance_force", referrerPath);
                    }
                    //初始化当前页面的数据
                    routeArr.push(path);
                    routePageCache[path][name] = list[i];
                    continue;
                }
                if (routePageCache[path] && routePageCache[path].pagePath) {
                    // console.log("%c path === routePageCache.pagePath 为真, initRoutePagePerformance", "color:#f0f;");
                    routePageCache[path][name] = list[i];
                    sendUbt(false, "initRoutePagePerformance", path);
                }
            }
        }
    });

    // send data
    cwx.Observer.addObserverForKey("cpage_onReady", function (options) {
        try {
            let { pagePath = "" } = options || {};
            // console.log(`%c >>>>>>>>>>>>>>>>>>>>> cpage_onReady ${Date.now()}`, "color:#f0f")
            // onReady 可能会多次触发，以防万一，需在创建 timer 前主动清理 timer
            if (timer) {
                // console.log("%c ------- [routePageFCP.js] 清理定时器, onReady 可能会多次触发，以防万一，需在创建 timer 前主动清理 timer", "color:#0ff");
                // console.log(routePageCache)
                clearTimeout(timer);
                timer = null;
            }
            // onReady 触发后，定时发送数据，记得清除定时器
            timer = setTimeout(function () {
                //todo？当前页面停留超过5s钟，还没有完全发送数据，则强制发送，不用考虑重复发送，因为发送完的数据会被删除
                if (!pagePath || (routePageCache[pagePath] && routePageCache[pagePath].pagePath)) {
                    sendUbt(true, "onReady_timeout_force", pagePath);
                }
            }, 5 * 1000);
        } catch (e) {
            console.error("cpage_onReady error:", e);
        }
    });
    // send data, destroy obj
    // cwx.Observer.addObserverForKey("cpage_onUnload", function () {
    //     try {
    //         // console.log("%c >>> cpage_onUnload", "color:#0f0");
    //         sendUbt();
    //     } catch (e) {
    //         console.error("cpage_onUnload checkWhiteScreen error:", e);
    //     }
    // });
}

let isSentUbtTimeout = {};
const sendUbt = function (force, handlerType, path) {
    if (isSentUbtTimeout[path]) {
        clearTimeout(isSentUbtTimeout[path]);
    }
    let pathCache = routePageCache[path] || {};
    try {
        // console.log("%c ============ [sendUbt]:", "color:#0f0");
        // console.log("force:", force);
        console.log("%c [sendUbt] handlerType:", "color:#0f0", handlerType);
        // console.log("routePageCache:", routePageCache);
        if (!pathCache.route) {
            return;
        }

        if (!force) {
            // 如果不是强制发送，则检查属性是否已经采集齐全
            let res = CACHE_DATA_WHITE_LIST.every(function (item) {
                return pathCache[item]
            })
            if (!res) {
                // 单个页面的性能埋点发送，主要依靠当前页面的timer来发送
                // console.log("%c ============ [sendUbt_timeout_force] 000:", "color:#0f0",routePageCache);
                isSentUbtTimeout[path] = setTimeout(function () {
                    // console.log("%c ============ [sendUbt_timeout_force] 111:", "color:#0f0");
                    sendUbt(true, "sendUbt_timeout_force", path);
                }, 3000);
                return;
            }
        }

        // 记录原始数据
        cwx.sendUbtByPage.ubtDevTrace('o_miniapp_route_page_show_origin', {
            routePageCache: JSON.stringify(pathCache)
        });
        // 路由相关性能数据：有啥发啥；
        let routeStartTime = pathCache.route.startTime || 0;
        let {
            navigationType = "",
            startTime = 0,
            navigationStart = 0,
            duration = 0,
            referrerPath = ""
        } = pathCache.route;
        // 1. 整合基本信息：路由处理耗时
        let ubtData = {
            to: pathCache.pagePath || "",
            from: referrerPath,
            route_navigationType: navigationType,
            route_startTime: startTime, // 路由开始的时间戳
            route_navigationStart: navigationStart - startTime, // 路由真正开始的时间
            route_duration: duration, // 路由耗时，单位毫秒
            handlerType
        }
        // 2. 页面首次渲染耗时
        if (pathCache["firstRender"]) {
            const frKey = "firstRender";
            const frVal = pathCache[frKey];
            for (let key in frVal) {
                if (["name", "entryType"].includes(key)) { // 这俩不需要记录
                    continue;
                }
                // 需要展示到 APM 上的数据，才需要做计算；否则，记录原始值
                if (key === "viewLayerRenderEndTime" && routeStartTime > 0 && frVal[key] > routeStartTime) {
                    ubtData[`${frKey}_${key}`] = frVal[key] - routeStartTime;
                } else {
                    ubtData[`${frKey}_${key}`] = frVal[key] || "";
                }
            }
        }
        // 只需要记录 startTime 属性的差值
        ["firstPaint", "firstContentfulPaint", "largestContentfulPaint"].forEach(function (key) {
            const prop = "startTime"
            if (!pathCache[key]) {
                return;
            }
            if (routeStartTime > 0 && pathCache[key][prop] > routeStartTime) {
                ubtData[`${key}_${prop}`] = pathCache[key][prop] - routeStartTime;
            } else {
                ubtData[`${key}_${prop}`] = pathCache[key][prop]
            }
        })

        // if (timer) {
        //     // console.log("%c ------- [routePageFCP.js] 清理定时器", "color:#0ff");
        //     clearTimeout(timer);
        //     timer = null;
        // }

        console.log("%c ------- [routePageFCP.js] o_miniapp_route_page_show_official", "color:#0f0");
        console.log(ubtData);
        cwx.sendUbtByPage.ubtMetric({
            name: "o_miniapp_route_page_show_official",
            tag: Object.assign(ubtData, getCommonInfo()), // 添加公共属性
            value: pathCache["route"].duration && Number(pathCache["route"].duration) || 0,
        });

        delete routePageCache[path];
    } catch (error) {
        console.error("sendUbt error:", error)
    }
}

export default initRoutePagePerformance

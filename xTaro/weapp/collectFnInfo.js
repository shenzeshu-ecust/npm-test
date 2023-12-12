let fnList = {};
let timer = null;
let envVersion = getEnvVersion();
let sendedFnList = []; // 需要按顺序删除缓存，缓存已经发送过的方法id，避免重复发送
const fnListCacheKey = "INJECT_FNLIST_CACHE"
const bVerCacheKey = "BUILD_VERSION_CACHE"
let reportSwitch = false; // 开关
let cwx = null;

let sendedFnListMap = {};
let isInited = false;
function getEnvVersion() {
    const accountInfo = wx.getAccountInfoSync();
    return accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.envVersion || "release";
}

if (typeof wx !== 'undefined') {
    wx["j"] = function (fnId) {
        if(!isInited){
            initBuildVersionCache();
        }
        if (addFnId(fnId)) {
            createTimer();
        }
    }
}



function initBuildVersionCache() {
    isInited = true;
    try {
        let cacheBuildVersion = wx.getStorageSync(bVerCacheKey) || '';
        // console.log("%c cacheBuildVersion:", "color: red;", cacheBuildVersion)
        // console.log("%c wx.buildVersion:", "color: red;", wx.buildVersion)
        if (!cacheBuildVersion || cacheBuildVersion !== wx.buildVersion) {
            // 如果buildVersion不一致，清空缓存
            wx.removeStorageSync(fnListCacheKey);
            // console.log("%c 修改本地缓存的 buildVersion:", "color: red;", wx.buildVersion)
            wx.setStorageSync(bVerCacheKey, wx.buildVersion || '');
            return;
        }
        //当前客户端已经发过的fnIds，再打开时也是没必要再发送的
        let sendedFnListCache = wx.getStorageSync(fnListCacheKey);
        if (typeof sendedFnListCache === "string") {
            sendedFnListCache = sendedFnListCache && JSON.parse(sendedFnListCache) || [];
        }
        // console.log("%c sendedFnListCache:", "color: red;", sendedFnListCache)
        sendedFnList = sendedFnList.concat(sendedFnListCache);
        sendedFnList.forEach(function (item) {
            sendedFnListMap[item] = 1;
        })
    } catch (e) {
        console.error(e)
    }
}

/**
 * 已经发送过的缓存，不管有没有发送成功
 * 目前保持2000个方法id当作缓存
 * 缓存会按照调用的时机进行位置更新
 */
function updateCache() {
    Object.keys(fnList).forEach(function (fnId) {
        const i = sendedFnList.indexOf(fnId);
        if (i !== -1) {
            sendedFnList.splice(i, 1);
            delete sendedFnListMap[fnId];
        }
        sendedFnList.push(fnId);
        sendedFnListMap[fnId] = 1;
        if (sendedFnList.length > 2000) {
            const firstId = sendedFnList.shift();
            delete sendedFnListMap[firstId];
        }
    });

    try {
        wx.setStorageSync(fnListCacheKey, sendedFnList);
    } catch (e) {
        console.error(e)
    }
}


/**
 * 添加方法Id到队列中
 * @param fnId
 */
function addFnId(fnId) {
    // console.log("%c ---> addFnId, fnId:", `color: red;`, fnId, fnList[fnId], sendedFnListMap[fnId], sendedFnList.length)
    // 已发送数组，修改fnId的位置
    if (fnList[fnId] || sendedFnListMap[fnId]) {
        return false;
    }
    fnList[fnId] = 1;
    return true;
    // console.log("%c fnList:", "color: red;", fnList)
}

export const collectFnInfo = function () {
    try {
        if (!cwx) {
            cwx = require("./cwx/cwx.js").cwx;
            if (cwx && cwx.configService && typeof cwx.configService.watch === "function") {
                cwx.configService.watch("collectFnInfo", (res) => {
                    if (res && res.diversion && typeof res.diversion !== "undefined") {
                        if(res.diversion === "all" || cwx.clientID && res.diversion.indexOf(cwx.clientID.slice(-1)) !== -1) {
                            reportSwitch = true;
                        } else {
                            reportSwitch = false;
                        }
                    } else {
                        reportSwitch = false;
                    }
                })
            }
            // 在appjsOnhide时，主动发送一次
            if (cwx && cwx.Observer && typeof cwx.Observer.addObserverForKey === "function") {
                // console.log("%c observer appjs_onHide", "color: red;")
                cwx.Observer.addObserverForKey("appjs_onHide", function () {
                    console.log("%c ---> app js on hide report.", "color: red;")
                    reportInfo();
                })
            }
        }
    } catch (e) {
        console.error(e)
    }
}

function reportInfo(callback) {
    let fnKeyList = Object.keys(fnList)
    // console.log("%c ---> reportInfo:", "color: red;", wx.buildVersion, fnKeyList.length)
    if (!wx.buildVersion || fnKeyList.length === 0) {
        //强依赖buildVersion
        callback && callback();
        return;
    }
    if (!reportSwitch) {
        //防止内存占用太多
        if(fnKeyList.length > 2000){
            const delList = fnKeyList.slice(2000) ||[];
            delList.forEach(function (key){
                delete fnList[key];
            });
        }
        console.log("%c 服务端关闭了上报开关", "color: red;")
        return;
    }
    
    console.log("---> fnKeyList:", fnKeyList.join(''));

    (cwx && cwx.request || wx.request)({
        url: cwx && cwx.request ? '/restapi/soa2/28967/reportRuntimeFnInfo' : 'https://m.ctrip.com/restapi/soa2/28967/reportRuntimeFnInfo',
        data: {
            buildVersion: wx.buildVersion,
            fnInfo: fnKeyList.join(''),
            envVersion
        },
        method: 'POST',
        success: function (res) {
            console.log("%c report request success:", "color: red;")
            //todo?要加埋点
        },
        fail: function (err) {
            //todo?要加埋点
            console.error("report request fail:", err)
        },
        complete: function () {
            //此处 如果fnList 又有了，需要重新createTimer;
            if (!timer && Object.keys(fnList).length > 0) {
                createTimer();
            }
        }
    })
    //更新缓存
    updateCache();
    fnList = {};
}

/**
 * 改成1分钟发一次
 */
function createTimer() {
    if (!timer) {
        //如果有方法未发送并且也没有创建timer，则创建timer
        timer = setTimeout(function () {
            // 如果规定时间内有数据，调用服务端接口，发送方法调用数据
            console.log("%c ---> timer report.", "color: red;")
            //删除timer
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            reportInfo();
        }, 60 * 1000)
        // console.log("%c createTimer, timer:", "color: red;", timer)
    }
}

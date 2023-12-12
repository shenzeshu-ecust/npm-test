import { cwx, __global } from "../../cwx.js";
let lastWarningLevel = null;

function backupOptionsToCwx(options) {
    if (!options) {
        return;
    }

    if (typeof options.scene !== "undefined") {
        cwx.scene = options.scene;
        try {
            if (cwx.scene && ["1154", "1155"].includes(cwx.scene.toString())) {
                cwx.sendUbtByPage.ubtDevTrace(
                    __global.timelineUbtMap[`app_onShow_${cwx.scene}`],
                    {
                        options: JSON.stringify(options)
                    }
                );
            }
        } catch (error) {
        }
    }
    if (typeof options.shareTicket !== "undefined") {
        cwx.shareTicket = options.shareTicket;
    }
    if (typeof options.referrerInfo !== "undefined") {
        cwx.referrerInfo = options.referrerInfo;
    }
    if (typeof options.forwardMaterials !== "undefined") {
        cwx.forwardMaterials = options.forwardMaterials;
    }
    if (typeof options.chatType !== "undefined") {
        cwx.chatType = options.chatType;
    }
}

function backupOptionsToCxwGlobal(options) {
    if (!options) {
        return;
    }
    let referrerInfo = options.referrerInfo || {};
    __global.fromAppId = referrerInfo.appId || "";

    let extraData = referrerInfo.extraData || {};
    __global.customAppId = extraData.customAppId || "";
    __global.styleAppId = extraData.styleAppId || "";
    console.log("__global.fromAppId:", __global.fromAppId);
    console.log("__global.customAppId:", __global.customAppId);
    console.log("__global.styleAppId:", __global.styleAppId);
}

function sendPerformance() {
    // 2. 移动统计UBT埋点
    cwx.sendUbtGather.appDuration();
    cwx.sendUbtGather.getPageDurationProps("appOnShow");
}

function observeMemoryWarning() {
    try {
        if (cwx.canIUse("onMemoryWarning")) {
            cwx.onMemoryWarning(function (res = {}) {
                console.error("内存警告, lastWarningLevel:", lastWarningLevel);
                const curLevel = res.level || -1;
                if (lastWarningLevel && lastWarningLevel > curLevel) {
                  return;
                }
                lastWarningLevel = curLevel;
                const pageStack = getCurrentPages() || [];
                let pagePathArr = [];
                for (let i = 0; i < pageStack.length; i++) {
                    pagePathArr.push(
                        (pageStack[i] && pageStack[i].route) || ""
                    );
                }
                console.error("内存警告，curLevel:", curLevel);
                cwx.sendUbtByPage.ubtMetric({
                    name: 188184,
                    tag: {
                        store: Object.keys(__global.__mirrorStorage),
                        warnLevel: curLevel,
                        pagePathArr: JSON.stringify(pagePathArr),
                    },
                    value: res && res.level ? Number(res.level) : 1,
                });
            });
        }
    } catch (e) {}
}

function observeUserCaptureScreen() {
    try {
        if (cwx.canIUse("onUserCaptureScreen")) {
            cwx.onUserCaptureScreen(function (res) {
                cwx.Observer.noti("onUserCaptureScreen", res);
                let currentPage = cwx.getCurrentPage();

                cwx.sendUbtByPage.ubtTrace(192797, {
                    duid: cwx.user.duid || "",
                    clientID: cwx.clientID || "",
                    timeStemp: new Date().getTime(),
                    pageId: currentPage
                        ? currentPage.pageId || currentPage.pageid || ""
                        : "",
                    pagePath: (currentPage && currentPage.route) || "",
                });
            });
        }
    } catch (e) {}
}

export default {
    backupOptionsToCwx,
    sendPerformance,
    observeMemoryWarning,
    observeUserCaptureScreen,
    backupOptionsToCxwGlobal,
};

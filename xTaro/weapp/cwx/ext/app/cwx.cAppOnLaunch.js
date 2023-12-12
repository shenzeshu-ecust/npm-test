import { cwx, __global } from "../../cwx.js";

function backupOptionsToCwx(options) {
    if (!options) {
        return;
    }

    if (typeof options.path !== "undefined") {
        cwx.__firstToPath = options.path;
    }
    if (typeof options.scene !== "undefined") {
        cwx.scene = options.scene;
        try {
            if (cwx.scene && ["1154", "1155"].includes(cwx.scene.toString())) {
                cwx.sendUbtByPage.ubtDevTrace(
                    __global.timelineUbtMap[`app_onLaunch_${cwx.scene}`],
                    {
                        options: JSON.stringify(options)
                    }
                );
            }
        } catch (error) {
        }
    }
    if (typeof options.query !== "undefined" && options.query.toUrl) {
        cwx.__firstToUrl = options.query.toUrl;
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

function sendUbt (type, message = "") {
    cwx.sendUbtByPage.ubtDevTrace("o_miniapp_wxSystemInfo_missing",
    {
        val: cwx.wxSystemInfo ? JSON.stringify(cwx.wxSystemInfo) : typeof cwx.wxSystemInfo,
        type,
        message
    }
);
}

function getCustomTitleBarHeight() {
    const DEFAULT_TITLE_BAR_HEIGHT = 48;
    let customTitleBarHeight;
    try {
        if (cwx.getMenuButtonBoundingClientRect) {
            const menuInfo = cwx.getMenuButtonBoundingClientRect();
            if (version(cwx.wxSystemInfo.version, "7.0.3")) {
                customTitleBarHeight =
                    menuInfo.height +
                    (menuInfo.top - cwx.wxSystemInfo.statusBarHeight) * 2;
            } else {
                customTitleBarHeight = menuInfo.height + menuInfo.top * 2;
            }
        } else {
            customTitleBarHeight = DEFAULT_TITLE_BAR_HEIGHT;
        }
        if (cwx.wxSystemInfo && cwx.wxSystemInfo.model) {
            if (cwx.wxSystemInfo.model.indexOf("iPhone") !== -1) {
                customTitleBarHeight = 44;
            }
        } else {
            sendUbt("model")
        }
    } catch (e) {
        console.log(e)
        sendUbt("error", e.message)
        customTitleBarHeight = DEFAULT_TITLE_BAR_HEIGHT;
    }
    return customTitleBarHeight;
}


//版本号检测
function version(curV, reqV) {
  var arr1 = curV.split(".");
  var arr2 = reqV.split(".");

  var maxL = Math.max(arr1.length, arr2.length);
  var pos = 0;
  var diff = 0;

  while (pos < maxL) {
    diff = parseInt(arr1[pos]) - parseInt(arr2[pos]);
    console.log(diff, parseInt(arr1[pos]), parseInt(arr2[pos]))
    if (diff != 0) {
      break;
    }
    pos++;
  }
  if (diff > 0 || diff == 0) {
    //新版本、稳定版
    return 1
  } else {
    // 旧版本
    return 0
  }
}

function sendPerformance(options) {
    // 1. 获取首屏渲染性能数据
    // handleWxGetPerformance();
    // 2. 移动统计UBT埋点
    cwx.sendUbtGather.getPageDurationProps("appOnLaunch");
    cwx.sendUbtGather.appLaunch(options);
}

function getHomeABTest() {
    cwx._homeABTest = cwx.ABTestingManager.valueForKeySync("180828_idh_wsypk");
    console.log("首页的ab版本第一次确认为:::", cwx._homeABTest);
}
export default {
    backupOptionsToCwx,
    getCustomTitleBarHeight,
    sendPerformance,
    getHomeABTest,
};

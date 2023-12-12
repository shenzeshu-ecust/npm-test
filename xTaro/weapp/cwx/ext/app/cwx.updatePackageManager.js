import { cwx, __global } from "../../cwx.js";

// 比较版本号 
function checkVersionForUpdate (minVersion = "") {
  let needUpdate = false;
  const curVersionList = __global.version.split(".");
  const baseVersionList = minVersion.split(".");
  if (curVersionList.length !== baseVersionList.length) {
    return needUpdate;
  }
  const len = curVersionList.length;
  // 从左往右对比
  for (let i = 0; i < len; i++) {
    if (parseInt(curVersionList[i]) < parseInt(baseVersionList[i])) {
        needUpdate = true;
        break;
    }
  }
  return needUpdate;
}

function handleUpdatePackage(qRes, updateManager) {
  if (qRes.forceUpdate) {
    console.log("强制重启并更新");
    cwx.sendUbtByPage.ubtDevTrace(
      "wxapp_cwx_updateManager_forceUpdate",
      qRes || {}
    ); // 强制重启并更新
    // 强制小程序重启并使用新版本。在小程序新版本下载完成后（即收到 onUpdateReady 回调）调用。
    updateManager.applyUpdate();
    return;
  }
  
  if (checkVersionForUpdate(qRes.minVersion)) {
    // console.error("提示用户更新，用户可以选择不更新");
    cwx.showModal({
      title: "更新提示",
      content: "新版本已经准备好，是否重启应用？",
      success(res) {
        if (res.confirm) {
          // console.log("用户点击确定");
          cwx.sendUbtByPage.ubtDevTrace(
            "wxapp_cwx_updateManager_onUpdateReady_user_confirm",
            res || {}
          ); // 用户点击确定
          // 强制小程序重启并使用新版本。在小程序新版本下载完成后（即收到 onUpdateReady 回调）调用。
          updateManager.applyUpdate();
        } else if (res.cancel) {
          // console.log("用户点击取消");
          cwx.sendUbtByPage.ubtDevTrace(
            "wxapp_cwx_updateManager_onUpdateReady_user_cancel",
            res || {}
          ); // 用户点击取消
        } else {
          // console.log("用户做了其他操作");
          cwx.sendUbtByPage.ubtDevTrace(
            "wxapp_cwx_updateManager_onUpdateReady_user_other",
            res || {}
          ); // 用户做了其他操作
        }
      },
      fail(err) {
        // console.log("cwx.showModal 接口调用失败");
        cwx.sendUbtByPage.ubtDevTrace(
          "wxapp_cwx_updateManager_showModal_fail",
          err || {}
        ); // cwx.showModal 接口调用失败
      },
      complete(res) {
        // console.log("cwx.showModal 接口调用结束");
        cwx.sendUbtByPage.ubtDevTrace(
          "wxapp_cwx_updateManager_showModal_complete",
          res || {}
        ); // cwx.showModal 接口调用结束
      },
    });
  }
}

/**
 * 通过 MCD config 控制是否更新
 * 监听版本更新情况，发埋点
 */
function updateManager() {
  // 请求 mcd config ，查询是否需要 提示 或 立刻 更新版本
  cwx.configService.watch("updateManager", (qRes) => {
    console.log("updateManager config:", qRes);
    cwx.sendUbtByPage.ubtDevTrace(
      "wxapp_cwx_updateManager_qConfigRes",
      qRes || {}
    ); // qConfig 返回的配置信息

    const updateManager = cwx.getUpdateManager();

    // 监听小程序有版本更新事件。客户端主动触发下载（无需开发者触发），下载成功后回调
    updateManager.onUpdateReady(function () {
      // console.log("小程序有版本更新事件");
      cwx.sendUbtByPage.ubtDevTrace(
        "wxapp_cwx_updateManager_onUpdateReady",
        qRes || {}
      ); // 有版本更新
      handleUpdatePackage(qRes, updateManager);
    });

    // 监听向微信后台请求检查更新结果事件。微信在小程序每次启动（包括热启动）时自动检查更新，不需由开发者主动触发。
    updateManager.onCheckForUpdate(function (res) {
      // console.log("记录新版本信息, res:", res);
      cwx.sendUbtByPage.ubtDevTrace(
        "wxapp_cwx_updateManager_onCheckForUpdate",
        res || {}
      ); // 记录新版本信息
      if (res.hasUpdate) {
        cwx.sendUbtByPage.ubtDevTrace(
          "wxapp_cwx_updateManager_onCheckForUpdate_hasUpdate",
          res || {}
        ); // 有新版本
      }
    });

    // 3. 监听小程序更新失败事件。小程序有新版本，客户端主动触发下载（无需开发者触发），下载失败（可能是网络原因等）后回调
    updateManager.onUpdateFailed(function () {
      console.log("新版本下载失败");
      cwx.sendUbtByPage.ubtDevTrace(
        "wxapp_cwx_updateManager_onUpdateFailed",
        qRes || {}
      ); // 新版本下载失败
      if (qRes.forceExit) {
        cwx.showModal({
          title: '提示',
          content: '新版本下载失败',
          showCancel: false,
          success (res) {
            // 兼容低版本基础库
            cwx.exitMiniProgram && cwx.exitMiniProgram({
              success(res) {
                console.log("exitMiniProgram success", res)
              },
              fail(res) {
                console.error("exitMiniProgram fail", res)
              },
              complete(res) {
                console.log("exitMiniProgram complete", res)
              },
            });
          }
        })
      } else if (qRes.promptUpdate && !qRes.forceUpdate) {
        cwx.showToast({
          title: '新版本下载失败',
          icon: "none"
        })
      }
    });
  });
}

export default {
  updateManager
};

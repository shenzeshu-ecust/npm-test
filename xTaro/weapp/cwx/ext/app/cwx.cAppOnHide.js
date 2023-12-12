import { cwx } from "../../cwx.js";

function sendPerformance() {
  // 1. 移动统计UBT埋点
  cwx.sendUbtGather.setAppDurationToStorage();
  cwx.sendUbtGather.getPageDurationProps("appOnHide");
}

function removeObserver() {
  try {
    if (cwx.canIUse("offMemoryWarning")) {
      cwx.offMemoryWarning(function () {});
    }

    if (cwx.canIUse("offUserCaptureScreen")) {
      cwx.offUserCaptureScreen(function (res) {});
    }
  } catch (e) {}
}

export default {
  sendPerformance,
  removeObserver,
};

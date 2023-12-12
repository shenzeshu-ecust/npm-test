import __global from "../global.js";
export function checkIsMasterMiniapp () {
  if (__global.appId === "wx0e6ed4f51db9d078") {
    return true;
  }
  return false;
}

/**
 * 个保整改三期：使用 组件级别方案 (true) 还是 页面级别方案 (false)
 * 如果独立小程序需要切换方案，需要把这里改成 true 
 */
export function checkUsePerInfoProtectComponent () {
  return __global.useProtectComponent || checkIsMasterMiniapp(); // 主板小程序全部使用组件级别方案
}
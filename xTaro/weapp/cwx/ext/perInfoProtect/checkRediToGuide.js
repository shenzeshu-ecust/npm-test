// 在小程序应用启动时，执行
// 检查本地缓存是否包含用户授权信息
// 1. 没有相关缓存 （用户首次进入小程序 或 用户之前拒绝了）：记录首屏的页面路径及入参，重定向到个保指引页面
// 2. 有相关缓存，用户之前同意了：继续执行正常流程，不做拦截处理

import { cwx } from "../../cwx";
import { createGUID, checkValidGUID } from "../performance/util"
import { perInfoProtectGuidePath, resolvePrivacyAuth } from "../../../agreementConfig"
let userAuthStatus = null;
let enterPagePath = null;
let enterPageQuery = null;

export const ENTER_QUERY_GUID_KEY = "enterQueryGUID";
const USER_AUTH_STORAGE_KEY = "PERSONAL_INFO_AUTHORIZATION_CACHE"
const CID_STORAGE_KEY = "clientID"
const USER_REJECT = "0"; // 用户不同意授权
const USER_ALLOW = "1"; // 用户同意授权
const REGULAR_USER = "2"; // 老用户，视为已同意授权

const GUID_PREFIX = "_userAuthEnterQuery"
let enterQueryCache = {};

export const checkUserAuthAtSetup = function () {
  // console.log("%c 仅启动时检查一次", "color:red;")
  const CID = wx.getStorageSync(CID_STORAGE_KEY);
  if (CID) {
    const userAuthCode = wx.getStorageSync(USER_AUTH_STORAGE_KEY);
    if (userAuthCode) {
      console.log("%c [信安要求的授权] 是老用户，授权状态为：", "color:#0f0;", userAuthCode)
      return userAuthCode;
    }
    console.log("%c [信安要求的授权] 是老用户且没有授权过，视为同意授权, code:", "color:#0f0;", REGULAR_USER)
    wx.setStorageSync(USER_AUTH_STORAGE_KEY, REGULAR_USER)
    return REGULAR_USER;
  }
  
  console.log("%c [信安要求的授权] 是新用户，视为不同意授权, code 1", "color:#0f0;")
  wx.setStorageSync(USER_AUTH_STORAGE_KEY, USER_REJECT)
  return USER_REJECT;
}

export const getUserAuthStatus = function () {
  if (typeof userAuthStatus === "boolean") {
    return userAuthStatus;
  }
  const userAuthCode = wx.getStorageSync(USER_AUTH_STORAGE_KEY)
  if ([REGULAR_USER, USER_ALLOW].includes(userAuthCode)) {
    userAuthStatus = true;
  } else {
    userAuthStatus = false;
  }
  return userAuthStatus;
}

/**
 * 在调用业务 onLoad 前，用 enterQueryGUID 换取真实的参数值
 * when: checkRediToGuide
 * @param {*} guid 
 */
export function getEnterQueryByGUID (guid) {
  console.log("%c [信安要求的授权] guid:", "color:#0f0;", guid)
  console.log("%c [信安要求的授权] enterQueryCache:", "color:#0f0;", enterQueryCache)
  if (!checkValidGUID(guid, enterQueryCache)) {
    return null;
  }
  const enterQuery = enterQueryCache[guid]
  delete enterQueryCache[guid]
  console.log("%c [信安要求的授权] enterQuery:", "color:#0f0;", enterQuery)
  return enterQuery;
}

/**
 * 将 pagePath, pageQuery 缓存到本地，并创建相应的 GUID 
 * when: checkRediToGuide
 * @param {*} pagePath 
 * @param {*} pageQuery 
 */
const setEnterPageInfo = function (pagePath = "", pageQuery = {}) {
  // console.log("%c pagePath", "color:red;", pagePath)
  // console.log("%c pageQuery", "color:red;", pageQuery)
  // 为了便于对比是否为 tabBar 页面，统一处理为不以 / 开头
  if (pagePath && pagePath.startsWith('/')) {
    pagePath = pagePath.slice(1)
  }
  const guid = createGUID(GUID_PREFIX)
  enterQueryCache[guid] = pageQuery;
  enterPagePath = pagePath;
  enterPageQuery = {
    "enterQueryGUID": guid
  };
  try {
    cwx.sendUbtByPage.ubtDevTrace("weapp_perInfoProtect_checkRediToGuide_cache", {
      enterQueryGUID: guid,
      pageQuery: JSON.stringify(pageQuery),
      pagePath
    });
  } catch (error) {
    
  }
  // console.log("%c enterPagePath", "color:red;", enterPagePath)
  // console.log("%c enterPageQuery", "color:red;", enterPageQuery)
}

/**
 * 获取进入小程序的首个页面的路径及参数值相应的 enterQueryGUID
 * when: 用户点击个保指引页面的同意按钮后
 */
export const getEnterPageInfo = function () {
  return {
    path: enterPagePath || "pages/homepage/homepage",
    query: enterPageQuery || {},
  }
}

export const setUserAllowCache = function () {
  userAuthStatus = true;
  wx.setStorageSync(USER_AUTH_STORAGE_KEY, USER_ALLOW)
  console.log("%c [信安要求的授权] 将本地缓存中的授权状态设置为 同意", "color:#0f0;")
}

export const setUserRejectCache = function () {
  userAuthStatus = false;
  wx.setStorageSync(USER_AUTH_STORAGE_KEY, USER_REJECT)
  console.log("%c [信安要求的授权] 将本地缓存中的授权状态设置为 拒绝", "color:#0f0;")
}

export const checkRediToGuide = function ({pagePath, pageQuery, isPIPGPage,isForceShowAuthorization}) {
  if (!isForceShowAuthorization && (!resolvePrivacyAuth && getCurrentPages().length !== 1 || isPIPGPage)) {
    console.log("%c [信安要求的授权] 当前场景无须执行个保三期处理，checkRediToGuide 返回 true", "color:#0f0;")
    return true;
  }
  // console.log("%c pagePath", "color:red;", pagePath)
  // console.log("%c pageQuery", "color:red;", pageQuery)
  userAuthStatus = getUserAuthStatus();
  console.log("%c [信安要求的授权] 本地缓存的用户授权状态", "color:#0f0;", userAuthStatus)
  if (userAuthStatus) {
    console.log("%c [信安要求的授权] 用户已同意授权，checkRediToGuide 返回 true", "color:#0f0;")
    return true;
  }
  cwx.sendUbtByPage.ubtDevTrace("weapp_perInfoProtect_checkRediToGuide", {
    userAuthStatus
  });

  // 如果是 true，则是主板小程序，使用组件方案；如果是 false，则是 独立小程序，使用页面方案
  if (!cwx.checkUsePerInfoProtectComponent()) {
    setEnterPageInfo(pagePath, pageQuery);
    // 重定向到 个保指引页
    wx.redirectTo({
      url: perInfoProtectGuidePath,
      success: function (res) {
        // console.log("%c success res:", "color:#0f0", res)
      },
      fail: function (res) {
        // console.log("%c fail res:", "color:#0f0", res)
      },
      complete: function (res) {
        // console.log("%c complete res:", "color:#0f0", res)
      },
    })
  }

  console.log("%c [信安要求的授权]  用户未授权，checkRediToGuide 返回 false", "color:#0f0;")
  return false;
}

export const checkNeedIntercept = function (options = {}) {
  return !options.doNotIntercept && !getUserAuthStatus() && !/^\/?cwx\/component\/(cwebview|extraCweb|perInfoProtectGuide)\/.+/.test(options.url || "")
}
import { cwx } from "../cwx.js";

// 标志 当前跨应用同步登录态的情况
let publishExecuted = false; // 标志 publish 是否执行，未执行则需等待再包裹和添加保证cb执行的锁
let waitPublishExecutedCBs = [];

let needDynamicLogin = false; // 不需要同步
let dynamicLoginDone = false; // 需要同步 且 同步已完成
let dynamicLoginRes = null; // 记录跨应用同步登录态 成功/失败

let callbackQueue = [];
let loginType = "";
let crossToken = "";

// 检查是否可以现在执行callback
// 不需要同步登录态 或 需要且已完成 => 表示不需要等待
function checkDynamicLoginStatus() {
  console.log("[checkDynamicLoginStatus] needDynamicLogin 需要同步登录态:", needDynamicLogin);
  console.log("[checkDynamicLoginStatus] dynamicLoginDone 已经完成同步登录态:", dynamicLoginDone);
  let res = !needDynamicLogin || (needDynamicLogin && dynamicLoginDone);
  console.log("[checkDynamicLoginStatus] 是否 不需要同步登录态 或 需要且已完成:", res);
  return res;
}

function flushCBQueue(res, cbArr) {
  // console.log('%c [flushCBQueue] cbArr', 'color:#0f0;')
  // console.log(cbArr.length)
  if (cbArr && cbArr.length) {
    let cbItem = null;
    while ((cbItem = cbArr.shift())) {
      // Array<callback>
      if (cbItem && typeof cbItem === "function") {
        try {
          cbItem(res);
        } catch (e) {
          cwx.sendUbtByPage.ubtMetric({
            name: "bbz_subscribe_dynamic_login_callback", //申请生成的Metric KEY
            tag: { err_msg: e.message, err_stack: e.stack }, //自定义Tag
            value: 1, //number 值只能是数字
          });
        }
      }
    }
  }
}

function processWaitCBs() {
  let waitCB = null;
  while ((waitCB = waitPublishExecutedCBs.shift())) {
    wrapperAndSaveCBs(waitCB);
  }
}

function wrapperAndSaveCBs(cb) {
  let isTimeout = false;
  let timeOut = setTimeout(function () {
    isTimeout = true;
    timeOut = null;
    cb(false); // 超时，视为同步登录态失败
    sendMetric(
      "bbz_subscribe_dynamic_login_timeout",
      loginType,
      false,
      crossToken
    );
  }, 3000);

  let newFunc = function (res) {
    if (!isTimeout) {
      clearTimeout(timeOut);
      timeOut = null;
      if (typeof cb === "function") {
        cb(res);
      }
    }
  };

  // 塞到 callbackQueue 中
  callbackQueue.push(newFunc);
}

function publish(options) {
  let { __userToken, loginToken } = options.query;
  // 兼容把 token 放到 extraData 里的场景
  const { appId = "", extraData = {}} = options.referrerInfo || {};
  if (!__userToken) {
    __userToken = extraData.__userToken;
  }
  if (!loginToken) {
    loginToken = extraData.loginToken;
  }
  const token = __userToken || loginToken;
  if (token === crossToken) {
    console.log("相同的 token, 重复触发 publish, 不执行后续处理逻辑")
    return;
  }
  crossToken = token;
  // 添加 appId, 记录来源小程序
  loginType = __userToken ? "__userToken_" + appId : "loginToken"; // __userToken 是小程序间同步登录态
  publishExecuted = true; // publish 已执行

  console.log(`%c [publish] crossToken 是否有值: ${crossToken}`, 'color:#0f0;');

  // console.log('%c [publish] 调用 checkDynamicLoginStatus() --------------)', 'color:#0f0;')

  // 需要同步 + 已完成 => 需要调 同步登录态接口
  // 需要同步 + 未完成 => 不需要调，只要加到队列，等待正在同步的接口的返回 或 超时即可
  // 不需要同步 => 直接 flush
  if (crossToken) {
    if (checkDynamicLoginStatus()) {
      // publish 已执行，给 wait 的 callback 加3000ms的锁
      processWaitCBs();
      // 需要同步登录态并且以前已经完成同步了
      needDynamicLogin = true; // 需要同步登录态
      dynamicLoginDone = false; // 是否完成同步登录态
      // console.log('重置目前是否已完成同步登录态：', dynamicLoginDone)
      // console.log('%c [publish] 即将调用同步登录态的方法:', 'color:#0f0;')
      // console.log("needDynamicLogin:", needDynamicLogin);
      // console.log("dynamicLoginDone:", dynamicLoginDone);

      cwx.user.writeCrossTicket(crossToken, (res) => {
        console.log(`%c 跨小程序/APP登录完成！ res: ${res}`, 'color:#0f0;')
        dynamicLoginRes = res;

        // console.log('%c callbackQueue', 'color:#0f0;')
        // console.log(callbackQueue.length)

        // console.log('%c [flushCBQueue] 完成，将 needDynamicLogin, dynamicLoginDone 都置为 false:', 'color:#0f0;')
        needDynamicLogin = false;
        dynamicLoginDone = false;
        flushCBQueue(res, callbackQueue);
        sendMetric("bbz_subscribe_dynamic_login_res", loginType, res, crossToken);
      });
    } else {
      // console.log('%c [publish] 需要同步 + 未完成 => 不需要调，只要加到队列，等待正在同步的接口的返回 或 超时即可', 'color:#0f0;')
    }
  } else {
    // console.log('%c 不需要同步登录态，直接flush callback', 'color:#0f0;')
    // console.log('%c waitPublishExecutedCBs', 'color:#0f0;')
    // console.log(waitPublishExecutedCBs.length)
	  flushCBQueue(false, waitPublishExecutedCBs); // 不需要同步登录态
  }
}

function subscribe(callback) {
  // 考虑到文件加载顺序，至少等 onLaunch 中的 publish 执行完成，确认是否需要同步登录态后，再等待同步登录态完成 或 3000ms延时
  if (!publishExecuted) {
    console.log('%c 等 onLaunch 中的 publish 执行完成，先存一下callback', 'color:#0f0;')
    waitPublishExecutedCBs.push(callback);
    return;
  }

  // BU订阅时，通过 onLaunch 的入参得知需要同步登录态且尚未完成，包裹并保存 callback
  if (!checkDynamicLoginStatus()) {
    console.log('%c 需要同步登录态且尚未完成，包裹并保存 callback', 'color:#0f0;')
    wrapperAndSaveCBs(callback);
    return;
  }

  // BU订阅时，已经同步登录态成功，则直接执行callback
  if (typeof callback === "function") {
    console.log(`%c 已经同步登录态成功，则直接执行callback， dynamicLoginRes: ${dynamicLoginRes}`, 'color:#0f0;')
    callback(dynamicLoginRes);
  }
}

function sendMetric(ubtName, type, res, crossToken) {
  cwx.sendUbtByPage.ubtMetric({
    name: ubtName, //申请生成的Metric KEY
    tag: {
      type: type,
      dynamicLoginRes: res,
      value: crossToken,
    }, //自定义Tag
    value: 1, //number 值只能是数字
  });
}

export default {
  publish,
  subscribe,
};

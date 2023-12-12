import {cwx} from "../../cwx";

let resolvePrivacyAuthorization = null; // 隐私授权弹窗的回调
let userAgreeOnWX = null; // 微信_用户是否同意隐私授权
let cacheComponentMap = null; // 组件信息映射表

let customReport = null; //用户自定义上报

export const canIUseExit = wx.canIUse("exitMiniProgram");
export const canIUsePrivacyAuthorize =
    wx.canIUse("onNeedPrivacyAuthorization") &&
    wx.canIUse("requirePrivacyAuthorize");

const AUTH_PREFIX = "auth";
let n = 0;
const createGUID = function () {
    return AUTH_PREFIX + "_" + n++;
};


/**
 * 给组件使用：用户点击组件的按钮时，触发此方法，将用户的选择存起来，然后将用户选择上报给微信
 * @param {*} status
 */
let userChoice = null; // 用户点击组件的 同意或拒绝 按钮，保存用户的选择
export const handleUserChoice = function (status) {
    cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_privacyAuth_handleUserChoice`, {
        status,
        resolvePrivacyAuthorization: typeof resolvePrivacyAuthorization
    });
    userChoice = status;
    // 如果此时存在 resolvePrivacyAuthorization，则触发 resolvePrivacyAuthorization
    if (resolvePrivacyAuthorization) {
        handleResolve(status);
    }
};

/**
 * 用户自定义上报
 * @param status
 * @param buttonId
 */
export const handleCustomizedReporting = function (status, buttonId) {
    if (typeof status !== "boolean" || !buttonId) {
        throw new Error("自定义上报信息错误！");
    }
    if (resolvePrivacyAuthorization) {
        handleResolve(status, buttonId);
    } else {
        customReport = {
            status,
            buttonId
        }
    }
}

function handleResolve(status, buttonId) {
    if (status) {
        console.log("%c 上报给微信，用户同意授权隐私信息", "color: red;")
        resolvePrivacyAuthorization({buttonId: buttonId || "agree-btn", event: "agree"});
        return;
    }

    console.log("%c 上报给微信，用户不同意授权隐私信息", "color: red;")
    resolvePrivacyAuthorization({
        buttonId: buttonId || "disagree-btn",
        event: "disagree",
    });
}

/**
 * 给组件使用：组件实例创建时，调用此方法，将组件信息添加到映射表中
 * @param {*} componentIns
 */
export const addComponentToMap = function (componentIns) {
    if (userAgreeOnWX) {
        // 用户已经同意隐私授权，直接返回
        return;
    }

    // 添加组件信息到映射表
    // 获取页面信息：页面路径、authGUID
    const page = getCurrentPages()[getCurrentPages().length - 1];
    const route = cwx.getCurrentPageRouter();
    const guid = createGUID();
    if (!cacheComponentMap) {
        cacheComponentMap = {};
    }
    cacheComponentMap[guid] = {
        pagePath: route,
        componentIns,
    };
    // 将 guid 绑定到 页面实例上，原生 及 Taro 页面，能成功获取到此属性值
    page._authGUID = guid;
    return guid; // 返回 guid, 将 guid 传递给组件，绑定到组件实例上
};

/**
 * 从映射表中获取组件信息
 * @param {*} guid
 * @returns
 */
export const getComponentFromMap = function (guid) {
    return cacheComponentMap[guid];
};

/**
 * 给组件使用：当组件销毁时，调用此方法，将组件信息从映射表中移除
 * @param {*} guid
 */
export const removeComponentFromMap = function (guid) {
    // 从映射表中移除组件信息
    delete cacheComponentMap[guid];
};

/**
 * 公共使用：退出小程序
 * @param {*} msg
 * @returns
 */
export const exitMiniProgram = function (msg) {
    cwx && cwx.sendUbtByPage && cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_privacyAuth_exitMiniProgram`, {
        msg: typeof msg === 'string' && msg || ''
    });

    if (canIUseExit) {
        // 退出小程序
        wx.exitMiniProgram({
            success: () => {
                console.log("退出小程序成功")
            },
            fail: () => {
                console.error("退出小程序失败")
            },
            complete: () => {
            },
        });
        return true;
    }
    return false;
};

/**
 * 启动时调用：初始化隐私授权
 */
const initPrivacyAuthorize = function () {};

// initPrivacyAuthorize();

export default {
    initPrivacyAuthorize,
    addComponentToMap,
    canIUseExit,
    canIUsePrivacyAuthorize,
    exitMiniProgram,
};

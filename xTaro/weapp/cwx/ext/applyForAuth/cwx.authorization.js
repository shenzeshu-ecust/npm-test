import { cwx, __global } from "../../cwx";

/**
 * 弹窗组件上绑定了哪些属性，什么时候绑定的：
 * init: nextCall 为 空数组
 * showFloatComponent: 添加 apiScope, 标识当前展示的弹窗是属于哪个 API 范围的
 */

// todo? 加 API 级別的配置，MCD 配置
// let obj = {
//   type,
//   apis,
//   action,
//   desc,
//   time // todo, 弹窗的限制时长
// }

const componentSelector = "#cwxAuthFloat";
/**
 * 位置：微信 native 弹窗
 * 存储：wx.saveFileToDisk
 * 通讯录：wx.chooseContact
 * 相机：相册+照相机（图片、视频） —— wx.chooseImage, wx.chooseVideo, wx.chooseMedia
 * 麦克风：微信 native 弹窗
 */
const apiNameScopeMapping = {
    // 拍摄或选择相册中的图片、视频
    scanCode: "camera",
    chooseMedia: "camera",
    chooseImage: "camera",
    chooseVideo: "camera",
    chooseContact: "contact",
    saveFileToDisk: "disk", // 保存文件系统的文件到用户磁盘，仅在 PC 端支持
};
// 文案信息分为 应用级别、API 级别，这里是 API级别的内容，应用级别的从 config.js 中读取
const apiScopeTextMapping = {
    // 拍摄或选择相册中的图片、视频
    camera: {
        action: "访问您的相机/摄像头/相册",
        desc: "将获取你的相机/摄像头/相册权限，用于获取图片或视频来丰富点评内容、发送社区动态、更换头像、上传凭证等",
    },
    contact: {
        action: "访问您的手机通讯录",
        desc: "将获取你的通讯录权限，用于在订单填写页面快速选择您通讯录中的联系人",
    },
    disk: {
        action: "访问您的磁盘",
        desc: "将获取你的存储权限，用于保存图片/视频到本地",
    },
};

// 授权状态枚举
const noneStatus = "none"; // 可以展示弹窗
const agreeStatus = "agree"; // 同意
const rejectStatus = "reject"; // 拒绝
const limitStatus = "limit"; // 受弹窗频率限制，首页中，关闭某一弹窗后，重启小程序后不弹相同内容，建议间隔超过8小时
const defaultLimitHour = 8;

// 错误信息枚举
const limitMsg = "受弹窗频率限制，暂时禁止调用该 API";
const rejectMsg = "用户拒绝授权";
const errorMsg = "未引入授权组件，为确保符合个人信息保护法规定，禁止调用该 API";

// 本地缓存 key
const storageKey = "INFO_PROTECTION_AUTHORIZATION";
// 内存变量缓存：保存授权状态，在小程序一个生命周期内有效
// 本地缓存处理前的数据结构，本地缓存是字符串（多做了一次 JSON.stringify）
// storageValue = {
//   // 即，api 所属范围: 是否授权时间及状态
//   apiName 对应的 apiScope: {
//     bTime: 弹窗的时间戳,
//     status: "agree" 或 "reject"
//   }
// }

// 当前正在等待授权结果的 BU 调用的 API 及 options 队列
// 数据结构：
// 即 apiScode 类型 : 调用队列
// let callApiQueue =  {
//   "apiNameScopeMapping 中对应的 key 或 apiName":
//       [
//         {
//           apiName: "BU 调用的 apiName",
//           options: options, // BU 入参，看看有没有传入多个参数的情况 todo???
//           customFloatInfo: {} // BU 自定义弹窗的文案
//         },
//         ......
//       ]
// }
let callApiQueue = {};

function getSwitchConfig() {
    // MCD 配置的总开关，将值存到 __global.infoProtectionAuthSwitch 中，默认值为 true
    cwx.configService.watch("infoProtectionAuth", (res) => {
        // console.log("【监听】MCD开关配置 返回: ", res.switch);
        // console.log(
        //     "__global.infoProtectionAuthSwitch",
        //     __global.infoProtectionAuthSwitch
        // );

        if (res && typeof res.switch !== "undefined") {
            __global.infoProtectionAuthSwitch = res.switch;
        }
    });
}

function getApiCacheAuthorization(apiName) {
    try {
        let apiAuthInfo = getApiAuthCache();
        // 查询 apiName 对应的 apiScope, 现有 mapping 中无对应的 apiScope apiName 作为 apiScope
        let apiScope = apiNameScopeMapping[apiName] || apiName;

        // 根据 apiScope 来查询 授权状态
        if (apiAuthInfo && typeof apiAuthInfo[apiScope] !== "undefined") {
            const { bTime, status } = apiAuthInfo[apiScope];
            // 用户同意，可以直接调用接口 wx[apiName]
            if (status === agreeStatus) {
                return status;
            }

            if (
                new Date().getTime() - bTime <
                defaultLimitHour * 60 * 60 * 1000
            ) {
                // console.log(
                //     "上一次弹窗是在8小时内，用户未同意 + 不能弹窗，不管是拒绝 还是 未授权，都不能调 wx API。"
                // );
                if (status === rejectStatus) {
                    return rejectStatus;
                } else {
                    return limitStatus;
                }
            }

            // 修改本地缓存：删除相应的缓存
            delApiCacheAuthorization(apiName);
            return noneStatus;
        }
    } catch (e) {
        console.error(e);
    }
    // 本地缓存无相关授权信息，可以弹窗
    return noneStatus;
}

function getApiAuthCache() {
    let apiAuthInfo = {};

    let authorizationStr = cwx.getStorageSync(storageKey) || "";
    cwx.sendUbtByPage.ubtDevTrace("wxapp_cwx_authorization_getApiCache", {
        authorizationStr,
    });
    if (authorizationStr) {
        try {
            apiAuthInfo = JSON.parse(authorizationStr) || {};
        } catch (error) {
            console.error(error);
            apiAuthInfo = {};
        }
    }

    return apiAuthInfo;
}

function delApiCacheAuthorization(apiName) {
    let apiAuthInfo = getApiAuthCache();
    // 删 apiScope
    let apiScope = apiNameScopeMapping[apiName] || apiName;
    delete apiAuthInfo[apiScope];
    cwx.setStorageSync(storageKey, JSON.stringify(apiAuthInfo));
    cwx.sendUbtByPage.ubtDevTrace("wxapp_cwx_authorization_delApiCache", {
        apiName,
        apiScope,
        apiAuthInfo: JSON.stringify(apiAuthInfo),
    });
}

export function setApiCacheAuthorization({ status, apiScope }) {
    let apiAuthInfo = getApiAuthCache();
    // 存 apiScope
    apiAuthInfo[apiScope] = {
        status,
        bTime: new Date().getTime(),
    };
    cwx.setStorageSync(storageKey, JSON.stringify(apiAuthInfo));
    cwx.sendUbtByPage.ubtDevTrace("wxapp_cwx_authorization_setApiCache", {
        status,
        apiScope,
        apiAuthInfo: JSON.stringify(apiAuthInfo),
    });
    if (status) {
        flushAuthorizationApi(apiScope, status);
    }
}

export function callNextApiFloat() {
    const authFloadComponent = getFloatComponent();
    cwx.sendUbtByPage.ubtDevTrace("wxapp_cwx_authorization_callNextApiFloat", {
        compType: typeof authFloadComponent,
        nextCall: JSON.stringify(
            (authFloadComponent && authFloadComponent.nextCall) || []
        ),
    });
    //判断 nextCall 的值 然后调用callDialog，找个内部api调用
    if (
        authFloadComponent &&
        authFloadComponent.nextCall &&
        authFloadComponent.nextCall.length
    ) {
        let apiScope = authFloadComponent.nextCall.shift();
        showFloatComponent(authFloadComponent, apiScope);
    } else if (authFloadComponent && typeof authFloadComponent.apiScope !== "undefined"){
        // todo, 暂时修复报错，需要查下根本原因
        // 卸载绑定在上面的属性
        authFloadComponent.apiScope = null;
    }
}

//同类授权可以批量执行比如 [chooseImage,chooseMedia]
function flushAuthorizationApi(apiScope, status) {
    const queue = callApiQueue[apiScope] || [];
    let q = null;

    cwx.sendUbtByPage.ubtDevTrace(
        "wxapp_cwx_authorization_flushAuthorizationApi",
        {
            apiScope,
            status,
            countQueue: queue.length,
        }
    );
    while ((q = queue.shift())) {
        let apiName = q["apiName"];
        let options = q["options"];
        if (status === agreeStatus) {
            wx[apiName](options);
        } else {
            flushFail(options, rejectMsg);
        }
    }
}

// 拒绝授权、错误情况（未引入组件）
const flushFail = function (options, errMsg) {
    options.fail &&
        options.fail({
            errMsg,
        });
    options.complete &&
        options.complete({
            errMsg,
        });
};

function getFloatComponent() {
    const page = cwx.getCurrentPage();
    const component = page.selectComponent(componentSelector);
    return component;
}

// 暂未考虑超时的情况
function createAuthorizationFn(apiName) {
    return function (options = {}, customFloatInfo = null, forceLimit = false) {
        // 记录初始信息及入参
        cwx.sendUbtByPage.ubtDevTrace(
            "wxapp_cwx_authorization_createdFn_start",
            {
                apiName,
                customFloatInfo: JSON.stringify(customFloatInfo || {}),
                forceLimit,
                MCDSwitch: __global.infoProtectionAuthSwitch,
            }
        );
        // 若组件存在 且 apiScope 相同，则直接存到 callApiQueue 中
        let status = null;
        let apiScope = apiNameScopeMapping[apiName] || apiName;
        const authFloadComponent = getFloatComponent();
        if (
            authFloadComponent &&
            authFloadComponent.apiScope &&
            authFloadComponent.apiScope === apiScope
        ) {
            cwx.sendUbtByPage.ubtDevTrace(
                "wxapp_cwx_authorization_createdFn_apiScope_exist",
                {
                    apiName,
                    apiScope,
                    countWaiting: callApiQueue[apiScope].length,
                }
            );
            callApiQueue[apiScope].push({
                apiName,
                options,
                customFloatInfo,
            });
            return;
        } else {
            console.log("%c 授权弹窗组件及API需结合起来一起使用，详情请查看： http://tripdocs.nfes.ctripcorp.com/tripdocs/book?dynamicDir=189&docId=2954", "color:red")
            status = getApiCacheAuthorization(apiName);
        }

        console.log("------ apiName:", apiName);
        console.log("------ status:", status);
        const noLimit = forceLimit ? false : __global.infoProtectionAuthSwitch;

        // 强制调用时，非同意授权的情况下，一律展示弹窗，让用户选择是否授权
        if (noLimit && status !== agreeStatus) {
            status = noneStatus;
        }

        cwx.sendUbtByPage.ubtDevTrace(
            "wxapp_cwx_authorization_createdFn_final_status",
            {
                apiName,
                apiScope,
                status,
            }
        );

        if (status === rejectStatus) {
            flushFail(options, rejectMsg);
        } else if (status === limitStatus) {
            flushFail(options, limitMsg);
        } else if (status === agreeStatus) {
            //直接调用api
            wx[apiName](options);
        } else if (status === noneStatus) {
            // 48 小时弹窗
            if (authFloadComponent) {
                // 如果是当前正在获取权限的，则存到 callApiQueue
                // 如果不是当前正在获取权限的，则存到 nextCall
                if (!callApiQueue[apiScope]) {
                    callApiQueue[apiScope] = [];
                }
                callApiQueue[apiScope].push({
                    apiName,
                    options,
                    customFloatInfo,
                });

                cwx.sendUbtByPage.ubtDevTrace(
                    "wxapp_cwx_authorization_createdFn_component_info",
                    {
                        compShow: authFloadComponent.data.show,
                        compApiScope: authFloadComponent.apiScope || "",
                        apiName,
                        apiScope,
                    }
                );
                // 判断组件的展示状态
                // 1. 已展示，且 将 api 及 入参 存到 nextCall 里面，等待此次 弹窗组件做出选择后，下次展示
                if (authFloadComponent.data.show) {
                    if (authFloadComponent.apiScope !== apiScope) {
                        authFloadComponent.nextCall.push(apiScope);
                    }
                } else {
                    // 2. 未展示
                    showFloatComponent(authFloadComponent, apiScope);
                }
            } else {
                cwx.sendUbtByPage.ubtDevTrace(
                    "wxapp_cwx_authorization_createdFn_lack_component",
                    {
                        apiName,
                        apiScope,
                    }
                );
                flushFail(options, errorMsg);
            }
        }
    };
}

function showFloatComponent(authFloadComponent, apiScope) {
    // 修改缓存，记录展示弹窗的时间
    setApiCacheAuthorization({ apiScope });
    // 2. 未展示，记录弹窗类型
    authFloadComponent.apiScope = apiScope;
    // 查找 apiScope 相应的配置信息：优先使用自定义的，其次用默认的（硬编码）
    // todo, 这里存在一个问题，如果是同一个 apiScope, 不同的 apiName, 就取第一个 apiName 的 options.customFloatInfo
    let apiFloatInfo =
        callApiQueue[apiScope][0].customFloatInfo ||
        apiScopeTextMapping[apiScope] ||
        {};
    cwx.sendUbtByPage.ubtDevTrace(
        "wxapp_cwx_authorization_showFloatComponent",
        {
            apiScope,
            apiFloatInfo: JSON.stringify(apiFloatInfo),
        }
    );
    // 显示 弹窗组件
    authFloadComponent.callDialog(apiFloatInfo);
}

export default {
    getSwitchConfig,
    createAuthorizationFn,
    chooseMedia: createAuthorizationFn("chooseMedia"),
    chooseImage: createAuthorizationFn("chooseImage"),
    chooseVideo: createAuthorizationFn("chooseVideo"),
    chooseContact: createAuthorizationFn("chooseContact"),
    saveFileToDisk: createAuthorizationFn("saveFileToDisk"),
    scanCode: createAuthorizationFn("scanCode"),
};

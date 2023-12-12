/**
 * @file cwx初始化文件，请求openid等操作
 */
import { cwx, __global } from "../cwx.js"
import authorization from "../ext/applyForAuth/cwx.authorization"

let configService = require('cwx.config.js').default;
cwx.configService = configService;
import cryptoFetch from"./cwx.cryptoFetch.js";
import { checkFCP } from "./performance/checkFCP" // FCP 检测
import { checkWhiteScreen } from "./performance/checkWhiteScreen" // 白屏检测
import { observeWXPerformance } from "./performance/checkWXFCP";
import { checkUserAuthAtSetup } from "./perInfoProtect/checkRediToGuide"
const clientidStorageKey = 'clientID';

let kCIDSuccessMetricName = "100963" //CID获取成功埋点
let kCIDFailtureMetricName = "100964" //CID获取失败埋点
let kCIDServerRetryCount = 20; //CID 服务失败重试次数
let kCIDServerRetryTimestamp = 200;//CID 服务重试间隔
let DebugLog = false ? console.log : function () {};

// 测试腾讯地图APP打开微信小程序的场景
function testTencentMap() {
    try {
        const testData = {
            testTime: +(new Date()),
            testValue: 'test_tencent_map_0426'
        }
        wx.setStorageSync('cwx_storage_test', testData);
        cwx.sendUbtByPage.ubtDevTrace('weapp_cwx_storage_setSync', testData);
    } catch (error) {
        cwx.sendUbtByPage.ubtDevTrace('weapp_cwx_storage_setSync_error', {
            errMsg: error.message
        });
    }

    try {
        const testRes = wx.getStorageSync('cwx_storage_test');
        const info = wx.getStorageInfoSync ? wx.getStorageInfoSync() : {};
        cwx.sendUbtByPage.ubtDevTrace('weapp_cwx_storage_getSync', {
            value: testRes || "",
            type: typeof testRes,
            keys: info.keys || "",
            currentSize: info.currentSize || "",
            limitSize: info.limitSize || "",
            fnType: typeof wx.getStorageInfoSync
        });
    } catch (error) {
        cwx.sendUbtByPage.ubtDevTrace('weapp_cwx_storage_getSync_error', {
            errMsg: error.message
        });
    }

    setTimeout(function () {
        try {
            const testRes = wx.getStorageSync('cwx_storage_test');
            cwx.sendUbtByPage.ubtDevTrace('weapp_cwx_storage_getTimeout', {
                value: testRes,
                type: typeof testRes
            });
        } catch (error) {
            cwx.sendUbtByPage.ubtDevTrace('weapp_cwx_storage_getTimeout_error', {
                errMsg: error.message
            });
        }
    }, 200);
}
let setup = function () {
    // 1. 初始化CPage
    cwx.config.init();
    // 1.0 个保改造3期，启动时检查并初始化用户授权状态
    const userAuthCode = checkUserAuthAtSetup()
    cwx.sendUbtByPage.ubtDevTrace("weapp_perInfoProtect_checkUserAuthAtSetup", {
      userAuthCode
    })
    // 1.1 开启 wx.getPerformance() 监听
    observeWXPerformance();
    // 1.2 启动 FCP 检测
    checkFCP();
    // 1.3 启动白屏检测
    checkWhiteScreen();
    // 2. 摇一摇注册
    console.log('注册摇一摇事件')
    let shark = require('cwx.shark.js').default;
    shark.init();
    // 3. 获取 mktOpenId
    cwx.cwx_mkt._getMarketOpenIDHash(function () {
        console.log('cwx.cwx_mkt.openid = ', cwx.cwx_mkt.openid)
        cwx.Observer.noti("OpenIdObserver", cwx.cwx_mkt.openid)
    })
    cwx.cwx_mkt._getShareTicketInfo(function () { // todo??? 获取shareTicket，服务端接口不维护了，后续会下掉，不建议使用
        console.log('cwx.cwx_mkt.openGId = ', cwx.cwx_mkt.openGId)
        cwx.Observer.noti("openGIdObserver", cwx.cwx_mkt.openGId)
    })
    testTencentMap();
    //获取ClientID,目前的业务依赖是：cid依赖mktOpenId
    requestCID(cwx, 1, function (cid) {
        if (cid && cid.length) {
            cwx.Observer.noti("CIDReady", cid)
            CIDCallback(cid);
        }
    });
}

function CIDCallback (value) {
    console.log('获取到的本机cid是', value)
    /** 获取cid之后获取ab */
    cwx.ABTestingManager.fetchABService(value, function () {
        cwx._homeABTest = cwx.ABTestingManager.valueForKeySync("180828_idh_wsypk");
        console.log('首页的ab版本第二次确认为', cwx._homeABTest);
    });
    // 请求获取 MCD 小程序配置
    try {
        configService.run();
    } catch (e) {
        console.error(e);
    }

    // 监听 MCD 配置的请求加解密开关
    cryptoFetch.enableCrypto();
    // 监听 MCD 配置的授权弹窗开关
    authorization.getSwitchConfig();
    
    try {
        cwx.configService.watch("cwebviewTarget", (res) => { // 配置成两个 key，是为了分离开，便于BU分别使用
            console.log('>>>>>> MCD 配置的 cwebview 目标页和分享页 地址：', res);
            if(res.targetPagePath && res.sharePagePath) {
                __global.cwebview = res;
            }
        })
        cwx.configService.watch("scwebviewTarget", (res) => {
            console.log('>>>>>> MCD 配置的 scwebview 目标页和分享页 地址：', res);
            if(res.targetPagePath && res.sharePagePath) {
                __global.scwebview = res;
            }
        })
    } catch(error) {

    }
    /**
     * 自动上报地址
     * 只有小程序启动时，用户是已授权定位 且 MCD 配置的 timer > 0 的情况下，才会上报位置信息
     */
    try {
        let frequency = 0;
        let lbs_timer;
        cwx.configService.watch('lbsnew', function (t) {
            clearInterval(lbs_timer);
            frequency = parseFloat(t.time)

            function locLog() {
                cwx.locate.startGetGeoPoint({
                    success: function (res) {
                        let reqData;
                        if (res && res.latitude && res.longitude) {
                            reqData = {
                                "head": {
                                    "syscode": "",
                                    "lang": "",
                                    "auth": "",
                                    "cid": cwx.clientId,
                                    "ctok": "",
                                    "cver": __global.cversion,
                                    "sid": "",
                                    "extension": [
                                        {
                                            "name": "",
                                            "value": ""
                                        }
                                    ],
                                    "sauth": ""
                                },
                                "location": {
                                    "country": "",
                                    "province": "",
                                    "city": "",
                                    "district": "",
                                    "detailAddress": "",
                                    "latitude": res.latitude,
                                    "longitude": res.longitude,
                                    "extension": ""
                                },
                                "deviceProfile": {
                                    "appId": __global.mcdAppId,
                                    "token": "",
                                    "clientId": cwx.clientId,
                                    "platform": 0,
                                    "openUUID": cwx.user.uuid,
                                    "iMEI": "",
                                    "mAC": "",
                                    "iDFA": "",
                                    "vendor": "",
                                    "deviceType": "",
                                    "deviceName": "",
                                    "oS": "",
                                    "oSVersion": "",
                                    "androidId": "",
                                    "appVersion": "",
                                    "sourceId": "",
                                    "pushSwitch": 0,
                                    "appPushSwitch": 0,
                                    "marketPushSwitch": 0,
                                    "extension": ""
                                },
                                "wifiList": [
                                    {
                                        "bSSID": "",
                                        "sSID": ""
                                    }
                                ],
                                "baseStationList": [
                                    {
                                        "mCC": "",
                                        "mNC": "",
                                        "lAC": "",
                                        "cID": ""
                                    }
                                ],
                                "extension": ""
                            }
                        }
                        if (!reqData) {
                            return
                        }

                        cwx.request({
                            url: "/restapi/soa2/13556/json/uploadLocation",
                            method: "POST",
                            data: reqData,
                            success: function (res) {
                                console.warn("auto loc report submit success!" + new Date().toString() + "frequency is " + frequency + " minutes");
                                console.warn(res)
                            },
                            fail: function () {
                                console.warn("auto loc report submit fail!do nothing");
                            }
                        });
                    }
                });
            }

            function autoLog() {
                console.log('准备上报LBS')
                cwx.getSetting({
                    success(res) {
                        console.log('用户权限设置如下');
                        console.log(res.authSetting);
                        if (res.authSetting['scope.userLocation']) {
                            locLog()
                        }
                    }
                })
            }

            if (frequency > 0) {
                autoLog();
                lbs_timer = setInterval(autoLog, frequency * 1000 * 60)
                //lbs_timer = setInterval(autoLog, 12000)
                //时间按分钟算
            }
        })
    } catch (e) {
        console.error(e)
    }
}


/** private */
let requestCID = function (cwx, retryCount, callback) { // retryCount 重试次数
    DebugLog("requestCID 请求CID ： ", retryCount)

    if (retryCount > kCIDServerRetryCount) {
        callback && callback("");
        DebugLog("requestCID 超过最大重试次数 ： ", retryCount)
        return;
    }
    //获取ClientID
    let clientID = correctClientID((cwx.clientID ||  cwx.getStorageSync(clientidStorageKey)), 'cache'); // 优先从内存变量中取值

    // 检查 clientID 的值是否正常，异常值将被置为空字符串
    function correctClientID (clientID, origin) {
        if (/^\d{20}$/.test(clientID)) {
            if (clientID.slice(0, cwx.mcdAppId.length) === cwx.mcdAppId) {
                return clientID;
            }
            console.error("请检查配置的 cwx.mcdAppId 值是否正确, cwx.mcdAppId:", cwx.mcdAppId)
        }

        try {
            cwx.removeStorageSync(clientidStorageKey)
        } catch (e) {
            console.log(e);
        }
        cwx.sendUbtByPage.ubtMetric({
            name: "wxapp_cwx_setup_clientid_abnormal", //申请生成的Metric KEY
            tag: { err_cid: clientID, origin }, //自定义Tag
            value: 1, //number 值只能是数字
        });
        return "";
    }

    if (clientID && clientID.length) {
        DebugLog("requestCID CID 获取缓存 ： ", retryCount, " cid : ", clientID);
        cwx.clientID = clientID;
        callback && callback(clientID);

        // CID 获取成功
        cwx.sendUbtByPage.ubtMetric({
            name: kCIDSuccessMetricName,
            value: 1,
            tag: {
                "statusCode": "200",
                "cid": clientID,
                "retryCount": retryCount,
                'useCache': 1,
                "appId": __global.appId
            },
            callback: function (response) {
                DebugLog("Debug CID : ", kCIDSuccessMetricName, " response = ", response)
            }
        })
        return;
    }

    let fail = function (res) {
        cwx.clientID = "";
        // CID 获取失败
        let tag = {
            "statusCode": (res && res.statusCode) || "",
            "system": cwx.wxSystemInfo.system,
            "platform": cwx.wxSystemInfo.platform,
            "wxVersion": cwx.wxSystemInfo.version,
            "retryCount": retryCount,
            "appId": __global.appId
        }
        tag.errMsg = (res && res.errMsg) || ""
        tag.model = cwx.wxSystemInfo.model || ""

        cwx.sendUbtByPage.ubtMetric({
            name: kCIDFailtureMetricName,
            value: 1,
            tag: tag,
            callback: function (response) {
                DebugLog("Debug CID : ", kCIDFailtureMetricName, " response = ", response, " tag = ", tag)
            }
        })
        DebugLog("requestCID CID 获取服务失败 ： ", retryCount, " cid : ", cwx.clientID, " statusCode ", (res && res.statusCode) || "")
        setTimeout(function () {
            requestCID(cwx, retryCount + 1, callback)
        }, kCIDServerRetryTimestamp)
    };
    let success = function (res) {
        if (res.statusCode == 200 && res.data && res.data.clientId && res.data.clientId.length) {
            cwx.clientID = correctClientID(res.data.clientId, 'request');
            cwx.setStorage({
                key: clientidStorageKey,
                data: res.data.clientId
            });
            cwx.sendUbtGather.createCID(res.data.clientId)
            // CID 获取成功
            cwx.sendUbtByPage.ubtMetric({
                name: kCIDSuccessMetricName,
                value: 1,
                tag: {
                    "statusCode": res.statusCode,
                    "cid": res.data.clientId,
                    "retryCount": retryCount,
                    'useCache': 0,
                    "appId": __global.appId
                },
                callback: function (response) {
                    DebugLog("Debug CID : ", kCIDSuccessMetricName, " response = ", response)
                }
            })
            DebugLog("requestCID CID 获取服务成功 ： ", retryCount, " cid : ", cwx.clientID)
            callback && callback(cwx.clientID)
        } else {
            fail && fail(res)
        }
    }

    // 注意：1. 获取 clientID 改成不依赖 mktOpenid
    // 2. 一个请求 createClientId 的过程中，不发createClientId的请求，直到 complete
    cwx.request({
        url: "/restapi/soa2/12538/createClientId",
        method: "POST",
        data: {
            appId: cwx.mcdAppId,
            platformCode: "1", // 标记手机系统类型，曾照源说：实际已没啥含义了。因此写死为 "1"
            deviceId: cwx.cwx_mkt.openid || '', // 不依赖 cwx.cwx_mkt.openid （取值随缘）
        },
        success: success,
        fail: fail,
    })
    console.log('查看一下clientid', cwx.clientID);
}

export default setup;

import {
    cwx
} from "../cwx.js";

/**
 * auth: tczhu
 * breif: 提供ABTesting功能
 * @module cwx/abtesting
 **/

const AB_STORAGE_KEY = "ABTestingManager";
let ABResult = {};
let ABResultExpResult = [];
let fetchCBS = []; // 正在请求abtest结果的过程中调用 fetchABService ，入参的callback，会存到这里
let fetchStatus = "begin"; // 标记当前发出 abtest 请求的状态，枚举值： begin, fetching, done 
let apiCallQueue = []; // 异步API优先从缓存取ab结果，当缓存无值&&请求状态未完成(不为 done)时，将callback存放到此处，待请求返回时再执行callback
let watchDic = {}; // 存放 BU 调用 watch 时入参的 callback

// AB服务
let fetchABService = function (cid, cb) {
    if (fetchStatus === "fetching") {
        return fetchCBS.push(cb);
    } else if (fetchStatus === "done") {
        return cb && cb();
    }
    fetchStatus = "fetching";
    cwx.request({
        //url: 'https://m.ctrip.com/restapi/soa2/12378/getWeixinABData',
        url: "https://m.ctrip.com/restapi/soa2/16647/getABTestData",
        data: {
            expCodes: "",
            clientID: cwx.clientID || cid || '',
            appId: cwx.extMcdAppId,
            lastUpdateTime: "",
            supplementList: [""],
            head: {
                syscode: "",
                lang: "String",
                auth: "String",
                cid: "String",
                ctok: "String",
                cver: "",
                sid: "String",
                extension: [{
                    name: "String",
                    value: "String",
                }, ],
                pauth: "String",
                sauth: "String",
                appid: "",
            },
        },
        method: "POST",
        success: function (res) {
            fetchStatus = "done";
            if (res.statusCode == "200" && res.data && res.data.Result) {
                console.warn("ABTest读取结果为");
                console.warn(res.data.Result);
                let abs = [];

                try {
                    abs = JSON.parse(res.data.Result);
                } catch (e) {}
                for (let i = 0; i < abs.length; i++) {
                    let ab = abs[i];
                    ABResult[ab.ExpCode] = ab.ExpVersion;
                    ABResultExpResult.push({
                        expCode: ab.ExpCode,
                        abValue: ab.ExpVersion,
                        expResult: ab.ExpResult,
                    });
                }
                cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_abtest_result', ABResult);

                for (let k in watchDic) {
                    if (watchDic[k].length) {
                        let fn;
                        while ((fn = watchDic[k].pop())) {
                            fn(ABResult[k]);
                        }
                    }
                }

                cwx.setStorageSync(AB_STORAGE_KEY, ABResultExpResult);
            }
            flushApiCallQueue();
            if (fetchCBS.length) {
                let fn;
                while (fn = fetchCBS.shift()) {
                    fn()
                }
            }
            cb && cb()
        },
        fail: function (res) {
            fetchStatus = "done";
            flushApiCallQueue();
            console.log('fail res = ', res)
        }
    })
}

//根据试验号获取Value,同步
let valueForKeySync = function (key) {
    let value = null;
    let abs = cwx.getStorageSync(AB_STORAGE_KEY);
    if (abs) {
        value = getValueByType(key, abs, "abValue");
    }
    return value;
}

//异步获取试验号
let valueForKeyAsync = function (key, callback) {
    //因为 cwx.getStorage其实是同步的API,所以不需要考虑在调用时 fetchStatus为begin，调用结束时fetchStatus为done的情况
    cwx.getStorage({
        key: AB_STORAGE_KEY,
        success: function (res) {
            let abs = res && res.data || [];
            const value = getValueByType(key, abs, "abValue");
            if (value === null && fetchStatus !== "done") {
                return apiCallQueue.push({
                    api: "valueForKeyAsync",
                    key,
                    callback
                });
            }
            // let value = null
            // for (let i = 0; i < abs.length; i++) {
            // let ab = abs[i];
            // if (ab.expCode == key) {
            // value = ab.abValue
            // cwx.sendUbtByPage.ubtTrace('o_abtest_expresult_weixin', ab.expResult)
            // break
            // }
            // }
            callback && callback(value);
        }
    })
}

//同步获取所有ab数据
let valueForExpresultSync = function (key) {
    let value = null;
    let abs = cwx.getStorageSync(AB_STORAGE_KEY);
    if (abs) {
        value = getValueByType(key, abs, "expResult");
    }
    return value;
}

//异步获取所有ab数据
let valueForExpresultAsync = function (key, callback) {
    // 因为 cwx.getStorage 其实是同步的 API ,
    // 所以不需要考虑在调用时 fetchStatus 为 begin，调用结束时 fetchStatus 为 done 的情况
    cwx.getStorage({
        key: AB_STORAGE_KEY,
        success: function (res) {
            let abs = res && res.data || [];
            const value = getValueByType(key, abs, "expResult", true);
            if (value === null && fetchStatus !== "done") {
                //如果此时还没有请求成功, waiting queue 中
                return apiCallQueue.push({
                    api: "valueForExpresultAsync",
                    key,
                    callback
                });
            }
            callback && callback(value);
        },
    })
}

/**
 * 执行api请求queue
 */
function flushApiCallQueue() {
    if (apiCallQueue.length) {
        let call = null;
        while (call = apiCallQueue.shift()) {
            const {
                api,
                key,
                callback
            } = call;
            if (api === "valueForExpresultAsync") {
                valueForExpresultAsync(key, callback);
            }
            if (api === "valueForKeyAsync") {
                valueForKeyAsync(key, callback);
            }
        }
    }
}

/**
 * 根据不同的类型 获取不同的key值
 * @param key
 * @param abs
 * @param type
 * @returns {null}
 */
function getValueByType(key, abs, type, isASync) {
    let value = null;
    for (let i = 0; i < abs.length; i++) {
        let ab = abs[i];
        if (ab.expCode === key) {
            let ubtKey = "";
            if (type === "expResult") {
                value = ab.expResult
                if (isASync) {
                    ubtKey = "wxapp_abtest_abs_async";
                } else {
                    ubtKey = "wxapp_abtest_abs_sync";
                }
            } else {
                value = ab.abValue
                ubtKey = "o_abtest_expresult_weixin";
            }
            cwx.sendUbtByPage.ubtTrace(ubtKey, ab.expResult)
            break;
        }
    }
    return value;
}

function watch(key, callback) {
    watchDic[key] = watchDic[key] || [];
    watchDic[key].push(callback);
    if (key in ABResult) {
        let fn;
        while ((fn = watchDic[key].pop())) {
            console.log(fn);
            fn(ABResult[key]);
        }
    }
}

export default {
    fetchABService,
    valueForKeySync,
    valueForKeyAsync,
    watch,
    valueForExpresultAsync,
    valueForExpresultSync,
};
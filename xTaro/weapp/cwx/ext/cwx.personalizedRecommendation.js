import {cwx} from "../cwx.js";

const prSettingKey = "PERSONALIZED_RECOMMENDATION_CACHE";

const getPRSettingTimeout = 10 * 1000; // 超时时间
/**
 * 默认全部打开
 * @type {{personalRecommendSwitch: boolean, localRecommendSwitch: boolean, marketSwitch: boolean}}
 */
let prDefaultCache = {
    personalRecommendSwitch: true,
    localRecommendSwitch: true,
    marketSwitch: true
}

/**
 * 当前服务端获取的消息，当前小程序活动状态下最新配置
 * @type {{}}
 */
let memoryCache = {}

/**
 * 初始化默认缓存
 */
const initPRSetting = function () {
    let localCache = cwx.getStorageSync(prSettingKey);
    if (localCache) {
        try {
            if (typeof localCache === 'string') {
                localCache = JSON.parse(localCache);
            }
        } catch (e) {
            localCache = {};
        }
        if (Object.keys(localCache).length) {
            console.log('取 本地缓存 localCache 值:', localCache);
            memoryCache = localCache;
        }
    }
}

initPRSetting();

/**
 * 更新本地和内存缓存
 * @param options
 */
const updatePRCache = function (settings) {
    for(let key in settings) {
        memoryCache[key] = settings[key]; //直接更新memory缓存
    }
    cwx.setStorageSync(prSettingKey, memoryCache) //更新localStorage缓存
}
let isSyncSetting = false; // 
/**
 * 只取缓存，如果有就取没有就返回空
 * 兼容服务端修改，先简单的来处理
 * @returns {{}}
 */
const getPrSettingSync = function () {
    if (Object.keys(memoryCache).length > 0) {
        return memoryCache;
    } else if(!isSyncSetting){
        //此处去取一次,等缓存更新
        isSyncSetting = true;
        getPRSetting();
    }
    return {};
}
/**
 * 获取个性化设置
 * @returns {Promise<{nearRecommended: boolean, recommendation: boolean}|{}>}
 */
const getPRSetting = async function () {
    if (Object.keys(memoryCache).length > 0) {
        return memoryCache;
    }
    try {
        const serverSettings = await _getPRSettingFromServer(); // 开关数据已处理完成，值为 true / false
        // console.log('>>>>>>>>>> 开关数据已处理完成，值为 true / false，serverSettings:', serverSettings);
        if (serverSettings && typeof serverSettings['personalRecommendSwitch'] !== 'undefined') {
            // 再判断下 serverSettings 的值是否有效 
            cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_success', {
                serverSettings: JSON.stringify(serverSettings)
            });
            isSyncSetting = false; // 标记着已经成功获取到服务端返回的个性化配置开关值，成功更新了 memorySetting，能取到有效值了
            updatePRCache(serverSettings);
            return serverSettings;
        }
        cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_resInvalid', {
            serverSettings: JSON.stringify(serverSettings)
        });
        console.log('服务端返回的 res.data.result === 1，但再次确认时发现返回值无效，取 prDefaultCache 值:', prDefaultCache);
        return prDefaultCache;
    } catch (e) {
        cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_catchError', {
            error: JSON.stringify(e)
        });
        console.log('调用 reject(), 返回值无效 / fail回调 / 超时');
    }
    console.log('返回值无效 / fail回调 / 超时，取 prDefaultCache 值:', prDefaultCache);
    return prDefaultCache;
}

/**
 * 此处是在设置页面调用的
 * @param settings
 */
const setPRSetting = function (settings, callback) {
    // 此处会监听openId，有值再请求
    _sendPRSettingToServer(settings, (requestSuccess) => {
        if (requestSuccess) { // reportSwitchs 成功，才 update
            updatePRCache(settings);
        }
        if (typeof callback === 'function') {
            callback(requestSuccess);
        }
    });
}
/**
 * 将配置传递到服务端
 * todo?此处需要不需要做上传到服务端失败处理？方案也简单，发送成功也设置个缓存，跟本地缓存做个对比，如果不一致将本地缓存再发一次到服务端
 * todo可以先不做
 * @param openid
 * @param settings
 * @private
 */
const _sendPRSettingToServer = function (settings, callback) {
    cwx.Observer.addObserverForKey("CIDReady", function (cid) {
        //send to server
        let data = {
            appId: cwx.mcdAppId,
            idType: 3, // ID类型  1 携程Uid  (只从auth中反解，不能在接口中直接使用)  2 OpenUid  3  CID (小程序不太建议上报这个维度，量太大) 4 UUID
            id: cid // 要确保有 openid 再发请求
        }
        for (let key in settings) {
            data[key] = settings[key] ? 1 : 0; // 发送数据给服务端时，才将 boolean 转成 number，不修改 settings 的值
        }
        cwx.request({
            method: 'post',
            url: '/restapi/soa2/12538/reportSwitchs',
            data: data,
            success: function (res) {
                console.log('success res:', res);
                if (res && res.statusCode && res.data && res.data.result === 1) {
                    console.log('reportSwitchs success, 返回数据 有效');
                    console.log(res.data);
                    cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_reportSwitchs_success', {
                        resData: JSON.stringify(res.data)
                    });
                    if (typeof callback === 'function') {
                        callback(true);
                    }
                } else {
                    cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_reportSwitchs_resInvalid', {
                        res: JSON.stringify(res)
                    });
                    console.log('reportSwitchs success, 返回数据 无效');
                    if (typeof callback === 'function') {
                        callback(false);
                    }
                }
            },
            fail: function (err) {
                console.log('reportSwitchs fail, err:', err);
                cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_reportSwitchs_fail', {
                    err: JSON.stringify(err)
                });
                if (typeof callback === 'function') {
                    callback(false);
                }
            }
        });
    });
}

/**
 * 通过pageId,从服务端获取设置信息
 * @returns {*}
 * @private
 */
const _getPRSettingFromServer = function () {
    let timer = null;
    console.log('请求开始计时');
    let promiseTimeout = new Promise(function (resolve, reject) {
        timer = setTimeout(function () {
            console.log('请求 超时')
            cwx.sendUbtByPage.ubtMetric({
                name: 'wxapp_cwx_getPRSetting_getSwitchs_timeout',
                tag: {getPRSettingTimeout: getPRSettingTimeout},
                value: getPRSettingTimeout
            });
            reject({status: "timeout"});
        }, getPRSettingTimeout);
    });
    let requestPromise = new Promise(function (resolve, reject) {
        cwx.Observer.addObserverForKey("CIDReady", function (cid) { // todo, 需要整理 并 完善 OpenIdObserver 的 noti 场景
            //send to server
            cwx.request({
                method: 'post',
                url: '/restapi/soa2/12538/getSwitchs',
                data: {
                    appId: cwx.mcdAppId,
                    idType: 3, // ID类型  1 携程Uid  (只从auth中反解，不能在接口中直接使用)  2 OpenUid  3  CID (小程序不太建议上报这个维度，量太大) 4 UUID
                    id: cid, // 确保有 openid 再发请求
                },
                success: function (res) {
                    console.log('请求 成功');
                    if (res && res.statusCode && res.data && res.data.result === 1) {
                        cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_getSwitchs_success', {
                            resData: JSON.stringify(res.data)
                        });
                        console.log('请求成功，返回 有效数据');
                        let {personalRecommendSwitch, localRecommendSwitch, marketSwitch} = res.data;
                        // 统一处理返回值：服务端返回的是 number 转成 boolean（-1 或 1 为 true，0 为 false）
                        personalRecommendSwitch = [-1, 1].includes(personalRecommendSwitch) ? true : false; // -1 取默认值 true
                        localRecommendSwitch = [-1, 1].includes(localRecommendSwitch) ? true : false; // -1 取默认值 false
                        marketSwitch = [-1, 1].includes(marketSwitch) ? true : false; // -1 取默认值 true
                        // 统一处理
                        resolve({
                            personalRecommendSwitch,
                            localRecommendSwitch,
                            marketSwitch
                        });
                    } else {
                        cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_getSwitchs_resInvalid', {
                            res: JSON.stringify(res)
                        });
                        console.log('请求成功，返回 无效数据');
                        reject({});
                    }
                },
                fail: function (err) {
                    cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getPRSetting_getSwitchs_fail', {
                        err: JSON.stringify(err)
                    });
                    console.log('请求 失败');
                    reject(err);
                },
                complete() {
                    //关闭定时任务
                    clearTimeout(timer);
                }
            });
        });
    });
    return Promise.race([promiseTimeout, requestPromise]);
}

export default {
    getPRSetting,
    getPrSettingSync,//如果没有服务端数据更新或者客户端缓存，则返回空对象
    setPRSetting
}

import util from '../cwx/ext/util.js'
import {cwx} from "../cwx/cwx.js";
import {checkAuthorizationLimit} from "./cwx.authorizationFrequency";
import { locate48HoursLimitKey } from "./getAuthCode"

let callbackQueue = [];
let locateCache = {};
let lastCallGetLocationTime = null; //走内存缓存
let isGetting = false;
let UserNotAllow = false;
let popedUpWithinLimitPeriod = false;
const defaultCoordType = "gcj02";
const defaultInterval = 8000;
let defaultCwxLocateConfig = {
    popedUpLimitHour: 48,
    frequencySecond: 12
};
let cwxLocateConfig = defaultCwxLocateConfig;

// {
//     "gcj02":{
//       success:null,
//       fail:null,
//       complete:null
// }
// }

let callingTimerMap = {}

/**
 * 批量执行各种类型回调
 * @param type
 */
const flushCallbacks = function (cbType, type) {
    setTimeout(function(){
        // console.log('flushCallbacks 开始 +++++++++++++++++++++');
        const deleteQueue = [];
        const cacheData = {...(locateCache[type] || {})}; // 取出坐标系类型一致的定位结果（缓存）
        cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getLocation_flushCallbacks', {
            cache: JSON.stringify(locateCache[type] || {}),
            data: JSON.stringify(cacheData),
            cbType,
            type
        });
        if (callbackQueue && callbackQueue.length) {
            // cbMap 的数据结构： { success, fail, complete, type }
            callbackQueue.forEach(function (cbMap, index) {
                if (cbMap.type === type) { // 取出坐标系类型一致的待触发回调函数
                    // locateCache 的数据结构： { 'gcj02': { success: res的值, fail: err的值, complete: res的值, time: 时间戳 }
                    // console.log('flush================', cacheData);
                    if (typeof cbMap[cbType] === "function") {
                        if(cbType === 'success' && cacheData[cbType] || cbType !== 'success') {   
                            cbMap[cbType](cacheData[cbType]);
                            delete  cbMap[cbType];
                        }
                    }
                    if (cbType === 'complete') {
                        // 只有是complete执行后，才删除该回调
                        deleteQueue.push(index);
                    }
                }
            })
            if (deleteQueue.length) {
                //删除已经执行完的complete
                deleteQueue.forEach(function (index) {
                    callbackQueue.splice(index, 1)
                })
            }
        }
    },0)
}

function sendUbtMetric(keyId, data, value) {
    cwx.sendUbtByPage.ubtMetric({
        name: keyId,
        tag: data,
        value: value
    });
}

function getSettingWithLimit(interval) {
    let startTime = new Date().getTime();
    let timeout = null;
    // getSting 也存在超时情况，但是不多，此时应该可以允许bu访问，可能会弹出，也可能不弹出
    // 此处添加timeout的原因是，不能因为getSetting超时影响到定位api的超时
    let timeoutPromise = new Promise(function (resolve) {
        timeout = setTimeout(function () {
            // 记录， getSetting 超时的情况有多少？
            sendUbtMetric('wxapp_cwx_getSetting_timeout', {
                UserNotAllow,
                interval
            }, (new Date().getTime() - startTime))
            havePopedUpWithinLimitPeriod('wxapp_cwx_getSetting_timeout_popedUp_within48h', startTime, interval);
            resolve();
        }, interval);
    });

    let gettingPromise = new Promise(function (resolve) {
        cwx.getSetting({
            success: function (res) {
                clearTimeout(timeout);
                const authSetting = res.authSetting || {};
                const scopeLocation = authSetting['scope.userLocation'];
                cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getLocation_getSetting_success', {
                    authSetting: JSON.stringify(authSetting),
                    UserNotAllow
                });
                // console.log('>>>>>> cwx.getSetting res:', res);
                // console.log('>>>>>> 用户定位授权情况，scopeLocation:', scopeLocation);

                if (typeof scopeLocation === 'undefined') {
                    // 用户未接受定位授权（未同意也未拒绝）
                  // console.log('用户未接受定位授权（未同意也未拒绝）');
                    havePopedUpWithinLimitPeriod('wxapp_cwx_getSetting_success_popedUp_within48h', startTime, interval);
                } else {
                    UserNotAllow = scopeLocation === true ? false : true; // scopeLocation 为 true，意味着：用户曾经明确同意授权定位
                }
                // console.log('>>>>>> 最终 UserNotAllow 的值:', UserNotAllow);
                resolve();
            },
            fail: function () {
                clearTimeout(timeout);
                sendUbtMetric('wxapp_cwx_getLocation_getSetting_fail', {
                    UserNotAllow,
                    interval
                }, (new Date().getTime() - startTime))
              // console.log('获取用户的当前设置 失败');
                havePopedUpWithinLimitPeriod('wxapp_cwx_getSetting_fail_popedUp_within48h', startTime, interval);
                resolve();
            }
        });
    });

    return Promise.race([timeoutPromise, gettingPromise]);
}

// 不知道用户的授权情况时，调用此API，根据上次弹窗是否超过48小时来定 UserNotAllow 的值（强制设置为true 或 沿用内存变量现有的值）
function havePopedUpWithinLimitPeriod(ubtKeyName, startTime, interval) {
    popedUpWithinLimitPeriod = false; // 重置
    if (!checkAuthorizationLimit(locate48HoursLimitKey, cwxLocateConfig.popedUpLimitHour * 60 * 60 * 1000)) {
        // console.log('>>>>>> 上一次弹窗是在48小时内');
        // 没有获取到用户真实授权情况，并且48小时之内出现过定位授权弹窗，为了安全起见，不允许调用（即 视为用户此次拒绝授权定位）
        UserNotAllow = true;
        popedUpWithinLimitPeriod = true;
        sendUbtMetric(ubtKeyName, {
            UserNotAllow,
            interval
        }, (new Date().getTime() - startTime))
    }
}

/**
 * 添加一层关于48小时之内不重复弹出的处理逻辑
 * @param success
 * @param fail
 * @param complete
 * @param type
 */
function _getLocation({success, fail, complete, type = defaultCoordType, interval = defaultInterval}) {
    getSettingWithLimit(interval).then(function () {
        if (UserNotAllow) {
            // console.log('getSetting 的结果：用户拒绝授权定位');
            const err = {errMsg: 'getLocation:fail auth deny'}
            if (popedUpWithinLimitPeriod) {
                // console.log('原因是：48小时弹框限制，用户实际未接受定位授权，视为用户拒绝授权');
                err.errMsg = 'have poped up within limit period';
                UserNotAllow = false; // 走到这里，说明UserNotAllow是被强制置为 true 的（并不知道用户真正的授权情况），需要重置为 false
            }
            // 拒绝定位情况下，不设置缓存
            fail && fail(err);
            complete && complete(err);
            return;
        }

        let startTime = new Date().getTime();
        //虽然这个timeout的时间包含了getSetting的时间，但是这种情况是无法避免的
        let isTimeOut = false;
        const timeOut = setTimeout(() => {
            isTimeOut = true;
            let err = {errMsg: '获取当前定位 超时'};
            // console.log(err.errMsg);
            sendUbtMetric('wxapp_wx_getLocation_timeout', {
                UserNotAllow,
                type,
                interval
            }, (new Date().getTime() - startTime));

            // 超时情况下，不设置缓存
            fail && fail(err);
            complete && complete(err);
        }, interval)
        wx.getLocation({ // 这里是为了重写 原生API，因此需要调用 相应小程序提供的全局变量，而不是 cwx.xxx
            type, //默认是gcj02
            success: function (res) {
                // console.log('wx.getLocation success ====== res:', res);
                //即使超时已经执行了，仍然更新该类型的缓存
                if (typeof locateCache[type] === 'undefined') {
                    locateCache[type] = {}
                }
                locateCache[type].success = res;
                delete locateCache[type].fail;
                // console.log('wx.getLocation success ====== locateCache[type]:', locateCache[type]);

                cwx.sendUbtByPage.ubtDevTrace('wxapp_wx_getLocation_success_res', {
                    cache: JSON.stringify(locateCache[type] || {}),
                    type,
                    func: 'wx'
                })
                cwx.sendUbtByPage.ubtDevTrace('wxapp_wx_getLocation_success', {
                    res: JSON.stringify(res || {}),
                    type,
                    interval,
                    costTime: (new Date().getTime() - startTime)
                })
                if (isTimeOut) {
                    // console.log('wx.getLocation success ====== 已超时');
                    sendUbtMetric('wxapp_wx_getLocation_success_isTimeout', {
                        interval
                    }, (new Date().getTime() - startTime));
                    return;
                }
                clearTimeout(timeOut);
                success && success(res);
            },
            fail: function (err) {
                // console.log('wx.getLocation fail ====== err:', err);
                err.error = "GET_GEO_FAILED";
                if (typeof locateCache[type] === 'undefined') {
                    locateCache[type] = {}
                }
                locateCache[type].fail = err;
                delete locateCache[type].success;
                // console.log('wx.getLocation fail ====== locateCache[type]:', locateCache[type]);

                cwx.sendUbtByPage.ubtDevTrace('wxapp_wx_getLocation_fail_res', {
                    cache: JSON.stringify(locateCache[type] || {}),
                    type,
                    func: 'wx'
                })

                sendUbtMetric('wxapp_wx_getLocation_fail', {
                    type,
                    interval
                }, (new Date().getTime() - startTime))
                if (err && err.errMsg === 'getLocation:fail auth deny') {
                    // 是用户主动点击【拒绝授权按钮】触发的fail回调
                    // console.log('wx.getLocation fail ====== 用户主动点击【拒绝授权按钮】');
                    UserNotAllow = true;
                    sendUbtMetric('wxapp_wx_getLocation_fail_userDeny', {
                        type
                    }, (new Date().getTime() - startTime))
                } else {
                    // console.log('wx.getLocation fail ====== err:', err);
                }
                if (isTimeOut) {
                    // console.log('wx.getLocation fail ====== 已超时');
                    sendUbtMetric('wxapp_wx_getLocation_fail_isTimeout', {
                        type,
                        interval
                    }, (new Date().getTime() - startTime));
                    return;
                }
                clearTimeout(timeOut);
                fail && fail(err);
            },
            complete: function (res) {
                // console.log('wx.getLocation complete ====== res:', res);
                
                sendUbtMetric('wxapp_wx_getLocation_complete', {
                    type,
                    interval
                }, (new Date().getTime() - startTime));
                if (typeof locateCache[type] === 'undefined') {
                    locateCache[type] = {}
                }
                locateCache[type].complete = res;
                locateCache[type].time = new Date().getTime();

                cwx.sendUbtByPage.ubtDevTrace('wxapp_wx_getLocation_complete_res', {
                    cache: JSON.stringify(locateCache[type] || {}),
                    type,
                    costTime: (new Date().getTime() - startTime)
                });
                
                if (isTimeOut) {
                    // console.log('wx.getLocation complete ====== 已超时');
                    return;
                }
                clearTimeout(timeOut);
                complete && complete(res);
            }
        })
    });
}

function getCwxLocateConfig() {
    try {
        cwx.configService.watch('cwxLocate', (res) => {
            // console.log('请求返回的webview白名单列表为：', res);
            try {
                if(res && typeof res.frequencySecond !== 'undefined' && typeof res.popedUpLimitHour !== 'undefined') {
                    cwxLocateConfig = {
                        frequencySecond: res.frequencySecond,
                        popedUpLimitHour: res.popedUpLimitHour
                    }
                } else {
                    // console.log('MCD appConfig 返回的数据 无效');
                }
            } catch (e) {
                // console.log('getCwxLocateConfig error 111');
            }
        })
    } catch (e) {
        // console.log('getCwxLocateConfig error 222');
    }
}

/**
 * 重写定位方法，默认间隔12s钟调用一次
 * @param success
 * @param fail
 * @param complete
 * @param type
 */
function getLocation({success, fail, complete, type = defaultCoordType, interval = defaultInterval, manual}) {
  // console.log('cwx.getLocation 被调用，入参：', {type, manual, interval});
    let currentPage = cwx.getCurrentPage();
    // 记录 这个接口的调用次数 及 入参情况
    sendUbtMetric('wxapp_cwx_getLocation', {
        type,
        interval
    }, interval)

    // 只需要处理存在异步调用的情况下，存在的超时情况，应该不常见，暂时不起作用
    const uuid = util.createUUID("Locate_UUID");
    getCwxLocateConfig(); // 异步、动态地从 MCDConfig 获取限频配置值
    let frequencyTime = cwxLocateConfig.frequencySecond * 1000; // 此数据应该从appConfig中获取，默认是12s, 异步、动态地从 MCDConfig 获取
    //todo? mannal 暂时还是直接调用，感觉量不会很大
    // if (manual) {
    //     if (typeof manual === 'number') {
    //         // BU 通过入参 manual 自定义调用频率
    //         frequencyTime = manual;
    //         // 记录 是哪个页面传了 manual，值是多少
    //         console.log('>>>>>>', currentPage, '入参了 manual:', manual);
    //         sendUbtMetric('wxapp_cwx_getLocation_manual', {
    //             type,
    //             pagePath: (currentPage && currentPage.route) || ''
    //         }, manual);
    //     } else {
    //         frequencyTime = 1;//默认是1s
    //     }
    // }
    if (manual) {
        sendUbtMetric('wxapp_cwx_getLocation_manual', { // 记录入参了 manual 并且 manual值不为 false 的
            type,
            pagePath: (currentPage && currentPage.route) || ''
        }, manual);
        _getLocation({success, fail, complete, type, interval});
        return uuid;
    }
    const now = new Date().getTime();
    const diff = lastCallGetLocationTime ? now - lastCallGetLocationTime : frequencyTime;
    if (diff >= frequencyTime) {
        // 如果当前在请求中或者请求间隔大于等于12s，则重新发送请求
        // callbackQueue.push({
        //     success, fail, complete, type
        // });

        // 重置 locateCache, lastCallGetLocationTime, isGetting
        // todo? 后续如果入参 manual 能走到这里，需要注意：manual 情况下 不更新上次请求时间

        cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getLocation_init_locateCache', {
            cache: JSON.stringify(locateCache[type] || {}),
            type,
            note: 'handleWxLocation'
        });

        locateCache[type] = {
            success: null,
            fail: null,
            complete: null,
            time: null
        }
        lastCallGetLocationTime = now; // 重置上次调用时间
        isGetting = type;

        //todo? 此处有个缺陷，就是当某一个类型的请求超时时间设置的比较短时，可能会导致其他的queue中的回调都按照超时来处理
        _getLocation({
            type,
            interval,
            success: function (res) {
                if (typeof locateCache[type] === 'undefined') {
                    locateCache[type] = {}
                }
                locateCache[type].success = res;
                delete locateCache[type].fail;
                
                cwx.sendUbtByPage.ubtDevTrace('wxapp_wx_getLocation_success_res', {
                    cache: JSON.stringify(locateCache[type] || {}),
                    type,
                    func: '_getLocation'
                })
                flushCallbacks("success", type);
                success && success(res);
            },
            fail: function (err) {
                // todo, 理解一下这里的备注，超时或者拒绝定位情况下，需要该err，此时该回调早于真实的wx.getLocation回调
                if (typeof locateCache[type] === 'undefined') {
                    locateCache[type] = {}
                }
                locateCache[type].fail = err;
                delete locateCache[type].success;
                flushCallbacks("fail", type);
                fail && fail(err);
            },
            complete: function (res) {
                // todo, 理解一下这里的备注，超时或者拒绝定位情况下，需要该err，此时该回调早于真实的wx.getLocation回调
                isGetting = false;
                if (typeof locateCache[type] === 'undefined') {
                    locateCache[type] = {}
                }
                locateCache[type].complete = res;
                locateCache[type].time = new Date().getTime();
                
                cwx.sendUbtByPage.ubtDevTrace('wxapp_wx_getLocation_complete_res', {
                    cache: JSON.stringify(locateCache[type] || {}),
                    type,
                    func: '_getLocation'
                });
                flushCallbacks("complete", type);
                complete && complete(res);
            }
        });
    } else {
        //先判断缓存是否有效
        let typeCache = locateCache[type] || {};
        // console.log('受12s限制，准备使用缓存值，typeCache:', typeCache);

        if (typeCache && typeCache.time && (now - typeCache.time > frequencyTime)) {
            // console.log('缓存值已失效，有效期 frequencyTime:', frequencyTime);
            // 把 超出有效期的 缓存值 置为 null
            typeCache = null;
            
            cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getLocation_init_locateCache', {
                cache: JSON.stringify(locateCache[type] || {}),
                type,
                note: 'cacheInvalid'
            });
            locateCache[type] = {
                success: null,
                fail: null,
                complete: null,
                time: null
            };
        }
        if (typeCache && typeCache.complete && typeCache.success) { // 满足这个条件，标志着：有缓存值，并且缓存在有效期内
            // console.log('有缓存值且在有效期内');
            // 记录，有3个含义：1. 缓存有值且在有效期内；2. 回调函数的入参取的是缓存值；3. 记录了缓存值、获取时的时间戳、有效期
            cwx.sendUbtByPage.ubtDevTrace('wxapp_cwx_getLocation_flush_locateCache', {
                typeCache: JSON.stringify(typeCache),
                frequencyTime
            });

            if (typeCache.fail) {
                fail && fail(typeCache.fail)
            } else {
                success && success(typeCache.success)
            }
            complete && complete(typeCache.complete)
        } else {
            if (isGetting && isGetting === type) {
                // console.log('此时正在请求同类型坐标系的定位，等待返回结果并执行回调');
                // 记录：此时正在请求定位，等待返回结果（返回结果时，会 flush 回调）。显示的数字为 限频时长
                sendUbtMetric('wxapp_cwx_getLocation_wait_isGetting', {
                    type // 相当于 同时记录了 type 和 isGetting 的值
                }, frequencyTime)
                //当前处于请求中 并且类型跟当前的请求类型一致，将callbacks放到队列中
                callbackQueue.push({
                    success, fail, complete, type
                });
            } else {
              // console.log('此时无有效缓存 且 没有同类型定位正在请求，等待12s限制解除，重新调用定位API');
                // 记录：等待达到限频时长后，再去请求定位数据的情况
                sendUbtMetric('wxapp_cwx_getLocation_wait_getLocation', {
                    type,
                    lastCallGetLocationTime, // 上次调用接口是啥时候
                    frequencyTime // 限频时长
                }, frequencyTime - diff) // setTimeout 的时长
                //此时既没有缓存，而且当前的坐标类型也没有被请求中，则等frequencyTime - diff秒钟之后（达到限频时长后），再去请求
                callingTimerMap[uuid] = setTimeout(function () {
                    // if (callingTimerMap[uuid]) {
                    //     delete callingTimerMap[uuid];
                    //     getLocation({success, fail, complete, type, interval});
                    // }
                    delete callingTimerMap[uuid];
                  // console.log('12s限制解除，重新调用定位API');
                    getLocation({success, fail, complete, type, interval});
                }, frequencyTime - diff);
            }
        }
    }
    //如果是放到timeout中的，需要将当前的uuid返回出去，如果外面超时了，则此处的业务逻辑不再执行
    return uuid;
}

/**
 * 内部暂时不存在cancel的情况，后续再查看该方法如何处理
 * @param uuid
 */
function cancelGetLocationWithUUID(uuid) {
    if (uuid && callingTimerMap[uuid]) {
        clearTimeout(callingTimerMap[uuid]);
        delete callingTimerMap[uuid];
    }
}

export default getLocation;
export {
  cancelGetLocationWithUUID,
  getLocation
}
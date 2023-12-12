/***
 * 该文件用来装载cwx新增的方法
 */
import {cwx} from "../cwx.js"
let debugLog = true ? console.log : function () {};

let KGOTOAPPID = "101177" //跳转到外部小程序
let kBACKTOAPPID = "101175" //回退到小程序

function load_ubtMetric(options) {
    cwx.sendUbtByPage.ubtMetric && cwx.sendUbtByPage.ubtMetric({
        name: options.name,
        value: 1,
        tag: options.tag,
        callback: options.callback
    })
}

// 跳转到别的小程序
let cwx_navigateToMiniProgram = function (options) {
    console.log("cwx_navigateToMiniProgram:begin");
    if (!cwx.canIUse('navigateToMiniProgram')) {
        debugLog("微信版本过低，不支持跳转")
        options && options.complete && options.complete()
        return;
    }
    let wrapOptions = options
    try {
        //拼接市场的参数业绩参数
        let sep = "&"
        if (wrapOptions.path.indexOf("?") == -1) {
            sep = "?"
        }
        wrapOptions.path += sep + cwx.mkt.getReferrerUnion()
    } catch (e) {
        console.error("cwx_navigateToMiniProgram:err:", e);
    }

    let page = cwx.getCurrentPage()

    /** 埋点的参数 */
    let tag = {
        "fromPath": (page && (page.__route__ || page.route)) || "",
        "toPath": wrapOptions.path,
        "from": cwx.appId,
        "to": wrapOptions.appId,
    }

    /** wrap success */
    let origin_suc = wrapOptions.success
    wrapOptions.success = function (res) {
        console.log("call navigateToMiniProgram:success:", res);
        origin_suc && origin_suc(res)
        tag.result = 1;
        tag.errMsg = (res && res.errMsg) || ""
        load_ubtMetric({
            name: KGOTOAPPID,
            tag: tag,
            callback: function (res) {
                debugLog("跳转成功 ： res = ", res, " tag = ", tag)
            }
        })
    }
    let origin_fail = wrapOptions.fail
    wrapOptions.fail = function (res) {
        console.error("call navigateToMiniProgram:fail:", res);
        origin_fail && origin_fail(res)
        tag.result = 0;
        tag.errMsg = (res && res.errMsg) || ""
        load_ubtMetric({
            name: KGOTOAPPID,
            tag: tag,
            callback: function (res) {
                debugLog("跳转失败 ： res = ", res, " tag = ", tag)
            }
        })
    }
    console.log("call navigateToMiniProgram, wrapOptions:", wrapOptions);
    if(wrapOptions.openEmbedded && wx.openEmbeddedMiniProgram) {
        delete wrapOptions.openEmbedded;
        wx.openEmbeddedMiniProgram(wrapOptions)
    } else {
        delete wrapOptions.openEmbedded;
        wx.navigateToMiniProgram(wrapOptions)
    }
}

// 返回到源小程序
let cwx_navigateBackMiniProgram = function (options) {
    if (!cwx.canIUse('navigateBackMiniProgram')) {
        debugLog("微信版本过低，不支持回退")
        return
    }
    let wrapOptions = options
    let page = cwx.getCurrentPage()
    /** 埋点的参数 */
    let tag = {
        "fromPath": (page && (page.__route__ || page.route)) || "",
        "from": cwx.appId,
    }
    /** wrap success */
    let origin_suc = wrapOptions.success
    wrapOptions.success = function (res) {
        origin_suc && origin_suc(res)
        tag.result = 1;
        tag.errMsg = (res && res.errMsg) || ""
        load_ubtMetric({
            name: kBACKTOAPPID,
            tag: tag,
            callback: function (res) {
                debugLog("回退成功 ： res = ", res, " tag = ", tag)
            }
        })
    }

    let origin_fail = wrapOptions.fail
    wrapOptions.fail = function (res) {
        origin_fail && origin_fail(res)
        tag.result = 0;
        tag.errMsg = (res && res.errMsg) || ""
        load_ubtMetric({
            name: kBACKTOAPPID,
            tag: tag,
            callback: function (res) {
                debugLog("回退失败 ： res = ", res, " tag = ", tag)
            }
        })
    }

    wx.navigateBackMiniProgram(wrapOptions)
}

export default function() {
    /** 跳转到别的小程序 */
    cwx.cwx_navigateToMiniProgram = cwx_navigateToMiniProgram;
    /** 返回到源小程序 */
    cwx.cwx_navigateBackMiniProgram = cwx_navigateBackMiniProgram;
}
var __global = require('./global.js').default;
var cwx = __global.cwx;

var SekishikiMeikaiHa039 = require('../../3rd/tiny.039.min.js');

class methodDepend {
    constructor(fun, cbk) {
        this.Infinity = Infinity;
        this.NaN = NaN;
        this.undefined = undefined;
        this.null = null;
        this.isFinite = isFinite;
        this.isNaN = isNaN;
        this.parseFloat = parseFloat;
        this.parseInt = parseInt;
        this.decodeURI = decodeURI;
        this.decodeURIComponent = decodeURIComponent;
        this.encodeURI = encodeURI;
        this.encodeURIComponent = encodeURIComponent;
        this.Object = Object;
        this.Function = Function;
        this.Boolean = Boolean;
        this.Error = Error;
        this.Number = Number;
        this.Math = Math;
        this.Date = Date;
        this.String = String;
        this.RegExp = RegExp;
        this.Array = Array;
        this.Map = Map;
        this.Set = Set;
        this.JSON = JSON;
        this.Promise = Promise;
        // this.require = require;
        try {
            this.navigator = navigator;
            this.Navigator = getPrototypeForBOM(typeof Navigator == 'undefined' ? undefined : Navigator, navigator);
            this.Location = getPrototypeForBOM(typeof Location == 'undefined' ? undefined : Navigator, location);
            this.Document = getPrototypeForBOM(typeof Document == 'undefined' ? undefined : Document, document);
            this.location = location;
            this.document = document;
        } catch (e) {

        }
        this.escape = escape || undefined;
        this.callback = cbk;
        this.self = this;
        this.console = console;
        this.cwx = cwx;
        this[this.callback] = fun;
    }
}

function getPrototypeForBOM(test, instance) {
    if (typeof test != 'undefined') {
        return test;
    }
    if (typeof instance != 'undefined') {
        return Object.getPrototypeOf(instance);
    }
    return undefined;
}

let n = 0;
let fnNamePrefix = "anti_spider_fn";
const getCasKey = function ({url, ...params}, requestFn, callback, getScriptFromRsp) {

    const defaultToken = 'ftasukdqw31237rvdegf6f2';
    const fnName = fnNamePrefix + new Date().getTime() + "_" + n++;
    requestFn({
        url: url,
        data: {callback: fnName, ...params},
        success: function (res) {
            try {
                const data = getScriptFromRsp(res);
                if (!data || !data.length) {
                    callback(defaultToken, res);
                    return;
                }
                const exkey = JSON.parse(data);
                const {d, b, version} = exkey;
                const globals = new methodDepend(function (e) {
                    callback(e(), res);
                }, fnName);
                if(b.length < 100){
                    callback(b, res); 
                }
                SekishikiMeikaiHa039()(globals, {d, b})
 
            } catch (err) {
                callback(defaultToken, res);
                failedTrace(err, "request-success-fail-V1");
            }
        },
        fail: function (err) {
            callback(defaultToken, {});
            failedTrace(err, "request-fail-V1");
        }
    });
}
const createAntiSpiderRequest = function ({url, requestFn, fixedParams = {}, callback, getScriptFromRsp}) {
    requestFn = requestFn || cwx.request;
    getScriptFromRsp = getScriptFromRsp || function (rsp) {
        return rsp && rsp.data && rsp.data.data;
    }
    if (!callback) {
        failedTrace("empty callback", "empty-callback-V1")
        return
    }
    getCasKey({url, ...fixedParams}, requestFn, callback, getScriptFromRsp)
}
function failedTrace(e, type) {
    const page = cwx.getCurrentPage();
    try {
        page.ubtDevTrace && page.ubtDevTrace('HOTEL_ANTI_SPIDER_FAIL_WEAPP', {
            cid: cwx.clientID || '',
            page: page.pageId,
            err: e.stack || e,
            type: type
        });
    } catch (e) {
        console.log(e)
    }
}
export default createAntiSpiderRequest;

/**
 * demo
 *
 * // 业务方封装的获取脚本url
 const getScriptUrl = "/sevicecode/getMiniPrograme";
 const params = {
        url:getPriceUrl,
        getScriptFromRsp: function (rsp) {
            return rsp && rsp.data && rsp.data.data;
        },
        callback: function (token){
            // use token
        }
        ...others
    }
 cwx.createAntiSpiderRequest(params);

 */

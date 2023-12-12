/**
 * @module cwx\ubt
 */
import { handleViewReadyEvent, initWhiteScreen } from "../ext/performance/checkWhiteScreen";

var __global = require("../ext/global.js").default;
var cwx = __global.cwx;
var CPage = __global.CPage;
let ubtConfig = __global.ubtConfig || {};
import { sendUbtCutBackPage } from "../ext/cpage/performance.js";

var ubt_cwx = require("./ubt_wx.js").default;

function serializeQueryObj(obj) {
    var ret = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k) && k != "__navigator") {
            var t = typeof obj[k];
            if (t == "string" || t == "number" || t == "boolean") {
                ret.push(
                    encodeURIComponent(k) + "=" + encodeURIComponent(obj[k])
                );
            }
        }
    }
    return ret.length > 0 ? "?" + ret.join("&") : "";
}

class CPage_Module_UBT extends CPage.baseClass {
    constructor(options) {
        var newOptions = {};
        var _this;

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                switch (key) {
                    case "ubtTrack":
                    case "ubtMetric":
                    case "ubtTrace":
                        break;
                    case "onLoad":
                    case "onReady":
                    case "onShow":
                    case "onHide":
                    case "onUnload":
                        newOptions[key] = eventWrapper(
                            key,
                            options[key],
                            false
                        );
                        break;
                    default:
                        if (
                            !CPage.__isComponent &&
                            cwx.util.type(options[key]) == "function"
                        ) {
                            newOptions[key] = eventWrapper(
                                key,
                                options[key],
                                true
                            );
                        } else {
                            newOptions[key] = options[key];
                        }
                        break;
                }
            }
        }

        newOptions.ubtTrack = eventWrapper("ubtTrack", null, true);

        super(newOptions);
        _this = this;

        //= 创建PV
        this.__ubt_instance = ubt_cwx.createPV();

        this.__ubt_events = {};

        function eventWrapper(name, fn, isLogEvent) {
            return function (evt) {
              const curPage = cwx.getCurrentPage() || {};
              if (typeof curPage.navigateTo !== "function") {
                cwx.sendUbtByPage.ubtDevTrace("weapp_cpage_missing_navigateTo", {
                  pagePath: cwx.getCurrentPageRouter(curPage),
                  pageId: curPage.pageId || ""
                });
              }
                if (isLogEvent && _this.__ubt_isEvent(arguments)) {
                    _this.__ubt_logTap(evt, name);
                }
                var args = Array.prototype.slice.call(arguments, 0);
                var ret;
                if (fn) {
                    try {
                        let begin = new Date().getTime();

                        ret = fn.apply(_this.__page, args);

                        sendUbtCutBackPage({
                            begin,
                            lifeType: name,
                            funcRes: ret,
                            pagePath: _this.__page.route
                        })
                    } catch (e) {
                        // 错误数据收集
                        //  try {
                        //      if (typeof e == 'string') {
                        //          e = new Error(e);
                        //      }
                        //      const { name, stack, message } = e;
                        //      _this.__ubt_instance.send('error', {
                        //         name,
                        //         stack,
                        //         message,
                        //      });
                        //  } catch (e) {};

                        if (cwx.util.isDevice()) {
                            setTimeout(function () {
                                throw e;
                            }, 0);
                        } else {
                            throw e;
                        }
                    }
                }
                return ret;
            };
        }
    }

    viewReadyHandle() {
        handleViewReadyEvent(this.whiteScreenGUID);
    }

    onLoad(options) {
        super.onLoad && super.onLoad(options);
        if (this.checkPerformance) {
            // console.log("%c --- 原生页面的 checkPerformance 属性为 true", "color:#0f0");
            this.whiteScreenGUID = initWhiteScreen()
        }
        if (options.fcpGUID) {
            this.fcpGUID = options.fcpGUID
        }
        // 供 引用了 bridge.js 的 webview 内嵌 h5 使用
        if (options.bridgeGUID) {
          this.bridgeGUID = options.bridgeGUID 
        }

        // console.log("%c === observerKey cpage_onLoad ===", "color:#ff0");
        cwx.Observer.noti("cpage_onLoad", {
            ...options,
            whiteScreenGUID: this.whiteScreenGUID || "",
            __pageType: "origin",
            pagePath: cwx.getCurrentPageRouter(this.__page)
        });

        // active
        this.__ubt_totalActiveTime = 0;
        this.__ubt_querystring = serializeQueryObj(options);

        // loadTime
        this.__ubt_onLoadTime = +new Date();
        this.__ubt_isBack = false;
        this.__ubt_isBackFlag = false;
    }

    onReady() {
        super.onReady && super.onReady();
        // console.log("%c === observerKey cpage_onReady ===", "color:#ff0");
        cwx.Observer.noti("cpage_onReady", {
            fcpGUID: this.fcpGUID || "",
            bridgeGUID: this.bridgeGUID || "",
            whiteScreenGUID: this.whiteScreenGUID || "",
            __pageType: "origin",
            pagePath: cwx.getCurrentPageRouter(this.__page)
        });

        this.__ubt_instance.send("metric", {
            name: 191617,
            value: wx.buildVersion,
        });

        // active
        if (!this.__ubt_isBack) {
            this.__ubt_onActiveTime = +new Date();
        }

        // log ps
        var ubtPs = this.__ubt_getPageInfo();

        ubtPs.readyTime = +new Date() - this.__ubt_onLoadTime;
        if (!this.__isComponent) {
            if (cwx.config.ubtDebug) {
                console.log("UBT Page Performance", ubtPs);
            }
            this.__ubt_instance.send("metric", {
                name: 100359, //perf.weixin.ready
                value: ubtPs.readyTime,
            });
        }
    }

    onShow() {
        super.onShow && super.onShow();
        // console.log("%c === observerKey cpage_onShow ===", "color:#ff0");
        cwx.Observer.noti("cpage_onShow", {
            fcpGUID: this.fcpGUID || "",
            bridgeGUID: this.bridgeGUID || "",
            whiteScreenGUID: this.whiteScreenGUID || "",
            __pageType: "origin",
            pagePath: cwx.getCurrentPageRouter(this.__page),
            cpageOnShowTS: Date.now()
        });

        if (this.autoExpose) {
            cwx.sendUbtExpose.observe(this.__page || {});
        }

        // back
        if (this.hasOwnProperty("__ubt_isBackFlag")) {
            delete this.__ubt_isBackFlag;
        } else {
            this.__ubt_isBack = true;
        }

        // active
        if (this.__ubt_isBack) {
            this.__ubt_onActiveTime = +new Date();
        }

        // log pv
        var ubtPv = this.__ubt_getPageInfo();
        ubtPv.isBack = this.__ubt_isBack;
        ubtPv.url = "" + this.__page.__route__ + this.__ubt_querystring;

        if (!this.__isComponent) {
            if (cwx.config.ubtDebug) {
                console.log("UBT Pageview", ubtPv);
            }

            //=发送PV数据，包含是否需要生成新PV的逻辑
            if (ubtPv.pageId != "ignore_page_pv") {
                this.__ubt_instance = this.__ubt_instance.send("pv", ubtPv);
            }
        }
    }

    onHide() {
        super.onHide && super.onHide();
        // console.log("%c === observerKey cpage_onHide ===", "color:#ff0");
        cwx.Observer.noti("cpage_onHide", {
            fcpGUID: this.fcpGUID || "",
            bridgeGUID: this.bridgeGUID || "",
            whiteScreenGUID: this.whiteScreenGUID || "",
            __pageType: "origin",
            pagePath: cwx.getCurrentPageRouter(this.__page)
        });
        this.__page &&
            this.__page.exposeObserver &&
            cwx.sendUbtExpose.disconnect(this.__page);
        // active
        this.__ubt_totalActiveTime += +new Date() - this.__ubt_onActiveTime;
    }

    onUnload() {
        super.onUnload && super.onUnload();
        // console.log("%c === observerKey cpage_onUnload ===", "color:#ff0");
        cwx.Observer.noti("cpage_onUnload", {
            fcpGUID: this.fcpGUID || "",
            bridgeGUID: this.bridgeGUID || "",
            whiteScreenGUID: this.whiteScreenGUID || "",
            __pageType: "origin",
            pagePath: cwx.getCurrentPageRouter(this.__page)
        });

        // log active
        this.__ubt_totalActiveTime += +new Date() - this.__ubt_onActiveTime;

        if (!this.__isComponent) {
            // this.ubtTrace('ActiveTime', this.__ubt_totalActiveTime);
            this.__ubt_instance.send("metric", {
                name: 100370, //perf.weixin.ActiveTime
                value: this.__ubt_totalActiveTime,
            });
        }
    }

    __ubt_isEvent(args) {
        var evt = args[0];
        let eventTypeArr = ["tap", "longpress", "longtap", "back"];

        var ret = !!(
            args.length == 1 &&
            // && !args.callee.caller
            evt &&
            evt.timeStamp &&
            eventTypeArr.includes(evt.type) &&
            !this.__ubt_events.hasOwnProperty(evt.type + "_" + evt.timeStamp) &&
            evt.target &&
            evt.currentTarget
        );
        if (evt && evt.type === "back") {
            return ret;
        }
        ret = ret && evt.touches && evt.touches[0];
        return !!ret;
    }

    __ubt_getPageInfo() {
        var ret = {};
        if (this.__isComponent) {
            var ins = this.__page;
            while (!ins.__isComponent) {
                ins = ins.__page;
            }
            ret.pageId = "" + (ins.pageId || ins.pageid || "0");
        } else {
            ret.pageId = "" + (this.pageId || this.pageid || "0");
        }
        return ret;
    }

    __ubt_logTap(evt, fn) {
        var _this = this;
        var key = evt.type + "_" + evt.timeStamp;
        this.__ubt_events[key] = true;
        setTimeout(function () {
            delete _this.__ubt_events[key];
        }, 1000);
        var ubtEvt = this.__ubt_getPageInfo();
        ubtEvt.type = evt.type;
        ubtEvt.xpath = "//Page";
        // currentTarget
        if (!cwx.util.compare(evt.currentTarget, evt.target)) {
            ubtEvt.xpath += "/CurrentTarget";
            var currentTargetId = evt.currentTarget.id;
            if (currentTargetId) {
                ubtEvt.xpath += "[@id=" + currentTargetId + "]";
            }
            var currentTargetCid = evt.currentTarget.dataset["ubtKey"];
            if (currentTargetCid) {
                ubtEvt.xpath += "[@cid=" + currentTargetCid + "]";
            }
        }
        // target
        ubtEvt.xpath += "/Target";
        var targetId = evt.target.id;
        if (typeof fn === "string") {
            ubtEvt.xpath += "[@fn=" + fn + "]";
        }
        if (targetId) {
            ubtEvt.xpath += "[@id=" + targetId + "]";
        }
        var targetCid = evt.target.dataset["ubtKey"];
        if (targetCid) {
            ubtEvt.xpath += "[@cid=" + targetCid + "]";
        }
        ubtEvt.xpath +=
            evt.touches && evt.touches.length
                ? "[@x=" + evt.touches[0].pageX + "]"
                : "[@x=]";
        ubtEvt.xpath +=
            evt.touches && evt.touches.length
                ? "[@y=" + evt.touches[0].pageY + "]"
                : "[@y=]";

        if (cwx.config.ubtDebug) {
            console.log("UBT Page Event", ubtEvt);
        }

        this.__ubt_instance.send("useraction", {
            action: "click",
            ts: +new Date(),
            xpath: ubtEvt.xpath,
        });
    }

    ubtTrace(name, value, _extend) {
        if (value && JSON.stringify(value).length > ubtConfig.maxSize) {
            value = {
                "UBT_WARN": `The user data exceeded the upper limit of ${ubtConfig.maxSize}KB.`
            }
        }
        let traceValue = value;
        //默认不平铺
        if (!_extend?.tiled) {
            switch (cwx.util.type(value)) {
                case "string":
                case "number":
                    traceValue = value;
                    break;
                default:
                    traceValue = JSON.stringify(value);
                    break;
            }
        }
        if (cwx.config.ubtDebug) {
            var ubtTrace = this.__ubt_getPageInfo();
            ubtTrace.traceName = name;
            ubtTrace.traceValue = traceValue;
            console.log("UBT Page Trace", ubtTrace);
        }
        if (!_extend?.tiled) {
            this.__ubt_instance.send("tracelog", {
                name: name,
                value: traceValue,
                _extend: _extend || {},
            });
        } else {
            this.__ubt_instance.send("trace", {
                key: name,
                val: traceValue,
                _extend: _extend || {},
            });
        }
    }

    ubtDevTrace(name, value, _extend) {
        if (value && JSON.stringify(value).length > ubtConfig.maxSize) {
            value = {
                "UBT_WARN": `The user data exceeded the upper limit of ${ubtConfig.maxSize}KB.`
            }
        }
        let option = {
            "$.ubt.hermes.topic.classifier": "DebugCustom",
            key: name,
            val:
                typeof value != "object"
                    ? {
                        data: value + "",
                    }
                    : value,

            _extend: _extend || {},
        };
        this.__ubt_instance.send("trace", option);
    }

    ubtTrackError(options) {
        this.__ubt_instance.send("error", options);
    }

    ubtMetric(option) {
        option = option || {};
        if (
            Object.keys(option).length < 8 &&
            typeof option.pagePath !== "undefined"
        ) {
            let currentPage = cwx.getCurrentPage();
            if (currentPage && currentPage.route) {
                option["pagePath"] = currentPage.route;
            }
        }
        this.__ubt_instance.send("metric", option);
    }

    ubtExposure(name, value, _extend) {
        const { duration, ...rest } = value || {};
        rest.scene = cwx.scene || "";

        let option = {
            key: name,
            data: JSON.stringify(rest),
            duration: duration || 0,
            _extend: _extend || {},
        };
        this.__ubt_instance.send("exposure", option || {});
    }

    ubtSet(name, value) {
        ubt_cwx.set(name, value);
    }

    ubtSendPV(option) {
        /**
         * 如果产生了新的PV需要更新当前page下的ubt.pv实例对象
         * 避免新PV下的埋点数据（tracelog,metric）关联到上一个PV
         */
        this.__ubt_instance = this.__ubt_instance.send("pv", option || {});
    }
}

var UBT = {};

__global.UBT = UBT;

export default CPage_Module_UBT;

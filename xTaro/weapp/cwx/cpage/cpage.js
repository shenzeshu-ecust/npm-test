let __global = require("../ext/global.js").default;
let cwx = __global.cwx;

var instanceId = 0;
/**
 * 框架通用封装的Page构造器,劫持生命周期，方便业绩统计以及this挂载更多api
 * @module CPage
 * @constructor
 * @param {*} options
 */
var CPage = function (options) {
    if (CPage.__isComponent) {
        var copyOptions = cwx.util.copy(options);
        CPage.createInstance(copyOptions);
    } else {
        var pageData = {
            onPageScroll: function () {},
            onLoad: function () {
                // 对比页面实例
                cwx.sendUbtByPage.ubtDevTrace("weapp_cpage_onLoad_comparePage", {
                  compare: this === cwx.getCurrentPage(),
                });
                // 记录页面堆栈达到10个的情况
                cwx.sendPageRoute({ type: "origin" });
                var _this = this;
                var args = Array.prototype.slice.call(arguments, 0);
                this.originOptions = (args && args[0]) || {};

                var copyOptions = cwx.util.copy(options);
                var ins = CPage.createInstance(copyOptions);

                for (var k in ins) {
                    if (ins.hasOwnProperty(k)) {
                        if (k == "data") {
                            this.data = ins[k];
                            this.setData(ins[k]);
                        } else if (
                            k == "__cpage" ||
                            k.indexOf("__") != 0 ||
                            copyOptions.hasOwnProperty(k)
                        ) {
                            _this[k] = ins[k];
                        }
                    }
                }

                var t = ins.__proto__;

                while (t && t != Object.prototype) {
                    Object.getOwnPropertyNames(t).forEach(function (k) {
                        if (k != "constructor" && k != "__proto__") {
                            if (k.indexOf("__") != 0) {
                                if (cwx.util.type(t[k]) == "function") {
                                    if (ins[k] === t[k]) {
                                        _this[k] = t[k].bind(ins);
                                    }
                                } else {
                                    _this[k] = t[k];
                                }
                            }
                        }
                    });

                    t = t.__proto__;
                }
                
                cwx.sendUbtByPage.flush(); // 发送ubt埋点,onLoad执行之前发送
                this._isAlreadyBindPage = true;
                this.onLoad.apply(this, args);
                if (this.onShareAppMessage) {
                }
            },
        };

        if (options.data) {
            pageData.data = cwx.util.copy(options.data);
            delete options.data;
        }
        //wrap onShareAppMessage
        if (options.onShareAppMessage) {
            try {
                let oldFn = options.onShareAppMessage;

                let wrapOnShareAppMessage = function (args = {}) {
                    let shareData = oldFn.call(this, args) || {};
                    console.log("处理前的 sharedata:", shareData);
                    shareData = cwx.processShareData(args, shareData);
                    console.log("经过处理，最终返回的 sharedata:", shareData);
                    return shareData;
                };
                pageData.onShareAppMessage = wrapOnShareAppMessage;
                delete options.onShareAppMessage;
            } catch (e) {
                console.log("wrapOnShareAppMessage error");
            }
        }
        if (!options.onShareTimeline && options.showShareToTimeline) {
            try {
                let wrapOnShareTimeline = function () {
                    let shareData = cwx.processShareTimeline(
                        this.originOptions,
                        options.showShareToTimeline
                    );
                    console.log("经过处理，最终返回的 sharedata:", shareData);
                    const currentPage = cwx.getCurrentPage() || {};
                    cwx.sendUbtByPage.ubtDevTrace("weapp_cpage_shareTimeline", {
                        pagePath: (currentPage && currentPage.route) || "",
                        shareData: JSON.stringify(shareData),
                    });

                    return shareData;
                };
                pageData.onShareTimeline = wrapOnShareTimeline;
                delete options.onShareTimeline;
            } catch (error) {
                console.log("wrapOnShareTimeline error");
            }
        }
        if (options.onPageScroll) {
            pageData.onPageScroll = function () {};
        }
        for (var k in options) {
            //          if(k=='bindTextAreaBlur'){
            //            console.log(typeof(options[k]))
            //            console.log(pageData[k])
            //          }

            if (typeof (options[k] == "function")) {
                if (pageData[k] == undefined) {
                    pageData[k] = options[k];
                }
            }
        }
        
        Page(pageData);
    }
};

CPage.__isComponent = 0;
CPage.__cache = [];

CPage.createInstance = function (options) {
    var a = CPage.__isComponent;
    var ins = new CPage.baseClass(options);
    ins.__instanceId = instanceId++;

    var b = CPage.__isComponent;

    if (CPage.__isComponent) {
        CPage.__cache[CPage.__isComponent] = {
            id: ins.__instanceId,
            options: options,
            instance: ins,
        };
    }

    return ins;
};

CPage.baseClass = require("./base.js").default;

CPage.modules = {
    UBT: function () {
        return require("./ubt.js").default;
    },
    Navigator: function () {
        return require("./navigator.js").default;
    },
};

CPage.use = function (subClass) {
    if (cwx.util.type(subClass) == "string") {
        var fn = CPage.modules[subClass];
        if (cwx.util.type(fn) == "function") {
            subClass = fn();
        } else {
            throw "Unknow CPage module " + subClass;
        }
    }
    if (cwx.util.type(subClass) == "function") {
        CPage.baseClass = subClass;
    } else {
        throw "CPage module only support class";
    }
};

export default CPage;

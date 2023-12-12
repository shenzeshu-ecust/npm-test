import {cwx} from "../cwx.js";
import {navigatorOpts} from "../cpage/initNavigator";

/**
 * @file component管理
 * @desc 可以直接使用cwx.componet['city']
 * @example
 * {
    city: '/cwx/component/city/city',
    calendar: '/cwx/component/calendar/calendar',
    cwebview: '/cwx/component/cwebview/cwebview'
}
 */
let components = {
    city: "/cwx/component/city/city",
    calendar: "/cwx/component/calendar/calendar",
    cwebview: "/cwx/component/cwebview/cwebview",
    scwebview: "/cwx/component/cwebview/scwebview",
    areas: "/cwx/component/country/country",
    ocr: "/cwx/component/ocr/ocr",
    messageRecommend: "/cwx/component/messageRecommend/index",
};
let n = 0;
const createComponentKey = function (name = "") {
    return name + "_ObserverKey_" + n++;
}
let component = {};
for (let name in components) {
    (function (name) {
        component[name] = function (data = {}, callback) {
            let opts = data;
            if (arguments.length > 1) {
                opts = {
                    data: data,
                    callback: callback,
                };
            }
            let currentPage = cwx.getCurrentPage();
            opts.url = components[name];
            if (opts && opts.data) {
                opts.data.envIsMini = true; //小程序环境跳转  （false h5跳转）
                if (typeof opts.data.isNavigate === "undefined") {
                    opts.data.isNavigate = true; //navigateTo方式
                }
            }

            // 如果有指定不使用 Navigate, 则调用redirectTo, 把当前页面从History中替换掉
            if (
                ("cwebview" === name || "scwebview" === name) &&
                opts.data.isNavigate === false
            ) {
                cwx.redirectTo({
                    url: opts.url + "?data=" + JSON.stringify(opts.data),
                });
                return;
            }
            try {
                currentPage.navigateTo(opts);
            } catch (e) {
                //如果跳转报错，则使用降级方案，调用navigate实现简单的处理
                const observerKey = createComponentKey(name);
                navigatorOpts[observerKey] = {
                    data: opts.data,
                    immediateCallback: opts.immediateCallback ? opts.immediateCallback.bind(currentPage) : null,
                    callback: opts.callback ? opts.callback.bind(currentPage) : null,
                    navComplete: opts.navComplete ? opts.navComplete.bind(currentPage) : null,
                    backDatas: []
                };
                //强行将observerKey绑定到当前页面中，然后在onShow中解析
                currentPage.__naviObserver_back = observerKey;
                cwx.navigateTo({
                    url: opts.url + (/\?/.test(opts.url) ? '&' : '?') + '__naviObserver=' + observerKey,
                });
            }

        };
    })(name);
}

module.exports = component;

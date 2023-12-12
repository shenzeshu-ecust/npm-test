// 注意： cwx.cAppOnLaunch.js 中的逻辑，挪到这里了
// todo, LFCP 和 FPC 的发送时机不同，怎么实现？LFCP 是采集完整就发送（如果等生命周期触发，可能会比之前少一些数据，感觉会丢失）；FPC 是在某些时机发送，不管数据是否完整
import cwx from "../../cwx";
import initLoadPackage from "./loadPackage"
import initLandingPagePerformance from "./fcp/landingPageFcp"
import initRoutePagePerformance from "./fcp/routePageFcp"

// setup 里调用，注册监听器
export const observeWXPerformance = function () {
    if (cwx.canIUse("getPerformance")) {
        const performance = cwx.getPerformance();
        const observer = performance.createObserver((entryList) => {
            console.log("%c [performance.js] entryList:", "color:#f0f");
            console.log(entryList);
            cwx.Observer.noti("wx_performance", entryList.getEntries() || []);
        });
        //注册包下载的监听事件
        initLoadPackage();
        //注册landingPage的采集事件
        initLandingPagePerformance();
        //注册路由页面跳转的采集事件
        initRoutePagePerformance();
        observer.observe({
            entryTypes: [
                // 注意，这里的 entryTypes 会随着微信的更新而更新（可能会有增删改）
                "navigation",
                "render",
                "script",
                "loadPackage",
                // "resource" // 视图层资源加载耗时，暂时不要，返回的数据条数太多了
            ],
        });
    }
};



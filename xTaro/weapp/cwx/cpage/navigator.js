import __global from '../ext/global.js'

const cwx = __global.cwx;
const CPage = __global.CPage;
import {getNavigatorUid, navigatorOpts, pageStack, setCWXPageLoadData, getCWXPageLoadData} from "./initNavigator";
import openGroupInfo from "../ext/cwx.openGroupInfo.js";
// 使用global来维护

const tabs = (function () {
    let ret = [];
    if (__wxConfig.tabBar && __wxConfig.tabBar.list) {
        ret = __wxConfig.tabBar.list.map(function (item) {
            return item.pagePath;
        });
    } else {
        ret = __global.tabbar;// 安卓检测不到tabbar
    }
    return ret;
})();

function __getIndex(tabs, route) {
    let index = -1;
    for (let i = 0; i < tabs.length; i++) {
        let r = tabs[i];
        if (r.indexOf(route) != -1) {
            index = i;
            break;
        }
    }
    return index;
}

class CPage_Module_Navigator extends CPage.baseClass {
    constructor(options) {
        super(options);
    };

    onLoad(options) {

        // 1. 是否显示回到首页浮层
        this.showBackHomeIfNeed(options)
        // 2. 记录场景值和openid（营销相关）
        try {
            cwx.mkt.setUnion(options);
        } catch (e) {
            console.log("CPage cwx.mkt.setUnion error = ", e);
        }
        // 3. todo??? 目的是什么
        if (pageStack.length === 1 && __getIndex(tabs, this.__page.__route__) !== -1) {
            // 3.1 第二个页面 且 是tabbar页面，替换 pageStack 中首屏页面的路径
            pageStack.splice(0, 1, this.__page.__route__);
        } else {
            // 3.2 将 首屏页面 的路径存到 pageStack 中
            pageStack.push(this.__page.__route__);
        }

        let uid = null;
        delete this.__navigator_fromUid; // todo??? 
        if (options && options.hasOwnProperty('__navigator')) {
            uid = options.__navigator;
            delete options.__navigator;
            let opts = navigatorOpts[uid];
            if (opts) {
                // console.log( '__navigator_fromUid', uid );
                this.__navigator_fromUid = uid;
                options.data = opts.data;
            }
        }
        if (options && options.hasOwnProperty('__naviObserver')) {
            this.__naviObserver = options.__naviObserver;
            let opts = navigatorOpts[options.__naviObserver];
            if (opts) {
                //无法区分from还是back
                //只是为了兼容,调用组件api时，currentPage.navigateTo报错的场景
                // console.log( '__navigator_fromUid', uid );
                options.data = opts.data;
            }
        }
        const prePageLoadPromise = getCWXPageLoadData && getCWXPageLoadData();
        if (prePageLoadPromise) {
            let lastPagePreData = prePageLoadPromise;
            if (prePageLoadPromise.data) {
                lastPagePreData = prePageLoadPromise.data;
            }
            const currentPage = cwx.getCurrentPage();
            if (!prePageLoadPromise.path || (prePageLoadPromise.path && prePageLoadPromise.path === currentPage.route)) {
                if (options) {
                    options.lastPagePreData = lastPagePreData;
                } else {
                    options = {
                        lastPagePreData
                    }
                }
                //直接置空，只能相邻页面使用
                setCWXPageLoadData(null);
            }
        }
        super.onLoad && super.onLoad(options);
        this.__navigator_isBack = false;
        this.__navigator_isBackFlag = false;
        cwx._wxGetCurrentPages = getCurrentPages();
        try {
            cwx._currentPage = cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1];
        } catch (e) {
        }

        //console.error('navigatorLoad', cwx._wxGetCurrentPages)

    };

    onReady() {
        super.onReady && super.onReady();
        openGroupInfo.handlerPageOnReady();
    };

    onShow() {
        super.onShow && super.onShow();
        cwx.sendUbtGather.getPageDurationProps('pageOnShow');
        this.isRunPreLoad = false;
        // todo??? 这个判断不会一直是 true 吗？ onLoad 那里刚给 this.__navigator_isBackFlag 赋值为 false
        if (this.hasOwnProperty('__navigator_isBackFlag')) {
            delete this.__navigator_isBackFlag;
        } else {
            this.__navigator_isBack = true;
        }

        if (this.__navigator_isBack) {
            if (pageStack.length === 1 && tabs.indexOf(this.__page.__route__) !== -1) {
                pageStack.splice(0, 1, this.__page.__route__);
            }
            let uid = this.__navigator_toUid;
            if (uid && navigatorOpts[uid] && (!cwx.__skipCallback)) {
                if (navigatorOpts[uid].callback) {
                    navigatorOpts[uid].backDatas.forEach((function (data) {
                        navigatorOpts[uid].callback.call(this.__page, data);
                    }).bind(this));
                }
                if (navigatorOpts[uid].navComplete) {
                    navigatorOpts[uid].navComplete.call(this.__page);
                }
                delete this.__navigator_toUid;
            }
            if (cwx.__skipCallback == true) {
                cwx.__skipCallback = false;
            }
        }
        const _id = this.__page.__naviObserver_back
        if (_id && navigatorOpts[_id]) {
            // 从上个页面返回的降级方案
            if (navigatorOpts[_id].callback) {
                navigatorOpts[_id].backDatas.forEach((function (data) {
                    navigatorOpts[_id].callback.call(this.__page, data);
                }).bind(this));
            }
            if (navigatorOpts[_id].navComplete) {
              navigatorOpts[_id].navComplete.call(this.__page);
            }
            //只执行一次
            delete this.__page.__naviObserver_back
            delete navigatorOpts[_id];
        }
        cwx._wxGetCurrentPages = getCurrentPages();
        try {
            cwx._currentPage = cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1];
        } catch (e) {
        }
        //console.error('navigatorShow', cwx._wxGetCurrentPages)
    };

    onHide() {
        super.onHide && super.onHide();
        this.runPreLoad();
    };

    onUnload() {
        cwx.sendUbtGather.getPageDurationProps('pageOnUnload');

        if (pageStack[pageStack.length - 1] == this.__page.__route__) {
            pageStack.pop();
        }
        cwx._wxGetCurrentPages.pop()
        try {
            cwx._currentPage = cwx._wxGetCurrentPages[cwx._wxGetCurrentPages.length - 1];
        } catch (e) {
        }
        //console.error('navigatorUnload', cwx._wxGetCurrentPages)
        // console.log('######################## onUnload pageStack:', cwx.util.copy(pageStack));
    };

    runPreLoad() {
        if (this.isRunPreLoad) {
            return;
        }
        this.isRunPreLoad = true;
        if (typeof this.cwxPrePageLoad === 'function') {
            setCWXPageLoadData && setCWXPageLoadData(this.cwxPrePageLoad());
        }
    }

    shake(cb) {
        cwx._shakeTriggerMap = cwx._shakeTriggerMap || {};
        //console.error(333,this)
        cwx._shakeTriggerMap[this.__page.__route__] = cb;

    };

    navigateTo(opts) {
        let uid = getNavigatorUid();
        let url = opts.url;

        let navOpts = {
            url: url + (/\?/.test(url) ? '&' : '?') + '__navigator=' + encodeURIComponent(uid),
            success: opts.success ? opts.success.bind(this.__page) : null,
            fail: opts.fail ? opts.fail.bind(this.__page) : null,
            complete: opts.complete ? opts.complete.bind(this.__page) : null
        };

        if (this.getPageLevel() >= 10) {
            let err = {
                error: '页面层级超过10层',
                errorCode: '500'
            };
            console.log("CPage.navigateTo :", err, url);
            // console.log( "CPage.stack :", this.getPageStack() );

            navOpts.fail && navOpts.fail(err);
            navOpts.complete && navOpts.complete(err);
            return;
        }

        navigatorOpts[uid] = {
            data: opts.data,
            immediateCallback: opts.immediateCallback ? opts.immediateCallback.bind(this.__page) : null,
            callback: opts.callback ? opts.callback.bind(this.__page) : null,
            navComplete: opts.navComplete ? opts.navComplete.bind(this.__page) : null,
            backDatas: []
        };

        this.__navigator_toUid = uid;
        this.runPreLoad();
        cwx.navigateTo(navOpts);
    };

    navigateBack(data) {
        let uid = this.__navigator_fromUid || this.__naviObserver;
        if (uid && navigatorOpts[uid] && arguments.length > 0) {
            navigatorOpts[uid].backDatas.push(data);
            navigatorOpts[uid].immediateCallback && navigatorOpts[uid].immediateCallback(data);
        }
        cwx.navigateBack();
    };

    invokeCallback(data) {
        let uid = this.__navigator_fromUid || this.__naviObserver;
        if (uid && navigatorOpts[uid]) {
            navigatorOpts[uid].backDatas.push(data);
            navigatorOpts[uid].immediateCallback && navigatorOpts[uid].immediateCallback(data);
        }
    };

    getPageStack() {
        return cwx.util.copy(pageStack);
    };

    getPageLevel() {
        return this.getPageStack().length;
    };

    showBackHomeIfNeed(options) { // todo??? 这个貌似用不到了？用在 backhome 的？
        let scene = cwx.scene || "";
        if (options && options.mktshare) {
            let showBackHome = true;
            let showBackHomeSceneArr = [ // todo??? 默认值兜底，然后从 MCD 动态取值？
                '1007', // 单人聊天会话中的小程序消息卡片
                '1008', // 群聊会话中的小程序消息卡片
                '1011', // 扫描二维码
                '1014', // 小程序订阅消息（与1107相同）
                '1025', // 扫描一维码
                '1036', // App 分享消息卡片
                '1044', // 带 shareTicket 的小程序消息卡片
                '1045', // 朋友圈广告
            ]
            if (scene && !showBackHomeSceneArr.includes(scene)) {
                showBackHome = false
            }
            let homePageRoute = __global.tabbar[0];
            if (this.__page.__route__.indexOf(homePageRoute) != -1) {
                showBackHome = false
            }

            this.__page.setData({
                showBackHome: showBackHome
            })

            /**  添加埋点 */
            if (cwx.sendUbtByPage.ubtTrace && showBackHome) {
                let pageId = this.__page.pageid || this.__page.pageId || ""
                cwx.sendUbtByPage.ubtTrace('show_backto_home', {'scene': scene, 'pageid': pageId})
            }
        }
    };

    backToHome() {
        /* 回到首页 */
        let homePageRoute = __global.tabbar[0]
        wx.switchTab({
            url: "/" + homePageRoute,
        })
        /**  添加埋点 */
        if (cwx.sendUbtByPage.ubtTrace) {
            let scene = cwx.scene || ""
            let pageId = this.__page.pageid || this.__page.pageId || ""
            cwx.sendUbtByPage.ubtTrace('click_backto_home', {'scene': scene, 'pageid': pageId})
        }
    }
};

export default CPage_Module_Navigator;
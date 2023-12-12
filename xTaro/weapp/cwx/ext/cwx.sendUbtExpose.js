import {cwx} from "../cwx.js";

const UBT_KEY = 'wxapp_expose_auto';
let refreshTimer = {};

function extractUbtInfo (dataObj) {
    // 判断是否自定义埋点 keyName 了
    if (dataObj && typeof dataObj.ubtKeyName !== "undefined") {
        return {
            ubtName: dataObj.ubtKeyName,
            exposeData: dataObj.data || {}
        }
    }
    return {
        ubtName: UBT_KEY,
        exposeData: dataObj
    }
}
// page实例上有 autoExpose 属性，且其值为 true，cpage 才会调用 cwx.sendUbtExpose.observe 和 disconnect
function observe(page) {
    // 入参保持统一，都是 真正的页面实例
    let ObserverObj = {
        observeAll: true // 同时观测多个目标节点
    };
    let isNewExposeObserver = false;
    let exposeThreshold = 0.1; //默认临界值是0.1
    let exposeDuration = 500;
    if (+page.autoExpose === 2) {
        isNewExposeObserver = true;
        exposeThreshold = +page.exposeThreshold || exposeThreshold;
        exposeDuration = +page.exposeDuration || exposeDuration;
        ObserverObj.thresholds = [exposeThreshold];
        page.exposeTargets = page.exposeTargets || {};
        //在页面的onOnload中如果有exposeTimer 要主动clearInterval
        page.exposeTimer = setInterval(flushExposeTargets,200);
    }

    function flushExposeTargets() {
        let ids = Object.keys(page.exposeTargets);
        ids.forEach(function (id) {
            const {bTime, ubtName, exposeData} = page.exposeTargets[id];
            if (new Date().getTime() - bTime >= exposeDuration) {
                sendExposeData({
                    id,
                    exposeData,
                    ubtName
                })
                delete page.exposeTargets[id];
            }
        });
        console.log(Object.keys(page.exposeTargets).length)
        if(Object.keys(page.exposeTargets).length === 0){
            if(page.exposeTimer){
                clearInterval(page.exposeTimer);
                page.exposeTimer = null;
            }
        }
    }

    function sendExposeData ({
                                 id,
                                 exposeData,
                                 ubtName
                             }) {
        if (typeof page["getExposeData"] === "function") {
            const data = page["getExposeData"]({
                id,
                exposeData
            });
            exposeData = data.exposeData || exposeData;
            ubtName = data.ubtName || ubtName;
        }
        cwx.sendUbtByPage.ubtExposure(ubtName, exposeData);
    }

    page.exposeObserver = wx.createIntersectionObserver(page, ObserverObj);
    // console.log('>>>>>>>>> 添加监听', page.exposeObserver)
    page.exposeObserver
        .relativeToViewport()
        .observe('.autoExpose', (res = {}) => {
            const {id, intersectionRatio} = res;
            if (isNewExposeObserver && intersectionRatio < exposeThreshold) {
                //如果小于临界值，直接删除
                const {bTime} = page.exposeTargets[id] || {};
                if (new Date().getTime() - bTime < exposeDuration) {
                    //防止停留时间超过500ms但是还没来得及发送的情况
                    delete page.exposeTargets[id];
                }
            }
            let ubtName, exposeData;
            if ((isNewExposeObserver && intersectionRatio >= exposeThreshold) || (!isNewExposeObserver && res.intersectionRatio > 0)) {
                // 判断 是否存在 dataset 和 dataset.expose, 若不存在，则判断是否存在 id 和 getDOMProps, 用 id 来取 expose 的值
                if (res && res.dataset && res.dataset.expose) {
                    // console.log('>>>>>>>>> 曝光啦 原生', res.dataset.expose);
                    const ubtInfo = extractUbtInfo(res.dataset.expose)
                    ubtName = ubtInfo.ubtName;
                    exposeData = ubtInfo.exposeData;
                    // cwx.sendUbtByPage.ubtExposure(UBT_KEY, res.dataset.expose);
                } else if (res.id && page.getDOMProps) {
                    let props = page.getDOMProps(res.id);
                    // Taro 有两种挂载上报数据的属性名，优先取 data-* 的值
                    if (props && (typeof props['data-expose'] !== 'undefined' || typeof props.expose !== 'undefined')) {
                        // console.log('>>>>>>>>> 曝光啦 Taro', props.expose);
                        let dataObj = (typeof props['data-expose'] !== 'undefined') ? props['data-expose'] : props.expose;

                        const ubtInfo = extractUbtInfo(dataObj)
                        ubtName = ubtInfo.ubtName;
                        exposeData = ubtInfo.exposeData;
                        // cwx.sendUbtByPage.ubtExposure(ubtKeyName, sendData);
                    }
                }
            }
            if (ubtName && exposeData) {
                if (!isNewExposeObserver || !id) {
                    //老得方式，直接发送,没有id做标识位也是直接发送
                    sendExposeData({
                        id,
                        exposeData,
                        ubtName
                    })
                } else {
                    if (page.exposeTargets[id]) {
                        //如果里面有还没发送的当前节点，主动发送一次
                        flushExposeTargets();
                    }
                    page.exposeTargets[id] = {
                        bTime: new Date().getTime(),
                        ubtName,
                        exposeData
                    }
                    if(!page.exposeTimer){
                        page.exposeTimer = setInterval(flushExposeTargets,200);
                    }

                }
            }
        })
}

function refreshObserve(page, type) {
    page = page || cwx.getCurrentPage();
    // 自动判断 入参的page 是 原生小程序页面实例，还是 Taro小程序页面实例，如果是 Taro 的，需要取 .__page 属性
    if(page.__page && page.__page.getDOMProps) {
        page = page.__page;
    }
    const insId = page.__cpage && page.__cpage.__instanceId || "_";
    // 一定要 page 中已经绑定 exposeObserver ，才做 refresh 操作，没有就打印错误信息
    if(typeof page.exposeObserver === 'undefined' && !(insId && refreshTimer[insId])) {
        console.error('Cannot Find exposeObserver property IN Page!');
        return;
    }
    // console.log('>>>>>>>>> 刷新 取消监听', page.exposeObserver)
    disconnect(page);
    // 如果是 _onReady 调用，则不要延时，可以立即重新挂载 observe
    if(type !== '_onReady' && typeof page.getDOMProps === 'function') {
        // console.log('========== 内部主动调用 setTimeout observe');
        if(refreshTimer[insId]){
            clearTimeout(refreshTimer[insId]);
        }
        refreshTimer[insId] = setTimeout(() => {
            delete refreshTimer[insId];
            // console.log('>>>>>>>>> 刷新 重新绑定', page.exposeObserver)
            observe(page);
        }, 500);
        return;
    }
    observe(page);
}

function disconnect(page) {
    // console.log('>>>>>>>>> 取消监听', page.exposeObserver)
    if(page.exposeObserver) {
        page.exposeObserver.disconnect();
        page.exposeTargets = {};
        delete page.exposeObserver;
    }
    if (page.exposeTimer) {
        clearInterval(page.exposeTimer);
        page.exposeTimer = null;
    }
}

export default {
    observe,
    disconnect,
    refreshObserve
};

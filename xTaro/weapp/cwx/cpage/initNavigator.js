import cwx from "../cwx"
global.navigatorUid = global.navigatorUid || 0;
export let navigatorOpts = global.navigatorOpts || {};
export let pageStack = global.pageStack || [];
cwx._pageStack = cwx._pageStack || pageStack;
cwx._navigatorOpts = navigatorOpts;

export function getNavigatorUid() {
    return ++global.navigatorUid;
}

let prePageLoadData = null;
let preLoadTimer = null
export const setCWXPageLoadData = function (data) {
    prePageLoadData = data
    if(preLoadTimer){
        clearTimeout && clearTimeout(preLoadTimer);
    }
    if(data){
        //如果数据两分钟还没使用，则直接被回收
        preLoadTimer = setTimeout(function () {
            prePageLoadData = null;
        }, 2 * 60 * 1000);
    }
}
export const getCWXPageLoadData = function () {
    return prePageLoadData
}
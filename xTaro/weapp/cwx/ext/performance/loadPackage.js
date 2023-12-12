import cwx from "../../cwx";
import { getCommonInfo } from "./util";

const packageCache = {}
const runScriptCache = {}
let loadPackagetimer = null;
/**
 * 用来单独记录包下载时间和包中common文件的执行时间
 * @param options
 */
const initLoadPackage = function (options = {}) {
    cwx.Observer.addObserverForKey("wx_performance", function (list) {
        for (let i = 0 ; i < list.length ; i++) {
            const {name, packageName, moduleName, startTime, duration, packageSize, fileList = []} = list[i];
            // console.log(">>>>>> name:", item.name);
            if (name === "downloadPackage") {
                //首先放到缓存对象中
                packageCache[packageName] = {
                    bundleName: packageName,
                    startTime,
                    duration,
                    packageSize
                };
            }
            if (name === "evaluateScript") {
                //首先放到缓存对象中
                if (!runScriptCache[moduleName]) {
                    runScriptCache[moduleName] = {
                        bundleName: moduleName,
                        startTime,
                        duration,
                        fileList: fileList || []
                    };
                } else {
                    //包中还有其他的文件执行,时间一并加进去
                    let isNeedAdd = false;
                    (fileList || []).forEach(function (file) {
                        if (!runScriptCache[moduleName].fileList.includes(file)) {
                            isNeedAdd = true;
                            runScriptCache[moduleName].fileList.push(file);
                        }
                    });
                    if (isNeedAdd) {
                        runScriptCache[moduleName].duration += duration;
                    }
                }
            }
            flushLoadPackage();
        }
    });
}
const flushLoadPackage = function () {
    if (loadPackagetimer) {
    //   console.log("%c ------- [loadPackage.js] 清理定时器", "color:#0ff");
        clearTimeout(loadPackagetimer);
    }
    loadPackagetimer = setTimeout(function () {
        Object.keys(packageCache).forEach(function (bundleName) {
            //当前的package包，5秒内都没有下载更新
            let ubtData = packageCache[bundleName] || {};
            // console.log("%c ------ [loadPackage.js] o_miniapp_download_package_official ------", "color:#0f0");
            // console.log(ubtData);
            cwx.sendUbtByPage.ubtMetric({
                name: "o_miniapp_download_package_official",
                tag: Object.assign(ubtData, getCommonInfo()), // 添加公共属性
                value: ubtData["duration"] || 0,
            });
            delete packageCache[bundleName]
        });
        Object.keys(runScriptCache).forEach(function (bundleName) {
            //当前的package包，5秒内都没有下载更新
            // 处理属性值，转成 string 类型，否则 metric 埋点无法发送出去
            if (runScriptCache[bundleName] && runScriptCache[bundleName].fileList) {
                runScriptCache[bundleName].fileList = JSON.stringify(runScriptCache[bundleName].fileList)
            }
            // console.log("%c ------ [loadPackage.js] o_miniapp_evaluateScript_official ------", "color:#0f0");
            // console.log(runScriptCache[bundleName]);
            cwx.sendUbtByPage.ubtMetric({
                name: "o_miniapp_evaluateScript_official",
                tag: Object.assign(runScriptCache[bundleName], getCommonInfo()), // 添加公共属性
                value: runScriptCache[bundleName]["duration"] || 0,
            });
            delete runScriptCache[bundleName]
        });
    }, 5 * 1000)
}

export default initLoadPackage
import { cwx, __global } from '../cwx.js';

let pageDurationInfo = {}; // 这个队列始终最多包含2个页面的信息

function getSource(url) {
    let urlArr = url.split('/');
    let source = '';
    if(urlArr.length > 1) {
      source = `${urlArr[0]}/${urlArr[1]}`;
    }
    return source;
}

function getPagePath() {
    let currentPage = cwx.getCurrentPage() || {};
    let url = currentPage && currentPage.route || '';
    return url;
}

function getScene() {
    return cwx.scene ? cwx.scene + '' : '';
}

function getPageId() {
    let currentPage = cwx.getCurrentPage();
    return (currentPage && currentPage.pageId) ? (currentPage.pageId + '') : '0';
}

function getPrevPage() {
    let pageArr = getCurrentPages();
    let prevPage = null;
    if(pageArr.length > 1) {
        prevPage = pageArr[pageArr.length - 2];
    }
    return (prevPage && prevPage.pageId) ? (prevPage.pageId + '') : '0';
}

function getPageDurationProps(type) {
    // pageOnShow 执行
    // 1. 若内存变量不为空对象，表示存在前一个页面，则给它增加 end 和 next，然后发送埋点、清空已填充完毕的信息
    // 2. 给当前页面新增 start, prev 和 current, 将信息存到内存变量中
    if(type === 'pageOnShow') {
        //console.log('pageOnShow ============');
        // console.log(pageDurationInfo);
        if(pageDurationInfo && pageDurationInfo.start_ts) {
            //console.log('跳转B页面，给A添加end ============');
            pageDurationInfo['end_ts'] = +new Date() + '';
            pageDurationInfo['next_page'] = getPageId();
            
            //console.log('A页面数据全了，发埋点 ============');
            // console.log(pageDurationInfo);
            pageDuration(pageDurationInfo);
            pageDurationInfo = {};
            //console.log('A页面的埋点已发送完毕，清空 ============');
            // console.log(pageDurationInfo);
        }
        pageDurationInfo = {
            start_ts: +new Date() + '',
            current_page: getPageId(),
            prev_page: getPrevPage(),
            
            launchType: getScene(),
            source: getSource(getPagePath()),
            url: getPagePath()
        }
        //console.log('start 新增完毕 ============');
        // console.log(pageDurationInfo);
    }

    // pageOnUnload 记录当前页面的end, 发埋点并清空
    if(type === 'pageOnUnload') {
        if(pageDurationInfo && pageDurationInfo.start_ts) {
            //console.log('pageOnUnload ============');
            // console.log(pageDurationInfo);
            pageDurationInfo['end_ts'] = +new Date() + '';
            pageDurationInfo['next_page'] = '';
            
            //console.log('卸载的页面信息全了，发埋点 ============');
            // console.log(pageDurationInfo);
            pageDuration(pageDurationInfo);
            pageDurationInfo = {};
            //console.log('卸载的页面埋点已发送完毕，清空 ============');
            // console.log(pageDurationInfo);
        }
    }

    // appOnHide 表示切换到后台了，这时可以完善 end 和 next，并将 pageDurationInfo 存到缓存中，等 onLaunch 或 onShow 时，将数据发送出去
    if(type === 'appOnHide') {
        if(pageDurationInfo && pageDurationInfo.start_ts) {
            pageDurationInfo['end_ts'] = +new Date() + '';
            pageDurationInfo['next_page'] = '';
        }
        //console.log('appOnHide 存数据 ============');
        // console.log(pageDurationInfo);
        cwx.setStorageSync('pageDuration', pageDurationInfo);
    }

    // appOnLaunch 或 appOnShow, 取缓存，若有值，则发埋点，并清缓存
    if(type === 'appOnLaunch' || type === 'appOnShow') {
        let tobeSend = cwx.getStorageSync('pageDuration');
        //console.log(type, '取缓存数据 ============');
        // console.log(tobeSend);
        if(tobeSend && tobeSend.start_ts) {
            pageDuration(tobeSend);
            cwx.removeStorageSync('pageDuration');
        }
    }
}

function createCID(cid) {
    sendUbtMetric('app_usage_cid', {
        newClientID: cid
    }, 1);
}

function pageDuration(options) {
    let duration = 0;
    if(options && options.start_ts && options.end_ts) {
        duration = Number(options.end_ts) - Number(options.start_ts);
    }
    if(!duration) {
        return;
    }
    
    sendUbtMetric('app_usage_page_duration', {
        prev_page: options && options.prev_page || '',
        current_page: options && options.current_page || '',
        next_page: options && options.next_page || '',
        start_ts: options && options.start_ts || '',
        end_ts: options && options.end_ts || '',

        launchType: options && options.launchType || '',
        source: options && options.source || '',
        url: options && options.url || ''
    }, duration);
}

function appDuration() {
    cwx.appBirthTime = new Date().getTime() + '';
    let appDuration = cwx.getStorageSync('appDuration');
    let duration = Number(appDuration.endTime) - Number(appDuration.birthTime);
    if(appDuration) {
        sendUbtMetric('app_usage_duration', appDuration, duration);
    }
    cwx.removeStorageSync('appDuration');
}

function setAppDurationToStorage() {
    let appDuration = {
      last_page: getPageId(),
      birthTime: cwx.appBirthTime,
      endTime: new Date().getTime() + '',
      launchType: getScene(),
      url: getPagePath(),
      source: getSource(getPagePath())
    }
    cwx.setStorageSync('appDuration', appDuration);
}

// APP启动发送
function appLaunch(options) {
    let url = options.path || '';
    sendUbtMetric('app_usage_launch', {
        upgrade: '0',
        lastVersion: __global.version,
        currentVersion: __global.version,
        launchType: options.scene,
        url: url,
        source: getSource(url)
    }, 1);
}

function sendUbtMetric(keyName, data, value) {
    cwx.sendUbtByPage.ubtMetric({
        name: keyName,
        tag: { ...data, mcdAppId: cwx.mcdAppId },
        value: value
    });
}

export default {
    createCID,
    appDuration,
    appLaunch,
    setAppDurationToStorage,
    pageDuration,
    getPageDurationProps
}
let pageTitleMaps = require('../../../pageTitleMaps.js');
let __global = require('../global.js').default;
let cwx = __global.cwx;

function getCurrentPageInstance() {
    const allPages = getCurrentPages() || [];
    console.log('[getCurrentPageInstance] allPages:', allPages);
    let currentPage = {};
    if(allPages && allPages.length) {
        currentPage = allPages[allPages.length - 1];
    }

    return currentPage;
}

function addDefaultTitle(shareData, route) {
    let shareTitle = '携程旅行'; // curTitle

    // 使用 pagePath和title mapping 表中的标题
    if(route && pageTitleMaps && pageTitleMaps[route]) {
      shareTitle = pageTitleMaps[route];
    }
    shareData['title'] = shareTitle;
    console.log('[addDefaultTitle] shareTitle:', shareData.title);
}

function checkIsCweb (pagePath) {
    return pagePath.includes('cwx/component/cwebview/') || pagePath.includes('cwx/component/extraCweb/');
}

function addDefaultPath(shareData, route, options) {
    let sharePath = route;
    let mirrorOptions = {...options};
    
    delete mirrorOptions.__navigator;
    if(mirrorOptions && JSON.stringify(mirrorOptions) !== '{}') {
        for (let key in mirrorOptions) {
            sharePath += (sharePath.includes('?') ? '&' : '?') + key + '=' + mirrorOptions[key];
        }
    }
    shareData['path'] = sharePath;
    console.log('[addDefaultPath] sharePath:', shareData.path);
}         

function parseDataValueInPagePath(pagePath) {
    console.log('1.说明是 cwebview 内嵌h5, 需要替换掉h5链接上带的aid sid');
    let matchList = pagePath.match(/data=([^&]+)/);
    let dataValue = matchList && matchList[1] || '';
    console.log('分享 path 包含的参数 data 的值:', dataValue);
  
    return dataValue;
}

function parseDataValue(dataValue) {
    let url = '';
    let dataObj = {};
    if(dataValue) {
        // parse dataObj
        try {
            dataObj = JSON.parse(dataValue)
            console.log('JSON.parse 后的 data值: ', dataObj)
        } catch(e) {
        try { // 可能存在 data 被 encode 的情况
            let mirrorStr = dataValue;
            console.log('JSON.parse 失败，即将 decode 一次 mirrorStr:', mirrorStr)
            mirrorStr = decodeURIComponent(mirrorStr);
            console.log('decode 后的 mirrorStr: ', mirrorStr);
            dataObj = JSON.parse(mirrorStr);
            console.log('decode + JSON.parse 后的 dataObj: ', dataObj);
        } catch(e) {
            console.log('decode后, JSON.parse 仍然失败了, 发埋点记录下来');
            cwx.sendUbtByPage.ubtMetric && cwx.sendUbtByPage.ubtMetric({
                name: 189500, //申请生成的Metric KEY
                tag: {
                    "dataValue": dataValue
                }, //自定义Tag
                value: 1 //number 值只能是数字
            });
        }
        }
        // 从 dataObj 中获取 url
        url = dataObj && dataObj.url || '';
        url = decodeURIComponent(url); // 一般 url 都是 encode 后才拼接到 path 上，所以做一次解密
        console.log('从 sharePath 的参数中解析出来的 url :', url)

        cwx.sendUbtByPage.ubtMetric && cwx.sendUbtByPage.ubtMetric({
            name: 189522, //申请生成的Metric KEY
            tag: {
                url: url,
            }, //自定义Tag
            value: 1, //number 值只能是数字
        });
    }

    return {
        dataObj,
        url
    };
}



function replaceAidSidOfUrl(url, tobeAddAidSid) {
    // 此方法处理的url 包括 h5-url 和 原生页 path-url
    if (!url || typeof url !== "string") {
        return "";
    }

    //删除原有的
    if (url.match(/allianceid=/i) && url.match(/allianceid=/i).length) {
        url = url.replace(/[&|?]allianceid=[^&]+/gi, "");
        console.log("删除 url 上所有的 allianceid 参数后, url:", url);
    }
    if (url.match(/sid=/i) && url.match(/sid=/i).length) {
        url = url.replace(/[&|?]sid=[^&]+/gi, "");
        console.log("删除 url 上所有的 sid 参数后, url:", url);
    }

    url = addParamToUrl(url, tobeAddAidSid);
    console.log("拼接 tobeAddAidSid 后的 url: ", url);
    return url;
}

function addParamToUrl(url, param) {
    if (!url.includes("?")) {
        url = `${url}?${param}`;
    } else if (url.slice() !== "&") {
        url = `${url}&${param}`;
    } else {
        url = `${url}${param}`;
    }
    return url;
}


function preAntiSealingPath(path) {
    let pathSplitArr = path.match(/^[^?]+/);
    let pagePath = pathSplitArr[0]; // 取纯粹的页面路径

    // 分享的路径是 cwebview 或 scwebview，替换成 extraCweb
    if(checkIsCweb(pagePath)) {
        pagePath = pagePath.includes('scwebview') ? __global.scwebview.sharePagePath : __global.cwebview.sharePagePath;
        console.warn('分享的是 cwebview 的路径：', pathSplitArr[0], '--- 最终拦截替换成：', pagePath)
    }
    path = path.replace(pathSplitArr[0], pagePath);
    return path;
}

function processShareData(args, shareData) {
    // 1. 记录 BU return 的原始数据
    if (cwx.sendUbtByPage.ubtTrace) {
        let mirrorData = cwx.util.copy(shareData);
        cwx.sendUbtByPage.ubtTrace('wxshare', mirrorData)
    }

    // 2. 添加兜底数据
    // 2.1 获取页面实例
    let { options = {}, route = 'pages/home/homepage' } = getCurrentPageInstance() ;
    console.log('current page path:', route);
    console.log('current page options:', options);

    // 2.2 title
    if (!shareData.title) {
        addDefaultTitle(shareData, route);
    }

    // 2.3 path
    if (!shareData.path) {
        addDefaultPath(shareData, route, options);
    }

    // 2.4 拍抖音特有逻辑：解析pagePath中参数data的值（一般是object），然后给data.url和pagePath 添加业绩参数
    if(args.channel === 'video' && cwx.miniType === 'tt' && cwx.mkt.getUnionByUid) {
        console.log('分享形式 - 发布视频内容, args:', args);

        let pagePath = shareData.path;
        let tobeAddAidSid = cwx.mkt.getUnionByUid() || '';
        console.log('onShareAppMessage return的path 初始值: ', pagePath)
        console.log('cwx.mkt.getUnionByUid 的返回值: ', tobeAddAidSid)

        // 发埋点记录 原始分享path 及 市场API返回的业绩参数
        cwx.sendUbtByPage.ubtMetric && cwx.sendUbtByPage.ubtMetric({
            name: 189472, //申请生成的Metric KEY
            tag: {
                "tobeAddAidSid": tobeAddAidSid,
                "pagePath": pagePath
            }, //自定义Tag
            value: 1 //number 值只能是数字
        });

        if(tobeAddAidSid) {
            // 分为两种情况：1.cwebview 内嵌h5, 2.原生页（非内嵌h5）
            if(checkIsCweb(pagePath)) {
                let dataValue = parseDataValueInPagePath(pagePath);

                // cwebview 带的参数符合约定（包含 data 参数），从 sharePath 的 data 参数中解析 url
                let {dataObj, url} = parseDataValue(dataValue);
                if(url) {
                    url = replaceAidSidOfUrl(url, tobeAddAidSid);
                    console.log('替换 aid sid 后的 url: ', url);
                    dataObj.url = encodeURIComponent(url);;
                }

                pagePath = '/cwx/component/cwebview/cwebview?data=' + JSON.stringify(dataObj);
            }

            console.log('2. 原生页拼接业绩参数')
            pagePath = replaceAidSidOfUrl(pagePath, tobeAddAidSid)
            console.log('最终处理出来的 pagePath: ', pagePath)

            cwx.sendUbtByPage.ubtMetric && cwx.sendUbtByPage.ubtMetric({
                name: 189475, //申请生成的Metric KEY
                tag: {
                    pagePath: pagePath,
                }, //自定义Tag
                value: 1, //number 值只能是数字
            });

            shareData.path = pagePath;
        }
    }

    let { path } = shareData;
    // 微信cwebview防封特有逻辑：__global.cwebview 相关配置存在，说明需要做分享防封处理
    if(__global.cwebview && __global.cwebview.sharePagePath) {
        path = preAntiSealingPath(path);
    }
    
    let mkt = cwx.mkt.getShareUnion(); // 获取需要分享出去的参数，并加密返回
    shareData.path = addParamToUrl(path, mkt);
    
    // 微信已经关闭了 success 回调，暂时保留这块代码
    let oldSuccess = shareData.success;
    shareData.success = function(res){
    console.log('res = ',res);
    if (res && res.shareTickets){
        cwx.shareTicket = res.shareTickets[0]
    }
    if(oldSuccess){
        oldSuccess.call(this,res);
        }
    }
    
    if (args.channel === 'video' && cwx.miniType === 'tt') {
        cwx.sendUbtByPage.ubtMetric &&
        cwx.sendUbtByPage.ubtMetric(
            "toutiaoapp_onShare_return_data_processed",
            JSON.stringify(shareData)
        );
    }
    
    if(shareData.path[0] !== '/') {
        shareData.path = `/${shareData.path}`; // 微信官方文档说 必须是当前页面 path ，必须是以 / 开头的完整路径
    }

    // 记录 最终 return 的处理后的数据
    if (cwx.sendUbtByPage.ubtTrace && cwx.checkIsMasterMiniapp()) {
        // console.log("%c 用于计算微信主板小程序的分享功能触发次数", "color:red;")
        cwx.sendUbtByPage.ubtTrace('o_miniapp_share', cwx.util.copy(shareData)); 
    }
    
    return shareData;
}

export default processShareData;
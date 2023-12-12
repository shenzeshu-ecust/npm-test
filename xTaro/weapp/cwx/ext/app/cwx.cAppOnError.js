var pageTitleMaps = require('../../../pageTitleMaps.js');
var pagePathList = Object.keys(pageTitleMaps);
import { cwx, __global } from "../../cwx.js";

function collectErrMsg(msg, type) {
  let systemInfo = cwx.wxSystemInfo;

  cwx.configService.watch("JSErrorWarning", (res) => {
    // console.log('请求返回的 JSErrorWarning 为：', res);

    try {
      // 取 MCD 配置信息
      if (res && res.platform && res.platform instanceof Array) {
        __global.JSErrorWarning = res;
      }
      if (res && res.extBundleMapping && typeof res.extBundleMapping === 'object' && Object.keys(res.extBundleMapping).length) {
        __global.extBundleMapping = res.extBundleMapping;
      }
      // 从 MCD 获取配置，如果设备类型包含在里面，则不发送报错
      if (__global.JSErrorWarning && __global.JSErrorWarning.platform && __global.JSErrorWarning.platform.includes(systemInfo.platform)) {
        return;
      }

      // console.log('>>>>>>>>>>> 开始处理报错信息')
      let date = new Date();
      let exportData = {};
      try {
        let currentPage = cwx.getCurrentPage();
        let currentPagePath = correctPagePath(msg, currentPage.route);
        let cachedCtripCity = cwx.locate.getCachedCtripCity() || {};
        let pOIInfo = (cachedCtripCity && cachedCtripCity.data && cachedCtripCity.data.pOIInfo) ||{};

        try {
          if(!typeof msg === 'string') {
            msg = JSON.stringify(msg);
          }
        } catch (error) {
          console.log(msg, '转 string 报错：', error);
        }

        let errMsgArr = msg.split('\n');
        let errMessage = "";
        for (let i = 0; i < errMsgArr.length; i++) {
          if (errMsgArr[i].indexOf("Error:") !== -1) {
            errMessage = errMsgArr[i];
            break;
          }
        }
        if (!errMessage) {
          errMessage = errMsgArr && errMsgArr.length >= 2 ? errMsgArr.slice(0, 2).join('\n') : msg;
        }

        errMessage += '_._' + (type || '');
        if(__global.envVersion !== 'release') {
          errMessage += '_._' + __global.envVersion;
        }
        // 为了便于查看和排查 错误信息： TypeError: require.async is not a function_._onUnhandledRejection , 在 message 后面拼接 wxVerInfo
        if (errMessage.includes("require.async")) {
          let wxVerInfo = wx.version || {};
          errMessage += '_' + (wxVerInfo.updateTime || "") + '_' + (wxVerInfo.version || "");
        }

        let buildInfoArr = wx.buildVersion.split('_');

        exportData = {
          extendedField: {
            // 默认值传 null??? todo???
            env_clientcode: cwx.clientID || null, // CID， cwx.clientID
            env_DUID: (cwx.user && cwx.user.duid) || null, // cwx.user.duid
            env_appVersion: __global.version, // 线上小程序版本号 __global.version ( wx.getAccountInfoSync() 返回的 version )
            productName: currentPagePath, // 报错页面路径 pagePath 按此纬度区分数据
            env_buildID: buildInfoArr && buildInfoArr[0] || null, // 代码包构建 id
            meta_sdkver: systemInfo.SDKVersion || null, // 客户端基础库版本	cwx.wxSystemInfo.SDKVersion
            env_osVersion: systemInfo.system || null, // 操作系统及版本 cwx.wxSystemInfo.system
            // env_networkType: null, // wx.getNetworkType() 异步返回的 res.networkType, 转全部大写
            env_country: pOIInfo.country || null, // _cachedCtripCity.data.pOIInfo.country
            log_from: "weapp", // 小程序类型： weapp, swan, alipay, tt, quickapp
            env_deviceType: systemInfo.model || null, // 设备型号 cwx.wxSystemInfo.model
            appEnv: __global.envVersion, // 网络环境类型
            env_os: systemInfo.platform || null, // 客户端平台 cwx.wxSystemInfo.platform
            env_logtime: cwx.util.formatTime(date), // todo??? 报错时间，自己转成 yyyy-mm-dd hh:mm:ss 的格式
            framework: "weapp", // 小程序类型： weapp, swan, alipay, tt, quickapp
            env_city: pOIInfo.city || null, // _cachedCtripCity.data.pOIInfo.city
            time: date.getTime(), // 报错时间戳
            env_province: pOIInfo.province || null, // _cachedCtripCity.data.pOIInfo.province
            env_version: systemInfo.version || null, // 微信版本号 cwx.wxSystemInfo.version
            env_brand: systemInfo.brand || null, // 设备品牌 cwx.wxSystemInfo.brand
            cwxVersion: __global.cwxVersion || null, // 使用的cwx框架版本号 __global.cwxVersion
            appId: cwx.mcdAppId || null, // cwx.mcdAppId
            scene: cwx.scene, // 场景值 cwx.scene
            miniappAppId: cwx.appId || null, // 小程序的appId cwx.appId
            env_buildVersion: wx.buildVersion, // 代码构建时间 wx.buildVersion ( mini_build_version.js 中 )
          },
          stack: msg,
          // category: "miniapp_js_error", // miniapp_js_error, 
          message: errMessage, // app.js onError 的入参 解析出来的 message ( /Error[^:]+Error:/ )
          name: 'Error'
        };
        // console.error(exportData)
        if (typeof currentPage.ubtTrackError === 'function') {
          currentPage.ubtTrackError(exportData);
        } else {
          console.error("当前页面实例上不存在 ubtTrackError 方法, 请检查是否使用了最新的小程序壳工程或taro基础模板")
        }
      } catch (e) {
        // console.log('处理报错信息时报错了，没有真正发出埋点信息')
        console.error(e);
      }
    } catch (error) {
      console.error(error);
    }
  })
}

function correctPagePath(errMsg, currentPagePath) {
  try {
    // 1. 取 报错信息跟页面路径做对比，看看有没有 匹配到的页面路径
    let errMsgArr = [];
    if (typeof errMsg === "string") {
      errMsgArr = errMsg.split(/\r?\n/);
    } else if (errMsg instanceof Array) {
      errMsgArr = errMsg;
    }

    // 2. 匹配 页面 和 bundle
    let matchedPagePath = '';
    let matchedBundleIndex = null;
    let matchedBundle = '';
    let matchedMsg = '';

    errMsgArr.forEach((msg) => {
      // 之前的 errMsg 已经匹配到 bundle 和 pagePath，则不再使用下面的错误信息来匹配了（有 pagePath 肯定有 bundle，有 bundle 不一定有 pagePath，因为取 pagePath 的前两层目录就是兜底 bundle ）
      if (matchedBundle && matchedPagePath) {
        return;
      }
      
      let matchedBundleCurrentMsg = '';
      let matchedBundleCurrentMsgIndex = null;
      if (!matchedBundle) {
        // 没有在小程序管理平台上配置给任何bundle的文件列表，预匹配
        const extBundleList = Object.keys(__global.extBundleMapping);
        extBundleList.forEach(function (bStr) {
          let matchRes = matchBundle(msg, bStr, matchedBundleCurrentMsg, matchedBundleCurrentMsgIndex);
          if (matchRes.matchedBundle) {
            matchedBundleCurrentMsg = __global.extBundleMapping[matchRes.matchedBundle] || matchRes.matchedBundle;
          }
          matchedBundleCurrentMsgIndex = matchRes.matchedBundleIndex;
        })
      }

      pagePathList.forEach((page) => {
        if (!matchedBundle) {
          // 取页面路径的前两个词，匹配 bundle
          let matchRes = matchBundle(msg, page, matchedBundleCurrentMsg, matchedBundleCurrentMsgIndex, true);
          matchedBundleCurrentMsg = matchRes.matchedBundle;
          matchedBundleCurrentMsgIndex = matchRes.matchedBundleIndex;
        }

        if (!matchedPagePath) {
          const pList = page.split('/').filter(item => item);
          const reg = new RegExp('\\/?' + pList.join('\\/'));
          if (msg.match(reg)) {
            matchedPagePath = page;
          }
        }
      });

      // 这一行错误信息已经匹配完了
      if (matchedBundleCurrentMsg) {
        matchedBundle = matchedBundleCurrentMsg;
        matchedBundleIndex = matchedBundleCurrentMsgIndex;
        matchedMsg = msg;
      }
    });

    // 都没匹配到，则直接返回当前页面路径
    if (!matchedBundle && !matchedPagePath) {
      return currentPagePath;
    }

    // 2.1 匹配到页面路径，直接返回
    if (matchedPagePath) {
      return matchedPagePath;
    }

    // 2.2 没匹配到页面路径，匹配到 bundle 了
    // 2.2.1 报错信息 和 当前页面路径 【属于】同一个部门，返回 当前页面路径
    const bList = matchedBundle.split('/');
    let reg = new RegExp('^\\/?' + bList.join('\\/'));
    if (currentPagePath.match(reg)) {
      return currentPagePath;
    }

    // 2.2.2 报错信息 和 当前页面路径 【不属于】同一个部门，返回 bundle （为了准确提醒报错位置对应的负责人）
    // 用 matchedBundleIndex 来拆错误信息，找到错误文件路径
    let filePath = matchedMsg.slice(matchedBundleIndex, matchedMsg.length);
    let matchRes = filePath.match(/^[^:]+/);
    if (matchRes) {
      return matchRes[0];
    } else {
      return matchedBundle;
    }
  } catch (error) {
    return currentPagePath;
  }
}

function matchBundle (msg, str, matchedBundle, matchedBundleIndex, regUse2Word) {
  // 将 str 拆解成一个个单词，过滤空字符串
  const wList = str.split('/').filter(item => item);
  // 创建 正则匹配表达式，limit2Word 表示表达式只使用2个单词来创建；否则使用全部单词来创建
  let reg;
  if (regUse2Word) {
    reg = new RegExp('\\/?' + wList[0] + '\\/' + wList[1]);
  } else {
    reg = new RegExp('\\/?' + wList.join('\\/'));
  }
  
  const matchRes = msg.match(reg);
  if (matchRes && (matchedBundleIndex === null || matchRes.index < matchedBundle)) {
    matchedBundleIndex = matchRes.index;
    matchedBundle = regUse2Word ? wList.slice(0, 2).join('/') : str;
  }

  return {
    matchedBundle,
    matchedBundleIndex
  }
}

export default collectErrMsg;
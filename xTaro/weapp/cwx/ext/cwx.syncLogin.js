import {cwx, __global} from '../cwx.js';
import { getAuthCode, locate48HoursLimitKey } from "../../commonAPI/getAuthCode"

let _onLoadBeginTimeStamp = null;

function load(options) {
    let needWriteCrossTicket = true;
    const {url, loginErrorUrl, success, fail, isLogin } = options;
    if (options._onLoadBeginTimeStamp) {
      _onLoadBeginTimeStamp = options._onLoadBeginTimeStamp;
    }
    console.log('【cwx.syncLogin.load】初始入参:', options);

    if (typeof options.needWriteCrossTicket !== 'undefined') {
        needWriteCrossTicket = options.needWriteCrossTicket;
    }

    cwx.sendUbtByPage.ubtMetric({
        name: 186847, //申请生成的Metric KEY
        tag: {
            "data": JSON.stringify({options}),
            "needWriteCrossTicket": needWriteCrossTicket
        }, //自定义Tag
        value: 1 //number 值只能是数字
    });

    if (!url) {
        console.log("Can't Find Url!");
        return;
    }

    sendPageStackTargetUrl(url);
    sendLoadUrl(url);
    
    const domainsReg = /^(https?:)?\/\/[^/]+/;
    const match = url.match(domainsReg);
    const domain = match && match.length > 0 ? match[0] : '';
    const canSyncLoginReg = /(https?:)?\/\/[^/]+(c-)?ctrip[^\.]*.com/

    console.log(`%c [cwx.syncLogin.load] domain: ${!!domain}`, 'color:#0f0;')
    console.log(`%c [cwx.syncLogin.load] needWriteCrossTicket: ${needWriteCrossTicket}`, 'color:#0f0;')
    console.log(`%c [cwx.syncLogin.load] canSyncLoginReg.test(domain): ${canSyncLoginReg.test(domain)}`, 'color:#0f0;')
    if (domain && canSyncLoginReg.test(domain) && needWriteCrossTicket) {
        cwx.dynamicLogin.subscribe(function(res) {
            console.log(`%c [cwx.syncLogin.load] 跨平台同步登录态完成，执行回调。res: ${res}`, 'color:#0f0;')
            if (cwx.user.auth) { //如果有登陆态，直接获取token 同步登陆态
                webGetTokenByAuth({url, loginErrorUrl, success, fail, isLogin});
            } else if (!isLogin) { //不需要强制登陆，一般只需要同步登陆态的
                success && success(getLoginTokenUrl('', url));
            } else { //跳转登录
                webToLogin({url, loginErrorUrl, success, fail, isLogin});
            }
        })
    } else {
        console.log('【cwx.syncLogin.load】直接调用 success(url)，不同步登录态也不拼接业绩。')
        success && success(url);
    }
}

/**
 * 埋点记录 页面栈+目标url
 * @param {string} url
 */
function sendPageStackTargetUrl(url) {
    try {
        const pageStack = getCurrentPages();
        let pagePathArr = [];
        for (let i = 0; i < pageStack.length; i++) {
            pagePathArr.push(pageStack[i] && pageStack[i].route || '');
        }
        console.log('【cwx.syncLogin.load】页面栈: ', pagePathArr);
        console.log('【cwx.syncLogin.load】h5 url: ', url);

        cwx.sendUbtByPage.ubtMetric({
            name: 186456, //申请生成的Metric KEY
            tag: {
                "pagePathArr": JSON.stringify(pagePathArr),
                "url": url
            }, //自定义Tag
            value: 1 //number 值只能是数字
        });
    } catch (e) {

    }
}

/**
 * 埋点记录当前页面路径+入参url
 */
function sendLoadUrl(url) {
    try {
        const pageIns = cwx.getCurrentPage();
        const pagePath = pageIns && pageIns.route || '';

        if (pagePath) {
            console.log(`【cwx.syncLogin.load】当前页面path: ${pagePath}`);
            console.log(`【cwx.syncLogin.load】入参url: ${url}`);

            cwx.sendUbtByPage.ubtMetric({
                name: 184102, //申请生成的Metric KEY
                tag: {
                    "pagePath": pagePath,
                    "url": url
                }, //自定义Tag
                value: 1 //number 值只能是数字
            });
        }
    } catch (e) {
        console.error(e);
        cwx.sendUbtByPage.ubtMetric({
            name: 184102, //申请生成的Metric KEY
            tag: {
                "err_msg": e.message,
                "err_stack": e.stack,
                "url": url
            }, //自定义Tag
            value: 1 //number 值只能是数字
        });
    }
}

/**
 * auth 获取token (token 有效时间2分钟)
 */
function webGetTokenByAuth({url, loginErrorUrl, success, fail, isLogin}) {
    cwx.user.getCrossToken(function (crossToken, innerError) {
        try {
            const pageIns = cwx.getCurrentPage();

            pageIns.ubtTrace(130705, {
                token: crossToken,
                innerError: innerError
            });
        } catch (e) {
            console.error(e);
        }

        // 获取token失败/报错
        if (innerError) {
            fail && fail(getLoginTokenUrl("", loginErrorUrl));
        } else {
            // 登录态失效
            if (crossToken == 'undefined' || !crossToken || !/[^\s]/.test(crossToken)) {
                if (!isLogin) { //如果不需要登陆态
                    //直接返回新的地址
                    success && success(getLoginTokenUrl("", url));
                } else {
                    webToLogin({url, loginErrorUrl, success, fail, isLogin});
                }
            } else {
                //直接返回新的地址
                success && success(getLoginTokenUrl(crossToken, url));
            }
        }
    });
}

/**
 * 获取token页地址
 */
function getLoginTokenUrl(token, url) {
    let host = '';

    if (__global.env.toLowerCase() === 'uat') {
        host = 'accounts.uat.qa.nt.ctripcorp.com'
    } else if (__global.env.toLowerCase() === 'fat') {
        host = 'accounts.fat466.qa.nt.ctripcorp.com';
    } else {
        host = 'accounts.ctrip.com'; //生产
    }

    let currentHost = "https://" + host;
    //var newUrl = currentHost + '/H5Login/writecrossticket?ctok=' + token + '&backurl=' + encodeURIComponent(url)
    currentHost += '/H5Login/writecrossticket?ctok=' + token + '&backurl=' + encodeURIComponent(urlRewrite(url));

    console.warn('newUrl', currentHost);
    return currentHost;
}

const getEnv = function (obj = {}) {
    let re = {
        cid: cwx.clientID,
        appid: __global.appId,
        ...obj
    };
    re.mpopenid = cwx.cwx_mkt && cwx.cwx_mkt.openid || "";

    try {
        let unionData = cwx.mkt.getUnion();
        re.allianceid = unionData.allianceid.toString();
        re.sid = unionData.sid.toString();
        re.ouid = unionData.ouid.toString();
        re.sourceid = unionData.sourceid.toString();

        const addKeyWhiteList = [
            "channelUpdateTime",
            "openid",
            "unionid",
            "swanid", // 百度
            "serial", // 快应用
            "serverFrom", // 头条
            "innersid",
            "innerouid",
            "pushcode"
        ]
        const exmktid = {};

        if (unionData.exmktid) {
            if (typeof unionData.exmktid === "string") {
                try {
                    unionData.exmktid = JSON.parse(unionData.exmktid);
                } catch (e) {

                }
            }

            for (let key in unionData.exmktid) {
                if (addKeyWhiteList.indexOf(key) === -1) {
                    continue;
                }
                exmktid[key] = (unionData.exmktid[key] || '').toString();
            }
        }

        re.exmktID = JSON.stringify(exmktid);
        //re.referrerInfo = cwx.referrerInfo;
        re.scene = cwx.scene;
    } catch (e) {
        console.error('getEnv', e);
    }

    return encodeURIComponent(JSON.stringify(re));
}

const urlRewrite = function (h5url) {
    if(h5url.length > 4000) {
        return h5url;
    }
    // h5url = cwx.mkt.urlRewrite(h5url);
    const unionObj = cwx.mkt.unionObj && cwx.mkt.unionObj() || {};
    h5url = h5url.replace(/[\u4e00-\u9fa5]+/g, function (str) {
        return encodeURIComponent(str)
    });

    function getHashVal (h5url) {
        const matchArr = h5url.match(/\?[\s\S]*?$/);
        if (!matchArr) {
            return '';
        }
        return matchArr[0].match(/#[\s\S]*?$/) || "";
    }
    const hash = getHashVal(h5url);
    h5url = h5url.replace(hash, '');

    // _cwxobj 的扩展字段
    const getExtInfo = function () {
      return {
        ...cwx.getPrSettingSync(), // _cwxObj 添加用户个性化推荐开关设置
        pLen: getCurrentPages().length // 20230509 添加当前原生页面栈长度：结合 bridge.js, 做页面栈溢出的处理
      }
    }
    //新增_cwxObj中的个性化推荐内容
    const extInfo = getExtInfo();
    if (!unionObj._cwxobj) {
        unionObj._cwxobj = getEnv(extInfo);
    } else {
        try {
            let _cwxObj = JSON.parse(cwx.util.decodeURIComponentSafely(unionObj._cwxobj));
            unionObj._cwxobj = encodeURIComponent(JSON.stringify({
                ..._cwxObj,
                ...extInfo
            }))
        } catch (e) {

        }
    }

    for (let key in unionObj) {
        if (unionObj[key]) {
            let replaceStr = `${key}=${unionObj[key]}`;
            let reg = new RegExp("([?&])" + key + "=([^&]+)", 'i');
            // 添加&更新
            if (!reg.test(h5url)) {
                h5url += (h5url.match(/\?/) ? '&' : '?') + replaceStr;
            } else {
                h5url = h5url.replace(reg, '$1' + replaceStr)
            }
        }
    }

    //去除最后的&符号
    if (h5url.slice(-1) === "&") {
        h5url = h5url.slice(0, -1); //去除最后的&符号
    }

    // 目前暂时只同步 定位授权弹窗 48 小时限制
    const mCode = getAuthCode(locate48HoursLimitKey);
    if(typeof mCode === "number") {
      h5url += `&_mCode=${mCode}`
    }
    // 同步 cwebview onLoad 开始的时间戳
    if (_onLoadBeginTimeStamp) {
      h5url += `&_obt=${_onLoadBeginTimeStamp}`
      _onLoadBeginTimeStamp = null;
    }

    h5url = h5url + (hash ? hash : '');
    // console.log("%c ------ h5url:" + h5url, "color:#0f0");
    return h5url;
}

/**
 * 跳登录获取toekn
 */
function webToLogin({url, loginErrorUrl, success, fail, isLogin}) {
    let loginParam = {};
    if (typeof isLogin === 'object') {
        loginParam = isLogin;
    }

    cwx.user.login({
        param: loginParam,
        callback: function () {
            const auth = cwx.user.auth
            if (auth && auth.length > 0) {
                //如果是login过了，isLogin 置成false；
                webGetTokenByAuth({url, loginErrorUrl, success, fail});
            } else {
                //登录失败
                fail && fail(getLoginTokenUrl("", loginErrorUrl));
            }
        }
    });
}

export default {
    load,
    webGetTokenByAuth,
    getLoginTokenUrl,
    webToLogin,
    getEnv,
    urlRewrite
}
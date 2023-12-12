let __global = require('./global.js').default;
let cwx = __global.cwx;
let requestID = 1;

function generateRequestID() {
    return requestID++;
}

function formatRequestURL(url) {
    if (url.indexOf("/") != 0 || url.indexOf("http") == 0) { //联调完去掉这个判断
        if (url.indexOf("gateway.secure.ctrip.com") == -1) {
            console.warn("警告：请使用相对路径 ", url);
        }
        return url;
    }
    let scheme = 'https://';
    let host = __global.host;
    if (__global.env.toLowerCase() === 'uat') {
        host = __global.uat;
        scheme = 'http://';
    } else if (__global.env.toLowerCase() === 'fat') {
        host = __global.fat;
        scheme = 'http://';
    }
    return scheme + host + url;
}

function createHeader(header = {}) {
    // 注意要兼容 BU 传入的 object.header 或 object.headers
    try {
        //新增四个默认的header
        header["x-ctx-locale"] = "zh-CN";
        header["x-ctx-group"] = "ctrip";
        header["x-ctx-region"] = "CN";
        header["x-ctx-currency"] = "CNY";
        const prSetting = cwx.getPrSettingSync();
        if (prSetting && Object.keys(prSetting).length) {
            header["x-ctx-personal-recommend"] = prSetting.personalRecommendSwitch ? 1 : 0;
        }
        if (cwx.cwx_mkt && cwx.cwx_mkt.openid) {
            header['x-wx-openid'] = cwx.cwx_mkt.openid;
        }
        if (__global.env != 'prd') {
            header['x-wx-env'] = 'dev';
        }
        if (__global.useCanary) {
            header['x-ctx-CanaryReq'] = 1;
            header['x-ctx-CanaryIdc'] = __global.useCanary;
        }

        const mktCookie = cwx.mkt.getUnionForCookie();
        if (mktCookie) {
            header.Cookie = mktCookie + ";" + (header.Cookie || "");
        }

        if (cwx.user && cwx.user.duid) {
            header["duid"] = cwx.user.duid;
            if (!header.Cookie || header.Cookie.indexOf("DUID=") === -1) {
                // 确保添加 DUID 时，DUID值 与 Cookie已有的值 用 ; 隔离开
                if (header.Cookie && header.Cookie.slice(-1) !== ";") {
                    header.Cookie += ";";
                }
                header.Cookie += "DUID=" + cwx.user.duid + ";";
            }
        }
        if (cwx.clientID) {
            if (!header.Cookie || header.Cookie.indexOf("GUID=") === -1) {
                // 确保添加 GUID 时，GUID 值 与 Cookie已有的值 用 ; 隔离开
                if (header.Cookie && header.Cookie.slice(-1) !== ";") {
                    header.Cookie += ";";
                }
                header.Cookie += "GUID=" + cwx.clientID + ";";
            }
        }
    } catch (e) {
        // console.log( "__createHeader error = ", e );
    }
    return header;
}

function createDataHead(data) {
    data = data || {};
    // 默认的 object.data.head
    let _head = {
        cid: cwx.clientID,
        ctok: '',
        cver: __global.version,
        lang: '01',
        sid: '',
        syscode: (cwx.systemCode || "").toString(),
        auth: (cwx.user && cwx.user.auth) || '',
        sauth: ''
    };

    if (data && data.head) { // 将 object.data.head 中的属性拷贝到 _head 中，_head 包含完整的属性
        Object.keys(data.head).forEach(function (prop) {
            _head[prop] = data.head[prop];
        })
    }

    if (typeof _head.extension == "undefined") {
        _head.extension = [];
    }
    _head.extension.push({"name": "appId", "value": (cwx.appId || "")});
    _head.extension.push({"name": "scene", "value": (cwx.scene || "") + ""});
    return _head;
}

function appendSuffix(url) {
    if (cwx.clientID) {
        //如果h5,并且clienId为服务端下发
        let segChar = url.indexOf('?') > -1 ? '&' : '?';
        url = url + segChar + '_fxpcqlniredt=' + cwx.clientID;
    }
    if (__global.subEnv) {
        let replaceStr = `subEnv=${__global.subEnv}`;
        let reg = /([?&])subEnv=([^&]+)&?/;
        while (reg.test(url)) {
            url = url.replace(reg, '$1')
        }
        url = url.slice(-1) === "&" ? url.slice(0, -1) : url;
        url += (url.match(/\?/) ? '&' : '?') + replaceStr;
    }
    return url;
}

export default {
    generateRequestID,
    formatRequestURL,
    createHeader,
    createDataHead,
    appendSuffix
}
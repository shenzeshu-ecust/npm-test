import { cwx, __global } from '../../../../cwx/cwx';
import util from '../../common/utils/util';
import huser from './huser';
import C from '../C';

const sysInfo = cwx.getSystemInfoSync();
const sdkVersion = sysInfo.SDKVersion || 'NA';
const appName = sysInfo.appName;
const waitCIQueue = [];
let waitCICount = 500;
let timer = null;

const hrequest = function (object, nosoa2) {
    if (!nosoa2) {
        if (!object.data) {
            object.data = {};
        }

        buildExtension(object);

        buildHeader(object);

        // clientid 强依赖
        if (!cwx.clientID && waitCICount > 0) {
            waitForClient(object);
            return;
        }

        // 服务依赖auth, 如果未登陆则跳去登录
        authentication(object);

        // fat环境转发到Mars平台
        handleMarsMock(object);

        // 请求解密开关
        handleEncodeReq(object);
    }

    return cwx.request(object);
};

/**
 * 请求头部构建
 */
const buildHeader = function (object) {
    // 需要连堡垒/镜像的servicecode
    const serviceCodes = ['22370', '26187'];
    const url = object.url;
    object.header = object.header || {};
    object.header['content-type'] = 'application/json';
    const headerMap = {
        'x-ctrip-soa2-req-route': 'custom-test',
        'x-ctx-mirror': 1
    };
    const renderStorage = wx.getStorageSync(C.STORAGE_HOTEL_BASTION_TEST);
    let key = '';
    if (renderStorage === '1') { // 开启堡垒测试值为1
        key = 'x-ctrip-soa2-req-route';
    } else if (renderStorage === '2') {
        key = 'x-ctx-mirror'; // 开启镜像测试值为2
    } else return; // 关闭值为0

    const validCode = serviceCodes.find(item => url.includes(item));
    const { isBastionRequest, isCtripCanaryReq } = util.returnUrlParams(url);
    if (!!validCode && (isBastionRequest === 'true' || isCtripCanaryReq === '1')) {
        object.header[key] = headerMap[key];
    }
};

/**
 * check auth is valid
 * @param res
 * @returns {*}
 */
const invalidTokenError = function (res) {
    if (!res || !res.data) {
        return false;
    }

    if (util.successSoaResponse(res)) {
        return false;
    }

    if (util.isEmpty(res.data.ResponseStatus)) {
        return false;
    }

    const responseStatus = res.data.ResponseStatus;
    return util.isArray(responseStatus.Errors) && responseStatus.Errors.filter(e => e.ErrorCode === 'MobileRequestFilterException').length > 0;
};

/**
 * strong dependence clientid
 * @param object
 */
const waitForClient = function (object) {
    waitCIQueue.push(object);

    if (!timer) {
        timer = setInterval(() => {
            waitCICount--;

            if (cwx.clientID || waitCICount <= 0) {
                waitCIQueue.forEach((w) => {
                    cwx.request(w);
                });

                clearInterval(timer);
            }
        }, 100);
    }
};

/**
 * attach env extensions
 * @param object，
 *        ABTest{Object} - 为服务需要传入的ab实验号以及实验结果，key-value格式，例如 { '230922_HTL_xcxcl': 'B'，'230810_HTL_xcxhj': 'A' }
 */
const buildExtension = function (object) {
    const webp = cwx.getStorageSync(C.STORAGE_WEBP);
    let ubtValue = cwx.getStorageSync('CTRIP_UBT_M');
    // 兼容不同小程序框架的cwx.getStorageSync，防止ubtValue为Object类型
    if (typeof ubtValue === 'object') {
        ubtValue = JSON.stringify(ubtValue);
    }
    const extension = [
        {
            name: 'sdkversion',
            value: sdkVersion + ''
        },
        {
            name: 'openid',
            value: cwx.cwx_mkt.openid
        },
        {
            name: 'pageid',
            value: `${cwx.getCurrentPage().pageId}`
        },
        {
            name: 'supportWebP',
            value: (webp && webp.val) || 'false'
        },
        {
            name: 'ubt',
            value: ubtValue
        },
        {
            name: 'supportFuzzyPrice',
            value: '1'
        }
    ];
    // push app name
    appName && extension.push({
        name: 'appName',
        value: appName
    });
    // ab实验
    if (object.data.ABTest && !util.isEmpty(object.data.ABTest)) {
        extension.push({
            name: 'abtest',
            value: JSON.stringify(object.data.ABTest)
        });
        delete object.data.ABTest;
    }

    if (object.data.head && util.isArray(object.data.head.extension) && object.data.head.extension.length > 0) {
        const targetExtension = object.data.head.extension;

        targetExtension.forEach((ext) => {
            if (['sdkversion', 'openid', 'pageid'].indexOf(ext.name) === -1) {
                extension.push(ext);
            }
        });
        delete object.data.head.extension;
    }

    const head = {
        extension
    };
    object.url.indexOf('14605') > -1 && (head.syscode = '30');

    util.extend(object.data, {
        head
    }, true);
};

/**
 * strong dependence auth
 * @param object
 */
const authentication = function (object) {
    if (!object || !object.checkAuth || !util.isFunction(object.success)) {
        return;
    }

    const _success = object.success;
    const _fail = object.fail;
    const _object = cwx.util.copy(object);

    object.success = function (res) {
        const args = Array.prototype.slice.call(arguments, 0);

        if (!invalidTokenError(res)) {
            return _success.apply(this, args);
        }

        huser.login({
            callback: (loginRes) => {
                if (loginRes.ReturnCode === '0') {
                    return cwx.request(_object);
                }

                if (util.isFunction(_fail)) {
                    _fail.apply(this, args);
                }
            }
        });
    };
};

/**
 * 测试环境的请求URL转发到mars平台
 * 改变object.url
 * @param object
 */
const handleMarsMock = function (object) {
    if (__global.env.toLowerCase() !== 'fat') return;
    const closeMarsMock = wx.getStorageSync(C.STORAGE_HOTEL_MARS_CLOSE);
    if (closeMarsMock) return;

    object.url = getMarsUrl(object.url);

    function getMarsUrl (originUrl) {
        if (!originUrl) return '';
        if (originUrl.toLowerCase().indexOf('subenv=') > -1) return originUrl;

        const [api32236, api41244, api14036, api12416] = [
            originUrl.split('/22370/')[1],
            originUrl.split('/26187/')[1],
            originUrl.split('/14605/')[1],
            originUrl.split('/14160/')[1]
        ];
        if (api32236) return `http://mars.ibu.ctripcorp.com/mid/100032236/token-60a754c25378a6d130d5b1c5-0cc4aef263d40c1e/platform-wap/${api32236}`;
        if (api41244) return `http://mars.ibu.ctripcorp.com/mid/100041244/token-60a754c25378a6d130d5b1c5-0cc4aef263d40c1e/platform-wap/${api41244}`;
        if (api14036) return `http://mars.ibu.ctripcorp.com/mid/100014036/token-60a754c25378a6d130d5b1c5-42ca3e846450cadd/platform-wap/${api14036}`;
        if (api12416) return `http://mars.ibu.ctripcorp.com/mid/100012416/token-60a754c25378a6d130d5b1c5-42ca3e846450cadd/platform-wap/${api12416}`;
        return originUrl;
    }
};

// 请求解密
const handleEncodeReq = function (object) {
    const isEncodeReq = wx.getStorageSync(C.STORAGE_HOTEL_ENCODE_REQ) === '0';
    if (isEncodeReq) {
        object.encodeReqData = 0;
    }
};

export default {
    cancel: cwx.cancel.bind(cwx),
    hrequest
};

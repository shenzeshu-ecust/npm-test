import { cwx, _ } from '../../../../cwx/cwx';
const pluck = function (arr, prop) {
    const ret = [];
    if (!(arr instanceof Array)) {
        return ret;
    }
    arr.forEach(function (e) {
        ret.push(e[prop]);
    });
    return ret;
};

const clone = function (obj) {
    if (!obj) return;
    return JSON.parse(JSON.stringify(obj));
};

const type = (function () {
    const class2type = {};
    const baseTypes = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error'];
    baseTypes.forEach((name) => {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });

    return function (obj) {
        return obj == null ? String(obj) : class2type[({}).toString.call(obj)] || 'unknown';
    };
})();

const isPlainObject = function (obj) {
    // eslint-disable-next-line
    return type(obj) === 'object' && Object.getPrototypeOf(obj) == Object.prototype;
};
const isArray = function (obj) {
    return type(obj) === 'array';
};
const extend = function (target, source, deep) {
    for (const key in source) {
        // eslint-disable-next-line
        if (!source.hasOwnProperty(key)) continue;

        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
            if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                target[key] = {};
            }
            if (isArray(source[key]) && !isArray(target[key])) {
                target[key] = [];
            }

            extend(target[key], source[key], deep);
            continue;
        }

        if (source[key] !== undefined) {
            target[key] = source[key];
        }
    }

    return target;
};

const successSoaResponse = function (result) {
    if (!result || !result.data) {
        return false;
    }

    const checkResponseStatus = (obj) => {
        return obj.ResponseStatus && (obj.ResponseStatus.Ack === 'Success' || obj.ResponseStatus.Ack === 0);
    };

    if (!result.data.ResponseStatus && isPlainObject(result.data.head)) {
        return checkResponseStatus(result.data.head);
    }

    return checkResponseStatus(result.data);
};
const jsonToArray = function (json) {
    if (!isPlainObject(json)) {
        return [];
    }

    const arr = [];
    for (const i in json) {
        // eslint-disable-next-line
        if (json.hasOwnProperty(i) && json[i] === 1) {
            arr.push(i);
        }
    }
    return arr;
};

const isEmptyObject = function (obj) {
    for (const t in obj) {
        // eslint-disable-next-line
        if (obj.hasOwnProperty(t)) {
            return false;
        }
    }
    return true;
};

const isEmpty = (obj) => {
    const objType = type(obj);

    switch (objType) {
    case 'string':
        return obj.trim().length === 0;
    case 'object':
        return isEmptyObject(obj);
    case 'null':
    case 'undefined':
        return true;
    case 'array':
        return obj.length === 0;
    }

    return false;
};

const keys = function (obj) {
    if (isEmpty(obj) || !isPlainObject(obj)) {
        return [];
    }

    const result = [];
    for (const key in obj) {
        // eslint-disable-next-line
        if (obj.hasOwnProperty(key)) {
            result.push(key);
        }
    }

    return result;
};

/**
 * 类IPhoneX机型判断（底部有黑线）
 */
const isIPhoneX = function () {
    let rs = false;
    const systemInfo = wx.getSystemInfoSync();
    if (systemInfo) {
        const w = systemInfo.screenWidth;
        const h = systemInfo.screenHeight;
        const platform = systemInfo.platform;

        // 尺寸参考网址: https://www.ios-resolution.com/
        // IPhoneX: 375:812   IPhoneXR: 414:896  IPhoneXS max: 414:896  IPhone12 mini: 360:780  IPhone12 | IPhone12 Pro: 390:844  IPhone12/13 Pro Max: 428:926
        // IPhone14/15 Pro: 393:852   IPhone 14/15 Pro Max: 430:932
        if (platform.toLowerCase() === 'ios' && (
            (w % 375 === 0 && h % 812 === 0) ||
            (w % 414 === 0 && h % 896 === 0) ||
            (w % 360 === 0 && h % 780 === 0) ||
            (w % 390 === 0 && h % 844 === 0) ||
            (w % 428 === 0 && h % 926 === 0) ||
            (w % 393 === 0 && h % 852 === 0) ||
            (w % 430 === 0 && h % 932 === 0)
        )) {
            rs = true;
        }
    }

    return rs;
};

const createGuid = function () {
    function S1 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(4);
    }
    function newGuid () {
        let guid = '';
        for (let i = 1; i <= 20; i++) {
            guid += S1();
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                guid += '-';
            }
        }
        const num = parseInt(8 * Math.random());
        const date = new Date().getTime() + '';
        guid += date.slice(0, num);
        for (let j = 0; j < 4; j++) {
            guid += S1();
        }
        guid += date.slice(num + 5, 13);
        return guid;
    }
    return newGuid();
};

const dynamicTemplates = (tpl, variables) => {
    if (isEmpty(variables) || isEmpty(variables)) {
        return tpl;
    }

    return tpl.replace(/\$\{(\w+)\}/g, (term, key) => {
        return variables[key] || term;
    });
};

const asyncToast = (params) => {
    return new Promise((resolve, reject) => {
        cwx.showToast({
            ...params,
            success: () => {
                setTimeout(resolve, params.duration || 0);
            },
            fail: reject
        });
    });
};

/**
 * @param doLast 是否执行最后一次
 */
const throttle = (func, wait = 200, doLast) => {
    let prev = Date.now();
    let timer = null;
    return function () {
        const now = Date.now();
        if (now - prev >= wait) {
            func.apply(this, arguments);
            prev = now;
        } else if (doLast) {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                func.apply(this, arguments);
            }, wait);
        }
    };
};

/**
 * ubtSendPV扩展：pageId set与url&refer传参
 */
const exUbtSendPV = (page, opt = {}) => {
    const { pageId, isBack = false } = opt;
    if (!pageId) return;

    const getPageUrl = (tPage) => {
        if (!tPage) return '';

        const queryStr = tPage.__cpage && tPage.__cpage.__ubt_querystring;
        return queryStr ? (tPage.route + queryStr) : tPage.route;
    };
    try {
        page.pageId = pageId;

        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2]; // 上一个页面
        const refer = prevPage ? getPageUrl(prevPage) : '';
        page.ubtSendPV({
            pageId,
            url: getPageUrl(page),
            isBack,
            refer
        });
    } catch (err) {
        // ignore
    }
};
const compareVersion = (v1, v2) => {
    v1 = v1.split('.');
    v2 = v2.split('.');
    const len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }

    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i]);
        const num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return 1;
        } else if (num1 < num2) {
            return -1;
        }
    }

    return 0;
};
const subcribeVersionCompare = () => {
    const sdkVersion = wx.getSystemInfoSync().SDKVersion || '0'; // sdk版本
    const system = wx.getSystemInfoSync().system || '';
    const version = wx.getSystemInfoSync().version || '0'; // 微信版本号
    if (compareVersion(sdkVersion, '2.8.2') >= 0) {
        if ((system.indexOf('iOS') > -1 && compareVersion(version, '7.0.7') >= 0) || (system.indexOf('Android') > -1 && compareVersion(version, '7.0.8') >= 0)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

/**
 * 如果后端下发 foo=a&foo=b，理论应该解析成数组 foo: ['a', 'b']，但目前函数未支持
    case 可参考：https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/getAll
 * @param {*} urlStr
 * @returns
 */

const returnUrlParams = (urlStr) => {
    const params = {};
    const questionMarkIndex = urlStr.indexOf('?');
    if (questionMarkIndex !== -1) {
        const str = urlStr.slice(questionMarkIndex + 1);
        const strs = str.split('&');
        for (const item of strs) {
            const itemArr = item.split('=');
            params[itemArr[0]] = itemArr[1];
        }
    }
    return params;
};
/**
 * 数组去重
 * @param arr
 * @returns {Array[]}
 */
const uniqueArr = (arr) => {
    for (let i = 0, len = arr.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            if (_.isEqual(arr[i], arr[j])) {
                arr.splice(j, 1);
                j--;
                len--;
            }
        }
    }
    return arr;
};

export default {
    uniqueArr,
    pluck,
    clone,
    type,
    extend,
    successSoaResponse,
    isNumber: (obj) => {
        return type(obj) === 'number';
    },
    isFunction: (obj) => {
        return type(obj) === 'function';
    },
    isNumeric: (obj) => {
        const t = type(obj);
        return (t === 'number' || t === 'string') && !isNaN(obj - parseFloat(obj));
    },
    isArray,
    isPlainObject,
    jsonToArray,
    isEmptyObject,
    isEmpty,
    keys,
    isIPhoneX,
    createGuid,
    dynamicTemplates,
    asyncToast,
    throttle,
    exUbtSendPV,
    compareVersion,
    subcribeVersionCompare,
    returnUrlParams
};

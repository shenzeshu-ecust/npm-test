import { cwx } from '../../../../../cwx/cwx.js';

const pluck = function (arr, prop) {
    let ret = [];
    if (!(arr instanceof Array)) {
        return ret;
    }
    arr.forEach(function (e) {
        ret.push(e[prop]);
    });
    return ret;
};

const clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

const type = (function () {
    const class2type = {};
    const baseTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"];
    baseTypes.forEach((name) => {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    return function (obj) {
        return obj == null ? String(obj) : class2type[({}).toString.call(obj)] || 'unknown';
    };
})();

const isPlainObject = function(obj) {
    return type(obj) === 'object' && Object.getPrototypeOf(obj) == Object.prototype
};
const isArray = function (obj) {
  return type(obj) === 'array';
};
const extend = function (target, source, deep) {
    for(const key in source) {
        if(!source.hasOwnProperty(key)) continue;

        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
            if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                target[key] = {}
            }
            if (isArray(source[key]) && !isArray(target[key])) {
                target[key] = []
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
    if(!result || !result.data){
        return false;
    }

    const checkResponseStatus = (obj) => {
      return isPlainObject(obj.ResponseStatus) && (obj.ResponseStatus.Ack === 'Success' || obj.ResponseStatus.Ack === 0);
    };

    if(!result.data.ResponseStatus && isPlainObject(result.data.head)){
        return checkResponseStatus(result.data.head);
    }

    return checkResponseStatus(result.data)
};
const jsonToArray = function(json) {
    if(!isPlainObject(json)){
        return [];
    }

    let arr = [];
    for(let i in json){
        if(json.hasOwnProperty(i) && json[i] === 1){
            arr.push(i);
        }
    }
    return arr;
};

const isEmptyObject = function (obj) {
    for (const t in obj) {
        if(obj.hasOwnProperty(t)) {
            return false;
        }
    }
    return true;
};

const isEmpty = (obj) => {
    const objType = type(obj);

    switch (objType){
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
    if(isEmpty(obj) || !isPlainObject(obj)){
        return [];
    }

    const result = [];
    for(const key in obj){
        if(obj.hasOwnProperty(key)){
            result.push(key);
        }
    }

    return result;
};

const isIPhoneX = function() {
    let rs = false;
    const systemInfo = wx.getSystemInfoSync();
    if (systemInfo) {
        const w = systemInfo.screenWidth;
        const h = systemInfo.screenHeight;
        const platform = systemInfo.platform;

        if (platform === 'ios' && (w % 375 === 0) && (h % 812 === 0)) {
            rs = true;
        }
    }

    return rs;
};

const getUnion = function(){
    return cwx.mkt.getUnion() || {
      allianceid: 262684,
      sid: 711465
    }
  }

module.exports = {
    pluck: pluck,
    clone: clone,
    type: type,
    extend: extend,
    successSoaResponse: successSoaResponse,
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
    isArray: isArray,
    isPlainObject: isPlainObject,
    jsonToArray: jsonToArray,
    isEmptyObject: isEmptyObject,
    isEmpty: isEmpty,
    keys: keys,
    isIPhoneX: isIPhoneX,
    getUnion: getUnion
};
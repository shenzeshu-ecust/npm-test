/**
 * @file utils
 */
import __global from "./global.js";

if (typeof Object.assign != "function") {
  Object.assign = function (target) {
    "use strict";
    if (target == null) {
      throw new TypeError("Cannot convert undefined or null to object");
    }

    target = Object(target);
    for (let index = 1; index < arguments.length; index++) {
      let source = arguments[index];
      if (source != null) {
        for (let key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
    }
    return target;
  };
}

let util = {};

util.entryPath = __wxConfig.pages[0];
util.cwxPath = util.entryPath.replace(/\/entry\/entry$/, "");

util.type = function (obj) {
  let ret = "";
  if (obj === null) {
    ret = "null";
  } else if (obj === undefined) {
    ret = "undefined";
  } else {
    let t = Object.prototype.toString.call(obj);
    let arr = t.match(/^\[object (\w+?)\]$/);
    if (arr) {
      ret = arr[1].toLowerCase();
    } else {
      ret = t;
    }
  }
  return ret;
};

util.compare = function (obj1, obj2) {
  return JSON.stringify(obj1) == JSON.stringify(obj2);
};

util.copy = function (obj) {
  let ret;
  switch (util.type(obj)) {
    case "array":
      ret = obj.map(util.copy);
      break;
    case "object":
      ret = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          ret[key] = util.copy(obj[key]);
        }
      }
      break;
    case "date":
      ret = new Date(+obj);
      break;
    default:
      ret = obj;
      break;
  }
  return ret;
};

util.isDevice = function () {
  return !__global.navigator;
  // return /MicroMessager/.test(__global.navigator.userAgent);
};

util.cc2str = function (input) {
  let output = "";
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(input[i]);
  }
  return output;
};

util.newBase64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  encode: function (input) {
    let output = "",
      chr1,
      chr2,
      chr3,
      enc1,
      enc2,
      enc3,
      enc4,
      i = 0;
    input = util.newBase64._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output =
        output +
        util.newBase64._keyStr.charAt(enc1) +
        util.newBase64._keyStr.charAt(enc2) +
        util.newBase64._keyStr.charAt(enc3) +
        util.newBase64._keyStr.charAt(enc4);
    }
    return output;
  },
  decode: function (input) {
    let output = "",
      chr1,
      chr2,
      chr3,
      enc1,
      enc2,
      enc3,
      enc4,
      i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = util.newBase64._keyStr.indexOf(input.charAt(i++));
      enc2 = util.newBase64._keyStr.indexOf(input.charAt(i++));
      enc3 = util.newBase64._keyStr.indexOf(input.charAt(i++));
      enc4 = util.newBase64._keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = util.newBase64._utf8_decode(output);
    return output;
  },
  _utf8_encode: function (string) {
    string = string.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  },
  _utf8_decode: function (utftext) {
    let string = "",
      i = 0,
      c = 0,
      c1 = 0,
      c2 = 0,
      c3 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }
    return string;
  },
};

util.base64 = {
  key: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  btoa: function (input, opts) {
    opts = opts || {};
    let key = opts.key || util.base64.key;
    let output = "";
    let i = 0;
    let fn = opts.charCodeArray
      ? function (i) {
          return input[i];
        }
      : function (i) {
          return input.charCodeAt(i);
        };
    while (i < input.length) {
      let chr1 = fn(i++);
      let chr2 = fn(i++);
      let chr3 = fn(i++);
      output +=
        key[chr1 >> 2] +
        key[((chr1 & 3) << 4) | (chr2 >> 4)] +
        key[isNaN(chr2) ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6)] +
        key[isNaN(chr3) ? 64 : chr3 & 63];
    }
    return output;
  },
  atob: function (input, opts) {
    opts = opts || {};
    let key = opts.key || util.base64.key;
    let h = {};
    for (let i = 0; i < key.length; i++) {
      h[key[i]] = i;
    }
    let arr = [];
    let i = 0;
    while (i < input.length) {
      let enc1 = h[input[i++]];
      let enc2 = h[input[i++]];
      let enc3 = h[input[i++]];
      let enc4 = h[input[i++]];
      arr.push((enc1 << 2) | (enc2 >> 4));
      enc3 != 64 && arr.push(((enc2 & 15) << 4) | (enc3 >> 2));
      enc4 != 64 && arr.push(((enc3 & 3) << 6) | enc4);
    }
    let output = opts.charCodeArray ? arr : util.cc2str(arr);
    return output;
  },
  encode: function (str) {
    return util.base64.btoa(unescape(encodeURIComponent(str)));
  },
  decode: function (str) {
    return decodeURIComponent(escape(util.base64.atob(str)));
  },
};

/*
     @brief base64编码
     @str 原始字符串
     return 加密后的字符串
 */
util.base64Encode = function (str) {
  return util.base64.encode(str);
};
/*
     @brief base64解码
     @base64str 经过base64编码的字符串
     return 解码后的字符串
 */
util.base64Decode = function (base64str) {
  return util.base64.decode(base64str);
};

//加密openid用
util.mktBase64Encode = function (str) {
  let baseStr = util.base64Encode(str);
  let chars = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  let length = Math.min(baseStr.length, chars.length);
  let begin = 0;
  let end = 0;
  do {
    begin = Math.floor(Math.random() * length);
    end = Math.floor(Math.random() * (length - begin)) + begin;
  } while (!(begin > 0 && end < length - 1 && end > begin + 1));
  let trim = baseStr.substr(begin, end - begin);
  let trans = trim.split("").reverse().join("");
  let result =
    baseStr.substr(0, begin) +
    trans +
    baseStr.substr(end, baseStr.length - end) +
    chars[begin] +
    chars[end];
  return result;
};
//解密openid
util.mktBase64Decode = function (str) {
  let chars = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  let length = str.length;
  let base = str.substr(0, str.length - 2);
  let begin = chars.indexOf(str.substr(length - 2, 1));
  let end = chars.indexOf(str.substr(length - 1, 1));
  let sub = base.substr(begin, end - begin);
  let trans = sub.split("").reverse().join("");
  let baseStr =
    base.substr(0, begin) + trans + base.substr(end, base.length - end);
  let result = util.base64Decode(baseStr);
  return result;
};

/**
 *  获取到设备信息
 */
util.systemInfo = wx.getSystemInfoSync();

util.createUUID = (function () {
  let n = 0;
  return function (prefix) {
    return (prefix || "") + "_" + new Date().getTime() + "_" + ++n;
  };
})();
util.getDeltaFromUrl = function (url) {
  if (!url) {
    return;
  }
  let delta = "?";
  if (/\?.+/.test(url)) {
    delta = "&";
  }
  return delta;
};

function prefixZero(target, expectLength) {
  if (typeof target !== "string") {
    target = JSON.stringify(target);
  }
  let result = target.padStart(expectLength, "0");
  return result;
}
util.formatTime = function (date, needMs) {
  let dateObj = {
    year: {
      data: date.getFullYear(),
      length: 4,
    },
    month: {
      data: date.getMonth() + 1,
      length: 2,
    }, //月份
    day: {
      data: date.getDate(),
      length: 2,
    }, //日
    hour: {
      data: date.getHours(),
      length: 2,
    }, //小时
    minute: {
      data: date.getMinutes(),
      length: 2,
    }, //分
    second: {
      data: date.getSeconds(),
      length: 2,
    }, //秒
    milliSecond: {
      data: date.getMilliseconds(),
      length: 3,
    }, //毫秒
  };
  for (let key in dateObj) {
    let item = dateObj[key];
    dateObj[key] = prefixZero(item.data, item.length);
  }
  if(needMs) {
    return `${dateObj.year}-${dateObj.month}-${dateObj.day} ${dateObj.hour}:${dateObj.minute}:${dateObj.second}.${dateObj.milliSecond}`;
  }
  return `${dateObj.year}-${dateObj.month}-${dateObj.day} ${dateObj.hour}:${dateObj.minute}:${dateObj.second}`;
};

util.decodeURIComponentSafely = function (url) {
  try {
    return decodeURIComponent(url)
  } catch(e) {
    console.log('URI Component not decodable:' + url)
    return url;
  }
}

export default util;

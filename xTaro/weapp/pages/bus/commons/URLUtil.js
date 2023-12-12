if (!String.prototype.splice) {
    String.prototype.splice = function (start, delCount, newSubStr) {
        return (
            this.slice(0, start) +
            newSubStr +
            this.slice(start + Math.abs(delCount))
        );
    };
}

var serializeURL = function (url, params) {
    if (!url) {
        return "";
    }
    var paramsString = serializeParams(params);
    if (paramsString.length > 0) {
        if (url.indexOf("?") > 0) {
            if (url.endsWith("?") || url.endsWith("&")) {
                url = url + paramsString;
            } else {
                url = url + "&" + paramsString;
            }
        } else {
            url = url + "?" + paramsString;
        }
    }
    return url;
};

var serializeParams = function (param) {
    if (!param) {
        return null;
    }
    var resultString = "";
    var paramArray = [];
    for (var key in param) {
        var value = param[key];
        var paramStr = "";
        var valueString = "";
        if (value instanceof Object) {
            valueString = encodeURIComponent(JSON.stringify(param[key]));
        } else {
            valueString = value;
        }
        // valueString = encodeURIComponent(valueString);
        paramStr = key + "=" + valueString;
        paramArray.push(paramStr);
    }
    resultString = paramArray.join("&");
    return resultString;
};

function parseURL(url) {
    if (!url) return {};
    if (url.indexOf("?") > 0) {
        url = url.substring(url.indexOf("?"));
    }
    var ret = {},
        seg = url.replace(/^\?/, "").split("&"),
        len = seg.length,
        i = 0,
        s;
    for (; i < len; i++) {
        if (!seg[i]) {
            continue;
        }
        s = seg[i].split("=");
        ret[s[0]] = s[1];
    }
    return ret;
}
/**
 * 将param解析成一个对象。
 */
function parseURLParam(obj) {
    var param;
    if (typeof obj == "string") {
        param = parseURL(obj);
    } else {
        param = obj;
    }
    let result = getDecodeParams(param);
    return result;
}

function getDecodeParams(param) {
    let result = {};

    Object.keys(param).forEach((key) => {
        let value = param[key];
        console.log("key----", key, "value---", value);
        value = decodeURIComponent(value);
        console.log("key----", key, "value---", value);

        let str = "";
        let exception = false;

        // 尝试JSON解析，失败则使用value原值。
        try {
            str = JSON.parse(value);
        } catch (e) {
            exception = true;
        } finally {
            if (!exception) {
                value = str;
            }
        }

        if (value === "undefined") {
            value = undefined;
        } else if (value === "null") {
            value = null;
        } else if (value === "NaN") {
            value = NaN;
        }

        result[key] = value;
    });

    return result;
}

var versionCompare = function (versionNew, version) {
    //versionNew 同一版本 return 0 高于返回 1 低于 返回 -1
    var vNewArray = versionNew.split(".");
    var vArray = version.split(".");
    var ret = 0;
    var maxLength = Math.max(vNewArray.length, vArray.length);
    for (var i = 0; i < maxLength; i++) {
        var a = vNewArray[i];
        var b = vArray[i];
        if (a === b) {
            continue;
        }
        if (typeof a == "undefined") {
            ret = -1;
            break;
        }
        if (typeof b == "undefined" || a > b) {
            ret = 1;
            break;
        } else {
            ret = -1;
        }
    }
    return ret;
};

export default {
    serializeParams,
    parseURLParam,
    versionCompare,
    serializeURL,
};

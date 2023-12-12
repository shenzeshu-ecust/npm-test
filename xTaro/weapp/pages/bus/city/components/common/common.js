function type(obj) {
    var ret = '';
    if (obj === null) {
        ret = 'null';
    } else if (obj === undefined) {
        ret = 'undefined';
    } else {
        var t = Object.prototype.toString.call(obj);
        var arr = t.match(/^\[object (\w+?)\]$/);
        if (arr) {
            ret = arr[1].toLowerCase();
        } else {
            ret = t;
        }
    }
    return ret;
}
function deepCopy(obj) {
    var ret;
    switch (type(obj)) {
        case 'array':
            ret = obj.map(deepCopy);
            break;
        case 'object':
            ret = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    ret[key] = deepCopy(obj[key]);
                }
            }
            break;
        case 'date':
            ret = new Date(+obj);
            break;
        default:
            ret = obj;
            break;
    }
    return ret;
}
function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | (Math.random() * radix)];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | (Math.random() * 16);
                uuid[i] = chars[i == 19 ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}

export default {
    type,
    deepCopy,
    uuid,
};
export { type, deepCopy, uuid };

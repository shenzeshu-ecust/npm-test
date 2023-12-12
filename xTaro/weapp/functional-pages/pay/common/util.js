/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2021-11-16 16:14:41
 * @LastEditors: lh_sun
 * @LastEditTime: 2021-11-16 22:02:36
 */
var ret = {};

ret.appendQuery = function (url, query) {
    var urlquery = (url + '&' + query) || '';
    return urlquery.replace(/[&?]{1,2}/, '?');
};

ret.pageQueryStr = function(data){
	return Object.keys(data).map(function (key) {
		let v = encodeURIComponent(data[key]);
		if(v === 'undefined'){
			v = ''
		}
        return encodeURIComponent(key) + "=" + v;
    }).join("&");
};

ret.cc2str = function (input) {
    let output = '';
    for (let i = 0; i < input.length; i++) {
        output += String.fromCharCode(input[i]);
    }
    return output;
};

ret.base64 = {
    key: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    btoa: function (input, opts) {
        opts = opts || {};
        let key = opts.key || ret.base64.key;
        let output = "";
        let i = 0;
        let fn = opts.charCodeArray ? function (i) {
            return input[i];
        } : function (i) {
            return input.charCodeAt(i);
        };
        while (i < input.length) {
            let chr1 = fn(i++);
            let chr2 = fn(i++);
            let chr3 = fn(i++);
            output += key[chr1 >> 2]
                + key[((chr1 & 3) << 4) | (chr2 >> 4)]
                + key[isNaN(chr2) ? 64 : ((chr2 & 15) << 2) | (chr3 >> 6)]
                + key[isNaN(chr3) ? 64 : chr3 & 63];
        }
        return output;
    },
    atob: function (input, opts) {
        opts = opts || {};
        let key = opts.key || ret.base64.key;
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
        let output = opts.charCodeArray ? arr : ret.cc2str(arr);
        return output;
    },
    encode: function (str) {
        return ret.base64.btoa(unescape(encodeURIComponent(str)));
    },
    decode: function (str) {
        return decodeURIComponent(escape(ret.base64.atob(str)));
    }
};



/*
    @brief base64编码
    @str 原始字符串
    return 加密后的字符串
*/
ret.base64Encode = function (str) {
    return ret.base64.encode(str)
};
/*
    @brief base64解码
    @base64str 经过base64编码的字符串
    return 解码后的字符串
*/
ret.base64Decode = function (base64str) {
    return ret.base64.decode(base64str)
};

module.exports = ret;
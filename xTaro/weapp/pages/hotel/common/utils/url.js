import util from './util.js';

export default {
    param: function (obj) {
        if (util.type(obj) !== 'object') {
            return '';
        }

        const arr = [];
        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                arr.push(`${name}=${obj[name]}`);
            }
        }

        return arr.join('&');
    },

    paramString: function (obj) {
        if (util.type(obj) !== 'object') {
            return '';
        }

        const arr = [];
        for (const name in obj) {
            const value = obj[name];
            const valueValid = !!value || value === 0;
            if (obj.hasOwnProperty(name) && valueValid) {
                arr.push(`${name}=${value}`);
            }
        }

        return arr.join('&');
    },

    getUrlParam: function (url, name) {
        if (typeof name === 'undefined' && util.type(url) === 'string') {
            name = url;
            url = location.href;
        }

        const re = new RegExp('(\\?|&)' + name + '=([^&]+)(&|$)', 'i'); const m = url.match(re);
        return decodeURIComponent(m ? m[2] : '');
    },

    getUrlParams: function (url) {
        const _url = url.split('://'); // TODO => i = url.indexOf('://'); _url = [url.substring(0,i), url.substring(i+3)]
        const searchReg = /([^&=?]+)=([^&]+)/g;
        const urlParams = {};
        let match, value, name;

        while (match = searchReg.exec(_url[_url.length - 1])) {
            name = match[1];
            value = decodeURIComponent(match[2]);
            urlParams[name] = value;
        }

        return urlParams;
    },

    setParams: function (url, params) {
        if (util.isEmpty(params)) return url;

        let currentParams = this.getUrlParams(url);
        const urlObj = this.parseUrl(url);

        currentParams = util.extend(currentParams, params, true);
        const mergeParams = this.param(currentParams);

        return urlObj.hrefNoSearch + (mergeParams ? '?' + mergeParams : '') + urlObj.hash;
    },

    parseUrl: function (url) {
        const urlParseRE = /^\s*(((([^:\/#\?]+:)?(?:(\/\/)((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?\]\[]+|\[[^\/\]@#?]+\])(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/;
        const matches = urlParseRE.exec(url || '') || [];

        return {
            href: matches[0] || '',
            hrefNoHash: matches[1] || '',
            hrefNoSearch: matches[2] || '',
            domain: matches[3] || '',
            protocol: matches[4] || '',
            doubleSlash: matches[5] || '',
            authority: matches[6] || '',
            username: matches[8] || '',
            password: matches[9] || '',
            host: matches[10] || '',
            hostname: matches[11] || '',
            port: matches[12] || '',
            pathname: matches[13] || '',
            directory: matches[14] || '',
            filename: matches[15] || '',
            search: matches[16] || '',
            hash: matches[17] || ''
        };
    }
};

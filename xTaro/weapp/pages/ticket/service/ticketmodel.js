import {_, cwx, config} from '../common.js';
var ticketstore = require('ticketstore.js');
//var util = require('util.js');

function replaceKey(str, obj) {
    return str.replace(/\{(.+?)\}/g, function (all, key) {
        return typeof obj[key] != 'undefined' ? obj[key] : all
    })
    // Object.keys(obj).map(function (key) {
    //     str = str.replace('{' + key + '}', obj[key]);
    // })
    //return str;
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function request(options) {
    var self = this;

    //添加默认soa
    var channel = self.channel || config.Base.channel;
    //替换channel和url
    var url = self.url;
    //处理url
    var requestUrl = replaceKey(config.Base.restful, {url: url, channel: channel});

    //处理配置参数
    var requestParam = {pageid: 0};

    //继承参数
    _.extend(requestParam, config.Base.requestParam, self.param || {}, options.data);

    //store
    var store = self.store;

    //判断缓存
    if (self.expire) {
        var req = store && store.get(true);
        if (req && JSON.stringify(req) == JSON.stringify(requestParam)) {
            var res = store.get();
            var data = store.get(false);
            if (res && data) {
                options.success && options.success(res);
                options.complete && options.complete(data);
                return;
            }
        }
    }

    cwx.request({
        url: requestUrl,
        data: requestParam,
        success: function (json) {
            //wx ajax回来的数据，外面多了一层
            var data = json && json.data || {};
            //restful的数据，有errcode时候判errcode
            var errcode = data.head && data.head.errcode || 0;
            //真正需要的数据,地面是data.data，其他接口可能直接data
            var res = clone(data.data || data);
            //如果errcode>0或res不存在或filter过滤为真，为有错误
            //filter为格式化前的数据
            if (!data.head || errcode > 0 || !res || (options.filter && options.filter(res))) {
                //清理缓存
                if (store) {
                    store.remove(true);
                    store.remove(false);
                    store.remove(null);
                }
                options.fail && options.fail(data);
                return;
            }
            //格式化数据
            if (options.format) {
                res = options.format(res);
            }
            //如果不缓存
            if (!store) {
                options.success && options.success(res, data);
                return;
            }
            //存储请求参数
            requestParam.head && delete requestParam.head;
            store.setAsync(requestParam, true);
            //存原始数据
            store.setAsync(data, false);
            //存格式化后的数据
            store.setAsync(res, null, function () {
                options.success && options.success(res, data);
            });
        },
        fail: function (json) {
            //需要处理head下的errmas，或data下的数据为空等，所以返回的是原始restful数据
            var data = json && json.data || (store && store.get(false));
            options.fail && options.fail(data);
        },
        complete: function (data) {
            //坑爹的，完成时候没有json，没有！
            data = data || (store && store.get(false));
            options.complete && options.complete(data);
        }
    });
}

var model = config.Model;
Object.keys(model).map(function (key) {
    model[key].request = request;
})

module.exports = model;

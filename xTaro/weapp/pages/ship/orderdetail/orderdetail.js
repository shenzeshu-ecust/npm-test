import { cwx, CPage, _, __global } from '../../../cwx/cwx.js';

import WebView from '../webview/index';

const OrderWebView = {
    buildLink(options) {
        if (options.url) {
            return options.url;
        }
        var oid = options.orderId;
        var url = `https://m.ctrip.com/webapp/ship/ship/orderdetail?t=1&fromminiapp=weixin&popup=close&oid=${oid}&`;

        let union = cwx.mkt.getUnion();
        if (union) {
            if (union.allianceid) {
                url = url + '&allianceid=' + union.allianceid;
            }
            if (union.sid) {
                url = url + '&sid=' + union.sid;
            }
            if (union.sourceid) {
                url = url + '&sourceid=' + union.sourceid;
            }
            if (union.ouid) {
                url = url + '&ouid=' + union.ouid;
            }
        }
        return {
            ...options,
            doRefreshWhileBack: true,
            url: encodeURIComponent(url),
        };
    },
    onLoad(options) {
        if (__global.appId === 'wx3258f747a3258021') {
            this.main(options);
        } else {
            const mainOptions = this.getH5UrlOptions(options);
            let mergedOptions = Object.assign({}, options, mainOptions);
            super.onLoad(mergedOptions);
        }
    },

    main(options) {
        cwx.redirectTo({
            url: '/pages/newship/order/index?orderNumber=' + options.orderId,
        });
    },
};
OrderWebView.__proto__ = WebView;
OrderWebView.register();

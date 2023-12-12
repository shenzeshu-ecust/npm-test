import {CPage, cwx, __global} from "../../../cwx/cwx.js";
var IsProd = /^prd$/i.test(__global.env),
    H5OrderDetailUrl = IsProd ? 'https://m.ctrip.com/tour/order_ttd/orderdetail?orderid=OrderId' : 'https://m.fat30.qa.nt.ctripcorp.com/tour/order_ttd/orderdetail?orderid=OrderId'

CPage({
    pageId: 10320629735,
    onLoad: function (options) {
        cwx.showToast({
            title: '订单详情加载中...',
            icon: 'loading',
            duration: 3000
        });

        var orderid = parseInt(options.orderid) || 0;
        // const ab = cwx.ABTestingManager.valueForKeySync("210809_VAC_ToNa") || 'A';
        const orderdetail_url = '/pages/orderttd/detail/index?orderid='+ orderid;
        // if (ab.toLocaleUpperCase() === 'B') {
            cwx.redirectTo({
                url: orderdetail_url
            });
            // return;
        // }

        // cwx.component.scwebview({
        //     data: {
        //         isNavigate: false,
        //         url: encodeURIComponent(H5OrderDetailUrl.replace(/OrderId/g, orderid)),
        //         needLogin: true,
        //     }
        // });
    },
    onShow: function() {
    },
    onHide: function() {
    },
    onReady: function () {
        cwx.setNavigationBarTitle({title: '订单详情'});
    },
});


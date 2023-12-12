import { cwx } from '../../../../cwx/cwx';
export default {
    listScreenShotsTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_wechat_list_screenshots', options);
        } catch (e) {
            // console.error(e);
        }
    },
    detailScreenShotsTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_wechat_detail_screenshots', options);
        } catch (e) {
            // console.error(e);
        }
    },
    orderScreenShotsTrace: function (page, options) {
        try {
            page.ubtTrace && page.ubtTrace('htl_c_wechat_order_screenshots', options);
        } catch (e) {
            // console.error(e);
        }
    },

    // 截屏埋点监听
    addScreenObserver: function (callback) {
        cwx.Observer.addObserverForKey('onUserCaptureScreen', callback);
    },
    // 移除截屏埋点监听
    removeScreenObserver: function (callback) {
        cwx.Observer.removeObserverForKey('onUserCaptureScreen', callback);
    }

};

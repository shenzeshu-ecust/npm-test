export default {
    // 列表页澳门优惠券，发券弹窗曝光和领券实名认证曝光
    listMacaoOrRealNamePopShow: function (page, options) {
        page.ubtTrace && page.ubtTrace('htl_c_applet_list_macau_coupon_banner_show', {
            page: options.page, // 页面id，防止漂移
            window_type: options.window_type // 弹窗类型：1.发券弹窗曝光，2.领券实名认证曝光
        });
    },
    // 列表页澳门优惠券，发券弹窗点击
    listMacaoPopClick: function (page, options) {
        page.ubtTrace && page.ubtTrace('htl_c_applet_list_macau_coupon_banner_click', {
            page: options.page, // 页面id，防止漂移
            click_button_type: options.click_button_type // 点击按钮类型：1.一键领取，2.关闭
        });
    },
    // 详情页领券订流程，领券实名认证弹窗曝光
    detailRealNamePopShow: function (page, options) {
        page.ubtTrace && page.ubtTrace('htl_c_applet_dtl_macau_coupon_authentication_banner_show', {
            page: options.page // 页面id，防止漂移
        });
    },
    // 详情页领券订流程，领券实名认证弹窗点击
    detailRealNamePopClick: function (page, options) {
        page.ubtTrace && page.ubtTrace('htl_c_applet_dtl_macau_coupon_authentication_banner_click', {
            page: options.page, // 页面id，防止漂移
            click_button_type: options.click_button_type // 点击按钮类型：1.不领券直接订，2.去认证
        });
    },
    // 填写页实名认证，"已享受澳门优惠券..."红字曝光
    bookingMacaoTipShow: function (page, options) {
        page.ubtTrace && page.ubtTrace('htl_c_applet_dtl_macau_coupon_authentication_banner_click', {
            page: options.page, // 页面id，防止漂移
            red_font: options.red_font // 曝光红色自提内容
        });
    }
};

import { cwx, CPage } from '../../../cwx/cwx.js';
import trace from '../common/trace/smztrace';
import ModelUtil from '../common/utils/model.js';
import hrequest from '../common/hpage/request';
import commonrest from '../common/commonrest';

CPage({
    pageId: '10650026882',
    /**
     * 页面的初始数据
     */
    data: {},
    isPIPGPage: true, // 个保指引页的标记（屏蔽个保授权弹窗）

    showLoading: function (msg) {
        wx.showToast({
            title: msg || '加载中',
            icon: 'loading',
            duration: 20000,
            mask: true
        });
    },
    hideLoading: function () {
        wx.hideToast();
    },
    goToHotelList: function () {
        cwx.reLaunch({
            url: '/pages/hotel/list/index',
            doNotIntercept: true // 不阻断后续流程
        });
    },
    onLoad: function (options) {
        const self = this;

        if (options.source === 'yunji' && options.hotelid) {
            // 第三方云迹渠道 通过hotelid和source请求接口单独处理
            const { hotelid } = options;
            const serveUrl = 'getwechaturlNew';
            hrequest.hrequest({
                url: ModelUtil.serveUrl(serveUrl),
                data: {
                    originUrl: `https://m.ctrip.com/events/w/${hotelid}.html?source=yunji`
                },
                success: function (result) {
                    self.hideLoading();

                    if (
                        result &&
                        result.data &&
                        result.data.ResponseStatus &&
                        result.data.ResponseStatus.Ack === 'Success'
                    ) {
                        // 从路由页跳转到引导登录页，记一个埋点
                        if (result.data.wechatUrl.indexOf('guidelogin') > -1) {
                            trace.traceGuideLoginPage(self, {
                                sourceid: cwx.scene,
                                cid: cwx.clientID
                            });
                        }
                        cwx.redirectTo({
                            url: result.data.wechatUrl,
                            doNotIntercept: true // 不阻断后续流程
                        });
                    } else {
                        self.goToHotelList();
                    }
                },
                fail: function () {
                    self.hideLoading();
                    // console.log('error ---', err);
                    self.goToHotelList();
                }
            });

            return;
        }

        // console.log('options ---', options);
        if (!options.q) {
            // console.log('no q ---', options);
            this.goToHotelList();
            return;
        }

        if (options.appscan) {
            // app扫码渠道 同步app登录态
            cwx.dynamicLogin.subscribe((res) => {
                // console.log('登录态同步结果：' + res);
                self.getFinalUrl(options);
            });
        } else {
            self.getFinalUrl(options);
        }
        try {
            this.ubtDevTrace && this.ubtDevTrace('d_HTL_WX_router_source', options);
        } catch (e) {}
    },

    getFinalUrl: function (options) {
        const self = this;
        const url = decodeURIComponent(options.q);
        this.showLoading('...请稍后');
        const serveUrl = 'getwechaturlNew';
        hrequest.hrequest({
            url: ModelUtil.serveUrl(serveUrl),
            data: {
                originUrl: url,
                scene: cwx.scene + '',
                appscan: options.appscan ? '1' : '0'
            },
            success: function (result) {
                self.hideLoading();

                if (
                    result &&
                    result.data &&
                    result.data.ResponseStatus &&
                    result.data.ResponseStatus.Ack === 'Success'
                ) {
                    // 从路由页跳转到引导登录页，记一个埋点
                    if (result.data.wechatUrl.indexOf('guidelogin') > -1) {
                        trace.traceGuideLoginPage(self, {
                            sourceid: cwx.scene,
                            cid: cwx.clientID
                        });
                    }
                    cwx.redirectTo({
                        url: result.data.wechatUrl,
                        doNotIntercept: true // 不阻断后续流程
                    });
                } else {
                    self.goToHotelList();
                }
            },
            fail: function () {
                self.hideLoading();
                // console.log('error ---', err);
                self.goToHotelList();
            }
        });
    }
});

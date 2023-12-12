import {
    cwx,
    CPage,
    __global
} from '../../../../cwx/cwx.js';

import urlUtil from '../../common/utils/url.js';
import huser from '../../common/hpage/huser';
import hrequest from '../../common/hpage/request';

// cwx/component/cwebview/cwebview.js
CPage({
    pageId: '10320674802',
    checkPerformance: true, // 白屏检测标志位

    /**
     * 页面的初始数据
     */
    data: {
        canWebView: cwx.canIUse('web-view'),
        pageName: 'cwebview',
        url: '',
        wsg: '',
        isNavigate: true, // 跳转方式 true: navigater, false: redirect
        loginErrored: false, // isNavigate方式是否登录失败
        loginErrorUrl: '' // 登录失败自定义显示地址  默认：url值
    },

    showUrlError: function () {
        this.setData({
            url: '',
            wsg: '目标地址出了点问题，请重新打开该页面'
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const self = this;
        let data = options.data;
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                this.showUrlError();
            }
        }
        const url = this.processUrl(decodeURIComponent(data.url), data.query || {});
        const title = decodeURIComponent(data.title || '');
        if (url.length <= 0) {
            return this.showUrlError();
        }
        const needLogin = data.needLogin || urlUtil.getUrlParam(url, 'needlogin') || urlUtil.getUrlParam(url, 'needauth') || false;
        const isNavigate = data.isNavigate || true;
        const loginErrorUrl = data.loginErrorUrl || '';
        const image = data.image ? decodeURIComponent(data.image) : '';
        const hideShare = data.hideShare;
        const hideHome = data.hideHome;
        if (hideShare) {
            wx.hideShareMenu && wx.hideShareMenu();
        }
        if (hideHome) {
            wx.hideHomeButton();
        }

        this.setData({
            isNavigate,
            loginErrorUrl,
            image,
            title,
            orderid: data.orderid || 0
        });

        // 同步登录态
        cwx.syncLogin.load({
            url,
            isLogin: needLogin,
            loginErrorUrl,
            success: function (url) {
                self.webLoadUrl(url);
            },
            fail: function (errorUrl) {
                if (isNavigate) {
                    cwx.navigateBack();
                } else {
                    self.webLoadUrl(errorUrl);
                }
            }
        });

        // if (!needLogin) {
        //     this.webLoadUrl(url)
        // } else {
        //     this.webGetToken(url)
        // }
    },

    /*
     * 加载页面
     */
    webLoadUrl: function (url) {
        this.setData({
            url
        });
    },

    /*
     * 将要获取token
     */
    webGetToken: function (url) {
        cwx.user.checkLoginStatusFromServer((authValid) => {
            const auth = cwx.user.auth;

            if (authValid) {
                this.webGetTokenByAuth(url, auth);
            } else {
                this.webToLogin(url);
            }
        });
    },

    /*
     * 跳登录获取toekn
     */
    webToLogin: function (url) {
        const self = this;
        huser.login({
            param: {
                IsAuthentication: 'F'
            },
            callback: function () {
                const auth = cwx.user.auth;
                if (auth.length > 0) {
                    self.webGetTokenByAuth(url, auth);
                } else {
                    self.loginedErrorHandler(); //
                }
            }
        });
    },

    /*
     * auth 获取token (token 有效时间2分钟)
     */
    webGetTokenByAuth: function (url) {
        const self = this;
        hrequest.hrequest({
            url: '/restapi/soa2/14458/checkCrossTicket.json',
            method: 'POST',
            data: {
                context: {
                    platform: 'miniapp',
                    clientid: cwx.clientID
                }
            },
            success: function (res) {
                self.hideLoading();
                const data = res.data;
                if (res.statusCode === 200 && data && data.token) {
                    const responseStatus = data.ResponseStatus;
                    if (responseStatus && responseStatus.Ack === 'Success') {
                        const token = data.token;
                        let host = '';
                        if (__global.env.toLowerCase() === 'uat') {
                            host = 'accounts.uat.qa.nt.ctripcorp.com';
                        } else if (__global.env.toLowerCase() === 'fat') {
                            host = 'accounts.fat466.qa.nt.ctripcorp.com';
                        } else {
                            host = 'accounts.ctrip.com'; // 生产
                        }
                        const currentHost = 'https://' + host;
                        const newUrl = currentHost + '/H5Login/writecrossticket?ctok=' + token + '&backurl=' + encodeURIComponent(url);
                        self.webLoadUrl(newUrl);
                    }
                } else {
                    self.loginedErrorHandler(url);
                    cwx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        complete: function () {
                            try {
                                const orderid = self.data.orderid;
                                if (orderid) {
                                    self.ubtTrace && self.ubtTrace(103560, {
                                        pageId: self.pageId,
                                        orderid,
                                        type: 'ctrip',
                                        error: JSON.stringify(data)
                                    });
                                }
                            } catch (e) {
                            }
                        }
                    });
                }
            },
            fail: function () {
                self.hideLoading();
                self.loginedErrorHandler(url);
                cwx.showToast({
                    title: '授权失败',
                    icon: 'none',
                    complete: function () {
                        try {
                            const orderid = self.data.orderid;
                            if (orderid) {
                                self.ubtTrace && self.ubtTrace(103560, {
                                    pageId: self.pageId,
                                    orderid,
                                    type: 'weixin',
                                    error: 'network error'
                                });
                            }
                        } catch (e) {
                        }
                    }
                });
            }
        });
    },

    /**
     * 授权失败操作
     */
    loginedErrorHandler: function () {
        const loginErrorUrl = this.data.loginErrorUrl;

        if (this.data.isNavigate) {
            const pages = getCurrentPages();
            const prevPage = pages[pages.length - 2]; // 上一个页面
            if (prevPage.data.pageName && prevPage.data.pageName === 'cwebview') {
                prevPage.setData({
                    loginErrored: true,
                    loginErrorUrl: (this.data.loginErrorUrl === this.data.url) ? prevPage.data.loginErrorUrl : this.data.loginErrorUrl
                });
            }
            cwx.navigateBack();
        } else if (!this.data.isNavigate) {
            if (loginErrorUrl) {
                this.webLoadUrl(loginErrorUrl); // redirect方式 登录失败 加载loginErrorUrl
            } else {
                cwx.navigateBack();
            }
        }
    },

    /**
     * web回调数据
     */
    webPostMessage: function (e) {},

    hideLoading: function () {
        try {
            cwx.hideToast();
            cwx.hideLoading();
        } catch (err) {

        }
    },
    showLoading: function (title) {
        title = title || '';
        try {
            cwx.showLoading({
                title,
                mask: true
            });
        } catch (err) {
            cwx.showToast({
                title,
                icon: 'loading',
                duration: 10000,
                mask: true
            });
        }
    },

    processUrl: function (url, query) {
        const currentOpenID = cwx.cwx_mkt.openid;

        query.mine = 0;
        query.wemp = 1;

        if (query.mktshare) {
            const mktShare = JSON.parse(cwx.util.mktBase64Decode(query.mktshare.replace(/\(\)/g, '=')));
            const fromOpenID = mktShare.fromopenid;
            query.mine = currentOpenID === fromOpenID ? 1 : 0;
        }

        return urlUtil.setParams(url, {
            q: cwx.util.mktBase64Encode(JSON.stringify(query)),
            mktopenid: currentOpenID
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        let path = this.getPageStack().pop();
        const url = encodeURIComponent(options.webViewUrl);
        let image = '';
        if (this.data.image) {
            image = encodeURIComponent(this.data.image);
        }

        path += '?image=' + image + '&data=' + JSON.stringify({
            url
        });

        const imageUrl = this.data.image;
        const title = this.data.title;
        const data = {
            path
        };

        if (imageUrl) {
            data.imageUrl = imageUrl;
        }

        if (title) {
            data.title = title;
        }

        return data;
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (this.data.loginErrored) {
            // 说明是navigeto登录返回错误
            this.setData({
                loginErrored: false // 重置参数
            });

            if (this.data.loginErrorUrl.length > 0 && this.data.loginErrorUrl !== this.data.url) { this.webLoadUrl(this.data.loginErrorUrl); }
        }
    }
});

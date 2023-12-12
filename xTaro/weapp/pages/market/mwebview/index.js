import { cwx, CPage, __global } from '../../../cwx/cwx.js';
import CWebviewBase from '../../../cwx/component/cwebview/CWebviewBaseClass.js';
const __super__ = CWebviewBase.prototype

const mWebView = {...__super__, ...{
    	data: {
    		...__super__.data,
            canGetUserInfo: wx.canIUse('button.open-type.getUserInfo'),
            showGetUserInfo: false, // 显示授权界面
            optionsData: {}, // options数据
    	},
        originOnLoad(optionsData) {
            __super__.onLoad.call(this, {
                data: optionsData,
            });
        },
    	onLoad(options) {
    		const data = JSON.parse(decodeURIComponent(options.data) || '{}');
            console.log(data);
            const {
                url = '', // 唤起页面
                needLogin = false, // 是否立即需要授权小程序登录态
                needOpenId = false, // 是否需要加密的小程序openid
                needUserInfo = false, // 是否需要用户信息
                isNavigate = false, // 跳转页面方式
                loginErrorUrl = '', // 登录失败自定义显示地址
            } = data;
            /**
             * 查看是否授权
             */
            this.setData({
                optionsData: {
                    url,
                    needLogin,
                    needOpenId,
                    needUserInfo,
                    isNavigate,
                    loginErrorUrl,
                }
            }, () => {
                this.patchOpenId(() => {
                    if (needUserInfo) {
                        this.getUserInfo();
                    } else {
                        // 调用原来的onLoad
                        this.setOnLoad();
                    }
                });
            });
            /**
             * 重定义shareData默认值
             */
            this.shareData = {
                ...__super__.shareData,
                title: '携程旅行',
                path: this.getCurrentPageUrlWithArgs(),
            }
    	},
        /**
         * 获取当前页带参数的url
         */
        getCurrentPageUrlWithArgs(){
            const pages = getCurrentPages(); // 获取加载的页面
            const { route: url, options } = pages[pages.length - 1]; // 获取当前页面的对象
            const args = Object.entries(options).map(_ => `${_[0]}=${_[1]}`).join('&');
            const urlWithArgs = url + '?' + args;
            return urlWithArgs;
        },
        /**
         * 方法重写
         * 跳登录获取token
         */
        webToLogin(url) {
            const optionsData = this.data.optionsData;
            cwx.user.login({
                callback: () => {
                    const auth = cwx.user.auth;
                    if (auth.length > 0) {
                        this.webGetTokenByAuth(url, auth);
                    } else {
                        this.loginedErrorHandler();
                    }
                },
                ...optionsData.needLogin === 'dynamic' ? {
                    param: {
                        IsAuthentication: 'F',
                    },
                } : null,
            });
        },
        getUserInfo() {
            /**
             * 查看是否授权
             */
            wx.showLoading({
                title: '正在登录中',
            });
            wx.getSetting({
                success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                        /**
                         * 已经授权, 可以直接调用 getUserInfo 获取头像昵称
                         */
                        wx.getUserInfo({
                            success: (res) => {
                                wx.hideLoading();
                                this.patchUserInfo(res.userInfo);
                            },
                            fail: (err) => {
                                wx.hideLoading();
                            },
                        });
                    } else {
                        /**
                         * 还未授权, 显示授权
                         */
                        wx.hideLoading();
                        this.setData({
                            showGetUserInfo: true,
                        });
                    }
                }
            });
        },
        bindGetUserInfo(e) {
            this.setData({
                showGetUserInfo: false
            }, () => {
                this.patchUserInfo(e.detail.userInfo);
            });
        },
        patchUserInfo(userInfo) {
            console.log(userInfo)
            const url = this.data.optionsData.url;
            const patchUrl = url + (url.match(/\?/) ? '&' : '?') + `userinfo=${encodeURIComponent(JSON.stringify(userInfo))}`;
            this.setData({
                'optionsData.url': patchUrl,
            }, () => {
                // 调用原来的onLoad
                this.setOnLoad()
            });
        },
        patchOpenId(callback) {
            const optionsData = this.data.optionsData;
            if (optionsData.needOpenId) {
            	const url = this.data.optionsData.url;
            	const patchUrl = url + (url.match(/\?/) ? '&' : '?') + `mpopenid=${encodeURIComponent(cwx.cwx_mkt.openid)}`;
                console.log(patchUrl);
            	this.setData({
                    'optionsData.url': patchUrl,
                }, callback);
            } else {
                callback();
            }
        },
        setOnLoad() {
            const optionsData = this.data.optionsData;
            this.originOnLoad({
                url: encodeURIComponent(optionsData.url),
                needLogin: optionsData.needLogin,
                isNavigate: optionsData.isNavigate,
                loginErrorUrl: optionsData.loginErrorUrl,
            });
        },
    }
}

CPage(mWebView);

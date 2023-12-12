import { cwx, CPage } from '../../../cwx/cwx.js';

import urlUtil from '../common/utils/url.js';
import huser from '../common/hpage/huser';

CPage({
    pageId: '10320674802',

    /**
     * 页面的初始数据
     */
    data: {
        url: '',
        image: '',
        auth: '',
        mine: 0
    },

    model: {
        needAuth: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.options = options;
        const currentOpenID = cwx.cwx_mkt.openid;
        if (options.mktshare) {
            const mktShare = JSON.parse(cwx.util.mktBase64Decode(options.mktshare.replace(/\(\)/g, '=')));
            const fromOpenID = mktShare.fromopenid;
            const _data = this.data;
            _data.mine = currentOpenID === fromOpenID ? 1 : 0;
            this.setData(_data);
        }

        this.login();
        try {
            this.ubtDevTrace && this.ubtDevTrace('d_HTL_WX_view_source', options);
        } catch (e) {}
    },

    login: function () {
        const self = this;

        this.needAuth();
        if (cwx.user.isLogin() || !this.model.needAuth) {
            return this.load();
        }

        huser.login({
            callback: function () {
                if (!cwx.user.auth) {
                    cwx.showModal({
                        title: '提示',
                        content: '请登录后继续访问页面',
                        success: function (res) {
                            if (res.confirm) {
                                self.login();
                            } else {
                                cwx.navigateBack();
                            }
                        }
                    });
                    return;
                }

                self.load();
            }
        });
    },

    needAuth: function () {
        const url = decodeURIComponent(this.options.url);

        this.model.needAuth = !!urlUtil.getUrlParam(url, 'needauth');
        return this.model.needAuth;
    },

    load: function () {
        const self = this;
        const options = this.options;
        const auth = cwx.user.auth;
        const image = decodeURIComponent(options.image);
        let url = decodeURIComponent(options.url);

        if (url) {
            url = urlUtil.setParams(url, {
                wemp: 1,
                mine: self.data.mine
            });
        }

        if (auth && this.model.needAuth) {
            url = `https://m.ctrip.com/webapp/hotel/wechatlab/jump?auth=${auth}&url=${encodeURIComponent(url)}`;
        }

        this.setData({
            url,
            image,
            auth: cwx.user.auth
        });
    },

    onShareAppMessage: function (options) {
        const me = this;
        let path = `${me.getPageStack().pop()}?url=${encodeURIComponent(options.webViewUrl)}`;
        if (this.data.image) {
            path += `&image=${encodeURIComponent(this.data.image)}`;
        }
        const imageUrl = this.data.image || 'https://pages.ctrip.com/hotel_h5/res/img/weichat-sharehb.jpg';
        return {
            path,
            imageUrl
        };
    }
});

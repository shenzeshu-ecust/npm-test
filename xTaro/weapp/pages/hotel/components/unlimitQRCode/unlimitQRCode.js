import { cwx } from '../../../../cwx/cwx.js';

import hrequest from '../../common/hpage/request';

export const unlimitQRCode = {
    data: {

    },
    onLoad (options) {
        const optionScene = options.scene ? decodeURIComponent(options.scene) : '';

        this.ubtTrace(101070, { scene: optionScene });
        // console.log('unlimitQRCode', optionScene);
        if (optionScene) {
            this.getSceneConfig(optionScene);
        }
    },

    /**
      * 处理无限量二维码，根据url中的scene，获取对应的配置地址并跳转
      */
    getSceneConfig (optionScene) {
        const that = this;
        let params = {};
        const beforeRequestTime = new Date();

        params = {
            appid: cwx.appId,
            scene: optionScene,
            path: this.route,
            exInfo: null
        };

        this.ubtTrace(101069, { request: params, requestTime: beforeRequestTime });

        hrequest.hrequest({
            url: '/restapi/soa2/12673/exchangeAppPath',
            method: 'POST',
            data: params,
            success: function (res) {
                if (res && res.data && res.data.ResponseStatus && res.data.ResponseStatus.Ack == 'Success') {
                    console.log('errorCode', res.data.errcode);
                    if (Number(res.data.errcode) == 0) {
                        console.log('unlimitQRCode', res.data.fullpath);
                        that.goTargetUrl(res.data.fullpath);
                    } else {
                        that.ubtTrace(101100, { timeDuration: (new Date() - beforeRequestTime) + 'ms', errcode: res.data.errcode, errmsg: res.data.errmsg });
                        that.goHome();
                    }
                } else {
                    that.ubtTrace(101064, { timeDuration: (new Date() - beforeRequestTime) + 'ms', response: JSON.stringify(res || '') });
                    that.goHome();
                }
            },
            fail: function (e) {
                console.log('unlimitQRCode', e);
                that.ubtTrace(101065, { timeDuration: (new Date() - beforeRequestTime) + 'ms', response: '错误信息：' + e });
                that.goHome();
            }
        });
    },

    /**
      * 跳转到目标页
      */
    goTargetUrl (targetUrl) {
        const that = this;

        if ((targetUrl.indexOf('pages/home/homepage') !== -1) || (targetUrl.indexOf('pages/myctrip/list/list') !== -1) || (targetUrl.indexOf('pages/myctrip/tablist/tabAllList') !== -1)) {
            // 针对tab切换页，手动写入业绩
            const targetQuery = decodeURIComponent(targetUrl);
            cwx.mkt.setUnion({
                allianceid: this.getUrlQuery(targetQuery, 'allianceid') || '',
                sid: this.getUrlQuery(targetQuery, 'sid') || '',
                ouid: this.getUrlQuery(targetQuery, 'ouid') || '',
                sourceid: this.getUrlQuery(targetQuery, 'sourceid') || ''
            });

            cwx.switchTab({ url: '/' + targetUrl.trim() });
        } else if (targetUrl) {
            cwx.redirectTo({
                url: '/' + targetUrl.trim(),
                fail: function (e) {
                    that.ubtTrace(101066, { targetUrl, errmsg: '错误信息：' + (e.errMsg || e) });
                    that.goHome();
                }
            });
        } else {
            that.ubtTrace(101067, { targetUrl: '目标页为空' });
            that.goHome();
        }
    },

    /**
      * 跳转到首页
      */
    goHome () {
        cwx.switchTab({ url: '/pages/home/homepage' });
    },

    getUrlQuery (url, key) {
        const locationArr = url.split('?');

        if (locationArr.length < 2) {
            return;
        }

        const query = locationArr[1];

        if (!query) {
            return;
        }

        const params = query.split('&');

        for (let i = 0; i < params.length; i++) {
            const pair = params[i].split('=');

            if (pair[0] === key) {
                return pair[1];
            }
        }
    }

};

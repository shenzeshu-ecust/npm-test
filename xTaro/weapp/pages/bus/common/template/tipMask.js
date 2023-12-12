// pages/bus/common/template/tipMask.js
import { _, cwx, Pservice, Utils } from '../../index.js';
class tipMask {
    constructor(page, fromCity) {
        this.page = page;
        this.page.hideTipMask = this.hideTipMask.bind(this);
        var utmsource = Utils.getUtmSource();
        var scene = cwx.scene;
        console.log('scene ----', scene);
        var maskCount = cwx.getStorageSync('BUS_MASK_TIP_DESK');
        if (
            scene == '1023' &&
            utmsource.indexOf('_desk') < 0 &&
            utmsource.indexOf('ctripwx') >= 0
        ) {
            Utils.saveUtmSource(utmsource + '_desk');
            this.setData({
                utmSource: utmsource + '_desk',
            });
        }
        var systemInfo = wx.getSystemInfoSync();
        var platform = systemInfo.platform;
        if (
            utmsource.indexOf('ctripwx') >= 0 &&
            (scene == 1011 || scene == 1012 || scene == 1013) &&
            platform === 'android'
        ) {
            Pservice.homePrompt({
                utmsource: utmsource,
                fromStationName: fromCity || '',
            })
                .then((res) => {
                    var maskTip = maskCount < 2;
                    this.setData({
                        maskTip: maskTip,
                    });
                })
                .catch((err) => {});
        }
    }
    get data() {
        return this.page && this.page.data;
    }
    set data(data) {
        this.page && this.page.setData.apply(this.page, arguments);
    }

    hideTipMask() {
        this.setData(
            {
                maskTip: false,
                didTip: true,
            },
            () => {
                var tipCount = wx.getStorageSync('BUS_MASK_TIP_DESK');
                var times = parseInt(tipCount || '0');
                cwx.setStorageSync('BUS_MASK_TIP_DESK', times + 1);
                cwx.setStorageSync('BUS_MASK_TIP_CODE', '1');
            }
        );
    }
}

tipMask.prototype.setData = function (data) {
    this.page && this.page.setData.apply(this.page, arguments);
};

export default tipMask;

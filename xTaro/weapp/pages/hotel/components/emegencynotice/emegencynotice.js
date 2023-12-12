import Rest from './emegencynoticerest.js';

Component({
    /**
   * 组件的属性列表
   */
    properties: {
        page: String,
        cityId: {
            type: Number,
            observer: 'cityChange'
        },
        orderId: Number
    },

    externalClasses: ['warp-class', 'inner', 'lmask'],

    /**
   * 组件的初始数据
   */
    data: {
        display: false,
        showNoticeLayer: false
    },

    attached: function () {
        this.innitial = true;
        this.cityChange();
    },

    ready: function () {
    },
    innitial: false,
    /**
   * 组件的方法列表
   */
    methods: {
        close (e) {
            this.setData({ display: false });
            this.triggerEvent('hasEmegencyNotice', false);
        },
        closeLayer (e) {
            this.setData({ showNoticeLayer: false });
        },
        showLayer (e) {
            this.setData({ showNoticeLayer: true });
        },
        cityChange (newVal, oldVal) {
            if (this.innitial) {
                this.setData({
                    display: false
                });
                this.getInfo(newVal);
            }
        },
        getInfo (cityId) {
            cityId = cityId || this.data.cityId;
            if (cityId > 0) {
                const { page, orderId } = this.data;
                Rest.doRequest({ page, cityId, orderId }, (res) => {
                    if (res && res.title) {
                        this.setData({ info: res, display: true });
                        this.triggerEvent('hasEmegencyNotice', true);
                    } else {
                        this.triggerEvent('hasEmegencyNotice', false);
                    }
                });
            }
        },
        noop () { }
    }
});

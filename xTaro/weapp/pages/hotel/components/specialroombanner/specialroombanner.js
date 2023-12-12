/* 特色房banner组件 */
import { cwx } from '../../../../cwx/cwx.js';

Component({
    properties: {
        atmosphereBannerInfo: {
            type: Object,
            value: {},
            observer: function () {}
        },
        hasCouponBanner: {
            type: Boolean,
            value: false,
            observer: function () {}
        },
        marketBannerExposeObj: {
            type: Object,
            value: {},
            observe: 'refreshExposeNode'
        }
    },

    data: {}, // 私有数据，可用于模版渲染

    attached () {
        // 若自定义组件需要发曝光埋点，必须在attatch中初始化监听器，调用cwx.sendUbtExpose.observe(this);
        this.bindObserve();
    },

    methods: {
        // 跳转到特色房静态页
        goStaticPage () {
            const { staticPage, headTitle } = this.data.atmosphereBannerInfo;
            if (staticPage) {
                // 发点击埋点
                this.triggerEvent('marketBannerClick', {
                    staticPage
                });
                cwx.component.cwebview({
                    data: {
                        url: staticPage,
                        title: headTitle
                    }
                });
            }
        },
        // 在attached中绑定监听器
        bindObserve () {
            cwx.sendUbtExpose.observe(this);
        },
        // 当组件中需要发曝光埋点的目标节点有变化时更新
        refreshExposeNode () {
            cwx.sendUbtExpose.refreshObserve(this);
        }
    }
});

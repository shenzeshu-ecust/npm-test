// pages/hotel/components/screenshare/screenshare.js
import { cwx } from '../../../../cwx/cwx.js';
import screenshot from './screenshot.js';

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        hotelId: {
            type: String,
            value: 2
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        hidden: true,
        callback: () => {}
    },

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
        this.data.callback = this.screenShotCallback.bind(this);
    },
    moved: function () {
    },
    detached: function () {
        cwx.Observer.removeObserverForKey('onUserCaptureScreen', this.data.callback);
    },
    pageLifetimes: {
        show: function () {
            cwx.Observer.addObserverForKey('onUserCaptureScreen', this.data.callback);
        },
        hide: function () {
            cwx.Observer.removeObserverForKey('onUserCaptureScreen', this.data.callback);
        }
    },
    /**
     * 组件的方法列表
     */
    methods: {
        screenShotCallback: function () {
            this.setData({
                hidden: false
            });
            // 截屏下载
            screenshot.captureScreen(this.data.hotelId);
        },

        close: function () {
            this.setData({
                hidden: true
            });
        },

        share: function () {
            this.setData({
                hidden: true
            });
        },

        noop: function () {}

    }
});

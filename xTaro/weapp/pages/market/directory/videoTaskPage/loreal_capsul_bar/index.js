import deviceUtil from "./device-util";
import validator from "./validator";
import eventUtil from "./event-util";
const app = getApp()
Component({
    behaviors: [validator],
    externalClasses: ["l-title-class"],
    properties: {
        bgColor: {
            type: String,
            value: "white"
        },
        statusBarColor: {
            type: String,
            value: "transparent"
        },
        titleBarColor: {
            type: String,
            value: "transparent"
        },
        titleColor: {
            type: String,
            value: "black"
        },
        capsuleColor: {
            type: String,
            value: "black",
            options: ["white", "black"]
        },
        disableBack: {
            type: Boolean,
            value: !1
        },
        disableHome: {
            type: Boolean,
            value: !1
        },
        hiddenCapsule: {
            type: Boolean,
            value: !1
        },
        homePage: {
            type: String,
            value: ""
        },
        title: {
            type: String,
            value: ""
        },
        hasPadding: {
            type: Boolean,
            value: !0
        }
    },
    data: {
        titleBarHeight: deviceUtil.getTitleBarHeight(),
        statusBarHeight: deviceUtil.getStatusBarHeight(),
        capsuleButtonInfo: null,
        ios: false
    },
    lifetimes: {
        ready: function () {
            this.setData({
                capsuleButtonInfo: this.getCapsuleButtonInfo(),
                ios: app.globalData.isIphoneX
            })
            // console.log('当前设备的胶囊栏高度', this.data.statusBarHeight)
        }
    },
    methods: {
        getCapsuleButtonInfo() {
            const t = wx.getSystemInfoSync().screenWidth,
                e = wx.getMenuButtonBoundingClientRect();
            return e.left = t - e.right, e.right = e.left + e.width, e
        },
        onTapLeftButton(e) {
            console.log('点击了回退', e)
            eventUtil.emit(this, "lefttap")
        },
        onLongPressLeftButton() {
            eventUtil.emit(this, "leftlongpress")
        }
    }
});
import { cwx } from "../../cwx";

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 这里定义了 innerText 属性，属性值可以在组件使用时指定
        imageUrl: {
            type: String,
            value: "https://pages.c-ctrip.com/union/weixin/timeline196.png",
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        show: false
    },

    lifetimes: {
        attached: function () {
            // 在组件实例进入页面节点树时执行
            if (cwx.checkInTimeline()) {
                this.setData({
                    show: true
                })
            }
            const currentPage = cwx.getCurrentPage() || {};
            cwx.sendUbtByPage.ubtDevTrace("weapp_cwx_timelineFloat", {
                pagePath: (currentPage && currentPage.route) || "",
                scene: cwx.scene || ''
            });
        },
        detached: function() {
            // 在组件实例被从页面节点树移除时执行
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})

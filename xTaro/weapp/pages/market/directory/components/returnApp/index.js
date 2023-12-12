import {
    cwx,
    __global,
    CPage
} from "../../../../../cwx/cwx.js";

let mPage = null
Component({
    options: {
        addGlobalClass: true,
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        clazz: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        scene: '',
        showButton: false,
        from: '',
        pageOptions: null
    },
    observers: {
        'scene': function (scene) {
            // 从app打开小程序
            if (scene == '1069') {
                this.setData({
                    showButton: true
                })
            }
        }
    },
    lifetimes: {
        attached: function () {
            const scene = cwx.scene
            this.setData({
                scene
            })
            this.setPageOptions()
        },
        detached: function () {

        },
    },
    pageLifetimes: {
        show: function () {
            this.setPageOptions()
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        launchAppError(e) {
            console.log('【launchAppError】', e.detail.errMsg)
        },
        setPageOptions() {
            mPage = cwx.getCurrentPage()
            const options = mPage.options
            if (!options) {
                return
            }
            let from = ''
            if (options.from) {
                from = decodeURIComponent(options.from)
            }
            console.log('pageOptions', options)
            console.log('from', from)
            this.setData({
                pageOptions: options,
                from
            })
        }
    }
})
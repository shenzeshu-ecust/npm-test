import {
    cwx
} from "../../../../../cwx/cwx.js";
const UTILS = require('../../../common/utils')

Component({
    properties: {
      isInWebView: {
        type: Boolean,
        value: false
      },
      top: {
        type: String,
        value: '100rpx'
      }
    },

    /**
     * 组件的初始数据
     */
    data: {
        sepopup: ''
    },
    lifetimes: {
        attached: function () {
            this.setType()
        },
        detached: function () {

        },
    },
    pageLifetimes: {
        show: function () {
            this.setType()
        }
    },
    methods: {
        setType() {
            const mPage = getCurrentPage()
            this.mPage = mPage
            if (!mPage) {
                return
            }
            try {
                const options = mPage.options
                if (options.sepopup || options.wxpopup) {
                    let sepopup = options.sepopup || options.wxpopup
                    this.setData({
                        sepopup
                    })
                } else {
                    // this.setData({
                    //     sepopup: '201'
                    // })
                }
            } catch (error) {
                
            }
        }
    }
})

function getCurrentPage() {
    return getCurrentPages()[getCurrentPages().length - 1] || {}
}
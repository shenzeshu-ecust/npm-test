
// {{component}}.js
import util from "../../util";
import cwx from '../../../../../cwx/cwx'

Component({
    /**
     * 组件的属性列表
     */
    properties: {
       train: {
           type: Object,
           value: {}
       },
       keyIndex: {
           type: Number,
           value: 0
       },
       seatCardIndex: {
           type: Number,
           value: -1
       },
       from: {
           type: String,
           value: ''
       },
       isXpageNew: {
            type: Boolean,
            value: false,
       },
       isCannotGrabTicket: {
            type: Boolean,
            value: true
       }
    },

    /**
     * 组件的初始数据
     */
    data: {
    },

    observers: {
    },

    lifetimes: {
        attached: function () {
        },
        moved: function () { },
        detached: function () { },
    },

    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () {},
        hide: function () { },
        resize: function () { },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        itemHandle(e) {
            const options = e.currentTarget.dataset
            this.triggerEvent('itemhandle', options, {})
        },
        detailClick(e) {
            const options = e.currentTarget.dataset
            util.ubtTrace('c_trn_c_10320640939', {
                bizKey: 'infoDetailClick',
                vendorId: options.vendorid,
            })
            cwx.navigateTo({
                url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(options.infodetail)}`,
            })
        },
        openOmniPop() {
            this.triggerEvent('openOmniPop')
        },
        openWiseSeatPop(e) {
            const keyIndex = this.properties.keyIndex
            const options = e.currentTarget.dataset
            this.triggerEvent('openWiseSeatPop',{keyIndex, ...options})
        },
        combiDetailClick() {
            this.triggerEvent('combiDetailClick')
        }

    }
})

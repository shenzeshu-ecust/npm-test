import util from '../../util'
import cwx from '../../../../../cwx/cwx'
Component({
    properties: {
        price: {
            type: Array,
            value: [9, 5, 2, 7],
        },
        activityType: {
            type: Number,
            value: 2,
        },
        orderNumber: {
            type: Number,
            value: 0,
        },
        orderType: {
            type: String,
            value: '',
        },
    },

    data: {
        start: false,
        end: false,
    },
    observers: {
        'price': function(price) {
            console.log('price', price)
        },
    },
    lifetimes : {
        attached: function() {
            setTimeout(() => {
                this.setData({
                    start: true,
                })
            }, 500)

            setTimeout(() => {
                this.setData({
                    end: true,
                })
            }, 3300)
        },
    },
    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () {
        },
        hide: function () {
        },
    },
    methods: {
        toBargainPage: function(){
            util.ubtTrace('c_trn_c_10650037941', {
                bizKey: 'bargainPopupClick',
                orderid: this.data.orderNumber
            })

            if (this.data.activityType == 2) {
                cwx.navigateTo({
                    url: `/pages/train/2020fanxian/index?OrderNumber=${this.data.orderNumber}&OrderType=${this.data.orderType}&Entrance=1`,
                })
            } else {
                cwx.navigateTo({
                    url: `/pages/train/2019fanxian/index?OrderNumber=${this.data.orderNumber}&OrderType=${this.data.orderType}&Entrance=1`,
                })
            }
            // this.triggerEvent('toBargainPageTrigger')
        },
    },
})

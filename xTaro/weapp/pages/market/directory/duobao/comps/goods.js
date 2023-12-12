// pages/market/directory/duobao/comps/goods.js
// 活动状态： 0=未开奖，1=待开奖，2=开奖成功，3=无中奖数字，4=开奖失败
// 1 立即加投 2继续加投 3中奖 4夺宝号已满 待开奖 5未中奖 6开奖失败-总数不足 7开奖失败-无人
import { resolveStatus } from '../config'
import {resolveProcessWidth} from '../utils'
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
        },
        data: {
            type: Object,
            value: null
        },
        tab: {
            type: String,
            value: '1', // 1 进行中 2 我的
        }
    },

    observers: {
        data: function(val) {
            if (!val) return
            const { activityStatus, join, selfWinNumber:winNumber, numberFull, activityProgress: {reached, total} } = val
            const type = resolveStatus({
                activityStatus, 
                winNumber,
                reached,
                numberFull,
                join
            })
            const processInfo = {
                width: resolveProcessWidth(reached, total),
                process: reached, 
                target: total
            } 
            this.setData({
                type,
                processInfo
            })
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        process: 0,
        type: '',
        processInfo: null,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleClickBtn() {
            const {type} = this.data
            this.triggerEvent('clickBtn', {...this.data.data, type}, {})
        },
        onCountDownEnd() {
            this.triggerEvent('countDownEnd', null, {})
        }
    },
    lifetimes: {
        attached: function () {
            // const data = this.data.data
            // if (Object.keys(data).length > 0) {
            //     const process = data.activityProgress.reached / data.activityProgress.total
            //     this.setData({
            //         process: `${process * 100}%`
            //     })
            // }
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    },
    
    
})
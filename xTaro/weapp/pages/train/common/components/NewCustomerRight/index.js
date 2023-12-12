/*
 * @Author: huyu huyu@trip.com
 * @Date: 2023-07-12 13:37:40
 * @LastEditors: huyu huyu@trip.com
 * @LastEditTime: 2023-07-12 13:41:36
 * @FilePath: /weapp/pages/train/common/components/NewCustomerRight/index.js
 * @Description: 新客弹窗组件 为什么写组件 因为按钮可能需要点击事件触发订阅，这里给你们自己配
 */
Component({
    properties: {
        visible: {
            type: Boolean,
        },
        data: {
            type: Object
        },
        unLoginShow: {
            type: Boolean
        }
    },
    methods: {
        onClose() {
            this.triggerEvent("close")
        }
    }
})

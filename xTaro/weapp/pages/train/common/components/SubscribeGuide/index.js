/*
 * @FilePath: /weapp/pages/train/common/components/SubscribeGuide/index.js
 * @Description: 订阅的动画引导
 */
import { cwx, _ } from '../../../../../cwx/cwx'

Component({
    properties: {
        videoSrc: {
            type: String,
            value: 'https://images3.c-ctrip.com/train/2023-3/zengzhang/sept/dingyue/%E8%AE%A2%E9%98%85%E5%AF%BC%E5%87%BA_2.mp4'
        },
        visible: {
            type: Boolean,
            value: false
        }
    },
    data: {
        showClass: '',
        showVideo: false
    },
    lifetimes: {
    },
    observers: {
        'visible': function (visible) {
            if (visible) {
                this.showVideoFn()
                setTimeout(() => {
                    this.setData({ showClass: 'body-show' })
                }, 300)
            } else {
                this.setData({ showClass: '' })
            }
        }
    },
    methods: {
        async showVideoFn(){
            const that = this
            const abValue = { key: '230913_TRN_DHU', name: 'showVideoTest' }
            const getAbAsync = ({ key, name }) => new Promise(resolve => {
                cwx.ABTestingManager.valueForKeyAsync(key, value => resolve({ [name]: value }))
            })
            const { showVideoTest = 'B' } = (await getAbAsync(abValue)) || {}
            if (showVideoTest === 'B') {
                that.setData({
                    showVideo: true,
                })
            }
        }
    }
})

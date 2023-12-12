// pages/train/common/components/BuGird.js
import cwx from '../../../../../cwx/cwx'
import {
    TrainExternalRecommendCardsModel,
} from '../../model'
import util from '../../../common/util'
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        arriveCityName: {
            type: String,
            value: '北京',
        },
        departCityName: {
            type: String,
            value: '上海',
        },
        departDate: {
            type: String,
            value: '',
        },
    },
    observers: {
        'arriveCityName, departCityName, departDate': function(arriveCityName, departCityName, departDate) {
            // 在 numberA 或者 numberB 被设置时，执行这个函数
            this.getRecommendList()
        },
    },
    /**
     * 组件的初始数据
     */
    data: {
        buList: [],
    },


    lifetimes: {
        attached() {
            // this.getRecommendList()
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        getRecommendList() {
            const {
                arriveCityName = '北京',
                departCityName = '上海',
                departDate,
            } = this.data
            TrainExternalRecommendCardsModel({
                DepartPlace: departCityName,
                Destination: arriveCityName,
                DepartDate: departDate,
            }, res => {
                if (res.RetCode == 1) {
                    const {
                        RecommendList,
                    } = res

                    RecommendList?.forEach(item => {
                        util.ubtTrace('s_trn_c_trace_10320640935', {
                            "exposureType" : "normal",
                            "bizKey" : "iconExp",
                            "type": item.Title
                        })
                    });

                    this.setData({
                        buList: RecommendList,
                    })
                }
            })
        },
        goBu(e) {
            const { url, title } = e.currentTarget.dataset

            util.ubtTrace('c_trn_c_10320640935', {
                "bizKey" : "iconClick",
                "type": title
            })

            const currentPage = cwx.getCurrentPage()
            if (currentPage) {
                currentPage.ubtTrace('c_train_wx_index_bulist', title)
            }
            if (!url) return
            if (url.indexOf('appid') !== -1) { // 外部小程序跳转
                let reg = new RegExp("(^|&)" + "appid" + "=([^&]*)(&|$)", "i")
                let querys = url.match(reg)
                let appId = unescape(querys[2])
                cwx.navigateToMiniProgram({
                    appId: appId,
                    path: url,
                    envVersion: 'release', // develop开发版 trial体验版  release正式版
                    success() {
                        // 打开成功
                    },
                })
            } else if (url.startsWith('https')) {
                cwx.navigateTo({
                    url: `/pages/train/webview/webview?url=${url}`,
                })
            } else {
               cwx.navigateTo({
                    url,
                })
            }
            console.log('---------------- navigateTo', url)
        },
    },
})

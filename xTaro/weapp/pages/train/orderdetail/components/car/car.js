import { cwx, _ } from '../../../../../cwx/cwx'
import util from '../../../common/util'
import cDate from '../../../common/cDate'
import { TrainStationStore } from '../../../common/store'
import {
    TrainOrderRecommendUseCarModel,
} from '../../../common/model'

export default {
    data: {
        carRecommendInfo: {}
    },
    methods: {
        getCarRecommendIno(oid) {
            const params = {
                Channel: 'ctripwx',
                OrderNumber: oid,
                Extendlist: [],
            }
            TrainOrderRecommendUseCarModel(params, res => {
                if (res.RetCode == 1) {
                    const {
                        IsShow,
                        Title,
                        Image,
                        Tip,
                        Icon,
                        JntProductName,
                        SndProductName,
                        Price,
                        TagList,
                        JumpUrl
                    } = res
                    this.setData({
                        carRecommendInfo: {
                            IsShow,
                            Title,
                            Image,
                            Tip,
                            Icon,
                            JntProductName,
                            SndProductName,
                            Price,
                            TagList,
                            JumpUrl,
                        }
                    })
                    if (IsShow) {
                        this.ubtTrace('o_traapplets_orderdetailpage_transfer_expo', true)
                    }
                }
            })
        },
        toCarPage(e) {
            const {
                url
            } = e.currentTarget.dataset
            // webview跳转
            if (url.indexOf('https') !== -1 || url.indexOf('http') !== -1) {
                this.navigateTo({
                    url: `/pages/train/webview/webview?url=${encodeURIComponent(url)}`
                })
            } else if (url.indexOf('appId') !== -1) { // 小程序跳转
                const reg = /[?&]([^=&#]+)=([^&#]*)/g
                const querys = url.match(reg)
                let appId
                for (let i in querys) {
                    const query = querys[i].split('=')
                    const key = query[0].substr(1)
                    const value = query[1]
                    if (key == 'appId') {
                        appId = value
                    }
                }
                cwx.navigateToMiniProgram({
                    appId: appId,
                    path: url,
                    envVersion: 'release', // develop开发版 trial体验版  release正式版
                    success() {
                        // 打开成功
                    },
                })
            } else {
                this.navigateTo({
                    url,
                })
            }
            this.ubtTrace('o_traapplets_orderdetailpage_transfer_click', true)
            console.log('---------------- navigateTo', url)
        },
    },
}

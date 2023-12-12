import { CPage } from '../../../cwx/cwx.js'
import services from '../shared/services'
import util from '../shared/util'

CPage({
    pageId: '10650019757',
    data: {},

    onLoad: function(option) {
        this.productid = option.productid
        this.departcityid = option.departcityid

        // 获取产品基本信息
        this.fetchProductInfo()
        // 获取产品实时信息
        this.fetchProductTimingInfo()
        // 获取产品点评信息
        this.fetchCommentInfo()
    },

    // 唤起 App 失败回调
    launchAppError(e) {
        console.log(e.detail.errMsg)
    },

    // 获取产品基本信息
    fetchProductInfo() {
        let params = {
            ProductId: this.productid,
            DepartureCityId: this.departcityid
        }
        let handleSuccess = (json) => {
            let { Data: data } = json
            this.setData(data)
        }
        services
            .ProductDetail(params)
            .then(handleSuccess)
            .catch((err) => {
                console.log(err)
                util.showToast('查询产品信息失败,请重试!')
            })
    },

    // 获取产品实时信息
    fetchProductTimingInfo() {
        let params = {
            ProductId: this.productid,
            DepartureCityId: this.departcityid,
            QueryNode: {
                IsPriceInfo: true
            }
        }
        let handleSuccess = (json) => {
            let { Data: data } = json
            let { PriceInfo } = data
            this.setData({ PriceInfo })
        }
        services
            .ProductDetailTiming(params)
            .then(handleSuccess)
            .catch((err) => {
                console.log(err)
            })
    },

    // 获取产品点评信息
    fetchCommentInfo() {
        let params = {
            productId: this.productid
        }
        let handleSuccess = (json) => {
            let { commentAggregation } = json
            this.setData({ commentAggregation })
        }
        services
            .GetCommentSummary(params)
            .then(handleSuccess)
            .catch((err) => {
                console.log(err)
            })
    }
})

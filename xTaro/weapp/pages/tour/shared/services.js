import request from './request'

const urlPrefixCtrip = 'https://m.ctrip.com/restapi/soa2/'

export default {
    // 产品详情页基本信息
    ProductDetail(params) {
        return request.post(urlPrefixCtrip + '12447/ProductDetailV5', params)
    },
    // 产品详情页实时信息
    ProductDetailTiming(params) {
        return request.post(urlPrefixCtrip + '12447/ProductDetailTimingV5', params)
    },
    // 产品点评基本信息
    GetCommentSummary(params) {
        return request.post(urlPrefixCtrip + '16238/getCommentSummary', params)
    }
}

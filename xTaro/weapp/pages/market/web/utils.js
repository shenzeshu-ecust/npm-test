import {
    cwx,
    CPage,
    __global,
    _
} from "../../../cwx/cwx.js";

const imgHost = {
    fat: 'https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2',
    uat: 'https://gateway.m.uat.qa.nt.ctripcorp.com/restapi/soa2',
    prd: 'https://m.ctrip.com/restapi/soa2',
}

function createUrl(pageOption, qrUrl) {
    let imgUrl = `${imgHost[__global.env]}/22559/relayPagePoster?sharePath=${qrUrl || ''}&activityId=${pageOption.activityId || ''}&avatarUrl=${pageOption.userAvatar || ''}&nickName=${pageOption.userName || ''}&posterBgImg=${encodeURIComponent(pageOption.posterBgImg || '')}`
    try {
        if (pageOption.queryQrCodeSize) imgUrl = `${imgUrl}&queryQrCodeSize=${pageOption.queryQrCodeSize || ''}`;
        if (pageOption.queryQrCodeCoordinate) imgUrl = `${imgUrl}&queryQrCodeCoordinate=${pageOption.queryQrCodeCoordinate || ''}`;
        if (pageOption.queryHeadSize) imgUrl = `${imgUrl}&queryHeadSize=${pageOption.queryHeadSize || ''}`;
        if (pageOption.queryHeadCoordinate) imgUrl = `${imgUrl}&queryHeadCoordinate=${pageOption.queryHeadCoordinate || ''}`;
        if (pageOption.queryNicknameSize) imgUrl = `${imgUrl}&queryNicknameSize=${pageOption.queryNicknameSize || ''}`;
        if (pageOption.queryNicknameCoordinate) imgUrl = `${imgUrl}&queryNicknameCoordinate=${pageOption.queryNicknameCoordinate || ''}`;
        if (pageOption.otherContent) imgUrl = `${imgUrl}&otherContent=${encodeURIComponent(pageOption.otherContent) || ''}`;
        if (pageOption.contentModule) imgUrl = `${imgUrl}&contentModule=${pageOption.contentModule || ''}`;
    } catch (error) {
        imgUrl = `${imgHost[__global.env]}/22559/relayPagePoster?sharePath=${qrUrl || ''}&activityId=${pageOption.activityId || ''}&avatarUrl=${pageOption.userAvatar || ''}&nickName=${pageOption.userName || ''}&posterBgImg=${encodeURIComponent(pageOption.posterBgImg || '')}`
    }
    return imgUrl
}

/** 请求小程序太阳码 */
export function requestQrcode(pageOption, callback, failback) {
    wx.showLoading({
        title: '正在生成海报',
        mask: true
    })
    let qrCodeParams = {}
    qrCodeParams = {
        "appId": cwx.appId || '',
        "buType": "mkt",
        "page": "pages/market/midpage/midpage",
        "aid": pageOption.allianceid || '',
        "sid": pageOption.sid || '',
        "pathName": "relayPage",
        "centerUrl": 'centerUrl',
        "fromId": `${pageOption.pageId}` || '10650061670',
        "needData": false,
        "autoColor": false,
        "lineColor": {
            "r": "0",
            "g": "0",
            "b": "0"
        }
    }
    console.log('分享路径是', pageOption.sharePath || '')
    qrCodeParams['path'] = pageOption.sharePath || '';
    try {
        cwx.request({
            url: "/restapi/soa2/13242/getWxqrCode",
            data: qrCodeParams,
            success: (res) => {
                if (res && res.data && res.data.errcode === 0) {
                    if (pageOption.activityId) {
                        wx.hideLoading()
                        let imgUrl = createUrl(pageOption, res.data.qrUrl)
                        console.log('当前海报地址', imgUrl)
                        callback(imgUrl)
                    }
                } else {
                    wx.hideLoading();
                    wx.showToast({
                        title: '图片小哥跑偏了，再重试下吧',
                        icon: 'none',
                        mask: true
                    })
                }
            },
            fail: function (e) {
                wx.hideLoading();
                failback()
                wx.showToast({
                    title: '图片小哥跑偏了，再重试下吧',
                    icon: 'none',
                    mask: true
                })
            }
        })
    } catch (error) {
        failback()
        wx.showToast({
            title: '图片小哥跑偏了，再重试下吧',
            icon: 'none',
            mask: true
        })
    }
}

export function thirdTrace(params) {
    cwx.request({
        url: '/restapi/soa2/22559/thirdTrace',
        data: params
    })
}

/**
 * 如果存在wx.getAppBaseInfo 就根据wx.getAppBaseInfo的值来判断
 * 如果不存在就取路径的参数isInQQ
 *
 */
let appBaseInfo = {}
export function isInQQ(pageOptions) {
  let isInQQParam = false
  let h5Url = decodeURIComponent(pageOptions.from) // h5路径
  let isInQQShellParams = !!pageOptions.isInQQApp // 壳子是否带了参数
  isInQQParam = isInQQShellParams
  if (h5Url.includes('isInQQApp')) {
    isInQQParam = true
  }
  if (typeof wx.getAppBaseInfo === 'function') {
    appBaseInfo = appBaseInfo.host ? appBaseInfo : wx.getAppBaseInfo()
    if (appBaseInfo?.host?.appId === 'wxf0a80d0ac2e82aa7') {
      console.log('miniEnv=====appBaseInfo存在, 是qq环境')
      return true
    }
    console.log('miniEnv=====appBaseInfo存在, 非qq环境')
    return false
  } else {
    // 不存在这个方法
    console.log('miniEnv=====不存在, isInQQParam', isInQQParam ? '是qq环境' : '不是qq环境')
    return isInQQParam
  }
}

export function jumpMpComment(context, wx_pay_id) {
    requirePlugin.async('wxacommentplugin').then(plugin => {
        plugin.openComment({
            wx_pay_id: wx_pay_id, // 交易评价类账号选填
            success: (res)=>{
                context?.logTrace('好评跳转成功')
            },
            fail: (res) =>{
                context?.logTrace('好评跳转失败', res)
                console.log('好评跳转失败', res)
            }
        })
    }).catch(({mod, errMsg}) => {
        console.error(`path: ${mod}, ${errMsg}`)
    })
}

export default {
    requestQrcode,
    thirdTrace,
    isInQQ,
    jumpMpComment,
}
import {
  cwx,
  CPage,
  __global,
  _
} from "../../../../../cwx/cwx";
import {
  equel,
  vilidQuery
} from './utils'
import {
  model
} from './model'
/**
 * pageBottomShareType 弹出分享浮层的类型  A只分享朋友卡片 B只分享海报 C卡片+海报
 */

Component({
  pageId: '10650061670',
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      defaultValue: false,
    },
    shareConfig: {
      type: Object,
      defaultValue: null,
    }
  },

  observers: {
    'shareConfig': function (shareConfig) {
      if (!equel(shareConfig, this.data.shareConfig)) {
        this.resolveShareConfig(shareConfig)
      }
    },
    'show': function (show) {
      if (show) {
        this.changeMaskType(1)
        this.setCurrentShareFn()
      } else {
        this.changeMaskType(0)
        this.setOriginShareFn()
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    maskType: 0, // 弹窗遮罩，0是不显示
    shareType: '', // 分享模式
    posterImg: '', // 需要保存的分享海报
    userInfo: null, // 头像昵称
  },

  lifetimes: {
    attached: function () {
      this.init()
      this.setPage()
    },
    detached: function () {

    },
  },
  pageLifetimes: {
    show: function () {
      this.setPage()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init() {
      this.getUserInfo()
    },
    setPage() {
      const mPage = getCurrentPage()
      if (!mPage) {
        return
      }
      this.mPage = mPage
      if (!this.saevedFlag) {
        this.originShareFn = mPage.onShareAppMessage
        this.saevedFlag = true
      }
    },
    setCurrentShareFn() {
      if (this.mPage) {
        const {
          pageBottomShareType
        } = this.data.shareConfig
        if (pageBottomShareType == 'A' || pageBottomShareType == 'C') {
          this.mPage.onShareAppMessage = this.onShareAppMessage.bind(this)
        }
      }
    },
    setOriginShareFn() {
      if (this.mPage) {
        this.mPage.onShareAppMessage = this.originShareFn
        console.log(this.mPage.onShareAppMessage)
        console.log(this.originShareFn)
      }
    },
    onShareAppMessage() {
      if (!this.data.shareConfig) {
        console.error('当前分享组件没有分享参数shareConfig，请设置分享参数shareConfig')
        return
      }
      const {
        shareBg,
        sharePath,
        shareTitle
      } = this.data.shareConfig
      return {
        title: shareTitle,
        imageUrl: shareBg,
        path: sharePath
      }
    },
    resolveShareConfig(...args) {
      if (!shareConfig) {
        return
      }
      const {
        pageBottomShareType
      } = shareConfig
      let vilidRes = null
      switch (pageBottomShareType) {
        case 'A':
          vilidRes = vilidQuery(['shareBg', 'sharePath', 'shareTitle', 'pageBottomShareType'], shareConfig)
          if (vilidRes.success) {

          } else {
            console.error(vilidRes.msg)
          }
          break;
        case 'B':
          break;
        case 'C':
        default:
          break;
      }
    },
    handleCloseMask() {
      this.triggerEvent('close')
    },
    changeMaskType(maskType) {
      this.setData({
        maskType
      })
    },
    /** 打开海报 */
    openPoster() {
      this.requestQrcode()
    },
    /** 请求小程序太阳码 */
    requestQrcode() {
      const that = this
      const {
        shareConfig
      } = this.data
      wx.showLoading({
        title: '正在生成海报',
        mask: true
      })
      let qrCodeParams = {}
      qrCodeParams = {
        "appId": cwx.appId || '',
        "buType": "mkt",
        "page": "pages/market/midpage/midpage",
        "aid": '',
        "sid": '',
        "pathName": "relayPage",
        "centerUrl": 'centerUrl',
        "fromId": '10650061670',
        "needData": false,
        "autoColor": false,
        "lineColor": {
          "r": "0",
          "g": "0",
          "b": "0"
        }
      }
      console.log('分享路径是', shareConfig.sharePath || '')
      qrCodeParams['path'] = shareConfig.sharePath || '';
      try {
        cwx.request({
          url: "/restapi/soa2/13242/getWxqrCode",
          data: qrCodeParams,
          success: (res) => {
            if (res && res.data && res.data.errcode === 0) {
              let activityId = shareConfig.activityId
              let userAvatar = shareConfig.userAvatar || this.data.userInfo.headImage
              let userName = shareConfig.userName || this.data.userInfo.nickName
              if (shareConfig.hideAvatar) {
                userAvatar = ''
                userName = ''
              }
              if (!activityId) {
                activityId = __global.env === 'fat' ? 'MKT_ShareSubscribe_1626424771459' : 'MKT_ShareSubscribe_1626328166703';
              }
              let imgUrl = `${__global.env == 'fat' ? 'https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2' : 'https://m.ctrip.com/restapi/soa2'}/22559/relayPagePoster`
              imgUrl = `${imgUrl}?sharePath=${res.data.qrUrl || ''}`
              imgUrl = `${imgUrl}&activityId=${activityId}`
              imgUrl = `${imgUrl}&avatarUrl=${userAvatar || ''}`
              imgUrl = `${imgUrl}&nickName=${userName || ''}`
              imgUrl = `${imgUrl}&posterBgImg=${encodeURIComponent(shareConfig.posterBgImg || '')}`
              try {
                if (shareConfig.queryQrCodeSize) imgUrl = `${imgUrl}&queryQrCodeSize=${shareConfig.queryQrCodeSize || ''}`;
                if (shareConfig.queryQrCodeCoordinate) imgUrl = `${imgUrl}&queryQrCodeCoordinate=${shareConfig.queryQrCodeCoordinate || ''}`;
                if (shareConfig.queryHeadSize) imgUrl = `${imgUrl}&queryHeadSize=${shareConfig.queryHeadSize || ''}`;
                if (shareConfig.queryHeadCoordinate) imgUrl = `${imgUrl}&queryHeadCoordinate=${shareConfig.queryHeadCoordinate || ''}`;
                if (shareConfig.queryNicknameSize) imgUrl = `${imgUrl}&queryNicknameSize=${shareConfig.queryNicknameSize || ''}`;
                if (shareConfig.queryNicknameCoordinate) imgUrl = `${imgUrl}&queryNicknameCoordinate=${shareConfig.queryNicknameCoordinate || ''}`;
                if (shareConfig.otherContent) imgUrl = `${imgUrl}&otherContent=${encodeURIComponent(shareConfig.otherContent) || ''}`;
                if (shareConfig.contentModule) imgUrl = `${imgUrl}&contentModule=${shareConfig.contentModule || ''}`;
              } catch (error) {
                imgUrl = `${__global.env == 'fat' ? 'https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2' : 'https://m.ctrip.com/restapi/soa2'}/22559/relayPagePoster?sharePath=${res.data.qrUrl || ''}&activityId=${shareConfig.activityId || ''}&avatarUrl=${shareConfig.userAvatar || ''}&nickName=${shareConfig.userName || ''}&posterBgImg=${encodeURIComponent(shareConfig.posterBgImg || '')}`
              }
              console.log('当前海报参数', shareConfig)
              console.log('当前海报地址', imgUrl)
              that.setData({
                posterImg: imgUrl,
              }, () => {
                wx.hideLoading()
                wx.previewImage({
                  urls: [that.data.posterImg],
                })
              })
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
            wx.showToast({
              title: '图片小哥跑偏了，再重试下吧',
              icon: 'none',
              mask: true
            })
          }
        })
      } catch (error) {
        wx.showToast({
          title: '图片小哥跑偏了，再重试下吧',
          icon: 'none',
          mask: true
        })
      }
    },
    async getUserInfo() {
      const res = await model.getMemberInfo()
      if (res.statusCode == 200) {
        const {
          headImage,
          nickName
        } = res.result || {}
        if (headImage && nickName) {
          this.setData({
            userInfo: {
              headImage,
              nickName,
            }
          })
        }
      }
    }
  }
})

function getCurrentPage() {
  return getCurrentPages()[getCurrentPages().length - 1] || {}
}
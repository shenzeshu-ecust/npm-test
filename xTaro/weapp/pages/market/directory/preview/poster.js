import { cwx, CPage, _ } from "../../../../cwx/cwx.js";
import {
  backPrevPage,
  judgeProtect,
} from './../mktCommon/utils.js'
const UTILS = require('../../common/utils.js');


CPage({
  pageId: '10650083826',
  checkPerformance: true,  
  isForceShowAuthorization: true,
  data: {
    isForceShowAuthorization: true,
    poster: "",
    video: "",
    downImg: "",
    media: {
      show: false,
      height: 450
    },
    pageOptions: null,
    hideShare: false,
    activityId: "",
    shareConfig: {
      "title": "",
      "imageUrl": "",
      "path": ""
    },
    showAuthFloat: false,    // 是否出过基础的隐私弹窗
  },
  onLoad(options) {
    judgeProtect(() => {
      console.log('已经同意了隐私弹窗')
      this.setData({
        showAuthFloat: true
      })
    }, () => {
      backPrevPage()
    })

    console.log('当前页', options)
    Object.keys(options).forEach((item) => {
      if (['activityId', 'poster', 'video', 'downImg', 'hideShare'].includes(item)) {
        this.setData({
          [item]: options[item]
        })
      }
    });
    Object.keys(options).forEach((item) => {
      if (['pageTitle'].includes(item)) {
        wx.setNavigationBarTitle({
          title: decodeURIComponent(options[item]),
        })
      }
    });
    this.setData({
      pageOptions: options
    })
    this.getActivityConfig()
    this.logTrace(`onLoad`, options || ``)

  },
  onShow() {
    const { hideShare } = this.data;
    if(hideShare) {
      wx.hideShareMenu()
    }
  },
  loadVideo(event) {
    const { width, height } = event.detail
    this.setData({
      "media.show": true,
      "media.height": (750 / height) * width,
    })
  },
  saveFile() {
    const { poster, video, showAuthFloat } = this.data;
    if (!showAuthFloat) return;
    wx.showLoading({ title: '正在下载', mask: true })
    const assets = {
      url: poster || video,
      type: poster ? "image": "video"
    }
    console.log('正在下载', assets)
    wx.downloadFile({
      url: assets.url,
      success(res) {
        console.log('下载文件返回值', res)
        if (res.statusCode === 200) {
          if(assets.type === "image") {
            wx.saveImageToPhotosAlbum({
              filePath:  res.tempFilePath,
              success: (downRes) => {
                console.log('下载成功', downRes)
                wx.hideLoading()
                wx.showToast({ icon: 'success', title: '下载成功' })
              },
              fail: (err) => {
                console.log('下载失败的原因', err)
                wx.hideLoading()
                wx.showToast({ icon: 'error', title: '下载失败' })
              }
            })
          } else {
            wx.saveVideoToPhotosAlbum({
              filePath:  res.tempFilePath,
              success: (downRes) => {
                console.log('下载成功', downRes)
                wx.hideLoading()
                wx.showToast({ icon: 'success', title: '下载成功' })
              },
              fail: (err) => {
                console.log('下载失败的原因', err)
                wx.hideLoading()
                if (err.errMsg == "saveImageToPhotosAlbum:fail cancel") {
                  // 用户取消
                } else {
                  wx.showToast({ icon: 'error', title: '下载失败' })
                }
              }
            })
          }
        }
      }
    })
  },
  preQrcode() {
    const { poster } = this.data
    wx.previewImage({
      urls: [poster],
      success: () => { },
      fail: () => { },
      complete: () => { }
    })
  },
  getActivityConfig() {
    const { activityId, pageOptions } = this.data
    if (activityId) {
      UTILS.fetch('18083', 'getActivityConfig', {
        activityId: activityId
      }).then((res) => {
        if (res && !res.errcode) {
          let info = res.activityCustomfields
          Object.keys(info).forEach((item) => {
            if (['shareConfig'].includes(item)) {
              info[item] = JSON.parse(info[item]) || {};
            }
            if (['poster', 'video', 'downImg'].includes(item)) {
              this.setData({
                [item]: options[item]
              })
            }
          });
          if (info.shareConfig && !info.shareConfig.flag) {
            wx.hideShareMenu()
          }
          if (info.shareConfig && info.shareConfig.flag) {
            let share = info.shareConfig
            if (pageOptions.shareTitle) share.title = pageOptions.shareTitle;
            if (pageOptions.shareImageUrl) share.imageUrl = pageOptions.shareImageUrl;
            if (pageOptions.sharePath) share.path = pageOptions.sharePath;
            this.setData({
              shareConfig: share
            })
          }
          if (pageOptions && pageOptions.shareFlag == "false") {
            wx.hideShareMenu()
          }
          if (info.pageTitle && (!pageOptions || (pageOptions && !pageOptions.pageTitle))) {
            wx.setNavigationBarTitle({
              title: info.pageTitle,
            })
          }
        }
      })
    } else {
      if (pageOptions && pageOptions.shareFlag == "false") {
        wx.hideShareMenu()
      }
      let share = {
        "title": "",
        "imageUrl": "",
        "path": ""
      }
      if (pageOptions.shareTitle) share.title = pageOptions.shareTitle;
      if (pageOptions.shareImageUrl) share.imageUrl = pageOptions.shareImageUrl;
      if (pageOptions.sharePath) share.path = pageOptions.sharePath;
      this.setData({
        shareConfig: share
      })
    }
  },
  logTrace(actioncode, actionMsg) {
    try {
      const params = { keyname: "preview_poster", PlatForm: "miniapp", actioncode: actioncode || '', actionMsg: actionMsg || '', pageId: this.pageId || '', openId: cwx.cwx_mkt.openid || '', activityName: 'preview_poster', activityId: this.data.activityId }
      this.ubtTrace(201002, params);
    } catch (e) {
      console.log('埋点报错', e)
    }
  },
  onShareAppMessage() {
    const { shareConfig } = this.data
    this.logTrace(`onShareAppMessage`, shareConfig || ``)
    return shareConfig
  }
})

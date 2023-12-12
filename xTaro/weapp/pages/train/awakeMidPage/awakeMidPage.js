import {
  cwx,
  CPage,
} from '../../../cwx/cwx'


const defaultBtnTxt = '点击跳转活动页面'
const defaultSubtitle = '若未自动跳转，请点击下方按钮进行跳转'
const defaultImgUrl = 'https://images3.c-ctrip.com/train/2021/app/V8.40.6/maipiao/img-renwu.png'
const defaultTitle = '该页面是跳转页面'

CPage({
    checkPerformance: true,
  pageId: '',
  data: {
    appId: '',
    path: '',
    imgUrl: defaultImgUrl,
    title: defaultTitle,
    btnTxt: defaultBtnTxt,
    subtitle: defaultSubtitle
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    let {
      appId = '',
      path = '',
      btnTxt = defaultBtnTxt,
      subtitle = defaultSubtitle,
      title = defaultTitle,
      imgUrl = defaultImgUrl,
    } = options
    appId = decodeURIComponent(appId)
    path = decodeURIComponent(path)
    btnTxt = decodeURIComponent(btnTxt)
    subtitle = decodeURIComponent(subtitle)
    title = decodeURIComponent(title)
    imgUrl = decodeURIComponent(imgUrl)
    this.setData({
      appId,
      path,
      btnTxt,
      subtitle,
      title,
      imgUrl,
    })
    wx.nextTick(() => {
      this.toOtherApp()
    })


  },
  noop() {
  },
  toOtherApp() {
    if (!this.data.appId || !this.data.path) {
      return
    }

    cwx.navigateToMiniProgram({
      appId: this.data.appId,
      path: this.data.path,
      envVersion: 'release', // develop开发版 trial体验版  release正式版
      success() {
        // 打开成功
      },
    })

  },
})

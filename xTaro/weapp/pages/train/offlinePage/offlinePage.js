import {
  cwx,
  CPage,
} from '../../../cwx/cwx'

const defaultSubTitle = ''
const defaultTitle = '抱歉，活动已下线'

CPage({
  checkPerformance: true,
  pageId: '',
  data: {
    title: defaultTitle,
    subtitle: defaultSubTitle
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    let {
      subtitle = defaultSubTitle,
      title = defaultTitle,
    } = options
    subtitle = decodeURIComponent(subtitle)
    title = decodeURIComponent(title)
    this.setData({
      subtitle,
      title,
    })
  },
  toTrainHome() {
    cwx.redirectTo({
      url: '/pages/train/index/index',
    });
  },
  closeWeapp() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      cwx.navigateBack();
    } else {
      if (wx.canIUse('exitMiniProgram')) {
        wx.exitMiniProgram({
          success: function () {},
        });
      }
    }
  }
})

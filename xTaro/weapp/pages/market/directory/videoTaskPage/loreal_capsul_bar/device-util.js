class DeviceUtil {
  constructor(t) {
    this.systemInfo = t
  }
  px2rpx(t) {
    return 750 / this.systemInfo.windowWidth * t
  }
  getStatusBarHeight() {
    return this.px2rpx(this.systemInfo.statusBarHeight)
  }
  getTitleBarHeight() {
    const t = this.systemInfo.statusBarHeight,
      e = wx.getMenuButtonBoundingClientRect(),
      i = e.top - t;
    return this.px2rpx(2 * i + e.height)
  }
}
const deviceUtil = new DeviceUtil(wx.getSystemInfoSync());
export default deviceUtil;


const {model, statusBarHeight, platform, windowWidth,windowHeight,safeArea,screenHeight,system} = wx.getSystemInfoSync()
const DeviceUtil = {
  /**
   * @description 微信7.0.0以上支持自定义navigation
   * @returns {Boolean} true 支持
   */
  // isSptCustmNav() {
  //   if (platform.toLowerCase().indexOf('devtools') != -1)
  //     return true;
  //   else
  //     return this.compareVersion(version, '7.0.0') >= 0;
  // },

  /**
   * @description 是否iPhoneX以上系列
   * @returns {Boolean} true 是iPhoneX以上系列
   */
  isIPX() {
    return model.search('iPhone X') != -1;
  },
  /**
   * 
   */
  isIP(){
    return model.search('iPhone') != -1;
  },

  bottomSafe:screenHeight - safeArea.bottom,
  platform :platform,

  statusBarHeight:statusBarHeight,

  px2rpx(px) {
    return px * (750 / windowWidth);
  },

  rpx2px(rpx) {
    return rpx * (windowWidth / 750);
  },
  isMacOS(){
      return system.indexOf('mac')>=0
  },
  windowHeight:windowHeight|| 603,
  windowWidth:windowWidth || 320
  
};










export default DeviceUtil;
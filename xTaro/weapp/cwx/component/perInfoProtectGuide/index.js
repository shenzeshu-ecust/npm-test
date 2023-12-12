// 个人信息保护指引页
import {
  cwx,
  CPage,
  __global
} from '../../cwx';
import { setUserAllowCache, setUserRejectCache, getEnterPageInfo } from "../../ext/perInfoProtect/checkRediToGuide"
const canIUseExit = wx.canIUse('exitMiniProgram')

CPage({
  pageId: "10650098384",
  isPIPGPage: true, // 个保指引页的标记
  /**
   * 页面的初始数据
   */
  data: {
    canIUseExit: canIUseExit,
    rejectBtnText: canIUseExit ? "不同意" : "若您不同意，请点击右上角关闭小程序", // 低版本不支持这个API时，显示另一个提示文案
    descList: [
      // 一个段落的内容
      [{
        text: "感谢您使用携程旅行！",
      }],
      // 一个段落的内容
      [{
          text: "我们非常重视您的个人信息和隐私保护。依据最新法律法规要求，我们更新了",
        },
        {
          text: "《个人信息保护指引》",
          url: "https://contents.ctrip.com/activitysetupapp/mkt/index/infopectionguide?popup=close"
        },
        {
          text: "。",
        },
      ],
      // 一个段落的内容
      [{
          text: "为向您提供更好的旅行服务，在使用我们的产品前，请您阅读完整版",
        },
        {
          text: "《服务协议》",
          url: "https://contents.ctrip.com/huodong/privacypolicyh5/index?type=1"
        },
        {
          text: "和",
        },
        {
          text: "《个人信息保护指引》",
          url: "https://contents.ctrip.com/activitysetupapp/mkt/index/infopectionguide?popup=close"
        },
        {
          text: "的所有条款，包括：",
        },
      ],
      // 一个段落的内容
      [{
        text: "1、为向您提供包括账户注册、旅游服务预订、交易支付在内的基本功能，我们可能会基于具体业务场景收集您的个人信息；",
      }, ],
      // 一个段落的内容
      [{
        text: "2、我们会基于您的授权来为您提供更好的旅行服务，这些授权包括定位（为您精确推荐附近的优质旅游资源）、设备信息（为实现信息推送，保障账户和交易安全，获取包括IMEI、 IMSI、MAC在内的设备标识符）、存储权限（更改头像、发送社区动态、保存图片到本地等），您有权拒绝或取消这些授权；",
      }, ],
      // 一个段落的内容
      [{
        text: "3、我们会基于先进的技术和管理措施保护您个人信息的安全；",
      }, ],
      // 一个段落的内容
      [{
        text: "4、未经您的同意，我们不会将您的个人信息共享给第三方；",
      }, ],
      // 一个段落的内容
      [{
        text: "5、为向您提供更好的携程网络会员服务，您同意提供及时、详尽及准确的个人资料；",
      }, ],
      // 一个段落的内容
      [{
        text: "6、您在享用携程网络会员服务的同时，授权并同意接受携程向您的电子邮件、手机、通信地址等发送商业信息，包括不限于最新的携程产品信息、促销信息等。若您选择不接受携程提供的各类信息服务，您可以按照携程提供的相应设置拒绝该类信息服务。",
      }, ],
    ]
  },
  // 测试跳转至 pwebview
  // navToPwebview: function () {
  //   cwx.navigateTo({
  //     url: '/cwx/component/perInfoProtectGuide/pwebview?data=' + JSON.stringify({
  //       url: encodeURIComponent("https://contents.ctrip.com/huodong/privacypolicyh5/index?type=1")
  //     })
  //   })
  // },
  navToUrl: function (e) {
    if (e && e.target && e.target.dataset && e.target.dataset.url) {
      wx.navigateTo({
        url: '/cwx/component/cwebview/cwebview?data=' + JSON.stringify({
          url: encodeURIComponent(e.target.dataset.url)
        })
      })
    }
  },
  handleAgree: function (e) {
    setUserAllowCache();
    
    // 为了便于对比是否为 tabBar 页面，path 已经统一处理为不以 / 开头，后面跳转时再统一添加 / 前缀
    const { path, query } = getEnterPageInfo();

    // 判断是不是 tabbar 页面，要用 switchTab 
    let routeType = "redirectTo";
    if (__global.tabbar.includes(path)) {
      routeType = "switchTab"
    }

    let url = path;
    for (let key in query) {
      if (query.hasOwnProperty(key)) {
        url += (url.includes("?") ? "&" : "?") + `${key}=${query[key]}`
      }
    }
    url = `/${url}`;
    
    this.sendUbt("handleAgree", {
      routeType,
      url,
    })
    cwx[routeType]({ url })
  },
  sendUbt: function (key, options) {
    const { path, query } = getEnterPageInfo();
    cwx.sendUbtByPage.ubtDevTrace(`weapp_perInfoProtect_guide_${key}`, {
      path,
      query: JSON.stringify(query),
      canIUseExit,
      ...options
    });
  },
  handleReject: function (e) {
    this.sendUbt("handleReject", {})
    if (!canIUseExit) {
      return;
    }
    setUserRejectCache();

    wx.exitMiniProgram({
      success: function (res) {
        // console.log(res);
      },
      fail: function (res) {
        // console.log(res);
      },
      complete: function (res) {
        // console.log(res);
      },
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
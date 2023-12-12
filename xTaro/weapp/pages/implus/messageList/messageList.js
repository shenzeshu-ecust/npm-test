/**
 * IM Chat 消息中心
 * 该页面使用cwebView，但是在cwebview的基础上，增加了解析im key的功能
 */

import { CPage, cwx, __global } from "../../../cwx/cwx";

CPage({
  pageId: "10650065336",
  /**
   * 页面的初始数据
   */

  data: {
    canWebView: cwx.canIUse("web-view"),
    isLogin: cwx.user.isLogin(), //是否已登录
    url: "", //需要跳转的H5方式地址
    wsg: "",
    isNavigate: true, //跳转方式
    loginErrorUrl: "", //登录失败自定义显示地址  默认：url值
    jumpData: null,
    isSubscribed: false, // 是否订阅
  },

  getMessageListUrl: function () {
    let runTimeDomin = "https://m.ctrip.com";
    if (__global.env.toLowerCase() == "fat") {
      runTimeDomin = "https://servicechat.fat3196.qa.nt.ctripcorp.com";
    } else if(__global.env.toLowerCase() == 'uat') {
      runTimeDomin = "https://servicechat.uat.qa.nt.ctripcorp.com";
    }
    return `${runTimeDomin}/webapp/servicechatv3/messagelist?source=wechatmini_app&platform=wechat&flag=${new Date().getTime()}`;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.hideShareMenu();
    let self = this;

    cwx.user.checkLoginStatusFromServer((isLogin) => {
      self.setData({
        isLogin: isLogin,
      });

      // 已登录，则需要同步登录态并跳转url
      if (isLogin) {
        self.asyncLogin();
      } else {
        // 强制跳转原生登录页
        self.setData({
          isLogin: false,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let self = this;
    console.log("onShow: ")
    cwx.user.checkLoginStatusFromServer((isLogin) => {
      // 登录态发生变化
      console.log("isLogin: ", isLogin)
      if (isLogin !== self.data.isLogin) {
        // 已登录，则需要同步登录态并跳转url
        if (isLogin && !self.data.isLogin) {
          self.asyncLogin();
        } else {
          // 强制跳转原生登录页
          self.setData({
            isLogin: false,
          });
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  asyncLogin: function () {
    cwx.syncLogin.load({
      url: this.getMessageListUrl(), //需要跳转的url
      loginErrorUrl: "", // 跳转失败时的url
      success: (newUrl) => {
        this.setData({
          url: newUrl,
          isLogin: true,
        });
        // wx.hideShareMenu();

        if (this.ubtDevTrace) {
          this.ubtDevTrace("o_implus_messageList_onLoad", {
            action: "page_onload",
            user: JSON.stringify(cwx.user),
          });
        }
      },
      fail: (errorUrl) => {
        this.setData({
          isLogin: false,
        });
      },
    });
  },

  login: function () {
    // 强制跳转原生登录页
    cwx.user.login({
      param: {},
      callback: function (res) {
        if (res && res.ReturnCode === "0") {
          // 已登录，同步登录态并跳转url
          this.asyncLogin();
        } else {
          // 登录失败，展示跳转登录页的原生按钮
          this.setData({
            isLogin: false,
          });
        }
      },
    });
  },

  showUrlError: function () {
    this.setData({
      url: "",
      wsg: "目标地址出了点问题，请重新打开该页面",
    });
  },

  onPageLoadDone: function () {
    cwx.hideLoading();
    if (this.ubtDevTrace) {
      this.ubtDevTrace("o_implus_messageList_loadDone", {
        action: "messageList_loadDone",
        url: this.data.url,
      });
    }
  },

  onPageLoadError: function () {
    this.showUrlError();
    if (this.ubtDevTrace) {
      this.ubtDevTrace("o_implus_messageList_loadError", {
        action: "messageList_loadError",
        url: this.data.url,
      });
    }
  },

  onShareAppMessage: function() {
    return {
      title: '携程消息，放心服务',
      path: 'pages/implus/messageList/messageList',
      imageUrl: 'https://dimg04.c-ctrip.com/images/05O1712000at0payzDCAB.png'
    }
  },
});

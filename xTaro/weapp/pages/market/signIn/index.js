import {
  cwx,
  CPage,
  __global,
  _
} from "../../../cwx/cwx";
const model = require('./model.js');
const UTILS = require('./../common/utils.js');


const fatUrl = 'https://contents.fat23.qa.nt.ctripcorp.com/activitysetupapp/mkt/index/membersignin2021?isHideNavBar=YES'
const prodUrl = 'https://m.ctrip.com/activitysetupapp/mkt/index/membersignin2021?isHideNavBar=YES'

CPage({
  pageId: '10650004935',
  data: {
    pageId: '10650004935',
    toUrlFlag: false, // 是否含有toUrl
    toH5Url: "", // 跳转的H5地址
    canWebView: cwx.canIUse('web-view'),
    webviewUrl: __global.env == 'fat' ? fatUrl : prodUrl, // H5的页面路径
    canWebView: true,
    showPage: false,
    shareConfig: {
      shareImg: "",
      sharePath: "",
      shareTitle: ""
    }
  },

  /** No.1 onLoad方法 */
  async onLoad(options) {
    let {
      webviewUrl
    } = this.data;
    // 如果
    webviewUrl = this.resolveParams(webviewUrl, options)
    this.setData({
      webviewUrl
    })

    cwx.syncLogin.load({
      url: webviewUrl, //需要跳转的url
      loginErrorUrl: webviewUrl, // 跳转失败时的url
      isLogin: true,
      success: async (newUrl) => {
        this.setData({
          webviewUrl: newUrl,
          showPage: true
        }, async () => {
          console.log('%c正在打开H5 webview承接页 当前页面地址', 'color: #f20', this.data.webviewUrl)
          await this.toUrl(options);
          this.logTrace('onLoad', options);
        });
      },
      fail: (errorUrl) => {
        console.log("fail");
      }
    });
  },

  onShow() {
    console.log('签到页onshow了')
    this.queryLegaoTemplate()
  },

  queryLegaoTemplate() {
    UTILS.fetch('13458', 'loadTemplate', {
      "templateCode": "membersignin2021",
    }).then(res => {
      if (res && res.code == 0) {
        const { webviewUrl } = this.data;
        const legaoShareConfig = JSON.parse(res.template.share);
        console.log('乐高模板返回值', legaoShareConfig)
        const shareConfig = {
          shareImg: legaoShareConfig.icon || "",
          sharePath: webviewUrl,
          shareTitle: legaoShareConfig.title || ""
        }
        this.setData({
          shareConfig
        })

      }
    })
  },

  // 处理h5参数问题
  // 1. 如果壳子带有pushcode参数，优先取壳子pushcode，否则默认miniprogram
  resolveParams(webviewUrl, options) {
    if (options.pushcode) {
      webviewUrl = `${webviewUrl}&pushcode=${options.pushcode}`
    } else {
      webviewUrl = `${webviewUrl}&pushcode=miniprogram`
    }
    return webviewUrl
  },

  /** 判断toUrl跳转 */
  toUrl(options) {
    if (options && options.toUrl) {
      this.setData({
        toUrlFlag: true
      })
      const urlOption = decodeURIComponent(options.toUrl)
      this.commonRouter(urlOption)
      this.logTrace('toUrl', urlOption || '')
    }
  },

  /** toUrl跳转规则 */
  commonRouter(urlOption) {
    if (urlOption.startsWith("http")) {
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(urlOption)
        }
      })
    } else {
      cwx.navigateTo({
        url: urlOption,
        fail() {
          cwx.switchTab({
            url: urlOption
          })
        }
      })
    }
  },

  /** 埋点 */
  logTrace(actioncode, actionMsg) {
    try {
      const params = {
        keyname: "198074",
        PlatForm: "miniapp",
        actioncode: actioncode || '',
        actionMsg: actionMsg || '',
        pageId: '10650004935',
        openId: cwx.cwx_mkt.openid || '',
        activityName: '签到页',
        activityId: 'wechat_signin_activity'
      }
      console.log('%c 埋点的入参', 'color: red;', params)
      this.ubtTrace(198074, params);
    } catch (e) {
      console.log('签到页埋点报错', e)
    }
  },

  /** 用户点击右上角分享 */
  onShareAppMessage(e) {
    const {
      shareConfig,
    } = this.data;
    console.log('当前分享：', shareConfig)
    this.logTrace('onShareAppMessage', shareConfig || '')
    return {
      title: shareConfig.shareTitle || `签到领积分，酒店全额抵`,
      path: `/pages/market/signIn/index`,
      imageUrl: shareConfig.shareImg || `https://dimg04.c-ctrip.com/images/0zg4512000bxp4bb7A767.png`
    }
  },

})
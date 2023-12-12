import { cwx, CPage, __global, _ } from "../../../../cwx/cwx";
import { apiServer, apiUpload } from "./../videoTaskPage/api"
import {
  backPrevPage,
  judgeProtect,
} from './../mktCommon/utils.js'
const utils = require('../../common/utils.js');
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

CPage({
  pageId: '10650066338',
  checkPerformance: true,  
  isForceShowAuthorization: true,
  data: {
    isForceShowAuthorization: true,
    pageId: '10650066338',
    pageConfig: {},
    pageOption: {},
    authConfig: {},
    activityId: '',
    avatarUrl: undefined,
    defaultAvatarUrl: defaultAvatarUrl,
    nickName: undefined,
  },

  async onLoad(options) {
    console.log('授权页面', options)
    utils.getOpenid(async () => {
      await this.checkLogin()
      Object.keys(options).forEach(key => {
        try {
          if (options[key] && (typeof options[key] === "string") && [""].includes(key)) {
            options[key] = JSON.parse(options[key])
          }
        } catch (err) { }
      })
      this.setData({
        pageOption: options
      })
      await this.getActivityConf(options.activityId || '')
    })
    this.logTrace('onLoad', '进入授权页面', options || {})

    judgeProtect(() => {}, () => {
      backPrevPage()
    })
  },
  async onShow() {
    await this.checkLogin()
    await this.checkWxSdk()
  },
  checkWxSdk() {
    try {
      wx.getSystemInfo().then(res => {
        const SDKVersion = res.SDKVersion || '0';
        if (utils.compareVersion(SDKVersion, '2.21.2') >= 0) {

        } else {
          wx.showModal({
            title: '提示',
            content: '您的微信版本过低，无法参与活动。建议您升级微信版本。',
            showCancel: false,
            complete: (res) => {
              cwx.navigateBack()
            }
          })
        }
      })
    } catch (error) { }
  },
  checkLogin(callback) {
    cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
      if (!checkLoginRes) {
        cwx.user.login({
          param: {
            sourceId: "market",
          }
        });
      }
    });
  },

  exportCtripOss(tempSrc, callback) {
    wx.getFileSystemManager().readFile({
      filePath: tempSrc,  
      encoding: 'base64',
      success: (resBase64) => {
        const base64 = 'data:image/png;base64,' + resBase64.data;
        callback(base64)
      },
    })
  },

  /** 查询活动详情 */
  async getActivityConf(id) {
    if (!id) return;
    const { data } = await apiServer('getActivityConfig', { "activityId": id })
    if (data && !data.errcode) {
      const pageConfig = data.activityCustomfields;
      const authConfig = pageConfig.authConfig ? JSON.parse(pageConfig.authConfig) : {}
      this.setData({
        activityId: id || '',
        authConfig: authConfig,
        pageConfig: pageConfig || {},
      })
    }
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl,
    })
    this.logTrace('onChooseAvatar', '获取用户选择的头像', e.detail || "")
  },

  changeUserNick(e) {
    this.setData({
      nickName: e.detail.value
    })
    this.logTrace('changeUserNick', '获取用户填写的昵称', e.detail || "")
  },

  /** 授权上报 */
  authWechatUserInfo(userInfo) {
    const params = {
      activityId: 'MKT_APP_COMMON_ACTIVITY',
      openId: cwx.cwx_mkt.openid,
      nickName: userInfo.nickName,
      headImage: userInfo.avatarUrl
    }
    console.log('上报授权authWechatUserInfo接口入参', params)
    utils.fetch('16575', 'authWechatUserInfo', params).then((data) => {
      console.log('授权返回值', data)
    }).catch((res) => {
      res.errMsg && utils.showToast(res.errMsg);
    })
  },

  async submit() {
    await this.checkLogin();
    const { avatarUrl, nickName, pageOption } = this.data;
    if (!avatarUrl) {
      return wx.showToast({ title: '请选择您的头像', icon: "none", mask: true })
    }
    if (!nickName) {
      return wx.showToast({ title: '请选择您的昵称', icon: "none", mask: true })
    }
    const currTime = utils.nowTimeStemp('number', 0);
    this.exportCtripOss(avatarUrl, (avatarUrlRes) => {
      // console.log('上传的图片和昵称', avatarUrlRes)
      apiUpload(``, ``, { "base64Str": avatarUrlRes }).then(ossRes => {
        if (ossRes && ossRes.data && ossRes.statusCode == 200) {
          const params = {
            "avatarUrl": ossRes.data.url,
            "nickName": nickName,
            "updateTime": currTime
          }
          this.authWechatUserInfo(params);
          this.logTrace('authWechatUserInfo', '更新用户微信头像昵称', params || {})
          wx.setStorageSync(pageOption.local || 'videoTaskAuth', params);
          setTimeout(() => {
            cwx.navigateBack({
              delta: 1,
              fail: () => {
                wx.showToast({ title: '提交成功, 请手动返回上一页', icon: "none", mask: true })
              }
            });
          }, 300)
        } else {
          return wx.showToast({ title: '头像上传失败，请稍后再试', icon: "none", mask: true })
        }
      })
    })
  },
  /** 埋点 */
  logTrace(actioncode, actionMsg, content) {
    try {
      const params = {
        "actioncode": actioncode || "o_market_videoTask_dev",
        "actionName": "微信授权页面",
        "actionMsg": actionMsg || '',
        "openid": cwx.cwx_mkt.openid,
        "content": content || "",
        "PageActivity": this.data.activityId || ''
      }
      // console.log('当前埋点信息', params)
      this.ubtDevTrace(194579, params);
      this.ubtTrace(201002, params);
    } catch (error) {
      console.log('中转页埋点报错', error)
    }
  }
})

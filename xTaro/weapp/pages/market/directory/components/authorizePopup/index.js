import { cwx, __global, _ } from "../../../../../cwx/cwx";
import { apiUpload } from "./../../videoTaskPage/api"
const utils = require('../../../common/utils.js');
let mPage, pageId = "";

class EventUtil {
  emit(component, eventName, detail) {
    component.triggerEvent(eventName, detail, {
      bubbles: true,
      composed: true,
      capturePhase: true
    });
  }
}
const eventUtil = new EventUtil();

Component({
  externalClasses: ['l-bg-class', 'l-panel-class', 'l-class'],
  properties: {
    // 显示与隐藏
    show: {
      type: Boolean,
      value: false
    },
    // 动画效果的显示和隐藏
    animation: {
      type: Boolean,
      value: false
    },
    // 替代 animation
    transition: {
      type: Boolean,
      value: null
    },
    // slot的位置
    contentAlign: {
      type: String,
      value: 'bottom',
      options: ['top', 'right', 'left', 'bottom', 'center']
    },
    // 替代 contentAlign
    direction: {
      type: String,
      value: null,
      options: ['top', 'right', 'left', 'bottom', 'center']
    },
    // 锁定
    locked: {
      type: Boolean,
      value: false
    },
    // 层级
    zIndex: {
      type: Number,
      value: 99999
    }
  },

  attached() {
    this._init();
  },

  pageLifetimes: {
    show() {
      this._init();
      this.checkLogin()
      mPage = cwx.getCurrentPage();
      pageId = mPage ? (mPage.pageid || mPage.pageId || '') : '';

    },
  },

  observers: {
    'show': function (val) {
      if (!val) {
        this.setData({
          avatarUrl: "",
          nickName: "",
        })
      }
    },
  },

  data: {
    status: 'show',
    avatarUrl: "",
    nickName: "",
    defaultAvatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0"
  },

  methods: {
    checkLogin() {
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

    _init() {

    },
    // 阻止滑动
    doNothingMove() {

    },
    doNothingTap() {

    },
    // 点击事件
    onPopupTap() {
      let detail = true;
      if (this.data.locked !== true) {
        if (!this.data.show) {
          this.setData({
            show: true,
            status: 'show'
          });
        } else {
          this.setData({
            status: 'hide'
          });
          setTimeout(() => {
            this.setData({
              show: false,
              status: 'show'
            });
          }, 300);
        }
      }

      eventUtil.emit(this, 'lintap', detail);

    },

    onChooseAvatar(e) {
      const { avatarUrl } = e.detail;
      this.setData({
        avatarUrl,
      })
      this.logTrace('onChooseAvatar', '用户选择头像', avatarUrl || '')
    },

    changeUserNick(e) {
      const { value } = e.detail;
      this.setData({
        nickName: value
      })
      this.logTrace('changeUserNick', '用户填写昵称', value || '')
    },

    reject() {
      this.setData({
        show: false
      });
      eventUtil.emit(this, 'authorizeReject', "");
      this.logTrace('authorizeReject', '拒绝授权')
    },

    agree() {
      this.submit((res) => {
        this.setData({
          show: false
        });
        eventUtil.emit(this, 'authorizeAgree', "");
        this.logTrace('authorizeAgree', '同意授权')
      })
    },

    exportCtripOss(tempSrc, callback) {
      wx.getFileSystemManager().readFile({
        filePath: tempSrc,  
        encoding: 'base64',
        success: (resBase64) => {
          const base64 = 'data:image/png;base64,' + resBase64.data;
          callback(base64)
        }
      })
    },
    /** 授权上报 */
    authWechatUserInfo(userInfo) {
      const params = {
        activityId: 'MKT_APP_COMMON_ACTIVITY',
        openId: cwx.cwx_mkt.openid,
        nickName: userInfo.nickName,
        headImage: userInfo.avatarUrl
      }
      this.logTrace('authWechatUserInfoBefore', '上传授权之前', params)
      utils.fetch('16575', 'authWechatUserInfo', params).then((data) => {
        console.log('更新会员授权信息返回值', data)
        this.logTrace('authWechatUserInfoAfter', '上传授权返回', data)
      }).catch((res) => {
        res.errMsg && utils.showToast(res.errMsg);
      })
    },

    submit(callback) {
      const { avatarUrl, nickName } = this.data;
      if (!avatarUrl) {
        return wx.showToast({ title: '请选择您的头像', icon: "none", mask: true })
      }
      if (!nickName) {
        return wx.showToast({ title: '请填写您的昵称', icon: "none", mask: true })
      }
      const currTime = utils.nowTimeStemp('number', 0);
      this.exportCtripOss(avatarUrl, (avatarUrlRes) => {
        apiUpload(``, ``, { "base64Str": avatarUrlRes }).then(ossRes => {
          if (ossRes && ossRes.data && ossRes.statusCode == 200) {
            const params = {
              "avatarUrl": ossRes.data.url,
              "nickName": nickName,
              "updateTime": currTime
            }
            this.authWechatUserInfo(params);
            callback && callback(params);
            wx.showToast({ title: '提交成功', icon: "none", mask: true })
            this.logTrace('submitSuccess', '更新成功', params)

          } else {
            this.logTrace('submitError', '更新失败', "")
            return wx.showToast({ title: '头像上传失败，请稍后再试', icon: "none", mask: true })
          }
        })
      })
    },

    /** 埋点 */
    logTrace(actioncode, actionMsg, content = "") {
      try {
        console.log('%c 微信授权弹窗组件 上报', 'color: skyblue')
        mPage && mPage.ubtTrace && mPage.ubtTrace(201002, {
          keyName: "mkt_2021Activity",
          activityName: "mkt_authorize_popup_component",
          actioncode: actioncode || '',
          actionMsg: actionMsg || '',
          pageId: pageId || '',
          openId: cwx.cwx_mkt.openid || '',
          content: content || '',
        });
      } catch (error) {
        console.log('埋点报错', error)
      }
    }



  }
});

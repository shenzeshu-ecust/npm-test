import { cwx, CPage, _ } from "../../../../../cwx/cwx";
const utils = require('../../../common/utils.js');
const asyncStorage = require('../../../common/storage.js')
let mPage, pageId = "", openid = '';
let bool = true;

Component({
  properties: {
    masonryData: {
      type: Array,
      value: [],
      observer(newVal, oldVal) {
        if (newVal) {
          this.processData();
        }
      }
    },
    wxsdkVersionFlag: {
      type: Boolean,
      value: false,
    },
    pageOption: {
      type: Object,
      value: {}
    },
    keyCfg: {
      type: Object,
      value: {}
    },
    styleCfg: {
      type: Object,
      value: {}
    },
    authResult: {
      type: Object,
    },
    authConfig: {
      type: Object
    }
  },

  data: {
    pageId: '10650066338',
    idx: 0,
    masonryList: [],
    processList: [],
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseGetChannelsLiveInfo: wx.canIUse('getChannelsLiveInfo'),
    signStatus: false, 
    userInfo: asyncStorage.get('videoTask'),
    showAuthorizePopup: false,
    showCtripVideo: true,
  },
  pageLifetimes: {
    show: function () {
      utils.getOpenid(() => {
        mPage = cwx.getCurrentPage()
        pageId = mPage ? (mPage.pageid || mPage.pageId || '') : ''
        openid = cwx.cwx_mkt.openid || '';
        this.checkLogin()
      })
    }
  },

  methods: {
    /** 授权上报 */
    authWechatUserInfo(userInfo) {
      const that = this
      const params = {
        activityId: 'MKT_APP_COMMON_ACTIVITY',
        openId: cwx.cwx_mkt.openid,
        nickName: userInfo.nickName,
        headImage: userInfo.avatarUrl
      }
      console.log('上报搜索接口入参', params)
      utils.fetch('16575', 'authWechatUserInfo', params).then((data) => {
        console.log('授权返回值', data)
        that.logTrace('authWechatUserInfo', data || '')
      }).catch((res) => {
        res.errMsg && utils.showToast(res.errMsg);
      })
    },

    /** 检查登录状态 */
    checkLogin() {
      const that = this
      cwx.user.checkLoginStatusFromServer(res => {
        that.setData({
          signStatus: res || false
        });
        that.logTrace('checkLogin', res || '')
      });
    },

    /** 获取用户基本授权信息 */
    async getUserInfo() {
      const userInfo = await cwx.requireUserPic();
      if (userInfo.nickName && userInfo.avatarUrl) {
        this.setData({
          userInfo: userInfo
        })
      }
    },

    /** 打开详情 */
    openDetail(e) {
      const that = this
      const { authResult, wxsdkVersionFlag } = that.properties;
      const { canIUseGetChannelsLiveInfo } = that.data;
      const { item } = e.currentTarget.dataset;
      console.log('查询即将打开的详情 授权', authResult)
      if (authResult && authResult.avatarUrl && authResult.nickName) {
        that.authWechatUserInfo(authResult)
        if (canIUseGetChannelsLiveInfo) {
          wx.openChannelsActivity({
            finderUserName: item.finderUserName,
            feedId: item.feedId,
            success: (res) => {
              console.log('打开成功', res)
              that.logTrace('openChannelsActivity', 'success')
            },
            fail: (err) => {
              console.log('打开失败', err, )
              that.logTrace('openChannelsActivity', 'cancel')
            }
          })
        } else {
          console.log('提高基础库')
          wx.showToast({
            title: '当前微信版本号过低，请升级到最新版本',
            icon: 'none'
          })
          that.logTrace('openChannelsActivity', 'error')
        }
      } else {
        wx.showModal({
          title: `您尚未授权头像和昵称，无法完成任务`,
          cancelText: '取消',
          confirmText: '去授权',
          complete: (res) => {
            if (res.cancel) {

            }
            if (res.confirm) {
              console.log('当前版本号是否是新的',wxsdkVersionFlag)
              if (wxsdkVersionFlag) {
                that.setData({
                  showAuthorizePopup: true
                })
              } else {
                wx.navigateTo({
                  url: `/pages/market/directory/publicauthorize/index?local=videoTaskAuth&activityId=${that.data.pageOption.activityId || 'MKT_videoTask_1631939580651'}`,
                })
              }

            }
          }
        })
      }
    },

    videoLoadError(event) {
      console.log('视频加载失败', event)
      this.setData({
        showCtripVideo: false
      })
      this.logTrace('videoLoadError', '视频号的主体不是携程')
    },

    processData() {
      const { masonryData, keyCfg } = this.data
      let list = JSON.parse(JSON.stringify(masonryData))
      const len = list.length
      console.log('组件处理图片', list)
      for (let i = 0; i < len; i++) {
        if (keyCfg.masonryTitle && !list[i]['masonryTitle']) {
          list[i]['masonryTitle'] = list[i][keyCfg.masonryTitle]
        }
        if (keyCfg.masonryDesc && !list[i]['masonryDesc']) {
          list[i]['masonryDesc'] = list[i][keyCfg.masonryDesc]
        }
        if (keyCfg.masonryPrice && !list[i]['masonryPrice']) {
          list[i]['masonryPrice'] = list[i][keyCfg.masonryPrice]
        }
        if (keyCfg.masonryImg && !list[i]['masonryImg']) {
          list[i]['masonryImg'] = list[i][keyCfg.masonryImg]
        }
        if (keyCfg.masonryOriginalPrice && !list[i]['masonryOriginalPrice']) {
          list[i]['masonryOriginalPrice'] = list[i][keyCfg.masonryOriginalPrice]
        }
        if (keyCfg.masonryJumpUrl && !list[i]['masonryJumpUrl']) {
          list[i]['masonryJumpUrl'] = list[i][keyCfg.masonryJumpUrl]
        }
      }
      this.setData({
        processList: list
      }, () => {
        this.renderMasonry()
      })

    },
    renderMasonry() {
      const list = this.data.processList
      if (list.length > this.data.idx) {
        const query = wx.createSelectorQuery();
        let columnNodes = query.selectAll('#left-col-inner, #right-col-inner');
        columnNodes.boundingClientRect().exec(arr => {

          const rects = arr[0];
          const leftColHeight = rects[0] && rects[0].height;
          const rightColHeight = rects[1] && rects[1].height;

          if (list[this.data.idx]) {
            if (leftColHeight == undefined || rightColHeight == undefined) {
              list[this.data.idx].columnPosition = bool ? 'left' : 'right';
              bool = !bool
            } else {
              list[this.data.idx].columnPosition = leftColHeight <= rightColHeight ? 'left' : 'right';
            }
          }

          let tempList = this.data.masonryList.slice(0);
          tempList.push(list[this.data.idx]);

          let tempIdx = this.data.idx;
          tempIdx++;
          this.setData({
            masonryList: tempList,
            idx: tempIdx,
          }, setTimeout(() => {
            this.renderMasonry()
          }, 250)
          )
        })
      }
    },
    goTargetUrl(e) {
      const targetUrl = e.target.dataset.url
      if (!targetUrl) return;
      if (targetUrl.indexOf('thirdAppId') > 0) {
        wx.navigateToMiniProgram({
          appId: utils.getUrlQuery(targetUrl, 'thirdAppId'),
          path: "/" + targetUrl.trim(),
          extraData: {

          },
          success() {
          }
        });
      } else if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
        cwx.component.cwebview({
          data: {
            url: encodeURIComponent(targetUrl)
          }
        })
      } else {
        if (targetUrl[0] == '/' && targetUrl.slice) {
          targetUrl = targetUrl.slice(1)
        }
        cwx.navigateTo({
          url: "/" + targetUrl.trim(),
          fail: () => {
          }
        });
      }
    },
    /** 埋点 */
    logTrace(type, config) {
      try {
        const params = {
          "actioncode": type || "o_market_videoTask_dev",
          "actionName": "市场视频号任务页",
          "actionMsg": config || '',
          "openid": cwx.cwx_mkt.openid,
        }
        console.log('%c埋点入参', 'color: red', params)
        mPage && mPage.ubtDevTrace && mPage.ubtDevTrace(194579, params);
        mPage && mPage.ubtTrace && mPage.ubtTrace(201002, params);
      } catch (error) {
        console.log('埋点报错', error)
      }
    }
  }
})
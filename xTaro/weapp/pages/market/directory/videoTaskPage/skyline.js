import { cwx, CPage, __global, _ } from "../../../../cwx/cwx";
import { apiServer } from "./api"
const utils = require('../../common/utils.js')

CPage({
  pageId: '10650095084',
  checkPerformance: true,  
  data: {
    pageId: '10650095084',
    allianceid: '',
    sid: '',
    pageConfig: {}, 
    pageOption: {}, 
    activityId: '', 
    videoList: [],
    masonryList: [],
    AdvertiseDataWidth: (cwx.wxSystemInfo.windowWidth - 22),
    AdvertiseDataHeight: (cwx.wxSystemInfo.windowWidth - 10) * 0.333,
    slideVideo: {
      dotPosition: 'center'
    },
    keyCfg: {
      masonryImg: "image",
      masonryTitle: "name",
      masonryDesc: "subTitle",
      masonryPrice: "price1",
      masonryOriginalPrice: "price2",
      masonryJumpUrl: "url"
    },
    styleCfg: {
      width: 720,
      marginRight: 16
    },
    authConfig: null,
    authResult: {
      avatarUrl: undefined,
      nickName: undefined
    }, 
    goUpdateAuth: false, // 是否前往更新授权
    wxsdkVersionFlag: false, // 视频号的版本是否在2.25.1以上
    showAuthorizePopupFlag: false, // 授权弹窗
    bottomMoreButtonVisible: false, // 底部查看更多的按钮
  },

  /** 先检查登录、然后检查带参、检查活动状态 */
  async onLoad(options) {
    // console.clear()
    this.checkMiniAppVersion()
    utils.getOpenid(async () => {
      this.setData({
        pageOption: options
      })
      await this.getActivityConf(options.activityId || '')
      await this.getVideoList(options)
      this.logTrace('onLoad', '')
    })
  },

  async onShow() {
    await this.queryUserBaseInfo()
    this.logTrace('onShow', '')
  },

  async queryUserBaseInfo() {
    const { data } = await apiServer('getMemberInfo', { tpye: "uid" })
    if (data && data.statusCode == 200) {
      const { result } = data;
      console.log('查询用户的基本信息 头像昵称', result)
      if (result && result.nickName) {
        this.checkUserStatus(result);
        if (result.nickName != "微信用户") {
          return this.setData({
            authResult: {
              avatarUrl: result.headImage,
              nickName: result.nickName
            }
          })
        }
      }
    }
  },

  /** 打开底部查看更多视频 */
  openMoreVideo() {
    const that = this;
    const { pageOption, pageConfig, masonryList } = this.data;
    const currId = masonryList.find(item => item.finderUserName === pageOption.finderUserName)
    const currFinderUserName = currId ? currId.finderUserName : masonryList[0].finderUserName;

    try {
      wx.getSystemInfo().then(res => {
        const SDKVersion = res.SDKVersion || '0';
        if (utils.compareVersion(SDKVersion, '2.21.2') >= 0) {
          wx.openChannelsUserProfile({
            finderUserName: currFinderUserName,
            fail(error){
              that.logTrace('openChannelsUserProfileError',  '查看更多失败，因为不是同一主体')
              if(error?.errno == 1416103) {
                if(pageConfig.defaultFinderUserName) {
                  wx.openChannelsUserProfile({
                    finderUserName: pageConfig.defaultFinderUserName,
                  })
                }
              }
            }
          })
          that.logTrace('openMoreVideo', currFinderUserName || '')
        } else {
          wx.showToast({
            title: '当前微信版本号过低，请升级到最新版本',
            icon: 'none'
          })
        }
      })
    } catch (error) { }
  },

  showAuthorizePopup() {
    this.setData({
      showAuthorizePopupFlag: true
    })
    this.logTrace('showAuthorizePopup', '')
  },

  authorizeAgree() {
    this.setData({
      showAuthorizePopupFlag: false
    })
    setTimeout(() => {
      this.queryUserBaseInfo()
    }, 1000)
  },

  /** 查看当前基础库版本 */
  checkMiniAppVersion() {
    try {
      wx.getSystemInfo().then(res => {
        const SDKVersion = res.SDKVersion || '0'
        console.log('查看当前基础库版本', SDKVersion,  utils.compareVersion(SDKVersion, '2.25.2') >= 0)
        if (utils.compareVersion(SDKVersion, '2.25.2') >= 0) {
          console.log('查看当前基础库版本 当前版本可以使用 channel-video', SDKVersion)
          // 因为skyline页面不支持 channel-video
          this.setData({
            wxsdkVersionFlag: false
          })
          this.logTrace('checkMiniAppVersionSuccess', res || '');
        } else {
          console.log('查看当前基础库版本 当前版本不能直接使用视频号功能', res)
          this.setData({
            wxsdkVersionFlag: false
          })
          this.logTrace('checkMiniAppVersionError', res || '');
        }
      })
    } catch (error) { }
  },

  async checkUserStatus(result) {
    const that = this;
    const currVideoLocal = wx.getStorageSync('videoTaskAuth');
    const currTime = utils.nowTimeStemp('number', 0);
    const timeDiff = currTime - ((currVideoLocal && currVideoLocal.updateTime) || 0);
    if (!currVideoLocal || timeDiff > 1000 * 60 * 60 * 24 * 14) {
      console.log('是否展示弹窗', currVideoLocal)
      wx.showModal({
        title: '请确认您的头像和昵称是否为最新？',
        cancelText: '确认',
        confirmText: '去授权',
        complete: (res) => {
          if (res.confirm) {
            that.updateAuth()
          }
        }
      })
      wx.setStorageSync('videoTaskAuth', {
        "avatarUrl": result?.headImage,
        "nickName": result?.nickName,
        "updateTime": currTime
      })
    }
  },

  /** 跳转方法 */
  goTargetUrl(targetUrl, cb) {
    const that = this;
    if (targetUrl) {
      if (targetUrl.indexOf('thirdAppId') > 0) {
        wx.navigateToMiniProgram({
          appId: utils.getUrlQuery(targetUrl, 'thirdAppId'),
          path: "/" + targetUrl.trim(),
          extraData: {},
          success() { },
          fail() { }
        });
      } else if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
        // 跳转H5页面
        cwx.component.cwebview({
          data: {
            url: encodeURIComponent(targetUrl),
            isNavigate: false
          }
        })
      } else {
        if (targetUrl[0] == '/' && targetUrl.slice) {
          targetUrl = targetUrl.slice(1)
        }
        cwx.reLaunch({
          url: "/" + targetUrl.trim(),
          success: function (res) {

          },
          fail: function (e) {
            cb && cb();
          }
        });
      }
    } else {
      cb && cb();
    }
  },

  /** 回到H5活动页-如果匹配失败，就默认返回 首页 */
  backWebAct() {
    const { pageOption } = this.data;
    const jump = decodeURIComponent(pageOption.jumpUrl) || decodeURIComponent(pageConfig.backJumpUrl) || '';
    console.log('回退地址', jump)
    if (!jump) return;
    this.goTargetUrl(jump, () => {
      cwx.redirectTo({
        url: jump,
        fail: () => {
          cwx.switchTab({
            url: jump,
            fail: () => {
              wx.navigateBack({
                fail: () => {
                  wx.switchTab({
                    url: '/pages/home/homepage',
                  })
                }
              })
            }
          })
        }
      })
    })
    this.logTrace('jumpUrl', jump || '');
  },

  /** 拿到参数后请求视频号数据 */
  async getVideoList(options) {
    console.log('页面请求的参数', options)
    const { pageConfig } = this.data
    if (options.feedId) {
      feedIdList = options.feedId.split(',')
    }
    let params = {}
    let res = []
    if (options.feedId) params.feedId = options.feedId.split(',');
    if (options.finderUserName) params.finderUserName = options.finderUserName;
    if (params.finderUserName && params.feedId) {
      const resOne = await this.getVodeoResult({ feedId: params.feedId })
      const resTwo = await this.getVodeoResult({ finderUserName: params.finderUserName })
      if ((options.more && options.more == 'false') || (pageConfig.more || pageConfig.more == 'false')) {
        let filterArr = []
        resTwo.forEach((item) => {
          resOne.forEach((element) => {
            if (item.feedId == element.feedId) {
              filterArr.push(element)
            }
          })
        })
        res = filterArr
      } else {
        let obj = {};
        res = [...resOne, ...resTwo].reduce((cur, next) => {
          obj[next.feedId] ? "" : obj[next.feedId] = true && cur.push(next);
          return cur;
        }, [])
      }
    }
    if (params.finderUserName && !params.feedId) {
      res = await this.getVodeoResult(params)
    }
    if (!params.finderUserName && params.feedId) {
      res = await this.getVodeoResult(params)
    }
    this.setData({
      masonryList: res
    })
    this.logTrace('getVideoList', res || []);
  },

  /** 每个参数查询到的视频号列表数据 */
  async getVodeoResult(params) {
    const { data } = await apiServer('getVideo', params)
    console.log('%c 视频号列表', 'color: red;', data)
    if (data && !data.resultCode) {
      if (data.videoInfoList.length) {
        try {
          let list = data.videoInfoList.map(item => {
            let itemObj = {}
            itemObj.name = item.description
            itemObj.image = item.thumbUrl
            itemObj.createTime = item.createTime
            itemObj.sortTime = utils.utcTimeToStamp(item.createTime)
            itemObj.feedId = item.feedId
            itemObj.finderUserName = item.finderUserName
            return itemObj
          })
          list.sort((a, b) => {
            return b.sortTime - a.sortTime
          })
          return list || []
        } catch (err) {
          console.log('视频号数据报错', err)
        }
      }
      return []
    }
    return []
  },

  /** 查询活动详情 */
  async getActivityConf(id) {
    const { pageOption } = this.data
    const { data } = await apiServer('getActivityConfig', { "activityId": id })
    if (data && !data.errcode) {
      const pageConfig = data.activityCustomfields;
      const authConfig = JSON.parse(data.activityCustomfields.authConfig);
      wx.setNavigationBarTitle({
        title: pageOption.pageTitle || pageConfig.pageTitle || '',
      })
      const visibleBottomButtonList = JSON.parse(pageConfig.bottomMoreButtonVisible || '[]')
      const currBottomVisible = visibleBottomButtonList.includes(pageOption.finderUserName);
      this.setData({
        activityId: id || '',
        pageConfig: pageConfig || {},
        authConfig: authConfig,
        bottomMoreButtonVisible: currBottomVisible
      })
      this.logTrace('getActivityInfo', `页面标题：${pageConfig.pageTitle || ''}`)
    }
  },

  /** 更新视频号的内容 */
  async updateAuth() {
    const { pageOption, pageConfig } = this.data;
    const jumpUrl = `/pages/market/directory/publicauthorize/index?local=videoTaskAuth&activityId=${pageOption.activityId}`
    wx.getSystemInfo().then(res => {
      const SDKVersion = res.SDKVersion || '0';
      if (utils.compareVersion(SDKVersion, '2.21.2') >= 0) {
        wx.navigateTo({
          url: jumpUrl,
          success: () => {
            this.setData({ goUpdateAuth: true })
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '您的微信版本过低，无法参与活动。建议您升级微信版本。',
          showCancel: false,
        })
      }
    })
  },

  /** 刷新请求用户基本信息 */
  async updateUserInfoSuccess() {
    await this.queryUserBaseInfo()
  },

  logTrace(type, config) {
    try {
      const params = {
        "actioncode": type || "o_market_videoTask_dev",
        "actionName": "skyline市场视频号任务页",
        "actionMsg": config || '',
        "openid": cwx.cwx_mkt.openid,
        "PageActivity": this.data.pageConfig.activityId || ''
      }
      this.ubtDevTrace(194579, params);
      this.ubtTrace(201002, params);
    } catch (e) {
      console.log('中转页埋点报错', e)
    }
  }

})
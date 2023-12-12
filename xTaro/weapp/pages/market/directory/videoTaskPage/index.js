import { cwx, CPage, __global, _ } from "../../../../cwx/cwx";
import { apiServer } from "./api"
import {
  backPrevPage,
  judgeProtect,
} from './../mktCommon/utils.js'
let utils = require('../../common/utils.js')

CPage({
  pageId: '10650066338',
  checkPerformance: true,  
  isForceShowAuthorization: true,
  data: {
    isForceShowAuthorization: true,
    pageId: '10650066338',
    allianceid: '',
    sid: '',
    pageConfig: {}, // CMS活动配置信息
    pageOption: {}, // 页面入参
    activityId: '', // 活动ID
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
    hadShowAuthPopup: false, // 本页面是否已经弹窗询问后
    showAuthFloat: false,    // 是否出过基础的隐私弹窗
  },

  /** 先检查登录、然后检查带参、检查活动状态 */
  async onLoad(options) {
    console.clear()
    judgeProtect(() => {
      console.log('已经同意了隐私弹窗')
      this.setData({
        showAuthFloat: true
      })
    }, () => {
      backPrevPage()
    })


    console.log('%c当前页的页面参数(未处理前):', 'color: orange', options)
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
  },

  async queryUserBaseInfo() {
    const params = { tpye: "uid" }
    const { data } = await apiServer('getMemberInfo', params)
    if (data && data.statusCode == 200) {
      const { result } = data;
      // console.log('查询用户的基本信息', result)
      if (result && result.nickName) {
        this.checkUserStatus(result);
        if (result.nickName != "微信用户") {
          this.setData({
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
    try {
      const that = this;
      const { pageOption, pageConfig, masonryList } = this.data;
      const currId = masonryList.find(item => item.finderUserName === pageOption.finderUserName)
      const currFinderUserName = currId ? currId.finderUserName : masonryList[0].finderUserName;
      // console.log('点击跳转更多视频号主页', currId);

      wx.getSystemInfo().then(res => {
        const SDKVersion = res.SDKVersion || '0';
        if (utils.compareVersion(SDKVersion, '2.21.2') >= 0) {
          wx.openChannelsUserProfile({
            finderUserName: currFinderUserName,
            fail(error){
              // 不是同一主体的错误码是 1416103 
              // console.log('底部跳转报错了', error)
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

  /** 打开授权弹窗 */
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
    }, 1200)
  },

  /** 查看当前基础库版本 */
  checkMiniAppVersion() {
    try {
      wx.getSystemInfo().then(res => {
        const SDKVersion = res.SDKVersion || '0'
        console.log('查看当前基础库版本', SDKVersion,  utils.compareVersion(SDKVersion, '2.25.2') >= 0)
        if (utils.compareVersion(SDKVersion, '2.25.2') >= 0) {
          console.log('查看当前基础库版本 当前版本可以使用 channel-video', SDKVersion)
          this.setData({
            wxsdkVersionFlag: true
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
    const { hadShowAuthPopup, showAuthFloat } = that.data;
    const currVideoLocal = wx.getStorageSync('videoTaskAuth');
    const currTime = utils.nowTimeStemp('number', 0);
    const timeDiff = currTime - ((currVideoLocal && currVideoLocal.updateTime) || 0);
    const timeDiffCount = timeDiff - (1000 * 60 * 60 * 24 * 14) > 0 ? true : false;

    // console.log('是否存在缓存', currVideoLocal, hadShowAuthPopup)
    if (!currVideoLocal || timeDiffCount) {
      if(!hadShowAuthPopup) {
        console.log('检查基础的隐私弹窗', showAuthFloat)
        if (showAuthFloat) {
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
          this.setData({
            hadShowAuthPopup: true
          })
          wx.setStorageSync('videoTaskAuth', {
            "avatarUrl": result?.headImage,
            "nickName": result?.nickName,
            "updateTime": currTime
          })
        }
      }
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
          url: "/" + targetUrl.trim()
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
    this.goTargetUrl(jump)
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
      // console.log('去重前', [...resOne, ...resTwo])
      if ((options.more && options.more == 'false') || (pageConfig.more || pageConfig.more == 'false')) {
        let filterArr = []
        resTwo.forEach((item) => {
          resOne.forEach((element) => {
            if (item.feedId == element.feedId) {
              filterArr.push(element)
            }
          })
        })
        // console.log('筛选后的数据', filterArr)
        res = filterArr
      } else {
        let obj = {};
        res = [...resOne, ...resTwo].reduce((cur, next) => {
          obj[next.feedId] ? "" : obj[next.feedId] = true && cur.push(next);
          return cur;
        }, [])
        // console.log('去重后', res)
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
    if (!data.resultCode) {
      try {
        if (data.videoInfoList && data.videoInfoList.length) {
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
            // console.log('排序后', list)
            return list || []
        
        }
      } catch (err) {
        console.log('视频号数据报错', err)
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
      console.log('--- 查询活动详情 --- ', pageConfig)
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
    wx.getSystemInfo().then(res => {
      const SDKVersion = res.SDKVersion || '0';
      if (utils.compareVersion(SDKVersion, '2.21.2') >= 0) {
        if (!pageConfig.authInfoType || (pageConfig.authInfoType == "2")) {
          this.setData({
            showAuthorizePopupFlag: true
          })
        } else {
          cwx.navigateTo({
            url: `/pages/market/directory/publicauthorize/index?local=videoTaskAuth&activityId=${pageOption.activityId}`,
            success: () => {
              this.setData({ goUpdateAuth: true })
            }
          })
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '您的微信版本过低，无法参与活动。建议您升级微信版本。',
          showCancel: false,
          complete: (res) => {}
        })
      }
    })
  },

  /** 刷新请求用户基本信息 */
  async updateUserInfoSuccess() {
    await this.queryUserBaseInfo()
  },

  /** 埋点 */
  logTrace(type, config) {
    try {
      const params = {
        "actioncode": type || "o_market_videoTask_dev",
        "actionName": "市场视频号任务页",
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
import {
  cwx,
  CPage,
  __global,
  _
} from "../../../../cwx/cwx";
import {
  apiServer,
  isInQQ
} from "./api"
import {
  backPrevPage,
  judgeProtect,
} from './../mktCommon/utils.js'
let utils = require('../../common/utils.js')
let Picture = require('../mktCommon/picture.js')
let context;
/** 创建激励广告ID */
let videoParams = null

CPage({
  pageId: '10650061670',
  checkPerformance: true,
  isForceShowAuthorization: true,
  data: {
    isForceShowAuthorization: true,
    allianceid: '',
    sid: '',
    pageId: '10650061670', // 页面ID
    scribeTempList: [], // 订阅消息
    scribeStatus: 0, // 检查之前是否订阅过此页面   // 2022年3月25日晚19点，根据要求 默认不请求查询订阅状态
    userInfo: null, // 用户的基本信息
    maskType: 0, // 弹窗遮罩，0是不显示
    shareType: '', // 分享模式
    pageBottomShareType: '', // 底部分享方式
    pageConfig: {}, // CMS活动配置信息
    pageOption: {}, // 页面入参
    activityId: '', // 活动ID
    posterImg: '', // 需要保存的分享海报

    posterHeight: '', // 海报页的高度
    rotate: 1, // rotate指数
    rotateTop: 1206, // 按钮距离

    ad: '', // 广告激励的ID
    adParams: null, // 激励广告入参
    adTask: [0, 0], // 当前激励广告的任务是 0/0
    taskStatus: false, // E模式下订阅任务，状态

    qrcodeSchema: [0, 0, 200], // 太阳码配置 x坐标、y坐标、宽高
    userAvatar: [0, 0, 200], // 用户头像配置 x坐标、y坐标、宽高
    userName: [0, 0, 24, '#000000', 18], // 用户昵称配置 x坐标、y坐标、字体大小、字体颜色、溢出字符的最大长度
    downmedia: {        // 下载的视频尺寸
      show: false,
      height: 450
    },
    btnPicTop: 1026, // 按钮距离顶部的距离


  },

  /** 先检查登录、然后检查带参、检查活动状态 */
  async onLoad(options) {
    console.clear()
    console.log('%c当前页的页面参数(未处理前):', 'color: orange', options)
    utils.getOpenid(async () => {
      this.setData({
        pageOption: options
      })
      await this.checkLogin()
      await this.getSystemInfo()
      this.filterPageOptions(options)
      this.setEnv()
      this.setMenu()
      this.logTrace('onLoad', options || '')
    })

    judgeProtect(() => {
        
    }, () => {
      backPrevPage()
    })
  },

  /** 判断toUrl跳转 */
  toUrl() {
    const {
      pageOption,
      pageConfig
    } = this.data
    const urlOption = decodeURIComponent(pageOption.toUrl || pageConfig.toUrl || '')
    if (urlOption) {
      console.log('decodeURIComponent后的跳转地址', urlOption)
      this.goTargetUrl(urlOption, () => {
        cwx.switchTab({
          url: `/pages/home/homepage`
        })
      })
    }
  },
  // F 跳转
  async customJump() {
    const {
      pageOption,
      pageConfig
    } = this.data
    let toUrl = pageOption.toUrl || pageConfig.toUrl || ''
    toUrl = await this.resolveThirdJump(toUrl)
    const urlOption = decodeURIComponent(toUrl)
    if (urlOption) {
      console.log('decodeURIComponent后的跳转地址', urlOption)
      this.goTargetUrl(urlOption, () => {
        cwx.switchTab({
          url: `/pages/home/homepage`
        })
      })
    }
  },

  async resolveThirdJump(toUrl) {
    const {
      pageOption,
      pageConfig
    } = this.data
    const {
      taskId
    } = pageConfig
    if (taskId) {
      try {
        let res = await apiServer('taskAssistant', {
          businessType: 'TASK_SERIAL_NUMBER_AND_OPEN_ID',
          paramMap: {
            taskId
          }
        })
        let taskunion = res.data.dataMap.taskunion
        let openid = res.data.dataMap.openid

        let params = {
          ...this.data.pageOption
        }
        delete params.activityId
        delete params.innerouid
        delete params.innersid
        delete params.loginToken

        if (taskunion && taskunion != 'undefined') {
          params.taskunion = taskunion
        }
        if (openid && openid != 'undefined') {
          params.openid = openid
        }
        toUrl = buildUrl(toUrl, params)
      } catch (error) {
        console.log(error)
      }
    } else {
      let {
        taskunion,
        openid
      } = pageOption
      if (taskunion) {
        toUrl += `&taskunion=${pageOption.taskunion}`
      }
      if (openid) {
        toUrl += `&openid=${pageOption.openid}`
      }
    }
    return toUrl
  },

  /** 页面参数的处理 */
  async filterPageOptions(options) {
    if (!options) return;
    try {
      Object.keys(options).forEach((item) => {
        if (['pageTitle'].includes(item)) {
          wx.setNavigationBarTitle({
            title: decodeURIComponent(options[item]) || ''
          });
        }
        if (['posterBgImg', 'shareBg', 'bgdPic', 'btnPic', 'sharePath', 'jumpBack', 'nickImage', 'otherContent', 'subscribeCallBack'].includes(item)) {
          options[item] = decodeURIComponent(options[item]) || '';
        }
        if (['taskProcess', 'templateID'].includes(item)) {
          options[item] = options[item].split(',') || [];
        }
        if (['templateID'].includes(item)) {
          this.getScribeStstus()
        }
        if (['ad'].includes(item)) {
          const demoEle = {
            customcode: options.ad,
            aim: 5,
            demandid: 69,
            progress: 2,
            taskId: options.taskId || '',
            type: 5,
            viewtime: 0,
            url: options.jumpBack || ''
          }
          const adParams = this.createVideoAd(demoEle.customcode, demoEle.demandId, demoEle.taskId, this)
          this.setData({
            adParams
          })
        }
        if (['activityId'].includes(item)) {
          this.getActivityInfo(options[item])
        }
      });
      console.log('%c当前页的页面参数过滤后:', 'color: orange', options)
      this.setData({
        pageOption: options || {}, // 将处理后的页面options存起来
        adTask: options.taskProcess, // 完成數/目標數 
        shareType: options.pageFunction || '', // 页面功能
        pageBottomShareType: options.shareType || '', // 底部分享方式
        scribeTempList: options.templateID || [], // 解析后的订阅模板
        btnPicTop: options.btnPicTop || 1026, // 按钮距离顶部的高度
        'userInfo.nickName': options.userName || '', // 用户昵称
        'userInfo.nickImage': options.userAvatar || '' // 用户头像
      })
      // console.log('当前页面功能', this.data.shareType, '当前页面的分享方式', this.data.pageBottomShareType)
    } catch (error) {
      console.log('页面参数有误')
    }
  },

  setEnv() {
    try {
      let toUrl = this.data.pageOption?.sharePath || this.data.pageConfig?.sharePath || ''
      toUrl = decodeURIComponent(toUrl)
      this.miniEnv = isInQQ({
        from: toUrl,
        isInQQApp: this.data.pageOption?.isInQQApp
      }) ? 'qq' : 'wx'
      console.log('this.miniEnv=====', this.miniEnv)
    } catch (error) {}
  },

  // qq不隐藏右上角分享
  setMenu() {
    if (this.miniEnv === 'qq') {} else {
      wx.hideShareMenu()
    }
  },

  /** 激励广告拉起失败后会重试 */
  openAdVideo(videoAd) {
    this.logTrace('videoAd.show')
    videoAd.show()
      .then(() => {
        this.logTrace('videoAd.show success')
      })
      .catch((err) => {
        this.logTrace('videoAd.show error', err)
        videoAd.load()
          .then(() => {
            videoAd.show().then(() => {})
          })
          .catch(() => {})
      })
  },

  /** 防抖函数执行观看激励广告-间隔1秒 */
  // debounceOpenAd: utils.debounceFunc(async function () {
  //   if (this.data.adParams) {
  //     this.openAdVideo(this.data.adParams);
  //   }
  // }, 1000),
  debounceOpenAd: async function () {
    if (this.isOpenAding) return
    console.log('触发')
    this.logTrace('openad', `打开${this.data.pageOption.ad}`)
    this.isOpenAding = true
    if (this.data.adParams) {
      this.openAdVideo(this.data.adParams);
    }
    setTimeout(() => {
      this.isOpenAding = false
    }, 1000)
  },

  /** 根据完成激励广告的情况，更新任务目标和回调 */
  getTaskStatus(videoAd, res = '') {
    const {
      adTask
    } = this.data;
    if (videoAd == 'onClose' && res == true) {
      let molecular = adTask[0] * 1,
        denominator = adTask[1] * 1;
      if (molecular < denominator) molecular += 1;
      this.setData({
        adTask: [molecular * 1, denominator * 1]
      })
    } else {
      console.log('不重新计算完成次数，刚刚激励广告没完成')
    }
    return;
  },

  /** 回到H5活动页-如果匹配失败，就默认返回 首页 */
  backWebAct() {
    const {
      pageOption,
      shareType
    } = this.data;
    console.log(shareType, '当前活动的返回值', pageOption.jumpBack)
    if (shareType == 'D' || shareType == 'E' || shareType == 'F') {
      this.goTargetUrl(pageOption.jumpBack, () => {
        cwx.switchTab({
          url: pageOption.jumpBack,
          fail: () => {
            cwx.navigateBack({
              delta: 1,
              fail() {
                cwx.switchTab({
                  url: `/pages/home/homepage`,
                })
              }
            })
          }
        })
      })
    } else {
      cwx.navigateBack()
    }
  },

  /** 跳转方法 */
  goTargetUrl(targetUrl, cb) {
    const that = this;
    if (targetUrl) {
      if (targetUrl.indexOf('thirdAppId') > 0) {
        targetUrl = targetUrl.match(/^\//) ? targetUrl : `/${targetUrl}`
        console.log('跳转第三方小程序APPID', utils.getUrlQuery(targetUrl, 'thirdAppId'))
        console.log('跳转第三方小程序路径', targetUrl.trim())
        wx.navigateToMiniProgram({
          appId: utils.getUrlQuery(targetUrl, 'thirdAppId'),
          path: targetUrl.trim(),
          extraData: {},
          success(res) {
            // 第三方跳转，通知任务完成
            that.handleUserTask()
            try {
              that.logPrdTrace('goTargetUrl', '跳转第三方小程序', utils.getUrlQuery(targetUrl, 'thirdAppId'), targetUrl.trim(), 'success')
            } catch {}

          },
          fail() {
            try {
              that.logPrdTrace('goTargetUrl', '跳转第三方小程序', utils.getUrlQuery(targetUrl, 'thirdAppId'), targetUrl.trim(), 'fail')
            } catch {}

          }
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
        cwx.navigateTo({
          url: "/" + targetUrl.trim(),
          success: function (res) {
            res.eventChannel.emit('taskpage', {
              from: 'tasklist'
            })
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

  /** 初始化激励广告组件 */
  createVideoAd(_adUnitId, _demandId, _taskId, _context) {
    videoParams = {
      adUnitId: _adUnitId,
      demandId: _demandId,
      taskId: _taskId,
      context: _context
    }
    const {
      demandId,
      taskId,
      context
    } = videoParams
    let videoAd = context.videoAd;
    if (videoAd) return videoAd;
    if (wx.createRewardedVideoAd) {
      context.videoAd = wx.createRewardedVideoAd({
        adUnitId: videoParams.adUnitId
      })
      videoAd = context.videoAd;
      videoAd.onLoad(() => {
        console.log('广告 启动成功', )
        this.logTrace('videoAd.success')
      })
      videoAd.onError((error) => {
        console.log('广告 启动失败', error)
        this.logTrace('videoAd.error', error)
      })
      videoAd.onClose(res => {
        if (res && res.isEnded) {
          console.log('播放完成后 退出')
          this.handleUserTask()
        } else {
          this.getTaskStatus('onClose', false)
          console.log('中途 退出')
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    return videoAd;
  },

  /** 执行完成任务的接口，同步更新用户任务状态 */
  async handleUserTask() {
    const {
      pageOption,
      taskStatus,
      pageConfig,
      shareType
    } = this.data
    const res = await apiServer('userTodoTask', {
      channelCode: pageOption.channelCode || '',
      taskId: pageOption.taskId || pageConfig.taskId || '',
      status: 1,
      done: 1
    })
    if (res && res.errMsg == 'request:ok') {
      if (shareType == 'E') {
        this.setData({
          taskStatus: true
        })
      } else if (shareType == 'D') {
        this.getTaskStatus('onClose', true)
      }
    }
  },

  /** 获取用户设备信息 */
  getSystemInfo() {
    wx.getSystemInfo({
      success: (result) => {
        this.setData({
          posterHeight: result.windowWidth * 1.779, // 1334%750约等于1.779
          rotate: (result.windowWidth / 750) * 1, // 页面单位比
          rotateTop: (1206 / 750) * result.windowWidth, // button按钮距离顶部高度
        })
        console.log('页面的rotate比例', this.data.rotate)
      },
    })
  },

  /** 每次onShow都检查活动时间 */
  async onShow() {
    // wx.hideShareMenu()
    // this.logTrace('onShow', '')
  },

  /** 页面切走时-需要考虑要不要卸载弹窗和组件 */
  onHide() {},

  /** 查询活动详情 */
  async getActivityInfo(id) {
    const {
      pageOption
    } = this.data
    const {
      data
    } = await apiServer('getActivityConfig', {
      "activityId": id
    })
    if (data && !data.errcode) {
      let pageConfig = this.filterActivityInfo(data)
      console.log('--- 查询活动详情 --- ', pageConfig)
      if (pageOption.bgdPic) pageConfig.bgdPic = pageOption.bgdPic;
      if (pageOption.btnPic) pageConfig.btnPic = pageOption.btnPic;
      if (pageOption.btnPicTop) pageConfig.btnPicTop = pageOption.btnPicTop;
      if (!pageOption.pageTitle) {
        wx.setNavigationBarTitle({
          title: pageConfig.pageTitle || ''
        }); // 手动设置页面标题
      }
      this.setData({
        activityId: id || '',
        pageConfig: pageConfig || {},
        shareType: pageOption.pageFunction || pageConfig.pageFunction || '', // 页面功能
        pageBottomShareType: pageOption.shareType || pageConfig.shareType || '', // 底部分享方式
        scribeTempList: pageOption.templateID || (pageConfig.templateID || []),
        btnPicTop: pageOption.btnPicTop || (pageConfig.btnPicTop || 1026),
      })
      this.getScribeStstus()
      this.logTrace('getActivityInfo', `页面标题：${pageConfig.pageTitle || ''}`)
    }
  },

  /** 处理活动数据 - 包括时间处理-抛出有效信息 */
  filterActivityInfo(data) {
    if (data) {
      let activitlyConfig = data.activitlyConfig || {},
        customerInfo = data.activityCustomfields || {},
        pageConfig;
      activitlyConfig.startTime = this.iosDateToUtc(activitlyConfig.startTime) || '';
      activitlyConfig.endTime = this.iosDateToUtc(activitlyConfig.endTime) || '';
      customerInfo.templateID = (customerInfo.templateID && customerInfo.templateID.split(',')) || []
      pageConfig = Object.assign({
        activityId: activitlyConfig.activityId || '',
        startTime: activitlyConfig.startTime || '',
        endTime: activitlyConfig.endTime || '',
      }, customerInfo)
      return pageConfig
    }
  },

  /** 时间转格式 */
  iosDateToUtc(data) {
    return JSON.parse(
      JSON.stringify(data).replace(/\/Date\(\-?(\d+)(?:\-|\+)(?:\d+)\)\//g, function () {
        return new Date(Number(arguments[1]) + 8 * 3600 * 1000).
        toISOString().replace(/^(.*)T(.*)\.\d+Z$/, '$1 $2')
      })
    )
  },

  /** 检查登录状态 */
  async checkLogin() {
    cwx.user.wxLogin(() => {})
    cwx.user.checkLoginStatusFromServer(checkLoginRes => {
      console.log('当前用户有没有登录', checkLoginRes)
      this.setData({
        'userInfo.isLogin': checkLoginRes
      });
      this.logTrace('checkLogin', checkLoginRes || '')
    });
  },

  /** 检查当前订阅状态 */
  getScribeStstus() {
    const {
      scribeTempList,
      pageOption
    } = this.data;

    if (pageOption && pageOption.checkScribeStatus && pageOption.checkScribeStatus == "true" && scribeTempList.length) {
      cwx.mkt.getSubscribeMsgInfo(scribeTempList, (data) => {
        this.setData({
          scribeStatus: (data.templateSubscribeStateInfos && data.templateSubscribeStateInfos[0].subscribeState) || 0
        })
        this.logTrace('getScribeStatus', (data && data.templateSubscribeStateInfos) || [])
      }, (err) => {
        console.log('订阅状态fail===', err)
      })
    }
  },

  /** 点击了页面按钮 - 触发判断 裂变、分享、裂变+分享 */
  async start() {
    const {
      shareType,
      pageBottomShareType
    } = this.data
    this.logTrace('start', shareType || '')

    switch (shareType) {
      case "A":
        this.showSharePanel()
        break;
      case "B":
        this.openScribe()
        break;
      case "C":
        this.openScribe()
        break;
      case "D":
        this.debounceOpenAd()
      case "E":
        this.openScribe()
      default:
        break;
    }
  },

  /** 预览海报 */
  async previewPoster() {
    this.requestQrcode()
  },

  /** 分享配置,当flag为false时不可分享 */
  onShareAppMessage(e) {
    const {
      pageConfig,
      pageOption
    } = this.data;
    let _title = pageOption.shareTitle || pageConfig.shareTitle || '',
      _path = pageOption.sharePath || pageConfig.sharePath || '',
      _imageUrl = pageOption.shareBg || pageConfig.sharePic || '';
    this.logTrace('onShareAppMessage', '点击分享按钮');
    console.log('分享信息', {
      _title,
      _path,
      _imageUrl
    })
    if (this.miniEnv === 'qq') {
      // QQ 环境
      // 执行关闭逻辑是为了兼容ios上 card图读取不到的问题
      this.setData({
        maskType: '',
      })
    }
    return {
      title: _title,
      path: _path,
      imageUrl: _imageUrl
    }
  },

  showSharePanel() {
    if (this.miniEnv === 'qq') {
      // QQ 环境
      this.setData({
        maskType: 2,
      })
    } else {
      this.setData({
        maskType: 1
      })
    }
  },

  /** 打开订阅 */
  async openScribe() {
    let {
      pageOption,
      shareType,
      scribeTempList,
      scribeStatus
    } = this.data;
    // 新活动通知=2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk
    // 签到提醒通知=1a2RJa0mpegB8ozSeJFj0gT3CL-tLFi7SObXnZuv6eg
    scribeTempList = [
      ...scribeTempList,
      '2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk',
      '1a2RJa0mpegB8ozSeJFj0gT3CL-tLFi7SObXnZuv6eg'
    ]
    scribeTempList = uniqueArr(scribeTempList)
    this.logTrace('查看订阅状态', {
      scribeStatus,
      scribeTempList
    })
    console.log('查看订阅状态', scribeStatus, scribeTempList)
    if (scribeStatus && shareType !== 'E') {
      if (shareType == 'B') {
        wx.showToast({
          title: '您已订阅',
          icon: 'none',
          mask: true
        })
      }
      if (shareType == 'C') {
        this.showSharePanel()
      }
    } else {
      if (scribeTempList.length) {
        cwx.mkt.subscribeMsg(scribeTempList, (data) => {
          if (data && data.templateSubscribeStateInfos) {
            console.log('-------------订阅消息点击 允许--------------------', data);
            wx.showToast({
              title: '订阅成功',
              icon: 'success',
              mask: true
            })
            if (pageOption.subscribeCallBack) {
              this.afterSubscribeCallBack(pageOption.subscribeCallBack)
            }
            if (shareType == 'E') {
              this.handleUserTask()
            }
          } else {
            console.log('-------------订阅消息点击 取消---------------------', data);
            cwx.mkt.getSubscribeMsgInfo(scribeTempList, () => {
              if (shareType == 'E') {
                // 路径中带有取消检查订阅状态的参数 就不再做检查
                if (!pageOption.cancelCheckSubStatus) {
                  this.handleUserTask()
                }
              }
            }, (error) => {
              console.log('订阅状态fail===', error)
            })
          }

          if (shareType == 'C') {
            this.showSharePanel()
          }
          this.getScribeStstus()
        }, (err) => {
          if (shareType == 'C') {
            this.showSharePanel()
          }
        })
      } else {
        console.log('订阅模板ID为空数组')
        if (shareType == 'C') {
          this.showSharePanel()
        }
      }
    }
    // 20220421 发布新增逻辑 - 检查设置页是否关闭了订阅提醒
    this.checkUserScribeSetting(scribeTempList)
    this.logTrace('openSctibe', scribeTempList || '')
  },

  /** 订阅成功后的回调 */
  afterSubscribeCallBack(callbackUrl) {
    try {
      setTimeout(() => {
        this.goTargetUrl(callbackUrl)
      }, 1000)
    } catch (error) {}
  },

  /** 检查用户的设置页的订阅开关 */
  checkUserScribeSetting(scribeTempList) {
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        console.log('订阅通知设置:', res.subscriptionsSetting)
        if (res.subscriptionsSetting && res.subscriptionsSetting.mainSwitch == false) {
          wx.showModal({
            title: '提示',
            content: '检测到没有开启订阅消息的权限，是否去开启',
            success: function (stRes) {
              if (stRes.confirm) {
                wx.openSetting({
                  success(res) {
                    console.log('设置权限完成');
                  },
                });
              }
            },
          });
        } else {
          if (res.subscriptionsSetting.itemSettings && scribeTempList.length) {
            const isReject = scribeTempList.filter(item => {
              return res.subscriptionsSetting.itemSettings[item] == 'reject'
            })
            if (isReject.length) {
              wx.showModal({
                title: '提示',
                content: '检测到没有开启本订阅消息的权限，是否去开启',
                success: function (stRes) {
                  if (stRes.confirm) {
                    wx.openSetting({
                      success(res) {
                        console.log('设置权限完成');
                      },
                    });
                  }
                },
              });
            }

          }
        }
      }
    })
  },

  /** 切换类型 */
  changeMaskType(e) {
    const {
      status
    } = e.currentTarget.dataset;
    const {
      maskType
    } = this.data;
    if (maskType != status) {
      this.setData({
        maskType: status * 1
      })
    }
  },

  /** 打开海报 */
  openPoster() {
    this.requestQrcode()
  },

  /** 请求小程序太阳码 */
  requestQrcode() {
    const that = this
    const {
      allianceid,
      sid,
      pageOption
    } = this.data
    wx.showLoading({
      title: '正在生成海报',
      mask: true
    })
    let qrCodeParams = {}
    qrCodeParams = {
      "appId": cwx.appId || '',
      "buType": "mkt",
      "page": "pages/market/midpage/midpage",
      "aid": allianceid || '',
      "sid": sid || '',
      "pathName": "relayPage",
      "centerUrl": 'centerUrl',
      "fromId": `${this.pageId}` || '10650061670',
      "needData": false,
      "autoColor": false,
      "lineColor": {
        "r": "0",
        "g": "0",
        "b": "0"
      }
    }
    console.log('分享路径是', pageOption.sharePath || '')
    qrCodeParams['path'] = pageOption.sharePath || '';
    try {
      cwx.request({
        url: "/restapi/soa2/13242/getWxqrCode",
        data: qrCodeParams,
        success: (res) => {
          if (res && res.data && res.data.errcode === 0) {
            if (pageOption.activityId) {
              let imgUrl = `${__global.env == 'fat' ? 'https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2' : 'https://m.ctrip.com/restapi/soa2'}/22559/relayPagePoster?sharePath=${res.data.qrUrl || ''}&activityId=${pageOption.activityId || ''}&avatarUrl=${pageOption.userAvatar || ''}&nickName=${pageOption.userName || ''}&posterBgImg=${encodeURIComponent(pageOption.posterBgImg || '')}`

              try {
                if (pageOption.queryQrCodeSize) imgUrl = `${imgUrl}&queryQrCodeSize=${pageOption.queryQrCodeSize || ''}`;
                if (pageOption.queryQrCodeCoordinate) imgUrl = `${imgUrl}&queryQrCodeCoordinate=${pageOption.queryQrCodeCoordinate || ''}`;
                if (pageOption.queryHeadSize) imgUrl = `${imgUrl}&queryHeadSize=${pageOption.queryHeadSize || ''}`;
                if (pageOption.queryHeadCoordinate) imgUrl = `${imgUrl}&queryHeadCoordinate=${pageOption.queryHeadCoordinate || ''}`;
                if (pageOption.queryNicknameSize) imgUrl = `${imgUrl}&queryNicknameSize=${pageOption.queryNicknameSize || ''}`;
                if (pageOption.queryNicknameCoordinate) imgUrl = `${imgUrl}&queryNicknameCoordinate=${pageOption.queryNicknameCoordinate || ''}`;
                if (pageOption.otherContent) imgUrl = `${imgUrl}&otherContent=${encodeURIComponent(pageOption.otherContent) || ''}`;
                if (pageOption.contentModule) imgUrl = `${imgUrl}&contentModule=${pageOption.contentModule || ''}`;
              } catch (error) {
                imgUrl = `${__global.env == 'fat' ? 'https://gateway.m.fws.qa.nt.ctripcorp.com/restapi/soa2' : 'https://m.ctrip.com/restapi/soa2'}/22559/relayPagePoster?sharePath=${res.data.qrUrl || ''}&activityId=${pageOption.activityId || ''}&avatarUrl=${pageOption.userAvatar || ''}&nickName=${pageOption.userName || ''}&posterBgImg=${encodeURIComponent(pageOption.posterBgImg || '')}`
              }

              console.log('当前海报地址', imgUrl)
              that.setData({
                posterImg: imgUrl,
              }, () => {
                wx.hideLoading()
                wx.previewImage({
                  urls: [that.data.posterImg],
                })
                that.logTrace('getServerPoster', imgUrl || '')
              })
            } else {
              // that.generateWinPoster(res.data.qrUrl)
            }
            that.logTrace('getQrCodeSuccess', res || '')
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '图片小哥跑偏了，再重试下吧',
              icon: 'none',
              mask: true
            })
            that.logTrace('getQrCodeFail', res || '')
          }
        },
        fail: function (e) {
          wx.hideLoading();
          wx.showToast({
            title: '图片小哥跑偏了，再重试下吧',
            icon: 'none',
            mask: true
          })
          that.logTrace('getQrCodeFail', e || '')
        }
      })
    } catch (error) {
      wx.showToast({
        title: '图片小哥跑偏了，再重试下吧',
        icon: 'none',
        mask: true
      })
    }
  },


  /** 埋点 */
  logTrace(type, config) {
    try {
      this.ubtDevTrace(194579, {
        "actioncode": type || "o_market_relayPage_dev",
        "actionName": "市场裂变活动中转页",
        "actionMsg": config || '',
        "openid": cwx.cwx_mkt.openid,
        "PageActivity": this.data.pageConfig.activityId || ''
      });
    } catch (e) {
      console.log('中转页埋点报错', e)
    }
  },
  /** 临时新增 中转页的生产埋点 */
  logPrdTrace(type, config, appid, path, urlStatus) {
    try {
      const params = {
        "keyName": "mkt_task_commercialize",
        "actioncode": type || "mkt_task_commercialize",
        "actionName": "市场裂变活动中转页",
        "actionMsg": config || '',
        "appid": appid || "",
        "path": path || "",
        "urlStatus": urlStatus || '',
        "openid": cwx.cwx_mkt.openid,
        "PageActivity": this.data.pageConfig.activityId || ''
      }
      console.log('记录埋点', params)
      this.ubtTrace(199610, params);
    } catch (e) {
      console.log('中转页埋点报错', e)
    }
  },
  /** 加载视频 */
  loadVideo(event) {
    const { width, height } = event.detail
    this.setData({
      "downmedia.show": true,
      "downmedia.height": (750 / height) * width,
    })
  },
  /** 保存文件 */
  saveFile() {
    const { pageOption } = this.data;
    wx.showLoading({ title: '正在下载', mask: true })
    const assets = {
      url: pageOption.downposter || pageOption.downvideo,
      type: pageOption.downposter ? "image": "video"
    }
    wx.downloadFile({
      url: assets.url,
      success(res) {
        if (res.statusCode === 200) {
          if(assets.type === "image") {
            wx.saveImageToPhotosAlbum({
              filePath:  res.tempFilePath,
              success: (downRes) => {
                console.log('下载成功', downRes)
                wx.hideLoading()
                wx.showToast({ icon: 'success', title: '下载成功' })
              },
              fail: (err) => {
                console.log('下载失败的原因', err)
                wx.hideLoading()
                if (err.errMsg == "saveImageToPhotosAlbum:fail cancel") {
                  // 用户取消
                } else {
                  wx.showToast({ icon: 'error', title: '下载失败' })
                }
              }
            })
          } else {
            wx.saveVideoToPhotosAlbum({
              filePath:  res.tempFilePath,
              success: (downRes) => {
                console.log('下载成功', downRes)
                wx.hideLoading()
                wx.showToast({ icon: 'success', title: '下载成功' })
              },
              fail: (err) => {
                console.log('下载失败的原因', err)
                wx.hideLoading()
                wx.showToast({ icon: 'error', title: '下载失败' })
              }
            })
          }
        }
      }
    })
  },
  /** 预览图片 */
  preQrcode() {
    const { pageOption } = this.data
    wx.previewImage({
      urls: [pageOption.downposter],
      success: () => { },
      fail: () => { },
      complete: () => { }
    })
  },


})

function uniqueArr(arr) {
  return Array.from(new Set(arr))
}

function buildUrl(url, queryConfig) {
  if (!url) return ''

  const pageUrl = url.split('?')[0]
  let paramsStr = url.split('?')[1]
  let params = {}
  if (paramsStr) {
    let paramsArr = paramsStr.split('&')
    paramsArr.forEach((item) => {
      let key = item.split('=')[0]
      let value = item.split('=')[1]
      params[key] = value
    })
  }
  params = {
    ...params,
    ...queryConfig
  }
  return genUrl(pageUrl, params)
}

function genUrl(url, params) {
  let ret = url

  let keys = Object.keys(params)
  keys = keys.filter(key => {
    if (params[key] == '' || params[key] == 'undefined' || typeof params[key] == 'undefined') {
      return false
    }
    return true
  })
  keys.forEach((key, index) => {
    ret += `${index === 0 ? '?' : '&'}${key}=${params[key]}`
  })
  return ret
}
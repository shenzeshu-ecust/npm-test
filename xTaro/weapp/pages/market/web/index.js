import {
  cwx,
  CPage,
  _,
  __global
} from '../../../cwx/cwx.js';
var utils = require('../common/utils.js');
import {
  requestQrcode,
  thirdTrace,
  isInQQ,
  jumpMpComment,
} from './utils';

CPage({
  pageId: '10650001341',
  loginErrorUrl: '',
  doRefreshWhileBack:false,//返回页面强制刷新
  doShowFirstTime:true,
  loadedUrl:'',
  hideSharePop:false,
  data: {
    url: '',
    isShow: true,
    useMktsocket: false,
    maskType: 0,
    pageBottomShareType: 'C',
    pageOptions: {
      isbackapp: 1,
      hideCollection: "FALSE"
    },
    pageScene: 1000,
  },
  shareData: {
    title: '',
    path: '',
    imageUrl: ''
  },
  miniEnv: 'wx', // wx qq
  mktSocket: null,
  socketDataList: [],
  // this.messageMethod =['initAd','showAd','imptype','unitCode','share','navigateToMiniProgram']
  keywords: ['sourceType', '_miniprogram', 'contentText', 'method', 'data'],
  rewardedVideoAd: null,
  interstitialAd: null,
  timeConnect: 0,
  isDevelop: false,
  sharePosterOptions: {

  },
  webviewAbsolutSubscribe: false,
  onLoad(options) {
    // 设置小程序环境
    this.setMiniEnv(options)
    //开发工具环境下就不使用socket
    const accountInfo = wx.getAccountInfoSync();
    let isDevelop = accountInfo?.miniProgram?.envVersion === 'develop'
    this.isDevelop = isDevelop
    //如果有分享来源页，则加载
    this.setData({
      pageOptions: options,
      pageScene: cwx.scene,
      title: options.title ? decodeURIComponent(options.title) : '携程旅行',
      imageUrl: options.img ? decodeURIComponent(options.img) : ''
    });
    if (options.useMktsocket && options.useMktsocket == 1) {
      this.setData({
        useMktsocket: true
      })
    } else {
      utils.getOpenid(() => {
        this.fetchLimitConfig({
          openId: cwx.cwx_mkt.openid
        }).then(res => {
          if (res.isPass) {
            this.setData({
              useMktsocket: true
            })
            this.create()
          }
        })
      })
    }
    if (typeof options.doRefreshWhileBack !== "undefined") {
      this.doRefreshWhileBack = options.doRefreshWhileBack;
    }
    if (options.from) {
      this.beforeLoadWeb(options.from, options);
      return;
    }
    //否则，加载配置的页面
    var that = this,
      params = {},
      unionData = cwx.mkt.getUnion();
    this.unionData = unionData
    params = {
      "allianceID": String(unionData.allianceid),
      "sID": String(unionData.sid),
      "oUID": String(unionData.ouid),
      "sourceID": String(unionData.sourceid),
      "appID": cwx.appId
    };

    cwx.request({
      data: params,
      url: '/restapi/soa2/12673/getWechatAppWebviewURL',
      success: function (res) {
        if (!res || !res.data || !res.data.webviewURL) {
          that.showError();
          return;
        }

        that.beforeLoadWeb(res.data.webviewURL, options);
      },
      fail: function (e) {
        that.showError();
      }
    });

  },
  beforeLoadWeb(url, options){
    let that=this
    if(cwx.shareTicket && options.checkShareTicket  && wx.authPrivateMessage){
       cwx.cwx_mkt.refreshSessionKey()
        wx.authPrivateMessage({
          shareTicket: cwx.shareTicket,
          success(res) {
            if(res.errMsg=='authPrivateMessage:ok'){
              that.privateData=res
            }
            that.loadWeb(url, options)
            that.ubtTrace(254711, { openId: cwx.cwx_mkt.openid || '', type: 'authPrivateMessage',shareTicket:cwx.shareTicket, res: res});
          },
          fail(res) {
            that.loadWeb(url, options)
            that.ubtTrace(254711, { openId: cwx.cwx_mkt.openid || '', type: 'authPrivateMessage_fail',shareTicket:cwx.shareTicket, res: res});
          }
        })
    }else{
      that.loadWeb(url, options)
    }
  },
  loadWeb(url, options) {
    var that = this,
      newUrl = url;
    console.log('url------', url);
    if (!url) {
      this.showError();
      return;
    }

    utils.getOpenid(function () {
      newUrl = decodeURIComponent(url);
      // 包含addhtml字符串，做以下处理，为了兼容
      const hasAddHtml = newUrl.indexOf('addhtml') > -1
      if (hasAddHtml) {
        do {
          url = newUrl
          newUrl = decodeURIComponent(url);
        } while (newUrl != url)
        const addhtml = utils.getUrlQuery(newUrl, 'addhtml')
        if (addhtml) {
          newUrl = newUrl.replace('?', '.html?')
        }
      }
      // 如果需要隐藏分享，链接上需要携带hideshare=true
      if (newUrl.indexOf('hideshare=true') > 0) {
        wx.hideShareMenu()
      }
      newUrl = that.changeUrlArg(newUrl, 'mpopenid', cwx.cwx_mkt.openid);
      newUrl = that.changeUrlArg(newUrl, 'mpunionid', cwx.cwx_mkt.unionid);
      newUrl = that.changeUrlArg(newUrl, 'popup', 'close');
      newUrl = that.changeUrlArg(newUrl, 'autoawaken', 'close');
      newUrl = that.changeUrlArg(newUrl, 'clientid', cwx.clientID);
      newUrl = that.changeUrlArg(newUrl, 'appid', cwx.appId);
      newUrl = that.changeUrlArg(newUrl, 'ismkt', 'true');
      if(that.privateData){
        newUrl = that.changeUrlArg(newUrl, 'valid', that.privateData.valid);
        newUrl = that.changeUrlArg(newUrl, 'iv', encodeURIComponent(that.privateData.iv||''));
        newUrl = that.changeUrlArg(newUrl, 'encryptedData', encodeURIComponent(that.privateData.encryptedData||''));
      }
      console.log('newUrl------', newUrl);
     
      

      //引入cwebview处理登录逻辑
      let isLogin = options.needLogin && (!options.noForceLogin) ? {} : false;
      if (isLogin) {
        if (options.IsAuthentication) {
          isLogin.IsAuthentication = options.IsAuthentication;
        }
        if (options.showDirectLoginBtn) {
          isLogin.showDirectLoginBtn = options.showDirectLoginBtn;
        }
      }
      cwx.syncLogin.load({
        url: newUrl,
        isLogin,
        loginErrorUrl: newUrl,
        success: function (sucUrl) {
          console.log('success====', sucUrl)
          that.loadedUrl = sucUrl;
          that.setData({
            url: sucUrl
          })
          that.onLoadSuccess(sucUrl);
        },
        fail: function (errorUrl) {
          console.log('fail====', errorUrl)
          that.loadedUrl = errorUrl;
          that.setData({
            url: errorUrl
          })
        }
      })
    })
  },
  // 
  changeUrlArg(url, arg, val) {
    let urlArr = url.split('?');
    let newArgs = '?';
    let hasKey = false; // 是否有匹配的key
  
    // 没参数：url不带?、url带?但后面没值
    if (urlArr.length < 2 || !urlArr[1]) {
      newArgs += arg + '=' + val;
    } else {
      // 过滤 & 后为空的情况
      let argArr = urlArr[1].split('&').filter(item => {
        return item;
      });
  
      let strArr = argArr.map((item, index) => {
        let str = '';
        // let itemArr = item.split('=');
        // let key = itemArr[0] || '';
        // let value = itemArr[1] || '';
        let currIndexFirtEmpty = item.indexOf("=")
        let key = item.substring(0, currIndexFirtEmpty) || '';
        let value = item.substring(currIndexFirtEmpty+1) || '';

        // 过滤 key 为空的
        if (!key) { return; }
        if (key === arg) {
          value = val;
          hasKey = true;
        }
        return str = `${key}=${value}`;
      })
      // 原先的参数里没有要替换的 arg 的
      !hasKey && (strArr.push(`${arg}=${val}`));
      newArgs += strArr.join("&");
    }
    return urlArr[0] + newArgs;
  },
  showError() {
    wx.showModal({
      title: '没有找到页面'
    })
  },
  onShow: function () {
    this.setData({
      isShow: true
    })
    if (this.data.useMktsocket) {
      this.create()
      this.timeConnect = 0
    }
    if (this.doRefreshWhileBack && this.loadedUrl && !this.doShowFirstTime) {
      this.setData({ url: this.loadedUrl });
    }
    this.doShowFirstTime = false;
  },
  //在页面隐藏时
  onHide: function () {
    this.setData({
      isShow: false
    })
    this.isHide = true
    if (this.data.useMktsocket) {
      this.distory()
    }
    if (this.doRefreshWhileBack && this.loadedUrl) {
      this.setData({ url: "" });
    }
  },
  onUnload: function () {
    this.setData({
      isShow: false
    })
    if (this.data.useMktsocket) {
      this.distory()
    }
  },
  /**
   * h5页面加载成功之后的回调
   */
  onLoadSuccess() {
    const pageOptions = this.data.pageOptions
    const wx_pay_id = pageOptions.wx_pay_id
    this.logTrace('wx_pay_id', wx_pay_id)
    if (wx_pay_id) {
      jumpMpComment(this, wx_pay_id)
    }
  },
  fetchLimitConfig(args) {
    return utils.fetch('22559', 'limitFlow', args)
  },
  isJSON(str) {
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str)
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  },
  onOpenMsg(openBack) {
    if (!this.mktSocket) return
    this.mktSocket.onOpen((res) => {
      if (typeof openBack === 'function') {
        openBack(res)
      }
    })
  },
  onClose(closeBack) {
    if (!this.mktSocket) return
    this.mktSocket.onClose((res) => {
      this.mktSocket = null
      if (typeof closeBack === 'function') {
        closeBack(res)
      }
      // 重新连接
      if (this.timeConnect <= 20 && this.data.isShow) {
        this.timeConnect++
        this.create()
      }
    })
  },
  onError(errorBack) {
    if (!this.mktSocket) return
    this.mktSocket.onError((res) => {
      this.mktSocket = null
      if (typeof errorBack === 'function') {
        errorBack(res)
      }
    })
  },
  onMessage(messageBack) {
    if (!this.mktSocket) return
    this.mktSocket.onMessage((data) => {
      // console.log(data,'data')
      // 接受服务器消息-对服务器消息进行甄别
      if (this.isJSON(data.data)) {
        let flag = true
        this.keywords.forEach(item => {
          let reg = new RegExp(item, 'gi')
          if (!reg.test(data.data)) {
            flag = false
          }
        })
        if (flag) { // 符合我们想要的格式
          data.data = JSON.parse(data.data)
          let message = data.data
          // 判断openId是否是一致的
          if (message.sourceType && message.sourceType == cwx.cwx_mkt.openid + '_miniprogram') {
            //广告回调判断
            this.adBriage(message)
            // 分享回调判断
            if (typeof messageBack === 'function') { // 有回调，回调给回调函数
              messageBack(data)
            }
          }
        }
      }
    })
  },
  send(senddata) {
    if (!this.mktSocket) {
      return
    }
    this.mktSocket.send({
      data: senddata
    })
  },
  uniqueSend(sendData) {
    let _tempsendData = {
      sourceType: cwx.cwx_mkt.openid + '_h5',
      contentText: {
        method: sendData['method'],
        imptype: sendData['imptype'],
        data: sendData['data'] || ''
      }
    }
    if (!this.mktSocket) {
      this.socketDataList.push(_tempsendData)
    } else {
      this.socketDataList.push(_tempsendData)
      while (this.socketDataList.length > 0) {
        let last = this.socketDataList.shift()
        this.send(JSON.stringify(last))
      }
    }
  },
  distory() {
    if (!this.mktSocket) {
      return
    }
    this.mktSocket.close && this.mktSocket.close()
    this.mktSocket = null
  },
  adBriage(message) {
    if (message?.contentText?.method == 'initAd') {
      let imptype = message.contentText.imptype || 6
      let adCode = message.contentText.data
      if (!adCode) {
        return false
      }
      adCode = adCode.trim()
      if (imptype == 6) {
        this.loadRewardAd(adCode)
      }
      if (imptype == 2) {
        //初始化插屏广告
        this.loadInterstitialAd(adCode)
      }
    }
    if (message?.contentText?.method == 'showAd') {
      let imptype = message.contentText.imptype || 6
      if (imptype == 6) {
        //展示激励视频广告
        let sendObj = {
          method: 'showAd',
          data: 0, //7广告展示成功 8广告展示失败
          imptype
        }
        this.rewardedVideoAd && this.rewardedVideoAd.show()
          .then(() => {
            sendObj.data = 7
            this.uniqueSend(sendObj)
          })
          .catch(err => {
            sendObj.data = 8
            this.uniqueSend(sendObj)
          })
        this.logTrace('MP-rewardAd', 'receive')
        thirdTrace({
          title: 'mktWebsocket',
          message: 'MP-rewardAd',
          addInfo: {
            action: 'receive'
          }
        })
      }
      if (imptype == 2) {
        //展示插屏广告
        let sendObj = {
          method: 'showAd',
          data: 0, //7广告展示成功 8广告展示失败
          imptype
        }
        this.interstitialAd.show()
          .then(() => {
            sendObj.data = 7
            this.uniqueSend(sendObj)
          })
          .catch(err => {
            sendObj.data = 8
            // console.log(err,'err__')
            this.uniqueSend(sendObj)
          })
        this.logTrace('MP-interstitialAd', 'receive')
        thirdTrace({
          title: 'mktWebsocket',
          message: 'MP-interstitialAd',
          addInfo: {
            action: 'receive'
          }
        })
      }
    }
  },
  loadRewardAd(adCode) {
    let sendObj = {
      'method': 'initAd',
      'data': 2, //1拉取成功  2拉取失败，3广告展示 4广告关闭 5任务完成  6广告未完成
      'imptype': 6
    }
    if (wx.createRewardedVideoAd) {
      this.rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: adCode
      })
      this.rewardedVideoAd.onLoad(() => {
        this.logTrace('rewardedVideoAd onLoad')
        // let _tempObj=JSON.parse(JSON.stringify(sendObj))
        //  _tempObj.data =1
        //   this.uniqueSend(_tempObj)
      })
      this.rewardedVideoAd.onError((err) => {
        let _tempObj2 = JSON.parse(JSON.stringify(sendObj))
        _tempObj2.data = 2
        this.uniqueSend(_tempObj2)
        this.logTrace('rewardedVideoAd onError', err)
      })
      this.rewardedVideoAd.onClose((res) => {
        let _tempObjc = JSON.parse(JSON.stringify(sendObj))
        _tempObjc.data = 4
        this.uniqueSend(_tempObjc)
        this.logTrace('rewardedVideoAd onClose', res)
        if (res && res.isEnded) {
          let _tempObj5 = JSON.parse(JSON.stringify(sendObj))
          _tempObj5.data = 5
          this.uniqueSend(_tempObj5)
        } else {
          let _tempObj6 = JSON.parse(JSON.stringify(sendObj))
          _tempObj6.data = 6
          this.uniqueSend(_tempObj6)
        }
      })
    }
  },
  loadInterstitialAd(adCode) {
    let sendObj = {
      'method': 'initAd',
      'data': 2, //1拉取成功  2拉取失败，3广告展示 4广告关闭 5任务完成  6广告未完成
      'imptype': 2
    }
    if (wx.createInterstitialAd) {
      this.interstitialAd = wx.createInterstitialAd({
        adUnitId: adCode
      })
      this.interstitialAd.onLoad(() => {
        sendObj.data = 1
        this.uniqueSend(sendObj)
        this.logTrace('interstitialAd onLoad')
      })
      this.interstitialAd.onError((err) => {
        sendObj.data = 2
        this.uniqueSend(sendObj)
        this.logTrace('interstitialAd onError', err)
      })
      this.interstitialAd.onClose((res) => {
        sendObj.data = 4
        this.uniqueSend(sendObj)
        this.logTrace('interstitialAd onClose', res)
      })
    }
  },
  create() {
    if (this.mktSocket) {
      return
    }
    //fat地址
    const websocketurl = {
      'fat': 'wss://mktwebsocket.fws.qa.nt.ctripcorp.com/ws',
      'uat': 'wss://mktwebsocket.uat.qa.nt.ctripcorp.com/ws',
      'prd': 'wss://mktwebsocket.ctrip.com/ws',
    }[__global.env]
    // let websocketurl ='wss://mktwebsocket.fws.qa.nt.ctripcorp.com/ws'
    // let websocketurl ='wss://mktwebsocket.uat.qa.nt.ctripcorp.com/ws'
    //localhost地址
    // let websocketurl = 'ws://192.168.199.117:8083/ws'
    // let websocketurl ='wss://mktwebsocket.ctrip.com/ws'
    try {
      this.mktSocket = wx.connectSocket({
        url: `${websocketurl}?ids=${cwx.cwx_mkt.openid}&mktwebsocketfromminiapp=trip`, 
        success: () => { }, 
        fail: (err) => {
          this.logTrace('MP-connectSocket fail', err);
          thirdTrace({
            title: 'mktWebsocket',
            message: 'MP-connectSocket',
            addInfo: {
              action: 'fail:' + err
            }
          })
        }, 
        complete: () => { }
      })
    } catch (err) {
      this.logTrace('connectSocketFail', err);
    }

    this.onOpenMsg(() => {
      if (this.isHide) {
        this.uniqueSend({
          method: 'h5Refresh',
          imptype: '',
          data: ''
        })
        this.isHide = false
      }
    })
    this.onMessage(data => {
      console.log(data.data)
      const {
        contentText
      } = data.data
      switch (contentText.method) {
        case 'miniShare':
          this['miniShare'](data.data)
          break;
        case 'openScribe':
          this['openScribe'](data.data)
          break;
        case 'health':
          this['health']()
          break;
        case 'openMiniSub':
          // wx.showToast({
          //   title: '小程序唤醒订阅组件',
          //   icon: 'none'
          // })
          this.setData({
            webviewAbsolutSubscribe: true
          })
          break;
        default:
          console.log(`没有注册[${contentText.method}]对应的方法`)
          break;
      }
    })
    this.onClose()
    this.onError(err => {
      console.log(err)
    })
  },
  /** 接收H5传递过来的数据 */
  onWebMessage(e) {
    let that=this
    console.log('webview 接收H5传递过来的数据', e);
    var postArr = e.detail.data;
    var postCount = postArr.length
    for (var i = 0; i < postCount; i++) {
      var sData = postArr[i]
      if (sData && sData.type && sData.type.toLowerCase() === 'onshare') {
        this.shareData = sData.shareData;
        console.log('webview',this.shareData)
      }
    }
    // hon
    // 如果通过socket设置分享，就是用socket的分享,分享之后清空socketShareData，以便右上角分享使用postMessage的分享
    // if (this.socketShareData) {
    //   let v = {
    //     ...this.socketShareData
    //   }
    //   this.socketShareData = null
    //   this.shareData = v
    // }

    /** 2023-03-30 新增天天领现金的逻辑，发布一个公共的订阅通知 */
    try {
      if (postCount) {
        const currTaskEventTtlxj = postArr.find(i => {
          return i.type === 'emit' && i.data && i.data.key == 'mkt_task_event_ttlxj'
        })
        if(currTaskEventTtlxj) {
          cwx.Observer.noti("mkt_webview_h5_task_event_ttlxj", {
              postion: "true"
          })
        }
      }
    } catch (error) { }
  },
  // 设置小程序环境
  setMiniEnv(options) {
    try {
      let isQQ = isInQQ(options)
      this.miniEnv = isQQ ? 'qq' : 'wx'
      this.logTrace('miniEnv', this.miniEnv)
      console.log('miniEnv=====', this.miniEnv)
    } catch (error) {
      console.log('miniEnverror')
    }
  },
  onShareAppMessage(options) {
    // 微信中点击webview中分享按钮转发
    if ((options.from == 'button' && this.socketShareData)||(this.hideSharePop && this.socketShareData)) {
      return {
        title: this.socketShareData.title || '',
        imageUrl: this.socketShareData.imageUrl || '',
        path: this.socketShareData.path || ''
      }
    }
    if (this.miniEnv === 'qq') {
      // QQ 环境 去掉 from button的判断 防止影响微信逻辑，所以以此分支分开
      if (this.socketShareData) {
        // 执行关闭逻辑是为了兼容ios上 card图读取不到的问题
        let socketShareData = { ...this.socketShareData }
        this.handleCloseShare()
        return {
          title: socketShareData.title || '',
          imageUrl: socketShareData.imageUrl || '',
          path: socketShareData.path || '',
          preview: socketShareData.imageUrl || '',// 兼容qq分享
        }
      }
    }
    if (!this.shareData.title) {
      this.shareData.title = this.data.title
    }
    if (!this.shareData.imageUrl) {
      this.shareData.imageUrl = this.data.imageUrl
    }
    this.shareData.preview = this.shareData.imageUrl // 兼容qq分享
    if (!this.shareData.path) {
      this.shareData.path = `/pages/market/web/index?from=${encodeURIComponent(options.webViewUrl)}&title=${encodeURIComponent(this.shareData.title)}&img=${encodeURIComponent(this.shareData.imageUrl)}`
    }
    console.log('分享参数', this.shareData)
    return this.shareData;
  },
  miniShare(msg) {
    const {
      pageBottomShareType,
      pageBottomShareTitle,
      hideSharePop=false
    } = msg.contentText.data

    const {
      shareTitle,
      sharePath,
      shareBg,
      isPrivateMessage,
      activityId
    } = msg.contentText.data
    this.socketShareData = {
      title: shareTitle || '',
      path: sharePath || '',
      imageUrl: shareBg || ''
    }
    this.hideSharePop=hideSharePop
    this.sharePosterOptions = {
      ...msg.contentText.data
    }
    console.log('分享类型', cwx.scene, this.miniEnv)
    if (this.miniEnv === 'qq') {
      // QQ 环境
      this.setData({
        maskType: 2,
      })
    } else if(!hideSharePop){
      this.setData({
        maskType: 1,
        pageBottomShareType,
        pageBottomShareTitle
      })
    }
    //转发私密消息
    if(isPrivateMessage && activityId){
      wx.updateShareMenu({
        withShareTicket: true,
        isPrivateMessage: true,
        activityId: activityId,
        success: (res)=> {
          this.ubtTrace(254711, { openId: cwx.cwx_mkt.openid || '', type: 'updateShareMenu_success', shareData: msg.contentText.data,res:res}); 
         },
        fail: (e)=> {
          this.ubtTrace(254711, { openId: cwx.cwx_mkt.openid || '', type: 'updateShareMenu_fail', shareData: msg.contentText.data,res:e});  
        }
      })
    }
    this.logTrace('MP-minishare', 'receive')
    thirdTrace({
      title: 'mktWebsocket',
      message: 'MP-minishare',
      addInfo: {
        action: 'receive'
      }
    })
  },
  health() {
    this.uniqueSend({
      method: 'health'
    })
  },
  /** 打开订阅 */
  async openScribe() {
    let scribeTempList = ['BsQ-j76DZe4wkyVw-3qnZ-U2qwGCH9ugw-xyuBIwbXs']
    cwx.mkt.subscribeMsg(scribeTempList, (data) => {
      if (data && data.templateSubscribeStateInfos) {
        console.log('-------------订阅消息点击 允许--------------------', data);
        wx.showToast({
          title: '订阅成功',
          icon: 'success',
          mask: true
        })
      } else {
        console.log('-------------订阅消息点击 取消---------------------', data);
        cwx.mkt.getSubscribeMsgInfo(scribeTempList, () => { }, (error) => {
          console.log('订阅状态fail===', error)
        })
      }
    }, (err) => {
      console.log(err)
    })
  },
  handleClick() { },
  handleCloseShare() {
    this.setData({
      maskType: 0
    })
    this.socketShareData = null
  },
  /** 打开海报 */
  openPoster() {
    const unionData = this.unionData
    const pageId = this.pageId
    console.log('分享参数', this.sharePosterOptions)
    requestQrcode({
      ...this.sharePosterOptions,
      ...unionData,
      pageId
    },
      (url) => {
        console.log('posterImg====',url)
        this.setData({
          posterImg: url,
        })
        wx.previewImage({
          urls: [url],
          success: () => {},
          fail: () => {},
          complete: () => {}
        })
      },
    )
  },
  /** 唤醒APP失败 */
  launchAppError(e) {
    const scene = cwx.scene;
    console.log('当前组件 的入口场景值', scene)
    console.log('唤醒失败', e)
    wx.showToast({
      title: `返回失败`,
      icon: "none"
    })
    this.logTrace('launchAppError', e || '')
  },
  /** 新增UBT埋点 */
  logTrace(actioncode, actionMsg) { 
    try { 
      const params = { keyname: "mkt_2021Activity", PlatForm: "miniapp", actioncode: actioncode || '', actionMsg: actionMsg || '', pageId: this.pageId || '', openId: cwx.cwx_mkt.openid || '', activityName: 'web/index', activityId: ""} 
      this.ubtTrace(201002, params); 
    } catch (e) { 
      console.log('埋点报错', e) 
    } 
  },
  /** 自定义订阅 */
  openSubscribe() {
    const templateIds = ["7KFUTObo43RjjzQV7QT6CW_9OfSsckk28lJdsHN0xYk",
      "2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk",
      "1a2RJa0mpegB8ozSeJFj0gT3CL-tLFi7SObXnZuv6eg"
    ]
    cwx.mkt.subscribeMsg(templateIds, (data) => {
      if (data && data.templateSubscribeStateInfos) {
        // wx.showToast({
        //   title: `确认订阅`,
        //   icon: "none"
        // })
        this.uniqueSend({
          method: 'h5Refresh',
          imptype: 'subscribeCallback',
          data: 1
        })
      } else {
        // wx.showToast({
        //   title: `取消订阅`,
        //   icon: "none"
        // })
        this.uniqueSend({
          method: 'h5Refresh',
          imptype: 'subscribeCallback',
          data: 0
        })
      }
      this.setData({
        webviewAbsolutSubscribe: false
      })
    }, (err) => {
      console.log('订阅消息失败', err)
      this.setData({
        webviewAbsolutSubscribe: false
      })
      this.uniqueSend({
        method: 'h5Refresh',
        imptype: 'subscribeCallback',
        data: 0
      })
    })
  },
  doNothing(e) {
    
  }
})
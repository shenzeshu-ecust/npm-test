import { cwx, CPage, __global } from '../../../cwx/cwx.js';
import  common from '../common/common.js';
import DeviceUtil from '../common/device.js';
import LiveUtil from '../common/LiveUtil.js';
import { messageType, getLocalMessage } from './liveMessage/liveMessageUtil'
import {processCemojiText}  from "../processCemojiText.js";
cwx.config.init();
const app = getApp()

const CityInfo = {
  cityId:2
}

import {
    watchLive,
    watchLiveGuest,
    searchUserCard,
    reserveLive,
    sendChatRoomMessage,
    followUser,
    getRoomUsersByPage,
    receiveCouponCodeList,
    cancelFollowUser,
    joinChatRoom,
    getImPlusChatInfo,
    getDisplayTheme,
    getLiveSlideList
} from './service/webcastRequest.js';
CPage({
  checkPerformance: true,  // 添加标志位
  pageId: "10650045701",
  data: {
    showActionPanel:false,
    streamType:'rtmp',
    current:0,
    duration:500,
    showScrollGuide:false,
    circular:false,
    videoSwiperCurrent:0,
    displayList:[],
    ListItems:[],
    liveID: 0,
    totalUserCount: 0, // 聊天室内用户总数
    likeCount: 0, //喜欢数
    liveTitle: '', //标题
    liveCoverImageUrl: '', //背景图
    isReservedShow: false,  //是否显示预约按钮
    countDownStr: '', //倒计时
    pageType: 0, // 0 -> 初始, 1 -> 视频不存在, 2 -> 直播已结束, 3 -> 正在直播, 4 -> 预约直播
    loadingStatus: 0, // 0 -> 初始, 1 -> 加载中, 2 -> 加载成功, 3 -> 加载失败
    liveInfo: {
      liveID: 0,//直播间id
      liveTitle: '',//直播间标题
      liveSlogan: '',//直播间标语
      coverImageUrl: '',//直播间封面（640*360）
      isPrivate: false,//是否测试直播
      orientation: 1,//1=竖屏，0=横屏
    },
    master: {
      masterID: '',
      masterName: '',
      imageUrl: '',
      url: '', //主播头像
      isFollow: false, // 与主播关系-是否关注
      vipType: 0, //是否VIP
      vIcon: '', //v标图
    }, //主播信息
    isIphoneX: false, //适配iPhoneX iphone11
    isIphone: false,
    bottomInput: '',  //登陆参与直播互动。 说点什么吧
    bottomPlaceHolderInput:'', // 提问商卡  输入框
    isFocused: false,  //聚焦
    inputValue: '',
    commentKeybordBottom: 0,//键盘高度
    proListHeight: 0, //商品货架高度
    barHeight:0,
    liveConfig: { // 直播配置
      liveAppID: 1255466713,//用户的腾讯云 AppID
      orientation: 'vertical',//画面方向，可选值有 vertical、horizontal
			objectFit: 'fillCrop', //填充模式，可选值有 contain、fillCrop
		  objectVideoFit:'cover',
      minCache: 1,// 1	否	最小缓冲区，单位 s
      maxCache: 3,//3	否	最大缓冲区，单位 s
      autopause: true,//页面跳转时是否自动暂停
			debug: false,//是否显示日志,
			needTop:false
    },
    isDevtools: false, //判断是否为工具，工具端隐藏loading
    showVideoImage: true, //是否显示视频封图
    navbarData: {
      showCapsule: true,
      bgTransparent: true
    },
    headerTop: 0,
    windowHeight: 0, //屏幕高度
    windowWidth: 0, //屏幕宽度
    moreToolsState: 0, //0 不展示面板 ，1 展示工具面板， 2展示清晰度
    qualityList: [], // 清晰度数据
    currentQuality: -1,  //1080, 720, 540, 480
    preVideoInfo: {}, //预告视频展示信息
    preVideMuted: false, //是否静音播放
    showUserPanel: false, //是否显示用户面板
    showReportPanel: false,//是否显示举报面板
    userPanelInfo: {}, //用户面板信息
    showFollowGuide: false,//是否显示引导关注面板
    showPopBox: false, //显示弹框
    popBoxContent: {}, //弹框内容
    isPayLiveRoom: false, //是否为付费直播间
    masterRecommendGoods: null,//主播推荐商品
    recommendGoods: [],
    displayTheme: {
      "bg1":"https://dimg04.c-ctrip.com/images/0AS4d12000a62145789AB.png",
      "bg2":"https://dimg04.c-ctrip.com/images/0AS3j12000a6210h24977.png",
      "bg3":"https://dimg04.c-ctrip.com/images/0AS0z12000a621f9r7042.png",
    },
    functionSwitch:{},
    formInfoObjectList:[],
    env:__global.env,
    askCardHeight:0
  },
  localIdList:[],
  list:[],
  index:0, 
  currentIndex:0, 
  hasMore:false,
  videoSwiperCurrent:0,
  liveID: 0,   //直播间ID
  clientAuth: '',
  prePullUrl: '',
  preLiveStatus: -1,
  chatRoomID: -1, // 聊天室 ID
  startPullUrlTime:0,
  watchLiveDuration:0,
  onFirstPageShowTime:0,
    nextMessageKey: '', //替换lastmessageid，单一lastMessageId不够灵活，优化后便于拓展多消息队列，多优先级队列
    // audienceID: "", // 观看者 ID
    imTimeout: null, // im 消息延时
    isShowLoading: false, // 是否显示加载
    imUids: [], // IM 消息列表中用户 IDs
    lastImId: 0, // IM 消息列表中最后一个 ID
    theLastImId: 0, // 暂时记录 IM 消息列表中最后一个 ID， 用于判断是否需要重新包装 scroll wrapper
    shareTitle: '', // 分享标题
    openIMFlag: false, // 是否开启 IM 
    videoWidth: 0, // 视频宽度
    videoHeight: 0, // 视频高度
    endJumpUrl: '', //直播结束后的跳转链接
    countDownTimer: null, //预约倒计时
    countDown: 0,  //剩余时间
    isReserved: false, //是否预约
    liveGoodsId: 0,  //正在去买的商品ID
    inputValueData: '', //输入的文字
    networkType: '', //网络变化
	liveStatusText: '', //网络状态中文 用来记录埋点
	audience:{},// 观看者名称
    doLogin: false, //去登陆了
    windowInfo:{}, //屏幕信息
    templateIdList: ['kpJntsrL_AtcQxw1r2dhHZhezB6Ofi8nsIKvxrBkjMc'],
    // hotBannersTraceList: [], //用来记录埋点
    // preComboLikeCountTime: 0, //上次点击到时间，短于1秒就算连击 
    // preMessageBubbleTime: 0, //上一次灌水的时间
    // closeLotteryTimer: null, //关闭定时器
    // couponCountDown: 0, //优惠券倒计时
    // couponCountDownTimer: null, //优惠券倒计时
    // couponCountDownLeftMin: 0, //倒计时剩余分钟
    // couponCountDownLeftSec: 0, //倒计时剩余秒数
    // firstShowCoupon: true,  //第一次展示优惠券，弹框5s后自动消失
    // couponCountDownLeftTime: 5000, //5秒后自动关闭
    // isCheckingRequireTime: false,  //校验本地时间和倒计时
    // needUpdateGoodsTrace: false,  //更新完数据后需要重新去计算埋点
    // goodsListExpoTrace: [],  //货架曝光埋点
    // goodsListBannerExpoTrace: [],  //货架Banner曝光埋点
    source: '', //渠道埋点
    noticeTimer: null , //用来展示公告倒计时
    onLoadStamp: 0, //进入直播间的时间戳
    wifiWarningToast: false, //是否有过流量提示
    netQualityLevel: 0, //网络质量 网络质量：0：未定义 1：最好 2：好 3：一般 4：差 5：很差 6：不可用
    isChangingQuality: false , //正在切换清晰度
    preQualityStream: '', //记录上一次的流地址，防止切换清晰度的时候拉流失败
    preQualityStreamIndex: 0, //记录上一次的流序号
    // tapShowNotice: false, //点击展开的公告，点击才会收起
    pullLog: false, //开发埋点
    badwifiToastTimer: null,  //网络差的提示需要间隔10秒
    badwifiToastLeftTime: 0, //10秒
    isJumpToMaster: false, // 跳转的是主播的话，onshow的时候需要重新请求下状态
    preFillcrop: '', //记录连麦前的画面是什么样的
    followGuideCountDownTimer: null,//关注引导倒计时
    // proListHeightValue: 0, //存一下货架高度
    // proListScrollTop: 0, // 存一下货架滚动高度
    // bagCountDownTimer: null, //福袋倒计时
    streamRateArr: [], //流量监控数据
    commentState: 0, //是否可以评论， 0：主播开启，1：平台开启 2：主播关闭，3:平台关闭
    liveRemStatus: -1,
    barHeight:0,
    onLoadTime: 0,
    onReadyTime: 0,
    routeTime: 0,
    onPlayerFirstTime: 0,
    clickPosition:'',
    hasMemeoryWarn: false,
    // ABTestingManager:'B',
    logExt: '',//埋点公共信息
    hasTrackRecord:false,
		hasOnHide:false,
		firstnimationfinish:2,
	 onLoad: async function (options) {
       this.onLoadTime = new Date().getTime()
		   this.liveID = options.liveID || 0; //86006  /86091
		   this.clientAuth = options.hostAuth || ''; //86006  /86091
        this.source = options.source || '';
        this.innersource = options.innersource || ''
        this.sct = options.sct || '';
        this.source_from_tag = options.source_from_tag || '';
         this.routeTime = new Date().getTime() || +options.cRouteBegin || +options.pubRouteBegin || this.onLoadTime;
         this.prePullUrl = options.wxPrePullUrl || '';
         this.preLiveStatus = +options.wxPreLiveStatus;
         this.perWatchLive()
         this.setData({
            liveID: options.liveID,
            showScrollGuide:cwx.getStorageSync('live_scroll_guide_lottie') ? false : true
         })
        this.onLoadStamp = new Date().getTime();
    },

    onReady: function(){
      this.onReadyTime = new Date().getTime()
      this.onPlayerFirstTime = new Date().getTime()
      let realRouteTime = this.routeTime == this.onLoadTime ? 0 : this.routeTime
      let loadTime =(this.onLoadTime - this.routeTime)/ 1000
      let readyTime = (this.onReadyTime - this.routeTime)/ 1000
      let loadToReadyTime = (this.onReadyTime - this.onLoadTime)/ 1000
      LiveUtil.sendUbtTrace('o_live_wx_ready_duration_time', {
        "loadTime":this.onLoadTime,
        "readyTime":this.onReadyTime,
        "routeTime":realRouteTime,
        "routeduration":loadTime,
        "loadToReadyDuration":loadToReadyTime,
        "readyduration":readyTime,
        "isPreFetchUrl":Boolean(this.prePullUrl && this.preLiveStatus === 0),
    });

    let _storageData = cwx.getStorageSync('cemojiMapping'); //为了解决表情包延迟加载的问题，先请求下 必须同步！！
    if(!_storageData || _storageData == '{}'){
        processCemojiText('t')
    }
   
    

    
    },
	  onShow: function(){
        let self = this;
        let statusBarHeight =  app.globalData.statusBarHeight;
        let titleBarHeight = app.globalData.titleBarHeight;
        this.setData({
                headerTop: statusBarHeight + titleBarHeight
        })
        wx.getNetworkType({
          success (res) {
            self.networkType = res.networkType
          }
        })
        // console.log("onshow",this.isJumpToMaster)
        if(this.isJumpToMaster){   //跳转个人主页后，可能会做关注操作，保持状态一致
            let master = this.data.master;
            this.getUserInfo(master.masterID, 'updateMaster');
            this.isJumpToMaster = false;  
        }
        this.handleFollowGuide();
        this.continueFollowGuideTick();
        this.selectComponent('.lottery')?.checkLotteryConditions()

        if(this.data.isPayLiveRoom){
          this.watchLive();
        }

     
       

      
    },
    handleTouchStart:function(){
      this.setData({
        showScrollGuide:false
      }) 
    },
    getLiveSlideList(type,cb){
      let self = this;
      if(type=='SWIPER' || (type!='change'&&self.hasFirstLoad)){
        cb&&cb()
        return;
      }
      let model =getLiveSlideList;
      return model({
        liveId:this.list.length? this.list[0]?.liveId : this.liveID,
        source:'app_homelive',
        currentLiveIds:this.list.length ? this.list.map(t=>t.liveId):[this.liveID]
      }, function(res){
        //console.log("watchLive",res)
        if(common.checkResponseAck(res) && res.data.code == 200){
                let {listItems, hasMore} = res.data.result;
                self.list = [...self.list,...listItems];
                self.hasMore = hasMore;
                // if(self.list.length>=5){
                //   self.hasMore = false;
                // }
                if(type!=='change'){
                  self.list.unshift({
                    "liveId": self.liveID,
                    "coverImage": {
                      "dynamicUrl": "",
                      "width": 790,
                      "height": 1057
                    },
                  })
                }
                self.upDateDisplayList(type)
                cb&&cb()
        } 
  
      })
    },
    onHide:function() {
        this.hasOnHide = true;
        this.removeFollowGuideTimer();
        this.selectComponent('.lottery')?.removeCouponLotteryTimer();
        this.hideTime = new Date().getTime()
        LiveUtil.sendUbtTrace('o_live_wx_hide',{
          hasTrackRecord: this.hasTrackRecord,
          hideTime:this.hideTime
        });// 看用户隐藏的时候 是否播放了
        if(this.data.pageType == 3){
            this.handleStreamRateTrack();
        }
    },

    onUnload: function(){
        // 取消掉
        let child = this.selectComponent('.liveMessage');
        if(child){
          child._hideShopCard();
          child.hideDefaultRecommendShopCard();
        }
        if(!this.hasMemeoryWarn){
          LiveUtil.sendUbtTrace('o_live_wx_ready_memeory_warn', {
            "result":"",
            "pagePathArr":"",
            "isWarn": false,
          });
        }
        this.traceTime()
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_leaveroom');
        if(this.data.pageType == 3){
            this.handleStreamRateTrack();
        }
        if(this.pullLog){
            cwx.sendUbtByPage.ubtDevTrace('o_gs_ctrip_live_tech_liveroom_invoke_stopplay', {
                source: this.source
            })
        }
        this.setData({
            pullStreamUrl: ''
        })
        // if (this.bagCountDownTimer) {
        //     clearInterval(this.bagCountDownTimer);
        //     this.bagCountDownTimer = null;
        // }
        
        
        this.destroyGoodsFilterTabExpo();
        // this.destroyGoodsFilterBannerExpo();
        this.goodsId = null;
    },

    traceTime: function(){
      let currentTime = new Date().getTime();
      let watchTime = (currentTime  - this.onLoadStamp)/1000 + '秒';
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_watch_time', {
          watch_time: watchTime,
      });
      this.onLoadStamp = new Date().getTime();
    },
    
  //  getAbAsync :function(key){
  //    return new Promise(resolve => {
  //     cwx.ABTestingManager.valueForKeyAsync(key, value => resolve(value))
  //    })
  //  },

	handleDevice: function(){
        this.setData({
          isIphoneX: DeviceUtil.isIPX(),
          proListHeight: parseInt(DeviceUtil.windowHeight*0.3),  
          isIphone:DeviceUtil.isIP(),
          windowHeight: DeviceUtil.windowHeight,
          windowWidth: DeviceUtil.windowWidth,
          bottomSafe :Math.floor(DeviceUtil.px2rpx(DeviceUtil.bottomSafe)) || 24,
          inputHeight:Math.floor(DeviceUtil.rpx2px(120))
        },()=>{
        })
        this.windowInfo = {
          windowHeight: DeviceUtil.windowHeight,
          windowWidth:  DeviceUtil.windowWidth
        };
        // this.proListHeightValue = proListHeight;
        this.isDevtools = !!(DeviceUtil.platform == 'devtools')
	},
  
  perWatchLive: function(){
    if(this.prePullUrl && this.preLiveStatus === 0){
      let newData = this.handlePageType(this.preLiveStatus);
      let pageType = newData.pageType;
      this.startPullUrlTime = new Date().getTime()
      this.setData({
        pageType,
        pullStreamUrl: this.prePullUrl,
        streamType:this.prePullUrl.indexOf('rtmp')>=0?'rtmp':'hls'
      })
    }

    this.watchLive('JOINCHATROOM');
    this.doJoinChatRoom();
    this.handleDevice();
  },

	//观看接口
	watchLive: function(type){
  
    let watchLiveStartTime = new Date().getTime();
        // wx.showLoading({
        //   title: '加载中'
        // });
		let isLogin = cwx.user.isLogin();
		let model =  isLogin ? watchLive : watchLiveGuest;
    
		let param = {
			sourceType: '' //早期外部投放用到的参数
		}
        if(this.clientAuth){
            param.clientAuth = this.clientAuth
        }else{
            param.liveID = this.liveID
        }
        if(type && (type =='REFRESH_LIVE' || type == 'JOINCHATROOM')){
            param.refreshLive = true;
        }
    let self = this;
    // console.log('xixixiWatchlive,',this.liveID)
		model(param, function(res){
			//console.log("watchLive",res)
			if(common.checkResponseAck(res) && res.data.code == 200){
               let watchLiveEndTime = new Date().getTime();
               self.watchLiveDuration = (watchLiveEndTime - watchLiveStartTime)/1000
              //  console.log("o_live_wx_watchLive_duration_time: "+ self.watchLiveDuration)
               self.ubtTrace('o_live_wx_watchLive_duration_time', {
                "watchLiveDuration":self.watchLiveDuration,
                "liveID":self.liveID
               }); 
               wx.hideLoading();
                // 401 被踢出 402 被拉黑
                // res.data.result.resultStatus={code:401}
                let flag = self.handleOutRoomData(res.data.result);
                if(flag) return;
                if(res.data.result && res.data.result.liveInfo ){
                    self.liveID = res.data.result.liveInfo.liveID
                    self.setData({
                        liveID : self.liveID 
                    })
                    if(self.liveRemStatus >= 0 && self.liveRemStatus !== res.data.result.liveInfo.liveStatus){
                      self.traceTime()
                    }
                    self.liveRemStatus = res.data.result.liveInfo.liveStatus
                    self.handleWatchLiveData(res, type);
                }else{
                    let url =  res.data.result.jumpUrl || '';
                    if(url){
                      LiveUtil.jumpToProductItem(url,'redirectTo')
                    }
                    return
                }
                //付费直播间判断
                if(res.data.result){
                    self.handlePayRoomData(res.data.result);
                }
			} else {
        wx.getNetworkType({
          success (res) {
          if(res.networkType=='none'){
           // 提示网络不存在
            wx.showToast({
            title: `当前网络不可用,无法观看视屏`,
            icon: 'none',
            duration: 3000
            })
          }else{
        //跳转到endLive 
            self.jumpToUserEndLive('selfJudge');
        }
          }
        })
       
      }

		})
	},


	handleWatchLiveData: function(res,type){
		let result = res.data && res.data.result || {},
			liveInfo = result && result.liveInfo || {},
      anchor =  liveInfo &&  liveInfo.anchor || {},
      functionSwitch = result && result.functionSwitch || {},
			master = {},
			isReserved = false,
			liveTitle = '',
			liveCoverImageUrl = '',
			liveStatus = -1,
			pageType = -1,
			liveStatusText = '',
            liveConfig = this.data.liveConfig,
            poiName = '',
            preVideoInfo = {},
            self = this;
		this.audience = result && result.audience || {};
        poiName = liveInfo.poi && liveInfo.poi.showName || '';
        if(poiName && poiName.length > 5){
            poiName= poiName.slice(0,5) + '...';
        }
		master = {
			masterID: anchor.ctripUserID || '',
        	masterName: anchor.userName || '',
        	imageUrl:  anchor.imageUrl || '',
        	url:  anchor.userUrl || '',
        	isFollow: result.isFollow || false, // 与主播关系-是否关注 
        	vipType: anchor.vipType || 0, //是否VIP
            vIcon: anchor.vIcon || '',
            poiName: poiName,
            poiUrl: liveInfo.poi && liveInfo.poi.wechatUrl || '',
            poiID: liveInfo.poi && liveInfo.poi.poiID ||  0,
            districtID: liveInfo.poi && liveInfo.poi.districtId || 0,
        };
        liveTitle = liveInfo.liveTitle || '';
        liveCoverImageUrl = liveInfo.coverImageUrl || '';
        liveStatus = liveInfo.liveStatus ;

        // if(liveInfo.renderMode && liveInfo.renderMode == 1){
        //     liveConfig.objectFit = 'fillCrop';
        // }
        
        // this.preFillcrop = liveConfig.objectFit;

        this.chatRoomID = result.chatRoomID || 0;
        this.endJumpUrl = result.jumpUrl || '';

		

        // 测试数据 - 6 -> 直播录播回看
        //liveStatus = 0;  //0 - 正在直播，1 - 直播结束，11 - 生成回放中，12 - 预约直播，13 - 直播取消
        //pageType:  0 -> 初始, 1 -> 视频不存在, 2 -> 直播已结束, 3 -> 正在直播, 4 -> 录播可回放, 5 -> 预约直播;  6-> 直播取消

        let newData = this.handlePageType(liveStatus);
        pageType = newData.pageType;
        this.liveStatusText = newData.liveStatusText;
    // let pullStreamUrl = liveInfo.liveChannel && liveInfo.liveChannel.pullStreamUrl||''; 
    // if(this.startPullUrlTime === 0){
    //   this.startPullUrlTime = new Date().getTime()
    // }
		// console.log('pullStreamUrl',pullStreamUrl) //清晰度：_fast500（ 3000 , 2000, 1000, 500）
        //pullStreamUrl + '_fast500'
        let qualityList = liveInfo?.liveChannel?.qualityUrls || [];
        let pullStreamUrl = qualityList?.[1]?.rtmpPullUrl;
        let currentQuality = -1;
        if(qualityList && qualityList.length){
            qualityList.map((qItem,qIndex)=>{
                if(qItem.rtmpPullUrl == pullStreamUrl){
                    currentQuality = qIndex;
                }
            })
        }

       //评论开关
        let bottomInput =  this.handleCommentState(result,type);
        this.logExt=result.logExt;
        if(this.startPullUrlTime === 0 || type=='SWIPER'){
          this.startPullUrlTime = new Date().getTime()
        }
        
        let setData = {
          master: master,
          liveInfo:liveInfo,
          pageType: pageType,
           liveTitle: liveTitle,
          liveCoverImageUrl: liveCoverImageUrl,
          totalUserCount: liveInfo.watchCount || 0,
          likeCount: liveInfo.likeCount || 0,
          pullStreamUrl:pullStreamUrl,
          streamType:pullStreamUrl.indexOf('rtmp')>=0?'rtmp':'hls',
          liveConfig:liveConfig,
          qualityList: qualityList,
          currentQuality: currentQuality,
          preVideoInfo: this.handlePreVideoInfo(liveInfo.preVideo),
          bottomInput: bottomInput,
          bottomPlaceHolderInput:bottomInput,
          functionSwitch:functionSwitch,
			}
			// ||setData.streamType=='hls'
      if(pageType!=3){
        setData.showVideoImage = false;
      }
        this.setData(setData,()=>{
          // 等有了数据在去请求列表
          console.log(this.data.streamType);
          self.getUserInfo(self.data.master.masterID, 'updateMaster');
          setTimeout(()=>{
              if(pageType == 3 || pageType == 5){
                if(self.data.showScrollGuide){
                  try {
                    wx.setStorageSync('live_scroll_guide_lottie', true);
                  } catch(e) {
                    // Do something when catch error
                  }
              setTimeout(()=>{
                  self.setData({
                    showScrollGuide:false
                  })   
                },3000)
              }
                  self.fetchRecommendList();
                  self.ubtTrace('o_gs_tripshoot_lvpailive_goodslist_show', {  //购物袋曝光
                      liveID: self.liveID,
                      liveState: self.liveStatusText,
                  });
                  self.getRecommendDisplayTheme();
                  self.getMasterRecommendGoods();
              }
          },1000)
        })

        this.traceFirstTimeShow();
        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_pageshow');

        if(poiName && poiName.length > 0){
            LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_desitnation_show');
        }

        
       if(pageType == 3 || pageType == 5){
 self.getLiveSlideList(type,()=>{
            this.handleVideoStatus(pageType,liveInfo, anchor.ctripUserID,this.audience.ctripUserID);
          })
       }else{
        this.handleVideoStatus(pageType,liveInfo, anchor.ctripUserID,this.audience.ctripUserID);
       }
         
        
    },
    
    traceFirstTimeShow:function(){
      // if(this.onFirstPageShowTime > 0){
      //   return;
      // }
      this.onFirstPageShowTime = new Date().getTime()
      let realRouteTime = this.routeTime == this.onLoadTime ? 0 : this.routeTime
      let loadTime =(this.onLoadTime - this.routeTime)/ 1000
      let readyTime = (this.onReadyTime - this.routeTime)/ 1000
      let time = (this.onFirstPageShowTime - this.onLoadTime)/ 1000
      let totalTime = (this.onFirstPageShowTime - this.routeTime)/ 1000
   
      LiveUtil.sendUbtTrace('o_live_wx_first_show_duration_time', {
        "routeTime":realRouteTime,
        "loadTime":this.onLoadTime,
        "readyTime":this.onReadyTime,
        "pageFirstShowTime":this.onFirstPageShowTime,
        "routeduration":loadTime,
        "readyduration":readyTime,
        "loadToPageFirstDuration":time,
        "totalduration":totalTime,
        "watchLiveDuration":this.watchLiveDuration,
        "url":this.preQualityStream,
        "isPreFetchUrl":Boolean(this.prePullUrl && this.preLiveStatus === 0),
        "preFetchUrl":this.preQualityStream,
    });
    },

	//处理播放状态
	handlePageType: function(liveStatus){
		let pageType = '',
			liveStatusText = '';

		switch (liveStatus) {
	        case 0: // 直播中
	            pageType = 3;
	            liveStatusText = '直播中';
	            break;
	        case 1: // 直播结束
	        case 2: // 违规断流
	        case 3: // 录播录制中
	        case 4: // 录播转码中
	        case 5: // 录播审核中
	        case 11: //生成回放中
	            pageType = 2;
	            liveStatusText = '已结束';
	            break;
	        case 6: // 录播可回放
	            pageType = 4;
	            liveStatusText = '回放中';
	            break;
	        case 7: // 录播已删除
	            pageType = 1;
	            break;
	        case 12: //12 - 预约直播
	            pageType = 5;
	            liveStatusText = '预约中';
	            break;
	        case 13:  //13 - 直播取消
	            pageType = 6;
	            liveStatusText = '已取消';
	            break;
	        default:
	            pageType = 1;
	            break;
	    }

	    return { pageType, liveStatusText }
	},

	//处理显示界面
     //pageType:  0 -> 初始, 1 -> 视频不存在, 2 -> 直播已结束, 3 -> 正在直播, 4 -> 录播可回放, 5 -> 预约直播;  6-> 直播取消
	handleVideoStatus: function(pageType,liveInfo, masterID, audienceID){
		switch(pageType){
			case 1:  
               wx.hideLoading();
				break; 
			case 2:
			case 4:
      case 6:
        wx.hideLoading();
				this.jumpToUserEndLive();
				break;
			case 3: 
			//商品
      //处理IM
                if(this.chatRoomID!= -1){
                    let child = this.selectComponent('.liveMessage');
                    if(child){
                        child.updateInfo(this.chatRoomID,masterID,audienceID,this.liveID)
                    }
                }
                
                this.reFreshGoodsList(); 
				break;
			case 5:
                wx.hideLoading();
			    let self = this;
				this.isReserved = liveInfo.isReserved || false;
				this.countDown = liveInfo.countdown || 0;
				this.countDownTimer = setInterval(function(){
	                self.handleTimeCountDown(self.countDown)
	                self.countDown = self.countDown - 1000
	            },1000);
                if(this.chatRoomID!= -1){
                    const child = this.selectComponent('.liveMessage');
                    child&&child.updateInfo(this.chatRoomID,masterID,audienceID,this.liveID)
                }
                
                this.reFreshGoodsList();
                break;
		}
	},

    //处理预告界面视频展示
    // 长宽比例小于1:1，居中靠上显示，上下部分用视频素材高斯模糊
    // 长宽比例大于1:1但小于9:16，居中显示，上下部分用视频素材高斯模糊
    // 大于9:16，全屏铺满显示
    handlePreVideoInfo: function(data){
        let preVideoInfo = data || {};
        let preVideoWidth = preVideoInfo.videoWidth;
        let preVideoHeight = preVideoInfo.videoHeight;
        let preVideoMode = '';
        if(preVideoInfo.videoUrl && preVideoHeight > 0){
            if(preVideoWidth > preVideoHeight){
                preVideoMode = 'cover';
                preVideoInfo.showVideoHeight = this.windowInfo.windowWidth * preVideoHeight/preVideoWidth;
            } else if(preVideoWidth/preVideoHeight >0.5625){
                preVideoMode = 'cover';
                preVideoInfo.showVideoHeight = this.windowInfo.windowWidth * preVideoHeight/preVideoWidth;
            } else if(preVideoWidth/preVideoHeight <= 0.5625){
                preVideoMode = 'fill';
                preVideoInfo.showVideoHeight = this.windowInfo.windowHeight;
            }
        }
        preVideoInfo.preVideoMode = preVideoMode//preVideoMode;
        return preVideoInfo;
    },

	//预约开播倒计时
    handleTimeCountDown: function(leftTime){
        //d,h,m,s保存倒计时的时间  
        let d = 0,
            h = 0,
            m = 0,
            s = 0,
            countDownStr = '',
            isReservedShow = false;
        if(leftTime > 0) {
            d = Math.floor(leftTime/1000/60/60/24);  
            h = Math.floor(leftTime/1000/60/60%24);  
            m = Math.floor(leftTime/1000/60%60);  
            s = Math.floor(leftTime/1000%60);
            if(d > 0) {
                countDownStr = d + "天";
            }
            if(h > 0) {
                countDownStr += h + "小时";
            }  
            if(m > 0) {
                countDownStr += m + "分";
            }   
            if(s > 0) {
                countDownStr += s + "秒";
            }
            if (countDownStr.length) {
                countDownStr += "后开播";
            } 
            if(leftTime > 1800000 && !this.isReserved ){
                isReservedShow = true;
            }
            this.setData({
            	isReservedShow: isReservedShow,
            	countDownStr: countDownStr
            })
        } else {
            countDownStr = "主播正在赶来的路上";
            this.setData({
            	countDownStr: countDownStr
            })
            clearInterval(this.countDownTimer);
        }
    },

    //预约直播
    doReserve: function(){
        let self = this;
        if (!cwx.user.isLogin()) {
            this.toLogin();
        } else {
            wx.requestSubscribeMessage({
                tmplIds: self.templateIdList,
                success (res) { 
                  let acceptResult = false;
                  if(res.errMsg == "requestSubscribeMessage:ok" ){
                    for (let i in res) {
                      if (res[i] == 'accept') { //接受了 去落库
                        acceptResult = true;
                      } else if(res[i] == 'reject'){
                        acceptResult = false;
                      }
                    }
                    if(acceptResult){
                      //订阅消息落库
                      // liveId  openId: cwx.cwx_mkt.openid
                      self.handleReserveInfo();
                      // console.log("订阅消息落库")
                    } else {
                        // console.log("订阅不成功");
                        
                    }
                  } else {
                      // console.log("订阅不成功");
                  }
                },
                fail(error){
                    console.log(error)
                }
          })
        }
    },

    handleReserveInfo: function(){
        let self = this,
            toast = '',
            openID = cwx.cwx_mkt.openid || '';
        let param = {
            liveID: this.liveID,
            openID: openID
        };
        reserveLive(param, function(res){
            // console.log("reserveLive",res)
            if(common.checkResponseAck(res) && res.data.result){
                toast = '预约成功！开播后你将收到站内信通知';
                self.isReserved = true;
                self.setData({
                    isReservedShow: false
                })
            } else {
                toast = '预约失败，请稍后再试~';
            }
            wx.showToast({
                title: toast,
                icon: 'none'
            })
        })
    },

  //刷新货架
  reFreshGoodsList: async function (type) {
    let param = {
      liveID: this.liveID,
      source: this.source,
      localCityId: this.getCurrentCity()
    }
    this.selectComponent('.goods-list')?.reFreshGoodsList(param,type);
  },
  arrChange:function (num, arr) {
    const newArr = [];
    while(arr.length > 0) {
      newArr.push(arr.splice(0, num));
    }
    return newArr;
  },
  
 

  

  async refreshLiveGoods(goodsId) {
    let param = {
      goodsId: goodsId,
      source: this.source,
      localCityId: this.getCurrentCity()
    }
    this.selectComponent('.liveMessage')?.getLiveGoods(param);
    
  },
  
    jumpToGrouChatForPannel:function(){
        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_gift_gruopChat_click');
        this.doJumpGroupChat();
    },

    doJumpGroupChat:function(){
        let master = this.data.master;
        let id = master.masterID;
        let param = {
            ctripUserID: id || "",
            type: 'groupChat'
        }
        getImPlusChatInfo(param, (res) => {
            if (common.checkResponseAck(res) && res.data.chatUrl && res.data.chatUrl.length > 0) {
                let chatUrl = res.data.chatUrl;
                LiveUtil.jumpToProductItem(chatUrl)
            } else {
                let msg = res.data && res.data.msg;
                if (msg && msg.length > 0) {
                    wx.showToast({
                        title: msg,
                        icon: 'none'
                    })
                } else {
                    wx.showToast({
                        title: '请稍后再试~',
                        icon: 'none'
                    });
                }
            }
        });
    },
    doPacketMasterFollow: function(){
        let master = this.data.master;
        let id = master.masterID;
        let isFollow = master.isFollow;
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_lottery_usericon_follow', {
            follow: !isFollow ? 'true' : 'false' ,
        });
        if(isFollow){
            this.cancelFollow(id);
        } else {
            this.doFollow(id);
        }
    },
    doTriggerFollow:function(params){
      let id = params?.detail?.id;
      let callback = params?.detail?.callback;
      this.doFollow(id,callback)
    },
    doFollow: function(id, callback){
      // if(typeof id == 'object'){
      //   id = id.detail.id;
      // }
    	if(!cwx.user.isLogin()){
    		this.toLogin();
            if(this.data.showUserPanel){
                this.setData({
                    showUserPanel: false
                })
            }
    		return;
    	}

        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_followicon_click');
    	let toast = '',
    		self = this,
    		master = this.data.master,
            userPanelInfo = this.data.userPanelInfo,
            isMaster = false;

        if(id == master.masterID){
           isMaster = true;
        }

    	let param = {
    		toCtripUserID: id
    	}
    	followUser(param,(res)=>{
    		if(common.checkResponseAck(res) && res.data.result && res.data.result.result){
                toast = '关注成功';
                userPanelInfo.isFollow = true;
                userPanelInfo.followingCount ++; 
                if(isMaster){
                    toast = '关注成功，进粉丝群聊聊吧';
                    master.isFollow = true;
                 }
                self.setData({
                    userPanelInfo: userPanelInfo,
                    master: master
                })
                callback && callback();
    		} else {
    			toast = '关注失败，重试看看';
    		}

    		wx.showToast({
    			title: toast,
    			icon: 'none'
    		})
    	})
    },



    //喜欢
    doLike: function(){
        this.selectComponent('.do-like')?.doLike()
    },
    goHotSalePage:function(e) {
        let url = e.currentTarget.dataset.url || '';
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_3hotsale_click', {
            destid: this.data.hotSaleCard.destId || 0,
            destName: this.data.hotSaleCard.destName || ''
        });
        LiveUtil.jumpToProductItem(url);
    },

    //点击购物icon 发送正在去买
    doShopping: function(e){
        this.liveGoodsId = e.currentTarget.dataset.id || 0;
        let url = e.currentTarget.dataset.url || '';
        let coupon = e.currentTarget.dataset.coupon || '';
        let  index = e.currentTarget.dataset.index || '';
        let salestatus = e.currentTarget.dataset.salestatus;
        this.clickPosition = e.currentTarget.dataset.clickposition;
        // if (salestatus == 2 || salestatus == 3 || salestatus == 4) {
        //     return;//2:待开抢；3:已抢光；4:已下架 ，不可点击
        // }
    	this.sendChatroomMessages(107);
       if(this.selectComponent('.goods-list')?.data.hasClickSearchIcon){
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_searchresult_click', {
          goodID: this.liveGoodsId,
          index: index,
       });
      //  this.setData({
      //    needFocus:false
      //  })
      }
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_goodsitem_click', {
            goodID: this.liveGoodsId,
            goodlist: 1,
            note: '',
            index: index,
        });

    this.shelvesCardClick(coupon, url)
  },

  shelvesCardClick(coupon, url) {
    if (coupon && coupon.length) {
      this.receiveCoupon(coupon, url)
    } else {
      LiveUtil.jumpToProductItem(url);
    }
  },

  doCard: function(e){
        let detail = e && e.detail;
        this.liveGoodsId = detail.id;
        this.clickPosition = detail.clickposition;
        this.sendChatroomMessages(107);
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_goodscard_click', {
            goodID: this.liveGoodsId,
            type:detail.cardType || 'jiangjie',
        });

        let url = detail.url || '';
        let coupon = detail.coupon || '';
        
        if(coupon && coupon.length){
            this.receiveCoupon(coupon,url)
        } else{
          LiveUtil.jumpToProductItem(url);
        }
        
    },

  

    showRecommendCardDetail: function(e) {
        let masterRecommendGoods = e.detail;
        this.liveGoodsId = masterRecommendGoods.goodsId;
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_AnchorRecommend_click',{
            goodsid:''+masterRecommendGoods.goodsId
        });
        this.clickPosition = "AnchorRecommend"
        this.sendChatroomMessages(107);
        LiveUtil.jumpToProductItem(masterRecommendGoods.wxUrl);
    },


    getRecommendDisplayTheme: function() {
      let param = {
          liveId:this.liveID,
          source:this.source,
      }
      getDisplayTheme(param, (res) => {
          if (common.checkResponseAck(res) && res.data.result && res.data.result.recommendCard) {
            this.setData({
              displayTheme:  res.data.result.recommendCard
            })
          }
      });
  },

    getMasterRecommendGoods: function() {
      const child = this.selectComponent('#recommend');
      if(child){
        child.reqRecommends(this.liveID,this.source);
      }
    },

    receiveCoupon: function(coupon,url){
        let self = this;
        let couponInfo = coupon ? JSON.parse(coupon) : {};
       
        receiveCouponCodeList(couponInfo,(res)=>{
            let text = res.data.text || '';
            if(common.checkResponseAck(res) && res.data && res.data.result == 0){
                wx.showToast({
                    title: text || '领券成功',
                    icon: 'none'
                 })
                setTimeout(()=>{
                  LiveUtil.jumpToProductItem(url);
                },3000)
                
            } else {
                wx.showToast({
                    title: text || '领券失败，请重试',
                    icon: 'none'
                 })
                setTimeout(()=>{
                  LiveUtil.jumpToProductItem(url);
                },3000)
            }
        })
    },
    sendChatroomMessages: function(msgType, comboLikeCount, callback){
        let param = {};
        let self = this,
        	message = {};
        if(msgType == undefined){
        	return;
        }
        switch(msgType){
        	case messageType.Message:
        		message =  {
	                messageType: msgType,
	                message: this.inputValueData
	            }
        	 	break;
        	case messageType.Fabulous: 
        		message =  {
	                messageType: msgType,
	                comboCount: this.selectComponent('.do-like')?.data.comboLikeCount
	            }
	            break;
	        case messageType.Share:
	        	message =  {
	                messageType: msgType,
	                message: "分享了直播"
	            }
	            break;
	        case 107:
	         	message =  {
	                messageType: msgType,
	                liveGoodsId: this.liveGoodsId,
                    sourceFrom: this.source
	            }
	            break;
        }
        param = {
        	//chatRoomID: this.chatRoomID,
        	message: message,
            liveId: this.liveID
        }
        if(msgType == messageType.Fabulous){
            // self.setData({
            //   //  likeCount: self.data.likeCount+1,
            //     showLikeAnimation: false
            // })
           
        }
        if(msgType == messageType.Message){
            self.inputValueData = '';
            Object.assign(param,{localId:+new Date()+''});
            self.hideCommentInput();
            this.localIdList.push(param.localId);
            wx.setStorageSync('gs_live_room_local_ids',{
              list:this.localIdList,
              flag:true
            })
        }
        param.message = message;
        this.clickPosition&&Object.assign(param.message,{clickPosition:this.clickPosition})
        sendChatRoomMessage(param,function(res){
            let {responseResult} = res?.data||{};
            let {resultCode,resultMessage} = responseResult||{}
              if((resultCode==10001 || resultCode==10002 )&&resultMessage){
                wx.showToast({
                  title: `${resultMessage}`,
                  icon: 'none'
               })
               return;
              }
            //不需要等接口可直接返回
            callback && callback()
        })
    },

    //未登录走登陆，已登陆聚焦
    toInputFocus: function(parmas){
    	let isLogin = cwx.user.isLogin();
	    if (!isLogin) {
	      this.toLogin();
	      return;
	    }
        if(this.commentState == 2 || this.commentState == 3){
            this.handleCommentStateToast();
            return;
        }
      let update={
          isFocused: true
      }
      if(parmas=='toAskQuestions'){
        update.toAskQuestionsData  = this.toAskQuestionsData;
        update.askCardHeight =Math.floor(DeviceUtil.rpx2px(104));
      } 
	    this.setData(update)
    },

    commentFocus: function(e){
      let update={
        commentKeybordBottom: e.detail && e.detail.height || 0,
        inputValue: this.inputValueData,
      }
      if(this.toAskQuestions){
        update.bottomPlaceHolderInput = '请输入提问内容';
      }else{
        update.bottomPlaceHolderInput = '说点什么吧';
      }
    	this.setData(update)
    },

    commentInput: function(e){
    	let value = e.detail && e.detail.value || '';
    	this.setData({
	      inputValue: value
    	})
    	this.inputValueData = value
    },
    setInputValue:function(e){
      this.setData({
	      inputValue: e?.detail?.value
    	})
    	this.inputValueData = e?.detail?.value
    },

    commentBlur: function(){
    	setTimeout(()=>{
    		this.hideCommentInput();
    	},100)
    },

    sendComment: function(e){
       if(e?.type=='confirm' && e?.detail?.value && !this.inputValueData){//安卓系统键盘点击发送会执行两次
          return ;
       }
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_commends_click');
        
        if(this.commentState == 2 || this.commentState == 3){
            this.handleCommentStateToast();
            return;
        }

        if(this.inputValueData.length <= 0 || this.inputValueData.trim().length ==0){
            wx.showToast({
              title: `不能发送空白评论喔`,
              icon: 'none'
            })
            return
        }
        if(this.toAskQuestions && this.toAskQuestionsData){
          this.inputValueData = `#${this.toAskQuestionsData.index}号商品#`+this.inputValueData;
        }
       
    this.sendToLocalMessage(getLocalMessage(messageType.Message,this.inputValueData,this.audience)); // 先发到本地
        this.sendChatroomMessages(messageType.Message, 0 , ()=>{
            // this.handleAutoCheckLotteryTask();
            this.selectComponent('.lottery')?.handleAutoCheckLotteryTask();
        });
    },

    // handleAutoCheckLotteryTask:function() {
    //     //发送口令之后查看任务进度
    //     if (this.data.lotteryPannelResult?.lotteryIcon?.lotteryType ==  LotteryType.CouponAutoOpen) {
    //         this.checkLottery('', LotteryType.CouponAutoOpen);
    //     }   
    // },

    hideCommentInput: function(){
      this.toAskQuestions = false;
      this.toAskQuestionsData=null;
    	this.setData({
    		isFocused: false,
    		inputValue: '',
        commentKeybordBottom: 0,
        toAskQuestionsData:null,
        askCardHeight:0
    	})
    },

    //键盘高度变了也要变
	keybordHeightChange: function(e){
        let height = e.detail && e.detail.height;
        let originalHeight = this.data.commentKeybordBottom;
        setTimeout(()=>{
            if(height !== originalHeight){
              this.setData({
                commentKeybordBottom: height
              })
            }
        },100)
		
	},

	//调准登录
	toLogin: function() {
		let self = this;
		cwx.user.login({
		  callback: function(res) {
		    if (res && res.ReturnCode == 0) {
                 self.selectComponent('.lottery')?.checkLotteryAfterLogin()
                // self.checkLotteryAfterLogin();
                self.doLogin = true;
                self.watchLive('JOINCHATROOM');
								self.doJoinChatRoom();
								if(self.selectComponent('.goods-list')?.data.goodsCount){
									self.goodsId && self.refreshLiveGoods(self.goodsId)
									self.reFreshGoodsList();
								}
                
		    }
		  }
		})
	},

	 //分享
	onShareAppMessage() {
		let shareTitle = '',
			shareUrl = '',
			imageUrl = '',
			master = this.data.master || {};

		shareTitle = master.masterName + '的直播太精彩了，快来看~';
		shareUrl = '/pages/live/webcast/home?source=share_wechat&liveID=' + this.liveID;     
        imageUrl = this.data.liveCoverImageUrl;
        // this.sendToLocalMessage(getLocalMessage(messageType.Share,"分享了直播",this.audience)); // 先发到本地
		this.sendChatroomMessages(messageType.Share);
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_share_click');
		return {
		  title: shareTitle,
		  path: shareUrl,
		  imageUrl: imageUrl
		}
	},
	onLiveMessageCallBack(params){
		if(params&&params.detail&&params.detail.liveMessage){
			const message = params.detail;
			switch(message.liveMessage.messageType){
				case messageType.Fabulous: //点赞
				if(message.liveMessage.likeCount && message.liveMessage.likeCount >0){
                    if(this.selectComponent('.do-like')&&!this.selectComponent('.do-like')?.data.showLikeAnimation){ //自己在点赞的时候就不要接收点赞数量的变更了
                        this.setData({
                            likeCount: message.liveMessage.likeCount
                        })
                        this.selectComponent('.do-like')?.messageBubble()
                    }
					
				}
					break;
				case messageType.End: // 结束 
                    this.jumpToUserEndLive('selfJudge');
					break 
				case messageType.Cutoff: // 断流
					break
				case messageType.STAT_LIVE: // 开始直播
					this.watchLive();
					break
                case messageType.REFRESH_SHELVES: // 刷新货架
                    
                    this.reFreshGoodsList();
                    this.getMasterRecommendGoods();
                    break;
                case messageType.SHOW_SHOP_CARD: // 货架展示
                  if(message?.liveGoods){
                    this.goodsId = message?.liveGoods?.goodsId;
                    this.goodsId && this.refreshLiveGoods(this.goodsId)
                  }
                 
                  this.reFreshGoodsList()
                   
          break
          case messageType.HIDE_SHOP_CARD: //货架隐藏
          
                this.reFreshGoodsList('hide')
          break
                case messageType.SHOW_HOTBANNER:
                    this.selectComponent('.master-info')?.   showHotBanner(true);
                    // this.showHotBanner(true);
                    break;
                case messageType.HIDE_HOTBANNER:
                    this.selectComponent('.master-info')?.   showHotBanner(false);
                    // this.showHotBanner(false);
                    break;
                case messageType.SHOW_LOTTERY:
                  this.selectComponent('.lottery')?.   showLotteryIcon(message.lottery);
                    // this.showLotteryIcon(message.lottery);
                    break;
                case messageType.HIDE_LOTTERY:
                    let hideId = message.lottery && message.lottery.lotteryId || 0;
                    this.selectComponent('.lottery')?.hideLotteryIcon(hideId);
                    // this.hideLotteryIcon(hideId);
                    break;
                case messageType.CHANGE_PULLSTREAM:
                    this.changePullStream(message);
                    break;
                case messageType.REFRESH_LIVE:
                    this.watchLive('REFRESH_LIVE');
                    break;
                case messageType.MICROCONNECT:
                    this.handleLiveConfig(message);
                    break;
                case messageType.SHOW_LOTTERY_RESULT:
                    let lotteryId = message.lottery && message.lottery.lotteryId || this.selectComponent('.lottery')?.data.bagIcon.lotteryId;
                    this.selectComponent('.lottery')?.handleBagResult(lotteryId) 
                    // this.handleBagResult(lotteryId);
                    break;
                case messageType.RELOAD_DATA:
                    if(message?.liveMessage?.reloadKeys)
                    {
                      let reloadKeys = message.liveMessage.reloadKeys || [];
                      for(let reloadKey in reloadKeys){
                        if(reloadKeys[reloadKey]=='watchLive'){
                          this.watchLive('RELOADDATA');
                          break;
                        }
                        if(reloadKeys[reloadKey]=='liveStream'){
                          this.watchLive('RELOADDATA');
                          // this.changePullStream(message);
                          break;
                        }
                      }
                    }
                    break;
                   
                
			}
		}
	},
	refreshUsers(params){ // 消息用户列表
        let self = this;
        let param = {
            //"chatRoomId": this.chatRoomID,
            "direction": 1,
            "lastTimeStamp": 0,
            "pageSize": 20,
            "liveId": this.liveID
        }
        getRoomUsersByPage(param,(res)=>{
            if(common.checkResponseAck(res)){
                self.setData({
                    totalUserCount: res.data.totalUserCount
                })
            }
        })
  },
  appendQuery(url,arg,arg_val){
    var pattern=arg+'=([^&]*)';
    var replaceText=arg+'='+arg_val; 
    if(url.match(pattern)){
        var tmp='/('+ arg+'=)([^&]*)/gi';
        tmp=url.replace(eval(tmp),replaceText);
        return tmp;
    }else{ 
        if(url.match('[\?]')){ 
            return url+'&'+replaceText; 
        }else{ 
            return url+'?'+replaceText; 
        } 
    }
    
  },
    //跳转到直播结束页面
    jumpToUserEndLive(type){
        let url = '';
        let endJumpUrl = this.appendQuery(this.endJumpUrl,'source',this.source);
        if(type=='selfJudge'){
          endJumpUrl = `https://m.ctrip.com/webapp/you/live/endLive/home?&isHideHeader=true&isHideNavBar=YES&navBarStyle=white&autoawaken=close&popup=close&liveID=${this.liveID}&source=${this.source}`;
        }
        let param = {} ;
        this.setData({
          endJumpUrl
        })
        if(endJumpUrl){
            if(endJumpUrl.indexOf('/pages/') < 0  &&  endJumpUrl.indexOf('cwebview') < 0 && endJumpUrl.indexOf('https') > -1){
                param = {
                   url: encodeURIComponent(endJumpUrl),
                   needLogin: false,
                   isNavigate: false,
                   loginErrorUrl: encodeURIComponent(endJumpUrl)
                }
                url = "/pages/you/lvpai/webview/webview?data=" + JSON.stringify(param)
            } else {
                url = endJumpUrl;
            }
            cwx.redirectTo({
                url: url
            })
        }
    },

    //播放状态发生变化
    videoPlay: function(e){
        let detail = e && e.detail;
        let self = this;
        console.log('detail=========>',e,detail)
				if(detail && detail.code == 2003){ // 视屏第一帧 很坑啊， 有时候滑着滑着 ，拿不到2003 状态码。 所以一直就loading
        if(!this.hasTrackRecord){ // 只执行一次
          this.onPlayerFirstTime = new Date().getTime()
          let realRouteTime = this.routeTime == this.onLoadTime ? 0 : this.routeTime
          let loadTime =(this.onLoadTime - this.routeTime)/ 1000
          let readyTime = (this.onReadyTime - this.routeTime)/ 1000
          let time = (this.onPlayerFirstTime - this.onLoadTime)/ 1000
          let totalTime = (this.onPlayerFirstTime - this.routeTime)/ 1000
          let streamDuration = (this.onPlayerFirstTime - this.startPullUrlTime)/ 1000
          LiveUtil.sendUbtTrace('o_live_wx_load_duration_time', {
            "routeTime":realRouteTime,
            "loadTime":this.onLoadTime,
            "readyTime":this.onReadyTime,
            "startStreamTime":this.startPullUrlTime,
            "playerFirstTime":this.onPlayerFirstTime,
            "routeduration":loadTime,
            "readyduration":readyTime,
            "loadToPlayerFirstDuration":time,
            "totalduration":totalTime,
            "streamDuration":streamDuration,
            "watchLiveDuration":this.watchLiveDuration,
            "isPreFetchUrl":Boolean(this.prePullUrl && this.preLiveStatus === 0),
            "preFetchUrl":this.prePullUrl,
            "isThroughHide":this.hasOnHide
          });
            this.hasTrackRecord = true
          //   wx.showToast({
          //     title: `${totalTime}---`,
          //     icon: 'none'
          //  })
				}
				this.setData({
					loadingStatus: 2
			  })
        }
        
        if(detail && detail.code == 2004){
            wx.hideLoading();
            //this.networkToast();
            this.handleVideoPlayToast();
            if(DeviceUtil.isMacOS()){
              this.setData({
                showVideoImage: false
              })
            }
           
            if(this.isChangingQuality){
                wx.showToast({
                    title: '切换成功',
                    icon: 'none'
                })
                this.isChangingQuality = false;
            }
				}
				if(detail && detail.code == 2009){
					// 使用正则表达式匹配宽度和高度
					const regex = /resolution:(\d+)x(\d+)/;
					const match = detail.detail.message.match(regex);
					if (match) {
							const width = match[1];  // 第一个捕获组中的宽度
							const height = match[2]; // 第二个捕获组中的高度
							console.log("宽度:", width);
							console.log("高度:", height);
							this.handleLiveVideoInfo(width,height,'live');
					} else {
						  this.setData({
                 showVideoImage: false
               })
							console.log("未找到宽度和高度信息");
					}
				}
        if(detail && (detail.code == 2007  ||  detail.code == 2103 || detail.code == 3005 || detail.code==2101 || detail.code==2102)){
            wx.showLoading({
              title: `加载中`,
              icon: 'none'
            });
            this.setData({
              showVideoImage: false
            })
            LiveUtil.sendUbtTrace('o_live_wx_error_code',{
              live_error_code: detail.code
            });
            LiveUtil.sendUbtTrace('o_live_wx_error_code',{
              live_error_code: detail.code
            });
        }
        if(detail && detail.code == -2301){
            wx.hideLoading();
            if(this.isChangingQuality){
                wx.showToast({
                    title: '切换失败',
                    icon: 'none'
                })
                this.isChangingQuality = false;
                this.setData({
                    pullStreamUrl: this.preQualityStream,
                    streamType:this.preQualityStream.indexOf('rtmp')>=0?'rtmp':'hls',
                    currentQuality: this.preQualityStreamIndex
                })
            } else {
                self.setData({
                    loadingStatus: 3
                })
            }

        }
        if(detail && detail.code == 6000){ //进入后台
            // this.setData({
            //     showVideoImage: true
            // })
        } 
        if(detail && detail.code == 2105  && (self.data.pullStreamUrl.indexOf('_fast500') < 0 || self.data.pullStreamUrl.indexOf('_fastSD') < 0)){ //当前视频播放出现卡顿
            if(this.badwifiToastLeftTime <= 0){
                wx.showToast({
                    title: '当前网络较差，建议您切换清晰度',
                    icon: 'none',
                    duration: 3000
                })
                this.badwifiToastLeftTime = 10000;
                this.handleBadWifiToast();

            } 
            // 添加埋点
            LiveUtil.sendUbtTrace('o_live_wx_not_fluent',{
              not_fluent_count: 1
            });
            
        }
        if(detail && detail.code == 2002 && !this.pullLog){ 
            cwx.sendUbtByPage.ubtDevTrace('o_gs_ctrip_live_tech_liveroom_invoke_startplay', {
                source: this.source
            })
            this.pullLog = true;
        }
       // console.log("videoNetChange code", detail.code);
    },

    handleBadWifiToast: function (){
        this.badwifiToastTimer = setInterval(()=>{
            this.badwifiToastLeftTime = this.badwifiToastLeftTime - 1000;
            if(this.badwifiToastLeftTime == 0){
                clearInterval(this.badwifiToastTimer);
                this.badwifiToastTimer = null;
            }
        },1000)
    },

    //网络状态发生变化 & 获取视屏流宽高
    videoNetChange: function(e){
				let info = e && e.detail && e.detail.detail && e.detail.detail.info  && e.detail.detail.info || {};
        let netQualityLevel = info.netQualityLevel || 0;
				this.netQualityLevel = netQualityLevel;
				//处理视频流
				// this.handleLiveVideoInfo(info.videoWidth,info.videoHeight,'live')
        //console.log("videoPlayvideoNetChange",e.detail);
        let startStreamRateTrackTime = 0;
        let currentTime = new Date().getTime();

        if(this.streamRateArr && this.streamRateArr.length > 0){
            startStreamRateTrackTime = this.streamRateArr[0].timeStamp;
        } else {
            startStreamRateTrackTime = currentTime;
        }

        let timeGap = this.handleTimeGap(startStreamRateTrackTime,currentTime );
        this.streamRateArr.push({
            videoBitrate: parseInt(info.videoBitrate) || 0,
            audioBitrate: parseInt(info.audioBitrate) || 0,
            timeStamp: currentTime
        })
        if(timeGap >= 10){
            this.handleStreamRateTrack();
        }
		},
		handleLiveVideoInfo:function(width,height,mode){
			if(width==0 || height==0){
				return;
			}
			if(!this.hasComputedWH){
				 if(width/height>=1){//1.固定比例，左右画面铺满，上下适配显示(空白处用深色填充)
					//	2.整体画面居中上移200px
					 this.setData({
						 ['liveConfig.objectFit']:'contain',
						 ['liveConfig.objectVideoFit'] :'contain',
						 ['liveConfig.height'] :(DeviceUtil.windowWidth*height)/width,
						 ['liveConfig.needTop']:true,
						 showVideoImage: false
					 })
					 this.preFillcrop = 'contain';
					}else if(width/height<1 && width/height>10/16){//固定比例，左右画面铺满，上下适配显示(空白处用深色填充)
					// 	wx.showToast({
					// 		title: `2222--${mode}`,
					// 		icon: 'none'
					// })
					this.setData({
						['liveConfig.objectFit']:'contain',
						['liveConfig.objectVideoFit'] :'contain',
						['liveConfig.height'] :(DeviceUtil.windowWidth*height)/width,
						['liveConfig.needTop']:true,
						showVideoImage: false
					})
					this.preFillcrop = 'contain';
				}else if(width/height<=10/16){//固定比例，全屏铺满显示(超出部分画面裁切)
					this.setData({
						['liveConfig.objectFit']:'fillCrop',
						['liveConfig.objectVideoFit'] :'cover',
						['liveConfig.needTop']:false,
						showVideoImage: false
					})
				 this.preFillcrop = 'fillCrop';
				}
				this.hasComputedWH = true
			}
		
      // ['liveConfig.objectFit']:'contain'
		},
		handleVideoLoadedmetadata:function(e){
		 let width = e?.detail?.width;
		 let height = e?.detail?.height;
	   this.handleLiveVideoInfo(width,height,'video');
		},

    networkToast: function(e){
        if(this.networkType.toLowerCase() !== 'wifi' && !this.wifiWarningToast){
            wx.showToast({
                title: '当前非WiFi环境，注意流量消耗~',
                icon: 'none'
            })
            this.wifiWarningToast = true;  //只提示一次
        }

    },

	sendToLocalMessage(message){
    const child = this.selectComponent('.liveMessage');
		child.sendMessage(message)
	},
    reloadWatchLive: function(){
			  this.hasComputedWH = false;
        this.setData({
            loadingStatus: 0,
            pullStreamUrl: '',
            streamType:''
        })
        this.watchLive();
    },
  

    changePullStream: function(message){
        let transCode = message.transCode || {};
        let url = transCode.wxStreamUrl;
        if(url){
            this.setData({
                pullStreamUrl: url,
                streamType:url.indexOf('rtmp')>=0?'rtmp':'hls'
            })
        }
    },

   

    fetchRecommendList: function(){
        if(this.selectComponent('.webcast-recommend')){
            this.selectComponent('.webcast-recommend')._getVideoList();
        }
    },
    //更多直播埋点
    doRecommendListTrace: function(e){
        let detail = e && e.detail;
        let actionCode = detail.actionCode || '';
        let liveID = detail.liveID || '';
        let liveStatus = detail.liveStatus || 0;
        let liveStatusText = '';
        // let innersource = detail.innersource || '';
        if(liveID == this.liveID){
            liveStatusText = this.liveStatusText;
        } else {
            liveStatusText = this.handlePageType(liveStatus).liveStatusText;
        }
        let ubtObj = {
            liveID: liveID,
            liveState: liveStatusText,
        }
        // if(innersource){
        //   ubtObj.innersource =innersource
        // }
        if(actionCode){
            LiveUtil.sendUbtTrace(actionCode,ubtObj);
        }
        
    },
    changeToolPanel: function(e){
       if(this.selectComponent('.more-tool')){
        this.selectComponent('.more-tool').changeToolPanel()
       }
    },

    //播放器进入小窗
    enterpictureinpicture: function(e){
        cwx.sendUbtByPage.ubtDevTrace('o_gs_ctrip_live_tech_floatview_show', {})
    },

    //播放器退出小窗
    leavepictureinpicture: function(e){
        cwx.sendUbtByPage.ubtDevTrace('o_gs_ctrip_live_tech_floatview_hide  ', {})
    },

    handleVideoPlayToast: function(){
        let wifiToastTime = wx.getStorageSync('LP_WEBCAST_PREVIDEOPLAYTOAST') || 0;
        let currentTime = new Date().getTime();
        if(currentTime - wifiToastTime >  24*60*60*1000 ){
            wx.getNetworkType({
              success (res) {
                if(res.networkType.toLowerCase() !== 'wifi' ){
                    wx.showToast({
                        title: '当前非WiFi环境，请注意网络使用情况',
                        icon: 'none'
                    })
                    wx.setStorage({
                      key: "LP_WEBCAST_PREVIDEOPLAYTOAST",
                      data: currentTime
                    })
                }
              }
            })
            
        }
    },

    //打开声音或者静音
    openVoice: function(){
        let preVideMuted = this.data.preVideMuted;
        this.setData({
            preVideMuted: !preVideMuted
        })
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_ismute', {
            isMute: preVideMuted ? '非静音' : '静音'
        });
    },

    preVideoWaiting: function(e){
        console.log("preVideoWaiting",e)
    },

    preVideoErr: function(e){
        console.log("preVideoErr",e)
        wx.showToast({
            title: '播放失败',
            icon: 'none'
        })
    },
    doGetUserInfo:function(e){
     this.getUserInfo(e?.detail.userId)
    },

    getUserInfo: function(ctripUserID, type){
        let param = {
            ctripUserID: ctripUserID
        }
        let userPanelInfo ={};
        let master = this.data.master;
        searchUserCard(param,(res)=>{
            if(common.checkResponseAck(res)){
                let result = res.data.result || {};
                let userInfo = result && result.userInfo;

                userPanelInfo = {
                    name: userInfo.userName || '',
                    brief: userInfo.signature || '这个人很神秘，什么都没留下。',
                    imageUrl: userInfo.imageUrl || '',
                    vIcon: userInfo.vIcon || '', 
                    followerCount: result.followerCount || 0,
                    followingCount: result.followingCount || 0,
                    isFollow: result.isFollow || false,
                    liveCount: result.liveCount || 0,
                    userUrl: userInfo.userUrl,
                    isSelf: result.selfID == userInfo.ctripUserID ? true : false,
                    ctripUserID: userInfo.ctripUserID,
                    accountType: result.accountType || '',
                    canGroupChat: result.canGroupChat || false,//是否可群聊
                }

                if(ctripUserID == master.masterID){
                    master.isFollow = userPanelInfo.isFollow;
                    master.canGroupChat = userPanelInfo.canGroupChat;
                }
                if(type == 'updateMaster'){
                    this.setData({
                        master: master
                    });
                    if (master.isFollow && master.canGroupChat) {
                        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_follower_gruopChat_show');
                    }
                } else {
                    this.setData({
                        showUserPanel: true,
                        userPanelInfo: userPanelInfo,
                        master: master
                    })
                    LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_userinfo_show', {
                        isLiveUser:  userInfo.ctripUserID == master.masterID ? 1 : 0,
                    });
                    if (master.canGroupChat) {
                        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_gift_gruopChat_show');
                    }
                }
                
            }
        })
    },

    doPanelFollow: function(e){
        let detail = e && e.detail;
        let id = detail.ctripUserID;
        let isfollow = detail.isfollow;
        let master = this.data.master;
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_userinfo_follow', {
            follow: isfollow ? 'false': 'true',
            isLiveUser:  id == master.masterID ? 1 : 0,
        });
        if(isfollow){
            this.cancelFollow(id);
        } else {
            this.doFollow(id);
        }
       
    },

    hidePanel: function(){
        let showUserPanel = this.data.showUserPanel;
        this.setData({
            showUserPanel: !showUserPanel
        })
    },
    //展示举报
    showMessageActionPanel:function(e){
      let messageType = e?.detail?.message?.messageType;
      if(messageType==1 || messageType==111||messageType==207){
        this.clipMessage = e?.detail?.message?.originMessage || e?.detail?.message?.message;
        this.setData({
          showActionPanel:true
        })
      }
      
     },
    hideReportPanel:function(){
        this.setData({
          showActionPanel: false
        })
    },
    handleClickReportPanelItem:function(e){
      this.copyToClipBoard();
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_useraction_click',{
        actionType:'复制'
      })
     
    },
    copyToClipBoard: function() {
      let that = this;
      if (wx.canIUse('setClipboardData')) {
          wx.setClipboardData({
              data: `${this.clipMessage}`,
              success: function(res) {
                  wx.getClipboardData({
                      success: function(res) {
                        wx.showToast({
                          title: '复制成功',
                          icon: 'none'
                       })
                         that.setData({
                          showActionPanel:false
                         })
                          

                      }
                  })
              },
              fail:function(res){
                console.log('res+++++',res)
                wx.showToast({
                  title: `复制失败`,
                  icon: 'none'
                }) 
              }
          })
      } else {
          wx.showToast({
              title: '亲爱的用户，由于您的微信版本过低，无法使用复制粘贴功能，请尽快前往应用商店更新微信',
              icon: 'none'
          })
      }
  },
 

    handleFollowGuide: function() {
        if (this.data.showFollowGuide || this.selectComponent('.lottery')?.data.lotteryPanelShow) {
            return;
        }

        let needShowFollowGuide = true;
        try {
            let value = wx.getStorageSync('gs_live_room_follow_guide'+this.data.liveID)
            if (value) {
              let obj = JSON.parse(value);
              let now = new Date().getTime();
              if (now - obj.date < 3600 * 24 * 1000) {//24 小时同一个直播间只显示一次
                needShowFollowGuide = false;
              }
            }
          } catch (e) {
            // Do something when catch error
          }
        if (!needShowFollowGuide) {
            return;
        }

        clearTimeout(this.followGuideCountDownTimer);
        this.followGuideCountDownTimer = setTimeout(() => {
            if (this.data.master.isFollow) {
                return;
            }
            this.setData({
                showFollowGuide:true,
            });
            try {
                let value = JSON.stringify({
                    show:true,
                    date: new Date().getTime()
                })
                wx.setStorageSync('gs_live_room_follow_guide'+this.data.liveID, value);
                cwx.sendUbtByPage.ubtDevTrace('o_gs_ctrip_live_tech_follow_guide_show', {
                    date: new Date().getTime(),
                    liveID:this.data.liveID
                })

                cwx.sendUbtByPage.ubtTrace('o_gs_tripshoot_lvpailive_guide_show', {
                    liveID:this.data.liveID
                });

              } catch (e) { }
            this.removeFollowGuideTimer();
        }, 1000 * 60);
    },

    removeFollowGuideTimer: function() {
        clearTimeout(this.followGuideCountDownTimer);
    },

    continueFollowGuideTick:function(){
        if (this.data.showFollowGuide) {
            const followGuide = this.selectComponent('.follow-guide');
            followGuide && followGuide.continueTick();
        }
    },

    doGuideFollow: function(e){
        let detail = e && e.detail;
        let id = detail.ctripUserID;
        let isfollow = detail.isfollow;
        if(isfollow){
            this.cancelFollow(id);
        } else {
            this.doFollow(id);
        }
       
    },

    hideFollowGuide:function() {
        let showFollowGuide = this.data.showFollowGuide;
        this.setData({
            showFollowGuide: false
        })
        cwx.sendUbtByPage.ubtDevTrace('o_gs_ctrip_live_tech_follow_guide_hide', {
            date: new Date().getTime(),
            liveID:this.data.liveID
        })
    },
   //展示个人信息
    showMessageUserPanel:function(e){
        let detail = e && e.detail;
        let id = detail.ctripUserID;
        this.getUserInfo(id);
    },
    

    //取消关注
    cancelFollow: function(id){
        let param = {
            toCtripUserID:id
        }
        let toast = '';
        let userPanelInfo = this.data.userPanelInfo;
        let master = this.data.master;
        cancelFollowUser(param,(res)=>{
            if(common.checkResponseAck(res)){
                toast = '已取消关注';
                userPanelInfo.isFollow = false;
                userPanelInfo.followingCount--;
                if(master.masterID == id){
                    master.isFollow = false;
                }
                this.setData({
                    userPanelInfo: userPanelInfo,
                    master: master
                })
            } else {
                toast = '取消关注失败';
            }
            wx.showToast({
                title: toast,
                icon: 'none'
            })
        })
    },

 

  shelvesBannerClick: function (params) {
    let e = params?.detail?.detail
    this.liveGoodsId = e.currentTarget.dataset.id || 0;
    let url = e.currentTarget.dataset.item.wxUrl || '';
    let coupon = e.currentTarget.dataset.coupon || '';
    let index = e.currentTarget.dataset.index || '';
    let salestatus = e.currentTarget.dataset.salestatus;
    if (salestatus == 2 || salestatus == 3 || salestatus == 4) {
      return;//2:待开抢；3:已抢光；4:已下架 ，不可点击
    }
    this.sendChatroomMessages(107);
    if(this.selectComponent('.goods-list')?.data.hasClickSearchIcon){
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_searchresult_click', {
        goodID: this.liveGoodsId,
        index: e.currentTarget.dataset.item.index,
      });
     
    }else{
      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_shelfcard_click', {
        cardID: this.liveGoodsId,
        cardorder: index,
        index: e.currentTarget.dataset.item.index,
      });
    }
   

    this.shelvesCardClick(coupon, url)
  },


    // 福袋面板逻辑结束

    jumpToUserHome: function (e) {
        let detail = e && e.detail;
        let id = detail.ctripUserID;
        let url = detail.url;
        let type = detail.type;
        let master = this.data.master;
        let userPanelInfo = this.data.userPanelInfo;

        let actionCode = 'c_gs_tripshoot_lvpailive_userinfo_usercenter';
        if(type == 'usericon'){
            actionCode = 'c_gs_tripshoot_lvpailive_userinfo_usericon';
        } else if(type == 'username'){
            actionCode = 'c_gs_tripshoot_lvpailive_userinfo_username';
        } else if(type == 'userbrief'){
            actionCode = 'c_gs_tripshoot_lvpailive_userinfo_selfintroduction';
        }
        let isMaster = id == master.masterID ? true : false;
        LiveUtil.sendUbtTrace(actionCode, {
            isLiveUser: isMaster ? 1 : 0,
            UID: isMaster ? userPanelInfo.ctripUserID : '',
            usertype: isMaster ? userPanelInfo.accountType : '',
        });
        if(url){
            this.setData({
                showUserPanel: false
            })
            if(master.masterID == id){
                this.isJumpToMaster = true;
            }
            url = url +'&isMini=2';
            common.jumpToDetail(url);
        }
            
    },

    //连麦的时候画面要变
    handleLiveConfig: function(message){
       
        // let liveConfig = this.data.liveConfig;
        let objectFit = '';
        let msg = message && message.liveMessage && message.liveMessage.message;

        try{
            msg = JSON.parse(msg);
        } catch(e){
            msg = {};
        }
        if(!msg || msg.action != 204 ){
            return
        }

        let busy = msg.busy;

        if(busy == null || busy == undefined)
        {
            return
        }

        if(busy === 1){ //开始连麦
            objectFit = 'contain';
        } else if(busy === 0){  //结束连麦
           
            objectFit = this.preFillcrop;
        }

        // liveConfig.objectFit = objectFit;

        this.setData({
					 ['liveConfig.objectFit']:objectFit
            // liveConfig: liveConfig
        })


    },
    destroyGoodsFilterTabExpo:function(index) {
      // console.log('index======>',index,this[`_observer${index}`])
        if (this[`_observer${index}`]) {
          this[`_observer${index}`].disconnect();
        }
      
    },
  
    jumpToBagInfo: function (e) {
       LiveUtil.jumpToBagInfo(e)
    },
    handleStreamRateTrack: function(){
        let totalVideoBitrate = 0;
        let totalAudioBitrate = 0;
        let streamRateArr = this.streamRateArr;
        let arrLen = streamRateArr.length;
        
        if(arrLen <= 0){
            return
        }

        let endStreamRateTrackTime = streamRateArr[arrLen-1].timeStamp;
        let startStreamRateTrackTime = streamRateArr[0].timeStamp;
        let timeGap =  this.handleTimeGap(startStreamRateTrackTime, endStreamRateTrackTime);
        
        streamRateArr.map((item,index) => {
            totalVideoBitrate += item.videoBitrate;
            totalAudioBitrate += item.audioBitrate;
        })
        totalVideoBitrate = Math.ceil(totalVideoBitrate/arrLen);
        totalAudioBitrate = Math.ceil(totalAudioBitrate/arrLen);

        let qualityList = this.data.qualityList;
        let currentQuality =  this.data.currentQuality;
        let playProgressive = "RAW";
        if(currentQuality > -1){
            playProgressive = qualityList[currentQuality].pixels;
        }
        //DataUsage#流量=（视屏码率+音频码率）/ 8 * 时间（秒）
        //let dataUsage = timeGap*totalVideoBitrate/8/1024 + timeGap * totalAudioBitrate;
        let dataUsage  = totalVideoBitrate + totalAudioBitrate;
        let traceParam = {
            liveID: this.liveID,
            liveState: this.liveStatusText,
            playerType: 0,
            videoRate: totalVideoBitrate,
            audioRate: totalAudioBitrate,
            DataUsage: Math.ceil(timeGap * dataUsage/8),
            TimeGap: timeGap,
            cloudSource: 'Tencent',
            mediaUrl: this.data.pullStreamUrl,
            PlayProgressive:  playProgressive,
            StartEndTime: common.formateTime(startStreamRateTrackTime) +'-' + common.formateTime(endStreamRateTrackTime)
        };
        if(timeGap > 0) {
            LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_mediaPlayer_streamRate', traceParam);
        }
        this.streamRateArr = [];
    },

    handleTimeGap: function(startStreamRateTrackTime, endStreamRateTrackTime){
        let timeGap = 0;
        let endTimeSec = new Date(endStreamRateTrackTime).getSeconds();
        let startTimeSec = new Date(startStreamRateTrackTime).getSeconds();
        if(endTimeSec >= startTimeSec){
            timeGap = parseInt(endTimeSec) - parseInt(startTimeSec); 
        } else {
            timeGap = parseInt(endTimeSec) + 60 - parseInt(startTimeSec);
        }

        return timeGap;
    },
    // 被踢出直播间 
    handleOutRoomData:function(data){
      let resultStatus = data.resultStatus || {};
      if(resultStatus.code == 401 || resultStatus.code == 402){
        wx.showToast({
          title: resultStatus.msg || '你已被主播请出直播间',
          icon: 'none',
        })
        let wxurl ='https://m.ctrip.com/webapp/you/live/webcast/home?isHideHeader=true&isHideNavBar=YES&navBarStyle=white&autoawaken=close&popup=close'
        if (__global.env.toLowerCase() === 'uat') {
          wxurl = 'https://https://m.uat.qa.nt.ctripcorp.com/webapp/you/live/webcast/home?isHideHeader=true&isHideNavBar=YES&navBarStyle=white&autoawaken=close&popup=close'
        } else if (__global.env.toLowerCase() === 'fat') {
          wxurl = 'https://m.ctrip.fws.qa.nt.ctripcorp.com/webapp/you/live/webcast/home?isHideHeader=true&isHideNavBar=YES&navBarStyle=white&autoawaken=close&popup=close';
        }
        var data={
          url:encodeURIComponent(wxurl),
          needLogin:false,
          isNavigate:true,
          loginErrorUrl:encodeURIComponent(wxurl)
        }
        wxurl = '/cwx/component/extraCweb/cweb1?data='+JSON.stringify(data)
        setTimeout(()=>{ // 跳转到直播频道页面
          cwx.redirectTo({
            url:wxurl
          })
          // cwx.navigateBack();
        },800)
        return true;
      }
    },
    //付费直播间
    handlePayRoomData: function(data){
        let resultStatus = data.resultStatus || {};
        let liveInfo = data.liveInfo || {};
        let popBoxContent = {};
        let showPopBox = false;
        let isPayLiveRoom = false;
        if(resultStatus.code == 301 && resultStatus.msg && liveInfo.liveStatus == 0){ //直播中才去判断是否需要付费
            popBoxContent = {
                title: resultStatus.msg || '',
                cancelBtn: '取消',
                confirmBtn: resultStatus.text || '',
                jumpUrl: resultStatus.jumpUrl || ''
            };
            showPopBox = true;
            isPayLiveRoom = true;
        }
        this.setData({
            popBoxContent: popBoxContent,
            showPopBox: showPopBox,
            isPayLiveRoom: isPayLiveRoom
        })
    },

    //关闭直播间
    hidePayRoomPopBox: function(){
        if (cwx._wxGetCurrentPages.length > 1) {
            cwx.navigateBack();
        } else {
            cwx.switchTab({
              url: "/pages/home/homepage",
          });
        }
    },

    //去付费
    jumpToPayRoom: function(){
        let isLogin = cwx.user.isLogin();
        let url = this.data.popBoxContent.jumpUrl;
        if(isLogin){
          LiveUtil.jumpToProductItem(url);
        } else {
            this.toLogin();
        }
    },
    
    //watchLive重构时候调用此接口，刚进直播间和登陆后需要调用
    doJoinChatRoom: function(){
        let param = {
            liveID: this.liveID
        }
        joinChatRoom(param,function(res){
            console.log("doJoinChatRoom",res)
        })
    },

    handleCommentState: function(result,type){
        let isLogin = cwx.user.isLogin(),
		   	bottomInput = '说点什么吧';
        if(!isLogin){
          bottomInput = '登录参与直播互动';
        }

        //评论开关
        let commentState = result.functionSwitch && result.functionSwitch.comment || 0; //功能开关, 0：主播开启，1：平台开启 2：主播关闭，3:平台关闭
        if(commentState == 3 || commentState == 2){
            bottomInput = '暂不支持评论';
        }
        this.commentState = commentState;
        if(type && type == 'RELOADDATA'){
            let child = this.selectComponent('.liveMessage');
            child&&child._updateCommentMessage(commentState)
        }
        return bottomInput;


    },

    handleCommentStateToast: function(){
        let commentState = this.commentState;
        let toast = '暂不支持评论';
        if(commentState == 2 ){
            toast = '主播已关闭直播间评论';
        }
        wx.showToast({
            title: toast,
            icon: 'none'
        })
    },
    getCurrentCity(){
      const cachedCityInfo = cwx.locate.getCachedCtripCity(); 
      let cityId = 0;
      if (cachedCityInfo && cachedCityInfo.data) {
         const {CityID=0} = cachedCityInfo.data.CityEntities[0];
         if(CityID === 0){
           CityID = this.CityInfo.cityId;
        }
        cityId = CityID;
      }else if(CityInfo.cityId != 0){
        cityId = CityInfo.cityId
      }
      CityInfo.cityId = cityId
      console.log("城市ID",cityId);
      return cityId;
    },
    // 乐高组件的回调
    clickHandlersCallback:function(e){
      if(e?.detail?.component){
        let {name} =e?.detail?.component;
        if(name=='diyField_explainStatus'){// 进行跳转
          let {position,index,id} = e?.detail?.product;
          // 求讲解
          if (!cwx.user.isLogin()) {
            this.toLogin();
            return;
         }
         //调用子组件的askToExplain 方法
         this.selectComponent('.goods-list')?.askToExplain({
            currentTarget:{
              dataset:{
                id,
                index,
                position
              }
            }
          });
        }else if(name=='diyField_toAskQuestions'){
          // 唤起键盘 关闭货架
          this.toAskQuestions = true;
          this.selectComponent('.goods-list')?.hideShopWraper();
          this.toAskQuestionsData = e?.detail?.product || {};
        
        this.toAskQuestionsData.title = this.toAskQuestionsData?.title?.replaceAll?.('\n', '') ||'';
        
          this.toInputFocus('toAskQuestions')
          LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_goodsask_click');
        }else{
          let {coupon,saleStatus,index,url,id,cardType} = e?.detail?.product;
          let clickposition = e?.detail?.clickposition;
          if(clickposition){// 推送商卡
            this.doCard({
              detail:{
                id,
                url,
                coupon,
                index,
                cardType,
                clickposition
              }
            })
          }else{// 货架列表
              // 去抢购
              this.doShopping({
                currentTarget:{
                dataset:{
                  id,
                  url,
                  coupon,
                  index,
                  salestatus :saleStatus,
                  clickposition: 'goodsitem'
                }
                }
              })
          }
         
        }
      }
    
    },

    handleDefaultRecommendCard:function(e){
        this.selectComponent('.liveMessage')?.handleDefaultRecommendCard(e?.detail)
    },
    // bindchange:function(e){
    //   // let {current}=e?.detail;
    //   // this.liveID = this.data.ListItems[`${current}`]?.liveId;
    //   // this.setData({
    //   //   pageType:0, //销毁视屏
    //   //   videoSwiperCurrent:current,
    //   //   liveID:this.liveID
    //   // },()=>{
    //   //   // 请求该直播间id的接口
    //   //     this.watchLive();
    //   // })
      

    // },

    upDateDisplayList:function(type,direction){ // 登陆的时候不需要在进行
          let displayList = [];
          displayList[this.currentIndex] = this.list[this.index];
          displayList[this.currentIndex-1 == -1 ? 2:this.currentIndex-1] = this.list[this.index-1 == -1 ? this.list.length-1 : this.index -1];
          displayList[this.currentIndex+1 == 3 ? 0:this.currentIndex+1]= this.list[this.index+1 == this.list.length ? 0 : this.index+1];
          if(type=='change'){
						this.liveID = displayList[this.currentIndex]?.liveId;
						this.hasComputedWH = false;
						this.goodsId = null;
            // let circular = (this.index==0 || this.index+1 ==this.list.length)? false:true;

            this.setData({
              // circular:circular,
              // duration:(this.index==0 || this.index==1 || this.index==this.list.length-1 || this.index==this.list.length-2) ? 0: 500,
              displayList,
              pageType:0, //销毁视屏
              videoSwiperCurrent:this.currentIndex,
              liveID:this.liveID,
              showVideoImage: true, //是否显示视频封图
              showFollowGuide:false,
              loadingStatus: 0,
              isFocused: false, 
							['liveConfig.objectFit']:'fillCrop',
							['liveConfig.objectVideoFit'] :'cover',
							['liveConfig.needTop']:false
            },()=>{
              clearTimeout(this.followGuideCountDownTimer);
              this.handleFollowGuide();
              this.continueFollowGuideTick(); 
							this.hasTrackRecord=false;
              this.routeTime = this.onLoadTime = new Date().getTime();
              console.log('xixixibindchange',this.liveID)
               if(type=='change'){
                //  if((this.index==1||this.index==this.list.length-1) && direction=='down'){
								// 	this.firstnimationfinish = 1;
                //   this.watchLive('SWIPER');
								//  }
								//  if((this.index==0 || this.index==this.list.length-2) && direction=='up'){
								// 	this.firstnimationfinish = 1;
								// 	this.watchLive('SWIPER');
								//  }
							
               }
            });
          }else{ // 第一次获取
              this.setData({
                displayList,
              },()=>{
                this.hasFirstLoad = true
              });
          }
         
    },
    bindchange:function(e){
      if(e.detail.source=='touch'){
        this.firstnimationfinish = 0;
        let current = e.detail.current;
        if(this.currentIndex-current==2 || this.currentIndex-current==-1){ //向下滑动分页请求
          if(this.index + 1 == this.list.length){ // 向下边界感
            this.setData({
              current:this.currentIndex
            })
            return;
          }
          this.index = this.index + 1 == this.list.length ? 0 : this.index + 1;
          this.currentIndex = this.currentIndex + 1 == 3 ? 0 : this.currentIndex + 1;
          if(this.index==this.list.length-2 && this.hasMore){// 只会执行一次
            console.log('xixix请求下一页')
           this.getLiveSlideList('change')
          }else{
            this.upDateDisplayList('change','down');
          }
        }else if(this.currentIndex-current==-2 || this.currentIndex-current==1) {
          if(this.index - 1 == -1){// 向上边界感
            this.setData({
              current:this.index
            })
            return;
          }
          this.index = this.index - 1 == -1 ? this.list.length-1 : this.index - 1;
          this.currentIndex = this.currentIndex-1 == -1 ? 2 : this.currentIndex - 1;
          this.upDateDisplayList('change','up');
        }
      }
        
    },
    
		bindanimationfinish:function(e){
      console.log('xixixibindfinish++++++++',this.firstnimationfinish);
			if(e.detail.current==this.data.videoSwiperCurrent && (this.firstnimationfinish==1 || this.firstnimationfinish==2)){
				return;
      }
       /**********
       * 1. 滑倒A直播间
       * 2. 执行xixixiWatchlive
       * 3. 滑倒B直播间  执行xixixibindchange （新的直播间）
       * 4. 请求了A直播间的接口 xixixi消息++++
       * 5. A直播间的接口 把this.liveID 换成了老的
       * 6. 执行B直播间的bindanimationfinish。 此时拿到的liveID是A老的A直播间livId，
       * 解决方案: this.liveID=this.data.displayList[this.currentIndex]?.liveId (替换B最新的liveId)
       */
      this.liveID=this.data.displayList[this.currentIndex]?.liveId;
			this.firstnimationfinish = 1;
      console.log('xixixibindfinish',this.liveID);
      let circular = (this.index==0 || this.index+1 ==this.list.length)? false:true;
      this.setData({
        circular
      },()=>{
        this.routeTime = this.onLoadTime = new Date().getTime();
        this.onReadyTime = new Date().getTime();
        this.watchLive('SWIPER'); // 滑动过程中无需请求接口
      })
      
		}
})
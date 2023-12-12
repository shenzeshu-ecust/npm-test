/*
 * @Auth: hyr
 * @Date: 2022-03-21 15:11:58
 * @LasEditors:
 * @LastEditTime: 2022-04-02 10:16:37
 * @Description: 天天领红包
 */
import { cwx, CPage, __global } from '../../../../cwx/cwx';
import {
  contentFissionSaveUserInfo,
  getDetailInfo,
  contentFissionAssistEntrance,
  contentFissionAssist,
  contentFissionReceiveAward,
  contentFissionInvite,
  contentFissionGenerateReport,
  getContentFissionCashDialogInfo,
  qyGetGroupEntryQrCodeWithUid
} from './service/request';
import Alarm from './service/alarm.js';
cwx.config.init();
let APP = getApp();
const AUTH_KEY = 'addTrafficActivity_wx_auth';
const AUTH_USERINFO_KEY = 'addTrafficActivity_wx_userInfo';
const LOAD_KEY = 1;
let that = null;
const convertToString = (obj) => {
  if (typeof obj == 'string') {
    return obj;
  }
  if (typeof obj != 'object') {
    return '';
  }
  var string = '';
  for (var item in obj) {
    string += item + '=' + (obj[item] || '') + '&';
  }
  return string.substring(0, string.lastIndexOf('&'));
};
CPage({
  //introTimer:null,
  //taskIntroTimer:null,
  countDownTimer:null,
  timeClock:null,//邀请弹窗计时器
  isGuideShare:false,//是否点了无门槛弹窗上的邀请
  pageId: '10650079250',
  cachePopList: [], //
  isCallBackFlag: false,
  data: {
    rollInfoList:[],//左上角轮播
    //showIntro:false,//展示邀请引导浮标
    //showTaskIntro:false,//展示task_sort邀请任务置顶时引导浮标
    lookDialogType:'',//浏览任务里当前正在展示的弹窗 笔记|榜单
    extraData:null,
    // countdown:0,
    navbarData: {
      title: '天天领现金', // title名称
      showCapsule: true, // 是否显示左上角小房子
      showBack: true, // 是否显示返回按钮
      iconColor: 'white', // 左侧icon颜色
      titleColor: '#000000', // 指定title具体色值
      customHome: true, // 是否自定义返回Home事件
      customBack: true, // 是否自定义返回事件
    },
    waterfallCallback: function (item) {
      let wxUrl=item?.jumpurl||'';
      const { userInfo } = that.data;
      that.ubtTrace('c_gs_tripshoot_cashCampaign_article_click', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        actiontype: 'Click',
        actioncode: 'c_gs_tripshoot_cashCampaign_article_click',
        actionName: '点击笔记',
      });
      if (that.data?.userInfo?.taskStatus == 6) {
        //活动太火爆了
        // wxUrl = item?.jumpurl;
      } else {
        wxUrl=wxUrl.includes('?')?`${wxUrl}&wxpopup=201&inpopup=true&_mktTaskActivityId=317sqhb&scene=ttlxj`:`${wxUrl}?wxpopup=201&inpopup=true&_mktTaskActivityId=317sqhb&scene=ttlxj`
      }
      if (wxUrl.indexOf('https://') >= 0 || wxUrl.indexOf('http://') >= 0) {
        // 跳转H5页面
        cwx.component.cwebview({
          data: {
            url: encodeURIComponent(wxUrl)
          }
        })
      }else{
        let url=(wxUrl && wxUrl[0]=='/')?wxUrl:`/${wxUrl}`
        cwx.navigateTo({
          url
        })
      }
      
    },
    options: null, //链接携带的参数
    source: 'bank',
    appId: '99999999',
    ignoreLocation: true,
    className: 'waterfall-content',
    style: 'margin-bottom: 100px;',
    globalInfo: {},
    hotelInfo: {},
    extra: '',
    showRetainPop: false, //挽留弹框
    showRule: false, // 规则弹框
    // showAllTasksPop: false, //更多任务弹框
    showPostSuccessPop: false, //发布笔记成功弹框
    showJoinEnterpriseWechatPop: false, //成功弹框
    showNotLoginRedEnvelopes: false, //未登录用户红包
    showRedEnvelopes: false, // 助力红包||携程红包
    showRedEnvelopesTips: false, // 昨日好友助力弹框
    showNumberIsFull: false, // 助力人数已满4人弹框
    showBlacklistTips: false, // 黑名单提示框
    showSubscribePop: false, //消息订阅提示
    showShareSuccess: false, // 分享成功弹框
    showSlipVerificationPop: false, // 滑块验证
    activitySettings: {}, // 通用配置
    assistFriendsList: [], // 邀请助力情况
    showNewUserWithDrawMoney: false, //展示新人福利
    showSharePop: false, //展示分享弹框
    showInviteTimelineSuccess: false, //海报保存弹框
    //canIUse: wx.canIUse('getUserProfile'), // 用来标识授权用户信息的API
    isLogin: cwx.user.isLogin(), // 是否登录携程账号
    isWxAuthed: false, // 是否授权过微信授权,如果授权过，7天之内，不再显示让用户授权，默认七天之内没有授权过
    cashBalance: 0,
    cashBalanceNew: null,
    userInfo: {},
    activitySettings: {}, // 运营配置
    redEnvelopesInfo: {},
    subscribeId: null, // 订阅组件id
    subscribeReceiveId: null, // 领取订阅组件id
    browseNoteId: null, // 浏览组件id
    toViewDom: null,
    posterImg: null, // 海报url
    showFavoriteCard: false, // 收藏成功提示
    isSubscription: null, //是否订阅消息
    dingyueTaskId: '', //订阅任务id
    showMoreTask: false, // 显示更多任务
    finishInviteAmount: 0, // 邀请好友可获得金额
    couponName: '', //
    assistAmount: 0, //
    showLoginedAssistInfo: false, //
    isAndroid: false, //是否是安卓手机
    showCommonTaskPop: false, // 通用任务弹窗
    taskInfo: null, //
    isQwAssistSuccess:false, //是否走企微助力成功
    guideShareStep: 1, //无门槛红包
    showShareGuideMain: false,// 
    autoChoseCount: 4,
    remainTimeObj: null, //邀请弹窗倒计时
    // ABTestingManager: "B", // AB实验 ，默认A
    windControl: 0, // 是否是风控状态 0 初始态、 1 非 、2 是
  },
  getTaskList(e) {
    const { taskList } = e.detail;
    this.setData({
      showMoreTask: taskList && taskList.length > 1,
    });
    console.log('taskList 任务组件返回的数量--------- getTaskList:', taskList.length);
  },
  async onLoad (options) {
    console.clear()
    console.log('路由参数', options);
    console.log('env----------------------------:', __global.env);
    that = this;
    //补entryId
    if (options.toUrl) {
      cwx.navigateTo({
        url: decodeURIComponent(options.toUrl)
      })
    }else if(options.entryId){
      cwx.setStorageSync('you_addactivity_entryid', options.entryId);
    }else{
      const mPage=cwx.getCurrentPage() 
      let cacheEntryId=cwx.getStorageSync('you_addactivity_entryid')||'c7c883eca151424e8181ebad71f0d7e7'
      let url=`/${mPage.route}?entryId=${cacheEntryId}${this.jsonToString(mPage.options)}`
      cwx.redirectTo({
        url
      })
      return
    }
    this.setData({
      options,
      tempId: __global.env == 'fat' ? '517hbdy' : '317sqhbdy',
      subscribeId:
        __global.env == 'uat'
          ? 102740
          : __global.env == 'fat'
          ? '103336'
          : '151282',
      taskAssistTempid:__global.env == 'uat'?'317sqhb': __global.env == 'fat' ? 'nrlbtask2' : '317sqhb', //主动领取任务组件页面code
      taskAssistCompid:
        __global.env == 'uat'
          ? 103038
          : __global.env == 'fat'
          ? '103412'
          : '172365', //主动领取任务组件id
      browseNoteId:
        __global.env == 'uat'
          ? 103037
          : __global.env == 'fat'
          ? '103411'
          : '151415', //浮层任务组件id
      taskListTempId: __global.env == 'uat'?'317sqhb': __global.env == 'fat' ? 'nrlbtask2' : '317sqhb', //浮层任务组件页面code
      pageBrowseNoteId:
        __global.env == 'uat'
          ? 103037
          : __global.env == 'fat'
          ? '105354'
          : '218375', //页面任务组件id
      pageTaskListTempId:  __global.env == 'uat'?'317sqhb':__global.env == 'fat' ? 'nrlbtask3':  '317sqhb3', //页面任务组件页面code
      iconTaskTempid:'317widget',
      iconTaskCompid: __global.env == 'fat'?'105882':'228836',
      iconTaskChannelCodeOne: __global.env == 'fat'?'W5T3O6L664':'YCU6KOX676',
      iconTaskChannelCodeTwo: __global.env == 'fat'?'N316OVM72X':'57GQWDNCWT'
    });
    this.initAuthInfo();
    if(!cwx.user.isLogin()) {
      this.getDetailInfo();
    } else {
      setTimeout(() => {
        if(!this.isCallBackFlag) {
          this.getDetailInfo();
        }
      }, 1500);
    }
    this.saveTipsShow();
    //获取企微群码
    this.qyGetGroupEntryQrCodeWithUid()
  },
  onUnload() {
    cwx.Observer.removeObserverForKey('mkt_webview_h5_task_event_ttlxj');
  },
  jsonToString(data){
    let result='';
    for(var i in data){
      result+=`&${i}=${data[i]}`;
    }
    return result
  },
  onShow() {
    if (this.data.userInfo.taskStatus == 1) {
      console.log('onShow----调用首页接口');
      this.getDetailInfo(true);
    } else {
      console.log('onShow----不调用首页接口');
    }
    this.showShareSuccessPop();
    // 查看storage中有没有昵称和头像，如果有，直接取出来传给接口 start
    let _info = wx.getStorageSync(AUTH_USERINFO_KEY);
    const self = this;
    if (cwx.user.isLogin() && _info) {
      self.setData({
        isLogin: true,
      });
      try {
        _info = JSON.parse(_info);
        self.getNickNameAvatHandler(_info, LOAD_KEY);
      } catch (e) {}
      wx.removeStorage({ key: AUTH_USERINFO_KEY });
    }
    // 处理用户头像end

    try {
      cwx.Observer.addObserverForKey("mkt_webview_h5_task_event_ttlxj", () => {
        setTimeout(()=>{
          this.setData({
            toViewDom: 'waterfallBox'
          })
        }, 400)
      })
    } catch (error) {}
  },
  onReady: function () { 
    // 获取信息流组件实例
    // this.waterfall = this.selectComponent("#waterfall");
    setTimeout(()=>{
      let mPage=cwx.getCurrentPage()||{}
      //延迟加载定位，防止接口返回后高度变化
      let {options={}}=mPage
      this.setData({
        toViewDom:(options && options.pageSource && options.pageSource==2)?'noteTask':(options && options.pageSource && options.pageSource==3)?'waterfallBox':''
      })
    },1000)
    
  },
  qyGetGroupEntryQrCodeWithUid(){
    let defaultEntryId=__global.env == 'fat'?'137':'c7c883eca151424e8181ebad71f0d7e7'
    const param = {
      entryId:this.data.options?.entryId||defaultEntryId,
      unionId: cwx.cwx_mkt.unionid
    };

    qyGetGroupEntryQrCodeWithUid(param, (res) => {
      if(res.errcode==0){
        const { groupEntryActiveQrCode } = res;
        this.setData({
          groupEntryActiveQrCode
        })
      }
    });
  },
  onMyEvent: function () {
    this.getDetailInfo(true);
  },

  // 瀑布流加载，此方法需与 scroll-view 的bindscrolltolower 绑定
  getWaterfallListMore: function () {
    this.waterfall = this.selectComponent('#waterfall');
    console.log('瀑布流加载', this.waterfall);
    this.waterfall && this.waterfall.getListMore();
  },
  // 自定义头部返回按钮
  onBack() {
    const { userInfo } = this.data;
    let you_retain_pop=cwx.getStorageSync('you_retain_pop')||0,
        newTime=new Date().getTime()||0;
    if(!you_retain_pop || newTime-you_retain_pop>48*3600*1000){
      this.setData({
        showRetainPop: true,
        backType: 'onBack'
      });
      cwx.setStorageSync('you_retain_pop',new Date().getTime())
      this.ubtTrace('o_gs_tripshoot_cashCampaign_retain_expose', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        actiontype: 'Show',
        actioncode: 'o_gs_tripshoot_cashCampaign_retain_expose',
        actionName: '活动挽留弹窗曝光',
      })
    }else{
      this.setData({
        backType: 'onBack'
      },()=>{
        this.closeRetainPop()
      });
    }
  },
  // 自定义头部home按钮
  onHome() {
    const { userInfo } = this.data;
    let you_retain_pop=cwx.getStorageSync('you_retain_pop')||0,
        newTime=new Date().getTime()||0;
    if(!you_retain_pop || newTime-you_retain_pop>48*3600*1000){
      this.setData({
        showRetainPop: true,
        backType: 'onHome'
      });
      cwx.setStorageSync('you_retain_pop',new Date().getTime())
      this.ubtTrace('o_gs_tripshoot_cashCampaign_retain_expose', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        actiontype: 'Show',
        actioncode: 'o_gs_tripshoot_cashCampaign_retain_expose',
        actionName: '活动挽留弹窗曝光',
      })
    }else{
      this.setData({
        backType: 'onHome'
      },()=>{
        this.closeRetainPop()
      });
    }
  },

  //获取更多任务
  async getMoreTasks() {
    const {userInfo } = this.data;
   
    if(userInfo?.taskStatus === 6) {
      this.showToast('活动太火爆了，暂时无法参与，明天再来吧');
      return false
    }
    if (userInfo?.taskStatus == 2) {
      this.toLogin();
      return false
    }
    if (userInfo?.taskStatus == 4) {
      this.showBlacklistTipsPop();
      return false
    }
    contentFissionInvite({  serverFrom: 'miniProgram' }, (res) => {
      console.log('查询 contentFissionInvite 返回值', res)
      const { taskStatus } = res;
      if (taskStatus == 6) {  
        this.showToast('活动太火爆了，暂时无法参与，明天再来吧');
        return false
      } else{
        cwx.navigateTo({url:`/pages/market/web/index?from=https%3A%2F%2Fm.ctrip.com%2Factivitysetupapp%2Fmkt%2Findex%2Ftask_ttlxj`})
      }
    })
    // 跳转之前先判断邀请池; 之前的A逻辑
    this.ubtTraceAndlog(
      'c_gs_tripshoot_cashCampaign_moreTask_click',
      'Click',
      '点击查看更多任务'
    );
  },

  //关闭挽留弹框
  closeRetainPop() {
    this.setData({
      showRetainPop: false,
    });
    if (this.data.backType == 'onBack') {
      cwx.navigateBack();
    } else if (this.data.backType == 'onHome') {
      cwx.switchTab({
        url: '/pages/home/homepage',
      });
    }
  },
  navBack(){
    const pages = getCurrentPages()||[];
    if(pages.length==1){
      cwx.switchTab({ url: "/pages/home/homepage" });
    }else{
      cwx.navigateBack();
    }
    
  },
  //埋点信息及验证打印ubtTraceAndlog
  ubtTraceAndlog(actioncode, actiontype, actionName) {
    const { userInfo, options } = this.data;
    this.ubtTrace(actioncode, {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      actiontype,
      channel: options?.innersid || '',
      actioncode,
      actionName,
      platform: 'wechat'
    });
    console.log(actioncode, {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      actiontype,
      channel: options?.innersid || '',
      actioncode,
      actionName
    });
  },

  //订阅组件完成
  complateSubscribeTask(e) {
    console.log('complateSubscribeTask------------', e);
    const { showShareSuccess } = this.data;
    if (showShareSuccess) {
      this.ubtTraceAndlog(
        'c_gs_tripshoot_cashCampaign_share_popup_close_click',
        'Click',
        '分享成功弹窗-关闭'
      );
    }
    this.setData({
      showSubscribePop: false,
      isSubscription: true,
      showShareSuccess: false,
    });
  },
  // 立即邀请
  shareAction: function (e,callback) {
    let type = e?.currentTarget?.dataset?.type||'';
    let site=e?.currentTarget?.dataset?.site||'';//记录点击的位置
    //clearTimeout(this.introTimer)
    const { userInfo, options } = this.data;
    this.ubtTrace('c_gs_tripshoot_cashCampaign_invite_click', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      sid: options.sid,
      actiontype: 'Click',
      actioncode: 'c_gs_tripshoot_cashCampaign_invite_click',
      actionName: '点击去邀请',
      site
    });
    if (userInfo.taskStatus == 2) {
      this.toLogin();
      return;
    }
    if (userInfo?.taskStatus == 4) {
      //风控未通过
      this.showBlacklistTipsPop();
      return;
    }
    if (userInfo?.taskStatus == 6) {
      this.showToast('活动太火爆了，暂时无法参与，明天再来吧');
      return;
    }
    const param = {
      serverFrom: 'miniProgram',
    };
    // 邀请接口，分享好友和生成海报之前调用
    contentFissionInvite(param, (res) => {
      const { taskStatus, finishInviteAmount } = res;
      if (taskStatus == 1) {
          if(callback){
            callback && callback()
          }else{
            this.setData({
              // showAllTasksPop: false,
              showSharePop: true,
              finishInviteAmount,
            });
            this.isGuideShare=type && type=='pop'?true:false
            this.ubtTrace('c_gs_tripshoot_cashCampaign_invite_expose', {
              activityID: userInfo?.activityId,
              uid: userInfo?.mainClientAuth,
              platform: 'wechat',
              sid: options.sid,
              actiontype: 'show',
              actioncode: 'c_gs_tripshoot_cashCampaign_invite_expose',
              actionName: '用户分享弹窗曝光',
              channel: options?.innersid || ''
            });
          }
      }else if (taskStatus == 6) {
        //风控   
        this.showToast('活动太火爆了，暂时无法参与，明天再来吧');
      } else if(taskStatus==8){
        if(callback){
          callback && callback()
        }else{
          this.showToast('请稍后再试');
        }
      }else{
        this.showToast('请稍后再试');
      }
    });
  },

  // 自动领取结果的回调
  batchReceiveResult(e) {
    if(this.isCallBackFlag) return;
    this.getDetailInfo();
    this.isCallBackFlag = true;
    const { result } = e.detail;
    if (result.code == 200) {
      // 成功
    } else if (result.code == 100) {
      // 未登录
    } else {
      // 其他失败原因
    }
  },
  // 计算活动结束时间
  countDownTime(timestamp) {
    this.timeClock && this.timeClock.stop();
    this.timeClock = new Alarm(Number(timestamp), (hour, minute, second)=> {
      this.setData({ remainTimeObj: { 'hour': hour, 'min': minute, 'second': second }});
    }, ()=> {
      this.getDetailInfo();
    });
    this.timeClock.start()
  },
  choseNolimitRedCard(){
    this.countDownTimer && clearInterval(this.countDownTimer);
    const { userInfo,options } = this.data;
    if (userInfo?.taskStatus == 2) {
      this.toLogin();
      return;
    }
    this.setData({
      guideShareStep: 2,
    }, () => {
      setTimeout(() => {
        this.setData({
          guideShareStep: 3,
        },()=>{
          this.ubtTrace('o_gs_tripshoot_cashCampaign_cash_voucher_expose', {
            activityID: userInfo?.activityId,
            uid: userInfo?.mainClientAuth,
            platform: 'wechat',
            actiontype: 'Show',
            actioncode: 'o_gs_tripshoot_cashCampaign_cash_voucher_expose',
            actionName: '现金红包弹窗曝光',
            channel: options?.innersid || ''
          });
        });
      }, 800);
    });
  },

  closeGuideShare  ()  {
    const {guideShareStep}=this.data
    if(guideShareStep==4){
      this.ubtTraceAndlog(
        'c_gs_tripshoot_cashCampaign_shareToGroup_close',
        'Click',
        '分享到群聊弹窗_关闭'
      );
    }
    this.setData({
      showShareGuideMain: false,
      guideShareStep: 1
    });
    this.dealPopList(this.cachePopList)
  },

  countDownGuideShareTime() {
    clearInterval(this.countDownTimer);

    this.countDownTimer = setInterval(() => {
      let autoChoseCount = this.data.autoChoseCount - 1;
      this.setData({
        autoChoseCount
      }, () => {
        if(autoChoseCount <= 0) {
          clearInterval(this.countDownTimer);
          this.choseNolimitRedCard();
        }
      });
    }, 1000);
  },

  //关闭邀请
  closeSharePop: function () {
    this.setData({
      showSharePop: false,
    });
  },

  //关闭海报提示
  closeInviteTimelinePop: function () {
    this.setData({
      showInviteTimelineSuccess: false//,
      // showShareGuideMain: true,
      // guideShareStep: 4
    });
  },

  //点击订阅
  getSubscribetrack() {
    const { userInfo } = this.data;
    this.ubtTrace('c_gs_tripshoot_cashCampaign_subscription_click', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      actiontype: 'Click',
      actioncode: 'c_gs_tripshoot_cashCampaign_subscription_click',
      actionName: '订阅活动按钮点击',
    });
  },

  //点击去看笔记
  browseNoteClickTodo(e) {
    //浏览和邀请任务点击会进这个回调，自定义笔记和邀请榜单任务点击事件
    console.log('点击任务：', e); //"INVITE_HELP_TASK"   "NO_REPEAT_BROWSE"
    if(e.detail && e.detail.taskItem && e.detail.taskItem.id){
      let _id=e.detail.taskItem.id
      if(_id==741||_id==1796){
        //点击邀请好友看笔记任务，调邀请接口判风控再定位到信息流组件
        this.shareAction('',()=>{
          this.setData({
            // showAllTasksPop: false,
            toViewDom: 'waterfallBox'
          });
        })
      }else if(_id==610||_id==611||_id==612||_id==614||_id==890||_id==891||_id==892||_id==893){
        //点击浏览笔记任务，直接定位到信息流组件
        this.setData({
          // showAllTasksPop: false,
          toViewDom: 'waterfallBox'
        });
      }else if(_id==812||_id==2059||_id==818||_id==2165){
        //点击邀请好友看榜单攻略任务，调邀请接口跳转邀请中间页
        this.shareAction('',()=>{
          require.async('../../../market/directory/task/inviteHelpTask.js').then(utils => {
            utils.customShare({},e.detail.taskItem).then((url)=>{
              console.log('customShare',url)
              cwx.navigateTo({
                url
              })
            })
          }).catch(({mod, errMsg}) => {
            console.error(`path: ${mod}, ${errMsg}`)
          })
          // this.setData({
          //   showAllTasksPop: false
          // });
        })
      }
    }
    const { userInfo } = this.data;
    this.ubtTrace('c_gs_tripshoot_cashCampaign_browse_click', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      actiontype: 'Click',
      actioncode: 'c_gs_tripshoot_cashCampaign_browse_click',
      actionName: '点击看笔记'
    });
  },

  //是否展示安卓微信小程序收藏提示
  saveTipsShow: function () {
    const self = this;
    const { userInfo } = self.data;
    if (cwx.util.systemInfo.model.indexOf('iPhone') == -1) {
      self.setData(
        {
          showSaveTips: true,
          isAndroid: true,
        },
        () => {
          self.ubtTrace('o_gs_tripshoot_cashCampaign_collect_expose', {
            activityID: userInfo?.activityId,
            uid: userInfo?.mainClientAuth,
            platform: 'wechat',
            actiontype: 'Show',
            actioncode: 'o_gs_tripshoot_cashCampaign_collect_expose',
            actionName: '收藏小程序气泡曝光',
          });
          setTimeout(() => {
            self.setData({
              showSaveTips: false,
            });
          }, 5000);
        }
      );
    }
  },

  //获取用户信息
  getDetailInfo: function (isHaveUp) {
    let {options={}}=this.data
    const clientAuth = options?.clientAuth;
    const taskId = options?.taskId;
    const self = this;
    const param = {
      env: 1,
      serverFrom: 'miniProgram',
      // inviterClientAuth: clientAuth,
      taskId: taskId || '',
      pageSource:options?.pageSource||1
    };
    
    if (!this.hasAssist) {
      param.inviterClientAuth = clientAuth;
    }
    this.isCallBackFlag = true;
    getDetailInfo(param, (res) => {
      console.log('活动接口返回值', res)

      // this.queryPageABManager(res); // 新增AB实验
      if (!clientAuth || clientAuth == res?.mainClientAuth) {
        self.ubtTrace('o_gs_tripshoot_cashCampaign_expose', {
          activityID: res?.activityId,
          uid: res?.mainClientAuth,
          platform: 'wechat',
          identity: '主态',
          actiontype: 'Show',
          actioncode: 'o_gs_tripshoot_cashCampaign_expose',
          actionName: '活动主页曝光',
          channel: options?.innersid || ''
        }); //埋点活动主页曝光
        console.log('o_gs_tripshoot_cashCampaign_expose', {
          activityID: res?.activityId,
          uid: res?.mainClientAuth,
          platform: 'wechat',
          identity: '主态',
          actiontype: 'Show',
          actioncode: 'o_gs_tripshoot_cashCampaign_expose',
          actionName: '活动主页曝光',
          channel: options?.innersid || ''
        });
      }
      if (res?.taskStatus == 2 && (!res.dialogDtos || !res.dialogDtos.length)) {
        //未登录  
        const key = (!clientAuth || clientAuth == res?.mainClientAuth) ? 'showShareGuideMain' : 'showNotLoginRedEnvelopes';  
        this.setData({
          [key]: true,
          userInfo: res, //用户信息
        });
        return;
      }
      this.countDownTime(res?.refreshTime || 0); // 活动倒计时

      let activitySettings = {}
      try {
        activitySettings=JSON.parse(res?.indexConfig || '{}')
      } catch (error) {
        console.log('activitySettings配置错误',error)
      }
      const assistFriendsList = [];
      for (var i = 0; i < 4; i++) {
        if (res?.friendAssistTask?.assistFriends?.[i]) {
          assistFriendsList.push(res?.friendAssistTask?.assistFriends[i]);
        } else {
          //    let obj = {headImage:'https://pages.c-ctrip.com/travesnap-j/addTrafficActivity/ctripLogo.png',assistAmount:2.2};
          let obj = {};
          assistFriendsList.push(obj);
        }
      }
      // res.cashBalance=140;
      const cashBalance = res?.cashBalance || 0; // 现在的金额
      const mainClientAuth = res?.mainClientAuth;
      let cashBalancePro;
      let cashInfo = wx.getStorageSync(mainClientAuth);
      if (cashInfo) {
        cashBalancePro = cashInfo;
      }
      if (!cashBalancePro || cashBalancePro == 'null') {
        // 第一次进入此页面
        wx.setStorage({
          key: mainClientAuth,
          data: cashBalance,
        }); //用唯一标识mainClientAuth作为key缓存余额
        self.setData({
          cashBalance,
        });
      } else {
        // 第N次进入此页面取缓存值
        self.setData({
          cashBalance: cashBalancePro || 0,
          cashBalanceNew: null,
        });
      }
      let newRollInfoList=[]
      res.rollInfoList && res.rollInfoList.map((item)=>{
        let lastIndex=item.lastIndexOf('￥')
        newRollInfoList.push({
          first:item.substring(0,lastIndex),
          second:item.substring(lastIndex+1,item.length)
        })
      })
      console.log('用户------------------信息：', res);
      self.setData(
        {
          userInfo: res, //用户信息
          isSubscription: res?.isSubscription, //是否订阅消息
          activitySettings, //通用配置
          assistFriendsList, //邀请助力情况
          showNotLoginRedEnvelopes: false,
          showRedEnvelopesTips: false,
          showJoinEnterpriseWechatPop: false,
          showPostSuccessPop: false,
          countdown: Number(res?.refreshTime), //倒计时
          isLogin:res?.taskStatus == 2?false:true,
          extraData:res.inviteLookNotesAmountList?{
            taskList: [
               {
                   id: __global.env == 'uat'?174:__global.env == 'fat' ? 741 : 1796,
                   awards: res.inviteLookNotesAmountList
               },
               {
                id: __global.env == 'uat'?186:__global.env == 'fat' ? 812 : 2059,
                awards: res.inviteLookRankAmountList
               },
               {
                id: __global.env == 'uat'?189:__global.env == 'fat' ? 818 : 2165,
                awards: res.inviteLookPocketAmountList
               }
            ]
          }:null,
          rollInfoList:newRollInfoList,
          windControl: (!res.inviteLookNotesAmount && !res.inviteLookPocketAmount && !res.inviteLookRankAmount) ? 2 : 1
        },
        () => {
          self.showNewUserWithDrawMoney();
          // if(isHaveUp){
          //     self.successAssistedFriends();
          //     return;//数据刷新时以下不需要执行
          // }
          self.showPop(); // 根据主、客态展示不同的弹框提示

          // 
          // refres task 20230413
          setTimeout(() => {
            self.setData({
              pageBrowseNoteId:
                __global.env == 'uat'
                  ? 103037
                  : __global.env == 'fat'
                  ? '105354'
                  : '218375', //页面任务组件id
              pageTaskListTempId:  __global.env == 'uat'?'317sqhb':__global.env == 'fat' ? 'nrlbtask3':  '317sqhb3', //页面任务组件页面code
            })
          }, 300)
          
        }
      );

      
    });
  },
  // showIntro(){
  //   //clearTimeout(this.introTimer)
  //   clearTimeout(this.taskIntroTimer)
  //   this.setData({
  //     showTaskIntro:true
  //   })
  //   // this.introTimer=setTimeout(()=>{
  //   //   this.setData({
  //   //     showIntro:true
  //   //   })
  //   // },3000)
  //   this.taskIntroTimer=setTimeout(()=>{
  //     this.setData({
  //       showTaskIntro:false
  //     })
  //   },4000)
  // },

  //去提现
  toWithdrawalPage: function () {
    const { userInfo } = this.data;
    this.ubtTrace('c_gs_tripshoot_cashCampaign_withdraw_click', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      actiontype: 'Click',
      actioncode: 'c_gs_tripshoot_cashCampaign_withdraw_click',
      actionName: '点击提现',
    });
    if (userInfo?.taskStatus == 4) {
      //风控未通过
      this.showBlacklistTipsPop();
      return;
    }
    let targeturl;
    if (__global.env == 'prd') {
      targeturl =
        'https://m.ctrip.com/webapp/you/cyactivity/addTrafficActivity/withdrawal.html';
    } else if (__global.env == 'fat') {
      targeturl =
        'https://m.ctrip.fat325.qa.nt.ctripcorp.com/webapp/you/cyactivity/addTrafficActivity/withdrawal.html';
    } else {
      targeturl =
        'https://m.uat.qa.nt.ctripcorp.com/webapp/you/cyactivity/addTrafficActivity/withdrawal.html';
    }
    cwx.navigateTo({
      url:
        '/pages/hotel/components/webview/webview?data=' +
        JSON.stringify({
          url: encodeURIComponent(targeturl),
        }),
    });
  },

  //根据用户信息展示不同的弹框
  showPop: function () {
    const { userInfo, options, isNewCashOut } = this.data;
    const clientAuth = options?.clientAuth;
    const showShareCard = options?.showShareCard;
    const mainClientAuth = userInfo?.mainClientAuth;
    console.log('clientAuth--------------:', clientAuth);
    console.log('mainClientAuth--------------:', mainClientAuth);
    console.log(userInfo?.taskStatus);
    if (clientAuth || isNewCashOut) {
      wx.setStorage({
        key: 'pageName',
        data: null,
      });
    }
    if (userInfo?.taskStatus == 4) {
      //风控未通过
      this.showBlacklistTipsPop();
      return;
    }

    // if (userInfo?.taskStatus == 6) {
    //   // 活动火爆
    //   this.showToast('活动太火爆了，暂时无法参与，明天再来吧');
    //   this.cashBalanceChange();
    //   return;
    // }

    // if (clientAuth && clientAuth == mainClientAuth) { //自己分享给自己
    //     console.log('自己分享给自己--------------:',)
    //     this.successAssistedFriends(); // 钱数增长动效
    //     return;
    // };

    // if (clientAuth) {   // 客态助力红包
    //     this.getRedEnvelopesStatus();
    // }

    // if (!clientAuth && userInfo?.isNewCashOut) {   //主态新人标识
    //   this.setData({
    //     showNotLoginRedEnvelopes: true,
    //   });
    //   return;
    // }
    if (userInfo.dialogDtos) {
      this.dealPopList(userInfo.dialogDtos);
    } else {
      //this.showIntro()
      this.cashBalanceChange(); // 钱数增长动效
    }

    if (showShareCard) {
      this.shareAction();
      this.cashBalanceChange(); // 钱数增长动效
      return;
    }

    // if (!clientAuth && !userInfo?.isNewCashOut) {  //主态老人登录页返回首页
    //     const self = this;
    //     wx.getStorage({
    //         key: 'pageName',
    //         success (res) {
    //             if(res.data == 'loginPage'){
    //                 self.showToast('您已领取过携程红包啦！快去做任务领钱吧！')
    //             }
    //         }
    //     });
    //     wx.setStorage({
    //         key: 'pageName',
    //         data: null,
    //     });
    //     this.successAssistedFriends(); // 钱数增长动效
    //     return;
    // }

    // this.successAssistedFriends(); // 钱数增长动效
  },

  // 处理弹窗列表
  dealPopList(popList) {
    if (!popList || popList.length == 0) {
      //this.showIntro()
      this.cashBalanceChange();
      return;
    }
    const task = popList.shift();

    this.cachePopList = popList;
    const { userInfo, options } = this.data;

    switch (task.dialogType) {
      case 'AssistTask':
        if(task.assistTaskDialogInfo.showAssistTaskDialog) {
            this.getContentFissionCashDialogInfo(task.dialogType);
        } else {
            this.dealPopList(this.cachePopList);
        }
        break;
      case 'Task':
        this.setData({
          taskInfo: task.taskInfo,
          showCommonTaskPop: true,
        });
        const trackParam = {
          activityID: userInfo?.activityId,
          uid: userInfo?.mainClientAuth,
          platform: 'wechat',
          channel: options?.innersid || '',
          taskid: options.taskId,
          actiontype: 'Show',
          actioncode: 'o_gs_tripshoot_cashCampaign_taskPopup_expose',
          actionName: '任务弹窗曝光',
        };
        this.ubtTrace(
          'o_gs_tripshoot_cashCampaign_taskPopup_expose',
          trackParam
        );
        console.log('o_gs_tripshoot_cashCampaign_taskPopup_expose', trackParam);
        break;
      case 'Assist':
        //判断企微助力成功弹窗是否出
        //if (task.assistInfo.showAssistDialog) {
          if(task.assistInfo.assistStatus==8){
            this.setData({
              //出企微助力成功弹窗
              showRedEnvelopes:true,
              isQwAssistSuccess:true,
              wecomCashAmount:task.assistInfo.wecomCashAmount,
              redEnvelopesInfo:{couponName:task.assistInfo.couponName}
            })
          }else{
            this.getRedEnvelopesStatus(task.assistInfo);
          }
          
        //}
        break;
      case 'CtripMoney'://当前登录用户是新人就展示携程红包弹窗
        if (task.ctripMoneyInfo.isNewCashOut) {
          this.setData({
            assistAmount: task.ctripMoneyInfo.ctripMoney,
            couponName: task.ctripMoneyInfo.couponName,
            isNewCashOut: task.ctripMoneyInfo.isNewCashOut,
            showNotLoginRedEnvelopes: true,
            showLoginedAssistInfo: false,
          });
        }
        break;
      case 'FinishedPublish'://
      case 'FinishedAddGroup':
      case 'AssistedFriends'://还没发起新的邀请，展示当前登录态助力信息
        this.getContentFissionCashDialogInfo(task.dialogType);
        break;
      case 'LookNotes':
        if(task.lookNotesDialogInfo.show) {
            this.getContentFissionCashDialogInfo(task.dialogType);
        } else {
            this.dealPopList(this.cachePopList);
        }
        break;
      case 'InviteLookNotesTask':
        if(task.inviteLookNotesTaskDialogInfo.show) {
            this.getContentFissionCashDialogInfo(task.dialogType);
        } else {
            this.dealPopList(this.cachePopList);
        }
        break;
      case 'LookRankTask':
        if(task.lookNotesDialogInfo.show) {
            this.getContentFissionCashDialogInfo(task.dialogType);
        } else {
            this.dealPopList(this.cachePopList);
        }
        break;
      case 'InviteLookRankTask':
        if(task.inviteLookNotesTaskDialogInfo.show) {
            this.getContentFissionCashDialogInfo(task.dialogType);
        } else {
            this.dealPopList(this.cachePopList);
        }
      break;
      case 'LookPocketTask':
        if(task.lookNotesDialogInfo.show) {
            this.getContentFissionCashDialogInfo(task.dialogType);
        } else {
            this.dealPopList(this.cachePopList);
        }
        break;
      case 'InviteLookPocketTask':
        if(task.inviteLookNotesTaskDialogInfo.show) {
            this.getContentFissionCashDialogInfo(task.dialogType);
        } else {
            this.dealPopList(this.cachePopList);
        }
      break;
      default:
        //this.showIntro()
        this.cashBalanceChange();
        break;
    }
  },
  qrcodeUbt(){
    const { userInfo, options } = this.data;
    const trackParam = {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      channel: options?.innersid || '',
      taskid: options.taskId,
      actiontype: 'Longpress',
      actioncode: 'c_gs_tripshoot_cashCampaign_qrcode_identify',
      actionName: '识别二维码',
    };
    this.ubtTrace('c_gs_tripshoot_cashCampaign_qrcode_identify', trackParam);
  },
  // 获取弹窗信息
  getContentFissionCashDialogInfo(dialogType) {
    const param = {
      dialogType,
      taskId: this.data.options.taskId,
    };

    getContentFissionCashDialogInfo(param, (res) => {
      const { fissionDialog } = res;
      if (!fissionDialog) return;
      this.showDialog(fissionDialog);
    });
  },

  // 弹窗
  showDialog(task) {
    switch (task.dialogType) {
      case 'FinishedPublish':
        this.setData({
          publishArticleAmount: task.finishPublishInfo.publishArticleAmount,
          showPostSuccessPop: true,
        });
        break;
      case 'FinishedAddGroup':
        this.setData({
          addGroupAmount: task.addGroupInfo.addGroupAmount,
          showJoinEnterpriseWechatPop: true,
        });
        break;
      case 'AssistedFriends':
        const succeeAssistedFriends =
          task.assistFriendsInfo.succeeAssistedFriends;
        const assistFriendLen =
          succeeAssistedFriends?.assistFriends?.length || 0;
        if (assistFriendLen == 4) {
          this.setData({
            succeeAssistedFriends: succeeAssistedFriends,
            showRedEnvelopesTips: true,
          });
        }
        break;
      case 'AssistTask': 
          this.setData({
              showShareGuideMain: true,
              guideShareStep: 1
          },()=>{
            this.countDownGuideShareTime();
          });
          break;
      case 'LookNotes':
        this.setData({
          lookNotesInfo: task.lookNotesDialogInfo||{},
          showGuestNotePop: true,
          lookDialogType:'notes'
        });
        break;
      case 'InviteLookNotesTask':
        this.setData({
          lookNotesInfo: task.inviteLookNotesTaskDialogInfo||{},
          showOwnerNotePop: true,
          lookDialogType:'notes'
        });
        break;
      case 'LookRankTask':
        this.setData({
          lookNotesInfo: task.lookNotesDialogInfo||{},
          showGuestNotePop: true,
          lookDialogType:'rank'
        });
        break;
      case 'InviteLookRankTask':
        this.setData({
          lookNotesInfo: task.inviteLookNotesTaskDialogInfo||{},
          showOwnerNotePop: true,
          lookDialogType:'rank'
        });
        break;
      case 'LookPocketTask':
        this.setData({
          lookNotesInfo: task.lookNotesDialogInfo||{},
          showGuestNotePop: true,
          lookDialogType:'pocket'
        });
        break;
      case 'InviteLookPocketTask':
        this.setData({
          lookNotesInfo: task.inviteLookNotesTaskDialogInfo||{},
          showOwnerNotePop: true,
          lookDialogType:'pocket'
        });
        break;
      default:
        break;
    }
  },

  taskClick(type) {
    const { userInfo, taskInfo, options } = this.data;
    if(type && type!='assist'){
      const trackParam = {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        channel: options?.innersid || '',
        taskid: options.taskId,
        actiontype: 'Click',
        actioncode: 'c_gs_tripshoot_cashCampaign_taskPopup_click',
        actionName: '任务弹窗点击',
      };
      this.ubtTrace('c_gs_tripshoot_cashCampaign_taskPopup_click', trackParam);
    }
    if (userInfo.taskStatus == 2) {
      this.toLogin();
      this.setData({
        showCommonTaskPop: false,
        showAddQwPop:false,
        showNotAddQwPop:false

      });
      return;
    }
    if (taskInfo) {
      const e = {
        target: {
          dataset: {
            taskid: type && type=='assist'?taskInfo.taskId:options.taskId
          },
        },
      };
      const child = this.selectComponent('#taskComp');
      child.handleTask(e);
      console.log(e,"URL路径打印")
      this.closeCommonPop(true);
    } else {
      this.closeCommonPop(false);
    }
  },
  closeCommonPop(navigate) {
    const { userInfo, options } = this.data;
    if(navigate && typeof navigate=="object"){
      const trackParam = {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        channel: options?.innersid || '',
        taskid: options.taskId,
        actiontype: 'Click',
        actioncode: 'c_gs_tripshoot_cashCampaign_taskPopup_close',
        actionName: '任务弹窗关闭',
      };
      this.ubtTrace('c_gs_tripshoot_cashCampaign_taskPopup_close', trackParam);
    }
    this.setData(
      {
        showCommonTaskPop: false,
        showAddQwPop:false,
        showNotAddQwPop:false
      },
      () => {
        navigate !== true && this.dealPopList(this.cachePopList);
        // this.getDetailInfo();
      }
    );
  },
  //showToast
  showToast(title) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 2000,
      mask: true,
    });
  },
  // 客态获取主态的红包情况 是否有资格
  getRedEnvelopesStatus: function (assistInfo) {
    let self = this;
    const clientAuth = self.data.options.clientAuth;
    const { userInfo,options } = this.data;
    const param = {
      masterClientAuth: clientAuth,
      serverFrom: 'miniProgram',
    };
    contentFissionAssistEntrance(param, (res) => {
      const { taskStatus, couponName, assistAmount } = res;
      // 任务状态 1-成功 2-参数不对（未登录） 3-活动过期 4-风控不通过
      // 5-其他失败原因 6-活动太火爆，暂时无法参与 7-已领过 8-已满四人 9-已失效
      self.hasAssist = true;
      let userStatus;
      if (taskStatus == 9) {
        userStatus = '邀请已过期';
      } else if (taskStatus == 8) {
        userStatus = '助力人数已满';
      } else if (taskStatus == 7) {
        userStatus = '已参与过活动，无法被邀请';
      } else if (taskStatus == 1) {
        userStatus = '邀请成功';
      } else if (taskStatus == 6) {
        userStatus = '活动太火爆，暂时无法参与';
      } else {
        userStatus = '未登录';
      }
      self.ubtTrace('o_gs_tripshoot_cashCampaign_expose', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        identity: '客态',
        inviter: clientAuth,
        status: userStatus,
        actiontype: 'Show',
        actioncode: 'o_gs_tripshoot_cashCampaign_expose',
        actionName: '活动主页曝光',
        channel: options?.innersid || ''
      }); //埋点活动主页曝光
      console.log('o_gs_tripshoot_cashCampaign_expose', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        identity: '客态',
        inviter: clientAuth,
        status: userStatus,
        actiontype: 'Show',
        actioncode: 'o_gs_tripshoot_cashCampaign_expose',
        actionName: '活动主页曝光',
        channel: options?.innersid || ''
      });
      if (taskStatus == 1) {
        //  1-成功
        if(assistInfo.alreadyAddWeCom==false){
          //可助力没加过企微，出加企微助力弹窗
          self.setData({
            showAddQwPop: true,
            wecomCashAmount:assistInfo.wecomCashAmount, //企微奖励的现金
            taskInfo:assistInfo.taskInfo//兼容taskClick里有taskInfo才走完成任务流程
          });
          self.ubtTrace('o_gs_tripshoot_cashCampaign_addWeCom_expose', {
            activityID: userInfo?.activityId,
            uid: userInfo?.mainClientAuth,
            platform: 'wechat',
            actiontype: 'Show',
            actioncode: 'o_gs_tripshoot_cashCampaign_addWeCom_expose',
            actionName: '助力加企微弹窗曝光',
            channel: options?.innersid || ''
          });
        }else{
          self.setData({
            showNotLoginRedEnvelopes: true,
            assistAmount,
            couponName,
            showLoginedAssistInfo: true,
          });
        }
      
      } else if (taskStatus == 3) {
        // 3-活动过期
        this.showToast('活动过期了！');
      } else if (taskStatus == 4) {
        // 4-风控不通过
        self.showBlacklistTipsPop();
      } else if (taskStatus == 6) {
        this.showToast('活动太火爆，暂时无法参与！');
      } else if (taskStatus == 7) {
        this.showToast('抱歉,您已参与过分红包,不能再参与,快去做任务领现金吧');
      } else if (taskStatus == 9) {
        this.showToast('邀请过期了，快去做任务领现金吧');
      } else if (taskStatus == 8) {
        self.setData({
          showNumberIsFull: true,
        });
      }
      if (taskStatus != 1 && taskStatus != 8) {
        this.dealPopList(this.cachePopList);
      }

      if (taskStatus == 6 || taskStatus == 7 || taskStatus == 9) {
        setTimeout(() => {
          self.successAssistedFriends(); // 钱数增长动效
        }, 1000);
      }
    });
  },

  // 展示昨天好友助力弹框
  successAssistedFriends: function () {
    const self = this;
    const { userInfo } = self.data;
    // 发布任务完成弹框
    if (userInfo?.publishArticleAmount) {
      self.setData({
        showPostSuccessPop: true,
      });
      return;
    }
    // 加群任务完成弹窗
    if (userInfo?.addGroupAmount) {
      self.setData({
        showJoinEnterpriseWechatPop: true,
      });
      return;
    }

    const assistFriendLen =
      userInfo?.succeeAssistedFriends?.assistFriends?.length || 0;

    // 昨日好友助力弹框
    if (assistFriendLen === 4) {
      self.setData({
        showRedEnvelopesTips: true,
      });
      return;
    }
    // 金额增加动效
    //self.showIntro()
    self.cashBalanceChange();
  },

  //现金余额变化动作
  cashBalanceChange: function (cashBalanceValue) {
    const self = this;
    const { userInfo, isSubscription } = self.data;
    const cashBalance = cashBalanceValue || userInfo?.cashBalance;
    const mainClientAuth = userInfo?.mainClientAuth;
    let cashBalancePro = wx.getStorageSync(mainClientAuth);
    //订阅弹框
    if (!isSubscription && userInfo?.isFirstAmountPopUp) {
      self.ubtTraceAndlog(
        'o_gs_tripshoot_cashCampaign_subscribe_popup_expose',
        'Show',
        '完成任务引导订阅弹窗曝光'
      );
      // self.ubtTraceAndlog(
      //   'o_gs_tripshoot_cashCampaign_push_expose',
      //   'Show',
      //   '推送服务弹窗曝光'
      // );
      self.setData({
        showSubscribePop: true,
      });
    }
    if (cashBalance && cashBalancePro && cashBalancePro != cashBalance) {
      //缓存余额和本地余额不同
      wx.setStorage({
        key: mainClientAuth,
        data: cashBalance,
      }); //用唯一标识mainClientAuth作为key缓存余额
      setTimeout(() => {
        self.setData({
          cashBalanceNew: cashBalance,
        });
      }, 1000);
    }
  },

  //黑名单用户提示
  showBlacklistTipsPop: function () {
    this.setData({
      showBlacklistTips: true
    });
  },

  //判断是否展示新人福利
  showNewUserWithDrawMoney: function () {
    const self = this;
    const { userInfo } = self.data;
    if (!userInfo.isWithDraw && userInfo?.cashBalance > 0) {
      wx.getStorage({
        key: 'WithDrawMoney',
        success(res) {
          console.log(res.data);
          if (res.data != 'yes') {
            self.setData(
              {
                showNewUserWithDrawMoney: true,
              },
              () => {
                wx.setStorage({
                  key: 'WithDrawMoney',
                  data: 'yes',
                });
                setTimeout(() => {
                  self.setData({
                    showNewUserWithDrawMoney: false,
                  });
                }, 5000);
              }
            );
          }
        },
      });
    }
  },

  // 关闭弹框
  closePromptPop: function () {
    const { showShareSuccess, showSubscribePop } = this.data;
    if (showShareSuccess) {
      this.ubtTraceAndlog(
        'c_gs_tripshoot_cashCampaign_share_popup_close_click',
        'Click',
        '分享成功弹窗-关闭'
      );
    } else if (showSubscribePop) {
      this.ubtTraceAndlog(
        'c_gs_tripshoot_cashCampaign_subscribe_popup_close_click',
        'Click',
        '完成任务引导弹窗_点击关闭'
      );
    }
    this.setData({
      showBlacklistTips: false,
      showPushMessageTips: false,
      showUpdateVersionTips: false,
      showShareSuccess: false,
      showSlipVerificationPop: false,
      showFavoriteCard: false,
      showSubscribePop: false,
      // showAllTasksPop: false,
      showRetainPop:false
    });
  },

  showVerifyModule: function () {
    this.setData(
      {
        showSlipVerificationPop: true,
      },
      () => {
        this.showVerification();
      }
    );
  },

  //滑块验证
  showVerification: function (tag) {
    const self = this;
    const { userInfo, options, isNewCashOut } = this.data;
    const clientAuth = options?.clientAuth;
    const mainClientAuth = userInfo?.mainClientAuth;
    cwx.locate.startGetCtripCity(function (resp) {
      // 依赖于cwx封装的获取地位坐标信息方法
      var cityLatitude, cityLongitude, countryName, provinceName, cityName;
      if (!resp.error) {
        cityLatitude = resp.data.CityLatitude;
        cityLongitude = resp.data.CityLongitude;
        countryName = resp.data.CountryName;
        provinceName = resp.data.ProvinceName;
        cityName = resp.data.CityEntities.CityName;
      } else {
        cityLatitude = 'error';
        cityLongitude = 'error';
        countryName = 'error';
        provinceName = 'error';
        cityName = 'error';
      }
      self.setData({
        settings: {
          codeImageType: 'popup',
          //settings为captcha标签内settings属性的值，可自行定义
          appId: '100032106', // 申请的appId值100023407
          businessSite: 'market_fissionactivity_miniapp_pic', // 申请的businessSite值
          dev: __global.env === 'prd' ? 'pro' : 'uat', // 接口环境
          width: '280px', // 滑块宽度
          height: '40px', // 滑块高度
          margin: 'auto', // 滑块边距
          textslider: true, // 是否文字光影效果
          language: cwx.util.systemInfo.language, //微信设置的语言
          openid: cwx.cwx_mkt.openid, // 小程序的用户openid
          unionid: cwx.cwx_mkt.unionid, // 小程序的用户unionid
          model: cwx.util.systemInfo.model, // 用户手机型号
          wx_version: cwx.util.systemInfo.version, // 微信版本号
          gpsLatitude: cityLatitude, // GPS横坐标
          gpsLongitude: cityLongitude, // GPS纵坐标
          country: countryName, // 国家
          province: provinceName, // 省份
          city: cityName, // 城市
          duid: cwx.user.duid, // 携程duid
          windowWidth: cwx.util.systemInfo.windowWidth, //窗口宽度
          windowHeight: cwx.util.systemInfo.windowHeight, //窗口宽度
          chooseOpt: {
            // 选字验证码属性
            position: 'fixed', // 选字图片定位方式
            width: '240px', // 选字图片宽度
            height: '160px', //选字图片高度
            type: 'pop', // 选字框浮动方式
          },
          // 状态监听函数
          stateChange: function (state) {
            if (state == 0) {
              if ('undefined' !== typeof console) {
                console.log('滑块显示state:', state);
              }
            } else if (state == 1) {
              if ('undefined' !== typeof console) {
                console.log('选字验证码弹框出现 state:', state);
              }
            } else if (state == 2) {
              if ('undefined' !== typeof console) {
                console.log('选字验证码弹框消失 state:', state);
              }
            }
          },
          // 选字错误后调用的函数
          onSelectFail: function () {
            console.log('select fail');
          },
          // 单击选字右上角叉后调用的函数
          onSelectClose: function () {
            console.log('select close');
          },
          // 风险检测结果
          resultHandler: function (e) {
            console.log('-----------------', e);
            if (e.checkState == 'success' || e.checkState == 'hidden') {
              self.setData({
                showSlipVerificationPop: false,
              });
              if (isNewCashOut) {
                //携程红包 去掉发携程红包的逻辑
                self.setData({
                  isNewCashOut: false, //
                });
                //self.contentFissionReceiveAward();
              } else {
                self.getHelpRedEnvelopes(e); //助力红包
              }
              console.log('验证成功');
            } else {
              console.log('验证失败');
            }
          },
        },
      });
    }, 'destination-place');
  },

  // 领取携程红包
  // contentFissionReceiveAward: function () {
  //   const self = this;
  //   const { options, userInfo } = self.data;
  //   const param = {
  //     serverFrom: 'miniProgram',
  //     innerSid: options?.innersid || '',
  //   };
  //   contentFissionReceiveAward(param, (info) => {
  //     const { taskStatus, cashBalance } = info;
  //     if (taskStatus == 4) {
  //       // 风控用户
  //       self.showBlacklistTipsPop();
  //     } else if (taskStatus == 1) {
  //       //领取成功
  //       self.setData(
  //         {
  //           showRedEnvelopes: true,
  //           redEnvelopesInfo: info,
  //         },
  //         () => {
  //           self.ubtTrace('o_gs_tripshoot_cashCampaign_redPackets_expose', {
  //             activityID: userInfo?.activityId,
  //             uid: userInfo?.mainClientAuth,
  //             platform: 'wechat',
  //             actiontype: 'Show',
  //             actioncode: 'o_gs_tripshoot_cashCampaign_redPackets_expose',
  //             actionName: '红包弹窗曝光',
  //           });
  //         }
  //       );
  //     } else if (taskStatus == 3) {
  //       self.showToast('活动已过期');
  //     }
  //   });
  // },

  //获取助力信息 助力
  getHelpRedEnvelopes: function (e) {
    let self = this;
    const { userInfo, options } = this.data;
    const param = {
      masterClientAuth: options?.clientAuth,
      env: 1,
      serverFrom: 'miniProgram',
      innerSid: options?.innersid || '',
      code:e?.token||'',
      version:e?.version||''
    };
    contentFissionAssist(param, (res) => {
      const assistStatus = res?.assistStatus;
      // 本地标识，助力过
      self.hasAssist = true;
      if (assistStatus == 2) {
        // 2-邀请过期
        this.showToast('邀请过期了，快去做任务领现金吧');
      } else if (assistStatus == 1) {
        // 1-已经参与过助力；
        this.showToast('抱歉,您已参与过分红包,不能再参与,快去做任务领钱吧');
      } else if (assistStatus == 3) {
        // 3-好友红包已分完;
        self.setData({
          showNumberIsFull: true,
        });
      } else if (assistStatus == 6) {
        // 6-风控不通过
        self.showBlacklistTipsPop();
      } else if (assistStatus == 7) {
        this.showToast('活动太火爆了，奖励将延迟到明天发放，敬请期待');
      }  else if (assistStatus == 9) {
        //没有加过企微，跳转企微页
        self.hasAssist = false; //跳到企微页返回要传inviterAuth
        self.taskClick('assist')
      } else if (assistStatus == 0) {
        // 0-助力成功
        self.setData(
          {
            showRedEnvelopes: true,
            redEnvelopesInfo: res,
            isQwAssistSuccess:false
          },
          () => {
            self.ubtTrace('o_gs_tripshoot_cashCampaign_redPackets_expose', {
              activityID: userInfo?.activityId,
              uid: userInfo?.mainClientAuth,
              platform: 'wechat',
              actiontype: 'Show',
              actioncode: 'o_gs_tripshoot_cashCampaign_redPackets_expose',
              actionName: '红包弹窗曝光',
            });
          }
        );
      }
    });
  },

  //去领现金
  toReceiveCash: function () {
    const { userInfo, isNewCashOut } = this.data;
    this.setData(
      {
        showNumberIsFull: false,
      },
      () => {
        if (isNewCashOut) {
          cwx.redirectTo({
            url: '/pages/you/activity/addTrafficActivity/homePage',
          });
        } else {
          this.dealPopList(this.cachePopList);
        }
      }
    );
  },

  // 好友提示弹框点击【继续领现金】
  getMoreRedEnvelopes() {
    this.setData(
      {
        showRedEnvelopesTips: false,
      },
      () => {
        //this.showIntro()
        this.cashBalanceChange(); //现金红包增长动画
      }
    );
  },

  //分享给朋友
  // shareFriends:function(){
  //     const self = this;
  //     const { userInfo, options} = self.data;
  //     self.ubtTrace('c_gs_tripshoot_cashCampaign_invite_click', {
  //         activityID: userInfo?.activityId,
  //         uid: userInfo?.mainClientAuth,
  //         platform:'wechat',
  //         sid: options.sid,
  //         actiontype: 'Click',
  //         actioncode: 'c_gs_tripshoot_cashCampaign_invite_click',
  //         actionName: '点击去邀请',
  //     });
  //     if (userInfo?.taskStatus == 4) { //风控未通过
  //         this.showBlacklistTipsPop();
  //         return;
  //     };
  //     if(userInfo?.taskStatus==6){
  //         this.showToast('活动太火爆了，暂时无法参与，明天再来吧');
  //         return;
  //     }
  // },

  //分享到朋友圈
  inviteTimeline() {
    const self = this;
    self.isWritePhotosAlbum().then(
      (res) => {
        console.log('授权成功', res);
        self.savePoster();
      },
      (res) => {
        console.log('授权失败', res);
        if (res.authSetting['scope.writePhotosAlbum'] == undefined) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(info) {
              console.log('授权成功', info);
              self.savePoster();
            },
            fail(info) {
              self.showToast('您没有授权，无法保存到相册');
              console.log('授权``失败', info);
            },
          });
        } else {
          self.getSettingWritePhotosAlbum();
        }
      }
    );
  },

  savePoster() {
    const self = this;
    const { userInfo,options } = self.data;
    const param = {
      serverFrom: 'miniProgram',
      innerSid: options?.innersid || '',
      entryId:options?.entryId||'',
      version:2
    };
    wx.showLoading({
      title: '加载中',
    });

    setTimeout(function () {
      wx.hideLoading();
    }, 3000);
    contentFissionGenerateReport(param, (res) => {
      console.log('海报：', res);
      const { taskStatus, imageUrl } = res;

      if (taskStatus == 1) {
        self.setData({
          posterImg: imageUrl,
        });
        wx.downloadFile({
          url: imageUrl,
          success: function (data) {
            wx.saveImageToPhotosAlbum({
              filePath: data.tempFilePath,
              success: function (res) {
                console.log('保存结果--------------------：', res);
                self.setData({
                  showSharePop: false,
                  showInviteTimelineSuccess: true,
                  posterImg: imageUrl,
                  showShareGuideMain: false,
                  guideShareStep: 1
                });
                self.ubtTrace('c_gs_tripshoot_cashCampaign_inviteChannel_click', {
                  activityID: userInfo?.activityId,
                  uid: userInfo?.mainClientAuth,
                  button: '微信',
                  actiontype: 'Click',
                  actioncode: 'c_gs_tripshoot_cashCampaign_inviteChannel_click',
                  actionName: '点击邀请渠道',
                  platform:'wechat',
                  channel:options?.innersid || '',
                  key:'2'
                });
              },
              fail: function (res) {
                if (res.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
                  self.getSettingWritePhotosAlbum();
                  console.log('拒绝授权');
                }
                console.log('保存结果2--------------------：', res);
              },
            });
          },
          fail: function () {},
        });
      }
    });
  },

  // 打开访问相册的权限
  getSettingWritePhotosAlbum() {
    const self = this;
    wx.openSetting({
      success(res) {
        console.log('--22--2--', res);
        if (res.authSetting['scope.writePhotosAlbum']) {
          self.savePoster();
          console.log('获取权限成功，给出再次点击图片保存到相册的提示。');
        } else {
          self.showToast('您没有授权，无法保存到相册');
        }
      },
      fail: function (res) {
        console.log('打开openSetting失败：', res);
      },
    });
  },

  /**
   * 用户会否授权过获取用户信息
   */
  isWritePhotosAlbum() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          console.log('授权信息', res);
          if (res.authSetting['scope.writePhotosAlbum']) {
            resolve(true);
          } else {
            reject(res);
          }
        },
      });
    });
  },

  //立即邀请
  inviteFriends() {
    const self = this;
    const { userInfo, options } = self.data;
    // self.ubtTrace('c_gs_tripshoot_cashCampaign_invite_click', {
    //   activityID: userInfo?.activityId,
    //   uid: userInfo?.mainClientAuth,
    //   platform: 'wechat',
    //   sid: options?.sid,
    //   actiontype: 'Click',
    //   actioncode: 'c_gs_tripshoot_cashCampaign_invite_click',
    //   actionName: '点击去邀请',
    // });
    self.ubtTrace('c_gs_tripshoot_cashCampaign_inviteChannel_click', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      button: '微信',
      actiontype: 'Click',
      actioncode: 'c_gs_tripshoot_cashCampaign_inviteChannel_click',
      actionName: '点击邀请渠道',
      platform:'wechat',
      channel:options?.innersid || '',
      key:'1'
    });
    this.setData({
      showSharePop: false,
    });
    wx.setStorage({
      key: 'shareFriend',
      data: this.isGuideShare?'popyes':'yes'
    });
  },

  // 分享弹框展示
  showShareSuccessPop() {
    const self = this;
    const { userInfo } = self.data;
    wx.getStorage({
      key: 'shareFriend',
      success(res) {
        if (res.data == 'yes'||res.data == 'popyes') {
          const key=res.data == 'yes'?'showShareSuccess':'guideShareStep'
          self.setData(
            {
              [key]:key=='guideShareStep'?4:true
             // showShareSuccess: true,
            },
            () => {
              key=='guideShareStep'?self.ubtTraceAndlog(
                'o_gs_tripshoot_cashCampaign_shareToGroup_expose',
                'Show',
                '分享到群聊弹窗曝光'
              ):self.ubtTraceAndlog(
                'o_gs_tripshoot_cashCampaign_shareSuccess_expose', 
                'Show', 
                '分享成功弹窗曝光'
              );
              wx.setStorage({
                key: 'shareFriend',
                data: 'no',
              });
            }
          );
        }
      },
    });
  },

  /**
   * 分享 立即邀请
   */
  onShareAppMessage(obj) {
    const self = this;
    const { userInfo, options } = self.data;
    const mainClientAuth = userInfo?.mainClientAuth;
    let str = '';
    let query = {};
    if (obj && obj.from === 'button' && mainClientAuth) {
      query['clientAuth'] = mainClientAuth;
    }
    if (obj && obj.from === 'menu' && options?.taskId) {
      query['taskId'] = options?.taskId;
    }
    if (options?.innersid) {
      query['innersid'] = options?.innersid;
    }
    if (options?.entryId) {
      query['entryId'] = options?.entryId;
    }
    //   if(options?.taskId){
    //     query['taskId'] = options?.taskId;
    //   }
    str = convertToString(query);
    // const shareUrl = `pages/you/activity/addTrafficActivity/newHomePage?` + str;
    const shareUrl = `pages/you/activity/addTrafficActivity/homePage?` + str;
    // const shareUrl = `pages/home/homepage?toUrl=${encodeURIComponent(curUrl)}`;
    const { shareTitle, shareImg } = self.data.activitySettings;
    if(obj && obj.target?.dataset?.site=='shareToGroup'){
      this.ubtTraceAndlog(
        'c_gs_tripshoot_cashCampaign_shareToGroup_click',
        'Click',
        '分享到群聊弹窗_分享点击'
      );
    }
    return {
      title: shareTitle,
      path: shareUrl,
      imageUrl: shareImg,
    };
  },

  // 收藏
  onAddToFavorites() {
    this.setData({
      showFavoriteCard: true,
    });
    return {
      title: '天天领现金',
      imageUrl:
        'https://pages.c-ctrip.com/travesnap-j/addTrafficActivity/AndroidIcon.png',
      query: 'isfavorites=true',
    };
  },

  //初始化用户是否需要获取微信授权的信息
  initAuthInfo() {
    const _authStorage = wx.getStorageSync(AUTH_KEY);
    if (
      _authStorage &&
      Date.now() - Number(_authStorage) <  7 * 24 * 60 * 60 * 1000
    ) {
      this.setData({
        isWxAuthed: true,
      });
    }
  },

  // 关闭红包弹框
  closeRedEnvelopes: function () {
    const self = this;
    this.setData(
      {
        showRedEnvelopes: false,
        showRedEnvelopesTips: false,
        showNotAddQwPop:false
      },
      () => {
        self.getDetailInfo(true); //初始化数据
      }
    );
  },
  //助力成功点击订阅
  toSubscribe(){
    cwx.mkt.subscribeMsg(['1CSJ70HpqAd-j9018q2Yr97LRsVG1-7ZeIX5csdRkgc'], (data) => {
      this.closeAssistSuccess()
    })
  },
  //关闭企微助力成功弹窗
  closeAssistSuccess(){
    this.hasAssist=true //为true不再传助力者auth 来判断助力资格
    this.setData(
      {
        showRedEnvelopes: false
      },
      () => {
        this.getDetailInfo(true); //初始化数据
      }
    );
  },
  //关闭加企微助力弹窗
  closeAddQwPop(){
    const { userInfo,options } = this.data;
    this.setData({
        showAddQwPop: false,
        showNotAddQwPop: true,
    });
    this.ubtTrace('c_gs_tripshoot_cashCampaign_addWeCom_close_click', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      actiontype: 'Show',
      actioncode: 'c_gs_tripshoot_cashCampaign_addWeCom_close_click',
      actionName: '助力加企微弹窗_点击关闭',
      channel: options?.innersid || ''
    });
    this.ubtTrace('o_gs_tripshoot_cashCampaign_addWeCom_fail_expose', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      actiontype: 'Show',
      actioncode: 'o_gs_tripshoot_cashCampaign_addWeCom_fail_expose',
      actionName: '助力未成功弹窗曝光',
      channel: options?.innersid || ''
    });
  },
  // 关闭发布任务完成弹框
  closePostSuccessPop: function () {
    const self = this;
    const { userInfo } = self.data;
    this.setData(
      {
        showPostSuccessPop: false,
      },
      () => {
        //   // 加群任务完成弹窗
        // if(userInfo?.addGroupAmount){
        //     self.setData({
        //         showJoinEnterpriseWechatPop: true
        //     });
        //     return;
        // }
        // // 昨日好友助力弹框
        // if (userInfo?.succeeAssistedFriends?.assistFriends?.length > 0) {
        //     self.setData({
        //         showRedEnvelopesTips: true
        //     });
        //     return;
        // }
        //this.showIntro()
        this.dealPopList(this.cachePopList);
        self.cashBalanceChange(); //现金红包增长动画
      }
    );
  },

  // 关闭加群任务完成弹窗
  closeJoinEnterpriseWechatPop: function () {
    const self = this;
    const { userInfo } = self.data;
    this.setData(
      {
        showJoinEnterpriseWechatPop: false,
        showOwnerNotePop:false,
        showGuestNotePop:false
      },
      () => {
        // 昨日好友助力弹框
        // if (userInfo?.succeeAssistedFriends?.assistFriends?.length > 0) {
        //     self.setData({
        //         showRedEnvelopesTips: true
        //     });
        //     return;
        // }
        //this.showIntro()
        this.dealPopList(this.cachePopList);
        self.cashBalanceChange(); //现金红包增长动画
      }
    );
  },

  // 领完红包点击【继续领现金】
  getMoreRedEnvelopesAfterAssist: function () {
    const self = this;
    const { userInfo } = this.data;
    this.ubtTrace('c_gs_tripshoot_cashCampaign_recieve_click', {
      activityID: userInfo?.activityId,
      uid: userInfo?.mainClientAuth,
      platform: 'wechat',
      actiontype: 'Click',
      actioncode: 'c_gs_tripshoot_cashCampaign_recieve_click',
      actionName: '收下红包',
    });
    this.setData(
      {
        showRedEnvelopes: false,
      },
      () => {
        self.getDetailInfo(true); //初始化数据
        // this.dealPopList(this.cachePopList);
      }
    );
  },

  // 点击红包封面的【领】按钮
  login: function (e) {
    const self = this;
    const { userInfo,options } = self.data;
    this.setData(
      {
        showNotLoginRedEnvelopes: false,
        showAddQwPop:false,
        showNotAddQwPop:false
      },
      () => {
        console.log('userInfo.taskStatus:', userInfo);
        if (userInfo.taskStatus == 2) {
          self.toLogin();
          return;
        } else {
          self.showVerifyModule();
        }
      }
    );
    if(e && e.currentTarget && e.currentTarget.dataset.site && e.currentTarget.dataset.site=="addQw"){
      self.ubtTrace('c_gs_tripshoot_cashCampaign_addWeCom_click', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        actiontype: 'Show',
        actioncode: 'c_gs_tripshoot_cashCampaign_addWeCom_click',
        actionName: '助力加企微弹窗_点击去助力',
        channel: options?.innersid || ''
      });
    }else if(e && e.currentTarget && e.currentTarget.dataset.site && e.currentTarget.dataset.site=="addQwAgain"){
      self.ubtTrace('c_gs_tripshoot_cashCampaign_addWeComfail_tocomplete_click', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        actiontype: 'Show',
        actioncode: 'c_gs_tripshoot_cashCampaign_addWeComfail_tocomplete_click',
        actionName: '助力未成功弹窗-点击去完成任务',
        channel: options?.innersid || ''
      });
    }
  },

  //活动规则显示
  showRulePop: function () {
    this.setData({
      showRule: true
    });
  },

  //关闭活动规则
  closeRulePop: function () {
    this.setData({
      showRule: false,
    });
  },

  //调准登录
  toLogin: function () {
    let self = this;
    wx.setStorage({
      key: 'pageName',
      data: 'loginPage',
    });
    cwx.user.login({
      callback: (res)=>{
        if (res.ReturnCode === '0') {
          self.setData(
            {
              isLogin: true,
              showShareGuideMain:false //登录成功后隐藏弹窗重新请求详情接口
            },
            () => {
              console.log('-------------------------------登录返回');
              self.getDetailInfo();
            }
          );
        }
      },
    });
  },
  //小程序后台最低版本2.11.2 因此去掉此段兼容
  // getUserInfo(callback) {
  //   const self = this;
  //   wx.getUserInfo({
  //     success: (res) => {
  //       console.log('使用getUserInfo获取用户信息', res);
  //       self.getNickNameAvatHandler(res.userInfo,0,callback);
  //     },
  //     fail: () => {
  //       console.log('用户拒绝授权');
  //       callback && callback()
  //       //self.toLogin();
  //     },
  //     complete: () => {
  //       if (self.data.loginType == 1) {
  //         self.setData({
  //           loginType: null,
  //         });
  //       }
  //     },
  //   });
  // },
  /**
   * 用户会否授权过获取用户信息
   */
  isAuthorize() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          console.log('授权信息', res);
          if (res.authSetting['scope.userInfo']) {
            resolve(true);
          } else {
            reject(false);
          }
        },
      });
    });
  },
  //授权后登录
  saveUserInfoTologin(){
    this.getAuthUserInfo((type)=>{
      !type && this.toLogin();
    })
  },
  saveUserInfoToAssist(){
    this.getAuthUserInfo((type)=>{
      this.login();
    })
  },
  //授权后邀请
  saveUserInfoToShareAction(e){
    this.getAuthUserInfo(()=>{
      this.shareAction(e);
    })
  },

  /**
   * 获取微信授权
   */
  getAuthUserInfo: function (callback) {
    const self = this;
    self.setData({
      loginType: 1,
    });
    // 微信基础库2.10.4及以后的版本走这个
    if (wx.getUserProfile) {
      wx.getUserProfile({
        desc: '用于显示好友助力信息',
        success: (res) => {
          self.getNickNameAvatHandler(res.userInfo,0,callback)
        },
        fail: function () {
          callback && callback()
          //self.toLogin();
        },
        complete: function () {},
      });
      return;
    }
    this.showToast('亲，微信版本较低，请升级为新版后，再试！')
    // 微信基础库2.10.4及以前的版本走这个 
    // console.log('通过getUserInfo获取用户信息', e.detail);
    // if (e.detail?.userInfo) {
    //   self.getNickNameAvatHandler(e.detail.userInfo,0,callback);
    //   return;
    // } else {
    //   callback && callback()
    //   //self.toLogin();
    //   console.log('通过getUserInfo获取用户信息', e.detail);
    // }
    // // 如果是低版本，并且不是open-type="userInfo"，走这个
    // self.getUserInfo(callback);
  },
  /**
   * 保存用户信息
   * @param {*} info 用户信息
   */
  getNickNameAvatHandler(info, flag,callback) {
    console.log('设置用户信息', info);
    const self = this;
    if (info?.nickName) {
      const _info = {
        nickName: info.nickName,
        avatarUrl: info.avatarUrl,
      };
      this.setData({
        userInfo: { ...self.data.userInfo, ..._info },
        hasUserInfo: true,
        isWxAuthed: true,
      });
      // 七天之内只授权一次
      wx.setStorageSync(AUTH_KEY, Date.now());
      if (cwx.user.isLogin()) {
        contentFissionSaveUserInfo({
          data: {
            headImage: info.avatarUrl,
            nickName: info.nickName,
          },
          cb:()=>{
            //保存用户信息后，回调是登录得不执行
            callback && callback('notNeedLogin')
          }
        });
        return;
      }
      if (flag !== LOAD_KEY) {
        // 如果用户授权的时候没有登录，则先记录在本地,登录回来之后，再上传用户信息
        wx.setStorageSync(AUTH_USERINFO_KEY, JSON.stringify(_info));
        callback && callback()
        //self.toLogin();
      }
    }
  },
  getDingyueList: function (e) {
    const { taskList, userInfo } = e.detail;
    console.log('taskList---------:', taskList);
    console.log('taskList 任务组件返回的数量--------- getDingyueList:', taskList.length);
    const taskId = taskList[0]?.id;
    this.setData({
      dingyueTaskId: taskId,
    });
    try {
      this.ubtTrace('o_gs_tripshoot_cashCampaign_retain_expose', {
        activityID: userInfo?.activityId,
        uid: userInfo?.mainClientAuth,
        platform: 'wechat',
        actiontype: 'getDingyueList',
        actioncode: 'o_gs_tripshoot_cashCampaign_retain_expose',
        actionName: `查看任务组件的数量: ${taskList.length}`,
      })
    } catch (error) { }
  },

  // 获取组件实例,调用组件方法
  handleDingyue: function (e) {
    const { showSubscribePop, showShareSuccess } = this.data;
    if (showSubscribePop) {
      this.ubtTraceAndlog(
        'c_gs_tripshoot_cashCampaign_subscribe_popup_click',
        'Click',
        '完成任务引导弹窗_点击订阅'
      );
    } else if (showShareSuccess) {
      this.ubtTraceAndlog(
        'c_gs_tripshoot_cashCampaign_share_subscribe_click',
        'Click',
        '分享成功弹窗-点击订阅消息'
      );
    }
    const child = this.selectComponent('.task-dingyue');
    child.handleTask(e);
  }
});

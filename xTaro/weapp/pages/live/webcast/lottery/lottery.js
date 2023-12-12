import {
  cwx,
  __global
} from '../../../../cwx/cwx.js';
import common from '../../common/common.js';
import LiveUtil from '../../common/LiveUtil';
import {
 getLottery,
 lotteryResultList
} from '../service/webcastRequest.js';
const LotteryType = {
    CouponManual: 0,//非自动开奖  非自动开奖icon上不会展示‘待领取’和‘未登录’
    CouponAutoOpen: 1,//自动开奖  自动开奖icon上展示的‘待领取’和‘未登录’
    Bag: 3,//福袋抽奖  // 像个可以摇动的机子
}
const LotteryState = {
    Check: 'check',//做任务阶段
    Peek: 'peek',//完成任务，等待用户开奖
    Draw: 'draw',//开奖状态，
}

const LotteryIconName = {
    Icon:'icon',//抽奖，优惠券icon
    Bag:'bag',//福袋
    Packet:'packet',//红包弹窗
    ShareTaskComplete:'shareTaskComplete',//分享任务完成
}

const LotteryUIStatus = {
    Normal: 0,//无资格
    WaitingOpen: 1,//等待用户开奖
    HasPrize: 2,//中奖了
    HasNoPrize: 3,//没有中奖
    EndOrInvalid: 4,//抽奖结束或者无效
    HasPrizeAndEnterRoom:5, // 中奖了 并且再次进入了直播间
    HasFailPrizeAndEnterRoom:6 //中奖失败了 并且再次进入了直播间
}

const LotteryTaskType = {
    View:'view',//观看直播满xx时长
    Share:'share',//分享直播间
    Message:'message',//评论直播
    Cipher:'cipher',//输入抽奖口令
    Follow:'follow',//关注主播
    JoinNoew:'joinNow',//立即参与
}
// pages/live/webcast/lottery/lottery.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isIphoneX:{
      type: Boolean,
      value: false
    },
    liveID:{
      type: Number,
      value: 0
    },
    // lotteryIcon:{
    //   type:Object,
    //    value:{}
    // },
    headerTop:{
      type:Number,
      value:0
    },
   master:{
     type:Object,
     value:{}
   }




  },
    lifetimes: {
    ready() {
    //   this.currentPage = cwx.getCurrentPage() || {};
      // 成功开奖记录后的lotteryId
        wx.getStorage({
          key: `live_save_lotteryId_${this.data.liveID}`,
          success: (res)=> {
           this.lotteryID = res?.data;
          }
        })
    },
    detached() { 
      if (this.bagCountDownTimer) {
        clearInterval(this.bagCountDownTimer);
        this.bagCountDownTimer = null;
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lotteryResult: {
      lotteryStatus: LotteryUIStatus.Normal,  //0无资格， 1还未抽奖可抽奖， 2已中奖， 3未中奖
      result: {}
    },
    lotteryIcon: {  //抽奖或优惠券 （互动任务）
      show: false,
      imageUrl: '',
      lotteryId: 0,
      lotteryType: 0  //0/2-普通抽奖，1-优惠券
    },
    lotteryPannelResult: {},//优惠券&抽奖任务面板数据
    lotteryPanelShow: false,//0-普通抽奖，1-优惠券 是否显示优惠券抽奖任务面板
    lotteryStep: LotteryState.Check, //抽奖三部曲
    lotteryUrl: '', //中奖链接
    couponCountDownStr: '', //倒计时文案
    packetCountDownStr: '', //红包倒计时文案
    bagCountDown: 0, // 福袋倒计时
    bagIcon: {  //福袋 （主播抽奖）
      show: false,
      imageUrl: '',
      lotteryId: 0,
      lotteryType: 0  //0/2-普通抽奖，1-优惠券 , 3-福袋
    },
    bagStep: LotteryState.Check, //抽奖三部曲
    bagResult: {}, //福袋内容
    bagResultPanelShow: false, //面板是否显示
    bagRulePanel: false, //规则面板
    bagBtn: {},  //福袋面板按钮
    showOpenLuckyLoading: false,//显示福袋面板loading
    showLuckyBag: false,//是否显示福袋中奖面板
    showWinners: false,//是否显示中奖观众
    drawResult: {//福袋结果
      prize: '',//奖品名称
      hasPrize: false,//是否中奖
    },
    winnerList: [],//中奖观众列表
    listLoadingState:0,
    env: __global.env,
  },
  bagCountDownTimer: null, //福袋倒计时
  closeLotteryTimer: null, //关闭定时器
    couponCountDown: 0, //优惠券倒计时
    couponCountDownTimer: null, //优惠券倒计时
    couponCountDownLeftMin: 0, //倒计时剩余分钟
    couponCountDownLeftSec: 0, //倒计时剩余秒数
    firstShowCoupon: true,  //第一次展示优惠券，弹框5s后自动消失
    couponCountDownLeftTime: 5000, //5秒后自动关闭
    isCheckingRequireTime: false,  //校验本地时间和倒计时


  /**
   * 组件的方法列表
   */
  methods: {
    catchtouchmove:function(){
			// this.hideDrawPanel();
      return false
    },
//红包模块开始
    //关闭红包
    closeLottery: function(parmas){
      let lotteryResult = this.data.lotteryResult;
      let lotteryIcon = this.data.lotteryIcon;
      if(this.closeLotteryTimer){
      clearTimeout(this.closeLotteryTimer);
      this.closeLotteryTimer = null;
      }
      if(lotteryIcon.lotteryType ==  LotteryType.CouponAutoOpen && this.closeCouponTimer){
      clearInterval(this.closeCouponTimer);
      this.closeCouponTimer = null;

      }
      if(parmas==1){
        if(lotteryResult.lotteryStatus==1){ // 如果是红包弹出来的话 需要关掉
          lotteryResult.lotteryStatus = LotteryUIStatus.Normal;
        }else{
          return;
        }
        // 是中奖弹框的话，就不需要关闭
      }else{
        lotteryResult.lotteryStatus = LotteryUIStatus.Normal;
      }
      
      // this.hideLotteryPanel();
      this.setData({
          lotteryResult: lotteryResult,
          lotteryStep:LotteryState.Check,
          packetCountDownStr: '',
      })
  },

  //优惠券抽奖ICON点击
  lotteryIconTapAction:function(e){
      let type = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.type || '';
      this.checkLottery(type, this.data.lotteryIcon.lotteryType);
  },

  //福袋ICon点击
  bagIconTapAction:function(e) {
      let type = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.type || '';
      this.checkLottery(type, 3);
  },

  //红包弹窗开奖点击
  redPacketTapAction:function(e) {
      let type = e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.type || '';
      this.checkLottery(type,this.data.lotteryIcon.lotteryType);
  },

  manualClickLotteryIcon:function(iconType) {
      return iconType == LotteryIconName.Icon || iconType == LotteryIconName.Bag || iconType == LotteryIconName.ShareTaskComplete
  },

  checkLotteryAfterLogin() {
      let self = this;
      let lotteryIcon = self.data.lotteryIcon;
      if(lotteryIcon.lotteryType ==  LotteryType.CouponAutoOpen && lotteryIcon.lotteryId || self.data.bagResultPanelShow){
          self.setData({
              couponCountDownStr:''
          });
          self.checkLottery('', lotteryIcon.lotteryType);
      }
  },

  checkLottery: function (iconType, lotteryType, tolerance=false) {
      let self = this;
      let actionCode = '';
      let lotteryIcon = {};
      if (lotteryType ==  LotteryType.Bag) {
          lotteryIcon = self.data.bagIcon;
      } else {
          lotteryIcon = self.data.lotteryIcon;
      }
      let lotteryId = lotteryIcon.lotteryId;
      let paramStep =  lotteryType ==  LotteryType.Bag ? this.data.bagStep :  this.data.lotteryStep;
      if (!cwx.user.isLogin() && lotteryType != LotteryType.Bag || (lotteryType ==  LotteryType.Bag && iconType == LotteryIconName.Bag && !cwx.user.isLogin()) ) {
          if(lotteryType ==  LotteryType.CouponAutoOpen){
            LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_couponicon_click', {
                  actionCode: 'c_gs_tripshoot_lvpailive_couponicon_click',
                  couponID: lotteryId,
                  couponState: '未登录',
              });
          }
          if(lotteryType ==  LotteryType.CouponManual){
            LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_couponicon_fzd_click', {
              actionCode: 'c_gs_tripshoot_lvpailive_couponicon_fzd_click',
              couponID: lotteryId,
              couponState: '未登录',
          });
          }
          self.hideCommentInput();
          self.toLogin();
          return;
      }
      if(iconType == LotteryIconName.Icon){
          actionCode = 'c_gs_tripshoot_lvpailive_lotteryicon_click';
          if(lotteryType ==  LotteryType.CouponAutoOpen){
              actionCode = 'c_gs_tripshoot_lvpailive_couponicon_click';
          }
          if(lotteryType ==  LotteryType.CouponManual){
            actionCode = 'c_gs_tripshoot_lvpailive_couponicon_fzd_click';
          }
      } else if(iconType == LotteryIconName.Packet){
          actionCode = 'c_gs_tripshoot_lvpailive_lotterypopup_click';
      } else if (iconType == LotteryIconName.Bag) {
          actionCode = 'c_gs_tripshoot_lvpailive_lotteryicon_click';
      }
      if(actionCode){
          let traceDetail = {
              actionCode: actionCode,
              liveState: self.liveStatusText,
              // lotteryID: lotteryId,
              lotteryType: lotteryType,
          }
          if(lotteryType ==  LotteryType.CouponManual){
            traceDetail.couponID = lotteryId;
          }else{
            traceDetail.lotteryID = lotteryId;
          }
          this.doLotteryTrace(traceDetail)
      }
      if(!self.data.master.isFollow && lotteryType != LotteryType.Bag && iconType == LotteryIconName.Packet && lotteryType != LotteryType.CouponAutoOpen){
          wx.showToast({
              title: '先关注主播，才能抽取奖品哦',
              icon: 'none'
          }) 
          return;
      }

      //peek 和 draw 写死
      if (paramStep == LotteryState.Peek || paramStep == LotteryState.Draw) {
          tolerance = true;
      }
      let param = {
          liveId: this.data.liveID,
          lotteryId: lotteryId,
          step:  paramStep,
          tolerance:tolerance,//倒计时结束5s容错机制
      }
      getLottery(param,function(res){  //lotteryStatus
          if(common.checkResponseAck(res)){
              let lotteryResult = {};
              let peekResult = res.data.peekResult || {};
              let drawResult = res.data.drawResult || {};
              let checkResult = res.data.checkResult || {};
              let bagCountDown = 0;
              let bagResult = {};
              let bagResultPanelShow = self.data.bagResultPanelShow;
              let task = {};
              // drawResult.hasPrize = true;
              if(paramStep == LotteryState.Check){
                  if(checkResult && lotteryType ==  LotteryType.CouponAutoOpen ){
                      if(!checkResult.hasDrawn ){ //到这边再判断，如果是优惠券的话，未领取的再显示
                          if(!lotteryIcon.show){
                              lotteryIcon.show = true;
                              LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_couponicon_show', {
                                  couponID: lotteryId,
                              });
                          }
                      } else {
                          lotteryIcon.show = false;
                      }
                      self.setData({
                          lotteryIcon: lotteryIcon
                      })
                      if(actionCode){
                          let traceDetail = {
                              actionCode: actionCode,
                              couponID: lotteryId,
                              couponState: res.data.goNext ? '待领取' : '尚未可领取'
                          }
                          LiveUtil.sendUbtTrace(actionCode, traceDetail);
                      }
                  }
                  if (checkResult && lotteryType ==  LotteryType.Bag) {
                      bagCountDown = checkResult.countdown || 0;
                      bagResult = checkResult;
                      task = bagResult.taskStatus &&  bagResult.taskStatus.find(t => t.status === 0);
                      if (task && task.type == LotteryTaskType.Cipher) {
                          task = {...task}
                          task.title='发送抽奖口令';//口令抽奖按钮不取任务标题
                      }
                      if (!lotteryIcon.show) {
                          lotteryIcon.show = true;
                          LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_lotteryicon_show', {
                              lotteryID:lotteryId,
                              type:lotteryType
                          });
                      }
                      
                      if (iconType == LotteryIconName.Bag) {
                          bagResultPanelShow = true;
                      }
                      self.setData({
                          bagIcon: lotteryIcon,
                          bagCountDown: bagCountDown,
                          bagBtn: task || {},
                          bagResult: bagResult,
                          bagResultPanelShow: bagResultPanelShow
                      })
                      self.handleBagCountDown();
                     
                  }
                  if (res.data.goNext) {
                      if (lotteryType ==  LotteryType.Bag) {
                          if (!checkResult.hasDrawn && !!!task && bagResultPanelShow) {
                              self.data.bagStep = LotteryState.Draw;
                              self.checkLottery('', lotteryType);
                          }
                          return;
                      } else { 
                          self.data.lotteryStep = LotteryState.Peek; // check-peek(为了展示图片的)
                          if(lotteryType ==  LotteryType.CouponAutoOpen) {
                              self.couponCountDown = 0;
                              self.resumeCouponLotteryTimer();
                              self.setData({
                                  couponCountDownStr: '待领取'
                              })
                              if(!self.firstShowCoupon && iconType == ''){
                                  self.data.lotteryStep = LotteryState.Check;
                              }
                              if(self.data.lotteryStep == LotteryState.Peek){
                                  self.checkLottery('', lotteryType);
                              }
                          } else if (lotteryType ==  LotteryType.CouponManual) {
                              if(iconType == LotteryIconName.Icon){//手动点击icon开奖
                                  self.checkLottery('', lotteryType);
                              } else {
                                  self.handleLotteryPanelData(checkResult, true);
                              }
                          }
                          
                          return;
                      }
                  } else {
                      if(checkResult && !checkResult.hasDrawn && (lotteryType == LotteryType.CouponManual || lotteryType ==  LotteryType.CouponAutoOpen)){
                          self.couponCountDown = checkResult.requireViewTime;
                          //开启观看倒计时逻辑
                          self.resumeCouponLotteryTimer(checkResult);
                      
                          //分享任务完成之后还有任务 出任务面板，口令完成还有任务不出，观看时长任务完成之后还有任务出浮层（因为面板本来就是显示的）
                          if (self.manualClickLotteryIcon(iconType)){
                              self.handleLotteryPanelData( checkResult,true);
                          } else {
                              //保持抽奖底部Pannel的显示状态，更新按钮文案和任务进度
                              self.handleLotteryPanelData(checkResult, self.data.lotteryPanelShow);
                          }  
                          if (!checkResult.taskStatus || checkResult.taskStatus.length < 1) {//结束抽奖时，页面返回时保持抽奖结束状态
                              lotteryResult = self.data.lotteryResult;
                          }
                      }
                  }
                  
              } else if (paramStep == LotteryState.Peek && peekResult && peekResult.imageUrl){
                  self.hideCommentInput();
                  lotteryResult = {
                      lotteryStatus: LotteryUIStatus.WaitingOpen,
                      result: peekResult
                  }
                  if (res.data.goNext) {
                      if (lotteryType ==  LotteryType.Bag) {
                          self.data.bagStep = LotteryState.Draw;
                      } else {
                          self.data.lotteryStep = LotteryState.Draw;
                      }
                  } 
                  if(lotteryType ==  LotteryType.CouponAutoOpen){
                      // 自动开奖：任务均已完成，关闭浮层，出开奖弹窗
                      self.handleLotteryPanelData(self.data.lotteryPannelResult, false);

                      //埋点参数
                      let traceDetail = {
                          actionCode: 'c_gs_tripshoot_lvpailive_couponpopup_show',
                          couponID: lotteryId,
                          couponState:res.data.goNext ? '待领取' : '尚未可领取',
                          couponshowtype: self.firstShowCoupon ? '自动弹出' :'点击弹出', //“自动弹出”“点击弹出”
                      }
                      LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_couponpopup_show', traceDetail);
                      if(self.firstShowCoupon){ //弹窗后将ID加入到缓存里
                          self.setData({
                              packetCountDownStr: '5秒后关闭'
                          })
                          self.closeCouponTimer = setInterval(function(){
                              if(self.couponCountDownLeftTime > 1000){
                                  self.couponCountDownLeftTime = self.couponCountDownLeftTime - 1000;
                                  self.setData({
                                      packetCountDownStr: self.couponCountDownLeftTime/1000 + '秒后关闭'
                                  })

                              } else {
                                  self.closeLottery(1); //倒计时结束后 需要关闭红包弹框  但不需要关闭中奖弹框和失败弹框
                                  self.setData({
                                      packetCountDownStr: ''
                                  })
                              }
                              
                          },1000);
                          self.handleLotteryIds(lotteryId,'set');
                          self.firstShowCoupon = false;
                      } else {
                          if(self.closeCouponTimer){
                              self.setData({
                                  packetCountDownStr: ''
                              })
                              clearInterval(self.closeCouponTimer)
                          }
                      }
                  }
              } else if ((paramStep == LotteryState.Draw || paramStep == LotteryState.Peek)) {
                  if (lotteryType ==  LotteryType.Bag) {//福袋抽奖
                      wx.showToast({
                          title: '恭喜，已成功参与活动',
                          icon: 'none'
                      })
                      self.data.bagStep = LotteryState.Check;
                      self.checkLottery('', lotteryType);
                      return;
                  } else {// 运营抽奖（自动+非自动）
                      self.hideCommentInput();
                      if(drawResult.hasPrize){
                          // 第一次展示中过奖
                          if(self.lotteryID!=lotteryId){
                            lotteryResult.lotteryStatus = LotteryUIStatus.HasPrize;
                            self.data.lotteryUrl = res.data.nextUrl;
                          }else{// 中过奖后再次进入
                            lotteryResult.lotteryStatus = LotteryUIStatus.HasPrizeAndEnterRoom;
                            // self.data.lotteryUrl = res.data.nextUrl;
                          }
                         
                      } else {
                        if(self.lotteryID!=lotteryId){
                          lotteryResult.lotteryStatus = LotteryUIStatus.HasNoPrize;
                        }else{// 
                          lotteryResult.lotteryStatus = LotteryUIStatus.HasFailPrizeAndEnterRoom;
                        }
                      }
                       //将此次中奖的lotteryId 存入在本地
                       self.lotteryID = lotteryId 
                       try {
                         wx.setStorageSync(`live_save_lotteryId_${self.data.liveID}`, self.lotteryID);
                       } catch(e) {
                         // Do something when catch error
                       }

                      lotteryResult.result = drawResult;
                      if(lotteryType ==  LotteryType.CouponAutoOpen && paramStep == LotteryState.Draw){

                          let traceDetail = {
                              actionCode: 'c_gs_tripshoot_lvpailive_couponpopup_click',
                              couponID: lotteryId,
                          }
                          LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_couponpopup_click', traceDetail);
                      }
                  }
              }
              self.setData({
                  lotteryResult: lotteryResult
              }, () => {
                  //未中奖弹窗或者中过后重新进入 3秒自动消失
                  if(lotteryResult.lotteryStatus == LotteryUIStatus.HasNoPrize||lotteryResult.lotteryStatus ==LotteryUIStatus.HasPrizeAndEnterRoom || lotteryResult.lotteryStatus == LotteryUIStatus.HasFailPrizeAndEnterRoom){
                      self.closeLotteryTimer = setTimeout(()=>{
                          self.closeLottery();
                      },3000)
                      
                  }
                  let lotteryIcon = self.data.lotteryIcon;
                  if(lotteryIcon.lotteryType ==  LotteryType.CouponAutoOpen && (lotteryResult.lotteryStatus == LotteryUIStatus.HasPrize || lotteryResult.lotteryStatus == LotteryUIStatus.HasNoPrize)){ //优惠券领取后弹框消失
                      lotteryIcon.show =false;
                      self.setData({
                          lotteryIcon:lotteryIcon
                      })
                  }
              })
          }
      })

  },

  removeCouponLotteryTimer:function(){
      if (this.couponCountDownTimer) {
          clearInterval(this.couponCountDownTimer);
      }
  },

  resumeCouponLotteryTimer:function(checkResult){
      let self = this;
      if (self.couponCountDown && self.couponCountDown > 0) {
          self.handleCouponTimeCountDown(self.couponCountDown)
          clearInterval(self.couponCountDownTimer);
          self.couponCountDownTimer = setInterval(function(){
              self.couponCountDown = self.couponCountDown - 1000;
              self.handleCouponTimeCountDown(self.couponCountDown)
              if (self.data.lotteryPanelShow) {
                  //倒计时，更新任务按钮倒计时文案
                  self.handleLotteryPanelData(checkResult,true);
              }
          }, 1000);
      } else {
          self.couponCountDownLeftSec = 0;
          self.couponCountDownLeftMin = 0;
          clearInterval(self.couponCountDownTimer);
      }
  },
  handleCouponTimeCountDown: function(leftTime){

    //d,h,m,s保存倒计时的时间  
    let d = 0,
        h = 0,
        m = 0,
        s = 0,
        countDownStr = '';
    if(leftTime > 0) {
        m = Math.floor(leftTime/1000.0/60);  
        s = Math.floor(leftTime/1000.0%60);
       
        if(m > 0) {
            this.couponCountDownLeftMin = m;
            if(m < 10){
                m = "0" + m;
            }
            countDownStr += m + ":";
        }else if(m == 0){
            this.couponCountDownLeftMin = m;
            countDownStr = '00' + ":";
        }
        if(s > 0) {
            this.couponCountDownLeftSec = s;
            if(s < 10){
                s = "0" + s;
            }
            countDownStr += s ;
        } if(s == 0){
            this.couponCountDownLeftSec = s;
            countDownStr += '00';
        }
        this.setData({
            couponCountDownStr: countDownStr
        })
        
    } else {
        if(this.couponCountDownTimer){
            clearInterval(this.couponCountDownTimer);
        }
        this.setData({
            couponCountDownStr: ''
        })
        this.isCheckingRequireTime = true;
        let lotteryIcon = this.data.lotteryIcon;
        this.checkLottery('', lotteryIcon.lotteryType, true);
    }
 },
  checkLotteryConditions:function(){
        this.resumeCouponLotteryTimer(this.data.lotteryPannelResult);
        if (this.data.bagResultPanelShow && this.data.bagBtn && this.data.bagBtn.type == LotteryTaskType.Share) {
            this.checkLottery('', LotteryType.Bag); // 分享完回来之后走一下接口，查看福袋任务情况
        } else if (this.data.lotteryPannelResult.currentTask && this.data.lotteryPannelResult.currentTask.type == LotteryTaskType.Share ) {
            //分享之后模拟点击优惠券抽奖ICON
            this.checkLottery(LotteryIconName.ShareTaskComplete, this.data.lotteryIcon.lotteryType); // 分享完回来之后走一下接口，查看抽奖任务情况
        } else if (this.couponCountDown > 0 && this.data.lotteryIcon.lotteryType == LotteryType.CouponAutoOpen  ) {
            //有自动开奖的优惠券，观看倒计时从其他页面回来刷新一下
            this.checkLottery('', this.data.lotteryIcon.lotteryType);
        }
  },

  handleLotteryPanelData:function(checkResult, lotteryPanelShow) {
      if (!checkResult || !checkResult.taskStatus || checkResult.taskStatus.length < 1) {
          this.hideLotteryPanel();
          return;
      }
      let lotteryPannelResult = {...checkResult};

      let currentTask = checkResult.taskStatus &&  checkResult.taskStatus.find(t => t.status === 0) || {};
      // currentTask.title="输入抽奖口令：携程在手说走就走携程在手说走就走携程在手说走就走携程在手说走就走携程在手说走就走"
      if (currentTask.type == LotteryTaskType.View) {
          currentTask.buttonText = '还需观看'+this.data.couponCountDownStr;
      } else if (currentTask.type == LotteryTaskType.Share) {
          currentTask.buttonText = '分享直播间';
      } else if (currentTask.type == LotteryTaskType.Message) {
          currentTask.buttonText = '去评论';
      } else if (currentTask.type == LotteryTaskType.Follow) {
          currentTask.buttonText = currentTask.title;
      }  else if (currentTask.type == LotteryTaskType.Cipher) {
        currentTask.buttonText = '发送抽奖口令';
    } else {
          currentTask.type = LotteryTaskType.JoinNow;
          currentTask.buttonText = '立即参与';
      }
      lotteryPannelResult.currentTask = currentTask;
      lotteryPannelResult.lotteryIcon = this.data.lotteryIcon;
      this.showLotteryPanel(lotteryPanelShow);
      this.setData({
          lotteryPannelResult:lotteryPannelResult
      })
  },

  handleCouponLotteryTaskAction: function() {
      
      // let { lotteryPanelShow, inputValue, master } = this.data;
      let { lotteryPanelShow, master } = this.data;
      let inputValue='';
      let task = this.data.lotteryPannelResult && this.data.lotteryPannelResult.currentTask;
      let taskButton = ''
      if (task) {
          if (task.type === LotteryTaskType.Share) {//分享
              lotteryPanelShow = false;
              taskButton = '2';
          } else if (task.type === LotteryTaskType.Cipher){//口令
              lotteryPanelShow = false;
              inputValue = task.cipher;
              this.toInputFocus();
              taskButton = '3';
          } else if (task.type === LotteryTaskType.Message) {
              lotteryPanelShow = false;
              this.toInputFocus();
          } else if (task.type === LotteryTaskType.View) {
              wx.showToast({
                  title: '任务未完成,需继续观看直播',
                  icon: 'none'
              });
              taskButton = '1';

          } else if (task.type === LotteryTaskType.Follow) {
            this.triggerEvent('doTriggerFollow',{id:master.masterID,callback:() => {
                this.checkLottery(LotteryIconName.Iconype, this.data.lotteryIcon.lotteryType);
            }})
            //   this.currentPage.doFollow(master.masterID, () => {
            //     this.checkLottery(LotteryIconName.Iconype, this.data.lotteryIcon.lotteryType);
            //   });
        }else if (task.type === LotteryTaskType.JoinNow) {//立即参与
              //此时处于LotteryUIStatus.WaitingOpen状态，只需要隐藏任务面板，开奖红包就会显示出来
              lotteryPanelShow =  false;
              taskButton = '0';
              //手动点击
              this.checkLottery(LotteryIconName.Icon, this.data.lotteryIcon.lotteryType);
          }

          this.showLotteryPanel(lotteryPanelShow);
          this.triggerEvent('setInputValue',{value:inputValue})
          // this.setData({
          //     inputValue: inputValue
          // })
          // this.inputValueData = inputValue;

          LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_coupons_popup_button_click', {
              Taskbutton:taskButton,
          })
      }
  },

  //显示抽奖
  showLotteryIcon: function(lottery){  //lotteryType 0/2-普通抽奖，1-优惠券 , 3-福袋

      let lotteryIcon = {
          show: lottery.lotteryType ==  LotteryType.CouponManual || !cwx.user.isLogin()? true : false,
          lotteryId: lottery.lotteryId,
          imageUrl: lottery.imageUrl,
          lotteryType: lottery.lotteryType || 0
      };
      if (lottery.lotteryType !== 3) {
          this.initLotteryInfo();
      }
     
      this.handleLotteryIds(lottery.lotteryId,'get');
      let couponCountDownStr = '';
      if (!cwx.user.isLogin() && lottery.lotteryType ==  LotteryType.CouponAutoOpen) {
          couponCountDownStr = '请登录';
          LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_couponicon_show', {
              couponID: lottery.lotteryId,
          });
      }
      // 非自动抽奖 不管登陆还是没登陆 都会展示
      if (lottery.lotteryType ==  LotteryType.CouponManual) {
        couponCountDownStr = '请登录';
        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_couponicon_fzd_show', {
            couponID: lottery.lotteryId,
        });
     }
      if (lottery.lotteryType ==  LotteryType.Bag) {
          this.setData({
              bagIcon: lotteryIcon,
          }, () => {
              this.checkLottery('', lottery.lotteryType);
          })
      } else {
          this.setData({
              lotteryIcon: lotteryIcon,
              couponCountDownStr: couponCountDownStr
          },()=>{
              if(lottery.lotteryType ==  LotteryType.CouponAutoOpen && cwx.user.isLogin()){
                  this.checkLottery('', lottery.lotteryType);
              }
          })
      }

  },
  

  //初始化相关的抽奖信息
  initLotteryInfo: function(){
      let lotteryStep = LotteryState.Check,
          lotteryUrl = '',
          lotteryResult = {
              lotteryStatus: LotteryUIStatus.Normal,  //0无资格， 1还未抽奖可抽奖， 2已中奖， 3未中奖
              result: {}
          };
      if(this.closeLotteryTimer){
          clearTimeout(this.closeLotteryTimer);
          this.closeLotteryTimer = null;
      }
      if(this.closeCouponTimer){
          clearInterval(this.closeCouponTimer);
          this.closeCouponTimer = null;

      } 
      if(this.couponCountDownTimer){
          clearInterval(this.couponCountDownTimer);
          this.couponCountDownTimer = null;

      }
      this.couponCountDown = 0; //优惠券倒计时
      this.couponCountDownLeftMin = 0;//倒计时剩余分钟
      this.couponCountDownLeftSec = 0;//倒计时剩余秒数
      this.couponCountDownLeftTime = 5000;
      this.setData({
          lotteryResult: lotteryResult,
          lotteryStep: lotteryStep,
          lotteryUrl: lotteryUrl,
          couponCountDownStr: ''
      })
     
  },

  handleLotteryIds: function(lotteryId,type){
      let storageLotteryIds = wx.getStorageSync('LP_WEBCAST_LOTTERYID') || [];
      let isInArr = false;
      if(type == 'get'){
          if(storageLotteryIds && storageLotteryIds.length){
              storageLotteryIds.map((item,index)=>{
                  if(item == lotteryId){
                      isInArr = true;
                  }
              })
          } 

          if(!isInArr){
              
              this.firstShowCoupon = true;
          } else {
              this.firstShowCoupon = false;
          }
      }

      if(type == 'set'){
          storageLotteryIds.push(lotteryId);
          wx.setStorage({
            key: "LP_WEBCAST_LOTTERYID",
            data: storageLotteryIds
          })
      }
  },

  hideLotteryIcon: function(hideLotteryId){
      let lotteryIcon = this.data.lotteryIcon;
      let bagIcon = this.data.bagIcon;
      if (lotteryIcon.lotteryId == hideLotteryId) {
          //优惠券抽奖，lotteryType=0，1

          lotteryIcon.show = false;
          this.setData({
              lotteryIcon: lotteryIcon
          });
          this.initLotteryInfo();
          this.closeLottery();
          //抽奖结束如果任务面板还是显示状态，隐藏面板，显示抽奖结束UI
          if (this.data.lotteryPanelShow) {
              let lotteryResult = {
                  lotteryStatus: LotteryUIStatus.EndOrInvalid,
              }
              this.setData({
                  lotteryResult: lotteryResult,
                  lotteryPanelShow:false,//结束抽奖
              });
          }
      } else if (bagIcon.lotteryId == hideLotteryId) {
          //福袋抽奖
          bagIcon.show = false;
          this.setData({
              bagIcon: bagIcon
          })
      }
      
  },
  doLotteryBtn: function(){
      let traceDetail = {
          actionCode: 'c_gs_tripshoot_lvpailive_lotteryresults_click',
          lotteryID: this.data.lotteryIcon.lotteryId,
          lotteryType: this.data.lotteryIcon.lotteryType
        } // detail对象，提供给事件监听函数
      this.doLotteryTrace(traceDetail)
      this.closeLottery();
  },
  jumpToLottery: function(){
      let url = this.data.lotteryUrl;
      if(url.includes('liveOpenGoods')){//打开货架 并关掉运营抽奖 使用⌚️监方法
        try {
            cwx.Observer.noti("live_open_goods", {
              refresh: "true"
          })
          } catch (error) { }
        // this.currentPage.selectComponent('.goods-list')?.showShopWrapper()
        this.closeLottery();
      }else{
        LiveUtil.jumpToProductItem(url)
      }
     
  },
  doLotteryTrace: function(info){
      let trace = info || {};
      let obj ={
        // couponID: trace.lotteryID,
        // lotteryID: trace.lotteryID,
        type: trace.lotteryType,
      }
      if(trace.couponID){
        obj.couponID = trace.couponID
      }else{
        obj.lotteryID = trace.lotteryID
      }
      LiveUtil.sendUbtTrace(trace.actionCode, {
          ...obj,
      });
  },
  showLotteryPanel: function(lotteryPanelShow) {
    this.setData({
        lotteryPanelShow:lotteryPanelShow
    });
    if (lotteryPanelShow) {
        LiveUtil.sendUbtTrace('o_gs_tripshoot_lvpailive_coupons_popup_show')
    }
},

hideLotteryPanel: function() {
    this.setData({
        lotteryPannelResult:{},
        lotteryPanelShow:false,
    });
},
  //福袋倒计时
  handleBagCountDown: function () {
    let self = this;
    if (self.bagCountDownTimer) {
        return;
    }
    self.bagCountDownTimer = setInterval(() => {
        let bagCountDown = parseInt(self.data.bagCountDown);
        if (bagCountDown > 1) {
            bagCountDown = bagCountDown - 1 ;
            self.setData({
                bagCountDown: bagCountDown
            })
        } else {
            clearInterval(self.bagCountDownTimer);
            self.bagCountDownTimer = null;
            let bagBtn = self.data.bagBtn;

            let bagResultPanelShow = self.data.bagResultPanelShow;
            if (bagBtn && bagBtn.type) {
                wx.showToast({
                    title: '活动已结束',
                    icon: 'none'
                })
                bagResultPanelShow = false;
            }
            self.setData({
                bagCountDown: 0,
                bagResultPanelShow: bagResultPanelShow
            })
            
        }
        
    },1000)
},

//福袋条件判断
handleBagTaskAction: function() {
    
    let { bagResult, bagIcon, bagCountDown, bagBtn, bagResultPanelShow , master,  } = this.data;
    let inputValue=''
    let task = bagBtn;
    let traceTaskName = '';
    if (task) {
        bagBtn.lotteryId = bagIcon.lotteryId;
        bagBtn.title = task.title;
        if (task.type === LotteryTaskType.Share) {//分享
            traceTaskName = "分享";
            bagResultPanelShow = true;
        } else if (task.type === LotteryTaskType.Cipher){//口令
            bagBtn.text = task.cipher;
            traceTaskName = "口令"
            bagResultPanelShow = false;
            inputValue = task.cipher;
            this.toInputFocus();
        } else if (task.type === LotteryTaskType.Message) {
            traceTaskName = "评论";
            bagResultPanelShow = false;
            this.toInputFocus();
        } else if (task.type === LotteryTaskType.View) {
            traceTaskName = "观看"
            wx.showToast({
                title: bagResult.requireViewTime || '任务未完成,需继续观看直播',
                icon: 'none'
            })
        } else if (task.type === LotteryTaskType.Follow) {
            traceTaskName = "关注主播"
            // this.currentPage.doFollow(master.masterID, () => {
            //     this.checkLottery('',  LotteryType.Bag);
            // });
            this.triggerEvent('doTriggerFollow',{id:master.masterID,callback:() => {
              this.checkLottery('',  LotteryType.Bag);
          }})
        }
        LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_lotteryjoin', {
            liveID: this.data.liveID,
            taskName: traceTaskName,
            type: 3,
        })
        this.setData({
            bagResultPanelShow: bagResultPanelShow,
            // inputValue: inputValue
        })
        // this.inputValueData = inputValue
        this.triggerEvent('setInputValue',{value:inputValue})
    } else if (!bagResult.hasDrawn && bagCountDown > 0) {
        this.data.bagStep = LotteryState.Draw;
        this.checkLottery('', LotteryType.Bag);
    }
   

},
handleBagResult: function (lotteryId) {
  LiveUtil.sendUbtTrace('o_live_audience_page_debug', {
      action:"handleBagResult",
      liveID:this.data.liveID
  })
 
  this.setData({
      bagResultPanelShow: false,
      showLuckyBag: true,
      showOpenLuckyLoading: true
  },()=>{
      this._getlotteryResult(lotteryId);
  })
},
 // 福袋面板逻辑开始
 _getlotteryResult: function (lotteryId) {
  cwx.sendUbtByPage.ubtDevTrace('o_live_audience_page_debug', {
      action:"_getlotteryResult_open",
      liveID:this.data.liveID
  })
  try {
      lotteryResultList({
          liveId:this.data.liveID,
          lotteryId: lotteryId
      },(res)=>{
          if(common.checkResponseAck(res) && res.data){
              this.setData({
                  drawResult:res.data.drawResult,
                  winnerList:res.data.resultList,
                  showOpenLuckyLoading: false
              })
          } else {
              this.setData({
                  drawResult:null,
                  showOpenLuckyLoading: false
              })
          }
      });
  } catch(e) {
      console.log("_getlotteryResulte",e);
      this.setData({
          showOpenLuckyLoading: false
      })
  }
},
hideLuckyBag:function() {
  this.setData({
      showLuckyBag: false
  })
},

viewWinners:function() {
  LiveUtil.sendUbtTrace('c_gs_tripshoot_lvpailive_luckyguys', {
      type: 3,
  });
  LiveUtil.sendUbtTrace('o_live_audience_page_debug', {
      action:"_getlotteryResult_viewWinners",
  })
  this.setData({
      showWinners:true,
      listLoadingState:4
  },() => {
      try {
          lotteryResultList({
              liveId:this.data.liveID,
              lotteryId:this.data.bagIcon.lotteryId
          },(res) => {
              if(common.checkResponseAck(res) && res.data){
                  this.setData({
                      winnerList:res.data.resultList,
                      listLoadingState:res.data.resultList && res.data.resultList.length > 0 ? 0 : 5
                  })
              } else {
                  this.setData({
                      winnerList:[],
                      listLoadingState:6
                  })
              }
          });
      } catch(e) {
          console.log("_getlotteryResulte",e);
          this.setData({
              winnerList:[],
              listLoadingState:6
          })
      }
  })
},

hideWinners:function() {
  this.setData({
      showWinners:false
  }) 
},
  //关闭面板
  hideDrawPanel: function () {
    this.setData({
        bagResultPanelShow: false
    })
},
goViewMyLottery:function(){
  this.viewMyLottery(1)
},
viewMyLottery: function (type) {
  let key = 'c_gs_tripshoot_lvpailive_myprize_click';
  if (type == 1) {
    key = 'c_gs_tripshoot_lvpailive_showprize'//前往查看
  }
  LiveUtil.sendUbtTrace(key, {
    liveID: this.data.liveID,
    type: 3, // 福袋的奖品
  });
  // let url = '/pages/market/myprize/myprize';
  let url = 'https://contents.ctrip.com/huodong/myprize/index?popup=close'
  if (__global.env.toLowerCase() === 'uat') {
    url = 'https://contents.ctrip.market.uat.qa.nt.ctripcorp.com/huodong/myprize/index?popup=close'
  } else if (__global.env.toLowerCase() === 'fat') {
    url = 'https://contents.ctrip.fat411.qa.nt.ctripcorp.com/huodong/myprize/index?popup=close';
  }

      common.jumpToDetail(url);
},
showDrawRulePanel: function() {
  this.setData({
      bagRulePanel: !this.data.bagRulePanel
  })
},
handleAutoCheckLotteryTask:function() {
  //发送口令之后查看任务进度
  if (this.data.lotteryPannelResult?.lotteryIcon?.lotteryType ==  LotteryType.CouponAutoOpen) {
      this.checkLottery('', LotteryType.CouponAutoOpen);
  }   
},
  hideCommentInput:function(){
    this.triggerEvent('hideCommentInput')
  },
  toLogin:function(){
    this.triggerEvent('toLogin')
  },
  toInputFocus:function(){
    this.triggerEvent('toInputFocus')
  },
  doPacketMasterFollow:function(){
    this.triggerEvent('doPacketMasterFollow')
  },
  jumpToBagInfo:function(e){
    LiveUtil.jumpToBagInfo(e,this.data.bagResult,this.data.lotteryResult);
  }
  }
})

import {cwx,CPage,_} from "../../../../cwx/cwx.js";
const utils = require('../../common/utils.js');
import { checkIsFromTask } from '../components/countDown/utils'
const model = require('./model.js');
const DEFAULT_HEADIMG = 'https://images3.c-ctrip.com/marketing/2020/08/xcx_energy/default.png';
const DEFAULT_NAME = '神秘用户';
let alarm = require('../mktCommon/alarm.js');
let timeClock=null,timeIntro=null;


CPage({
  pageId: '10650048866',
  signTemplateId:['1a2RJa0mpegB8ozSeJFj0gT3CL-tLFi7SObXnZuv6eg'],
  disabledClick:false,
  activityId:'',
  min:-1,  //奖品列表查询区间
  max:'',
  energyAddConfig:{"10":0,"20":0}, //额外礼包积分奖励
  subscribeState:0,
  checkPerformance: true,  
  data: {
    navbarData: {
      showCapsule: 1,
      bgTransparent: true
    },
    isIntro:false,//手势引导
    jump:'',
    maskData: {
      masktype: -1
    },
    remainTime: {'hour': '00', 'minute': '00', 'second': '00' },   
    currentPosition:0,
    //groupSection:[],   //积分区间
    //taskList:[],
    //showTaskList:false,
    diceStatus:'init',   //骰子状态init|loading|[number]
    topBanner:[],
    bottomBanner:[],
    box:{},//礼包
    animationData: {},
    isAuthUserInfo:true,//是否需要授权用户信息
    //canIUseProfile:wx.canIUse('getUserProfile'),
    noticeList:[],  //公告
    currentSwiper:0
  },
  onLoad(options) {
    this.activityId = options.activityid;
    this.getActivityConfig()
    checkIsFromTask(this)
    let animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'ease',
    })
    this.animation = animation;
    this.logUbt(options.type||this.activityId)
    utils.showToast('活动已结束')

    setTimeout(()=>{
      cwx.redirectTo({
        url:'/cwx/component/cwebview/cwebview?data={"url":"https%3A%2F%2Fm.ctrip.com%2Factivitysetupapp%2Fmkt%2Findex%2Fmembersignin2021%3FisHideNavBar%3DYES"}'
      })
    },1000)
  },
  //埋点统计
  logUbt(type=''){
    try{
      this.ubtTrace(182905, { 
        openid: cwx.cwx_mkt.openid,
        activityId:this.activityId,
        type,
        time:new Date().getTime()
     });
    }catch(e){
      //异常
    }
  },
  onShow(){
    this.enterAct()
  },
  //获取banner配置
  getActivityConfig(){
    model.requestUrl('getActivityConfig',{
      activityId:this.activityId
    },res => {
      if(res && res.errcode == 0) {
        let info=res.activityCustomfields||{}
        if(info.homePageBottomBanner){
          this.setData({
            bottomBanner:JSON.parse(info.homePageBottomBanner)
          })
        }
        if(info.homePageTopBanner){
          this.setData({
            topBanner:JSON.parse(info.homePageTopBanner)
          })
        }
        if(info.box){
          this.setData({
            box:JSON.parse(info.box)
          })
        }
        if(info.extEnergyGridConfig){
          this.energyAddConfig=JSON.parse(info.extEnergyGridConfig)
        }
        if(info.ruleList){
          this.ruleList=JSON.parse(info.ruleList)
        }
        if(info.noticeList){
          this.setData({
            noticeList:JSON.parse(info.noticeList)
          })
        }
      }else{
        utils.showToast(res.errmsg)
      }  
    })
  },
  //用户信息
  getEnergyUserInfo(){
    model.requestUrl('getEnergyUserInfo',{
      pointCurrency:true
    },res => {
      if(res && res.errcode == 0) {
        let {currentChance,currentPosition,countDownSec,point,nickName,headImg=''}=res
        this.setData({currentChance,currentPosition,energyTotal:point,nickName,headImg,countDownSec})
        if (countDownSec>0) {
          timeClock && timeClock.stop();
          timeClock = new alarm(countDownSec*1000, (hour, minute, second)=> {
            this.setData({ remainTime: { 'hour': hour, 'minute': minute, 'second': second },isCountDown:true });
          }, ()=> {
            // this.getEnergyUserInfo();
          });
          timeClock.start();
        }else{
          this.setData({isCountDown:false})
        }
      }else{
        utils.showToast(res.errmsg)
      }  
    })
  },
  //活动初始化
  enterAct(){
    utils.getUserInfoNew((userInfo) => {
      model.requestUrl('enterAct',{
        openId: cwx.cwx_mkt.openid,
        nickName: userInfo.nickName||DEFAULT_NAME,
        headImg:userInfo.avatarUrl||DEFAULT_HEADIMG
      },res => {
        if(res && res.errcode == 10004) {
          //未登录情况下获取登录凭证
          // cwx.user.wxLogin((errCode, funtionName, errorMsg)=> {
          //   if (errCode != 0) {
          //     utils.showToast(errorMsg)
          //   }
          // })
          this.setData({
            maskData: {
              masktype: 'login'
            }
          })
          this.getHomeAwardList({currentTarget:{dataset:{}}})
        }else if(res.errcode == 0){
          this.getEnergyUserInfo()
          //this.getTaskList()
          this.getHomeAwardList({currentTarget:{dataset:{}}})
          this.startIntro()
        }else{
          utils.showToast(res.errmsg)
        }  
      })
    })
  },
  //首页奖品列表
  getHomeAwardList(e){
    //let { min = -1,max=''} = e.currentTarget.dataset;
    let params={
      pageNo:1,
      pageSize:9,
      pointCurrency:true
    }
    //if(min!=-1){this.min=min;params['min']=min;}
    //if(max){this.max=max;params['max']=max;}
    
    model.requestUrl('getProductList',params,res => {
      if(res && (res.errcode == 0||res.errcode == 10004)) {
        let awardList=[]
        _.map(res.productList, (item,index) => {
          if(index%3==0){
            awardList[index/3]=[]
            awardList[index/3].push(item)
          }else{
            awardList[parseInt(index/3)].push(item)
          }
        })
        this.setData({awardList})
      }else{
        utils.showToast(res.errmsg)
      }  
    })
  },
  onPageScroll (e) {
    if (e.scrollTop > 300) {
      this.setData({ 
        navbarData: {
          showCapsule: 1,
          showColor: 0,
          bgTransparent: false
        }
      });
    } else {
      this.setData({ 
        navbarData: {
          showCapsule: 1,
          bgTransparent: true
        }
      });
    }
  },
  onShareAppMessage() {
    //this.setData({showTaskList:false})
    return {
      title: '您有积分待领取，快来领取兑换好礼~',
      path: `/pages/market/directory/game/index?activityid=${this.activityId}&type=share`
    }
  }
})
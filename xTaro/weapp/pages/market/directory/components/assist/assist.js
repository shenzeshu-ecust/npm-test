import { cwx, _ } from "../../../../../cwx/cwx.js";
const UTILS = require('../../../common/utils.js');

Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 属性 埋点 193158
   */
  properties: {
    activityId: {
      type: String,
      value: ''
    },
    assistActivityId: {
      type: String,
      value: ''
    },
    activityConf:{
      type: Object,
      value: {activityName:''}
    },
    identityId: {
      type: String,
      value: ''
    },
    authOpen: {
      type: Boolean,
      value: false
    }
    // showOwnerBtn:{
    //   type: Boolean,
    //   value: false
    // }
  },
  /**
   * 初始数据
   */
  
  disabledClick:false,
  guestId:'',
  data: {
    isMaster: true,
    defaultFriendList:{},
    friendList:[],
    noAssist:true, //未点击助力
    isLogin:false,
    showType:'init'   //按钮展示：init初始短按钮|long长按钮|other参与其他活动 
  },
  ready: function () {
    let { assistActivityId,identityId } = this.data;
    cwx.user.checkLoginStatusFromServer((checkLoginRes) => {
      if (!checkLoginRes) {
        //未登录情况下获取登录凭证
        // UTILS.getLoginCode()
      }
      console.log('登录态====',checkLoginRes)
      this.setData({ isLogin: checkLoginRes });
    });
    this.getAssistDetail()
    cwx.sendUbtByPage.ubtTrace(193158, { 
      type:'onload',
      openId: cwx.cwx_mkt.openid,
      activityId:assistActivityId,
      identityId
    })
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      console.log('===组件onshow====')
      this.getAssistDetail()
    }
  },
  methods: {
     // 获取企微助力结果
    getWeComAssistResult() {
      const { activityId, identityId,assistActivityId } = this.data
      const assistResult=cwx.getStorageSync(`mkt_assist_${identityId}_${this.guestId}`)
      UTILS.fetch('18083', 'getWeComAssistResult', {
        activityId:activityId,
        identityId:identityId,
        assistUnitId:assistActivityId,
        unionId:cwx.cwx_mkt.unionid
      }).then((res) => {
        //showWeComAssistResult:助力需要企微认证+助力点击加企微
        if (res.errCode == 0 && res.weComAssistResult && res.weComAssistResult.showWeComAssistResult) {
          if(!assistResult){
              //assistResult：是否出过toast提示
              let result=res.weComAssistResult;
              if(result.weComAssistResult==1 && result.weComAwardSendResult==1){
                UTILS.showToast('助力成功，送您一张优惠券',2500)
              }else if(result.weComAssistResult==1){
                UTILS.showToast('助力成功',2500)
              }else{
                UTILS.showToast('助力失败',2500)
              }
              cwx.setStorageSync(`mkt_assist_${identityId}_${this.guestId}`, true);
          }
        }
        
      })
      
    },
    //助力信息
    getAssistDetail(){
      let { assistActivityId,identityId } = this.data;
      UTILS.fetch('18083', 'openSharePage', {
        activityId:assistActivityId,  //助力活动id	
        identityId   //主人身份标识	
      }).then((data) => {
        if(data.errCode==0){
          let {master,masterInfo,activityInfo,identityId=''}=data
          //activityInfo.needNum=4
          let defaultFriendList=Array.from({
            length:activityInfo.needNum||0
          },(item) =>({}))
          this.triggerEvent('afterGetAssist', data)
          this.setData({
            isMaster:master,
            masterInfo,
            friendList:activityInfo.friendList||[],
            defaultFriendList
          })
          this.guestId=identityId
          //客态登录了再查询企微静默助力状态
          this.guestId && this.getWeComAssistResult()
        }else{
          UTILS.showToast(data.errMsg)
        }
      }).catch((res) => {
          
      })  
    },
    loginToStartAssist(e){
      UTILS.toLoginPage(()=>{
        UTILS.showToast('登录成功')
        this.setData({
          isLogin: true
        }, () => {
          this.getAssistDetail()
          //this.startAssist()
        })
      },(res)=>{
        this.showToast('登录失败')
      })
      // UTILS.loginPhone(e,'pages/market/directory/boxAssist/index',()=>{
      //   UTILS.showToast('登录成功')
      //   this.setData({
      //     isLogin: true
      //   }, () => {
      //     this.getAssistDetail()
      //     //this.startAssist()
      //   })
      // })
    },
    //开启助力判断
    startAssist(){
      UTILS.fetch('18083', 'getWechatInfo', {}).then((data) => {
        this.toAssist(data||{})
      }).catch((res) => {
        this.toAssist({})
      })
    },
    /**
     * 1001 没有uid
     * 1002 无效的活动id
     * 1003 不能给自己助力
     * 1004 没助力次数
     * 1005 不在助力时间内
     * 1006 已经给好友助力过
     * 1007 助力已经完成了
     * 1008 风控 
    */ 
   toAssist(userInfo){
      let { assistActivityId,identityId,activityConf,activityId } = this.data;
      if(this.disabledClick){
        return;
      }
      this.disabledClick=true
      UTILS.fetch('18083', 'assists', {
        activityId:assistActivityId,  //助力活动id
        assistActivityId:activityId,
        identityId,
        openId:cwx.cwx_mkt.openid,
        headImage:userInfo.headImage||'https://pages.c-ctrip.com/union/Richard/defaultimage.png',
        nickName:userInfo.nickName||'携程用户',
        unionId:cwx.cwx_mkt.unionid
      }).then((data) => {
        switch(data.errCode){
          case 0:
            //UTILS.showToast('助力成功！')
            cwx.mkt.subscribeMsg(['2E1ELYo4Z5znqwutTUMh1EP4YHB7HNvYynuoSpUlFjk'], (data) => {
              this.setData({
                noAssist:false,
                showType:'long'
              })
              //助力完成后
              this.triggerEvent('afterAssist', data)
            },(err) => {
              this.setData({
                noAssist:false,
                showType:'long'
              })
              //助力完成后
              this.triggerEvent('afterAssist', data)
            })
            break;
          case 1005:
            this.setData({
              showType:activityConf.customerBrowseButtonText?'other':'init'
            })
            UTILS.showToast('活动已结束')
            //助力完成后
            this.triggerEvent('afterAssist', data)
            break;
          case 1008:
            this.setData({
              showType:activityConf.customerBrowseButtonText?'other':'init'
            })
            UTILS.showToast('账号异常，无法为好友助力')
            //助力完成后
            this.triggerEvent('afterAssist', data)
            break;
          case 1007:
            this.setData({
              noAssist:false,
              showType:'long'
            })
            UTILS.showToast('来晚一步，您的好友已经助力成功啦！')
            //助力完成后
            this.triggerEvent('afterAssist', data)
            break;
          case 1006:
              this.setData({
                noAssist:false,
                showType:'long'
              })
              UTILS.showToast('您已经帮TA助力了')
              //助力完成后
              this.triggerEvent('afterAssist', data)
            break;
          case 1004:
            this.setData({
              noAssist:false,
              showType:'long'
            })
            UTILS.showToast('您的助力次数已达到上限')
            //助力完成后
            this.triggerEvent('afterAssist', data)
            break;
          case 1001:
            this.setData({
              isLogin:false
            })
            // UTILS.getLoginCode()
            UTILS.showToast('登录失效，请点击按钮重新登录')
            //助力完成后
            this.triggerEvent('afterAssist', data)
            break;
          case 1001:
            this.setData({
              isLogin:false
            })
            // UTILS.getLoginCode()
            UTILS.showToast('登录失效，请点击按钮重新登录')
            //助力完成后
            this.triggerEvent('afterAssist', data)
            break;
          default:
            // UTILS.showToast(data.errMsg)
            //助力完成后
            this.triggerEvent('afterAssist', data)
            break;
        }
        this.getAssistDetail()
        this.disabledClick=false
        
        //埋点
        if(data.errCode==0){
          cwx.sendUbtByPage.ubtTrace(193158, { 
            type:'assistSuccess',
            openId: cwx.cwx_mkt.openid,
            activityId:assistActivityId,
            identityId
          })
        }else{
          cwx.sendUbtByPage.ubtTrace(193158, { 
            type:'assistFail',
            openId: cwx.cwx_mkt.openid,
            activityId:assistActivityId,
            identityId
          })
        }
      }).catch((res) => {
          
      })
    },

    // 助力成功状态, 我也要领券
    assistToRedirectBefore(e) {
      let { authOpen } = this.data;
      if (authOpen) {
        this.triggerEvent('assistToRedirectBefore', e)
      } else {
        this.assistToRedirect(e)
      }
    },

    assistToRedirect(e){
      let { assistActivityId,identityId } = this.data;
      UTILS.toRedirect(e)
      try{
        //客态发起埋点
        cwx.sendUbtByPage.ubtTrace(193158, { 
          type:'guest',
          openId: cwx.cwx_mkt.openid,
          activityId:assistActivityId,
          identityId
        })
      }catch(e){

      }
    },
    assistToNavigate(e) {
      UTILS.toNavigate(e)
    }
  }
})
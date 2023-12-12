import {cwx,CPage,_} from "../../../../cwx/cwx.js";
const utils = require('../../common/utils.js');

CPage({
  pageId: '',
  data: {
  },
  onLoad(options) {
    this.toUrl=options.tourl?decodeURIComponent(options.tourl):''
    console.log('===auth onload===')
    // cwx.user.getCrossToken((token)=>{
    //   console.log('auth 换取token getCrossToken=====',token)
    // })
    cwx.dynamicLogin.subscribe((res) => {
      console.log('登录态同步完成',res);
    })
  },
  //新版
  getUserProfile(){
    if(wx.getUserProfile){
      utils.getUserProfile((userInfo)=>{
        if(!userInfo.nickName){
          this.showTips()
          return
        }
        this.authWechatUserInfo(userInfo)
      })
    }else{
      //低版本提示升级
      utils.showToast('亲，微信版本较低，请升级为新版后，再试！')
    }
  },
  //老版兼容
  // getUserInfo(e){
  //   console.log(e.detail)
  //   if(e && e.detail && e.detail.errMsg=='getUserInfo:fail auth deny'){
  //     this.showTips()
  //     return
  //   }
  //   this.authWechatUserInfo(e.detail.userInfo)
  // },
  authWechatUserInfo(userInfo){
    //调接口
    utils.fetch('16575', 'authWechatUserInfo', {
      activityId:'MKT_APP_COMMON_ACTIVITY',
      openId: cwx.cwx_mkt.openid,
      nickName: userInfo.nickName,
      headImage:userInfo.avatarUrl
    }).then((data) => {
      console.log(this.toUrl)
      if(data && data.errcode===0){
        cwx.redirectTo({
          url: this.toUrl
        });
      }else{
        utils.showToast(data.errmsg)
      }
    }).catch((res) => {
      res.errMsg && utils.showToast(res.errMsg);
    })
  },
  showTips(){
    utils.showToast('亲，不授权无法完成任务。')
  }
})
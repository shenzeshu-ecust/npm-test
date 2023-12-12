import {cwx,CPage,_} from "../../../../cwx/cwx.js";
const Config = require('./config.js');
const UTILS = require('../../common/utils.js');

CPage({
  pageId: '10650059142',
  sceneCode:'',//客态发券场景值
  checkPerformance: true,  
  data: {
    activityId:'',
    loading:true,
    list:[],  //商品列表
    showResult:false,
    prizeList:[]  //客态券列表
  },
  onLoad(options) {
    const {activityid,identityid,productid,boxType,resourceTypeId}=options
    this.setData({
      activityId:activityid,
      identityId:identityid
    })
    this.productId=productid||''
    this.boxType=boxType||'food'
    this.resourceTypeId=resourceTypeId
    this.getActivityConf()
    this.getActivityConfig()
  },
  //活动后台配置字段-查商品列表
  getActivityConfig(){
    UTILS.fetch('18083', 'getActivityConfig', {
      activityId:this.resourceTypeId||Config.getActivityId[this.boxType]
    }).then((data) => {
      if(data.errcode==0){
        let info=data.activityCustomfields||{}
        this.sceneCode=info.sceneCode||''
        this.setData({
          backgroundImg:info.backgroundImg||'',
          title:info.title||''
        })
        if(info.goodsList){
          this.setData({
            list:JSON.parse(info.goodsList)
          })
        }
      }
    }).catch((res) => {

    })
  },
  //助力组件后台配置字段
  getActivityConf(){
    let { activityId } = this.data;
    UTILS.fetch('18083', 'getActivityConf', {
      activityId  //助力活动id
    }).then((data) => {
      if(data.errCode==0){
        let {activityConf}=data||{}
        activityConf.activityRule=activityConf.activityRule.split('|')
        this.setData({
          activityConf
        })
      }else{
        UTILS.showToast(data.errMsg)
      }
    }).catch((res) => {

    })
  },
  //获取助力状态
  afterGetAssist(data){
     if(data.detail && data.detail.master){
      //主人态跳主态发起页
      let h5url=`https://contents.ctrip.com/huodong/blindboxsale/index?activityId=${this.data.activityId}&productId=${this.productId}&boxType=${this.boxType}&identityId=${this.data.identityId}&resourceTypeId=${this.resourceTypeId}`
      cwx.redirectTo({
        url: `/pages/market/web/index?from=${encodeURIComponent(h5url)}&needLogin=true`
      })
     }else{
      this.setData({
        loading:false
      })
     }
  },
  // toIndex(){
  //   //客态参与活动 todo 
  //   cwx.component.cwebview({
	// 	  data: {
	// 		  url: encodeURIComponent('https://contents.ctrip.com/activitysetupapp/mkt/index/2021shuqidacu')
	// 		  //needLogin: true
	// 	  }
	// 	})
  // },
  afterAssist(data){
    if(data.detail && data.detail.errCode==0){
      UTILS.showToast('助力成功！')
    }
  },
  afterAssist(data){
    if(data.detail.errCode==0){
      //助力后发券
      if(this.sceneCode){
        this.sendPrize()
      }else{
        UTILS.showToast('助力成功！')
      }
    }
  },
  sendPrize(){
    let {activityId='',identityId=''}=this.data
    UTILS.fetch('13458', 'join', {
      sceneCode:this.sceneCode,
      allianceInfo:{
        "aid": null,
        "sid": null,
        "ouid": null,
        "pushCode": null
      },
      extension: {
        "vid": null,
        "fingerPrint": null,
        "rmsToken": null,
        "requestUrl": null
      }
    }).then((data) => {
      if(data.code==0){
        let prizeInfo=JSON.parse(data.prizeInfo.custom||'{}').childPrizeInfo||'[]',
            prizeList=JSON.parse(prizeInfo);
        this.setData({
          prizeList
        })
        this.triggerMask()
      }else{
        UTILS.showToast('助力成功！')
      }
      cwx.sendUbtByPage.ubtTrace(194035, { 
        type:'coupon',
        openId: cwx.cwx_mkt.openid,
        sceneCode:this.sceneCode,
        activityId,
        identityId
      })
    }).catch((res) => {

    })
  },
  triggerMask(){
    this.setData({
      showResult:!this.data.showResult
    })
  },
  onShareAppMessage() {
    let {activityConf={shareTitle:''},activityId,identityId}=this.data,
        newTitleList=activityConf.shareTitle.split('|');
    let title=newTitleList[Math.floor(Math.random() * (newTitleList.length))]
    
    return {
      title,
      path: `/pages/market/directory/boxAssist/index?activityid=${activityId}&identityid=${identityId}&productid=${this.productId}&boxType=${this.boxType}&resourceTypeId=${this.resourceTypeId}`,
      imageUrl:activityConf.shareImg||''
    }
  }
})
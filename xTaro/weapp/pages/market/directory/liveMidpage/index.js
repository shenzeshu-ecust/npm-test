import {cwx,CPage,_} from "../../../../cwx/cwx.js";

CPage({
  pageId: '10650045184',
  checkPerformance: true,  
  data: {
    imageUrl:''
  },
  onLoad(options) {
    let {type=''}=options
    let pagePath=`/pages/market/directory/liveMidpage/index`
    if(type){
      pagePath+=`?type=${type}`
    }
    this.setData({
      pagePath,
      imageUrl:`https://images3.c-ctrip.com/marketing/2020/04/wx_service/${type?type:'default'}.png`
    })
  },
  toContact(data){
    console.log(data)
    this.ubtTrace(179954, { 
      openid: cwx.cwx_mkt.openid, 
      pagePath: this.data.pagePath
    });
  }
})
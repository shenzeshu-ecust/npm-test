import {cwx,CPage,_} from "../../../../cwx/cwx.js";
const utils = require('../../common/utils.js');

CPage({
  pageId: '',
  checkPerformance: true,  
  data: {
    awardName: '',
    disabled: false,
    awardPic: '',
    name: '',
    phone: '',
    address: '',
  },
  onLoad(options) {
    this.activityId=options.activityid
    utils.getOpenid(()=>{
      this.getAddressInfo()
    })
    this.setData({
      awardPic:options.awardpic?decodeURIComponent(options.awardpic):'',
      awardName:options.awardname?decodeURIComponent(options.awardname):''
    })
  },
  getAddressInfo(e){
    utils.fetch('18083', 'getAddressInfo', {
      openid:cwx.cwx_mkt.openid,
      activityId: this.activityId
    }).then((data) => {
      console.log(data)
      if(data && data.errcode===0){
        let {name,address,phone}=data.addressInfo||{}
        this.setData({
          name,
          address,
          phone
        })
        if(name && address && phone){
          //三条数据全部有值，不能更新
          this.setData({
            disabled:true
          })
        }
      }
    }).catch((res) => {
      res.errMsg && utils.showToast(res.errMsg);
    })
  },
  handleChange(e) {
    const info = e.detail.value
    const type = e.target.dataset.type
    this.setData({
      [type]: info
    })
  },
  saveAddress() {
    const {name, phone, address} = this.data
    if(!name || !phone || !address) {
      utils.showToast('请填写完整信息')
      return;
    }

    // 校验电话号码
    if(!(/^1[3456789]\d{9}$/.test(phone))){ 
      utils.showToast('手机号码格式不正确')
      return; 
    } 

    utils.fetch('18083', 'saveAddress', {
      openid:cwx.cwx_mkt.openid,
      activityId: this.activityId,
      addressInfo: {
        name,
        phone,
        address
      }
    }).then((data) => {
      console.log(data)
      if(data && data.errcode===0){
        utils.showToast('提交成功',1500,()=>{
          //返回上一页
          setTimeout(()=> {
            cwx.navigateBack()
          },2000)
        })
        this.setData({
          disabled:true
        })
      }else{
        utils.showToast(data.errmsg)
      }
    }).catch((res) => {
      res.errMsg && utils.showToast(res.errMsg);
    })
  }
})
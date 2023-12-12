import {cwx,CPage,_} from "../../../../cwx/cwx.js";
var model = require('./model.js');

CPage({
  pageId: '10650045321',
  checkPerformance: true,  
  data: {
    awardName: '',
    receiveId: '',
    imageUrl: '',
    realName: '',
    phone: '',
    userAddress: ''
  },
  onLoad(options) {
    const that =  this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('fillAddress', function(data) {
      that.setData({
        awardName: data.awardName,
        receiveId: data.receiveId,
        imageUrl: data.imageUrl
      })
    })

    eventChannel.on('showAddressInfo', function(data) {
      that.setData({
        awardName: data.awardName,
        imageUrl: data.imageUrl,
        realName: data.realName,
        phone: data.phone,
        userAddress: data.userAddress
      })
    })
  },
  handleAddressInfo(e) {
    const info = e.detail.value
    const type = e.target.dataset.type
    this.setData({
      [type]: info
    })
  },
  saveAddress() {
    const {receiveId, realName, phone, userAddress} = this.data
    if(!realName || !phone || !userAddress) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
        duration: 2000
      })
      return false;
    }

    // 校验电话号码
    if(!(/^1[3456789]\d{9}$/.test(phone))){ 
      wx.showToast({
        title: '手机号码格式不正确',
        icon: 'none',
        duration: 2000
      })
      return false; 
    } 


    model.requestUrl('updateReceiveAwardInfo',{
      receiveId: receiveId,
      realName: realName,
      phone: phone,
      userAddress: userAddress
    },res => {
      if(res && res.errcode == 0) {
        wx.showToast({
          title: '提交成功',
          icon: 'none',
          duration: 2000,
          complete: () => {
            setTimeout(()=> {
              cwx.navigateBack()
            },2000)
          }
        })
      }
    })
  }
})
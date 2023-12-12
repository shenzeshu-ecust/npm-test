// pages/wallet/myWallet/index.js
import {cwx,CPage,_} from '../../../cwx/cwx.js';
import {util} from '../common/util.js';
import { WalletFetchUserInfoHomeModel } from '../common/model.js'
CPage({
  pageId: '10650060696',
  /**
   * 页面的初始数据
   */
  data: {
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    util.showLoading('加载中...');
    const currentPage = cwx.getCurrentPage();
    this.getUersInfo().then((res)=>{
      util.sendUbt({
        code: 129944,
        desc:'获取信息成功',
        extend:JSON.stringify(res)
      },true)
      this.setData({
        ...res
      });
    }).catch((error)=>{
      util.sendUbt({
        code: 129944,
        desc:'获取信息错误',
        extend:JSON.stringify(error)
      },true)
      util.showToast(error.rmsg,'none',()=>{
        currentPage.navigateBack();
      });
    }).finally(()=>{
      util.hideLoading();
    })
  },

  getUersInfo(){
    return new Promise((resolve,reject)=>{
      WalletFetchUserInfoHomeModel({requestType: ['account']}, {
        onSuccess: (data) => {
          
            if (data.rc === 0) {
              let accountInfo = data.accountInfo || {}
                resolve(accountInfo);
            } else {
                reject({
                    rc: data.rc,
                    rmsg: data.rmsg || ''
                });
            }
        },
        onError: function (e) {
          // console.log(JSON.stringify(e))
         
            reject({
                rc: 10001,
                rmsg: '服务异常，请重试！-E08'
            });
        }
      });
    })
   
  },

  jumpToH5(event){
    const { currentTarget }= event;
    const urlOrin = currentTarget.dataset.jumpurl || '';
    const jumpType = currentTarget.dataset.type || '';
    util.sendUbt({
      code:129944,
      desc:'跳转到H5',
      extend:JSON.stringify({
        urlOrin,
        jumpType,
      })
    },true);
    let jumpURL = urlOrin;
    if(jumpType === 'wallet'){
      const urlStatic = `https://pages.c-ctrip.com/Finance/WechatMiniPages/miniRedirect.html?ver=${new Date().getTime()}`;
      const aimURL = `${jumpURL.substr(0,jumpURL.indexOf('?'))}?source=13&navBarStyle=white&from=${encodeURIComponent(urlStatic)}&ver=${new Date().getTime()}`;
      jumpURL = `${urlStatic}&redirectUrl=${encodeURIComponent(aimURL)}`;
    }
    if(jumpType === 'gift'){
      if(jumpURL.indexOf('?')>-1){
        jumpURL = `${jumpURL}&from=${encodeURIComponent('pages/wallet/myWallet/index')}`
      }else{
        jumpURL = `${jumpURL}?from=${encodeURIComponent('pages/wallet/myWallet/index')}`
      }
    }
    cwx.component.cwebview({
        data: {
            url: encodeURIComponent(jumpURL),
            needLogin:true,
        }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
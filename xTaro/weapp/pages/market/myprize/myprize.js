// pages/market/myprize/myprize.js
import {
  cwx,
  CPage
} from '../../../cwx/cwx.js'

const judgeProtect = (successCb, failCb) => {
  if (wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '1' || wx.getStorageSync('PERSONAL_INFO_AUTHORIZATION_CACHE') === '2') {
    successCb && successCb()
  } else {
    cwx.Observer.addObserverForKey("privacy_authorize", (e) => {
      if (e.agree) {
        successCb && successCb()
      } else {
        failCb && failCb()
      }
    })
  }
}

const backPrevPage = () => {
  console.log('返回上一个页面')
  const pages = getCurrentPages();
  const hasPrevPage = pages.length > 1 ? true : false;
  const canIUseExit = wx.canIUse("exitMiniProgram");
  if (hasPrevPage) {
    cwx.navigateBack()
  } else {
    if (canIUseExit) {
      // 退出小程序
      wx.exitMiniProgram({
        success: () => {
          console.log("退出小程序成功")
        },
        fail: () => {
          console.error("退出小程序失败")
        },
        complete: () => {},
      });
      return true;
    }
    return false;
  }
}


const model = (portID) => {
  return (apiStr, params = {}) => {
    return new Promise((resolve, reject) => {
      cwx.request({
        url: `/restapi/soa2/${portID}/${apiStr}`,
        data: params,
        success: (res) => {
          resolve(res.data)
        },
        fail: reject
      })
    })
  }
};
const prizeTypeMap = [
  {
    value: 1,
    type: '优惠券',
    title: '优惠券',
    btn: '查看',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/yhq.png',
    jumpUrl: '/pages/market/promocode/index/index',
    jumpHint: '请前往携程app-我的-优惠券-优惠券历史记录查看'
  },
  {
    value: 2,
    type: '三方券',
    title: '兑换码',
    btn: '查看',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/dhm.png',
    jumpUrl: '',
    jumpHint: ''
  },
  {
    value: 3,
    type: '实物',
    title: '实物奖品',
    btn: '查看',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/swjp.png',
    jumpUrl: '',
    jumpHint: '请前往携程app-我的-我的工具-我的奖品中查看'
  },
  {
    value: 4,
    type: '空奖品',
    title: '未中奖',
    btn: '',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/wzj.png',
    jumpUrl: '',
    jumpHint: ''
  },
  {
    value: 5,
    type: '礼品卡',
    title: '礼品卡',
    btn: '查看',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/lpk.png',
    jumpUrl: '',
    jumpHint: '请前往携程app-我的钱包查看'
  },
  {
    value: 6,
    type: '现金钱包',
    title: '现金余额',
    btn: '查看',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/xjqb.png',
    jumpUrl: '',
    jumpHint: '请前往携程app-我的钱包查看'
  },
  {
    value: 7,
    type: '权益',
    title: '权益',
    btn: '',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/qy.png',
    jumpUrl: '',
    jumpHint: ''
  },
  {
    value: 8,
    type: '超级会员',
    title: '超级会员',
    btn: '查看',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/cjhy.png',
    jumpUrl: '/cwx/component/cwebview/cwebview?data={"url":"https%3A%2F%2Fcontents.ctrip.com%2Fbuildingblocksweb%2Fspecial%2Fmembershipcard%2Fmember.html%3Fpopup%3Dclose%26ishidenavbar%3Dyes%26pushcode%3Dact_svip_hdjp001","needLogin":true}',
    jumpHint: ''
  },
  {
    value: 9,
    type: '积分',
    title: '积分',
    btn: '查看',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/cjhy.png',
    jumpUrl: '/cwx/component/cwebview/cwebview?data={"url":"https%3A%2F%2Fm.ctrip.com%2Fwebapp%2Frewards%2Fmypoint","needLogin":true}',
    jumpHint: ''
  },
  {
    value: 99,
    type: '其他',
    title: '其他',
    btn: '',
    imgUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/wzj.png',
    jumpUrl: '',
    jumpHint: ''
  }
];
CPage({
  /**
   * 页面的初始数据
   */
  data: {
    pageId: '10650055412',
    activityRecordList: [],
    couponDetail: {},
    pageNo: 1,
    pageList: [],
    isShowPopup: false,
    isNoCnt: false,
    shareData: {
      title: '我的活动奖品',
      path: '/pages/market/myprize/myprize',
      imageUrl: 'https://pages.c-ctrip.com/amsweb/myprize/img/share.jpg',
    },
    startQueryTime:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    console.log('-----onLoad-----');
    this._model1 = model(17381);
    this._model2 = model(13458);
    judgeProtect(() => {
      console.log('乐高奖品页出过隐私弹窗么')
    }, () => {
      backPrevPage()
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    console.log('-----onReady-----');
    if (!cwx.user.isLogin()) {
      cwx.user.login({
        callback() {
          this.queryRecordList(this.data.pageNo);
        }
      });
      return;
    };
    this.queryRecordList(this.data.pageNo);
  },
   /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() { 
    console.log('-----onShow-----');
  },
  queryUserJoinInfo(){
    const params = {
      startQueryTime: this.data.startQueryTime
    }
    console.log('queryUserJoinInfo params', params);
    return this._model2('queryUserJoinInfo', params).then((data) => {
      console.log('queryUserJoinInfo data', data)
      const {
        code,
        activityRecordList
      } = data

      if (code === 0) {
        let newActivityRecordList = this.covertRecordData(activityRecordList);
          this.setData({
            activityRecordList: newActivityRecordList
          })
      } else {
        console.log('code', code);
      }
    })
    .catch(err => {
      console.log('网络繁忙，请稍后再试');
    })
  },
  queryRecordList(pageNo){
    const params = {
      activityTypeID: 0,
      pageNo: pageNo,
      pageSize: 20
    }
    console.log('queryMyActivityRecordList params', params);
    this._model1('queryMyActivityRecordList', params).then(async (data) => {
      console.log('queryMyActivityRecordList data', data)
      const {
        resultCode,
        activityRecordList
      } = data
      
      if (resultCode === 0) {
        //第一条奖品的参与时间
        if(pageNo === 1){
          this.data.startQueryTime = activityRecordList.length > 0 ? activityRecordList[0].participateTime : '';
          console.log('startQueryTime', this.data.startQueryTime);
          //查询当前时间缺少的奖品信息
          await this.queryUserJoinInfo();
        }
        let oldActivityRecordList = this.data.activityRecordList;
        let newActivityRecordList = this.covertRecordData(activityRecordList);
        let allActivityRecordList = [...oldActivityRecordList, ...newActivityRecordList];
        if(activityRecordList.length === 0){
          this.setData({
            pageNo: -1,
          })
        }
        if(allActivityRecordList.length === 0){
          this.setData({
            isNoCnt: true
          })
        }
        this.setData({
          activityRecordList: allActivityRecordList
        })
      } else {
        console.log('resultCode', resultCode);
      }
    })
    .catch(err => {
      console.log('网络繁忙，请稍后再试');
    })
  },
  covertRecordData(data) {   
    var newData = []; 
    data.length > 0 &&
    data.forEach(ele => {
      let newPrizeList = [];
      ele.prizeList.length > 0 &&
        ele.prizeList.forEach(name => {
          let prizeDetail = {};
          prizeTypeMap.forEach(item => {
            if(item.value === name.prizeType){
              prizeDetail = {
                prizeName: name.prizeName,
                prizeType: name.prizeType,
                deadlineTime: this.formDate(name.deadlineTime),
                code: name.code || '',
                cipher: name.cipher || '',
                instruction: name.instruction || '',
                title: item.title,
                btn: item.btn,
                imgUrl: item.imgUrl,
                jumpUrl: item.jumpUrl,
                jumpHint: item.jumpHint,
                isExpire: false
              };
              if(name.deadlineTime && name.deadlineTime.length === 26){
                prizeDetail.isExpire = (new Date().getTime() - parseInt(name.deadlineTime.slice(6, -7))) > 0;
              }
              if(prizeDetail.prizeType === 1 && prizeDetail.isExpire){ //优惠券过期
                prizeDetail.jumpUrl = '';
              } 
            };
          });
          if(typeof name.prizeImg !== 'undefined' && name.prizeImg !== '') { 
            prizeDetail.imgUrl = name.prizeImg;
          };
          newPrizeList.push(prizeDetail);
        })
        let newEle = {
          activityID: ele.activityID,
          mainTitle: ele.mainTitle,
          participateTime: this.formDate(ele.participateTime, 1),
          prizeList: newPrizeList
        }
        newPrizeList.length > 0 && newData.push(newEle);
      })
      console.log('newData', newData);
      return newData;
  },
  formDate(dt, type){
    if(typeof dt !== 'string') return dt;
    if(type === 1) return dt.slice(0, 10);
    let newDt = new Date(parseInt(dt.slice(6, -7)));
    let year = newDt.getFullYear(),       
        month = newDt.getMonth()+1,    
        date = newDt.getDate(); 
    return `${year}-${month < 10 ? `0${month}` : month}-${date < 10 ? `0${date}` : date}`;   
  },
  handleBtn(e) {
    let detail = e.currentTarget.dataset['detail'];
    console.log('handleBtn', detail);
    if (detail.prizeType === 2) {
      //外部券弹窗
      this.setData({
        couponDetail: detail,
        isShowPopup: true
      })
    } 
    else if(detail.jumpUrl !== ''){
      cwx.navigateTo({
        url: detail.jumpUrl
      })
    }
    else if(detail.jumpHint !== ''){
      wx.showModal({
        content: detail.jumpHint,
        showCancel: false,
        confirmText: '知道了'
      })
    } 
  
  },
  handleClose() {
    this.setData({
      isShowPopup: false
    })
  },
  copyText(e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset['text'],
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    console.log('-----onHide-----');
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    console.log('-----onUnload-----');
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    //加载次数加一
    if(this.data.pageNo < 0) return; 
    this.setData({
      pageNo: this.data.pageNo + 1
    })
    this.queryRecordList(this.data.pageNo);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return this.data.shareData;
  }
})
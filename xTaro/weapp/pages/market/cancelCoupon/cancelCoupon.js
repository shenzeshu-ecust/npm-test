// pages/market/cancelCoupon/cancelCoupon.js
import {
  cwx,
  CPage
} from '../../../cwx/cwx.js'

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
const CODE_MESSAGE = {
  '10002': '没有获取到您的登录状态',
  '0': '成功',
  '10008': '您不是供应商',
  '10003': '无相关策略',
  '10004': '策略未启用',
  '10005': '策略未开始',
  '10006': '策略已失效',
  '10007': '该券码不存在',
  '20001': '核销失败！该券码已被核销',
  '10009': '该券码未被领取',
  '10010': '操作频繁',
  '999': '异常'
};
const MESSAGE = {
  NO_VENDOR_INFO: '没有获取到供应商信息',
  NO_LOGIN_STATUS: '没有获取到您的登录状态',
  NEED_WECHART: '请至微信环境使用扫码功能',
  WXSCAN_ERR: '尝试开启微信扫码失败，请刷新重试',
  NET_ERR: '网络错误',
  EXCEPTION: '系统繁忙，请稍后再试',
  USE_COUPON_ERR: '消券失败！'
};
var user = {
  checkLogin: function(callback) {
    if (callback && typeof callback === 'function') {
      cwx.user.checkLoginStatusFromServer(callback); // 异步判断，从服务端判断
    } else {
      return cwx.user.isLogin(); // 同步判读，读取本地auth值，不确定auth是否还有效
    }
  },
  login: function(data) {
    if (!data) {
      data = {};
    }
    if (!data.param || typeof data.param !== 'object') {
      data.param = {};
    }
    if (!data.callback || typeof data.callback !== 'function') {
      data.callback = function() {};
    }

    cwx.user.login(data);
  },
  logout: function(callback) {
    if (typeof callback !== 'function') {
      callback = function() {};
    }
    cwx.user.logout(callback);
  }
}

/**
 * 登录回调
 */
const login = (callback = () => {}) => {
  if (cwx.user.isLogin()) {
    callback()
  } else {
    cwx.user.login({
      callback
    })
  }
};
CPage({

      /**
       * 页面的初始数据
       */
      data: {
        isLogined: false,
        supplierName: '',
        supplierCode: '',
        currCouponCode: '',
        pushCode: '',
        successVendor: '',
        successCode: '',
        isSuccess: false,
        invalidBtnUrl:'https://images3.c-ctrip.com/marketing/2018/05/wxCancelCoupon/cancelCouponBg03.png',
        validBtnUrl:'https://images3.c-ctrip.com/marketing/2018/05/wxCancelCoupon/cancelCouponBg02.png'
      },
      doInputCode(e) {
        let val = e.detail.value
        this.setData({
          currCouponCode: val
        })
      },
      logout: function() {
        var self = this;
        cwx.showModal({
          title: '确定退出登录？',
          confirmText: '退出登录',
          success: function(res) {
            if (res && res.confirm) {
              user.logout(function(success) {
                if (success) {
                  self.setData({
                    isLogined: false
                  })
                  self.onShow()
                } else {
                  cwx.showModal({
                    title: '退出登录失败，请重新再试！',
                    showCancel: false
                  });
                }
              })
            }
          }
        });
      },
      clearCouponCode() {
        this.setData({
          currCouponCode: ''
        })
      },
      /**
       * 生命周期函数--监听页面加载
       */
      onLoad: function(options) {
        this._model = model(13018)
        this.setData({
          pushCode: options.pushcode || ''
        })
      },

      /**
       * 生命周期函数--监听页面初次渲染完成
       */
      onReady: function() {},
      scanQR() {
        const self = this
        wx.scanCode({
          success: (res) => {
            console.log('success', res)
            if (res.errMsg === 'scanCode:ok') {
              self.setData({
                currCouponCode: res.result
              })
            }
          },
          fail: (err) => {
            console.log('success', err)
            this.alert(MESSAGE.WXSCAN_ERR) //扫码失败
          }
        })
      },
      /**
       * 生命周期函数--监听页面显示
       */
      onShow: function() {
        const self=this;
        if (!cwx.user.isLogin()) {
          cwx.user.login({
            callback() {
              self._renderProfile();
            }
          });
          return;
        };
        self._renderProfile();
  },
  _renderProfile(){
    this.setData({
      isLogined: true
    })
    this.getVendorInfo().then((data) => {
      console.log(data)
      const {
        resultCode,
        supplierCode,
        supplierName
      } = data
      if (resultCode === 0) {
        if (!supplierCode && !supplierName) {
          this.alert(MESSAGE.NO_VENDOR_INFO)
          return
        }
        this.setData({
          supplierCode,
          supplierName
        })
      } else {
        this.alert(CODE_MESSAGE[resultCode] || MESSAGE.EXCEPTION)
      }
    })
      .catch(err => {
        this.alert('网络繁忙，请稍后再试')
      });
  },
  alert(message) {
    wx.showModal({
      content: message,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  getAllianceInfo(unionData) {
    return {
      ouid: unionData.ouid,
      aid: String(unionData.allianceid),
      sid: String(unionData.sid),
      pushCode: this.data.pushCode,
      sourceid: String(unionData.sourceid)
    }
  },

  doCancel() {
    console.log('docancel')
    this._clickTimeout && clearTimeout(this._clickTimeout)
    this._clickTimeout = setTimeout(() => {

      if (!this.data.currCouponCode) {
        return
      }
      if (!this.data.supplierCode && !this.data.supplierName) {
        this.alert(MESSAGE.NO_VENDOR_INFO)
        return
      }
      this.cancelCoupon()
    }, 300)
  },
  
  cancelCoupon() {
    /**
     * 获取union参数
     */
    const unionData = cwx.mkt.getUnion()
    const params = {
      allianceInfo: this.getAllianceInfo(unionData),
      couponCode: this.data.currCouponCode
    }
    this._model('useCoupon', params).then((data) => {
        console.log('data', data)
        const {
          resultCode,
          couponCode,
          supplierName
        } = data
        this.setData({
          currCouponCode: ''
        })

        if (resultCode === 0) {
          this.setData({
            successCode: couponCode,
            successVendor: supplierName,
            isSuccess: true
          })
        } else {
          this.alert(CODE_MESSAGE[resultCode] || MESSAGE.EXCEPTION)
        }
      })
      .catch(err => {
        this.alert('网络繁忙，请稍后再试')
      })

  },
  back() {
    this.setData({
      isSuccess: false
    }) //显示成功后的消券信息
  },
  getVendorInfo() {
    return this._model('getSupplierInfo');
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {}
})
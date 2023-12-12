/**
 * 微信后付：根据 out_order_no（商户服务订单号）查询BU订详地址并跳转
 */

import {
  cwx,
  CPage,
} from '../../../cwx/cwx.js';
import __global from '../../../cwx/ext/global.js';

import {
  queryHoldpayDetailModel,
  sendUbt,
  setPageTraceId,
} from '../../thirdPlugin/paynew/libs/index';

const failMsg = '商家订单查询异常，请尝试到商家APP中查看订单信息'

CPage({
  pageId: '10320674321',

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    setPageTraceId(Math.random())
    this.sendUbt({ type: 'chain', chainName: 'HoldDetailInit', a: 'init', extend: options})
    if (!options.out_order_no) {
      this.failAction({
        message: failMsg
      })
      return
    }
    try {
      this.getJumpUrl(options)
    } catch (error) {
      this.failAction({
        message: failMsg
      })
    }
  },

  async getJumpUrl(options) {
    wx.showLoading({
      title: '提交中...',
    })
    const param = {
      thirdPayTransId: options.out_order_no
    }
    const res = await this.queryApi(param)
    wx.hideLoading()
    if (res.head && res.head.code == 100000 && res.merchantOrderDetailUrl) {
      this.jumpUrl(res.merchantOrderDetailUrl)
    } else {
      this.failAction({
        message: res.head ? res.head.message : failMsg
      })
    }
  },

  // 请求接口
  queryApi(requestData) {
    return new Promise((resolve, reject) =>
      queryHoldpayDetailModel({
        data: requestData,
        h5plat: 29,
        context: {
          cwx: cwx,
          env: __global.env,
          subEnv: 'fat103'
        },
        success: (res) => {
          resolve(res)
        },
        fail: (res) => {
          resolve({})
        },
      }).excute())
  },

  jumpUrl(url) {
    this.sendUbt({ type: 'chain', chainName: 'HoldDetailJump', a: 'jumpUrl', extend: {url}})
    if (/^http/.test(url)) {
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(url)
        }
      });
    } else {
      wx.redirectTo({
        url: url,
        fail:()=>{
          this.failAction({
            message: failMsg
          })
        }
      })
    }
  },

  failAction(res) {
    this.sendUbt({ type: 'chain', chainName: 'HoldDetailFail', a: 'jumpUrl', extend: res})
    wx.showModal({
      content: res.message || failMsg,
      confirmText: '确定',
      showCancel: false,
      success() {
        wx.exitMiniProgram()
      }
    })
  },

  sendUbt(data){
    console.log(data);
    data.type = data.type || 'info'
    sendUbt(data, {
      cwx
    });
  }

})
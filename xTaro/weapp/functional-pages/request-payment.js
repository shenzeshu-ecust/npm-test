/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: wjp
 * @Date: 2022-05-09 16:42:02
 * @LastEditors: wjp
 * @LastEditTime: 2022-07-05 18:03:46
 */
import util from './paynew/common/util.js'
import WeAPP_Business from './paynew/common/business.js'
import {
  getAuthByUidtoken
} from './paynew/common/authData.js'
var Controllers = require('./pay/controllers/index').CPayPopbox;
var ControllersNew = require('./paynew/controllers/index').CPayPopbox;
import Stores from './paynew/models/stores'
const paramStore = Stores.PayParamsStore()
const {reportErrorLog} = WeAPP_Business

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};


// 记录服务用时，时间过长则告警
let requestStartTime = null, 
    requestEndTime = null,
    requestSpentTime = null,
    getAuthStart = null,
    getAuthEnd = null,
    getAuthSpent = null

// 缓存paymentArgs到全局
let commonPaymentArgs = null


exports.beforeRequestPayment = function (paymentArgs, callback) {
  console.log('beforeRequestPayment')
  console.log('paymentArgs', paymentArgs)
  commonPaymentArgs = paymentArgs
  requestStartTime = new Date()
  paymentArgs.data = paymentArgs.data || paymentArgs.serverData || {}
  // 没有 auth 就用 uidtoken 去换
  if (!paymentArgs.data.auth) {
    console.log('no auth')
    const uidtoken = util.getParam('uidToken', paymentArgs.data.payLink)
    console.log('uidtoken', uidtoken)
    if (!uidtoken) {
      reportErrorLog({
        errorType: '32101',
        errorMessage: '没有uidtoken',
        extendInfo: {
          paymentArgs
        }
      })
      callback()
      return
    }
    getAuthStart = new Date()
    getAuthByUidtoken({
      uidtoken,
      isDev: paymentArgs.isDev,
      success(res) {
        getAuthEnd = new Date()
        getAuthSpent = getAuthEnd - getAuthStart
        paymentArgs.data.auth = res.ticket
        loginToPay()
      },
      fail(e) {
        reportErrorLog({
          errorType: '32102',
          errorMessage: '通过uidtoken获取auth失败',
          extendInfo: {
            paymentArgs,
            error: e
          }
        })
        callback()
      }
    })
  }else{
    loginToPay()
  }

  // paymentArgs // 就是 functional-page-navigator 的 args 属性中 paymentArgs
  function loginToPay() {
    wx.login({
      success: (data)=> {
        console.log('插件登录成功')
        //data.code
        //在这里可以执行一些支付前的参数处理逻辑，包括通知后台调用统一下单接口
        paymentArgs.code = data.code;

        let initFn = () => {}
        if (isObject(paymentArgs.data) && paymentArgs.data.payLink) {
          //中台逻辑
          console.log('中台逻辑')
          initFn = ControllersNew.init.bind(ControllersNew)
        } else {
          //老的逻辑
          console.log('老的逻辑')
          initFn = Controllers.init.bind(Controllers)
        }
        // 全局catch
        try {
          
        initFn(paymentArgs, false, {
          successCallback: (response)=> {
            // 获取支付方式
            response.thirdPartyInfo = response.thirdPartyInfo || response.thirdpartyinfo || {}

            var sign = response.thirdPartyInfo.sig || '{}';
            var param = JSON.parse(sign) || {};
            // 在 callback 中需要返回两个参数： err 和 requestPaymentArgs
            // err 应为 null （或者一些失败信息）
            // requestPaymentArgs 将被用于调用 wx.requestPayment
            const requestPaymentArgs = {
              // 这里的参数与 wx.requestPayment 相同，除了 success/fail/complete 不被支持
              timeStamp: param.timeStamp,
              nonceStr: param.nonceStr,
              package: param.package,
              signType: param.signType,
              paySign: param.paySign,
            }
            console.log('requestPaymentArgs', requestPaymentArgs)

            // 计算全局花费时间并告警
            calculateTime();
            // 调用支付
            callback(null, requestPaymentArgs)
          },
          failCallback: function (err) {
            reportErrorLog({
              errorType: '32103',
              errorMessage: `initFn 失败`,
              extendInfo: ({
                ...err,
                paymentArgs
              })
            })
            callback(err);
          },
          payPlugin: true
        });
        } catch (error) {
          reportErrorLog({
            errorType: '32104',
            errorMessage: 'initFn 全局catch',
            extendInfo: ({
              ...err,
              paymentArgs
            })
          })
        }
      },
      fail: function (err) {
        callback(err);
      }
    });
  }
}

// 计算全局花费时间并告警
function calculateTime() {
  requestEndTime = new Date();
  requestSpentTime = requestEndTime - requestStartTime;
  const timeStore = paramStore.get()
  if (requestSpentTime > 5000) {
    reportErrorLog({
      errorType: '32105',
      errorMessage: '插件支付-全局用时太高：' + requestSpentTime,
      extendInfo: ({
        requestStartTime,
        requestEndTime,
        requestSpentTime,
        getAuthStart,
        getAuthEnd,
        getAuthSpent,
        ...timeStore,
        commonPaymentArgs,
      })
    });
  }
}

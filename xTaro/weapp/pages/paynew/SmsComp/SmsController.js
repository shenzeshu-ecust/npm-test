import {
  initPwdAuth,
  pwdAuthSendSms,
  pwdAuth,
} from '../../thirdPlugin/paynew/libs/index.js';
import {
  CreateGuid
} from '../../thirdPlugin/paynew/common/util.js'
import {
  sendUbt,
  getMerchantId,
} from '../../thirdPlugin/paynew/common/combus.js'

import {
  cwx,
  _
} from '../../../cwx/cwx.js';
import __global from '../../../cwx/ext/global.js';

let InitParams = {}
let nonce = ''
let requestId = ''
const source = 'ctrip_pay_mini_pwdcheck_wx'
const API_SUCCESS_CODE = 100000
const context = {
  cwx: cwx,
  env: __global.env,
  subEnv: 'fat47'
}

// 初始化密码组件
async function getInitCodde() {
  requestId = CreateGuid()
  let params = {
    requestId,
    sourceToken: InitParams.payToken,
    authType: 1,
    source,
  };
  wx.showLoading({
    title: '发送短信',
  })
  return new Promise(resolve => {
    initPwdAuth({
      data: params,
      context,
      success(res) {
        wx.hideLoading()
        if (res && res.head && res.head.code) {
          if (res.head.code === API_SUCCESS_CODE) {
            sendUbt({
              a: 'c_pay_on_init_code',
              desc: `风控接入验证码成功`,
              nonde: res.nonce
            });
            resolve({
              nonce: res.nonce,
            });
          }
        } else {
          sendUbt({
            a: 'c_pay_on_init_code',
            desc: '风控接入验证码出错',
            extend: res
          });
          wx.hideLoading()
          wx.showToast({
            title: '请求失败，请重试',
          })
          resolve({
            nonce: '',
          });
        }
      },
      fail(res) {
        wx.hideLoading()
        sendUbt({
          a: 'c_pay_on_init_code--fail',
          desc: `风控接入验证码失败`,
          extend: res
        });
        resolve({
          nonce: ''
        })
      }
    }).excute();
  })

}

// 发送短信
async function callSms() {

  let params = {
    merchantId: getMerchantId(),
    phoneNo: InitParams.sendPhone,
    nonce: nonce,
    sourceToken: InitParams.payToken,
    source,
  };
  wx.showLoading({
    title: '发送短信',
  })
  return new Promise(resolve => {
    pwdAuthSendSms({
      data: params,
      context,
      success(res) {
        wx.hideLoading()
        if (res.ResponseStatus.Ack === 'Success' && res.head.code === API_SUCCESS_CODE) {
          resolve({
            result: 'success',
            message: '',
            verifyRequestId: res.verifyRequestId,
          });
        } else {
          sendUbt({
            a: 'getSmsFail',
            dd: '获取短信失败',
            extend: 'res'
          })
          wx.showToast({
            title: res.head.message || '发送短信失败',
            icon: 'none'
          })
          resolve({
            result: 'fail',
            message: res.head.message,
            verifyRequestId: '',
          });
        }
      },
      fail(res) {
        wx.hideLoading()
        sendUbt({
          a: 'getSmsFail-fail',
          dd: '获取短信失败',
          extend: res
        })
        resolve({
          result: 'fail',
          message: res.head.message,
          verifyRequestId: '',
        });
      }
    }).excute();
  })
}

// 发送密码短信，先调初始化，再调发送短信
export async function sendSms(params) {
  InitParams = params
  // if (!nonce) {
  const resInit = await getInitCodde()
  if (!resInit.nonce) return
  nonce = resInit.nonce
  // }
  const res = await callSms()
  wx.hideLoading()
  return res
}

// 校验短信
export async function checkSms({
  codes
}) {
  let params = {
    requestId: requestId,
    source,
    authType: 1,
    merchantId: getMerchantId(),
    phoneNo: InitParams.sendPhone,
    smsCode: codes,
    sourceToken: InitParams.payToken,
    nonce,
  };
  wx.showLoading({
    title: '验证中。。。',
  })
  return new Promise((resolve, reject) => {
    pwdAuth({
      data: params,
      context,
      success(res) {
        wx.hideLoading()
        if (res && res.head && res.head.code) {
          if (res.head.code === API_SUCCESS_CODE) {
            sendUbt({
              a: 'c_pay_on_get_pwdAuth_start',
              type: 'chain',
              chainName: 'endRiskCheck',
              desc: '风控验证码验证成功',
            });
            resolve({
              verifyCodeType: '1',
              riskVerifyToken: res.token,
              verifyRequestId: requestId,
            })
          } else {
            sendUbt({
              a: 'c_pay_on_pwd_err',
              desc: '风控验证码验证出错',
            });
            wx.hideLoading()
            wx.showToast({
              title: res.head.message || '网络不给力，请稍候重试',
              icon: 'none'
            })
            reject({});
          }
        }
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: res && res.head && res.head.message || '网络不给力，请稍候重试',
          icon: 'none'
        })
        reject({});
      }
    }).excute()
  })
}
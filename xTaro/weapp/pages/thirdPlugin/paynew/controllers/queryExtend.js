import {
  cwx,
} from '../../../../cwx/cwx.js';
import __global from '../../../../cwx/ext/global.js';
import {
  queryOrderExtend,
  getPageTraceId
} from '../libs/index'
import * as Stores from '../models/stores.js';

let paramStore = Stores.PayParamsStore()

export async function getOrderExtend({
  payToken
}) {
  if (!payToken) return
  paramStore.setAttr('orderSummary', '')
  const extend = JSON.stringify({
    pageTraceId: getPageTraceId(),
  })
  try {
    return new Promise((resolve, reject) => {
      queryOrderExtend({
        data: {
          payToken
        },
        h5plat: 29,
        timeout: 15000,
        context: {
          cwx: cwx,
          env: __global.env,
          subEnv: 'fat18'
        },
        requestHead: {
          extend
        },
        success: res => {
          if (res.head.code !== 100000) {
            reject()
            return
          } else {
            try {
              const summary = JSON.parse(res.orderExtend).orderSummary
              const orderSummary = JSON.parse(cwx.util.base64Decode(summary))
              console.log('orderSummary', orderSummary)
              paramStore.setAttr('orderSummary', orderSummary)
              resolve(orderSummary)
            } catch (error) {
               resolve({})
            }
          
          }
        },
        fail: err => {
          console.log('err', err)
          paramStore.setAttr('orderSummary', '')
          reject()
        },
      }).excute();
    })
  } catch (error) {
    console.log('error', error)
    return {}
  }
}
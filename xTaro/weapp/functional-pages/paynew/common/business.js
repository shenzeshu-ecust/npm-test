import { WriteLogModel } from '../models/models.js'
import Stores from '../models/stores'
const paramStore = Stores.PayParamsStore()

/*
 * @Chinese description: enter your description
 * @English description: enter your description
 * @Autor: lh_sun
 * @Date: 2021-11-16 16:14:41
 * @LastEditors: lh_sun
 * @LastEditTime: 2021-11-16 21:56:27
 */
var ret = {};

ret.reportErrorLog = function ({ errorType = '32000', errorMessage = 'default msg', extendInfo }) {
  try {
    const data = {
      errorType,
      errorMessage,
      payToken: paramStore.getAttr('payToken'),
      pageId: '10650080117',
      extendInfo: JSON.stringify(extendInfo)
    }
    console.log('reportErrorLog', data)
    WriteLogModel({
      data,
      success() {
        console.log('reportErrorLog success')
      },
      fail() {
        console.log('reportErrorLog fail')
      }
    }).excute()
  } catch (error) {
    console.log('reportErrorLog err:', error)
  }
}

module.exports = ret;


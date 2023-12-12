import cwx from '../../../../cwx/cwx.js'
import { __global } from '../../../../cwx/cwx.js'

const cache = {
  initTicketCache: function (callback) {
    new Promise((resolve, reject) => {
      wx.removeStorage({
        key: 'cwx_market_new',
        success: res => {
          console.log('clear mktopenid success')
        },
        fail: err => {
          console.log('clear mktopenid fail')
        },
        complete: res => {
          cwx.cwx_mkt._getMarketOpenIDHash(resolve)
        }
      })
      
    }).then(res => {
      let openId = res ? res.openid : null
      console.log(openId)
      if (!openId) {
        openId = cwx.cwx_mkt.openid
      }
      console.log(openId)
      return new Promise((resolve, reject) => {
        cwx.request({
          url: '/restapi/soa2/14912/json/registerOpenId',
          data: {
            appId: __global.appId,
            mktOpenId: openId
          },
          success: res => {
            console.log(res)
            if (res.data.result === 0) {
              resolve(res.data)
            }
            reject(res)
          },
          fail: err => {
            console.log(err)
            reject(err)
          }
        })
      })
    }).then(res => {
      console.log(res)
      cache.ticket = res.ticket
      callback && callback()
    }).catch(err => {
      console.log(err)
    })
  }
}

export const addpushVoucher = function(options){
  if (!options || !options.type || !options.voucher){
    throw new Error('parameter error')
  }

  let appId = __global.appId
  let ticket = cache.ticket

  if (!appId){
    throw new Error('appId error')
  }

  if(!ticket){
    cache.initTicketCache(() => addpushVoucher(options))
    return ;
  }

  console.log({
    appId: appId,
    ticket: ticket,
    voucher: options.voucher,
    type: options.type
  })

  cwx.request({
    url: '/restapi/soa2/14912/json/addPushVoucher',
    data: {
      appId: appId,
      ticket: ticket,
      voucher: options.voucher,
      type: options.type
    },
    success: function (res) {
      console.log(res)
      if (res.data.result === 0) {
        console.log('上传voucher成功')
      } else {
        console.log('上传voucher失败')
      }
    },
    fail: function (err) {
      console.log(err)
    }
  })
}
import { cwx } from '../../../cwx/cwx'

const fetch = (url, params) => {
  return new Promise((resolve, reject) => {
    cwx.request({
      url,
      data: params,
      header: { 'Content-Type': 'application/json' },
      success: function({ data }) {
        if (
          !data ||
          !data.ResponseStatus ||
          data.ResponseStatus.Ack !== 'Success'
        ) {
          reject(data)
        } else {
          resolve(data)
        }
      },
      fail: reject
    })
  })
}

export const getQConfig = params => fetch('/restapi/Flight/BudgetFare/getConfig', params)

export const getOrderInfo = params => fetch('/restapi/soa2/12963/purchaseDetailSearch', params)

export const friendAccel = params => fetch('/restapi/soa2/12963/purchaseAccelerate', params)

export const getFltLowPrice = params => fetch('/restapi/soa2/12963/QueryFlightLowPrice', params)

export const getQueryBargainOrderInfo = params => fetch('/restapi/soa2/18053/queryBargainOrder', params) // http://10.22.107.53:8080/api/json/queryBargainOrder       /restapi/soa2/18053/queryBargainOrder

export const getDoBargainInfo = params => fetch('/restapi/soa2/18053/doBargain', params) // http://10.22.107.53:8080/api/json/doBargain        /restapi/soa2/18053/doBargain

export const getGuessLikeInfo = params => fetch('/restapi/soa2/12963/guesslike', params)

export const doShareInfo = params => fetch('/restapi/soa2/18053/doShare', params)   // http://10.22.107.53:8080/api/json/doShare    /restapi/soa2/18053/doShare
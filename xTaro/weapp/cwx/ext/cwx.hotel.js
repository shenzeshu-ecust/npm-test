/**
 * @module cwx/hotel
 * @file 酒店 实现小程序MVC
 */
let __global = require('./global.js').default;
let cwx = __global.cwx;

let processNotFound = function (path, query, entry) {
  cwx.request({
    url: "/restapi/soa2/14160/getmvcurl",
    data: {
      path,
      query,
      entry
    },
    success: function (res) {
      cwx.redirectTo({
        doNotIntercept: true,
        url: res.data.wechatUrl
      })
    }
  })
}

export default {
  processNotFound
};


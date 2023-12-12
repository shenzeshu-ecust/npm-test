import { cwx } from '../../../cwx/cwx.js';

const isHttpUrl = function(url) {
  if(url){
    return url.indexOf('http') == 0 || url.indexOf('https') == 0;
  }
  else{
    return false;
  }
}

export const jumpUrl = function (url) {
  if(url){
    if (isHttpUrl(url)){//跳转h5页面
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(url),
          needLogin: true,
          isNavigate: true
        }
      })
    }
    else{//小程序内部跳转
      cwx.navigateTo({
        url: url
      });
    }
  }
}

export const logError = function(obj,msg){
  let classPrototype = Object.getPrototypeOf(obj);
  console.error(classPrototype + msg);
}

export const hotelOrderDetailBaseUrl = function() {
  let hotelBaseUrl = "/pages/hotel/orderdetail/index?id=";
  return hotelBaseUrl;
}

export function shareSuccess(res, localThis) {
  wx.getSystemInfo({
    success: function (d) {
      if (d.platform == 'android') {
        wx.getShareInfo({//获取群详细信息
          shareTicket: res.shareTickets,
          success: function (res) {//分享的是群
            localThis.ubtTrace(102366, {
              actionCode: 'mp_share_ticket',
              actionType: 'click',
              shareTicket: true
            })
          },
          fail: function (res) {//分享的是个人
            localThis.ubtTrace(102366, {
              actionCode: 'mp_share_ticket',
              actionType: 'click',
              shareTicket: false
            })
          }
        })
      }
      if (d.platform == 'ios') {//分享的是群
        if (res.shareTickets != undefined) {
          localThis.ubtTrace(102366, {
            actionCode: 'mp_share_ticket',
            actionType: 'click',
            shareTicket: true
          })
        } else {//分享的是个人
          localThis.ubtTrace(102366, {
            actionCode: 'mp_share_ticket',
            actionType: 'click',
            shareTicket: false
          })
        }
      }
    },
    fail: function (res) {

    }
  })
}

const pi = 3.1415926535897932384626;
export function db09ToGcj02(bdLat, bdLon) {
  var x = bdLon - 0.0065, y = bdLat - 0.006;
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi);
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi);
  var gcjLon = z * Math.cos(theta);
  var gcjLat = z * Math.sin(theta);
  return { latitude: gcjLat, longitude: gcjLon };
}

export const getTimelineService = (function () {
  let _service = null;
  return function () {
    return new Promise(function (resolve, reject) {
      if (_service) {
        resolve(_service)
      } else {
        require.async('../timelineComponent/service/sendService.js').then(send => {
          _service = send
          resolve(send)
        }).catch(e => {
          reject(e)
        })
        // require('../timelineComponent/service/sendService.js', function (send) {
        //   _service = send
        //   resolve(send)
        // }, function (err) {
        //   reject(err)
        // })
      }
    })
  }
})()
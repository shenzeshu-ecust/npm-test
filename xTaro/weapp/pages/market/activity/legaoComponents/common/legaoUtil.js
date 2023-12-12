import {cwx} from "../../../../../cwx/cwx.js";
function getUrlQuery(url, key) {
  var locationArr = url.split('?')
  if (locationArr.length < 2) {
    return
  }
  var query = locationArr[1]
  if (!query) {
    return
  }
  var params = query.split('&')
  for (let i = 0; i < params.length; i++) {
    var pair = params[i].split('=')
    if (pair[0] === key) {
      return pair[1]
    }
  }
  return
}
var goTargetUrl = function (targetUrl, cb) {
  console.log('targetUrl', targetUrl);
  if (targetUrl) {
    // 跳转独立小程序
    if (targetUrl.indexOf('thirdAppId') > 0) {
      wx.navigateToMiniProgram({
        appId: getUrlQuery(targetUrl, 'thirdAppId'),
        path: targetUrl.trim(),
        extraData: {

        },
        success(res) {
          // console.info('独立小程序打开成功：',res);
        }
      });
    } else if (targetUrl.indexOf('https://') >= 0 || targetUrl.indexOf('http://') >= 0) {
      // 跳转H5页面
      cwx.component.cwebview({
        data: {
          url: encodeURIComponent(targetUrl)
        }
      })
    } else {
      cwx.navigateTo({
        url: targetUrl.trim(),
        fail: function (e) {
          cb && cb();
        }
      });
    }
  } else {
    cb && cb();
  }
}
module.exports = {
  getUrlQuery,
  goTargetUrl
};
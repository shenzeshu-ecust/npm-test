function objToUrlParams(obj) {
  var params = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      var param = encodeURIComponent(key) + '=' + encodeURIComponent(value);
      params.push(param);
    }
  }
  return params.join('&');
}
Page({
  onLoad(options) {
    // 获取传递过来的参数
    var url = '/pages/market/directory/vtmQrcode/vtmQrcode?' + objToUrlParams(options);
    wx.redirectTo({
      url: url
    });
  },
})
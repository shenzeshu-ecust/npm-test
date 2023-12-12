import { cwx, CPage, _ } from '../../../cwx/cwx.js';
var utils = require('../common/utils.js');

CPage({
  pageId: '10650057490',
  data: {
    url: '',
  },
  shareData: {
    title: '',
    path: '',
    imageUrl: ''
  },
  onLoad(options) {
    //如果有分享来源页，则加载
    this.setData({ title: options.title?decodeURIComponent(options.title):'携程旅行', imageUrl: options.img?decodeURIComponent(options.img):''});
    if (options.from) {
      this.loadWeb(options.from);
      return;
    }
    //否则，加载配置的页面
    var that = this,
        params = {},
        unionData = cwx.mkt.getUnion();
    
    params = {
        "allianceID": String(unionData.allianceid),
        "sID": String(unionData.sid),
        "oUID": String(unionData.ouid),
        "sourceID": String(unionData.sourceid),
        "appID": cwx.appId
    };

    cwx.request({
      data: params,
      url: '/restapi/soa2/12673/getWechatAppWebviewURL',
      success: function(res) {
        if (!res || !res.data || !res.data.webviewURL) {
          that.showError();
          return;
        }

        that.loadWeb(res.data.webviewURL);
      },
      fail: function(e) {
        that.showError();
      }
    });
  },
  loadWeb(url) {
    var that=this,newUrl=url;
    var unionData = cwx.mkt.getUnion()||{};
    var { allianceid = '', sid = '', ouid = '', sourceid = '' } = unionData
    console.log('unionData------------------');
    console.log(unionData);
    console.log('url------', url);
    if (!url) {
      this.showError();
      return;
    }
    utils.getOpenid(function () {
      do{
        url = newUrl
        newUrl = decodeURIComponent(url);
      } while (newUrl != url)
      const addhtml=utils.getUrlQuery(newUrl,'addhtml')
      if (addhtml){
        newUrl = newUrl.replace('?','.html?')
      }
      newUrl = that.changeUrlArg(newUrl, 'mpopenid', cwx.cwx_mkt.openid);
      newUrl = that.changeUrlArg(newUrl, 'allianceid', allianceid);
      newUrl = that.changeUrlArg(newUrl, 'sid', sid);
      newUrl = that.changeUrlArg(newUrl, 'ouid', ouid);
      newUrl = that.changeUrlArg(newUrl, 'sourceid', sourceid);
      newUrl = that.changeUrlArg(newUrl, 'popup', 'close');
      newUrl = that.changeUrlArg(newUrl, 'autoawaken', 'close');

      console.log('newUrl------', newUrl);

      that.setData({
        url: newUrl
      })
    })
  },
  changeUrlArg(url, arg, val) {
  let urlArr = url.split('?');
  let newArgs = '?';
  let hasKey = false; // 是否有匹配的key

  // 没参数：url不带?、url带?但后面没值
  if (urlArr.length < 2 || !urlArr[1]) {
    newArgs += arg + '=' + val;
  } else {
    // 过滤 & 后为空的情况
    let argArr = urlArr[1].split('&').filter(item => {
      return item;
    });

    let strArr = argArr.map((item, index) => {
      let str = '';
      let currIndexFirtEmpty = item.indexOf("=")
      let key = item.substring(0, currIndexFirtEmpty) || '';
      let value = item.substring(currIndexFirtEmpty+1) || '';
      // 过滤 key 为空的
      if (!key) { return; }
      if (key === arg) {
        value = val;
        hasKey = true;
      }
      return str = `${key}=${value}`;
    })
    // 原先的参数里没有要替换的 arg 的
    !hasKey && (strArr.push(`${arg}=${val}`));
    newArgs += strArr.join("&");
  }
  return urlArr[0] + newArgs;
},
  showError() {
    wx.showModal({
      title: '没有找到页面'
    })
  },
  onWebMessage(e) {
    console.log(e);
    var postArr = e.detail.data;
    var postCount = postArr.length
    for (var i = 0; i < postCount; i++) {
      var sData = postArr[i]
      if (sData.type.toLowerCase() === 'onshare') {
        this.shareData = sData.shareData;
      }
    }
  },
  onShareAppMessage(options) {
    //点击webview中h5的转发，会调用父级小程序的分享方法
    if (!this.shareData.title) {
      this.shareData.title = this.data.title
    }
    if (!this.shareData.imageUrl) {
      this.shareData.imageUrl = this.data.imageUrl
    }
    if (!this.shareData.path) {
      this.shareData.path = `/pages/market/web/newindex?from=${encodeURIComponent(options.webViewUrl)}&title=${encodeURIComponent(this.shareData.title)}&img=${encodeURIComponent(this.shareData.imageUrl)}`
    }
    return this.shareData;
  }
})
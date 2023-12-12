import { TPage } from '../../../business/tjbase/index';
import requestSubscribeMsgUtils from '../../../utils/requestSubscribeMsgUtils';
import utils from '../../../utils/index';
var requestSubscribeMessage = requestSubscribeMsgUtils.requestSubscribeMessage;
TPage({
  data: {
    bottomHeight: 0,
    pageSite: ''
  },
  onLoad: function (options) {
    console.log('option参数：', options);
    this.setData({
      pageSite: (options === null || options === void 0 ? void 0 : options.pageSite) || ''
    });
    var sysInfo = wx.getSystemInfoSync();
    this.setData({
      bottomHeight: sysInfo.screenHeight - sysInfo.safeArea.bottom
    });
  },
  onShow: function () {},
  subscribeMessageHandle: function () {
    if (this.data.pageSite) {
      var pageSite = this.data.pageSite;
      requestSubscribeMessage({
        pageSite: pageSite
      }).then(function (res) {
        var data = {};
        if (res && typeof res === 'object') {
          delete res['errMsg'];
          data = res;
        }
        utils.dataTrack({
          traceKey: 'C_SUBSCRIBE_CLICK',
          traceData: {
            info: JSON.stringify(data)
          },
          pageName: 'messagesub'
        });
        var dataKeys = Object.keys(data);
        var flag = false;
        dataKeys.forEach(function (item) {
          if (data[item] === 'accept') {
            flag = true;
          }
        });
        if (flag) {
          wx.navigateBack({
            delta: 1
          });
        }
      }).catch(function (err) {
        utils.dataTrack({
          traceKey: 'C_SUBSCRIBE_CLICK',
          traceData: {
            info: "" + JSON.stringify({
              err: (err === null || err === void 0 ? void 0 : err.errorMsg) || '订阅异常'
            })
          },
          pageName: 'messagesub'
        });
        wx.showToast({
          title: "\u672A\u5B8C\u6210\u8BA2\u9605" + (err === null || err === void 0 ? void 0 : err.errorMsg),
          icon: 'none'
        });
        console.info('subscribeMessageHandle err', err);
      });
    }
  }
});
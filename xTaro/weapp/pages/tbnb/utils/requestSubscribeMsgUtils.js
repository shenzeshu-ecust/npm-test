import api from '../api/subscribeMsgApi';
var SUCCESS_MSG = 'requestSubscribeMessage:ok';
var MSG_STATUS = {
  accept: 'accept',
  reject: 'reject',
  ban: 'ban'
};
var PAGE_SITE = {
  bnbSharePage: 'bnbSharePage'
};
function getSubscribeMsgTemplateIdList(_a) {
  var pageSite = _a.pageSite;
  return api.getTemplate({
    pageSite: pageSite
  }).then(function (data) {
    var dataObj = data && data.data;
    if (dataObj && dataObj.template && dataObj.template.length > 0) {
      console.log('getSubscribeMsgTemplateIdList', dataObj.template);
      return Promise.resolve(dataObj.template);
    } else {
      return Promise.reject({
        errorMsg: 'TmplIds can not be undefined or empty'
      });
    }
  }).catch(function (_a) {
    var errorNo = _a.errorNo,
      errorMsg = _a.errorMsg;
    console.log('{ errorNo, errorMsg }', {
      errorNo: errorNo,
      errorMsg: errorMsg
    });
    return Promise.reject({
      errorNo: errorNo,
      errorMsg: errorMsg
    });
  });
}
function requestSubscribeMessage(_a) {
  var pageSite = _a.pageSite;
  return new Promise(function (resolve, reject) {
    if (pageSite) {
      wx.showLoading({
        title: '准备订阅...'
      });
      getSubscribeMsgTemplateIdList({
        pageSite: pageSite
      }).then(function (tmplIds) {
        wx.hideLoading();
        console.log('wx.requestSubscribeMessage:', tmplIds);
        wx.requestSubscribeMessage({
          tmplIds: tmplIds,
          success: function (res) {
            console.log('wx.requestSubscribeMessage success', res);
            if (res.errMsg === SUCCESS_MSG) {
              var acceptIdList = tmplIds.filter(function (id) {
                return res[id] && res[id] === MSG_STATUS.accept;
              });
              if (acceptIdList.length > 0) {
                api.addReport({
                  templateIdList: acceptIdList
                });
              }
              resolve(res);
            } else {
              reject({
                errorMsg: res.errMsg || ''
              });
            }
          },
          fail: function (_a) {
            var errMsg = _a.errMsg,
              errCode = _a.errCode;
            wx.hideLoading();
            console.error('requestSubscribeMessage:fail', {
              errMsg: errMsg,
              errCode: errCode
            });
            reject({
              errorMsg: errMsg,
              errorNo: errCode
            });
          }
        });
      }).catch(function (_a) {
        var errorNo = _a.errorNo,
          errorMsg = _a.errorMsg;
        wx.hideLoading();
        reject({
          errorNo: errorNo,
          errorMsg: errorMsg
        });
      });
    } else {
      reject({
        errorMsg: 'Cannot read function "requestSubscribeMessage" or variable "pageSite" of undefined'
      });
    }
  });
}
export default {
  requestSubscribeMessage: requestSubscribeMessage,
  PAGE_SITE: PAGE_SITE
};
import { TComponent } from '../../business/tjbase/index';
import utils from '../../utils/index';
import host from '../../config/ctrip/host';
import passportApi from '../../api/passportApi';
var PWA_STATIC_TUJIA_HOST = host.PWA_STATIC_TUJIA_HOST;
var _app = getApp();
TComponent({
  properties: {
    modalConfig: {
      type: Object,
      value: {},
      observer: function (newVal) {
        if (wx) {
          var isGetOpenid = newVal.userInfo && !(!newVal.userInfo.openId || newVal.userInfo.isUser);
          isGetOpenid && passportApi.getOpenId();
        }
      }
    },
    modalAppid: {
      type: String,
      value: ''
    }
  },
  data: {
    HOST_STATIC: PWA_STATIC_TUJIA_HOST + "/static/wechat/tujia/common/"
  },
  lifetimes: {},
  pageLifetimes: {},
  methods: {
    _handleCloseModal: function () {
      this.triggerEvent('closemodal');
    },
    _handleRouteToWeb: function () {
      var _a = this.properties,
        modalConfig = _a.modalConfig,
        modalAppid = _a.modalAppid;
      var navigateType = modalConfig.navigateType || 'navigateTo';
      if (modalConfig.navigateUrl) {
        this._handleCloseModal();
        utils.openWebview(modalConfig.navigateUrl, navigateType, modalAppid);
      }
    },
    _handleGetPhoneNumber: function (e) {
      var _this = this;
      if (e.type !== 'getphonenumber' && wx) {
        return;
      }
      var modalConfig = this.properties.modalConfig;
      var code = this._handleGetUrlCode(this.properties.modalConfig.navigateUrl) || 'house_detail_popup';
      var encryptedData = e.detail.encryptedData;
      if (encryptedData && modalConfig.userInfo.openId) {
        e.openId = modalConfig.userInfo.openId;
        e.userStatus = '1';
        e.globalCode = code;
        wx.showLoading({
          title: '加载中...'
        });
        _app.decryptPhoneNumber(e).finally(function () {
          wx.hideLoading();
          _this._handleRouteToWeb();
        });
      } else {
        this._handleRouteToWeb();
      }
    },
    _handleGetUrlCode: function (url) {
      if (!url) {
        return;
      }
      var query = utils.parseQuery(url);
      return query.code;
    }
  }
});
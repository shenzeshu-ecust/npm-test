import { TComponent, twx } from '../../../../../business/tjbase/index';
import utils from '../../../../../utils/index';
import utilsDate from '../../../../../utils/date_format';
import globalVariable from '../../../../../business/variable_config/js/variable.ctrip';
var IS_TUJIA = globalVariable.platformName === 'tujia';
var IS_CTRIP = globalVariable.platformName === 'ctrip';
var IS_QUNAR = globalVariable.platformName === 'qunar';
TComponent({
  properties: {
    landlordModule: {
      type: Object,
      value: {},
      observer: function (data) {
        if (data && data.hotelId) {
          this._handleFormatedData(data);
        }
      }
    },
    landlordId: {
      type: Number
    },
    contractModule: {
      type: Object,
      value: {}
    },
    isFromLandlord: {
      type: Boolean,
      value: false
    },
    unitId: {
      type: String,
      value: ''
    },
    houseName: {
      type: String,
      value: ''
    },
    beginDate: {
      type: Number,
      value: 0
    },
    endDate: {
      type: Number,
      value: 0
    }
  },
  data: {
    landlordModuleData: {},
    isQunar: IS_QUNAR
  },
  methods: {
    onImageError: function () {
      var _a;
      var img = 'landlordModuleData.hotelLogo';
      this.setData((_a = {}, _a[img] = globalVariable.defaultImage, _a.isErrorLondingImg = true, _a));
    },
    _handleFormatedData: function (data) {
      data.landlordTag && data.landlordTag.map(function (item) {
        item.tagText._background = utils.getBackgroundColor(item.tagText.background);
      });
      data.hotelSummary && data.hotelSummary.map(function (item) {
        if (item.highLight) {
          item.tip = item.tip.split(item.highLight);
        }
      });
      this.setData({
        landlordModuleData: data
      });
    },
    _handleToLandlordPage: function () {
      if (this.properties.isFromLandlord) {
        return;
      }
      var info = this.properties.landlordModule;
      var isProdEnv = twx.global.projectInfo.env.toLowerCase() === 'prd';
      if (IS_TUJIA) {
        info && info.hotelId && wx.navigateTo({
          url: "/pages/landlord/index?hotelId=" + info.hotelId
        });
      } else if (IS_CTRIP) {
        var path = "/webapp/inn-v2/owner?oid=" + info.hotelId + "&navbarstyle=white";
        var url = isProdEnv ? "https://m.ctrip.com" + path : "https://m.fat2726.qa.nt.ctripcorp.com" + path;
        wx.navigateTo({
          url: "/pages/bnb/bnbwebview?url=" + encodeURIComponent(url)
        });
      } else if (IS_QUNAR) {
        var _a = this.properties,
          beginDate = _a.beginDate,
          endDate = _a.endDate;
        var fromForLog = (wx.getStorageSync('QUNAR_FROM_FOR_LOG') || {}).fromForLog;
        var qunarHost = isProdEnv ? 'https://xcxtravel.qunar.com' : 'https://wxapp.beta.qunar.com';
        var url = qunarHost + "/tjbnb/app/index.jsp#/landlord?hotelId=" + info.hotelId + "&fromDate=" + utilsDate.dateFormat(new Date(beginDate), 'yyyy-MM-dd') + "&toDate=" + utilsDate.dateFormat(new Date(endDate), 'yyyy-MM-dd') + "&fromForLog=" + fromForLog;
        wx.navigateTo({
          url: "/pages/platform/webView/index?url=" + encodeURIComponent(url)
        });
      }
    },
    _handleOpenChat: function () {
      var _a;
      var _b = this.properties,
        landlordModule = _b.landlordModule,
        landlordId = _b.landlordId,
        unitId = _b.unitId,
        houseName = _b.houseName,
        contractModule = _b.contractModule,
        beginDate = _b.beginDate,
        endDate = _b.endDate;
      var chatId = (_a = this.properties.contractModule.imSummary) === null || _a === void 0 ? void 0 : _a.chatID;
      var _c = contractModule === null || contractModule === void 0 ? void 0 : contractModule.imSummary,
        ctripHotel = _c.ctripHotel,
        tripHotelId = _c.tripHotelId,
        newChatId = _c.newChatId;
      var hotelId = landlordModule.hotelId,
        hotelName = landlordModule.hotelName;
      var params = {
        hotelId: landlordModule.hotelId,
        landlordId: landlordId
      };
      var strBeginDate = utilsDate.dateFormat(new Date(+beginDate), 'yyyy-MM-dd');
      var strEndDate = utilsDate.dateFormat(new Date(+endDate), 'yyyy-MM-dd');
      utils.platformLogin(params, function () {
        utils.openChat(unitId, houseName, chatId, hotelId, hotelName, ctripHotel, tripHotelId, newChatId, strBeginDate, strEndDate);
      });
    }
  }
});
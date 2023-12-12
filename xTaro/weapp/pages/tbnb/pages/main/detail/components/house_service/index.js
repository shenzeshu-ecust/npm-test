import { TComponent } from '../../../../../business/tjbase/index';
import utils from '../../../../../utils/index';
TComponent({
  properties: {
    facilityModule: {
      type: Object,
      value: {},
      observer: function (data) {
        if (data && data.houseFacility) {
          this._handleFormatedData(data);
        }
      }
    }
  },
  data: {
    isShowServiceAll: false,
    houseFacilityData: {},
    tipsInfoItem: [],
    domObserverInstance: null,
    domObserverData: {}
  },
  pageLifetimes: {
    hide: function () {
      var domObserverInstance = this.data.domObserverInstance;
      domObserverInstance && domObserverInstance.disconnect();
    }
  },
  methods: {
    _handleFormatedData: function (data) {
      var _a = data.houseFacility,
        houseFacilitys = _a.houseFacilitys,
        facilitySort = _a.facilitySort;
      var warpHouseFacilitys = [];
      facilitySort.forEach(function (item) {
        warpHouseFacilitys.push(houseFacilitys[item]);
      });
      data.houseFacility.warpHouseFacilitys = warpHouseFacilitys;
      this.setData({
        houseFacilityData: data
      });
    },
    _handleOpenServiceAllPopup: function () {
      this.setData({
        isShowServiceAll: true
      });
    },
    _handleShowBubbleTips: function (event) {
      var _this = this;
      var currentDataset = event.currentTarget.dataset;
      var currentDomId = currentDataset.id;
      var tipsInfo = currentDataset.item || [];
      this._handleGetTipsDomInfoHandle("#" + currentDomId).then(function (res) {
        _this.setData({
          domObserverInstance: res.observerInstance,
          domObserverData: res.observerData,
          tipsInfoItem: Array.isArray(tipsInfo) ? tipsInfo : [tipsInfo]
        });
      });
    },
    _handleGetTipsDomInfoHandle: function (domId) {
      var _this = this;
      return new Promise(function (resolve, reject) {
        utils.createIntersectionObserver(_this, domId).then(function (res) {
          resolve(res);
        }).catch(function (err) {
          reject(err);
        });
      });
    }
  }
});
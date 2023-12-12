import { TComponent } from '../../../../../business/tjbase/index';
import globalVariable from '../../../../../business/variable_config/js/variable.ctrip';
TComponent({
  properties: {
    peaceLiveData: {
      type: Object,
      value: {},
      observer: function (newVal) {
        if (Object.keys(newVal).length) {
          this.setData({
            isShowCurrentComponent: true
          });
        } else {
          this.setData({
            isShowCurrentComponent: false
          });
        }
      }
    },
    businessLicenseList: {
      type: Array,
      value: []
    },
    houseNumber: {
      type: Number,
      value: 0
    }
  },
  data: {
    isShowCurrentComponent: false,
    isShowHouseNumber: false,
    isShowPopup: false,
    isShowLicense: false,
    globalVariable: {}
  },
  lifetimes: {
    ready: function () {
      this.setData({
        globalVariable: globalVariable
      });
    }
  },
  methods: {
    handlePreviewLicense: function () {
      if (this.data.businessLicenseList.length === 0) {
        return;
      }
      this.setData({
        isShowLicense: !this.data.isShowLicense
      });
    },
    handleTouchLongClick: function () {
      if (this.data.isShowHouseNumber) {
        return;
      }
      this.setData({
        isShowHouseNumber: true
      });
      console.log('长按');
    },
    handlePreventPopup: function () {
      return;
    },
    handlePopup: function () {
      this.setData({
        isShowPopup: true
      });
    }
  }
});
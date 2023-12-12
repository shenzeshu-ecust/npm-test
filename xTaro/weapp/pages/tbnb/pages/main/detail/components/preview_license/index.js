import { TComponent } from '../../../../../business/tjbase/index';
TComponent({
  properties: {
    isShowLicense: {
      type: Boolean,
      value: false,
      observer: function () {
        this.setData({
          currentIndex: 0
        });
      }
    },
    licenseImageList: {
      type: Array,
      value: []
    }
  },
  data: {
    currentIndex: 0,
    duration: 500
  },
  methods: {
    handleCloseLicense: function () {
      this.setData({
        isShowLicense: false
      });
      this.triggerEvent('closeLicense', {});
    },
    handleChangeIndex: function (e) {
      this.setData({
        currentIndex: e.detail.current
      });
    },
    _handleCatchNone: function () {
      return;
    }
  }
});
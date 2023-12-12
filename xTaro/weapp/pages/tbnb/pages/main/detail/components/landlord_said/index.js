import { TComponent } from '../../../../../business/tjbase/index';
import variableJs from '../../../../../business/variable_config/js/variable.ctrip';
TComponent({
  properties: {
    topScroll: {
      type: Object,
      value: {}
    }
  },
  data: {
    isShowLandlordPopup: false,
    isCtrip: variableJs.platformName === 'ctrip'
  },
  methods: {
    _handleOpenLandlordPopup: function () {
      this.setData({
        isShowLandlordPopup: true
      });
    }
  }
});
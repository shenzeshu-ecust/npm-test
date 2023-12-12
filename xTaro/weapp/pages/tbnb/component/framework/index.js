import { TComponent } from '../../business/tjbase/index';
import globalVariable from '../../business/variable_config/js/variable.ctrip';
import utils from '../../utils/index';
TComponent({
  properties: {
    isError: {
      type: Boolean,
      value: false
    },
    isLoading: {
      type: Boolean,
      value: false
    },
    isShowPlatformIcon: {
      type: Boolean,
      value: false
    },
    errorText: {
      type: String,
      value: '当前链接已失效'
    }
  },
  data: {
    globalColor: globalVariable.globalColor,
    nullDefaultImg: globalVariable.nullDefaultImg,
    platformName: globalVariable.platformName
  },
  lifetimes: {},
  pageLifetimes: {},
  methods: {
    handleGoHome: function () {
      utils.goHome();
    },
    handleCatchNone: function () {
      return false;
    }
  }
});
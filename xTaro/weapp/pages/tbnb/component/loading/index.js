import { TComponent } from '../../business/tjbase/index';
import globalVariable from '../../business/variable_config/js/variable.ctrip';
TComponent({
  properties: {
    isLoading: {
      type: Boolean,
      value: true
    },
    isMask: {
      type: Boolean,
      value: true
    },
    isShowPlatformIcon: {
      type: Boolean,
      value: false
    },
    color: {
      type: String,
      value: globalVariable.globalColor
    }
  },
  data: {
    loadingLogoImg: globalVariable.loadingLogoImg
  },
  lifetimes: {},
  pageLifetimes: {},
  methods: {}
});
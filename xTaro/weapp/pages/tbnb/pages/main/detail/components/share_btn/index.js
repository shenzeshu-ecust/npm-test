import { TComponent } from '../../../../../business/tjbase/index';
import hostConfig from '../../../../../config/ctrip/host';
import utils from '../../../../../utils/index';
import goodsApi from '../../../../../api/goodsApi';
import globalVariable from '../../../../../business/variable_config/js/variable.ctrip';
var ICON_PIC_TUJIA_HOST = hostConfig.ICON_PIC_TUJIA_HOST;
var RECOMMEND_GOOD = '2';
TComponent({
  properties: {
    product: {
      type: Object,
      value: {}
    },
    sharefrom: {
      type: String,
      value: ''
    }
  },
  data: {
    platformName: globalVariable.platformName,
    picUrlHost: ICON_PIC_TUJIA_HOST,
    isShowBottomPopup: false
  },
  lifetimes: {},
  pageLifetimes: {},
  methods: {
    handleCloseSharePopup: function () {
      var isShowBottomPopup = this.data.isShowBottomPopup;
      this.setData({
        isShowBottomPopup: !isShowBottomPopup
      });
    },
    handleToFriend: function () {
      var sharefrom = this.properties.sharefrom;
      this.handleCloseSharePopup();
      utils.dataTrack({
        traceKey: 'share_friend_click',
        traceData: {
          pagefrom: sharefrom
        },
        pageName: 'detail'
      });
    },
    handleToGood: function () {
      this.handleCloseSharePopup();
      var sharefrom = this.properties.sharefrom;
      var _a = this.data,
        product = _a.product,
        platformName = _a.platformName;
      utils.dataTrack({
        traceKey: 'share_haowu_click',
        traceData: {
          pagefrom: sharefrom
        },
        pageName: 'detail'
      });
      if (!product || platformName !== 'tujia') {
        return;
      }
      goodsApi.heswechatgood({
        params: {
          style: RECOMMEND_GOOD,
          unitId: product.item_code
        },
        passthrough: {
          apiType: utils.distinguishPlatform({
            ctrip: 0,
            qunar: 0
          })
        }
      }).then(function (res) {
        console.log('goods success:', res);
      }).catch(function (err) {
        console.log('goods error-', err);
      });
    },
    handleGoodsShareError: function (err) {
      console.log('好物圈插件加载失败', err);
    }
  }
});
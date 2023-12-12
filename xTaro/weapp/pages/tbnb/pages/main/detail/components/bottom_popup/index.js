import { TComponent } from '../../../../../business/tjbase/index';
TComponent({
  options: {
    multipleSlots: true
  },
  properties: {
    frameTitle: {
      type: String,
      value: ''
    },
    isShowTitleIcon: {
      type: Boolean,
      value: false
    },
    titleIconPath: {
      type: String,
      value: ''
    },
    show: {
      type: Boolean,
      value: false,
      observer: function (newVal) {
        if (newVal) {
          this._handleShowFrame();
          return;
        }
      }
    },
    noPadding: {
      type: Boolean,
      value: false
    },
    popupBgColor: {
      type: String,
      value: ''
    }
  },
  data: {
    wrapAnimate: 'wrapAnimate',
    frameAnimate: 'frameAnimate'
  },
  methods: {
    _handleShowFrame: function () {
      this.setData({
        wrapAnimate: 'wrapAnimate',
        frameAnimate: 'frameAnimate'
      });
    },
    _handleHideFrame: function () {
      var _this = this;
      this.setData({
        wrapAnimate: 'wrapAnimateOut',
        frameAnimate: 'frameAnimateOut'
      });
      setTimeout(function () {
        _this.setData({
          show: false
        });
      }, 400);
    },
    _handleCatchNone: function () {
      return false;
    }
  }
});
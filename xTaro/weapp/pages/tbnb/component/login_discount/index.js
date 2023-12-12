import { TComponent } from '../../business/tjbase/index';
TComponent({
  properties: {
    siteType: {
      type: Number,
      value: 2
    },
    loginGuidance: {
      type: Object,
      value: {},
      observer: function (newVal) {
        if (!newVal || !newVal.focusText || !newVal.focusText.text) {
          return;
        }
        this.setData({
          loginGuidanceText: newVal.focusText.text.replace(newVal.focusText.focusText, '')
        });
      }
    },
    hotelId: {
      type: Number
    },
    landlordId: {
      type: Number
    }
  },
  data: {
    loginGuidanceText: ''
  },
  methods: {
    handleToLogin: function () {
      wx.navigateTo({
        url: "/pages/user/login/login?hotelId=" + this.data.hotelId + "&landlordId=" + this.data.landlordId
      });
    }
  }
});
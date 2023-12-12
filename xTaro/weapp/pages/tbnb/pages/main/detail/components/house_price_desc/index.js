import { TComponent } from '../../../../../business/tjbase/index';
TComponent({
  properties: {
    priceDescriptiopnData: {
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
    }
  },
  data: {
    isShowCurrentComponent: false,
    isShowPriceInstr: false,
    arrowImgUrl: 'https://pic.tujia.com/upload/festatic/mp/arrow_down.png'
  },
  methods: {
    handleChangePriceInstrDisplay: function () {
      this.setData({
        isShowPriceInstr: !this.data.isShowPriceInstr
      });
    }
  }
});
import { _, BusRouter } from '../../../index';

Component({
  properties: {
    moreLineData: {
      type: Array,
      observer: function (moreLine) {
        console.log('lineData', JSON.stringify(moreLine));
        console.log(Object.prototype.toString.call(moreLine));
        this.setData({
          moreLine,
        });
      },
    },
    showModal: {
      type: Boolean,
      observer: function (showModal) {
        this.setData({
          showModal,
        });
      },
    },
  },
  data: {
    moreLine: [],
    showModal: false,
  },
  methods: {
    onCancel() {
      this.triggerEvent('myevent');
    },
    onBook(e) {
      this.onCancel();
      const { item } = e.currentTarget.dataset;
      const url = `https://m.ctrip.com/webapp/ship/index.html?utmSource=ship_index_wechat#/pages/newship/list/index?__navigator=0&fromCity=${item.fromCity}&toCity=${item.toCity}&depDate=${item.recommendDate}`;
      BusRouter.navigateTo(url, {}, 0);
    },
  },
});

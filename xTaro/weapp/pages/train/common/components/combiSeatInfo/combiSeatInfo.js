import cwx from '../../../../../cwx/cwx';
const systeminfo = wx.getSystemInfoSync();
const width = systeminfo.windowWidth;
Component({
  behaviors: [],
  properties: {
    trainCombiInfo: {
      type: Object,
      value: {},
    },
    curThenByTicketInfo: {
      type: Object,
      value: {},
    },
    showType: {
      type: String,
      value: '',
    },
  },
  data: {}, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {},
    moved: function () {},
    detached: function () {},
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {}, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function () {},
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {},
    hide: function () {},
    resize: function () {},
  },

  methods: {
    hide() {
      this.triggerEvent('hideBackDrop');
    },
    preventBackMove() {},
    goCombiBuy() {
      this.triggerEvent('goCombiBuy', { fromPop: true });
    },
    goThenByBuy() {
      this.triggerEvent('goThenByBuy', { fromPop: true, vendorid: 65 });
    },
    goTimeTable() {
      let originInfo =
        this.properties.curThenByTicketInfo &&
        this.properties.curThenByTicketInfo.originInfo;
      if (originInfo) {
        this.triggerEvent('goTimeTable', {
          trainInfo: {
            DepartStation: originInfo.originDepartStation,
            ArriveStation: originInfo.originArriveStation,
            DepartDate: originInfo.originDepartDate,
            TrainNumber: originInfo.trainNum,
          },
        });
      }
    },
    toWiseProductDetail(e) {
      if (!e.currentTarget.dataset.jumpUrl) return;
      cwx.navigateTo({
        url: `/pages/trainActivity/twebview/index?url=${encodeURIComponent(
          e.currentTarget.dataset.jumpUrl
        )}`,
      });
    },
  },
});

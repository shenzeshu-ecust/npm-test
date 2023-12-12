import { TComponent } from '../../../../../business/tjbase/index';
TComponent({
  properties: {
    currentNavIndex: {
      type: Number,
      value: 0
    },
    navList: {
      type: Array,
      value: []
    },
    isShow: {
      type: Boolean,
      value: false
    }
  },
  data: {},
  methods: {
    _handleChangeNav: function (e) {
      var index = e.currentTarget.dataset.index;
      this.setData({
        currentNavIndex: index
      });
      this.triggerEvent('triggerChangeNav', index);
    }
  }
});
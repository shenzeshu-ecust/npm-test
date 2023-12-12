import { jumpUrl } from '../../../utils/util.js'
import { logClick } from '../../../utils/actionCode.js';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardOperationData: {
      type: Object,
      value: "",
    },
    isShowTopLine: {
      type: Boolean,
      value: true,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },


  /**
   * 组件的方法列表
   */
  methods: {
    jump2h5page: function(event) {
      let operation = event.currentTarget.dataset.operation;
      let url = operation.path;
      let actionCode = operation.actionCode;
      logClick({
        ...this.data.cardOperationData.logParameter,
        SC: actionCode,
      });
      if (!url) return;
      jumpUrl(url);
    },

    statusClickTap: function(event) {
      let orderdetailurl = event.currentTarget.dataset.orderdetailurl;
      let actionCode = this.properties.cardOperationData.orderStatusActionCode;
      if (!orderdetailurl) return;

      logClick({
        ...this.properties.cardOperationData.logParameter,
        SC: actionCode,
        EXT: { os:  this.properties.cardOperationData.orderStatusStyle}
      });
      jumpUrl(orderdetailurl);
    }

  }
})
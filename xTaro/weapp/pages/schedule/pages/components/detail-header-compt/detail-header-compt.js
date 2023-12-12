// pages/components/detail-header-compt/detail-header-compt.js
import { cwx } from '../../../../../cwx/cwx.js'
import { jumpUrl } from '../../../utils/util.js'
let ubt = cwx.sendUbtByPage;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardStatus: String,
    detailUrl: String,
    actionCode: String
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
    detailClickTap: function() {
      if (this.properties.actionCode) {
        ubt.ubtTrace(102325, {
          actionCode: this.properties.actionCode,
          actionType: 'click'
        });
      }

      jumpUrl(this.properties.detailUrl);
    }

  }
})
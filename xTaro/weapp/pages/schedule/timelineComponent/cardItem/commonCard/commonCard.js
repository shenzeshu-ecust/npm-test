import { bizModel } from './biz.js';
import { cwx } from "../../../../../cwx/cwx.js";
import { jumpUrl } from '../../../utils/util.js';
import { logClick, cardClickParameter } from '../../../utils/actionCode.js';
let ubt = cwx.sendUbtByPage;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData: { //卡片模型数据
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changePath) {
        this.setData({
          bizModel: bizModel(this.properties.cardData),
          commonCard: this.properties.cardData.commonCard,
          logParameter: cardClickParameter(newVal)
        })
      }
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
    gotoDetail: function() {
      logClick(this.data.logParameter);
      ubt.ubtTrace(102324, {
        actionCode: "c_ticket_card_click_to_card_detail",
        actionType: 'click'
      });

      jumpUrl(this.data.commonCard.orderDetailUrl);
    }
  }
})

import {
  bizModel
} from './biz.js';
import { cwx } from "../../../../../cwx/cwx.js";
import { jumpUrl } from "../../../utils/util";
import { logClick, cardClickParameter } from '../../../utils/actionCode.js';
let ubt = cwx.sendUbtByPage;
Component({

  properties: {
    cardData: { //卡片模型数据
      type: Object,
      value: {},
      observer: function(newVal, oldVal, changePath) {
        this.setData({
          bizModel: bizModel(this.properties.cardData),
          ticketCard: this.properties.cardData.ticketCard,
          logParameter: cardClickParameter(newVal)
        })
      }
    },
  },

  data: {
    bizModel: null,
    ticketCard: null,
  },

  methods: {
    cardvedioClickTap: function() {
      console.log("cardvedioClickTap");
    },

    cardTitleClickTap: function() { 
      if(this.properties.cardData.ticketCard.poiDetailUrl){
        cwx.navigateTo({
          url: this.properties.cardData.ticketCard.poiDetailUrl
        })
      }
    },

    gotoDetail: function() {
      if (!this.data.cardData.sharedCard) {
        logClick(this.data.logParameter);
        ubt.ubtTrace(102324, {
          actionCode: "c_ticket_card_click_to_card_detail",
          actionType: 'click'
        });

        if(this.properties.cardData.ticketCard.orderDetailUrl){
          jumpUrl(this.properties.cardData.ticketCard.orderDetailUrl)
        }
      }
    }
  }
})
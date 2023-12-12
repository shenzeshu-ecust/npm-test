import { sortHotelCardData } from './biz.js';
import { cardItemBev } from "../../behaviors/cardItemBev.js";
import { cwx } from "../../../../../cwx/cwx.js";
import { logClick, cardClickParameter } from '../../../utils/actionCode.js';
let ubt = cwx.sendUbtByPage;

Component({
  behaviors: [cardItemBev],
  /**
   * 组件的属性列表
   */
  properties: {
    cardData: { //卡片模型数据
      type: Object,
      value: {},
      observer: "sortHotelData"
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    operationData: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    sortHotelData: function(newVal, oldVal, changePath) {
      let sortedCardData = sortHotelCardData(newVal);
      this.setData({
        sortedCardData: sortedCardData,
        operationData: sortedCardData.cardOperationData,
        logParameter: cardClickParameter(newVal)
      });
    },

    cardTitleClickTap: function() {
      const { sharedCard, hotelCard, bnbCard } = this.data.cardData;
      if (sharedCard || bnbCard || this.data?.sortedCardData?.isHideArrow) return;
      const detailUrl = bnbCard ? bnbCard.spaceDetailUrl : hotelCard.hotelDetailUrl;
      this.gotoDetail("c_hotel_card_click_to_hotel_detail", detailUrl);
    },
    cardItemClickTap: function() {
      if (this.data.cardData.sharedCard) return;
      logClick(this.data.logParameter);
      if (this.data.cardData.cardSource === 2) { // 分享导入卡片跳转酒店邀请页
        const url = this.data.cardData.hotelCard.orderDetailUrl; // TODO
        this.gotoDetail("c_hotel_card_click_to_card_detail", url);
      } else { // 酒店订单卡片原跳转逻辑
        let url = this.data.cardData.hotelCard.orderDetailUrl;
        if (!url) {
          url = '/pages/schedule/pages/cardDetail/hotel/hotel?smartTripId=' + this.data.cardData.smartTripId;
        }
        this.gotoDetail("c_hotel_card_click_to_card_detail", url);
      }
    }
  }
})
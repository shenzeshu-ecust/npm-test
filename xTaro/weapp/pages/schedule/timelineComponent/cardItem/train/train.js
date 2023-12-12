import {
  getCardData
} from './biz.js'
import { cwx } from '../../../../../cwx/cwx.js';
import { logClick, cardClickParameter } from '../../../utils/actionCode.js';
// let ubt = cwx.sendUbtByPage;
Component({

  properties: {
    cardData: {
      type: Object,
      observer: function(newValue, oldValue) {

        try {
          let cardInfo = getCardData(newValue);
          this.setData({
            loadSuccess: true,
            cardInfo: cardInfo,
            logParameter: cardClickParameter(newValue)
          })
        } catch (err) {
          console.log(err)
        }

      }
    }
  },

  data: {
    loadSuccess: false,
    cardInfo: {},
    logParameter: {}
  },

  methods: {

    onNavToDetail: function(isShowDialog) {
      logClick(this.data.logParameter);
      if (!this.data.cardData.sharedCard) {
        cwx.sendUbtByPage.ubtTrace(102325, {
          actionCode: 'c_train_card_click_to_card_detail',
          actionType: 'click'
        });
        const url = isShowDialog === 1
          ? `/pages/schedule/pages/cardDetail/train/train?smartTripId=${this.data.cardInfo.smartTripId}&isShowDialog=1`
          : `/pages/schedule/pages/cardDetail/train/train?smartTripId=${this.data.cardInfo.smartTripId}`
        cwx.navigateTo({
          url 
        })
      }
    },
    onNavToStopover() {
      this.onNavToDetail(1)
    }
  }

})
//@author qiuwf@Ctrip.com
import { cwx } from '../../../../../cwx/cwx.js'
import CardCommonBehavior from '../../behaviors/cardCommonBehavior.js'
import CarTimeline from '../../models/car/carTimeline.js'
import { logClick } from '../../../utils/actionCode.js';
import { jumpUrl } from '../../../utils/util';
let ubt = cwx.sendUbtByPage;

Component({
  properties: {
    TimelineModelName: { //主轴卡片模型数据
      type: Object,
      value: CarTimeline
    }
  },
  behaviors: [CardCommonBehavior],
  methods: {
    gotoDetail: function() {
      const { processedCard, cardData, logParameter } = this.data;

      if (!processedCard.originCard.sharedCard) {
        logClick(logParameter);
        ubt.ubtTrace(102325, {
          actionCode: processedCard.timelineActionCode.cardClick,
          actionType: 'click'
        });

        if(cardData.carCard.orderDetailUrl){
         jumpUrl(cardData.carCard.orderDetailUrl)
        }
      }
    }
  }

})
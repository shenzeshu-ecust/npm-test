//@author qiuwf@Ctrip.com
import { cwx } from '../../../../../cwx/cwx.js'
import CardCommonBehavior from '../../behaviors/cardCommonBehavior.js'
import CarTimeline from '../../models/car/carTimeline.js'
import { logClick } from '../../../utils/actionCode.js';
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
      if (!this.data.processedCard.originCard.sharedCard) {
        logClick(this.data.logParameter);
        ubt.ubtTrace(102325, {
          actionCode: this.data.processedCard.timelineActionCode.cardClick,
          actionType: 'click'
        });

        if(this.data.cardData.carCard.orderDetailUrl){
          cwx.navigateTo({
            url: this.data.cardData.carCard.orderDetailUrl
          })
        }
      }
    }
  }

})
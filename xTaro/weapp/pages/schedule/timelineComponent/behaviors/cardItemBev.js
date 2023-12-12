import { cwx } from "../../../../cwx/cwx.js";
import { logClick } from '../../utils/actionCode.js';
import { jumpUrl } from '../../utils/util';
let ubt = cwx.sendUbtByPage;

const cardItemBev = Behavior({
  data: {
    sortedCardData: {},
    logParameter: {}
  },

  methods: {
    gotoDetail: function(actionCode, url) {
      logClick(this.data.logParameter);
      ubt.ubtTrace(102324, {
        actionCode: actionCode,
        actionType: 'click'
      });
      jumpUrl(url)
    }
  }
})

export {
  cardItemBev
}
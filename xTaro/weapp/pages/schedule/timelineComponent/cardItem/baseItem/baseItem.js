import { cwx } from '../../../../../cwx/cwx.js'
import dateUtil from '../../utils/dateUtils.js'
import { 
  ctsFormatFromStringDate,
  CTS_DATE_FORMATE
 } from '../../utils/ctsDateUtil.js'
import {jumpUrl} from '../../../utils/util.js'
let ubt = cwx.sendUbtByPage;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData: { // 属性名
      type: Object, 
      value: {},
      observer: function (newVal, oldVal, changedPath) {
        if (newVal.isShowTime){
          this._setShowTime(newVal.timePoint);
        }
      }
    },
    activity: {
      type: Object,
      value: {},
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    marginLeft:82,
    marginRight:52
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _setShowTime: function(timeStr){
      let dateStr = ctsFormatFromStringDate(timeStr, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_03);
      dateStr += '·' + dateUtil.weekForTimeString(timeStr);
      this.setData({
        showTime: dateStr,
      });
    },

    go2activity: function() {
      ubt.ubtTrace(102324, {
        actionCode: "c_schedule_marketing_click",
        actionType: 'click'
      });
      jumpUrl(this.data.jumpUrl);
    },

    deleteCard(e) {
      let card = e.currentTarget.dataset.cardmodel;
      this.triggerEvent('CardDelete', {
        event: e,
        card: card
      }, { bubbles: true, composed: true });
    },

    touchStart: function(e) {
      let card = e.currentTarget.dataset.cardmodel;
      this.triggerEvent('CardTouchStart', {
        event: e,
        card: card
      }, { bubbles: true, composed: true });
    },
    touchMove: function(e){
      let card = e.currentTarget.dataset.cardmodel;
      this.triggerEvent('CardTouchMove', {
        event: e,
        card: card
      }, { bubbles: true, composed: true });
    },
    touchEnd: function(e) {
      let card = e.currentTarget.dataset.cardmodel;
      this.triggerEvent('CardTouchEnd', {
        event: e,
        card: card
      }, { bubbles: true, composed: true });
    },
    touchCancel: function(e) {
      let card = e.currentTarget.dataset.cardmodel;
      this.triggerEvent('CardTouchCancel', {
        event: e,
        card: card
      }, { bubbles: true, composed: true });
    }
  }
})

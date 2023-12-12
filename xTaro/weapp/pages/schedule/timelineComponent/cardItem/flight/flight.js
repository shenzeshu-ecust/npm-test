// pages/timeLine/flight/flight.js
import FlightTimeline from '../../models/flight/flightTimeline.js'
import { cwx } from '../../../../../cwx/cwx.js'
import { jumpUrl } from '../../../utils/util.js'
import { logClick, cardClickParameter } from '../../../utils/actionCode.js';
import {CTS_DATE_FORMATE, ctsFormatFromStringDate} from "../../utils/ctsDateUtil";
let ubt = cwx.sendUbtByPage;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardData:{//卡片模型数据
      type:Object,
      value:{},
      observer: function (newVal, oldVal, changedPath) {
        if (newVal) {
          this.dataHandler(newVal);
        }
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    processedFlightCard:{}
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  ready: function () {
    this.dataHandler(this.data.cardData);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    dataHandler: function (originCard) {
      let processedFlightCard = new FlightTimeline(originCard);
      this.setData({
        processedFlightCard: processedFlightCard,
        logParameter: cardClickParameter(originCard)
      });
    },
    flightDynamicsTapped:function(){
      let url = this.data.processedFlightCard.flightDynamicsUrl

      jumpUrl(url);
    },
    flightChangeButtonTaped:function(){
      ubt.ubtTrace(102325, {
        actionCode: 'c_flight_airchange_click',
        actionType: 'click'
      });
      let url = this.data.processedFlightCard.orderDetailUrl
      jumpUrl(url);
    },

    gotoDetail:function() {
      if (!this.data.cardData.sharedCard){
        logClick(this.data.logParameter);
        ubt.ubtTrace(102325, {
          actionCode: 'c_flight_card_click_to_card_detail',
          actionType: 'click'
        });
        const flightCard = this.data.cardData.flightCard;
        const queryDate = ctsFormatFromStringDate(flightCard.planDepartureTime, CTS_DATE_FORMATE.FORMATE_01, CTS_DATE_FORMATE.FORMATE_02);

        const queryDateStr = queryDate ? ('&queryDate=' + queryDate) : '';
        const url = '/pages/flightschedule/pages/detail/detail?origin=108&flightNo=' + flightCard.flightNo + queryDateStr + '&dcode=' + flightCard.departureAirportCode + '&acode=' + flightCard.arrivalAirportCode;
        cwx.navigateTo({
          url: flightCard.flightAssistantUrl
        })
      }
    }
  }
})

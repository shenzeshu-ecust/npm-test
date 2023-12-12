import {
  addFlightCard,
} from '../../../../sendService.js'

import {
  getFormatTimeForCalendar,
  getFormatTimeForAddSuccss
} from '../../biz.js';

import { cwx } from "../../../../../../../cwx/cwx.js";
let ubt = cwx.sendUbtByPage;
Component({

  properties: {
    
    flightNo: {
      type: String,
      value: ''
    },
    departAirportCode: {
      type: String,
      value: ''
    },
    arriveAirportCode: {
      type: String,
      value: ''
    },
    departDate: {
      type: String,
      value: ''
    },
    isSearchedByFlightNo:{
      type: Boolean,
      value: false
    }
  },

  data: {
    allowAdd: true,
    isSubmitting: false
  },

  methods: {

    addTravel: function() {
      this.setData({
        isSubmitting: true
      });
      let formatTimeForCalendar = getFormatTimeForCalendar(this.data.departDate);
      let promise = addFlightCard(
        this.data.flightNo,
        this.data.departAirportCode,
        this.data.arriveAirportCode,
        formatTimeForCalendar
      );
      let localThis = this;
      promise.then(res => {
        localThis.setData({
          isSubmitting: false
        });
        if (localThis.data.isSearchedByFlightNo){
          ubt.ubtTrace(102324, {
            actionCode: "c_addtrip_flightnumber_add",
            actionType: 'click'
          });
        }else{
          ubt.ubtTrace(102324, {
            actionCode: "c_addtrip_flightupdown_add",
            actionType: 'click'
          });
        }
        cwx.reLaunch({
          url: '/pages/schedule/index/index?smartTripId=' + res
        });
      }).catch(error => {
        localThis.setData({
          isSubmitting: false,
          allowAdd: false
        });
        if (error && error.resultMessage) {
          wx.showToast({
            icon: "none",
            title: error.resultMessage,
          })
        } else {
          wx.showToast({
            icon: "none",
            title: '添加失败',
          })
        }
      });
    },
  }
})